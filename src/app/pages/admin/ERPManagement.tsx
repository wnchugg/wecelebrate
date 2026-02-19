import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  RefreshCw, 
  Package, 
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Activity,
  FileText,
  Settings,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { authApi } from '../../utils/api';
import { showSuccessToast, showErrorToast } from '../../utils/errorHandling';
import { FieldMapper } from '../../components/admin/FieldMapper';
import { ScheduleManager } from '../../components/admin/ScheduleManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

interface ERPConnection {
  id: string;
  name: string;
  type: 'sap' | 'oracle' | 'netsuite' | 'shopify' | 'magento' | 'woocommerce' | 'custom_api';
  status: 'active' | 'inactive' | 'error';
  config: {
    apiUrl: string;
    apiKey?: string;
    username?: string;
    clientId?: string;
    authType: 'api_key' | 'oauth' | 'basic' | 'bearer';
    customHeaders?: Record<string, string>;
  };
  syncSettings: {
    autoSyncOrders: boolean;
    autoSyncProducts: boolean;
    autoSyncInventory: boolean;
    syncInterval: number;
    lastSync?: string;
  };
  mapping: {
    orderFields: Record<string, string>;
    productFields: Record<string, string>;
    inventoryFields: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
  assignedSites?: string[];
}

interface SyncLog {
  id: string;
  erpConnectionId: string;
  type: 'order' | 'product' | 'inventory';
  status: 'success' | 'failed' | 'partial';
  recordsProcessed: number;
  recordsFailed: number;
  startedAt: string;
  completedAt: string;
  errors?: Array<{ record: string; error: string }>;
}

const ERP_TYPES = [
  { value: 'sap', label: 'SAP', icon: '🏢' },
  { value: 'oracle', label: 'Oracle', icon: '🔶' },
  { value: 'netsuite', label: 'NetSuite', icon: '☁️' },
  { value: 'shopify', label: 'Shopify', icon: '🛍️' },
  { value: 'magento', label: 'Magento', icon: '🛒' },
  { value: 'woocommerce', label: 'WooCommerce', icon: '🔷' },
  { value: 'custom_api', label: 'Custom API', icon: '⚙️' },
];

const AUTH_TYPES = [
  { value: 'api_key', label: 'API Key' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'oauth', label: 'OAuth 2.0' },
];

export function ERPManagement() {
  const [connections, setConnections] = useState<ERPConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<ERPConnection | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [syncingConnection, setSyncingConnection] = useState<string | null>(null);
  const [expandedConnection, setExpandedConnection] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<Record<string, SyncLog[]>>({});
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [showFieldMapper, setShowFieldMapper] = useState(false);
  const [fieldMappingType, setFieldMappingType] = useState<'orderFields' | 'productFields' | 'inventoryFields'>('orderFields');

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await authApi.getERPConnections() as any;
      setConnections(data.connections || []);
    } catch (error: unknown) {
      showErrorToast('Failed to load ERP connections', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const loadSyncLogs = async (connectionId: string) => {
    try {
      const data = await authApi.getERPSyncLogs(connectionId) as any;
      setSyncLogs(prev => ({ ...prev, [connectionId]: data.logs || [] }));
    } catch (error: unknown) {
      showErrorToast('Failed to load sync logs', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleTestConnection = async (connection: ERPConnection) => {
    try {
      setTestingConnection(connection.id);
      const result = await authApi.testERPConnection(connection.id) as any;

      if (result.success) {
        showSuccessToast(
          'Connection Successful',
          `${result.message} (${result.responseTime}ms)`
        );
      } else {
        showErrorToast('Connection Failed', result.message);
      }
    } catch (error: unknown) {
      showErrorToast('Connection Test Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setTestingConnection(null);
    }
  };

  const handleSyncProducts = async (connectionId: string) => {
    try {
      setSyncingConnection(connectionId);
      const result = await authApi.syncProductsFromERP(connectionId) as any;

      if (result.success) {
        showSuccessToast(
          'Products Synced',
          `Successfully synced ${result.products?.length || 0} products`
        );
        loadSyncLogs(connectionId);
      } else {
        showErrorToast('Product Sync Failed', result.error || 'Unknown error');
      }
    } catch (error: unknown) {
      showErrorToast('Product Sync Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSyncingConnection(null);
    }
  };

  const handleSyncInventory = async (connectionId: string) => {
    try {
      setSyncingConnection(connectionId);
      const result = await authApi.syncInventoryFromERP(connectionId) as any;

      if (result.success) {
        showSuccessToast(
          'Inventory Synced',
          `Successfully synced ${result.inventory?.length || 0} items`
        );
        loadSyncLogs(connectionId);
      } else {
        showErrorToast('Inventory Sync Failed', result.error || 'Unknown error');
      }
    } catch (error: unknown) {
      showErrorToast('Inventory Sync Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSyncingConnection(null);
    }
  };

  const handleDeleteConnection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ERP connection?')) {
      return;
    }

    try {
      await authApi.deleteERPConnection(id);
      showSuccessToast('ERP Connection Deleted', 'Connection removed successfully');
      loadConnections();
    } catch (error: unknown) {
      showErrorToast('Failed to delete connection', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const toggleExpand = async (connectionId: string) => {
    if (expandedConnection === connectionId) {
      setExpandedConnection(null);
    } else {
      setExpandedConnection(connectionId);
      if (!syncLogs[connectionId]) {
        await loadSyncLogs(connectionId);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            <XCircle className="w-3 h-3" />
            Inactive
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  const getERPIcon = (type: string) => {
    return ERP_TYPES.find(t => t.value === type)?.icon || '⚙️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-[#D91C81]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ERP Integrations</h1>
          <p className="text-gray-600 mt-1">
            Manage connections to ERP systems for order fulfillment and inventory sync
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add ERP Connection
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Connections</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {connections.length}
              </p>
            </div>
            <Database className="w-8 h-8 text-[#D91C81]" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {connections.filter(c => c.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {connections.filter(c => c.status === 'inactive').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {connections.filter(c => c.status === 'error').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Connections List */}
      <div className="space-y-4">
        {connections.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No ERP Connections
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first ERP integration
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add ERP Connection
            </button>
          </div>
        ) : (
          connections.map(connection => (
            <div
              key={connection.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Connection Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{getERPIcon(connection.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {connection.name}
                        </h3>
                        {getStatusBadge(connection.status)}
                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                          {ERP_TYPES.find(t => t.value === connection.type)?.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {connection.config.apiUrl}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last sync: {connection.syncSettings.lastSync 
                            ? new Date(connection.syncSettings.lastSync).toLocaleString()
                            : 'Never'}
                        </span>
                        {connection.assignedSites && connection.assignedSites.length > 0 && (
                          <span>
                            {connection.assignedSites.length} site(s) assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(connection)}
                      disabled={testingConnection === connection.id}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Test Connection"
                    >
                      {testingConnection === connection.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedConnection(connection);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit Connection"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteConnection(connection.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Connection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleExpand(connection.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Toggle Details"
                    >
                      {expandedConnection === connection.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sync Settings Summary */}
                <div className="mt-4 flex items-center gap-4">
                  {connection.syncSettings.autoSyncOrders && (
                    <span className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded">
                      Auto-sync Orders
                    </span>
                  )}
                  {connection.syncSettings.autoSyncProducts && (
                    <span className="text-xs text-gray-600 bg-green-50 px-2 py-1 rounded">
                      Auto-sync Products
                    </span>
                  )}
                  {connection.syncSettings.autoSyncInventory && (
                    <span className="text-xs text-gray-600 bg-purple-50 px-2 py-1 rounded">
                      Auto-sync Inventory
                    </span>
                  )}
                  {connection.syncSettings.syncInterval && (
                    <span className="text-xs text-gray-600">
                      Interval: {connection.syncSettings.syncInterval} min
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedConnection === connection.id && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-6 space-y-6">
                    {/* Manual Sync Actions */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Manual Sync Actions
                      </h4>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => handleSyncProducts(connection.id)}
                          disabled={syncingConnection === connection.id}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {syncingConnection === connection.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                          Sync Products
                        </button>
                        <button
                          onClick={() => handleSyncInventory(connection.id)}
                          disabled={syncingConnection === connection.id}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {syncingConnection === connection.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Database className="w-4 h-4" />
                          )}
                          Sync Inventory
                        </button>
                        <button
                          onClick={() => {
                            setSelectedConnection(connection);
                            setShowScheduleManager(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91870] transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          Manage Schedules
                        </button>
                        <button
                          onClick={() => {
                            setSelectedConnection(connection);
                            setFieldMappingType('orderFields');
                            setShowFieldMapper(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#00B4CC] text-white rounded-lg hover:bg-[#0099B3] transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Configure Field Mapping
                        </button>
                      </div>
                    </div>

                    {/* Sync Logs */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Recent Sync Logs
                      </h4>
                      {syncLogs[connection.id] && syncLogs[connection.id].length > 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                          {syncLogs[connection.id].slice(0, 5).map(log => (
                            <div key={log.id} className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {log.status === 'success' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : log.status === 'failed' ? (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                      {log.type} Sync
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      log.status === 'success' 
                                        ? 'bg-green-100 text-green-800'
                                        : log.status === 'failed'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {log.status}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {log.recordsProcessed} processed, {log.recordsFailed} failed
                                    {' • '}
                                    {new Date(log.completedAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center text-sm text-gray-600">
                          No sync logs available
                        </div>
                      )}
                    </div>

                    {/* Configuration Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Configuration
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <dt className="font-medium text-gray-700">Auth Type</dt>
                            <dd className="text-gray-600 mt-1 capitalize">
                              {connection.config.authType.replace('_', ' ')}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-700">API URL</dt>
                            <dd className="text-gray-600 mt-1 break-all">
                              {connection.config.apiUrl}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-700">Created</dt>
                            <dd className="text-gray-600 mt-1">
                              {new Date(connection.createdAt).toLocaleDateString()}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-700">Last Updated</dt>
                            <dd className="text-gray-600 mt-1">
                              {new Date(connection.updatedAt).toLocaleDateString()}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <ERPConnectionModal
          connection={showEditModal ? selectedConnection : null}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedConnection(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedConnection(null);
            loadConnections();
          }}
        />
      )}

      {/* Schedule Manager */}
      {showScheduleManager && selectedConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <ScheduleManager
              erpConnectionId={selectedConnection.id}
              erpConnectionName={selectedConnection.name}
              onClose={() => {
                setShowScheduleManager(false);
                setSelectedConnection(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Field Mapper Modal */}
      {showFieldMapper && selectedConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-[#1B2A5E]">Field Mapping Configuration</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedConnection.name} - {ERP_TYPES.find(t => t.value === selectedConnection.type)?.label}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowFieldMapper(false);
                  setSelectedConnection(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Field Type Tabs */}
              <div className="flex gap-2 border-b border-gray-200">
                <button
                  onClick={() => setFieldMappingType('orderFields')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    fieldMappingType === 'orderFields'
                      ? 'border-[#D91C81] text-[#D91C81]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Order Fields
                </button>
                <button
                  onClick={() => setFieldMappingType('productFields')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    fieldMappingType === 'productFields'
                      ? 'border-[#D91C81] text-[#D91C81]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Product Fields
                </button>
                <button
                  onClick={() => setFieldMappingType('inventoryFields')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    fieldMappingType === 'inventoryFields'
                      ? 'border-[#D91C81] text-[#D91C81]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Inventory Fields
                </button>
              </div>

              {/* Field Mapper Component */}
              <FieldMapper
                title={
                  fieldMappingType === 'orderFields'
                    ? 'Order Field Mapping'
                    : fieldMappingType === 'productFields'
                    ? 'Product Field Mapping'
                    : 'Inventory Field Mapping'
                }
                mappings={selectedConnection.mapping[fieldMappingType]}
                onMappingsChange={async (newMappings) => {
                  try {
                    await authApi.updateERPConnection(selectedConnection.id, {
                      mapping: {
                        ...selectedConnection.mapping,
                        [fieldMappingType]: newMappings
                      }
                    } as any);
                    showSuccessToast('Field Mapping Updated', 'Mappings saved successfully');
                    loadConnections();
                  } catch (error: unknown) {
                    showErrorToast('Failed to save mappings', error instanceof Error ? error.message : 'Unknown error');
                  }
                }}
                placeholder={{
                  source: 'JALA field name',
                  target: 'ERP field name'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal Component for Creating/Editing ERP Connections
interface ERPConnectionModalProps {
  connection: ERPConnection | null;
  onClose: () => void;
  onSave: () => void;
}

function ERPConnectionModal({ connection, onClose, onSave }: ERPConnectionModalProps) {
  const [formData, setFormData] = useState({
    name: connection?.name || '',
    type: connection?.type || 'custom_api',
    status: connection?.status || 'active',
    apiUrl: connection?.config.apiUrl || '',
    authType: connection?.config.authType || 'api_key',
    apiKey: connection?.config.apiKey || '',
    username: connection?.config.username || '',
    autoSyncOrders: connection?.syncSettings.autoSyncOrders || false,
    autoSyncProducts: connection?.syncSettings.autoSyncProducts || false,
    autoSyncInventory: connection?.syncSettings.autoSyncInventory || false,
    syncInterval: connection?.syncSettings.syncInterval || 60,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const payload = {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        config: {
          apiUrl: formData.apiUrl,
          authType: formData.authType,
          apiKey: formData.apiKey,
          username: formData.username,
        },
        syncSettings: {
          autoSyncOrders: formData.autoSyncOrders,
          autoSyncProducts: formData.autoSyncProducts,
          autoSyncInventory: formData.autoSyncInventory,
          syncInterval: formData.syncInterval,
        },
        mapping: connection?.mapping || {
          orderFields: {},
          productFields: {},
          inventoryFields: {},
        },
      };

      if (connection) {
        await authApi.updateERPConnection(connection.id, payload as any);
        showSuccessToast('Connection Updated', 'ERP connection updated successfully');
      } else {
        await authApi.createERPConnection(payload as any);
        showSuccessToast('Connection Created', 'ERP connection created successfully');
      }

      onSave();
    } catch (error: unknown) {
      showErrorToast('Failed to save connection', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {connection ? 'Edit ERP Connection' : 'Add ERP Connection'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                placeholder="My ERP System"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ERP Type *
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              >
                {ERP_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          {/* API Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">API Configuration</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL *
              </label>
              <input
                type="url"
                value={formData.apiUrl}
                onChange={e => setFormData({ ...formData, apiUrl: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                placeholder="https://api.example.com/v1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authentication Type *
              </label>
              <select
                value={formData.authType}
                onChange={e => setFormData({ ...formData, authType: e.target.value as any })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              >
                {AUTH_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {(formData.authType === 'api_key' || formData.authType === 'bearer') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key / Token *
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  placeholder="Enter your API key"
                />
              </div>
            )}

            {formData.authType === 'basic' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>

          {/* Sync Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Sync Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.autoSyncOrders}
                  onChange={e => setFormData({ ...formData, autoSyncOrders: e.target.checked })}
                  className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                />
                <span className="text-sm text-gray-700">Auto-sync Orders</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.autoSyncProducts}
                  onChange={e => setFormData({ ...formData, autoSyncProducts: e.target.checked })}
                  className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                />
                <span className="text-sm text-gray-700">Auto-sync Products</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.autoSyncInventory}
                  onChange={e => setFormData({ ...formData, autoSyncInventory: e.target.checked })}
                  className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                />
                <span className="text-sm text-gray-700">Auto-sync Inventory</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sync Interval (minutes)
              </label>
              <input
                type="number"
                value={formData.syncInterval}
                onChange={e => setFormData({ ...formData, syncInterval: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#D91C81] hover:bg-[#B91670] text-white"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Connection</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ERPManagement;