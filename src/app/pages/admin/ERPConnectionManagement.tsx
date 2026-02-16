import { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  CheckCircle, 
  RefreshCw, 
  Activity, 
  FileText, 
  TrendingUp, 
  Server, 
  Clock, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Loader2, 
  TestTube2, 
  Wifi, 
  Upload 
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/errorHandling';
import { ERPConnectionForm } from '../../components/admin/ERPConnectionForm';

// Type definitions
type ERPConnectionMethod = 'api' | 'doi' | 'sftp';
type ERPDataType = 'orders' | 'products' | 'order_status' | 'inventory' | 'employees' | 'invoices';

interface ERPConnection {
  id: string;
  name: string;
  provider: string;
  connectionMethod: ERPConnectionMethod;
  status: 'active' | 'inactive';
  lastSync?: string;
  createdAt?: string;
  credentials: any;
  settings: any;
}

interface ERPSyncLog {
  id: string;
  connectionId: string;
  dataType: ERPDataType;
  status: 'success' | 'failed' | 'partial';
  recordsProcessed: number;
  timestamp: string;
  duration?: number;
  error?: string;
}

// Mock ERP integration service
const erpIntegrationService = {
  getERPConnections: async (): Promise<ERPConnection[]> => {
    return [];
  },
  getSyncLogs: async (): Promise<ERPSyncLog[]> => {
    return [];
  },
  testERPConnection: async (id: string) => {
    return { success: true, responseTime: 150, message: 'Connection successful' };
  },
  triggerSync: async (connectionId: string, dataType: ERPDataType) => {
    console.warn('Triggering sync:', connectionId, dataType);
  },
  deleteERPConnection: async (connectionId: string) => {
    console.warn('Deleting connection:', connectionId);
  },
};

export function ERPConnectionManagement() {
  const [connections, setConnections] = useState<ERPConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<ERPConnection | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [expandedConnection, setExpandedConnection] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<ERPSyncLog[]>([]);
  const [activeTab, setActiveTab] = useState<'connections' | 'sync-logs' | 'statistics'>('connections');

  useEffect(() => {
    loadConnections();
    loadSyncLogs();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await erpIntegrationService.getERPConnections();
      setConnections(data);
    } catch (error) {
      showErrorToast('Failed to load ERP connections');
    } finally {
      setLoading(false);
    }
  };

  const loadSyncLogs = async () => {
    try {
      const logs = await erpIntegrationService.getSyncLogs();
      setSyncLogs(logs);
    } catch (error) {
      console.error('Failed to load sync logs:', error);
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    setTestingConnection(connectionId);
    try {
      const result = await erpIntegrationService.testERPConnection(connectionId);
      if (result.success) {
        showSuccessToast(`Connection successful! Response time: ${result.responseTime}ms`);
      } else {
        showErrorToast(`Connection failed: ${result.message}`);
      }
    } catch (error) {
      showErrorToast('Failed to test connection');
    } finally {
      setTestingConnection(null);
    }
  };

  const handleTriggerSync = async (connectionId: string, dataType: ERPDataType) => {
    try {
      await erpIntegrationService.triggerSync(connectionId, dataType);
      showSuccessToast(`${dataType} sync started successfully`);
      await loadSyncLogs();
    } catch (error) {
      showErrorToast(`Failed to trigger ${dataType} sync`);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this ERP connection?')) {
      return;
    }
    
    try {
      await erpIntegrationService.deleteERPConnection(connectionId);
      showSuccessToast('ERP connection deleted successfully');
      await loadConnections();
    } catch (error) {
      showErrorToast('Failed to delete ERP connection');
    }
  };

  const getConnectionMethodIcon = (method: ERPConnectionMethod) => {
    switch (method) {
      case 'api':
        return <Wifi className="w-5 h-5" />;
      case 'doi':
        return <Server className="w-5 h-5" />;
      case 'sftp':
        return <Upload className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'testing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'syncing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const statistics = {
    totalConnections: connections.length,
    activeConnections: connections.filter(c => c.status === 'active').length,
    totalSyncs: syncLogs.length,
    recentSyncs: syncLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return logDate > dayAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ERP Integration Management</h1>
          <p className="text-gray-600 mt-1">Manage connections, sync data, and monitor integrations</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          New ERP Connection
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-5 h-5 text-[#D91C81]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{statistics.totalConnections}</p>
          <p className="text-sm text-gray-600 mt-1">Total Connections</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{statistics.activeConnections}</p>
          <p className="text-sm text-gray-600 mt-1">Active Connections</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{statistics.totalSyncs}</p>
          <p className="text-sm text-gray-600 mt-1">Total Syncs</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{statistics.recentSyncs}</p>
          <p className="text-sm text-gray-600 mt-1">Syncs (24h)</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-2 p-2">
            {[
              { id: 'connections', label: 'Connections', icon: Database },
              { id: 'sync-logs', label: 'Sync Logs', icon: FileText },
              { id: 'statistics', label: 'Statistics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#D91C81] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <div className="space-y-4">
              {connections.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No ERP Connections</h3>
                  <p className="text-gray-600 mb-6">Get started by creating your first ERP connection</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Connection
                  </button>
                </div>
              ) : (
                connections.map((connection) => (
                  <div key={connection.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Connection Header */}
                    <div className="bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setExpandedConnection(
                              expandedConnection === connection.id ? null : connection.id
                            )}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {expandedConnection === connection.id ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                          
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              connection.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {getConnectionMethodIcon(connection.connectionMethod)}
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900">{connection.name}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(connection.status)}`}>
                                  {connection.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Server className="w-4 h-4" />
                                  {connection.provider}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Activity className="w-4 h-4" />
                                  {connection.connectionMethod.toUpperCase()}
                                </span>
                                {connection.lastSync && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Last sync: {new Date(connection.lastSync).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTestConnection(connection.id)}
                            disabled={testingConnection === connection.id}
                            className="px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            {testingConnection === connection.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <TestTube2 className="w-4 h-4" />
                            )}
                            Test
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedConnection(connection);
                              setShowEditModal(true);
                            }}
                            className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteConnection(connection.id)}
                            className="px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedConnection === connection.id && (
                      <div className="p-6 border-t border-gray-200 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Connection Details */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Connection Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Method:</span>
                                <span className="font-medium text-gray-900">{connection.connectionMethod.toUpperCase()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Provider:</span>
                                <span className="font-medium text-gray-900">{connection.provider}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Created:</span>
                                <span className="font-medium text-gray-900">
                                  {new Date(connection.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {connection.settings.syncSchedule && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Schedule:</span>
                                  <span className="font-medium text-gray-900">{connection.settings.syncSchedule}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Enabled Data Types */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Enabled Data Sync</h4>
                            <div className="space-y-2">
                              {connection.settings.enabledDataTypes.map((dataType: ERPDataType) => (
                                <div key={dataType} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="text-sm text-gray-900 capitalize">{dataType}</span>
                                  <button
                                    onClick={() => handleTriggerSync(connection.id, dataType)}
                                    className="px-3 py-1 text-xs text-[#D91C81] hover:bg-white rounded transition-colors flex items-center gap-1"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    Sync Now
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sync Logs Tab */}
          {activeTab === 'sync-logs' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Connection</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {syncLogs.map((log) => {
                      const connection = connections.find(c => c.id === log.connectionId);
                      return (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {connection?.name || log.connectionId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {log.dataType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.duration ? `${log.duration}s` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.recordsProcessed}
                            {log.error && (
                              <span className="text-red-600 ml-1">({log.error})</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSyncStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sync Statistics</h3>
                <p className="text-gray-600">Detailed analytics coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ERPConnectionForm
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false);
            loadConnections();
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedConnection && (
        <ERPConnectionForm
          connection={selectedConnection}
          onClose={() => {
            setShowEditModal(false);
            setSelectedConnection(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedConnection(null);
            loadConnections();
          }}
        />
      )}
    </div>
  );
}

export default ERPConnectionManagement;