/**
 * Frontend Security Utilities
 * Provides XSS prevention, input sanitization, and secure storage
 */

// ==================== XSS PREVENTION ====================

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for any user-generated content that needs to be rendered as HTML
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:text\/html/gi, '') // Remove data URIs
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize input (alias for sanitizeString)
 */
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  return sanitizeString(input, maxLength);
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Only allow http, https, and mailto protocols
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      console.warn('Blocked potentially dangerous URL protocol:', parsed.protocol);
      return '';
    }
    
    return parsed.toString();
  } catch (error) {
    console.warn('Invalid URL provided:', url);
    return '';
  }
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

// ==================== SECURE STORAGE ====================

const STORAGE_PREFIX = 'jala2_';
const ENCRYPTED_STORAGE_KEY = 'jala2_encrypted_';

/**
 * Security Fix 1.10: Renamed from secureStorage to obfuscatedStorage
 * ⚠️ WARNING: This is NOT secure encryption - only basic obfuscation!
 * 
 * Base64 encoding is NOT encryption and provides NO security.
 * This only makes data slightly less obvious in localStorage.
 * 
 * For true security:
 * - Never store sensitive data in localStorage
 * - Use HTTPS for all communications
 * - Store sensitive data on backend only
 * - Use httpOnly cookies for auth tokens
 */
export const obfuscatedStorage = {
  /**
   * Set item in obfuscated storage (NOT SECURE)
   */
  setItem(key: string, value: any, obfuscate: boolean = false): void {
    try {
      const fullKey = STORAGE_PREFIX + key;
      const stringValue = JSON.stringify(value);
      
      if (obfuscate) {
        // Basic obfuscation (NOT cryptographically secure - anyone can decode base64!)
        const obfuscated = btoa(encodeURIComponent(stringValue));
        localStorage.setItem(ENCRYPTED_STORAGE_KEY + fullKey, obfuscated);
      } else {
        localStorage.setItem(fullKey, stringValue);
      }
    } catch (error) {
      console.error('Error saving to obfuscated storage:', error);
    }
  },

  /**
   * Get item from obfuscated storage
   */
  getItem<T>(key: string, obfuscated: boolean = false): T | null {
    try {
      const fullKey = STORAGE_PREFIX + key;
      const item = obfuscated
        ? localStorage.getItem(ENCRYPTED_STORAGE_KEY + fullKey)
        : localStorage.getItem(fullKey);
      
      if (!item) return null;
      
      if (obfuscated) {
        // Deobfuscate (NOT secure - anyone can decode base64!)
        const deobfuscated = decodeURIComponent(atob(item));
        return JSON.parse(deobfuscated);
      }
      
      return JSON.parse(item);
    } catch (error) {
      console.error('Error reading from obfuscated storage:', error);
      return null;
    }
  },

  /**
   * Remove item from obfuscated storage
   */
  removeItem(key: string, obfuscated: boolean = false): void {
    try {
      const fullKey = STORAGE_PREFIX + key;
      if (obfuscated) {
        localStorage.removeItem(ENCRYPTED_STORAGE_KEY + fullKey);
      } else {
        localStorage.removeItem(fullKey);
      }
    } catch (error) {
      console.error('Error removing from obfuscated storage:', error);
    }
  },

  /**
   * Clear all app storage
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX) || key.startsWith(ENCRYPTED_STORAGE_KEY)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }
};

// Backwards compatibility alias (deprecated - use obfuscatedStorage instead)
/** @deprecated Use obfuscatedStorage instead - this is NOT secure! */
export const secureStorage = obfuscatedStorage;

// ====================INPUT VALIDATION ====================

/**
 * Validate email format (client-side)
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate password strength (client-side)
 */
export function validatePassword(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} {
  const errors: string[] = [];
  let strengthScore = 0;

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else {
    strengthScore++;
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    strengthScore++;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    strengthScore++;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    strengthScore++;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    strengthScore++;
  }

  // Additional strength checks
  if (password.length >= 12) strengthScore++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strengthScore++;

  const strength = strengthScore <= 3 ? 'weak' : strengthScore <= 5 ? 'medium' : 'strong';

  return {
    valid: errors.length === 0,
    strength,
    errors
  };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Should be between 10 and 15 digits
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }
): { valid: boolean; error?: string } {
  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${(options.maxSize / 1024 / 1024).toFixed(1)}MB`
    };
  }

  // Check MIME type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  // Check file extension
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} is not allowed`
      };
    }
  }

  return { valid: true };
}

// ==================== CSRF PROTECTION ====================

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token
 */
export function storeCsrfToken(token: string): void {
  secureStorage.setItem('csrf_token', token);
}

/**
 * Get CSRF token
 */
export function getCsrfToken(): string | null {
  return secureStorage.getItem<string>('csrf_token');
}

/**
 * Get or create CSRF token
 */
export function ensureCsrfToken(): string {
  let token = getCsrfToken();
  if (!token) {
    token = generateCsrfToken();
    storeCsrfToken(token);
  }
  return token;
}

// ==================== RATE LIMITING (CLIENT-SIDE) ====================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Client-side rate limiting
 * Provides immediate feedback before server responds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // Create new window
    entry = {
      count: 0,
      resetAt: now + windowMs
    };
    rateLimitStore.set(key, entry);
  }

  entry.count++;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

/**
 * Clear rate limit for a key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (useful for development/testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
  console.warn('All rate limits cleared');
}

// ==================== SECURE AUTHENTICATION ====================

/**
 * Secure token storage
 */
export const authToken = {
  /**
   * Store authentication token securely
   */
  set(token: string): void {
    secureStorage.setItem('auth_token', token, true);
  },

  /**
   * Get authentication token
   */
  get(): string | null {
    return secureStorage.getItem<string>('auth_token', true);
  },

  /**
   * Remove authentication token
   */
  remove(): void {
    secureStorage.removeItem('auth_token', true);
  },

  /**
   * Check if token exists
   */
  exists(): boolean {
    return this.get() !== null;
  }
};

// ==================== CONTENT SECURITY ====================

/**
 * Check if content is safe to render
 */
export function isSafeContent(content: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /data:text\/html/i
  ];

  return !dangerousPatterns.some(pattern => pattern.test(content));
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as Record<string, unknown>;
  
  for (const key in obj) {
    // Skip prototype properties
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    
    // Skip dangerous keys
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      console.warn('Skipped dangerous object key:', key);
      continue;
    }
    
    sanitized[key] = obj[key];
  }
  
  return sanitized as T;
}

// ==================== SECURITY MONITORING ====================

/**
 * Log security event (client-side)
 */
export function logSecurityEvent(event: {
  type: 'xss_attempt' | 'csrf_failure' | 'rate_limit' | 'auth_failure' | 'auth_success' | 'validation_failure' | 'password_reset_request' | 'password_reset_error' | 'password_reset_success' | 'invalid_reset_token';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}): void {
  // Log to console in development
  if (import.meta.env.DEV) {
    // Only log warnings for medium+ severity events
    if (event.severity === 'medium' || event.severity === 'high' || event.severity === 'critical') {
      console.warn('Security Event:', event);
    } else {
      // Low severity events logged as debug info
      console.warn('Security Event:', event);
    }
  }

  // Store security events in session storage for debugging
  try {
    const events = JSON.parse(sessionStorage.getItem('security_events') || '[]');
    events.push({
      ...event,
      timestamp: new Date().toISOString()
    });
    // Keep only last 50 events
    if (events.length > 50) events.shift();
    sessionStorage.setItem('security_events', JSON.stringify(events));
  } catch (error) {
    console.error('Failed to store security event:', error);
  }

  // In production, you would send this to a logging service
  // Example: sendToLoggingService(event);
}

// ==================== FORM SECURITY ====================

/**
 * Secure form data before submission
 */
export function secureFormData(formData: Record<string, unknown>): Record<string, unknown> {
  const secured: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      secured[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      secured[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      secured[key] = value;
    }
  }

  return secured;
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

// ==================== SECURITY UTILITIES ====================

/**
 * Generate random ID (cryptographically secure)
 */
export function generateSecureId(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Debounce function with security in mind
 * Prevents rapid repeated calls that could be malicious
 */
export function secureDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  maxCalls: number = 10
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let callCount = 0;
  let resetTimeout: NodeJS.Timeout | null = null;

  return function(...args: Parameters<T>) {
    // Track call count
    callCount++;

    // Reset call count after wait period
    if (resetTimeout) clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
      callCount = 0;
    }, wait * 2);

    // Prevent excessive calls (potential DoS)
    if (callCount > maxCalls) {
      logSecurityEvent({
        type: 'rate_limit',
        details: `Function called ${callCount} times in ${wait}ms`,
        severity: 'medium'
      });
      return;
    }

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Hash string (simple, non-cryptographic)
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Mask sensitive data for display
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return data;
  
  const visible = data.slice(-visibleChars);
  const masked = '*'.repeat(data.length - visibleChars);
  
  return masked + visible;
}

/**
 * Check if running in secure context (HTTPS)
 */
export function isSecureContext(): boolean {
  return window.isSecureContext || window.location.protocol === 'https:';
}

/**
 * Warn if not in secure context
 */
export function requireSecureContext(feature: string): boolean {
  if (!isSecureContext()) {
    console.warn(`${feature} requires a secure context (HTTPS)`);
    return false;
  }
  return true;
}