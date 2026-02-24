import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { Search, X } from 'lucide-react';
import { getCurrentEnvironment, buildApiUrl } from '../config/deploymentEnvironments';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { usePublicSite } from '../context/PublicSiteContext';
import { useSite } from '../context/SiteContext';
import { defaultGiftSelectionConfig } from '../types/siteCustomization';
import { mergeGiftSelectionConfig } from '../utils/configMerge';
import { translateWithParams } from '../utils/translationHelpers';

interface Gift {
  id: string;
  name: string;
  description: string;
  category: string;
  value: number;
  retailValue?: number;
  imageUrl: string;
  features: string[];
  status: string;
  available: boolean;
  inventoryStatus: string;
  priority?: number;
  quantityLimit?: number;
}

interface SiteInfo {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  clientName: string;
}

export function GiftSelection() {
  const navigate = useNavigate();
  const { siteId } = useParams();
  const { currentSite: publicSite } = usePublicSite();
  const { currentSite } = useSite();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { t } = useLanguage();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [filteredGifts, setFilteredGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'value-asc' | 'value-desc'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load configuration
  const config = mergeGiftSelectionConfig(
    defaultGiftSelectionConfig,
    currentSite?.giftSelectionConfig
  );

  // Get unique categories from gifts
  const categories = ['all', ...Array.from(new Set(gifts.map(gift => gift.category)))];

  // Disable filters/search/sort unless there are more than 10 gifts
  const enableFiltering = gifts.length > 10;

  // Load gifts on mount
  useEffect(() => {
    const loadGifts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get session information
        const sessionToken = sessionStorage.getItem('employee_session');
        const sessionSiteId = sessionStorage.getItem('site_id');
        
        // Get the effective site ID (from URL param or session)
        const effectiveSiteId = siteId || sessionSiteId || publicSite?.id;
        
        if (!effectiveSiteId) {
          toast.error(t('notification.error.noSiteSpecified'));
          void navigate('/access');
          return;
        }
        
        // SECURITY: Warn if no session (allows demo mode but encourages proper validation)
        if (!sessionToken) {
          logger.warn('[SECURITY] Accessing gifts without session validation - Demo mode');
        }
        
        // Verify session site matches requested site (if session exists)
        if (sessionToken && sessionSiteId && sessionSiteId !== effectiveSiteId) {
          toast.error(t('notification.error.invalidSiteAccess'));
          void navigate(`/access?site=${effectiveSiteId}`);
          return;
        }
        
        // Fetch gifts from backend
        const env = getCurrentEnvironment();
        const apiUrl = buildApiUrl(env);
        
        const response = await fetch(`${apiUrl}/public/sites/${effectiveSiteId}/gifts`, {
          headers: {
            'Authorization': `Bearer ${env.supabaseAnonKey}`,
            'X-Environment-ID': env.id,
            ...(sessionToken ? { 'X-Session-Token': sessionToken } : {})
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load gifts');
        }
        
        // Debug logging for image fields
        console.warn('[GiftSelection] Received gifts:', data.gifts?.length || 0);
        data.gifts?.forEach((gift: Gift) => {
          console.warn(`[GiftSelection] Gift ${gift.id} - imageUrl: "${gift.imageUrl}", name: "${gift.name}"`);
        });
        
        setGifts(data.gifts || []);
        setFilteredGifts(data.gifts || []);
        setSiteInfo(data.site);
        
        if (data.gifts.length === 0) {
          // More helpful error message for admins
          const adminMessage = 'No gifts have been assigned to this site yet. Please go to Admin → Site Gifts to assign gifts.';
          setError(adminMessage);
          logger.warn('[GiftSelection] No gifts assigned to site:', effectiveSiteId);
        }
      } catch (error: unknown) {
        logger.error('Failed to load gifts:', error);
        setError(config.messages.error);
        toast.error(error instanceof Error ? error.message : t('notification.error.failedToLoadGifts'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGifts();
  }, [navigate, siteId, publicSite, config.messages]);

  // Filter and sort gifts
  useEffect(() => {
    let result = [...gifts];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(gift => gift.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(gift =>
        gift.name.toLowerCase().includes(query) ||
        gift.description.toLowerCase().includes(query) ||
        gift.category.toLowerCase().includes(query) ||
        gift.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'value-asc':
        result.sort((a, b) => a.value - b.value);
        break;
      case 'value-desc':
        result.sort((a, b) => b.value - a.value);
        break;
    }

    setFilteredGifts(result);
  }, [gifts, searchQuery, selectedCategory, sortBy]);

  const handleSelectGift = (giftId: string) => {
    // Use relative path to navigate to sibling route
    void navigate(siteId ? `../gift-detail/${giftId}` : `/gift-detail/${giftId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('name');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('gifts.loadingGifts')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('gifts.title')}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              {t('gifts.curatedSelection')}
            </p>
          </div>

          {/* Search and Filter Bar */}
          {(config.search.enabled || config.filters.enabled || config.sorting.enabled) && enableFiltering && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                {config.search.enabled && (
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                      placeholder={config.search.placeholder}
                      aria-label={t('gifts.searchLabel')}
                    />
                  </div>
                )}

                {/* Category Filter */}
                {config.filters.enabled && config.filters.categories.enabled && (
                  <div className="lg:w-56">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none appearance-none bg-white"
                      aria-label={t('gifts.filterByCategory')}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? t('gifts.filter.all') : category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sort By */}
                {config.sorting.enabled && (
                  <div className="lg:w-52">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'value-asc' | 'value-desc')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none appearance-none bg-white"
                      aria-label={t('gifts.sortBy')}
                    >
                      <option value="name">{t('gifts.sortAZ')}</option>
                      <option value="value-asc">{t('gifts.sortValueLow')}</option>
                      <option value="value-desc">{t('gifts.sortValueHigh')}</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Active Filters & Results Count */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <p role="status" aria-live="polite" className="text-sm text-gray-600">
                  {translateWithParams(t, 'gifts.showingCount', { shown: filteredGifts.length, total: gifts.length })}
                </p>
                {(searchQuery || selectedCategory !== 'all' || sortBy !== 'name') && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-[#D91C81] hover:text-[#B71569] font-medium text-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {t('gifts.clearFilters')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredGifts.length === 0 && !isLoading && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('gifts.noGiftsFound')}</h2>
              <p className="text-gray-600 mb-6">
                {error || config.messages.noResults}
              </p>
              {!error && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  {t('gifts.clearAllFilters')}
                </button>
              )}
            </div>
          )}

          {/* Gift Grid */}
          {filteredGifts.length > 0 && (
            <div 
              className={`grid gap-4 sm:gap-6 ${
                config.layout.style === 'grid'
                  ? `sm:grid-cols-2 ${
                      config.layout.itemsPerRow === 2 ? 'lg:grid-cols-2' :
                      config.layout.itemsPerRow === 3 ? 'lg:grid-cols-3' :
                      config.layout.itemsPerRow === 4 ? 'lg:grid-cols-4' :
                      config.layout.itemsPerRow === 5 ? 'lg:grid-cols-5' :
                      config.layout.itemsPerRow === 6 ? 'lg:grid-cols-6' :
                      'lg:grid-cols-3'
                    }`
                  : config.layout.style === 'list'
                  ? 'grid-cols-1'
                  : 'sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {filteredGifts.map((gift) => {
                const isHovered = hoveredId === gift.id;
                const hoverClass = 
                  config.display.hoverEffect === 'lift' ? 'hover:scale-[1.02]' :
                  config.display.hoverEffect === 'zoom' ? 'hover:scale-[1.05]' :
                  '';

                return (
                  <div
                    key={gift.id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl ${hoverClass}`}
                  >
                    <button
                      onClick={() => handleSelectGift(gift.id)}
                      onMouseEnter={() => setHoveredId(gift.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="w-full text-left focus:outline-none focus:ring-4 focus:ring-[#D91C81] focus:ring-offset-2 rounded-2xl"
                    >
                      {/* Image */}
                      <div className={`relative overflow-hidden bg-gray-100 ${
                        config.display.imageAspectRatio === '1:1' ? 'h-64' :
                        config.display.imageAspectRatio === '4:3' ? 'h-48' :
                        config.display.imageAspectRatio === '16:9' ? 'h-40' :
                        'h-64'
                      }`}>
                        {gift.imageUrl ? (
                          <img
                            src={gift.imageUrl}
                            alt={gift.name}
                            className={`w-full h-full object-cover transition-transform duration-500 ${
                              isHovered && config.display.hoverEffect === 'zoom' ? 'scale-110' : 'scale-100'
                            }`}
                            loading="lazy"
                            onError={(e) => {
                              console.error(`[GiftSelection] Failed to load image for gift ${gift.id}: ${gift.imageUrl}`);
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-400 text-sm">{t('gifts.noImageAvailable')}</span>
                          </div>
                        )}
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="inline-block bg-white/90 backdrop-blur-sm text-[#D91C81] px-3 py-1 rounded-full text-xs font-semibold">
                            {gift.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{gift.name}</h2>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{gift.description}</p>
                        
                        {/* Price (conditional) */}
                        {config.display.showPrices && gift.value && (
                          <p className="text-sm font-semibold text-gray-900 mb-2">
                            ${gift.value.toFixed(2)}
                          </p>
                        )}
                        
                        {/* CTA */}
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${
                            isHovered ? 'text-[#D91C81]' : 'text-gray-700'
                          } transition-colors`}>
                            {t('gifts.viewDetails')} →
                          </span>
                          {config.display.showInventory && (
                            gift.available ? (
                              <span className="text-xs text-green-600 font-medium">{t('gifts.inStock')}</span>
                            ) : (
                              <span className="text-xs text-red-600 font-medium">{t('gifts.outOfStock')}</span>
                            )
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}