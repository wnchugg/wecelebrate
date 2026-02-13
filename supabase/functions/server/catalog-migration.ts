/**
 * Catalog Migration Utility
 * 
 * Migrates existing gift data to the new multi-catalog architecture.
 * Creates a "Legacy Catalog" and assigns all existing gifts to it.
 */

import * as kv from './kv_env.ts';
import type { Catalog, Gift } from './types.ts';

// Storage key helpers (matching frontend)
const StorageKeys = {
  CATALOGS_ALL: 'catalogs:all',
  CATALOG: (catalogId: string) => `catalogs:${catalogId}`,
  CATALOG_GIFTS: (catalogId: string) => `catalog_gifts:${catalogId}`,
  GIFTS_ALL: 'gifts:all',
  GIFT: (giftId: string) => `gifts:${giftId}`,
  SITE_CATALOG_CONFIG: (siteId: string) => `sites:${siteId}:catalog_config`,
  SITES_ALL: 'sites:all',
};

// ==================== Migration Result Interface ====================

export interface MigrationResult {
  success: boolean;
  legacyCatalogId: string;
  migratedGifts: number;
  configuredSites: number;
  errors: string[];
  warnings: string[];
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

// ==================== Migration Functions ====================

/**
 * Main migration function
 * Converts existing single-catalog structure to multi-catalog architecture
 * 
 * Steps:
 * 1. Create "Legacy Catalog" for existing products
 * 2. Update all gifts with catalogId and source
 * 3. Create catalog-gift relationships
 * 4. Assign legacy catalog to all existing sites
 * 
 * @returns Migration result with statistics and any errors
 */
export async function migrateToMultiCatalog(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    legacyCatalogId: '',
    migratedGifts: 0,
    configuredSites: 0,
    errors: [],
    warnings: [],
    startedAt: new Date().toISOString(),
  };
  
  const startTime = Date.now();
  
  try {
    console.log('[Migration] ========================================');
    console.log('[Migration] Starting multi-catalog migration...');
    console.log('[Migration] ========================================');
    
    // Step 1: Create "Legacy Catalog" for existing products
    console.log('[Migration] Step 1: Creating legacy catalog...');
    
    const legacyCatalog: Catalog = {
      id: 'catalog_legacy_default',
      name: 'Legacy Product Catalog',
      description: 'Default catalog containing all existing products migrated from single-catalog structure',
      type: 'manual',
      source: {
        type: 'manual',
        sourceSystem: 'Internal',
        sourceId: 'legacy',
      },
      status: 'active',
      totalProducts: 0,
      activeProducts: 0,
      settings: {
        autoSync: false,
        defaultCurrency: 'USD',
        allowSiteOverrides: true,
        trackInventory: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save legacy catalog
    await kv.set(StorageKeys.CATALOG(legacyCatalog.id), legacyCatalog);
    await kv.set(StorageKeys.CATALOGS_ALL, [legacyCatalog.id]);
    
    console.log(`[Migration] ✓ Created legacy catalog: ${legacyCatalog.id}`);
    result.legacyCatalogId = legacyCatalog.id;
    
    // Step 2: Get all existing gifts
    console.log('[Migration] Step 2: Fetching existing gifts...');
    
    const allGiftIds = await kv.get(StorageKeys.GIFTS_ALL) || [];
    console.log(`[Migration] Found ${allGiftIds.length} gifts to migrate`);
    
    if (allGiftIds.length === 0) {
      result.warnings.push('No gifts found to migrate');
      console.log('[Migration] ⚠️  No gifts found to migrate');
    }
    
    // Step 3: Update each gift with catalogId and source
    console.log('[Migration] Step 3: Updating gifts with catalog linkage...');
    
    const catalogGiftIds: string[] = [];
    let activeCount = 0;
    let skippedCount = 0;
    
    for (const giftId of allGiftIds) {
      try {
        const gift: Gift | null = await kv.get(StorageKeys.GIFT(giftId));
        
        if (!gift) {
          result.errors.push(`Gift ${giftId} not found in storage`);
          console.error(`[Migration] ✗ Gift ${giftId} not found`);
          continue;
        }
        
        // Check if gift already has catalog linkage (migration already run?)
        if (gift.catalogId) {
          skippedCount++;
          catalogGiftIds.push(giftId);
          if (gift.status === 'active') {
            activeCount++;
          }
          continue;
        }
        
        // Add catalog linkage
        const updatedGift: Gift = {
          ...gift,
          catalogId: legacyCatalog.id,
          source: {
            catalogId: legacyCatalog.id,
            syncStatus: 'manual',
            syncNotes: 'Migrated from legacy single-catalog structure',
          },
          updatedAt: new Date().toISOString(),
        };
        
        await kv.set(StorageKeys.GIFT(giftId), updatedGift);
        catalogGiftIds.push(giftId);
        
        if (gift.status === 'active') {
          activeCount++;
        }
        
        result.migratedGifts++;
        
        // Log progress every 50 gifts
        if (result.migratedGifts % 50 === 0) {
          console.log(`[Migration] Progress: ${result.migratedGifts} gifts migrated...`);
        }
      } catch (error: any) {
        result.errors.push(`Error migrating gift ${giftId}: ${error.message}`);
        console.error(`[Migration] ✗ Error migrating gift ${giftId}:`, error);
      }
    }
    
    if (skippedCount > 0) {
      result.warnings.push(`Skipped ${skippedCount} gifts that already have catalog linkage`);
      console.log(`[Migration] ℹ️  Skipped ${skippedCount} gifts (already migrated)`);
    }
    
    console.log(`[Migration] ✓ Migrated ${result.migratedGifts} gifts`);
    console.log(`[Migration] ✓ Active products: ${activeCount}`);
    
    // Step 4: Create catalog-gift relationships
    console.log('[Migration] Step 4: Creating catalog-gift relationships...');
    
    await kv.set(StorageKeys.CATALOG_GIFTS(legacyCatalog.id), catalogGiftIds);
    console.log(`[Migration] ✓ Created relationships for ${catalogGiftIds.length} products`);
    
    // Step 5: Update catalog counts
    console.log('[Migration] Step 5: Updating catalog statistics...');
    
    legacyCatalog.totalProducts = catalogGiftIds.length;
    legacyCatalog.activeProducts = activeCount;
    legacyCatalog.updatedAt = new Date().toISOString();
    await kv.set(StorageKeys.CATALOG(legacyCatalog.id), legacyCatalog);
    
    console.log(`[Migration] ✓ Updated catalog stats (total: ${catalogGiftIds.length}, active: ${activeCount})`);
    
    // Step 6: Assign legacy catalog to all existing sites
    console.log('[Migration] Step 6: Configuring sites with legacy catalog...');
    
    const allSiteIds = await kv.get(StorageKeys.SITES_ALL) || [];
    console.log(`[Migration] Found ${allSiteIds.length} sites to configure`);
    
    for (const siteId of allSiteIds) {
      try {
        // Check if site already has catalog config
        const existingConfig = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
        
        if (existingConfig) {
          result.warnings.push(`Site ${siteId} already has catalog configuration`);
          result.configuredSites++;
          continue;
        }
        
        const siteCatalogConfig = {
          siteId,
          catalogId: legacyCatalog.id,
          exclusions: {
            excludedCategories: [],
            excludedSkus: [],
            excludedTags: [],
          },
          availability: {
            hideOutOfStock: false,
            hideDiscontinued: false,
          },
          updatedAt: new Date().toISOString(),
        };
        
        await kv.set(
          StorageKeys.SITE_CATALOG_CONFIG(siteId),
          siteCatalogConfig
        );
        
        result.configuredSites++;
      } catch (error: any) {
        result.errors.push(`Error configuring site ${siteId}: ${error.message}`);
        console.error(`[Migration] ✗ Error configuring site ${siteId}:`, error);
      }
    }
    
    console.log(`[Migration] ✓ Configured ${result.configuredSites} sites`);
    
    // Migration complete
    result.completedAt = new Date().toISOString();
    result.duration = Date.now() - startTime;
    result.success = true;
    
    console.log('[Migration] ========================================');
    console.log('[Migration] Migration completed successfully! ✓');
    console.log('[Migration] ========================================');
    console.log(`[Migration] Summary:`);
    console.log(`[Migration]   - Legacy Catalog ID: ${result.legacyCatalogId}`);
    console.log(`[Migration]   - Gifts Migrated: ${result.migratedGifts}`);
    console.log(`[Migration]   - Sites Configured: ${result.configuredSites}`);
    console.log(`[Migration]   - Errors: ${result.errors.length}`);
    console.log(`[Migration]   - Warnings: ${result.warnings.length}`);
    console.log(`[Migration]   - Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log('[Migration] ========================================');
    
    return result;
    
  } catch (error: any) {
    console.error('[Migration] ✗ Fatal migration error:', error);
    
    result.completedAt = new Date().toISOString();
    result.duration = Date.now() - startTime;
    result.success = false;
    result.errors.push(`Fatal error: ${error.message}`);
    
    return result;
  }
}

/**
 * Check if migration is needed
 * Returns true if no catalogs exist yet
 * 
 * @returns True if migration should be run
 */
export async function needsMigration(): Promise<boolean> {
  try {
    const catalogsAll = await kv.get(StorageKeys.CATALOGS_ALL);
    
    // If no catalogs exist, migration is needed
    if (!catalogsAll || (Array.isArray(catalogsAll) && catalogsAll.length === 0)) {
      console.log('[Migration] Migration needed: No catalogs found');
      return true;
    }
    
    console.log(`[Migration] Migration not needed: ${catalogsAll.length} catalog(s) exist`);
    return false;
  } catch (error) {
    console.error('[Migration] Error checking migration status:', error);
    // Assume migration is needed if we can't determine status
    return true;
  }
}

/**
 * Get detailed migration status
 * 
 * @returns Status object with migration statistics
 */
export async function getMigrationStatus() {
  try {
    const catalogsAll = await kv.get(StorageKeys.CATALOGS_ALL) || [];
    const allGiftIds = await kv.get(StorageKeys.GIFTS_ALL) || [];
    
    let giftsWithCatalog = 0;
    let giftsWithoutCatalog = 0;
    let giftErrors = 0;
    
    // Sample first 100 gifts to check catalog linkage
    const sampleSize = Math.min(allGiftIds.length, 100);
    const sampleIds = allGiftIds.slice(0, sampleSize);
    
    for (const giftId of sampleIds) {
      try {
        const gift: Gift | null = await kv.get(StorageKeys.GIFT(giftId));
        
        if (!gift) {
          giftErrors++;
          continue;
        }
        
        if (gift.catalogId) {
          giftsWithCatalog++;
        } else {
          giftsWithoutCatalog++;
        }
      } catch {
        giftErrors++;
      }
    }
    
    // Extrapolate to total
    const ratio = allGiftIds.length / sampleSize;
    const estimatedWithCatalog = Math.round(giftsWithCatalog * ratio);
    const estimatedWithoutCatalog = Math.round(giftsWithoutCatalog * ratio);
    
    const migrationComplete = estimatedWithoutCatalog === 0;
    
    // Check site configurations
    const allSiteIds = await kv.get(StorageKeys.SITES_ALL) || [];
    let sitesConfigured = 0;
    
    for (const siteId of allSiteIds) {
      const config = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
      if (config) {
        sitesConfigured++;
      }
    }
    
    return {
      catalogsExist: catalogsAll.length > 0,
      totalCatalogs: catalogsAll.length,
      catalogIds: catalogsAll,
      
      totalGifts: allGiftIds.length,
      giftsWithCatalog: estimatedWithCatalog,
      giftsWithoutCatalog: estimatedWithoutCatalog,
      giftCheckErrors: giftErrors,
      
      totalSites: allSiteIds.length,
      sitesConfigured,
      sitesNeedingConfig: allSiteIds.length - sitesConfigured,
      
      migrationComplete,
      migrationNeeded: !migrationComplete,
      
      sampledGifts: sampleSize,
      estimationUsed: sampleSize < allGiftIds.length,
    };
  } catch (error: any) {
    console.error('[Migration] Error getting migration status:', error);
    return {
      error: error.message,
      catalogsExist: false,
      migrationComplete: false,
      migrationNeeded: true,
    };
  }
}

/**
 * Rollback migration (remove catalog linkages)
 * WARNING: This will break the multi-catalog feature
 * Only use for testing or emergency rollback
 * 
 * @returns Rollback result
 */
export async function rollbackMigration(): Promise<{
  success: boolean;
  rollbackedGifts: number;
  errors: string[];
}> {
  const result = {
    success: false,
    rollbackedGifts: 0,
    errors: [] as string[],
  };
  
  try {
    console.log('[Rollback] Starting migration rollback...');
    
    // Get all gifts
    const allGiftIds = await kv.get(StorageKeys.GIFTS_ALL) || [];
    
    for (const giftId of allGiftIds) {
      try {
        const gift: Gift | null = await kv.get(StorageKeys.GIFT(giftId));
        
        if (!gift || !gift.catalogId) {
          continue;
        }
        
        // Remove catalog linkage
        const { catalogId, source, ...giftWithoutCatalog } = gift;
        
        await kv.set(StorageKeys.GIFT(giftId), giftWithoutCatalog);
        result.rollbackedGifts++;
      } catch (error: any) {
        result.errors.push(`Error rolling back gift ${giftId}: ${error.message}`);
      }
    }
    
    // Remove catalog data
    const catalogsAll = await kv.get(StorageKeys.CATALOGS_ALL) || [];
    for (const catalogId of catalogsAll) {
      await kv.del(StorageKeys.CATALOG(catalogId));
      await kv.del(StorageKeys.CATALOG_GIFTS(catalogId));
    }
    await kv.del(StorageKeys.CATALOGS_ALL);
    
    // Remove site catalog configs
    const allSiteIds = await kv.get(StorageKeys.SITES_ALL) || [];
    for (const siteId of allSiteIds) {
      await kv.del(StorageKeys.SITE_CATALOG_CONFIG(siteId));
    }
    
    result.success = true;
    console.log(`[Rollback] Rollback completed. Rolled back ${result.rollbackedGifts} gifts`);
    
    return result;
  } catch (error: any) {
    console.error('[Rollback] Rollback failed:', error);
    result.errors.push(`Fatal error: ${error.message}`);
    return result;
  }
}