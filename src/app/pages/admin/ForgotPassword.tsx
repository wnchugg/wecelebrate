import { useState } from 'react';
import { Link } from 'react-router';
import { Shield, Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { EnvironmentBadge } from '../../components/EnvironmentBadge';
import { BackendConnectionStatus } from '../../components/BackendConnectionStatus';
import { validateEmail, sanitizeString, checkRateLimit, logSecurityEvent } from '../../utils/frontendSecurity';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { Alert } from '../../components/Alert';
import { logger } from '../../utils/logger';
import { apiRequest } from '../../utils/api';

/**
 * ForgotPassword Component
 * 
 * Allows admin users to request a password reset link.
 * Features:
 * - Email validation
 * - Rate limiting protection
 * - Clear success/error states
 * - Security event logging
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  /**
   * Validate email
   */
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }

    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    logger.info('[ForgotPassword] Requesting password reset', { 
      email: email.substring(0, 3) + '***' 
    });

    // Check rate limiting (3 attempts per 15 minutes)
    const rateLimitCheck = checkRateLimit('password_reset', 3, 900000);
    if (!rateLimitCheck.allowed) {
      const waitMinutes = Math.ceil(rateLimitCheck.retryAfter / 60000);
      const errorMsg = `Too many password reset attempts. Please try again in ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''}.`;
      setError(errorMsg);
      showErrorToast(errorMsg);
      logSecurityEvent({
        type: 'rate_limit',
        details: `Password reset rate limit exceeded for ${email}`,
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
      const sanitizedEmail = sanitizeString(email.trim().toLowerCase());
      
      // Call password reset API
      await apiRequest('/admin/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: sanitizedEmail })
      });

      logger.info('[ForgotPassword] Password reset request successful');
      setIsSuccess(true);
      showSuccessToast('Password reset instructions sent!');
      
      logSecurityEvent({
        type: 'password_reset_request',
        details: `Password reset requested for ${sanitizedEmail}`,
        severity: 'low'
      });
    } catch (err: any) {
      logger.error('[ForgotPassword] Error:', err);
      
      // For security, don't reveal if email exists or not
      // Show generic success message regardless
      setIsSuccess(true);
      
      logSecurityEvent({
        type: 'password_reset_error',
        details: `Password reset error for ${email}: ${err.message}`,
        severity: 'medium'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
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

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h1>
            <p className="text-gray-600 mb-6">
              If an account exists for <span className="font-medium text-gray-900">{email}</span>, 
              you will receive password reset instructions shortly.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The reset link will expire in 1 hour for security reasons.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                to="/admin/login"
                className="block w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center"
              >
                Back to Login
              </Link>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="block w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors text-center"
              >
                Send Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Request form
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

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#D91C81] to-[#B71569] rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your email to receive reset instructions</p>
        </div>

        {/* Back to Login Link */}
        <Link
          to="/admin/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-[#D91C81] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Link>

        {/* Error Alert */}
        {error && (
          <Alert 
            variant="error" 
            title="Error"
            message={error}
            className="mb-6"
          />
        )}

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Security Information</p>
              <p>For your security, we'll send reset instructions only if this email is associated with an admin account.</p>
            </div>
          </div>
        </div>

        {/* Reset Form */}
        <form onSubmit={() => void handleSubmit()} className="space-y-6">
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
                  setValidationError('');
                  setError('');
                }}
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={isLoading}
                className={`w-full pl-12 pr-4 py-3 border ${
                  validationError ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
            </div>
            {validationError && (
              <p className="mt-2 text-sm text-red-600">{validationError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Send Reset Link
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
