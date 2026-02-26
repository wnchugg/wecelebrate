/**
 * Create/Edit Catalog Page
 * Form for creating or editing product catalogs
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, Database, ExternalLink, FileText, Package } from 'lucide-react';
import { fetchCatalogById, createCatalog, updateCatalog } from '../../services/catalogApi';
import type { CatalogType, SourceType, SyncFrequency } from '../../types/catalog';

export default function CatalogEdit() {
  const navigate = useNavigate();
  const { catalogId } = useParams();
  const isEdit = !!catalogId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CatalogType>('manual');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  
  // Source configuration
  const [sourceType, setSourceType] = useState<SourceType>('manual');
  const [sourceSystem, setSourceSystem] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [sourceVersion, setSourceVersion] = useState('');
  
  // Settings
  const [autoSync, setAutoSync] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>('manual');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [priceMarkup, setPriceMarkup] = useState<number>(0);
  const [allowSiteOverrides, setAllowSiteOverrides] = useState(true);
  const [trackInventory, setTrackInventory] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [notifyOnSync, setNotifyOnSync] = useState(false);
  const [notifyOnError, setNotifyOnError] = useState(true);

  // Load catalog if editing
  useEffect(() => {
    if (isEdit && catalogId) {
      void loadCatalog(catalogId);
    }
  }, [catalogId, isEdit]);

  async function loadCatalog(id: string) {
    try {
      setLoading(true);
      setError(null);
      
      const catalog = await fetchCatalogById(id);
      
      setName(catalog.name);
      setDescription(catalog.description || '');
      setType(catalog.type);
      setStatus(catalog.status as 'active' | 'inactive');
      
      setSourceType(catalog.source.type);
      setSourceSystem(catalog.source.sourceSystem);
      setSourceId(catalog.source.sourceId);
      setSourceVersion(catalog.source.sourceVersion || '');
      
      setAutoSync(catalog.settings.autoSync);
      setSyncFrequency(catalog.settings.syncFrequency || 'manual');
      setDefaultCurrency(catalog.settings.defaultCurrency);
      setPriceMarkup(catalog.settings.priceMarkup || 0);
      setAllowSiteOverrides(catalog.settings.allowSiteOverrides);
      setTrackInventory(catalog.settings.trackInventory);
      setRequireApproval(catalog.settings.requireApproval || false);
      setNotifyOnSync(catalog.settings.notifyOnSync || false);
      setNotifyOnError(catalog.settings.notifyOnError !== false);
    } catch (err: any) {
      console.error('Error loading catalog:', err);
      setError(err.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setError('Catalog name is required');
      return;
    }
    
    if (!sourceSystem.trim()) {
      setError('Source system is required');
      return;
    }
    
    if (!sourceId.trim()) {
      setError('Source ID is required');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const catalogData = {
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        source: {
          type: sourceType,
          sourceSystem: sourceSystem.trim(),
          sourceId: sourceId.trim(),
          sourceVersion: sourceVersion.trim() || undefined,
        },
        status,
        settings: {
          autoSync,
          syncFrequency: autoSync ? syncFrequency : undefined,
          defaultCurrency,
          priceMarkup: priceMarkup > 0 ? priceMarkup : undefined,
          allowSiteOverrides,
          trackInventory,
          requireApproval,
          notifyOnSync,
          notifyOnError,
        },
      };
      
      if (isEdit && catalogId) {
        await updateCatalog(catalogId, catalogData);
      } else {
        await createCatalog(catalogData);
      }
      
      void navigate('/admin/catalogs');
    } catch (err: any) {
      console.error('Error saving catalog:', err);
      setError(err.message || 'Failed to save catalog');
      setSaving(false);
    }
  }

  function getCatalogTypeIcon(catalogType: CatalogType) {
    switch (catalogType) {
      case 'erp': return Database;
      case 'vendor': return ExternalLink;
      case 'manual': return FileText;
      case 'dropship': return Package;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => void navigate('/admin/catalogs')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalogs
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Catalog' : 'Create New Catalog'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? 'Update catalog configuration' : 'Set up a new product catalog from an ERP or vendor'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="catalog-name" className="block text-sm font-medium text-gray-700 mb-2">
                Catalog Name <span className="text-red-500">*</span>
              </label>
              <input
                id="catalog-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                placeholder="e.g., SAP Main Catalog, Vendor XYZ Products"
                required
              />
            </div>

            <div>
              <label htmlFor="catalog-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="catalog-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                rows={3}
                placeholder="Brief description of this catalog..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Catalog Type <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(['erp', 'vendor', 'manual', 'dropship'] as CatalogType[]).map((catalogType) => {
                    const Icon = getCatalogTypeIcon(catalogType);
                    return (
                      <button
                        key={catalogType}
                        type="button"
                        onClick={() => setType(catalogType)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                          type === catalogType
                            ? 'border-[#D91C81] bg-pink-50 text-[#D91C81]'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium capitalize">{catalogType}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="catalog-status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="catalog-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Source Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Source Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="catalog-source-type" className="block text-sm font-medium text-gray-700 mb-2">
                Source Type <span className="text-red-500">*</span>
              </label>
              <select
                id="catalog-source-type"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              >
                <option value="manual">Manual</option>
                <option value="api">API</option>
                <option value="file">File (FTP/SFTP)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="catalog-source-system" className="block text-sm font-medium text-gray-700 mb-2">
                  Source System <span className="text-red-500">*</span>
                </label>
                <input
                  id="catalog-source-system"
                  type="text"
                  value={sourceSystem}
                  onChange={(e) => setSourceSystem(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  placeholder="e.g., SAP, Oracle, Vendor Portal"
                  required
                />
              </div>

              <div>
                <label htmlFor="catalog-source-id" className="block text-sm font-medium text-gray-700 mb-2">
                  Source ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="catalog-source-id"
                  type="text"
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  placeholder="External system identifier"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="catalog-source-version" className="block text-sm font-medium text-gray-700 mb-2">
                Source Version
              </label>
              <input
                id="catalog-source-version"
                type="text"
                value={sourceVersion}
                onChange={(e) => setSourceVersion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                placeholder="API version or file format version"
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="catalog-default-currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency <span className="text-red-500">*</span>
                </label>
                <select
                  id="catalog-default-currency"
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>

              <div>
                <label htmlFor="catalog-price-markup" className="block text-sm font-medium text-gray-700 mb-2">
                  Price Markup (%)
                </label>
                <input
                  id="catalog-price-markup"
                  type="number"
                  value={priceMarkup}
                  onChange={(e) => setPriceMarkup(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            {/* Auto Sync */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="sr-only">Enable Auto Sync</span>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-5 h-5 text-[#D91C81] rounded focus:ring-2 focus:ring-[#D91C81]"
                />
                <div>
                  <div className="font-medium text-gray-900">Enable Auto Sync</div>
                  <div className="text-sm text-gray-600">Automatically sync products from source system</div>
                </div>
              </label>
              
              {autoSync && (
                <div className="mt-4">
                  <label htmlFor="catalog-sync-frequency" className="block text-sm font-medium text-gray-700 mb-2">
                    Sync Frequency
                  </label>
                  <select
                    id="catalog-sync-frequency"
                    value={syncFrequency}
                    onChange={(e) => setSyncFrequency(e.target.value as SyncFrequency)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  >
                    <option value="manual">Manual</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Other Settings */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="sr-only">Allow Site Overrides</span>
                <input
                  type="checkbox"
                  checked={allowSiteOverrides}
                  onChange={(e) => setAllowSiteOverrides(e.target.checked)}
                  className="w-5 h-5 text-[#D91C81] rounded focus:ring-2 focus:ring-[#D91C81]"
                />
                <div>
                  <div className="font-medium text-gray-900">Allow Site Overrides</div>
                  <div className="text-sm text-gray-600">Sites can modify prices and descriptions</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <span className="sr-only">Track Inventory</span>
                <input
                  type="checkbox"
                  checked={trackInventory}
                  onChange={(e) => setTrackInventory(e.target.checked)}
                  className="w-5 h-5 text-[#D91C81] rounded focus:ring-2 focus:ring-[#D91C81]"
                />
                <div>
                  <div className="font-medium text-gray-900">Track Inventory</div>
                  <div className="text-sm text-gray-600">Monitor product availability</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <span className="sr-only">Require Approval for Sync Changes</span>
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="w-5 h-5 text-[#D91C81] rounded focus:ring-2 focus:ring-[#D91C81]"
                />
                <div>
                  <div className="font-medium text-gray-900">Require Approval for Sync Changes</div>
                  <div className="text-sm text-gray-600">Review changes before applying them</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <span className="sr-only">Notify on Sync</span>
                <input
                  type="checkbox"
                  checked={notifyOnSync}
                  onChange={(e) => setNotifyOnSync(e.target.checked)}
                  className="w-5 h-5 text-[#D91C81] rounded focus:ring-2 focus:ring-[#D91C81]"
                />
                <div>
                  <div className="font-medium text-gray-900">Notify on Sync</div>
                  <div className="text-sm text-gray-600">Send notification after each sync</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <span className="sr-only">Notify on Error</span>
                <input
                  type="checkbox"
                  checked={notifyOnError}
                  onChange={(e) => setNotifyOnError(e.target.checked)}
                  className="w-5 h-5 text-[#D91C81] rounded focus:ring-2 focus:ring-[#D91C81]"
                />
                <div>
                  <div className="font-medium text-gray-900">Notify on Error</div>
                  <div className="text-sm text-gray-600">Send notification when sync fails</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => void navigate('/admin/catalogs')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : isEdit ? 'Update Catalog' : 'Create Catalog'}
          </button>
        </div>
      </form>
    </div>
  );
}
