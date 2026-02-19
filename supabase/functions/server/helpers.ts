/**
 * Common Helper Functions for Routes
 * Phase 3: Backend Refactoring
 */

import type { Context } from 'npm:hono@4.0.2';
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ErrorResponse, SuccessResponse, AuditLogEntry } from './types.ts';

// ===== Client Field Error Codes =====

export enum ClientErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_FORMAT = 'INVALID_FIELD_FORMAT',
  DUPLICATE_CLIENT_CODE = 'DUPLICATE_CLIENT_CODE',
  CLIENT_NOT_FOUND = 'CLIENT_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSFORMATION_ERROR = 'TRANSFORMATION_ERROR',
}

export interface ClientErrorResponse {
  success: false;
  error: {
    code: ClientErrorCode;
    message: string;
    field?: string;
    details?: any;
  };
}

/**
 * Creates a structured error response for client operations
 * Requirements: 5.4
 */
export function clientErrorResponse(
  c: Context,
  code: ClientErrorCode,
  message: string,
  field?: string,
  details?: any
): Response {
  const status = getStatusForErrorCode(code);
  const response: ClientErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(field && { field }),
      ...(details && { details }),
    },
  };
  return c.json(response, status);
}

/**
 * Maps error codes to HTTP status codes
 */
function getStatusForErrorCode(code: ClientErrorCode): number {
  switch (code) {
    case ClientErrorCode.VALIDATION_ERROR:
    case ClientErrorCode.MISSING_REQUIRED_FIELD:
    case ClientErrorCode.INVALID_FIELD_FORMAT:
      return 400;
    case ClientErrorCode.DUPLICATE_CLIENT_CODE:
      return 409;
    case ClientErrorCode.CLIENT_NOT_FOUND:
      return 404;
    case ClientErrorCode.DATABASE_ERROR:
    case ClientErrorCode.TRANSFORMATION_ERROR:
      return 500;
    default:
      return 500;
  }
}

import { auditLog } from './security.ts';

// ===== Response Helpers =====

export function successResponse<T>(
  c: Context,
  data?: T,
  message?: string,
  status = 200
): Response {
  const response: SuccessResponse<T> = { success: true };
  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  return c.json(response, status);
}

export function errorResponse(
  c: Context,
  error: string,
  status = 400,
  details?: Record<string, any>
): Response {
  const response: ErrorResponse = { error };
  if (details) response.details = details;
  return c.json(response, status);
}

export function notFoundResponse(c: Context, resource: string): Response {
  return errorResponse(c, `${resource} not found`, 404);
}

export function unauthorizedResponse(c: Context, message = 'Unauthorized'): Response {
  return errorResponse(c, message, 401);
}

export function forbiddenResponse(c: Context, message = 'Forbidden'): Response {
  return errorResponse(c, message, 403);
}

export function serverErrorResponse(
  c: Context,
  error: any,
  logContext?: string
): Response {
  if (logContext) {
    console.error(`${logContext}:`, error);
  } else {
    console.error('Server error:', error);
  }
  
  const isDevelopment = Deno.env.get('DENO_ENV') !== 'production';
  const details = isDevelopment ? { message: error.message } : undefined;
  
  return errorResponse(c, 'Internal server error', 500, details);
}

// ===== Context Helpers =====

export function getEnvironmentId(c: Context): string {
  return c.get('environmentId') || c.req.header('X-Environment-ID') || 'development';
}

export function getUserId(c: Context): string | undefined {
  return c.get('userId');
}

export function getUserEmail(c: Context): string | undefined {
  return c.get('userEmail');
}

export function getRequestIp(c: Context): string | undefined {
  return c.req.header('x-forwarded-for') || c.req.header('x-real-ip');
}

export function getUserAgent(c: Context): string | undefined {
  return c.req.header('user-agent');
}

// ===== Audit Logging Helpers =====

export async function logSuccess(
  action: string,
  c: Context,
  details?: Record<string, any>
): Promise<void> {
  await auditLog({
    action,
    userId: getUserId(c),
    status: 'success',
    ip: getRequestIp(c),
    userAgent: getUserAgent(c),
    details,
  });
}

export async function logFailure(
  action: string,
  c: Context,
  error: string,
  details?: Record<string, any>
): Promise<void> {
  await auditLog({
    action,
    userId: getUserId(c),
    status: 'failure',
    ip: getRequestIp(c),
    userAgent: getUserAgent(c),
    details: { ...details, error },
  });
}

// ===== Pagination Helpers =====

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function getPaginationParams(c: Context): PaginationParams {
  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '50')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function paginatedResponse<T>(
  c: Context,
  data: T[],
  total: number,
  params: PaginationParams
): Response {
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
  return c.json(response);
}

// ===== Date Helpers =====

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function parseOptionalDate(dateString?: string): string | undefined {
  if (!dateString) return undefined;
  if (!isValidDate(dateString)) {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  return new Date(dateString).toISOString();
}

// ===== Key-Value Store Helpers =====

/**
 * Converts camelCase to snake_case for database storage
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Converts snake_case to camelCase for API responses
 * Preserves properties starting with underscore (e.g., _hasUnpublishedChanges)
 */
export function snakeToCamel(str: string): string {
  // If the string starts with underscore, preserve it
  if (str.startsWith('_')) {
    return str;
  }
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts object keys from camelCase to snake_case
 */
export function objectToSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value;
  }
  return result;
}

/**
 * Maps frontend Client fields to database column names
 * Handles the "client_" prefix and special cases
 * Requirements: 5.4
 */
export function mapClientFieldsToDatabase(input: Record<string, any>): Record<string, any> {
  const fieldMapping: Record<string, string> = {
    // Special cases (no client_ prefix)
    'id': 'id',
    'name': 'name',
    'contactEmail': 'contact_email',
    'status': 'status',
    'technologyOwner': 'technology_owner',
    'technologyOwnerEmail': 'technology_owner_email',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    
    // Standard fields (with client_ prefix)
    'clientCode': 'client_code',
    'clientRegion': 'client_region',
    'clientSourceCode': 'client_source_code',
    'clientContactName': 'client_contact_name',
    'clientContactPhone': 'client_contact_phone',
    'clientTaxId': 'client_tax_id',
    'clientAddressLine1': 'client_address_line_1',
    'clientAddressLine2': 'client_address_line_2',
    'clientAddressLine3': 'client_address_line_3',
    'clientCity': 'client_city',
    'clientPostalCode': 'client_postal_code',
    'clientCountryState': 'client_country_state',
    'clientCountry': 'client_country',
    'clientAccountManager': 'client_account_manager',
    'clientAccountManagerEmail': 'client_account_manager_email',
    'clientImplementationManager': 'client_implementation_manager',
    'clientImplementationManagerEmail': 'client_implementation_manager_email',
    'clientUrl': 'client_url',
    'clientAllowSessionTimeoutExtend': 'client_allow_session_timeout_extend',
    'clientAuthenticationMethod': 'client_authentication_method',
    'clientCustomUrl': 'client_custom_url',
    'clientHasEmployeeData': 'client_has_employee_data',
    'clientInvoiceType': 'client_invoice_type',
    'clientInvoiceTemplateType': 'client_invoice_template_type',
    'clientPoType': 'client_po_type',
    'clientPoNumber': 'client_po_number',
    'clientErpSystem': 'client_erp_system',
    'clientSso': 'client_sso',
    'clientHrisSystem': 'client_hris_system',
  };

  const result: Record<string, any> = {};
  const unknownFields: string[] = [];
  
  try {
    for (const [key, value] of Object.entries(input)) {
      const dbColumn = fieldMapping[key];
      if (dbColumn) {
        result[dbColumn] = value;
      } else {
        unknownFields.push(key);
        console.warn(
          `[mapClientFieldsToDatabase] Unknown field encountered\n` +
          `  Timestamp: ${new Date().toISOString()}\n` +
          `  Field: ${key}\n` +
          `  Value: ${JSON.stringify(value)}\n` +
          `  Operation: toDatabase`
        );
      }
    }
    
    if (unknownFields.length > 0) {
      console.warn(
        `[mapClientFieldsToDatabase] Summary: ${unknownFields.length} unknown field(s) ignored: ${unknownFields.join(', ')}`
      );
    }
  } catch (error) {
    console.error(
      `[mapClientFieldsToDatabase] Transformation error\n` +
      `  Timestamp: ${new Date().toISOString()}\n` +
      `  Input: ${JSON.stringify(input)}\n` +
      `  Error: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
  
  return result;
}

/**
 * Maps database Client columns to frontend field names
 * Handles the "client_" prefix and special cases
 * Requirements: 5.4
 */
export function mapClientFieldsFromDatabase(dbRow: Record<string, any>): Record<string, any> {
  const reverseMapping: Record<string, string> = {
    // Special cases (no client_ prefix)
    'id': 'id',
    'name': 'name',
    'contact_email': 'contactEmail',
    'status': 'status',
    'technology_owner': 'technologyOwner',
    'technology_owner_email': 'technologyOwnerEmail',
    'created_at': 'createdAt',
    'updated_at': 'updatedAt',
    
    // Standard fields (with client_ prefix)
    'client_code': 'clientCode',
    'client_region': 'clientRegion',
    'client_source_code': 'clientSourceCode',
    'client_contact_name': 'clientContactName',
    'client_contact_phone': 'clientContactPhone',
    'client_tax_id': 'clientTaxId',
    'client_address_line_1': 'clientAddressLine1',
    'client_address_line_2': 'clientAddressLine2',
    'client_address_line_3': 'clientAddressLine3',
    'client_city': 'clientCity',
    'client_postal_code': 'clientPostalCode',
    'client_country_state': 'clientCountryState',
    'client_country': 'clientCountry',
    'client_account_manager': 'clientAccountManager',
    'client_account_manager_email': 'clientAccountManagerEmail',
    'client_implementation_manager': 'clientImplementationManager',
    'client_implementation_manager_email': 'clientImplementationManagerEmail',
    'client_url': 'clientUrl',
    'client_allow_session_timeout_extend': 'clientAllowSessionTimeoutExtend',
    'client_authentication_method': 'clientAuthenticationMethod',
    'client_custom_url': 'clientCustomUrl',
    'client_has_employee_data': 'clientHasEmployeeData',
    'client_invoice_type': 'clientInvoiceType',
    'client_invoice_template_type': 'clientInvoiceTemplateType',
    'client_po_type': 'clientPoType',
    'client_po_number': 'clientPoNumber',
    'client_erp_system': 'clientErpSystem',
    'client_sso': 'clientSso',
    'client_hris_system': 'clientHrisSystem',
  };

  const result: Record<string, any> = {};
  const unmappedFields: string[] = [];
  
  try {
    for (const [key, value] of Object.entries(dbRow)) {
      const frontendField = reverseMapping[key];
      if (frontendField) {
        result[frontendField] = value;
      } else {
        unmappedFields.push(key);
        // Only log if it's not a system field we expect to ignore
        if (!['isActive', 'description', 'contactPhone', 'address'].includes(key)) {
          console.warn(
            `[mapClientFieldsFromDatabase] Unmapped database field\n` +
            `  Timestamp: ${new Date().toISOString()}\n` +
            `  Field: ${key}\n` +
            `  Value: ${JSON.stringify(value)}\n` +
            `  Operation: fromDatabase`
          );
        }
      }
    }
  } catch (error) {
    console.error(
      `[mapClientFieldsFromDatabase] Transformation error\n` +
      `  Timestamp: ${new Date().toISOString()}\n` +
      `  Input: ${JSON.stringify(dbRow)}\n` +
      `  Error: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
  
  return result;
}

/**
 * Maps frontend Site fields to database column names and filters out non-existent fields
 * This handles the mismatch between frontend camelCase names and database snake_case columns
 */
export function mapSiteFieldsToDatabase(input: Record<string, any>): Record<string, any> {
  const fieldMapping: Record<string, string> = {
    // Direct mappings (camelCase -> snake_case)
    'clientId': 'client_id',
    'catalogId': 'catalog_id',
    'name': 'name',
    'slug': 'slug',
    'status': 'status',
    'validationMethods': 'validation_methods',
    'branding': 'branding',
    'selectionStartDate': 'selection_start_date',
    'selectionEndDate': 'selection_end_date',

    // ERP Integration Fields
    'siteCode': 'site_code',
    'siteErpIntegration': 'site_erp_integration',
    'siteErpInstance': 'site_erp_instance',
    'siteShipFromCountry': 'site_ship_from_country',
    'siteHrisSystem': 'site_hris_system',

    // Site Management Fields
    'siteDropDownName': 'site_drop_down_name',
    'siteCustomDomainUrl': 'site_custom_domain_url',
    'siteAccountManager': 'site_account_manager',
    'siteAccountManagerEmail': 'site_account_manager_email',
    'siteCelebrationsEnabled': 'site_celebrations_enabled',
    'allowSessionTimeoutExtend': 'allow_session_timeout_extend',
    'enableEmployeeLogReport': 'enable_employee_log_report',

    // Regional Client Info
    'regionalClientInfo': 'regional_client_info',

    // Advanced Authentication
    'disableDirectAccessAuth': 'disable_direct_access_auth',
    'ssoProvider': 'sso_provider',
    'ssoClientOfficeName': 'sso_client_office_name',

    // Timestamps
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
  };

  // Fields that should be ignored (don't exist in database)
  const ignoredFields = new Set([
    'id', // Never update ID
    'domain', // Doesn't exist - use siteCustomDomainUrl instead
    'isActive', // Computed from status
    'type', // Not in current schema
    'headerFooterConfig', // UX customization - not in schema yet
    'brandingAssets', // UX customization - not in schema yet
    'giftSelectionConfig', // UX customization - not in schema yet
    'reviewScreenConfig', // UX customization - not in schema yet
    'orderTrackingConfig', // UX customization - not in schema yet
  ]);

  const result: Record<string, any> = {};

  console.log('[mapSiteFieldsToDatabase] Input settings:', input.settings);

  // Extract settings fields that have dedicated database columns
  if (input.settings && typeof input.settings === 'object') {
    // Phase 1: Critical fields with database columns
    if ('skipLandingPage' in input.settings) {
      result.skip_landing_page = input.settings.skipLandingPage;
    }
    if ('giftsPerUser' in input.settings) {
      result.gifts_per_user = input.settings.giftsPerUser;
    }
    if ('defaultLanguage' in input.settings) {
      result.default_language = input.settings.defaultLanguage;
    }
    if ('defaultCurrency' in input.settings) {
      result.default_currency = input.settings.defaultCurrency;
    }
    if ('defaultCountry' in input.settings) {
      result.default_country = input.settings.defaultCountry;
    }
    if ('allowQuantitySelection' in input.settings) {
      result.allow_quantity_selection = input.settings.allowQuantitySelection;
    }
    if ('showPricing' in input.settings) {
      result.show_pricing = input.settings.showPricing;
    }
    if ('defaultGiftId' in input.settings) {
      result.default_gift_id = input.settings.defaultGiftId;
    }
    if ('skipReviewPage' in input.settings) {
      result.skip_review_page = input.settings.skipReviewPage;
    }
    if ('expiredMessage' in input.settings) {
      result.expired_message = input.settings.expiredMessage;
    }
    if ('defaultGiftDaysAfterClose' in input.settings) {
      result.default_gift_days_after_close = input.settings.defaultGiftDaysAfterClose;
    }

    // Map availability dates to selection dates (database columns already exist!)
    if ('availabilityStartDate' in input.settings) {
      result.selection_start_date = input.settings.availabilityStartDate;
    }
    if ('availabilityEndDate' in input.settings) {
      result.selection_end_date = input.settings.availabilityEndDate;
    }

    console.log('[mapSiteFieldsToDatabase] Extracted settings fields:', {
      skip_landing_page: result.skip_landing_page,
      gifts_per_user: result.gifts_per_user,
      default_language: result.default_language,
      default_currency: result.default_currency,
      default_country: result.default_country,
      selection_start_date: result.selection_start_date,
      selection_end_date: result.selection_end_date,
    });
  }

  for (const [key, value] of Object.entries(input)) {
    // Skip ignored fields and settings object (we extract what we need above)
    if (ignoredFields.has(key) || key === 'settings') {
      continue;
    }

    // Use mapping if available, otherwise convert to snake_case
    const dbColumn = fieldMapping[key] || camelToSnake(key);
    result[dbColumn] = value;
  }

  console.log('[mapSiteFieldsToDatabase] Final mapped fields count:', Object.keys(result).length);

  return result;
}

/**
 * Converts object keys from snake_case to camelCase
 */
export function objectToCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value;
  }
  return result;
}

// ===== ID Generation =====

/**
 * Generates a unique ID for database records
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Generates a secure random token
 */
export function generateToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// ===== Environment-aware Supabase Client =====

export interface SupabaseConfig {
  url: string;
  key: string;
}

/**
 * Get Supabase configuration for the given environment
 */
export function getSupabaseConfig(environmentId: string): SupabaseConfig {
  const PRODUCTION_URL = Deno.env.get('SUPABASE_URL_PROD') || 'https://lmffeqwhrnbsbhdztwyv.supabase.co';
  const PRODUCTION_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY_PROD');

  if (environmentId === 'production' && PRODUCTION_KEY) {
    return {
      url: PRODUCTION_URL,
      key: PRODUCTION_KEY,
    };
  }

  // Default to development
  return {
    url: Deno.env.get('SUPABASE_URL') ?? '',
    key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  };
}


/**
 * Merge draft settings over live site data for admin view
 * When draft_settings exists, it contains unpublished changes
 */
export function mergeDraftSettings(site: any): any {
  if (!site.draft_settings) {
    // No draft changes, return site as-is with flag
    return {
      ...site,
      _hasUnpublishedChanges: false
    };
  }
  
  // Merge draft settings over live data
  const merged = {
    ...site,
    ...site.draft_settings,  // Draft values override live values
    _hasUnpublishedChanges: true,
    _draftSettings: site.draft_settings  // Keep original for reference
  };
  
  return merged;
}

/**
 * Extract live-only data (remove draft_settings for public view)
 */
export function extractLiveData(site: any): any {
  const { draft_settings, _hasUnpublishedChanges, _draftSettings, ...liveData } = site;
  return liveData;
}

/**
 * Build draft settings object from update input
 * This stores changes in draft_settings column instead of live columns
 */
export function buildDraftSettings(currentDraft: any, updates: any): any {
  // Start with current draft (or empty object)
  const draft = currentDraft || {};
  
  // Merge new updates into draft
  const newDraft = {
    ...draft,
    ...updates
  };
  
  // Remove status field from draft (status is always live)
  delete newDraft.status;
  delete newDraft.draft_settings;
  delete newDraft._hasUnpublishedChanges;
  delete newDraft._draftSettings;
  
  return newDraft;
}
