/**
 * Catalog API Service - Multi-Catalog Architecture
 * Handles catalog management and product retrieval from multiple sources
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { getAccessToken } from '../lib/apiClient';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import type { Catalog, SiteCatalogConfig, CatalogStats } from '../types/catalog';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

// Get auth headers with environment ID
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  const env = getCurrentEnvironment();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return {
    'Authorization': `Bearer ${publicAnonKey}`,
    'X-Access-Token': token,
    'X-Environment-ID': env.id,
    'Content-Type': 'application/json',
  };
}

// ==================== CATALOG CRUD ====================

export async function fetchCatalogs(filters?: {
  type?: string;
  status?: string;
  ownerId?: string;
}): Promise<Catalog[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.ownerId) params.append('ownerId', filters.ownerId);
  
  const url = `${API_BASE}/catalogs${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to fetch catalogs');
  }

  const data = await response.json() as { catalogs?: Catalog[] };
  return data.catalogs || [];
}

export async function fetchCatalogById(catalogId: string): Promise<Catalog> {
  const response = await fetch(`${API_BASE}/catalogs/${catalogId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to fetch catalog');
  }

  const data = await response.json() as { catalog: Catalog };
  return data.catalog;
}

export async function createCatalog(catalog: {
  name: string;
  description?: string;
  type: 'erp' | 'vendor' | 'manual' | 'dropship';
  source: {
    type: 'api' | 'file' | 'manual';
    sourceSystem: string;
    sourceId: string;
    sourceVersion?: string;
    apiConfig?: Record<string, unknown>;
    fileConfig?: Record<string, unknown>;
  };
  status?: 'active' | 'inactive';
  settings: {
    autoSync?: boolean;
    syncFrequency?: string;
    defaultCurrency: string;
    priceMarkup?: number;
    allowSiteOverrides?: boolean;
    trackInventory?: boolean;
    requireApproval?: boolean;
    notifyOnSync?: boolean;
    notifyOnError?: boolean;
  };
  managedBy?: string;
  ownerId?: string;
}): Promise<Catalog> {
  const response = await fetch(`${API_BASE}/catalogs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(catalog),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to create catalog');
  }

  const data = await response.json() as { catalog: Catalog };
  return data.catalog;
}

export async function updateCatalog(catalogId: string, updates: Partial<Catalog>): Promise<Catalog> {
  const response = await fetch(`${API_BASE}/catalogs/${catalogId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to update catalog');
  }

  const data = await response.json() as { catalog: Catalog };
  return data.catalog;
}

export async function deleteCatalog(catalogId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/catalogs/${catalogId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to delete catalog');
  }
}

export async function fetchCatalogStats(catalogId: string): Promise<CatalogStats> {
  const response = await fetch(`${API_BASE}/catalogs/${catalogId}/stats`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to fetch catalog stats');
  }

  const data = await response.json() as { stats: CatalogStats };
  return data.stats;
}

// ==================== SITE CATALOG CONFIGURATION ====================

export async function fetchSiteCatalogConfig(siteId: string): Promise<SiteCatalogConfig> {
  const response = await fetch(`${API_BASE}/sites/${siteId}/catalog-config`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to fetch site catalog configuration');
  }

  const data = await response.json() as { config: SiteCatalogConfig };
  return data.config;
}

export async function createOrUpdateSiteCatalogConfig(
  siteId: string,
  config: {
    catalogId: string;
    exclusions?: {
      excludedCategories?: string[];
      excludedSkus?: string[];
      excludedTags?: string[];
      excludedBrands?: string[];
    };
    overrides?: {
      allowPriceOverride?: boolean;
      priceAdjustment?: number;
      customPricing?: Record<string, number>;
      customDescriptions?: Record<string, string>;
    };
    availability?: {
      hideOutOfStock?: boolean;
      hideDiscontinued?: boolean;
      minimumInventory?: number;
      maximumPrice?: number;
      minimumPrice?: number;
      onlyShowFeatured?: boolean;
    };
    updatedBy?: string;
  }
): Promise<SiteCatalogConfig> {
  const response = await fetch(`${API_BASE}/sites/${siteId}/catalog-config`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to create/update site catalog configuration');
  }

  const data = await response.json() as { config: SiteCatalogConfig };
  return data.config;
}

export async function updateSiteCatalogConfig(
  siteId: string,
  updates: Partial<SiteCatalogConfig>
): Promise<SiteCatalogConfig> {
  const response = await fetch(`${API_BASE}/sites/${siteId}/catalog-config`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to update site catalog configuration');
  }

  const data = await response.json() as { config: SiteCatalogConfig };
  return data.config;
}

export async function deleteSiteCatalogConfig(siteId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/sites/${siteId}/catalog-config`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to delete site catalog configuration');
  }
}

export async function addSiteCatalogExclusions(
  siteId: string,
  exclusions: {
    categories?: string[];
    skus?: string[];
    tags?: string[];
    brands?: string[];
    updatedBy?: string;
  }
): Promise<SiteCatalogConfig> {
  const response = await fetch(`${API_BASE}/sites/${siteId}/catalog-config/exclusions/add`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(exclusions),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to add exclusions');
  }

  const data = await response.json() as { config: SiteCatalogConfig };
  return data.config;
}

export async function removeSiteCatalogExclusions(
  siteId: string,
  exclusions: {
    categories?: string[];
    skus?: string[];
    tags?: string[];
    brands?: string[];
    updatedBy?: string;
  }
): Promise<SiteCatalogConfig> {
  const response = await fetch(`${API_BASE}/sites/${siteId}/catalog-config/exclusions/remove`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(exclusions),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to remove exclusions');
  }

  const data = await response.json() as { config: SiteCatalogConfig };
  return data.config;
}

export async function setSiteCatalogPriceOverride(
  siteId: string,
  sku: string,
  price: number,
  updatedBy?: string
): Promise<SiteCatalogConfig> {
  const response = await fetch(`${API_BASE}/sites/${siteId}/catalog-config/price-override`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ sku, price, updatedBy }),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to set price override');
  }

  const data = await response.json() as { config: SiteCatalogConfig };
  return data.config;
}

// ==================== MIGRATION ====================

export async function checkMigrationStatus(): Promise<{
  migrationNeeded: boolean;
  message: string;
}> {
  const response = await fetch(`${API_BASE}/migration/check`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to check migration status');
  }

  return response.json();
}

export async function getMigrationStatus(): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE}/migration/status`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to get migration status');
  }

  const data = await response.json() as { status: Record<string, unknown> };
  return data.status;
}

export async function runMigration(): Promise<{
  success: boolean;
  message: string;
  result?: any;
  skipped?: boolean;
}> {
  const response = await fetch(`${API_BASE}/migration/run`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to run migration');
  }

  return response.json();
}

export async function rollbackMigration(): Promise<{
  success: boolean;
  message: string;
  result?: any;
  warning?: string;
}> {
  const response = await fetch(`${API_BASE}/migration/rollback`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to rollback migration');
  }

  return response.json();
}