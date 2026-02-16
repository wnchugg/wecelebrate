import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { apiRequest, getAccessToken } from '../../utils/api';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

export function SitesDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: null,
      token: null,
      apiCalls: {},
      errors: [],
    };

    try {
      // Check environment
      const env = getCurrentEnvironment();
      diagnostics.environment = {
        id: env.id,
        name: env.name,
        supabaseUrl: env.supabaseUrl,
        apiUrl: `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`,
      };

      // Check token
      const token = getAccessToken();
      if (token) {
        try {
          const parts = token.split('.');
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          diagnostics.token = {
            exists: true,
            algorithm: header.alg,
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            environmentId: payload.environmentId,
            issuedAt: new Date(payload.iat * 1000).toISOString(),
            expiresAt: new Date(payload.exp * 1000).toISOString(),
            isExpired: payload.exp < Math.floor(Date.now() / 1000),
          };
        } catch (err: any) {
          diagnostics.token = { exists: true, error: err.message };
        }
      } else {
        diagnostics.token = { exists: false };
      }

      // Test API calls
      console.warn('🔍 Testing /sites endpoint...');
      try {
        const sitesResponse = await apiRequest<{ success: boolean; data: any[] }>('/v2/sites');
        diagnostics.apiCalls.sites = {
          success: true,
          responseFormat: sitesResponse,
          dataLength: sitesResponse.data?.length || 0,
          hasSuccessFlag: 'success' in sitesResponse,
          hasDataProperty: 'data' in sitesResponse,
        };
      } catch (err: any) {
        diagnostics.apiCalls.sites = {
          success: false,
          error: err.message,
          status: err.status || err.statusCode,
        };
        diagnostics.errors.push({ endpoint: '/sites', error: err.message });
      }

      console.warn('🔍 Testing /clients endpoint...');
      try {
        const clientsResponse = await apiRequest<{ success: boolean; data: any[] }>('/v2/clients');
        diagnostics.apiCalls.clients = {
          success: true,
          responseFormat: clientsResponse,
          dataLength: clientsResponse.data?.length || 0,
          hasSuccessFlag: 'success' in clientsResponse,
          hasDataProperty: 'data' in clientsResponse,
        };
      } catch (err: any) {
        diagnostics.apiCalls.clients = {
          success: false,
          error: err.message,
          status: err.status || err.statusCode,
        };
        diagnostics.errors.push({ endpoint: '/clients', error: err.message });
      }

      // Test direct fetch to see raw response
      console.warn('🔍 Testing direct fetch to /v2/sites...');
      try {
        const directUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites`;
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'X-Environment-ID': env.id,
        };
        
        if (token) {
          headers['X-Access-Token'] = token;
          headers['Authorization'] = `Bearer ${env.supabaseAnonKey || publicAnonKey}`;
        } else {
          headers['Authorization'] = `Bearer ${env.supabaseAnonKey || publicAnonKey}`;
        }

        const response = await fetch(directUrl, { headers, credentials: 'omit' });
        const responseText = await response.text();
        
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch {
          parsedResponse = responseText;
        }

        diagnostics.apiCalls.directFetch = {
          url: directUrl,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          responseText: responseText.substring(0, 500),
          parsedResponse: parsedResponse,
        };
      } catch (err: any) {
        diagnostics.apiCalls.directFetch = {
          error: err.message,
        };
      }

    } catch (err: any) {
      diagnostics.errors.push({ general: err.message });
    }

    setResults(diagnostics);
    setLoading(false);

    // Log to console for easy copy-paste
    console.warn('='.repeat(80));
    console.warn('SITES DIAGNOSTIC RESULTS');
    console.warn('='.repeat(80));
    console.warn(JSON.stringify(diagnostics, null, 2));
    console.warn('='.repeat(80));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sites Loading Diagnostic</h1>
        <p className="text-gray-600">
          This page helps diagnose why sites aren't loading in the admin panel.
        </p>
      </div>

      <Button onClick={runDiagnostics} disabled={loading} className="mb-6">
        {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </Button>

      {results && (
        <div className="space-y-6">
          {/* Environment Info */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Environment</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(results.environment, null, 2)}
            </pre>
          </div>

          {/* Token Info */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Authentication Token</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(results.token, null, 2)}
            </pre>
          </div>

          {/* API Call Results */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">API Call Results</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">GET /sites</h3>
                <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                  {JSON.stringify(results.apiCalls.sites, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-medium mb-2">GET /clients</h3>
                <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                  {JSON.stringify(results.apiCalls.clients, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-medium mb-2">Direct Fetch (Raw Response)</h3>
                <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                  {JSON.stringify(results.apiCalls.directFetch, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Errors */}
          {results.errors.length > 0 && (
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h2 className="text-lg font-semibold mb-4 text-red-900">Errors</h2>
              <pre className="bg-white p-4 rounded overflow-x-auto text-sm text-red-800">
                {JSON.stringify(results.errors, null, 2)}
              </pre>
            </div>
          )}

          {/* Summary */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">Summary</h2>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ Environment ID: {results.environment?.id}</li>
              <li>{results.token?.exists ? '✓' : '✗'} Token exists</li>
              {results.token?.exists && (
                <>
                  <li>{results.token?.algorithm === 'HS256' ? '✓' : '✗'} Token algorithm: {results.token?.algorithm}</li>
                  <li>{results.token?.isExpired ? '✗' : '✓'} Token {results.token?.isExpired ? 'expired' : 'valid'}</li>
                </>
              )}
              <li>{results.apiCalls?.sites?.success ? '✓' : '✗'} Sites endpoint response</li>
              <li>{results.apiCalls?.clients?.success ? '✓' : '✗'} Clients endpoint response</li>
              {results.apiCalls?.sites?.success && (
                <li>📊 Sites returned: {results.apiCalls?.sites?.dataLength || 0}</li>
              )}
              {results.apiCalls?.clients?.success && (
                <li>📊 Clients returned: {results.apiCalls?.clients?.dataLength || 0}</li>
              )}
            </ul>
          </div>

          {/* Action Items */}
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h2 className="text-lg font-semibold mb-4 text-yellow-900">Suggested Actions</h2>
            <ul className="space-y-2 text-sm text-yellow-800 list-disc list-inside">
              {!results.token?.exists && (
                <li>No authentication token found - try logging out and logging in again</li>
              )}
              {results.token?.exists && results.token?.algorithm !== 'HS256' && (
                <li>Wrong token algorithm - backend may not be deployed. Check Supabase Functions.</li>
              )}
              {results.token?.isExpired && (
                <li>Token is expired - log out and log in again</li>
              )}
              {results.apiCalls?.sites?.success && results.apiCalls?.sites?.dataLength === 0 && (
                <li>No sites found in database - you may need to seed data or create sites</li>
              )}
              {results.apiCalls?.directFetch?.status === 403 && (
                <li>403 Forbidden - middleware is blocking access. Check verifyAdmin middleware.</li>
              )}
              {results.apiCalls?.directFetch?.status === 401 && (
                <li>401 Unauthorized - token validation failing. Check JWT_SECRET configuration.</li>
              )}
              {results.apiCalls?.directFetch?.status === 404 && (
                <li>404 Not Found - backend routes may not be deployed correctly</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
