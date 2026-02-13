import type { Catalog, SiteCatalogConfig } from '../../app/types/catalog';

/**
 * Test Catalogs
 */
export const mockCatalogs: Catalog[] = [
  {
    id: 'cat-test-001',
    name: 'SAP Main Catalog',
    description: 'Primary ERP catalog for testing',
    type: 'erp',
    status: 'active',
    source: {
      type: 'api',
      sourceSystem: 'SAP',
      sourceId: 'SAP-PROD-001',
      apiConfig: {
        endpoint: 'https://api.sap.test.com',
        authType: 'oauth',
        credentials: { token: 'encrypted-token' },
        syncEndpoint: 'https://api.sap.test.com/sync',
        retryAttempts: 3,
        timeout: 30000,
      },
    },
    settings: {
      autoSync: true,
      syncFrequency: 'daily',
      defaultCurrency: 'USD',
      allowSiteOverrides: true,
      trackInventory: true,
    },
    totalProducts: 1500,
    activeProducts: 1450,
    lastSyncedAt: '2026-02-11T02:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-02-11T02:00:00Z',
  },
  {
    id: 'cat-test-002',
    name: 'Vendor Catalog',
    description: 'External vendor products',
    type: 'vendor',
    status: 'active',
    source: {
      type: 'api',
      sourceSystem: 'VendorAPI',
      sourceId: 'VENDOR-001',
      apiConfig: {
        endpoint: 'https://api.vendor.test.com',
        authType: 'api_key',
        credentials: { apiKey: 'encrypted-key' },
        syncEndpoint: 'https://api.vendor.test.com/sync',
      },
    },
    settings: {
      autoSync: true,
      syncFrequency: 'weekly',
      defaultCurrency: 'USD',
      allowSiteOverrides: true,
      trackInventory: true,
    },
    totalProducts: 500,
    activeProducts: 480,
    lastSyncedAt: '2026-02-10T03:00:00Z',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-02-10T03:00:00Z',
  },
  {
    id: 'cat-test-003',
    name: 'Manual Curated Catalog',
    description: 'Manually curated premium products',
    type: 'manual',
    status: 'active',
    source: {
      type: 'manual',
      sourceSystem: 'Manual',
      sourceId: 'MANUAL-001',
    },
    settings: {
      autoSync: false,
      defaultCurrency: 'USD',
      allowSiteOverrides: true,
      trackInventory: false,
    },
    totalProducts: 250,
    activeProducts: 245,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-02-08T00:00:00Z',
  },
  {
    id: 'cat-test-004',
    name: 'Dropship Catalog',
    description: 'Direct ship products',
    type: 'dropship',
    status: 'active',
    source: {
      type: 'api',
      sourceSystem: 'DropShipAPI',
      sourceId: 'DS-001',
      apiConfig: {
        endpoint: 'https://api.dropship.test.com',
        authType: 'basic',
        credentials: { username: 'test', password: 'encrypted-pass' },
        syncEndpoint: 'https://api.dropship.test.com/sync',
      },
    },
    settings: {
      autoSync: true,
      syncFrequency: 'hourly',
      defaultCurrency: 'USD',
      allowSiteOverrides: false,
      trackInventory: true,
    },
    totalProducts: 800,
    activeProducts: 780,
    lastSyncedAt: '2026-02-11T10:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-11T10:00:00Z',
  },
  {
    id: 'cat-test-005',
    name: 'Inactive Catalog',
    description: 'Deactivated catalog for testing',
    type: 'erp',
    status: 'inactive',
    source: {
      type: 'manual',
      sourceSystem: 'OldERP',
      sourceId: 'OLD-001',
    },
    settings: {
      autoSync: false,
      defaultCurrency: 'USD',
      allowSiteOverrides: true,
      trackInventory: false,
    },
    totalProducts: 100,
    activeProducts: 0,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
];

/**
 * Test Site Catalog Configurations
 */
export const mockSiteConfigs: SiteCatalogConfig[] = [
  {
    siteId: 'site-test-001',
    catalogId: 'cat-test-001',
    isDefault: true,
    priority: 1,
    exclusions: {
      excludedCategories: ['Electronics', 'Jewelry'],
      excludedSkus: ['SKU-001', 'SKU-002', 'SKU-003'],
      excludedTags: ['seasonal', 'clearance'],
      excludedBrands: ['BrandX', 'BrandY'],
    },
    overrides: {
      allowPriceOverride: true,
      priceAdjustment: 15,
      customPricing: {
        'SKU-100': 99.99,
        'SKU-200': 149.99,
      },
    },
    availability: {
      hideOutOfStock: true,
      hideDiscontinued: true,
      minimumInventory: 5,
    },
    updatedAt: '2026-02-11T00:00:00Z',
    updatedBy: 'admin-001',
  },
  {
    siteId: 'site-test-002',
    catalogId: 'cat-test-002',
    isDefault: false,
    priority: 2,
    exclusions: {
      excludedCategories: [],
      excludedSkus: [],
      excludedTags: [],
      excludedBrands: [],
    },
    overrides: {
      allowPriceOverride: false,
    },
    availability: {
      hideOutOfStock: false,
      hideDiscontinued: true,
    },
    updatedAt: '2026-02-05T00:00:00Z',
    updatedBy: 'admin-002',
  },
  {
    siteId: 'site-test-003',
    catalogId: 'cat-test-003',
    isDefault: true,
    priority: 1,
    exclusions: {
      excludedCategories: ['Budget Items'],
      excludedSkus: [],
      excludedTags: ['premium'],
      excludedBrands: [],
    },
    overrides: {
      allowPriceOverride: true,
      priceAdjustment: -10,
    },
    availability: {
      hideOutOfStock: true,
      hideDiscontinued: true,
      onlyShowFeatured: true,
    },
    updatedAt: '2026-02-10T00:00:00Z',
    updatedBy: 'admin-002',
  },
];

/**
 * Test Sites
 */
export const mockSites = [
  {
    id: 'site-test-001',
    name: 'Enterprise Client A',
    clientId: 'client-001',
    status: 'active',
  },
  {
    id: 'site-test-002',
    name: 'SMB Client B',
    clientId: 'client-002',
    status: 'active',
  },
  {
    id: 'site-test-003',
    name: 'Premium Client C',
    clientId: 'client-003',
    status: 'active',
  },
  {
    id: 'site-test-004',
    name: 'Unconfigured Site',
    clientId: 'client-004',
    status: 'active',
  },
];

/**
 * Helper function to get catalog by ID
 */
export function getCatalogById(id: string): Catalog | undefined {
  return mockCatalogs.find((catalog) => catalog.id === id);
}

/**
 * Helper function to get site config by site ID
 */
export function getSiteConfigBySiteId(siteId: string): SiteCatalogConfig | undefined {
  return mockSiteConfigs.find((config) => config.siteId === siteId);
}

/**
 * Helper function to filter catalogs
 */
export function filterCatalogs(filters: {
  status?: string;
  type?: string;
  search?: string;
}): Catalog[] {
  let filtered = [...mockCatalogs];

  if (filters.status) {
    filtered = filtered.filter((c) => c.status === filters.status);
  }

  if (filters.type) {
    filtered = filtered.filter((c) => c.type === filters.type);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * Migration status mock data
 */
export const mockMigrationStatus = {
  notStarted: {
    migrated: false,
    statistics: {
      totalCatalogs: 4,
      totalProducts: 3050,
      productsNeedingMigration: 3050,
      sitesNeedingConfig: 15,
    },
  },
  completed: {
    migrated: true,
    migratedAt: '2026-02-11T10:00:00Z',
    migratedBy: 'admin-001',
    statistics: {
      totalCatalogs: 4,
      totalProducts: 3050,
      productsNeedingMigration: 0,
      sitesNeedingConfig: 2,
    },
  },
};

/**
 * Migration run result
 */
export const mockMigrationResult = {
  success: true,
  message: 'Migration completed successfully',
  results: {
    productsProcessed: 3050,
    productsMigrated: 3050,
    productsSkipped: 0,
    errors: [] as string[],
  },
  duration: 5234,
};