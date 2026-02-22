import { useState } from 'react';
import { Shield, Server, Database, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { getCurrentEnvironment, getAvailableEnvironments } from '../../config/deploymentEnvironments';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

export function ConnectionTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const currentEnv = getCurrentEnvironment();
  const allEnvs = getAvailableEnvironments();

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: Record<string, unknown> = {
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
          'Authorization': `Bearer ${publicAnonKey}` // CRITICAL: Required for all Supabase Edge Function requests
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
    } catch (error: unknown) {
      results.connectionTests.push({
        name: 'Figma Make Project (from /utils/supabase/info.tsx)',
        projectId,
        url: figmaMakeUrl,
        status: 'error',
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error'
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
    } catch (error: unknown) {
      results.connectionTests.push({
        name: `Current Environment (${currentEnv.name})`,
        projectId: envProjectId,
        url: envUrl,
        status: 'error',
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Server className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backend Connection Diagnostics</h1>
            <p className="text-sm text-gray-600">Comprehensive environment and connection testing</p>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => void runDiagnostics()}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Running Tests...' : 'Run Full Diagnostics'}
          </button>
        </div>

        {/* Figma Make Configuration */}
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
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

        {/* Current Environment */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
              <code className="text-blue-900 bg-white px-2 py-1 rounded font-mono text-xs">{currentEnv.supabaseUrl}</code>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-700 font-semibold">Anon Key:</span>
              <code className="text-blue-900 bg-white px-2 py-1 rounded font-mono text-xs">{currentEnv.supabaseAnonKey.substring(0, 40)}...</code>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Connection Test Results</h3>
            
            {testResults.connectionTests.map((test: any, index: number) => (
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
                          <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
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

            {/* Analysis */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Analysis & Recommendations
              </h4>
              <div className="space-y-2 text-sm text-amber-900">
                {testResults.figmaMakeConfig.projectId !== testResults.currentEnvironment.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] && (
                  <div className="p-3 bg-white rounded border border-amber-300">
                    <p className="font-semibold mb-1">⚠️ Configuration Mismatch Detected</p>
                    <p className="text-xs">
                      Figma Make is configured to use project <code className="bg-amber-100 px-1 rounded">{testResults.figmaMakeConfig.projectId}</code> 
                      {' '}but your environment selector is pointing to a different project. 
                      Most API calls in the app will use the Figma Make project ({testResults.figmaMakeConfig.projectId}), 
                      not the environment selector project.
                    </p>
                  </div>
                )}
                
                {!testResults.connectionTests[0].ok && (
                  <div className="p-3 bg-white rounded border border-red-300">
                    <p className="font-semibold mb-1 text-red-900">❌ Figma Make Project Not Connected</p>
                    <p className="text-xs text-red-800">
                      Deploy the Edge Function to project <code className="bg-red-100 px-1 rounded">{testResults.figmaMakeConfig.projectId}</code>:
                    </p>
                    <pre className="mt-2 p-2 bg-gray-900 text-gray-100 rounded text-xs overflow-auto">
cd ~/JALA2-backend-dev && supabase functions deploy make-server-6fcaeea3 --project-ref {testResults.figmaMakeConfig.projectId}
                    </pre>
                  </div>
                )}

                {testResults.connectionTests[0].ok && (
                  <div className="p-3 bg-white rounded border border-green-300">
                    <p className="font-semibold mb-1 text-green-900">✅ Figma Make Project Connected</p>
                    <p className="text-xs text-green-800">
                      The Edge Function is deployed and responding on project {testResults.figmaMakeConfig.projectId}.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Raw Debug Data */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                Show Full Diagnostic Data (JSON)
              </summary>
              <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {!testResults && (
          <div className="text-center py-12 text-gray-500">
            <Server className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Click "Run Full Diagnostics" to test backend connections</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectionTest;