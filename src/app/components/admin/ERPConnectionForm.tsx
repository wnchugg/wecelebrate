import { useState } from 'react';
import { 
  X, 
  Loader2, 
  Database, 
  Key, 
  Wifi, 
  Server, 
  Upload, 
  FileText, 
  Clock, 
  Eye, 
  EyeOff, 
  TestTube2, 
  Save, 
  Link as LinkIcon 
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/errorHandling';

// Type definitions for ERP integration
type ERPConnectionMethod = 'api' | 'doi' | 'sftp';
type ERPDataType = 'orders' | 'products' | 'order_status' | 'inventory' | 'employees' | 'invoices';

interface ERPConnection {
  id: string;
  name: string;
  provider: string;
  connectionMethod: ERPConnectionMethod;
  status: 'active' | 'inactive';
  credentials: {
    apiUrl?: string;
    apiKey?: string;
    apiSecret?: string;
    oauthToken?: string;
    doiEndpoint?: string;
    doiUsername?: string;
    doiPassword?: string;
    sftpHost?: string;
    sftpPort?: number;
    sftpUsername?: string;
    sftpPassword?: string;
    sftpPath?: string;
  };
  settings: {
    timeout: number;
    retryAttempts: number;
    batchSize: number;
    syncSchedule: string;
    enabledDataTypes: ERPDataType[];
  };
}

// Mock ERP integration service
const erpIntegrationService = {
  updateERPConnection: async (id: string, data: Partial<ERPConnection>) => {
    console.warn('Updating ERP connection:', id, data);
  },
  createERPConnection: async (data: Omit<ERPConnection, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncAt'>) => {
    console.warn('Creating ERP connection:', data);
  },
  testERPConnection: async (id: string) => {
    return { success: true, responseTime: 150, message: 'Connection successful' };
  },
};

interface ERPConnectionFormProps {
  connection?: ERPConnection;
  onClose: () => void;
  onSave: () => void;
}

export function ERPConnectionForm({ connection, onClose, onSave }: ERPConnectionFormProps) {
  const isEdit = !!connection;
  
  // Form state
  const [name, setName] = useState(connection?.name || '');
  const [provider, setProvider] = useState(connection?.provider || 'SAP');
  const [connectionMethod, setConnectionMethod] = useState<ERPConnectionMethod>(connection?.connectionMethod || 'api');
  const [status, setStatus] = useState(connection?.status || 'inactive');
  
  // API Credentials
  const [apiUrl, setApiUrl] = useState(connection?.credentials.apiUrl || '');
  const [apiKey, setApiKey] = useState(connection?.credentials.apiKey || '');
  const [apiSecret, setApiSecret] = useState(connection?.credentials.apiSecret || '');
  const [oauthToken, setOauthToken] = useState(connection?.credentials.oauthToken || '');
  
  // DOI Credentials
  const [doiEndpoint, setDoiEndpoint] = useState(connection?.credentials.doiEndpoint || '');
  const [doiUsername, setDoiUsername] = useState(connection?.credentials.doiUsername || '');
  const [doiPassword, setDoiPassword] = useState(connection?.credentials.doiPassword || '');
  
  // SFTP Credentials
  const [sftpHost, setSftpHost] = useState(connection?.credentials.sftpHost || '');
  const [sftpPort, setSftpPort] = useState(connection?.credentials.sftpPort || 22);
  const [sftpUsername, setSftpUsername] = useState(connection?.credentials.sftpUsername || '');
  const [sftpPassword, setSftpPassword] = useState(connection?.credentials.sftpPassword || '');
  const [sftpPath, setSftpPath] = useState(connection?.credentials.sftpPath || '/');
  
  // Settings
  const [timeout, setTimeout] = useState(connection?.settings.timeout || 30000);
  const [retryAttempts, setRetryAttempts] = useState(connection?.settings.retryAttempts || 3);
  const [batchSize, setBatchSize] = useState(connection?.settings.batchSize || 100);
  const [syncSchedule, setSyncSchedule] = useState(connection?.settings.syncSchedule || '0 */6 * * *');
  const [enabledDataTypes, setEnabledDataTypes] = useState<ERPDataType[]>(
    connection?.settings.enabledDataTypes || []
  );
  
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const providers = [
    'SAP',
    'Oracle',
    'NetSuite',
    'Microsoft Dynamics',
    'Odoo',
    'Infor',
    'Epicor',
    'Custom'
  ];

  const dataTypes: { value: ERPDataType; label: string; description: string }[] = [
    { value: 'orders', label: 'Orders', description: 'Sync order data bidirectionally' },
    { value: 'products', label: 'Products', description: 'Pull product catalog from ERP' },
    { value: 'order_status', label: 'Order Status', description: 'Get fulfillment & tracking updates' },
    { value: 'inventory', label: 'Inventory', description: 'Real-time stock levels' },
    { value: 'employees', label: 'Employee Data', description: 'Sync employee information' },
    { value: 'invoices', label: 'Invoices', description: 'Pull invoice & billing data' }
  ];

  const handleDataTypeToggle = (dataType: ERPDataType) => {
    setEnabledDataTypes(prev => 
      prev.includes(dataType)
        ? prev.filter(t => t !== dataType)
        : [...prev, dataType]
    );
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      showErrorToast('Please enter a connection name');
      return;
    }

    if (connectionMethod === 'api' && !apiUrl) {
      showErrorToast('Please enter an API URL');
      return;
    }

    if (connectionMethod === 'doi' && !doiEndpoint) {
      showErrorToast('Please enter a DOI endpoint');
      return;
    }

    if (connectionMethod === 'sftp' && !sftpHost) {
      showErrorToast('Please enter an SFTP host');
      return;
    }

    if (enabledDataTypes.length === 0) {
      showErrorToast('Please enable at least one data type');
      return;
    }

    setSaving(true);
    try {
      const connectionData = {
        name,
        provider,
        connectionMethod,
        status,
        credentials: {
          ...(connectionMethod === 'api' && { apiUrl, apiKey, apiSecret, oauthToken }),
          ...(connectionMethod === 'doi' && { doiEndpoint, doiUsername, doiPassword }),
          ...(connectionMethod === 'sftp' && { sftpHost, sftpPort, sftpUsername, sftpPassword, sftpPath })
        },
        settings: {
          timeout,
          retryAttempts,
          batchSize,
          syncSchedule,
          enabledDataTypes
        }
      };

      if (isEdit && connection) {
        await erpIntegrationService.updateERPConnection(connection.id, connectionData);
        showSuccessToast('ERP connection updated successfully');
      } else {
        await erpIntegrationService.createERPConnection(connectionData);
        showSuccessToast('ERP connection created successfully');
      }

      onSave();
      onClose();
    } catch (error) {
      showErrorToast(`Failed to ${isEdit ? 'update' : 'create'} ERP connection`);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!connection) {
      showErrorToast('Please save the connection before testing');
      return;
    }

    setTesting(true);
    try {
      const result = await erpIntegrationService.testERPConnection(connection.id);
      if (result.success) {
        showSuccessToast(`Connection successful! Response time: ${result.responseTime}ms`);
      } else {
        showErrorToast(`Connection failed: ${result.message}`);
      }
    } catch (error) {
      showErrorToast('Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit ERP Connection' : 'New ERP Connection'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Configure your ERP integration settings</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#D91C81]" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., SAP Production"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ERP Provider *
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                >
                  {providers.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Connection Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[#D91C81]" />
              Connection Method *
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setConnectionMethod('api')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  connectionMethod === 'api'
                    ? 'border-[#D91C81] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wifi className={`w-8 h-8 mx-auto mb-2 ${
                  connectionMethod === 'api' ? 'text-[#D91C81]' : 'text-gray-400'
                }`} />
                <div className="text-center">
                  <div className="font-medium text-gray-900">API</div>
                  <div className="text-xs text-gray-600 mt-1">REST/SOAP API</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConnectionMethod('doi')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  connectionMethod === 'doi'
                    ? 'border-[#D91C81] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Server className={`w-8 h-8 mx-auto mb-2 ${
                  connectionMethod === 'doi' ? 'text-[#D91C81]' : 'text-gray-400'
                }`} />
                <div className="text-center">
                  <div className="font-medium text-gray-900">DOI</div>
                  <div className="text-xs text-gray-600 mt-1">Direct Order Integration</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConnectionMethod('sftp')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  connectionMethod === 'sftp'
                    ? 'border-[#D91C81] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Upload className={`w-8 h-8 mx-auto mb-2 ${
                  connectionMethod === 'sftp' ? 'text-[#D91C81]' : 'text-gray-400'
                }`} />
                <div className="text-center">
                  <div className="font-medium text-gray-900">SFTP</div>
                  <div className="text-xs text-gray-600 mt-1">File Transfer</div>
                </div>
              </button>
            </div>
          </div>

          {/* API Credentials */}
          {connectionMethod === 'api' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-[#D91C81]" />
                API Credentials
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API URL *
                  </label>
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter API key"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Secret
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="Enter API secret"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OAuth Token (Optional)
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={oauthToken}
                    onChange={(e) => setOauthToken(e.target.value)}
                    placeholder="Enter OAuth token"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DOI Credentials */}
          {connectionMethod === 'doi' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-[#D91C81]" />
                DOI Credentials
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DOI Endpoint *
                  </label>
                  <input
                    type="url"
                    value={doiEndpoint}
                    onChange={(e) => setDoiEndpoint(e.target.value)}
                    placeholder="https://doi.example.com/endpoint"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={doiUsername}
                      onChange={(e) => setDoiUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={doiPassword}
                        onChange={(e) => setDoiPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SFTP Credentials */}
          {connectionMethod === 'sftp' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-[#D91C81]" />
                SFTP Credentials
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SFTP Host *
                    </label>
                    <input
                      type="text"
                      value={sftpHost}
                      onChange={(e) => setSftpHost(e.target.value)}
                      placeholder="ftp.example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port *
                    </label>
                    <input
                      type="number"
                      value={sftpPort}
                      onChange={(e) => setSftpPort(parseInt(e.target.value))}
                      placeholder="22"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={sftpUsername}
                      onChange={(e) => setSftpUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={sftpPassword}
                        onChange={(e) => setSftpPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remote Path
                  </label>
                  <input
                    type="text"
                    value={sftpPath}
                    onChange={(e) => setSftpPath(e.target.value)}
                    placeholder="/data/export"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Enabled Data Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D91C81]" />
              Data Sync Configuration *
            </h3>
            
            <div className="space-y-3">
              {dataTypes.map((dataType) => (
                <label
                  key={dataType.value}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    enabledDataTypes.includes(dataType.value)
                      ? 'border-[#D91C81] bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enabledDataTypes.includes(dataType.value)}
                    onChange={() => handleDataTypeToggle(dataType.value)}
                    className="mt-1 mr-3 h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{dataType.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{dataType.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D91C81]" />
              Advanced Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retry Attempts
                </label>
                <input
                  type="number"
                  value={retryAttempts}
                  onChange={(e) => setRetryAttempts(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Size
                </label>
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sync Schedule (Cron Expression)
              </label>
              <input
                type="text"
                value={syncSchedule}
                onChange={(e) => setSyncSchedule(e.target.value)}
                placeholder="0 */6 * * * (every 6 hours)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: "0 */6 * * *" = every 6 hours, "0 2 * * *" = daily at 2 AM
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {isEdit && (
              <button
                onClick={handleTest}
                disabled={testing}
                className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube2 className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Update' : 'Create'} Connection
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ERPConnectionForm;