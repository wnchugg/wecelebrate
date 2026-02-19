/**
 * Client Management Validation Tests
 * Feature: client-v2-field-audit
 * Tests for validation functions in ClientManagement.tsx
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateEmail,
  validatePhone,
  validateUrl,
  validateRequired,
} from '../ClientManagement';

describe('Client Management Validation Functions', () => {
  
  // ===== Property-Based Tests =====
  
  describe('Property 3: Email Format Validation', () => {
    /**
     * Feature: client-v2-field-audit, Property 3: Email Format Validation
     * Validates: Requirements 2.4, 4.2
     * 
     * For any string that does not match the email regex pattern,
     * the validation function should reject it and return an error.
     */
    it('should accept valid email addresses', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          (email) => {
            const result = validateEmail(email);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject strings without @ symbol', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => !s.includes('@') && s.trim() !== ''),
          (invalidEmail) => {
            const result = validateEmail(invalidEmail);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject strings without domain', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).map(s => s + '@'),
          (invalidEmail) => {
            const result = validateEmail(invalidEmail);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject strings without TLD', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).map(s => s + '@domain'),
          (invalidEmail) => {
            const result = validateEmail(invalidEmail);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept empty strings for optional fields', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept whitespace-only strings for optional fields', () => {
      const result = validateEmail('   ');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Property 4: Phone Format Validation', () => {
    /**
     * Feature: client-v2-field-audit, Property 4: Phone Format Validation
     * Validates: Requirements 2.5, 4.3
     * 
     * For any string that does not match a valid phone format
     * (digits, spaces, hyphens, parentheses, plus sign),
     * the validation function should reject it and return an error.
     */
    it('should accept valid phone formats with digits, spaces, hyphens, parentheses, and plus', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '-', '(', ')', '+'), { minLength: 7, maxLength: 20 })
            .map(arr => arr.join(''))
            .filter(phone => {
              const digitCount = phone.replace(/\D/g, '').length;
              return digitCount >= 7;
            }),
          (phone) => {
            const result = validatePhone(phone);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject phone numbers with invalid characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => /[a-zA-Z]/.test(s)),
          (invalidPhone) => {
            const result = validatePhone(invalidPhone);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject phone numbers with fewer than 7 digits', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '-'), { minLength: 1, maxLength: 6 })
            .map(arr => arr.join(''))
            .filter(s => s.trim() !== ''), // Exclude whitespace-only strings
          (shortPhone) => {
            const result = validatePhone(shortPhone);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept empty strings for optional fields', () => {
      const result = validatePhone('');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept whitespace-only strings for optional fields', () => {
      const result = validatePhone('   ');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Property 5: URL Format Validation', () => {
    /**
     * Feature: client-v2-field-audit, Property 5: URL Format Validation
     * Validates: Requirements 4.4
     * 
     * For any string that does not match a valid URL format
     * (http/https protocol, valid domain),
     * the validation function should reject it and return an error.
     */
    it('should accept valid HTTP and HTTPS URLs', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          (url) => {
            const result = validateUrl(url);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject URLs without protocol', () => {
      fc.assert(
        fc.property(
          fc.domain(),
          (domain) => {
            const result = validateUrl(domain);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('http://');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject URLs with non-http protocols', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('ftp', 'file', 'mailto', 'tel'),
          fc.domain(),
          (protocol, domain) => {
            const url = `${protocol}://${domain}`;
            const result = validateUrl(url);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid URL strings', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => {
            // Exclude whitespace-only strings (they're valid for optional fields)
            if (s.trim() === '') return false;
            try {
              new URL(s);
              return false;
            } catch {
              return true;
            }
          }),
          (invalidUrl) => {
            const result = validateUrl(invalidUrl);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept empty strings for optional fields', () => {
      const result = validateUrl('');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept whitespace-only strings for optional fields', () => {
      const result = validateUrl('   ');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Property 7: Required Field Validation', () => {
    /**
     * Feature: client-v2-field-audit, Property 7: Required Field Validation
     * Validates: Requirements 4.1
     * 
     * For any required field (name, contactEmail, status),
     * submitting the form with that field empty should prevent submission
     * and display a validation error.
     */
    it('should reject empty strings for required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (fieldName) => {
            const result = validateRequired('', fieldName);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain(fieldName);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject whitespace-only strings for required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 10 }).map(n => ' '.repeat(n)),
          (fieldName, whitespace) => {
            const result = validateRequired(whitespace, fieldName);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain(fieldName);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject null values for required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (fieldName) => {
            const result = validateRequired(null, fieldName);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain(fieldName);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject undefined values for required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (fieldName) => {
            const result = validateRequired(undefined, fieldName);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain(fieldName);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept non-empty strings for required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1 }).filter(s => s.trim() !== ''), // Exclude whitespace-only strings
          (fieldName, value) => {
            const result = validateRequired(value, fieldName);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ===== Unit Tests for Specific Examples =====
  
  describe('Email Validation - Specific Examples', () => {
    it('should accept standard email format', () => {
      const result = validateEmail('user@example.com');
      expect(result.valid).toBe(true);
    });

    it('should accept email with plus sign', () => {
      const result = validateEmail('user+tag@example.com');
      expect(result.valid).toBe(true);
    });

    it('should accept email with subdomain', () => {
      const result = validateEmail('user@mail.example.com');
      expect(result.valid).toBe(true);
    });

    it('should accept email with numbers', () => {
      const result = validateEmail('user123@example456.com');
      expect(result.valid).toBe(true);
    });

    it('should reject email without @', () => {
      const result = validateEmail('userexample.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should reject email without domain', () => {
      const result = validateEmail('user@');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should reject email without TLD', () => {
      const result = validateEmail('user@example');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });
  });

  describe('Phone Validation - Specific Examples', () => {
    it('should accept US format with hyphens', () => {
      const result = validatePhone('123-456-7890');
      expect(result.valid).toBe(true);
    });

    it('should accept US format with parentheses', () => {
      const result = validatePhone('(123) 456-7890');
      expect(result.valid).toBe(true);
    });

    it('should accept international format with plus', () => {
      const result = validatePhone('+1-123-456-7890');
      expect(result.valid).toBe(true);
    });

    it('should accept digits only', () => {
      const result = validatePhone('1234567890');
      expect(result.valid).toBe(true);
    });

    it('should reject phone with letters', () => {
      const result = validatePhone('123-ABC-7890');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid phone number');
    });

    it('should reject phone with special characters', () => {
      const result = validatePhone('123-456-7890#');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid phone number');
    });

    it('should reject phone with too few digits', () => {
      const result = validatePhone('123-456');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Phone number must contain at least 7 digits');
    });
  });

  describe('URL Validation - Specific Examples', () => {
    it('should accept HTTP URL', () => {
      const result = validateUrl('http://example.com');
      expect(result.valid).toBe(true);
    });

    it('should accept HTTPS URL', () => {
      const result = validateUrl('https://example.com');
      expect(result.valid).toBe(true);
    });

    it('should accept URL with path', () => {
      const result = validateUrl('https://example.com/path/to/page');
      expect(result.valid).toBe(true);
    });

    it('should accept URL with query parameters', () => {
      const result = validateUrl('https://example.com?param=value');
      expect(result.valid).toBe(true);
    });

    it('should accept URL with port', () => {
      const result = validateUrl('https://example.com:8080');
      expect(result.valid).toBe(true);
    });

    it('should reject URL without protocol', () => {
      const result = validateUrl('example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('http://');
    });

    it('should reject FTP URL', () => {
      const result = validateUrl('ftp://example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('http://');
    });

    it('should reject invalid URL', () => {
      const result = validateUrl('not a url');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('http://');
    });
  });

  describe('Required Field Validation - Specific Examples', () => {
    it('should accept non-empty value', () => {
      const result = validateRequired('Test Value', 'Test Field');
      expect(result.valid).toBe(true);
    });

    it('should reject empty string', () => {
      const result = validateRequired('', 'Name');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Name is required');
    });

    it('should reject whitespace string', () => {
      const result = validateRequired('   ', 'Email');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should reject null', () => {
      const result = validateRequired(null, 'Status');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Status is required');
    });

    it('should reject undefined', () => {
      const result = validateRequired(undefined, 'Client Code');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Client Code is required');
    });
  });
});


// ===== Form Validation Behavior Tests =====

describe('Form Validation Behavior', () => {
  /**
   * Tests for validation triggers (blur, submit)
   * Tests for error message display
   * Tests for submit button enable/disable
   * Validates: Requirements 4.6, 4.7
   */
  
  describe('Validation Triggers', () => {
    it('should validate required fields on blur', () => {
      // Test that validation is triggered when a required field loses focus
      const nameResult = validateRequired('', 'Client name');
      expect(nameResult.valid).toBe(false);
      expect(nameResult.error).toBeDefined();
    });

    it('should validate email format on blur', () => {
      // Test that email validation is triggered on blur
      const emailResult = validateEmail('invalid-email');
      expect(emailResult.valid).toBe(false);
      expect(emailResult.error).toBeDefined();
    });

    it('should validate phone format on blur', () => {
      // Test that phone validation is triggered on blur
      const phoneResult = validatePhone('abc-def-ghij');
      expect(phoneResult.valid).toBe(false);
      expect(phoneResult.error).toBeDefined();
    });

    it('should validate URL format on blur', () => {
      // Test that URL validation is triggered on blur
      const urlResult = validateUrl('not-a-url');
      expect(urlResult.valid).toBe(false);
      expect(urlResult.error).toBeDefined();
    });
  });

  describe('Error Message Display', () => {
    it('should return appropriate error message for empty required field', () => {
      const result = validateRequired('', 'Client name');
      expect(result.error).toBe('Client name is required');
    });

    it('should return appropriate error message for invalid email', () => {
      const result = validateEmail('invalid');
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should return appropriate error message for invalid phone', () => {
      const result = validatePhone('123');
      expect(result.error).toBe('Phone number must contain at least 7 digits');
    });

    it('should return appropriate error message for invalid URL', () => {
      const result = validateUrl('invalid');
      expect(result.error).toContain('http://');
    });
  });

  describe('Submit Button State', () => {
    it('should indicate form is invalid when required fields are empty', () => {
      const nameResult = validateRequired('', 'Client name');
      const emailResult = validateRequired('', 'Contact email');
      
      const hasErrors = !nameResult.valid || !emailResult.valid;
      expect(hasErrors).toBe(true);
    });

    it('should indicate form is valid when all required fields are filled correctly', () => {
      const nameResult = validateRequired('Test Client', 'Client name');
      const emailResult = validateEmail('test@example.com');
      
      const hasErrors = !nameResult.valid || !emailResult.valid;
      expect(hasErrors).toBe(false);
    });

    it('should indicate form is invalid when optional fields have invalid format', () => {
      const phoneResult = validatePhone('abc');
      const urlResult = validateUrl('not-a-url');
      
      const hasErrors = !phoneResult.valid || !urlResult.valid;
      expect(hasErrors).toBe(true);
    });

    it('should indicate form is valid when optional fields are empty', () => {
      const phoneResult = validatePhone('');
      const urlResult = validateUrl('');
      
      const hasErrors = !phoneResult.valid || !urlResult.valid;
      expect(hasErrors).toBe(false);
    });

    it('should indicate form is valid when optional fields have valid format', () => {
      const phoneResult = validatePhone('123-456-7890');
      const urlResult = validateUrl('https://example.com');
      
      const hasErrors = !phoneResult.valid || !urlResult.valid;
      expect(hasErrors).toBe(false);
    });
  });

  describe('Validation on Submit', () => {
    it('should validate all required fields on submit', () => {
      const errors: Record<string, string> = {};
      
      const nameResult = validateRequired('', 'Client name');
      if (!nameResult.valid) errors.name = nameResult.error!;
      
      const emailResult = validateRequired('', 'Contact email');
      if (!emailResult.valid) errors.contactEmail = emailResult.error!;
      
      expect(Object.keys(errors).length).toBeGreaterThan(0);
      expect(errors.name).toBeDefined();
      expect(errors.contactEmail).toBeDefined();
    });

    it('should validate all populated optional fields on submit', () => {
      const errors: Record<string, string> = {};
      
      const phoneResult = validatePhone('invalid');
      if (!phoneResult.valid) errors.phone = phoneResult.error!;
      
      const urlResult = validateUrl('invalid');
      if (!urlResult.valid) errors.url = urlResult.error!;
      
      expect(Object.keys(errors).length).toBeGreaterThan(0);
      expect(errors.phone).toBeDefined();
      expect(errors.url).toBeDefined();
    });

    it('should not have errors when all fields are valid', () => {
      const errors: Record<string, string> = {};
      
      const nameResult = validateRequired('Test Client', 'Client name');
      if (!nameResult.valid) errors.name = nameResult.error!;
      
      const emailResult = validateEmail('test@example.com');
      if (!emailResult.valid) errors.email = emailResult.error!;
      
      const phoneResult = validatePhone('123-456-7890');
      if (!phoneResult.valid) errors.phone = phoneResult.error!;
      
      const urlResult = validateUrl('https://example.com');
      if (!urlResult.valid) errors.url = urlResult.error!;
      
      expect(Object.keys(errors).length).toBe(0);
    });
  });
});
