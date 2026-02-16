import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2, 
  Palette,
  Upload,
  Eye,
  Download,
  RefreshCw,
  Image as ImageIcon,
  Type,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { apiRequest } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { uploadLogo } from '../../utils/storage';
import { logger } from '../../utils/logger';

interface BrandAsset {
  id: string;
  type: 'logo' | 'favicon' | 'email_header' | 'banner';
  url: string;
  name: string;
}

interface Brand {
  id: string;
  clientId: string;
  clientName?: string;
  name: string;
  description?: string;
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  backgroundColor?: string;
  textColor?: string;
  
  // Typography
  headingFont?: string;
  bodyFont?: string;
  
  // Assets
  logoUrl?: string;
  faviconUrl?: string;
  assets?: BrandAsset[];
  
  // Contact
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  
  // Settings
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  status: string;
}

const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter (Modern Sans-Serif)' },
  { value: 'roboto', label: 'Roboto (Clean & Professional)' },
  { value: 'open-sans', label: 'Open Sans (Friendly)' },
  { value: 'lato', label: 'Lato (Elegant)' },
  { value: 'montserrat', label: 'Montserrat (Bold)' },
  { value: 'poppins', label: 'Poppins (Trendy)' },
  { value: 'raleway', label: 'Raleway (Sophisticated)' },
  { value: 'playfair', label: 'Playfair Display (Serif)' },
  { value: 'merriweather', label: 'Merriweather (Classic Serif)' },
  { value: 'source-sans', label: 'Source Sans Pro' }
];

export function BrandManagementNew() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [addingBrand, setAddingBrand] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [previewingBrand, setPreviewingBrand] = useState<Brand | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [brandsRes, clientsRes, sitesRes] = await Promise.all([
        apiRequest<{ brands: Brand[] }>('/brands').catch((): { brands: Brand[] } => ({ brands: [] })),
        apiRequest<{ success: boolean; data: Client[] }>('/v2/clients'),
        apiRequest<{ success: boolean; data: Array<{ id: string; name: string; brandId?: string; [key: string]: unknown }> }>('/v2/sites')
      ]);

      setBrands(brandsRes.brands || []);
      setClients(clientsRes.data || []);
      setSites(sitesRes.data || []);
    } catch (error: unknown) {
      showErrorToast('Failed to load data', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBrand = async (brand: Partial<Brand>) => {
    try {
      const newBrand = await apiRequest<{ brand: Brand }>('/brands', {
        method: 'POST',
        body: JSON.stringify(brand)
      });
      
      setBrands([...brands, newBrand.brand]);
      showSuccessToast('Brand created successfully');
      setAddingBrand(false);
    } catch (error: unknown) {
      showErrorToast('Failed to create brand', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleEditBrand = async (id: string, updates: Partial<Brand>) => {
    try {
      const updatedBrand = await apiRequest<{ brand: Brand }>(`/brands/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      setBrands(brands.map(b => b.id === id ? updatedBrand.brand : b));
      showSuccessToast('Brand updated successfully');
      setEditingBrand(null);
    } catch (error: unknown) {
      showErrorToast('Failed to update brand', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await apiRequest(`/brands/${id}`, {
        method: 'DELETE'
      });
      
      setBrands(brands.filter(b => b.id !== id));
      showSuccessToast('Brand deleted successfully');
      setDeletingBrand(null);
    } catch (error: unknown) {
      showErrorToast('Failed to delete brand', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleToggleStatus = async (brand: Brand) => {
    const newStatus = brand.status === 'active' ? 'inactive' : 'active';
    await handleEditBrand(brand.id, { status: newStatus });
  };

  const duplicateBrand = async (brand: Brand) => {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = brand;
    const duplicate: Partial<Brand> = {
      ...rest,
      name: `${brand.name} (Copy)`,
    };
    await handleAddBrand(duplicate);
  };

  const exportBrand = (brand: Brand) => {
    const data = JSON.stringify(brand, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brand.name.toLowerCase().replace(/\s+/g, '-')}-brand.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccessToast('Brand exported successfully');
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = 
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || brand.status === filterStatus;
    const matchesClient = filterClient === 'all' || brand.clientId === filterClient;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const getBrandSites = (brandId: string) => {
    return sites.filter(site => site.brandId === brandId);
  };

  const activeCount = brands.filter(b => b.status === 'active').length;
  const inactiveCount = brands.filter(b => b.status === 'inactive').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Brand Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage client branding, colors, fonts, and assets
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={() => setAddingBrand(true)}
            className="bg-[#D91C81] hover:bg-[#B01669] text-white gap-2"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Create Brand
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{brands.length}</p>
                <p className="text-sm text-gray-600">Total Brands</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{inactiveCount}</p>
                <p className="text-sm text-gray-600">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                <p className="text-sm text-gray-600">Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
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
      </Card>

      {/* Brands Grid */}
      {filteredBrands.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No brands found</p>
            <p className="text-sm text-gray-500 mb-4">Create your first brand to get started</p>
            <Button
              onClick={() => setAddingBrand(true)}
              className="bg-[#D91C81] hover:bg-[#B01669] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Brand
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBrands.map(brand => {
            const brandSites = getBrandSites(brand.id);
            const client = clients.find(c => c.id === brand.clientId);
            
            return (
              <Card key={brand.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
                        style={{ backgroundColor: brand.primaryColor }}
                      >
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">{brand.name}</h3>
                        <Badge className={brand.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {brand.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{client?.name || 'Unknown Client'}</p>
                      {brand.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{brand.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Colors */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Brand Colors</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div
                          className="w-full h-10 rounded border border-gray-200"
                          style={{ backgroundColor: brand.primaryColor }}
                          title={brand.primaryColor}
                        />
                        <p className="text-xs text-center text-gray-500 mt-1">Primary</p>
                      </div>
                      <div className="flex-1">
                        <div
                          className="w-full h-10 rounded border border-gray-200"
                          style={{ backgroundColor: brand.secondaryColor }}
                          title={brand.secondaryColor}
                        />
                        <p className="text-xs text-center text-gray-500 mt-1">Secondary</p>
                      </div>
                      <div className="flex-1">
                        <div
                          className="w-full h-10 rounded border border-gray-200"
                          style={{ backgroundColor: brand.tertiaryColor }}
                          title={brand.tertiaryColor}
                        />
                        <p className="text-xs text-center text-gray-500 mt-1">Tertiary</p>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  {(brand.headingFont || brand.bodyFont) && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Typography</p>
                      <div className="flex gap-2">
                        {brand.headingFont && (
                          <Badge variant="outline" className="text-xs">
                            <Type className="w-3 h-3 mr-1" />
                            Heading: {brand.headingFont}
                          </Badge>
                        )}
                        {brand.bodyFont && (
                          <Badge variant="outline" className="text-xs">
                            <Type className="w-3 h-3 mr-1" />
                            Body: {brand.bodyFont}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sites */}
                  {brandSites.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        Used by {brandSites.length} site{brandSites.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {brandSites.slice(0, 3).map(site => (
                          <Badge key={site.id} variant="outline" className="text-xs">
                            {site.name}
                          </Badge>
                        ))}
                        {brandSites.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{brandSites.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewingBrand(brand)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBrand(brand)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateBrand(brand)}
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportBrand(brand)}
                      title="Export"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(brand)}
                      title={brand.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {brand.status === 'active' ? <XCircle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingBrand(brand)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Brand Modal */}
      {(addingBrand || editingBrand) && (
        <BrandFormModal
          brand={editingBrand}
          clients={clients}
          onClose={() => {
            setAddingBrand(false);
            setEditingBrand(null);
          }}
          onSave={(brand) => {
            if (editingBrand) {
              handleEditBrand(editingBrand.id, brand);
            } else {
              handleAddBrand(brand);
            }
          }}
        />
      )}

      {/* Preview Modal */}
      {previewingBrand && (
        <BrandPreviewModal
          brand={previewingBrand}
          onClose={() => setPreviewingBrand(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingBrand && (
        <Dialog open={true} onOpenChange={() => setDeletingBrand(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Brand</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deletingBrand.name}"?
                {getBrandSites(deletingBrand.id).length > 0 && (
                  <span className="block mt-2 text-red-600">
                    Warning: This brand is currently used by {getBrandSites(deletingBrand.id).length} site(s).
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingBrand(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteBrand(deletingBrand.id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Brand Form Modal Component
function BrandFormModal({
  brand,
  clients,
  onClose,
  onSave
}: {
  brand: Brand | null;
  clients: Client[];
  onClose: () => void;
  onSave: (brand: Partial<Brand>) => void;
}) {
  const [formData, setFormData] = useState<Partial<Brand>>({
    clientId: '',
    name: '',
    description: '',
    primaryColor: '#D91C81',
    secondaryColor: '#1B2A5E',
    tertiaryColor: '#00B4CC',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    headingFont: 'inter',
    bodyFont: 'inter',
    logoUrl: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    status: 'active',
    ...brand
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.clientId) {
      showErrorToast('Required fields missing', 'Please fill in brand name and client');
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#D91C81]" />
            {brand ? 'Edit Brand' : 'Create New Brand'}
          </DialogTitle>
          <DialogDescription>
            Configure branding elements for client sites
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client *</Label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    required
                  >
                    <option value="">Select client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Brand Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enterprise Brand"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this brand..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Website URL</Label>
                  <Input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base font-semibold">Active Status</Label>
                  <p className="text-sm text-gray-600">Brand is available for site configuration</p>
                </div>
                <Switch
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
                />
              </div>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label>Tertiary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={formData.tertiaryColor}
                      onChange={(e) => setFormData({ ...formData, tertiaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.tertiaryColor}
                      onChange={(e) => setFormData({ ...formData, tertiaryColor: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Background Color</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label>Text Color</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="p-6 border-2 border-gray-200 rounded-lg" style={{ backgroundColor: formData.backgroundColor }}>
                <h3 className="text-2xl font-bold mb-2" style={{ color: formData.textColor }}>
                  Brand Preview
                </h3>
                <p className="mb-4" style={{ color: formData.textColor }}>
                  This is how your brand colors will look on the site.
                </p>
                <div className="flex gap-2">
                  <div
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: formData.secondaryColor }}
                  >
                    Secondary Button
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: formData.tertiaryColor }}
                  >
                    Tertiary Button
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Heading Font</Label>
                  <select
                    value={formData.headingFont}
                    onChange={(e) => setFormData({ ...formData, headingFont: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Body Font</Label>
                  <select
                    value={formData.bodyFont}
                    onChange={(e) => setFormData({ ...formData, bodyFont: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Typography Preview */}
              <div className="p-6 border-2 border-gray-200 rounded-lg bg-white">
                <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: formData.headingFont }}>
                  Heading Font Preview
                </h1>
                <p className="text-lg" style={{ fontFamily: formData.bodyFont }}>
                  This is a preview of the body font. It will be used for all paragraph text, buttons, and general content across the site. The font should be readable and match your brand identity.
                </p>
              </div>
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="space-y-4">
              <div>
                <Label>Logo URL</Label>
                <Input
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: PNG or SVG, transparent background, 200x200px minimum
                </p>
              </div>

              {formData.logoUrl && (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">Logo Preview</p>
                  <img
                    src={formData.logoUrl}
                    alt="Logo preview"
                    className="max-w-xs max-h-32 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Logo Upload Coming Soon
                </p>
                <p className="text-xs text-blue-700">
                  File upload functionality will be added in a future update. For now, use a direct URL to your logo.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#D91C81] hover:bg-[#B01669] text-white">
              {brand ? 'Update Brand' : 'Create Brand'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Brand Preview Modal Component
function BrandPreviewModal({ brand, onClose }: { brand: Brand; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#D91C81]" />
            Brand Preview: {brand.name}
          </DialogTitle>
          <DialogDescription>
            See how this brand will look on the user-facing site
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hero Section Preview */}
          <div
            className="p-12 rounded-lg"
            style={{ backgroundColor: brand.backgroundColor }}
          >
            <div className="max-w-4xl mx-auto text-center">
              {brand.logoUrl && (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-16 mx-auto mb-6"
                />
              )}
              <h1
                className="text-5xl font-bold mb-4"
                style={{ fontFamily: brand.headingFont, color: brand.textColor }}
              >
                Welcome to {brand.name}
              </h1>
              <p
                className="text-xl mb-6"
                style={{ fontFamily: brand.bodyFont, color: brand.textColor }}
              >
                Select your perfect gift from our curated collection
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="px-6 py-3 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  Get Started
                </button>
                <button
                  className="px-6 py-3 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: brand.secondaryColor }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Content Section Preview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 border-2 rounded-lg" style={{ borderColor: brand.primaryColor }}>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: brand.headingFont, color: brand.primaryColor }}
              >
                Feature One
              </h3>
              <p style={{ fontFamily: brand.bodyFont }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
            <div className="p-6 border-2 rounded-lg" style={{ borderColor: brand.secondaryColor }}>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: brand.headingFont, color: brand.secondaryColor }}
              >
                Feature Two
              </h3>
              <p style={{ fontFamily: brand.bodyFont }}>
                Sed do eiusmod tempor incididunt ut labore et dolore.
              </p>
            </div>
            <div className="p-6 border-2 rounded-lg" style={{ borderColor: brand.tertiaryColor }}>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: brand.headingFont, color: brand.tertiaryColor }}
              >
                Feature Three
              </h3>
              <p style={{ fontFamily: brand.bodyFont }}>
                Ut enim ad minim veniam, quis nostrud exercitation.
              </p>
            </div>
          </div>

          {/* Footer Section */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: brand.secondaryColor }}>
            <div className="text-center text-white">
              <p style={{ fontFamily: brand.bodyFont }}>
                © 2026 {brand.name}. All rights reserved.
              </p>
              {brand.websiteUrl && (
                <a
                  href={brand.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 hover:underline"
                  style={{ fontFamily: brand.bodyFont }}
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close Preview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}