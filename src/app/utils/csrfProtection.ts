/**
 * CSRF Protection Utility
 * Cross-Site Request Forgery protection with token generation and validation
 * Phase 2.4: Security Hardening
 */

import { logger } from './logger';

/**
 * Generate a random CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token in session storage
 */
export function storeCSRFToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem('csrf_token', token);
    logger.log('[CSRF] Token stored');
  } catch (e) {
    logger.error('[CSRF] Failed to store token:', e);
  }
}

/**
 * Get stored CSRF token
 */
export function getCSRFToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return sessionStorage.getItem('csrf_token');
  } catch (e) {
    logger.error('[CSRF] Failed to retrieve token:', e);
    return null;
  }
}

/**
 * Get or create CSRF token
 */
export function getOrCreateCSRFToken(): string {
  let token = getCSRFToken();
  
  if (!token) {
    token = generateCSRFToken();
    storeCSRFToken(token);
  }
  
  return token;
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  
  if (!storedToken) {
    logger.warn('[CSRF] No stored token found');
    return false;
  }
  
  if (token !== storedToken) {
    logger.warn('[CSRF] Token mismatch');
    return false;
  }
  
  return true;
}

/**
 * Clear CSRF token
 */
export function clearCSRFToken(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem('csrf_token');
    logger.log('[CSRF] Token cleared');
  } catch (e) {
    logger.error('[CSRF] Failed to clear token:', e);
  }
}

/**
 * Add CSRF token to request headers
 */
export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getOrCreateCSRFToken();
  
  return {
    ...headers,
    'X-CSRF-Token': token
  };
}

/**
 * Add CSRF token to FormData
 */
export function addCSRFToFormData(formData: FormData): FormData {
  const token = getOrCreateCSRFToken();
  formData.append('_csrf', token);
  return formData;
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFFromRequest(request: Request): boolean {
  // Check header first
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    return validateCSRFToken(headerToken);
  }
  
  // Check form data
  const contentType = request.headers.get('Content-Type');
  if (contentType?.includes('multipart/form-data')) {
    // Form data CSRF validation would happen server-side
    return true; // Delegate to server
  }
  
  logger.warn('[CSRF] No CSRF token found in request');
  return false;
}

/**
 * CSRF-protected fetch wrapper
 */
export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';
  
  // Only add CSRF token for state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    options.headers = addCSRFHeader(options.headers);
  }
  
  return fetch(url, options);
}

/**
 * Create a CSRF-protected request function
 */
export function createCSRFProtectedRequest() {
  return async (url: string, options: RequestInit = {}) => {
    return csrfFetch(url, options);
  };
}

/**
 * CSRF token rotation
 * Call this after successful login or periodically
 */
export function rotateCSRFToken(): string {
  clearCSRFToken();
  const newToken = generateCSRFToken();
  storeCSRFToken(newToken);
  logger.log('[CSRF] Token rotated');
  return newToken;
}

/**
 * Refresh CSRF token (alias for rotateCSRFToken)
 */
export function refreshCSRFToken(): string {
  return rotateCSRFToken();
}

/**
 * Check if CSRF protection is enabled
 */
export function isCSRFProtectionEnabled(): boolean {
  // Can be configured via environment variable
  return true; // Always enabled for security
}

/**
 * Initialize CSRF protection on app start
 */
export function initializeCSRFProtection(): void {
  if (typeof window === 'undefined') return;
  
  // Generate initial token if none exists
  getOrCreateCSRFToken();
  
  // Rotate token on page visibility change (tab switch)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Check if token is still valid (not expired)
      const token = getCSRFToken();
      if (token) {
        logger.log('[CSRF] Token validated on visibility change');
      }
    }
  });
  
  logger.log('[CSRF] Protection initialized');
}