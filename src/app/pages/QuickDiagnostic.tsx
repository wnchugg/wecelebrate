import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function QuickDiagnostic() {
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/health`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text}`);
        }

        const data = await response.json();
        setHealthData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking backend health...</p>
        </div>
      </div>
    );
  }

  const jwtIssue = healthData?.jwtConfig && !healthData.jwtConfig.projectIdMatches;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-[#1B2A5E] mb-2">Quick Diagnostic</h1>
          <p className="text-gray-600 mb-6">Backend Health & JWT Configuration</p>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-red-800 mb-1">Connection Error</h2>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {jwtIssue && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-red-800 mb-2">⚠️ JWT Configuration Issue Detected!</h2>
              <p className="text-red-700 mb-4">
                The backend's project ID does not match the expected development project. 
                This is causing all JWT tokens to fail verification, which results in 401 errors.
              </p>
              <div className="bg-white rounded p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Backend Project ID:</span>
                  <span className="font-mono">{healthData.jwtConfig.projectId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Expected Project ID:</span>
                  <span className="font-mono text-green-600">{healthData.jwtConfig.expectedProjectId}</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-900 font-semibold mb-2">Solution:</p>
                <p className="text-sm text-blue-800">
                  The backend needs to be deployed to the development Supabase project (wjfcqqrlhwdvvjmefxky), 
                  or the JWT_SECRET environment variable needs to be set explicitly to match the project where 
                  the backend is actually running.
                </p>
              </div>
            </div>
          )}

          {healthData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1B2A5E] mb-3 border-b pb-2">Backend Status</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 font-semibold ${healthData.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                      {healthData.status === 'ok' ? '✓ Running' : '✗ Error'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Database:</span>
                    <span className={`ml-2 font-semibold ${healthData.database ? 'text-green-600' : 'text-red-600'}`}>
                      {healthData.database ? '✓ Connected' : '✗ Disconnected'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Response Time:</span>
                    <span className="ml-2 font-mono">{healthData.responseTime}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Version:</span>
                    <span className="ml-2 font-mono">{healthData.version}</span>
                  </div>
                </div>
              </div>

              {healthData.jwtConfig && (
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2A5E] mb-3 border-b pb-2">JWT Configuration</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Project ID Match:</span>
                      <span className={`font-bold ${healthData.jwtConfig.projectIdMatches ? 'text-green-600' : 'text-red-600'}`}>
                        {healthData.jwtConfig.projectIdMatches ? '✓ Match' : '✗ Mismatch'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Backend Project ID:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {healthData.jwtConfig.projectId}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Expected Project ID:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {healthData.jwtConfig.expectedProjectId}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Secret Source:</span>
                      <span className="font-mono text-xs">
                        {healthData.jwtConfig.secretSource}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Has Explicit Secret:</span>
                      <span className={`font-semibold ${healthData.jwtConfig.hasExplicitSecret ? 'text-green-600' : 'text-yellow-600'}`}>
                        {healthData.jwtConfig.hasExplicitSecret ? 'Yes' : 'No (using derived)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Secret Length:</span>
                      <span className="font-mono">{healthData.jwtConfig.secretLength}</span>
                    </div>
                  </div>
                </div>
              )}

              {healthData.deployment && (
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2A5E] mb-3 border-b pb-2">Deployment Info</h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Supabase Project:</span>
                      <span className="ml-2 font-mono text-xs">{healthData.deployment.supabaseProject}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Supabase URL:</span>
                      <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1 break-all">
                        {healthData.deployment.supabaseUrl}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Has Service Role Key:</span>
                      <span className={`ml-2 font-semibold ${healthData.deployment.hasServiceRoleKey ? 'text-green-600' : 'text-red-600'}`}>
                        {healthData.deployment.hasServiceRoleKey ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold text-[#1B2A5E] mb-2">Frontend Configuration</h3>
            <div className="text-sm space-y-1">
              <div>
                <span className="text-gray-600">Frontend Project ID:</span>
                <span className="ml-2 font-mono text-xs">{projectId}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <a
              href="/admin/login"
              className="px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B71869] transition-colors"
            >
              Go to Admin Login
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}