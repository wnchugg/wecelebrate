import { useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, Wrench, Users, Database } from 'lucide-react';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/errorHandling';
import { logger } from '../../utils/logger';
import { apiRequest } from '../../utils/api';

export function DiagnosticTools() {
  const [isChecking, setIsChecking] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [checkResults, setCheckResults] = useState<any>(null);
  const [repairResults, setRepairResults] = useState<any>(null);
  
  const currentEnv = getCurrentEnvironment();
  const baseUrl = `https://${currentEnv.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}.supabase.co/functions/v1/make-server-6fcaeea3`;

  const checkAdminUsers = async () => {
    setIsChecking(true);
    setCheckResults(null);
    
    try {
      const response = await fetch(`${baseUrl}/debug/check-admin-users`, {
        headers: {
          'X-Environment-ID': currentEnv.id,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check admin users');
      }
      
      setCheckResults(data);
      logger.log('[Diagnostic] Check results:', data);
      
      if (data.syncIssues?.orphanedKV > 0 || data.syncIssues?.missingKV > 0) {
        showErrorToast(
          new Error(`Found ${data.syncIssues.orphanedKV + data.syncIssues.missingKV} sync issues`),
          { operation: 'diagnostic' }
        );
      } else {
        showSuccessToast('All users are properly synced!');
      }
    } catch (error: unknown) {
      logger.error('[Diagnostic] Check error:', error);
      showErrorToast(error, { operation: 'diagnostic-check' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleRepairAdminUsers = async () => {
    if (!window.confirm('This will attempt to repair admin user data. Continue?')) {
      return;
    }

    setIsRepairing(true);
    try {
      const response = await apiRequest('/admin/repair-users', { method: 'POST', body: JSON.stringify({}) }) as any;
      
      if (response.repaired > 0) {
        showSuccessToast(
          'Users Repaired',
          `Successfully repaired ${response.repaired} admin user records`
        );
      } else {
        showInfoToast('No Repairs Needed', 'All admin users are already in sync');
      }

      // Re-check after repair
      setTimeout(() => {
        checkAdminUsers();
      }, 1000);
    } catch (error: unknown) {
      logger.error('[Diagnostic] Repair error:', error);
      showErrorToast(error, { operation: 'diagnostic-repair' });
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">🔧 Admin User Diagnostic Tools</h1>
            <p className="text-white/90 text-sm">Check and repair admin user sync issues</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Info Banner */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm mb-1">
                    What This Tool Does
                  </p>
                  <p className="text-xs text-blue-800">
                    This diagnostic tool checks if your admin users are properly synced between the KV store (metadata) 
                    and Supabase Auth (password verification). If they're out of sync, you won't be able to login.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => void checkAdminUsers()}
                disabled={isChecking}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isChecking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Check Admin Users
                  </>
                )}
              </button>

              <button
                onClick={() => void handleRepairAdminUsers()}
                disabled={isRepairing || !checkResults}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRepairing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Repairing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Repair Sync Issues
                  </>
                )}
              </button>
            </div>

            {/* Check Results */}
            {checkResults && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Diagnostic Results
                </h2>

                {/* Summary */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-semibold mb-1">KV Store Users</p>
                    <p className="text-2xl font-bold text-blue-900">{checkResults.kvAdminCount}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-semibold mb-1">Supabase Auth Users</p>
                    <p className="text-2xl font-bold text-purple-900">{checkResults.authUserCount}</p>
                  </div>
                  <div className={`${checkResults.syncIssues.orphanedKV + checkResults.syncIssues.missingKV > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
                    <p className={`text-sm font-semibold mb-1 ${checkResults.syncIssues.orphanedKV + checkResults.syncIssues.missingKV > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Sync Issues
                    </p>
                    <p className={`text-2xl font-bold ${checkResults.syncIssues.orphanedKV + checkResults.syncIssues.missingKV > 0 ? 'text-red-900' : 'text-green-900'}`}>
                      {checkResults.syncIssues.orphanedKV + checkResults.syncIssues.missingKV}
                    </p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`${checkResults.syncIssues.orphanedKV + checkResults.syncIssues.missingKV > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-xl p-4`}>
                  <div className="flex items-start gap-3">
                    {checkResults.syncIssues.orphanedKV + checkResults.syncIssues.missingKV > 0 ? (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold text-sm mb-1 ${checkResults.syncIssues.orphanedKV + checkResults.syncIssues.missingKV > 0 ? 'text-red-900' : 'text-green-900'}`}>
                        Recommendation
                      </p>
                      <p className={`text-xs ${checkResults.syncIssues.orphanedKV + checkResults.syncIssues.missingKV > 0 ? 'text-red-800' : 'text-green-800'}`}>
                        {checkResults.recommendation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Orphaned KV Users (in KV but not in Auth - CANNOT LOGIN) */}
                {checkResults.syncIssues.orphanedKV > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      ❌ Orphaned Users (Cannot Login - {checkResults.syncIssues.orphanedKV})
                    </h3>
                    <p className="text-xs text-red-700 mb-3">
                      These users exist in the KV store but NOT in Supabase Auth. They cannot login because password verification fails.
                    </p>
                    <div className="space-y-2">
                      {checkResults.syncIssues.orphanedKVUsers.map((user: any) => (
                        <div key={user.id} className="bg-white rounded-lg p-3 border border-red-300">
                          <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                          <p className="text-xs text-gray-600">Username: {user.username}</p>
                          <p className="text-xs text-red-600 mt-1">{user.issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing KV Users (in Auth but not in KV) */}
                {checkResults.syncIssues.missingKV > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-yellow-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      ⚠️ Missing Metadata ({checkResults.syncIssues.missingKV})
                    </h3>
                    <p className="text-xs text-yellow-700 mb-3">
                      These users exist in Supabase Auth but are missing metadata in the KV store.
                    </p>
                    <div className="space-y-2">
                      {checkResults.syncIssues.missingKVUsers.map((user: any) => (
                        <div key={user.id} className="bg-white rounded-lg p-3 border border-yellow-300">
                          <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                          <p className="text-xs text-yellow-600 mt-1">{user.issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Users List */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">All Admin Users</h3>
                  <div className="space-y-2">
                    {checkResults.kvAdmins.map((user: any) => (
                      <div key={user.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                            <p className="text-xs text-gray-600">Username: {user.username} | Role: {user.role}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">In Supabase Auth:</span>
                            <span className="text-lg">{user.inSupabaseAuth}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Repair Results */}
            {repairResults && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 text-sm mb-1">Repair Complete</p>
                    <p className="text-xs text-green-800 mb-3">{repairResults.summary}</p>
                    
                    {repairResults.removed > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-green-900 mb-1">Removed ({repairResults.removed}):</p>
                        <ul className="list-disc list-inside text-xs text-green-800">
                          {repairResults.removedUsers.map((user: any) => (
                            <li key={user.id}>{user.email} - {user.reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {repairResults.repaired > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-900 mb-1">Added ({repairResults.repaired}):</p>
                        <ul className="list-disc list-inside text-xs text-green-800">
                          {repairResults.repairedUsers.map((user: any) => (
                            <li key={user.id}>{user.email} - {user.reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="text-center space-y-2">
          <p className="text-white/90 text-sm">
            <a href="/admin/login" className="text-white font-semibold hover:underline">
              ← Back to Login
            </a>
          </p>
          <p className="text-white/70 text-xs">
            <a href="/admin/bootstrap" className="text-white/90 hover:underline">
              Create New Admin Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DiagnosticTools;