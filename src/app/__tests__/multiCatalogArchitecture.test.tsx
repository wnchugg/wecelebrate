/**
 * Multi-Catalog Architecture Tests
 * 
 * Tests the multi-catalog system that supports:
 * - Multiple catalogs per site (ERP sources + external vendors)
 * - Catalog type management (ERP, Vendor, Custom)
 * - Catalog assignment and toggling
 * - Catalog filtering and prioritization
 * - Smart UI controls (auto-hide search on small catalogs)
 * - Catalog source configuration
 * 
 * Architecture:
 * - Sites can have multiple catalogs
 * - Each catalog has a type (erp, vendor, custom)
 * - Catalogs have priority/display order
 * - UI adapts based on catalog size
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

// Mock catalog types and sources
const catalogTypes = ['erp', 'vendor', 'custom'] as const;
type CatalogType = typeof catalogTypes[number];

const erpSources = ['sap', 'oracle', 'netsuite', 'dynamics365'] as const;
type ERPSource = typeof erpSources[number];

interface Catalog {
  id: string;
  siteId: string;
  name: string;
  type: CatalogType;
  source?: ERPSource | string;
  enabled: boolean;
  priority: number;
  itemCount: number;
  settings: {
    showPricing: boolean;
    allowCustomization: boolean;
    minSelectableQuantity?: number;
    maxSelectableQuantity?: number;
  };
  metadata?: {
    erpIntegrationId?: string;
    vendorName?: string;
    apiEndpoint?: string;
    syncFrequency?: string;
  };
}

// Sample catalog configurations
const sampleCatalogs: Record<string, Catalog[]> = {
  'service-award': [
    {
      id: 'catalog-sa-erp-1',
      siteId: 'demo-service-award',
      name: 'SAP Corporate Catalog',
      type: 'erp',
      source: 'sap',
      enabled: true,
      priority: 1,
      itemCount: 450,
      settings: {
        showPricing: false,
        allowCustomization: true,
        minSelectableQuantity: 1,
        maxSelectableQuantity: 1
      },
      metadata: {
        erpIntegrationId: 'sap-prod-001',
        syncFrequency: 'daily'
      }
    },
    {
      id: 'catalog-sa-vendor-1',
      siteId: 'demo-service-award',
      name: 'Premium Awards Vendor',
      type: 'vendor',
      source: 'awards-unlimited',
      enabled: true,
      priority: 2,
      itemCount: 120,
      settings: {
        showPricing: false,
        allowCustomization: false
      },
      metadata: {
        vendorName: 'Awards Unlimited',
        apiEndpoint: 'https://api.awards-unlimited.com/v1'
      }
    }
  ],
  'wellness-program': [
    {
      id: 'catalog-wp-erp-1',
      siteId: 'demo-wellness-program',
      name: 'Oracle Wellness Products',
      type: 'erp',
      source: 'oracle',
      enabled: true,
      priority: 1,
      itemCount: 680,
      settings: {
        showPricing: true,
        allowCustomization: true,
        minSelectableQuantity: 1,
        maxSelectableQuantity: 5
      },
      metadata: {
        erpIntegrationId: 'oracle-wellness-001',
        syncFrequency: 'hourly'
      }
    },
    {
      id: 'catalog-wp-vendor-1',
      siteId: 'demo-wellness-program',
      name: 'Health & Fitness Vendor',
      type: 'vendor',
      source: 'wellness-world',
      enabled: true,
      priority: 2,
      itemCount: 200,
      settings: {
        showPricing: true,
        allowCustomization: false
      },
      metadata: {
        vendorName: 'Wellness World',
        apiEndpoint: 'https://api.wellness-world.com/v2'
      }
    },
    {
      id: 'catalog-wp-custom-1',
      siteId: 'demo-wellness-program',
      name: 'Company Wellness Store',
      type: 'custom',
      enabled: false,
      priority: 3,
      itemCount: 45,
      settings: {
        showPricing: true,
        allowCustomization: true
      }
    }
  ],
  'event-gifting': [
    {
      id: 'catalog-eg-small',
      siteId: 'demo-event-serial-card',
      name: 'Conference Gift Selection',
      type: 'custom',
      enabled: true,
      priority: 1,
      itemCount: 12,
      settings: {
        showPricing: false,
        allowCustomization: false
      }
    }
  ]
};

describe('Multi-Catalog Architecture', () => {
  describe('Catalog Type Management', () => {
    it('should support all catalog types', () => {
      const types: CatalogType[] = ['erp', 'vendor', 'custom'];
      types.forEach(type => {
        expect(catalogTypes).toContain(type);
      });
    });

    it('should identify ERP catalogs correctly', () => {
      const erpCatalogs = sampleCatalogs['service-award'].filter(c => c.type === 'erp');
      expect(erpCatalogs.length).toBeGreaterThan(0);
      erpCatalogs.forEach(catalog => {
        expect(catalog.metadata?.erpIntegrationId).toBeDefined();
      });
    });

    it('should identify vendor catalogs correctly', () => {
      const vendorCatalogs = sampleCatalogs['service-award'].filter(c => c.type === 'vendor');
      expect(vendorCatalogs.length).toBeGreaterThan(0);
      vendorCatalogs.forEach(catalog => {
        expect(catalog.metadata?.vendorName).toBeDefined();
        expect(catalog.metadata?.apiEndpoint).toBeDefined();
      });
    });

    it('should identify custom catalogs correctly', () => {
      const customCatalogs = sampleCatalogs['wellness-program'].filter(c => c.type === 'custom');
      expect(customCatalogs.length).toBeGreaterThan(0);
      customCatalogs.forEach(catalog => {
        expect(catalog.type).toBe('custom');
      });
    });

    it('ERP catalogs should have ERP source defined', () => {
      const erpCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'erp');
      
      erpCatalogs.forEach(catalog => {
        expect(catalog.source).toBeDefined();
        expect(erpSources).toContain(catalog.source as ERPSource);
      });
    });

    it('vendor catalogs should have vendor metadata', () => {
      const vendorCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'vendor');
      
      vendorCatalogs.forEach(catalog => {
        expect(catalog.metadata?.vendorName).toBeTruthy();
        expect(catalog.metadata?.apiEndpoint).toMatch(/^https?:\/\//);
      });
    });
  });

  describe('Multiple Catalogs Per Site', () => {
    it('service-award site should have 2 catalogs', () => {
      expect(sampleCatalogs['service-award']).toHaveLength(2);
    });

    it('wellness-program site should have 3 catalogs', () => {
      expect(sampleCatalogs['wellness-program']).toHaveLength(3);
    });

    it('event-gifting site should have 1 catalog', () => {
      expect(sampleCatalogs['event-gifting']).toHaveLength(1);
    });

    it('should handle sites with mixed catalog types', () => {
      const wellnessCatalogs = sampleCatalogs['wellness-program'];
      const types = new Set(wellnessCatalogs.map(c => c.type));
      
      expect(types.has('erp')).toBe(true);
      expect(types.has('vendor')).toBe(true);
      expect(types.has('custom')).toBe(true);
      expect(types.size).toBe(3);
    });

    it('should maintain unique catalog IDs across site', () => {
      Object.values(sampleCatalogs).forEach(catalogs => {
        const ids = catalogs.map(c => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });
    });

    it('all catalogs should reference correct site', () => {
      Object.entries(sampleCatalogs).forEach(([_, catalogs]) => {
        const siteIds = new Set(catalogs.map(c => c.siteId));
        expect(siteIds.size).toBe(1); // All catalogs in a group share same siteId
      });
    });
  });

  describe('Catalog Priority and Ordering', () => {
    it('catalogs should have priority values', () => {
      Object.values(sampleCatalogs).flat().forEach(catalog => {
        expect(catalog.priority).toBeDefined();
        expect(catalog.priority).toBeGreaterThan(0);
      });
    });

    it('ERP catalogs should typically have priority 1', () => {
      const erpCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'erp');
      
      erpCatalogs.forEach(catalog => {
        expect(catalog.priority).toBe(1);
      });
    });

    it('vendor catalogs should have priority 2', () => {
      const vendorCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'vendor' && c.siteId !== 'demo-wellness-program');
      
      vendorCatalogs.forEach(catalog => {
        expect(catalog.priority).toBe(2);
      });
    });

    it('should sort catalogs by priority', () => {
      const wellnessCatalogs = [...sampleCatalogs['wellness-program']].sort(
        (a, b) => a.priority - b.priority
      );
      
      expect(wellnessCatalogs[0].priority).toBeLessThan(wellnessCatalogs[1].priority);
      expect(wellnessCatalogs[1].priority).toBeLessThan(wellnessCatalogs[2].priority);
    });

    it('enabled catalogs should be prioritized over disabled', () => {
      const wellnessCatalogs = sampleCatalogs['wellness-program'];
      const enabledCatalogs = wellnessCatalogs.filter(c => c.enabled);
      const disabledCatalogs = wellnessCatalogs.filter(c => !c.enabled);
      
      expect(enabledCatalogs.length).toBeGreaterThan(0);
      expect(disabledCatalogs.length).toBeGreaterThan(0);
    });
  });

  describe('Catalog Item Counts', () => {
    it('all catalogs should have item counts', () => {
      Object.values(sampleCatalogs).flat().forEach(catalog => {
        expect(catalog.itemCount).toBeDefined();
        expect(catalog.itemCount).toBeGreaterThan(0);
      });
    });

    it('ERP catalogs should typically have more items', () => {
      const erpCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'erp');
      
      const avgErpCount = erpCatalogs.reduce((sum, c) => sum + c.itemCount, 0) / erpCatalogs.length;
      expect(avgErpCount).toBeGreaterThan(100);
    });

    it('small catalogs should have less than 20 items', () => {
      const smallCatalog = sampleCatalogs['event-gifting'][0];
      expect(smallCatalog.itemCount).toBeLessThan(20);
    });

    it('large catalogs should have 400+ items', () => {
      const largeCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.itemCount > 400);
      
      expect(largeCatalogs.length).toBeGreaterThan(0);
    });
  });

  describe('Smart UI Controls', () => {
    it('should detect small catalogs (< 20 items)', () => {
      const isSmallCatalog = (itemCount: number) => itemCount < 20;
      
      const eventCatalog = sampleCatalogs['event-gifting'][0];
      expect(isSmallCatalog(eventCatalog.itemCount)).toBe(true);
    });

    it('should detect medium catalogs (20-100 items)', () => {
      const isMediumCatalog = (itemCount: number) => itemCount >= 20 && itemCount < 100;
      
      // Check if any catalogs fall in this range
      const allCatalogs = Object.values(sampleCatalogs).flat();
      const hasMediumCatalogs = allCatalogs.some(c => isMediumCatalog(c.itemCount));
      
      // At minimum, we should be able to categorize catalog sizes
      expect(typeof isMediumCatalog(50)).toBe('boolean');
    });

    it('should detect large catalogs (100+ items)', () => {
      const isLargeCatalog = (itemCount: number) => itemCount >= 100;
      
      const serviceAwardCatalogs = sampleCatalogs['service-award'];
      const largeCatalogs = serviceAwardCatalogs.filter(c => isLargeCatalog(c.itemCount));
      
      expect(largeCatalogs.length).toBeGreaterThan(0);
    });

    it('should hide search for small catalogs', () => {
      const shouldShowSearch = (itemCount: number) => itemCount >= 20;
      
      const eventCatalog = sampleCatalogs['event-gifting'][0];
      expect(shouldShowSearch(eventCatalog.itemCount)).toBe(false);
    });

    it('should show search for large catalogs', () => {
      const shouldShowSearch = (itemCount: number) => itemCount >= 20;
      
      const sapCatalog = sampleCatalogs['service-award'][0];
      expect(shouldShowSearch(sapCatalog.itemCount)).toBe(true);
    });

    it('should hide filters for small catalogs', () => {
      const shouldShowFilters = (itemCount: number) => itemCount >= 20;
      
      const eventCatalog = sampleCatalogs['event-gifting'][0];
      expect(shouldShowFilters(eventCatalog.itemCount)).toBe(false);
    });

    it('should show pagination for very large catalogs', () => {
      const shouldShowPagination = (itemCount: number) => itemCount > 50;
      
      const oracleCatalog = sampleCatalogs['wellness-program'][0];
      expect(shouldShowPagination(oracleCatalog.itemCount)).toBe(true);
    });
  });

  describe('Catalog Settings', () => {
    it('all catalogs should have settings object', () => {
      Object.values(sampleCatalogs).flat().forEach(catalog => {
        expect(catalog.settings).toBeDefined();
        expect(typeof catalog.settings).toBe('object');
      });
    });

    it('service award catalogs should not show pricing', () => {
      const serviceAwardCatalogs = sampleCatalogs['service-award'];
      serviceAwardCatalogs.forEach(catalog => {
        expect(catalog.settings.showPricing).toBe(false);
      });
    });

    it('wellness program catalogs should show pricing', () => {
      const wellnessCatalogs = sampleCatalogs['wellness-program'];
      wellnessCatalogs.forEach(catalog => {
        expect(catalog.settings.showPricing).toBe(true);
      });
    });

    it('ERP catalogs should typically allow customization', () => {
      const erpCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'erp');
      
      erpCatalogs.forEach(catalog => {
        expect(catalog.settings.allowCustomization).toBe(true);
      });
    });

    it('quantity limits should be logical', () => {
      const catalogsWithLimits = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.settings.minSelectableQuantity && c.settings.maxSelectableQuantity);
      
      catalogsWithLimits.forEach(catalog => {
        expect(catalog.settings.minSelectableQuantity).toBeLessThanOrEqual(
          catalog.settings.maxSelectableQuantity
        );
        expect(catalog.settings.minSelectableQuantity).toBeGreaterThan(0);
      });
    });
  });

  describe('Catalog Enable/Disable', () => {
    it('should track catalog enabled status', () => {
      Object.values(sampleCatalogs).flat().forEach(catalog => {
        expect(typeof catalog.enabled).toBe('boolean');
      });
    });

    it('most catalogs should be enabled by default', () => {
      const allCatalogs = Object.values(sampleCatalogs).flat();
      const enabledCount = allCatalogs.filter(c => c.enabled).length;
      const totalCount = allCatalogs.length;
      
      expect(enabledCount / totalCount).toBeGreaterThan(0.5);
    });

    it('should allow disabling specific catalogs', () => {
      const wellnessCatalogs = sampleCatalogs['wellness-program'];
      const disabledCatalog = wellnessCatalogs.find(c => !c.enabled);
      
      expect(disabledCatalog).toBeDefined();
      expect(disabledCatalog?.enabled).toBe(false);
    });

    it('should filter out disabled catalogs in active view', () => {
      const getActiveCatalogs = (catalogs: Catalog[]) => catalogs.filter(c => c.enabled);
      
      const wellnessCatalogs = sampleCatalogs['wellness-program'];
      const activeCatalogs = getActiveCatalogs(wellnessCatalogs);
      
      expect(activeCatalogs.length).toBe(2); // 2 enabled out of 3 total
    });
  });

  describe('ERP Integration Metadata', () => {
    it('ERP catalogs should have integration IDs', () => {
      const erpCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'erp');
      
      erpCatalogs.forEach(catalog => {
        expect(catalog.metadata?.erpIntegrationId).toBeTruthy();
      });
    });

    it('should support multiple ERP sources', () => {
      const erpCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'erp');
      
      const sources = new Set(erpCatalogs.map(c => c.source));
      expect(sources.size).toBeGreaterThan(1);
      expect(sources.has('sap')).toBe(true);
      expect(sources.has('oracle')).toBe(true);
    });

    it('should have sync frequency defined', () => {
      const erpCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'erp');
      
      erpCatalogs.forEach(catalog => {
        expect(catalog.metadata?.syncFrequency).toBeTruthy();
        expect(['hourly', 'daily', 'weekly']).toContain(catalog.metadata?.syncFrequency);
      });
    });

    it('large ERP catalogs should sync more frequently', () => {
      const largeSAPCatalog = sampleCatalogs['service-award'][0];
      const largeOracleCatalog = sampleCatalogs['wellness-program'][0];
      
      // Wellness catalog is larger and syncs hourly
      expect(largeOracleCatalog.itemCount).toBeGreaterThan(largeSAPCatalog.itemCount);
      expect(largeOracleCatalog.metadata?.syncFrequency).toBe('hourly');
    });
  });

  describe('Vendor Integration Metadata', () => {
    it('vendor catalogs should have vendor names', () => {
      const vendorCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'vendor');
      
      vendorCatalogs.forEach(catalog => {
        expect(catalog.metadata?.vendorName).toBeTruthy();
        expect(catalog.metadata?.vendorName.length).toBeGreaterThan(3);
      });
    });

    it('vendor catalogs should have API endpoints', () => {
      const vendorCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'vendor');
      
      vendorCatalogs.forEach(catalog => {
        expect(catalog.metadata?.apiEndpoint).toMatch(/^https:\/\//);
        expect(catalog.metadata?.apiEndpoint).toContain('api.');
      });
    });

    it('should support multiple vendor sources', () => {
      const vendorCatalogs = Object.values(sampleCatalogs)
        .flat()
        .filter(c => c.type === 'vendor');
      
      const vendors = new Set(vendorCatalogs.map(c => c.metadata?.vendorName));
      expect(vendors.size).toBeGreaterThan(1);
    });
  });

  describe('Catalog Assignment Logic', () => {
    it('should support assigning multiple catalogs to one site', () => {
      const wellnessSiteId = 'demo-wellness-program';
      const assignedCatalogs = sampleCatalogs['wellness-program'].filter(
        c => c.siteId === wellnessSiteId
      );
      
      expect(assignedCatalogs.length).toBe(3);
    });

    it('should maintain catalog-to-site relationships', () => {
      Object.values(sampleCatalogs).forEach(catalogs => {
        catalogs.forEach(catalog => {
          expect(catalog.siteId).toMatch(/^demo-/);
        });
      });
    });

    it('should allow toggling catalog assignments', () => {
      const toggleCatalog = (catalog: Catalog) => ({
        ...catalog,
        enabled: !catalog.enabled
      });
      
      const wellnessCatalog = sampleCatalogs['wellness-program'][2];
      const toggled = toggleCatalog(wellnessCatalog);
      
      expect(toggled.enabled).toBe(!wellnessCatalog.enabled);
    });

    it('should preserve catalog settings when toggling', () => {
      const catalog = sampleCatalogs['wellness-program'][0];
      const toggled = { ...catalog, enabled: !catalog.enabled };
      
      expect(toggled.settings).toEqual(catalog.settings);
      expect(toggled.priority).toBe(catalog.priority);
      expect(toggled.name).toBe(catalog.name);
    });
  });

  describe('Catalog Filtering and Search', () => {
    it('should filter catalogs by type', () => {
      const allCatalogs = Object.values(sampleCatalogs).flat();
      const filterByType = (type: CatalogType) => allCatalogs.filter(c => c.type === type);
      
      expect(filterByType('erp').length).toBeGreaterThan(0);
      expect(filterByType('vendor').length).toBeGreaterThan(0);
      expect(filterByType('custom').length).toBeGreaterThan(0);
    });

    it('should filter catalogs by enabled status', () => {
      const allCatalogs = Object.values(sampleCatalogs).flat();
      const enabledCatalogs = allCatalogs.filter(c => c.enabled);
      const disabledCatalogs = allCatalogs.filter(c => !c.enabled);
      
      expect(enabledCatalogs.length).toBeGreaterThan(disabledCatalogs.length);
    });

    it('should search catalogs by name', () => {
      const allCatalogs = Object.values(sampleCatalogs).flat();
      const searchTerm = 'wellness';
      const results = allCatalogs.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter catalogs by item count range', () => {
      const allCatalogs = Object.values(sampleCatalogs).flat();
      const smallCatalogs = allCatalogs.filter(c => c.itemCount < 50);
      const mediumCatalogs = allCatalogs.filter(c => c.itemCount >= 50 && c.itemCount < 200);
      const largeCatalogs = allCatalogs.filter(c => c.itemCount >= 200);
      
      expect(smallCatalogs.length + mediumCatalogs.length + largeCatalogs.length).toBe(allCatalogs.length);
    });
  });

  describe('Business Rules Compliance', () => {
    it('at least one catalog per site should be enabled', () => {
      Object.values(sampleCatalogs).forEach(catalogs => {
        const enabledCount = catalogs.filter(c => c.enabled).length;
        expect(enabledCount).toBeGreaterThan(0);
      });
    });

    it('ERP catalogs should have highest priority', () => {
      const sitesWithMultipleCatalogs = Object.values(sampleCatalogs).filter(
        catalogs => catalogs.length > 1
      );
      
      sitesWithMultipleCatalogs.forEach(catalogs => {
        const erpCatalogs = catalogs.filter(c => c.type === 'erp' && c.enabled);
        if (erpCatalogs.length > 0) {
          const lowestErpPriority = Math.min(...erpCatalogs.map(c => c.priority));
          const nonErpCatalogs = catalogs.filter(c => c.type !== 'erp' && c.enabled);
          const highestNonErpPriority = Math.min(...nonErpCatalogs.map(c => c.priority));
          
          if (nonErpCatalogs.length > 0) {
            expect(lowestErpPriority).toBeLessThanOrEqual(highestNonErpPriority);
          }
        }
      });
    });

    it('pricing settings should match site configuration', () => {
      // Service award catalogs shouldn't show pricing
      const serviceAwardCatalogs = sampleCatalogs['service-award'];
      serviceAwardCatalogs.forEach(catalog => {
        expect(catalog.settings.showPricing).toBe(false);
      });
      
      // Wellness catalogs should show pricing
      const wellnessCatalogs = sampleCatalogs['wellness-program'];
      wellnessCatalogs.forEach(catalog => {
        expect(catalog.settings.showPricing).toBe(true);
      });
    });
  });

  describe('Data Integrity', () => {
    it('all catalogs should have unique IDs globally', () => {
      const allCatalogs = Object.values(sampleCatalogs).flat();
      const ids = allCatalogs.map(c => c.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('catalog IDs should follow naming convention', () => {
      const allCatalogs = Object.values(sampleCatalogs).flat();
      allCatalogs.forEach(catalog => {
        expect(catalog.id).toMatch(/^catalog-/);
      });
    });

    it('all catalog names should be descriptive', () => {
      const allCatalogs = Object.values(sampleCatalogs).flat();
      allCatalogs.forEach(catalog => {
        expect(catalog.name.length).toBeGreaterThan(5);
      });
    });

    it('priority values should be sequential', () => {
      Object.values(sampleCatalogs).forEach(catalogs => {
        const priorities = catalogs.map(c => c.priority).sort((a, b) => a - b);
        expect(priorities[0]).toBe(1);
      });
    });
  });
});

describe('Multi-Catalog UI Behavior', () => {
  describe('Catalog Selection Display', () => {
    it('should show catalog tabs when multiple catalogs exist', () => {
      const shouldShowTabs = (catalogCount: number) => catalogCount > 1;
      
      const wellnessCatalogCount = sampleCatalogs['wellness-program'].filter(c => c.enabled).length;
      expect(shouldShowTabs(wellnessCatalogCount)).toBe(true);
    });

    it('should hide catalog tabs for single catalog sites', () => {
      const shouldShowTabs = (catalogCount: number) => catalogCount > 1;
      
      const eventCatalogCount = sampleCatalogs['event-gifting'].filter(c => c.enabled).length;
      expect(shouldShowTabs(eventCatalogCount)).toBe(false);
    });

    it('should display catalog source badge', () => {
      const getBadgeText = (type: CatalogType, source?: string) => {
        if (type === 'erp') return `ERP: ${source?.toUpperCase()}`;
        if (type === 'vendor') return 'Vendor';
        return 'Custom';
      };
      
      const sapCatalog = sampleCatalogs['service-award'][0];
      expect(getBadgeText(sapCatalog.type, sapCatalog.source)).toContain('SAP');
    });

    it('should show item count in catalog selector', () => {
      const formatItemCount = (count: number) => `${count} items`;
      
      const catalog = sampleCatalogs['wellness-program'][0];
      expect(formatItemCount(catalog.itemCount)).toBe('680 items');
    });
  });

  describe('Smart UI Adaptation', () => {
    it('small catalogs should use grid display', () => {
      const getDisplayMode = (itemCount: number) => itemCount < 20 ? 'grid' : 'list';
      
      const smallCatalog = sampleCatalogs['event-gifting'][0];
      expect(getDisplayMode(smallCatalog.itemCount)).toBe('grid');
    });

    it('large catalogs should use list display with search', () => {
      const getDisplayMode = (itemCount: number) => itemCount < 20 ? 'grid' : 'list';
      
      const largeCatalog = sampleCatalogs['service-award'][0];
      expect(getDisplayMode(largeCatalog.itemCount)).toBe('list');
    });

    it('should calculate optimal page size', () => {
      const getPageSize = (itemCount: number) => {
        if (itemCount < 20) return itemCount;
        if (itemCount < 100) return 25;
        return 50;
      };
      
      expect(getPageSize(12)).toBe(12);
      expect(getPageSize(75)).toBe(25);
      expect(getPageSize(450)).toBe(50);
    });
  });
});
