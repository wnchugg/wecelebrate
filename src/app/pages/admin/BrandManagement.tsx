import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Building2, Tag, CheckCircle, Eye } from 'lucide-react';
import { useSite, Brand } from '../../context/SiteContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BrandModal } from '../../components/admin/BrandModal';
import { toast } from 'sonner';

export function BrandManagement() {
  const { brands, sites, addBrand, updateBrand, deleteBrand, getSitesByBrand } = useSite();
  const [searchQuery, setSearchQuery] = useState('');
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('all');

  // Get unique clients
  const clients = Array.from(new Set(brands.map(b => b.clientName))).sort();

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brand.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient = selectedClient === 'all' || brand.clientName === selectedClient;
    return matchesSearch && matchesClient;
  });

  const handleAddBrand = () => {
    setEditingBrand(null);
    setShowBrandModal(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setShowBrandModal(true);
  };

  const handleDeleteBrand = (brandId: string) => {
    const brandSites = getSitesByBrand(brandId);
    if (brandSites.length > 0) {
      toast.error(`Cannot delete brand with ${brandSites.length} active site(s)`);
      return;
    }
    
    if (confirm('Are you sure you want to delete this brand?')) {
      deleteBrand(brandId);
      toast.success('Brand deleted successfully');
    }
  };

  const handleSaveBrand = (brand: Brand) => {
    if (editingBrand) {
      updateBrand(brand.id, brand);
      toast.success('Brand updated successfully');
    } else {
      addBrand(brand);
      toast.success('Brand created successfully');
    }
    setShowBrandModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
          <p className="text-gray-600 mt-1">Manage client brands and their configurations</p>
        </div>
        <Button
          onClick={handleAddBrand}
          className="bg-[#D91C81] hover:bg-[#B01669] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Brand
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-8 h-8 text-[#D91C81]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{brands.length}</p>
          <p className="text-sm text-gray-600">Total Brands</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {brands.filter(b => b.isActive).length}
          </p>
          <p className="text-sm text-gray-600">Active Brands</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Tag className="w-8 h-8 text-[#00B4CC]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
          <p className="text-sm text-gray-600">Unique Clients</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-[#1B2A5E]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {sites.filter(s => s.brandId).length}
          </p>
          <p className="text-sm text-gray-600">Sites with Brands</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Brands
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by brand or client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Brands List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            All Brands ({filteredBrands.length})
          </h2>
        </div>

        {filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No brands found</p>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery || selectedClient !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first brand to get started'}
            </p>
            {!searchQuery && selectedClient === 'all' && (
              <Button
                onClick={handleAddBrand}
                className="bg-[#D91C81] hover:bg-[#B01669] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Brand
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredBrands.map(brand => {
              const brandSites = getSitesByBrand(brand.id);
              return (
                <div
                  key={brand.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-sm"
                      style={{ backgroundColor: brand.primaryColor }}
                    >
                      {brand.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{brand.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{brand.clientName}</p>
                      {brand.description && (
                        <p className="text-sm text-gray-500 mb-3">{brand.description}</p>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: brand.primaryColor }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: brand.secondaryColor }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: brand.tertiaryColor }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBrand(brand)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Brand Sites */}
                  {brandSites.length > 0 && (
                    <div className="mt-4 ml-15 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Associated Sites:</p>
                      <div className="flex flex-wrap gap-2">
                        {brandSites.map(site => (
                          <Badge
                            key={site.id}
                            className="bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {site.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Brand Modal */}
      <BrandModal
        open={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        brand={editingBrand}
        onSave={handleSaveBrand}
      />
    </div>
  );
}