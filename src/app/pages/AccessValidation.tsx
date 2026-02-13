import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { Mail, CreditCard, Link as LinkIcon, CheckCircle, AlertCircle, IdCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { usePublicSite } from '../context/PublicSiteContext';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { sanitizeInput, checkRateLimit, logSecurityEvent, validateEmailFormat } from '../utils/security';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import { useLanguage } from '../context/LanguageContext';

export function AccessValidation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentSite } = usePublicSite();
  const { authenticate } = useAuth();
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Wait for site to load before determining validation method
  const validationMethod = currentSite?.settings?.validationMethod || 'email';
  const siteId = currentSite?.id || '';

  // Debug logging - ALWAYS log, not just in dev mode
  useEffect(() => {
    logger.log('🔍 [AccessValidation] Site loading state:', {
      isSiteLoading: false,
      hasSite: !!currentSite,
      siteId: currentSite?.id,
      siteName: currentSite?.name,
      validationMethod: currentSite?.settings?.validationMethod,
      computedValidationMethod: validationMethod,
      siteError: null,
      fullSite: currentSite
    });
  }, [currentSite, validationMethod]);

  // Redirect to magic link page if that's the validation method
  // IMPORTANT: This must be before any early returns to follow Rules of Hooks
  useEffect(() => {
    if (currentSite && validationMethod === 'magic_link') {
      navigate('/access/magic-link-request');
    }
    if (currentSite && (validationMethod as string) === 'sso') {
      navigate('/access/sso');
    }
  }, [navigate, validationMethod, currentSite]);

  // Show loading spinner while site is loading
  if (!currentSite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading site configuration...</p>
        </div>
      </div>
    );
  }

  // Show error if site failed to load
  if (!currentSite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Site Not Found</h2>
          <p className="text-gray-600 mb-6">
            Unable to load site configuration
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    // Sanitize input to prevent XSS
    const sanitizedInput = sanitizeInput(input);

    // Rate limiting check
    const clientId = `validation_${Date.now()}`;
    const rateLimitCheck = checkRateLimit(clientId, 5, 900000);
    if (!rateLimitCheck.allowed) {
      setError(t('validation.error.rateLimit'));
      setIsValidating(false);
      logSecurityEvent({
        action: 'access_validation_rate_limit',
        status: 'failure',
        details: { method: validationMethod }
      });
      return;
    }

    // Additional email format validation for email method
    if (validationMethod === 'email' && !validateEmailFormat(sanitizedInput)) {
      setError(t('validation.error.format'));
      setIsValidating(false);
      logSecurityEvent({
        action: 'access_validation_invalid_format',
        status: 'failure',
        details: { method: 'email' }
      });
      return;
    }

    try {
      // Call real API for validation
      const env = getCurrentEnvironment();
      // Extract project ID from Supabase URL (e.g., https://xxx.supabase.co -> xxx)
      const projectId = env.supabaseUrl.replace('https://', '').split('.')[0];
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
      
      logger.log('[AccessValidation] Environment:', env);
      logger.log('[AccessValidation] Project ID:', projectId);
      logger.log('[AccessValidation] API URL:', apiUrl);
      logger.log('[AccessValidation] Full URL:', `${apiUrl}/public/validate/employee`);
      logger.log('[AccessValidation] Request body:', {
        siteId: siteId,
        method: validationMethod === 'employee_id' ? 'employee_id' : validationMethod === 'serial_card' ? 'serial_card' : 'email',
        value: sanitizedInput
      });
      
      const response = await fetch(`${apiUrl}/public/validate/employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Environment-ID': env.id,
          'Authorization': `Bearer ${env.supabaseAnonKey}`
        },
        body: JSON.stringify({
          siteId: siteId,
          method: validationMethod === 'employee_id' ? 'employee_id' : validationMethod === 'serial_card' ? 'serial_card' : 'email',
          value: sanitizedInput
        })
      });

      logger.log('[AccessValidation] Validation response status:', response.status);
      const data = await response.json();
      logger.log('[AccessValidation] Validation response data:', data);

      if (data.valid && data.sessionToken) {
        // Store session token
        sessionStorage.setItem('employee_session', data.sessionToken);
        sessionStorage.setItem('employee_name', data.employee?.name || '');
        sessionStorage.setItem('employee_email', data.employee?.email || '');
        
        logSecurityEvent({
          action: 'access_validation_success',
          userId: sanitizedInput,
          status: 'success',
          details: { method: validationMethod }
        });
        
        authenticate(sanitizedInput);
        
        // Check if welcome page is enabled
        // If explicitly set to false, skip welcome page
        // If not set or set to true, show welcome page
        const enableWelcomePage = currentSite?.settings?.enableWelcomePage;
        
        logger.log('[AccessValidation] Welcome page setting:', {
          enableWelcomePage,
          rawSetting: currentSite?.settings?.enableWelcomePage,
          willNavigateTo: enableWelcomePage === false ? 'gift-selection' : 'welcome',
          currentPath: window.location.pathname,
          siteId: currentSite?.id
        });
        
        // Navigate to welcome page if enabled, otherwise go directly to gift selection
        // Use ../ to go up one level from /access to the site root
        navigate(enableWelcomePage === false ? '../gift-selection' : '../welcome');
      } else {
        // Validation failed
        setError(data.error || t('validation.error.invalid'));
        logSecurityEvent({
          action: 'access_validation_failed',
          status: 'failure',
          details: { method: validationMethod }
        });
      }
    } catch (error: unknown) {
      logger.error('Validation error:', error);
      setError(t('validation.error.network'));
      logSecurityEvent({
        action: 'access_validation_error',
        status: 'failure',
        details: { method: validationMethod, error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getValidationConfig = () => {
    switch (validationMethod) {
      case 'email':
        return {
          icon: Mail,
          title: t('validation.email.title'),
          placeholder: t('validation.email.placeholder'),
          type: 'email' as const,
          label: t('validation.email.label'),
          hint: currentSite?.settings?.allowedDomains && currentSite.settings.allowedDomains.length > 0
            ? `Please use an email from: ${currentSite.settings.allowedDomains.join(', ')}`
            : t('validation.email.hint'),
        };
      case 'employee_id':
        return {
          icon: IdCard,
          title: t('validation.employeeId.title'),
          placeholder: t('validation.employeeId.placeholder'),
          type: 'text' as const,
          label: t('validation.employeeId.label'),
          hint: t('validation.employeeId.hint'),
        };
      case 'serial_card':
        return {
          icon: CreditCard,
          title: t('validation.serialCard.title'),
          placeholder: t('validation.serialCard.placeholder'),
          type: 'text' as const,
          label: t('validation.serialCard.label'),
          hint: t('validation.serialCard.hint'),
        };
      default:
        return {
          icon: LinkIcon,
          title: 'Access Verification',
          placeholder: 'Enter your credentials',
          type: 'text' as const,
          label: 'Credentials',
          hint: 'Enter your access credentials',
        };
    }
  };

  const config = getValidationConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 md:p-10" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)' }}>
          {/* Icon */}
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon className="w-9 h-9 text-[#D91C81]" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{config.title}</h1>
            <p className="text-gray-600">
              {t('validation.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="credential" className="block text-sm font-semibold text-gray-700 mb-2">
                {config.label}
              </label>
              <input
                id="credential"
                type={config.type}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError('');
                }}
                placeholder={config.placeholder}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
              />
              <p className="text-sm text-gray-500 mt-2">{config.hint}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3" role="alert" aria-live="polite">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isValidating || !input}
              className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-[#D91C81] focus:ring-offset-2 min-h-[44px]"
              style={{ boxShadow: '0 4px 12px rgba(217, 28, 129, 0.3)' }}
              aria-busy={isValidating}
            >
              {isValidating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>{t('validation.verifying')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" aria-hidden="true" />
                  {t('validation.verifyAccess')}
                </>
              )}
            </button>
          </form>

          {/* Info Message */}
          {currentSite && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-900 mb-1">{t('validation.info')}</p>
              <p className="text-xs text-blue-700">
                {validationMethod === 'email' && t('validation.email.info')}
                {validationMethod === 'employee_id' && t('validation.employeeId.info')}
                {validationMethod === 'serial_card' && t('validation.serialCard.info')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/90 text-sm mt-6">
          {t('validation.needHelp')}
        </p>
      </div>
    </div>
  );
}