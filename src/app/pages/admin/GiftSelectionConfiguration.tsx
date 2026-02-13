import { useState, useEffect } from 'react';
import { Save, Eye, RefreshCw, Search, Filter, ArrowUpDown } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { GiftSelectionConfig } from '../../types/siteCustomization';
import { toast } from 'sonner';

const defaultConfig: GiftSelectionConfig = {
  layout: {
    style: 'grid',
    itemsPerRow: 3,
    itemsPerPage: 12,
    showPagination: true,
    showLoadMore: false,
  },
  search: {
    enabled: true,
    placeholder: 'Search gifts...',
    position: 'top',
    showSearchButton: false,
    liveSearch: true,
  },
  filters: {
    enabled: true,
    position: 'sidebar',
    collapsible: true,
    categories: {
      enabled: true,
      label: 'Categories',
    },
    priceRange: {
      enabled: true,
      label: 'Price Range',
    },
    customFilters: [],
  },
  sorting: {
    enabled: true,
    position: 'top',
    options: [
      { id: 'name-asc', label: 'Name (A-Z)', field: 'name', direction: 'asc' },
      { id: 'name-desc', label: 'Name (Z-A)', field: 'name', direction: 'desc' },
      { id: 'price-asc', label: 'Price (Low to High)', field: 'price', direction: 'asc' },
      { id: 'price-desc', label: 'Price (High to Low)', field: 'price', direction: 'desc' },
    ],
    default: 'name-asc',
  },
  display: {
    showPrices: true,
    showInventory: true,
    showRatings: false,
    showQuickView: true,
    showCompare: false,
    showWishlist: false,
    imageAspectRatio: '1:1',
    hoverEffect: 'lift',
  },
  messages: {
    noResults: 'No gifts found matching your criteria.',
    loading: 'Loading gifts...',
    error: 'Unable to load gifts. Please try again.',
    selectGiftPrompt: 'Select a gift to continue',
  },
};

export function GiftSelectionConfiguration() {
  const { currentSite, updateSite } = useSite();
  const [config, setConfig] = useState<GiftSelectionConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Load existing configuration
    if (currentSite?.giftSelectionConfig) {
      setConfig(currentSite.giftSelectionConfig);
    } else {
      setConfig(defaultConfig);
    }
  }, [currentSite]);

  const handleSave = async () => {
    if (!currentSite) return;
    
    setIsSaving(true);
    try {
      await updateSite(currentSite.id, { giftSelectionConfig: config });
      toast.success('Gift Selection configuration saved');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gift Selection Configuration</h1>
          <p className="mt-2 text-gray-600">
            Customize the gift selection page layout, search, filters, and display options
          </p>
        </div>

        {/* Layout Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Layout Settings</h2>
          
          <div className="space-y-6">
            {/* Layout Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Layout Style</label>
              <select
                value={config.layout.style}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    layout: { ...prev.layout, style: e.target.value as any },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="carousel">Carousel</option>
                <option value="masonry">Masonry</option>
              </select>
            </div>

            {/* Items Per Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items Per Row {config.layout.style === 'grid' ? '' : '(Grid Only)'}
              </label>
              <select
                value={config.layout.itemsPerRow}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    layout: { ...prev.layout, itemsPerRow: parseInt(e.target.value) as any },
                  }))
                }
                disabled={config.layout.style !== 'grid'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81] disabled:bg-gray-100"
              >
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items Per Page</label>
              <input
                type="number"
                value={config.layout.itemsPerPage}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    layout: { ...prev.layout, itemsPerPage: parseInt(e.target.value) },
                  }))
                }
                min="6"
                max="100"
                step="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
              />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Show Pagination</label>
              <input
                type="checkbox"
                checked={config.layout.showPagination}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    layout: { ...prev.layout, showPagination: e.target.checked },
                  }))
                }
                className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Show Load More Button</label>
              <input
                type="checkbox"
                checked={config.layout.showLoadMore}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    layout: { ...prev.layout, showLoadMore: e.target.checked },
                  }))
                }
                className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Search Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-[#D91C81]" />
            <h2 className="text-xl font-semibold text-gray-900">Search Settings</h2>
          </div>

          <div className="space-y-6">
            {/* Enable Search */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Search</label>
              <input
                type="checkbox"
                checked={config.search.enabled}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    search: { ...prev.search, enabled: e.target.checked },
                  }))
                }
                className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
              />
            </div>

            {config.search.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder Text</label>
                  <input
                    type="text"
                    value={config.search.placeholder}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        search: { ...prev.search, placeholder: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={config.search.position}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        search: { ...prev.search, position: e.target.value as any },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                  >
                    <option value="top">Top</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Show Search Button</label>
                  <input
                    type="checkbox"
                    checked={config.search.showSearchButton}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        search: { ...prev.search, showSearchButton: e.target.checked },
                      }))
                    }
                    className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Live Search (Search as you type)</label>
                  <input
                    type="checkbox"
                    checked={config.search.liveSearch}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        search: { ...prev.search, liveSearch: e.target.checked },
                      }))
                    }
                    className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filters Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-6 h-6 text-[#D91C81]" />
            <h2 className="text-xl font-semibold text-gray-900">Filter Settings</h2>
          </div>

          <div className="space-y-6">
            {/* Enable Filters */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Filters</label>
              <input
                type="checkbox"
                checked={config.filters.enabled}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    filters: { ...prev.filters, enabled: e.target.checked },
                  }))
                }
                className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
              />
            </div>

            {config.filters.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={config.filters.position}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        filters: { ...prev.filters, position: e.target.value as any },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                  >
                    <option value="top">Top</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="modal">Modal</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Collapsible Filters</label>
                  <input
                    type="checkbox"
                    checked={config.filters.collapsible}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        filters: { ...prev.filters, collapsible: e.target.checked },
                      }))
                    }
                    className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Category Filter</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Enable Category Filter</label>
                      <input
                        type="checkbox"
                        checked={config.filters.categories.enabled}
                        onChange={(e) =>
                          setConfig(prev => ({
                            ...prev,
                            filters: {
                              ...prev.filters,
                              categories: { ...prev.filters.categories, enabled: e.target.checked },
                            },
                          }))
                        }
                        className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                      />
                    </div>
                    {config.filters.categories.enabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                        <input
                          type="text"
                          value={config.filters.categories.label}
                          onChange={(e) =>
                            setConfig(prev => ({
                              ...prev,
                              filters: {
                                ...prev.filters,
                                categories: { ...prev.filters.categories, label: e.target.value },
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Price Range Filter</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Enable Price Range Filter</label>
                      <input
                        type="checkbox"
                        checked={config.filters.priceRange.enabled}
                        onChange={(e) =>
                          setConfig(prev => ({
                            ...prev,
                            filters: {
                              ...prev.filters,
                              priceRange: { ...prev.filters.priceRange, enabled: e.target.checked },
                            },
                          }))
                        }
                        className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                      />
                    </div>
                    {config.filters.priceRange.enabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                        <input
                          type="text"
                          value={config.filters.priceRange.label}
                          onChange={(e) =>
                            setConfig(prev => ({
                              ...prev,
                              filters: {
                                ...prev.filters,
                                priceRange: { ...prev.filters.priceRange, label: e.target.value },
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sorting Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <ArrowUpDown className="w-6 h-6 text-[#D91C81]" />
            <h2 className="text-xl font-semibold text-gray-900">Sorting Settings</h2>
          </div>

          <div className="space-y-6">
            {/* Enable Sorting */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Sorting</label>
              <input
                type="checkbox"
                checked={config.sorting.enabled}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    sorting: { ...prev.sorting, enabled: e.target.checked },
                  }))
                }
                className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
              />
            </div>

            {config.sorting.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={config.sorting.position}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        sorting: { ...prev.sorting, position: e.target.value as any },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                  >
                    <option value="top">Top</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Sort</label>
                  <select
                    value={config.sorting.default}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        sorting: { ...prev.sorting, default: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                  >
                    {config.sorting.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Display Options */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Display Options</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Show Prices</label>
              <input
                type="checkbox"
                checked={config.display.showPrices}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    display: { ...prev.display, showPrices: e.target.checked },
                  }))
                }
                className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Show Inventory Status</label>
              <input
                type="checkbox"
                checked={config.display.showInventory}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    display: { ...prev.display, showInventory: e.target.checked },
                  }))
                }
                className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Show Ratings</label>
              <input
                type="checkbox"
                checked={config.display.showRatings}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    display: { ...prev.display, showRatings: e.target.checked },
                  }))
                }
                className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Show Quick View</label>
              <input
                type="checkbox"
                checked={config.display.showQuickView}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    display: { ...prev.display, showQuickView: e.target.checked },
                  }))
                }
                className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Aspect Ratio</label>
              <select
                value={config.display.imageAspectRatio}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    display: { ...prev.display, imageAspectRatio: e.target.value as any },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
              >
                <option value="1:1">Square (1:1)</option>
                <option value="4:3">Standard (4:3)</option>
                <option value="16:9">Widescreen (16:9)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hover Effect</label>
              <select
                value={config.display.hoverEffect}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    display: { ...prev.display, hoverEffect: e.target.value as any },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
              >
                <option value="none">None</option>
                <option value="lift">Lift</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Custom Messages</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">No Results Message</label>
              <input
                type="text"
                value={config.messages.noResults}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    messages: { ...prev.messages, noResults: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loading Message</label>
              <input
                type="text"
                value={config.messages.loading}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    messages: { ...prev.messages, loading: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Error Message</label>
              <input
                type="text"
                value={config.messages.error}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    messages: { ...prev.messages, error: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 text-[#D91C81] border border-[#D91C81] rounded-md hover:bg-pink-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setConfig(defaultConfig)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-[#D91C81] text-white rounded-md hover:bg-[#B71569] transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
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
    </div>
  );
}
