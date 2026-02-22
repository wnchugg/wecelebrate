import { useState, useEffect } from 'react';
import { Clock, Calendar, Send, XCircle, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { getAccessToken } from '../../lib/apiClient';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';
import { useLanguage } from '../../context/LanguageContext';
import { translateWithParams } from '../../utils/translationHelpers';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

interface ScheduledEmail {
  id: string;
  siteId: string;
  trigger: string;
  context: {
    recipientEmail: string;
    variables: Record<string, string>;
  };
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  createdAt: string;
  sentAt?: string;
  error?: string;
}

interface ScheduledEmailStats {
  pending: number;
  sent: number;
  failed: number;
  cancelled: number;
  total: number;
}

export function ScheduledEmailManagement() {
  const { currentSite } = useSite();
  const { t } = useLanguage();
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [stats, setStats] = useState<ScheduledEmailStats | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (currentSite) {
      void loadScheduledEmails().catch((error) => {
        console.error('Error loading scheduled emails:', error);
      });
      void loadStats().catch((error) => {
        console.error('Error loading stats:', error);
      });
    }
  }, [currentSite?.id, filterStatus]);

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

  const loadScheduledEmails = async () => {
    if (!currentSite) return;
    
    setIsLoading(true);
    try {
      const statusParam = filterStatus !== 'all' ? `&status=${filterStatus}` : '';
      const response = await fetch(
        `${API_BASE}/scheduled-emails?siteId=${currentSite.id}${statusParam}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) throw new Error('Failed to fetch scheduled emails');

      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error: unknown) {
      toast.error(t('notification.error.failedToLoadEmails'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/email/scheduled/stats`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data.stats);
    } catch (error: unknown) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/email/scheduled/${id}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to cancel email');
      
      toast.success(t('notification.success.emailCancelled'));
      void loadScheduledEmails().catch((error) => {
        console.error('Error reloading emails:', error);
      });
      void loadStats().catch((error) => {
        console.error('Error reloading stats:', error);
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('notification.error.unknownError'));
    }
  };

  const handleRetry = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/email/scheduled/${id}/retry`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to retry email');
      
      toast.success(t('notification.success.emailRetry'));
      void loadScheduledEmails().catch((error) => {
        console.error('Error reloading emails:', error);
      });
      void loadStats().catch((error) => {
        console.error('Error reloading stats:', error);
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('notification.error.unknownError'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scheduled email?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/email/scheduled/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to delete email');
      
      toast.success(t('notification.success.emailDeleted'));
      void loadScheduledEmails().catch((error) => {
        console.error('Error reloading emails:', error);
      });
      void loadStats().catch((error) => {
        console.error('Error reloading stats:', error);
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('notification.error.unknownError'));
    }
  };

  const handleProcessEmails = async () => {
    try {
      const response = await fetch(`${API_BASE}/scheduled-emails/process`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to process emails');

      const data = await response.json();
      toast.success(
        translateWithParams(t, 'notification.success.emailsProcessed', { processed: data.processed, sent: data.sent, failed: data.failed })
      );
      void loadScheduledEmails().catch((error) => {
        console.error('Error reloading emails:', error);
      });
      void loadStats().catch((error) => {
        console.error('Error reloading stats:', error);
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('notification.error.unknownError'));
    }
  };

  const handleScheduleEmail = async (emailData: any) => {
    try {
      const response = await fetch(`${API_BASE}/scheduled-emails`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...emailData,
          siteId: currentSite?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to schedule email');

      toast.success(t('notification.success.emailScheduled'));
      setShowForm(false);
      void loadScheduledEmails().catch((error) => {
        console.error('Error reloading emails:', error);
      });
      void loadStats().catch((error) => {
        console.error('Error reloading stats:', error);
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('notification.error.unknownError'));
    }
  };

  if (!currentSite) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">
          <p>Please select a site to manage scheduled emails.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'sent':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheduled Email Management</h1>
          <p className="text-gray-600">
            Manage scheduled emails and automation for{' '}
            <span className="font-semibold">{currentSite.name}</span>
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Sent</div>
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Failed</div>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Cancelled</div>
              <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total</div>
              <div className="text-2xl font-bold text-[#D91C81]">{stats.total}</div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => void handleProcessEmails()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Process Due Emails
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91669] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Email
            </button>
          </div>
        </div>

        {/* Emails List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Scheduled Emails</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading scheduled emails...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No scheduled emails</p>
              <p className="text-gray-500 text-sm">
                {filterStatus !== 'all'
                  ? `No ${filterStatus} emails found`
                  : 'Schedule an email to get started'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {emails.map((email) => (
                <div key={email.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                            email.status
                          )}`}
                        >
                          {getStatusIcon(email.status)}
                          {email.status}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {email.trigger.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        <strong>To:</strong> {email.context.recipientEmail}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Scheduled: {new Date(email.scheduledFor).toLocaleString()}
                          </span>
                        </div>
                        {email.sentAt && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            <span>Sent: {new Date(email.sentAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {email.error && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                          <strong>Error:</strong> {email.error}
                        </div>
                      )}
                    </div>

                    {email.status === 'pending' && (
                      <button
                        onClick={() => void handleCancel(email.id)}
                        className="ml-4 p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Email Form Modal */}
        {showForm && (
          <ScheduleEmailForm
            siteId={currentSite.id}
            onSave={() => void handleScheduleEmail()}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}

// Schedule Email Form Component
interface ScheduleEmailFormProps {
  siteId: string;
  onSave: (email: any) => void;
  onCancel: () => void;
}

function ScheduleEmailForm({ siteId, onSave, onCancel }: ScheduleEmailFormProps) {
  const [formData, setFormData] = useState({
    trigger: 'employee_added',
    recipientEmail: '',
    scheduledFor: '',
    variables: {} as Record<string, string>,
  });

  const triggerOptions = [
    { value: 'employee_added', label: 'Employee Added', vars: ['userName', 'siteName', 'companyName', 'magicLink'] },
    { value: 'gift_selected', label: 'Gift Selected', vars: ['userName', 'giftName'] },
    { value: 'order_placed', label: 'Order Placed', vars: ['userName', 'orderNumber'] },
    { value: 'order_shipped', label: 'Order Shipped', vars: ['userName', 'orderNumber', 'trackingNumber', 'carrier'] },
    { value: 'order_delivered', label: 'Order Delivered', vars: ['userName', 'orderNumber'] },
    { value: 'selection_expiring', label: 'Selection Expiring', vars: ['userName', 'siteName', 'expiryDate', 'daysRemaining'] },
    { value: 'anniversary_approaching', label: 'Anniversary Approaching', vars: ['userName', 'anniversaryDate', 'yearsOfService'] },
  ];

  const selectedTrigger = triggerOptions.find(t => t.value === formData.trigger);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      trigger: formData.trigger,
      context: {
        recipientEmail: formData.recipientEmail,
        variables: formData.variables,
      },
      scheduledFor: new Date(formData.scheduledFor).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Schedule Email</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Type
            </label>
            <select
              value={formData.trigger}
              onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value, variables: {} }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            >
              {triggerOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Template Variables
            </label>
            <div className="space-y-3">
              {selectedTrigger?.vars.map(varName => (
                <div key={varName}>
                  <label className="block text-xs text-gray-600 mb-1">{varName}</label>
                  <input
                    type="text"
                    value={formData.variables[varName] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      variables: { ...prev.variables, [varName]: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none text-sm"
                    placeholder={`Enter ${varName}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91669] transition-colors"
            >
              Schedule Email
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}