import { useState } from 'react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

export function LoginDiagnostic() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const runDiagnostic = async () => {
    setIsLoading(true);
    setError('');
    setDiagnosticData(null);

    try {
      console.warn('[LoginDiagnostic] Starting diagnostic...');
      console.warn('[LoginDiagnostic] Project ID:', projectId);
      
      // Call the debug/check-admin-users endpoint
      console.warn('[LoginDiagnostic] Calling /debug/check-admin-users...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/debug/check-admin-users`,
        {
          headers: {
            'X-Environment-ID': 'development',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      // Parse response with error handling
      let data;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError: any) {
        throw new Error(`Failed to parse response: ${jsonError.message}. Response may not be valid JSON.`);
      }
      
      console.warn('[LoginDiagnostic] Diagnostic result:', data);

      if (!response.ok) {
        console.error('Diagnostic response not OK:', response.status, data);
        throw new Error(data.error || data.message || `Diagnostic failed with status ${response.status}`);
      }

      setDiagnosticData(data);
    } catch (error: unknown) {
      console.error('Diagnostic error:', error);
      setError(`${error instanceof Error ? error.message : 'Failed to run diagnostic'}\n\nCheck the browser console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Login Diagnostic Tool
          </h1>
          <p className="text-gray-600 mb-6">
            This tool checks for mismatches between KV store admin users and Supabase Auth users.
          </p>

          <button
            onClick={() => void runDiagnostic()}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Running Diagnostic...' : 'Run Diagnostic'}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {diagnosticData && (
            <div className="mt-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="font-bold text-blue-900 mb-2">Status</h2>
                <p className="text-blue-800">
                  {diagnosticData.status === 'success' ? '✅ Success' : '❌ Error'}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Environment: {diagnosticData.environment || 'development'}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h2 className="font-bold text-gray-900 mb-2">
                  KV Store Admin Users ({diagnosticData.kvAdminCount || 0})
                </h2>
                {diagnosticData.kvAdmins && diagnosticData.kvAdmins.length > 0 ? (
                  <div className="space-y-2">
                    {diagnosticData.kvAdmins.map((admin: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <p className="text-sm">
                          <strong>Email:</strong> {admin.email}
                        </p>
                        <p className="text-sm">
                          <strong>Username:</strong> {admin.username || 'N/A'}
                        </p>
                        <p className="text-sm">
                          <strong>Role:</strong> {admin.role || 'N/A'}
                        </p>
                        <p className="text-sm">
                          <strong>In Supabase Auth:</strong> {admin.inSupabaseAuth}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No admin users in KV store</p>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="font-bold text-green-900 mb-2">
                  Supabase Auth Users ({diagnosticData.authUserCount || 0})
                </h2>
                {diagnosticData.authUsers && diagnosticData.authUsers.length > 0 ? (
                  <div className="space-y-2">
                    {diagnosticData.authUsers.map((user: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <p className="text-sm">
                          <strong>Email:</strong> {user.email}
                        </p>
                        <p className="text-sm">
                          <strong>ID:</strong> {user.id}
                        </p>
                        <p className="text-sm">
                          <strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm">
                          <strong>In KV Store:</strong> {user.inKVStore}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No users in Supabase Auth</p>
                )}
              </div>

              {diagnosticData.syncIssues && (diagnosticData.syncIssues.orphanedKV > 0 || diagnosticData.syncIssues.missingKV > 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h2 className="font-bold text-yellow-900 mb-2">⚠️ Sync Issues Found</h2>
                  
                  {diagnosticData.syncIssues.orphanedKVUsers && diagnosticData.syncIssues.orphanedKVUsers.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-yellow-800 mb-1">
                        Orphaned KV Users ({diagnosticData.syncIssues.orphanedKV}):
                      </p>
                      {diagnosticData.syncIssues.orphanedKVUsers.map((user: any, index: number) => (
                        <div key={index} className="text-sm text-yellow-700 ml-4">
                          • {user.email} - {user.issue}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {diagnosticData.syncIssues.missingKVUsers && diagnosticData.syncIssues.missingKVUsers.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-yellow-800 mb-1">
                        Missing KV Users ({diagnosticData.syncIssues.missingKV}):
                      </p>
                      {diagnosticData.syncIssues.missingKVUsers.map((user: any, index: number) => (
                        <div key={index} className="text-sm text-yellow-700 ml-4">
                          • {user.email} - {user.issue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {diagnosticData.recommendation && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h2 className="font-bold text-purple-900 mb-2">💡 Recommendation</h2>
                  <p className="text-purple-800 text-sm">
                    {diagnosticData.recommendation}
                  </p>
                </div>
              )}

              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <h2 className="font-bold text-cyan-900 mb-2">ℹ️ About the 11 Migrated Resources</h2>
                <p className="text-cyan-800 text-sm mb-3">
                  The "11 migrated resources" refers to 11 different <strong>types of data</strong> that were migrated to the factory pattern, not 11 clients. The backend supports full CRUD operations for these resource types:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div className="bg-white rounded p-2 border border-cyan-200">
                    <span className="font-semibold">1.</span> Clients
                  </div>
                  <div className="bg-white rounded p-2 border border-cyan-200">
                    <span className="font-semibold">2.</span> Sites
                  </div>
                  <div className="bg-white rounded p-2 border border-cyan-200">
                    <span className="font-semibold">3.</span> Gifts
                  </div>
                  <div className="bg-white rounded p-2 border border-cyan-200">
                    <span className="font-semibold">4.</span> Orders
                  </div>
                  <div className="bg-white rounded p-2 border border-cyan-200">
                    <span className="font-semibold">5.</span> Employees
                  </div>
                  <div className="bg-white rounded p-2 border border-cyan-200">
                    <span className="font-semibold">6.</span> Admin Users
                  </div>
                  <div className="bg-white rounded p-2 border border-cyan-200">
                    <span className="font-semibold">7.</span> Roles
                  </div>
                  <div className="bg-white rounded p-2 border border-cyan-200">
                    <span className="font-semibold">8.</span> Access Groups
                  </div>
                  <div className="bg-white rounded p-2 border border-cyan-200">
                    <span className="font-semibold">9.</span> Celebrations
                  </div>
                  <div className="bg-white rounded p-2 border border-cyan-200">
                    <span className="font-semibold">10.</span> Email Templates
                  </div>
                  <div className="bg-white rounded p-2 border border-cyan-200">
                    <span className="font-semibold">11.</span> Brands
                  </div>
                </div>
                <p className="text-cyan-800 text-sm mt-3">
                  The seed data creates <strong>4 clients</strong>, multiple sites, gifts, and other sample data for testing.
                </p>
              </div>

              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <h2 className="font-bold text-gray-900 mb-2">Raw Data</h2>
                <pre className="text-xs overflow-auto bg-white p-3 rounded max-h-96">
                  {JSON.stringify(diagnosticData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginDiagnostic;