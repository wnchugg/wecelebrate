/**
 * Catalog Type Definitions
 * Placeholder file for test compatibility
 */

// Type exports for catalog
export type CatalogType = 'erp' | 'vendor' | 'manual' | 'dropship';
export type CatalogStatus = 'active' | 'inactive' | 'pending' | 'archived' | 'syncing' | 'error';

export interface Catalog {
  id: string;
  name: string;
  type: CatalogType;
  status: CatalogStatus;
  description?: string;
  source?: {
    connectionId?: string;
    vendorId?: string;
    sourceSystem?: string;
    apiEndpoint?: string;
    authMethod?: 'oauth' | 'api-key' | 'basic';
  };
  lastSyncedAt?: string;
  lastSyncStatus?: 'success' | 'failure' | 'never';
  createdAt: string;
  updatedAt: string;
  totalProducts?: number;
  activeProducts?: number;
  settings?: {
    defaultCurrency?: string;
    autoSync?: boolean;
    [key: string]: unknown;
  };
}

export interface CatalogFilters {
  status?: CatalogStatus;
  type?: CatalogType;
  search?: string;
  connectionId?: string;
  vendorId?: string;
}

export interface SiteCatalogConfig {
  id?: string; // Optional for test compatibility
  siteId: string;
  catalogId: string;
  isDefault: boolean;
  priority: number;
  
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
  };
  availability?: {
    hideOutOfStock?: boolean;
    hideDiscontinued?: boolean;
    minimumInventory?: number;
  };
  
  updatedAt?: string;
  updatedBy?: string;
}