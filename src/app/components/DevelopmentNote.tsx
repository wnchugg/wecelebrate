import { AlertCircle, Terminal, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

/**
 * Development Note Component
 * Shows helpful information when the backend server is not running
 */
export function DevelopmentNote() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only show in development mode
    if (!import.meta.env.DEV) {
      return () => {}; // Return empty cleanup
    }

    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('dev_note_dismissed');
    if (dismissed) {
      return () => {}; // Return empty cleanup
    }

    // Check if there's a network error in recent security events
    const checkForNetworkError = () => {
      interface SecurityEvent {
        type: string;
        details?: string;
        timestamp?: number;
      }
      
      const recentEvents: SecurityEvent[] = JSON.parse(sessionStorage.getItem('security_events') || '[]');
      const hasNetworkError = recentEvents.some((event) => 
        event.type === 'validation_failure' && 
        event.details?.includes('Network error')
      );
      
      if (hasNetworkError) {
        setIsVisible(true);
      }
    };

    // Check immediately
    checkForNetworkError();

    // Also check periodically
    const interval = setInterval(checkForNetworkError, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('dev_note_dismissed', 'true');
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-4 left-4 md:left-auto md:w-[480px] z-50"
      >
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Terminal className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-bold text-white text-sm">
                Development Mode
              </h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white hover:text-amber-100 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Status */}
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  Backend Server Not Running
                </p>
                <p className="text-sm text-amber-700">
                  The application cannot connect to the backend server. Please start the server to enable full functionality.
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl p-4 border border-amber-200">
              <p className="text-xs font-semibold text-gray-900 mb-3">
                To start the backend server:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-700">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700 mb-2">
                      Open a new terminal window
                    </p>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <code className="text-xs text-green-400 font-mono">
                        cd /path/to/your/project
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-700">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700 mb-2">
                      Run the Supabase functions locally
                    </p>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <code className="text-xs text-green-400 font-mono">
                        supabase functions serve
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700">
                      The server should start on <span className="font-mono bg-gray-100 px-1 rounded">http://localhost:54321</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Note:</span> This message only appears in development mode and will be dismissed for this session once you close it.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}