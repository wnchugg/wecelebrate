/**
 * Common Helper Functions for Routes
 * Phase 3: Backend Refactoring
 */

import type { Context } from 'npm:hono@4.0.2';
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ErrorResponse, SuccessResponse, AuditLogEntry } from './types.ts';
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
 */
export function snakeToCamel(str: string): string {
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
    'settings', // Not in current schema
    'type', // Not in current schema
    'headerFooterConfig', // UX customization - not in schema yet
    'brandingAssets', // UX customization - not in schema yet
    'giftSelectionConfig', // UX customization - not in schema yet
    'reviewScreenConfig', // UX customization - not in schema yet
    'orderTrackingConfig', // UX customization - not in schema yet
  ]);
  
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(input)) {
    // Skip ignored fields
    if (ignoredFields.has(key)) {
      continue;
    }
    
    // Use mapping if available, otherwise convert to snake_case
    const dbColumn = fieldMapping[key] || camelToSnake(key);
    result[dbColumn] = value;
  }
  
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
