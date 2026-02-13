/**
 * Site Catalog Configuration API
 * 
 * Manages site-specific catalog assignments, exclusions, and overrides
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_env.ts';

const app = new Hono();

// Storage keys
const StorageKeys = {
  SITE: (siteId: string) => `sites:${siteId}`,
  SITE_CATALOG_CONFIG: (siteId: string) => `sites:${siteId}:catalog_config`,
  CATALOG: (catalogId: string) => `catalogs:${catalogId}`,
};

// ==================== GET /sites/:siteId/catalog-config - Get site catalog configuration ====================

app.get('/:siteId/catalog-config', async (c) => {
  try {
    const siteId = c.req.param('siteId');
    
    // Verify site exists
    const site = await kv.get(StorageKeys.SITE(siteId));
    if (!site) {
      return c.json({
        success: false,
        error: 'Site not found',
      }, 404);
    }
    
    const config = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
    
    if (!config) {
      return c.json({
        success: false,
        error: 'No catalog configuration found for this site',
      }, 404);
    }
    
    console.log(`[Site Catalog Config API] Retrieved config for site: ${siteId}`);
    
    return c.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('[Site Catalog Config API] Error getting config:', error);
    return c.json({
      success: false,
      error: `Failed to get catalog configuration: ${error.message}`,
    }, 500);
  }
});

// ==================== POST /sites/:siteId/catalog-config - Create/Update site catalog configuration ====================

app.post('/:siteId/catalog-config', async (c) => {
  try {
    const siteId = c.req.param('siteId');
    const body = await c.req.json();
    
    // Verify site exists
    const site = await kv.get(StorageKeys.SITE(siteId));
    if (!site) {
      return c.json({
        success: false,
        error: 'Site not found',
      }, 404);
    }
    
    // Validate catalog ID
    if (!body.catalogId) {
      return c.json({
        success: false,
        error: 'Catalog ID is required',
      }, 400);
    }
    
    // Verify catalog exists
    const catalog = await kv.get(StorageKeys.CATALOG(body.catalogId));
    if (!catalog) {
      return c.json({
        success: false,
        error: 'Catalog not found',
      }, 404);
    }
    
    // Create configuration
    const config = {
      siteId,
      catalogId: body.catalogId,
      exclusions: {
        excludedCategories: body.exclusions?.excludedCategories || [],
        excludedSkus: body.exclusions?.excludedSkus || [],
        excludedTags: body.exclusions?.excludedTags || [],
        excludedBrands: body.exclusions?.excludedBrands || [],
      },
      overrides: body.overrides ? {
        allowPriceOverride: body.overrides.allowPriceOverride !== false,
        priceAdjustment: body.overrides.priceAdjustment,
        customPricing: body.overrides.customPricing || {},
        customDescriptions: body.overrides.customDescriptions || {},
      } : undefined,
      availability: body.availability ? {
        hideOutOfStock: body.availability.hideOutOfStock || false,
        hideDiscontinued: body.availability.hideDiscontinued || false,
        minimumInventory: body.availability.minimumInventory,
        maximumPrice: body.availability.maximumPrice,
        minimumPrice: body.availability.minimumPrice,
        onlyShowFeatured: body.availability.onlyShowFeatured,
      } : {
        hideOutOfStock: false,
        hideDiscontinued: false,
      },
      updatedAt: new Date().toISOString(),
      updatedBy: body.updatedBy,
    };
    
    await kv.set(StorageKeys.SITE_CATALOG_CONFIG(siteId), config);
    
    console.log(`[Site Catalog Config API] Saved config for site: ${siteId}`);
    
    return c.json({
      success: true,
      config,
    }, 201);
  } catch (error: any) {
    console.error('[Site Catalog Config API] Error saving config:', error);
    return c.json({
      success: false,
      error: `Failed to save catalog configuration: ${error.message}`,
    }, 500);
  }
});

// ==================== PUT /sites/:siteId/catalog-config - Update site catalog configuration ====================

app.put('/:siteId/catalog-config', async (c) => {
  try {
    const siteId = c.req.param('siteId');
    const body = await c.req.json();
    
    // Get existing config
    const existingConfig = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
    
    if (!existingConfig) {
      return c.json({
        success: false,
        error: 'No catalog configuration found for this site',
      }, 404);
    }
    
    // If changing catalog, verify it exists
    if (body.catalogId && body.catalogId !== existingConfig.catalogId) {
      const catalog = await kv.get(StorageKeys.CATALOG(body.catalogId));
      if (!catalog) {
        return c.json({
          success: false,
          error: 'Catalog not found',
        }, 404);
      }
    }
    
    // Update configuration
    const updatedConfig = {
      ...existingConfig,
      catalogId: body.catalogId || existingConfig.catalogId,
      exclusions: body.exclusions ? {
        excludedCategories: body.exclusions.excludedCategories || existingConfig.exclusions.excludedCategories,
        excludedSkus: body.exclusions.excludedSkus || existingConfig.exclusions.excludedSkus,
        excludedTags: body.exclusions.excludedTags || existingConfig.exclusions.excludedTags || [],
        excludedBrands: body.exclusions.excludedBrands || existingConfig.exclusions.excludedBrands || [],
      } : existingConfig.exclusions,
      overrides: body.overrides ? {
        ...existingConfig.overrides,
        ...body.overrides,
      } : existingConfig.overrides,
      availability: body.availability ? {
        ...existingConfig.availability,
        ...body.availability,
      } : existingConfig.availability,
      updatedAt: new Date().toISOString(),
      updatedBy: body.updatedBy,
    };
    
    await kv.set(StorageKeys.SITE_CATALOG_CONFIG(siteId), updatedConfig);
    
    console.log(`[Site Catalog Config API] Updated config for site: ${siteId}`);
    
    return c.json({
      success: true,
      config: updatedConfig,
    });
  } catch (error: any) {
    console.error('[Site Catalog Config API] Error updating config:', error);
    return c.json({
      success: false,
      error: `Failed to update catalog configuration: ${error.message}`,
    }, 500);
  }
});

// ==================== DELETE /sites/:siteId/catalog-config - Remove site catalog configuration ====================

app.delete('/:siteId/catalog-config', async (c) => {
  try {
    const siteId = c.req.param('siteId');
    
    const existingConfig = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
    
    if (!existingConfig) {
      return c.json({
        success: false,
        error: 'No catalog configuration found for this site',
      }, 404);
    }
    
    await kv.del(StorageKeys.SITE_CATALOG_CONFIG(siteId));
    
    console.log(`[Site Catalog Config API] Deleted config for site: ${siteId}`);
    
    return c.json({
      success: true,
      message: 'Catalog configuration deleted successfully',
    });
  } catch (error: any) {
    console.error('[Site Catalog Config API] Error deleting config:', error);
    return c.json({
      success: false,
      error: `Failed to delete catalog configuration: ${error.message}`,
    }, 500);
  }
});

// ==================== POST /sites/:siteId/catalog-config/exclusions/add - Add exclusions ====================

app.post('/:siteId/catalog-config/exclusions/add', async (c) => {
  try {
    const siteId = c.req.param('siteId');
    const body = await c.req.json();
    
    const config = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
    
    if (!config) {
      return c.json({
        success: false,
        error: 'No catalog configuration found for this site',
      }, 404);
    }
    
    // Add exclusions
    if (body.categories && Array.isArray(body.categories)) {
      config.exclusions.excludedCategories = [
        ...new Set([...config.exclusions.excludedCategories, ...body.categories])
      ];
    }
    
    if (body.skus && Array.isArray(body.skus)) {
      config.exclusions.excludedSkus = [
        ...new Set([...config.exclusions.excludedSkus, ...body.skus])
      ];
    }
    
    if (body.tags && Array.isArray(body.tags)) {
      config.exclusions.excludedTags = [
        ...new Set([...(config.exclusions.excludedTags || []), ...body.tags])
      ];
    }
    
    if (body.brands && Array.isArray(body.brands)) {
      config.exclusions.excludedBrands = [
        ...new Set([...(config.exclusions.excludedBrands || []), ...body.brands])
      ];
    }
    
    config.updatedAt = new Date().toISOString();
    config.updatedBy = body.updatedBy;
    
    await kv.set(StorageKeys.SITE_CATALOG_CONFIG(siteId), config);
    
    console.log(`[Site Catalog Config API] Added exclusions for site: ${siteId}`);
    
    return c.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('[Site Catalog Config API] Error adding exclusions:', error);
    return c.json({
      success: false,
      error: `Failed to add exclusions: ${error.message}`,
    }, 500);
  }
});

// ==================== POST /sites/:siteId/catalog-config/exclusions/remove - Remove exclusions ====================

app.post('/:siteId/catalog-config/exclusions/remove', async (c) => {
  try {
    const siteId = c.req.param('siteId');
    const body = await c.req.json();
    
    const config = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
    
    if (!config) {
      return c.json({
        success: false,
        error: 'No catalog configuration found for this site',
      }, 404);
    }
    
    // Remove exclusions
    if (body.categories && Array.isArray(body.categories)) {
      config.exclusions.excludedCategories = config.exclusions.excludedCategories
        .filter(cat => !body.categories.includes(cat));
    }
    
    if (body.skus && Array.isArray(body.skus)) {
      config.exclusions.excludedSkus = config.exclusions.excludedSkus
        .filter(sku => !body.skus.includes(sku));
    }
    
    if (body.tags && Array.isArray(body.tags)) {
      config.exclusions.excludedTags = (config.exclusions.excludedTags || [])
        .filter(tag => !body.tags.includes(tag));
    }
    
    if (body.brands && Array.isArray(body.brands)) {
      config.exclusions.excludedBrands = (config.exclusions.excludedBrands || [])
        .filter(brand => !body.brands.includes(brand));
    }
    
    config.updatedAt = new Date().toISOString();
    config.updatedBy = body.updatedBy;
    
    await kv.set(StorageKeys.SITE_CATALOG_CONFIG(siteId), config);
    
    console.log(`[Site Catalog Config API] Removed exclusions for site: ${siteId}`);
    
    return c.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('[Site Catalog Config API] Error removing exclusions:', error);
    return c.json({
      success: false,
      error: `Failed to remove exclusions: ${error.message}`,
    }, 500);
  }
});

// ==================== POST /sites/:siteId/catalog-config/price-override - Set custom price for SKU ====================

app.post('/:siteId/catalog-config/price-override', async (c) => {
  try {
    const siteId = c.req.param('siteId');
    const body = await c.req.json();
    
    if (!body.sku || body.price === undefined) {
      return c.json({
        success: false,
        error: 'SKU and price are required',
      }, 400);
    }
    
    const config = await kv.get(StorageKeys.SITE_CATALOG_CONFIG(siteId));
    
    if (!config) {
      return c.json({
        success: false,
        error: 'No catalog configuration found for this site',
      }, 404);
    }
    
    if (!config.overrides) {
      config.overrides = {
        allowPriceOverride: true,
        customPricing: {},
      };
    }
    
    if (!config.overrides.customPricing) {
      config.overrides.customPricing = {};
    }
    
    config.overrides.customPricing[body.sku] = body.price;
    config.updatedAt = new Date().toISOString();
    config.updatedBy = body.updatedBy;
    
    await kv.set(StorageKeys.SITE_CATALOG_CONFIG(siteId), config);
    
    console.log(`[Site Catalog Config API] Set price override for ${body.sku} in site: ${siteId}`);
    
    return c.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('[Site Catalog Config API] Error setting price override:', error);
    return c.json({
      success: false,
      error: `Failed to set price override: ${error.message}`,
    }, 500);
  }
});

export default app;