/**
 * Enhanced Input Validators
 * Comprehensive validation utilities with security focus
 * Phase 2.4: Security Hardening
 */

import { logger } from './logger';

/**
 * Email validation with security considerations
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  // Check length
  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  // RFC 5322 compliant regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for dangerous characters
  if (/[<>'"`;\\]/.test(email)) {
    return { valid: false, error: 'Email contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Password validation with strength requirements
 */
export function validatePassword(password: string): { 
  valid: boolean; 
  error?: string;
  strength?: 'weak' | 'medium' | 'strong';
} {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  // Minimum length
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  // Maximum length (prevent DoS)
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (password.length >= 12 && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?].*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    strength = 'strong';
  } else if (password.length >= 10) {
    strength = 'medium';
  }

  return { valid: true, strength };
}

/**
 * URL validation with protocol check
 */
export function validateURL(url: string, allowedProtocols: string[] = ['http:', 'https:']): { 
  valid: boolean; 
  error?: string;
} {
  if (!url) {
    return { valid: false, error: 'URL is required' };
  }

  try {
    const parsed = new URL(url);
    
    if (!allowedProtocols.includes(parsed.protocol)) {
      return { valid: false, error: `Only ${allowedProtocols.join(', ')} protocols are allowed` };
    }

    // Check for suspicious patterns
    if (url.includes('javascript:') || url.includes('data:')) {
      return { valid: false, error: 'URL contains potentially dangerous protocol' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Phone number validation (international format)
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Check if it contains only digits and optional leading +
  if (!/^\+?\d{10,15}$/.test(cleaned)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return { valid: true };
}

/**
 * Name validation (prevents injection)
 */
export function validateName(name: string, fieldName = 'Name'): { valid: boolean; error?: string } {
  if (!name) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (name.length < 1) {
    return { valid: false, error: `${fieldName} is too short` };
  }

  if (name.length > 100) {
    return { valid: false, error: `${fieldName} is too long` };
  }

  // Allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }

  // Check for injection patterns
  if (/<|>|script|javascript|on\w+=/i.test(name)) {
    return { valid: false, error: `${fieldName} contains invalid content` };
  }

  return { valid: true };
}

/**
 * Numeric validation with range
 */
export function validateNumber(
  value: string | number,
  min?: number,
  max?: number,
  fieldName = 'Value'
): { valid: boolean; error?: string } {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { valid: true };
}

/**
 * Date validation
 */
export function validateDate(
  dateString: string,
  minDate?: Date,
  maxDate?: Date
): { valid: boolean; error?: string } {
  if (!dateString) {
    return { valid: false, error: 'Date is required' };
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  if (minDate && date < minDate) {
    return { valid: false, error: `Date must be after ${minDate.toLocaleDateString()}` };
  }

  if (maxDate && date > maxDate) {
    return { valid: false, error: `Date must be before ${maxDate.toLocaleDateString()}` };
  }

  return { valid: true };
}

/**
 * File validation
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = []
  } = options;

  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return { valid: false, error: `File extension must be one of: ${allowedExtensions.join(', ')}` };
    }
  }

  return { valid: true };
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';

  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');

  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: protocols
  sanitized = sanitized.replace(/data:/gi, '');

  return sanitized;
}

/**
 * Validate no SQL injection patterns
 */
export function validateNoSQLInjection(input: string): { valid: boolean; error?: string } {
  const sqlPatterns = [
    /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b).*(\bFROM\b|\bWHERE\b|\bTABLE\b)/i,
    /--/,
    /;.*\bDROP\b/i,
    /'\s*OR\s*'1'\s*=\s*'1/i,
    /'\s*OR\s*1\s*=\s*1/i
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      logger.warn('[Validator] Potential SQL injection detected');
      return { valid: false, error: 'Input contains invalid characters' };
    }
  }

  return { valid: true };
}

/**
 * Validate no NoSQL injection patterns
 */
export function validateNoNoSQLInjection(input: string): { valid: boolean; error?: string } {
  const noSqlPatterns = [
    /\$where/i,
    /\$ne/i,
    /\$gt/i,
    /\$lt/i,
    /\$regex/i,
    /\$or/i,
    /\$and/i
  ];

  for (const pattern of noSqlPatterns) {
    if (pattern.test(input)) {
      logger.warn('[Validator] Potential NoSQL injection detected');
      return { valid: false, error: 'Input contains invalid characters' };
    }
  }

  return { valid: true };
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  if (!input) return '';

  // Trim whitespace
  let sanitized = input.trim();

  // Limit length
  sanitized = sanitized.substring(0, maxLength);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters (except newlines and tabs)
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Comprehensive form validation
 */
export function validateForm(
  data: Record<string, any>,
  schema: Record<string, (value: any) => { valid: boolean; error?: string }>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [field, validator] of Object.entries(schema)) {
    const result = validator(data[field]);
    if (!result.valid && result.error) {
      errors[field] = result.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
