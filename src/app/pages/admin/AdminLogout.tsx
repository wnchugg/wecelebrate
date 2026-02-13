import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { clearAccessToken } from '../../lib/apiClient';
import { logger } from '../../utils/logger';
import { LogOut } from 'lucide-react';

export function AdminLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all authentication data
    clearAccessToken();
    sessionStorage.clear();
    localStorage.clear();
    
    logger.info('[Logout] All tokens and storage cleared');
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('auth-token-cleared'));
    
    // Redirect to login after a brief delay
    setTimeout(() => {
      navigate('/admin/login', { replace: true });
    }, 500);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <LogOut className="w-16 h-16 text-[#D91C81] animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Logging Out...</h1>
        <p className="text-gray-600">Clearing your session and redirecting to login.</p>
      </div>
    </div>
  );
}