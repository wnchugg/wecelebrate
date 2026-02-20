import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { logSecurityEvent } from '../utils/security';
import { getCurrentEnvironment, buildApiUrl } from '../config/deploymentEnvironments';
import Logo from '../../imports/Logo';
import { logger } from '../utils/logger';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function MagicLinkValidation() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'validating' | 'success' | 'error'>('validating');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setErrorMessage('No access token provided. Please request a new magic link.');
        logSecurityEvent({
          action: 'magic_link_validation_failed',
          status: 'failure',
          details: { reason: 'missing_token' }
        });
        return;
      }

      try {
        // Call backend API to validate magic link
        const env = getCurrentEnvironment();
        const apiUrl = buildApiUrl(env);
        
        const response = await fetch(`${apiUrl}/public/validate/magic-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.supabaseAnonKey}`,
            'X-Environment-ID': env.id
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (!response.ok || !data.valid) {
          setStatus('error');
          setErrorMessage(data.error || 'Invalid or expired magic link. Please request a new one.');
          logSecurityEvent({
            action: 'magic_link_validation_failed',
            status: 'failure',
            details: { reason: data.error || 'invalid', token }
          });
          return;
        }

        // Success - store session and authenticate
        sessionStorage.setItem('employee_session', data.sessionToken);
        sessionStorage.setItem('employee_name', data.employee.name || '');
        sessionStorage.setItem('employee_email', data.employee.email || '');
        sessionStorage.setItem('employee_id', data.employee.id || '');
        sessionStorage.setItem('site_id', data.siteId || '');

        logSecurityEvent({
          action: 'magic_link_validation_success',
          userId: data.employee.email,
          status: 'success',
          details: { employeeId: data.employee.id, siteId: data.siteId }
        });

        authenticate(data.employee.email);
        setStatus('success');

        // Redirect to gift selection after a short delay
        setTimeout(() => {
          void navigate('/gift-selection');
        }, 1500);

      } catch (error: any) {
        logger.error('Magic link validation error:', error);
        setStatus('error');
        setErrorMessage('Failed to validate magic link. Please try again.');
        logSecurityEvent({
          action: 'magic_link_validation_failed',
          status: 'failure',
          details: { reason: 'network_error', error: error.message }
        });
      }
    };

    validateToken();
  }, [searchParams, navigate, authenticate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E]">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-6" role="banner">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
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
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl p-8 md:p-10 text-center" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)' }}>
            {status === 'validating' && (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Validating Access</h1>
                <p className="text-gray-600">
                  Please wait while we verify your magic link...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-9 h-9 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Granted!</h1>
                <p className="text-gray-600 mb-4">
                  Your magic link has been validated successfully.
                </p>
                <div className="flex items-center justify-center gap-2 text-[#D91C81]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-semibold">Redirecting to gift selection...</span>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-9 h-9 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>
                <p className="text-gray-600 mb-6">
                  {errorMessage}
                </p>
                <div className="space-y-3">
                  <Link
                    to="/access/magic-link-request"
                    className="block w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    style={{ boxShadow: '0 4px 12px rgba(217, 28, 129, 0.3)' }}
                  >
                    Request New Magic Link
                  </Link>
                  <Link
                    to="/"
                    className="block w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Back to Home
                  </Link>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-white/90 text-sm mt-6">
            Need help? Contact your administrator or HR department
          </p>
        </div>
      </div>
    </div>
  );
}