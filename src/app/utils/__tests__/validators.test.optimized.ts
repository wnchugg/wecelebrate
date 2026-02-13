/**
 * Validators Utils Tests - OPTIMIZED
 * Day 1 Afternoon - Validation Functions
 * 
 * Updated to use central setupTests.ts for mocks
 * Logger mocks now auto-loaded - no manual setup needed!
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateURL,
  validatePhone,
  validateName,
  validateNumber,
  validateDate,
  validateFile,
  sanitizeHTML,
  validateNoSQLInjection,
  validateNoNoSQLInjection,
  sanitizeInput,
  validateForm,
} from '../validators';
import { logger } from '../logger';

// ==================== TEST DATA CONSTANTS ====================

const VALID_EMAILS = [
  'test@example.com',
  'user.name@example.com',
  'user+tag@example.co.uk',
  'user_name@example-domain.com',
  'test.name+tag123@sub.example.co.uk',
];

const INVALID_EMAILS = [
  { input: '', error: 'Email is required' },
  { input: 'invalid', error: 'Invalid email format' },
  { input: '@example.com', error: 'Invalid email format' },
  { input: 'test@', error: 'Invalid email format' },
  { input: 'test..name@example.com', error: 'Invalid email format' },
  { input: 'test<script>@example.com', error: 'invalid characters' },
];

const VALID_PASSWORDS = [
  'StrongP@ss123',
  'MyP@ssw0rd!',
  'Secure#Pass1',
  'C0mpl3x!Passw0rd',
];

const INVALID_PASSWORDS = [
  { input: '', error: 'Password is required' },
  { input: 'Short1!', error: 'at least 8 characters' },
  { input: 'weakp@ss123', error: 'uppercase letter' },
  { input: 'WEAKP@SS123', error: 'lowercase letter' },
  { input: 'WeakP@ssword', error: 'number' },
  { input: 'WeakPassword123', error: 'special character' },
];

const VALID_URLS = [
  'http://example.com',
  'https://example.com',
  'https://example.com/path',
  'https://example.com/path?query=value',
  'https://sub.example.com:8080/path#anchor',
];

const DANGEROUS_URLS = [
  { input: 'javascript:alert("xss")', error: 'dangerous protocol' },
  { input: 'data:text/html,<script>alert(1)</script>', error: 'dangerous protocol' },
  { input: 'ftp://example.com', error: 'protocols are allowed' },
  { input: 'file:///etc/passwd', error: 'protocols are allowed' },
];

const VALID_PHONES = [
  '5551234567',
  '+15551234567',
  '(555) 123-4567',
  '+44 20 1234 5678',
  '555-123-4567',
  '+1-555-123-4567',
];

const INVALID_PHONES = [
  { input: '', error: 'Phone number is required' },
  { input: '123', error: 'Invalid phone number' },
  { input: 'abcd1234567', error: 'Invalid phone number' },
  { input: '555-CALL-NOW', error: 'Invalid phone number' },
  { input: '12345678901234567890', error: 'Invalid phone number' },
];

const VALID_NAMES = [
  'John Doe',
  "Mary O'Brien",
  'Jean-Pierre',
  'María García',
  'Anne-Marie',
];

const INVALID_NAMES = [
  { input: '', error: 'required' },
  { input: 'John123', error: 'invalid characters' },
  { input: 'John@Doe', error: 'invalid characters' },
  { input: '<script>alert("xss")</script>', error: 'invalid content' },
];

const SQL_INJECTION_PAYLOADS = [
  "' UNION SELECT * FROM users --",
  "'; DROP TABLE users; --",
  "' OR '1'='1",
  "admin'--",
  "; DELETE FROM products WHERE '1'='1",
];

const NOSQL_INJECTION_PAYLOADS = [
  '$where: function() { return true; }',
  'password: {$ne: null}',
  'age: {$gt: 0}',
  'age: {$lt: 100}',
  '$or: [{a:1}, {b:2}]',
  '$and: [{a:1}, {b:2}]',
  '$regex: /admin/',
];

const HTML_XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert("xss")>',
  '<div onclick="alert(\'xss\')">Click</div>',
  '<a href="javascript:alert(\'xss\')">Link</a>',
  '<img src="data:image/svg+xml,<svg>...</svg>">',
];

// ==================== TESTS ====================
// Note: All browser API mocks are provided by setupTests.ts
// Logger mocks (warn, error, info) are also auto-configured

describe('Validators Utils - Optimized', () => {
  
  // ==================== EMAIL VALIDATION ====================
  
  describe('validateEmail', () => {
    describe('Valid Emails', () => {
      it.each(VALID_EMAILS)('should accept valid email: %s', (email) => {
        const result = validateEmail(email);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('Invalid Emails', () => {
      it.each(INVALID_EMAILS)(
        'should reject $input with error: $error',
        ({ input, error }) => {
          const result = validateEmail(input);
          expect(result.valid).toBe(false);
          expect(result.error).toContain(error);
        }
      );

      it('should reject email that is too long', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        const result = validateEmail(longEmail);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Email is too long');
      });
    });

    describe('Edge Cases', () => {
      it('should handle emails with multiple subdomains', () => {
        const result = validateEmail('test@mail.sub.example.com');
        expect(result.valid).toBe(true);
      });

      it('should reject emails with consecutive dots', () => {
        const result = validateEmail('test..name@example.com');
        expect(result.valid).toBe(false);
      });

      it('should reject emails starting with dot', () => {
        const result = validateEmail('.test@example.com');
        expect(result.valid).toBe(false);
      });

      it('should reject emails ending with dot before @', () => {
        const result = validateEmail('test.@example.com');
        expect(result.valid).toBe(false);
      });

      it('should handle emails with numbers', () => {
        const result = validateEmail('user123@example456.com');
        expect(result.valid).toBe(true);
      });

      it('should reject email with spaces', () => {
        const result = validateEmail('test @example.com');
        expect(result.valid).toBe(false);
      });
    });
  });

  // ==================== PASSWORD VALIDATION ====================

  describe('validatePassword', () => {
    describe('Valid Passwords', () => {
      it.each(VALID_PASSWORDS)('should accept strong password: %s', (password) => {
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
        expect(result.strength).toBeDefined();
        expect(['weak', 'medium', 'strong']).toContain(result.strength);
      });
    });

    describe('Invalid Passwords', () => {
      it.each(INVALID_PASSWORDS)(
        'should reject password "$input" - missing: $error',
        ({ input, error }) => {
          const result = validatePassword(input);
          expect(result.valid).toBe(false);
          if (error) {
            expect(result.error).toContain(error);
          }
        }
      );

      it('should reject password longer than 128 characters', () => {
        const longPassword = 'A'.repeat(130) + 'a1!';
        const result = validatePassword(longPassword);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Password is too long');
      });

      it('should return multiple errors for very weak passwords', () => {
        const result = validatePassword('weak');
        expect(result.valid).toBe(false);
        // Should have multiple validation failures
        const errorLower = result.error?.toLowerCase() || '';
        expect(
          errorLower.includes('character') ||
          errorLower.includes('uppercase') ||
          errorLower.includes('number')
        ).toBe(true);
      });
    });

    describe('Password Strength Classification', () => {
      it('should classify weak passwords (8-9 chars)', () => {
        const result = validatePassword('Pass123!');
        expect(result.valid).toBe(true);
        expect(result.strength).toBe('weak');
      });

      it('should classify medium passwords (10-11 chars)', () => {
        const result = validatePassword('Password123!');
        expect(result.valid).toBe(true);
        expect(result.strength).toBe('medium');
      });

      it('should classify strong passwords (12+ chars, 2+ special)', () => {
        const result = validatePassword('StrongP@ssw0rd!#');
        expect(result.valid).toBe(true);
        expect(result.strength).toBe('strong');
      });

      it('should classify 12+ char password without 2 special as medium', () => {
        const result = validatePassword('LongPassword123!');
        expect(result.valid).toBe(true);
        expect(result.strength).toBe('medium');
      });
    });

    describe('Edge Cases', () => {
      it('should handle password with exactly 8 characters', () => {
        const result = validatePassword('Pass123!');
        expect(result.valid).toBe(true);
      });

      it('should handle password with exactly 128 characters', () => {
        const password = 'A'.repeat(122) + 'a1!@#$';
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
      });

      it('should handle all special characters', () => {
        const specialChars = '!@#$%^&*()_+-=[]{};\':"|,.<>/?';
        const password = 'Pass1' + specialChars.slice(0, 3);
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
      });

      it('should handle Unicode characters in password', () => {
        const result = validatePassword('Pässwörd123!');
        expect(result.valid).toBe(true);
      });
    });
  });

  // ==================== URL VALIDATION ====================

  describe('validateURL', () => {
    describe('Valid URLs', () => {
      it.each(VALID_URLS)('should accept valid URL: %s', (url) => {
        const result = validateURL(url);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('Dangerous URLs', () => {
      it.each(DANGEROUS_URLS)(
        'should reject dangerous URL: $input',
        ({ input, error }) => {
          const result = validateURL(input);
          expect(result.valid).toBe(false);
          expect(result.error).toContain(error);
        }
      );
    });

    describe('Invalid URLs', () => {
      it('should reject empty URL', () => {
        const result = validateURL('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('URL is required');
      });

      it('should reject invalid URL format', () => {
        const result = validateURL('not-a-url');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid URL format');
      });

      it('should reject URL without protocol', () => {
        const result = validateURL('example.com');
        expect(result.valid).toBe(false);
      });

      it('should reject URL with spaces', () => {
        const result = validateURL('http://example .com');
        expect(result.valid).toBe(false);
      });
    });

    describe('Custom Protocol Support', () => {
      it('should accept custom allowed protocols', () => {
        const result = validateURL('ftp://example.com', ['ftp:']);
        expect(result.valid).toBe(true);
      });

      it('should accept multiple custom protocols', () => {
        expect(validateURL('ftp://example.com', ['ftp:', 'sftp:'])).toEqual({ valid: true });
        expect(validateURL('sftp://example.com', ['ftp:', 'sftp:'])).toEqual({ valid: true });
      });

      it('should still reject dangerous protocols even with custom list', () => {
        const result = validateURL('javascript:alert(1)', ['javascript:']);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('dangerous protocol');
      });
    });

    describe('Edge Cases', () => {
      it('should handle URLs with ports', () => {
        const result = validateURL('https://example.com:8080');
        expect(result.valid).toBe(true);
      });

      it('should handle URLs with authentication', () => {
        const result = validateURL('https://user:pass@example.com');
        expect(result.valid).toBe(true);
      });

      it('should handle URLs with anchors', () => {
        const result = validateURL('https://example.com/page#section');
        expect(result.valid).toBe(true);
      });

      it('should handle URLs with query parameters', () => {
        const result = validateURL('https://example.com?foo=bar&baz=qux');
        expect(result.valid).toBe(true);
      });

      it('should handle internationalized domain names', () => {
        const result = validateURL('https://例え.jp');
        expect(result.valid).toBe(true);
      });
    });
  });

  // ==================== PHONE VALIDATION ====================

  describe('validatePhone', () => {
    describe('Valid Phone Numbers', () => {
      it.each(VALID_PHONES)('should accept valid phone: %s', (phone) => {
        const result = validatePhone(phone);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('Invalid Phone Numbers', () => {
      it.each(INVALID_PHONES)(
        'should reject invalid phone: $input',
        ({ input, error }) => {
          const result = validatePhone(input);
          expect(result.valid).toBe(false);
          expect(result.error).toContain(error);
        }
      );
    });

    describe('Edge Cases', () => {
      it('should handle phone with exactly 10 digits', () => {
        const result = validatePhone('5551234567');
        expect(result.valid).toBe(true);
      });

      it('should handle phone with exactly 15 digits', () => {
        const result = validatePhone('+123456789012345');
        expect(result.valid).toBe(true);
      });

      it('should reject phone with 9 digits', () => {
        const result = validatePhone('555123456');
        expect(result.valid).toBe(false);
      });

      it('should reject phone with 16 digits', () => {
        const result = validatePhone('+1234567890123456');
        expect(result.valid).toBe(false);
      });

      it('should handle various formatting styles', () => {
        expect(validatePhone('555.123.4567').valid).toBe(true);
        expect(validatePhone('555 123 4567').valid).toBe(true);
        expect(validatePhone('(555)123-4567').valid).toBe(true);
      });

      it('should handle international codes', () => {
        expect(validatePhone('+1 555 123 4567').valid).toBe(true);
        expect(validatePhone('+44 20 1234 5678').valid).toBe(true);
        expect(validatePhone('+86 10 1234 5678').valid).toBe(true);
      });
    });
  });

  // ==================== NAME VALIDATION ====================

  describe('validateName', () => {
    describe('Valid Names', () => {
      it.each(VALID_NAMES)('should accept valid name: %s', (name) => {
        const result = validateName(name);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('Invalid Names', () => {
      it.each(INVALID_NAMES)(
        'should reject invalid name: $input',
        ({ input, error }) => {
          const result = validateName(input);
          expect(result.valid).toBe(false);
          expect(result.error).toContain(error);
        }
      );

      it('should reject name that is too long', () => {
        const longName = 'A'.repeat(101);
        const result = validateName(longName);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('too long');
      });
    });

    describe('Custom Field Names', () => {
      it('should use custom field name in error message', () => {
        const result = validateName('', 'First Name');
        expect(result.error).toContain('First Name');
      });

      it('should use default field name when not provided', () => {
        const result = validateName('');
        expect(result.error).toContain('Name');
      });

      it('should apply custom field name to all error types', () => {
        const longName = 'A'.repeat(101);
        const result = validateName(longName, 'Last Name');
        expect(result.error).toContain('Last Name');
      });
    });

    describe('Edge Cases', () => {
      it('should accept name with exactly 1 character', () => {
        const result = validateName('A');
        expect(result.valid).toBe(true);
      });

      it('should accept name with exactly 100 characters', () => {
        const name = 'A'.repeat(100);
        const result = validateName(name);
        expect(result.valid).toBe(true);
      });

      it('should handle multiple spaces between names', () => {
        const result = validateName('John  Doe');
        expect(result.valid).toBe(true);
      });

      it('should handle names with multiple hyphens', () => {
        const result = validateName('Jean-Pierre-Louis');
        expect(result.valid).toBe(true);
      });

      it('should handle names with apostrophes', () => {
        expect(validateName("O'Brien").valid).toBe(true);
        expect(validateName("D'Angelo").valid).toBe(true);
      });

      it('should handle names with accented characters', () => {
        expect(validateName('José').valid).toBe(true);
        expect(validateName('François').valid).toBe(true);
        expect(validateName('Müller').valid).toBe(true);
      });
    });
  });

  // ==================== NUMBER VALIDATION ====================

  describe('validateNumber', () => {
    describe('Valid Numbers', () => {
      it('should accept integer numbers', () => {
        expect(validateNumber(5)).toEqual({ valid: true });
        expect(validateNumber(0)).toEqual({ valid: true });
        expect(validateNumber(-10)).toEqual({ valid: true });
      });

      it('should accept string numbers', () => {
        expect(validateNumber('10')).toEqual({ valid: true });
        expect(validateNumber('3.14')).toEqual({ valid: true });
        expect(validateNumber('-5')).toEqual({ valid: true });
      });

      it('should accept decimal numbers', () => {
        expect(validateNumber(3.14)).toEqual({ valid: true });
        expect(validateNumber(0.5)).toEqual({ valid: true });
        expect(validateNumber(-2.718)).toEqual({ valid: true });
      });
    });

    describe('Invalid Numbers', () => {
      it('should reject non-numeric values', () => {
        const result = validateNumber('abc');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('must be a number');
      });

      it('should reject empty string', () => {
        const result = validateNumber('');
        expect(result.valid).toBe(false);
      });

      it('should reject NaN', () => {
        const result = validateNumber(NaN);
        expect(result.valid).toBe(false);
      });
    });

    describe('Range Validation', () => {
      it('should enforce minimum value', () => {
        const result = validateNumber(5, 10);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('at least 10');
      });

      it('should enforce maximum value', () => {
        const result = validateNumber(15, undefined, 10);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('at most 10');
      });

      it('should validate within range', () => {
        expect(validateNumber(5, 0, 10)).toEqual({ valid: true });
        expect(validateNumber(0, 0, 10)).toEqual({ valid: true });
        expect(validateNumber(10, 0, 10)).toEqual({ valid: true });
      });

      it('should handle negative ranges', () => {
        expect(validateNumber(-5, -10, 0).valid).toBe(true);
        expect(validateNumber(-15, -10, 0).valid).toBe(false);
      });
    });

    describe('Custom Field Names', () => {
      it('should use custom field name in error message', () => {
        const result = validateNumber('abc', undefined, undefined, 'Price');
        expect(result.error).toContain('Price');
      });

      it('should use custom field name in range errors', () => {
        const result = validateNumber(5, 10, undefined, 'Age');
        expect(result.error).toContain('Age');
        expect(result.error).toContain('at least 10');
      });
    });

    describe('Edge Cases', () => {
      it('should handle zero', () => {
        expect(validateNumber(0)).toEqual({ valid: true });
      });

      it('should handle very large numbers', () => {
        expect(validateNumber(Number.MAX_SAFE_INTEGER).valid).toBe(true);
      });

      it('should handle very small numbers', () => {
        expect(validateNumber(Number.MIN_SAFE_INTEGER).valid).toBe(true);
      });

      it('should handle Infinity', () => {
        const result = validateNumber(Infinity);
        expect(result.valid).toBe(true);
      });

      it('should handle scientific notation', () => {
        expect(validateNumber('1e5').valid).toBe(true);
        expect(validateNumber('1.5e-3').valid).toBe(true);
      });
    });
  });

  // ==================== DATE VALIDATION ====================

  describe('validateDate', () => {
    describe('Valid Dates', () => {
      it('should accept valid ISO date strings', () => {
        expect(validateDate('2026-02-11')).toEqual({ valid: true });
        expect(validateDate('2026-12-31T23:59:59Z')).toEqual({ valid: true });
        expect(validateDate('2026-01-01T00:00:00.000Z')).toEqual({ valid: true });
      });

      it('should accept various date formats', () => {
        expect(validateDate('2026-02-11').valid).toBe(true);
        expect(validateDate('February 11, 2026').valid).toBe(true);
        expect(validateDate('02/11/2026').valid).toBe(true);
      });
    });

    describe('Invalid Dates', () => {
      it('should reject empty date', () => {
        const result = validateDate('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Date is required');
      });

      it('should reject invalid date format', () => {
        const result = validateDate('not-a-date');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid date format');
      });

      it('should reject invalid date values', () => {
        expect(validateDate('2026-13-01').valid).toBe(false);
        expect(validateDate('2026-02-30').valid).toBe(false);
      });
    });

    describe('Date Range Validation', () => {
      it('should enforce minimum date', () => {
        const minDate = new Date('2026-01-01');
        const result = validateDate('2025-12-31', minDate);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('must be after');
      });

      it('should enforce maximum date', () => {
        const maxDate = new Date('2026-12-31');
        const result = validateDate('2027-01-01', undefined, maxDate);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('must be before');
      });

      it('should accept dates within range', () => {
        const minDate = new Date('2026-01-01');
        const maxDate = new Date('2026-12-31');
        const result = validateDate('2026-06-15', minDate, maxDate);
        expect(result.valid).toBe(true);
      });

      it('should accept date equal to min date', () => {
        const minDate = new Date('2026-01-01');
        const result = validateDate('2026-01-01', minDate);
        expect(result.valid).toBe(true);
      });

      it('should accept date equal to max date', () => {
        const maxDate = new Date('2026-12-31');
        const result = validateDate('2026-12-31', undefined, maxDate);
        expect(result.valid).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should handle leap year dates', () => {
        expect(validateDate('2024-02-29').valid).toBe(true);
      });

      it('should reject invalid leap year dates', () => {
        expect(validateDate('2023-02-29').valid).toBe(false);
      });

      it('should handle dates with timezones', () => {
        expect(validateDate('2026-02-11T10:30:00-05:00').valid).toBe(true);
        expect(validateDate('2026-02-11T10:30:00+05:30').valid).toBe(true);
      });

      it('should handle very old dates', () => {
        expect(validateDate('1900-01-01').valid).toBe(true);
      });

      it('should handle far future dates', () => {
        expect(validateDate('2100-12-31').valid).toBe(true);
      });
    });
  });

  // ==================== FILE VALIDATION ====================

  describe('validateFile', () => {
    describe('Valid Files', () => {
      it('should accept files within size limit', () => {
        const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const result = validateFile(file, {
          maxSize: 10 * 1024 * 1024,
          allowedTypes: ['application/pdf'],
        });
        expect(result.valid).toBe(true);
      });

      it('should use default max size of 10MB', () => {
        const file = new File(['small content'], 'test.pdf', { type: 'application/pdf' });
        const result = validateFile(file);
        expect(result.valid).toBe(true);
      });
    });

    describe('File Size Validation', () => {
      it('should reject files over size limit', () => {
        const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
        const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
        const result = validateFile(file);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('File size must be less than');
        expect(result.error).toContain('10.00MB');
      });

      it('should accept files at exactly the size limit', () => {
        const content = new Array(10 * 1024 * 1024).fill('a').join('');
        const file = new File([content], 'test.pdf', { type: 'application/pdf' });
        const result = validateFile(file, { maxSize: 10 * 1024 * 1024 });
        expect(result.valid).toBe(true);
      });

      it('should handle custom size limits', () => {
        const content = 'small';
        const file = new File([content], 'test.txt', { type: 'text/plain' });
        const result = validateFile(file, { maxSize: 100 });
        expect(result.valid).toBe(true);
      });
    });

    describe('File Type Validation', () => {
      it('should reject disallowed file types', () => {
        const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
        const result = validateFile(file, {
          allowedTypes: ['application/pdf', 'image/jpeg'],
        });
        expect(result.valid).toBe(false);
        expect(result.error).toContain('File type must be one of');
      });

      it('should accept multiple allowed types', () => {
        const pdfFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });
        const jpgFile = new File(['jpg'], 'test.jpg', { type: 'image/jpeg' });
        const options = { allowedTypes: ['application/pdf', 'image/jpeg'] };

        expect(validateFile(pdfFile, options).valid).toBe(true);
        expect(validateFile(jpgFile, options).valid).toBe(true);
      });
    });

    describe('File Extension Validation', () => {
      it('should validate file extensions', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const result = validateFile(file, {
          allowedExtensions: ['pdf', 'jpg'],
        });
        expect(result.valid).toBe(false);
        expect(result.error).toContain('File extension must be one of');
      });

      it('should accept files with allowed extensions', () => {
        const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const result = validateFile(file, {
          allowedExtensions: ['pdf', 'jpg'],
        });
        expect(result.valid).toBe(true);
      });

      it('should handle case-insensitive extensions', () => {
        const file = new File(['content'], 'test.PDF', { type: 'application/pdf' });
        const result = validateFile(file, {
          allowedExtensions: ['pdf', 'jpg'],
        });
        expect(result.valid).toBe(true);
      });

      it('should handle files with no extension', () => {
        const file = new File(['content'], 'README', { type: 'text/plain' });
        const result = validateFile(file, {
          allowedExtensions: ['txt', 'md'],
        });
        expect(result.valid).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle files with multiple dots in name', () => {
        const file = new File(['content'], 'my.file.name.pdf', { type: 'application/pdf' });
        const result = validateFile(file, { allowedExtensions: ['pdf'] });
        expect(result.valid).toBe(true);
      });

      it('should handle empty file', () => {
        const file = new File([], 'empty.txt', { type: 'text/plain' });
        const result = validateFile(file);
        expect(result.valid).toBe(true);
      });

      it('should combine type and extension validation', () => {
        const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const result = validateFile(file, {
          allowedTypes: ['application/pdf'],
          allowedExtensions: ['pdf'],
        });
        expect(result.valid).toBe(true);
      });
    });
  });

  // ==================== HTML SANITIZATION ====================

  describe('sanitizeHTML', () => {
    describe('XSS Prevention', () => {
      it.each(HTML_XSS_PAYLOADS)(
        'should sanitize XSS payload: %s',
        (payload) => {
          const result = sanitizeHTML(payload);
          expect(result).not.toContain('<script>');
          expect(result).not.toContain('javascript:');
          expect(result).not.toContain('data:');
          expect(result).not.toMatch(/on\w+\s*=/i);
        }
      );

      it('should preserve safe HTML content', () => {
        const html = '<div>Hello</div><script>alert("xss")</script>';
        const result = sanitizeHTML(html);
        expect(result).toContain('<div>Hello</div>');
        expect(result).not.toContain('<script>');
      });
    });

    describe('Specific Attack Vectors', () => {
      it('should remove script tags', () => {
        const html = '<div>Hello</div><script>alert("xss")</script>';
        const result = sanitizeHTML(html);
        expect(result).not.toContain('<script>');
        expect(result).toContain('<div>Hello</div>');
      });

      it('should remove event handlers', () => {
        const html = '<div onclick="alert(\'xss\')">Click me</div>';
        const result = sanitizeHTML(html);
        expect(result).not.toMatch(/onclick/i);
      });

      it('should remove javascript: protocols', () => {
        const html = '<a href="javascript:alert(\'xss\')">Link</a>';
        const result = sanitizeHTML(html);
        expect(result).not.toContain('javascript:');
      });

      it('should remove data: protocols', () => {
        const html = '<img src="data:image/svg+xml,<svg>...</svg>">';
        const result = sanitizeHTML(html);
        expect(result).not.toContain('data:');
      });

      it('should handle multiple event handlers', () => {
        const html = '<div onclick="bad" onmouseover="bad" onerror="bad">Test</div>';
        const result = sanitizeHTML(html);
        expect(result).not.toMatch(/onclick/i);
        expect(result).not.toMatch(/onmouseover/i);
        expect(result).not.toMatch(/onerror/i);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty input', () => {
        expect(sanitizeHTML('')).toBe('');
        expect(sanitizeHTML(null as any)).toBe('');
        expect(sanitizeHTML(undefined as any)).toBe('');
      });

      it('should handle HTML with no dangerous content', () => {
        const html = '<p>This is <strong>safe</strong> content</p>';
        const result = sanitizeHTML(html);
        expect(result).toBe(html);
      });

      it('should handle nested script tags', () => {
        const html = '<script><script>alert(1)</script></script>';
        const result = sanitizeHTML(html);
        expect(result).not.toContain('<script>');
      });

      it('should handle case variations', () => {
        const html = '<SCRIPT>alert(1)</SCRIPT>';
        const result = sanitizeHTML(html);
        expect(result).not.toMatch(/<script/i);
      });

      it('should handle obfuscated event handlers', () => {
        const html = '<div on click="alert(1)">Test</div>';
        const result = sanitizeHTML(html);
        // Should still contain the div, just not the event
        expect(result).toContain('Test');
      });
    });
  });

  // ==================== SQL INJECTION DETECTION ====================

  describe('validateNoSQLInjection', () => {
    describe('Safe Input', () => {
      const safeInputs = [
        'normal text',
        'user@example.com',
        'Hello World',
        '123-456-7890',
      ];

      it.each(safeInputs)('should accept safe input: %s', (input) => {
        const result = validateNoSQLInjection(input);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('SQL Injection Attacks', () => {
      it.each(SQL_INJECTION_PAYLOADS)(
        'should detect SQL injection: %s',
        (payload) => {
          const result = validateNoSQLInjection(payload);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('invalid characters');
        }
      );

      it('should log warning when SQL injection detected', () => {
        const logSpy = vi.spyOn(logger, 'warn');
        validateNoSQLInjection("' OR '1'='1");
        expect(logSpy).toHaveBeenCalledWith('[Validator] Potential SQL injection detected');
      });
    });

    describe('Edge Cases', () => {
      it('should handle input with legitimate SQL keywords', () => {
        // "Select" in normal context should be safe
        const result = validateNoSQLInjection('Please select an option');
        expect(result.valid).toBe(true);
      });

      it('should detect case variations', () => {
        expect(validateNoSQLInjection("' UNION SELECT").valid).toBe(false);
        expect(validateNoSQLInjection("' union select").valid).toBe(false);
        expect(validateNoSQLInjection("' UnIoN SeLeCt").valid).toBe(false);
      });
    });
  });

  describe('validateNoNoSQLInjection', () => {
    describe('Safe Input', () => {
      it('should accept safe input', () => {
        expect(validateNoNoSQLInjection('normal text')).toEqual({ valid: true });
        expect(validateNoNoSQLInjection('user@example.com')).toEqual({ valid: true });
      });
    });

    describe('NoSQL Injection Attacks', () => {
      it.each(NOSQL_INJECTION_PAYLOADS)(
        'should detect NoSQL injection: %s',
        (payload) => {
          const result = validateNoNoSQLInjection(payload);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('invalid characters');
        }
      );

      it('should log warning when NoSQL injection detected', () => {
        const logSpy = vi.spyOn(logger, 'warn');
        validateNoNoSQLInjection('$where: function() {}');
        expect(logSpy).toHaveBeenCalledWith('[Validator] Potential NoSQL injection detected');
      });
    });

    describe('Specific Operators', () => {
      it('should detect $where operator', () => {
        const result = validateNoNoSQLInjection('$where: function() { return true; }');
        expect(result.valid).toBe(false);
      });

      it('should detect $ne operator', () => {
        const result = validateNoNoSQLInjection('password: {$ne: null}');
        expect(result.valid).toBe(false);
      });

      it('should detect comparison operators', () => {
        expect(validateNoNoSQLInjection('age: {$gt: 0}').valid).toBe(false);
        expect(validateNoNoSQLInjection('age: {$lt: 100}').valid).toBe(false);
      });

      it('should detect logical operators', () => {
        expect(validateNoNoSQLInjection('$or: [{a:1}, {b:2}]').valid).toBe(false);
        expect(validateNoNoSQLInjection('$and: [{a:1}, {b:2}]').valid).toBe(false);
      });

      it('should detect $regex operator', () => {
        expect(validateNoNoSQLInjection('$regex: /admin/').valid).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle normal dollar signs', () => {
        const result = validateNoNoSQLInjection('Price: $50.00');
        expect(result.valid).toBe(true);
      });

      it('should detect case variations', () => {
        expect(validateNoNoSQLInjection('$WHERE').valid).toBe(false);
        expect(validateNoNoSQLInjection('$Ne').valid).toBe(false);
      });
    });
  });

  // ==================== INPUT SANITIZATION ====================

  describe('sanitizeInput', () => {
    describe('Basic Sanitization', () => {
      it('should trim whitespace', () => {
        expect(sanitizeInput('  hello world  ')).toBe('hello world');
        expect(sanitizeInput('\thello\t')).toBe('hello');
        expect(sanitizeInput('\nhello\n')).toBe('hello');
      });

      it('should limit length', () => {
        const longText = 'a'.repeat(1500);
        const result = sanitizeInput(longText, 1000);
        expect(result.length).toBe(1000);
      });

      it('should use default max length of 1000', () => {
        const longText = 'a'.repeat(1500);
        const result = sanitizeInput(longText);
        expect(result.length).toBe(1000);
      });
    });

    describe('Control Character Removal', () => {
      it('should remove null bytes', () => {
        const input = 'test\0value';
        const result = sanitizeInput(input);
        expect(result).not.toContain('\0');
        expect(result).toBe('testvalue');
      });

      it('should remove control characters', () => {
        const input = 'test\x01\x02\x03value';
        const result = sanitizeInput(input);
        expect(result).toBe('testvalue');
      });

      it('should preserve newlines and tabs', () => {
        const input = 'line1\nline2\ttabbed';
        const result = sanitizeInput(input);
        expect(result).toContain('\n');
        expect(result).toContain('\t');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty input', () => {
        expect(sanitizeInput('')).toBe('');
        expect(sanitizeInput(null as any)).toBe('');
        expect(sanitizeInput(undefined as any)).toBe('');
      });

      it('should handle input at exactly max length', () => {
        const text = 'a'.repeat(1000);
        const result = sanitizeInput(text, 1000);
        expect(result.length).toBe(1000);
      });

      it('should handle Unicode characters', () => {
        const input = 'Hello 世界 🌍';
        const result = sanitizeInput(input);
        expect(result).toBe('Hello 世界 🌍');
      });

      it('should handle special whitespace characters', () => {
        const input = '  \u00A0\u200B test  '; // Non-breaking space, zero-width space
        const result = sanitizeInput(input);
        expect(result.trim()).toBeTruthy();
      });
    });
  });

  // ==================== FORM VALIDATION ====================

  describe('validateForm', () => {
    describe('Successful Validation', () => {
      it('should validate all fields successfully', () => {
        const data = {
          email: 'test@example.com',
          password: 'StrongP@ss123',
          name: 'John Doe',
        };

        const schema = {
          email: (value: string) => validateEmail(value),
          password: (value: string) => validatePassword(value),
          name: (value: string) => validateName(value),
        };

        const result = validateForm(data, schema);
        expect(result.valid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
        expect(result.errors).toEqual({});
      });

      it('should return empty errors for valid form', () => {
        const data = { age: 25 };
        const schema = {
          age: (value: number) => validateNumber(value, 0, 150, 'Age'),
        };

        const result = validateForm(data, schema);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual({});
      });
    });

    describe('Failed Validation', () => {
      it('should collect all validation errors', () => {
        const data = {
          email: 'invalid-email',
          password: 'weak',
          name: '',
        };

        const schema = {
          email: (value: string) => validateEmail(value),
          password: (value: string) => validatePassword(value),
          name: (value: string) => validateName(value),
        };

        const result = validateForm(data, schema);
        expect(result.valid).toBe(false);
        expect(Object.keys(result.errors)).toHaveLength(3);
        expect(result.errors.email).toBeDefined();
        expect(result.errors.password).toBeDefined();
        expect(result.errors.name).toBeDefined();
      });

      it('should include specific error messages', () => {
        const data = { email: 'invalid' };
        const schema = { email: (value: string) => validateEmail(value) };

        const result = validateForm(data, schema);
        expect(result.errors.email).toContain('Invalid email format');
      });
    });

    describe('Partial Validation', () => {
      it('should handle mix of valid and invalid fields', () => {
        const data = {
          email: 'valid@example.com',
          password: 'weak',
          name: 'John Doe',
        };

        const schema = {
          email: (value: string) => validateEmail(value),
          password: (value: string) => validatePassword(value),
          name: (value: string) => validateName(value),
        };

        const result = validateForm(data, schema);
        expect(result.valid).toBe(false);
        expect(Object.keys(result.errors)).toHaveLength(1);
        expect(result.errors.email).toBeUndefined();
        expect(result.errors.password).toBeDefined();
        expect(result.errors.name).toBeUndefined();
      });
    });

    describe('Complex Forms', () => {
      it('should validate forms with multiple field types', () => {
        const data = {
          email: 'user@example.com',
          age: 25,
          phone: '5551234567',
          website: 'https://example.com',
        };

        const schema = {
          email: (value: string) => validateEmail(value),
          age: (value: number) => validateNumber(value, 0, 150),
          phone: (value: string) => validatePhone(value),
          website: (value: string) => validateURL(value),
        };

        const result = validateForm(data, schema);
        expect(result.valid).toBe(true);
      });

      it('should handle optional fields gracefully', () => {
        const data: Record<string, any> = {
          email: 'user@example.com',
          phone: undefined,
        };

        const schema = {
          email: (value: string) => validateEmail(value),
          phone: (value: string) => value ? validatePhone(value) : { valid: true },
        };

        const result = validateForm(data, schema);
        expect(result.valid).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty form data', () => {
        const data = {};
        const schema = {};

        const result = validateForm(data, schema);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should handle schema with no matching fields', () => {
        const data = { email: 'test@example.com' };
        const schema = {
          password: (value: string) => validatePassword(value),
        };

        const result = validateForm(data, schema);
        // Should validate undefined value for password field
        expect(result.valid).toBe(false);
      });
    });
  });
});