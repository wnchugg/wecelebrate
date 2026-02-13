/**
 * Utility Functions Index
 * Central export point for all utility functions
 * Uses selective exports to avoid conflicts
 */

// ============================================================================
// EXPLICIT DISAMBIGUATION EXPORTS
// These resolve TS2308 conflicts between modules that export the same names.
// The explicit named export takes precedence over export * re-exports.
// ============================================================================

// --- Error handling (from errorHandling, not apiResponseGuards) ---
export {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  handleCatchError,
  extractErrorMessage,
  withErrorHandling,
  asyncTryCatch,
  assertError,
  isNetworkError,
  isAuthError,
  isValidationError,
  formatErrorForLogging,
} from './errorHandling';

export { getErrorDetails } from './errorUtils';

// --- Type guards vs stringUtils vs arrayUtils vs others ---
export { isEmail, isUrl } from './typeGuards';
export { isNotEmpty } from './typeGuards';
export { isInRange } from './typeGuards';

// --- Validators vs security vs frontendSecurity ---
export { sanitizeInput, validateEmail, validateFile, validatePassword, validatePhone } from './validators';

// --- Security vs csrfProtection vs frontendSecurity vs rateLimiter vs securityLogger ---
export { generateCSRFToken } from './csrfProtection';
export { generateCsrfToken } from './security';
export { checkRateLimit } from './rateLimiter';
export { logSecurityEvent } from './securityLogger';
export { sanitizeUrl, secureStorage } from './security';
export { validatePasswordStrength } from './security';
export { isValidUrl, sanitizeString } from './frontendSecurity';

// --- Countries vs currency ---
export { convertCurrency } from './currency';
export { formatCurrency } from './countries';

// --- stringUtils vs frontendSecurity (escapeHtml) ---
export { escapeHtml } from './stringUtils';

// --- stringUtils vs numberUtils (truncate) ---
export { truncate } from './stringUtils';

// --- stringUtils vs arrayUtils (reverse) ---
export { reverse } from './stringUtils';

// --- numberUtils vs arrayUtils ---
export { average, max, min, range, sum } from './arrayUtils';

// --- domUtils vs clipboard ---
export { copyToClipboard } from './clipboard';

// --- reactUtils vs reactComponentUtils vs testUtils ---
export { cloneElementWithProps, filterChildrenByType, findChildByType, isReactElement, renderChildren } from './reactComponentUtils';

// --- navigationUtils vs urlUtils vs url ---
export { buildUrl, getBaseUrl, getQueryParam, isAbsoluteUrl, isRelativeUrl, joinPaths, parseUrl } from './navigationUtils';
export { getQueryParams, removeQueryParam } from './navigationUtils';
export { getDomain } from './url';

// --- numberUtils vs fileUtils (formatFileSize) ---
export { formatFileSize } from './fileUtils';

// --- fileUtils vs configImportExport (downloadCSV) ---
export { downloadCSV } from './fileUtils';

// --- formSchemas vs validationUtils ---
export { isValidEmail, isValidHexColor } from './validationUtils';

// --- configImportExport vs bulkImport (ImportResult) ---
export type { ImportResult } from './bulkImport';

// --- objectUtils vs arrayUtils (flatten, isEmpty) ---
export { flatten, isEmpty } from './arrayUtils';

// ============================================================================
// API UTILITIES
// ============================================================================
export * from './api';
export * from './apiCache';

// ============================================================================
// TYPE UTILITIES
// ============================================================================
export * from './typeGuards';
export * from './typeUtils';
export * from './validators';

// ============================================================================
// SECURITY UTILITIES
// ============================================================================
export * from './csrfProtection';
export * from './fileSecurityHelpers';
export * from './security';
export * from './frontendSecurity';

// ============================================================================
// DATA UTILITIES
// ============================================================================
export * from './countries';
export * from './currency';
export * from './availability';
export * from './clipboard';

// ============================================================================
// STRING, NUMBER, ARRAY UTILITIES
// ============================================================================
export * from './stringUtils';
export * from './numberUtils';
export * from './arrayUtils';
export * from './dateUtils';

// ============================================================================
// DOM, EVENT, AND ASYNC UTILITIES
// ============================================================================
export * from './domUtils';
export * from './eventUtils';
export * from './asyncUtils';

// ============================================================================
// STORAGE UTILITIES
// ============================================================================
export * from './storage';

// ============================================================================
// REACT UTILITIES
// ============================================================================
export * from './reactUtils';
export * from './reactOptimizations';
export * from './reactComponentUtils';

// ============================================================================
// NAVIGATION AND URL UTILITIES
// ============================================================================
export * from './navigationUtils';
export * from './urlUtils';
export * from './url';

// ============================================================================
// TESTING UTILITIES
// ============================================================================
export * from './testUtils';

// ============================================================================
// CONFIG AND VALIDATION
// ============================================================================
export {
  isPaginatedResponse,
  isClient,
  isSite,
  isGift,
  isEmployee,
  isOrder,
  validateApiResponse,
  validatePaginatedResponse,
  handleApiResponse,
  isNotFoundError,
  isServerError,
  normalizeApiError,
  createApiError,
  retryApiRequest,
  batchApiRequests,
  transformApiResponse,
  mergeApiResponses,
} from './apiResponseGuards';
export * from './fileUtils';
export * from './configImportExport';
export * from './loaders';
export * from './sessionManager';

// ============================================================================
// FORM AND VALIDATION UTILITIES
// ============================================================================
export * from './formSchemas';
export * from './validationUtils';

// ============================================================================
// PERFORMANCE AND MONITORING
// ============================================================================
export * from './performanceMonitor';

// ============================================================================
// RATE LIMITING
// ============================================================================
export * from './rateLimiter';

// ============================================================================
// SECURITY LOGGING
// ============================================================================
export * from './securityLogger';

// ============================================================================
// MOCK DATA GENERATORS (for testing)
// ============================================================================
export * from './mockDataGenerators';

// ============================================================================
// CATALOG UTILITIES
// ============================================================================
export * from './catalog-validation';
export * from './bulkImport';
export * from './emailTemplates';
export * from './configMerge';
export * from './objectUtils';
export * from './siteConfigValidation';
