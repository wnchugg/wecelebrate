import { useState } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { logger } from '../utils/logger';

export function DeploymentStatusBanner() {
  const handleClearTokens = () => {
    logger.log('[Manual Clear] Redirecting to token clear page...');
    // Use window.location instead of navigate since this component is outside Router context
    window.location.href = '/admin/token-clear';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 flex-shrink-0 mt-1 animate-pulse" />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl mb-2">
              ⚠️ ATTENTION: Token Issue Detected
            </h3>
            
            <p className="text-base text-yellow-50 mb-3 font-semibold">
              You have an old/invalid authentication token that's causing 401 errors. Click the button below to fix it immediately.
            </p>
            
            <div className="flex gap-3 flex-wrap items-center">
              <button
                onClick={handleClearTokens}
                className="px-6 py-3 bg-white text-orange-600 rounded-lg font-bold hover:bg-yellow-50 transition-colors flex items-center gap-2 text-lg shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                FIX NOW - Clear Invalid Token
              </button>
              <span className="text-sm text-yellow-100">
                This will clear your session and redirect you to login
              </span>
            </div>
          </div>
          
          <button
            onClick={handleClearTokens}
            className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
            title="Dismiss (you can always check the health banner)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}