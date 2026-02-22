import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

export function QuickAuthCheck() {
  const [authData, setAuthData] = useState<any>(null);
  const [kvData, setKvData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Use the new public endpoint that checks both Auth and KV in one call
      console.warn('[QuickAuthCheck] Fetching auth status...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/public/check-auth-status`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`, // CRITICAL: Supabase requires this for ALL requests
            'X-Environment-ID': 'development',
          },
        }
      );

      console.warn('[QuickAuthCheck] Response status:', response.status);
      console.warn('[QuickAuthCheck] Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[QuickAuthCheck] Endpoint error:', errorText);
        throw new Error(`Failed to check auth status (status ${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.warn('[QuickAuthCheck] Result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to check auth status');
      }

      // Transform the response to match our component's expectations
      setAuthData({
        totalUsers: result.supabaseAuth.totalUsers,
        allUsers: result.supabaseAuth.allUsers
      });

      setKvData({
        kvAdminCount: result.kvStore.totalAdmins,
        kvAdmins: result.kvStore.admins
      });
    } catch (error: unknown) {
      console.error('Auth check error:', error);
      setError(error instanceof Error ? error.message : 'Failed to check auth');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-800">{error}</p>
          <button
            onClick={() => void checkAuth()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasAuthUsers = authData?.totalUsers > 0;
  const hasKvUsers = kvData?.kvAdminCount > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Status Check
          </h1>
          <p className="text-gray-600 mb-6">
            This page shows the current state of admin users in Supabase Auth and KV Store.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Supabase Auth */}
            <div className={`border-2 rounded-lg p-4 ${hasAuthUsers ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                {hasAuthUsers ? '✅' : '❌'} Supabase Auth
              </h2>
              <p className="text-lg font-semibold mb-3">
                {authData?.totalUsers || 0} user(s) found
              </p>

              {authData?.allUsers && authData.allUsers.length > 0 ? (
                <div className="space-y-2">
                  <p className="font-medium text-gray-700">Login Credentials:</p>
                  {authData.allUsers.map((user: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border text-sm">
                      <p className="font-mono font-bold text-blue-600">{user.email}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  <p className="text-sm text-gray-600 mt-3 italic">
                    ⬆️ Use one of these emails to login
                  </p>
                </div>
              ) : (
                <p className="text-red-600 font-medium">
                  No users exist in Supabase Auth. You cannot login!
                </p>
              )}
            </div>

            {/* KV Store */}
            <div className={`border-2 rounded-lg p-4 ${hasKvUsers ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                {hasKvUsers ? '✅' : '⚠️'} KV Store
              </h2>
              <p className="text-lg font-semibold mb-3">
                {kvData?.kvAdminCount || 0} admin(s) found
              </p>

              {kvData?.kvAdmins && kvData.kvAdmins.length > 0 ? (
                <div className="space-y-2">
                  <p className="font-medium text-gray-700">Admin Records:</p>
                  {kvData.kvAdmins.map((admin: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border text-sm">
                      <p className="font-bold">{admin.username || 'No username'}</p>
                      <p className="font-mono text-gray-600">{admin.email}</p>
                      <p className="text-xs text-gray-500">{admin.role || 'No role'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No admin metadata in KV store
                </p>
              )}
            </div>
          </div>

          {/* Diagnosis */}
          <div className="mt-6 p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">🔍 Diagnosis</h3>
            
            {!hasAuthUsers && !hasKvUsers && (
              <div className="text-red-800">
                <p className="font-bold">❌ NO USERS EXIST ANYWHERE</p>
                <p className="mt-2">You need to create an admin user. Go to <code className="bg-white px-2 py-1 rounded">/admin/bootstrap</code> to create the first admin.</p>
              </div>
            )}

            {!hasAuthUsers && hasKvUsers && (
              <div className="text-orange-800">
                <p className="font-bold">⚠️ MISMATCH: KV records exist but NO Supabase Auth users</p>
                <p className="mt-2">The admin user metadata exists in KV store, but the actual user accounts don't exist in Supabase Auth.</p>
                <p className="mt-2 font-semibold">Solution: Go to <code className="bg-white px-2 py-1 rounded">/admin/bootstrap</code> to create matching Supabase Auth accounts.</p>
              </div>
            )}

            {hasAuthUsers && !hasKvUsers && (
              <div className="text-yellow-800">
                <p className="font-bold">⚠️ MISMATCH: Supabase Auth users exist but NO KV metadata</p>
                <p className="mt-2">User accounts exist in Supabase Auth, but admin metadata is missing from KV store.</p>
                <p className="mt-2 font-semibold">This usually isn't critical, but metadata will be created on first successful login.</p>
              </div>
            )}

            {hasAuthUsers && hasKvUsers && (
              <div className="text-green-800">
                <p className="font-bold">✅ USERS EXIST IN BOTH SYSTEMS</p>
                <p className="mt-2">If login is failing, the password is incorrect.</p>
                <p className="mt-2 font-semibold">Try these emails:</p>
                <ul className="mt-2 space-y-1">
                  {authData?.allUsers?.map((user: any, index: number) => (
                    <li key={index} className="font-mono bg-white px-3 py-2 rounded">
                      {user.email}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm">Default password is usually: <code className="bg-white px-2 py-1 rounded font-mono">Admin123!</code></p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => void checkAuth()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
            <a
              href="/admin/login"
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Go to Login
            </a>
            <a
              href="/admin/bootstrap"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Create Admin User
            </a>
          </div>
        </div>

        {/* Raw Data */}
        <details className="bg-white rounded-lg shadow-lg p-6">
          <summary className="cursor-pointer font-bold text-gray-900">
            Show Raw Data
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-bold mb-2">Auth Data:</h3>
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(authData, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-bold mb-2">KV Data:</h3>
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(kvData, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default QuickAuthCheck;