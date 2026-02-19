import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { Gift, Award, Shield, Package, Eye, Database, Code, Layers, TestTube2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { usePublicSite } from '../context/PublicSiteContext';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { CatalogInitializer } from '../components/CatalogInitializer';

export function Landing() {
  const { t } = useLanguage();
  const { currentSite, isLoading } = usePublicSite();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Check if landing page should be skipped after site loads
    if (!isLoading && currentSite?.settings?.skipLandingPage) {
      setShouldRedirect(true);
    }
  }, [currentSite, isLoading]);

  // Redirect to access page if landing page is disabled
  if (shouldRedirect) {
    return <Navigate to="access" replace />;
  }

  // Show loading state while checking site configuration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Always render default landing page (custom landing page feature removed for now)
  return <DefaultLandingPage />;
}

// Default Landing Page Component
function DefaultLandingPage() {
  const { t } = useLanguage();
  const { getTranslatedContent } = useSiteContent();
  
  // Get translated content with fallbacks to system translations
  const heroTitle = getTranslatedContent('landingPage.heroTitle', t('landing.hero.title'));
  const heroSubtitle = getTranslatedContent('landingPage.heroSubtitle', t('landing.hero.subtitle'));
  const heroCTA = getTranslatedContent('landingPage.heroCTA', t('landing.hero.cta'));
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E]">
      {/* Initialize catalog in background */}
      <CatalogInitializer />
      
      {/* Debug Info - Only show in development */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm">
          <div className="font-semibold mb-1">🔧 Site Debug Info</div>
          <div>Site: {t('landing.debug.siteName')}</div>
          <div>ID: {t('landing.debug.siteId')}</div>
          <div>Status: {t('landing.debug.siteStatus')}</div>
        </div>
      )}

      {/* Hero Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
            {heroSubtitle}
          </p>

          <Link
            to="access"
            className="inline-flex items-center gap-2 sm:gap-3 bg-white text-[#D91C81] px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white/95 transition-all hover:gap-4 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-[#D91C81]"
            style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
          >
            {heroCTA}
            <Gift className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto mt-12 sm:mt-20">
          <article className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">{t('landing.features.premium.title')}</h2>
            <p className="text-white/80">
              {t('landing.features.premium.desc')}
            </p>
          </article>

          <article className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">{t('landing.features.secure.title')}</h2>
            <p className="text-white/80">
              {t('landing.features.secure.desc')}
            </p>
          </article>

          <article className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">{t('landing.features.delivery.title')}</h2>
            <p className="text-white/80">
              {t('landing.features.delivery.desc')}
            </p>
          </article>
        </div>

        {/* How It Works */}
        <section className="mt-20 bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white text-center mb-12">{t('landing.howItWorks.title')}</h2>
          <ol className="grid md:grid-cols-4 gap-8" aria-label="Steps to get your gift">
            <li className="text-center">
              <div className="w-12 h-12 bg-white text-[#D91C81] rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" aria-hidden="true">
                1
              </div>
              <h3 className="text-white font-semibold mb-2">{t('landing.howItWorks.step1.title')}</h3>
              <p className="text-white/80 text-sm">{t('landing.howItWorks.step1.desc')}</p>
            </li>
            <li className="text-center">
              <div className="w-12 h-12 bg-white text-[#D91C81] rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" aria-hidden="true">
                2
              </div>
              <h3 className="text-white font-semibold mb-2">{t('landing.howItWorks.step2.title')}</h3>
              <p className="text-white/80 text-sm">{t('landing.howItWorks.step2.desc')}</p>
            </li>
            <li className="text-center">
              <div className="w-12 h-12 bg-white text-[#D91C81] rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" aria-hidden="true">
                3
              </div>
              <h3 className="text-white font-semibold mb-2">{t('landing.howItWorks.step3.title')}</h3>
              <p className="text-white/80 text-sm">{t('landing.howItWorks.step3.desc')}</p>
            </li>
            <li className="text-center">
              <div className="w-12 h-12 bg-white text-[#D91C81] rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" aria-hidden="true">
                4
              </div>
              <h3 className="text-white font-semibold mb-2">{t('landing.howItWorks.step4.title')}</h3>
              <p className="text-white/80 text-sm">{t('landing.howItWorks.step4.desc')}</p>
            </li>
          </ol>
        </section>
      </div>
      
      {/* Floating Buttons - Only in dev mode */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
          <Link
            to="/stakeholder-review"
            className="flex items-center gap-2 bg-gradient-to-r from-[#D91C81] to-[#1B2A5E] hover:shadow-xl text-white px-4 py-3 rounded-lg shadow-lg transition-all"
            title="Stakeholder Review - Platform Overview"
          >
            <Eye className="w-5 h-5" />
            <span className="font-semibold text-sm">📊 Stakeholder Review</span>
          </Link>
          <Link
            to="/initial-seed"
            className="flex items-center gap-2 bg-gradient-to-r from-[#00B4CC] to-[#1B2A5E] hover:shadow-xl text-white px-4 py-3 rounded-lg shadow-lg transition-all"
            title="Seed Demo Sites - Create Stakeholder Demos"
          >
            <Database className="w-5 h-5" />
            <span className="font-semibold text-sm">🌱 Seed Demo Sites</span>
          </Link>
          <Link
            to="/technical-review"
            className="flex items-center gap-2 bg-gradient-to-r from-[#1B2A5E] to-[#0F1942] hover:shadow-xl text-white px-4 py-3 rounded-lg shadow-lg transition-all"
            title="Technical Review - Architecture & Documentation"
          >
            <Code className="w-5 h-5" />
            <span className="font-semibold text-sm">⚙️ Technical Review</span>
          </Link>
          <Link
            to="/feature-preview"
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-xl text-white px-4 py-3 rounded-lg shadow-lg transition-all"
            title="Preview New Features"
          >
            <Award className="w-5 h-5" />
            <span className="font-semibold text-sm">🎨 Feature Preview</span>
          </Link>
          <Link
            to="/my-orders"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-xl text-white px-4 py-3 rounded-lg shadow-lg transition-all"
            title="View My Orders"
          >
            <Package className="w-5 h-5" />
            <span className="font-semibold text-sm">My Orders</span>
          </Link>
          <Link
            to="/flow-demo"
            className="flex items-center gap-2 bg-gradient-to-r from-[#00B4CC] to-[#00E5A0] hover:shadow-xl text-white px-4 py-3 rounded-lg shadow-lg transition-all"
            title="View 6-Step Flow Demo"
          >
            <Layers className="w-5 h-5" />
            <span className="font-semibold text-sm">Flow Demo</span>
          </Link>
          <Link
            to="/language-test"
            className="flex items-center gap-2 bg-[#D91C81] hover:bg-[#B71569] text-white px-4 py-3 rounded-lg shadow-lg transition-all hover:shadow-xl"
            title="Test Language Translations"
          >
            <TestTube2 className="w-5 h-5" />
            <span className="font-semibold text-sm">Language Test</span>
          </Link>
        </div>
      )}
    </div>
  );
}