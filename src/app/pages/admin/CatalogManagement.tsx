/**
 * Catalog Management Page
 * Admin interface for managing product catalogs
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Filter, Edit2, Trash2, Database, FileText, Package, ExternalLink } from 'lucide-react';
import { fetchCatalogs, deleteCatalog } from '../../services/catalogApi';
import type { Catalog, CatalogType, CatalogStatus } from '../../types/catalog';
import type { CatalogFilters } from '../../../types/catalog';
import { logger } from '../../utils/logger';

export default function CatalogManagement() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CatalogType | ''>('');
  const [filterStatus, setFilterStatus] = useState<CatalogStatus | ''>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load catalogs
  useEffect(() => {
    loadCatalogs();
  }, [filterType, filterStatus]);

  async function loadCatalogs() {
    try {
      setLoading(true);
      setError(null);
      
      const filters: CatalogFilters = {};
      if (filterType) filters.type = filterType;
      if (filterStatus) filters.status = filterStatus;
      
      const data = await fetchCatalogs(filters);
      setCatalogs(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load catalogs';
      logger.error('[CatalogManagement] Error loading catalogs', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(catalogId: string) {
    if (deleteConfirm !== catalogId) {
      setDeleteConfirm(catalogId);
      return;
    }

    try {
      setDeleting(catalogId);
      await deleteCatalog(catalogId);
      setCatalogs(catalogs.filter(c => c.id !== catalogId));
      setDeleteConfirm(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete catalog';
      logger.error('[CatalogManagement] Error deleting catalog', { catalogId, error: errorMessage });
      alert(errorMessage);
    } finally {
      setDeleting(null);
    }
  }

  // Filter catalogs by search term
  const filteredCatalogs = catalogs.filter(catalog => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      catalog.name.toLowerCase().includes(term) ||
      catalog.description?.toLowerCase().includes(term) ||
      catalog.type.toLowerCase().includes(term) ||
      (catalog.source?.sourceSystem || '').toLowerCase().includes(term)
    );
  });

  // Get catalog type icon and color
  function getCatalogTypeDisplay(type: CatalogType) {
    switch (type) {
      case 'erp':
        return { icon: Database, label: 'ERP', color: 'text-blue-600 bg-blue-50' };
      case 'vendor':
        return { icon: ExternalLink, label: 'Vendor', color: 'text-purple-600 bg-purple-50' };
      case 'manual':
        return { icon: FileText, label: 'Manual', color: 'text-gray-600 bg-gray-50' };
      case 'dropship':
        return { icon: Package, label: 'Dropship', color: 'text-green-600 bg-green-50' };
    }
  }

  // Get status badge
  function getStatusBadge(status: CatalogStatus) {
    const styles: Record<CatalogStatus, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      syncing: 'bg-blue-100 text-blue-700',
      error: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catalog Management</h1>
            <p className="text-gray-600 mt-1">Manage product catalogs from different ERP systems and vendors</p>
          </div>
          <Link
            to="/admin/catalogs/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Catalog
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search catalogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as CatalogType | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="erp">ERP</option>
            <option value="vendor">Vendor</option>
            <option value="manual">Manual</option>
            <option value="dropship">Dropship</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as CatalogStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="syncing">Syncing</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Catalogs List */}
      {!loading && (
        <>
          {filteredCatalogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No catalogs found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterType || filterStatus
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first catalog'}
              </p>
              {!searchTerm && !filterType && !filterStatus && (
                <Link
                  to="/admin/catalogs/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Catalog
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCatalogs.map((catalog) => {
                const typeDisplay = getCatalogTypeDisplay(catalog.type);
                const TypeIcon = typeDisplay.icon;

                return (
                  <div
                    key={catalog.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${typeDisplay.color}`}>
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {catalog.name}
                          </h3>
                          {catalog.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {catalog.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusBadge(catalog.status)}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{catalog.totalProducts}</div>
                        <div className="text-xs text-gray-600">Total Products</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{catalog.activeProducts}</div>
                        <div className="text-xs text-gray-600">Active</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">{typeDisplay.label}</div>
                        <div className="text-xs text-gray-600">{catalog.source?.sourceSystem}</div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Currency:</span> {catalog.settings?.defaultCurrency}
                      </div>
                      <div>
                        <span className="font-medium">Auto Sync:</span>{' '}
                        {catalog.settings?.autoSync ? 'Enabled' : 'Disabled'}
                      </div>
                      {catalog.lastSyncedAt && (
                        <div className="col-span-2">
                          <span className="font-medium">Last Synced:</span>{' '}
                          {new Date(catalog.lastSyncedAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                      <Link
                        to={`/admin/catalogs/${catalog.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(catalog.id)}
                        disabled={deleting === catalog.id}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          deleteConfirm === catalog.id
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleting === catalog.id
                          ? 'Deleting...'
                          : deleteConfirm === catalog.id
                          ? 'Confirm Delete'
                          : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Summary */}
      {!loading && catalogs.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="text-blue-900">
              <span className="font-semibold">{filteredCatalogs.length}</span> of{' '}
              <span className="font-semibold">{catalogs.length}</span> catalogs shown
            </div>
            {(searchTerm || filterType || filterStatus) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterStatus('');
                }}
                className="text-blue-700 hover:text-blue-900 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}