import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Wifi, 
  Zap,
  Clock,
  Server,
  Database,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { getCurrentEnvironment } from '../../config/environments';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/errorHandling';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  timestamp: string;
  edgeFunctionStatus: 'active' | 'cold' | 'error';
  databaseStatus: 'connected' | 'disconnected';
  details?: string;
}

interface HealthLog {
  timestamp: string;
  status: 'success' | 'error';
  responseTime: number;
  error?: string;
}

export function BackendHealthMonitor() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [autoMonitor, setAutoMonitor] = useState(true);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [uptime, setUptime] = useState(100);
  const [lastError, setLastError] = useState<string | null>(null);

  const checkHealth = useCallback(async (silent = false) => {
    if (!silent) setIsChecking(true);
    
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const env = getCurrentEnvironment();
      const projectId = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      
      const response = await fetch(
        `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/health`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.supabaseAnonKey}`,
            'X-Environment-ID': env.id,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        
        const status: HealthStatus = {
          status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'down',
          responseTime,
          timestamp: new Date().toISOString(),
          edgeFunctionStatus: responseTime < 1000 ? 'active' : 'cold',
          databaseStatus: data.database ? 'connected' : 'disconnected',
          details: data.message || 'Backend is operational'
        };

        setHealthStatus(status);
        setLastError(null);

        // Add to logs
        const newLog: HealthLog = {
          timestamp: new Date().toISOString(),
          status: 'success',
          responseTime
        };
        setHealthLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs

        if (!silent) {
          showSuccessToast('Health Check Complete', `Backend responded in ${responseTime}ms`);
        }
      } else {
        throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      const errorMessage = error instanceof Error && error.name === 'AbortError'
        ? 'Request timeout (10s) - backend may be in cold start'
        : error instanceof Error ? error.message : 'Unknown error';
      
      setHealthStatus({
        status: 'down',
        responseTime,
        timestamp: new Date().toISOString(),
        edgeFunctionStatus: 'error',
        databaseStatus: 'disconnected',
        details: errorMessage
      });

      if (!silent) {
        showErrorToast(error, { operation: 'healthCheck' });
      }
    } finally {
      if (!silent) setIsChecking(false);
    }
  }, []);

  const wakeUpBackend = async () => {
    setIsChecking(true);
    try {
      showInfoToast('Waking Up Backend', 'Sending wake-up request...');

      const env = getCurrentEnvironment();
      const controller = new AbortController();
      const wakeTimeoutId = setTimeout(() => controller.abort(), 15000);

      await fetch(`${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.supabaseAnonKey}`,
          'X-Environment-ID': env.id,
        },
        signal: controller.signal,
      });

      clearTimeout(wakeTimeoutId);
      
      setTimeout(() => {
        void checkHealth(false).catch((error) => {
          console.error('Error checking health after wake:', error);
        });
        showSuccessToast('Backend Awakened', 'Edge Function is now active');
      }, 1000);
    } catch (error: unknown) {
      // Ignore timeout errors during wake-up, just check health after
      setTimeout(() => {
        void checkHealth(false).catch((error) => {
          console.error('Error checking health after wake error:', error);
        });
      }, 1000);
    } finally {
      setIsChecking(false);
    }
  };

  const testDatabase = async () => {
    setIsChecking(true);
    let dbTimeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      showInfoToast('Testing Database', 'Checking database connectivity...');

      const env = getCurrentEnvironment();
      const controller = new AbortController();
      dbTimeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/health/database`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.supabaseAnonKey}`,
          'X-Environment-ID': env.id,
        },
        signal: controller.signal,
      });

      clearTimeout(dbTimeoutId);

      if (response.ok) {
        const data = await response.json();
        showSuccessToast('Database Connected', data.message || 'Database is operational');
      } else {
        throw new Error(`Database test failed: ${response.status}`);
      }
    } catch (error: unknown) {
      if (dbTimeoutId) clearTimeout(dbTimeoutId);
      const errorMessage = error instanceof Error && error.name === 'AbortError'
        ? 'Request timeout - Backend may be asleep or not deployed. Try the "Wake Up" button first.'
        : error instanceof TypeError && error.message.includes('fetch')
        ? 'Network error - Cannot reach backend. Check that the Supabase URL is correct and the Edge Function is deployed.'
        : error instanceof Error ? error.message : 'Unknown error';
      
      showErrorToast(new Error(errorMessage), { operation: 'testDatabase' });
    } finally {
      setIsChecking(false);
    }
  };

  // Calculate stats from logs
  useEffect(() => {
    if (healthLogs.length > 0) {
      const successLogs = healthLogs.filter(log => log.status === 'success');
      if (successLogs.length > 0) {
        const avg = successLogs.reduce((sum, log) => sum + log.responseTime, 0) / successLogs.length;
        setAvgResponseTime(Math.round(avg));
      }

      const successRate = (successLogs.length / healthLogs.length) * 100;
      setUptime(Math.round(successRate * 10) / 10);
    }
  }, [healthLogs]);

  // Auto-monitoring
  useEffect(() => {
    if (autoMonitor) {
      // Check immediately on mount
      void checkHealth(true).catch((error) => {
        console.error('Error in auto-monitor initial check:', error);
      });

      // Then check every 30 seconds
      const interval = setInterval(() => {
        void checkHealth(true).catch((error) => {
          console.error('Error in auto-monitor interval check:', error);
        });
      }, 30000);

      return () => clearInterval(interval);
    }
    return () => {}; // Return empty cleanup for early exit
  }, [autoMonitor, checkHealth]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'connected':
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
      case 'cold':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down':
      case 'error':
      case 'disconnected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'connected':
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'degraded':
      case 'cold':
        return <AlertCircle className="w-5 h-5" />;
      case 'down':
      case 'error':
      case 'disconnected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1B2A5E] flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Backend Health Monitor
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor and manage your Supabase Edge Functions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoMonitor}
              onChange={(e) => setAutoMonitor(e.target.checked)}
              className="text-[#D91C81] focus:ring-[#D91C81] rounded"
            />
            <span className="text-gray-700">Auto-monitor (30s)</span>
          </label>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Status */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(healthStatus?.status)}`}>
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(healthStatus?.status)}
            <span className="font-semibold">Overall Status</span>
          </div>
          <div className="text-2xl font-bold capitalize">
            {healthStatus?.status || 'Unknown'}
          </div>
        </div>

        {/* Edge Function */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(healthStatus?.edgeFunctionStatus)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-5 h-5" />
            <span className="font-semibold">Edge Function</span>
          </div>
          <div className="text-2xl font-bold capitalize">
            {healthStatus?.edgeFunctionStatus || 'Unknown'}
          </div>
        </div>

        {/* Database */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(healthStatus?.databaseStatus)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5" />
            <span className="font-semibold">Database</span>
          </div>
          <div className="text-2xl font-bold capitalize">
            {healthStatus?.databaseStatus || 'Unknown'}
          </div>
        </div>

        {/* Response Time */}
        <div className="p-4 rounded-lg border-2 border-[#00B4CC] bg-cyan-50">
          <div className="flex items-center gap-2 mb-2 text-[#00B4CC]">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Response Time</span>
          </div>
          <div className="text-2xl font-bold text-[#00B4CC]">
            {healthStatus ? `${healthStatus.responseTime}ms` : '--'}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Avg Response Time</span>
          </div>
          <div className="text-xl font-bold text-[#1B2A5E]">
            {avgResponseTime > 0 ? `${avgResponseTime}ms` : '--'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Uptime</span>
          </div>
          <div className="text-xl font-bold text-[#1B2A5E]">
            {healthLogs.length > 0 ? `${uptime}%` : '--'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Last Check</span>
          </div>
          <div className="text-sm font-medium text-[#1B2A5E]">
            {healthStatus ? new Date(healthStatus.timestamp).toLocaleTimeString() : '--'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-[#1B2A5E] mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => checkHealth(false)}
            disabled={isChecking}
            className="flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91870] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            Check Health
          </button>

          <button
            onClick={() => void wakeUpBackend()}
            disabled={isChecking}
            className="flex items-center gap-2 px-4 py-2 bg-[#00B4CC] text-white rounded-lg hover:bg-[#0099B3] transition-colors disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            Wake Up Backend
          </button>

          <button
            onClick={() => void testDatabase()}
            disabled={isChecking}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B2A5E] text-white rounded-lg hover:bg-[#152247] transition-colors disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            Test Database
          </button>

          <button
            onClick={() => {
              setHealthLogs([]);
              setAvgResponseTime(0);
              setUptime(100);
              showInfoToast('Logs Cleared', 'Health logs have been reset');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Clear Logs
          </button>
        </div>
      </div>

      {/* Current Status Details */}
      {healthStatus && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1B2A5E] mb-4">Current Status Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium capitalize ${
                healthStatus.status === 'healthy' ? 'text-green-600' :
                healthStatus.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {healthStatus.status}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Response Time:</span>
              <span className="font-medium">{healthStatus.responseTime}ms</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Edge Function:</span>
              <span className={`font-medium capitalize ${
                healthStatus.edgeFunctionStatus === 'active' ? 'text-green-600' :
                healthStatus.edgeFunctionStatus === 'cold' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {healthStatus.edgeFunctionStatus}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Database:</span>
              <span className={`font-medium capitalize ${
                healthStatus.databaseStatus === 'connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {healthStatus.databaseStatus}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">{new Date(healthStatus.timestamp).toLocaleString()}</span>
            </div>
            {healthStatus.details && (
              <div className="pt-2">
                <span className="text-gray-600">Details:</span>
                <p className="mt-1 text-gray-900">{healthStatus.details}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Error */}
      {lastError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">Last Error</h4>
              <p className="text-sm text-red-700">{lastError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Health Logs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1B2A5E]">Health Check History</h3>
          <p className="text-sm text-gray-600 mt-1">Last {healthLogs.length} health checks</p>
        </div>
        <div className="p-4">
          {healthLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No health checks yet. Click "Check Health" to start monitoring.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {healthLogs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    log.status === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {log.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <div className={`text-sm font-medium ${
                        log.status === 'success' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {log.status === 'success' ? 'Healthy' : 'Error'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      log.status === 'success' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {log.responseTime}ms
                    </div>
                    {log.error && (
                      <div className="text-xs text-red-600 max-w-xs truncate">
                        {log.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Backend Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Wifi className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2">Backend Information</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Environment:</strong> {getCurrentEnvironment().name} ({getCurrentEnvironment().id})</p>
              <p><strong>Endpoint:</strong> {getCurrentEnvironment().supabaseUrl}/functions/v1/make-server-6fcaeea3</p>
              <p className="mt-3 text-blue-700">
                <strong>Tip:</strong> If the backend is in a "cold start" state, use the "Wake Up Backend" button 
                to send multiple requests and activate it. Auto-monitoring will help prevent cold starts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BackendHealthMonitor;