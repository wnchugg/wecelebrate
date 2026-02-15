/**
 * Security Utilities
 * Implements security measures for input validation, sanitization, and protection
 */

// Input Sanitization - now handles objects recursively
export function sanitizeInput(input: any): any {
  if (!input) return input;
  
  // Handle strings
  if (typeof input === 'string') {
    // Remove potential XSS vectors
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }
  
  // Handle arrays
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  // Handle objects
  if (typeof input === 'object') {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  
  // For other types (numbers, booleans, etc.), return as-is
  return input;
}

export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  // Basic email sanitization
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>]/g, '');
}

export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters except +
  return phone.replace(/[^\d+]/g, '');
}

// Input Validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  // Allow international format with + and 10-15 digits
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

export function validatePostalCode(postalCode: string, country: string = 'US'): boolean {
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
    // Add more country patterns as needed
  };
  
  const pattern = patterns[country] || /^.{3,10}$/; // Generic fallback
  return pattern.test(postalCode);
}

export function validateEmployeeId(id: string): boolean {
  // Allow alphanumeric and some special characters, 3-50 chars
  const idRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return idRegex.test(id);
}

export function validateSerialNumber(serial: string): boolean {
  // Allow alphanumeric and hyphens, 6-50 chars
  const serialRegex = /^[a-zA-Z0-9-]{6,50}$/;
  return serialRegex.test(serial);
}

// SQL Injection Prevention
export function sanitizeForDatabase(input: string): string {
  if (!input) return '';
  
  // Remove SQL injection attempts
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .trim();
}

// URL Validation
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
}

// HTML Encoding
export function encodeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function decodeHtml(str: string): string {
  const div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent || '';
}

// Password Strength Validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// CSRF Token Generation
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Secure Session Storage
export const secureStorage = {
  setItem(key: string, value: string): void {
    try {
      // In production, consider encrypting sensitive data
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },
  
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },
  
  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },
  
  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

// Rate Limit Storage (in-memory)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Client-side Rate Limiting
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

// Content Security Policy helpers
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Secure headers check
export function checkSecureContext(): boolean {
  return window.isSecureContext;
}

// File upload validation
export function validateFileUpload(file: File, allowedTypes: string[], maxSizeMB: number = 5): {
  isValid: boolean;
  error?: string;
} {
  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  
  return { isValid: true };
}

// Detect potential XSS in user input
export function detectXss(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\(/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

// Environment check
export function isProduction(): boolean {
  try {
    return import.meta.env.PROD === true;
  } catch (e) {
    return false;
  }
}

export function isDevelopment(): boolean {
  try {
    return import.meta.env.DEV !== false;
  } catch (e) {
    return true;
  }
}

// Session Timer Management
let sessionTimer: number | null = null;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function startSessionTimer(onTimeout: () => void): void {
  clearSessionTimer();
  sessionTimer = window.setTimeout(() => {
    logSecurityEvent('session_timeout', 'warning', {
      message: 'Session expired due to inactivity',
    });
    onTimeout();
  }, SESSION_TIMEOUT_MS);
}

export function resetSessionTimer(onTimeout: () => void): void {
  startSessionTimer(onTimeout);
}

export function clearSessionTimer(): void {
  if (sessionTimer !== null) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
}

// Security Event Logging
export function logSecurityEvent(
  eventOrParams: string | { action: string; status?: string; userId?: string; details?: any },
  level: 'info' | 'warning' | 'error' = 'info',
  details?: any
): void {
  let event: string;
  let logDetails: any;
  let userId: string | undefined;
  
  // Handle both calling patterns
  if (typeof eventOrParams === 'string') {
    // Pattern 1: logSecurityEvent('event_name', 'info', { details })
    event = eventOrParams;
    logDetails = details || {};
  } else {
    // Pattern 2: logSecurityEvent({ action: 'event_name', status: 'failure', userId: 'user@example.com', details: {} })
    event = eventOrParams.action;
    level = (eventOrParams.status === 'failure' ? 'error' : eventOrParams.status === 'warning' ? 'warning' : 'info');
    userId = eventOrParams.userId;
    logDetails = eventOrParams.details || {};
  }
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    level,
    userId,
    details: logDetails,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  // Log to console
  console.log(`[SECURITY ${level.toUpperCase()}]`, event, logEntry);
  
  // In production, you might want to send this to a logging service
  if (isProduction()) {
    // Send to logging service (e.g., Sentry, LogRocket, etc.)
    // Example: Sentry.captureMessage(event, level);
  }
}

// Email Format Validation (alias for validateEmail)
export function validateEmailFormat(email: string): boolean {
  return validateEmail(email);
}