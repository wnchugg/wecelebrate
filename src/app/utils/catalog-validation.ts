/**
 * Catalog Validation Utilities
 * 
 * Provides validation functions for catalog-related data to ensure
 * data integrity and prevent common errors.
 */

import type { Catalog, CatalogSettings, SiteCatalogConfig, CatalogSource } from '../types/catalog';

// ==================== Custom Error Class ====================

export class CatalogValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'CatalogValidationError';
  }
}

// ==================== Catalog Validation ====================

/**
 * Validate catalog data
 * @param catalog - Partial catalog object to validate
 * @throws CatalogValidationError if validation fails
 */
export function validateCatalog(catalog: Partial<Catalog>): void {
  // Name validation
  if (!catalog.name || catalog.name.trim().length === 0) {
    throw new CatalogValidationError(
      'Catalog name is required',
      'name',
      'REQUIRED_FIELD'
    );
  }
  
  if (catalog.name.trim().length > 100) {
    throw new CatalogValidationError(
      'Catalog name too long (maximum 100 characters)',
      'name',
      'MAX_LENGTH'
    );
  }
  
  if (catalog.name.trim().length < 3) {
    throw new CatalogValidationError(
      'Catalog name too short (minimum 3 characters)',
      'name',
      'MIN_LENGTH'
    );
  }
  
  // Type validation
  if (!catalog.type) {
    throw new CatalogValidationError(
      'Catalog type is required',
      'type',
      'REQUIRED_FIELD'
    );
  }
  
  const validTypes = ['erp', 'vendor', 'manual', 'dropship'];
  if (!validTypes.includes(catalog.type)) {
    throw new CatalogValidationError(
      `Invalid catalog type. Must be one of: ${validTypes.join(', ')}`,
      'type',
      'INVALID_VALUE'
    );
  }
  
  // Source validation
  if (!catalog.source) {
    throw new CatalogValidationError(
      'Catalog source configuration is required',
      'source',
      'REQUIRED_FIELD'
    );
  }
  
  validateCatalogSource(catalog.source);
  
  // Settings validation
  if (!catalog.settings) {
    throw new CatalogValidationError(
      'Catalog settings are required',
      'settings',
      'REQUIRED_FIELD'
    );
  }
  
  validateCatalogSettings(catalog.settings);
}

/**
 * Validate catalog source configuration
 * @param source - Catalog source object to validate
 * @throws CatalogValidationError if validation fails
 */
export function validateCatalogSource(source: CatalogSource): void {
  if (!source.type) {
    throw new CatalogValidationError(
      'Source type is required',
      'source.type',
      'REQUIRED_FIELD'
    );
  }
  
  const validSourceTypes = ['api', 'file', 'manual'];
  if (!validSourceTypes.includes(source.type)) {
    throw new CatalogValidationError(
      `Invalid source type. Must be one of: ${validSourceTypes.join(', ')}`,
      'source.type',
      'INVALID_VALUE'
    );
  }
  
  if (!source.sourceSystem || source.sourceSystem.trim().length === 0) {
    throw new CatalogValidationError(
      'Source system name is required',
      'source.sourceSystem',
      'REQUIRED_FIELD'
    );
  }
  
  if (!source.sourceId || source.sourceId.trim().length === 0) {
    throw new CatalogValidationError(
      'Source ID is required',
      'source.sourceId',
      'REQUIRED_FIELD'
    );
  }
  
  // Validate API config if present
  if (source.type === 'api' && source.apiConfig) {
    if (!source.apiConfig.endpoint || source.apiConfig.endpoint.trim().length === 0) {
      throw new CatalogValidationError(
        'API endpoint is required for API source',
        'source.apiConfig.endpoint',
        'REQUIRED_FIELD'
      );
    }
    
    // Basic URL validation
    try {
      new URL(source.apiConfig.endpoint);
    } catch {
      throw new CatalogValidationError(
        'Invalid API endpoint URL',
        'source.apiConfig.endpoint',
        'INVALID_URL'
      );
    }
    
    if (source.apiConfig.syncEndpoint) {
      try {
        new URL(source.apiConfig.syncEndpoint);
      } catch {
        throw new CatalogValidationError(
          'Invalid sync endpoint URL',
          'source.apiConfig.syncEndpoint',
          'INVALID_URL'
        );
      }
    }
  }
  
  // Validate file config if present
  if (source.type === 'file' && source.fileConfig) {
    const validFormats = ['csv', 'xlsx', 'json', 'xml'];
    if (!source.fileConfig.format || !validFormats.includes(source.fileConfig.format)) {
      throw new CatalogValidationError(
        `Invalid file format. Must be one of: ${validFormats.join(', ')}`,
        'source.fileConfig.format',
        'INVALID_VALUE'
      );
    }
  }
}

/**
 * Validate catalog settings
 * @param settings - Catalog settings object to validate
 * @throws CatalogValidationError if validation fails
 */
export function validateCatalogSettings(settings: CatalogSettings): void {
  // Default currency validation
  if (!settings.defaultCurrency || settings.defaultCurrency.trim().length === 0) {
    throw new CatalogValidationError(
      'Default currency is required',
      'settings.defaultCurrency',
      'REQUIRED_FIELD'
    );
  }
  
  // Currency code validation (ISO 4217 format)
  if (!/^[A-Z]{3}$/.test(settings.defaultCurrency)) {
    throw new CatalogValidationError(
      'Invalid currency code (must be 3-letter ISO 4217 code, e.g., USD, EUR)',
      'settings.defaultCurrency',
      'INVALID_FORMAT'
    );
  }
  
  // Price markup validation
  if (settings.priceMarkup !== undefined && settings.priceMarkup !== null) {
    if (typeof settings.priceMarkup !== 'number') {
      throw new CatalogValidationError(
        'Price markup must be a number',
        'settings.priceMarkup',
        'INVALID_TYPE'
      );
    }
    
    if (settings.priceMarkup < 0 || settings.priceMarkup > 1000) {
      throw new CatalogValidationError(
        'Price markup must be between 0 and 1000 percent',
        'settings.priceMarkup',
        'OUT_OF_RANGE'
      );
    }
  }
  
  // Auto sync validation
  if (typeof settings.autoSync !== 'boolean') {
    throw new CatalogValidationError(
      'Auto sync setting must be a boolean',
      'settings.autoSync',
      'INVALID_TYPE'
    );
  }
  
  // Sync frequency validation
  if (settings.autoSync && settings.syncFrequency) {
    const validFrequencies = ['manual', 'hourly', 'daily', 'weekly'];
    if (!validFrequencies.includes(settings.syncFrequency)) {
      throw new CatalogValidationError(
        `Invalid sync frequency. Must be one of: ${validFrequencies.join(', ')}`,
        'settings.syncFrequency',
        'INVALID_VALUE'
      );
    }
  }
}

// ==================== Site Catalog Config Validation ====================

/**
 * Validate site catalog configuration
 * @param config - Partial site catalog config to validate
 * @throws CatalogValidationError if validation fails
 */
export function validateSiteCatalogConfig(config: Partial<SiteCatalogConfig>): void {
  // Site ID validation
  if (!config.siteId || config.siteId.trim().length === 0) {
    throw new CatalogValidationError(
      'Site ID is required',
      'siteId',
      'REQUIRED_FIELD'
    );
  }
  
  // Catalog ID validation
  if (!config.catalogId || config.catalogId.trim().length === 0) {
    throw new CatalogValidationError(
      'Catalog ID is required',
      'catalogId',
      'REQUIRED_FIELD'
    );
  }
  
  // Price adjustment validation
  if (config.overrides?.priceAdjustment !== undefined) {
    const adjustment = config.overrides.priceAdjustment;
    
    if (typeof adjustment !== 'number') {
      throw new CatalogValidationError(
        'Price adjustment must be a number',
        'overrides.priceAdjustment',
        'INVALID_TYPE'
      );
    }
    
    if (adjustment < -100 || adjustment > 1000) {
      throw new CatalogValidationError(
        'Price adjustment must be between -100% and 1000%',
        'overrides.priceAdjustment',
        'OUT_OF_RANGE'
      );
    }
  }
  
  // Minimum inventory validation
  if (config.availability?.minimumInventory !== undefined) {
    const minInventory = config.availability.minimumInventory;
    
    if (typeof minInventory !== 'number') {
      throw new CatalogValidationError(
        'Minimum inventory must be a number',
        'availability.minimumInventory',
        'INVALID_TYPE'
      );
    }
    
    if (minInventory < 0) {
      throw new CatalogValidationError(
        'Minimum inventory must be positive or zero',
        'availability.minimumInventory',
        'OUT_OF_RANGE'
      );
    }
  }
  
  // Price range validation
  if (config.availability?.minimumPrice !== undefined && config.availability?.maximumPrice !== undefined) {
    if (config.availability.minimumPrice > config.availability.maximumPrice) {
      throw new CatalogValidationError(
        'Minimum price cannot be greater than maximum price',
        'availability.minimumPrice',
        'INVALID_RANGE'
      );
    }
  }
  
  // Exclusions validation
  if (config.exclusions) {
    if (!Array.isArray(config.exclusions.excludedCategories)) {
      throw new CatalogValidationError(
        'Excluded categories must be an array',
        'exclusions.excludedCategories',
        'INVALID_TYPE'
      );
    }
    
    if (!Array.isArray(config.exclusions.excludedSkus)) {
      throw new CatalogValidationError(
        'Excluded SKUs must be an array',
        'exclusions.excludedSkus',
        'INVALID_TYPE'
      );
    }
    
    if (config.exclusions.excludedTags && !Array.isArray(config.exclusions.excludedTags)) {
      throw new CatalogValidationError(
        'Excluded tags must be an array',
        'exclusions.excludedTags',
        'INVALID_TYPE'
      );
    }
  }
}

// ==================== Helper Functions ====================

/**
 * Sanitize catalog name (remove dangerous characters)
 * @param name - Catalog name to sanitize
 * @returns Sanitized catalog name
 */
export function sanitizeCatalogName(name: string): string {
  return name
    .trim()
    .replace(/[<>]/g, '') // Remove HTML-like brackets
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Generate a unique catalog ID from name
 * @param name - Catalog name
 * @returns Generated catalog ID
 */
export function generateCatalogId(name: string): string {
  // Convert name to lowercase, replace spaces and special chars with underscores
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
  
  // Add timestamp for uniqueness
  const timestamp = Date.now().toString(36);
  
  // Add random component for additional uniqueness
  const random = Math.random().toString(36).substring(2, 6);
  
  return `catalog_${sanitized}_${timestamp}_${random}`;
}

/**
 * Validate SKU format
 * @param sku - SKU to validate
 * @returns True if SKU is valid
 */
export function isValidSku(sku: string): boolean {
  if (!sku || sku.trim().length === 0) {
    return false;
  }
  
  // SKU should be alphanumeric with hyphens/underscores allowed
  // Length: 3-50 characters
  const skuPattern = /^[A-Z0-9_-]{3,50}$/i;
  return skuPattern.test(sku);
}

/**
 * Validate currency code (ISO 4217)
 * @param code - Currency code to validate
 * @returns True if currency code is valid format
 */
export function isValidCurrencyCode(code: string): boolean {
  if (!code) {
    return false;
  }
  
  // Must be exactly 3 uppercase letters
  return /^[A-Z]{3}$/.test(code);
}

/**
 * Common currency codes for validation
 */
export const COMMON_CURRENCY_CODES = [
  'USD', // US Dollar
  'EUR', // Euro
  'GBP', // British Pound
  'CAD', // Canadian Dollar
  'AUD', // Australian Dollar
  'JPY', // Japanese Yen
  'CNY', // Chinese Yuan
  'INR', // Indian Rupee
  'BRL', // Brazilian Real
  'MXN', // Mexican Peso
  'SGD', // Singapore Dollar
  'HKD', // Hong Kong Dollar
  'NZD', // New Zealand Dollar
  'ZAR', // South African Rand
  'AED', // UAE Dirham
] as const;

/**
 * Validate if currency code is a commonly used one
 * @param code - Currency code to check
 * @returns True if it's a common currency code
 */
export function isCommonCurrency(code: string): boolean {
  return (COMMON_CURRENCY_CODES as readonly string[]).includes(code);
}

/**
 * Validate percentage value
 * @param value - Percentage value to validate
 * @param min - Minimum allowed value (default: 0)
 * @param max - Maximum allowed value (default: 100)
 * @returns True if percentage is valid
 */
export function isValidPercentage(value: number, min: number = 0, max: number = 100): boolean {
  return typeof value === 'number' && value >= min && value <= max;
}

/**
 * Validate email address format
 * @param email - Email address to validate
 * @returns True if email format is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email) {
    return false;
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns True if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize string for safe storage
 * @param str - String to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeString(str: string, maxLength: number = 1000): string {
  if (!str) {
    return '';
  }
  
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}