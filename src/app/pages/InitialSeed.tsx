import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  LogIn, 
  Sparkles,
  Lock
} from 'lucide-react';
import { publicAnonKey } from '../../../utils/supabase/info';
import { useNavigate } from 'react-router';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

interface SeedResult {
  success: boolean;
  data?: {
    message?: string;
    error?: string;
    hint?: string;
    needsLogin?: boolean;
    credentials?: {
      email: string;
      password: string;
      note: string;
    };
  };
  error?: string;
  status?: number;
}

interface DemoSeedResult {
  success: boolean;
  data?: {
    created?: number;
    updated?: number;
    total?: number;
    error?: string;
  };
  error?: string;
  status?: number;
}

interface MigrationResult {
  success: boolean;
  data?: {
    totalMigrated?: number;
    migrations?: Array<{
      resource: string;
      migrated: number;
      message: string;
    }>;
    error?: string;
  };
  error?: string;
  status?: number;
}

interface ProductReseedResult {
  success: boolean;
  data?: {
    message?: string;
    cleared?: number;
    created?: number;
    error?: string;
  };
  error?: string;
  status?: number;
}

export function InitialSeed() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<DemoSeedResult | null>(null);
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [migrateResult, setMigrateResult] = useState<MigrationResult | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productResult, setProductResult] = useState<ProductReseedResult | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Debug token function
  const handleDebugToken = async () => {
    const env = getCurrentEnvironment();
    const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    const projectId = urlMatch ? urlMatch[1] : 'unknown';
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
    const token = sessionStorage.getItem('jala_access_token');

    // Security: Never log actual token values
    if (!token) {
      console.error('No token found in sessionStorage');
      alert('❌ No token found!\n\nYou need to log in first:\n1. Go to /admin/login\n2. Log in with admin@example.com / Admin123!\n3. Come back and try again');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/dev/debug-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`, // Supabase platform auth
          'X-Access-Token': token, // Our custom admin token
          'X-Environment-ID': env.id,
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`✅ Token is VALID!\n\nUser: ${data.payload.email}\nRole: ${data.payload.role}`);
      } else {
        alert(`❌ Token is INVALID!\n\nStatus: ${response.status}\nError: ${data.error || data.details}\n\nCheck the console for full logs.`);
      }
    } catch (error: unknown) {
      console.error('Debug token error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Network error: ${errorMessage}`);
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) {
      setAuthToken(token);
      setNeedsAuth(false);
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const env = getCurrentEnvironment();
      const response = await fetch(`${env.supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.supabaseAnonKey,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.access_token) {
        setAuthToken(data.access_token);
        localStorage.setItem('adminAccessToken', data.access_token);
        setNeedsAuth(false);
        setResult({
          success: true,
          data: { message: '✅ Logged in successfully! You can now reseed the database.' }
        });
      } else {
        setResult({
          success: false,
          error: data.error_description || 'Login failed'
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    setLoading(true);
    setResult(null);

    try {
      const env = getCurrentEnvironment();
      const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
      const projectId = urlMatch ? urlMatch[1] : 'unknown';
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

      // Try initial-seed first (for empty database)
      let response = await fetch(`${baseUrl}/dev/initial-seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let data = await response.json();

      // If database is already initialized, use reseed endpoint
      if (!response.ok && data.error?.includes('already initialized')) {
        setNeedsAuth(true);
        
        if (authToken) {
          // Try authenticated reseed
          response = await fetch(`${baseUrl}/dev/reseed`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
          });
          
          data = await response.json();
          
          if (!response.ok && response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('adminAccessToken');
            setAuthToken(null);
            setNeedsAuth(true);
            setResult({
              success: false,
              data: { 
                error: 'Session expired. Please log in again.',
                needsLogin: true
              }
            });
            setLoading(false);
            return;
          }
        } else {
          setResult({
            success: false,
            data: { 
              error: 'Database already initialized. Please log in to reseed.',
              needsLogin: true
            }
          });
          setLoading(false);
          return;
        }
      }

      setResult({
        success: response.ok,
        data,
        status: response.status,
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        status: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const seedDemoSites = async () => {
    setDemoLoading(true);
    setDemoResult(null);

    try {
      const env = getCurrentEnvironment();
      const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
      const projectId = urlMatch ? urlMatch[1] : 'unknown';
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

      const response = await fetch(`${baseUrl}/seed-demo-sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Environment-ID': env.id, // Pass environment ID
        },
      });

      const data = await response.json();

      setDemoResult({
        success: response.ok,
        data,
        status: response.status,
      });
    } catch (error: any) {
      setDemoResult({
        success: false,
        error: error.message,
        status: 0,
      });
    } finally {
      setDemoLoading(false);
    }
  };

  const reseedProducts = async () => {
    setProductLoading(true);
    setProductResult(null);

    try {
      const env = getCurrentEnvironment();
      const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
      const projectId = urlMatch ? urlMatch[1] : 'unknown';
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

      const response = await fetch(`${baseUrl}/dev/reseed-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Environment-ID': env.id,
        },
      });

      const data = await response.json();

      setProductResult({
        success: response.ok,
        data,
        status: response.status,
      });
    } catch (error: any) {
      setProductResult({
        success: false,
        error: error.message,
        status: 0,
      });
    } finally {
      setProductLoading(false);
    }
  };

  const migrateDatabase = async () => {
    setMigrateLoading(true);
    setMigrateResult(null);

    try {
      const env = getCurrentEnvironment();
      const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
      const projectId = urlMatch ? urlMatch[1] : 'unknown';
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

      // Get admin access token from sessionStorage (correct key!)
      const token = sessionStorage.getItem('jala_access_token');
      
      // Security: Never log token details in production
      if (!token) {
        setMigrateResult({
          success: false,
          data: { error: 'You must be logged in to the admin panel to run migrations. Please log in at /admin/login first.' },
          status: 401,
        });
        setMigrateLoading(false);
        return;
      }
      
      const response = await fetch(`${baseUrl}/dev/migrate-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`, // Supabase platform auth
          'X-Access-Token': token, // Our custom admin token
          'X-Environment-ID': env.id,
        },
      });

      const data = await response.json();

      setMigrateResult({
        success: response.ok,
        data,
        status: response.status,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMigrateResult({
        success: false,
        error: errorMessage,
        status: 0,
      });
    } finally {
      setMigrateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Database Seed Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#D91C81] to-[#1B2A5E] rounded-2xl mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {authToken ? 'Reseed Database' : 'Seed Database'}
            </h1>
            <p className="text-gray-600">
              {authToken 
                ? 'Clear and reseed your database with fresh sample data' 
                : 'Bootstrap your JALA 2 database with sample data'}
            </p>
          </div>

          {/* Login Required Section */}
          {needsAuth && !authToken && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Lock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-2">🔐 Authentication Required</p>
                    <p>The database has already been initialized. Please log in with your admin credentials to reseed the database.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={loading || !email || !password}
                  className="w-full bg-gradient-to-r from-[#D91C81] to-[#B01669] hover:from-[#B01669] hover:to-[#8B1254] text-white py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Logging In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Log In to Reseed
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Info Section */}
          {!result && !needsAuth && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">What does this do?</p>
                  <ul className="list-disc list-inside space-y-1">
                    {authToken ? (
                      <>
                        <li>Clears all existing clients, sites, and gifts</li>
                        <li>Preserves admin users and authentication</li>
                        <li>Seeds fresh sample data</li>
                        <li>Resets to default configuration</li>
                      </>
                    ) : (
                      <>
                        <li>Creates an admin user (admin@example.com / Admin123!)</li>
                        <li>Seeds sample clients, sites, and gifts</li>
                        <li>Sets up environment configurations</li>
                        <li>Prepares the system for immediate use</li>
                      </>
                    )}
                  </ul>
                  {authToken && (
                    <>
                      <p className="mt-3 font-semibold">⚠️ Warning:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>This will DELETE all existing data</li>
                        <li>Your admin user account will be preserved</li>
                        <li>Any custom configurations will be lost</li>
                        <li>This action cannot be undone</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!result && !needsAuth && (
            <Button
              onClick={seedDatabase}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D91C81] to-[#B01669] hover:from-[#B01669] hover:to-[#8B1254] text-white py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {authToken ? 'Reseeding Database...' : 'Seeding Database...'}
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  {authToken ? 'Reseed Database Now' : 'Seed Database Now'}
                </>
              )}
            </Button>
          )}

          {/* Success Result */}
          {result && result.success && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">
                      ✅ {authToken ? 'Database Reseeded Successfully!' : 'Database Seeded Successfully!'}
                    </h3>
                    <p className="text-sm text-green-800 mb-4">{result.data?.message}</p>
                    
                    {result.data?.credentials && (
                      <div className="bg-white border border-green-300 rounded-lg p-4 space-y-2">
                        <p className="font-semibold text-green-900">Admin Credentials:</p>
                        <div className="font-mono text-sm space-y-1">
                          <div><strong>Email:</strong> {result.data.credentials.email}</div>
                          <div><strong>Password:</strong> {result.data.credentials.password}</div>
                        </div>
                        <p className="text-xs text-green-700 mt-2">{result.data.credentials.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/admin/login')}
                  className="flex-1 bg-gradient-to-r from-[#D91C81] to-[#B01669] hover:from-[#B01669] hover:to-[#8B1254] text-white"
                >
                  {authToken ? 'Go to Admin Dashboard' : 'Go to Admin Login'}
                </Button>
                <Button
                  onClick={() => {
                    setResult(null);
                    setNeedsAuth(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Run Again
                </Button>
              </div>
            </div>
          )}

          {/* Error Result */}
          {result && !result.success && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">❌ Seeding Failed</h3>
                    {result.data?.error && (
                      <p className="text-sm text-red-800 mb-2">{result.data.error}</p>
                    )}
                    {result.data?.hint && (
                      <p className="text-sm text-red-700 mb-2">💡 {result.data.hint}</p>
                    )}
                    {result.error && (
                      <p className="text-sm text-red-800 mb-2">Network Error: {result.error}</p>
                    )}
                    
                    {result.data?.needsLogin && !authToken && (
                      <div className="mt-4">
                        <Button
                          onClick={() => {
                            setResult(null);
                            setNeedsAuth(true);
                          }}
                          className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Log In to Continue
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!result.data?.needsLogin && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setResult(null);
                      setNeedsAuth(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#D91C81] to-[#B01669] hover:from-[#B01669] hover:to-[#8B1254] text-white"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Demo Sites Seed Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00B4CC] to-[#1B2A5E] rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seed Demo Sites</h1>
            <p className="text-gray-600">
              Create 5 stakeholder demo sites for review
            </p>
          </div>

          {/* Info Section */}
          {!demoResult && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-2">What does this create?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Event Gifting - Serial Card Access</strong> - Conference attendee gifts with serial code validation</li>
                    <li><strong>Event Gifting - Ship to Store/Office</strong> - Regional office pickup with email validation</li>
                    <li><strong>Service Award</strong> - 5-year milestone with magic link</li>
                    <li><strong>Service Award with Celebrations</strong> - 10-year anniversary with team messages</li>
                    <li><strong>Employee Onboarding</strong> - Manager portal for new hire kits</li>
                  </ul>
                  <p className="mt-3 font-semibold">✨ Features:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Each site has custom branding, landing pages, and welcome messages</li>
                    <li>Sites can be viewed from the Stakeholder Review page</li>
                    <li>Perfect for demos and client presentations</li>
                    <li>Will NOT delete existing data - adds new demo sites only</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!demoResult && (
            <Button
              onClick={seedDemoSites}
              disabled={demoLoading}
              className="w-full bg-gradient-to-r from-[#00B4CC] to-[#1B2A5E] hover:from-[#008FA6] hover:to-[#0F1A3D] text-white py-6 text-lg"
            >
              {demoLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Demo Sites...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Demo Sites Now
                </>
              )}
            </Button>
          )}

          {/* Success Result */}
          {demoResult && demoResult.success && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Demo Sites Created Successfully!</h3>
                    <div className="text-sm text-green-800 space-y-2">
                      <p>Created: <strong>{demoResult.data?.created || 0}</strong> sites</p>
                      <p>Updated: <strong>{demoResult.data?.updated || 0}</strong> (already existed)</p>
                      <p>Total: <strong>{demoResult.data?.total || 5}</strong> demo sites</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/stakeholder-review')}
                  className="flex-1 bg-gradient-to-r from-[#00B4CC] to-[#1B2A5E] hover:from-[#008FA6] hover:to-[#0F1A3D] text-white"
                >
                  View Stakeholder Review
                </Button>
                <Button
                  onClick={() => setDemoResult(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Run Again
                </Button>
              </div>
            </div>
          )}

          {/* Error Result */}
          {demoResult && !demoResult.success && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">❌ Demo Site Seeding Failed</h3>
                    {demoResult.data?.error && (
                      <p className="text-sm text-red-800 mb-2">{demoResult.data.error}</p>
                    )}
                    {demoResult.error && (
                      <p className="text-sm text-red-800 mb-2">Network Error: {demoResult.error}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setDemoResult(null)}
                className="w-full bg-gradient-to-r from-[#00B4CC] to-[#1B2A5E] hover:from-[#008FA6] hover:to-[#0F1A3D] text-white"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Reseed Products Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reseed Product Catalog</h1>
            <p className="text-gray-600">
              Clear and refresh the gift catalog with default products
            </p>
          </div>

          {/* Info Section */}
          {!productResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-800">
                  <p className="font-semibold mb-2">What does this do?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Clears all existing products from the gift catalog</li>
                    <li>Reinitializes with 6 default demo products</li>
                    <li>Includes: headphones, smartwatch, coffee collection, spa set, knife set, speaker</li>
                    <li>Perfect for fixing catalog issues or starting fresh</li>
                  </ul>
                  <p className="mt-3 font-semibold">⚠️ Note:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Will DELETE all existing products in the catalog</li>
                    <li>Does not affect site configurations or client data</li>
                    <li>Sites will need to reconfigure gift assignments after reseeding</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!productResult && (
            <Button
              onClick={reseedProducts}
              disabled={productLoading}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white py-6 text-lg"
            >
              {productLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Reseeding Products...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Reseed Product Catalog
                </>
              )}
            </Button>
          )}

          {/* Success Result */}
          {productResult && productResult.success && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Product Catalog Reseeded Successfully!</h3>
                    <div className="text-sm text-green-800 space-y-2">
                      <p>{productResult.data?.message}</p>
                      <p>Cleared: <strong>{productResult.data?.cleared || 0}</strong> products</p>
                      <p>Created: <strong>{productResult.data?.created || 0}</strong> new products</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/admin/gift-management')}
                  className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white"
                >
                  View Gift Catalog
                </Button>
                <Button
                  onClick={() => setProductResult(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Run Again
                </Button>
              </div>
            </div>
          )}

          {/* Error Result */}
          {productResult && !productResult.success && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">❌ Product Reseed Failed</h3>
                    {productResult.data?.error && (
                      <p className="text-sm text-red-800 mb-2">{productResult.data.error}</p>
                    )}
                    {productResult.error && (
                      <p className="text-sm text-red-800 mb-2">Network Error: {productResult.error}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setProductResult(null)}
                className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Database Migration Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#D91C81] rounded-2xl mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Migrate Database Keys</h1>
            <p className="text-gray-600">
              Migrate old key patterns to new environment-aware schema
            </p>
          </div>

          {/* Info Section */}
          {!migrateResult && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-semibold mb-2">What does this do?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Migrates old key patterns (clients:, sites:) to new format (client:development:, site:development:)</li>
                    <li>Preserves all existing data during migration</li>
                    <li>Fixes issues where sites aren't showing in admin panel</li>
                    <li>Ensures compatibility with latest CRUD factory</li>
                  </ul>
                  <p className="mt-3 font-semibold">✅ Safe to run:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Will not delete any data</li>
                    <li>Only renames database keys to new format</li>
                    <li>Can be run multiple times safely</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!migrateResult && (
            <div className="space-y-3">
              <Button
                onClick={migrateDatabase}
                disabled={migrateLoading}
                className="w-full bg-gradient-to-r from-[#D91C81] to-[#B01669] hover:from-[#B01669] hover:to-[#8B1254] text-white py-6 text-lg"
              >
                {migrateLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Migrating Database...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Migrate Database Now
                  </>
                )}
              </Button>
              
              <button
                onClick={handleDebugToken}
                className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                🔍 Debug Token (Check if logged in)
              </button>
            </div>
          )}

          {/* Success Result */}
          {migrateResult && migrateResult.success && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Database Migration Successful!</h3>
                    <div className="text-sm text-green-800 space-y-2">
                      <p>Total Migrated: <strong>{migrateResult.data?.totalMigrated || 0}</strong> records</p>
                      {migrateResult.data?.migrations && migrateResult.data.migrations.length > 0 && (
                        <div className="mt-3">
                          <p className="font-semibold mb-1">Details:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {migrateResult.data.migrations.map((m: any, i: number) => (
                              <li key={i}>{m.resource}: {m.migrated} records - {m.message}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/admin/sites')}
                  className="flex-1 bg-gradient-to-r from-[#D91C81] to-[#B01669] hover:from-[#B01669] hover:to-[#8B1254] text-white"
                >
                  View Sites in Admin
                </Button>
                <Button
                  onClick={() => setMigrateResult(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Run Again
                </Button>
              </div>
            </div>
          )}

          {/* Error Result */}
          {migrateResult && !migrateResult.success && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">❌ Database Migration Failed</h3>
                    {migrateResult.data?.error && (
                      <p className="text-sm text-red-800 mb-2">{migrateResult.data.error}</p>
                    )}
                    {migrateResult.error && (
                      <p className="text-sm text-red-800 mb-2">Network Error: {migrateResult.error}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setMigrateResult(null)}
                className="w-full bg-gradient-to-r from-[#D91C81] to-[#B01669] hover:from-[#B01669] hover:to-[#8B1254] text-white"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help? Check the{' '}
            <button
              onClick={() => navigate('/admin/data-diagnostic')}
              className="text-[#D91C81] hover:underline font-semibold"
            >
              Data Diagnostic Tool
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}