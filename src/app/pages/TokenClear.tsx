import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { clearAccessToken } from '../lib/apiClient';
import { RefreshCcw, CheckCircle } from 'lucide-react';

export default function TokenClear() {
  const navigate = useNavigate();
  const [cleared, setCleared] = useState(false);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    console.warn('=== FORCE TOKEN CLEAR PAGE ===');
    
    // Clear everything
    clearAccessToken();
    sessionStorage.clear();
    localStorage.clear();
    
    console.warn('✅ All storage cleared');
    setCleared(true);
    
    // Wait a moment then redirect (if auto-redirect enabled)
    if (autoRedirect) {
      setTimeout(() => {
        console.warn('🔄 Redirecting to login...');
        void navigate('/admin/login', { replace: true });
      }, 2000);
    }
  }, [navigate, autoRedirect]);

  const handleManualRedirect = () => {
    void navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {!cleared ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#D91C81] mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Clearing Old Tokens...</h1>
            <p className="text-gray-600 mb-4">
              Removing invalid authentication tokens.
            </p>
          </>
        ) : (
          <>
            <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tokens Cleared!</h1>
            <p className="text-gray-600 mb-6">
              All old authentication tokens have been removed.
            </p>
            <button
              onClick={handleManualRedirect}
              className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-3 px-6 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              Go to Login
            </button>
            <p className="text-sm text-gray-500 mt-4">
              {autoRedirect && 'Redirecting automatically in 2 seconds...'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}