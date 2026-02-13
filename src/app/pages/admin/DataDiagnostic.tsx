import { useState, useEffect } from 'react';
import { Database, RefreshCw, Download, Search, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { getAccessToken } from '../../utils/api';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { showSuccessToast, showErrorToast } from '../../utils/errorHandling';

export function DataDiagnostic() {
  const [isRunning, setIsRunning] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleRunDiagnostic = async () => {
    setIsRunning(true);
    const token = getAccessToken();
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

    const diagnosticResults: any = {
      environment: {
        projectId: projectId,
        baseUrl: baseUrl,
        hasToken: !!token,
        token: token ? `${token.substring(0, 20)}...` : 'No token',
      },
      endpoints: {},
    };

    // Test endpoints
    const endpoints = [
      { name: 'Health Check', url: `${baseUrl}/health`, method: 'GET', requiresAuth: false },
      { name: 'Get Clients', url: `${baseUrl}/clients`, method: 'GET', requiresAuth: true },
      { name: 'Get Sites', url: `${baseUrl}/sites`, method: 'GET', requiresAuth: true },
      { name: 'Get Gifts', url: `${baseUrl}/gifts`, method: 'GET', requiresAuth: true },
      { name: 'Check Admin', url: `${baseUrl}/debug/check-admin-users`, method: 'GET', requiresAuth: false },
    ];

    for (const endpoint of endpoints) {
      try {
        const headers: any = {
          'Content-Type': 'application/json',
        };

        if (endpoint.requiresAuth && token) {
          // CRITICAL FIX: Backend expects token in X-Access-Token header, not Authorization
          // Authorization header is reserved for Supabase anon key
          headers['X-Access-Token'] = token;
          headers['Authorization'] = `Bearer ${publicAnonKey}`;
        } else {
          // Public endpoints still need the anon key for Supabase platform auth
          headers['Authorization'] = `Bearer ${publicAnonKey}`;
        }

        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers,
        });

        // Try to parse JSON, but handle cases where response is not JSON
        let data: any = null;
        let parseError: string | null = null;
        let responseText = '';
        try {
          responseText = await response.text();
          if (responseText) {
            data = JSON.parse(responseText);
          }
        } catch (jsonError: any) {
          parseError = `JSON parse error: ${jsonError.message}`;
          // Store the raw response text for debugging
          data = { raw: responseText, parseError };
        }

        diagnosticResults.endpoints[endpoint.name] = {
          status: response.status,
          ok: response.ok,
          data: data,
          error: parseError,
        };
      } catch (error: unknown) {
        diagnosticResults.endpoints[endpoint.name] = {
          status: 0,
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    setResults(diagnosticResults);
    setIsRunning(false);
  };

  const handleReseed = async () => {
    setIsReseeding(true);
    try {
      const token = getAccessToken();
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
      const response = await fetch(`${baseUrl}/data/reseed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': token || '',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        showSuccessToast('Database Reseeded', 'Sample data recreated successfully');
        
        // Re-run diagnostic
        setTimeout(() => {
          handleRunDiagnostic();
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        showErrorToast(
          new Error(errorData.error || `Server returned ${response.status}`),
          { operation: 'reseed' }
        );
      }
    } catch (error: unknown) {
      console.error('[Reseed] Network error:', error);
      showErrorToast('Network error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Diagnostic</h1>
          <p className="text-gray-600 mt-1">Check backend connectivity and data availability</p>
        </div>
        <button
          onClick={handleRunDiagnostic}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-[#D91C81] hover:bg-[#B01669] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Run Diagnostic
            </>
          )}
        </button>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Environment Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Environment</h2>
            <div className="space-y-2 font-mono text-sm">
              <div><strong>Project ID:</strong> {results.environment.projectId}</div>
              <div><strong>Base URL:</strong> {results.environment.baseUrl}</div>
              <div><strong>Has Auth Token:</strong> {results.environment.hasToken ? '✅ Yes' : '❌ No'}</div>
              {results.environment.hasToken && (
                <div><strong>Token:</strong> {results.environment.token}</div>
              )}
            </div>
          </div>

          {/* Endpoint Results */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Endpoint Tests</h2>
            <div className="space-y-4">
              {Object.entries(results.endpoints).map(([name, result]: [string, any]) => (
                <div key={name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      {result.ok ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      {name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.ok 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status || 'Network Error'}
                    </span>
                  </div>

                  {result.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                      <p className="text-sm text-red-800"><strong>Error:</strong> {result.error}</p>
                    </div>
                  )}

                  {result.data && (
                    <div className="bg-gray-50 rounded p-3 overflow-auto max-h-96">
                      <pre className="text-xs">{JSON.stringify(result.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Quick Diagnosis</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  {!results.environment.hasToken && (
                    <p>⚠️ No auth token found. Please log in to admin first.</p>
                  )}
                  {results.endpoints['Health Check']?.ok === false && (
                    <p>❌ Backend is not responding. The function may not be deployed.</p>
                  )}
                  {results.endpoints['Health Check']?.ok && !results.endpoints['Get Clients']?.ok && (
                    <p>⚠️ Backend is running but authentication is failing. Check your credentials.</p>
                  )}
                  {results.endpoints['Get Clients']?.data?.clients?.length === 0 && (
                    <p>⚠️ Backend is working but database is empty. Run the reseed endpoint.</p>
                  )}
                  {results.endpoints['Get Clients']?.data?.clients?.length > 0 && (
                    <p>✅ Backend is working and has {results.endpoints['Get Clients'].data.clients.length} clients!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Box about Resources */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-cyan-900 mb-2">ℹ️ About the 11 Migrated Resources</h3>
                <p className="text-sm text-cyan-800 mb-3">
                  Your backend supports <strong>11 different resource types</strong> with full CRUD operations (Create, Read, Update, Delete, List):
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs mb-3">
                  <div className="bg-white rounded px-2 py-1 border border-cyan-200">1. Clients</div>
                  <div className="bg-white rounded px-2 py-1 border border-cyan-200">2. Sites</div>
                  <div className="bg-white rounded px-2 py-1 border border-cyan-200">3. Gifts</div>
                  <div className="bg-white rounded px-2 py-1 border border-cyan-200">4. Orders</div>
                  <div className="bg-white rounded px-2 py-1 border border-cyan-200">5. Employees</div>
                  <div className="bg-white rounded px-2 py-1 border border-cyan-200">6. Admin Users</div>
                  <div className="bg-white rounded px-2 py-1 border border-cyan-200">7. Roles</div>
                  <div className="bg-white rounded px-2 py-1 border border-cyan-200">8. Access Groups</div>
                  <div className="bg-white rounded px-2 py-1 border border-cyan-200">9. Celebrations</div>
                  <div className="bg-white rounded px-2 py-1 border border-cyan-200">10. Email Templates</div>
                  <div className="bg-white rounded px-2 py-1 border border-cyan-200">11. Brands</div>
                </div>
                <p className="text-sm text-cyan-800">
                  The seed data creates <strong>4 sample clients</strong> along with associated sites, gifts, and other data for each resource type. This provides a complete demo dataset for testing your gifting platform.
                </p>
              </div>
            </div>
          </div>

          {/* Reseed Button */}
          {results.endpoints['Get Clients']?.data?.clients?.length === 0 && (
            <div className="mt-6">
              <button
                onClick={handleReseed}
                disabled={isReseeding}
                className="flex items-center gap-2 px-4 py-2 bg-[#D91C81] hover:bg-[#B01669] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isReseeding ? (
                  <>
                    <Database className="w-4 h-4 animate-spin" />
                    Reseeding...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Reseed Database
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {!results && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Click "Run Diagnostic" to test backend connectivity and data availability</p>
        </div>
      )}
    </div>
  );
}