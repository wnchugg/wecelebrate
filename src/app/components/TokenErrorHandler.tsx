import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router';
import { clearAccessToken } from '../lib/apiClient';
import { logger } from '../utils/logger';
import { isPublicRoute } from '../utils/routeUtils';

export function TokenErrorHandler() {
  const navigate = useNavigate();
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const handle401 = (event: Event) => {
      // CRITICAL: Don't handle 401 errors on public routes
      // Use window.location.pathname directly to avoid stale location from useLocation hook
      const currentPath = window.location.pathname;
      if (isPublicRoute(currentPath)) {
        logger.log('[TokenErrorHandler] Ignoring 401 on public route:', currentPath);
        return;
      }
      
      logger.log('[TokenErrorHandler] Detected 401 error on admin route:', currentPath);
      setErrorCount(prev => prev + 1);
      
      // Show error banner after 2 consecutive 401 errors
      if (errorCount >= 1) {
        logger.log('[TokenErrorHandler] Navigating to login page');
        navigate('/admin/login');
      }
    };

    window.addEventListener('api-401-error', handle401);
    
    return () => {
      window.removeEventListener('api-401-error', handle401);
    };
  }, [errorCount, navigate]);

  const handleClearTokens = () => {
    logger.log('[TokenErrorHandler] Clearing tokens and redirecting to login');
    clearAccessToken();
    navigate('/admin/login', { replace: true });
  };

  if (errorCount < 1) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-bold">Authentication Error</p>
            <p className="text-sm text-red-100">
              Your session token is invalid or expired. Please clear tokens and login again.
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleClearTokens}
          className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors whitespace-nowrap"
        >
          <RefreshCcw className="w-4 h-4" />
          Clear & Login
        </Button>
      </div>
    </div>
  );
}