/**
 * Catalog Product Filtering Engine
 * 
 * Applies site-specific catalog configurations to filter and transform products.
 * Handles exclusions, overrides, availability rules, and pricing adjustments.
 */

import * as kv from './kv_env.ts';
import type { Gift } from './types';

// Import types from frontend (they're compatible)
type SiteCatalogConfig = {
  siteId: string;
  catalogId: string;
  exclusions: {
    excludedCategories: string[];
    excludedSkus: string[];
    excludedTags?: string[];
    excludedBrands?: string[];
  };
  overrides?: {
    allowPriceOverride: boolean;
    priceAdjustment?: number;
    customPricing?: Record<string, number>;
    customDescriptions?: Record<string, string>;
  };
  availability?: {
    hideOutOfStock: boolean;
    hideDiscontinued: boolean;
    minimumInventory?: number;
    maximumPrice?: number;
    minimumPrice?: number;
    onlyShowFeatured?: boolean;
  };
  updatedAt: string;
  updatedBy?: string;
};

// Storage keys
const StorageKeys = {
  SITE_CATALOG_CONFIG: (siteId: string) => `sites:${siteId}:catalog_config`,
  CATALOG_GIFTS: (catalogId: string) => `catalog_gifts:${catalogId}`,
  GIFT: (giftId: string) => `gifts:${giftId}`,
};

// ==================== Filter Result Interface ====================

export interface FilteredGiftsResult {
  gifts: Gift[];
  total: number;
  filtered: number;
  exclusions: {
    byCategory: number;
    bySku: number;
    byTag: number;
    byBrand: number;
    byInventory: number;
    byPrice: number;
    byStatus: number;
  };
  appliedConfig?: SiteCatalogConfig;
}

// ==================== Main Filtering Function ====================

/**
 * Get filtered gifts for a specific site
 * Applies site catalog configuration to filter and transform products
 * 
 * @param siteId - The site identifier
 * @param options - Additional filtering options (search, category, etc.)
 * @returns Filtered gifts with statistics
 */
export async function getFilteredGiftsForSite(
  siteId: string,
  options: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: 'active' | 'inactive';
    limit?: number;
    offset?: number;
  } = {}
): Promise<FilteredGiftsResult> {
  
  console.log(`[Filter] Getting filtered gifts for site: ${siteId}`);
  
  const result: FilteredGiftsResult = {
    gifts: [],
    total: 0,
    filtered: 0,
    exclusions: {
      byCategory: 0,
      bySku: 0,
      byTag: 0,
      byBrand: 0,
      byInventory: 0,
      byPrice: 0,
      byStatus: 0,
    },
  };
  
  try {
    // Step 1: Get site catalog configuration
    const siteConfig: SiteCatalogConfig | null = await kv.get(
      StorageKeys.SITE_CATALOG_CONFIG(siteId)
    );
    
    if (!siteConfig) {
      console.log(`[Filter] No catalog configuration found for site ${siteId}`);
      return result;
    }
    
    result.appliedConfig = siteConfig;
    console.log(`[Filter] Using catalog: ${siteConfig.catalogId}`);
    
    // Step 2: Get all gifts from the assigned catalog
    const catalogGiftIds: string[] = await kv.get(
      StorageKeys.CATALOG_GIFTS(siteConfig.catalogId)
    ) || [];
    
    console.log(`[Filter] Found ${catalogGiftIds.length} gifts in catalog`);
    result.total = catalogGiftIds.length;
    
    // Step 3: Fetch and filter gifts
    const filteredGifts: Gift[] = [];
    
    for (const giftId of catalogGiftIds) {
      const gift: Gift | null = await kv.get(StorageKeys.GIFT(giftId));
      
      if (!gift) {
        console.warn(`[Filter] Gift ${giftId} not found`);
        continue;
      }
      
      // Apply filters
      const filterResult = applyFilters(gift, siteConfig, options);
      
      if (filterResult.excluded) {
        // Track exclusion reason
        if (filterResult.reason === 'category') result.exclusions.byCategory++;
        else if (filterResult.reason === 'sku') result.exclusions.bySku++;
        else if (filterResult.reason === 'tag') result.exclusions.byTag++;
        else if (filterResult.reason === 'brand') result.exclusions.byBrand++;
        else if (filterResult.reason === 'inventory') result.exclusions.byInventory++;
        else if (filterResult.reason === 'price') result.exclusions.byPrice++;
        else if (filterResult.reason === 'status') result.exclusions.byStatus++;
        continue;
      }
      
      // Apply overrides and transformations
      const transformedGift = applyOverrides(gift, siteConfig);
      
      filteredGifts.push(transformedGift);
    }
    
    result.filtered = filteredGifts.length;
    console.log(`[Filter] Filtered to ${result.filtered} gifts (excluded ${result.total - result.filtered})`);
    
    // Step 4: Apply pagination
    const { limit = 50, offset = 0 } = options;
    result.gifts = filteredGifts.slice(offset, offset + limit);
    
    return result;
    
  } catch (error: any) {
    console.error('[Filter] Error filtering gifts:', error);
    throw new Error(`Failed to filter gifts for site: ${error.message}`);
  }
}

// ==================== Filter Application ====================

interface FilterResult {
  excluded: boolean;
  reason?: 'category' | 'sku' | 'tag' | 'brand' | 'inventory' | 'price' | 'status' | 'search';
}

/**
 * Apply all filters to a single gift
 * @param gift - The gift to filter
 * @param config - Site catalog configuration
 * @param options - Additional filter options
 * @returns Filter result indicating if gift should be excluded
 */
function applyFilters(
  gift: Gift,
  config: SiteCatalogConfig,
  options: any
): FilterResult {
  
  // 1. Check exclusions by SKU
  if (config.exclusions.excludedSkus.includes(gift.sku)) {
    return { excluded: true, reason: 'sku' };
  }
  
  // 2. Check exclusions by category
  if (gift.category && config.exclusions.excludedCategories.includes(gift.category)) {
    return { excluded: true, reason: 'category' };
  }
  
  // 3. Check exclusions by tags (if gift has tags in specifications)
  if (config.exclusions.excludedTags && gift.specifications?.tags) {
    const giftTags = gift.specifications.tags.split(',').map(t => t.trim());
    const hasExcludedTag = giftTags.some(tag => 
      config.exclusions.excludedTags!.includes(tag)
    );
    if (hasExcludedTag) {
      return { excluded: true, reason: 'tag' };
    }
  }
  
  // 4. Check exclusions by brand (if gift has brand in specifications)
  if (config.exclusions.excludedBrands && gift.specifications?.brand) {
    if (config.exclusions.excludedBrands.includes(gift.specifications.brand)) {
      return { excluded: true, reason: 'brand' };
    }
  }
  
  // 5. Check availability rules - out of stock
  if (config.availability?.hideOutOfStock) {
    if (gift.availableQuantity !== undefined && gift.availableQuantity <= 0) {
      return { excluded: true, reason: 'inventory' };
    }
  }
  
  // 6. Check availability rules - minimum inventory
  if (config.availability?.minimumInventory !== undefined) {
    if (gift.availableQuantity !== undefined && 
        gift.availableQuantity < config.availability.minimumInventory) {
      return { excluded: true, reason: 'inventory' };
    }
  }
  
  // 7. Check availability rules - status
  if (config.availability?.hideDiscontinued) {
    if (gift.status === 'inactive') {
      return { excluded: true, reason: 'status' };
    }
  }
  
  // 8. Check availability rules - price range
  if (config.availability?.minimumPrice !== undefined) {
    if (gift.price < config.availability.minimumPrice) {
      return { excluded: true, reason: 'price' };
    }
  }
  
  if (config.availability?.maximumPrice !== undefined) {
    if (gift.price > config.availability.maximumPrice) {
      return { excluded: true, reason: 'price' };
    }
  }
  
  // 9. Apply additional filter options
  
  // Status filter
  if (options.status && gift.status !== options.status) {
    return { excluded: true, reason: 'status' };
  }
  
  // Category filter
  if (options.category && gift.category !== options.category) {
    return { excluded: true, reason: 'category' };
  }
  
  // Price range filter
  if (options.minPrice !== undefined && gift.price < options.minPrice) {
    return { excluded: true, reason: 'price' };
  }
  
  if (options.maxPrice !== undefined && gift.price > options.maxPrice) {
    return { excluded: true, reason: 'price' };
  }
  
  // Search filter
  if (options.search) {
    const searchTerm = options.search.toLowerCase();
    const searchableText = [
      gift.name,
      gift.description,
      gift.sku,
      gift.category || '',
    ].join(' ').toLowerCase();
    
    if (!searchableText.includes(searchTerm)) {
      return { excluded: true, reason: 'search' };
    }
  }
  
  // Gift passed all filters
  return { excluded: false };
}

// ==================== Override Application ====================

/**
 * Apply site-specific overrides to a gift
 * @param gift - The original gift
 * @param config - Site catalog configuration
 * @returns Transformed gift with overrides applied
 */
function applyOverrides(gift: Gift, config: SiteCatalogConfig): Gift {
  const transformedGift = { ...gift };
  
  if (!config.overrides) {
    return transformedGift;
  }
  
  // 1. Apply custom pricing for specific SKU
  if (config.overrides.customPricing && config.overrides.customPricing[gift.sku]) {
    transformedGift.price = config.overrides.customPricing[gift.sku];
  }
  
  // 2. Apply price adjustment (percentage)
  else if (config.overrides.priceAdjustment !== undefined) {
    const adjustment = config.overrides.priceAdjustment / 100;
    transformedGift.price = Math.round(gift.price * (1 + adjustment) * 100) / 100;
  }
  
  // 3. Apply custom descriptions
  if (config.overrides.customDescriptions && config.overrides.customDescriptions[gift.sku]) {
    transformedGift.description = config.overrides.customDescriptions[gift.sku];
  }
  
  return transformedGift;
}

// ==================== Catalog Statistics ====================

/**
 * Get statistics about filtered gifts for a site
 * @param siteId - The site identifier
 * @returns Statistics about available gifts
 */
export async function getCatalogStatsForSite(siteId: string): Promise<{
  catalogId: string;
  totalProducts: number;
  availableProducts: number;
  excludedProducts: number;
  categories: string[];
  priceRange: { min: number; max: number };
  avgPrice: number;
}> {
  const filterResult = await getFilteredGiftsForSite(siteId, { limit: 10000 });
  
  const categories = [...new Set(
    filterResult.gifts
      .map(g => g.category)
      .filter((c): c is string => !!c)
  )];
  
  const prices = filterResult.gifts.map(g => g.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const avgPrice = prices.length > 0 
    ? Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100
    : 0;
  
  return {
    catalogId: filterResult.appliedConfig?.catalogId || '',
    totalProducts: filterResult.total,
    availableProducts: filterResult.filtered,
    excludedProducts: filterResult.total - filterResult.filtered,
    categories,
    priceRange: { min: minPrice, max: maxPrice },
    avgPrice,
  };
}

// ==================== Bulk Operations ====================

/**
 * Get all gifts for a catalog (no site filtering)
 * Used for catalog management
 * 
 * @param catalogId - The catalog identifier
 * @returns All gifts in the catalog
 */
export async function getAllGiftsInCatalog(catalogId: string): Promise<Gift[]> {
  console.log(`[Filter] Getting all gifts in catalog: ${catalogId}`);
  
  const catalogGiftIds: string[] = await kv.get(
    StorageKeys.CATALOG_GIFTS(catalogId)
  ) || [];
  
  const gifts: Gift[] = [];
  
  for (const giftId of catalogGiftIds) {
    const gift: Gift | null = await kv.get(StorageKeys.GIFT(giftId));
    if (gift) {
      gifts.push(gift);
    }
  }
  
  console.log(`[Filter] Found ${gifts.length} gifts in catalog`);
  return gifts;
}

/**
 * Check if a gift is available for a specific site
 * @param giftId - The gift identifier
 * @param siteId - The site identifier
 * @returns True if gift is available, false otherwise
 */
export async function isGiftAvailableForSite(
  giftId: string,
  siteId: string
): Promise<boolean> {
  try {
    const gift: Gift | null = await kv.get(StorageKeys.GIFT(giftId));
    if (!gift) {
      return false;
    }
    
    const siteConfig: SiteCatalogConfig | null = await kv.get(
      StorageKeys.SITE_CATALOG_CONFIG(siteId)
    );
    
    if (!siteConfig) {
      return false;
    }
    
    // Check if gift belongs to site's catalog
    if (gift.catalogId !== siteConfig.catalogId) {
      return false;
    }
    
    // Apply filters
    const filterResult = applyFilters(gift, siteConfig, {});
    
    return !filterResult.excluded;
  } catch (error) {
    console.error('[Filter] Error checking gift availability:', error);
    return false;
  }
}

/**
 * Get available categories for a site
 * @param siteId - The site identifier
 * @returns List of available category names
 */
export async function getAvailableCategoriesForSite(siteId: string): Promise<string[]> {
  const filterResult = await getFilteredGiftsForSite(siteId, { limit: 10000 });
  
  const categories = [...new Set(
    filterResult.gifts
      .map(g => g.category)
      .filter((c): c is string => !!c)
  )];
  
  return categories.sort();
}