import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Trash2, Edit2, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, XCircle, History } from 'lucide-react';
import { authApi } from '../../utils/api';
import { CronBuilder } from './CronBuilder';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/errorHandling';

interface Schedule {
  id: string;
  erpConnectionId: string;
  name: string;
  enabled: boolean;
  syncType: 'products' | 'inventory' | 'both';
  schedule: {
    type: 'cron' | 'interval';
    cronExpression?: string;
    timezone?: string;
    intervalMinutes?: number;
  };
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    emailRecipients?: string[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ScheduleExecutionLog {
  id: string;
  scheduleId: string;
  status: 'success' | 'failure' | 'partial';
  startedAt: string;
  completedAt?: string;
  duration: number;
  recordsProcessed: number;
  recordsFailed: number;
  error?: string;
  details?: Record<string, any>;
}

interface SchedulesResponse {
  schedules: Schedule[];
}

interface LogsResponse {
  logs: ScheduleExecutionLog[];
}

interface ExecuteResponse {
  log: ScheduleExecutionLog;
}

interface ExecutionLog {
  id: string;
  scheduleId: string;
  erpConnectionId: string;
  syncType: string;
  status: 'success' | 'failed' | 'partial';
  startedAt: string;
  completedAt: string;
  recordsProcessed: number;
  recordsFailed: number;
  error?: string;
  details?: any;
}

interface ScheduleManagerProps {
  erpConnectionId: string;
  erpConnectionName: string;
  onClose: () => void;
}

export function ScheduleManager({ erpConnectionId, erpConnectionName, onClose }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showExecutionLogs, setShowExecutionLogs] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, [erpConnectionId]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await authApi.getSchedulesByConnection(erpConnectionId) as SchedulesResponse;
      setSchedules(response.schedules || []);
    } catch (error: unknown) {
      showErrorToast(error, { operation: 'loadSchedules' });
    } finally {
      setLoading(false);
    }
  };

  const loadExecutionLogs = async (scheduleId: string) => {
    try {
      setLogsLoading(true);
      const response = await authApi.getScheduleExecutionLogs(scheduleId, 20) as LogsResponse;
      setExecutionLogs((response.logs || []) as unknown as ExecutionLog[]);
    } catch (error: unknown) {
      showErrorToast(error, { operation: 'loadExecutionLogs' });
    } finally {
      setLogsLoading(false);
    }
  };

  const handleToggleSchedule = async (schedule: Schedule) => {
    try {
      await authApi.updateSchedule(schedule.id, { enabled: !schedule.enabled });
      showSuccessToast(
        'Schedule Updated',
        `Schedule ${!schedule.enabled ? 'enabled' : 'disabled'} successfully`
      );
      loadSchedules();
    } catch (error: unknown) {
      showErrorToast(error, { operation: 'toggleSchedule' });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await authApi.deleteSchedule(scheduleId);
      showSuccessToast('Schedule Deleted', 'Schedule removed successfully');
      loadSchedules();
    } catch (error: unknown) {
      showErrorToast(error, { operation: 'deleteSchedule' });
    }
  };

  const handleExecuteNow = async (schedule: Schedule) => {
    try {
      showInfoToast('Executing Schedule', 'Manual execution started...');
      await authApi.executeScheduleNow(schedule.id);
      showSuccessToast(
        'Execution Started',
        'Schedule is running. Check logs for results.'
      );
      
      loadSchedules();
    } catch (error: unknown) {
      showErrorToast(error, { operation: 'executeSchedule' });
    }
  };

  const handleViewLogs = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowExecutionLogs(true);
    loadExecutionLogs(schedule.id);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'partial': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'partial': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D91C81]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1B2A5E]">Schedule Manager</h2>
          <p className="text-gray-600 mt-1">
            Managing schedules for <span className="font-semibold">{erpConnectionName}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91870] transition-colors"
          >
            Create Schedule
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Schedules Yet</h3>
          <p className="text-gray-600 mb-4">Create your first automated sync schedule</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91870] transition-colors"
          >
            Create Schedule
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#1B2A5E]">{schedule.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      schedule.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {schedule.syncType === 'both' ? 'Products & Inventory' : schedule.syncType.charAt(0).toUpperCase() + schedule.syncType.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Schedule:</span>{' '}
                      {schedule.schedule.type === 'cron' 
                        ? schedule.schedule.cronExpression 
                        : `Every ${schedule.schedule.intervalMinutes} minutes`}
                    </div>
                    <div>
                      <span className="font-medium">Timezone:</span> {schedule.schedule.timezone || 'UTC'}
                    </div>
                    <div>
                      <span className="font-medium">Last Run:</span> {formatDate(schedule.lastRun)}
                    </div>
                    <div>
                      <span className="font-medium">Next Run:</span> {formatDate(schedule.nextRun)}
                    </div>
                    <div>
                      <span className="font-medium">Total Runs:</span> {schedule.runCount}
                    </div>
                    <div>
                      <span className="font-medium">Notifications:</span>{' '}
                      {schedule.notifications.onFailure ? 'On Failure' : 'None'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleSchedule(schedule)}
                    className="p-2 text-gray-600 hover:text-[#D91C81] hover:bg-pink-50 rounded-lg transition-colors"
                    title={schedule.enabled ? 'Disable' : 'Enable'}
                  >
                    {schedule.enabled ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleExecuteNow(schedule)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Execute Now"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleViewLogs(schedule)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Execution Logs"
                  >
                    <History className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-[#D91C81] hover:bg-pink-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Schedule Modal */}
      {(showCreateModal || showEditModal) && (
        <ScheduleFormModal
          erpConnectionId={erpConnectionId}
          schedule={showEditModal ? selectedSchedule : null}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedSchedule(null);
          }}
          onSuccess={() => {
            loadSchedules();
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedSchedule(null);
          }}
        />
      )}

      {/* Execution Logs Modal */}
      {showExecutionLogs && selectedSchedule && (
        <ExecutionLogsModal
          schedule={selectedSchedule}
          logs={executionLogs}
          loading={logsLoading}
          onClose={() => {
            setShowExecutionLogs(false);
            setSelectedSchedule(null);
          }}
        />
      )}
    </div>
  );
}

// Schedule Form Modal Component
function ScheduleFormModal({
  erpConnectionId,
  schedule,
  onClose,
  onSuccess
}: {
  erpConnectionId: string;
  schedule: Schedule | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(schedule?.name || '');
  const [syncType, setSyncType] = useState<'products' | 'inventory' | 'both'>(schedule?.syncType || 'products');
  const [scheduleType, setScheduleType] = useState<'cron' | 'interval'>(schedule?.schedule.type || 'cron');
  const [cronExpression, setCronExpression] = useState(schedule?.schedule.cronExpression || '0 2 * * *');
  const [timezone, setTimezone] = useState(schedule?.schedule.timezone || 'UTC');
  const [intervalMinutes, setIntervalMinutes] = useState(schedule?.schedule.intervalMinutes?.toString() || '360');
  const [enabled, setEnabled] = useState(schedule?.enabled ?? true);
  const [notifyOnFailure, setNotifyOnFailure] = useState(schedule?.notifications.onFailure ?? true);
  const [emailRecipients, setEmailRecipients] = useState(schedule?.notifications.emailRecipients?.join(', ') || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      showErrorToast(new Error('Please enter a schedule name'), { operation: 'validateSchedule' });
      return;
    }

    try {
      setSaving(true);

      const scheduleData = {
        erpConnectionId,
        name: name.trim(),
        enabled,
        syncType,
        schedule: {
          type: scheduleType,
          ...(scheduleType === 'cron' ? {
            cronExpression,
            timezone
          } : {
            intervalMinutes: parseInt(intervalMinutes)
          })
        },
        notifications: {
          onSuccess: false,
          onFailure: notifyOnFailure,
          emailRecipients: emailRecipients.split(',').map(e => e.trim()).filter(Boolean)
        }
      };

      if (schedule) {
        await authApi.updateSchedule(schedule.id, scheduleData);
        showSuccessToast('Schedule Updated', 'Schedule updated successfully');
      } else {
        await authApi.createSchedule(scheduleData);
        showSuccessToast('Schedule Created', 'Schedule created successfully');
      }

      onSuccess();
    } catch (error: unknown) {
      showErrorToast(error, { operation: 'saveSchedule' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#1B2A5E]">
            {schedule ? 'Edit Schedule' : 'Create Schedule'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Product Sync"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sync Type *
            </label>
            <select
              value={syncType}
              onChange={(e) => setSyncType(e.target.value as 'products' | 'inventory' | 'both')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
            >
              <option value="products">Products Only</option>
              <option value="inventory">Inventory Only</option>
              <option value="both">Products & Inventory</option>
            </select>
          </div>

          {/* Schedule Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cron"
                  checked={scheduleType === 'cron'}
                  onChange={(e) => setScheduleType(e.target.value as 'cron' | 'interval')}
                  className="mr-2 text-[#D91C81] focus:ring-[#D91C81]"
                />
                Cron Expression
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="interval"
                  checked={scheduleType === 'interval'}
                  onChange={(e) => setScheduleType(e.target.value as 'cron' | 'interval')}
                  className="mr-2 text-[#D91C81] focus:ring-[#D91C81]"
                />
                Simple Interval
              </label>
            </div>
          </div>

          {/* Cron Builder or Interval Input */}
          {scheduleType === 'cron' ? (
            <CronBuilder
              value={cronExpression}
              onChange={setCronExpression}
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interval (minutes) *
              </label>
              <input
                type="number"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(e.target.value)}
                min="1"
                placeholder="360"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-1">
                Schedule will run every {intervalMinutes} minutes ({Math.round(parseInt(intervalMinutes) / 60 * 10) / 10} hours)
              </p>
            </div>
          )}

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Enable Schedule</div>
              <div className="text-sm text-gray-600">Schedule will run automatically when enabled</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
            </label>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyFailure"
                checked={notifyOnFailure}
                onChange={(e) => setNotifyOnFailure(e.target.checked)}
                className="mr-2 text-[#D91C81] focus:ring-[#D91C81]"
              />
              <label htmlFor="notifyFailure" className="text-sm font-medium text-gray-700">
                Send notification on failure
              </label>
            </div>

            {notifyOnFailure && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Recipients (comma-separated)
                </label>
                <input
                  type="text"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="admin@example.com, ops@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91870] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : schedule ? 'Update Schedule' : 'Create Schedule'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Execution Logs Modal Component
function ExecutionLogsModal({
  schedule,
  logs,
  loading,
  onClose
}: {
  schedule: Schedule;
  logs: ExecutionLog[];
  loading: boolean;
  onClose: () => void;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5" />;
      case 'failed': return <XCircle className="w-5 h-5" />;
      case 'partial': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#1B2A5E]">Execution History</h3>
            <p className="text-sm text-gray-600 mt-1">{schedule.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D91C81]"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No execution history yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(log.status)}`}>
                      {getStatusIcon(log.status)}
                      <span className="font-medium capitalize">{log.status}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(log.startedAt)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Sync Type:</span>
                      <span className="ml-2 font-medium capitalize">{log.syncType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Records Processed:</span>
                      <span className="ml-2 font-medium text-green-600">{log.recordsProcessed}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Records Failed:</span>
                      <span className="ml-2 font-medium text-red-600">{log.recordsFailed}</span>
                    </div>
                  </div>

                  {log.error && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-red-900 mb-1">Error:</div>
                      <div className="text-sm text-red-700">{log.error}</div>
                    </div>
                  )}

                  {log.details && (
                    <details className="mt-3">
                      <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                        View Details
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleManager;