import type { HRISConnection } from '../../types/admin';
import { useState, useEffect } from 'react';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  Database, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Settings as SettingsIcon, 
  Activity, 
  Calendar, 
  AlertTriangle 
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';
import { logger } from '../../utils/logger';

interface Client {
  id: string;
  name: string;
}

interface Site {
  id: string;
  name: string;
  clientId: string;
  isActive: boolean;
}

interface HRISProvider {
  id: string;
  name: string;
  description: string;
  authTypes: string[];
  supportsRealtime: boolean;
  logo?: string;
}

interface SyncHistory {
  id: string;
  connectionId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'partial' | 'failed';
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  recordsFailed: number;
  errors: Array<{ field: string; message: string; recordId?: string }>;
  summary: string;
}

const HRIS_PROVIDERS: HRISProvider[] = [
  {
    id: 'workday',
    name: 'Workday',
    description: 'Enterprise-grade HR, payroll, and financial management',
    authTypes: ['oauth', 'api_key'],
    supportsRealtime: true
  },
  {
    id: 'bamboohr',
    name: 'BambooHR',
    description: 'All-in-one HR software for small and medium businesses',
    authTypes: ['api_key'],
    supportsRealtime: true
  },
  {
    id: 'adp',
    name: 'ADP Workforce Now',
    description: 'Comprehensive payroll and HR solutions',
    authTypes: ['oauth', 'api_key'],
    supportsRealtime: true
  },
  {
    id: 'namely',
    name: 'Namely',
    description: 'Modern HR platform with integrated payroll',
    authTypes: ['api_key'],
    supportsRealtime: false
  },
  {
    id: 'rippling',
    name: 'Rippling',
    description: 'Employee management platform',
    authTypes: ['oauth', 'api_key'],
    supportsRealtime: true
  },
  {
    id: 'gusto',
    name: 'Gusto',
    description: 'Payroll, benefits, and HR in one place',
    authTypes: ['api_key'],
    supportsRealtime: false
  },
  {
    id: 'sftp',
    name: 'SFTP File Transfer',
    description: 'Import employee data via secure file transfer',
    authTypes: ['sftp'],
    supportsRealtime: false
  }
];

const DEFAULT_FIELD_MAPPING = {
  employeeId: 'employee_id',
  firstName: 'first_name',
  lastName: 'last_name',
  email: 'email',
  department: 'department',
  jobTitle: 'job_title',
  startDate: 'hire_date',
  status: 'employment_status'
};

interface HRISIntegrationTabProps {
  client: Client;
  sites: Site[];
  onSyncComplete?: () => void | Promise<void>;
}

export function HRISIntegrationTab({ client, sites, onSyncComplete }: HRISIntegrationTabProps) {
  const env = getCurrentEnvironment();
  const [connections, setConnections] = useState<HRISConnection[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'connections' | 'providers' | 'history'>('connections');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showFieldMappingModal, setShowFieldMappingModal] = useState(false);
  const [showSyncHistoryModal, setShowSyncHistoryModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<HRISConnection | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<HRISProvider | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<SyncHistory | null>(null);

  // Form state
  const [scopeType, setScopeType] = useState<'client' | 'sites'>('client');
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    displayName: '',
    providerId: '',
    authType: 'api_key',
    apiUrl: '',
    apiKey: '',
    username: '',
    password: '',
    clientId: '',
    clientSecret: '',
    tenantId: '',
    sftpHost: '',
    sftpPort: '22',
    sftpUsername: '',
    sftpPassword: '',
    sftpPath: '',
    syncFrequency: 'daily',
    syncTime: '02:00',
    autoImport: true,
    updateExisting: true,
    deactivateMissing: false,
    notifyOnSync: true
  });
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>(DEFAULT_FIELD_MAPPING);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

  useEffect(() => {
    void loadConnections().catch((error) => {
      console.error('Error loading connections:', error);
    });
    void loadSyncHistory().catch((error) => {
      console.error('Error loading sync history:', error);
    });
  }, [client.id]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${serverUrl}/hris/connections?clientId=${client.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Environment-ID': env.id
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load HRIS connections: ${response.status}`);
      }

      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      logger.error('Error loading HRIS connections:', error);
      showErrorToast('Failed to load HRIS connections');
    } finally {
      setLoading(false);
    }
  };

  const loadSyncHistory = async () => {
    try {
      const response = await fetch(
        `${serverUrl}/hris/sync-history?clientId=${client.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Environment-ID': env.id
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSyncHistory(data.history || []);
      }
    } catch (error) {
      logger.error('Error loading sync history:', error);
    }
  };

  const handleCreateConnection = (provider: HRISProvider) => {
    setSelectedProvider(provider);
    setFormData({
      ...formData,
      displayName: `${client.name} - ${provider.name}`,
      providerId: provider.id,
      authType: provider.authTypes[0]
    });
    setFieldMapping(DEFAULT_FIELD_MAPPING);
    setScopeType('client');
    setSelectedSiteIds([]);
    setShowConnectionModal(true);
  };

  const handleEditConnection = (connection: HRISConnection) => {
    setSelectedConnection(connection);
    setSelectedProvider(HRIS_PROVIDERS.find(p => p.id === connection.provider) || null);
    
    // Scope is determined by clientId (all connections are client-scoped in the type)
    setScopeType('client');
    setSelectedSiteIds([]);

    // Extract credentials based on type
    const creds = connection.credentials;
    let apiUrl = '';
    let apiKey = '';
    let username = '';
    let password = '';
    let clientId = '';
    let clientSecret = '';
    const tenantId = '';
    const sftpHost = '';
    const sftpPort = '22';
    const sftpUsername = '';
    const sftpPassword = '';
    const sftpPath = '';

    if (creds.type === 'api_key') {
      apiKey = creds.apiKey;
      apiUrl = creds.apiSecret || '';
    } else if (creds.type === 'oauth') {
      clientId = creds.clientId;
      clientSecret = creds.clientSecret;
      apiUrl = creds.accessToken || '';
    } else if (creds.type === 'basic_auth') {
      username = creds.username;
      password = creds.password;
    }

    setFormData({
      displayName: connection.provider,
      providerId: connection.provider,
      authType: connection.authType,
      apiUrl,
      apiKey,
      username,
      password,
      clientId,
      clientSecret,
      tenantId,
      sftpHost,
      sftpPort,
      sftpUsername,
      sftpPassword,
      sftpPath,
      syncFrequency: connection.syncSchedule.frequency,
      syncTime: connection.syncSchedule.time,
      autoImport: connection.syncSchedule.enabled,
      updateExisting: false,
      deactivateMissing: false,
      notifyOnSync: false
    });
    setFieldMapping(connection.fieldMapping);
    setShowConnectionModal(true);
  };

  const handleSaveConnection = async () => {
    try {
      // Build credentials object based on auth type
      const credentials: Record<string, string> = {};

      if (formData.authType === 'api_key') {
        credentials.apiUrl = formData.apiUrl;
        credentials.apiKey = formData.apiKey;
      } else if (formData.authType === 'oauth') {
        credentials.apiUrl = formData.apiUrl;
        credentials.clientId = formData.clientId;
        credentials.clientSecret = formData.clientSecret;
        credentials.tenantId = formData.tenantId;
      } else if (formData.authType === 'basic') {
        credentials.apiUrl = formData.apiUrl;
        credentials.username = formData.username;
        credentials.password = formData.password;
      } else if (formData.authType === 'sftp') {
        credentials.sftpHost = formData.sftpHost;
        credentials.sftpPort = formData.sftpPort;
        credentials.sftpUsername = formData.sftpUsername;
        credentials.sftpPassword = formData.sftpPassword;
        credentials.sftpPath = formData.sftpPath;
      }

      const connectionData: Record<string, unknown> = {
        id: selectedConnection?.id,
        clientId: client.id,
        providerId: formData.providerId,
        providerName: selectedProvider?.name || '',
        displayName: formData.displayName,
        authType: formData.authType,
        credentials,
        fieldMapping,
        syncSchedule: {
          enabled: formData.syncFrequency !== 'manual',
          frequency: formData.syncFrequency,
          time: formData.syncTime
        },
        syncConfig: {
          autoImport: formData.autoImport,
          updateExisting: formData.updateExisting,
          deactivateMissing: formData.deactivateMissing,
          notifyOnSync: formData.notifyOnSync
        }
      };

      // Add scope information
      if (scopeType === 'client') {
        connectionData.siteId = null;
        connectionData.siteIds = [];
      } else {
        connectionData.siteIds = selectedSiteIds;
      }

      const response = await fetch(
        `${serverUrl}/hris/connections${selectedConnection ? `/${selectedConnection.id}` : ''}`,
        {
          method: selectedConnection ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
            'X-Environment-ID': env.id
          },
          body: JSON.stringify(connectionData)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${selectedConnection ? 'update' : 'create'} connection`);
      }

      showSuccessToast(
        `HRIS connection ${selectedConnection ? 'updated' : 'created'} successfully`
      );
      
      setShowConnectionModal(false);
      setSelectedConnection(null);
      setSelectedProvider(null);
      void loadConnections().catch((error) => {
        console.error('Error reloading connections:', error);
      });
    } catch (error) {
      logger.error('Error saving HRIS connection:', error);
      showErrorToast(`Failed to ${selectedConnection ? 'update' : 'create'} connection`);
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    try {
      const response = await fetch(
        `${serverUrl}/hris/connections/${connectionId}/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Environment-ID': env.id
          }
        }
      );

      const result = await response.json();
      
      if (result.success) {
        showSuccessToast('Connection test successful');
      } else {
        showErrorToast(`Connection test failed: ${result.error}`);
      }
      
      void loadConnections().catch((error) => {
        console.error('Error reloading connections:', error);
      });
    } catch (error) {
      logger.error('Error testing connection:', error);
      showErrorToast('Failed to test connection');
    }
  };

  const handleSync = async (connectionId: string) => {
    try {
      const response = await fetch(
        `${serverUrl}/hris/connections/${connectionId}/sync`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Environment-ID': env.id
          }
        }
      );

      if (!response.ok) throw new Error('Failed to start sync');

      showSuccessToast('Sync started successfully');
      setTimeout(() => {
        void loadSyncHistory().catch((error) => {
          console.error('Error reloading sync history:', error);
        });
        void loadConnections().catch((error) => {
          console.error('Error reloading connections:', error);
        });
        if (onSyncComplete) {
          onSyncComplete();
        }
      }, 2000);
    } catch (error) {
      logger.error('Error starting sync:', error);
      showErrorToast('Failed to start sync');
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this HRIS connection?')) return;

    try {
      const response = await fetch(
        `${serverUrl}/hris/connections/${connectionId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Environment-ID': env.id
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete connection');

      showSuccessToast('HRIS connection deleted successfully');
      void loadConnections().catch((error) => {
        console.error('Error reloading connections:', error);
      });
    } catch (error) {
      logger.error('Error deleting connection:', error);
      showErrorToast('Failed to delete connection');
    }
  };

  const getScopeDisplay = (connection: HRISConnection) => {
    // All connections are client-scoped based on the type definition
    return `All Sites (Client-Level)`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HRIS integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1B2A5E] mb-2">HRIS Integration</h2>
            <p className="text-gray-600">
              Connect and sync employee data from your HR information system for {client.name}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('connections')}
              className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'connections'
                  ? 'border-[#D91C81] text-[#D91C81]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Connections ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'providers'
                  ? 'border-[#D91C81] text-[#D91C81]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Available Providers
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-[#D91C81] text-[#D91C81]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Sync History ({syncHistory.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'connections' && (
            <div className="space-y-4">
              {connections.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No HRIS Connections</h3>
                  <p className="text-gray-600 mb-6">
                    Connect your HR system to automatically sync employee data for {client.name}
                  </p>
                  <Button
                    onClick={() => setActiveTab('providers')}
                    className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Providers
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="border border-gray-200 rounded-xl p-6 hover:border-[#D91C81] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {connection.provider} Connection
                            </h3>
                            <Badge
                              variant={
                                connection.status === 'active'
                                  ? 'success'
                                  : connection.status === 'error'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {connection.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {connection.status === 'error' && <XCircle className="w-3 h-3 mr-1" />}
                              {connection.status === 'inactive' && <Clock className="w-3 h-3 mr-1" />}
                              {connection.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Provider: {connection.provider} • Auth: {connection.authType}
                          </p>
                          <p className="text-sm text-gray-600">
                            Scope: {getScopeDisplay(connection)}
                          </p>
                          {connection.lastSync && (
                            <p className="text-sm text-gray-600 mt-2">
                              Last sync: {new Date(connection.lastSync).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleTestConnection(connection.id)}
                          >
                            Test
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleSync(connection.id)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditConnection(connection)}
                          >
                            <SettingsIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleDeleteConnection(connection.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600">Sync Schedule</p>
                          <p className="font-medium">
                            {connection.syncSchedule.frequency} @ {connection.syncSchedule.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Auto Import</p>
                          <p className="font-medium">
                            {connection.syncConfig.autoImport ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Update Existing</p>
                          <p className="font-medium">
                            {connection.syncConfig.updateExisting ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Next Sync</p>
                          <p className="font-medium">
                            {connection.syncSchedule.nextSync
                              ? new Date(connection.syncSchedule.nextSync).toLocaleString()
                              : 'Manual only'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HRIS_PROVIDERS.map((provider) => (
                <div
                  key={provider.id}
                  className="border border-gray-200 rounded-xl p-6 hover:border-[#D91C81] transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{provider.name}</h3>
                      <p className="text-sm text-gray-600">{provider.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Auth: {provider.authTypes.join(', ')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {provider.supportsRealtime ? (
                        <>
                          <Activity className="w-4 h-4 text-green-600" />
                          Real-time sync supported
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 text-gray-400" />
                          Scheduled sync only
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCreateConnection(provider)}
                    className="w-full bg-[#D91C81] hover:bg-[#B01669] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {syncHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sync History</h3>
                  <p className="text-gray-600">
                    Sync history will appear here after you run your first sync
                  </p>
                </div>
              ) : (
                syncHistory.map((history) => {
                  const connection = connections.find(c => c.id === history.connectionId);
                  return (
                    <div
                      key={history.id}
                      className="border border-gray-200 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {connection?.displayName || 'Unknown Connection'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(history.startTime).toLocaleString()}
                            {history.endTime && ` - ${new Date(history.endTime).toLocaleString()}`}
                          </p>
                        </div>
                        <Badge
                          variant={
                            history.status === 'completed'
                              ? 'success'
                              : history.status === 'failed'
                              ? 'destructive'
                              : history.status === 'partial'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {history.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Processed</p>
                          <p className="text-lg font-semibold text-gray-900">{history.recordsProcessed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Created</p>
                          <p className="text-lg font-semibold text-green-600">{history.recordsCreated}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Updated</p>
                          <p className="text-lg font-semibold text-blue-600">{history.recordsUpdated}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Skipped</p>
                          <p className="text-lg font-semibold text-gray-600">{history.recordsSkipped}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Failed</p>
                          <p className="text-lg font-semibold text-red-600">{history.recordsFailed}</p>
                        </div>
                      </div>

                      {history.errors && history.errors.length > 0 && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-900 mb-2">Errors:</p>
                              <ul className="space-y-1">
                                {history.errors.slice(0, 3).map((error, idx) => (
                                  <li key={idx} className="text-sm text-red-800">
                                    {error.field}: {error.message}
                                    {error.recordId && ` (${error.recordId})`}
                                  </li>
                                ))}
                              </ul>
                              {history.errors.length > 3 && (
                                <p className="text-sm text-red-800 mt-1">
                                  ... and {history.errors.length - 3} more errors
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Connection Modal */}
      {showConnectionModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#1B2A5E]">
                {selectedConnection ? 'Edit' : 'Create'} HRIS Connection
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedProvider.name} - {client.name}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g., TechCorp - Workday"
                />
              </div>

              {/* Scope Selection */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <Label className="mb-3 block">Connection Scope</Label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scopeType === 'client'}
                      onChange={() => {
                        setScopeType('client');
                        setSelectedSiteIds([]);
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Client Level (All Sites)</div>
                      <div className="text-sm text-gray-600">
                        This connection will apply to all sites under {client.name}
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scopeType === 'sites'}
                      onChange={() => setScopeType('sites')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Specific Sites</div>
                      <div className="text-sm text-gray-600 mb-3">
                        Select which sites should use this connection
                      </div>
                      
                      {scopeType === 'sites' && (
                        <div className="space-y-2 ml-6">
                          {sites.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No sites available</p>
                          ) : (
                            sites.map((site) => (
                              <label key={site.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedSiteIds.includes(site.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSiteIds([...selectedSiteIds, site.id]);
                                    } else {
                                      setSelectedSiteIds(selectedSiteIds.filter(id => id !== site.id));
                                    }
                                  }}
                                />
                                <span className="text-sm text-gray-700">{site.name}</span>
                                {!site.isActive && (
                                  <span className="text-xs text-gray-500">(Inactive)</span>
                                )}
                              </label>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Authentication Type */}
              <div>
                <Label htmlFor="authType">Authentication Type</Label>
                <select
                  id="authType"
                  value={formData.authType}
                  onChange={(e) => setFormData({ ...formData, authType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                >
                  {selectedProvider.authTypes.map(type => (
                    <option key={type} value={type}>
                      {type.toUpperCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Credentials based on auth type */}
              {formData.authType === 'api_key' && (
                <>
                  <div>
                    <Label htmlFor="apiUrl">API URL</Label>
                    <Input
                      id="apiUrl"
                      value={formData.apiUrl}
                      onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                      placeholder="https://api.provider.com/v1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="Enter API key"
                    />
                  </div>
                </>
              )}

              {formData.authType === 'oauth' && (
                <>
                  <div>
                    <Label htmlFor="apiUrl">API URL</Label>
                    <Input
                      id="apiUrl"
                      value={formData.apiUrl}
                      onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                      placeholder="https://api.provider.com/v1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      placeholder="Enter OAuth client ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      value={formData.clientSecret}
                      onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                      placeholder="Enter OAuth client secret"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenantId">Tenant ID (Optional)</Label>
                    <Input
                      id="tenantId"
                      value={formData.tenantId}
                      onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                      placeholder="Enter tenant ID if required"
                    />
                  </div>
                </>
              )}

              {formData.authType === 'sftp' && (
                <>
                  <div>
                    <Label htmlFor="sftpHost">SFTP Host</Label>
                    <Input
                      id="sftpHost"
                      value={formData.sftpHost}
                      onChange={(e) => setFormData({ ...formData, sftpHost: e.target.value })}
                      placeholder="sftp.provider.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sftpUsername">Username</Label>
                    <Input
                      id="sftpUsername"
                      value={formData.sftpUsername}
                      onChange={(e) => setFormData({ ...formData, sftpUsername: e.target.value })}
                      placeholder="Enter SFTP username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sftpPassword">Password</Label>
                    <Input
                      id="sftpPassword"
                      type="password"
                      value={formData.sftpPassword}
                      onChange={(e) => setFormData({ ...formData, sftpPassword: e.target.value })}
                      placeholder="Enter SFTP password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sftpPath">File Path</Label>
                    <Input
                      id="sftpPath"
                      value={formData.sftpPath}
                      onChange={(e) => setFormData({ ...formData, sftpPath: e.target.value })}
                      placeholder="/exports/employees.csv"
                    />
                  </div>
                </>
              )}

              {/* Sync Configuration */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Sync Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="syncFrequency">Sync Frequency</Label>
                    <select
                      id="syncFrequency"
                      value={formData.syncFrequency}
                      onChange={(e) => setFormData({ ...formData, syncFrequency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    >
                      <option value="manual">Manual Only</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  {formData.syncFrequency !== 'manual' && (
                    <div>
                      <Label htmlFor="syncTime">Sync Time</Label>
                      <Input
                        id="syncTime"
                        type="time"
                        value={formData.syncTime}
                        onChange={(e) => setFormData({ ...formData, syncTime: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={formData.autoImport}
                      onCheckedChange={(checked) => setFormData({ ...formData, autoImport: checked })}
                    />
                    <span className="text-sm text-gray-700">Auto-import employees</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={formData.updateExisting}
                      onCheckedChange={(checked) => setFormData({ ...formData, updateExisting: checked })}
                    />
                    <span className="text-sm text-gray-700">Update existing employees</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={formData.deactivateMissing}
                      onCheckedChange={(checked) => setFormData({ ...formData, deactivateMissing: checked })}
                    />
                    <span className="text-sm text-gray-700">Deactivate employees not found in HRIS</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={formData.notifyOnSync}
                      onCheckedChange={(checked) => setFormData({ ...formData, notifyOnSync: checked })}
                    />
                    <span className="text-sm text-gray-700">Send notification after sync</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConnectionModal(false);
                  setSelectedConnection(null);
                  setSelectedProvider(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleSaveConnection()}
                className="bg-[#D91C81] hover:bg-[#B01669] text-white"
              >
                {selectedConnection ? 'Update' : 'Create'} Connection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}