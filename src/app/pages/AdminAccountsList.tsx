import { useState, useEffect } from 'react';
import { Users, RefreshCw, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';

interface AdminAccount {
  email: string;
  role: string;
  username: string;
  created: string;
}

export default function AdminAccountsList() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
      const response = await fetch(`${baseUrl}/dev/list-admins`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAdmins(data.admins || []);
      } else {
        setError(data.error || 'Failed to fetch admin accounts');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'admin':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'manager':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'client_admin':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D91C81] to-[#B71569] p-6">
          <div className="flex items-center gap-3 text-white">
            <Users className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Admin Accounts</h1>
              <p className="text-white/90 text-sm">Available admin accounts for testing and development</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Default Admin Info Banner */}
          <div className="mb-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-emerald-900 mb-2">Default Super Admin Account</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between bg-white/50 rounded px-3 py-2">
                    <span className="font-medium text-gray-700">Email:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-emerald-700 font-mono">admin@example.com</code>
                      <button
                        onClick={() => copyToClipboard('admin@example.com')}
                        className="p-1 hover:bg-emerald-200 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/50 rounded px-3 py-2">
                    <span className="font-medium text-gray-700">Password:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-emerald-700 font-mono">Admin123!</code>
                      <button
                        onClick={() => copyToClipboard('Admin123!')}
                        className="p-1 hover:bg-emerald-200 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">All Admin Accounts</h2>
            <button
              onClick={() => void fetchAdmins()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B71569] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900 mb-1">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-[#D91C81] animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Loading admin accounts...</p>
            </div>
          )}

          {/* Admin Accounts List */}
          {!loading && !error && admins.length > 0 && (
            <div className="space-y-3">
              {admins.map((admin, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{admin.username}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getRoleBadgeColor(admin.role)}`}>
                          {admin.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{admin.email}</span>
                        <button
                          onClick={() => copyToClipboard(admin.email)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(admin.created).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && admins.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No admin accounts found</p>
              <p className="text-sm text-gray-500 mt-1">
                The database may need to be seeded
              </p>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <a
              href="/admin/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white rounded-lg hover:shadow-lg transition-all"
            >
              Go to Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
