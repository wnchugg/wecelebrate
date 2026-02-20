import { useState, useEffect } from 'react';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import { projectId } from '../../../utils/supabase/info';

export function JWTDebug() {
  const [jwtConfig, setJwtConfig] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkJWT() {
      try {
        const env = getCurrentEnvironment();
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/debug-jwt-config`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Environment-ID': env.id,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setJwtConfig(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkJWT();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking JWT configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1B2A5E] mb-2">JWT Configuration Debugger</h1>
        <p className="text-gray-600 mb-8">Diagnose JWT authentication issues</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {jwtConfig && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-[#1B2A5E] mb-4">Backend JWT Configuration</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Project ID (Backend)</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{jwtConfig.jwtConfig?.projectId || 'NOT_FOUND'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Project ID</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{jwtConfig.jwtConfig?.expectedProjectId}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Project ID Match</p>
                <p className={`font-semibold ${jwtConfig.jwtConfig?.projectIdMatches ? 'text-green-600' : 'text-red-600'}`}>
                  {jwtConfig.jwtConfig?.projectIdMatches ? '✓ Match' : '✗ Mismatch - THIS WILL CAUSE AUTH FAILURES!'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Secret Source</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded">{jwtConfig.jwtConfig?.secretSource}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Secret Length</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded">{jwtConfig.jwtConfig?.secretLength}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Secret Preview (first 50 chars)</p>
                <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">{jwtConfig.jwtConfig?.secretPreview}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Supabase URL</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded break-all">{jwtConfig.jwtConfig?.supabaseUrl}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Crypto Key Available</p>
                <p className={`font-semibold ${jwtConfig.jwtConfig?.cryptoKeyAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {jwtConfig.jwtConfig?.cryptoKeyAvailable ? '✓ Yes' : '✗ No'}
                </p>
              </div>
            </div>

            {jwtConfig.note && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{jwtConfig.note}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#1B2A5E] mb-4">Frontend Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Project ID (Frontend)</p>
              <p className="font-mono text-sm bg-gray-50 p-2 rounded">{projectId}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Current Environment</p>
              <p className="font-mono text-sm bg-gray-50 p-2 rounded">{getCurrentEnvironment().name} ({getCurrentEnvironment().id})</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Environment Supabase URL</p>
              <p className="font-mono text-sm bg-gray-50 p-2 rounded break-all">{getCurrentEnvironment().supabaseUrl}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>What this means:</strong></p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>If "Project ID Match" shows ✗ Mismatch, JWT tokens will fail to verify</li>
            <li>The backend derives its JWT secret from the SUPABASE_URL environment variable</li>
            <li>Tokens signed with one project ID cannot be verified with a different project ID's secret</li>
            <li>Frontend and backend must use the same project ID for authentication to work</li>
          </ul>
        </div>
      </div>
    </div>
  );
}