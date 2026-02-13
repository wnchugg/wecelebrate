import { describe, it, expect } from 'vitest';
import type {
  Catalog,
  CatalogType,
  CatalogStatus,
  SiteCatalogConfig,
} from '../../types/catalog';

describe('Catalog Type Definitions', () => {
  describe('CatalogType', () => {
    it('should accept valid catalog types', () => {
      const types: CatalogType[] = ['erp', 'vendor', 'manual', 'dropship'];
      expect(types).toHaveLength(4);
      expect(types).toContain('erp');
      expect(types).toContain('vendor');
      expect(types).toContain('manual');
      expect(types).toContain('dropship');
    });
  });

  describe('CatalogStatus', () => {
    it('should accept valid catalog statuses', () => {
      const statuses: CatalogStatus[] = ['active', 'inactive', 'pending', 'archived'];
      expect(statuses).toHaveLength(4);
      expect(statuses).toContain('active');
      expect(statuses).toContain('inactive');
      expect(statuses).toContain('pending');
    });
  });

  describe('Catalog', () => {
    it('should accept valid Catalog object with all required fields', () => {
      const catalog: Catalog = {
        id: 'cat-001',
        name: 'Test Catalog',
        description: 'Test description',
        type: 'erp',
        status: 'active',
        source: {
          sourceSystem: 'SAP',
          connectionId: 'conn-001',
          apiEndpoint: 'https://api.test.com',
          authMethod: 'oauth',
        },
        totalProducts: 100,
        activeProducts: 95,
        lastSyncedAt: '2026-02-10T00:00:00Z',
        lastSyncStatus: 'success',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-02-11T00:00:00Z',
      };

      expect(catalog.id).toBe('cat-001');
      expect(catalog.name).toBe('Test Catalog');
      expect(catalog.type).toBe('erp');
      expect(catalog.status).toBe('active');
      expect(catalog.totalProducts).toBe(100);
      expect(catalog.activeProducts).toBe(95);
    });

    it('should accept Catalog with optional fields', () => {
      const catalog: Catalog = {
        id: 'cat-002',
        name: 'Minimal Catalog',
        type: 'manual',
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        // Optional fields not provided
      };

      expect(catalog.id).toBe('cat-002');
      expect(catalog.description).toBeUndefined();
      expect(catalog.lastSyncedAt).toBeUndefined();
    });

    it('should handle different auth methods', () => {
      const oauthCatalog: Catalog = {
        id: 'cat-003',
        name: 'OAuth Catalog',
        type: 'erp',
        status: 'active',
        source: {
          sourceSystem: 'SAP',
          connectionId: 'conn-002',
          authMethod: 'oauth',
        },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const apiKeyCatalog: Catalog = {
        id: 'cat-004',
        name: 'API Key Catalog',
        type: 'vendor',
        status: 'active',
        source: {
          sourceSystem: 'VendorAPI',
          vendorId: 'vendor-001',
          authMethod: 'api-key',
        },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      expect(oauthCatalog.source?.authMethod).toBe('oauth');
      expect(apiKeyCatalog.source?.authMethod).toBe('api-key');
    });
  });

  describe('SiteCatalogConfig', () => {
    it('should accept valid SiteCatalogConfig with all fields', () => {
      const config: SiteCatalogConfig = {
        id: 'config-001',
        siteId: 'site-001',
        catalogId: 'cat-001',
        isDefault: true,
        priority: 1,
        exclusions: {
          excludedCategories: ['Electronics', 'Jewelry'],
          excludedSkus: ['SKU-001', 'SKU-002'],
          excludedTags: ['seasonal'],
          excludedBrands: ['BrandX'],
        },
        overrides: {
          allowPriceOverride: true,
          priceAdjustment: 15,
          customPricing: {
            'SKU-001': 99.99,
          },
        },
        availability: {
          hideOutOfStock: true,
          hideDiscontinued: true,
          minimumInventory: 5,
        },
        updatedAt: '2026-02-11T00:00:00Z',
        updatedBy: 'admin-001',
      };

      expect(config.siteId).toBe('site-001');
      expect(config.catalogId).toBe('cat-001');
      expect(config.isDefault).toBe(true);
      expect(config.priority).toBe(1);
      expect(config.exclusions?.excludedCategories).toHaveLength(2);
      expect(config.overrides?.priceAdjustment).toBe(15);
      expect(config.availability?.hideOutOfStock).toBe(true);
    });

    it('should accept minimal SiteCatalogConfig', () => {
      const config: SiteCatalogConfig = {
        siteId: 'site-002',
        catalogId: 'cat-002',
        isDefault: false,
        priority: 2,
      };

      expect(config.siteId).toBe('site-002');
      expect(config.isDefault).toBe(false);
      expect(config.priority).toBe(2);
    });

    it('should handle price adjustments correctly', () => {
      const positiveAdjustment: SiteCatalogConfig = {
        id: 'config-003',
        siteId: 'site-003',
        catalogId: 'cat-003',
        isDefault: false,
        priority: 3,
        overrides: {
          allowPriceOverride: true,
          priceAdjustment: 20, // 20% increase
        },
      };

      const negativeAdjustment: SiteCatalogConfig = {
        id: 'config-004',
        siteId: 'site-004',
        catalogId: 'cat-004',
        isDefault: false,
        priority: 4,
        overrides: {
          allowPriceOverride: true,
          priceAdjustment: -10, // 10% decrease
        },
      };

      expect(positiveAdjustment.overrides?.priceAdjustment).toBe(20);
      expect(negativeAdjustment.overrides?.priceAdjustment).toBe(-10);
    });
  });
});