import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Palette, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useBrands } from '../../hooks/usePhase5A';
import { useSite } from '../../context/SiteContext';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { apiRequest } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import type { Brand } from '../../lib/apiClientPhase5A';

export function BrandsManagement() {
  const navigate = useNavigate();
  const { clients, sites } = useSite();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterSite, setFilterSite] = useState<string>('all');
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Color state for form
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState('#818CF8');
  const [bodyTextColorDark, setBodyTextColorDark] = useState('#1F2937');
  const [bodyTextColorLight, setBodyTextColorLight] = useState('#F9FAFB');
  const [accentColor1, setAccentColor1] = useState('');
  const [accentColor2, setAccentColor2] = useState('');
  
  // Brand extraction state
  const [showExtractModal, setShowExtractModal] = useState(false);
  const [extractUrl, setExtractUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedColors, setExtractedColors] = useState<Array<{ color: string; count: number; usage: string }>>([]);

  const { brands, loading, error, createBrand, updateBrand, deleteBrand } = useBrands({
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: searchQuery || undefined,
  });

  // Filter brands by client and site
  const filteredBrands = brands.filter(brand => {
    // Filter by client
    if (filterClient !== 'all' && brand.clientId !== filterClient) {
      return false;
    }
    
    // Filter by site (check if any site uses this brand)
    if (filterSite !== 'all') {
      const site = sites.find(s => s.id === filterSite);
      if (!site || site.brandId !== brand.id) {
        return false;
      }
    }
    
    return true;
  });

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const brandData = {
      name: formData.get('name') as string,
      clientId: formData.get('clientId') as string,
      description: formData.get('description') as string,
      logoUrl: formData.get('logoUrl') as string,
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      bodyTextColorDark: bodyTextColorDark,
      bodyTextColorLight: bodyTextColorLight,
      accentColor1: accentColor1 || undefined,
      accentColor2: accentColor2 || undefined,
      status: (formData.get('status') as string) || 'active',
    };

    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, brandData);
        showSuccessToast('Brand updated successfully');
      } else {
        await createBrand(brandData);
        showSuccessToast('Brand created successfully');
      }
      setShowBrandModal(false);
      setEditingBrand(null);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to save brand');
    }
  };

  const handleDelete = async (brandId: string, brandName: string) => {
    if (!confirm(`Are you sure you want to delete "${brandName}"?`)) return;

    setIsDeleting(true);
    try {
      await deleteBrand(brandId);
      showSuccessToast(`"${brandName}" deleted successfully`);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to delete brand');
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreateModal = () => {
    setEditingBrand(null);
    setPrimaryColor('#4F46E5');
    setSecondaryColor('#818CF8');
    setBodyTextColorDark('#1F2937');
    setBodyTextColorLight('#F9FAFB');
    setAccentColor1('');
    setAccentColor2('');
    setShowBrandModal(true);
  };

  const openEditPage = (brand: Brand) => {
    navigate(`/admin/brands/${brand.id}/edit`);
  };

  const handleExtractBranding = async () => {
    if (!extractUrl) {
      showErrorToast('Please enter a URL');
      return;
    }

    setIsExtracting(true);
    try {
      // Call backend to extract colors from website using apiRequest utility
      const data = await apiRequest('/v2/brands/extract-colors', {
        method: 'POST',
        body: JSON.stringify({ url: extractUrl }),
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to extract colors from website');
      }

      setExtractedColors(data.colors || []);
      
      if (data.colors && data.colors.length > 0) {
        showSuccessToast(`Extracted ${data.colors.length} colors from website`);
      } else {
        showErrorToast('No colors found on the website. Try a different URL.');
      }
    } catch (err: any) {
      console.error('Extract colors error:', err);
      showErrorToast(err.message || 'Failed to extract branding');
    } finally {
      setIsExtracting(false);
    }
  };

  const applyExtractedColor = (color: string, target: 'primary' | 'secondary' | 'bodyDark' | 'bodyLight' | 'accent1' | 'accent2') => {
    switch (target) {
      case 'primary':
        setPrimaryColor(color);
        break;
      case 'secondary':
        setSecondaryColor(color);
        break;
      case 'bodyDark':
        setBodyTextColorDark(color);
        break;
      case 'bodyLight':
        setBodyTextColorLight(color);
        break;
      case 'accent1':
        setAccentColor1(color);
        break;
      case 'accent2':
        setAccentColor2(color);
        break;
    }
    
    const targetNames: Record<typeof target, string> = {
      primary: 'Primary',
      secondary: 'Secondary',
      bodyDark: 'Body Text (Dark)',
      bodyLight: 'Body Text (Light)',
      accent1: 'Accent 1',
      accent2: 'Accent 2',
    };
    
    showSuccessToast(`Applied ${color} to ${targetNames[target]}`);
  };

  const openExtractModal = () => {
    setExtractUrl('');
    setExtractedColors([]);
    setShowExtractModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading brands...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Brands Management</h1>
        <p className="text-gray-600">Manage brand configurations for your sites</p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Sites</option>
            {sites
              .filter(site => filterClient === 'all' || site.clientId === filterClient)
              .map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={openExtractModal}>
            <Palette className="w-4 h-4 mr-2" />
            Extract from Website
          </Button>

          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            New Brand
          </Button>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: brand.primaryColor || '#4F46E5' }}
                >
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                  {brand.clientId && (
                    <p className="text-xs text-gray-500">
                      {clients.find(c => c.id === brand.clientId)?.name || 'Unknown Client'}
                    </p>
                  )}
                  <Badge variant={brand.status === 'active' ? 'default' : 'secondary'}>
                    {brand.status === 'active' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {brand.status}
                  </Badge>
                </div>
              </div>
            </div>

            {brand.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{brand.description}</p>
            )}

            <div className="flex gap-2 mb-4">
              {brand.primaryColor && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: brand.primaryColor }}
                  />
                  <span className="text-xs text-gray-500">Primary</span>
                </div>
              )}
              {brand.secondaryColor && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: brand.secondaryColor }}
                  />
                  <span className="text-xs text-gray-500">Secondary</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditPage(brand)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(brand.id, brand.name)}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredBrands.length === 0 && (
        <div className="text-center py-12">
          <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first brand</p>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Brand
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showBrandModal} onOpenChange={setShowBrandModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Create New Brand'}</DialogTitle>
            <DialogDescription>
              {editingBrand ? 'Update brand information' : 'Add a new brand configuration'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrUpdate}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientId">Client *</Label>
                <select
                  id="clientId"
                  name="clientId"
                  defaultValue={editingBrand?.clientId || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  This brand will only be accessible to the selected client
                </p>
              </div>

              <div>
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingBrand?.name}
                  required
                  placeholder="e.g., WeCelebrate"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingBrand?.description}
                  placeholder="Brief description of the brand"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  defaultValue={editingBrand?.logoUrl}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#4F46E5"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      name="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#818CF8"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={editingBrand?.status || 'active'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowBrandModal(false);
                  setEditingBrand(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingBrand ? 'Update Brand' : 'Create Brand'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Extract Branding Modal */}
      <Dialog open={showExtractModal} onOpenChange={setShowExtractModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Extract Branding from Website</DialogTitle>
            <DialogDescription>
              Enter a website URL to automatically extract colors from its design
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="extractUrl">Website URL</Label>
              <div className="flex gap-2">
                <Input
                  id="extractUrl"
                  value={extractUrl}
                  onChange={(e) => setExtractUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1"
                />
                <Button 
                  onClick={handleExtractBranding}
                  disabled={isExtracting || !extractUrl}
                >
                  {isExtracting ? 'Extracting...' : 'Extract Colors'}
                </Button>
              </div>
            </div>

            {extractedColors.length > 0 && (
              <div>
                <Label>Extracted Colors</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Colors are sorted by frequency of use. Select where to apply each color.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                  {extractedColors.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div
                        className="w-full h-24 rounded-lg mb-2 border-2 border-gray-300"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="text-xs font-mono text-center mb-1 font-semibold">{item.color}</div>
                      <div className="text-xs text-gray-500 text-center mb-3 line-clamp-2" title={`Used ${item.count}x in: ${item.usage}`}>
                        {item.count}x • {item.usage}
                      </div>
                      <select
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        onChange={(e) => {
                          if (e.target.value) {
                            applyExtractedColor(item.color, e.target.value as any);
                            e.target.value = ''; // Reset selection
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Apply to...</option>
                        <option value="primary">Primary Color</option>
                        <option value="secondary">Secondary Color</option>
                        <option value="bodyDark">Body Text (Dark)</option>
                        <option value="bodyLight">Body Text (Light)</option>
                        <option value="accent1">Accent Color 1</option>
                        <option value="accent2">Accent Color 2</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extractedColors.length === 0 && !isExtracting && extractUrl && (
              <div className="text-center py-8 text-gray-500">
                <Palette className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No colors extracted yet. Click "Extract Colors" to analyze the website.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowExtractModal(false);
                setExtractUrl('');
                setExtractedColors([]);
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowExtractModal(false);
                setShowBrandModal(true);
              }}
              disabled={extractedColors.length === 0}
            >
              Continue to Create Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
