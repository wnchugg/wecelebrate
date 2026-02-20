import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Shield, 
  Database, 
  Server, 
  CheckCircle, 
  XCircle, 
  Copy, 
  RefreshCw,
  Globe,
  Key,
  CheckCheck,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { logger } from '../../utils/logger';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';
import { useAdmin } from '../../context/AdminContext';
import { getAccessToken } from '../../lib/apiClient';

interface DebugInfo {
  timestamp: string;
  environment: {
    name: string;
    apiUrl: string;
    projectId: string;
    supabaseUrl: string;
  };
  adminContext: {
    isAuthenticated: boolean;
    hasUser: boolean;
    username: string | null;
    role: string | null;
  };
  token: {
    exists: boolean;
    raw?: string;
    decoded?: any;
    algorithm?: string;
    issuedAt?: string;
    expiresAt?: string;
    isExpired?: boolean;
    userId?: string;
    username?: string;
  };
  backend: {
    reachable: boolean;
    responseTime?: number;
    error?: string;
    jwtConfig?: {
      hasExplicitSecret: boolean;
      secretSource: string;
      secretLength: number;
      secretPreview: string;
      projectId: string;
      expectedProjectId: string;
      projectIdMatches: boolean;
      supabaseUrl: string;
      cryptoKeyAvailable: boolean;
    };
  };
  protectedEndpoint: {
    tested: boolean;
    success?: boolean;
    error?: string;
    response?: any;
  };
}

export function AdminDebug() {
  const { adminUser, isAdminAuthenticated } = useAdmin();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const collectDebugInfo = async (): Promise<DebugInfo> => {
    const env = getCurrentEnvironment();
    const token = getAccessToken();
    
    // Extract project ID from environment's supabaseUrl
    const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    const envProjectId = urlMatch ? urlMatch[1] : projectId;
    const apiUrl = `https://${envProjectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

    const info: DebugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        name: env.name,
        apiUrl,
        projectId: envProjectId,
        supabaseUrl: env.supabaseUrl,
      },
      adminContext: {
        isAuthenticated: isAdminAuthenticated,
        hasUser: !!adminUser,
        username: adminUser?.username || null,
        role: adminUser?.role || null,
      },
      token: {
        exists: !!token,
      },
      backend: {
        reachable: false,
      },
      protectedEndpoint: {
        tested: false,
      },
    };

    // Decode token if it exists
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          
          info.token.decoded = payload;
          info.token.algorithm = header.alg;
          info.token.issuedAt = payload.iat ? new Date(payload.iat * 1000).toISOString() : undefined;
          info.token.expiresAt = payload.exp ? new Date(payload.exp * 1000).toISOString() : undefined;
          info.token.isExpired = payload.exp ? Date.now() > payload.exp * 1000 : undefined;
          info.token.userId = payload.userId;
          info.token.username = payload.username;
          // Only include raw token in debug mode (first 20 chars for security)
          info.token.raw = `${token.substring(0, 20)}...`;
        }
      } catch (e) {
        logger.error('Failed to decode token:', e);
      }
    }

    // Test backend connectivity
    try {
      const startTime = Date.now();
      const response = await fetch(`${apiUrl}/health`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        info.backend.reachable = true;
        info.backend.responseTime = responseTime;
        
        // Fetch JWT configuration from backend
        try {
          const jwtConfigResponse = await fetch(`${apiUrl}/debug-jwt-config`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            signal: AbortSignal.timeout(5000),
          });
          
          if (jwtConfigResponse.ok) {
            const jwtConfigData = await jwtConfigResponse.json();
            info.backend.jwtConfig = jwtConfigData.jwtConfig;
          }
        } catch (jwtConfigError) {
          logger.error('Failed to fetch JWT config:', jwtConfigError);
        }
      } else {
        info.backend.error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      info.backend.error = error instanceof Error ? error.message : String(error);
    }

    // Test protected endpoint if we have a token
    if (token) {
      try {
        const response = await fetch(`${apiUrl}/auth/session`, {
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': token, // Use X-Access-Token header as backend expects
            'Authorization': `Bearer ${token}`, // Also send in Authorization for compatibility
            'X-Environment-ID': env.id,
          },
          signal: AbortSignal.timeout(5000),
        });

        info.protectedEndpoint.tested = true;

        if (response.ok) {
          const data = await response.json();
          info.protectedEndpoint.success = true;
          info.protectedEndpoint.response = data;
        } else {
          info.protectedEndpoint.success = false;
          info.protectedEndpoint.error = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            info.protectedEndpoint.error += ` - ${JSON.stringify(errorData)}`;
          } catch {
            // Response body wasn't JSON
          }
        }
      } catch (error) {
        info.protectedEndpoint.tested = true;
        info.protectedEndpoint.success = false;
        info.protectedEndpoint.error = error instanceof Error ? error.message : String(error);
      }
    }

    return info;
  };

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const info = await collectDebugInfo();
      setDebugInfo(info);
    } catch (error) {
      logger.error('Failed to collect debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const copyToClipboard = async () => {
    if (!debugInfo) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('Failed to copy:', error);
    }
  };

  const StatusIcon = ({ success, loading: itemLoading }: { success?: boolean; loading?: boolean }) => {
    if (itemLoading) return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    if (success) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Debug Console</h1>
          <p className="text-sm text-gray-600 mt-1">System diagnostics and troubleshooting information</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={!debugInfo}
          >
            {copied ? (
              <>
                <CheckCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">Copy Debug Data</span>
              </>
            )}
          </button>
          <button
            onClick={runDiagnostics}
            className="flex items-center gap-2 px-4 py-2 bg-[#D91C81] hover:bg-[#B91670] text-white rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <button
            onClick={() => navigate('/admin/logout')}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {loading && !debugInfo ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-[#D91C81]" />
        </div>
      ) : debugInfo ? (
        <div className="space-y-4">
          {/* Environment Info */}
          <Card>
            <CardHeader>
              <Globe className="w-5 h-5 text-[#1B2A5E]" />
              <CardTitle>Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <p className="text-sm text-gray-900 mt-1">{debugInfo.environment.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Project ID:</span>
                  <p className="text-sm text-gray-900 mt-1 font-mono">{debugInfo.environment.projectId}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-medium text-gray-600">API URL:</span>
                  <p className="text-sm text-gray-900 mt-1 font-mono break-all">{debugInfo.environment.apiUrl}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-medium text-gray-600">Supabase URL:</span>
                  <p className="text-sm text-gray-900 mt-1 font-mono break-all">{debugInfo.environment.supabaseUrl}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <Shield className="w-5 h-5 text-[#1B2A5E]" />
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <StatusIcon success={debugInfo.adminContext.isAuthenticated} />
                  <span className="text-sm font-medium text-gray-600">Authenticated:</span>
                  <span className="text-sm text-gray-900">{debugInfo.adminContext.isAuthenticated ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon success={debugInfo.adminContext.hasUser} />
                  <span className="text-sm font-medium text-gray-600">User Loaded:</span>
                  <span className="text-sm text-gray-900">{debugInfo.adminContext.hasUser ? 'Yes' : 'No'}</span>
                </div>
                {debugInfo.adminContext.username && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Username:</span>
                    <p className="text-sm text-gray-900 mt-1">{debugInfo.adminContext.username}</p>
                  </div>
                )}
                {debugInfo.adminContext.role && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Role:</span>
                    <p className="text-sm text-gray-900 mt-1 capitalize">{debugInfo.adminContext.role}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Token Info */}
          <Card>
            <CardHeader>
              <Key className="w-5 h-5 text-[#1B2A5E]" />
              <CardTitle>JWT Token</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusIcon success={debugInfo.token.exists} />
                  <span className="text-sm font-medium text-gray-600">Token Present:</span>
                  <span className="text-sm text-gray-900">{debugInfo.token.exists ? 'Yes' : 'No'}</span>
                </div>
                
                {debugInfo.token.exists && debugInfo.token.algorithm && (
                  <>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Algorithm:</span>
                      <p className="text-sm text-gray-900 mt-1 font-mono">{debugInfo.token.algorithm}</p>
                    </div>
                    
                    {debugInfo.token.issuedAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Issued At:</span>
                        <p className="text-sm text-gray-900 mt-1">{new Date(debugInfo.token.issuedAt).toLocaleString()}</p>
                      </div>
                    )}
                    
                    {debugInfo.token.expiresAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Expires At:</span>
                        <p className="text-sm text-gray-900 mt-1">{new Date(debugInfo.token.expiresAt).toLocaleString()}</p>
                      </div>
                    )}
                    
                    {debugInfo.token.isExpired !== undefined && (
                      <div className="flex items-center gap-2">
                        <StatusIcon success={!debugInfo.token.isExpired} />
                        <span className="text-sm font-medium text-gray-600">Token Status:</span>
                        <span className={`text-sm font-medium ${debugInfo.token.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                          {debugInfo.token.isExpired ? 'Expired' : 'Valid'}
                        </span>
                      </div>
                    )}
                    
                    {debugInfo.token.userId && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">User ID:</span>
                        <p className="text-sm text-gray-900 mt-1 font-mono">{debugInfo.token.userId}</p>
                      </div>
                    )}
                    
                    {debugInfo.token.username && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Token Username:</span>
                        <p className="text-sm text-gray-900 mt-1">{debugInfo.token.username}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Backend Connectivity */}
          <Card>
            <CardHeader>
              <Server className="w-5 h-5 text-[#1B2A5E]" />
              <CardTitle>Backend Connectivity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusIcon success={debugInfo.backend.reachable} />
                  <span className="text-sm font-medium text-gray-600">Backend Reachable:</span>
                  <span className="text-sm text-gray-900">{debugInfo.backend.reachable ? 'Yes' : 'No'}</span>
                </div>
                
                {debugInfo.backend.responseTime && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Response Time:</span>
                    <p className="text-sm text-gray-900 mt-1">{debugInfo.backend.responseTime}ms</p>
                  </div>
                )}
                
                {debugInfo.backend.error && (
                  <div>
                    <span className="text-sm font-medium text-red-600">Error:</span>
                    <p className="text-sm text-red-900 mt-1 font-mono">{debugInfo.backend.error}</p>
                  </div>
                )}
                
                {debugInfo.backend.jwtConfig && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">JWT Configuration</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <StatusIcon success={debugInfo.backend.jwtConfig.hasExplicitSecret} />
                        <span className="text-xs font-medium text-gray-600">Explicit Secret:</span>
                        <span className="text-xs text-gray-900">{debugInfo.backend.jwtConfig.hasExplicitSecret ? 'Yes (from env var)' : 'No (derived)'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon success={debugInfo.backend.jwtConfig.projectIdMatches} />
                        <span className="text-xs font-medium text-gray-600">Project ID Match:</span>
                        <span className={`text-xs font-medium ${debugInfo.backend.jwtConfig.projectIdMatches ? 'text-green-600' : 'text-red-600'}`}>
                          {debugInfo.backend.jwtConfig.projectIdMatches ? 'Matches' : 'Mismatch'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-600">Backend Project ID:</span>
                        <p className="text-xs text-gray-900 mt-1 font-mono">{debugInfo.backend.jwtConfig.projectId}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-600">Expected Project ID:</span>
                        <p className="text-xs text-gray-900 mt-1 font-mono">{debugInfo.backend.jwtConfig.expectedProjectId}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-600">Secret Length:</span>
                        <p className="text-xs text-gray-900 mt-1">{debugInfo.backend.jwtConfig.secretLength} characters</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-600">Secret Preview:</span>
                        <p className="text-xs text-gray-900 mt-1 font-mono">{debugInfo.backend.jwtConfig.secretPreview}</p>
                      </div>
                      {!debugInfo.backend.jwtConfig.projectIdMatches && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-xs text-red-800">
                            ⚠️ <strong>Critical Issue:</strong> The backend project ID does not match the expected ID. 
                            This will cause JWT verification to fail. Tokens are being signed with a different secret than they're being verified with.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Protected Endpoint Test */}
          {debugInfo.protectedEndpoint.tested && (
            <Card>
              <CardHeader>
                <Database className="w-5 h-5 text-[#1B2A5E]" />
                <CardTitle>Protected Endpoint (/auth/session)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon success={debugInfo.protectedEndpoint.success} />
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className="text-sm text-gray-900">{debugInfo.protectedEndpoint.success ? 'Success' : 'Failed'}</span>
                  </div>
                  
                  {debugInfo.protectedEndpoint.error && (
                    <div>
                      <span className="text-sm font-medium text-red-600">Error:</span>
                      <p className="text-sm text-red-900 mt-1 font-mono whitespace-pre-wrap">{debugInfo.protectedEndpoint.error}</p>
                    </div>
                  )}
                  
                  {debugInfo.protectedEndpoint.response && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Response:</span>
                      <pre className="text-xs text-gray-900 mt-1 p-3 bg-gray-50 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(debugInfo.protectedEndpoint.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* JSON Snapshot */}
          <Card>
            <CardHeader>
              <AlertCircle className="w-5 h-5 text-[#1B2A5E]" />
              <CardTitle>JSON Snapshot</CardTitle>
              <CardDescription>(For sharing with support)</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-900 p-4 bg-gray-50 rounded border border-gray-200 overflow-x-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">No debug information available. Click Refresh to collect diagnostics.</span>
          </div>
        </div>
      )}
    </div>
  );
}