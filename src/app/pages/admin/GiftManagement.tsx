import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Gift } from '../../../types';
import { apiRequest } from '../../utils/api';
import { CreateGiftModal } from '../../components/admin/CreateGiftModal';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { Package, Plus, Search, Grid, List, Edit2, Trash2, Upload, CheckCircle, XCircle, DollarSign, Tag } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { logger } from '../../utils/logger';
import { parseError } from '../../utils/apiErrors';

// Gift categories
const GIFT_CATEGORIES = [
  'Electronics',
  'Home & Living',
  'Fashion & Accessories',
  'Food & Beverage',
  'Health & Wellness',
  'Office Supplies',
  'Gift Cards',
  'Experiences',
  'Other'
];

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'out_of_stock':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function GiftManagement() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async (retryCount = 0) => {
    setIsLoading(true);
    try {
      // API returns { success: true, data: [...] } from CRUD factory
      const response = await apiRequest<{ success: boolean; data: Gift[]; gifts?: Gift[] }>('/admin/gifts');
      // Support both old format { gifts: [] } and new format { success: true, data: [] }
      const loadedGifts = response.data || response.gifts || [];
      setGifts(loadedGifts);
    } catch (error: unknown) {
      // If we get a 401 and this is the first or second attempt, retry after a short delay
      // This handles the case where the user just logged in and the backend session isn't ready yet
      if (typeof error === 'object' && error !== null && 'status' in error && (error as { status: number }).status === 401 && retryCount < 2) {
        logger.log(`[GiftManagement] Got 401, retrying in 1 second (attempt ${retryCount + 1}/2)`);
        setTimeout(() => loadGifts(retryCount + 1), 1000);
        return;
      }
      
      showErrorToast('Failed to load gifts', parseError(error));
      setGifts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gift.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gift.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || gift.category === filterCategory;
    const matchesStatus = !filterStatus || gift.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = async (giftId: string, giftName: string) => {
    if (!confirm(`Are you sure you want to delete "${giftName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiRequest(`/gifts/${giftId}`, { method: 'DELETE' });
      showSuccessToast(`"${giftName}" deleted successfully`);
      loadGifts();
    } catch (error: unknown) {
      showErrorToast('Failed to delete gift', parseError(error));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedGifts.length} selected gifts? This action cannot be undone.`)) {
      return;
    }

    setIsDeletingBulk(true);
    try {
      await apiRequest('/gifts/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedGifts })
      });
      showSuccessToast(`${selectedGifts.length} gifts deleted successfully`);
      setSelectedGifts([]);
      loadGifts();
    } catch (error: unknown) {
      showErrorToast('Failed to delete gifts', parseError(error));
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleSaveGift = async (giftData: Partial<Gift>) => {
    try {
      if (editingGift) {
        await apiRequest(`/gifts/${editingGift.id}`, {
          method: 'PUT',
          body: JSON.stringify(giftData)
        });
        showSuccessToast('Gift updated successfully');
      } else {
        await apiRequest('/gifts', {
          method: 'POST',
          body: JSON.stringify(giftData)
        });
        showSuccessToast('Gift created successfully');
      }
      setShowCreateModal(false);
      setEditingGift(null);
      loadGifts();
    } catch (error: unknown) {
      showErrorToast(
        editingGift ? 'Failed to update gift' : 'Failed to create gift',
        parseError(error)
      );
    }
  };

  const toggleSelectGift = (giftId: string) => {
    setSelectedGifts(prev =>
      prev.includes(giftId) ? prev.filter(id => id !== giftId) : [...prev, giftId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedGifts.length === filteredGifts.length) {
      setSelectedGifts([]);
    } else {
      setSelectedGifts(filteredGifts.map(g => g.id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gifts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gift Catalog Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your product catalog and inventory</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link to="/admin/product-bulk-import">
            <Button
              variant="outline"
              className="border-[#D91C81] text-[#D91C81] hover:bg-pink-50 w-full sm:w-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
          </Link>
          <Button
            onClick={() => {
              setEditingGift(null);
              setShowCreateModal(true);
            }}
            className="bg-[#D91C81] hover:bg-[#B01669] text-white w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Gift
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{gifts.length}</p>
              <p className="text-sm text-gray-600">Total Gifts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {gifts.filter(g => g.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {gifts.filter(g => (g.status as string) === 'out_of_stock').length}
              </p>
              <p className="text-sm text-gray-600">Out of Stock</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${gifts.reduce((sum, g) => sum + g.price, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, description, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            >
              <option value="">All Categories</option>
              {GIFT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedGifts.length > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-900">
              {selectedGifts.length} gift(s) selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeletingBulk ? 'Deleting...' : 'Delete Selected'}
            </Button>
          </div>
        )}
      </div>

      {/* Gifts Display */}
      {filteredGifts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No gifts found</p>
          <p className="text-sm text-gray-500 mb-4">
            {searchTerm || filterCategory || filterStatus
              ? 'Try adjusting your filters'
              : 'Add your first gift to get started'}
          </p>
          {!searchTerm && !filterCategory && !filterStatus && (
            <Button
              onClick={() => {
                setEditingGift(null);
                setShowCreateModal(true);
              }}
              className="bg-[#D91C81] hover:bg-[#B01669] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Gift
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGifts.map((gift) => (
            <Card key={gift.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedGifts.includes(gift.id)}
                    onCheckedChange={() => toggleSelectGift(gift.id)}
                    className="bg-white"
                  />
                </div>

                {/* Gift Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {gift.image ? (
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(gift.status)}>
                    {gift.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 truncate">{gift.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{gift.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-[#D91C81]">
                    ${gift.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">SKU: {gift.sku}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <span>
                    <Tag className="w-3 h-3 inline mr-1" />
                    {gift.category}
                  </span>
                  <span>
                    Stock: {(gift as any).inventory?.available ?? 0}/{(gift as any).inventory?.total ?? 0}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingGift(gift);
                      setShowCreateModal(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(gift.id, gift.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={selectedGifts.length === filteredGifts.length && filteredGifts.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Gift</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGifts.map((gift) => (
                <tr key={gift.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedGifts.includes(gift.id)}
                      onCheckedChange={() => toggleSelectGift(gift.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {gift.image ? (
                          <img src={gift.image} alt={gift.name} className="w-full h-full object-cover rounded" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{gift.name}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">{gift.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 font-mono">{gift.sku}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{gift.category}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">${gift.price.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {(gift as any).inventory?.available ?? 0} / {(gift as any).inventory?.total ?? 0}
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={getStatusColor(gift.status)}>
                      {gift.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingGift(gift);
                          setShowCreateModal(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(gift.id, gift.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateGiftModal
          giftId={editingGift?.id ?? null}
          onClose={() => {
            setShowCreateModal(false);
            setEditingGift(null);
          }}
        />
      )}
    </div>
  );
}