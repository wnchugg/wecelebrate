import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { 
  Package, 
  ArrowLeft, 
  Save, 
  Settings, 
  DollarSign, 
  XCircle, 
  CheckSquare,
  Tag,
  Grid,
  AlertCircle,
  Plus,
  Trash2,
  Search,
  GripVertical,
  ArrowUpDown
} from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { apiRequest, siteApi, giftApi } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { GIFT_CATEGORIES } from '../../context/GiftContext';
import { DraggableGiftCard } from '../../components/DraggableGiftCard';
import { logger } from '../../utils/logger';
import type { Gift, Site, SiteGiftConfiguration, PriceLevel } from '../../../types';

export function SiteGiftAssignment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const siteId = searchParams.get('siteId');

  const [site, setSite] = useState<Site | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [config, setConfig] = useState<SiteGiftConfiguration>({
    siteId: siteId || '',
    assignmentStrategy: 'all',
    priceLevels: [],
    excludedSkus: [],
    excludedCategories: [],
    includedGiftIds: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  logger.debug('[SiteGiftAssignment] Component rendered', { 
    strategy: config.assignmentStrategy, 
    selectedGiftsCount: config.includedGiftIds?.length || 0 
  });

  useEffect(() => {
    if (siteId) {
      loadData();
    }
  }, [siteId]);

  const loadData = async () => {
    if (!siteId) return;

    setIsLoading(true);
    try {
      // Load site details, all gifts, and existing config in parallel
      const [siteResult, giftsResult, configResult] = await Promise.all([
        siteApi.getById(siteId),
        giftApi.getAll(),
        siteApi.getGiftConfig(siteId).catch(() => ({ config: null as SiteGiftConfiguration | null }))
      ]);

      setSite(siteResult.data);
      setGifts(giftsResult.gifts || []);
      
      if (configResult.config) {
        setConfig(configResult.config);
      } else {
        // Initialize with default config
        setConfig({
          siteId,
          assignmentStrategy: 'all',
          priceLevels: [],
          excludedSkus: [],
          excludedCategories: [],
          includedGiftIds: []
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('[SiteGiftAssignment] Failed to load data', { error: errorMessage });
      showErrorToast('Failed to load data', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!siteId) return;

    setIsSaving(true);
    try {
      logger.info('[SiteGiftAssignment] Saving config', { siteId });
      
      const result = await siteApi.updateGiftConfig(siteId, config);
      
      logger.info('[SiteGiftAssignment] Save successful');
      showSuccessToast('Gift configuration saved successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('[SiteGiftAssignment] Save failed', { error: errorMessage });
      showErrorToast('Failed to save configuration', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStrategyChange = (strategy: SiteGiftConfiguration['assignmentStrategy']) => {
    setConfig({ ...config, assignmentStrategy: strategy });
  };

  // Price Levels Management
  const addPriceLevel = () => {
    const newLevel: PriceLevel = {
      id: `level_${Date.now()}`,
      name: 'New Level',
      minPrice: 0,
      maxPrice: 100
    };
    setConfig({
      ...config,
      priceLevels: [...(config.priceLevels || []), newLevel]
    });
  };

  const updatePriceLevel = (id: string, updates: Partial<PriceLevel>) => {
    setConfig({
      ...config,
      priceLevels: config.priceLevels?.map(level =>
        level.id === id ? { ...level, ...updates } : level
      )
    });
  };

  const deletePriceLevel = (id: string) => {
    setConfig({
      ...config,
      priceLevels: config.priceLevels?.filter(level => level.id !== id),
      selectedLevelId: config.selectedLevelId === id ? undefined : config.selectedLevelId
    });
  };

  // Exclusions Management
  const toggleExcludedCategory = (category: string) => {
    const current = config.excludedCategories || [];
    setConfig({
      ...config,
      excludedCategories: current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category]
    });
  };

  const toggleExcludedSku = (sku: string) => {
    const current = config.excludedSkus || [];
    setConfig({
      ...config,
      excludedSkus: current.includes(sku)
        ? current.filter(s => s !== sku)
        : [...current, sku]
    });
  };

  // Explicit Selection Management
  const toggleGiftSelection = (giftId: string) => {
    const current = config.includedGiftIds || [];
    setConfig({
      ...config,
      includedGiftIds: current.includes(giftId)
        ? current.filter(id => id !== giftId)
        : [...current, giftId]
    });
  };

  const selectAllGifts = () => {
    setConfig({
      ...config,
      includedGiftIds: filteredGifts.map(g => g.id)
    });
  };

  const deselectAllGifts = () => {
    setConfig({
      ...config,
      includedGiftIds: []
    });
  };

  // Drag and Drop for reordering
  const moveGift = (dragIndex: number, hoverIndex: number) => {
    logger.debug('[SiteGiftAssignment] moveGift called', { dragIndex, hoverIndex });
    const updatedGiftIds = [...(config.includedGiftIds || [])];
    logger.debug('[SiteGiftAssignment] Before move', { giftIds: updatedGiftIds });
    
    const [removed] = updatedGiftIds.splice(dragIndex, 1);
    updatedGiftIds.splice(hoverIndex, 0, removed);
    
    logger.debug('[SiteGiftAssignment] After move', { giftIds: updatedGiftIds });
    
    setConfig({
      ...config,
      includedGiftIds: updatedGiftIds
    });
  };

  // Get preview of assigned gifts based on current config
  const getAssignedGifts = () => {
    const assignedGifts = gifts.filter(g => g.status === 'active');

    switch (config.assignmentStrategy) {
      case 'all':
        return assignedGifts;

      case 'price_levels':
        if (config.selectedLevelId && config.priceLevels) {
          const level = config.priceLevels.find(l => l.id === config.selectedLevelId);
          if (level) {
            return assignedGifts.filter(g =>
              g.price >= level.minPrice && g.price < level.maxPrice
            );
          }
        }
        return [];

      case 'exclusions':
        return assignedGifts.filter(g => {
          if (config.excludedSkus?.includes(g.sku)) return false;
          if (config.excludedCategories?.includes(g.category)) return false;
          return true;
        });

      case 'explicit':
        return assignedGifts.filter(g => config.includedGiftIds?.includes(g.id));

      default:
        return [];
    }
  };

  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gift.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || gift.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const assignedGifts = getAssignedGifts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-600 text-lg mb-4">Site not found</p>
        <Button onClick={() => navigate('/admin/sites')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sites
        </Button>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/sites')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gift Assignment</h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              Configure which gifts are available for <span className="font-semibold">{site.name}</span>
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#D91C81] hover:bg-[#B01669] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{gifts.length}</p>
                  <p className="text-sm text-gray-600">Total Gifts in Catalog</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{assignedGifts.length}</p>
                  <p className="text-sm text-gray-600">Assigned to This Site</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{config.assignmentStrategy.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-600">Assignment Strategy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategy Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* All Gifts */}
              <button
                onClick={() => handleStrategyChange('all')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  config.assignmentStrategy === 'all'
                    ? 'border-[#D91C81] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Grid className={`w-8 h-8 mb-3 ${
                  config.assignmentStrategy === 'all' ? 'text-[#D91C81]' : 'text-gray-400'
                }`} />
                <h3 className="font-semibold text-gray-900 mb-1">All Gifts</h3>
                <p className="text-xs text-gray-600">Include entire catalog</p>
              </button>

              {/* Price Levels */}
              <button
                onClick={() => handleStrategyChange('price_levels')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  config.assignmentStrategy === 'price_levels'
                    ? 'border-[#D91C81] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className={`w-8 h-8 mb-3 ${
                  config.assignmentStrategy === 'price_levels' ? 'text-[#D91C81]' : 'text-gray-400'
                }`} />
                <h3 className="font-semibold text-gray-900 mb-1">Price Levels</h3>
                <p className="text-xs text-gray-600">Filter by price range</p>
              </button>

              {/* Exclusions */}
              <button
                onClick={() => handleStrategyChange('exclusions')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  config.assignmentStrategy === 'exclusions'
                    ? 'border-[#D91C81] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <XCircle className={`w-8 h-8 mb-3 ${
                  config.assignmentStrategy === 'exclusions' ? 'text-[#D91C81]' : 'text-gray-400'
                }`} />
                <h3 className="font-semibold text-gray-900 mb-1">Exclusions</h3>
                <p className="text-xs text-gray-600">All except selected</p>
              </button>

              {/* Explicit Selection */}
              <button
                onClick={() => handleStrategyChange('explicit')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  config.assignmentStrategy === 'explicit'
                    ? 'border-[#D91C81] bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CheckSquare className={`w-8 h-8 mb-3 ${
                  config.assignmentStrategy === 'explicit' ? 'text-[#D91C81]' : 'text-gray-400'
                }`} />
                <h3 className="font-semibold text-gray-900 mb-1">Explicit Selection</h3>
                <p className="text-xs text-gray-600">Choose specific gifts</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Configuration */}
        {config.assignmentStrategy === 'all' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">All gifts included</p>
                  <p className="text-xs text-blue-700">
                    All active gifts from your catalog will be available for this site.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {config.assignmentStrategy === 'price_levels' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Price Levels Configuration</CardTitle>
                <Button onClick={addPriceLevel} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Level
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.priceLevels && config.priceLevels.length > 0 ? (
                <>
                  {config.priceLevels.map((level) => (
                    <div key={level.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="radio"
                            checked={config.selectedLevelId === level.id}
                            onChange={() => setConfig({ ...config, selectedLevelId: level.id })}
                            className="w-4 h-4 text-[#D91C81]"
                          />
                          <Input
                            value={level.name}
                            onChange={(e) => updatePriceLevel(level.id, { name: e.target.value })}
                            placeholder="Level name"
                            className="flex-1"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePriceLevel(level.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Min Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={level.minPrice}
                            onChange={(e) => updatePriceLevel(level.id, { minPrice: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Max Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={level.maxPrice}
                            onChange={(e) => updatePriceLevel(level.id, { maxPrice: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {!config.selectedLevelId && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        ⚠️ Please select a price level to activate this strategy
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No price levels defined</p>
                  <Button onClick={addPriceLevel} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Price Level
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {config.assignmentStrategy === 'exclusions' && (
          <Card>
            <CardHeader>
              <CardTitle>Exclusions Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-3 block">Exclude Categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {GIFT_CATEGORIES.map(category => (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        checked={config.excludedCategories?.includes(category)}
                        onCheckedChange={() => toggleExcludedCategory(category)}
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <Label className="mb-3 block">Exclude Specific Products (by SKU)</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gifts.map(gift => (
                    <div key={gift.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <Checkbox
                        checked={config.excludedSkus?.includes(gift.sku)}
                        onCheckedChange={() => toggleExcludedSku(gift.sku)}
                      />
                      <span className="text-sm text-gray-700 flex-1">{gift.name}</span>
                      <span className="text-xs text-gray-500 font-mono">{gift.sku}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {config.assignmentStrategy === 'explicit' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select Specific Gifts</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllGifts}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllGifts}>
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="mb-4 flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search gifts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>
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
              </div>

              {/* Gift Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
                {filteredGifts.map(gift => (
                  <div
                    key={gift.id}
                    onClick={() => toggleGiftSelection(gift.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      config.includedGiftIds?.includes(gift.id)
                        ? 'border-[#D91C81] bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <Checkbox
                        checked={config.includedGiftIds?.includes(gift.id)}
                        onCheckedChange={() => toggleGiftSelection(gift.id)}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{gift.name}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{gift.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="font-mono">{gift.sku}</span>
                      <span className="font-semibold text-[#D91C81]">${gift.price.toFixed(2)}</span>
                    </div>
                    <Badge className="mt-2 text-xs">{gift.category}</Badge>
                  </div>
                ))}
              </div>

              {filteredGifts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No gifts found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reorder Selected Gifts - Only shown for explicit selection */}
        {config.assignmentStrategy === 'explicit' && config.includedGiftIds && config.includedGiftIds.length > 0 && (() => {
          logger.debug('[SiteGiftAssignment] Rendering reorder section with', config.includedGiftIds.length, 'gifts');
          return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5 text-[#D91C81]" />
                    Reorder Selected Gifts
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Drag and drop to change the order gifts appear on the site
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {config.includedGiftIds.length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {config.includedGiftIds.map((giftId, index) => {
                  const gift = gifts.find(g => g.id === giftId);
                  if (!gift) return null;
                  
                  return (
                    <DraggableGiftCard
                      key={giftId}
                      gift={gift}
                      index={index}
                      moveGift={moveGift}
                      onRemove={toggleGiftSelection}
                      showRemove={true}
                    />
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900">
                  💡 <strong>Tip:</strong> The order you set here is the order gifts will appear to users on the site. 
                  Drag the <GripVertical className="inline w-4 h-4" /> handle to reorder.
                </p>
              </div>
            </CardContent>
          </Card>
          );
        })()}

        {/* Preview of Assigned Gifts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview: Assigned Gifts ({assignedGifts.length})</CardTitle>
              {assignedGifts.length > 0 && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {assignedGifts.length} gift{assignedGifts.length !== 1 ? 's' : ''} available
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {assignedGifts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {assignedGifts.slice(0, 12).map(gift => (
                    <div key={gift.id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-[#D91C81] hover:shadow-md transition-all">
                      <div className="flex items-start gap-2 mb-2">
                        <CheckSquare className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{gift.name}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2">{gift.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className="text-xs">{gift.category}</Badge>
                        <span className="font-semibold text-[#D91C81]">${gift.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {assignedGifts.length > 12 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-900 font-medium">
                      ...and {assignedGifts.length - 12} more gift{assignedGifts.length - 12 !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">No gifts will be assigned</p>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  {config.assignmentStrategy === 'price_levels' && !config.selectedLevelId
                    ? 'Please select a price level to see available gifts'
                    : config.assignmentStrategy === 'explicit' && (!config.includedGiftIds || config.includedGiftIds.length === 0)
                    ? 'Please select at least one gift from the list above'
                    : config.assignmentStrategy === 'exclusions' && config.excludedCategories?.length === GIFT_CATEGORIES.length
                    ? 'You have excluded all categories. Please uncheck some categories to see gifts'
                    : 'Adjust your configuration to include some gifts'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
}