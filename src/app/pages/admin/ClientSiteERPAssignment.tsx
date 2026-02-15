import { useState, useEffect } from 'react';
import { 
  Building2,
  MapPin,
  Database,
  Settings,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  AlertCircle,
  Package
} from 'lucide-react';
import {
  erpIntegrationService,
  ERPConnection,
  ClientERPAssignment,
  SiteERPAssignment
} from '../../services/erpIntegrationService';
import { showSuccessToast, showErrorToast } from '../../utils/errorHandling';

export function ClientSiteERPAssignment() {
  const [connections, setConnections] = useState<ERPConnection[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [clientAssignment, setClientAssignment] = useState<Partial<ClientERPAssignment> | null>(null);
  const [siteAssignment, setSiteAssignment] = useState<Partial<SiteERPAssignment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mock clients and sites (replace with real data from your client/site service)
  const clients = [
    { id: 'client_001', name: 'Acme Corporation' },
    { id: 'client_002', name: 'Global Retail Co' },
    { id: 'client_003', name: 'Manufacturing Inc' }
  ];

  const sites = [
    { id: 'site_001', name: 'Acme - North America', clientId: 'client_001' },
    { id: 'site_002', name: 'Acme - Europe', clientId: 'client_001' },
    { id: 'site_003', name: 'Global Retail - US West', clientId: 'client_002' },
    { id: 'site_004', name: 'Global Retail - US East', clientId: 'client_002' },
    { id: 'site_005', name: 'Manufacturing - Plant A', clientId: 'client_003' }
  ];

  const catalogs = [
    { id: 'cat_001', name: 'Standard Catalog' },
    { id: 'cat_002', name: 'Premium Catalog' },
    { id: 'cat_003', name: 'Executive Catalog' }
  ];

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientAssignment(selectedClient);
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedSite) {
      loadSiteAssignment(selectedSite);
    }
  }, [selectedSite]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await erpIntegrationService.getERPConnections();
      setConnections(data.filter(c => c.status === 'active'));
    } catch (error) {
      showErrorToast('Failed to load ERP connections');
    } finally {
      setLoading(false);
    }
  };

  const loadClientAssignment = async (clientId: string) => {
    try {
      const assignments = await erpIntegrationService.getClientERPAssignments(clientId);
      if (assignments.length > 0) {
        setClientAssignment(assignments[0]);
      } else {
        // Initialize with defaults
        setClientAssignment({
          clientId,
          erpConnectionId: '',
          catalogId: '',
          isDefault: true,
          settings: {
            syncOrders: true,
            syncProducts: true,
            syncInventory: true,
            syncEmployees: false,
            syncInvoices: false
          }
        });
      }
    } catch (error) {
      console.error('Failed to load client assignment:', error);
    }
  };

  const loadSiteAssignment = async (siteId: string) => {
    try {
      const assignments = await erpIntegrationService.getSiteERPAssignments(siteId);
      const site = sites.find(s => s.id === siteId);
      
      if (assignments.length > 0) {
        setSiteAssignment(assignments[0]);
      } else if (site) {
        // Initialize with defaults
        setSiteAssignment({
          siteId,
          clientId: site.clientId,
          erpConnectionId: '',
          catalogId: '',
          overridesClient: false,
          settings: {
            syncOrders: true,
            syncProducts: true,
            syncInventory: true,
            syncEmployees: false,
            syncInvoices: false
          }
        });
      }
    } catch (error) {
      console.error('Failed to load site assignment:', error);
    }
  };

  const handleSaveClientAssignment = async () => {
    if (!clientAssignment || !clientAssignment.erpConnectionId) {
      showErrorToast('Please select an ERP connection');
      return;
    }

    setSaving(true);
    try {
      await erpIntegrationService.assignERPToClient(clientAssignment as any);
      showSuccessToast('Client ERP assignment saved successfully');
      await loadClientAssignment(selectedClient);
    } catch (error) {
      showErrorToast('Failed to save client assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSiteAssignment = async () => {
    if (!siteAssignment || !siteAssignment.erpConnectionId) {
      showErrorToast('Please select an ERP connection');
      return;
    }

    setSaving(true);
    try {
      await erpIntegrationService.assignERPToSite(siteAssignment as any);
      showSuccessToast('Site ERP assignment saved successfully');
      await loadSiteAssignment(selectedSite);
    } catch (error) {
      showErrorToast('Failed to save site assignment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client & Site ERP Assignment</h1>
        <p className="text-gray-600 mt-1">Configure which ERP connections and catalogs each client and site uses</p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">Configuration Hierarchy</p>
          <p>Client-level settings apply to all sites by default. Site-level settings can override client settings when needed.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Assignment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#D91C81] rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Client Configuration</h2>
              <p className="text-sm text-gray-600">Default ERP for all sites</p>
            </div>
          </div>

          {/* Client Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Client *
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {selectedClient && clientAssignment && (
            <div className="space-y-6">
              {/* ERP Connection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ERP Connection *
                </label>
                <select
                  value={clientAssignment.erpConnectionId || ''}
                  onChange={(e) => setClientAssignment({
                    ...clientAssignment,
                    erpConnectionId: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                >
                  <option value="">Select ERP connection...</option>
                  {connections.map((conn) => (
                    <option key={conn.id} value={conn.id}>
                      {conn.name} ({conn.provider})
                    </option>
                  ))}
                </select>
              </div>

              {/* Catalog */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Catalog (Optional)
                </label>
                <select
                  value={clientAssignment.catalogId || ''}
                  onChange={(e) => setClientAssignment({
                    ...clientAssignment,
                    catalogId: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                >
                  <option value="">No catalog selected</option>
                  {catalogs.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sync Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Data Sync Settings
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'syncOrders', label: 'Sync Orders' },
                    { key: 'syncProducts', label: 'Sync Products' },
                    { key: 'syncInventory', label: 'Sync Inventory' },
                    { key: 'syncEmployees', label: 'Sync Employees' },
                    { key: 'syncInvoices', label: 'Sync Invoices' }
                  ].map((setting) => (
                    <label key={setting.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clientAssignment.settings?.[setting.key as keyof typeof clientAssignment.settings] || false}
                        onChange={(e) => setClientAssignment({
                          ...clientAssignment,
                          settings: {
                            ...clientAssignment.settings,
                            [setting.key]: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{setting.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveClientAssignment}
                disabled={saving || !clientAssignment.erpConnectionId}
                className="w-full px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Client Configuration
                  </>
                )}
              </button>
            </div>
          )}

          {!selectedClient && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a client to configure ERP settings</p>
            </div>
          )}
        </div>

        {/* Site Assignment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#E94B9E] rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Site Configuration</h2>
              <p className="text-sm text-gray-600">Override client settings</p>
            </div>
          </div>

          {/* Site Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Site *
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
            >
              <option value="">Choose a site...</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSite && siteAssignment && (
            <div className="space-y-6">
              {/* Override Toggle */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteAssignment.overridesClient || false}
                    onChange={(e) => setSiteAssignment({
                      ...siteAssignment,
                      overridesClient: e.target.checked
                    })}
                    className="mt-1 h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Override Client Settings</span>
                    <p className="text-xs text-gray-600 mt-1">
                      Enable this to use different ERP settings for this site
                    </p>
                  </div>
                </label>
              </div>

              {siteAssignment.overridesClient && (
                <>
                  {/* ERP Connection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ERP Connection *
                    </label>
                    <select
                      value={siteAssignment.erpConnectionId || ''}
                      onChange={(e) => setSiteAssignment({
                        ...siteAssignment,
                        erpConnectionId: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    >
                      <option value="">Select ERP connection...</option>
                      {connections.map((conn) => (
                        <option key={conn.id} value={conn.id}>
                          {conn.name} ({conn.provider})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Catalog */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Catalog (Optional)
                    </label>
                    <select
                      value={siteAssignment.catalogId || ''}
                      onChange={(e) => setSiteAssignment({
                        ...siteAssignment,
                        catalogId: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    >
                      <option value="">No catalog selected</option>
                      {catalogs.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sync Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Data Sync Settings
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: 'syncOrders', label: 'Sync Orders' },
                        { key: 'syncProducts', label: 'Sync Products' },
                        { key: 'syncInventory', label: 'Sync Inventory' },
                        { key: 'syncEmployees', label: 'Sync Employees' },
                        { key: 'syncInvoices', label: 'Sync Invoices' }
                      ].map((setting) => (
                        <label key={setting.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={siteAssignment.settings?.[setting.key as keyof typeof siteAssignment.settings] || false}
                            onChange={(e) => setSiteAssignment({
                              ...siteAssignment,
                              settings: {
                                ...siteAssignment.settings,
                                [setting.key]: e.target.checked
                              }
                            })}
                            className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900">{setting.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveSiteAssignment}
                    disabled={saving || !siteAssignment.erpConnectionId}
                    className="w-full px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Site Configuration
                      </>
                    )}
                  </button>
                </>
              )}

              {!siteAssignment.overridesClient && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-900 font-medium mb-2">Using Client Settings</p>
                  <p className="text-sm text-gray-600">
                    This site inherits ERP configuration from its client.
                    Enable override to customize settings for this site.
                  </p>
                </div>
              )}
            </div>
          )}

          {!selectedSite && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a site to configure ERP settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientSiteERPAssignment;
