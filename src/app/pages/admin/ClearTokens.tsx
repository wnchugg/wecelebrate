import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Trash2, AlertTriangle, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { forceClearTokens } from '../../utils/api';

export function ClearTokens() {
  const navigate = useNavigate();
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearTokens = async () => {
    setClearing(true);
    try {
      // Clear all tokens
      forceClearTokens();
      
      // Wait a moment for the clear to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCleared(true);
      setClearing(false);
      
      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        void navigate('/admin/login');
      }, 2000);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Fix Authentication Errors
            </h1>
            <p className="text-sm text-gray-600">
              Clear invalid tokens and reset your authentication state
            </p>
          </div>

          {!cleared ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                  Why am I seeing this?
                </h3>
                <p className="text-xs text-yellow-800 mb-3">
                  You're experiencing 401 "Invalid JWT" errors because your authentication token was created 
                  with a different secret than the backend is now using to verify tokens.
                </p>
                <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                  What will this do?
                </h3>
                <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Clear all authentication tokens from browser storage</li>
                  <li>Reset session state</li>
                  <li>Redirect you to login page</li>
                </ul>
              </div>

              <button
                onClick={handleClearTokens}
                disabled={clearing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#D91C81] hover:bg-[#B91670] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clearing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Clearing Tokens...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Clear Tokens & Fix Auth
                  </>
                )}
              </button>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">
                  Alternative: Use Browser Console
                </h3>
                <code className="block text-xs bg-gray-900 text-green-400 p-3 rounded font-mono">
                  window.clearJALATokens()
                </code>
                <p className="text-xs text-gray-600 mt-2">
                  Open DevTools (F12), paste the command above, then refresh the page.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Tokens Cleared!
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Your authentication state has been reset.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Redirecting to login...
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/admin/login')}
              className="text-sm text-gray-600 hover:text-gray-900 underline inline-flex items-center gap-1"
            >
              Go to Login
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need more help? Visit{' '}
            <button
              onClick={() => navigate('/admin/debug')}
              className="text-[#D91C81] hover:underline"
            >
              Debug Console
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}