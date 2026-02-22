import { http, HttpResponse } from 'msw';
import {
  filterCatalogs,
  getCatalogById,
  getSiteConfigBySiteId,
  mockMigrationStatus,
  mockMigrationResult,
} from '../mockData/catalogData';

const API_BASE = 'http://localhost:54321/functions/v1/make-server-6fcaeea3';

export const handlers = [
  // ============================================
  // Catalog Endpoints
  // ============================================

  // GET /catalogs - List all catalogs with filters
  http.get(`${API_BASE}/catalogs`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || undefined;
    const type = url.searchParams.get('type') || undefined;
    const search = url.searchParams.get('search') || undefined;

    const filtered = filterCatalogs({ status, type, search });

    return HttpResponse.json({ catalogs: filtered });
  }),

  // GET /catalogs/:id - Get specific catalog
  http.get(`${API_BASE}/catalogs/:catalogId`, ({ params }) => {
    const { catalogId } = params;
    const catalog = getCatalogById(catalogId as string);

    if (!catalog) {
      return HttpResponse.json(
        { error: 'Catalog not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ catalog });
  }),

  // POST /catalogs - Create new catalog
  http.post(`${API_BASE}/catalogs`, async ({ request }) => {
    const body = await request.json() as any;
    
    const newCatalog = {
      id: `cat-new-${Date.now()}`,
      ...(body || {}),
      totalProducts: 0,
      activeProducts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin-test',
    };

    // Simulate validation
    if (!body?.name) {
      return HttpResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!body?.type) {
      return HttpResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      { catalog: newCatalog },
      { status: 201 }
    );
  }),

  // PUT /catalogs/:id - Update catalog
  http.put(`${API_BASE}/catalogs/:catalogId`, async ({ params, request }) => {
    const { catalogId } = params;
    const body = await request.json() as any;
    const catalog = getCatalogById(catalogId as string);

    if (!catalog) {
      return HttpResponse.json(
        { error: 'Catalog not found' },
        { status: 404 }
      );
    }

    const updated = {
      ...catalog,
      ...(body || {}),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ catalog: updated });
  }),

  // DELETE /catalogs/:id - Delete catalog (soft delete)
  http.delete(`${API_BASE}/catalogs/:catalogId`, ({ params }) => {
    const { catalogId } = params;
    const catalog = getCatalogById(catalogId as string);

    if (!catalog) {
      return HttpResponse.json(
        { error: 'Catalog not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Catalog deleted successfully',
    });
  }),

  // GET /catalogs/:id/stats - Get catalog statistics
  http.get(`${API_BASE}/catalogs/:catalogId/stats`, ({ params }) => {
    const { catalogId } = params;
    const catalog = getCatalogById(catalogId as string);

    if (!catalog) {
      return HttpResponse.json(
        { error: 'Catalog not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      stats: {
        catalogId: catalog.id,
        totalProducts: catalog.totalProducts,
        activeProducts: catalog.activeProducts,
        inactiveProducts: catalog.totalProducts - catalog.activeProducts,
        categoriesCount: 25,
        brandsCount: 50,
        averagePrice: 125.50,
        priceRange: {
          min: 5.00,
          max: 999.99,
        },
        lastSyncedAt: catalog.lastSyncedAt,
        syncStatus: catalog.lastSyncStatus || 'never',
      },
    });
  }),

  // ============================================
  // Site Catalog Configuration Endpoints
  // ============================================

  // GET /sites/:siteId/catalog-config - Get site config
  http.get(`${API_BASE}/sites/:siteId/catalog-config`, ({ params }) => {
    const { siteId } = params;
    const config = getSiteConfigBySiteId(siteId as string);

    if (!config) {
      return HttpResponse.json(
        { error: 'No catalog configuration found for this site' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ config });
  }),

  // POST /sites/:siteId/catalog-config - Create/update site config
  http.post(`${API_BASE}/sites/:siteId/catalog-config`, async ({ params, request }) => {
    const { siteId } = params;
    const body = await request.json() as any;

    // Validation
    if (!body?.catalogId) {
      return HttpResponse.json(
        { error: 'Catalog ID is required' },
        { status: 400 }
      );
    }

    const config = {
      id: `config-new-${Date.now()}`,
      siteId: siteId as string,
      ...(body || {}),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin-test',
    };

    return HttpResponse.json(
      { config },
      { status: 201 }
    );
  }),

  // PUT /sites/:siteId/catalog-config - Update site config
  http.put(`${API_BASE}/sites/:siteId/catalog-config`, async ({ params, request }) => {
    const { siteId } = params;
    const body = await request.json() as any;
    const existingConfig = getSiteConfigBySiteId(siteId as string);

    if (!existingConfig) {
      return HttpResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    const updated = {
      ...existingConfig,
      ...(body || {}),
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin-test',
    };

    return HttpResponse.json({ config: updated });
  }),

  // DELETE /sites/:siteId/catalog-config - Delete site config
  http.delete(`${API_BASE}/sites/:siteId/catalog-config`, ({ params }) => {
    const { siteId } = params;
    const config = getSiteConfigBySiteId(siteId as string);

    if (!config) {
      return HttpResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Configuration deleted successfully',
    });
  }),

  // POST /sites/:siteId/catalog-config/exclusions - Add exclusions
  http.post(`${API_BASE}/sites/:siteId/catalog-config/exclusions`, async ({ params, request }) => {
    const { siteId } = params;
    const body = await request.json() as any;
    const config = getSiteConfigBySiteId(siteId as string);

    if (!config) {
      return HttpResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // Merge new exclusions with existing
    const updated = {
      ...config,
      exclusions: {
        excludedCategories: [
          ...(config.exclusions.excludedCategories || []),
          ...(body?.excludedCategories || []),
        ],
        excludedSkus: [
          ...(config.exclusions.excludedSkus || []),
          ...(body?.excludedSkus || []),
        ],
        excludedTags: [
          ...(config.exclusions.excludedTags || []),
          ...(body?.excludedTags || []),
        ],
        excludedBrands: [
          ...(config.exclusions.excludedBrands || []),
          ...(body?.excludedBrands || []),
        ],
      },
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ config: updated });
  }),

  // DELETE /sites/:siteId/catalog-config/exclusions - Remove exclusions
  http.delete(`${API_BASE}/sites/:siteId/catalog-config/exclusions`, async ({ params, request }) => {
    const { siteId } = params;
    const body = await request.json() as any;
    const config = getSiteConfigBySiteId(siteId as string);

    if (!config) {
      return HttpResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // Remove specified exclusions
    const updated = {
      ...config,
      exclusions: {
        excludedCategories: (config.exclusions.excludedCategories || []).filter(
          (c) => !(body?.excludedCategories || []).includes(c)
        ),
        excludedSkus: (config.exclusions.excludedSkus || []).filter(
          (s) => !(body?.excludedSkus || []).includes(s)
        ),
        excludedTags: (config.exclusions.excludedTags || []).filter(
          (t) => !(body?.excludedTags || []).includes(t)
        ),
        excludedBrands: (config.exclusions.excludedBrands || []).filter(
          (b) => !(body?.excludedBrands || []).includes(b)
        ),
      },
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ config: updated });
  }),

  // PUT /sites/:siteId/catalog-config/price/:sku - Set price override
  http.put(`${API_BASE}/sites/:siteId/catalog-config/price/:sku`, async ({ params, request }) => {
    const { siteId, sku } = params;
    const body = await request.json() as any;
    const config = getSiteConfigBySiteId(siteId as string);

    if (!config) {
      return HttpResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    const updated = {
      ...config,
      overrides: {
        ...config.overrides,
        customPricing: {
          ...(config.overrides?.customPricing || {}),
          [sku as string]: body.price,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ config: updated });
  }),

  // ============================================
  // Migration Endpoints
  // ============================================

  // GET /migration/status - Get migration status
  http.get(`${API_BASE}/migration/status`, () => {
    // By default, return not started status
    return HttpResponse.json(mockMigrationStatus.notStarted);
  }),

  // POST /migration/run - Run migration
  http.post(`${API_BASE}/migration/run`, async ({ request }) => {
    const body = await request.json() as any;

    if (!body?.defaultCatalogId) {
      return HttpResponse.json(
        { error: 'Default catalog ID is required' },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return HttpResponse.json(mockMigrationResult);
  }),

  // POST /migration/rollback - Rollback migration (dev only)
  http.post(`${API_BASE}/migration/rollback`, () => {
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) {
      return HttpResponse.json(
        { error: 'Rollback not allowed in production' },
        { status: 403 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Migration rolled back successfully',
      results: {
        productsProcessed: 3050,
        sourcesRemoved: 3050,
      },
    });
  }),

  // ============================================
  // Error Simulation Handlers (for testing)
  // ============================================

  // Simulate network error
  http.get(`${API_BASE}/test/network-error`, () => {
    return HttpResponse.error();
  }),

  // Simulate server error
  http.get(`${API_BASE}/test/server-error`, () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),

  // Simulate timeout
  http.get(`${API_BASE}/test/timeout`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    return HttpResponse.json({ data: 'This should timeout' });
  }),
];