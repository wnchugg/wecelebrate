import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, LogOut, Shield } from 'lucide-react';
import { clearAccessToken } from '../../lib/apiClient';
import { logger } from '../../utils/logger';

export function SessionExpired() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any invalid tokens when this page loads
    clearAccessToken();
    sessionStorage.clear();
  }, []);

  const handleGoToLogin = () => {
    navigate('/admin/login?session_expired=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-amber-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Session Expired
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Your session has expired or your authentication token is no longer valid. 
          This can happen when:
        </p>

        {/* Reasons List */}
        <ul className="text-left text-sm text-gray-600 mb-8 space-y-2 bg-gray-50 rounded-lg p-4">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span>You've been inactive for too long</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span>The backend was redeployed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span>You logged in from another device or browser</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span>Your token was manually cleared for security</span>
          </li>
        </ul>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleGoToLogin}
            className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            style={{ boxShadow: '0 4px 12px rgba(217, 28, 129, 0.3)' }}
          >
            <LogOut className="w-5 h-5" />
            Log In Again
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Your data remains secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}