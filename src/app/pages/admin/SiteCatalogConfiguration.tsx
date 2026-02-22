/**
 * Site Catalog Configuration Page
 * Configure catalog assignment and exclusions for the current site
 */

import { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import {
  Package,
  Eye,
  EyeOff,
  DollarSign,
  Tag,
  AlertCircle,
  CheckCircle,
  Save,
  RefreshCw,
  Info,
  X,
  Plus,
} from 'lucide-react';
import {
  fetchCatalogs,
  fetchSiteCatalogConfig,
  createOrUpdateSiteCatalogConfig,
} from '../../services/catalogApi';
import type { Catalog, SiteCatalogConfig } from '../../types/catalog';

export default function SiteCatalogConfiguration() {
  const { currentSite } = useSite();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Catalogs
  const [availableCatalogs, setAvailableCatalogs] = useState<Catalog[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');
  const [siteConfig, setSiteConfig] = useState<SiteCatalogConfig | null>(null);

  // Exclusions
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
  const [excludedSkus, setExcludedSkus] = useState<string[]>([]);
  const [excludedTags, setExcludedTags] = useState<string[]>([]);
  const [excludedBrands, setExcludedBrands] = useState<string[]>([]);

  // New exclusion inputs
  const [newCategory, setNewCategory] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newBrand, setNewBrand] = useState('');

  // Price overrides
  const [allowPriceOverride, setAllowPriceOverride] = useState(false);
  const [priceAdjustment, setPriceAdjustment] = useState<number>(0);

  // Availability rules
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [hideDiscontinued, setHideDiscontinued] = useState(true);
  const [minimumInventory, setMinimumInventory] = useState<number>(0);
  const [maximumPrice, setMaximumPrice] = useState<number>(0);
  const [minimumPrice, setMinimumPrice] = useState<number>(0);
  const [onlyShowFeatured, setOnlyShowFeatured] = useState(false);

  // Load data
  useEffect(() => {
    if (currentSite) {
      void loadData();
    }
  }, [currentSite]);

  async function loadData() {
    if (!currentSite) return;

    try {
      setLoading(true);
      setError(null);

      // Load available catalogs
      const catalogs = await fetchCatalogs({ status: 'active' });
      setAvailableCatalogs(catalogs);

      // Try to load existing site config
      try {
        const config = await fetchSiteCatalogConfig(currentSite.id);
        setSiteConfig(config);
        setSelectedCatalogId(config.catalogId);

        // Load exclusions
        setExcludedCategories(config.exclusions.excludedCategories || []);
        setExcludedSkus(config.exclusions.excludedSkus || []);
        setExcludedTags(config.exclusions.excludedTags || []);
        setExcludedBrands(config.exclusions.excludedBrands || []);

        // Load overrides
        if (config.overrides) {
          setAllowPriceOverride(config.overrides.allowPriceOverride);
          setPriceAdjustment(config.overrides.priceAdjustment || 0);
        }

        // Load availability rules
        if (config.availability) {
          setHideOutOfStock(config.availability.hideOutOfStock);
          setHideDiscontinued(config.availability.hideDiscontinued);
          setMinimumInventory(config.availability.minimumInventory || 0);
          setMaximumPrice(config.availability.maximumPrice || 0);
          setMinimumPrice(config.availability.minimumPrice || 0);
          setOnlyShowFeatured(config.availability.onlyShowFeatured || false);
        }
      } catch (err) {
        // No config yet, that's okay
        console.warn('No existing site catalog config');
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!currentSite || !selectedCatalogId) {
      setError('Please select a catalog');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const configData = {
        catalogId: selectedCatalogId,
        exclusions: {
          excludedCategories,
          excludedSkus,
          excludedTags,
          excludedBrands,
        },
        overrides: {
          allowPriceOverride,
          priceAdjustment: priceAdjustment > 0 ? priceAdjustment : undefined,
        },
        availability: {
          hideOutOfStock,
          hideDiscontinued,
          minimumInventory: minimumInventory > 0 ? minimumInventory : undefined,
          maximumPrice: maximumPrice > 0 ? maximumPrice : undefined,
          minimumPrice: minimumPrice > 0 ? minimumPrice : undefined,
          onlyShowFeatured,
        },
      };

      await createOrUpdateSiteCatalogConfig(currentSite.id, configData);
      setSuccess('Site catalog configuration saved successfully!');
      
      // Reload to get updated config
      await loadData();
    } catch (err: any) {
      console.error('Error saving configuration:', err);
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  // Exclusion handlers
  function addCategory() {
    if (newCategory && !excludedCategories.includes(newCategory)) {
      setExcludedCategories([...excludedCategories, newCategory]);
      setNewCategory('');
    }
  }

  function removeCategory(category: string) {
    setExcludedCategories(excludedCategories.filter(c => c !== category));
  }

  function addSku() {
    if (newSku && !excludedSkus.includes(newSku)) {
      setExcludedSkus([...excludedSkus, newSku]);
      setNewSku('');
    }
  }

  function removeSku(sku: string) {
    setExcludedSkus(excludedSkus.filter(s => s !== sku));
  }

  function addTag() {
    if (newTag && !excludedTags.includes(newTag)) {
      setExcludedTags([...excludedTags, newTag]);
      setNewTag('');
    }
  }

  function removeTag(tag: string) {
    setExcludedTags(excludedTags.filter(t => t !== tag));
  }

  function addBrand() {
    if (newBrand && !excludedBrands.includes(newBrand)) {
      setExcludedBrands([...excludedBrands, newBrand]);
      setNewBrand('');
    }
  }

  function removeBrand(brand: string) {
    setExcludedBrands(excludedBrands.filter(b => b !== brand));
  }

  if (!currentSite) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Site Selected</h3>
          <p className="text-gray-600">
            Please select a site from the site selector in the top-right corner to configure its catalog.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedCatalog = availableCatalogs.find(c => c.id === selectedCatalogId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Site Catalog Configuration</h1>
        <p className="text-gray-600 mt-1">
          Configure which catalog <span className="font-semibold">{currentSite.name}</span> uses and set up exclusions
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Catalog Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-[#D91C81]" />
            <h2 className="text-lg font-semibold text-gray-900">Catalog Assignment</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Catalog <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCatalogId}
                onChange={(e) => setSelectedCatalogId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              >
                <option value="">-- Select a Catalog --</option>
                {availableCatalogs.map((catalog) => (
                  <option key={catalog.id} value={catalog.id}>
                    {catalog.name} ({catalog.type.toUpperCase()}) - {catalog.totalProducts} products
                  </option>
                ))}
              </select>
            </div>

            {selectedCatalog && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">{selectedCatalog.name}</h4>
                    <p className="text-sm text-blue-800 mb-2">{selectedCatalog.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-medium">Type:</span> {selectedCatalog.type.toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium">Source:</span> {selectedCatalog.source.sourceSystem}
                      </div>
                      <div>
                        <span className="font-medium">Products:</span> {selectedCatalog.activeProducts} active / {selectedCatalog.totalProducts} total
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Exclusions */}
        {selectedCatalogId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <EyeOff className="w-5 h-5 text-[#D91C81]" />
              <h2 className="text-lg font-semibold text-gray-900">Product Exclusions</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Exclude specific categories, SKUs, tags, or brands from being visible on this site.
            </p>

            <div className="space-y-6">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excluded Categories</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                    placeholder="Enter category name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {excludedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {excludedCategories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SKUs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excluded SKUs</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSku())}
                    placeholder="Enter SKU"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSku}
                    className="px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {excludedSkus.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {excludedSkus.map((sku) => (
                      <span
                        key={sku}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-mono"
                      >
                        {sku}
                        <button
                          type="button"
                          onClick={() => removeSku(sku)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excluded Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Enter tag"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {excludedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {excludedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Brands */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excluded Brands</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBrand())}
                    placeholder="Enter brand name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addBrand}
                    className="px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {excludedBrands.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {excludedBrands.map((brand) => (
                      <span
                        key={brand}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {brand}
                        <button
                          type="button"
                          onClick={() => removeBrand(brand)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Price Overrides */}
        {selectedCatalogId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-[#D91C81]" />
              <h2 className="text-lg font-semibold text-gray-900">Price Overrides</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowPriceOverride"
                  checked={allowPriceOverride}
                  onChange={(e) => setAllowPriceOverride(e.target.checked)}
                  className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                />
                <label htmlFor="allowPriceOverride" className="text-sm font-medium text-gray-700">
                  Allow price overrides for this site
                </label>
              </div>

              {allowPriceOverride && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Global Price Adjustment (%)
                  </label>
                  <input
                    type="number"
                    value={priceAdjustment}
                    onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                    placeholder="0"
                    min="-100"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Positive values increase prices, negative values decrease them. Leave at 0 for no adjustment.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Availability Rules */}
        {selectedCatalogId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-[#D91C81]" />
              <h2 className="text-lg font-semibold text-gray-900">Availability Rules</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Control which products are visible based on inventory and pricing.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hideOutOfStock"
                  checked={hideOutOfStock}
                  onChange={(e) => setHideOutOfStock(e.target.checked)}
                  className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                />
                <label htmlFor="hideOutOfStock" className="text-sm font-medium text-gray-700">
                  Hide out of stock products
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hideDiscontinued"
                  checked={hideDiscontinued}
                  onChange={(e) => setHideDiscontinued(e.target.checked)}
                  className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                />
                <label htmlFor="hideDiscontinued" className="text-sm font-medium text-gray-700">
                  Hide discontinued products
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="onlyShowFeatured"
                  checked={onlyShowFeatured}
                  onChange={(e) => setOnlyShowFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                />
                <label htmlFor="onlyShowFeatured" className="text-sm font-medium text-gray-700">
                  Only show featured products
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Inventory Threshold
                </label>
                <input
                  type="number"
                  value={minimumInventory}
                  onChange={(e) => setMinimumInventory(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hide products with inventory below this amount
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Price ($)
                  </label>
                  <input
                    type="number"
                    value={minimumPrice}
                    onChange={(e) => setMinimumPrice(Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Price ($)
                  </label>
                  <input
                    type="number"
                    value={maximumPrice}
                    onChange={(e) => setMaximumPrice(Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !selectedCatalogId}
            className="px-6 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}