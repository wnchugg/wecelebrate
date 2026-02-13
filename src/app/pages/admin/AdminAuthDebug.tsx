import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { getAccessToken } from '../../utils/api';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * AdminAuthDebug - Debug authentication state
 * Navigate to /admin/auth-debug to use
 */
export function AdminAuthDebug() {
  const adminContext = useAdmin();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    setToken(getAccessToken());
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(c => c + 1);
  };

  const handleClearAndRedirect = () => {
    // Clear token and redirect to login
    localStorage.removeItem('jala_access_token');
    sessionStorage.removeItem('jala_access_token');
    window.location.href = '/admin/login';
  };

  const handleGoToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Auth Debug</h1>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B71569] transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="space-y-6">
            {/* Authentication Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Is Authenticated:</span>
                  <span className="flex items-center gap-2">
                    {adminContext.isAdminAuthenticated ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 font-medium">Yes</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-600 font-medium">No</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Is Loading:</span>
                  <span className="flex items-center gap-2">
                    {adminContext.isLoading ? (
                      <>
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-600 font-medium">Yes (This might cause refresh loop!)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 font-medium">No</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Has Token:</span>
                  <span className="flex items-center gap-2">
                    {token ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 font-medium">Yes</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-600 font-medium">No</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
              {adminContext.adminUser ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Username:</span>
                    <span className="font-medium text-gray-900">{adminContext.adminUser.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Email:</span>
                    <span className="font-medium text-gray-900">{adminContext.adminUser.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Role:</span>
                    <span className="font-medium text-gray-900">{adminContext.adminUser.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">User ID:</span>
                    <span className="font-mono text-sm text-gray-900">{adminContext.adminUser.id}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No user data available</p>
              )}
            </div>

            {/* Token Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Token Information</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Token in Storage:</span>
                  <span className="font-medium text-gray-900">{token ? 'Yes' : 'No'}</span>
                </div>
                {token && (
                  <div className="mt-2">
                    <span className="text-gray-700 block mb-2">Token Preview:</span>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs text-gray-900 break-all">
                      {token.substring(0, 50)}...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Diagnostic Info */}
            <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Common Issues
              </h2>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Refresh Loop:</strong> If "Is Loading" stays "Yes", the AdminLayoutWrapper will keep showing loading screen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>No Token:</strong> If token is missing but isAuthenticated is true, there's a state mismatch</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Token Present but Not Auth:</strong> The session check might be failing</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleGoToDashboard}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Go To Dashboard
              </button>
              <button
                onClick={handleClearAndRedirect}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Clear Token & Reload
              </button>
            </div>
          </div>
        </div>

        {/* Raw State Dump */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Raw State (JSON)</h2>
          <pre className="text-green-400 font-mono text-xs overflow-auto max-h-96">
            {JSON.stringify({
              adminUser: adminContext.adminUser,
              isAdminAuthenticated: adminContext.isAdminAuthenticated,
              isLoading: adminContext.isLoading,
              accessToken: adminContext.accessToken ? 'present' : 'null',
              tokenInStorage: token ? 'present' : 'null'
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default AdminAuthDebug;
