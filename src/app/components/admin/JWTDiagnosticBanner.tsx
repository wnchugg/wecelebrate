import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  XCircle, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Terminal 
} from 'lucide-react';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { getAccessToken, forceClearTokens } from '../../utils/api';
import { logger } from '../../utils/logger';

interface JWTDiagnostic {
  backendReachable: boolean;
  jwtConfigLoaded: boolean;
  hasExplicitSecret: boolean;
  projectIdMatches: boolean;
  tokenExists: boolean;
  tokenAlgorithm?: string;
  tokenExpired?: boolean;
  issue?: 'no_backend' | 'no_jwt_secret' | 'project_mismatch' | 'token_mismatch' | 'token_expired' | 'no_token' | 'all_good';
  recommendation?: string;
  secretPreview?: string;
  backendProjectId?: string;
  expectedProjectId?: string;
}

export function JWTDiagnosticBanner() {
  const [diagnostic, setDiagnostic] = useState<JWTDiagnostic | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  const runDiagnostic = async () => {
    setLoading(true);
    const env = getCurrentEnvironment();
    const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    const envProjectId = urlMatch ? urlMatch[1] : projectId;
    const apiUrl = `https://${envProjectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

    const result: JWTDiagnostic = {
      backendReachable: false,
      jwtConfigLoaded: false,
      hasExplicitSecret: false,
      projectIdMatches: false,
      tokenExists: false,
    };

    // Check if token exists and decode it
    const token = getAccessToken();
    result.tokenExists = !!token;

    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          result.tokenAlgorithm = header.alg;
          result.tokenExpired = payload.exp ? Date.now() > payload.exp * 1000 : false;
        }
      } catch (e) {
        logger.error('Failed to decode token:', e);
      }
    }

    // Check backend connectivity and JWT config
    try {
      const response = await fetch(`${apiUrl}/debug-jwt-config`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        result.backendReachable = true;
        const data = await response.json();
        
        if (data.jwtConfig) {
          result.jwtConfigLoaded = true;
          result.hasExplicitSecret = data.jwtConfig.hasExplicitSecret;
          result.projectIdMatches = data.jwtConfig.projectIdMatches;
          result.secretPreview = data.jwtConfig.secretPreview;
          result.backendProjectId = data.jwtConfig.projectId;
          result.expectedProjectId = data.jwtConfig.expectedProjectId;
        }
      }
    } catch (error) {
      logger.error('Backend diagnostic failed:', error);
    }

    // Determine the primary issue and recommendation
    if (!result.backendReachable) {
      result.issue = 'no_backend';
      result.recommendation = 'Backend is not reachable. Check that the Edge Function is deployed and running.';
    } else if (!result.jwtConfigLoaded) {
      result.issue = 'no_jwt_secret';
      result.recommendation = 'JWT configuration could not be loaded from backend.';
    } else if (!result.projectIdMatches) {
      result.issue = 'project_mismatch';
      result.recommendation = 'Backend is deployed to wrong Supabase project. JWT tokens will always fail.';
    } else if (!result.hasExplicitSecret) {
      result.issue = 'no_jwt_secret';
      result.recommendation = 'JWT_SECRET environment variable is not set. Secret is being derived from project ID. Set JWT_SECRET in Supabase secrets for stability.';
    } else if (result.tokenExists && result.tokenAlgorithm !== 'HS256') {
      result.issue = 'token_mismatch';
      result.recommendation = `Token uses ${result.tokenAlgorithm} algorithm but backend expects HS256. Clear token and login again.`;
    } else if (result.tokenExists && result.tokenExpired) {
      result.issue = 'token_expired';
      result.recommendation = 'Your session token has expired. Clear token and login again.';
    } else if (!result.tokenExists) {
      result.issue = 'no_token';
      result.recommendation = 'No authentication token found. Please login.';
    } else {
      result.issue = 'all_good';
      result.recommendation = 'JWT configuration looks good!';
    }

    setDiagnostic(result);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const handleClearTokens = async () => {
    setClearing(true);
    try {
      forceClearTokens();
      // Wait a bit for the clear to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      // Re-run diagnostic
      await runDiagnostic();
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!diagnostic) {
    return null;
  }

  // Only show banner if there's an issue
  if (diagnostic.issue === 'all_good' || diagnostic.issue === 'no_token') {
    return null;
  }

  const getBannerColor = () => {
    switch (diagnostic.issue) {
      case 'no_backend':
      case 'project_mismatch':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'no_jwt_secret':
      case 'token_mismatch':
      case 'token_expired':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getIcon = () => {
    switch (diagnostic.issue) {
      case 'no_backend':
      case 'project_mismatch':
        return <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
      case 'token_expired':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />;
      case 'all_good':
        return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getBannerColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">
              {diagnostic.issue === 'no_backend' && 'Backend Not Reachable'}
              {diagnostic.issue === 'project_mismatch' && 'Critical: Backend Project Mismatch'}
              {diagnostic.issue === 'no_jwt_secret' && 'JWT Secret Not Configured'}
              {diagnostic.issue === 'token_mismatch' && 'Token Algorithm Mismatch'}
              {diagnostic.issue === 'token_expired' && 'Session Expired'}
            </h3>
          </div>
          <p className="text-sm opacity-90 mb-3">
            {diagnostic.recommendation}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {(diagnostic.issue === 'token_mismatch' || diagnostic.issue === 'token_expired') && (
              <button
                onClick={handleClearTokens}
                disabled={clearing}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-current rounded text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {clearing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4" />
                    Clear Tokens & Retry
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm font-medium underline hover:no-underline"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            
            <button
              onClick={runDiagnostic}
              className="inline-flex items-center gap-1 text-sm font-medium underline hover:no-underline"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {/* Detailed diagnostic info */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-current/20">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono">
                <div>
                  <span className="opacity-70">Backend Reachable:</span>
                  <span className="ml-2 font-semibold">{diagnostic.backendReachable ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div>
                  <span className="opacity-70">JWT Config Loaded:</span>
                  <span className="ml-2 font-semibold">{diagnostic.jwtConfigLoaded ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div>
                  <span className="opacity-70">Explicit JWT_SECRET:</span>
                  <span className="ml-2 font-semibold">{diagnostic.hasExplicitSecret ? '✓ Yes' : '✗ No (derived)'}</span>
                </div>
                <div>
                  <span className="opacity-70">Project ID Match:</span>
                  <span className="ml-2 font-semibold">{diagnostic.projectIdMatches ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div>
                  <span className="opacity-70">Token Exists:</span>
                  <span className="ml-2 font-semibold">{diagnostic.tokenExists ? '✓ Yes' : '✗ No'}</span>
                </div>
                {diagnostic.tokenAlgorithm && (
                  <div>
                    <span className="opacity-70">Token Algorithm:</span>
                    <span className="ml-2 font-semibold">{diagnostic.tokenAlgorithm}</span>
                  </div>
                )}
                {diagnostic.tokenExpired !== undefined && (
                  <div>
                    <span className="opacity-70">Token Expired:</span>
                    <span className="ml-2 font-semibold">{diagnostic.tokenExpired ? '✗ Yes' : '✓ No'}</span>
                  </div>
                )}
                {diagnostic.backendProjectId && (
                  <div className="col-span-2">
                    <span className="opacity-70">Backend Project ID:</span>
                    <span className="ml-2 font-semibold">{diagnostic.backendProjectId}</span>
                  </div>
                )}
                {diagnostic.expectedProjectId && (
                  <div className="col-span-2">
                    <span className="opacity-70">Expected Project ID:</span>
                    <span className="ml-2 font-semibold">{diagnostic.expectedProjectId}</span>
                  </div>
                )}
                {diagnostic.secretPreview && (
                  <div className="col-span-2">
                    <span className="opacity-70">Secret Preview:</span>
                    <span className="ml-2 font-semibold break-all">{diagnostic.secretPreview}</span>
                  </div>
                )}
              </div>

              {/* Specific troubleshooting steps */}
              <div className="mt-3 p-3 bg-white/50 rounded text-xs">
                <p className="font-semibold mb-2">Troubleshooting Steps:</p>
                <ol className="list-decimal list-inside space-y-1 opacity-90">
                  {diagnostic.issue === 'no_jwt_secret' && (
                    <>
                      <li>Go to Supabase Dashboard → Settings → Edge Functions → Secrets</li>
                      <li>Add a new secret named <code className="px-1 py-0.5 bg-black/10 rounded">JWT_SECRET</code></li>
                      <li>Use a strong random value (32+ characters)</li>
                      <li>Redeploy your Edge Function</li>
                      <li>Clear tokens and login again</li>
                    </>
                  )}
                  {diagnostic.issue === 'project_mismatch' && (
                    <>
                      <li>Backend is deployed to: <code className="px-1 py-0.5 bg-black/10 rounded">{diagnostic.backendProjectId}</code></li>
                      <li>Expected project: <code className="px-1 py-0.5 bg-black/10 rounded">{diagnostic.expectedProjectId}</code></li>
                      <li>Redeploy Edge Function to the correct Supabase project</li>
                      <li>Or update frontend to use the correct backend URL</li>
                    </>
                  )}
                  {(diagnostic.issue === 'token_mismatch' || diagnostic.issue === 'token_expired') && (
                    <>
                      <li>Click "Clear Tokens & Retry" button above</li>
                      <li>Alternatively, open browser console and run: <code className="px-1 py-0.5 bg-black/10 rounded">sessionStorage.clear()</code></li>
                      <li>Refresh the page</li>
                      <li>Login again to get a new token</li>
                    </>
                  )}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}