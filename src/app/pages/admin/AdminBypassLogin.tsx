import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { EnvironmentBadge } from '../../components/EnvironmentBadge';
import { BackendConnectionStatus } from '../../components/BackendConnectionStatus';
import { 
  validateEmail, 
  sanitizeString, 
  checkRateLimit,
  clearRateLimit,
  logSecurityEvent 
} from '../../utils/frontendSecurity';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { Alert } from '../../components/Alert';
import { logger } from '../../utils/logger';
import { parseError } from '../../utils/apiErrors';
import { bypassLogin } from '../../services/authApi';

/**
 * AdminBypassLogin Component
 * 
 * Provides secure bypass authentication for site managers when SSO is enabled.
 * Features:
 * - Email/password login with validation
 * - Optional 2FA support
 * - IP whitelist enforcement (backend)
 * - Rate limiting protection
 * - Audit logging
 * - Responsive design following RecHUB Design System
 */
export default function AdminBypassLogin(): JSX.Element {
  const navigate = useNavigate();
  const { siteId } = useParams<{ siteId: string }>();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    twoFactorCode?: string;
  }>({});

  // Check if site ID is provided
  useEffect(() => {
    if (!siteId) {
      setError('Invalid bypass URL. Site ID is required.');
      logger.error('[AdminBypassLogin] No site ID provided');
    }
  }, [siteId]);

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string; twoFactorCode?: string } = {};
    
    // Validate email
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    // Validate 2FA code if required
    if (requires2FA && !twoFactorCode) {
      errors.twoFactorCode = '2FA code is required';
    } else if (requires2FA && twoFactorCode.length !== 6) {
      errors.twoFactorCode = '2FA code must be 6 digits';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    
    if (!siteId) {
      setError('Invalid bypass URL. Site ID is required.');
      return;
    }
    
    logger.info('[AdminBypassLogin] Attempting bypass login', { 
      siteId,
      email: email.substring(0, 3) + '***' 
    });

    // Check rate limiting
    const rateLimitCheck = checkRateLimit('admin_bypass_login', 3, 300000); // 3 attempts per 5 minutes
    if (!rateLimitCheck.allowed) {
      const waitMinutes = Math.ceil((rateLimitCheck.retryAfter ?? 0) / 60000);
      const errorMsg = `Too many login attempts. Please try again in ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''}.`;
      setError(errorMsg);
      showErrorToast(errorMsg);
      logSecurityEvent({
        type: 'rate_limit',
        details: `Admin bypass login rate limit exceeded for ${email}`,
        severity: 'high'
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeString(email.trim().toLowerCase());
      
      // Attempt bypass login
      const result = await bypassLogin({
        siteId,
        email: sanitizedEmail,
        password,
        twoFactorCode: requires2FA ? twoFactorCode : undefined,
      });
      
      if (result.success) {
        logger.info('[AdminBypassLogin] Bypass login successful');
        clearRateLimit('admin_bypass_login');
        showSuccessToast('Login successful! Redirecting...');
        
        // Redirect to site admin dashboard
        const redirectUrl = searchParams.get('redirect') || `/admin/sites/${siteId}`;
        navigate(redirectUrl);
      } else if (result.requires2FA && !requires2FA) {
        // 2FA is required but not yet provided
        logger.info('[AdminBypassLogin] 2FA required');
        setRequires2FA(true);
        setError('');
      } else {
        // Login failed
        logger.warn('[AdminBypassLogin] Bypass login failed');
        setError(result.message || 'Invalid email or password');
        showErrorToast(result.message || 'Login failed');
        logSecurityEvent({
          type: 'auth_failure',
          details: `Failed admin bypass login attempt for ${sanitizedEmail} on site ${siteId}`,
          severity: 'high'
        });
      }
    } catch (err) {
      logger.error('[AdminBypassLogin] Login error:', err);
      const errorMsg = parseError(err);
      setError(errorMsg);
      showErrorToast(err);
      logSecurityEvent({
        type: 'auth_failure',
        details: `Admin bypass login exception: ${errorMsg}`,
        severity: 'critical'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-6">
      {/* Environment Badge - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <EnvironmentBadge />
      </div>

      {/* Backend Connection Status - Top Left */}
      <div className="fixed top-4 left-4 z-50">
        <BackendConnectionStatus />
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Bypass Login</h1>
          <p className="text-gray-600">Site Manager Access</p>
          {siteId && (
            <p className="text-sm text-gray-500 mt-2">Site ID: {siteId}</p>
          )}
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Secure Access</p>
              <p>This is a restricted bypass login for site managers. All access is logged and monitored.</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert 
            variant="error" 
            title="Login Failed"
            message={error}
            className="mb-6"
          />
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationErrors({ ...validationErrors, email: undefined });
                  setError('');
                }}
                placeholder="manager@example.com"
                autoComplete="email"
                disabled={isLoading}
                className={`w-full pl-12 pr-4 py-3 border ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
            </div>
            {validationErrors.email && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setValidationErrors({ ...validationErrors, password: undefined });
                  setError('');
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                className={`w-full pl-12 pr-12 py-3 border ${
                  validationErrors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>

          {/* 2FA Code Field (shown when required) */}
          {requires2FA && (
            <div>
              <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-2">
                Two-Factor Authentication Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="twoFactorCode"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => {
                    setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setValidationErrors({ ...validationErrors, twoFactorCode: undefined });
                    setError('');
                  }}
                  placeholder="123456"
                  autoComplete="one-time-code"
                  disabled={isLoading}
                  maxLength={6}
                  className={`w-full pl-12 pr-4 py-3 border ${
                    validationErrors.twoFactorCode ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-center text-2xl tracking-widest`}
                />
              </div>
              {validationErrors.twoFactorCode && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.twoFactorCode}</p>
              )}
              <p className="mt-2 text-sm text-gray-600">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password || (requires2FA && !twoFactorCode) || !siteId}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                {requires2FA ? 'Verify & Sign In' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
}
