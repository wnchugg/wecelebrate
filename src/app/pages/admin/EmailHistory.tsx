import { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle, XCircle, AlertCircle, Eye, RefreshCw, Filter } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { EmailHistory, fetchEmailHistory } from '../../services/automationApi';
import { useEmailTemplate } from '../../context/EmailTemplateContext';
import { toast } from 'sonner';

export function EmailHistoryPage() {
  const { currentSite } = useSite();
  const { siteTemplates } = useEmailTemplate();
  const [history, setHistory] = useState<EmailHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'failed' | 'bounced'>('all');
  const [total, setTotal] = useState(0);
  const [showing, setShowing] = useState(0);

  useEffect(() => {
    if (currentSite) {
      loadHistory();
    }
  }, [currentSite?.id]);

  const loadHistory = async () => {
    if (!currentSite) return;
    
    setIsLoading(true);
    try {
      const result = await fetchEmailHistory(currentSite.id, 100);
      setHistory(result.history);
      setTotal(result.total);
      setShowing(result.showing);
    } catch (error: unknown) {
      toast.error('Failed to load email history');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentSite) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">
          <p>Please select a site to view email history.</p>
        </div>
      </div>
    );
  }

  const filteredHistory = filterStatus === 'all' 
    ? history 
    : history.filter(h => h.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
            <CheckCircle className="w-3 h-3" />
            Sent
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'bounced':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 rounded">
            <AlertCircle className="w-3 h-3" />
            Bounced
          </span>
        );
      default:
        return null;
    }
  };

  const getTemplateName = (templateId: string) => {
    const template = siteTemplates.find(t => t.id === templateId);
    return template?.name || 'Unknown Template';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      employee_added: 'Employee Added',
      gift_selected: 'Gift Selected',
      order_placed: 'Order Placed',
      order_shipped: 'Order Shipped',
      order_delivered: 'Order Delivered',
      selection_expiring: 'Selection Expiring',
      anniversary_approaching: 'Anniversary Approaching',
    };
    return labels[trigger] || trigger;
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email History</h1>
          <p className="text-gray-600">
            View all automated emails sent for <span className="font-semibold">{currentSite.name}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-sm text-gray-600">Total Emails</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {history.filter(h => h.status === 'sent').length}
                </p>
                <p className="text-sm text-gray-600">Sent</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {history.filter(h => h.status === 'failed').length}
                </p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {history.filter(h => h.status === 'bounced').length}
                </p>
                <p className="text-sm text-gray-600">Bounced</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              >
                <option value="all">All Status</option>
                <option value="sent">Sent Only</option>
                <option value="failed">Failed Only</option>
                <option value="bounced">Bounced Only</option>
              </select>
              <span className="text-sm text-gray-600">
                Showing {filteredHistory.length} of {total} emails
              </span>
            </div>
            <button
              onClick={loadHistory}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#D91C81] hover:bg-pink-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Email History List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading email history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No emails sent yet</p>
              <p className="text-gray-500 text-sm">
                Emails will appear here when automation rules trigger
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredHistory.map((entry) => (
                <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{entry.subject}</h3>
                        {getStatusBadge(entry.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{entry.recipientEmail}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(entry.sentAt)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Template:</span>{' '}
                          <span className="font-medium">{getTemplateName(entry.templateId)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Trigger:</span>{' '}
                          <span className="font-medium">{getTriggerLabel(entry.trigger)}</span>
                        </div>
                      </div>

                      {entry.messageId && (
                        <div className="text-xs text-gray-500 font-mono">
                          Message ID: {entry.messageId}
                        </div>
                      )}

                      {entry.error && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                          <strong>Error:</strong> {entry.error}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        className="p-2 text-gray-600 hover:text-[#D91C81] hover:bg-pink-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}