import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Server, X } from 'lucide-react';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

export function BackendHealthTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    void checkHealth().catch((error) => {
      console.error('Error checking backend health:', error);
      setStatus('error');
      setMessage('Failed to check backend health');
    });
  }, []);

  const checkHealth = async () => {
    setStatus('loading');
    try {
      const env = getCurrentEnvironment();
      const url = `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/health`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${env.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        // Try to parse JSON, but handle empty responses gracefully
        let data;
        const text = await res.text();
        
        try {
          data = text ? JSON.parse(text) : { status: 'ok', message: 'Backend is running' };
        } catch (parseError) {
          data = { status: 'ok', message: text || 'Backend is running', rawResponse: text };
        }
        
        setStatus('success');
        setMessage('Backend is connected and healthy! ✅');
        setResponse(data);
      } else {
        const errorText = await res.text();
        setStatus('error');
        setMessage(`Backend returned status ${res.status}`);
        setResponse(`Error: ${errorText}\n\nIf you see 401/404, run: ./deploy-backend.sh`);
      }
    } catch (error: unknown) {
      // Network errors typically mean the function isn't deployed or unreachable
      setStatus('error');
      setResponse(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThe backend function may not be deployed yet.\n\nRun: ./deploy-backend.sh`);
    }
  };

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`rounded-lg shadow-lg p-4 border-2 ${
        status === 'success' ? 'bg-green-50 border-green-500' :
        status === 'error' ? 'bg-red-50 border-red-500' :
        'bg-blue-50 border-blue-500'
      }`}>
        <div className="flex items-center gap-3">
          {status === 'loading' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
          {status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
          {status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
          
          <div className="flex-1">
            <p className={`font-semibold text-sm ${
              status === 'success' ? 'text-green-900' :
              status === 'error' ? 'text-red-900' :
              'text-blue-900'
            }`}>
              {message || 'Checking backend connection...'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Env: {getCurrentEnvironment().name} ({getCurrentEnvironment().supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown'})
            </p>
            {response && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer hover:underline">
                  Show details
                </summary>
                <pre className="text-xs mt-1 p-2 bg-white rounded overflow-auto max-w-xs">
                  {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
                </pre>
              </details>
            )}
          </div>
          
          <div className="flex items-start gap-1">
            <button
              onClick={() => void checkHealth()}
              className="p-1 hover:bg-white/50 rounded transition-colors"
              title="Recheck connection"
            >
              <Server className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 hover:bg-white/50 rounded transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}