/**
 * Catalog API Endpoints
 * 
 * CRUD operations for managing product catalogs
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_env.ts';
import type { Catalog } from './types';

const app = new Hono();

// Storage keys
const StorageKeys = {
  CATALOGS_ALL: 'catalogs:all',
  CATALOG: (catalogId: string) => `catalogs:${catalogId}`,
  CATALOG_GIFTS: (catalogId: string) => `catalog_gifts:${catalogId}`,
  CATALOG_BY_TYPE: (type: string) => `catalog_index:by_type:${type}`,
  CATALOG_BY_STATUS: (status: string) => `catalog_index:by_status:${status}`,
  CATALOG_BY_OWNER: (ownerId: string) => `catalog_index:by_owner:${ownerId}`,
  CATALOG_STATS: (catalogId: string) => `catalog_stats:${catalogId}`,
};

// ==================== GET /catalogs - List all catalogs ====================

app.get('/', async (c) => {
  try {
    const catalogIds: string[] = await kv.get(StorageKeys.CATALOGS_ALL) || [];
    
    const catalogs: Catalog[] = [];
    for (const catalogId of catalogIds) {
      const catalog: Catalog | null = await kv.get(StorageKeys.CATALOG(catalogId));
      if (catalog) {
        catalogs.push(catalog);
      }
    }
    
    // Optional filtering
    const type = c.req.query('type');
    const status = c.req.query('status');
    const ownerId = c.req.query('ownerId');
    
    let filteredCatalogs = catalogs;
    
    if (type) {
      filteredCatalogs = filteredCatalogs.filter(cat => cat.type === type);
    }
    
    if (status) {
      filteredCatalogs = filteredCatalogs.filter(cat => cat.status === status);
    }
    
    if (ownerId) {
      filteredCatalogs = filteredCatalogs.filter(cat => cat.ownerId === ownerId);
    }
    
    console.log(`[Catalogs API] Listed ${filteredCatalogs.length} catalogs`);
    
    return c.json({
      success: true,
      catalogs: filteredCatalogs,
      total: filteredCatalogs.length,
    });
  } catch (error: any) {
    console.error('[Catalogs API] Error listing catalogs:', error);
    return c.json({
      success: false,
      error: `Failed to list catalogs: ${error.message}`,
    }, 500);
  }
});

// ==================== GET /catalogs/:id - Get single catalog ====================

app.get('/:id', async (c) => {
  try {
    const catalogId = c.req.param('id');
    
    const catalog: Catalog | null = await kv.get(StorageKeys.CATALOG(catalogId));
    
    if (!catalog) {
      return c.json({
        success: false,
        error: 'Catalog not found',
      }, 404);
    }
    
    // Also get product count
    const giftIds: string[] = await kv.get(StorageKeys.CATALOG_GIFTS(catalogId)) || [];
    catalog.totalProducts = giftIds.length;
    
    console.log(`[Catalogs API] Retrieved catalog: ${catalogId}`);
    
    return c.json({
      success: true,
      catalog,
    });
  } catch (error: any) {
    console.error('[Catalogs API] Error getting catalog:', error);
    return c.json({
      success: false,
      error: `Failed to get catalog: ${error.message}`,
    }, 500);
  }
});

// ==================== POST /catalogs - Create catalog ====================

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validation
    if (!body.name || body.name.trim().length === 0) {
      return c.json({
        success: false,
        error: 'Catalog name is required',
      }, 400);
    }
    
    if (!body.type || !['erp', 'vendor', 'manual', 'dropship'].includes(body.type)) {
      return c.json({
        success: false,
        error: 'Valid catalog type is required (erp, vendor, manual, dropship)',
      }, 400);
    }
    
    if (!body.source || !body.source.type || !body.source.sourceSystem || !body.source.sourceId) {
      return c.json({
        success: false,
        error: 'Complete source configuration is required',
      }, 400);
    }
    
    if (!body.settings || !body.settings.defaultCurrency) {
      return c.json({
        success: false,
        error: 'Settings with default currency are required',
      }, 400);
    }
    
    // Generate catalog ID
    const catalogId = generateCatalogId(body.name);
    
    const newCatalog: Catalog = {
      id: catalogId,
      name: body.name.trim(),
      description: body.description?.trim() || '',
      type: body.type,
      source: body.source,
      status: body.status || 'active',
      totalProducts: 0,
      activeProducts: 0,
      settings: {
        autoSync: body.settings.autoSync || false,
        syncFrequency: body.settings.syncFrequency,
        defaultCurrency: body.settings.defaultCurrency,
        priceMarkup: body.settings.priceMarkup,
        allowSiteOverrides: body.settings.allowSiteOverrides !== false,
        trackInventory: body.settings.trackInventory !== false,
        requireApproval: body.settings.requireApproval,
        notifyOnSync: body.settings.notifyOnSync,
        notifyOnError: body.settings.notifyOnError,
      },
      managedBy: body.managedBy,
      ownerId: body.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save catalog
    await kv.set(StorageKeys.CATALOG(catalogId), newCatalog);
    
    // Update catalog list
    const catalogIds: string[] = await kv.get(StorageKeys.CATALOGS_ALL) || [];
    catalogIds.push(catalogId);
    await kv.set(StorageKeys.CATALOGS_ALL, catalogIds);
    
    // Initialize empty gifts list
    await kv.set(StorageKeys.CATALOG_GIFTS(catalogId), []);
    
    // Update indexes
    await updateIndexes(newCatalog);
    
    console.log(`[Catalogs API] Created catalog: ${catalogId}`);
    
    return c.json({
      success: true,
      catalog: newCatalog,
    }, 201);
  } catch (error: any) {
    console.error('[Catalogs API] Error creating catalog:', error);
    return c.json({
      success: false,
      error: `Failed to create catalog: ${error.message}`,
    }, 500);
  }
});

// ==================== PUT /catalogs/:id - Update catalog ====================

app.put('/:id', async (c) => {
  try {
    const catalogId = c.req.param('id');
    const body = await c.req.json();
    
    const existingCatalog: Catalog | null = await kv.get(StorageKeys.CATALOG(catalogId));
    
    if (!existingCatalog) {
      return c.json({
        success: false,
        error: 'Catalog not found',
      }, 404);
    }
    
    // Update catalog (preserve certain fields)
    const updatedCatalog: Catalog = {
      ...existingCatalog,
      name: body.name?.trim() || existingCatalog.name,
      description: body.description !== undefined ? body.description.trim() : existingCatalog.description,
      type: body.type || existingCatalog.type,
      source: body.source || existingCatalog.source,
      status: body.status || existingCatalog.status,
      settings: body.settings ? {
        ...existingCatalog.settings,
        ...body.settings,
      } : existingCatalog.settings,
      managedBy: body.managedBy !== undefined ? body.managedBy : existingCatalog.managedBy,
      ownerId: body.ownerId !== undefined ? body.ownerId : existingCatalog.ownerId,
      updatedAt: new Date().toISOString(),
      // Preserve these
      totalProducts: existingCatalog.totalProducts,
      activeProducts: existingCatalog.activeProducts,
      lastSyncedAt: existingCatalog.lastSyncedAt,
      nextSyncAt: existingCatalog.nextSyncAt,
      createdAt: existingCatalog.createdAt,
    };
    
    await kv.set(StorageKeys.CATALOG(catalogId), updatedCatalog);
    
    // Update indexes if type/status/owner changed
    if (body.type !== existingCatalog.type || 
        body.status !== existingCatalog.status ||
        body.ownerId !== existingCatalog.ownerId) {
      await removeFromIndexes(existingCatalog);
      await updateIndexes(updatedCatalog);
    }
    
    console.log(`[Catalogs API] Updated catalog: ${catalogId}`);
    
    return c.json({
      success: true,
      catalog: updatedCatalog,
    });
  } catch (error: any) {
    console.error('[Catalogs API] Error updating catalog:', error);
    return c.json({
      success: false,
      error: `Failed to update catalog: ${error.message}`,
    }, 500);
  }
});

// ==================== DELETE /catalogs/:id - Delete catalog ====================

app.delete('/:id', async (c) => {
  try {
    const catalogId = c.req.param('id');
    
    const existingCatalog: Catalog | null = await kv.get(StorageKeys.CATALOG(catalogId));
    
    if (!existingCatalog) {
      return c.json({
        success: false,
        error: 'Catalog not found',
      }, 404);
    }
    
    // Check if catalog has products
    const giftIds: string[] = await kv.get(StorageKeys.CATALOG_GIFTS(catalogId)) || [];
    
    if (giftIds.length > 0) {
      return c.json({
        success: false,
        error: `Cannot delete catalog with ${giftIds.length} products. Remove products first.`,
      }, 400);
    }
    
    // Delete catalog
    await kv.del(StorageKeys.CATALOG(catalogId));
    await kv.del(StorageKeys.CATALOG_GIFTS(catalogId));
    await kv.del(StorageKeys.CATALOG_STATS(catalogId));
    
    // Update catalog list
    const catalogIds: string[] = await kv.get(StorageKeys.CATALOGS_ALL) || [];
    const updatedIds = catalogIds.filter(id => id !== catalogId);
    await kv.set(StorageKeys.CATALOGS_ALL, updatedIds);
    
    // Remove from indexes
    await removeFromIndexes(existingCatalog);
    
    console.log(`[Catalogs API] Deleted catalog: ${catalogId}`);
    
    return c.json({
      success: true,
      message: 'Catalog deleted successfully',
    });
  } catch (error: any) {
    console.error('[Catalogs API] Error deleting catalog:', error);
    return c.json({
      success: false,
      error: `Failed to delete catalog: ${error.message}`,
    }, 500);
  }
});

// ==================== GET /catalogs/:id/stats - Get catalog statistics ====================

app.get('/:id/stats', async (c) => {
  try {
    const catalogId = c.req.param('id');
    
    const catalog: Catalog | null = await kv.get(StorageKeys.CATALOG(catalogId));
    
    if (!catalog) {
      return c.json({
        success: false,
        error: 'Catalog not found',
      }, 404);
    }
    
    // Get all gifts in catalog
    const giftIds: string[] = await kv.get(StorageKeys.CATALOG_GIFTS(catalogId)) || [];
    
    let activeCount = 0;
    let inactiveCount = 0;
    let outOfStockCount = 0;
    const categories = new Set<string>();
    const prices: number[] = [];
    let totalInventory = 0;
    
    for (const giftId of giftIds) {
      const gift = await kv.get(`gifts:${giftId}`);
      if (gift) {
        if (gift.status === 'active') activeCount++;
        else inactiveCount++;
        
        if (gift.availableQuantity !== undefined) {
          totalInventory += gift.availableQuantity;
          if (gift.availableQuantity === 0) outOfStockCount++;
        }
        
        if (gift.category) categories.add(gift.category);
        prices.push(gift.price);
      }
    }
    
    const stats = {
      catalogId,
      totalProducts: giftIds.length,
      activeProducts: activeCount,
      inactiveProducts: inactiveCount,
      outOfStock: outOfStockCount,
      categories: Array.from(categories),
      categoryCount: categories.size,
      priceStats: {
        totalValue: prices.reduce((sum, p) => sum + p, 0),
        averagePrice: prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      },
      inventoryStats: {
        totalInventory,
        averageInventory: giftIds.length > 0 ? totalInventory / giftIds.length : 0,
      },
      lastUpdated: new Date().toISOString(),
    };
    
    console.log(`[Catalogs API] Generated stats for catalog: ${catalogId}`);
    
    return c.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('[Catalogs API] Error getting catalog stats:', error);
    return c.json({
      success: false,
      error: `Failed to get catalog stats: ${error.message}`,
    }, 500);
  }
});

// ==================== Helper Functions ====================

function generateCatalogId(name: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  
  return `catalog_${sanitized}_${timestamp}_${random}`;
}

async function updateIndexes(catalog: Catalog): Promise<void> {
  // Update type index
  const typeIndex: string[] = await kv.get(StorageKeys.CATALOG_BY_TYPE(catalog.type)) || [];
  if (!typeIndex.includes(catalog.id)) {
    typeIndex.push(catalog.id);
    await kv.set(StorageKeys.CATALOG_BY_TYPE(catalog.type), typeIndex);
  }
  
  // Update status index
  const statusIndex: string[] = await kv.get(StorageKeys.CATALOG_BY_STATUS(catalog.status)) || [];
  if (!statusIndex.includes(catalog.id)) {
    statusIndex.push(catalog.id);
    await kv.set(StorageKeys.CATALOG_BY_STATUS(catalog.status), statusIndex);
  }
  
  // Update owner index
  if (catalog.ownerId) {
    const ownerIndex: string[] = await kv.get(StorageKeys.CATALOG_BY_OWNER(catalog.ownerId)) || [];
    if (!ownerIndex.includes(catalog.id)) {
      ownerIndex.push(catalog.id);
      await kv.set(StorageKeys.CATALOG_BY_OWNER(catalog.ownerId), ownerIndex);
    }
  }
}

async function removeFromIndexes(catalog: Catalog): Promise<void> {
  // Remove from type index
  const typeIndex: string[] = await kv.get(StorageKeys.CATALOG_BY_TYPE(catalog.type)) || [];
  const updatedTypeIndex = typeIndex.filter(id => id !== catalog.id);
  await kv.set(StorageKeys.CATALOG_BY_TYPE(catalog.type), updatedTypeIndex);
  
  // Remove from status index
  const statusIndex: string[] = await kv.get(StorageKeys.CATALOG_BY_STATUS(catalog.status)) || [];
  const updatedStatusIndex = statusIndex.filter(id => id !== catalog.id);
  await kv.set(StorageKeys.CATALOG_BY_STATUS(catalog.status), updatedStatusIndex);
  
  // Remove from owner index
  if (catalog.ownerId) {
    const ownerIndex: string[] = await kv.get(StorageKeys.CATALOG_BY_OWNER(catalog.ownerId)) || [];
    const updatedOwnerIndex = ownerIndex.filter(id => id !== catalog.id);
    await kv.set(StorageKeys.CATALOG_BY_OWNER(catalog.ownerId), updatedOwnerIndex);
  }
}

export default app;