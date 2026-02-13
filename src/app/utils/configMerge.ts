import type { HeaderFooterConfig, BrandingAssets, GiftSelectionConfig, ReviewScreenConfig } from '../types/siteCustomization';

/**
 * Deep merge helper that properly handles nested objects
 */
function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  
  if (source === undefined) return deepMerge(target, ...sources);
  
  for (const key in source) {
    const targetValue = target[key];
    const sourceValue = source[key];
    
    if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue) && 
        key in target && typeof targetValue === 'object' && targetValue !== null && !Array.isArray(targetValue)) {
      // Recursively merge nested objects
      Object.assign(sourceValue, deepMerge(
        targetValue as Record<string, any>,
        sourceValue as Record<string, any>
      ));
    }
  }
  
  Object.assign(target, source);
  return deepMerge(target, ...sources);
}

/**
 * Merge header/footer configurations
 * Priority: Site > Client > Default
 */
export function mergeHeaderFooterConfig(
  defaultConfig: HeaderFooterConfig,
  clientConfig?: Partial<HeaderFooterConfig>,
  siteConfig?: Partial<HeaderFooterConfig>
): HeaderFooterConfig {
  return deepMerge(
    { ...defaultConfig },
    clientConfig || {},
    siteConfig || {}
  );
}

/**
 * Merge branding assets
 * Priority: Site > Client > Default
 */
export function mergeBrandingAssets(
  defaultAssets: BrandingAssets,
  clientAssets?: Partial<BrandingAssets>,
  siteAssets?: Partial<BrandingAssets>
): BrandingAssets {
  return deepMerge(
    { ...defaultAssets },
    clientAssets || {},
    siteAssets || {}
  );
}

/**
 * Merge gift selection configuration
 * Priority: Site > Default
 */
export function mergeGiftSelectionConfig(
  defaultConfig: GiftSelectionConfig,
  siteConfig?: Partial<GiftSelectionConfig>
): GiftSelectionConfig {
  return deepMerge(
    { ...defaultConfig },
    siteConfig || {}
  );
}

/**
 * Merge review screen configuration
 * Priority: Site > Default
 */
export function mergeReviewScreenConfig(
  defaultConfig: ReviewScreenConfig,
  siteConfig?: Partial<ReviewScreenConfig>
): ReviewScreenConfig {
  return deepMerge(
    { ...defaultConfig },
    siteConfig || {}
  );
}

/**
 * Check if a route should hide header/footer based on display rules
 */
export function shouldDisplayHeaderFooter(
  pathname: string,
  displayRules: HeaderFooterConfig['display']
): boolean {
  // Check hideOnRoutes
  if (displayRules.hideOnRoutes.some(route => pathname.startsWith(route))) {
    return false;
  }
  
  // Check showOnlyOnRoutes (if set)
  if (displayRules.showOnlyOnRoutes && displayRules.showOnlyOnRoutes.length > 0) {
    return displayRules.showOnlyOnRoutes.some(route => pathname.startsWith(route));
  }
  
  return true;
}