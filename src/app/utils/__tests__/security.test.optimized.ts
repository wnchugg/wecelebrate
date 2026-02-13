/**
 * Security Utils Tests - OPTIMIZED
 * Day 1 Morning - Security & Validation
 * 
 * Updated to use central setupTests.ts for mocks
 * No manual mock setup needed - all mocks auto-loaded!
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sanitizeInput,
  sanitizeEmail,
  sanitizePhoneNumber,
  validateEmail,
  validatePhoneNumber,
  validatePostalCode,
  validateEmployeeId,
  validateSerialNumber,
  sanitizeForDatabase,
  validateUrl,
  sanitizeUrl,
  encodeHtml,
  decodeHtml,
  validatePasswordStrength,
  generateCsrfToken,
  secureStorage,
  checkRateLimit,
  generateNonce,
  checkSecureContext,
  validateFileUpload,
  detectXss,
  isProduction,
  isDevelopment,
  logSecurityEvent,
  startSessionTimer,
  resetSessionTimer,
  clearSessionTimer,
} from '../security';

// ==================== TEST DATA CONSTANTS ====================
const VALID_EMAILS = [
  'test@example.com',
  'user.name+tag@example.co.uk',
  'user_name@example-domain.com',
  'test123@test-domain.com',
];

const INVALID_EMAILS = [
  'invalid',
  '@example.com',
  'test@',
  'test@.com',
  'test..name@example.com',
  '',
];

const XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  'javascript:alert("xss")',
  'onclick=alert("xss")',
  '<img src=x onerror=alert("xss")>',
  '<iframe src="evil.com"></iframe>',
  '<svg onload=alert("xss")>',
  'eval(maliciousCode)',
];

const SQL_INJECTION_PAYLOADS = [
  "'; DROP TABLE users; --",
  "' OR '1'='1",
  "admin'--",
  "1' UNION SELECT * FROM users--",
  "'; DELETE FROM products WHERE '1'='1",
];

// ==================== TESTS ====================
// Note: Browser API mocks (document, crypto, sessionStorage, window, btoa)
// are provided by setupTests.ts and auto-loaded before all tests

describe('Security Utils - Optimized', () => {
  // ==================== INPUT SANITIZATION ====================
  
  describe('sanitizeInput', () => {
    describe('XSS Prevention', () => {
      it.each(XSS_PAYLOADS)('should sanitize XSS payload: %s', (payload) => {
        const result = sanitizeInput(payload);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('javascript:');
        expect(result).not.toMatch(/on\w+\s*=/);
      });

      it('should remove script tags with content preserved', () => {
        const input = '<script>alert("xss")</script>Hello';
        const result = sanitizeInput(input);
        expect(result).toBe('Hello');
      });

      it('should handle multiple XSS attempts in one string', () => {
        const input = '<script>xss</script>text<script>more</script>';
        const result = sanitizeInput(input);
        expect(result).not.toContain('<script>');
        expect(result).toContain('text');
      });
    });

    describe('Data Type Handling', () => {
      it('should handle null and undefined gracefully', () => {
        expect(sanitizeInput(null)).toBeNull();
        expect(sanitizeInput(undefined)).toBeUndefined();
      });

      it('should handle empty string', () => {
        expect(sanitizeInput('')).toBe('');
      });

      it('should preserve numbers unchanged', () => {
        expect(sanitizeInput(123)).toBe(123);
        expect(sanitizeInput(0)).toBe(0);
        expect(sanitizeInput(-456)).toBe(-456);
        expect(sanitizeInput(3.14)).toBe(3.14);
      });

      it('should preserve booleans unchanged', () => {
        expect(sanitizeInput(true)).toBe(true);
        expect(sanitizeInput(false)).toBe(false);
      });
    });

    describe('Array Sanitization', () => {
      it('should recursively sanitize arrays', () => {
        const input = ['<script>xss</script>', 'safe', 'onclick=alert("xss")'];
        const result = sanitizeInput(input);
        expect(result).toHaveLength(3);
        expect(result[0]).not.toContain('<script>');
        expect(result[1]).toBe('safe');
        expect(result[2]).not.toMatch(/onclick/);
      });

      it('should handle nested arrays', () => {
        const input = [['<script>xss</script>', 'safe'], ['onclick=bad']];
        const result = sanitizeInput(input);
        expect(result[0][0]).not.toContain('<script>');
        expect(result[1][0]).not.toMatch(/onclick/);
      });

      it('should handle arrays with mixed types', () => {
        const input = ['<script>xss</script>', 123, true, null];
        const result = sanitizeInput(input);
        expect(result[0]).not.toContain('<script>');
        expect(result[1]).toBe(123);
        expect(result[2]).toBe(true);
        expect(result[3]).toBeNull();
      });
    });

    describe('Object Sanitization', () => {
      it('should recursively sanitize objects', () => {
        const input = {
          name: '<script>xss</script>',
          safe: 'normal text',
          nested: {
            bad: 'onclick=alert("xss")',
            deep: {
              deeper: '<img src=x onerror=alert(1)>',
            },
          },
        };
        const result = sanitizeInput(input);
        expect(result.name).not.toContain('<script>');
        expect(result.safe).toBe('normal text');
        expect(result.nested.bad).not.toMatch(/onclick/);
        expect(result.nested.deep.deeper).not.toContain('<img');
      });

      it('should handle objects with various property types', () => {
        const input: Record<string, any> = {
          string: '<script>xss</script>',
          number: 123,
          boolean: true,
          null: null,
          array: ['<script>xss</script>'],
        };
        const result = sanitizeInput(input);
        expect(result.string).not.toContain('<script>');
        expect(result.number).toBe(123);
        expect(result.boolean).toBe(true);
        expect(result.null).toBeNull();
        expect(result.array[0]).not.toContain('<script>');
      });
    });

    describe('Edge Cases', () => {
      it('should trim whitespace', () => {
        expect(sanitizeInput('  Hello World  ')).toBe('Hello World');
        expect(sanitizeInput('\t\nHello\t\n')).toBe('Hello');
      });

      it('should handle very long strings', () => {
        const longString = 'a'.repeat(10000) + '<script>xss</script>';
        const result = sanitizeInput(longString);
        expect(result).not.toContain('<script>');
        expect(result.length).toBeLessThan(longString.length);
      });

      it('should handle special characters', () => {
        const input = '©®™€£¥';
        const result = sanitizeInput(input);
        expect(result).toBe(input);
      });
    });
  });

  describe('sanitizeEmail', () => {
    it('should convert email to lowercase', () => {
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
      expect(sanitizeEmail('User@Domain.COM')).toBe('user@domain.com');
    });

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
      expect(sanitizeEmail('\ttest@example.com\n')).toBe('test@example.com');
    });

    it('should remove angle brackets', () => {
      expect(sanitizeEmail('test<script>@example.com')).toBe('testscript@example.com');
    });

    it('should handle null/undefined/empty', () => {
      expect(sanitizeEmail('')).toBe('');
      expect(sanitizeEmail(null as any)).toBe('');
      expect(sanitizeEmail(undefined as any)).toBe('');
    });

    it('should preserve valid email characters', () => {
      expect(sanitizeEmail('user.name+tag@example.com')).toBe('user.name+tag@example.com');
    });
  });

  describe('sanitizePhoneNumber', () => {
    it('should remove formatting characters', () => {
      expect(sanitizePhoneNumber('(555) 123-4567')).toBe('5551234567');
      expect(sanitizePhoneNumber('555.123.4567')).toBe('5551234567');
      expect(sanitizePhoneNumber('555 123 4567')).toBe('5551234567');
    });

    it('should preserve leading + for international format', () => {
      expect(sanitizePhoneNumber('+1 (555) 123-4567')).toBe('+15551234567');
      expect(sanitizePhoneNumber('+44 20 1234 5678')).toBe('+442012345678');
    });

    it('should handle null/undefined/empty', () => {
      expect(sanitizePhoneNumber('')).toBe('');
      expect(sanitizePhoneNumber(null as any)).toBe('');
      expect(sanitizePhoneNumber(undefined as any)).toBe('');
    });
  });

  // ==================== INPUT VALIDATION ====================

  describe('validateEmail', () => {
    it.each(VALID_EMAILS)('should accept valid email: %s', (email) => {
      expect(validateEmail(email)).toBe(true);
    });

    it.each(INVALID_EMAILS)('should reject invalid email: %s', (email) => {
      expect(validateEmail(email)).toBe(false);
    });

    it('should reject emails with consecutive dots', () => {
      expect(validateEmail('test..name@example.com')).toBe(false);
    });

    it('should accept emails with subdomain', () => {
      expect(validateEmail('test@mail.example.com')).toBe(true);
    });
  });

  describe('validatePhoneNumber', () => {
    const validPhones = [
      '5551234567',
      '+15551234567',
      '(555) 123-4567',
      '+44 20 1234 5678',
      '555-123-4567',
    ];

    const invalidPhones = [
      '123', // Too short
      'abcd1234567', // Contains letters
      '12345678901234567', // Too long
      '555-CALL-NOW', // Letters
      '', // Empty
    ];

    it.each(validPhones)('should accept valid phone: %s', (phone) => {
      expect(validatePhoneNumber(phone)).toBe(true);
    });

    it.each(invalidPhones)('should reject invalid phone: %s', (phone) => {
      expect(validatePhoneNumber(phone)).toBe(false);
    });
  });

  describe('validatePostalCode', () => {
    describe('US Postal Codes', () => {
      it('should accept 5-digit ZIP codes', () => {
        expect(validatePostalCode('12345', 'US')).toBe(true);
        expect(validatePostalCode('90210', 'US')).toBe(true);
      });

      it('should accept ZIP+4 format', () => {
        expect(validatePostalCode('12345-6789', 'US')).toBe(true);
      });

      it('should reject invalid US formats', () => {
        expect(validatePostalCode('1234', 'US')).toBe(false);
        expect(validatePostalCode('abcde', 'US')).toBe(false);
      });
    });

    describe('Canadian Postal Codes', () => {
      it('should accept valid formats with and without space', () => {
        expect(validatePostalCode('K1A 0B1', 'CA')).toBe(true);
        expect(validatePostalCode('K1A0B1', 'CA')).toBe(true);
        expect(validatePostalCode('M5W 1E6', 'CA')).toBe(true);
      });

      it('should reject invalid formats', () => {
        expect(validatePostalCode('12345', 'CA')).toBe(false);
        expect(validatePostalCode('AAAAAA', 'CA')).toBe(false);
      });
    });

    describe('UK Postal Codes', () => {
      it('should accept valid UK postcodes', () => {
        expect(validatePostalCode('SW1A 1AA', 'UK')).toBe(true);
        expect(validatePostalCode('EC1A 1BB', 'UK')).toBe(true);
        expect(validatePostalCode('W1A 0AX', 'UK')).toBe(true);
      });

      it('should reject invalid formats', () => {
        expect(validatePostalCode('12345', 'UK')).toBe(false);
      });
    });

    describe('Generic Country Codes', () => {
      it('should use fallback validation for unknown countries', () => {
        expect(validatePostalCode('12345', 'XX')).toBe(true);
        expect(validatePostalCode('ABC123', 'ZZ')).toBe(true);
        expect(validatePostalCode('AB', 'YY')).toBe(false); // Too short
      });
    });
  });

  describe('validateEmployeeId', () => {
    const validIds = ['EMP123', 'employee_123', 'EMP-456-789', 'abc', 'ABC_DEF_123'];
    const invalidIds = ['AB', 'EMP@123', 'EMP 123', '', 'a'.repeat(51)];

    it.each(validIds)('should accept valid ID: %s', (id) => {
      expect(validateEmployeeId(id)).toBe(true);
    });

    it.each(invalidIds)('should reject invalid ID: %s', (id) => {
      expect(validateEmployeeId(id)).toBe(false);
    });
  });

  describe('validateSerialNumber', () => {
    const validSerials = ['ABC123-DEF456', 'SERIAL-12345', '123456', 'ABC-DEF-GHI-123'];
    const invalidSerials = ['ABC', 'ABC@123', 'ABC_123', '', 'a'.repeat(51)];

    it.each(validSerials)('should accept valid serial: %s', (serial) => {
      expect(validateSerialNumber(serial)).toBe(true);
    });

    it.each(invalidSerials)('should reject invalid serial: %s', (serial) => {
      expect(validateSerialNumber(serial)).toBe(false);
    });
  });

  // ==================== SQL INJECTION PREVENTION ====================

  describe('sanitizeForDatabase', () => {
    it.each(SQL_INJECTION_PAYLOADS)('should sanitize SQL injection: %s', (payload) => {
      const result = sanitizeForDatabase(payload);
      expect(result).not.toContain("'");
      expect(result).not.toContain('"');
      expect(result).not.toContain(';');
      expect(result).not.toContain('--');
    });

    it('should remove block comments', () => {
      const input = '/* comment */ SELECT * FROM users';
      const result = sanitizeForDatabase(input);
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
    });

    it('should remove quotes and backslashes', () => {
      const input = `test"value'with\\backslash`;
      const result = sanitizeForDatabase(input);
      expect(result).not.toContain('"');
      expect(result).not.toContain("'");
      expect(result).not.toContain('\\');
    });

    it('should handle null/undefined/empty', () => {
      expect(sanitizeForDatabase('')).toBe('');
      expect(sanitizeForDatabase(null as any)).toBe('');
      expect(sanitizeForDatabase(undefined as any)).toBe('');
    });

    it('should preserve safe text', () => {
      const input = 'John Doe 123';
      const result = sanitizeForDatabase(input);
      expect(result).toBe('John Doe 123');
    });
  });

  // ==================== URL VALIDATION ====================

  describe('validateUrl', () => {
    const validUrls = [
      'http://example.com',
      'https://example.com',
      'https://example.com/path',
      'https://example.com/path?query=value',
      'https://sub.example.com:8080/path',
    ];

    const invalidUrls = [
      'not-a-url',
      'ftp://example.com',
      'javascript:alert("xss")',
      'data:text/html,<script>alert("xss")</script>',
      'file:///etc/passwd',
      '',
    ];

    it.each(validUrls)('should accept valid URL: %s', (url) => {
      expect(validateUrl(url)).toBe(true);
    });

    it.each(invalidUrls)('should reject invalid URL: %s', (url) => {
      expect(validateUrl(url)).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    it('should return valid HTTP/HTTPS URLs', () => {
      const url = 'https://example.com';
      expect(sanitizeUrl(url)).toBe('https://example.com/');
    });

    it('should preserve query parameters', () => {
      const url = 'https://example.com/path?foo=bar&baz=qux';
      const result = sanitizeUrl(url);
      expect(result).toContain('foo=bar');
      expect(result).toContain('baz=qux');
    });

    it('should return empty string for dangerous URLs', () => {
      expect(sanitizeUrl('javascript:alert("xss")')).toBe('');
      expect(sanitizeUrl('ftp://example.com')).toBe('');
      expect(sanitizeUrl('not-a-url')).toBe('');
    });

    it('should handle null/undefined/empty', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl(null as any)).toBe('');
      expect(sanitizeUrl(undefined as any)).toBe('');
    });
  });

  // ==================== HTML ENCODING ====================

  describe('encodeHtml', () => {
    it('should encode HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = encodeHtml(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).not.toContain('<script>');
    });

    it('should encode ampersands', () => {
      const input = 'Tom & Jerry';
      const result = encodeHtml(input);
      expect(result).toContain('&amp;');
    });

    it('should encode quotes', () => {
      const input = 'Say "Hello"';
      const result = encodeHtml(input);
      expect(result).toContain('&quot;');
    });

    it('should handle empty string', () => {
      expect(encodeHtml('')).toBe('');
    });
  });

  describe('decodeHtml', () => {
    it('should decode HTML entities', () => {
      const input = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
      const result = decodeHtml(input);
      expect(result).toContain('<script>');
      expect(result).toContain('alert("xss")');
    });

    it('should decode ampersands', () => {
      const input = 'Tom &amp; Jerry';
      const result = decodeHtml(input);
      expect(result).toBe('Tom & Jerry');
    });

    it('should handle empty string', () => {
      expect(decodeHtml('')).toBe('');
    });
  });

  // ==================== PASSWORD VALIDATION ====================

  describe('validatePasswordStrength', () => {
    it('should accept strong passwords', () => {
      const passwords = ['StrongP@ss123', 'MyP@ssw0rd!', 'Secure#Pass1'];
      passwords.forEach(password => {
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordStrength('weakp@ss123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = validatePasswordStrength('WEAKP@SS123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without numbers', () => {
      const result = validatePasswordStrength('WeakP@ssword');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special characters', () => {
      const result = validatePasswordStrength('WeakPassword123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should reject short passwords', () => {
      const result = validatePasswordStrength('Weak1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should return multiple errors for very weak passwords', () => {
      const result = validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle empty password', () => {
      const result = validatePasswordStrength('');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // ==================== CSRF TOKEN ====================

  describe('generateCsrfToken', () => {
    it('should generate a token', () => {
      const token = generateCsrfToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateCsrfToken());
      }
      expect(tokens.size).toBe(100);
    });

    it('should generate 64-character hex token', () => {
      const token = generateCsrfToken();
      expect(token.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });
  });

  // ==================== SECURE STORAGE ====================

  describe('secureStorage', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      (sessionStorage as any).clear();
    });

    it('should store and retrieve items', () => {
      secureStorage.setItem('test-key', 'test-value');
      const value = secureStorage.getItem('test-key');
      expect(value).toBe('test-value');
      expect(sessionStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
      expect(sessionStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should return null for non-existent keys', () => {
      const value = secureStorage.getItem('non-existent');
      expect(value).toBeNull();
    });

    it('should remove items', () => {
      secureStorage.setItem('test-key', 'test-value');
      secureStorage.removeItem('test-key');
      const value = secureStorage.getItem('test-key');
      expect(value).toBeNull();
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should clear all items', () => {
      secureStorage.setItem('key1', 'value1');
      secureStorage.setItem('key2', 'value2');
      secureStorage.clear();
      expect(secureStorage.getItem('key1')).toBeNull();
      expect(secureStorage.getItem('key2')).toBeNull();
      expect(sessionStorage.clear).toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock storage error
      (sessionStorage.setItem as any).mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw
      expect(() => secureStorage.setItem('key', 'value')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  // ==================== RATE LIMITING ====================

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const result1 = checkRateLimit('test-key-1', 3, 1000);
      expect(result1.allowed).toBe(true);
      
      const result2 = checkRateLimit('test-key-1', 3, 1000);
      expect(result2.allowed).toBe(true);
      
      const result3 = checkRateLimit('test-key-1', 3, 1000);
      expect(result3.allowed).toBe(true);
    });

    it('should block requests over limit', () => {
      checkRateLimit('test-key-2', 2, 1000);
      checkRateLimit('test-key-2', 2, 1000);
      
      const result = checkRateLimit('test-key-2', 2, 1000);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after window expires', async () => {
      checkRateLimit('test-key-3', 1, 50);
      checkRateLimit('test-key-3', 1, 50);
      
      let result = checkRateLimit('test-key-3', 1, 50);
      expect(result.allowed).toBe(false);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 100));
      
      result = checkRateLimit('test-key-3', 1, 50);
      expect(result.allowed).toBe(true);
    });

    it('should track different keys independently', () => {
      checkRateLimit('key-a', 1, 1000);
      checkRateLimit('key-a', 1, 1000);
      
      const resultA = checkRateLimit('key-a', 1, 1000);
      expect(resultA.allowed).toBe(false);
      
      const resultB = checkRateLimit('key-b', 1, 1000);
      expect(resultB.allowed).toBe(true);
    });
  });

  // ==================== NONCE GENERATION ====================

  describe('generateNonce', () => {
    it('should generate a nonce', () => {
      const nonce = generateNonce();
      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should generate unique nonces', () => {
      const nonces = new Set();
      for (let i = 0; i < 100; i++) {
        nonces.add(generateNonce());
      }
      expect(nonces.size).toBe(100);
    });

    it('should generate base64-encoded nonces', () => {
      const nonce = generateNonce();
      // Base64 characters: A-Z, a-z, 0-9, +, /, =
      expect(/^[A-Za-z0-9+/=]+$/.test(nonce)).toBe(true);
    });
  });

  // ==================== SECURE CONTEXT ====================

  describe('checkSecureContext', () => {
    it('should return secure context status', () => {
      const result = checkSecureContext();
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true); // Mocked as true
    });
  });

  // ==================== FILE VALIDATION ====================

  describe('validateFileUpload', () => {
    it('should accept valid files', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFileUpload(file, ['image/jpeg', 'image/png'], 5);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files over size limit', () => {
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = validateFileUpload(file, ['image/jpeg'], 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size must be less than');
      expect(result.error).toContain('5MB');
    });

    it('should reject disallowed file types', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      const result = validateFileUpload(file, ['image/jpeg', 'image/png'], 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File type not allowed');
    });

    it('should use default size limit of 5MB', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFileUpload(file, ['image/jpeg']);
      expect(result.isValid).toBe(true);
    });
  });

  // ==================== XSS DETECTION ====================

  describe('detectXss', () => {
    it.each(XSS_PAYLOADS)('should detect XSS payload: %s', (payload) => {
      expect(detectXss(payload)).toBe(true);
    });

    it('should not flag safe input', () => {
      const safeInputs = [
        'This is safe text',
        'email@example.com',
        'Hello, World!',
        '123-456-7890',
        'Normal sentence with punctuation.',
      ];

      safeInputs.forEach(input => {
        expect(detectXss(input)).toBe(false);
      });
    });

    it('should be case-insensitive for keywords', () => {
      expect(detectXss('JAVASCRIPT:alert(1)')).toBe(true);
      expect(detectXss('JavaScript:alert(1)')).toBe(true);
      expect(detectXss('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
    });
  });

  // ==================== ENVIRONMENT CHECKS ====================

  describe('environment checks', () => {
    it('should detect development environment', () => {
      const isDev = isDevelopment();
      expect(typeof isDev).toBe('boolean');
    });

    it('should detect production environment', () => {
      const isProd = isProduction();
      expect(typeof isProd).toBe('boolean');
    });

    it('should have mutually exclusive environment states', () => {
      // In a real scenario, isDevelopment and isProduction should not both be true
      const isDev = isDevelopment();
      const isProd = isProduction();
      expect(isDev && isProd).toBe(false);
    });
  });

  // ==================== SESSION TIMER ====================

  describe('session timer', () => {
    beforeEach(() => {
      clearSessionTimer();
      vi.clearAllTimers();
    });

    it('should start session timer', () => {
      const callback = vi.fn();
      startSessionTimer(callback);
      
      // Timer should be set but not called yet
      expect(callback).not.toHaveBeenCalled();
    });

    it('should reset session timer', () => {
      const callback = vi.fn();
      startSessionTimer(callback);
      resetSessionTimer(callback);
      
      // Should restart the timer
      expect(callback).not.toHaveBeenCalled();
    });

    it('should clear session timer', () => {
      const callback = vi.fn();
      startSessionTimer(callback);
      clearSessionTimer();
      
      // Timer should be cleared
      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ==================== SECURITY LOGGING ====================

  describe('logSecurityEvent', () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log security events with string pattern', () => {
      logSecurityEvent('test_event', 'info', { detail: 'test' });
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('[SECURITY INFO]');
    });

    it('should log security events with object pattern', () => {
      logSecurityEvent({
        action: 'login_attempt',
        status: 'failure',
        userId: 'user@example.com',
        details: { reason: 'invalid_password' },
      });
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('[SECURITY ERROR]');
    });

    it('should handle different log levels', () => {
      logSecurityEvent('info_event', 'info');
      expect(consoleSpy.mock.calls[0][0]).toContain('[SECURITY INFO]');
      
      logSecurityEvent('warning_event', 'warning');
      expect(consoleSpy.mock.calls[1][0]).toContain('[SECURITY WARNING]');
      
      logSecurityEvent('error_event', 'error');
      expect(consoleSpy.mock.calls[2][0]).toContain('[SECURITY ERROR]');
    });

    it('should include timestamp and context', () => {
      logSecurityEvent('test_event', 'info', { data: 'test' });
      const logCall = consoleSpy.mock.calls[0];
      expect(logCall.length).toBeGreaterThan(1);
      
      const logEntry = logCall[2];
      expect(logEntry).toHaveProperty('timestamp');
      expect(logEntry).toHaveProperty('event');
      expect(logEntry).toHaveProperty('level');
      expect(logEntry).toHaveProperty('userAgent');
      expect(logEntry).toHaveProperty('url');
    });
  });
});