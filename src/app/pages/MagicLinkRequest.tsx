import { getCurrentEnvironment, buildApiUrl } from '../config/deploymentEnvironments';
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { sanitizeInput, validateEmailFormat, checkRateLimit, logSecurityEvent } from '../utils/security';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { Mail, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import { companyConfig } from '../data/config';
import { usePublicSite } from '../context/PublicSiteContext';
import { LanguageSelector } from '../components/LanguageSelector';
import Logo from '../../imports/Logo';
import { useLanguage } from '../context/LanguageContext';
import { translateWithParams } from '../utils/translationHelpers';

export function MagicLinkRequest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const { currentSite } = usePublicSite();

  // Get siteId from URL query parameter
  const siteId = searchParams.get('siteId') || companyConfig.defaultSiteId || '';

  // Determine home link based on landing page setting
  const isLandingPageEnabled = !currentSite?.settings?.skipLandingPage;
  const homeLink = isLandingPageEnabled ? '/home' : '/access';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Sanitize and validate email
    const sanitizedEmail = sanitizeInput(email);

    // Rate limiting check
    const clientId = `magic_link_${sanitizedEmail}`;
    const rateLimitCheck = checkRateLimit(clientId, 3, 900000);
    if (!rateLimitCheck.allowed) {
      toast.error(t('notification.error.tooManyMagicLinkRequests'));
      setIsSending(false);
      logSecurityEvent({
        action: 'magic_link_rate_limit',
        status: 'failure',
        details: { email: sanitizedEmail }
      });
      return;
    }

    // Validate email format
    if (!validateEmailFormat(sanitizedEmail)) {
      toast.error(t('notification.error.invalidEmail'));
      setIsSending(false);
      return;
    }

    // Check if email is authorized (if domain restrictions apply)
    if (companyConfig.allowedDomains && companyConfig.allowedDomains.length > 0) {
      const domain = sanitizedEmail.split('@')[1];
      if (!companyConfig.allowedDomains.includes(domain)) {
        toast.error(translateWithParams(t, 'notification.error.unauthorizedDomain', { domains: companyConfig.allowedDomains.join(', ') }));
        setIsSending(false);
        logSecurityEvent({
          action: 'magic_link_unauthorized_domain',
          status: 'failure',
          details: { email: sanitizedEmail, domain }
        });
        return;
      }
    }

    try {
      // Call backend API to generate and send magic link
      const env = getCurrentEnvironment();
      const apiUrl = buildApiUrl(env);
      
      const response = await fetch(`${apiUrl}/public/magic-link/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.supabaseAnonKey}`,
          'X-Environment-ID': env.id
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          siteId: siteId
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      logSecurityEvent({
        action: 'magic_link_sent',
        userId: sanitizedEmail,
        status: 'success',
        details: { email: sanitizedEmail, messageId: data.messageId }
      });

      setIsSending(false);
      setLinkSent(true);
      toast.success(t('notification.success.magicLinkSent'));
    } catch (error: any) {
      logger.error('Magic link request error:', error);
      toast.error(error.message || t('notification.error.failedToSendMagicLink'));
      setIsSending(false);
      
      logSecurityEvent({
        action: 'magic_link_error',
        status: 'failure',
        details: { email: sanitizedEmail, error: error.message }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E]">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-6" role="banner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="h-10 w-[110px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded" 
              aria-label="Return to homepage"
            >
              <div className="h-10 w-[110px]" style={{ filter: 'brightness(0) invert(1)' }} role="img" aria-label="HALO Logo">
                <Logo />
              </div>
            </Link>
          </div>
          
          {/* Language Selector */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 pb-12">
        <div className="max-w-md w-full">
          {/* Back to Home Link */}
          <div className="mb-6">
            <Link
              to={homeLink}
              className="inline-flex items-center gap-2 text-white hover:text-white/90 transition-all group focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded px-2 py-1"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 md:p-10" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)' }}>
            {!isSending && !linkSent ? (
              <>
                {/* Icon */}
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-9 h-9 text-[#D91C81]" />
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">Magic Link Access</h1>
                  <p className="text-gray-600">
                    Enter your email address and we'll send you a secure link to access your gifts
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={() => void handleSubmit()} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.name@company.com"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {companyConfig.allowedDomains && companyConfig.allowedDomains.length > 0
                        ? `Please use an email from: ${companyConfig.allowedDomains.join(', ')}`
                        : 'Use your authorized company email address'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || !email}
                    className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-[#D91C81] focus:ring-offset-2 min-h-[44px]"
                    style={{ boxShadow: '0 4px 12px rgba(217, 28, 129, 0.3)' }}
                  >
                    {isSending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" aria-hidden="true" />
                        Send Magic Link
                      </>
                    )}
                  </button>
                </form>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-900">
                    <strong className="font-semibold">How it works:</strong> We'll send you an email with a secure link. 
                    Click the link to instantly access the gift selection portal - no password needed!
                  </p>
                </div>

                {/* Demo Hint */}
                {companyConfig.employeeList && companyConfig.employeeList.length > 0 && (
                  <div className="mt-4 p-4 bg-pink-50 rounded-xl border border-pink-100">
                    <p className="text-xs font-semibold text-[#D91C81] mb-2">Demo Emails:</p>
                    <div className="text-xs text-pink-700 space-y-1">
                      {companyConfig.employeeList.slice(0, 2).map(email => (
                        <div key={email} className="font-mono">{email}</div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-9 h-9 text-green-600" />
                </div>

                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">Check Your Email</h1>
                  <p className="text-gray-600 mb-4">
                    We've sent a magic link to:
                  </p>
                  <p className="text-lg font-semibold text-[#D91C81] mb-4">{email}</p>
                  <p className="text-gray-600">
                    Click the link in the email to access your gift selection portal. The link will expire in 1 hour.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-sm text-amber-900">
                      <strong className="font-semibold">Didn't receive the email?</strong>
                    </p>
                    <ul className="text-sm text-amber-800 mt-2 space-y-1 list-disc list-inside">
                      <li>Check your spam or junk folder</li>
                      <li>Make sure you entered the correct email</li>
                      <li>Wait a few minutes - it may take time to arrive</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setLinkSent(false);
                      setEmail('');
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Try a Different Email
                  </button>

                  {/* Demo Magic Link */}
                  <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                    <p className="text-xs font-semibold text-[#D91C81] mb-2">Demo Mode - Magic Link:</p>
                    <a
                      href={`/access/magic-link?token=${btoa(`${email}:${Date.now()}`)}`}
                      className="text-xs text-pink-700 font-mono break-all hover:underline"
                    >
                      Click here to access (demo)
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-white/90 text-sm mt-6">
            Need help? Contact your administrator or HR department
          </p>
        </div>
      </div>
    </div>
  );
}