import { useState, useEffect } from 'react';
import { Package, Save, AlertCircle, Info, Plus, Trash2, Edit2, X, Check, Search, Grid3x3, List, GripVertical, ArrowUpDown, Eye, FileEdit, Rocket } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSite } from '../../context/SiteContext';
import { useGift, SiteGiftConfiguration as SiteGiftConfig, GIFT_CATEGORIES, Gift } from '../../context/GiftContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { formatPrice, getCurrencySymbol } from '../../utils/currency';
import { ComplianceBadges } from '../../components/ComplianceBadges';
import { DraggableGiftCard } from '../../components/DraggableGiftCard';
import { Badge } from '../../components/ui/badge';
import { apiRequest } from '../../utils/api';
import { logger } from '../../utils/logger';

interface PriceLevelForm {
  id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
}

export function SiteGiftConfiguration() {
  const { currentSite } = useSite();
  const { gifts, getSiteConfiguration, updateSiteConfiguration, getGiftsBySite } = useGift();

  const [configMode, setConfigMode] = useState<'live' | 'draft'>('draft');
  const [liveConfig, setLiveConfig] = useState<SiteGiftConfig | null>(null);
  const [draftConfig, setDraftConfig] = useState<SiteGiftConfig>({
    siteId: currentSite?.id || '',
    assignmentStrategy: 'all',
  });
  
  // Current working config based on mode
  const config = configMode === 'live' ? (liveConfig || draftConfig) : draftConfig;
  const setConfig = (newConfig: SiteGiftConfig) => {
    if (configMode === 'draft') {
      setDraftConfig(newConfig);
    }
    // Live config is read-only, can't edit directly
  };

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [levelForm, setLevelForm] = useState<PriceLevelForm>({
    id: '',
    name: '',
    minPrice: 0,
    maxPrice: 0,
  });
  const [availableGifts, setAvailableGifts] = useState<Gift[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (currentSite) {
      // Load configuration from backend
      loadConfiguration();
    }
  }, [currentSite]);

  // Auto-save draft changes
  useEffect(() => {
    if (configMode === 'draft' && currentSite) {
      const timeoutId = setTimeout(() => {
        handleSaveDraft();
      }, 1000); // Auto-save 1 second after changes

      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [draftConfig, configMode]);

  const loadConfiguration = async () => {
    if (!currentSite) return;
    
    try {
      logger.info('[SiteGiftConfiguration] Loading configuration', { siteId: currentSite.id });
      const response = await apiRequest<{ config: SiteGiftConfig | null }>(`/sites/${currentSite.id}/gift-config`);
      logger.debug('[SiteGiftConfiguration] Config response received', { hasConfig: !!response.config });
      
      if (response.config) {
        setLiveConfig(response.config);
        setDraftConfig(response.config);
        logger.info('[SiteGiftConfiguration] Configuration loaded successfully');
      } else {
        // If no config exists, use default
        const defaultConfig = {
          siteId: currentSite.id,
          assignmentStrategy: 'all' as const,
        };
        setLiveConfig(defaultConfig);
        setDraftConfig(defaultConfig);
        logger.info('[SiteGiftConfiguration] No config found, using default');
      }
    } catch (error) {
      logger.error('[SiteGiftConfiguration] Error loading config', { error });
      // If no config exists, use default
      const defaultConfig = {
        siteId: currentSite.id,
        assignmentStrategy: 'all' as const,
      };
      setLiveConfig(defaultConfig);
      setDraftConfig(defaultConfig);
      logger.info('[SiteGiftConfiguration] Error occurred, using default');
    }
  };

  // Load available gifts for this site
  useEffect(() => {
    if (currentSite) {
      getGiftsBySite(currentSite.id).then(setAvailableGifts);
    }
  }, [currentSite, getGiftsBySite]);

  const handleSave = async () => {
    if (!currentSite) return;
    
    setIsSaving(true);
    try {
      logger.info('[SiteGiftConfiguration] Saving configuration', { siteId: currentSite.id });
      
      // Save to backend
      const response = await apiRequest<{ config: SiteGiftConfig }>(`/sites/${currentSite.id}/gift-config`, {
        method: 'PUT',
        body: JSON.stringify(config)
      });
      
      logger.info('[SiteGiftConfiguration] Save successful');
      
      // Also update the context
      updateSiteConfiguration(config);
      
      // Reload configuration from backend to verify it was saved
      await loadConfiguration();
      
      // Reload available gifts to update the summary
      const updatedGifts = await getGiftsBySite(currentSite.id);
      setAvailableGifts(updatedGifts);
      logger.debug('[SiteGiftConfiguration] Updated gifts', { count: updatedGifts.length });
      
      toast.success('Site gift configuration saved successfully');
    } catch (error) {
      logger.error('[SiteGiftConfiguration] Error saving configuration', { error });
      toast.error('Failed to save configuration. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!currentSite || !draftConfig) return;
    
    // Silent auto-save without toast notifications
    try {
      logger.debug('[SiteGiftConfiguration] Auto-saving draft');
      // For now, just store in localStorage as a backup
      localStorage.setItem(`draft_config_${currentSite.id}`, JSON.stringify(draftConfig));
    } catch (error) {
      logger.error('[SiteGiftConfiguration] Error auto-saving draft', { error });
    }
  };

  const handlePublish = async () => {
    if (!currentSite) return;
    
    setIsPublishing(true);
    try {
      logger.info('[SiteGiftConfiguration] Publishing configuration', { siteId: currentSite.id });
      
      // Save to backend
      const response = await apiRequest<{ config: SiteGiftConfig }>(`/sites/${currentSite.id}/gift-config`, {
        method: 'PUT',
        body: JSON.stringify(config)
      });
      
      logger.info('[SiteGiftConfiguration] Publish successful');
      
      // Also update the context
      updateSiteConfiguration(config);
      
      // Reload configuration from backend to verify it was saved
      await loadConfiguration();
      
      // Reload available gifts to update the summary
      const updatedGifts = await getGiftsBySite(currentSite.id);
      setAvailableGifts(updatedGifts);
      logger.debug('[SiteGiftConfiguration] Updated gifts', { count: updatedGifts.length });
      
      toast.success('Site gift configuration published successfully');
    } catch (error) {
      logger.error('[SiteGiftConfiguration] Error publishing configuration', { error });
      toast.error('Failed to publish configuration. Check console for details.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddLevel = () => {
    const newLevel = {
      id: `level-${Date.now()}`,
      name: 'New Level',
      minPrice: 0,
      maxPrice: 100,
    };
    setConfig({
      ...config,
      priceLevels: [...(config.priceLevels || []), newLevel],
    });
  };

  const handleEditLevel = (level: PriceLevelForm) => {
    setEditingLevel(level.id);
    setLevelForm(level);
  };

  const handleSaveLevel = () => {
    if (!config.priceLevels) return;
    
    const updatedLevels = config.priceLevels.map(level =>
      level.id === editingLevel ? levelForm : level
    );
    
    setConfig({ ...config, priceLevels: updatedLevels });
    setEditingLevel(null);
  };

  const handleDeleteLevel = (id: string) => {
    if (!config.priceLevels) return;
    
    const updatedLevels = config.priceLevels.filter(level => level.id !== id);
    setConfig({ ...config, priceLevels: updatedLevels });
    
    if (config.selectedLevelId === id) {
      setConfig({ ...config, selectedLevelId: undefined, priceLevels: updatedLevels });
    }
  };

  const handleToggleProduct = (giftId: string) => {
    const current = config.includedGiftIds || [];
    if (current.includes(giftId)) {
      setConfig({ ...config, includedGiftIds: current.filter(id => id !== giftId) });
    } else {
      setConfig({ ...config, includedGiftIds: [...current, giftId] });
    }
  };

  // Drag and Drop for reordering
  const moveGift = (dragIndex: number, hoverIndex: number) => {
    logger.debug('[SiteGiftConfiguration] moveGift called', { dragIndex, hoverIndex });
    const updatedGiftIds = [...(config.includedGiftIds || [])];
    logger.debug('[SiteGiftConfiguration] Before move', { giftIds: updatedGiftIds });
    
    const [removed] = updatedGiftIds.splice(dragIndex, 1);
    updatedGiftIds.splice(hoverIndex, 0, removed);
    
    logger.debug('[SiteGiftConfiguration] After move', { giftIds: updatedGiftIds });
    
    setConfig({
      ...config,
      includedGiftIds: updatedGiftIds
    });
  };

  if (!currentSite) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-600 text-lg">Please select a site to configure gifts</p>
      </div>
    );
  }

  // Get site currency (define early so it's available in filters)
  const currency = currentSite.settings.defaultCurrency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  const allActiveGifts = gifts.filter(g => g.status === 'active');
  
  const filteredGifts = allActiveGifts.filter(gift => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase().trim();
    
    // Check name, SKU, and category
    const matchesText = 
      gift.name.toLowerCase().includes(query) ||
      gift.sku.toLowerCase().includes(query) ||
      gift.category.toLowerCase().includes(query);
    
    // Check price
    let matchesPrice = false;
    
    // Handle price range search (e.g., "10-50", "20 - 100")
    const rangeMatch = query.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
    if (rangeMatch) {
      const [, minPrice, maxPrice] = rangeMatch;
      matchesPrice = gift.price >= parseFloat(minPrice) && gift.price <= parseFloat(maxPrice);
    }
    
    // Handle "less than" search (e.g., "<50", "< 100")
    const lessThanMatch = query.match(/^<\s*(\d+(?:\.\d+)?)$/);
    if (lessThanMatch) {
      matchesPrice = gift.price < parseFloat(lessThanMatch[1]);
    }
    
    // Handle "greater than" search (e.g., ">50", "> 100")
    const greaterThanMatch = query.match(/^>\s*(\d+(?:\.\d+)?)$/);
    if (greaterThanMatch) {
      matchesPrice = gift.price > parseFloat(greaterThanMatch[1]);
    }
    
    // Handle exact or partial price match (e.g., "25", "25.99")
    if (!rangeMatch && !lessThanMatch && !greaterThanMatch) {
      const priceStr = gift.price.toFixed(2);
      const formattedPrice = formatPrice(gift.price, currency).toLowerCase();
      matchesPrice = priceStr.includes(query) || formattedPrice.includes(query);
    }
    
    return matchesText || matchesPrice;
  });

  const selectedGifts = allActiveGifts.filter(gift => 
    config.includedGiftIds?.includes(gift.id)
  );

  // Get the ordered selected gifts based on includedGiftIds array order
  const orderedSelectedGifts = (config.includedGiftIds || [])
    .map(id => allActiveGifts.find(g => g.id === id))
    .filter((g): g is Gift => g !== undefined);

  // Calculate how many gifts would be assigned based on current config (for real-time summary)
  const calculateAssignedGiftsCount = (): number => {
    switch (config.assignmentStrategy) {
      case 'all':
        return allActiveGifts.length;
      
      case 'price_levels':
        if (config.selectedLevelId && config.priceLevels) {
          const level = config.priceLevels.find(l => l.id === config.selectedLevelId);
          if (level) {
            return allActiveGifts.filter(g => 
              g.price >= level.minPrice && g.price < level.maxPrice
            ).length;
          }
        }
        return 0;
      
      case 'exclusions':
        return allActiveGifts.filter(g => {
          if (config.excludedSkus?.includes(g.sku)) return false;
          if (config.excludedCategories?.includes(g.category)) return false;
          return true;
        }).length;
      
      case 'explicit':
        return config.includedGiftIds?.length || 0;
      
      default:
        return 0;
    }
  };

  const currentAssignedCount = calculateAssignedGiftsCount();

  // Debug log to confirm component is rendering with toggle
  logger.debug('[SiteGiftConfiguration] Rendering', { 
    configMode, 
    hasLiveConfig: !!liveConfig, 
    hasDraftConfig: !!draftConfig 
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Mode Status Banner */}
        {configMode === 'live' && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">🔒 Read-Only Mode</p>
                <p>Viewing live configuration. Click "Edit" to make changes.</p>
              </div>
            </div>
            <Button
              onClick={() => setConfigMode('draft')}
              variant="outline"
              size="sm"
              className="border-blue-300 hover:bg-blue-100"
            >
              <FileEdit className="w-3.5 h-3.5 mr-1.5" />
              Edit Draft
            </Button>
          </div>
        )}
        
        {configMode === 'draft' && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileEdit className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold">✏️ Editing Draft</p>
                <p>Changes are auto-saved but won't affect the live site until you publish.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setConfigMode('live')}
                variant="outline"
                size="sm"
                className="border-amber-300 hover:bg-amber-100"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                View Live
              </Button>
              <Button
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isPublishing}
                size="sm"
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin mr-1.5">
                      <Rocket className="w-3.5 h-3.5" />
                    </div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Rocket className="w-3.5 h-3.5 mr-1.5" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Product Catalog System</p>
            <p>
              Configure which products from your global ERP catalog are available for this site. 
              You can assign all products, filter by price levels, exclude specific SKUs/categories, 
              or manually select specific products.
            </p>
            <p className="mt-2">
              <span className="font-semibold">Site Currency:</span> {currency} ({currencySymbol})
            </p>
          </div>
        </div>

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Strategy</CardTitle>
            <CardDescription>Choose how products are assigned to this site</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Strategy Selection */}
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                config.assignmentStrategy === 'all' ? 'border-[#D91C81] bg-pink-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="strategy"
                  value="all"
                  checked={config.assignmentStrategy === 'all'}
                  onChange={(e) => setConfig({ ...config, assignmentStrategy: e.target.value as any })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">All Products</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Include all active products from the global catalog
                  </p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                config.assignmentStrategy === 'price_levels' ? 'border-[#D91C81] bg-pink-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="strategy"
                  value="price_levels"
                  checked={config.assignmentStrategy === 'price_levels'}
                  onChange={(e) => setConfig({ ...config, assignmentStrategy: e.target.value as any })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Price Levels</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Group products into price levels (e.g., Bronze, Silver, Gold) and assign a specific level to this site
                  </p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                config.assignmentStrategy === 'exclusions' ? 'border-[#D91C81] bg-pink-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="strategy"
                  value="exclusions"
                  checked={config.assignmentStrategy === 'exclusions'}
                  onChange={(e) => setConfig({ ...config, assignmentStrategy: e.target.value as any })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Exclusions</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Include all products EXCEPT specific SKUs or categories
                  </p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                config.assignmentStrategy === 'explicit' ? 'border-[#D91C81] bg-pink-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="strategy"
                  value="explicit"
                  checked={config.assignmentStrategy === 'explicit'}
                  onChange={(e) => setConfig({ ...config, assignmentStrategy: e.target.value as any })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Explicit Selection</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Manually select specific products to include
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Price Levels Configuration */}
        {config.assignmentStrategy === 'price_levels' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Price Level Configuration</CardTitle>
                  <CardDescription>Create and manage price levels for product grouping</CardDescription>
                </div>
                <Button
                  onClick={handleAddLevel}
                  className="bg-[#D91C81] hover:bg-[#B71569] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Level
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!config.priceLevels || config.priceLevels.length === 0) && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No price levels configured</p>
                  <Button
                    onClick={() => {
                      setConfig({
                        ...config,
                        priceLevels: [
                          { id: 'bronze', name: 'Bronze Level', minPrice: 0, maxPrice: 50 },
                          { id: 'silver', name: 'Silver Level', minPrice: 50, maxPrice: 100 },
                          { id: 'gold', name: 'Gold Level', minPrice: 100, maxPrice: 300 },
                        ],
                        selectedLevelId: 'silver',
                      });
                    }}
                    variant="outline"
                  >
                    Set Up Default Price Levels
                  </Button>
                </div>
              )}

              {config.priceLevels && config.priceLevels.map((level) => {
                const giftsInLevel = allActiveGifts.filter(
                  g => g.price >= level.minPrice && g.price < level.maxPrice
                );
                const isEditing = editingLevel === level.id;

                return (
                  <div
                    key={level.id}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      config.selectedLevelId === level.id
                        ? 'border-[#D91C81] bg-pink-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Level Name
                          </label>
                          <Input
                            type="text"
                            value={levelForm.name}
                            onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                            placeholder="e.g., Gold Level"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Min Price ({currencySymbol})
                            </label>
                            <Input
                              type="number"
                              value={levelForm.minPrice}
                              onChange={(e) => setLevelForm({ ...levelForm, minPrice: parseFloat(e.target.value) })}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Max Price ({currencySymbol})
                            </label>
                            <Input
                              type="number"
                              value={levelForm.maxPrice}
                              onChange={(e) => setLevelForm({ ...levelForm, maxPrice: parseFloat(e.target.value) })}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveLevel}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingLevel(null)}
                            size="sm"
                            variant="outline"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="radio"
                            name="level"
                            value={level.id}
                            checked={config.selectedLevelId === level.id}
                            onChange={() => setConfig({ ...config, selectedLevelId: level.id })}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{level.name}</p>
                            <p className="text-sm text-gray-600">
                              {formatPrice(level.minPrice, currency)} - {formatPrice(level.maxPrice, currency)} • {giftsInLevel.length} products
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditLevel(level)}
                            size="sm"
                            variant="ghost"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteLevel(level.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Exclusions Configuration */}
        {config.assignmentStrategy === 'exclusions' && (
          <Card>
            <CardHeader>
              <CardTitle>Exclusion Rules</CardTitle>
              <CardDescription>Exclude specific categories or SKUs from this site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Excluded Categories */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Excluded Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {GIFT_CATEGORIES.map((category) => (
                    <label key={category} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                      <input
                        type="checkbox"
                        checked={config.excludedCategories?.includes(category)}
                        onChange={(e) => {
                          const excluded = config.excludedCategories || [];
                          if (e.target.checked) {
                            setConfig({ ...config, excludedCategories: [...excluded, category] });
                          } else {
                            setConfig({ ...config, excludedCategories: excluded.filter(c => c !== category) });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 font-medium">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Excluded SKUs */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Excluded SKUs
                </label>
                <select
                  multiple
                  className="w-full h-48 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  value={config.excludedSkus || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setConfig({ ...config, excludedSkus: selected });
                  }}
                >
                  {allActiveGifts.map((gift) => (
                    <option key={gift.id} value={gift.sku}>
                      {gift.sku} - {gift.name} ({formatPrice(gift.price, currency)})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-2">Hold Ctrl/Cmd to select multiple SKUs</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Explicit Selection Configuration */}
        {config.assignmentStrategy === 'explicit' && (
          <>
            {/* Selected & Ordered Products - Combined Drag and Drop Section */}
            {orderedSelectedGifts.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ArrowUpDown className="w-5 h-5 text-[#D91C81]" />
                        Selected Products ({orderedSelectedGifts.length})
                      </CardTitle>
                      <CardDescription>
                        Drag to reorder • Click × to remove
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setConfig({ ...config, includedGiftIds: [] })}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderedSelectedGifts.map((gift, index) => (
                      <DraggableGiftCard
                        key={gift.id}
                        gift={gift}
                        index={index}
                        moveGift={moveGift}
                        onRemove={handleToggleProduct}
                        showRemove={true}
                      />
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-900">
                      💡 <strong>Tip:</strong> Click and drag any gift card to reorder. 
                      The order you set here is the order gifts will appear to users on the site.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Catalog */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>Product Catalog</CardTitle>
                    <CardDescription>Click on products to add them to your selection</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by name, SKU, category, or price..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-80"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1 border border-gray-200 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#D91C81] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#D91C81] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Search Tips */}
                <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold mb-1">Search tips:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <span>• Name, SKU, or Category: <code className="bg-white px-1 rounded">wireless</code></span>
                    <span>• Exact price: <code className="bg-white px-1 rounded">25.99</code></span>
                    <span>• Price range: <code className="bg-white px-1 rounded">20-50</code></span>
                    <span>• Less than: <code className="bg-white px-1 rounded">&lt;50</code></span>
                    <span>• Greater than: <code className="bg-white px-1 rounded">&gt;100</code></span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredGifts.map((gift) => {
                      const isSelected = config.includedGiftIds?.includes(gift.id);
                      return (
                        <button
                          key={gift.id}
                          onClick={() => handleToggleProduct(gift.id)}
                          className={`group relative bg-white border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all text-left ${
                            isSelected ? 'border-[#D91C81] ring-2 ring-pink-100' : 'border-gray-200 hover:border-[#D91C81]'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 z-10 bg-[#D91C81] text-white p-1 rounded-full">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                          <div className="aspect-square bg-gray-100 overflow-hidden">
                            <img
                              src={gift.image}
                              alt={gift.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="p-3">
                            <p className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                              {gift.name}
                            </p>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-gray-500">{gift.sku}</p>
                              <p className="text-sm font-bold text-[#D91C81]">
                                {formatPrice(gift.price, currency)}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{gift.category}</p>
                            <ComplianceBadges gift={gift} size="sm" orientation="horizontal" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredGifts.map((gift) => {
                      const isSelected = config.includedGiftIds?.includes(gift.id);
                      return (
                        <button
                          key={gift.id}
                          onClick={() => handleToggleProduct(gift.id)}
                          className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg hover:shadow-md transition-all text-left ${
                            isSelected ? 'border-[#D91C81] bg-pink-50' : 'border-gray-200 hover:border-[#D91C81]'
                          }`}
                        >
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={gift.image}
                              alt={gift.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{gift.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{gift.sku} • {gift.category}</p>
                            <div className="mt-2">
                              <ComplianceBadges gift={gift} size="sm" orientation="horizontal" />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-lg font-bold text-[#D91C81]">
                              {formatPrice(gift.price, currency)}
                            </p>
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-[#D91C81] border-[#D91C81]' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {filteredGifts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No products found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Catalog Products</p>
                <p className="text-2xl font-bold text-gray-900">{allActiveGifts.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Assigned to This Site</p>
                <p className="text-2xl font-bold text-[#D91C81]">{currentAssignedCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Assignment Strategy</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {config.assignmentStrategy?.replace('_', ' ') || 'All Products'}
                </p>
              </div>
            </div>

            {availableGifts.length === 0 && config.assignmentStrategy !== 'all' && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold">No products assigned</p>
                  <p>This site currently has no products assigned based on your configuration.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
}

export default SiteGiftConfiguration;