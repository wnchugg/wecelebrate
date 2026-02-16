import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getCurrentEnvironment, buildApiUrl } from '../config/deploymentEnvironments';

export function InitializeDatabase() {
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; credentials?: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInitialSeed = async () => {
    setIsSeeding(true);
    setError(null);
    setResult(null);

    try {
      const env = getCurrentEnvironment();
      const apiUrl = buildApiUrl(env);

      console.warn('Calling initial seed endpoint...');
      
      const response = await fetch(`${apiUrl}/dev/initial-seed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.supabaseAnonKey}`,
          'X-Environment-ID': env.id,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
        console.warn('Database seeded successfully:', data);
      } else {
        setError(data.error || 'Failed to seed database');
        console.error('Seed failed:', data);
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
      console.error('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D91C81] to-[#B71569] rounded-2xl mb-4">
              <Database className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Initialize Database
            </h1>
            <p className="text-gray-600">
              Set up your JALA 2 platform with demo data and admin account
            </p>
          </div>

          {/* Status Messages */}
          {result && result.success && (
            <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">Database Initialized Successfully!</h3>
                  <p className="text-green-700 text-sm mb-4">{result.message}</p>
                  
                  {result.credentials && (
                    <div className="bg-white border border-green-200 rounded-lg p-4 space-y-2">
                      <p className="font-semibold text-gray-900 text-sm mb-2">Admin Credentials:</p>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                          <span className="text-gray-600">Email:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-900">
                            {result.credentials.email}
                          </code>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-gray-600">Password:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-900">
                            {result.credentials.password}
                          </code>
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {result.credentials.note}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => navigate('/admin')}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Go to Admin Login
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Go to Homepage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-2">Already Initialized</h3>
                  <p className="text-amber-700 text-sm mb-3">{error}</p>
                  <p className="text-sm text-amber-700 mb-4">
                    If you need to reset the database, please login as admin and use the reseed functionality.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/admin')}
                      className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                    >
                      Go to Admin Login
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Go to Homepage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!result && !error && (
            <div className="space-y-6">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">What will be created:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#D91C81] font-bold">•</span>
                    <span>Admin account (admin@example.com / Admin123!)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D91C81] font-bold">•</span>
                    <span>Demo stakeholder client with 3 use-case sites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D91C81] font-bold">•</span>
                    <span>15 sample gifts across multiple categories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D91C81] font-bold">•</span>
                    <span>Demo employees with validation credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D91C81] font-bold">•</span>
                    <span>Gift assignments to all demo sites</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleInitialSeed}
                disabled={isSeeding}
                className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initializing Database...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" />
                    Initialize Database Now
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  ← Back to Homepage
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            <strong>Note:</strong> This endpoint can only be used once when the database is empty. 
            After initialization, use the admin panel to manage data.
          </p>
        </div>
      </div>
    </div>
  );
}
