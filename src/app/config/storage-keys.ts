/**
 * Centralized Storage Key Definitions
 * 
 * Defines all KV store keys used in the multi-catalog architecture.
 * This ensures consistency across the application and prevents typos.
 */

export const StorageKeys = {
  // ==================== Catalogs ====================
  
  /**
   * List of all catalog IDs
   * Type: string[]
   */
  CATALOGS_ALL: 'catalogs:all',
  
  /**
   * Individual catalog data
   * @param catalogId - The catalog identifier
   * Type: Catalog
   */
  CATALOG: (catalogId: string) => `catalogs:${catalogId}`,
  
  // ==================== Catalog Products ====================
  
  /**
   * List of gift IDs in a specific catalog
   * @param catalogId - The catalog identifier
   * Type: string[]
   */
  CATALOG_GIFTS: (catalogId: string) => `catalog_gifts:${catalogId}`,
  
  /**
   * Link between catalog and gift (for fast lookup)
   * @param catalogId - The catalog identifier
   * @param giftId - The gift identifier
   * Type: boolean | timestamp
   */
  CATALOG_GIFT_LINK: (catalogId: string, giftId: string) => 
    `catalog_gifts:${catalogId}:${giftId}`,
  
  // ==================== Gifts (Enhanced) ====================
  
  /**
   * List of all gift IDs (global)
   * Type: string[]
   */
  GIFTS_ALL: 'gifts:all',
  
  /**
   * Individual gift data
   * @param giftId - The gift identifier
   * Type: Gift
   */
  GIFT: (giftId: string) => `gifts:${giftId}`,
  
  // ==================== Site Catalog Configuration ====================
  
  /**
   * Site's catalog configuration (assignment + exclusions)
   * @param siteId - The site identifier
   * Type: SiteCatalogConfig
   */
  SITE_CATALOG_CONFIG: (siteId: string) => `sites:${siteId}:catalog_config`,
  
  // ==================== Catalog Sync Logs ====================
  
  /**
   * Most recent sync log for a catalog
   * @param catalogId - The catalog identifier
   * Type: CatalogSyncLog
   */
  CATALOG_SYNC_LATEST: (catalogId: string) => `catalog_sync_logs:${catalogId}:latest`,
  
  /**
   * Historical sync log entry
   * @param catalogId - The catalog identifier
   * @param timestamp - ISO timestamp of the sync
   * Type: CatalogSyncLog
   */
  CATALOG_SYNC_LOG: (catalogId: string, timestamp: string) => 
    `catalog_sync_logs:${catalogId}:${timestamp}`,
  
  /**
   * List of all sync log timestamps for a catalog
   * @param catalogId - The catalog identifier
   * Type: string[]
   */
  CATALOG_SYNC_LOGS_LIST: (catalogId: string) => `catalog_sync_logs:${catalogId}:list`,
  
  // ==================== Indexes ====================
  
  /**
   * Index of catalog IDs by type
   * @param type - The catalog type (erp, vendor, manual, dropship)
   * Type: string[]
   */
  CATALOG_BY_TYPE: (type: string) => `catalog_index:by_type:${type}`,
  
  /**
   * Index of catalog IDs by status
   * @param status - The catalog status (active, inactive, syncing, error)
   * Type: string[]
   */
  CATALOG_BY_STATUS: (status: string) => `catalog_index:by_status:${status}`,
  
  /**
   * Index of gift IDs by catalog (for fast filtering)
   * @param catalogId - The catalog identifier
   * Type: string[]
   */
  GIFTS_BY_CATALOG: (catalogId: string) => `gifts_index:by_catalog:${catalogId}`,
  
  /**
   * Index of catalog IDs by owner (client)
   * @param ownerId - The client identifier
   * Type: string[]
   */
  CATALOGS_BY_OWNER: (ownerId: string) => `catalog_index:by_owner:${ownerId}`,
  
  // ==================== Catalog Statistics (Cached) ====================
  
  /**
   * Cached catalog statistics
   * @param catalogId - The catalog identifier
   * Type: CatalogStats
   */
  CATALOG_STATS: (catalogId: string) => `catalog_stats:${catalogId}`,
  
  /**
   * Cache expiry timestamp for catalog stats
   * @param catalogId - The catalog identifier
   * Type: string (ISO timestamp)
   */
  CATALOG_STATS_EXPIRY: (catalogId: string) => `catalog_stats:${catalogId}:expiry`,
  
  // ==================== Import/Export ====================
  
  /**
   * Temporary import job data
   * @param jobId - The import job identifier
   * Type: ImportJob
   */
  IMPORT_JOB: (jobId: string) => `import_jobs:${jobId}`,
  
  /**
   * Import job results
   * @param jobId - The import job identifier
   * Type: ImportResult
   */
  IMPORT_JOB_RESULT: (jobId: string) => `import_jobs:${jobId}:result`,
  
  /**
   * List of active import jobs
   * Type: string[]
   */
  IMPORT_JOBS_ACTIVE: 'import_jobs:active',
  
  // ==================== Existing Keys (for reference) ====================
  
  /**
   * Sites list
   * Type: string[]
   */
  SITES_ALL: 'sites:all',
  
  /**
   * Individual site data
   * @param siteId - The site identifier
   * Type: Site
   */
  SITE: (siteId: string) => `sites:${siteId}`,
  
  /**
   * Clients list
   * Type: string[]
   */
  CLIENTS_ALL: 'clients:all',
  
  /**
   * Individual client data
   * @param clientId - The client identifier
   * Type: Client
   */
  CLIENT: (clientId: string) => `clients:${clientId}`,
  
  /**
   * Employees for a site
   * @param siteId - The site identifier
   * Type: string[]
   */
  SITE_EMPLOYEES: (siteId: string) => `sites:${siteId}:employees`,
  
  /**
   * Individual employee data
   * @param employeeId - The employee identifier
   * Type: Employee
   */
  EMPLOYEE: (employeeId: string) => `employees:${employeeId}`,
  
  /**
   * Orders list
   * Type: string[]
   */
  ORDERS_ALL: 'orders:all',
  
  /**
   * Individual order data
   * @param orderId - The order identifier
   * Type: Order
   */
  ORDER: (orderId: string) => `orders:${orderId}`,
  
  /**
   * Orders for a specific site
   * @param siteId - The site identifier
   * Type: string[]
   */
  SITE_ORDERS: (siteId: string) => `sites:${siteId}:orders`,
  
} as const;

// ==================== Helper Types ====================

/**
 * Type-safe storage key generator
 */
export type StorageKeyFunction = typeof StorageKeys[keyof typeof StorageKeys];

/**
 * Type for constant storage keys (non-function)
 */
export type ConstantStorageKey = {
  [K in keyof typeof StorageKeys]: typeof StorageKeys[K] extends string
    ? typeof StorageKeys[K]
    : never;
}[keyof typeof StorageKeys];

// ==================== Helper Functions ====================

/**
 * Validate a storage key format
 * @param key - The key to validate
 * @returns True if the key is valid
 */
export function isValidStorageKey(key: string): boolean {
  // Basic validation: no empty strings, no special characters that could break KV
  if (!key || key.trim().length === 0) {
    return false;
  }
  
  // Check for invalid characters
  const invalidChars = /[<>{}[\]\\|^`]/;
  if (invalidChars.test(key)) {
    return false;
  }
  
  return true;
}

/**
 * Extract catalog ID from a catalog-related storage key
 * @param key - The storage key
 * @returns The catalog ID or null if not a catalog key
 */
export function extractCatalogId(key: string): string | null {
  const patterns = [
    /^catalogs:([^:]+)$/,
    /^catalog_gifts:([^:]+)$/,
    /^catalog_gifts:([^:]+):.+$/,
    /^catalog_sync_logs:([^:]+):.+$/,
    /^catalog_stats:([^:]+)$/,
    /^gifts_index:by_catalog:([^:]+)$/,
  ];
  
  for (const pattern of patterns) {
    const match = key.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract site ID from a site-related storage key
 * @param key - The storage key
 * @returns The site ID or null if not a site key
 */
export function extractSiteId(key: string): string | null {
  const pattern = /^sites:([^:]+)(?::.*)?$/;
  const match = key.match(pattern);
  return match ? match[1] : null;
}

/**
 * Get all catalog-related keys for a specific catalog
 * Useful for cleanup operations
 * @param catalogId - The catalog identifier
 * @returns Array of all storage keys related to this catalog
 */
export function getAllCatalogKeys(catalogId: string): string[] {
  return [
    StorageKeys.CATALOG(catalogId),
    StorageKeys.CATALOG_GIFTS(catalogId),
    StorageKeys.CATALOG_SYNC_LATEST(catalogId),
    StorageKeys.CATALOG_SYNC_LOGS_LIST(catalogId),
    StorageKeys.CATALOG_STATS(catalogId),
    StorageKeys.CATALOG_STATS_EXPIRY(catalogId),
    StorageKeys.GIFTS_BY_CATALOG(catalogId),
  ];
}

/**
 * Get all site-catalog-related keys for a specific site
 * @param siteId - The site identifier
 * @returns Array of all storage keys related to this site's catalog config
 */
export function getAllSiteCatalogKeys(siteId: string): string[] {
  return [
    StorageKeys.SITE_CATALOG_CONFIG(siteId),
  ];
}
