import { CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Globe,
  Power,
  Settings,
  MoreVertical,
  Copy,
  Gift,
  Eye,
  Building2,
  ImageIcon,
  Upload,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { getPublicSiteUrl } from '../../utils/url';
import { DeployedDomainBanner } from '../../components/admin/DeployedDomainBanner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useSite } from '../../context/SiteContext';
import { apiRequest, getAccessToken } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { uploadLogo, isBase64DataUrl, isSupabaseStorageUrl } from '../../utils/storage';
import { logger } from '../../utils/logger';

interface Client {
  id: string;
  name: string;
  isActive: boolean;
}

interface Site {
  id: string;
  name: string;
  clientId: string;
  slug?: string;
  domain?: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  branding: {
    primaryColor: string;
    secondaryColor?: string;
    tertiaryColor?: string;
    logo?: string;
  };
  settings: {
    validationMethod: 'email' | 'employeeId' | 'serialCard' | 'magicLink';
    allowGuestAccess?: boolean;
    defaultLanguage?: string;
    supportedLanguages?: string[];
  };
  siteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Supported languages for sites
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'draft':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getValidationMethodLabel = (method: string) => {
  switch (method) {
    case 'email':
      return 'Email Address';
    case 'employeeId':
      return 'Employee ID';
    case 'serialCard':
      return 'Serial Card';
    case 'magicLink':
      return 'Magic Link';
    default:
      return method;
  }
};

export function SiteManagement() {
  const navigate = useNavigate();
  const { setCurrentSite } = useSite();
  const [sites, setSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sitesRes, clientsRes] = await Promise.all([
        apiRequest<{ success: boolean; data: Site[] }>('/v2/sites'),
        apiRequest<{ success: boolean; data: Client[] }>('/v2/clients')
      ]);
      setSites(sitesRes.data || []);
      setClients(clientsRes.data || []);
    } catch (error: unknown) {
      logger.error('[SiteManagement] Load error:', error instanceof Error ? error.message : 'Unknown error');
      showErrorToast(error, { operation: 'load data' });
    } finally {
      setIsLoading(false);
    }
  };

  const getClientById = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  const filteredSites = sites.filter(site => {
    const client = getClientById(site.clientId);
    const clientName = client?.name || '';
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         site.domain?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || site.status === filterStatus;
    const matchesClient = filterClient === 'all' || site.clientId === filterClient;
    return matchesSearch && matchesFilter && matchesClient;
  });

  const handleToggleStatus = async (site: Site) => {
    // Handle draft -> active, active -> inactive, inactive -> active
    let newStatus: 'active' | 'inactive' | 'draft';
    if (site.status === 'draft') {
      newStatus = 'active'; // Publish draft sites
    } else if (site.status === 'active') {
      newStatus = 'inactive'; // Deactivate active sites
    } else {
      newStatus = 'active'; // Reactivate inactive sites
    }
    
    try {
      await apiRequest(`/v2/sites/${site.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...site, status: newStatus })
      });
      
      // Show appropriate message based on transition
      let message = '';
      if (site.status === 'draft' && newStatus === 'active') {
        message = `\"${site.name}\" published successfully`;
      } else if (newStatus === 'active') {
        message = `\"${site.name}\" activated successfully`;
      } else {
        message = `\"${site.name}\" deactivated successfully`;
      }
      
      showSuccessToast(message);
      loadData();
    } catch (error: unknown) {
      showErrorToast('Failed to update site status', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDuplicate = async (site: Site) => {
    try {
      const { id, createdAt, updatedAt, ...siteData } = site;
      const newSite = {
        ...siteData,
        name: `${site.name} (Copy)`,
        domain: site.domain ? `${site.domain.split('.')[0]}-copy.jala.com` : undefined,
        status: 'draft' as const,
      };
      await apiRequest('/v2/sites', {
        method: 'POST',
        body: JSON.stringify(newSite)
      });
      showSuccessToast('Site duplicated successfully');
      loadData();
    } catch (error: unknown) {
      showErrorToast('Failed to duplicate site', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDelete = async (siteId: string, siteName: string) => {
    if (!confirm(`Are you sure you want to delete "${siteName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingSiteId(siteId);
    try {
      await apiRequest(`/v2/sites/${siteId}`, { method: 'DELETE' });
      showSuccessToast(`"${siteName}" deleted successfully`);
      loadData();
    } catch (error: unknown) {
      showErrorToast('Failed to delete site', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setDeletingSiteId(null);
    }
  };

  const handleSaveSite = async (siteData: Partial<Site>) => {
    try {
      if (editingSite) {
        await apiRequest(`/v2/sites/${editingSite.id}`, {
          method: 'PUT',
          body: JSON.stringify(siteData)
        });
        showSuccessToast('Site updated successfully');
      } else {
        await apiRequest('/v2/sites', {
          method: 'POST',
          body: JSON.stringify(siteData)
        });
        showSuccessToast('Site created successfully');
      }
      setShowSiteModal(false);
      setEditingSite(null);
      loadData();
    } catch (error: unknown) {
      showErrorToast(
        editingSite ? 'Failed to update site' : 'Failed to create site',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Site Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage client sites and configurations</p>
        </div>
        <Button
          onClick={() => {
            setEditingSite(null);
            setShowSiteModal(true);
          }}
          className="bg-[#D91C81] hover:bg-[#B01669] text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Site
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sites.length}</p>
              <p className="text-sm text-gray-600">Total Sites</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Power className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sites.filter(s => s.status === 'active').length}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Edit className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sites.filter(s => s.status === 'draft').length}</p>
              <p className="text-sm text-gray-600">Draft</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Power className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sites.filter(s => s.status === 'inactive').length}</p>
              <p className="text-sm text-gray-600">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sites by name, client, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sites Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredSites.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No sites found</p>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery || filterStatus || filterClient
                ? 'Try adjusting your filters'
                : 'Create your first site to get started'}
            </p>
            {!searchQuery && filterStatus === 'all' && filterClient === 'all' && (
              <Button
                onClick={() => {
                  setEditingSite(null);
                  setShowSiteModal(true);
                }}
                className="bg-[#D91C81] hover:bg-[#B01669] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Site
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Site Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Domain</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Validation</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Updated</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSites.map((site) => {
                  const client = getClientById(site.clientId);
                  const clientName = client?.name || 'Unknown Client';
                  
                  return (
                    <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: site.branding?.primaryColor || '#D91C81' }}
                          >
                            {clientName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{site.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-900">{clientName}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 font-mono">{site.domain || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(site.status)}`}>
                          {site.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 capitalize">{getValidationMethodLabel(site.settings?.validationMethod || 'N/A')}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{new Date(site.updatedAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Set current site in context and navigate to configuration
                              setCurrentSite(site as any);
                              navigate('/admin/site-configuration');
                            }}
                            title="Configure Site"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          
                          {/* More Actions Dropdown */}
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setOpenDropdownId(openDropdownId === site.id ? null : site.id)}
                              title="More actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            
                            {openDropdownId === site.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenDropdownId(null)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      setEditingSite(site);
                                      setShowSiteModal(true);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit Basic Info
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      handleToggleStatus(site);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Power className="w-4 h-4" />
                                    {site.status === 'draft' ? 'Publish Site' : site.status === 'active' ? 'Deactivate Site' : 'Activate Site'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      handleDuplicate(site);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Duplicate Site
                                  </button>
                                  <Link
                                    to={`/admin/site-gift-assignment?siteId=${site.id}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Gift className="w-4 h-4" />
                                    Manage Gifts
                                  </Link>
                                  <a
                                    href={getPublicSiteUrl(site.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpenDropdownId(null)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Public Site
                                  </a>
                                  <div className="border-t border-gray-200 my-1"></div>
                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      handleDelete(site.id, site.name);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    disabled={deletingSiteId === site.id}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Site
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Site Modal */}
      <SiteModal
        open={showSiteModal}
        onClose={() => {
          setShowSiteModal(false);
          setEditingSite(null);
        }}
        site={editingSite}
        clients={clients}
        onSave={handleSaveSite}
      />
    </div>
  );
}

interface SiteModalProps {
  open: boolean;
  onClose: () => void;
  site: Site | null;
  clients: Client[];
  onSave: (site: Partial<Site>) => void;
}

function SiteModal({ open, onClose, site, clients, onSave }: SiteModalProps) {
  const [formData, setFormData] = useState<Partial<Site>>({
    name: '',
    clientId: '',
    slug: '',
    domain: '',
    description: '',
    status: 'draft',
    branding: {
      primaryColor: '#D91C81',
      secondaryColor: '#1B2A5E',
      tertiaryColor: '#00B4CC',
      logo: '',
    },
    settings: {
      validationMethod: 'email',
      allowGuestAccess: false,
      defaultLanguage: 'en',
      supportedLanguages: ['en'],
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name,
        clientId: site.clientId,
        slug: site.slug,
        domain: site.domain,
        description: site.description,
        status: site.status,
        branding: {
          primaryColor: site.branding?.primaryColor || '#D91C81',
          secondaryColor: site.branding?.secondaryColor || '#1B2A5E',
          tertiaryColor: site.branding?.tertiaryColor || '#00B4CC',
          logo: site.branding?.logo || '',
        },
        settings: {
          validationMethod: site.settings?.validationMethod || 'email',
          allowGuestAccess: site.settings?.allowGuestAccess || false,
          defaultLanguage: site.settings?.defaultLanguage || 'en',
          supportedLanguages: site.settings?.supportedLanguages || ['en'],
        },
        siteUrl: site.siteUrl,
      });
      setLogoPreview(site.branding?.logo || '');
    } else {
      setFormData({
        name: '',
        clientId: '',
        slug: '',
        domain: '',
        description: '',
        status: 'draft',
        branding: {
          primaryColor: '#D91C81',
          secondaryColor: '#1B2A5E',
          tertiaryColor: '#00B4CC',
          logo: '',
        },
        settings: {
          validationMethod: 'email',
          allowGuestAccess: false,
          defaultLanguage: 'en',
          supportedLanguages: ['en'],
        },
      });
      setLogoPreview('');
    }
    setCurrentStep(1);
  }, [site, open]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showErrorToast('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showErrorToast('Image size must be less than 2MB');
      return;
    }

    setUploadingLogo(true);

    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLogoPreview(base64);
        setFormData({
          ...formData,
          branding: { ...formData.branding, logo: base64 }
        });
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const uploadRes = await uploadLogo(file, formData.slug || 'temp');
      setFormData({
        ...formData,
        branding: { ...formData.branding, logo: uploadRes.url }
      });
      
      showSuccessToast('Logo uploaded successfully');
    } catch (error: unknown) {
      showErrorToast('Failed to upload logo', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setFormData({
      ...formData,
      branding: { ...formData.branding, logo: '' }
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({ 
      ...formData, 
      name,
      slug: formData.slug || generateSlug(name)
    });
  };

  const toggleLanguage = (languageCode: string) => {
    const currentLanguages = formData.settings?.supportedLanguages || [];
    const newLanguages = currentLanguages.includes(languageCode)
      ? currentLanguages.filter(l => l !== languageCode)
      : [...currentLanguages, languageCode];

    // Ensure at least one language is selected
    if (newLanguages.length === 0) {
      showErrorToast('At least one language must be selected');
      return;
    }

    // If removing default language, set new default
    let newDefaultLanguage = formData.settings?.defaultLanguage;
    if (!newLanguages.includes(newDefaultLanguage)) {
      newDefaultLanguage = newLanguages[0];
    }

    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        supportedLanguages: newLanguages,
        defaultLanguage: newDefaultLanguage
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      showErrorToast('Please enter a site name');
      return;
    }
    if (!formData.clientId) {
      showErrorToast('Please select a client');
      return;
    }
    if (!formData.slug?.trim()) {
      showErrorToast('Please enter a site slug');
      return;
    }

    setIsSaving(true);
    try {
      onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: Building2 },
    { number: 2, title: 'Branding', icon: ImageIcon },
    { number: 3, title: 'Settings', icon: Settings },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {site ? 'Edit Site' : 'Create New Site'}
          </DialogTitle>
          <DialogDescription>
            {site ? 'Edit the details of this site.' : 'Create a new site for a client.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4 border-b border-gray-200">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div key={step.number} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.number)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#D91C81] text-white'
                      : isCompleted
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 mx-2" />
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Basic Information
              </h3>
              
              <div>
                <Label htmlFor="name">Site Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Holiday Gifts 2024"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Site Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., holiday-gifts-2024"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Used in URLs: /site/{formData.slug || 'slug'}</p>
              </div>

              <div>
                <Label htmlFor="clientId">Client *</Label>
                <select
                  id="clientId"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.filter(c => c.isActive).map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="domain">Custom Domain</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="e.g., gifts.company.com"
                />
                <p className="text-xs text-gray-500 mt-1">Optional. Leave blank to use default domain.</p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this site..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  Next: Branding
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Branding & Appearance
              </h3>
              
              {/* Logo Upload */}
              <div>
                <Label>Site Logo</Label>
                <div className="mt-2">
                  {logoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-24 w-auto max-w-xs rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload logo</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                    </label>
                  )}
                  {uploadingLogo && (
                    <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                  )}
                </div>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.branding?.primaryColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        branding: { ...formData.branding, primaryColor: e.target.value }
                      })}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.branding?.primaryColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        branding: { ...formData.branding, primaryColor: e.target.value }
                      })}
                      placeholder="#D91C81"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Main accent color</p>
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.branding?.secondaryColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        branding: { ...formData.branding, secondaryColor: e.target.value }
                      })}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.branding?.secondaryColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        branding: { ...formData.branding, secondaryColor: e.target.value }
                      })}
                      placeholder="#1B2A5E"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Complementary color</p>
                </div>

                <div>
                  <Label htmlFor="tertiaryColor">Tertiary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="tertiaryColor"
                      type="color"
                      value={formData.branding?.tertiaryColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        branding: { ...formData.branding, tertiaryColor: e.target.value }
                      })}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.branding?.tertiaryColor}
                      onChange={(e) => setFormData({
                        ...formData,
                        branding: { ...formData.branding, tertiaryColor: e.target.value }
                      })}
                      placeholder="#00B4CC"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Additional accent</p>
                </div>
              </div>

              {/* Color Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Color Preview:</p>
                <div className="flex gap-2">
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-white shadow-md"
                    style={{ backgroundColor: formData.branding?.primaryColor }}
                    title="Primary"
                  />
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-white shadow-md"
                    style={{ backgroundColor: formData.branding?.secondaryColor }}
                    title="Secondary"
                  />
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-white shadow-md"
                    style={{ backgroundColor: formData.branding?.tertiaryColor }}
                    title="Tertiary"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  Next: Settings
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Site Settings
              </h3>
              
              <div>
                <Label htmlFor="validationMethod">Access Validation Method</Label>
                <select
                  id="validationMethod"
                  value={formData.settings?.validationMethod}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      validationMethod: e.target.value as any
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="email">Email Address Validation</option>
                  <option value="employeeId">Employee ID Validation</option>
                  <option value="serialCard">Serial Card Number</option>
                  <option value="magicLink">Magic Link (Email)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How users will verify their eligibility to access this site
                </p>
              </div>

              <div>
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <select
                  id="defaultLanguage"
                  value={formData.settings?.defaultLanguage}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      defaultLanguage: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  {SUPPORTED_LANGUAGES.filter(lang => 
                    formData.settings?.supportedLanguages?.includes(lang.code)
                  ).map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Supported Languages</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {SUPPORTED_LANGUAGES.map(lang => {
                    const isSelected = formData.settings?.supportedLanguages?.includes(lang.code);
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => toggleLanguage(lang.code)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                          isSelected
                            ? 'bg-[#D91C81] text-white border-[#D91C81]'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#D91C81]'
                        }`}
                      >
                        {lang.name}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Users will be able to switch between these languages
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="allowGuestAccess" className="font-semibold">Allow Guest Access</Label>
                  <p className="text-sm text-gray-600">Let users browse without validation</p>
                </div>
                <Switch
                  id="allowGuestAccess"
                  checked={formData.settings?.allowGuestAccess}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, allowGuestAccess: checked }
                  })}
                />
              </div>

              <div>
                <Label htmlFor="status">Site Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="draft">Draft (Not visible to users)</option>
                  <option value="active">Active (Live and accessible)</option>
                  <option value="inactive">Inactive (Temporarily disabled)</option>
                </select>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : (site ? 'Update Site' : 'Create Site')}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}