// @ts-nocheck
/**
 * Catalog API
 * Test implementation using mock data
 * NOTE: This is a legacy file - use src/app/services/catalogApi.ts instead
 */

import type { Catalog, SiteCatalogConfig } from '../types/catalog';
import { mockCatalogs, mockSiteConfigs, filterCatalogs as filterMockCatalogs, getCatalogById as getMockCatalogById, getSiteConfigBySiteId } from '../test/mockData/catalogData';

export const catalogApi = {
  async getCatalogs(): Promise<{ catalogs: Catalog[] }> {
    return { catalogs: mockCatalogs };
  },
  
  async getCatalogById(id: string): Promise<{ catalog: Catalog | null }> {
    const catalog = getMockCatalogById(id);
    return { catalog: catalog || null };
  },
  
  async createCatalog(data: Partial<Catalog>): Promise<{ catalog: Catalog }> {
    const newCatalog: Catalog = {
      id: `cat-${Date.now()}`,
      name: data.name || '',
      description: data.description,
      type: data.type || 'manual',
      status: data.status || 'active',
      source: data.source || { type: 'manual', sourceSystem: 'Manual', sourceId: 'MANUAL' },
      settings: data.settings || { autoSync: false, defaultCurrency: 'USD', allowSiteOverrides: true, trackInventory: false },
      totalProducts: 0,
      activeProducts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { catalog: newCatalog };
  },
  
  async updateCatalog(id: string, updates: Partial<Catalog>): Promise<{ catalog: Catalog }> {
    const existing = getMockCatalogById(id);
    if (!existing) {
      throw new Error('Catalog not found');
    }
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    return { catalog: updated };
  },
  
  async deleteCatalog(id: string): Promise<{ success: boolean }> {
    const existing = getMockCatalogById(id);
    if (!existing) {
      throw new Error('Catalog not found');
    }
    return { success: true };
  },
  
  async getSiteCatalogConfig(siteId: string): Promise<{ configs: SiteCatalogConfig[] }> {
    const config = getSiteConfigBySiteId(siteId);
    return { configs: config ? [config] : [] };
  },
  
  async updateSiteCatalogConfig(siteId: string, config: SiteCatalogConfig): Promise<{ config: SiteCatalogConfig }> {
    return { config: { ...config, updatedAt: new Date().toISOString() } };
  },
};

export async function fetchCatalogs(filters?: { status?: string; type?: string; search?: string }): Promise<Catalog[]> {
  if (!filters || Object.keys(filters).length === 0) {
    return mockCatalogs;
  }
  return filterMockCatalogs(filters);
}

export async function fetchCatalogById(id: string): Promise<Catalog> {
  const catalog = getMockCatalogById(id);
  if (!catalog) {
    throw new Error('Catalog not found');
  }
  return catalog;
}

export async function createCatalog(data: Partial<Catalog>): Promise<{ catalog: Catalog }> {
  if (!data.name) {
    throw new Error('Name is required');
  }
  if (!data.type) {
    throw new Error('Type is required');
  }
  return catalogApi.createCatalog(data);
}

export async function updateCatalog(id: string, updates: Partial<Catalog>): Promise<{ catalog: Catalog }> {
  return catalogApi.updateCatalog(id, updates);
}

export async function deleteCatalog(id: string): Promise<{ success: boolean }> {
  return catalogApi.deleteCatalog(id);
}

export async function fetchSiteCatalogConfig(siteId: string): Promise<SiteCatalogConfig[] | null> {
  const config = getSiteConfigBySiteId(siteId);
  if (!config) {
    throw new Error('Site catalog config not found');
  }
  return [config];
}

export async function createOrUpdateSiteCatalogConfig(siteId: string, config: Partial<SiteCatalogConfig>): Promise<{ config: SiteCatalogConfig }> {
  if (!config.catalogId) {
    throw new Error('Catalog ID is required');
  }
  const fullConfig: SiteCatalogConfig = {
    siteId,
    catalogId: config.catalogId,
    isDefault: config.isDefault ?? false,
    priority: config.priority ?? 1,
    exclusions: config.exclusions || { excludedCategories: [], excludedSkus: [], excludedTags: [], excludedBrands: [] },
    overrides: config.overrides || { allowPriceOverride: false },
    availability: config.availability || { hideOutOfStock: false, hideDiscontinued: true },
    updatedAt: new Date().toISOString(),
    updatedBy: config.updatedBy || 'test-user',
  };
  return catalogApi.updateSiteCatalogConfig(siteId, fullConfig);
}

export async function getCatalogs(): Promise<{ catalogs: Catalog[] }> {
  return catalogApi.getCatalogs();
}

export async function getCatalogById(id: string): Promise<{ catalog: Catalog | null }> {
  return catalogApi.getCatalogById(id);
}

export async function getSiteCatalogConfig(siteId: string): Promise<{ configs: SiteCatalogConfig[] }> {
  return catalogApi.getSiteCatalogConfig(siteId);
}

export async function updateSiteCatalogConfig(siteId: string, config: SiteCatalogConfig): Promise<{ config: SiteCatalogConfig }> {
  return catalogApi.updateSiteCatalogConfig(siteId, config);
}