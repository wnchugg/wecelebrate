/**
 * Session Timeout Warning Component
 * Displays a countdown when session is about to expire
 * Phase 2.5: Session Management
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { sessionManager, extendSessionActivity } from '../utils/sessionManager';
import { useNavigate } from 'react-router';

export function SessionTimeoutWarning() {
  const [isVisible, setIsVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Register warning callback
    sessionManager.onSessionWarning((remainingMs) => {
      setIsVisible(true);
      setRemainingSeconds(Math.floor(remainingMs / 1000));
    });

    // Register expired callback
    sessionManager.onSessionExpired(() => {
      setIsVisible(false);
      // Redirect to session expired page
      void navigate('/admin/session-expired');
    });

    // Update countdown every second
    const interval = setInterval(() => {
      if (isVisible) {
        const remaining = Math.floor(sessionManager.getRemainingTime() / 1000);
        setRemainingSeconds(remaining);
        
        if (remaining <= 0) {
          setIsVisible(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, navigate]);

  const handleStayLoggedIn = () => {
    extendSessionActivity();
    setIsVisible(false);
  };

  const handleLogout = () => {
    setIsVisible(false);
    void navigate('/admin/logout');
  };

  if (!isVisible) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Session Expiring Soon</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-orange-500 animate-pulse" />
            
            <p className="text-gray-700 mb-2">
              Your session is about to expire due to inactivity.
            </p>
            
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            
            <p className="text-sm text-gray-500">
              You will be automatically logged out when the timer reaches zero.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Want to stay logged in?</strong> Click "Stay Logged In" to continue your session.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
          >
            Logout Now
          </button>
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}