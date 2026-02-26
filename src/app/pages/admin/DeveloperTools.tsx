import { useState } from 'react';
import { 
  Server, 
  Database, 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  AlertCircle,
  Shield,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getCurrentEnvironment, getAvailableEnvironments } from '../../config/deploymentEnvironments';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { getAccessToken } from '../../utils/api';
import { Link } from 'react-router';
import { TestTube2 } from 'lucide-react';

export function DeveloperTools() {
  const [activeTab, setActiveTab] = useState('data'); // Changed default from 'connection' to 'data'
  const [isLoadingConnection, setIsLoadingConnection] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [dataCheck, setDataCheck] = useState<any>(null);
  const [isReseedingGlobal, setIsReseedingGlobal] = useState(false);
  const [globalReseedResult, setGlobalReseedResult] = useState<string | null>(null);
  const [jwtDiagnostic, setJwtDiagnostic] = useState<any>(null);
  const [isCheckingJWT, setIsCheckingJWT] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const currentEnv = getCurrentEnvironment();
  const allEnvs = getAvailableEnvironments();
  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

  // ==================== JWT DIAGNOSTIC ====================
  const runJWTDiagnostic = async () => {
    setIsCheckingJWT(true);
    setJwtDiagnostic(null);
    
    try {
      const token = getAccessToken();
      const env = getCurrentEnvironment();
      
      const diagnostic: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        environment: env.id,
        tokenExists: !!token,
      };
      
      if (token) {
        // Decode token locally
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            
            diagnostic.tokenInfo = {
              algorithm: header.alg,
              type: header.typ,
              userId: payload.userId,
              email: payload.email,
              username: payload.username,
              role: payload.role,
              environment: payload.environment,
              issuedAt: new Date((payload.iat || 0) * 1000).toISOString(),
              expiresAt: new Date((payload.exp || 0) * 1000).toISOString(),
              expired: payload.exp < Math.floor(Date.now() / 1000),
              timeLeft: payload.exp ? Math.round((payload.exp * 1000 - Date.now()) / 1000 / 60) : 0,
            };
          }
        } catch (decodeError: any) {
          diagnostic.decodeError = decodeError.message;
        }
        
        // Use backend verification endpoint
        try {
          const verifyResponse = await fetch(`${baseUrl}/debug/verify-jwt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`, // Required for Supabase platform
              'X-Environment-ID': env.id,
            },
            body: JSON.stringify({ token }),
          });
          const verifyData = await verifyResponse.json();
          diagnostic.backendVerification = verifyData;
        } catch (verifyError: any) {
          diagnostic.backendVerificationError = verifyError.message;
        }
      } else {
        diagnostic.message = 'No access token found in sessionStorage';
        diagnostic.action = 'Please log in to get a token';
      }
      
      setJwtDiagnostic(diagnostic);
    } catch (error: any) {
      setJwtDiagnostic({ error: error.message });
    } finally {
      setIsCheckingJWT(false);
    }
  };

  // Connection Test Logic
  const runConnectionTest = async () => {
    setIsLoadingConnection(true);
    
    interface ConnectionTest {
      name: string;
      projectId: string;
      url: string;
      status: number | string;
      ok: boolean;
      data?: unknown;
      error?: string;
    }
    
    const results: {
      timestamp: string;
      figmaMakeConfig: Record<string, unknown>;
      currentEnvironment: unknown;
      allEnvironments: unknown;
      connectionTests: ConnectionTest[];
    } = {
      timestamp: new Date().toISOString(),
      figmaMakeConfig: {
        projectId,
        publicAnonKey: publicAnonKey.substring(0, 20) + '...',
        url: `https://${projectId}.supabase.co`,
      },
      currentEnvironment: currentEnv,
      allEnvironments: allEnvs,
      connectionTests: []
    };

    // Test connection to Figma Make's configured project
    const figmaMakeUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/health`;
    try {
      const response = await fetch(figmaMakeUrl, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      results.connectionTests.push({
        name: 'Figma Make Project (from /utils/supabase/info.tsx)',
        projectId,
        url: figmaMakeUrl,
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : await response.text()
      });
    } catch (error: any) {
      results.connectionTests.push({
        name: 'Figma Make Project (from /utils/supabase/info.tsx)',
        projectId,
        url: figmaMakeUrl,
        status: 'error',
        ok: false,
        error: error.message
      });
    }

    // Test connection to current selected environment
    const envMatch = currentEnv.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    const envProjectId = envMatch ? envMatch[1] : '';
    const envUrl = `${currentEnv.supabaseUrl}/functions/v1/make-server-6fcaeea3/health`;
    try {
      const response = await fetch(envUrl, {
        headers: {
          'Authorization': `Bearer ${currentEnv.supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      results.connectionTests.push({
        name: `Current Environment (${currentEnv.name})`,
        projectId: envProjectId,
        url: envUrl,
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : await response.text()
      });
    } catch (error: any) {
      results.connectionTests.push({
        name: `Current Environment (${currentEnv.name})`,
        projectId: envProjectId,
        url: envUrl,
        status: 'error',
        ok: false,
        error: error.message
      });
    }

    setConnectionTest(results);
    setIsLoadingConnection(false);
  };

  // Data Diagnostic Logic
  const runDataDiagnostic = async () => {
    setIsLoadingData(true);
    const token = getAccessToken();
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

    const diagnosticResults: Record<string, unknown> = {
      environment: {
        projectId: projectId,
        baseUrl: baseUrl,
        hasToken: !!token,
        token: token ? `${token.substring(0, 20)}...` : 'No token',
      },
      endpoints: {} as Record<string, unknown>,
    };

    // Test endpoints
    const endpoints = [
      { name: 'Health Check', url: `${baseUrl}/health`, method: 'GET', requiresAuth: false },
      { name: 'Get Clients', url: `${baseUrl}/v2/clients`, method: 'GET', requiresAuth: true },
      { name: 'Get Sites', url: `${baseUrl}/v2/sites`, method: 'GET', requiresAuth: true },
      { name: 'Get Gifts', url: `${baseUrl}/gifts`, method: 'GET', requiresAuth: true },
      { name: 'Check Admin', url: `${baseUrl}/debug/check-admin-users`, method: 'GET', requiresAuth: false },
    ];

    for (const endpoint of endpoints) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (endpoint.requiresAuth && token) {
          headers['X-Access-Token'] = token;
          headers['Authorization'] = `Bearer ${publicAnonKey}`;
        } else {
          headers['Authorization'] = `Bearer ${publicAnonKey}`;
        }

        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers,
        });

        let data: unknown = null;
        let parseError: string | null = null;
        let responseText = '';
        try {
          responseText = await response.text();
          if (responseText) {
            data = JSON.parse(responseText);
          }
        } catch (jsonError: any) {
          parseError = `JSON parse error: ${jsonError.message}`;
          data = { raw: responseText, parseError };
        }

        (diagnosticResults.endpoints as Record<string, unknown>)[endpoint.name] = {
          status: response.status,
          ok: response.ok,
          data: data,
          error: parseError,
        };
      } catch (error: any) {
        (diagnosticResults.endpoints as Record<string, unknown>)[endpoint.name] = {
          status: 0,
          ok: false,
          data: null,
          error: error.message,
        };
      }
    }

    setDataCheck(diagnosticResults);
    setIsLoadingData(false);
  };

  const reseedDatabase = async () => {
    setIsSeeding(true);
    const token = getAccessToken();
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

    // Check if user is logged in
    if (!token) {
      toast.error('You must be logged in as an admin to reseed the database');
      setIsSeeding(false);
      return;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Access-Token': token,
      'Authorization': `Bearer ${publicAnonKey}`,
    };

    try {
      const response = await fetch(`${baseUrl}/dev/reseed`, {
        method: 'POST',
        headers,
      });

      const data = await response.json();

      if (response.ok) {
        // Clear localStorage to remove stale site/client selections
        try {
          localStorage.removeItem('admin_selected_site_id');
        } catch (e) {
          console.warn('Failed to clear localStorage:', e);
        }
        
        toast.success('Database reseeded successfully! Page will reload...');
        // Re-run diagnostic after reseed
        await runDataDiagnostic();
        
        // Reload the page to clear any cached state
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error('Reseed failed:', data);
        toast.error(`Failed to reseed: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Reseed error:', error);
      toast.error(`Network error: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL data from the database. Are you sure?')) {
      return;
    }

    setIsClearing(true);
    const token = getAccessToken();
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

    // Check if user is logged in
    if (!token) {
      toast.error('You must be logged in as an admin to clear the database');
      setIsClearing(false);
      return;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Access-Token': token,
      'Authorization': `Bearer ${publicAnonKey}`,
    };

    try {
      // Delete all major data prefixes (including both singular and plural forms)
      const prefixes = [
        'client', 'clients',  // Both singular and plural
        'site', 'sites',      // Both singular and plural
        'gift', 'gifts',      // Both singular and plural
        'employee', 'employees',
        'order', 'orders',
        'admin', 'admins',
        'role', 'roles',
        'celebration', 'celebrations'
      ];
      let totalDeleted = 0;

      for (const prefix of prefixes) {
        try {
          const response = await fetch(`${baseUrl}/admin/database/prefix/${prefix}`, {
            method: 'DELETE',
            headers,
          });
          const data = await response.json();

          if (response.ok && data.success) {
            totalDeleted += data.deleted || 0;
          }
        } catch (error) {
          console.error(`Failed to delete prefix ${prefix}:`, error);
        }
      }

      toast.success(`Successfully cleared ${totalDeleted} records from the database`);
      // Re-run diagnostic after clearing
      await runDataDiagnostic();
    } catch (error: any) {
      console.error('Clear error:', error);
      toast.error(`Failed to clear database: ${error.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-[#D91C81]" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Developer Tools</h1>
          <p className="text-gray-600 mt-1">Environment management, connection testing, and data diagnostics</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link 
          to="/admin/testing-dashboard"
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-4 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <TestTube2 className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Testing Dashboard</h3>
          </div>
          <p className="text-sm text-gray-600">View live test results and CI/CD status</p>
        </Link>
        
        <Link 
          to="/admin/development-documentation"
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Documentation</h3>
          </div>
          <p className="text-sm text-gray-600">Technical docs and architecture guides</p>
        </Link>

        <Link 
          to="/admin/test-data-reference"
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Test Data</h3>
          </div>
          <p className="text-sm text-gray-600">Sample data and test credentials</p>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-2">
          <TabsList className="grid grid-cols-4 w-full gap-2">
            <TabsTrigger 
              value="environments" 
              className="flex items-center gap-2 data-[state=active]:bg-[#D91C81] data-[state=active]:text-white"
            >
              <Server className="w-4 h-4" />
              <span>Environments</span>
            </TabsTrigger>
            <TabsTrigger 
              value="connection" 
              className="flex items-center gap-2 data-[state=active]:bg-[#D91C81] data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4" />
              <span>Connection Test</span>
            </TabsTrigger>
            <TabsTrigger 
              value="data" 
              className="flex items-center gap-2 data-[state=active]:bg-[#D91C81] data-[state=active]:text-white"
            >
              <Database className="w-4 h-4" />
              <span>Data Diagnostic</span>
            </TabsTrigger>
            <TabsTrigger 
              value="jwt" 
              className="flex items-center gap-2 data-[state=active]:bg-[#D91C81] data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4" />
              <span>JWT Token</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Environments Tab */}
        <TabsContent value="environments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-[#D91C81]" />
                Environment Configuration
              </CardTitle>
              <CardDescription>View and manage deployment environments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Environment */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Current Selected Environment
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-blue-700 font-semibold">Name:</span>
                    <span className="text-blue-900">{currentEnv.name} ({currentEnv.id})</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-700 font-semibold">URL:</span>
                    <code className="text-blue-900 bg-white px-2 py-1 rounded font-mono text-xs break-all">{currentEnv.supabaseUrl}</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-700 font-semibold">Anon Key:</span>
                    <code className="text-blue-900 bg-white px-2 py-1 rounded font-mono text-xs">{currentEnv.supabaseAnonKey.substring(0, 40)}...</code>
                  </div>
                </div>
              </div>

              {/* All Environments */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Available Environments</h3>
                <div className="space-y-3">
                  {allEnvs.map((env) => (
                    <div 
                      key={env.id}
                      className={`p-4 border rounded-lg ${
                        env.id === currentEnv.id 
                          ? 'border-[#D91C81] bg-pink-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{env.name}</h4>
                          {env.id === currentEnv.id && (
                            <Badge className="bg-[#D91C81] text-white">Active</Badge>
                          )}
                        </div>
                        <Badge variant="outline">{env.id}</Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1 font-mono">
                        <div className="truncate">URL: {env.supabaseUrl}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Figma Make Configuration */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Figma Make Configuration
                </h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex gap-2">
                    <span className="text-purple-700 font-semibold">File:</span>
                    <code className="text-purple-900">/utils/supabase/info.tsx</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-700 font-semibold">Project ID:</span>
                    <code className="text-purple-900 bg-white px-2 py-1 rounded">{projectId}</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-700 font-semibold">URL:</span>
                    <code className="text-purple-900 bg-white px-2 py-1 rounded">https://{projectId}.supabase.co</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-700 font-semibold">Anon Key:</span>
                    <code className="text-purple-900 bg-white px-2 py-1 rounded">{publicAnonKey.substring(0, 40)}...</code>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white border border-purple-300 rounded">
                  <p className="text-xs text-purple-800">
                    <strong>⚠️ Important:</strong> This is the <strong>hardcoded</strong> configuration in Figma Make. 
                    All backend API calls use this project by default unless overridden by the environment selector.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connection Test Tab */}
        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Backend Connection Diagnostics
                  </CardTitle>
                  <CardDescription>Comprehensive environment and connection testing</CardDescription>
                </div>
                <Button
                  onClick={() => void runConnectionTest()}
                  disabled={isLoadingConnection}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingConnection ? 'animate-spin' : ''}`} />
                  {isLoadingConnection ? 'Testing...' : 'Run Test'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {connectionTest && (
                <>
                  {/* Test Results */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Connection Test Results</h3>
                    
                    {connectionTest.connectionTests.map((test: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg ${
                          test.ok
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {test.ok ? (
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">{test.name}</h4>
                            <div className="space-y-1 text-sm font-mono">
                              <div className="flex gap-2">
                                <span className="text-gray-700 font-semibold">Project:</span>
                                <code className="text-gray-900">{test.projectId}</code>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-gray-700 font-semibold">URL:</span>
                                <code className="text-gray-900 text-xs break-all">{test.url}</code>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-gray-700 font-semibold">Status:</span>
                                <code className={`${test.ok ? 'text-green-700' : 'text-red-700'} font-bold`}>
                                  {test.status}
                                </code>
                              </div>
                              {test.data && (
                                <div className="mt-2">
                                  <span className="text-gray-700 font-semibold">Response:</span>
                                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-48">
                                    {typeof test.data === 'string' ? test.data : JSON.stringify(test.data, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {test.error && (
                                <div className="mt-2">
                                  <span className="text-red-700 font-semibold">Error:</span>
                                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto text-red-900">
                                    {test.error}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Analysis */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Analysis & Recommendations
                    </h4>
                    <div className="space-y-2 text-sm text-amber-900">
                      {connectionTest.figmaMakeConfig.projectId !== connectionTest.currentEnvironment.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] && (
                        <div className="p-3 bg-white rounded border border-amber-300">
                          <p className="font-semibold mb-1">⚠️ Configuration Mismatch Detected</p>
                          <p className="text-xs">
                            Figma Make is configured to use project <code className="bg-amber-100 px-1 rounded">{connectionTest.figmaMakeConfig.projectId}</code> 
                            {' '}but your environment selector is pointing to a different project.
                          </p>
                        </div>
                      )}
                      
                      {!connectionTest.connectionTests[0].ok && (
                        <div className="p-3 bg-white rounded border border-red-300">
                          <p className="font-semibold mb-1 text-red-900">❌ Figma Make Project Not Connected</p>
                          <p className="text-xs text-red-800">
                            Deploy the Edge Function to project <code className="bg-red-100 px-1 rounded">{connectionTest.figmaMakeConfig.projectId}</code>
                          </p>
                        </div>
                      )}

                      {connectionTest.connectionTests[0].ok && (
                        <div className="p-3 bg-white rounded border border-green-300">
                          <p className="font-semibold mb-1 text-green-900">✅ Figma Make Project Connected</p>
                          <p className="text-xs text-green-800">
                            The Edge Function is deployed and responding on project {connectionTest.figmaMakeConfig.projectId}.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {!connectionTest && (
                <div className="text-center py-12 text-gray-500">
                  <Server className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Click "Run Test" to test backend connections</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Diagnostic Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#D91C81]" />
                    Data Diagnostic
                  </CardTitle>
                  <CardDescription>Check backend connectivity and data availability</CardDescription>
                </div>
                <Button
                  onClick={() => void runDataDiagnostic()}
                  disabled={isLoadingData}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
                  {isLoadingData ? 'Running...' : 'Run Diagnostic'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {dataCheck && (
                <>
                  {/* Environment Info */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Environment</h3>
                    <div className="space-y-2 font-mono text-sm">
                      <div><strong>Project ID:</strong> {dataCheck.environment.projectId}</div>
                      <div><strong>Base URL:</strong> {dataCheck.environment.baseUrl}</div>
                      <div><strong>Has Auth Token:</strong> {dataCheck.environment.hasToken ? '✅ Yes' : '❌ No'}</div>
                      {dataCheck.environment.hasToken && (
                        <div><strong>Token:</strong> {dataCheck.environment.token}</div>
                      )}
                    </div>
                  </div>

                  {/* Endpoint Results */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Endpoint Tests</h3>
                    <div className="space-y-4">
                      {Object.entries(dataCheck.endpoints).map(([name, result]: [string, any]) => (
                        <div key={name} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              {result.ok ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                              {name}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              result.ok 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.status || 'Network Error'}
                            </span>
                          </div>

                          {result.error && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                              <p className="text-sm text-red-800"><strong>Error:</strong> {result.error}</p>
                            </div>
                          )}

                          {result.data && (
                            <div className="bg-gray-50 rounded p-3 overflow-auto max-h-96">
                              <pre className="text-xs">{JSON.stringify(result.data, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">Quick Diagnosis</h3>
                        <div className="text-sm text-blue-800 space-y-1">
                          {!dataCheck.environment.hasToken && (
                            <p>⚠️ No auth token found. Please log in to admin first.</p>
                          )}
                          {dataCheck.endpoints['Health Check']?.ok === false && (
                            <p>❌ Backend is not responding. The function may not be deployed.</p>
                          )}
                          {dataCheck.endpoints['Health Check']?.ok && !dataCheck.endpoints['Get Clients']?.ok && (
                            <p>⚠️ Backend is running but authentication is failing. Check your credentials.</p>
                          )}
                          {dataCheck.endpoints['Get Clients']?.data?.clients?.length === 0 && (
                            <p>⚠️ Backend is working but database is empty. Run the reseed endpoint.</p>
                          )}
                          {dataCheck.endpoints['Get Clients']?.data?.clients?.length > 0 && (
                            <p>✅ Backend is working and has {dataCheck.endpoints['Get Clients'].data.clients.length} clients!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Box about Resources */}
                  <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FileText className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-cyan-900 mb-2">ℹ️ About the 11 Migrated Resources</h3>
                        <p className="text-sm text-cyan-800 mb-3">
                          Your backend supports <strong>11 different resource types</strong> with full CRUD operations:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs mb-3">
                          <div className="bg-white rounded px-2 py-1 border border-cyan-200">1. Clients</div>
                          <div className="bg-white rounded px-2 py-1 border border-cyan-200">2. Sites</div>
                          <div className="bg-white rounded px-2 py-1 border border-cyan-200">3. Gifts</div>
                          <div className="bg-white rounded px-2 py-1 border border-cyan-200">4. Orders</div>
                          <div className="bg-white rounded px-2 py-1 border border-cyan-200">5. Employees</div>
                          <div className="bg-white rounded px-2 py-1 border border-cyan-200">6. Admin Users</div>
                          <div className="bg-white rounded px-2 py-1 border border-cyan-200">7. Roles</div>
                          <div className="bg-white rounded px-2 py-1 border border-cyan-200">8. Access Groups</div>
                          <div className="bg-white rounded px-2 py-1 border border-cyan-200">9. Celebrations</div>
                          <div className="bg-white rounded px-2 py-1 border border-cyan-200">10. Email Templates</div>
                          <div className="bg-white rounded px-2 py-1 border border-cyan-200">11. Brands</div>
                        </div>
                        <p className="text-sm text-cyan-800">
                          The seed data creates <strong>4 sample clients</strong> along with associated sites, gifts, and other data.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reseed Button - Always visible */}
                  <div className="flex justify-center gap-4 pt-4">
                    <Button
                      onClick={() => void clearAllData()}
                      disabled={isClearing}
                      size="lg"
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold shadow-lg"
                    >
                      {isClearing ? (
                        <>
                          <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
                          Clearing...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          Clear All Data
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => void reseedDatabase()}
                      disabled={isSeeding}
                      size="lg"
                      className="bg-gradient-to-r from-[#D91C81] to-[#B01669] hover:from-[#B01669] hover:to-[#8B1352] text-white font-semibold shadow-lg"
                    >
                      {isSeeding ? (
                        <>
                          <Database className="w-5 h-5 mr-2 animate-spin" />
                          Reseeding...
                        </>
                      ) : (
                        <>
                          <Database className="w-5 h-5 mr-2" />
                          Reseed Database with Test Data
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              {!dataCheck && (
                <>
                  {/* Prominent Seed Button Before Running Diagnostic */}
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-[#D91C81] rounded-xl p-8 text-center">
                    <Database className="w-16 h-16 text-[#D91C81] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Seed Test Data</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Click below to populate the database with sample clients, sites, gifts, employees, and test data.
                    </p>
                    <Button
                      onClick={() => void reseedDatabase()}
                      disabled={isSeeding}
                      size="lg"
                      className="bg-gradient-to-r from-[#D91C81] to-[#B01669] hover:from-[#B01669] hover:to-[#8B1352] text-white font-bold shadow-xl text-lg px-8 py-6 h-auto"
                    >
                      {isSeeding ? (
                        <>
                          <Database className="w-6 h-6 mr-3 animate-spin" />
                          Seeding Database...
                        </>
                      ) : (
                        <>
                          <Database className="w-6 h-6 mr-3" />
                          🎉 Seed Test Data Now
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-500 mt-4">
                      This will create 4 clients, 7 sites, and all supporting test data
                    </p>
                  </div>
                  
                  <div className="text-center py-8 text-gray-500 border-t">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Or click "Run Diagnostic" above to check existing data first</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* JWT Token Tab */}
        <TabsContent value="jwt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D91C81]" />
                JWT Token Diagnostic
              </CardTitle>
              <CardDescription>Check the validity and details of the JWT token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Button
                  onClick={() => void runJWTDiagnostic()}
                  disabled={isCheckingJWT}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isCheckingJWT ? 'animate-spin' : ''}`} />
                  {isCheckingJWT ? 'Checking...' : 'Run Diagnostic'}
                </Button>
              </div>

              {jwtDiagnostic && (
                <>
                  {/* JWT Diagnostic Results */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">JWT Diagnostic Results</h3>
                    
                    <div
                      className={`p-4 border rounded-lg ${
                        jwtDiagnostic.tokenExists
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {jwtDiagnostic.tokenExists ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2">JWT Token Status</h4>
                          <div className="space-y-1 text-sm font-mono">
                            <div className="flex gap-2">
                              <span className="text-gray-700 font-semibold">Token Exists:</span>
                              <code className="text-gray-900">{jwtDiagnostic.tokenExists ? 'Yes' : 'No'}</code>
                            </div>
                            {jwtDiagnostic.tokenExists && (
                              <>
                                <div className="flex gap-2">
                                  <span className="text-gray-700 font-semibold">Algorithm:</span>
                                  <code className="text-gray-900">{jwtDiagnostic.tokenInfo.algorithm}</code>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-700 font-semibold">Type:</span>
                                  <code className="text-gray-900">{jwtDiagnostic.tokenInfo.type}</code>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-700 font-semibold">User ID:</span>
                                  <code className="text-gray-900">{jwtDiagnostic.tokenInfo.userId}</code>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-700 font-semibold">Email:</span>
                                  <code className="text-gray-900">{jwtDiagnostic.tokenInfo.email}</code>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-700 font-semibold">Username:</span>
                                  <code className="text-gray-900">{jwtDiagnostic.tokenInfo.username}</code>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-700 font-semibold">Role:</span>
                                  <code className="text-gray-900">{jwtDiagnostic.tokenInfo.role}</code>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-700 font-semibold">Environment:</span>
                                  <code className="text-gray-900">{jwtDiagnostic.tokenInfo.environment}</code>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-700 font-semibold">Issued At:</span>
                                  <code className="text-gray-900">{jwtDiagnostic.tokenInfo.issuedAt}</code>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-700 font-semibold">Expires At:</span>
                                  <code className="text-gray-900">{jwtDiagnostic.tokenInfo.expiresAt}</code>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-700 font-semibold">Expired:</span>
                                  <code className="text-gray-900">{jwtDiagnostic.tokenInfo.expired ? 'Yes' : 'No'}</code>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-700 font-semibold">Time Left (minutes):</span>
                                  <code className="text-gray-900">{jwtDiagnostic.tokenInfo.timeLeft}</code>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Backend Verification */}
                    {jwtDiagnostic.backendVerification && (
                      <div
                        className={`p-4 border rounded-lg ${
                          jwtDiagnostic.backendVerification.verified
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {jwtDiagnostic.backendVerification.verified ? (
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">Backend Verification</h4>
                            <div className="space-y-1 text-sm font-mono">
                              <div className="flex gap-2">
                                <span className="text-gray-700 font-semibold">Message:</span>
                                <code className={`${jwtDiagnostic.backendVerification.verified ? 'text-green-700' : 'text-red-700'} font-bold`}>
                                  {jwtDiagnostic.backendVerification.message}
                                </code>
                              </div>
                              {jwtDiagnostic.backendVerification.decoded && (
                                <div className="mt-2">
                                  <span className="text-gray-700 font-semibold">Decoded Token:</span>
                                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-48">
                                    {JSON.stringify(jwtDiagnostic.backendVerification.decoded, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {jwtDiagnostic.backendVerification.verifyError && (
                                <div className="mt-2">
                                  <span className="text-red-700 font-semibold">Verification Error:</span>
                                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto text-red-900">
                                    {jwtDiagnostic.backendVerification.verifyError}
                                  </pre>
                                </div>
                              )}
                              {jwtDiagnostic.backendVerification.verifiedPayload && (
                                <div className="mt-2">
                                  <span className="text-green-700 font-semibold">Verified Payload:</span>
                                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
                                    {JSON.stringify(jwtDiagnostic.backendVerification.verifiedPayload, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Backend Verification Error */}
                    {jwtDiagnostic.backendVerificationError && (
                      <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">Backend Verification Error</h4>
                            <div className="space-y-1 text-sm">
                              <p className="text-red-800">
                                Failed to call backend verification endpoint: {jwtDiagnostic.backendVerificationError}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Health Check */}
                    {jwtDiagnostic.healthCheck && (
                      <div
                        className={`p-4 border rounded-lg ${
                          jwtDiagnostic.healthCheck.ok
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {jwtDiagnostic.healthCheck.ok ? (
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">Health Check</h4>
                            <div className="space-y-1 text-sm font-mono">
                              <div className="flex gap-2">
                                <span className="text-gray-700 font-semibold">Status:</span>
                                <code className={`${jwtDiagnostic.healthCheck.ok ? 'text-green-700' : 'text-red-700'} font-bold`}>
                                  {jwtDiagnostic.healthCheck.status}
                                </code>
                              </div>
                              {jwtDiagnostic.healthCheck.data && (
                                <div className="mt-2">
                                  <span className="text-gray-700 font-semibold">Response:</span>
                                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-48">
                                    {typeof jwtDiagnostic.healthCheck.data === 'string' ? jwtDiagnostic.healthCheck.data : JSON.stringify(jwtDiagnostic.healthCheck.data, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {jwtDiagnostic.healthCheck.error && (
                                <div className="mt-2">
                                  <span className="text-red-700 font-semibold">Error:</span>
                                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto text-red-900">
                                    {jwtDiagnostic.healthCheck.error}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Protected Endpoint */}
                    {jwtDiagnostic.protectedEndpoint && (
                      <div
                        className={`p-4 border rounded-lg ${
                          jwtDiagnostic.protectedEndpoint.ok
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {jwtDiagnostic.protectedEndpoint.ok ? (
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">Protected Endpoint</h4>
                            <div className="space-y-1 text-sm font-mono">
                              <div className="flex gap-2">
                                <span className="text-gray-700 font-semibold">Status:</span>
                                <code className={`${jwtDiagnostic.protectedEndpoint.ok ? 'text-green-700' : 'text-red-700'} font-bold`}>
                                  {jwtDiagnostic.protectedEndpoint.status}
                                </code>
                              </div>
                              {jwtDiagnostic.protectedEndpoint.data && (
                                <div className="mt-2">
                                  <span className="text-gray-700 font-semibold">Response:</span>
                                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-48">
                                    {typeof jwtDiagnostic.protectedEndpoint.data === 'string' ? jwtDiagnostic.protectedEndpoint.data : JSON.stringify(jwtDiagnostic.protectedEndpoint.data, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {jwtDiagnostic.protectedEndpoint.error && (
                                <div className="mt-2">
                                  <span className="text-red-700 font-semibold">Error:</span>
                                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto text-red-900">
                                    {jwtDiagnostic.protectedEndpoint.error}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!jwtDiagnostic && (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Click "Run Diagnostic" to check JWT token details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DeveloperTools;