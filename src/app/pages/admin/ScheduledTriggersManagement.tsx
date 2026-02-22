import { useState, useEffect } from 'react';
import { Clock, Calendar, Play, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { getAccessToken } from '../../lib/apiClient';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

interface TriggerLog {
  id: string;
  processedAt: string;
  selectionExpiring: TriggerResult[];
  anniversaryApproaching: TriggerResult[];
  totalSent: number;
  totalFailed: number;
  duration: number;
}

interface TriggerResult {
  trigger: string;
  siteId: string;
  processed: number;
  sent: number;
  failed: number;
  errors: string[];
}

interface TriggerStats {
  last24Hours: { sent: number; failed: number };
  last7Days: { sent: number; failed: number };
  last30Days: { sent: number; failed: number };
}

export function ScheduledTriggersManagement() {
  const [logs, setLogs] = useState<TriggerLog[]>([]);
  const [stats, setStats] = useState<TriggerStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadLogs().catch((error) => {
      console.error('Error loading logs:', error);
    });
    void loadStats().catch((error) => {
      console.error('Error loading stats:', error);
    });
  }, []);

  const getAuthHeaders = () => {
    const token = getAccessToken();
    const env = getCurrentEnvironment();
    
    return {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Access-Token': token,
      'X-Environment-ID': env.id,
      'Content-Type': 'application/json',
    };
  };

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/scheduled-triggers/logs?limit=20`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch logs');

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error: any) {
      toast.error('Failed to load trigger logs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/scheduled-triggers/stats`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.stats);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleProcessAll = async () => {
    if (!confirm('Process all scheduled triggers now? This will check for expiring selections and upcoming anniversaries.')) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/scheduled-triggers/process`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to process triggers');

      const data = await response.json();
      toast.success(
        `Processed successfully: ${data.totalSent} sent, ${data.totalFailed} failed`
      );
      void loadLogs().catch((error) => {
        console.error('Error reloading logs:', error);
      });
      void loadStats().catch((error) => {
        console.error('Error reloading stats:', error);
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessSelectionExpiring = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/scheduled-triggers/selection-expiring`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to process selection expiring');

      const data = await response.json();
      toast.success(
        `Selection expiring processed: ${data.totalSent} sent, ${data.totalFailed} failed`
      );
      void loadLogs().catch((error) => {
        console.error('Error reloading logs:', error);
      });
      void loadStats().catch((error) => {
        console.error('Error reloading stats:', error);
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessAnniversary = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/scheduled-triggers/anniversary-approaching`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to process anniversary');

      const data = await response.json();
      toast.success(
        `Anniversary processed: ${data.totalSent} sent, ${data.totalFailed} failed`
      );
      void loadLogs().catch((error) => {
        console.error('Error reloading logs:', error);
      });
      void loadStats().catch((error) => {
        console.error('Error reloading stats:', error);
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheduled Triggers</h1>
          <p className="text-gray-600">
            Automated background jobs for time-based email notifications
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">How Scheduled Triggers Work</h3>
              <p className="text-sm text-blue-700 mb-3">
                These triggers run automatically to check for upcoming deadlines and anniversaries.
                In production, set up a cron job to call the process endpoint daily.
              </p>
              <div className="space-y-1 text-sm text-blue-700">
                <div><strong>Selection Expiring:</strong> Reminds employees 7, 3, and 1 days before gift selection deadline</div>
                <div><strong>Anniversary Approaching:</strong> Notifies employees 30 and 7 days before service anniversary</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-sm font-medium text-gray-600">Last 24 Hours</div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-green-600">{stats.last24Hours.sent}</div>
                <div className="text-sm text-gray-500">sent</div>
              </div>
              {stats.last24Hours.failed > 0 && (
                <div className="text-sm text-red-600 mt-1">{stats.last24Hours.failed} failed</div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-gray-600">Last 7 Days</div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-blue-600">{stats.last7Days.sent}</div>
                <div className="text-sm text-gray-500">sent</div>
              </div>
              {stats.last7Days.failed > 0 && (
                <div className="text-sm text-red-600 mt-1">{stats.last7Days.failed} failed</div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-sm font-medium text-gray-600">Last 30 Days</div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-purple-600">{stats.last30Days.sent}</div>
                <div className="text-sm text-gray-500">sent</div>
              </div>
              {stats.last30Days.failed > 0 && (
                <div className="text-sm text-red-600 mt-1">{stats.last30Days.failed} failed</div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Trigger Processing</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void handleProcessAll()}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Process All Triggers'}
            </button>
            <button
              onClick={() => void handleProcessSelectionExpiring()}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Clock className="w-4 h-4" />
              Selection Expiring Only
            </button>
            <button
              onClick={() => void handleProcessAnniversary()}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Anniversary Only
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Manually trigger processing to test or handle urgent notifications. In production, these run automatically via cron.
          </p>
        </div>

        {/* Cron Setup Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">Production Setup: Cron Job</h3>
              <p className="text-sm text-yellow-700 mb-3">
                To automate scheduled triggers in production, set up a daily cron job to call:
              </p>
              <div className="bg-yellow-100 border border-yellow-300 rounded p-3 font-mono text-xs text-yellow-900 overflow-x-auto mb-3">
                POST {API_BASE}/scheduled-triggers/process
              </div>
              <p className="text-sm text-yellow-700 mb-2">
                <strong>Recommended Schedule:</strong> Run daily at 9:00 AM local time
              </p>
              <p className="text-sm text-yellow-700">
                <strong>Example Cron Expression:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">0 9 * * *</code>
              </p>
            </div>
          </div>
        </div>

        {/* Execution Logs */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Execution History</h2>
            <p className="text-sm text-gray-600 mt-1">Recent scheduled trigger processing runs</p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No execution logs yet</p>
              <p className="text-gray-500 text-sm">
                Trigger processing manually or wait for the cron job to run
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <div key={log.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-900">
                          Processed at {new Date(log.processedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Duration: {log.duration}ms
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{log.totalSent}</div>
                      <div className="text-xs text-gray-500">emails sent</div>
                      {log.totalFailed > 0 && (
                        <div className="text-sm text-red-600 mt-1">{log.totalFailed} failed</div>
                      )}
                    </div>
                  </div>

                  {/* Selection Expiring Results */}
                  {log.selectionExpiring && log.selectionExpiring.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Selection Expiring ({log.selectionExpiring.length} sites)
                      </h4>
                      <div className="space-y-2">
                        {log.selectionExpiring.map((result, idx) => (
                          <div
                            key={idx}
                            className="bg-orange-50 border border-orange-200 rounded p-3 text-sm"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">Site: {result.siteId}</span>
                              <span className="text-green-600">
                                {result.sent}/{result.processed} sent
                              </span>
                            </div>
                            {result.failed > 0 && (
                              <div className="text-red-600 text-xs">{result.failed} failed</div>
                            )}
                            {result.errors.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {result.errors.map((error, errIdx) => (
                                  <div key={errIdx} className="text-xs text-red-600">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Anniversary Approaching Results */}
                  {log.anniversaryApproaching && log.anniversaryApproaching.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Anniversary Approaching ({log.anniversaryApproaching.length} sites)
                      </h4>
                      <div className="space-y-2">
                        {log.anniversaryApproaching.map((result, idx) => (
                          <div
                            key={idx}
                            className="bg-purple-50 border border-purple-200 rounded p-3 text-sm"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">Site: {result.siteId}</span>
                              <span className="text-green-600">
                                {result.sent}/{result.processed} sent
                              </span>
                            </div>
                            {result.failed > 0 && (
                              <div className="text-red-600 text-xs">{result.failed} failed</div>
                            )}
                            {result.errors.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {result.errors.map((error, errIdx) => (
                                  <div key={errIdx} className="text-xs text-red-600">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}