import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { usePublicSite } from '../context/PublicSiteContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { ArrowRight, Play, Heart, MessageCircle } from 'lucide-react';
import { CelebrationMessage, ECARD_TEMPLATES } from '../types/celebration';
import { ECard } from '../components/ECard';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import { publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import { logger } from '../utils/logger';

export function Welcome() {
  const navigate = useNavigate();
  const { siteId } = useParams();
  const { currentSite } = usePublicSite();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { getTranslatedContent } = useSiteContent();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [celebrationMessages, setCelebrationMessages] = useState<CelebrationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbCheckComplete, setDbCheckComplete] = useState(false);

  const welcomeContent = currentSite?.settings.welcomePageContent;
  const celebrationEnabled = currentSite?.settings.celebrationModule?.enabled;

  // Check if database needs initialization
  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const env = getCurrentEnvironment();
        const response = await fetch(
          `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/public/health-check`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Environment-ID': env.id,
            },
          }
        );

        if (!response.ok) {
          // Database health check failed, may need initialization
          // Don't redirect immediately - let user navigate manually
          setDbCheckComplete(true);
          return;
        }

        const data = await response.json();
        
        // If no sites exist, redirect to initialize database
        if (data.success && data.sites === 0 && data.admins === 0) {
          // Database appears empty, redirecting to initialization
          navigate('/initialize-database');
          return;
        }
        
        setDbCheckComplete(true);
      } catch (error) {
        console.error('[Welcome] Database check error:', error);
        setDbCheckComplete(true);
      }
    };

    checkDatabaseStatus();
  }, [navigate]);

  useEffect(() => {
    // Load celebration messages if enabled
    if (celebrationEnabled) {
      loadCelebrationMessages();
    }
  }, [celebrationEnabled]);

  // Redirect if welcome page is disabled
  useEffect(() => {
    if (currentSite) {
      // Check if welcome page is explicitly disabled
      // If not set or set to true, show welcome page (backward compatibility)
      const enableWelcomePage = currentSite.settings?.enableWelcomePage;
      
      logger.log('[Welcome] Welcome page setting:', {
        enableWelcomePage,
        rawSetting: currentSite.settings?.enableWelcomePage,
        willRedirect: enableWelcomePage === false,
        siteId,
        currentPath: window.location.pathname,
        fullSettings: currentSite.settings
      });
      
      if (enableWelcomePage === false) {
        logger.log('[Welcome] Redirecting to gift-selection because welcome page is disabled', {
          from: window.location.pathname,
          to: siteId ? '../gift-selection' : '/gift-selection'
        });
        // Navigate to gift-selection (sibling route) immediately
        navigate(siteId ? '../gift-selection' : '/gift-selection', { replace: true });
        return; // Exit early to prevent rendering
      }
    }
  }, [currentSite, navigate, siteId]);

  const loadCelebrationMessages = async () => {
    try {
      setLoading(true);
      
      // Get employee ID from session/auth context
      // If no user is logged in, use a default for demo purposes
      const employeeId = user?.employeeId || sessionStorage.getItem('employee_id') || 'EMP001';
      
      const env = getCurrentEnvironment();
      const response = await fetch(
        `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/public/celebrations/${employeeId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Environment-ID': env.id,
            'Authorization': `Bearer ${publicAnonKey}`
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to load celebrations');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Map backend celebration format to frontend format
        const mappedMessages: CelebrationMessage[] = (data.celebrations || []).map((celebration: any) => ({
          id: celebration.id,
          employeeId: celebration.recipientId,
          senderName: celebration.from,
          senderRole: 'peer', // Could be enhanced with actual role data
          message: celebration.message,
          eCard: celebration.eCardId 
            ? ECARD_TEMPLATES.find(t => t.id === celebration.eCardId) || ECARD_TEMPLATES[0]
            : ECARD_TEMPLATES[0],
          createdAt: celebration.createdAt,
          approved: true,
        }));
        
        setCelebrationMessages(mappedMessages);
      } else {
        throw new Error(data.error || 'Failed to load celebrations');
      }
    } catch (error: any) {
      console.error('Error loading celebrations:', error);
      // Don't show error toast - just log it and show empty state
      // This allows the page to work even if no celebrations exist
      setCelebrationMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Use parent-relative path to navigate to sibling route
    navigate(siteId ? '../gift-selection' : '/gift-selection');
  };

  const defaultTitle = t('welcome.defaultTitle') || 'Congratulations on Your Anniversary!';
  const defaultMessage = t('welcome.defaultMessage') || `Your dedication and commitment over the years have been invaluable to our team. Today, we celebrate your contributions and the positive impact you've made on our organization.

As a token of our appreciation for your continued service, we invite you to select a special gift. Thank you for being such an important part of our success.`;
  const defaultCtaText = t('welcome.defaultCta') || 'Choose Your Gift';

  // Get translated content with fallbacks
  const title = getTranslatedContent('welcomePage.title', welcomeContent?.title || defaultTitle);
  const message = getTranslatedContent('welcomePage.message', welcomeContent?.message || defaultMessage);
  const buttonText = getTranslatedContent('welcomePage.buttonText', welcomeContent?.ctaText || defaultCtaText);

  // Early return if currentSite is null - prevents rendering before redirect
  if (!currentSite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Early return if welcome page is disabled - prevents flash of content before redirect
  if (currentSite.settings?.enableWelcomePage === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Use default colors if branding is not configured
  const primaryColor = currentSite.branding?.primaryColor || '#D91C81';
  const secondaryColor = currentSite.branding?.secondaryColor || '#1B2A5E';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section - Letter with Image Layout */}
      <div 
        className="relative px-4 py-16 md:py-24 flex-grow"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Letter Layout - Image + Text Side by Side */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left Side - Image */}
              <div className="relative h-[400px] md:h-auto">
                {welcomeContent?.videoUrl ? (
                  /* If video is provided, show it with play button */
                  <div className="relative w-full h-full">
                    {!videoPlaying ? (
                      <div className="relative w-full h-full">
                        <img
                          src={welcomeContent.imageUrl || 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&h=800&fit=crop'}
                          alt="Welcome"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setVideoPlaying(true)}
                          className="absolute inset-0 flex items-center justify-center group bg-black/20 hover:bg-black/30 transition-colors"
                          aria-label="Play video"
                        >
                          <div 
                            className="w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Play className="w-10 h-10 text-white ml-1" fill="white" />
                          </div>
                        </button>
                      </div>
                    ) : (
                      <iframe
                        src={welcomeContent.videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Welcome Video"
                      />
                    )}
                  </div>
                ) : (
                  /* Default: Show image (CEO/Leadership photo) */
                  <img
                    src={welcomeContent?.imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop'}
                    alt="Leadership"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Right Side - Letter Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                {/* Welcome Title */}
                <h1 
                  className="text-3xl md:text-4xl font-bold mb-6"
                  style={{ color: primaryColor }}
                >
                  {title}
                </h1>

                {/* Letter Message */}
                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                    {message}
                  </p>
                </div>

                {/* Author Info */}
                {(welcomeContent?.authorName || welcomeContent?.authorTitle) && (
                  <div className="mt-auto pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {welcomeContent.authorName?.charAt(0) || 'A'}
                      </div>
                      <div>
                        {welcomeContent.authorName && (
                          <p className="font-bold text-gray-900 text-lg">
                            {welcomeContent.authorName}
                          </p>
                        )}
                        {welcomeContent.authorTitle && (
                          <p className="text-gray-600 text-sm">
                            {welcomeContent.authorTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Messages Section - Card Grid Layout */}
      {celebrationEnabled && celebrationMessages.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: primaryColor }}
            >
              Messages from Your Team
            </h2>
            <p className="text-gray-600 text-lg">
              Your colleagues have shared their congratulations and appreciation
            </p>
          </div>

          {/* Card Grid - Matching your design with eCards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {celebrationMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden cursor-pointer"
              >
                {/* eCard Display */}
                <div className="p-4">
                  <ECard
                    template={msg.eCard}
                    message={msg.message}
                    senderName={msg.senderName}
                    recipientName="You"
                    size="small"
                    showMessage={false}
                  />
                </div>

                {/* Message Text */}
                <div className="px-6 pb-4">
                  <p className="text-gray-700 text-sm leading-relaxed italic mb-4">
                    "{msg.message}"
                  </p>

                  {/* Sender Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {msg.senderName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {msg.senderName}
                      </p>
                      <p className="text-gray-600 text-xs capitalize">
                        {msg.senderRole === 'leadership' ? 'Leadership Team' : msg.senderRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Messages Link */}
          <div className="text-center">
            <button
              onClick={() => navigate('/celebration')}
              className="inline-flex items-center gap-2 text-lg font-semibold hover:gap-3 transition-all"
              style={{ color: primaryColor }}
            >
              <MessageCircle className="w-5 h-5" />
              View all messages & add yours
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Continue Button - Bottom Fixed Navigation Bar */}
      <div 
        className="sticky bottom-0 py-6 px-4 shadow-lg"
        style={{ 
          backgroundColor: secondaryColor,
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-white">
            <p className="font-semibold text-lg">Ready to choose your gift?</p>
            <p className="text-white/80 text-sm">Let's get started with your selection</p>
          </div>
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 group"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: `0 4px 14px ${primaryColor}40`
            }}
          >
            <span className="text-white">{buttonText}</span>
            <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome;