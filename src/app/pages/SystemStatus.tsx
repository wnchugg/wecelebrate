import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Database, Key, User, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

export function SystemStatus() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setLoading(true);
    
    interface BackendCheck {
      reachable: boolean;
      hasData: boolean;
      sitesCount?: number;
      error?: string;
    }
    
    const checks: {
      timestamp: string;
      environment: {
        current: string;
        available: string[];
      };
      auth: {
        hasToken: boolean;
        tokenPreview?: string;
      };
      backend: BackendCheck;
      localStorage: {
        keys: string[];
        size: number;
      };
    } = {
      timestamp: new Date().toISOString(),
      environment: {
        current: localStorage.getItem('jala_environment') || 'production',
        available: ['production', 'development'],
      },
      auth: {
        hasToken: !!localStorage.getItem('admin_access_token'),
        tokenPreview: localStorage.getItem('admin_access_token')?.substring(0, 20) + '...',
      },
      backend: {
        reachable: false,
        hasData: false,
      },
      localStorage: {
        keys: Object.keys(localStorage),
        size: JSON.stringify(localStorage).length,
      },
    };

    // Check backend
    try {
      const env = getCurrentEnvironment();
      const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
      const projectId = urlMatch ? urlMatch[1] : 'unknown';
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

      const response = await fetch(`${baseUrl}/public/sites`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.supabaseAnonKey}`,
          'X-Environment-ID': env.id
        }
      });

      checks.backend.reachable = response.ok;
      if (response.ok) {
        const data = await response.json();
        checks.backend.hasData = data.sites && data.sites.length > 0;
        checks.backend.sitesCount = data.sites?.length || 0;
      } else {
        checks.backend.error = await response.text();
      }
    } catch (error: any) {
      checks.backend.error = error.message;
    }

    setStatus(checks);
    setLoading(false);
  };

  const clearAuth = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    checkSystemStatus();
  };

  const switchEnvironment = (env: string) => {
    localStorage.setItem('jala_environment', env);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-[#D91C81] mx-auto mb-4" />
          <p className="text-gray-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">JALA 2 System Status</h1>
              <p className="text-gray-600">Diagnostic & Quick Actions</p>
            </div>
            <Button onClick={() => void checkSystemStatus()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Environment */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Current Environment
                </h3>
                <Badge className="bg-blue-600 text-white">
                  {status.environment.current.toUpperCase()}
                </Badge>
                <p className="text-sm text-blue-800 mt-2">
                  {status.environment.current === 'development' 
                    ? '🔧 Using Development Supabase (wjfcqqrlhwdvvjmefxky)'
                    : '🚀 Using Production Supabase (lmffeqwhrnbsbhdztwyv)'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={status.environment.current === 'production' ? 'default' : 'outline'}
                  onClick={() => switchEnvironment('production')}
                >
                  Production
                </Button>
                <Button
                  size="sm"
                  variant={status.environment.current === 'development' ? 'default' : 'outline'}
                  onClick={() => switchEnvironment('development')}
                >
                  Development
                </Button>
              </div>
            </div>
          </div>

          {/* Backend Status */}
          <div className={`border rounded-xl p-6 mb-6 ${
            status.backend.reachable 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              {status.backend.reachable ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={status.backend.reachable ? 'text-green-900' : 'text-red-900'}>
                Backend Connection
              </span>
            </h3>
            
            {status.backend.reachable ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span>Backend is reachable</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  {status.backend.hasData ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Database has data ({status.backend.sitesCount} sites found)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-orange-800">Database is empty - needs seeding</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-800">Cannot reach backend server</p>
                {status.backend.error && (
                  <pre className="text-xs bg-red-100 p-3 rounded overflow-auto text-red-900">
                    {status.backend.error}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Auth Status */}
          <div className={`border rounded-xl p-6 ${
            status.auth.hasToken
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Key className="w-5 h-5" />
              <span className={status.auth.hasToken ? 'text-green-900' : 'text-gray-900'}>
                Admin Authentication
              </span>
            </h3>
            
            {status.auth.hasToken ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span>Admin token exists</span>
                </div>
                <div className="text-xs font-mono bg-green-100 p-3 rounded text-green-900">
                  {status.auth.tokenPreview}
                </div>
                <Button onClick={clearAuth} variant="destructive" size="sm">
                  Clear Token & Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Not logged in</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!status.backend.hasData && (
              <Button
                onClick={() => void navigate('/initial-seed')}
                className="w-full bg-gradient-to-r from-[#D91C81] to-[#B01669] hover:from-[#B01669] hover:to-[#8B1254] text-white justify-start h-auto py-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-5 h-5" />
                    <span className="font-semibold">Initial Database Seed</span>
                  </div>
                  <p className="text-xs opacity-90">Bootstrap empty database with sample data</p>
                </div>
              </Button>
            )}
            
            <Button
              onClick={() => void navigate('/admin/login')}
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-5 h-5" />
                  <span className="font-semibold">Admin Login</span>
                </div>
                <p className="text-xs text-gray-600">Access admin dashboard</p>
              </div>
            </Button>
            
            <Button
              onClick={() => void navigate('/admin/data-diagnostic')}
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Data Diagnostic</span>
                </div>
                <p className="text-xs text-gray-600">Comprehensive backend testing</p>
              </div>
            </Button>
            
            <Button
              onClick={() => void navigate('/validation-test')}
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">P1.4 Validation Tests</span>
                </div>
                <p className="text-xs text-gray-600">Run automated post-cleanup tests</p>
              </div>
            </Button>
            
            <Button
              onClick={() => void navigate('/performance-test')}
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">P1.5 Performance Monitor</span>
                </div>
                <p className="text-xs text-gray-600">View optimization metrics and Web Vitals</p>
              </div>
            </Button>
            
            <Button
              onClick={() => void navigate('/')}
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Public Landing Page</span>
                </div>
                <p className="text-xs text-gray-600">View public gifting site</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-gray-900 rounded-xl p-6 text-gray-100">
          <h3 className="font-semibold mb-3 text-white">Debug Information</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}