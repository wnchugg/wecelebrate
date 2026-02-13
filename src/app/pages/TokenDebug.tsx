import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { getAccessToken, clearAccessToken } from '../lib/apiClient';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

export default function TokenDebug() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const analyzeToken = () => {
    setLoading(true);
    const token = getAccessToken();
    
    if (!token) {
      setTokenInfo({
        exists: false,
        message: 'No token found in sessionStorage',
        recommendation: 'You need to login to get a token'
      });
      setLoading(false);
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        setTokenInfo({
          exists: true,
          valid: false,
          error: 'Invalid JWT format - should have 3 parts',
          parts: parts.length,
          recommendation: 'Clear this token and login again'
        });
        setLoading(false);
        return;
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < now;
      
      const algorithm = header.alg || 'unknown';
      const issuer = payload.iss || 'unknown';
      const email = payload.email || payload.sub || 'unknown';
      const expiresAt = payload.exp ? new Date(payload.exp * 1000) : null;
      const issuedAt = payload.iat ? new Date(payload.iat * 1000) : null;

      // Check if it's from our backend
      const isHS256 = algorithm === 'HS256';
      const isFromDevelopment = issuer.includes('wjfcqqrlhwdvvjmefxky');
      const isFromProduction = issuer.includes('lmffeqwhrnbsbhdztwyv');
      const isSupabaseAuth = algorithm === 'ES256';

      let status = 'unknown';
      let recommendation = '';

      if (isSupabaseAuth) {
        status = 'invalid';
        recommendation = 'This is a Supabase Auth token (ES256), not our backend token (HS256). Clear and login again.';
      } else if (!isHS256) {
        status = 'invalid';
        recommendation = `Wrong algorithm: ${algorithm}. Expected HS256. Clear and login again.`;
      } else if (isExpired) {
        status = 'expired';
        recommendation = 'Token has expired. Clear and login again.';
      } else if (!isFromDevelopment && !isFromProduction) {
        status = 'wrong-instance';
        recommendation = `Token is from wrong Supabase instance. Issuer: ${issuer}. Expected: wjfcqqrlhwdvvjmefxky (dev) or lmffeqwhrnbsbhdztwyv (prod)`;
      } else {
        status = 'valid';
        recommendation = 'Token looks good!';
      }

      setTokenInfo({
        exists: true,
        valid: status === 'valid',
        status,
        algorithm,
        issuer,
        email,
        expiresAt,
        issuedAt,
        isExpired,
        isHS256,
        isSupabaseAuth,
        isFromDevelopment,
        isFromProduction,
        recommendation,
        header,
        payload,
        tokenPreview: token.substring(0, 50) + '...'
      });
    } catch (error: any) {
      setTokenInfo({
        exists: true,
        valid: false,
        error: 'Failed to decode token: ' + error.message,
        recommendation: 'Token is malformed. Clear and login again.'
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    analyzeToken();
  }, []);

  const handleClearToken = () => {
    if (confirm('Clear the current token? You will need to login again.')) {
      clearAccessToken();
      sessionStorage.clear();
      alert('Token cleared! Reloading...');
      window.location.reload();
    }
  };

  const handleRefresh = () => {
    analyzeToken();
  };

  const env = getCurrentEnvironment();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Token Debug Tool</h1>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleClearToken}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Token
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing token...</p>
            </div>
          ) : (
            <>
              {/* Status Card */}
              <div className={`rounded-lg p-4 mb-6 ${
                !tokenInfo.exists ? 'bg-gray-100 border-2 border-gray-300' :
                tokenInfo.status === 'valid' ? 'bg-green-100 border-2 border-green-500' :
                tokenInfo.status === 'expired' ? 'bg-yellow-100 border-2 border-yellow-500' :
                'bg-red-100 border-2 border-red-500'
              }`}>
                <div className="flex items-start gap-3">
                  {!tokenInfo.exists ? (
                    <AlertTriangle className="w-6 h-6 text-gray-600 flex-shrink-0" />
                  ) : tokenInfo.status === 'valid' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h2 className="font-bold text-lg mb-1">
                      {!tokenInfo.exists ? 'No Token' :
                       tokenInfo.status === 'valid' ? '✅ Valid Token' :
                       tokenInfo.status === 'expired' ? '⏰ Expired Token' :
                       tokenInfo.status === 'wrong-instance' ? '🔄 Wrong Instance' :
                       '❌ Invalid Token'}
                    </h2>
                    <p className="text-sm mb-2">{tokenInfo.recommendation}</p>
                    {tokenInfo.exists && tokenInfo.status !== 'valid' && (
                      <button
                        onClick={handleClearToken}
                        className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Clear Invalid Token
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Environment Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold mb-2">Current Environment</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-semibold">Environment:</span> {env.id}
                  </div>
                  <div>
                    <span className="font-semibold">Name:</span> {env.name}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Supabase URL:</span> {env.supabaseUrl}
                  </div>
                </div>
              </div>

              {/* Token Details */}
              {tokenInfo.exists && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Token Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold">Algorithm:</span>
                        <span className={tokenInfo.isHS256 ? 'text-green-600' : 'text-red-600'}>
                          {tokenInfo.algorithm} {tokenInfo.isHS256 ? '✅' : '❌ Expected HS256'}
                        </span>
                      </div>
                      
                      {tokenInfo.issuer && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Issuer:</span>
                          <span className={
                            tokenInfo.isFromDevelopment || tokenInfo.isFromProduction 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }>
                            {tokenInfo.issuer.length > 50 
                              ? tokenInfo.issuer.substring(0, 50) + '...' 
                              : tokenInfo.issuer}
                            {tokenInfo.isFromDevelopment && ' ✅ (Dev)'}
                            {tokenInfo.isFromProduction && ' ✅ (Prod)'}
                            {!tokenInfo.isFromDevelopment && !tokenInfo.isFromProduction && ' ❌'}
                          </span>
                        </div>
                      )}
                      
                      {tokenInfo.email && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Email/Sub:</span>
                          <span>{tokenInfo.email}</span>
                        </div>
                      )}
                      
                      {tokenInfo.issuedAt && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Issued At:</span>
                          <span>{tokenInfo.issuedAt.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {tokenInfo.expiresAt && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Expires At:</span>
                          <span className={tokenInfo.isExpired ? 'text-red-600' : 'text-green-600'}>
                            {tokenInfo.expiresAt.toLocaleString()} {tokenInfo.isExpired ? '⏰ EXPIRED' : '✅'}
                          </span>
                        </div>
                      )}
                      
                      {tokenInfo.isSupabaseAuth && (
                        <div className="bg-red-100 border border-red-300 rounded p-2 mt-2">
                          <p className="text-red-800 text-xs">
                            ⚠️ This is a Supabase Auth token (ES256), not a token from our backend. 
                            You need to login through the admin login page to get an HS256 token.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Raw Token Data */}
                  <details className="bg-gray-50 rounded-lg p-4">
                    <summary className="font-bold cursor-pointer">Raw Token Data (Advanced)</summary>
                    <div className="mt-3 space-y-3">
                      {tokenInfo.tokenPreview && (
                        <div>
                          <p className="text-xs font-semibold mb-1">Token Preview:</p>
                          <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                            {tokenInfo.tokenPreview}
                          </pre>
                        </div>
                      )}
                      
                      {tokenInfo.header && (
                        <div>
                          <p className="text-xs font-semibold mb-1">Header:</p>
                          <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(tokenInfo.header, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {tokenInfo.payload && (
                        <div>
                          <p className="text-xs font-semibold mb-1">Payload:</p>
                          <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(tokenInfo.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 mt-6">
                <h3 className="font-bold mb-2">💡 Instructions</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Valid tokens should use <strong>HS256</strong> algorithm</li>
                  <li>Valid tokens should be issued by <strong>wjfcqqrlhwdvvjmefxky</strong> (dev) or <strong>lmffeqwhrnbsbhdztwyv</strong> (prod)</li>
                  <li>If you see <strong>ES256</strong>, this is a Supabase Auth token - clear it and login again</li>
                  <li>Login at <a href="/admin/login" className="text-blue-600 underline">/admin/login</a> to get a valid token</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}