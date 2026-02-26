import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { Shield, Lock, Eye, EyeOff, CheckCircle, Loader2, AlertCircle, XCircle } from 'lucide-react';
import { EnvironmentBadge } from '../../components/EnvironmentBadge';
import { BackendConnectionStatus } from '../../components/BackendConnectionStatus';
import { logSecurityEvent } from '../../utils/frontendSecurity';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { Alert } from '../../components/Alert';
import { logger } from '../../utils/logger';
import { apiRequest } from '../../utils/api';

/**
 * ResetPassword Component
 * 
 * Allows admin users to reset their password using a valid reset token.
 * Features:
 * - Token validation
 * - Password strength requirements
 * - Password confirmation matching
 * - Show/hide password toggle
 * - Security event logging
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  /**
   * Validate token on mount
   */
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsValidatingToken(false);
        setError('No reset token provided');
        return;
      }

      try {
        logger.info('[ResetPassword] Validating token');
        
        await apiRequest('/admin/validate-reset-token', {
          method: 'POST',
          body: JSON.stringify({ token })
        });

        setIsTokenValid(true);
        logger.info('[ResetPassword] Token is valid');
      } catch (err: any) {
        logger.error('[ResetPassword] Token validation failed:', err);
        setIsTokenValid(false);
        setError('Invalid or expired reset token');
        
        logSecurityEvent({
          type: 'invalid_reset_token',
          details: 'Invalid password reset token used',
          severity: 'medium'
        });
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  /**
   * Password strength validation
   */
  const validatePasswordStrength = (pass: string): string | null => {
    if (pass.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(pass)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pass)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pass)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};
    
    // Validate password
    if (!password) {
      errors.password = 'Password is required';
    } else {
      const strengthError = validatePasswordStrength(password);
      if (strengthError) {
        errors.password = strengthError;
      }
    }
    
    // Validate password confirmation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    logger.info('[ResetPassword] Attempting password reset');

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!token) {
      setError('No reset token provided');
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest('/admin/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          newPassword: password
        })
      });

      logger.info('[ResetPassword] Password reset successful');
      setIsSuccess(true);
      showSuccessToast('Password reset successfully!');
      
      logSecurityEvent({
        type: 'password_reset_success',
        details: 'Admin password reset completed',
        severity: 'low'
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        void navigate('/admin/login');
      }, 3000);

    } catch (err: any) {
      logger.error('[ResetPassword] Error:', err);
      const errorMsg = err.message || 'Failed to reset password. Please try again.';
      setError(errorMsg);
      showErrorToast(err);
      
      logSecurityEvent({
        type: 'password_reset_error',
        details: `Password reset error: ${err.message}`,
        severity: 'high'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Validating token state
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Validating reset token...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-6">
        <div className="fixed top-4 right-4 z-50">
          <EnvironmentBadge />
        </div>
        <div className="fixed top-4 left-4 z-50">
          <BackendConnectionStatus />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Invalid Reset Link</h1>
            <p className="text-gray-600 mb-6">
              {error || 'This password reset link is invalid or has expired.'}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                Reset links expire after 1 hour for security reasons. Please request a new one.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                to="/admin/forgot-password"
                className="block w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/admin/login"
                className="block w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-6">
        <div className="fixed top-4 right-4 z-50">
          <EnvironmentBadge />
        </div>
        <div className="fixed top-4 left-4 z-50">
          <BackendConnectionStatus />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Password Reset Complete!</h1>
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
            <Link
              to="/admin/login"
              className="block w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center"
            >
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-6">
      <div className="fixed top-4 right-4 z-50">
        <EnvironmentBadge />
      </div>
      <div className="fixed top-4 left-4 z-50">
        <BackendConnectionStatus />
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#D91C81] to-[#B71569] rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
          <p className="text-gray-600">Create a strong password for your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert 
            variant="error" 
            title="Error"
            message={error}
            className="mb-6"
          />
        )}

        {/* Password Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Password Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>At least 8 characters long</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character (!@#$%^&*)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reset Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
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
                autoComplete="new-password"
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

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setValidationErrors({ ...validationErrors, confirmPassword: undefined });
                  setError('');
                }}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                className={`w-full pl-12 pr-12 py-3 border ${
                  validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting Password...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 w-5" />
                Reset Password
              </>
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/admin/login" className="text-[#D91C81] hover:text-[#B71569] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
