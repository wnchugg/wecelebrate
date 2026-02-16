import { useState } from 'react';
import { logger } from '../../utils/logger';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { toast } from 'sonner';
import { Shield, Database, RefreshCw, CheckCircle, XCircle, AlertCircle, Search, User } from 'lucide-react';

export function AdminLoginDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testResult, setTestResult] = useState('');

  const checkAdmins = async () => {
    setIsLoading(true);
    setError('');
    setAdmins([]);

    try {
      const env = getCurrentEnvironment();
      const projectId = env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/admin/check`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Environment-ID': env.id,
            'Authorization': `Bearer ${env.supabaseAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.warn('Admin check response:', data);
        if (data.admins && data.admins.length > 0) {
          setAdmins(data.admins);
          toast.success(`Found ${data.admins.length} admin account(s)`);
        } else {
          setError('No admin accounts found. You need to create one first.');
        }
      } else {
        setError(data.error || 'Failed to check admin accounts');
      }
    } catch (error: unknown) {
      console.error('Error checking admins:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      console.warn('[Debug Test] Testing login with:', { email: testEmail });

      const env = getCurrentEnvironment();
      const envProjectId = env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];

      const response = await fetch(`https://${envProjectId}.supabase.co/functions/v1/make-server-6fcaeea3/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      const data = await response.json();
      console.warn('[Debug Test] Response:', { status: response.status, data });

      if (response.ok && data.token) {
        setTestResult(`✅ SUCCESS!\\n\\nToken received: ${data.token.substring(0, 20)}...\\nUser: ${data.user?.email || 'N/A'}`);
        toast.success('Login test successful!');
      } else {
        setTestResult(`❌ FAILED\\n\\nStatus: ${response.status}\\nError: ${data.error || 'Unknown error'}\\n\\nResponse: ${JSON.stringify(data, null, 2)}`);
        toast.error(data.error || 'Login failed');
      }
    } catch (error: unknown) {
      console.error('[Debug Test] Error:', error);
      setTestResult(`❌ EXCEPTION: ${error instanceof Error ? error.message : 'Unknown error'}\\n\\nCheck browser console for full details.`);
      toast.error('Login test threw an exception');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#D91C81] to-[#00B4CC] p-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Search className="w-6 h-6" />
              Admin Login Debugger
            </h1>
            <p className="text-white/90 mt-2">Debug admin accounts and test login credentials</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Check Admins Section */}
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Step 1: Check Admin Accounts
              </h2>
              <p className="text-gray-600 mb-4">
                First, let's see what admin accounts exist in the database.
              </p>
              <button
                onClick={checkAdmins}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Check Admin Accounts
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              {admins.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="font-semibold text-green-700 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Found {admins.length} Admin Account{admins.length !== 1 ? 's' : ''}:
                  </p>
                  {admins.map((admin, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Username:</span>{' '}
                          <span className="text-gray-900 font-mono">{admin.username}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Email:</span>{' '}
                          <span className="text-gray-900 font-mono">{admin.email}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Role:</span>{' '}
                          <span className="text-gray-900">{admin.role}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">ID:</span>{' '}
                          <span className="text-gray-900 font-mono text-xs">{admin.id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Test Login Section */}
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Step 2: Test Login Credentials
              </h2>
              <p className="text-gray-600 mb-4">
                Enter the credentials you're trying to use and test if they work.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="admin@example.com or username"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                  />
                </div>

                <button
                  onClick={handleTestLogin}
                  disabled={isLoading || !testEmail || !testPassword}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#00B4CC] to-[#0090A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Test Login
                    </>
                  )}
                </button>

                {testResult && (
                  <div className={`mt-4 rounded-lg p-4 ${testResult.startsWith('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <pre className="text-sm whitespace-pre-wrap font-mono">{testResult}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Debugging Tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">1.</span>
                  <span>Open your browser's Developer Console (F12) to see detailed logs from both frontend and backend</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">2.</span>
                  <span>Check that the email/username from Step 1 matches exactly what you're entering (case-insensitive)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">3.</span>
                  <span>Make sure you're using the password you set when creating the account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">4.</span>
                  <span>You can login with either the email address OR the username</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">5.</span>
                  <span>Check the backend logs in Supabase Dashboard → Edge Functions → Logs for detailed error messages</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center space-y-2">
          <a
            href="/admin/login"
            className="inline-block text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            ← Back to Login Page
          </a>
        </div>
      </div>
    </div>
  );
}