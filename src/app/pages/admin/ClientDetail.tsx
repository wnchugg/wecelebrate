import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, Building2, Settings, Users, Globe, ExternalLink, 
  MapPin, CreditCard, Link2
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { apiRequest } from '../../utils/api';
import { showErrorToast } from '../../utils/errorHandling';
import { ClientConfiguration } from './ClientConfiguration';

interface Client {
  id: string;
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  clientCode?: string; // URL slug
  isActive?: boolean; // Legacy field
  status?: 'active' | 'inactive'; // New field
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

type TabType = 'general' | 'address' | 'account' | 'app-settings' | 'billing' | 'integrations' | 'portal' | 'sites';

export function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      void loadData();
    }
  }, [clientId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let actualClientId = clientId;
      
      // Check if clientId is a valid UUID format using proper regex
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUUID = uuidRegex.test(clientId || '');
      
      // If it's not a UUID, treat it as a slug and resolve it to an ID
      if (!isUUID) {
        try {
          // Fetch all clients to find the one with matching slug
          const allClientsRes = await apiRequest<{ success: boolean; data: Client[] }>('/v2/clients');
          
          // Try to match by clientCode (slug) - case-insensitive
          const matchingClient = allClientsRes.data.find(c => 
            c.clientCode?.toLowerCase() === clientId?.toLowerCase()
          );
          
          if (matchingClient) {
            actualClientId = matchingClient.id;
          } else {
            // No match found - this will cause the API call to fail with proper error
            console.warn('No client found with slug:', clientId);
            actualClientId = clientId; // Will fail in API call below
          }
        } catch (slugError) {
          // If fetching all clients fails, try using clientId as-is
          console.error('Failed to resolve slug:', slugError);
        }
      }
      
      // Now fetch the specific client and its sites using the resolved ID
      const [clientRes, sitesRes] = await Promise.all([
        apiRequest<{ success: boolean; data: Client }>(`/v2/clients/${actualClientId}`),
        apiRequest<{ success: boolean; data: Site[] }>(`/v2/sites?clientId=${actualClientId}`)
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
          <Button onClick={() => void navigate('/admin/clients')} className="mt-4">
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general' as TabType, label: 'General', icon: Building2 },
    { id: 'address' as TabType, label: 'Address', icon: MapPin },
    { id: 'account' as TabType, label: 'Account Team', icon: Users },
    { id: 'app-settings' as TabType, label: 'App Settings', icon: Settings },
    { id: 'billing' as TabType, label: 'Billing', icon: CreditCard },
    { id: 'integrations' as TabType, label: 'Integrations', icon: Link2 },
    { id: 'portal' as TabType, label: 'Client Portal', icon: ExternalLink },
    { id: 'sites' as TabType, label: 'Sites', icon: Globe }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            onClick={() => void navigate('/admin/clients')}
            className="mt-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#1B2A5E]">{client.name}</h1>
              <Badge className={`${
                (client.status === 'active' || (client.status === undefined && client.isActive))
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              } border`}>
                {(client.status === 'active' || (client.status === undefined && client.isActive)) ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-gray-600">{client.description || 'No description provided'}</p>
          </div>
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
        {client && (
          <ClientConfiguration 
            clientIdProp={client.id} 
            embedded={true} 
            activeTab={activeTab}
            onSaveSuccess={() => void loadData()}
            sites={sites}
          />
        )}
      </div>
    </div>
  );
}

export default ClientDetail;