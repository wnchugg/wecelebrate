import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { logSecurityEvent } from '../utils/security';
import { getCurrentEnvironment, buildApiUrl } from '../config/deploymentEnvironments';
import { useSite } from '../context/SiteContext';
import Logo from '../../imports/Logo';

export function SSOValidation() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();
  const { t } = useLanguage();
  const [error, setError] = useState('');
  const [isInitiating, setIsInitiating] = useState(false);

  // Load site configuration dynamically from API
  const { currentSite, isLoading: isSiteLoading } = useSite();
  
  const siteId = currentSite?.id || '';
  const ssoProvider = currentSite?.settings?.ssoProvider || 'google'; // google, microsoft, okta, azure

  // Handle SSO callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError('SSO authentication failed. Please try again.');
      logSecurityEvent({
        action: 'sso_authentication_failed',
        status: 'failure',
        details: { error: errorParam }
      });
      return;
    }

    if (code && state) {
      handleSSOCallback(code, state);
    }
  }, []);

  const handleSSOCallback = async (code: string, state: string) => {
    try {
      const env = getCurrentEnvironment();
      const apiUrl = buildApiUrl(env);
      
      const response = await fetch(`${apiUrl}/public/validate/sso-callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.supabaseAnonKey}`,
          'X-Environment-ID': env.id
        },
        body: JSON.stringify({
          siteId,
          code,
          state,
          provider: ssoProvider
        })
      });

      const data = await response.json();

      if (data.valid && data.sessionToken) {
        // Store session token
        sessionStorage.setItem('employee_session', data.sessionToken);
        sessionStorage.setItem('employee_name', data.employee?.name || '');
        sessionStorage.setItem('employee_email', data.employee?.email || '');
        
        logSecurityEvent({
          action: 'sso_authentication_success',
          userId: data.employee?.email,
          status: 'success',
          details: { provider: ssoProvider }
        });
        
        authenticate(data.employee?.email || '');
        void navigate('/gift-selection');
      } else {
        setError(data.error || 'Authentication failed. Please try again.');
        logSecurityEvent({
          action: 'sso_authentication_failed',
          status: 'failure',
          details: { provider: ssoProvider }
        });
      }
    } catch (error: any) {
      console.error('SSO callback error:', error);
      setError('An error occurred during authentication. Please try again.');
      logSecurityEvent({
        action: 'sso_authentication_error',
        status: 'failure',
        details: { error: error.message }
      });
    }
  };

  const handleSSOLogin = async () => {
    setError('');
    setIsInitiating(true);

    try {
      const env = getCurrentEnvironment();
      const apiUrl = buildApiUrl(env);
      
      const response = await fetch(`${apiUrl}/public/validate/sso-initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.supabaseAnonKey}`,
          'X-Environment-ID': env.id
        },
        body: JSON.stringify({
          siteId,
          provider: ssoProvider,
          redirectUrl: window.location.href
        })
      });

      const data = await response.json();

      if (data.authUrl) {
        logSecurityEvent({
          action: 'sso_initiate',
          status: 'success',
          details: { provider: ssoProvider }
        });
        
        // Redirect to SSO provider
        window.location.href = data.authUrl;
      } else {
        setError(data.error || 'Failed to initiate SSO. Please try again.');
        setIsInitiating(false);
      }
    } catch (error: any) {
      console.error('SSO initiation error:', error);
      setError('Failed to connect to authentication service. Please try again.');
      setIsInitiating(false);
      logSecurityEvent({
        action: 'sso_initiate_error',
        status: 'failure',
        details: { error: error.message }
      });
    }
  };

  const getProviderConfig = () => {
    switch (ssoProvider) {
      case 'google':
        return {
          name: 'Google',
          logo: '🔵',
          description: 'Sign in with your Google account'
        };
      case 'microsoft':
        return {
          name: 'Microsoft',
          logo: '⊞',
          description: 'Sign in with your Microsoft account'
        };
      case 'okta':
        return {
          name: 'Okta',
          logo: '🔷',
          description: 'Sign in with your Okta account'
        };
      case 'azure':
        return {
          name: 'Azure AD',
          logo: '☁️',
          description: 'Sign in with your Azure Active Directory account'
        };
      default:
        return {
          name: 'SSO',
          logo: '🔐',
          description: 'Sign in with your corporate account'
        };
    }
  };

  const providerConfig = getProviderConfig();

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
              to="/"
              className="inline-flex items-center gap-2 text-white hover:text-white/90 transition-all group focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded px-2 py-1"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              <span className="font-medium">{t('validation.backToHome')}</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 md:p-10" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)' }}>
            {/* Icon */}
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-9 h-9 text-[#0066CC]" />
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Single Sign-On</h1>
              <p className="text-gray-600">
                Secure authentication through your organization
              </p>
            </div>

            {/* SSO Button */}
            <div className="space-y-6">
              <button
                onClick={() => void handleSSOLogin()}
                disabled={isInitiating || isSiteLoading}
                className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
              >
                {isInitiating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl" aria-hidden="true">{providerConfig.logo}</span>
                    <span>Continue with {providerConfig.name}</span>
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3" role="alert" aria-live="polite">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Info Message */}
            {!isSiteLoading && currentSite && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-900 mb-1">Secure Authentication</p>
                <p className="text-xs text-blue-700">
                  {providerConfig.description}. You'll be redirected to your organization's login page.
                </p>
              </div>
            )}

            {/* Site Loading State */}
            {isSiteLoading && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <p className="text-xs text-gray-600">Loading site configuration...</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-white/90 text-sm mt-6">
            {t('validation.needHelp')}
          </p>
        </div>
      </div>
    </div>
  );
}