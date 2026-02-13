/**
 * Catalog Types - Multi-Catalog Architecture
 * 
 * Defines types for managing multiple product catalogs from different
 * ERP systems and external vendors.
 */

// ==================== Type Enums ====================

export type CatalogType = 'erp' | 'vendor' | 'manual' | 'dropship';
export type CatalogStatus = 'active' | 'inactive' | 'syncing' | 'error';
export type SyncStatus = 'synced' | 'modified' | 'conflict' | 'manual';
export type SourceType = 'api' | 'file' | 'manual';
export type AuthType = 'basic' | 'oauth' | 'api_key' | 'none';
export type FileFormat = 'csv' | 'xlsx' | 'json' | 'xml';
export type SyncFrequency = 'manual' | 'hourly' | 'daily' | 'weekly';
export type SyncLogStatus = 'running' | 'completed' | 'failed' | 'partial';

// ==================== Main Catalog Entity ====================

export interface Catalog {
  id: string;
  name: string;
  description?: string;
  type: CatalogType;
  source: CatalogSource;
  status: CatalogStatus;

  // Metadata
  totalProducts: number;
  activeProducts: number;
  lastSyncedAt?: string;
  lastSyncStatus?: string;  // Status of the last sync operation
  nextSyncAt?: string;

  // Configuration
  settings: CatalogSettings;

  // Ownership
  managedBy?: string;      // Admin user ID
  ownerId?: string;        // Client ID (if client-specific)

  createdAt: string;
  updatedAt: string;
}

// ==================== Catalog Source Configuration ====================

export interface CatalogSource {
  type: SourceType;
  sourceSystem: string;    // "SAP", "Oracle", "Vendor Portal", etc.
  sourceId: string;        // External system identifier
  sourceVersion?: string;  // API version
  
  // API configuration
  apiConfig?: ApiSourceConfig;
  
  // File configuration
  fileConfig?: FileSourceConfig;
}

export interface ApiSourceConfig {
  endpoint: string;
  authType: AuthType;
  credentials: Record<string, string>;  // Encrypted in production
  syncEndpoint: string;
  headers?: Record<string, string>;
  timeout?: number;                     // Request timeout in ms
  retryAttempts?: number;               // Number of retry attempts
}

export interface FileSourceConfig {
  format: FileFormat;
  ftpHost?: string;
  ftpPort?: number;
  ftpPath?: string;
  ftpUsername?: string;
  ftpPassword?: string;  // Encrypted in production
  encoding?: string;     // File encoding (default: utf-8)
  delimiter?: string;    // CSV delimiter (default: ,)
}

// ==================== Catalog Settings ====================

export interface CatalogSettings {
  autoSync: boolean;
  syncFrequency?: SyncFrequency;
  defaultCurrency: string;
  priceMarkup?: number;           // Percentage markup on cost
  allowSiteOverrides: boolean;    // Can sites modify prices?
  trackInventory: boolean;
  requireApproval?: boolean;      // Require approval for sync changes
  notifyOnSync?: boolean;         // Send notification after sync
  notifyOnError?: boolean;        // Send notification on sync errors
}

// ==================== Product Source Attribution ====================

export interface ProductSource {
  catalogId: string;
  externalId?: string;      // ID in external system
  externalSku?: string;     // SKU in external system
  lastSyncedAt?: string;
  syncStatus: SyncStatus;
  syncNotes?: string;       // Notes about sync status
}

// ==================== Catalog Sync Log ====================

export interface CatalogSyncLog {
  id: string;
  catalogId: string;
  startedAt: string;
  completedAt?: string;
  status: SyncLogStatus;
  
  results: SyncResults;
  metrics: SyncMetrics;
  
  triggeredBy: string;      // 'scheduled' | 'manual' | userId
  logDetails?: string;      // Full log text
  errorDetails?: string;    // Detailed error information
}

export interface SyncResults {
  productsAdded: number;
  productsUpdated: number;
  productsRemoved: number;
  productsUnchanged: number;
  errors: SyncError[];
}

export interface SyncMetrics {
  duration?: number;        // Duration in milliseconds
  recordsProcessed: number;
  apiCalls?: number;
  bytesTransferred?: number;
  averageProcessingTime?: number;
}

export interface SyncError {
  sku: string;
  error: string;
  severity: 'warning' | 'error';
  details?: string;
  timestamp?: string;
}

// ==================== Site Catalog Configuration ====================

export interface SiteCatalogConfig {
  siteId: string;
  catalogId: string;

  // Configuration flags
  isDefault?: boolean;           // Whether this is the default catalog for the site
  priority?: number;             // Priority order when multiple catalogs assigned

  exclusions: CatalogExclusions;
  overrides?: CatalogOverrides;
  availability?: AvailabilityRules;

  updatedAt: string;
  updatedBy?: string;  // Admin user ID
}

export interface CatalogExclusions {
  excludedCategories: string[];
  excludedSkus: string[];
  excludedTags?: string[];
  excludedBrands?: string[];
}

export interface CatalogOverrides {
  allowPriceOverride: boolean;
  priceAdjustment?: number;           // Percentage adjustment
  customPricing?: Record<string, number>;  // SKU → custom price
  customDescriptions?: Record<string, string>;  // SKU → custom description
}

export interface AvailabilityRules {
  hideOutOfStock: boolean;
  hideDiscontinued: boolean;
  minimumInventory?: number;
  maximumPrice?: number;            // Hide products above this price
  minimumPrice?: number;            // Hide products below this price
  onlyShowFeatured?: boolean;       // Only show featured products
}

// ==================== Catalog Statistics ====================

export interface CatalogStats {
  catalogId: string;
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStock: number;
  discontinuedProducts: number;
  
  categories: string[];
  categoryCount: Record<string, number>;
  
  priceStats: {
    totalValue: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
  };
  
  inventoryStats: {
    totalInventory: number;
    availableInventory: number;
    reservedInventory: number;
    lowStockCount: number;  // Products below minimum threshold
  };
  
  lastUpdated: string;
}

// ==================== Import/Export Types ====================

export interface CatalogImportConfig {
  catalogId: string;
  file: File;
  format: FileFormat;
  mapping: FieldMapping;
  options: ImportOptions;
}

export interface FieldMapping {
  sku: string;              // Column name for SKU
  name: string;             // Column name for product name
  description?: string;     // Column name for description
  price: string;            // Column name for price
  cost?: string;            // Column name for cost
  category?: string;        // Column name for category
  image?: string;           // Column name for image URL
  inventory?: string;       // Column name for inventory
  status?: string;          // Column name for status
  customFields?: Record<string, string>;  // Additional field mappings
}

export interface ImportOptions {
  skipHeader: boolean;
  updateExisting: boolean;  // Update products that already exist
  createNew: boolean;       // Create new products
  validateOnly: boolean;    // Only validate, don't import
  batchSize: number;        // Number of records per batch
}

export interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  sku?: string;
  field?: string;
  error: string;
}

export interface ImportWarning {
  row: number;
  sku?: string;
  message: string;
}

// ==================== Catalog Filter Options ====================

export interface CatalogFilterOptions {
  type?: CatalogType[];
  status?: CatalogStatus[];
  search?: string;
  ownerId?: string;
  managedBy?: string;
  hasProducts?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'productCount';
  sortOrder?: 'asc' | 'desc';
}

// ==================== Helper Types ====================

export interface CatalogSummary {
  id: string;
  name: string;
  type: CatalogType;
  status: CatalogStatus;
  totalProducts: number;
  activeProducts: number;
  lastSyncedAt?: string;
}

export interface CatalogOption {
  value: string;
  label: string;
  description?: string;
  productCount: number;
  disabled?: boolean;
}
