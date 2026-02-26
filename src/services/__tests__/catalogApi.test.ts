import { describe, it, expect } from 'vitest';
import {
  fetchCatalogs,
  fetchCatalogById,
  createCatalog,
  updateCatalog,
  deleteCatalog,
  fetchSiteCatalogConfig,
  createOrUpdateSiteCatalogConfig,
} from '../catalogApi';

describe('Catalog API Service', () => {
  describe('fetchCatalogs', () => {
    it('should fetch all catalogs successfully', async () => {
      const catalogs = await fetchCatalogs();

      expect(Array.isArray(catalogs)).toBe(true);
      expect(catalogs.length).toBeGreaterThan(0);
      expect(catalogs[0]).toHaveProperty('id');
      expect(catalogs[0]).toHaveProperty('name');
      expect(catalogs[0]).toHaveProperty('type');
    });

    it('should filter catalogs by status', async () => {
      const activeCatalogs = await fetchCatalogs({ status: 'active' });

      expect(activeCatalogs.every((c) => c.status === 'active')).toBe(true);
    });

    it('should filter catalogs by type', async () => {
      const erpCatalogs = await fetchCatalogs({ type: 'erp' });

      expect(erpCatalogs.every((c) => c.type === 'erp')).toBe(true);
    });

    it('should search catalogs by name', async () => {
      const results = await fetchCatalogs({ search: 'SAP' });

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((c) => c.name.toLowerCase().includes('sap'))
      ).toBe(true);
    });

    it('should apply multiple filters', async () => {
      const results = await fetchCatalogs({
        status: 'active',
        type: 'erp',
      });

      expect(
        results.every((c) => c.status === 'active' && c.type === 'erp')
      ).toBe(true);
    });

    it('should return empty array when no results match', async () => {
      const results = await fetchCatalogs({ search: 'xyz-nonexistent-123' });

      expect(results).toEqual([]);
    });
  });

  describe('fetchCatalogById', () => {
    it('should fetch specific catalog by ID', async () => {
      const catalog = await fetchCatalogById('cat-test-001');

      expect(catalog).toBeDefined();
      expect(catalog.id).toBe('cat-test-001');
      expect(catalog.name).toBe('SAP Main Catalog');
    });

    it('should throw error for non-existent catalog', async () => {
      await expect(fetchCatalogById('invalid-id')).rejects.toThrow(
        'Catalog not found'
      );
    });
  });

  describe('createCatalog', () => {
    it('should create new catalog successfully', async () => {
      const newCatalogData = {
        name: 'New Test Catalog',
        description: 'Test description',
        type: 'erp' as const,
        status: 'active' as const,
        source: { type: "api" as const,
          sourceSystem: 'TestERP',
          sourceId: 'TEST-001',
          apiEndpoint: 'https://api.test.com',
          authMethod: 'oauth' as const,
        },
        settings: {
          autoSync: true,
          syncFrequency: 'daily' as const,
          syncTime: '02:00',
        },
      };

      const result = await createCatalog(newCatalogData as any);

      expect(result).toBeDefined();
      expect(result.catalog.id).toBeDefined();
      expect(result.catalog.name).toBe('New Test Catalog');
      expect(result.catalog.type).toBe('erp');
      expect(result.catalog.totalProducts).toBe(0);
    });

    it('should throw error when name is missing', async () => {
      const invalidData = {
        type: 'erp' as const,
        status: 'active' as const,
      };

      await expect(createCatalog(invalidData as any)).rejects.toThrow(
        'Name is required'
      );
    });

    it('should throw error when type is missing', async () => {
      const invalidData = {
        name: 'Test Catalog',
        status: 'active' as const,
      };

      await expect(createCatalog(invalidData as any)).rejects.toThrow(
        'Type is required'
      );
    });
  });

  describe('updateCatalog', () => {
    it('should update catalog successfully', async () => {
      const updates = {
        name: 'Updated Catalog Name',
        description: 'Updated description',
      };

      const result = await updateCatalog('cat-test-001', updates);

      expect(result).toBeDefined();
      expect(result.catalog.id).toBe('cat-test-001');
      expect(result.catalog.name).toBe('Updated Catalog Name');
      expect(result.catalog.description).toBe('Updated description');
    });

    it('should throw error for non-existent catalog', async () => {
      await expect(
        updateCatalog('invalid-id', { name: 'Test' })
      ).rejects.toThrow('Catalog not found');
    });
  });

  describe('deleteCatalog', () => {
    it('should delete catalog successfully', async () => {
      const result = await deleteCatalog('cat-test-001');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should throw error for non-existent catalog', async () => {
      await expect(deleteCatalog('invalid-id')).rejects.toThrow(
        'Catalog not found'
      );
    });
  });

  describe('fetchSiteCatalogConfig', () => {
    it('should fetch site catalog config successfully', async () => {
      const config = await fetchSiteCatalogConfig('site-test-001');

      expect(config).toBeDefined();
      expect(Array.isArray(config)).toBe(true);
      expect(config.length).toBeGreaterThan(0);
      expect(config[0].siteId).toBe('site-test-001');
      expect(config[0].catalogId).toBe('cat-test-001');
    });

    it('should throw error for site without config', async () => {
      await expect(fetchSiteCatalogConfig('site-nonexistent')).rejects.toThrow(
        'Site catalog config not found'
      );
    });
  });

  describe('createOrUpdateSiteCatalogConfig', () => {
    it('should create new site config successfully', async () => {
      const configData = {
        siteId: 'site-test-new',
        catalogId: 'cat-test-001',
        isDefault: true,
        priority: 1,
        exclusions: {
          excludedCategories: ['Electronics'],
          excludedSkus: ['SKU-001'],
          excludedTags: [] as string[],
          excludedBrands: [] as string[],
        },
        overrides: {
          allowPriceOverride: true,
          priceAdjustment: 10,
        },
        availability: {
          hideOutOfStock: true,
          hideDiscontinued: true,
        },
      };

      const result = await createOrUpdateSiteCatalogConfig(
        'site-test-new',
        configData
      );

      expect(result).toBeDefined();
      expect(result.config.siteId).toBe('site-test-new');
      expect(result.config.catalogId).toBe('cat-test-001');
      expect(result.config.exclusions?.excludedCategories).toContain('Electronics');
    });

    it('should throw error when catalogId is missing', async () => {
      const invalidData = {
        exclusions: {},
        overrides: {},
        availability: {},
      };

      await expect(
        createOrUpdateSiteCatalogConfig('site-test-001', invalidData as any)
      ).rejects.toThrow('Catalog ID is required');
    });

    it('should handle exclusions correctly', async () => {
      const configData = {
        siteId: 'site-test-001',
        catalogId: 'cat-test-001',
        isDefault: false,
        priority: 2,
        exclusions: {
          excludedCategories: ['Cat1', 'Cat2'],
          excludedSkus: ['SKU-001', 'SKU-002', 'SKU-003'],
          excludedTags: ['tag1'],
          excludedBrands: ['Brand1', 'Brand2'],
        },
      };

      const result = await createOrUpdateSiteCatalogConfig(
        'site-test-001',
        configData
      );

      expect(result.config.exclusions?.excludedCategories).toHaveLength(2);
      expect(result.config.exclusions?.excludedSkus).toHaveLength(3);
      expect(result.config.exclusions?.excludedTags).toHaveLength(1);
      expect(result.config.exclusions?.excludedBrands).toHaveLength(2);
    });

    it('should handle price adjustments correctly', async () => {
      const configData = {
        siteId: 'site-test-001',
        catalogId: 'cat-test-001',
        isDefault: false,
        priority: 2,
        overrides: {
          allowPriceOverride: true,
          priceAdjustment: 15.5,
        },
      };

      const result = await createOrUpdateSiteCatalogConfig(
        'site-test-001',
        configData
      );

      expect(result.config.overrides?.allowPriceOverride).toBe(true);
      expect(result.config.overrides?.priceAdjustment).toBe(15.5);
    });

    it('should handle negative price adjustments', async () => {
      const configData = {
        siteId: 'site-test-001',
        catalogId: 'cat-test-001',
        isDefault: false,
        priority: 2,
        overrides: {
          allowPriceOverride: true,
          priceAdjustment: -10,
        },
      };

      const result = await createOrUpdateSiteCatalogConfig(
        'site-test-001',
        configData
      );

      expect(result.config.overrides?.priceAdjustment).toBe(-10);
    });
  });
});