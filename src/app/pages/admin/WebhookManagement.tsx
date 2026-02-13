import { useState, useEffect } from 'react';
import { Webhook, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Copy, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { getAccessToken } from '../../lib/apiClient';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

interface WebhookConfig {
  id: string;
  siteId: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed';
  statusCode?: number;
  attemptedAt: string;
  duration?: number;
  error?: string;
}

export function WebhookManagement() {
  const { currentSite } = useSite();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] as string[] });

  useEffect(() => {
    if (currentSite) {
      loadWebhooks();
      loadDeliveries();
    }
  }, [currentSite?.id]);

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

  const loadWebhooks = async () => {
    if (!currentSite) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/webhooks?siteId=${currentSite.id}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch webhooks');

      const data = await response.json();
      setWebhooks(data.webhooks || []);
    } catch (error: unknown) {
      toast.error('Failed to load webhooks');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeliveries = async () => {
    if (!currentSite) return;
    
    try {
      const response = await fetch(`${API_BASE}/webhooks/deliveries?siteId=${currentSite.id}&limit=20`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch deliveries');

      const data = await response.json();
      setDeliveries(data.deliveries || []);
    } catch (error: unknown) {
      console.error('Failed to load webhook deliveries:', error);
    }
  };

  const handleCreate = async () => {
    if (!newWebhook.url || !newWebhook.events.length) {
      toast.error('Please provide URL and select at least one event');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/webhooks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...newWebhook, siteId: currentSite?.id }),
      });

      if (!response.ok) throw new Error('Failed to create webhook');

      toast.success('Webhook created successfully');
      setShowCreateDialog(false);
      setNewWebhook({ url: '', events: [] });
      loadWebhooks();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/webhooks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingWebhook),
      });

      if (!response.ok) throw new Error('Failed to update webhook');

      toast.success('Webhook updated successfully');
      setEditingWebhook(null);
      loadWebhooks();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/webhooks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to delete webhook');

      toast.success('Webhook deleted successfully');
      loadWebhooks();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleToggleWebhook = async (webhook: WebhookConfig) => {
    try {
      const response = await fetch(`${API_BASE}/webhooks/${webhook.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...webhook, enabled: !webhook.enabled }),
      });

      if (!response.ok) throw new Error('Failed to update webhook');

      toast.success(webhook.enabled ? 'Webhook disabled' : 'Webhook enabled');
      loadWebhooks();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const copyIncomingWebhookUrl = () => {
    if (!currentSite) return;
    const url = `${API_BASE}/webhooks/incoming/${currentSite.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Webhook URL copied to clipboard');
  };

  if (!currentSite) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">
          <p>Please select a site to manage webhooks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhook Management</h1>
          <p className="text-gray-600">
            Configure webhooks to integrate email automation with external systems for{' '}
            <span className="font-semibold">{currentSite.name}</span>
          </p>
        </div>

        {/* Incoming Webhook URL */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Incoming Webhook URL</h3>
              <p className="text-sm text-gray-600 mb-3">
                External systems can POST to this URL to trigger email automation events
              </p>
              <div className="bg-white rounded border border-gray-300 p-3 font-mono text-sm text-gray-700 break-all">
                {`${API_BASE}/webhooks/incoming/${currentSite.id}`}
              </div>
            </div>
            <button
              onClick={copyIncomingWebhookUrl}
              className="ml-4 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
              title="Copy URL"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Outgoing Webhooks */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Outgoing Webhooks</h2>
              <p className="text-sm text-gray-600 mt-1">
                Send notifications to external URLs when automation events occur
              </p>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91669] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Webhook
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading webhooks...</p>
            </div>
          ) : webhooks.length === 0 ? (
            <div className="p-12 text-center">
              <Webhook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No webhooks configured</p>
              <p className="text-gray-500 text-sm">
                Create a webhook to send notifications to external services
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                        {webhook.enabled ? (
                          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
                            Enabled
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            Disabled
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mb-2 font-mono break-all">
                        {webhook.url}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleWebhook(webhook)}
                        className="p-2 text-gray-600 hover:text-[#D91C81] hover:bg-pink-50 rounded-lg transition-colors"
                        title={webhook.enabled ? 'Disable' : 'Enable'}
                      >
                        {webhook.enabled ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingWebhook(webhook);
                          setShowCreateDialog(true);
                        }}
                        className="p-2 text-gray-600 hover:text-[#D91C81] hover:bg-pink-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(webhook.id)}
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
        </div>

        {/* Recent Deliveries */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Deliveries</h2>
            <p className="text-sm text-gray-600 mt-1">Last 20 webhook delivery attempts</p>
          </div>

          {deliveries.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No deliveries yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {delivery.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{delivery.event}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(delivery.attemptedAt).toLocaleString()}
                          {delivery.duration && ` • ${delivery.duration}ms`}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {delivery.statusCode && `HTTP ${delivery.statusCode}`}
                    </div>
                  </div>
                  {delivery.error && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                      {delivery.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Webhook Form Modal */}
        {showCreateDialog && (
          <WebhookForm
            webhook={editingWebhook}
            siteId={currentSite.id}
            onSave={editingWebhook ? (() => handleUpdate(editingWebhook.id)) as any : handleCreate as any}
            onCancel={() => {
              setShowCreateDialog(false);
              setEditingWebhook(null);
            }}
            newWebhook={newWebhook}
            setNewWebhook={setNewWebhook}
          />
        )}
      </div>
    </div>
  );
}

// Webhook Form Component
interface WebhookFormProps {
  webhook: WebhookConfig | null;
  siteId: string;
  onSave: (webhook: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  newWebhook: { url: string; events: string[] };
  setNewWebhook: (webhook: { url: string; events: string[] }) => void;
}

function WebhookForm({ webhook, siteId, onSave, onCancel, newWebhook, setNewWebhook }: WebhookFormProps) {
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    url: webhook?.url || '',
    secret: webhook?.secret || crypto.randomUUID(),
    events: webhook?.events || [],
    enabled: webhook?.enabled ?? true,
  });

  const eventOptions = [
    'employee_added',
    'gift_selected',
    'order_placed',
    'order_shipped',
    'order_delivered',
    'selection_expiring',
    'anniversary_approaching',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      siteId,
    });
  };

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {webhook ? 'Edit Webhook' : 'Create Webhook'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              placeholder="https://your-server.com/webhook"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key
            </label>
            <input
              type="text"
              value={formData.secret}
              onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for signature verification in the X-Webhook-Signature header
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Events to Subscribe
            </label>
            <div className="space-y-2">
              {eventOptions.map((event) => (
                <label key={event} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                  />
                  <span className="text-sm text-gray-700">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
              Enable webhook
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91669] transition-colors"
            >
              {webhook ? 'Update Webhook' : 'Create Webhook'}
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