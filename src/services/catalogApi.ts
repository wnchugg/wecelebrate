/**
 * Catalog API
 * Placeholder file for test compatibility
 */

import type { Catalog, SiteCatalogConfig } from '../types/catalog';

export const catalogApi = {
  async getCatalogs(): Promise<{ catalogs: Catalog[] }> {
    return { catalogs: [] };
  },
  
  async getCatalogById(id: string): Promise<{ catalog: Catalog | null }> {
    return { catalog: null };
  },
  
  async createCatalog(data: Partial<Catalog>): Promise<{ catalog: Catalog }> {
    return { catalog: data as Catalog };
  },
  
  async updateCatalog(id: string, updates: Partial<Catalog>): Promise<{ catalog: Catalog }> {
    return { catalog: updates as Catalog };
  },
  
  async deleteCatalog(id: string): Promise<{ success: boolean }> {
    return { success: true };
  },
  
  async getSiteCatalogConfig(siteId: string): Promise<{ configs: SiteCatalogConfig[] }> {
    return { configs: [] };
  },
  
  async updateSiteCatalogConfig(siteId: string, config: SiteCatalogConfig): Promise<{ config: SiteCatalogConfig }> {
    return { config };
  },
};

export async function fetchCatalogs(filters?: { status?: string; type?: string; search?: string }): Promise<Catalog[]> {
  return [];
}

export async function fetchCatalogById(id: string): Promise<Catalog | null> {
  return null;
}

export async function createCatalog(data: Partial<Catalog>): Promise<{ catalog: Catalog }> {
  return catalogApi.createCatalog(data);
}

export async function updateCatalog(id: string, updates: Partial<Catalog>): Promise<{ catalog: Catalog }> {
  return catalogApi.updateCatalog(id, updates);
}

export async function deleteCatalog(id: string): Promise<{ success: boolean }> {
  return catalogApi.deleteCatalog(id);
}

export async function fetchSiteCatalogConfig(siteId: string): Promise<SiteCatalogConfig[] | null> {
  return null;
}

export async function createOrUpdateSiteCatalogConfig(siteId: string, config: SiteCatalogConfig): Promise<{ config: SiteCatalogConfig }> {
  return catalogApi.updateSiteCatalogConfig(siteId, config);
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