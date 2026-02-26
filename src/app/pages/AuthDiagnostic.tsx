import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

export default function AuthDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = () => {
    const env = getCurrentEnvironment();
    
    // Check anon key format
    const anonKey = env.supabaseAnonKey;
    const isJWT = anonKey.split('.').length === 3;
    
    let decodedHeader = null;
    let decodedPayload = null;
    
    if (isJWT) {
      try {
        const parts = anonKey.split('.');
        decodedHeader = JSON.parse(atob(parts[0]));
        decodedPayload = JSON.parse(atob(parts[1]));
      } catch (e) {
        // Ignore decode errors
      }
    }

    setDiagnostics({
      environment: {
        id: env.id,
        name: env.name,
        url: env.supabaseUrl,
      },
      anonKey: {
        exists: !!anonKey,
        isPlaceholder: anonKey.includes('REPLACE'),
        length: anonKey.length,
        preview: anonKey.substring(0, 30) + '...' + anonKey.substring(anonKey.length - 10),
        isValidJWT: isJWT,
        header: decodedHeader,
        payload: decodedPayload,
      },
      info: {
        projectId,
        publicAnonKey: publicAnonKey.substring(0, 30) + '...' + publicAnonKey.substring(publicAnonKey.length - 10),
      },
      envVars: {
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set',
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not set',
      }
    });
  };

  const testConnection = async () => {
    setTesting(true);
    const env = getCurrentEnvironment();
    
    interface TestResult {
      name: string;
      url: string;
      status: number;
      ok?: boolean;
      data?: unknown;
      error?: string;
    }
    
    const results: {
      tests: TestResult[];
    } = {
      tests: []
    };

    // Test 1: Health check with Authorization header
    const healthUrl = `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/health`;
    try {
      const response = await fetch(healthUrl, {
        headers: {
          'Authorization': `Bearer ${env.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        }
      });

      results.tests.push({
        name: 'Health Check with Authorization',
        url: healthUrl,
        status: response.status,
        ok: response.ok,
        data: await response.text().catch(() => 'Could not read body'),
      } as TestResult);
    } catch (error: any) {
      results.tests.push({
        name: 'Health Check with Authorization',
        url: healthUrl,
        status: 0,
        error: error.message,
      } as TestResult);
    }

    // Test 2: Try with publicAnonKey directly
    const healthUrl2 = `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/health`;
    try {
      const response = await fetch(healthUrl2, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        }
      });

      results.tests.push({
        name: 'Health Check with publicAnonKey from info.tsx',
        url: healthUrl2,
        status: response.status,
        ok: response.ok,
        data: await response.text().catch(() => 'Could not read body'),
      } as TestResult);
    } catch (error: any) {
      results.tests.push({
        name: 'Health Check with publicAnonKey',
        url: healthUrl2,
        status: 0,
        error: error.message,
      } as TestResult);
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">🔍 Authentication Diagnostics</h1>
          <p className="text-gray-600 mb-4">
            This page helps diagnose the "Invalid JWT (401)" error by showing exactly what credentials are being used.
          </p>
        </div>

        {/* Diagnostics */}
        {diagnostics && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Environment</h3>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                  <div>ID: {diagnostics.environment.id}</div>
                  <div>Name: {diagnostics.environment.name}</div>
                  <div>URL: {diagnostics.environment.url}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Anon Key Status</h3>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Exists:</span>
                    <span className={diagnostics.anonKey.exists ? 'text-green-600' : 'text-red-600'}>
                      {diagnostics.anonKey.exists ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Is Placeholder:</span>
                    <span className={diagnostics.anonKey.isPlaceholder ? 'text-red-600' : 'text-green-600'}>
                      {diagnostics.anonKey.isPlaceholder ? '❌ Yes (NEEDS TO BE REPLACED)' : '✅ No'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Length:</span>
                    <span>{diagnostics.anonKey.length} chars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Valid JWT Format:</span>
                    <span className={diagnostics.anonKey.isValidJWT ? 'text-green-600' : 'text-red-600'}>
                      {diagnostics.anonKey.isValidJWT ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Preview:</span>
                    <div className="mt-1 break-all text-xs">{diagnostics.anonKey.preview}</div>
                  </div>
                  
                  {diagnostics.anonKey.isValidJWT && diagnostics.anonKey.payload && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="font-semibold mb-1">JWT Payload:</div>
                      <div className="text-xs">
                        <div>Issuer: {diagnostics.anonKey.payload.iss}</div>
                        <div>Project Ref: {diagnostics.anonKey.payload.ref}</div>
                        <div>Role: {diagnostics.anonKey.payload.role}</div>
                        <div>Expires: {new Date(diagnostics.anonKey.payload.exp * 1000).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">From /utils/supabase/info</h3>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                  <div>Project ID: {diagnostics.info.projectId}</div>
                  <div className="break-all text-xs">Anon Key: {diagnostics.info.publicAnonKey}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Environment Variables</h3>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                  <div>VITE_SUPABASE_ANON_KEY: {diagnostics.envVars.VITE_SUPABASE_ANON_KEY}</div>
                  <div>VITE_SUPABASE_URL: {diagnostics.envVars.VITE_SUPABASE_URL}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Connection Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          <button
            onClick={() => void testConnection()}
            disabled={testing}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {testing ? 'Testing...' : 'Test Connection to Backend'}
          </button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            <div className="space-y-4">
              {testResults.tests.map((test: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{test.name}</span>
                    {test.ok && <span className="text-green-600">✅ Success</span>}
                    {test.failed && <span className="text-red-600">❌ Failed</span>}
                    {!test.ok && !test.failed && test.status && (
                      <span className="text-red-600">❌ {test.status} {test.statusText}</span>
                    )}
                  </div>
                  
                  {test.url && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">URL:</span> {test.url}
                    </div>
                  )}
                  
                  {test.error && (
                    <div className="bg-red-50 p-2 rounded text-sm text-red-600 mb-2">
                      <span className="font-semibold">Error:</span> {test.error}
                    </div>
                  )}
                  
                  {test.body && (
                    <div className="bg-gray-50 p-2 rounded text-sm font-mono break-all">
                      <span className="font-semibold">Response:</span> {test.body}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {diagnostics && diagnostics.anonKey.isPlaceholder && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-yellow-900 mb-2">⚠️ Action Required</h2>
            <p className="text-yellow-800 mb-4">
              Your anon key is still a placeholder ("REPLACE_WITH_DEV_ANON_KEY"). This needs to be updated with the real key.
            </p>
            <div className="bg-white p-4 rounded">
              <h3 className="font-semibold mb-2">The system should be using this key from /utils/supabase/info.tsx:</h3>
              <code className="text-xs break-all block bg-gray-50 p-2 rounded">
                {publicAnonKey}
              </code>
              <p className="text-sm text-gray-600 mt-2">
                This key is properly configured and should work. The issue is that the environment configuration
                is falling back to a placeholder instead of using this key.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}