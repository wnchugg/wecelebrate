import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import Logo from '../../../imports/Logo';
import { EnvironmentBadge } from '../../components/EnvironmentBadge';
import { BackendConnectionStatus } from '../../components/BackendConnectionStatus';
import { 
  validateEmail, 
  sanitizeString, 
  checkRateLimit,
  clearRateLimit,
  logSecurityEvent,
  secureDebounce 
} from '../../utils/frontendSecurity';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { Alert } from '../../components/Alert';
import { logger } from '../../utils/logger';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { parseError } from '../../utils/apiErrors';

/**
 * AdminLogin Component
 * 
 * Provides secure authentication interface for wecelebrate admin users.
 * Features:
 * - Email/username login with validation
 * - Password visibility toggle
 * - Rate limiting protection
 * - Environment awareness
 * - Backend connection status
 * - Responsive design following RecHUB Design System
 */
export default function AdminLogin(): JSX.Element {
  const navigate = useNavigate();
  
  // All hooks must be called unconditionally at the top
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  
  // Call useAdmin unconditionally - hooks must always be called in the same order
  const { adminLogin, isAdminAuthenticated, isLoading: isCheckingAuth } = useAdmin();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated && !isCheckingAuth) {
      logger.info('[AdminLogin] User already authenticated, redirecting to dashboard');
      navigate('/admin/dashboard');
    }
  }, [isAdminAuthenticated, isCheckingAuth, navigate]);

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const errors: { identifier?: string; password?: string } = {};
    
    // Validate identifier
    if (!identifier.trim()) {
      errors.identifier = 'Email or username is required';
    } else {
      // Check if it looks like an email
      if (identifier.includes('@')) {
        if (!validateEmail(identifier)) {
          errors.identifier = 'Please enter a valid email address';
        }
      } else {
        // Username validation
        if (identifier.length < 3) {
          errors.identifier = 'Username must be at least 3 characters';
        }
      }
    }
    
    // Validate password
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
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
    
    logger.info('[AdminLogin] Attempting login', { 
      identifier: identifier.substring(0, 3) + '***' 
    });

    // Check rate limiting
    const rateLimitCheck = checkRateLimit('admin_login', 5, 300000); // 5 attempts per 5 minutes
    if (!rateLimitCheck.allowed) {
      const waitMinutes = Math.ceil((rateLimitCheck.retryAfter ?? 0) / 60000);
      const errorMsg = `Too many login attempts. Please try again in ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''}.`;
      setError(errorMsg);
      showErrorToast(errorMsg);
      logSecurityEvent({
        type: 'rate_limit',
        details: `Admin login rate limit exceeded for ${identifier}`,
        severity: 'medium'
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
      const sanitizedIdentifier = sanitizeString(identifier.trim().toLowerCase());
      
      // Attempt login (returns boolean)
      const success = await adminLogin(sanitizedIdentifier, password);
      
      if (success) {
        logger.info('[AdminLogin] Login successful');
        clearRateLimit('admin_login');
        showSuccessToast('Welcome back! Redirecting to dashboard...');
        
        // Navigation is handled by AdminContext
        // The useEffect above will redirect when isAdminAuthenticated becomes true
      } else {
        // Login returned false (shouldn't normally happen, errors should throw)
        logger.warn('[AdminLogin] Login returned false');
        setError('Invalid email/username or password');
        showErrorToast('Login failed');
        logSecurityEvent({
          type: 'auth_failure',
          details: `Failed admin login attempt for ${sanitizedIdentifier}`,
          severity: 'medium'
        });
      }
    } catch (err) {
      logger.error('[AdminLogin] Login error:', err);
      const errorMsg = parseError(err);
      setError(errorMsg);
      showErrorToast(err); // Pass the error object, not just the message string
      logSecurityEvent({
        type: 'auth_failure',
        details: `Admin login exception: ${errorMsg}`,
        severity: 'high'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#D91C81] to-[#B71569] rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Sign in to manage your platform</p>
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
          {/* Identifier Field (Email or Username) */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {identifier.includes('@') ? (
                  <Mail className="h-5 w-5 text-gray-400" />
                ) : (
                  <User className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setValidationErrors({ ...validationErrors, identifier: undefined });
                  setError('');
                }}
                placeholder="admin@example.com"
                autoComplete="username"
                disabled={isLoading}
                className={`w-full pl-12 pr-4 py-3 border ${
                  validationErrors.identifier ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
            </div>
            {validationErrors.identifier && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.identifier}</p>
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
                } rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !identifier || !password}
            className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              to="/admin/forgot-password"
              className="text-sm text-[#D91C81] hover:text-[#B71569] font-medium transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}