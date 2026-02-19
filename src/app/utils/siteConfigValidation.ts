/**
 * Site Configuration Validation Utilities
 * Provides comprehensive validation for all site configuration fields
 * 
 * Created: February 12, 2026
 * Version: 1.0
 */

import { isValidSlug } from './validationUtils';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
  warnings: string[];
}

export interface SiteConfigData {
  siteName: string;
  siteUrl: string;
  siteType: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  giftsPerUser: number;
  validationMethod: string;
  availabilityStartDate: string;
  availabilityEndDate: string;
  defaultGiftDaysAfterClose: number;
  defaultGiftId?: string;
  companyName: string;
  footerText: string;
  expiredMessage: string;
  gridColumns: number;
  sortOptions: string[];
  
  // Phase 1: ERP Integration Fields
  siteCode?: string;
  siteErpIntegration?: string;
  siteErpInstance?: string;
  siteShipFromCountry?: string;
  siteHrisSystem?: string;
  
  // Phase 2: Site Management Fields
  siteDropDownName?: string;
  siteCustomDomainUrl?: string;
  siteAccountManager?: string;
  siteAccountManagerEmail?: string;
  siteCelebrationsEnabled?: boolean;
  allowSessionTimeoutExtend?: boolean;
  enableEmployeeLogReport?: boolean;
  
  // Phase 3: Regional Client Information
  regionalClientOfficeName?: string;
  regionalClientContactName?: string;
  regionalClientContactEmail?: string;
  regionalClientContactPhone?: string;
  regionalClientAddressLine1?: string;
  regionalClientAddressLine2?: string;
  regionalClientAddressLine3?: string;
  regionalClientCity?: string;
  regionalClientCountryState?: string;
  regionalClientTaxId?: string;
  
  // Phase 4: Advanced Authentication
  disableDirectAccessAuth?: boolean;
  ssoProvider?: string;
  ssoClientOfficeName?: string;
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validates hex color format (#RRGGBB)
 */
export function isValidHexColor(color: string): boolean {
  if (!color) return false;
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Checks if a date is in the past
 */
export function isDateInPast(dateString: string): boolean {
  if (!dateString) return false;
  
  // Parse date string (YYYY-MM-DD format)
  const dateOnly = dateString.split('T')[0]; // Get just the date part
  const [year, month, day] = dateOnly.split('-').map(Number);
  const inputDate = new Date(year, month - 1, day); // Month is 0-indexed
  
  // Get today's date at midnight local time
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return inputDate < today;
}

/**
 * Validates date range (start must be before end)
 */
export function isValidDateRange(start: string, end: string): boolean {
  if (!start || !end) return true; // Optional dates are valid
  const startDate = new Date(start);
  const endDate = new Date(end);
  return startDate < endDate;
}

/**
 * Check for reserved URL words
 */
const RESERVED_URL_WORDS = [
  'admin', 'api', 'auth', 'dashboard', 'system', 'login', 'logout',
  'register', 'signup', 'signin', 'settings', 'config', 'manage',
  'internal', 'private', 'test', 'dev', 'staging', 'prod', 'production'
];

export function hasReservedWords(url: string): boolean {
  if (!url) return false;
  const urlLower = url.toLowerCase();
  return RESERVED_URL_WORDS.some(word => urlLower.includes(word));
}

/**
 * Main validation function for site configuration
 */
export function validateSiteConfiguration(data: SiteConfigData): ValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};
  const warnings: string[] = [];
  
  // ========== CRITICAL VALIDATIONS ==========
  
  // 1. Site Name (REQUIRED)
  if (!data.siteName?.trim()) {
    errors.push('Site name is required');
    fieldErrors.siteName = 'This field is required';
  } else if (data.siteName.length < 3) {
    errors.push('Site name must be at least 3 characters');
    fieldErrors.siteName = 'Minimum 3 characters required';
  } else if (data.siteName.length > 100) {
    errors.push('Site name must not exceed 100 characters');
    fieldErrors.siteName = 'Maximum 100 characters allowed';
  } else if (!/^[a-zA-Z0-9\s\-_&.']+$/.test(data.siteName)) {
    errors.push('Site name contains invalid characters');
    fieldErrors.siteName = 'Only letters, numbers, spaces, and basic punctuation allowed';
  }
  
  // 2. Site URL Slug (REQUIRED)
  if (!data.siteUrl?.trim()) {
    errors.push('Site URL slug is required');
    fieldErrors.siteUrl = 'This field is required';
  } else if (!isValidSlug(data.siteUrl)) {
    errors.push('Site URL slug must contain only lowercase letters, numbers, and hyphens');
    fieldErrors.siteUrl = 'Invalid format (e.g., techcorpus, my-company-2024)';
  } else if (data.siteUrl.length < 3) {
    errors.push('Site URL slug must be at least 3 characters');
    fieldErrors.siteUrl = 'Minimum 3 characters required';
  } else if (data.siteUrl.length > 50) {
    errors.push('Site URL slug must not exceed 50 characters');
    fieldErrors.siteUrl = 'Maximum 50 characters allowed';
  } else if (hasReservedWords(data.siteUrl)) {
    errors.push('Site URL slug contains reserved words which are not allowed');
    fieldErrors.siteUrl = 'This slug is reserved. Please choose a different one.';
  }
  
  // 3. Date Range Validation
  if (data.availabilityStartDate && data.availabilityEndDate) {
    if (!isValidDateRange(data.availabilityStartDate, data.availabilityEndDate)) {
      errors.push('Start date must be before end date');
      fieldErrors.availabilityStartDate = 'Must be before end date';
      fieldErrors.availabilityEndDate = 'Must be after start date';
    }
    
    // Warn if dates are in the past (don't block for existing campaigns)
    if (isDateInPast(data.availabilityEndDate)) {
      warnings.push('End date is in the past. Site may appear expired to users.');
    }
  }
  
  // ========== IMPORTANT VALIDATIONS ==========
  
  // 4. Color Hex Values
  if (!isValidHexColor(data.primaryColor)) {
    errors.push('Primary color must be a valid hex color');
    fieldErrors.primaryColor = 'Invalid format (use #RRGGBB, e.g., #D91C81)';
  }
  
  if (!isValidHexColor(data.secondaryColor)) {
    errors.push('Secondary color must be a valid hex color');
    fieldErrors.secondaryColor = 'Invalid format (use #RRGGBB)';
  }
  
  if (!isValidHexColor(data.tertiaryColor)) {
    errors.push('Tertiary color must be a valid hex color');
    fieldErrors.tertiaryColor = 'Invalid format (use #RRGGBB)';
  }
  
  // Check color contrast (warning only)
  if (data.primaryColor === data.secondaryColor) {
    warnings.push('Primary and secondary colors are the same. This may reduce visual distinction.');
  }
  
  // 5. Numeric Bounds
  if (data.giftsPerUser < 1) {
    errors.push('Gifts per user must be at least 1');
    fieldErrors.giftsPerUser = 'Minimum value is 1';
  } else if (data.giftsPerUser > 100) {
    errors.push('Gifts per user cannot exceed 100');
    fieldErrors.giftsPerUser = 'Maximum value is 100';
  } else if (data.giftsPerUser > 10) {
    warnings.push(`Gifts per user is set to ${data.giftsPerUser}. This is unusually high.`);
  }
  
  if (data.defaultGiftDaysAfterClose < 0) {
    errors.push('Days after close cannot be negative');
    fieldErrors.defaultGiftDaysAfterClose = 'Must be 0 or greater';
  } else if (data.defaultGiftDaysAfterClose > 365) {
    errors.push('Days after close cannot exceed 365');
    fieldErrors.defaultGiftDaysAfterClose = 'Maximum is 365 days';
  } else if (data.defaultGiftDaysAfterClose > 90) {
    warnings.push(`Days after close is ${data.defaultGiftDaysAfterClose}. Users may forget about their gift.`);
  }
  
  // 6. Grid Columns
  const validGridColumns = [2, 3, 4, 6];
  if (!validGridColumns.includes(data.gridColumns)) {
    errors.push('Grid columns must be 2, 3, 4, or 6');
    fieldErrors.gridColumns = 'Invalid value';
  }
  
  // 7. Sort Options (at least one)
  if (!data.sortOptions || data.sortOptions.length === 0) {
    errors.push('At least one sort option must be enabled');
    fieldErrors.sortOptions = 'Enable at least one sort option';
  }
  
  // ========== TEXT LENGTH VALIDATIONS ==========
  
  if (data.companyName && data.companyName.length > 100) {
    errors.push('Company name must not exceed 100 characters');
    fieldErrors.companyName = 'Maximum 100 characters';
  }
  
  if (data.footerText && data.footerText.length > 500) {
    errors.push('Footer text must not exceed 500 characters');
    fieldErrors.footerText = 'Maximum 500 characters';
  }
  
  if (data.expiredMessage && data.expiredMessage.length > 1000) {
    errors.push('Expired message must not exceed 1000 characters');
    fieldErrors.expiredMessage = 'Maximum 1000 characters';
  }
  
  // ========== BUSINESS LOGIC VALIDATIONS ==========
  
  // Warn if no default gift but days after close is set
  if (data.defaultGiftDaysAfterClose > 0 && !data.defaultGiftId) {
    warnings.push('Days after close is set but no default gift is selected');
  }
  
  // ========== ERP INTEGRATION VALIDATIONS (Phase 1) ==========
  
  // Site Code validation (alphanumeric, hyphens allowed)
  if (data.siteCode && data.siteCode.trim()) {
    if (!/^[a-zA-Z0-9\-]+$/.test(data.siteCode)) {
      errors.push('Site code can only contain letters, numbers, and hyphens');
      fieldErrors.siteCode = 'Invalid format (alphanumeric and hyphens only)';
    } else if (data.siteCode.length > 50) {
      errors.push('Site code must not exceed 50 characters');
      fieldErrors.siteCode = 'Maximum 50 characters';
    }
  }
  
  // ERP Integration validation
  const validErpSystems = ['NXJ', 'Fourgen', 'Netsuite', 'GRS', 'SAP', 'Oracle', 'Manual'];
  if (data.siteErpIntegration && !validErpSystems.includes(data.siteErpIntegration)) {
    errors.push('Invalid ERP system selected');
    fieldErrors.siteErpIntegration = `Must be one of: ${validErpSystems.join(', ')}`;
  }
  
  // Ship From Country validation (ISO 3166-1 alpha-2)
  if (data.siteShipFromCountry && data.siteShipFromCountry.trim()) {
    if (!/^[A-Z]{2}$/.test(data.siteShipFromCountry)) {
      errors.push('Ship from country must be a 2-letter country code');
      fieldErrors.siteShipFromCountry = 'Use 2-letter ISO code (e.g., US, CA, GB)';
    }
  }
  
  // ========== SITE MANAGEMENT VALIDATIONS (Phase 2) ==========
  
  // Site Drop Down Name length
  if (data.siteDropDownName && data.siteDropDownName.length > 100) {
    errors.push('Site dropdown name must not exceed 100 characters');
    fieldErrors.siteDropDownName = 'Maximum 100 characters';
  }
  
  // Custom Domain URL validation
  if (data.siteCustomDomainUrl && data.siteCustomDomainUrl.trim()) {
    if (!isValidUrl(data.siteCustomDomainUrl)) {
      errors.push('Custom domain URL must be a valid URL');
      fieldErrors.siteCustomDomainUrl = 'Invalid URL format';
    }
  }
  
  // Account Manager Email validation
  if (data.siteAccountManagerEmail && data.siteAccountManagerEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.siteAccountManagerEmail)) {
      errors.push('Account manager email is invalid');
      fieldErrors.siteAccountManagerEmail = 'Invalid email format';
    }
  }
  
  // ========== REGIONAL CLIENT INFO VALIDATIONS (Phase 3) ==========
  
  // Regional contact email validation
  if (data.regionalClientContactEmail && data.regionalClientContactEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.regionalClientContactEmail)) {
      errors.push('Regional contact email is invalid');
      fieldErrors.regionalClientContactEmail = 'Invalid email format';
    }
  }
  
  // Regional phone validation (basic)
  if (data.regionalClientContactPhone && data.regionalClientContactPhone.trim()) {
    // Allow common phone formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
    const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
    if (!phoneRegex.test(data.regionalClientContactPhone)) {
      errors.push('Regional contact phone contains invalid characters');
      fieldErrors.regionalClientContactPhone = 'Use numbers, spaces, and common punctuation only';
    }
  }
  
  // ========== SSO/AUTHENTICATION VALIDATIONS (Phase 4) ==========
  
  // Warn if direct access is disabled without SSO configured
  if (data.disableDirectAccessAuth && !data.ssoProvider) {
    warnings.push('Direct access is disabled but no SSO provider is configured. Users may not be able to access the site.');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    fieldErrors,
    warnings
  };
}

/**
 * Quick validation for individual fields
 */
export function validateField(fieldName: string, value: any): string | null {
  switch (fieldName) {
    case 'siteName':
      if (!value?.trim()) return 'Required';
      if (value.length < 3) return 'Minimum 3 characters';
      if (value.length > 100) return 'Maximum 100 characters';
      return null;
      
    case 'siteUrl':
      if (!value?.trim()) return 'Required';
      if (!isValidSlug(value)) return 'Invalid slug format (lowercase, numbers, hyphens only)';
      if (value.length < 3) return 'Minimum 3 characters';
      if (value.length > 50) return 'Maximum 50 characters';
      return null;
      
    case 'primaryColor':
    case 'secondaryColor':
    case 'tertiaryColor':
      if (!isValidHexColor(value)) return 'Invalid hex format (#RRGGBB)';
      return null;
      
    case 'giftsPerUser':
      if (value < 1) return 'Minimum 1';
      if (value > 100) return 'Maximum 100';
      return null;
      
    default:
      return null;
  }
}