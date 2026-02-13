import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, WifiOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { logger } from '../utils/logger';

interface ConnectionStatus {
  status: 'checking' | 'connected' | 'disconnected' | 'error';
  message: string;
  details?: string;
}

export interface BackendConnectionStatusProps {
  showQuickFix?: boolean;
}

export function BackendConnectionStatus({ showQuickFix = true }: BackendConnectionStatusProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'checking',
    message: 'Checking backend connection...',
  });
  const [showDeploymentGuide, setShowDeploymentGuide] = useState(false);
  
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const projectUrl = `https://${projectId}.supabase.co`;
    const healthUrl = `${import.meta.env.VITE_SUPABASE_URL || projectUrl}/functions/v1/make-server-6fcaeea3/health`;

    try {
      // Create an AbortController with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // Parse response
        let data;
        const text = await response.text();
        
        try {
          data = JSON.parse(text);
        } catch (e) {
          // If parsing fails, treat as plain text response
          data = { message: text };
        }
        
        setConnectionStatus({
          status: 'connected',
          message: 'Backend is online',
          details: `Connected to ${import.meta.env.VITE_SUPABASE_URL || 'Supabase'} environment (Project: ${projectId})`,
        });
      } else if (response.status === 404) {
        logger.warn('[Connection Check] Edge Function not found (404) - Backend not deployed');
        setConnectionStatus({
          status: 'disconnected',
          message: 'Backend Edge Function not deployed',
          details: `The Edge Function 'make-server-6fcaeea3' is not deployed to project ${projectId}. Deploy it from the Supabase dashboard.`,
        });
      } else if (response.status === 401 || response.status === 403) {
        // 401/403 usually means the Edge Function isn't deployed
        // Supabase returns 401 for missing functions instead of 404
        logger.info('[Connection Check] ℹ️ Backend not yet deployed - This is expected for new projects');
        setConnectionStatus({
          status: 'disconnected',
          message: 'Backend Edge Function not deployed',
          details: `Received ${response.status} error. This typically means the Edge Function 'make-server-6fcaeea3' is not deployed to project ${projectId}. Please deploy it to continue.`,
        });
      } else {
        logger.error('[Connection Check] Failed:', response.status, response.statusText);
        const errorText = await response.text().catch(() => '');
        setConnectionStatus({
          status: 'error',
          message: 'Backend responded with an error',
          details: `Status: ${response.status} - ${response.statusText}${errorText ? `\n${errorText}` : ''}`,
        });
      }
    } catch (error: unknown) {
      // Don't log as error if backend is just not deployed yet (expected scenario)
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch')) {
        logger.log('[Backend] Not deployed yet (expected for new environments)');
        setConnectionStatus({
          status: 'disconnected',
          message: 'Cannot reach backend server',
          details: `Failed to connect to project ${projectId}. The Edge Function 'make-server-6fcaeea3' may not be deployed, or there may be a network issue.`,
        });
        return;
      }
      
      logger.error('[Connection Check] Unexpected error:', error);

      const err = error instanceof Error ? error : null;
      if (err?.name === 'AbortError') {
        setConnectionStatus({
          status: 'error',
          message: 'Connection timeout',
          details: `The backend server at ${projectId}.supabase.co did not respond within 10 seconds. The Edge Function may not be deployed.`,
        });
      } else if (err?.message.includes('fetch') || err?.message.includes('Failed to fetch')) {
        setConnectionStatus({
          status: 'disconnected',
          message: 'Cannot reach backend server',
          details: `Failed to connect to project ${projectId}. The Edge Function 'make-server-6fcaeea3' may not be deployed, or there may be a network issue.`,
        });
      } else {
        setConnectionStatus({
          status: 'error',
          message: 'Connection failed',
          details: err?.message || String(error),
        });
      }
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      case 'connected':
        return 'border-green-200 bg-green-50';
      case 'disconnected':
        return 'border-red-200 bg-red-50';
      case 'error':
        return 'border-amber-200 bg-amber-50';
    }
  };

  const getTextColor = () => {
    switch (connectionStatus.status) {
      case 'checking':
        return 'text-blue-900';
      case 'connected':
        return 'text-green-900';
      case 'disconnected':
        return 'text-red-900';
      case 'error':
        return 'text-amber-900';
    }
  };

  // Only show if not connected
  if (connectionStatus.status === 'connected') {
    return null;
  }

  return (
    <div className={`mt-4 p-4 border rounded-xl ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${getTextColor()}`}>
            {connectionStatus.message}
          </p>
          {connectionStatus.details && (
            <p className="text-xs mt-1 text-gray-700">
              {connectionStatus.details}
            </p>
          )}
          {connectionStatus.status === 'disconnected' && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-800">Troubleshooting:</p>
              <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                <li>Ensure the Supabase Edge Function is deployed</li>
                <li>Check that the function name is correct: <code className="bg-white px-1 rounded">make-server-6fcaeea3</code></li>
                <li>Verify your network connection</li>
                <li>Check browser console for detailed error messages</li>
              </ul>
              <div className="flex gap-2">
                <button
                  onClick={checkConnection}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  Retry Connection
                </button>
                <button
                  onClick={() => setShowDeploymentGuide(!showDeploymentGuide)}
                  className="text-xs font-medium text-green-600 hover:text-green-700 underline"
                >
                  {showDeploymentGuide ? 'Hide' : 'Show'} Deployment Guide
                </button>
              </div>
            </div>
          )}
          {connectionStatus.status === 'error' && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={checkConnection}
                className="text-xs font-medium text-amber-700 hover:text-amber-800 underline"
              >
                Retry Connection
              </button>
              <button
                onClick={() => setShowDeploymentGuide(!showDeploymentGuide)}
                className="text-xs font-medium text-green-600 hover:text-green-700 underline"
              >
                {showDeploymentGuide ? 'Hide' : 'Show'} Deployment Guide
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Deployment Guide - TODO: Create BackendDeploymentGuide component */}
      {/* {showDeploymentGuide && (connectionStatus.status === 'disconnected' || connectionStatus.status === 'error') && (
        <BackendDeploymentGuide />
      )} */}
    </div>
  );
}