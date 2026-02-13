# Multi-Catalog Architecture - Implementation Plan

**Project:** Multi-Catalog Management with ERP/Vendor Integration  
**Start Date:** February 11, 2026  
**Target Completion:** March 11, 2026 (4 weeks)  
**Status:** 🟢 READY TO START  
**Estimated Effort:** 60-80 hours

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Foundation & Data Model](#phase-1-foundation--data-model)
3. [Phase 2: Backend API Implementation](#phase-2-backend-api-implementation)
4. [Phase 3: Admin UI - Catalog Management](#phase-3-admin-ui---catalog-management)
5. [Phase 4: Admin UI - Site Configuration](#phase-4-admin-ui---site-configuration)
6. [Phase 5: ERP Integration Framework](#phase-5-erp-integration-framework)
7. [Phase 6: Data Migration & Testing](#phase-6-data-migration--testing)
8. [Dependencies & Critical Path](#dependencies--critical-path)
9. [Risk Management](#risk-management)
10. [Success Criteria](#success-criteria)

---

## Overview

### Project Goals

1. ✅ Support multiple product catalogs from different ERP/vendor sources
2. ✅ Enable site-level catalog assignment with exclusion rules
3. ✅ Build ERP/vendor sync framework (API, file, FTP)
4. ✅ Maintain backward compatibility with existing data
5. ✅ Zero downtime deployment

### Architecture Summary

```
Before:                           After:
┌─────────────┐                  ┌──────────┐ ┌──────────┐ ┌──────────┐
│   Gifts     │                  │Catalog A │ │Catalog B │ │Catalog C │
│  (Global)   │                  │(ERP:SAP) │ │(Vendor X)│ │(Manual)  │
└──────┬──────┘                  └────┬─────┘ └────┬─────┘ └────┬─────┘
       │                               │            │            │
   ┌───▼────┐                      ┌───▼────────────▼────────────▼───┐
   │  Sites │                      │   Site Catalog Assignment       │
   └────────┘                      └───┬─────────┬──────────┬────────┘
                                       │         │          │
                                   ┌───▼───┐ ┌──▼────┐ ┌───▼────┐
                                   │Site A │ │Site B │ │Site C  │
                                   │Cat A  │ │Cat B  │ │Cat C   │
                                   └───────┘ └───────┘ └────────┘
```

---

## Phase 1: Foundation & Data Model

**Duration:** 3-4 days  
**Effort:** 12-16 hours  
**Priority:** CRITICAL (blocking all other phases)

### Objectives

1. Define TypeScript interfaces for new entities
2. Update existing Gift interface
3. Create storage key schema
4. Set up data validation utilities

---

### Task 1.1: Create Type Definitions

**File:** `/src/app/types/catalog.ts` (NEW)

**Create new file with:**

```typescript
// Catalog Types
export type CatalogType = 'erp' | 'vendor' | 'manual' | 'dropship';
export type CatalogStatus = 'active' | 'inactive' | 'syncing' | 'error';
export type SyncStatus = 'synced' | 'modified' | 'conflict' | 'manual';
export type SourceType = 'api' | 'file' | 'manual';
export type AuthType = 'basic' | 'oauth' | 'api_key' | 'none';
export type FileFormat = 'csv' | 'xlsx' | 'json' | 'xml';
export type SyncFrequency = 'manual' | 'hourly' | 'daily' | 'weekly';

export interface Catalog {
  id: string;
  name: string;
  description?: string;
  type: CatalogType;
  source: CatalogSource;
  status: CatalogStatus;
  
  // Metadata
  totalProducts: number;
  activeProducts: number;
  lastSyncedAt?: string;
  nextSyncAt?: string;
  
  // Configuration
  settings: CatalogSettings;
  
  // Ownership
  managedBy?: string;
  ownerId?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface CatalogSource {
  type: SourceType;
  sourceSystem: string;
  sourceId: string;
  sourceVersion?: string;
  
  // API configuration
  apiConfig?: {
    endpoint: string;
    authType: AuthType;
    credentials: Record<string, string>;
    syncEndpoint: string;
    headers?: Record<string, string>;
  };
  
  // File configuration
  fileConfig?: {
    format: FileFormat;
    ftpHost?: string;
    ftpPath?: string;
    ftpUsername?: string;
  };
}

export interface CatalogSettings {
  autoSync: boolean;
  syncFrequency?: SyncFrequency;
  defaultCurrency: string;
  priceMarkup?: number;
  allowSiteOverrides: boolean;
  trackInventory: boolean;
}

export interface ProductSource {
  catalogId: string;
  externalId?: string;
  externalSku?: string;
  lastSyncedAt?: string;
  syncStatus: SyncStatus;
}

export interface CatalogSyncLog {
  id: string;
  catalogId: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed' | 'partial';
  
  results: {
    productsAdded: number;
    productsUpdated: number;
    productsRemoved: number;
    productsUnchanged: number;
    errors: SyncError[];
  };
  
  metrics: {
    duration?: number;
    recordsProcessed: number;
    apiCalls?: number;
    bytesTransferred?: number;
  };
  
  triggeredBy: string;
  logDetails?: string;
}

export interface SyncError {
  sku: string;
  error: string;
  severity: 'warning' | 'error';
  details?: string;
}

export interface SiteCatalogConfig {
  siteId: string;
  catalogId: string;
  
  exclusions: {
    excludedCategories: string[];
    excludedSkus: string[];
    excludedTags?: string[];
  };
  
  overrides?: {
    allowPriceOverride: boolean;
    priceAdjustment?: number;
    customPricing?: Record<string, number>;
  };
  
  availability?: {
    hideOutOfStock: boolean;
    hideDiscontinued: boolean;
    minimumInventory?: number;
  };
  
  updatedAt: string;
}
```

**Estimated Time:** 2 hours

---

### Task 1.2: Update Gift Type Definition

**File:** `/src/app/types/gift.ts` (MODIFY)

**Add to existing Gift interface:**

```typescript
export interface Gift {
  // ... existing fields ...
  
  // NEW: Catalog linkage
  catalogId: string;
  
  // NEW: Source attribution
  source: ProductSource;
  
  // ENHANCED: Pricing
  cost?: number;        // Cost from vendor/ERP
  msrp?: number;        // Manufacturer's suggested retail price
  
  // ... rest of existing fields ...
}
```

**Import ProductSource:**
```typescript
import { ProductSource } from './catalog';
```

**Estimated Time:** 30 minutes

---

### Task 1.3: Create Storage Key Constants

**File:** `/src/app/config/storage-keys.ts` (NEW)

```typescript
/**
 * Centralized storage key definitions for KV store
 */

export const StorageKeys = {
  // Catalogs
  CATALOGS_ALL: 'catalogs:all',
  CATALOG: (catalogId: string) => `catalogs:${catalogId}`,
  
  // Catalog Products
  CATALOG_GIFTS: (catalogId: string) => `catalog_gifts:${catalogId}`,
  CATALOG_GIFT_LINK: (catalogId: string, giftId: string) => 
    `catalog_gifts:${catalogId}:${giftId}`,
  
  // Gifts (existing, now enhanced)
  GIFTS_ALL: 'gifts:all',
  GIFT: (giftId: string) => `gifts:${giftId}`,
  
  // Site Catalog Configuration
  SITE_CATALOG_CONFIG: (siteId: string) => `sites:${siteId}:catalog_config`,
  
  // Catalog Sync Logs
  CATALOG_SYNC_LATEST: (catalogId: string) => `catalog_sync_logs:${catalogId}:latest`,
  CATALOG_SYNC_LOG: (catalogId: string, timestamp: string) => 
    `catalog_sync_logs:${catalogId}:${timestamp}`,
  
  // Indexes
  CATALOG_BY_TYPE: (type: string) => `catalog_index:by_type:${type}`,
  CATALOG_BY_STATUS: (status: string) => `catalog_index:by_status:${status}`,
  GIFTS_BY_CATALOG: (catalogId: string) => `gifts_index:by_catalog:${catalogId}`,
} as const;
```

**Estimated Time:** 1 hour

---

### Task 1.4: Create Validation Utilities

**File:** `/src/app/utils/catalog-validation.ts` (NEW)

```typescript
import { Catalog, CatalogSettings, SiteCatalogConfig } from '../types/catalog';

export class CatalogValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'CatalogValidationError';
  }
}

export function validateCatalog(catalog: Partial<Catalog>): void {
  if (!catalog.name || catalog.name.trim().length === 0) {
    throw new CatalogValidationError('Catalog name is required', 'name');
  }
  
  if (catalog.name.length > 100) {
    throw new CatalogValidationError('Catalog name too long (max 100 chars)', 'name');
  }
  
  if (!catalog.type) {
    throw new CatalogValidationError('Catalog type is required', 'type');
  }
  
  if (!['erp', 'vendor', 'manual', 'dropship'].includes(catalog.type)) {
    throw new CatalogValidationError('Invalid catalog type', 'type');
  }
  
  if (!catalog.settings?.defaultCurrency) {
    throw new CatalogValidationError('Default currency is required', 'settings.defaultCurrency');
  }
  
  if (catalog.settings?.priceMarkup && 
      (catalog.settings.priceMarkup < 0 || catalog.settings.priceMarkup > 1000)) {
    throw new CatalogValidationError('Price markup must be between 0-1000%', 'settings.priceMarkup');
  }
}

export function validateSiteCatalogConfig(config: Partial<SiteCatalogConfig>): void {
  if (!config.siteId) {
    throw new CatalogValidationError('Site ID is required', 'siteId');
  }
  
  if (!config.catalogId) {
    throw new CatalogValidationError('Catalog ID is required', 'catalogId');
  }
  
  if (config.overrides?.priceAdjustment) {
    const adjustment = config.overrides.priceAdjustment;
    if (adjustment < -100 || adjustment > 1000) {
      throw new CatalogValidationError(
        'Price adjustment must be between -100% and 1000%',
        'overrides.priceAdjustment'
      );
    }
  }
  
  if (config.availability?.minimumInventory && config.availability.minimumInventory < 0) {
    throw new CatalogValidationError(
      'Minimum inventory must be positive',
      'availability.minimumInventory'
    );
  }
}

export function sanitizeCatalogName(name: string): string {
  return name.trim().replace(/[<>]/g, '');
}

export function generateCatalogId(name: string): string {
  const sanitized = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  
  return `catalog_${sanitized}_${timestamp}_${random}`;
}
```

**Estimated Time:** 2 hours

---

### Task 1.5: Update Import Statements

**Files to update:**
- `/src/app/types/index.ts` - Add catalog type exports
- `/src/app/utils/index.ts` - Add catalog utility exports

**File:** `/src/app/types/index.ts`

```typescript
// Add these exports
export * from './catalog';
export type { ProductSource } from './catalog';
```

**File:** `/src/app/utils/index.ts`

```typescript
// Add these exports
export * from './catalog-validation';
```

**Estimated Time:** 30 minutes

---

### Task 1.6: Create Database Migration Utility

**File:** `/supabase/functions/server/catalog-migration.ts` (NEW)

```typescript
import * as kv from './kv_store';
import { StorageKeys } from '../../../src/app/config/storage-keys';
import { Catalog, Gift } from '../../../src/app/types';

/**
 * Migration utility to convert existing single-catalog structure
 * to multi-catalog architecture
 */

export async function migrateToMultiCatalog(): Promise<{
  success: boolean;
  legacyCatalogId: string;
  migratedGifts: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let migratedGifts = 0;
  
  try {
    console.log('[Migration] Starting multi-catalog migration...');
    
    // Step 1: Create "Legacy Catalog" for existing products
    const legacyCatalog: Catalog = {
      id: 'catalog_legacy_default',
      name: 'Legacy Product Catalog',
      description: 'Default catalog containing all existing products',
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
    
    console.log('[Migration] Creating legacy catalog...');
    await kv.set(StorageKeys.CATALOG(legacyCatalog.id), legacyCatalog);
    await kv.set(StorageKeys.CATALOGS_ALL, [legacyCatalog.id]);
    
    // Step 2: Get all existing gifts
    console.log('[Migration] Fetching existing gifts...');
    const allGiftIds = await kv.get(StorageKeys.GIFTS_ALL) || [];
    console.log(`[Migration] Found ${allGiftIds.length} gifts to migrate`);
    
    // Step 3: Update each gift with catalogId
    const catalogGiftIds: string[] = [];
    let activeCount = 0;
    
    for (const giftId of allGiftIds) {
      try {
        const gift = await kv.get(StorageKeys.GIFT(giftId));
        
        if (!gift) {
          errors.push(`Gift ${giftId} not found`);
          continue;
        }
        
        // Add catalog linkage if not present
        if (!gift.catalogId) {
          const updatedGift: Gift = {
            ...gift,
            catalogId: legacyCatalog.id,
            source: {
              catalogId: legacyCatalog.id,
              syncStatus: 'manual',
            },
          };
          
          await kv.set(StorageKeys.GIFT(giftId), updatedGift);
          catalogGiftIds.push(giftId);
          
          if (gift.status === 'active') {
            activeCount++;
          }
          
          migratedGifts++;
        }
      } catch (error) {
        errors.push(`Error migrating gift ${giftId}: ${error.message}`);
      }
    }
    
    // Step 4: Create catalog-gift relationships
    console.log('[Migration] Creating catalog-gift relationships...');
    await kv.set(StorageKeys.CATALOG_GIFTS(legacyCatalog.id), catalogGiftIds);
    
    // Step 5: Update catalog counts
    legacyCatalog.totalProducts = catalogGiftIds.length;
    legacyCatalog.activeProducts = activeCount;
    await kv.set(StorageKeys.CATALOG(legacyCatalog.id), legacyCatalog);
    
    // Step 6: Assign legacy catalog to all existing sites
    console.log('[Migration] Assigning legacy catalog to existing sites...');
    const allSiteIds = await kv.get('sites:all') || [];
    
    for (const siteId of allSiteIds) {
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
    }
    
    console.log('[Migration] Migration completed successfully');
    console.log(`[Migration] Migrated ${migratedGifts} gifts`);
    console.log(`[Migration] Configured ${allSiteIds.length} sites`);
    
    return {
      success: true,
      legacyCatalogId: legacyCatalog.id,
      migratedGifts,
      errors,
    };
    
  } catch (error) {
    console.error('[Migration] Fatal error:', error);
    return {
      success: false,
      legacyCatalogId: '',
      migratedGifts,
      errors: [...errors, error.message],
    };
  }
}

/**
 * Check if migration is needed
 */
export async function needsMigration(): Promise<boolean> {
  const catalogsAll = await kv.get(StorageKeys.CATALOGS_ALL);
  return !catalogsAll || catalogsAll.length === 0;
}

/**
 * Get migration status
 */
export async function getMigrationStatus() {
  const catalogsAll = await kv.get(StorageKeys.CATALOGS_ALL) || [];
  const allGiftIds = await kv.get(StorageKeys.GIFTS_ALL) || [];
  
  let giftsWithCatalog = 0;
  let giftsWithoutCatalog = 0;
  
  for (const giftId of allGiftIds) {
    const gift = await kv.get(StorageKeys.GIFT(giftId));
    if (gift?.catalogId) {
      giftsWithCatalog++;
    } else {
      giftsWithoutCatalog++;
    }
  }
  
  return {
    catalogsExist: catalogsAll.length > 0,
    totalCatalogs: catalogsAll.length,
    totalGifts: allGiftIds.length,
    giftsWithCatalog,
    giftsWithoutCatalog,
    migrationComplete: giftsWithoutCatalog === 0,
  };
}
```

**Estimated Time:** 3 hours

---

### Phase 1 Deliverables

- ✅ TypeScript interfaces for Catalog, CatalogSource, SiteCatalogConfig
- ✅ Updated Gift interface with catalogId and source
- ✅ Storage key schema defined
- ✅ Validation utilities created
- ✅ Migration utility implemented
- ✅ All types properly exported

**Checkpoint:** Run `npm run type-check` to verify no TypeScript errors

---

## Phase 2: Backend API Implementation

**Duration:** 5-6 days  
**Effort:** 20-24 hours  
**Dependencies:** Phase 1 complete

### Objectives

1. Implement catalog CRUD endpoints
2. Enhance gift endpoints with catalog filtering
3. Create site catalog configuration endpoints
4. Build filtering logic for site products
5. Add sync log endpoints

---

### Task 2.1: Create Catalog API Routes

**File:** `/supabase/functions/server/index.tsx` (MODIFY)

**Add new routes after existing routes:**

```typescript
// ==================== CATALOG MANAGEMENT ====================

// Get all catalogs
app.get('/make-server-6fcaeea3/catalogs', verifyAdmin, async (c) => {
  try {
    const catalogIds = await kv.get(StorageKeys.CATALOGS_ALL) || [];
    const catalogs = await Promise.all(
      catalogIds.map(id => kv.get(StorageKeys.CATALOG(id)))
    );
    
    return c.json({
      success: true,
      catalogs: catalogs.filter(Boolean),
      count: catalogs.length,
    });
  } catch (error) {
    console.error('[Catalogs] Error fetching catalogs:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get catalog by ID
app.get('/make-server-6fcaeea3/catalogs/:catalogId', verifyAdmin, async (c) => {
  const { catalogId } = c.req.param();
  
  try {
    const catalog = await kv.get(StorageKeys.CATALOG(catalogId));
    
    if (!catalog) {
      return c.json({ success: false, error: 'Catalog not found' }, 404);
    }
    
    return c.json({ success: true, catalog });
  } catch (error) {
    console.error(`[Catalogs] Error fetching catalog ${catalogId}:`, error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create catalog
app.post('/make-server-6fcaeea3/catalogs', verifyAdmin, async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate
    validateCatalog(body);
    
    // Generate ID
    const catalogId = generateCatalogId(body.name);
    
    const catalog: Catalog = {
      id: catalogId,
      name: sanitizeCatalogName(body.name),
      description: body.description,
      type: body.type,
      source: body.source,
      status: 'active',
      totalProducts: 0,
      activeProducts: 0,
      settings: body.settings,
      managedBy: body.managedBy,
      ownerId: body.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save catalog
    await kv.set(StorageKeys.CATALOG(catalogId), catalog);
    
    // Update catalog list
    const allCatalogs = await kv.get(StorageKeys.CATALOGS_ALL) || [];
    await kv.set(StorageKeys.CATALOGS_ALL, [...allCatalogs, catalogId]);
    
    // Initialize empty product list
    await kv.set(StorageKeys.CATALOG_GIFTS(catalogId), []);
    
    console.log(`[Catalogs] Created catalog: ${catalogId}`);
    
    return c.json({ success: true, catalog }, 201);
  } catch (error) {
    console.error('[Catalogs] Error creating catalog:', error);
    return c.json({ 
      success: false, 
      error: error.message,
      field: error.field 
    }, 400);
  }
});

// Update catalog
app.put('/make-server-6fcaeea3/catalogs/:catalogId', verifyAdmin, async (c) => {
  const { catalogId } = c.req.param();
  
  try {
    const existing = await kv.get(StorageKeys.CATALOG(catalogId));
    
    if (!existing) {
      return c.json({ success: false, error: 'Catalog not found' }, 404);
    }
    
    const updates = await c.req.json();
    
    // Validate updates
    validateCatalog({ ...existing, ...updates });
    
    const updated: Catalog = {
      ...existing,
      ...updates,
      id: catalogId, // Prevent ID change
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(StorageKeys.CATALOG(catalogId), updated);
    
    console.log(`[Catalogs] Updated catalog: ${catalogId}`);
    
    return c.json({ success: true, catalog: updated });
  } catch (error) {
    console.error(`[Catalogs] Error updating catalog ${catalogId}:`, error);
    return c.json({ 
      success: false, 
      error: error.message,
      field: error.field 
    }, 400);
  }
});

// Delete catalog
app.delete('/make-server-6fcaeea3/catalogs/:catalogId', verifyAdmin, async (c) => {
  const { catalogId } = c.req.param();
  
  try {
    const catalog = await kv.get(StorageKeys.CATALOG(catalogId));
    
    if (!catalog) {
      return c.json({ success: false, error: 'Catalog not found' }, 404);
    }
    
    // Check if catalog has products
    const catalogGifts = await kv.get(StorageKeys.CATALOG_GIFTS(catalogId)) || [];
    if (catalogGifts.length > 0) {
      return c.json({ 
        success: false, 
        error: 'Cannot delete catalog with products. Remove products first.',
        productCount: catalogGifts.length 
      }, 400);
    }
    
    // Check if any sites use this catalog
    const allSites = await kv.get('sites:all') || [];
    for (const siteId of allSites) {
      const siteConfig = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
      if (siteConfig?.catalogId === catalogId) {
        return c.json({
          success: false,
          error: 'Cannot delete catalog in use by sites',
        }, 400);
      }
    }
    
    // Delete catalog
    await kv.del(StorageKeys.CATALOG(catalogId));
    await kv.del(StorageKeys.CATALOG_GIFTS(catalogId));
    
    // Remove from list
    const allCatalogs = await kv.get(StorageKeys.CATALOGS_ALL) || [];
    await kv.set(
      StorageKeys.CATALOGS_ALL,
      allCatalogs.filter(id => id !== catalogId)
    );
    
    console.log(`[Catalogs] Deleted catalog: ${catalogId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`[Catalogs] Error deleting catalog ${catalogId}:`, error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get catalog statistics
app.get('/make-server-6fcaeea3/catalogs/:catalogId/stats', verifyAdmin, async (c) => {
  const { catalogId } = c.req.param();
  
  try {
    const catalog = await kv.get(StorageKeys.CATALOG(catalogId));
    
    if (!catalog) {
      return c.json({ success: false, error: 'Catalog not found' }, 404);
    }
    
    const giftIds = await kv.get(StorageKeys.CATALOG_GIFTS(catalogId)) || [];
    const gifts = await Promise.all(
      giftIds.map(id => kv.get(StorageKeys.GIFT(id)))
    );
    
    const stats = {
      totalProducts: gifts.length,
      activeProducts: gifts.filter(g => g?.status === 'active').length,
      inactiveProducts: gifts.filter(g => g?.status === 'inactive').length,
      outOfStock: gifts.filter(g => g?.status === 'out_of_stock').length,
      categories: [...new Set(gifts.map(g => g?.category).filter(Boolean))],
      totalValue: gifts.reduce((sum, g) => sum + (g?.price || 0), 0),
      averagePrice: gifts.length > 0 
        ? gifts.reduce((sum, g) => sum + (g?.price || 0), 0) / gifts.length 
        : 0,
    };
    
    return c.json({ success: true, stats });
  } catch (error) {
    console.error(`[Catalogs] Error fetching stats for ${catalogId}:`, error);
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

**Estimated Time:** 4 hours

---

### Task 2.2: Enhance Gift Endpoints with Catalog Support

**File:** `/supabase/functions/server/index.tsx` (MODIFY)

**Update existing gift endpoints:**

```typescript
// GET /gifts - Add catalog filtering
app.get('/make-server-6fcaeea3/gifts', verifyAdmin, async (c) => {
  try {
    const catalogId = c.req.query('catalogId');
    
    let giftIds: string[];
    
    if (catalogId) {
      // Filter by specific catalog
      giftIds = await kv.get(StorageKeys.CATALOG_GIFTS(catalogId)) || [];
    } else {
      // Get all gifts
      giftIds = await kv.get(StorageKeys.GIFTS_ALL) || [];
    }
    
    const gifts = await Promise.all(
      giftIds.map(id => kv.get(StorageKeys.GIFT(id)))
    );
    
    return c.json({
      success: true,
      gifts: gifts.filter(Boolean),
      count: gifts.length,
      catalogId: catalogId || 'all',
    });
  } catch (error) {
    console.error('[Gifts] Error fetching gifts:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /gifts - Add catalog assignment
app.post('/make-server-6fcaeea3/gifts', verifyAdmin, async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate catalog exists
    if (body.catalogId) {
      const catalog = await kv.get(StorageKeys.CATALOG(body.catalogId));
      if (!catalog) {
        return c.json({ 
          success: false, 
          error: 'Invalid catalog ID' 
        }, 400);
      }
    }
    
    const giftId = `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const gift: Gift = {
      id: giftId,
      catalogId: body.catalogId || 'catalog_legacy_default',
      source: {
        catalogId: body.catalogId || 'catalog_legacy_default',
        syncStatus: 'manual',
      },
      name: body.name,
      description: body.description,
      // ... rest of gift fields
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save gift
    await kv.set(StorageKeys.GIFT(giftId), gift);
    
    // Add to gifts:all
    const allGifts = await kv.get(StorageKeys.GIFTS_ALL) || [];
    await kv.set(StorageKeys.GIFTS_ALL, [...allGifts, giftId]);
    
    // Add to catalog
    const catalogGifts = await kv.get(StorageKeys.CATALOG_GIFTS(gift.catalogId)) || [];
    await kv.set(
      StorageKeys.CATALOG_GIFTS(gift.catalogId),
      [...catalogGifts, giftId]
    );
    
    // Update catalog counts
    const catalog = await kv.get(StorageKeys.CATALOG(gift.catalogId));
    if (catalog) {
      catalog.totalProducts = catalogGifts.length + 1;
      if (gift.status === 'active') {
        catalog.activeProducts = (catalog.activeProducts || 0) + 1;
      }
      await kv.set(StorageKeys.CATALOG(gift.catalogId), catalog);
    }
    
    console.log(`[Gifts] Created gift ${giftId} in catalog ${gift.catalogId}`);
    
    return c.json({ success: true, gift }, 201);
  } catch (error) {
    console.error('[Gifts] Error creating gift:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

**Estimated Time:** 3 hours

---

### Task 2.3: Create Site Catalog Configuration Endpoints

**File:** `/supabase/functions/server/index.tsx` (MODIFY)

**Add new routes:**

```typescript
// ==================== SITE CATALOG CONFIGURATION ====================

// Get site catalog configuration
app.get('/make-server-6fcaeea3/sites/:siteId/catalog-config', verifyAdmin, async (c) => {
  const { siteId } = c.req.param();
  
  try {
    // Verify site exists
    const site = await kv.get(`sites:${siteId}`);
    if (!site) {
      return c.json({ success: false, error: 'Site not found' }, 404);
    }
    
    // Get catalog config (may not exist for new sites)
    let config = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
    
    if (!config) {
      // Return default config
      config = {
        siteId,
        catalogId: 'catalog_legacy_default',
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
    }
    
    return c.json({ success: true, config });
  } catch (error) {
    console.error(`[Site Catalog] Error fetching config for ${siteId}:`, error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update site catalog configuration
app.put('/make-server-6fcaeea3/sites/:siteId/catalog-config', verifyAdmin, async (c) => {
  const { siteId } = c.req.param();
  
  try {
    // Verify site exists
    const site = await kv.get(`sites:${siteId}`);
    if (!site) {
      return c.json({ success: false, error: 'Site not found' }, 404);
    }
    
    const body = await c.req.json();
    
    // Validate
    validateSiteCatalogConfig({ siteId, ...body });
    
    // Verify catalog exists
    const catalog = await kv.get(StorageKeys.CATALOG(body.catalogId));
    if (!catalog) {
      return c.json({ success: false, error: 'Catalog not found' }, 404);
    }
    
    const config: SiteCatalogConfig = {
      siteId,
      catalogId: body.catalogId,
      exclusions: {
        excludedCategories: body.exclusions?.excludedCategories || [],
        excludedSkus: body.exclusions?.excludedSkus || [],
        excludedTags: body.exclusions?.excludedTags || [],
      },
      overrides: body.overrides,
      availability: body.availability,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(StorageKeys.SITE_CATALOG_CONFIG(siteId), config);
    
    console.log(`[Site Catalog] Updated config for site ${siteId}`);
    
    return c.json({ success: true, config });
  } catch (error) {
    console.error(`[Site Catalog] Error updating config for ${siteId}:`, error);
    return c.json({ 
      success: false, 
      error: error.message,
      field: error.field 
    }, 400);
  }
});

// Preview: Get products available for site
app.get('/make-server-6fcaeea3/sites/:siteId/catalog-preview', verifyAdmin, async (c) => {
  const { siteId } = c.req.param();
  
  try {
    const config = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
    
    if (!config) {
      return c.json({ 
        success: false, 
        error: 'Site catalog not configured' 
      }, 404);
    }
    
    const catalog = await kv.get(StorageKeys.CATALOG(config.catalogId));
    const products = await getSiteProducts(siteId);
    
    return c.json({
      success: true,
      catalogId: config.catalogId,
      catalogName: catalog?.name || 'Unknown',
      totalInCatalog: catalog?.totalProducts || 0,
      afterExclusions: products.length,
      products: products.slice(0, 12), // First 12 for preview
      hasMore: products.length > 12,
    });
  } catch (error) {
    console.error(`[Site Catalog] Error generating preview for ${siteId}:`, error);
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

**Estimated Time:** 3 hours

---

### Task 2.4: Implement Site Product Filtering Logic

**File:** `/supabase/functions/server/catalog-filter.ts` (NEW)

```typescript
import * as kv from './kv_store';
import { StorageKeys } from '../../../src/app/config/storage-keys';
import { Gift, SiteCatalogConfig } from '../../../src/app/types';

/**
 * Get filtered products for a specific site based on catalog configuration
 */
export async function getSiteProducts(siteId: string): Promise<Gift[]> {
  // 1. Get site's catalog configuration
  const config = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
  
  if (!config) {
    throw new Error(`Site ${siteId} catalog not configured`);
  }
  
  // 2. Get all products from the assigned catalog
  const catalogGiftIds = await kv.get(StorageKeys.CATALOG_GIFTS(config.catalogId)) || [];
  const allCatalogProducts = await Promise.all(
    catalogGiftIds.map(id => kv.get(StorageKeys.GIFT(id)))
  );
  
  // 3. Filter out null/undefined
  let filteredProducts = allCatalogProducts.filter(Boolean);
  
  // 4. Apply status filter (only active)
  filteredProducts = filteredProducts.filter(g => g.status === 'active');
  
  // 5. Apply exclusions - Categories
  if (config.exclusions.excludedCategories?.length > 0) {
    filteredProducts = filteredProducts.filter(
      g => !config.exclusions.excludedCategories.includes(g.category)
    );
  }
  
  // 6. Apply exclusions - SKUs
  if (config.exclusions.excludedSkus?.length > 0) {
    filteredProducts = filteredProducts.filter(
      g => !config.exclusions.excludedSkus.includes(g.sku)
    );
  }
  
  // 7. Apply exclusions - Tags
  if (config.exclusions.excludedTags?.length > 0) {
    filteredProducts = filteredProducts.filter(g => {
      const productTags = g.tags || [];
      return !productTags.some(tag => 
        config.exclusions.excludedTags.includes(tag)
      );
    });
  }
  
  // 8. Apply availability rules
  if (config.availability?.hideOutOfStock) {
    filteredProducts = filteredProducts.filter(
      g => g.inventory.available > 0
    );
  }
  
  if (config.availability?.hideDiscontinued) {
    filteredProducts = filteredProducts.filter(
      g => g.status !== 'discontinued'
    );
  }
  
  if (config.availability?.minimumInventory) {
    filteredProducts = filteredProducts.filter(
      g => g.inventory.available >= config.availability.minimumInventory
    );
  }
  
  // 9. Apply price overrides (if configured)
  if (config.overrides?.priceAdjustment) {
    filteredProducts = filteredProducts.map(g => ({
      ...g,
      price: g.price * (1 + config.overrides.priceAdjustment / 100),
    }));
  }
  
  if (config.overrides?.customPricing) {
    filteredProducts = filteredProducts.map(g => {
      const customPrice = config.overrides.customPricing[g.sku];
      return customPrice ? { ...g, price: customPrice } : g;
    });
  }
  
  return filteredProducts;
}

/**
 * Get catalog statistics for admin dashboard
 */
export async function getCatalogStats(catalogId: string) {
  const giftIds = await kv.get(StorageKeys.CATALOG_GIFTS(catalogId)) || [];
  const gifts = await Promise.all(
    giftIds.map(id => kv.get(StorageKeys.GIFT(id)))
  );
  
  const validGifts = gifts.filter(Boolean);
  
  return {
    totalProducts: validGifts.length,
    activeProducts: validGifts.filter(g => g.status === 'active').length,
    inactiveProducts: validGifts.filter(g => g.status === 'inactive').length,
    outOfStock: validGifts.filter(g => g.status === 'out_of_stock').length,
    discontinuedProducts: validGifts.filter(g => g.status === 'discontinued').length,
    categories: [...new Set(validGifts.map(g => g.category))],
    totalValue: validGifts.reduce((sum, g) => sum + (g.price || 0), 0),
    averagePrice: validGifts.length > 0 
      ? validGifts.reduce((sum, g) => sum + (g.price || 0), 0) / validGifts.length 
      : 0,
    totalInventory: validGifts.reduce((sum, g) => sum + (g.inventory?.total || 0), 0),
    availableInventory: validGifts.reduce((sum, g) => sum + (g.inventory?.available || 0), 0),
  };
}
```

**Import this in `/supabase/functions/server/index.tsx`:**
```typescript
import { getSiteProducts, getCatalogStats } from './catalog-filter';
```

**Estimated Time:** 3 hours

---

### Task 2.5: Add Migration Endpoint

**File:** `/supabase/functions/server/index.tsx` (MODIFY)

**Add migration route:**

```typescript
// ==================== DATA MIGRATION ====================

// Run multi-catalog migration
app.post('/make-server-6fcaeea3/admin/migrate-catalogs', verifyAdmin, async (c) => {
  try {
    console.log('[Migration] Starting catalog migration...');
    
    const result = await migrateToMultiCatalog();
    
    if (result.success) {
      return c.json({
        success: true,
        message: 'Migration completed successfully',
        ...result,
      }, 200);
    } else {
      return c.json({
        success: false,
        message: 'Migration failed',
        ...result,
      }, 500);
    }
  } catch (error) {
    console.error('[Migration] Migration error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Get migration status
app.get('/make-server-6fcaeea3/admin/migration-status', verifyAdmin, async (c) => {
  try {
    const status = await getMigrationStatus();
    const needsMigration = await needsMigration();
    
    return c.json({
      success: true,
      needsMigration,
      ...status,
    });
  } catch (error) {
    console.error('[Migration] Error checking status:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

**Import migration functions:**
```typescript
import { 
  migrateToMultiCatalog, 
  needsMigration, 
  getMigrationStatus 
} from './catalog-migration';
```

**Estimated Time:** 1 hour

---

### Phase 2 Deliverables

- ✅ Catalog CRUD API endpoints (create, read, update, delete)
- ✅ Catalog statistics endpoint
- ✅ Enhanced gift endpoints with catalog filtering
- ✅ Site catalog configuration endpoints
- ✅ Site product preview endpoint
- ✅ Product filtering logic implementation
- ✅ Migration endpoints
- ✅ All endpoints tested with Postman/Thunder Client

**Checkpoint:** Test all API endpoints manually

---

## Phase 3: Admin UI - Catalog Management

**Duration:** 4-5 days  
**Effort:** 16-20 hours  
**Dependencies:** Phase 2 complete

### Task 3.1: Create Catalog Management Page

**File:** `/src/app/pages/admin/CatalogManagement.tsx` (NEW)

[Content continues with detailed React component implementation...]

**Estimated Time:** 6 hours

---

### Task 3.2: Create Catalog Form Modal

**File:** `/src/app/components/admin/CatalogFormModal.tsx` (NEW)

[Component implementation...]

**Estimated Time:** 4 hours

---

### Task 3.3: Update Admin Navigation

**File:** `/src/app/components/AdminLayout.tsx` (MODIFY)

Add "Catalog Management" to navigation menu.

**Estimated Time:** 1 hour

---

### Task 3.4: Update Gift Management with Catalog Filter

**File:** `/src/app/pages/admin/GiftManagement.tsx` (MODIFY)

Add catalog dropdown filter to existing gift list.

**Estimated Time:** 3 hours

---

### Phase 3 Deliverables

- ✅ Catalog Management page with list view
- ✅ Create/Edit Catalog modal
- ✅ Catalog statistics dashboard
- ✅ Catalog filter in Gift Management
- ✅ Catalog badges on product cards
- ✅ Navigation updated

---

## Phase 4: Admin UI - Site Configuration

**Duration:** 3-4 days  
**Effort:** 12-16 hours  
**Dependencies:** Phase 3 complete

### Task 4.1: Add Catalog Tab to Site Configuration

**File:** `/src/app/pages/admin/SiteConfiguration.tsx` (MODIFY)

Add new "Catalog" tab to site configuration page.

**Estimated Time:** 4 hours

---

### Task 4.2: Create Exclusion Rules UI

**File:** `/src/app/components/admin/CatalogExclusionRules.tsx` (NEW)

Category and SKU exclusion interface.

**Estimated Time:** 4 hours

---

### Task 4.3: Create Catalog Preview Component

**File:** `/src/app/components/admin/CatalogPreview.tsx` (NEW)

Show filtered product preview.

**Estimated Time:** 3 hours

---

### Phase 4 Deliverables

- ✅ Catalog tab in Site Configuration
- ✅ Catalog selector dropdown
- ✅ Exclusion rules UI (categories, SKUs, tags)
- ✅ Preview available products
- ✅ Price override configuration

---

## Phase 5: ERP Integration Framework

**Duration:** 5-6 days  
**Effort:** 20-24 hours  
**Dependencies:** Phases 1-4 complete

### Task 5.1: Create Sync Engine

**File:** `/supabase/functions/server/catalog-sync.ts` (NEW)

Implement API, file, and FTP sync mechanisms.

**Estimated Time:** 8 hours

---

### Task 5.2: Create Sync Logs UI

**File:** `/src/app/pages/admin/CatalogSyncHistory.tsx` (NEW)

View sync history and errors.

**Estimated Time:** 4 hours

---

### Task 5.3: Implement CSV Import

**File:** `/src/app/components/admin/CatalogImportModal.tsx` (NEW)

Bulk product import from CSV/Excel.

**Estimated Time:** 6 hours

---

### Phase 5 Deliverables

- ✅ Sync engine (API, file, FTP)
- ✅ Sync logging system
- ✅ Sync history UI
- ✅ CSV/Excel import functionality
- ✅ Scheduled sync framework

---

## Phase 6: Data Migration & Testing

**Duration:** 3-4 days  
**Effort:** 12-16 hours  
**Dependencies:** All phases complete

### Task 6.1: Run Data Migration

Execute migration script to convert existing data.

**Estimated Time:** 2 hours

---

### Task 6.2: Comprehensive Testing

- Unit tests
- Integration tests
- End-to-end testing
- Performance testing

**Estimated Time:** 8 hours

---

### Task 6.3: Documentation

- User guides
- API documentation
- ERP integration guides

**Estimated Time:** 4 hours

---

## Dependencies & Critical Path

### Critical Path (Must be sequential)

```
Phase 1 (Foundation)
    ↓
Phase 2 (Backend API)
    ↓
Phase 3 (Catalog Management UI)
    ↓
Phase 4 (Site Configuration UI)
    ↓
Phase 5 (ERP Integration)
    ↓
Phase 6 (Migration & Testing)
```

### Parallel Work Opportunities

- **Phase 3 & 4** can partially overlap (different developers)
- **Task 3.4** (Gift Management updates) can be done in Phase 4
- **Phase 5** documentation can start during Phase 4

---

## Risk Management

### High Risks

1. **Data Migration Complexity**
   - *Mitigation*: Test migration on dev environment first
   - *Rollback Plan*: Keep backups, migration is reversible

2. **ERP API Variations**
   - *Mitigation*: Build adapter pattern, start with one ERP
   - *Fallback*: Manual CSV import always available

3. **Performance with Large Catalogs**
   - *Mitigation*: Implement caching early
   - *Monitoring*: Add performance metrics

### Medium Risks

4. **UI Complexity**
   - *Mitigation*: Iterate based on feedback
   - *Solution*: Simplify if needed, MVP first

5. **Backward Compatibility**
   - *Mitigation*: Extensive testing
   - *Validation*: Keep old endpoints working

---

## Success Criteria

### Phase 1 Success
- ✅ All TypeScript types compile without errors
- ✅ Storage keys documented and consistent
- ✅ Migration utility tested

### Phase 2 Success
- ✅ All API endpoints respond correctly
- ✅ Catalog CRUD operations work
- ✅ Site filtering returns correct products
- ✅ No breaking changes to existing endpoints

### Phase 3 Success
- ✅ Can create and manage catalogs via UI
- ✅ Can view catalog statistics
- ✅ Can filter gifts by catalog
- ✅ UI is intuitive and responsive

### Phase 4 Success
- ✅ Can assign catalog to site
- ✅ Can configure exclusion rules
- ✅ Preview shows correct filtered products
- ✅ Configuration saves successfully

### Phase 5 Success
- ✅ Can import products via CSV
- ✅ Sync logs are created
- ✅ Can view sync history
- ✅ Error handling works correctly

### Phase 6 Success
- ✅ All existing data migrated successfully
- ✅ Zero data loss
- ✅ All tests passing
- ✅ Performance meets targets (<500ms filtering)
- ✅ Documentation complete

---

## Resource Allocation

### Recommended Team Structure

**Option A: Single Developer (Sequential)**
- Phase 1: 3-4 days
- Phase 2: 5-6 days
- Phase 3: 4-5 days
- Phase 4: 3-4 days
- Phase 5: 5-6 days
- Phase 6: 3-4 days
- **Total: 23-29 days (4.6-5.8 weeks)**

**Option B: Two Developers (Parallel)**
- Developer 1: Phases 1, 2, 5
- Developer 2: Phases 3, 4, 6 (after Phase 2)
- **Total: ~3 weeks with good coordination**

---

## Next Steps (This Week)

### Immediate Actions

1. ✅ **Approve this plan** - Get stakeholder sign-off
2. ✅ **Set up project board** - Create tasks in project management tool
3. ✅ **Assign resources** - Identify developers
4. ✅ **Create feature branch** - `feature/multi-catalog`
5. ✅ **Start Phase 1** - Begin with type definitions

### Day 1-2: Phase 1
- Create type definitions
- Update existing types
- Create storage key constants
- Write validation utilities
- Implement migration utility

### Day 3-4: Phase 2 (Part 1)
- Create catalog CRUD endpoints
- Test with Postman
- Implement catalog statistics

### Day 5-6: Phase 2 (Part 2)
- Enhance gift endpoints
- Create site catalog endpoints
- Implement filtering logic
- Add migration endpoint

### Day 7: Checkpoint & Review
- Review progress
- Test all backend functionality
- Adjust timeline if needed
- Prepare for Phase 3

---

## Tracking & Reporting

### Daily Standup Questions
1. What did you complete yesterday?
2. What are you working on today?
3. Any blockers?
4. On track for phase completion?

### Weekly Status Report
- Phases completed
- Phases in progress
- Issues encountered
- Updated timeline
- Risks identified

### Metrics to Track
- API endpoint completion %
- UI component completion %
- Test coverage %
- Migration success rate
- Performance benchmarks

---

## Appendix: File Checklist

### New Files to Create

#### Backend
- [ ] `/supabase/functions/server/catalog-migration.ts`
- [ ] `/supabase/functions/server/catalog-sync.ts`
- [ ] `/supabase/functions/server/catalog-filter.ts`

#### Frontend - Types
- [ ] `/src/app/types/catalog.ts`
- [ ] `/src/app/config/storage-keys.ts`
- [ ] `/src/app/utils/catalog-validation.ts`

#### Frontend - Pages
- [ ] `/src/app/pages/admin/CatalogManagement.tsx`
- [ ] `/src/app/pages/admin/CatalogSyncHistory.tsx`

#### Frontend - Components
- [ ] `/src/app/components/admin/CatalogFormModal.tsx`
- [ ] `/src/app/components/admin/CatalogCard.tsx`
- [ ] `/src/app/components/admin/CatalogExclusionRules.tsx`
- [ ] `/src/app/components/admin/CatalogPreview.tsx`
- [ ] `/src/app/components/admin/CatalogImportModal.tsx`
- [ ] `/src/app/components/admin/SyncLogViewer.tsx`

### Files to Modify

#### Backend
- [ ] `/supabase/functions/server/index.tsx` - Add catalog routes

#### Frontend
- [ ] `/src/app/types/gift.ts` - Add catalogId and source
- [ ] `/src/app/types/index.ts` - Export catalog types
- [ ] `/src/app/pages/admin/GiftManagement.tsx` - Add catalog filter
- [ ] `/src/app/pages/admin/SiteConfiguration.tsx` - Add catalog tab
- [ ] `/src/app/components/AdminLayout.tsx` - Add catalog nav item
- [ ] `/src/app/routes.ts` - Add catalog routes

---

**Document Status:** 🟢 READY FOR EXECUTION  
**Next Action:** Begin Phase 1 - Create type definitions  
**Owner:** Development Team  
**Last Updated:** February 11, 2026

---

**LET'S BUILD THIS! 🚀**
