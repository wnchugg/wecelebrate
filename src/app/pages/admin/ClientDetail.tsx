import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Building2, Settings, Database, Users, Globe, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { apiRequest } from '../../utils/api';
import { showErrorToast } from '../../utils/errorHandling';
import { HRISIntegrationTab } from '../../components/admin/HRISIntegrationTab';

interface Client {
  id: string;
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Site {
  id: string;
  name: string;
  clientId: string;
  status: string;
  isActive: boolean;
}

type TabType = 'overview' | 'sites' | 'hris' | 'settings';

export function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      loadData();
    }
  }, [clientId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clientRes, sitesRes] = await Promise.all([
        apiRequest<{ success: boolean; data: Client }>(`/clients/${clientId}`),
        apiRequest<{ success: boolean; data: Site[] }>(`/sites?clientId=${clientId}`)
      ]);
      setClient(clientRes.data);
      setSites(sitesRes.data || []);
    } catch (error: unknown) {
      showErrorToast(error, { operation: 'load client details' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Client not found</p>
          <Button onClick={() => navigate('/admin/clients')} className="mt-4">
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Building2 },
    { id: 'sites' as TabType, label: 'Sites', icon: Globe },
    { id: 'hris' as TabType, label: 'HRIS Integration', icon: Database },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/clients')}
            className="mt-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A5E] mb-2">{client.name}</h1>
            <p className="text-gray-600">{client.description || 'No description provided'}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          client.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {client.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#D91C81] text-[#D91C81]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Client Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Contact Email</p>
                  <p className="text-gray-900">{client.contactEmail || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Phone</p>
                  <p className="text-gray-900">{client.contactPhone || 'Not provided'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-gray-900">{client.address || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#D91C81]/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-[#D91C81]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{sites.length}</p>
                    <p className="text-sm text-gray-600">Total Sites</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {sites.filter(s => s.isActive).length}
                    </p>
                    <p className="text-sm text-gray-600">Active Sites</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600">Employees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sites' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Sites for {client.name}</h2>
              <Button
                onClick={() => navigate(`/admin/sites?client=${client.id}`)}
                className="bg-[#D91C81] hover:bg-[#B01669] text-white"
              >
                Manage Sites
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
                  <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sites</h3>
                  <p className="text-gray-600 mb-6">This client doesn't have any sites yet.</p>
                  <Button
                    onClick={() => navigate(`/admin/sites?client=${client.id}`)}
                    className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                  >
                    Add Site
                  </Button>
                </div>
              ) : (
                sites.map((site) => (
                  <div
                    key={site.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#D91C81] transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/sites?site=${site.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{site.name}</h3>
                      <div className={`w-2 h-2 rounded-full ${
                        site.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <p className="text-sm text-gray-600">Status: {site.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'hris' && (
          <HRISIntegrationTab client={client} sites={sites} />
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Client Configuration */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Client Configuration</h2>
                  <p className="text-sm text-gray-600">Manage detailed client settings, address, billing, and integrations</p>
                </div>
                <Button
                  onClick={() => navigate(`/admin/clients/${client.id}/configuration`)}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Client
                </Button>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  Access comprehensive client settings including contact information, address details, 
                  account team, application settings, billing configuration, and system integrations (ERP, SSO, HRIS).
                </p>
              </div>
            </div>

            {/* Client Portal */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Client Portal</h2>
                  <p className="text-sm text-gray-600">View and manage the dedicated client portal page</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.open('/client-portal', '_blank')}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Portal
                  </Button>
                  <Button
                    onClick={() => navigate('/client-portal')}
                    className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Portal
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  The client portal is a dedicated page where clients can access their specific information, 
                  reports, and resources. Use the editor to customize content, branding, and features.
                </p>
              </div>
            </div>

            {/* Other Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Settings</h2>
              <p className="text-gray-600">More settings configuration coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDetail;