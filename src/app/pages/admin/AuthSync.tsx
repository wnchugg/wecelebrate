import { useState } from 'react';
import { AlertTriangle, Check, X, RefreshCw, Key, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

export default function AuthSync() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);

  const checkAuthStatus = async () => {
    setChecking(true);
    setStatus(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/public/check-auth-status`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setChecking(false);
    }
  };

  const syncAdminAuth = async () => {
    if (!confirm('This will create Supabase Auth accounts for any admin users that are missing them. Continue?')) {
      return;
    }

    setLoading(true);
    setSyncResult(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/debug/sync-admin-auth`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      setSyncResult(data);
      
      // Refresh status after sync
      if (data.success) {
        setTimeout(() => checkAuthStatus(), 1000);
      }
    } catch (error) {
      console.error('Failed to sync admin auth:', error);
      setSyncResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Authentication Sync</h1>
        <p className="text-gray-600 mt-1">
          Diagnose and fix authentication issues by syncing KV store admin users with Supabase Auth
        </p>
      </div>

      {/* Warning Alert */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Use this tool if you're getting "Invalid login credentials" errors.</strong>
          <br />
          This occurs when admin users exist in the database but not in Supabase Auth.
        </AlertDescription>
      </Alert>

      {/* Check Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D91C81]" />
            Check Authentication Status
          </CardTitle>
          <CardDescription>
            View current state of admin users in KV store and Supabase Auth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => void checkAuthStatus()}
            disabled={checking}
            className="bg-[#00B4CC] hover:bg-[#0099B3] text-white"
          >
            {checking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Check Status
              </>
            )}
          </Button>

          {status && (
            <div className="space-y-3">
              {status.success ? (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Supabase Auth</h3>
                    <p className="text-blue-700">Total Users: {status.supabaseAuth.totalUsers}</p>
                    {status.supabaseAuth.allUsers.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {status.supabaseAuth.allUsers.map((user: any) => (
                          <div key={user.id} className="text-sm text-blue-600">
                            • {user.email}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">KV Store</h3>
                    <p className="text-purple-700">Total Admins: {status.kvStore.totalAdmins}</p>
                    {status.kvStore.admins.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {status.kvStore.admins.map((admin: any) => (
                          <div key={admin.id} className="text-sm text-purple-600">
                            • {admin.username} ({admin.email}) - {admin.role}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {status.supabaseAuth.totalUsers !== status.kvStore.totalAdmins && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Mismatch detected!</strong> KV store has {status.kvStore.totalAdmins} admins but Supabase Auth has {status.supabaseAuth.totalUsers} users.
                        Use the sync tool below to fix this.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <X className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Error: {status.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#D91C81]" />
            Sync Admin Users to Supabase Auth
          </CardTitle>
          <CardDescription>
            Create Supabase Auth accounts for any admin users that are missing them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => void syncAdminAuth()}
            disabled={loading}
            className="bg-[#D91C81] hover:bg-[#B01669] text-white"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>

          {syncResult && (
            <div className="space-y-3">
              {syncResult.success ? (
                <>
                  <Alert className="border-green-200 bg-green-50">
                    <Check className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Success!</strong> {syncResult.message}
                    </AlertDescription>
                  </Alert>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Sync Results</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{syncResult.results.checked}</div>
                        <div className="text-xs text-gray-600">Checked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{syncResult.results.synced}</div>
                        <div className="text-xs text-gray-600">Synced</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{syncResult.results.skipped}</div>
                        <div className="text-xs text-gray-600">Skipped</div>
                      </div>
                    </div>

                    {syncResult.results.details.map((detail: any, idx: number) => (
                      <div key={idx} className="mb-2 p-3 bg-white border border-gray-200 rounded">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{detail.email}</div>
                            <div className="text-sm text-gray-600">{detail.username}</div>
                          </div>
                          <div className={`flex items-center gap-1 text-sm font-medium ${
                            detail.status === 'synced' ? 'text-green-600' :
                            detail.status === 'error' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {detail.status === 'synced' && <Check className="w-4 h-4" />}
                            {detail.status === 'error' && <X className="w-4 h-4" />}
                            {detail.status}
                          </div>
                        </div>
                        {detail.tempPassword && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                            <Key className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div className="flex-1 text-sm">
                              <div className="font-semibold text-yellow-800">Temporary Password:</div>
                              <code className="text-yellow-900 bg-yellow-100 px-2 py-1 rounded">{detail.tempPassword}</code>
                              <div className="text-xs text-yellow-700 mt-1">
                                Use this password to log in. You'll be prompted to change it.
                              </div>
                            </div>
                          </div>
                        )}
                        {detail.error && (
                          <div className="mt-1 text-sm text-red-600">{detail.error}</div>
                        )}
                        {detail.reason && detail.status !== 'synced' && (
                          <div className="mt-1 text-sm text-gray-600">{detail.reason}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <X className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Error: {syncResult.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
