import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ChevronUp, 
  ChevronDown, 
  AlertCircle 
} from 'lucide-react';
import { publicAnonKey } from '../../../utils/supabase/info';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import { logger } from '../utils/logger';

export function BackendConnectionDiagnostic() {
  const [status, setStatus] = useState<'checking' | 'success' | 'warning' | 'error'>('checking');
  const [message, setMessage] = useState('Checking connection...');
  const [details, setDetails] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const checkConnection = async () => {
    setIsRefreshing(true);
    setStatus('checking');
    setMessage('Checking connection...');
    
    const env = getCurrentEnvironment();
    const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    const envProjectId = urlMatch ? urlMatch[1] : 'unknown';
    
    try {
      const healthUrl = `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/health`;
      const testDbUrl = `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/test-db`;
      
      logger.log('[Backend Diagnostic] Checking connection...');
      logger.log('[Backend Diagnostic] Health URL:', healthUrl);
      logger.log('[Backend Diagnostic] Test DB URL:', testDbUrl);
      logger.log('[Backend Diagnostic] Environment:', env.name, '(' + env.id + ')');
      logger.log('[Backend Diagnostic] Using anon key:', publicAnonKey ? 'YES' : 'NO');
      
      // Get the anon key for the current environment
      const anonKey = env.anonKey || publicAnonKey;
      
      // Test both endpoints in parallel
      const [healthResponse, testDbResponse] = await Promise.all([
        fetch(healthUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
            'X-Environment-ID': env.id,
          },
        }),
        fetch(testDbUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
            'X-Environment-ID': env.id,
          },
        })
      ]);

      logger.log('[Backend Diagnostic] Health response status:', healthResponse.status);
      logger.log('[Backend Diagnostic] Test DB response status:', testDbResponse.status);

      // Try to read response bodies
      const healthText = await healthResponse.text();
      const testDbText = await testDbResponse.text();
      
      logger.log('[Backend Diagnostic] Health response body:', healthText);
      logger.log('[Backend Diagnostic] Test DB response body:', testDbText);

      let healthData = null;
      let testDbData = null;
      try {
        healthData = JSON.parse(healthText);
      } catch {
        logger.warn('[Backend Diagnostic] Could not parse health response as JSON');
      }
      try {
        testDbData = JSON.parse(testDbText);
      } catch {
        logger.warn('[Backend Diagnostic] Could not parse test-db response as JSON');
      }

      setRawResponse({
        health: {
          status: healthResponse.status,
          statusText: healthResponse.statusText,
          headers: Object.fromEntries(healthResponse.headers.entries()),
          body: healthText,
          bodyParsed: healthData,
        },
        testDb: {
          status: testDbResponse.status,
          statusText: testDbResponse.statusText,
          headers: Object.fromEntries(testDbResponse.headers.entries()),
          body: testDbText,
          bodyParsed: testDbData,
        }
      });

      // Handle 401 specifically - this might be a CORS or deployment issue
      if (healthResponse.status === 401 && testDbResponse.status === 401) {
        setStatus('error');
        setMessage('Authentication issue - 401 Unauthorized');
        setDetails({
          issue: 'Unauthorized',
          explanation: 'Both /health and /test-db endpoints returned 401 even though we sent the Supabase anon key. This indicates a backend authentication configuration problem.',
          healthStatus: healthResponse.status,
          testDbStatus: testDbResponse.status,
          url: healthUrl,
          environment: env.name,
          projectId: envProjectId,
          anonKeyProvided: !!anonKey,
          suggestion: 'The backend middleware may be incorrectly requiring custom JWT tokens for public endpoints.',
        });
      } 
      // Handle success
      else if (healthResponse.ok || testDbResponse.ok) {
        const data = healthData || testDbData || { status: 'ok', message: 'Backend is responding' };
        setStatus('success');
        setMessage('Connected');
        setDetails({
          ...data,
          healthStatus: healthResponse.status,
          testDbStatus: testDbResponse.status,
        });
      } 
      // Handle other errors
      else {
        setStatus('error');
        setMessage(`Backend errors (Health: ${healthResponse.status}, DB: ${testDbResponse.status})`);
        setDetails({
          healthStatus: healthResponse.status,
          healthStatusText: healthResponse.statusText,
          testDbStatus: testDbResponse.status,
          testDbStatusText: testDbResponse.statusText,
          url: healthUrl,
          environment: env.name,
          projectId: envProjectId,
        });
      }
    } catch (error: unknown) {
      logger.error('[Backend Diagnostic] Error:', error);
      setStatus('error');
      setDetails({
        message: error instanceof Error ? error.message : 'Unknown error',
        hint: 'The backend function may not be deployed. Run: ./deploy-backend.sh'
      });
      setRawResponse({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace available'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void checkConnection();
  }, []);

  const env = getCurrentEnvironment();
  const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectId = urlMatch ? urlMatch[1] : 'unknown';

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 mb-6">
      {/* Compact Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          {status === 'checking' && (
            <div className="animate-spin">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
          )}
          {status === 'success' && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {status === 'warning' && (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
          {status === 'error' && (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Backend Status:</span>
              <span className={`text-sm font-medium ${
                status === 'success' ? 'text-green-600' :
                status === 'warning' ? 'text-amber-600' :
                status === 'error' ? 'text-red-600' :
                'text-blue-600'
              }`}>
                {message}
              </span>
              <Badge variant="outline" className="text-xs">{env.name}</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              void checkConnection();
            }}
            disabled={isRefreshing}
            className="h-8"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
          {/* Configuration Details */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Project ID:</span>
                <code className="ml-2 bg-gray-50 px-2 py-1 rounded border border-gray-200 font-mono text-xs">
                  {projectId}
                </code>
              </div>
              <div>
                <span className="text-gray-600">Environment:</span>
                <Badge className="ml-2">{env.name}</Badge>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-600">Backend URL:</span>
                <code className="ml-2 bg-gray-50 px-2 py-1 rounded border border-gray-200 font-mono text-xs break-all">
                  {env.supabaseUrl}/functions/v1/make-server-6fcaeea3
                </code>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-900 mb-1">Backend Online</h4>
                  <p className="text-sm text-green-800">
                    Your backend is deployed and responding correctly. All features should work normally.
                  </p>
                  {details?.database && (
                    <p className="text-xs text-green-700 mt-2">
                      ✓ Database connection verified
                    </p>
                  )}
                  {details?.environment && (
                    <p className="text-xs text-green-700 mt-1">
                      ✓ Environment: {details.environment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === 'warning' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-amber-900 mb-2">Configuration Issue</h4>
                  <p className="text-sm text-amber-800 mb-3">
                    The backend is responding but returning a 401 Unauthorized error.
                  </p>
                  <p className="text-sm text-amber-800">
                    <strong>Good news:</strong> Backend is deployed and running. The middleware may need adjustment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Connection Error</h4>
                  <p className="text-sm text-red-800 mb-2">
                    {details?.explanation || 'The backend Edge Function is not responding properly.'}
                  </p>
                  {details?.suggestion && (
                    <p className="text-xs text-red-700 mt-2">
                      💡 {details.suggestion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Response Details */}
          {details && (
            <details className="bg-white rounded-lg border border-gray-200">
              <summary className="p-3 cursor-pointer hover:bg-gray-50 text-sm font-semibold text-gray-900">
                Response Details
              </summary>
              <div className="p-4 border-t border-gray-200">
                <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-48 font-mono">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            </details>
          )}

          {/* Raw Response (for debugging) */}
          {rawResponse && (
            <details className="bg-white rounded-lg border border-gray-200">
              <summary className="p-3 cursor-pointer hover:bg-gray-50 text-sm font-semibold text-gray-900">
                Raw Response (Debug)
              </summary>
              <div className="p-4 border-t border-gray-200">
                <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-96 font-mono">
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}