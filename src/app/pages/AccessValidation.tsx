import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, CreditCard, Link as LinkIcon, CheckCircle, AlertCircle, IdCard, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePublicSite } from '../context/PublicSiteContext';
import { logger } from '../utils/logger';
import { sanitizeInput, checkRateLimit, logSecurityEvent } from '../utils/security';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import { useLanguage } from '../context/LanguageContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  emailAccessSchema,
  employeeIdAccessSchema,
  serialCardAccessSchema,
} from '../schemas/access.schema';

export function AccessValidation() {
  const navigate = useNavigate();
  const { currentSite } = usePublicSite();
  const { authenticate } = useAuth();
  const { t } = useLanguage();
  const [error, setError] = useState('');

  // Wait for site to load before determining validation method
  const validationMethod = currentSite?.settings?.validationMethod || 'email';
  const siteId = currentSite?.id || '';

  // Determine which schema to use based on validation method
  const getSchema = () => {
    switch (validationMethod) {
      case 'email':
        return emailAccessSchema;
      case 'employee_id':
        return employeeIdAccessSchema;
      case 'serial_card':
        return serialCardAccessSchema;
      default:
        return emailAccessSchema;
    }
  };

  // Get field name based on validation method
  const getFieldName = (): 'email' | 'employeeId' | 'serialCard' => {
    switch (validationMethod) {
      case 'email':
        return 'email';
      case 'employee_id':
        return 'employeeId';
      case 'serial_card':
        return 'serialCard';
      default:
        return 'email';
    }
  };

  // Initialize form with appropriate schema
  const form = useForm({
    resolver: zodResolver(getSchema() as any),
    defaultValues: validationMethod === 'email'
      ? { email: '' }
      : validationMethod === 'employee_id'
      ? { employeeId: '' }
      : { serialCard: '' },
  });

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
      void navigate('/access/magic-link-request');
    }
    if (currentSite && (validationMethod as string) === 'sso') {
      void navigate('/access/sso');
    }
  }, [navigate, validationMethod, currentSite]);

  // Show loading skeleton while site is loading
  if (!currentSite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl p-8 md:p-10" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)' }}>
            <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-6" />
            <Skeleton className="h-8 w-3/4 mx-auto mb-3" />
            <Skeleton className="h-5 w-2/3 mx-auto mb-8" />
            <div className="space-y-6">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-4 w-full mt-2" />
              </div>
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
            <Skeleton className="h-20 w-full rounded-xl mt-6" />
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = form.handleSubmit(async (data: Record<string, string>) => {
    setError('');

    // Get the input value based on validation method
    const fieldName = getFieldName();
    const inputValue = data[fieldName] || '';

    // Sanitize input to prevent XSS
    const sanitizedInput = sanitizeInput(inputValue);

    // Rate limiting check
    const clientId = `validation_${Date.now()}`;
    const rateLimitCheck = checkRateLimit(clientId, 5, 900000);
    if (!rateLimitCheck.allowed) {
      setError(t('validation.error.rateLimit'));
      logSecurityEvent({
        action: 'access_validation_rate_limit',
        status: 'failure',
        details: { method: validationMethod }
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
      const responseData = await response.json() as { 
        valid?: boolean; 
        sessionToken?: string; 
        employee?: { name?: string; email?: string }; 
        error?: string;
      };
      logger.log('[AccessValidation] Validation response data:', responseData);

      if (responseData.valid && responseData.sessionToken) {
        // Store session token
        sessionStorage.setItem('employee_session', responseData.sessionToken);
        sessionStorage.setItem('employee_name', responseData.employee?.name || '');
        sessionStorage.setItem('employee_email', responseData.employee?.email || '');
        
        logSecurityEvent({
          action: 'access_validation_success',
          userId: sanitizedInput,
          status: 'success',
          details: { method: validationMethod }
        });
        
        authenticate(sanitizedInput);
        
        // Check if welcome page is enabled
        const enableWelcomePage = currentSite?.settings?.enableWelcomePage;
        
        logger.log('[AccessValidation] Welcome page setting:', {
          enableWelcomePage,
          rawSetting: currentSite?.settings?.enableWelcomePage,
          willNavigateTo: enableWelcomePage === false ? 'gift-selection' : 'welcome',
          currentPath: window.location.pathname,
          siteId: currentSite?.id
        });
        
        // Navigate to welcome page if enabled, otherwise go directly to gift selection
        void navigate(enableWelcomePage === false ? '../gift-selection' : '../welcome');
      } else {
        // Validation failed
        setError(responseData.error || t('validation.error.invalid'));
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
    }
  });

  const getValidationConfig = () => {
    switch (validationMethod) {
      case 'email':
        return {
          icon: Mail,
          title: t('validation.email.title'),
          placeholder: t('validation.email.placeholder'),
          type: 'email' as const,
          label: t('validation.email.label'),
          hint: currentSite?.settings?.allowedDomains && currentSite?.settings?.allowedDomains.length > 0
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
  const fieldName = getFieldName();

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
          <Form {...form}>
            <form onSubmit={(e) => { e.preventDefault(); void onSubmit(); }} className="space-y-6">
              <FormField
                control={form.control as any}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{config.label}</FormLabel>
                    <FormControl>
                      <Input
                        type={config.type}
                        placeholder={config.placeholder}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{config.hint}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] hover:shadow-lg min-h-[44px]"
                size="lg"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('validation.verifying')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {t('validation.verifyAccess')}
                  </>
                )}
              </Button>
            </form>
          </Form>

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
