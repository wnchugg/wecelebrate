import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export function ForceTokenClear() {
  useEffect(() => {
    // Force clear everything immediately
    console.warn('🧹 [ForceTokenClear] Clearing ALL storage...');
    
    // Clear all possible storage locations
    sessionStorage.clear();
    localStorage.clear();
    
    // Also clear specific keys to be extra sure
    sessionStorage.removeItem('jala_access_token');
    sessionStorage.removeItem('jala_just_logged_in');
    localStorage.removeItem('deployment_environment');
    
    console.warn('✅ [ForceTokenClear] All storage cleared!');
    console.warn('🔄 [ForceTokenClear] Redirecting to login in 2 seconds...');
    
    // Redirect after 2 seconds
    const timeout = setTimeout(() => {
      window.location.href = '/admin/login';
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Tokens Cleared!</h1>
        
        <p className="text-gray-600 mb-6">
          All authentication tokens have been removed from your browser.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium mb-2">
            What happens next:
          </p>
          <ul className="text-sm text-blue-700 text-left space-y-1">
            <li>✅ SessionStorage cleared</li>
            <li>✅ LocalStorage cleared</li>
            <li>✅ Old tokens removed</li>
            <li>🔄 Redirecting to login...</li>
          </ul>
        </div>
        
        <div className="text-sm text-gray-500">
          <p className="mb-2">Redirecting in 2 seconds...</p>
          <p className="text-xs">
            Or click{' '}
            <a 
              href="/admin/login" 
              className="text-[#D91C81] hover:underline font-semibold"
            >
              here to go now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForceTokenClear;
