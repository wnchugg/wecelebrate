/**
 * Client Configuration Validation Tests
 * 
 * Comprehensive test suite for client configuration validation module
 * Covers all validation rules, edge cases, and business logic
 * 
 * Created: February 12, 2026
 * Coverage Target: 100%
 */

import { describe, it, expect } from 'vitest';
import { 
  validateClientConfiguration,
  validateField,
  isValidEmail,
  isValidUrl,
  isValidPhone,
  isValidCode,
  type ClientConfigData
} from '../clientConfigValidation';

describe('Client Configuration Validation', () => {
  
  // ========== HELPER FUNCTION TESTS ==========
  
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('john.doe@company.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@domain.com')).toBe(true);
    });
    
    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('no@domain')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });
  
  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://subdomain.example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
    });
    
    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('//example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });
  
  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('(555) 123-4567')).toBe(true);
      expect(isValidPhone('+1-555-123-4567')).toBe(true);
      expect(isValidPhone('555.123.4567')).toBe(true);
      expect(isValidPhone('5551234567')).toBe(true);
    });
    
    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false); // Too short
      expect(isValidPhone('abc-def-ghij')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });
  
  describe('isValidCode', () => {
    it('should validate correct codes', () => {
      expect(isValidCode('ACME-2026')).toBe(true);
      expect(isValidCode('client_123')).toBe(true);
      expect(isValidCode('CODE123')).toBe(true);
    });
    
    it('should reject invalid codes', () => {
      expect(isValidCode('invalid code')).toBe(false); // Contains space
      expect(isValidCode('code@123')).toBe(false); // Contains @
      expect(isValidCode('')).toBe(false);
    });
  });
  
  // ========== CRITICAL FIELD VALIDATIONS ==========
  
  describe('Client Name Validation', () => {
    it('should require client name', () => {
      const result = validateClientConfiguration({
        clientName: '',
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Client name is required');
      expect(result.fieldErrors.clientName).toBe('This field is required');
    });
    
    it('should enforce minimum length (2 characters)', () => {
      const result = validateClientConfiguration({
        clientName: 'A',
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Client name must be at least 2 characters');
      expect(result.fieldErrors.clientName).toBe('Minimum 2 characters required');
    });
    
    it('should enforce maximum length (100 characters)', () => {
      const result = validateClientConfiguration({
        clientName: 'A'.repeat(101),
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Client name must not exceed 100 characters');
      expect(result.fieldErrors.clientName).toBe('Maximum 100 characters allowed');
    });
    
    it('should reject invalid characters', () => {
      const result = validateClientConfiguration({
        clientName: 'Client@Name#123',
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.clientName).toContain('letters, numbers, spaces, and basic punctuation');
    });
    
    it('should accept valid client names', () => {
      const validNames = [
        'Acme Corporation',
        'ABC Company & Co.',
        'Tech-Solutions Inc.',
        'Global_Enterprises'
      ];
      
      validNames.forEach(name => {
        const result = validateClientConfiguration({
          clientName: name,
          contactEmail: 'test@example.com',
          status: 'active'
        });
        
        expect(result.valid).toBe(true);
        expect(result.fieldErrors.clientName).toBeUndefined();
      });
    });
  });
  
  // ========== CODE VALIDATIONS ==========
  
  describe('Client Code Validation', () => {
    it('should accept empty client code', () => {
      const result = validateClientConfiguration({
        clientName: 'Valid Client',
        clientCode: '',
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.valid).toBe(true);
      expect(result.fieldErrors.clientCode).toBeUndefined();
    });
    
    it('should validate code format', () => {
      const result = validateClientConfiguration({
        clientName: 'Valid Client',
        clientCode: 'INVALID CODE!',
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.clientCode).toContain('Invalid format');
    });
    
    it('should enforce maximum length (50 characters)', () => {
      const result = validateClientConfiguration({
        clientName: 'Valid Client',
        clientCode: 'A'.repeat(51),
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.clientCode).toBe('Maximum 50 characters');
    });
  });
  
  // ========== EMAIL VALIDATIONS ==========
  
  describe('Email Validation', () => {
    const emailFields = [
      'contactEmail',
      'clientAccountManagerEmail',
      'clientImplementationManagerEmail',
      'technologyOwnerEmail'
    ];
    
    emailFields.forEach(field => {
      describe(`${field}`, () => {
        it('should accept empty email', () => {
          const data: any = {
            clientName: 'Valid Client',
            contactEmail: 'test@example.com',
            status: 'active',
            [field]: ''
          };
          
          const result = validateClientConfiguration(data);
          expect(result.valid).toBe(true);
        });
        
        it('should validate email format', () => {
          const data: any = {
            clientName: 'Valid Client',
            contactEmail: field === 'contactEmail' ? 'invalid-email' : 'test@example.com',
            status: 'active',
            [field]: 'invalid-email'
          };
          
          const result = validateClientConfiguration(data);
          expect(result.valid).toBe(false);
          expect(result.fieldErrors[field]).toContain('Invalid email format');
        });
        
        it('should accept valid email', () => {
          const data: any = {
            clientName: 'Valid Client',
            contactEmail: 'test@example.com',
            status: 'active',
            [field]: 'user@example.com'
          };
          
          const result = validateClientConfiguration(data);
          expect(result.fieldErrors[field]).toBeUndefined();
        });
      });
    });
  });
  
  // ========== PHONE VALIDATION ==========
  
  describe('Contact Phone Validation', () => {
    it('should accept empty phone', () => {
      const result = validateClientConfiguration({
        clientName: 'Valid Client',
        clientContactPhone: '',
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.valid).toBe(true);
    });
    
    it('should validate phone format', () => {
      const result = validateClientConfiguration({
        clientName: 'Valid Client',
        clientContactPhone: '123',
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.valid).toBe(false);
      expect(result.fieldErrors.clientContactPhone).toContain('Invalid phone');
    });
    
    it('should accept valid phone numbers', () => {
      const validPhones = [
        '(555) 123-4567',
        '+1-555-123-4567',
        '555.123.4567'
      ];
      
      validPhones.forEach(phone => {
        const result = validateClientConfiguration({
          clientName: 'Valid Client',
          clientContactPhone: phone,
          contactEmail: 'test@example.com',
          status: 'active'
        });
        
        expect(result.fieldErrors.clientContactPhone).toBeUndefined();
      });
    });
  });
  
  // ========== URL VALIDATIONS ==========
  
  describe('URL Validation', () => {
    const urlFields = ['clientUrl', 'clientCustomUrl'];
    
    urlFields.forEach(field => {
      describe(`${field}`, () => {
        it('should accept empty URL', () => {
          const data: any = {
            clientName: 'Valid Client',
            contactEmail: 'test@example.com',
            status: 'active',
            [field]: ''
          };
          
          const result = validateClientConfiguration(data);
          expect(result.valid).toBe(true);
        });
        
        it('should validate URL format', () => {
          const data: any = {
            clientName: 'Valid Client',
            contactEmail: 'test@example.com',
            status: 'active',
            [field]: 'not-a-url'
          };
          
          const result = validateClientConfiguration(data);
          expect(result.valid).toBe(false);
          expect(result.fieldErrors[field]).toContain('Invalid URL format');
        });
        
        it('should enforce maximum length (255 characters)', () => {
          const data: any = {
            clientName: 'Valid Client',
            contactEmail: 'test@example.com',
            status: 'active',
            [field]: 'https://example.com/' + 'a'.repeat(250)
          };
          
          const result = validateClientConfiguration(data);
          expect(result.valid).toBe(false);
          expect(result.fieldErrors[field]).toContain('too long');
        });
        
        it('should accept valid URLs', () => {
          const data: any = {
            clientName: 'Valid Client',
            contactEmail: 'test@example.com',
            status: 'active',
            [field]: 'https://www.example.com'
          };
          
          const result = validateClientConfiguration(data);
          expect(result.fieldErrors[field]).toBeUndefined();
        });
      });
    });
  });
  
  // ========== TEXT LENGTH VALIDATIONS ==========
  
  describe('Text Length Validation', () => {
    const textFields = [
      { name: 'description', maxLength: 500 },
      { name: 'clientContactName', maxLength: 100 },
      { name: 'clientAddressLine1', maxLength: 100 },
      { name: 'clientAddressLine2', maxLength: 100 },
      { name: 'clientAddressLine3', maxLength: 100 },
      { name: 'clientCity', maxLength: 100 },
      { name: 'clientCountryState', maxLength: 100 }
    ];
    
    textFields.forEach(({ name, maxLength }) => {
      describe(`${name}`, () => {
        it(`should enforce maximum length (${maxLength} characters)`, () => {
          const data: any = {
            clientName: 'Valid Client',
            contactEmail: 'test@example.com',
            status: 'active',
            [name]: 'A'.repeat(maxLength + 1)
          };
          
          const result = validateClientConfiguration(data);
          expect(result.valid).toBe(false);
          expect(result.fieldErrors[name]).toContain('Maximum');
        });
        
        it('should accept text within limit', () => {
          const data: any = {
            clientName: 'Valid Client',
            contactEmail: 'test@example.com',
            status: 'active',
            [name]: 'A'.repeat(maxLength)
          };
          
          const result = validateClientConfiguration(data);
          expect(result.fieldErrors[name]).toBeUndefined();
        });
      });
    });
  });
  
  // ========== BUSINESS LOGIC VALIDATIONS ==========
  
  describe('Business Logic Validation', () => {
    it('should warn when manager name is set but email is missing', () => {
      const result = validateClientConfiguration({
        clientName: 'Valid Client',
        clientAccountManager: 'John Doe',
        clientAccountManagerEmail: '',
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.warnings).toContain('Account manager name is set but email is missing');
    });
    
    it('should warn when PO type is set but PO number is missing', () => {
      const result = validateClientConfiguration({
        clientName: 'Valid Client',
        clientPoType: 'Standard',
        clientPoNumber: '',
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.warnings).toContain('PO type is set but PO number is missing');
    });
    
    it('should warn for non-standard ERP systems', () => {
      const result = validateClientConfiguration({
        clientName: 'Valid Client',
        clientErpSystem: 'CustomERP',
        contactEmail: 'test@example.com',
        status: 'active'
      });
      
      expect(result.warnings.some(w => w.includes('not in the standard list'))).toBe(true);
    });
  });
  
  // ========== FIELD-LEVEL VALIDATION FUNCTION ==========
  
  describe('validateField Function', () => {
    it('should validate clientName field', () => {
      expect(validateField('clientName', '')).toBe('Required');
      expect(validateField('clientName', 'A')).toBe('Minimum 2 characters');
      expect(validateField('clientName', 'A'.repeat(101))).toBe('Maximum 100 characters');
      expect(validateField('clientName', 'Valid Name')).toBeNull();
    });
    
    it('should validate clientCode field', () => {
      expect(validateField('clientCode', 'INVALID CODE')).toContain('Alphanumeric');
      expect(validateField('clientCode', 'A'.repeat(51))).toBe('Maximum 50 characters');
      expect(validateField('clientCode', 'VALID-CODE')).toBeNull();
    });
    
    it('should validate email fields', () => {
      expect(validateField('contactEmail', 'invalid')).toBe('Invalid email format');
      expect(validateField('contactEmail', 'user@example.com')).toBeNull();
    });
    
    it('should validate phone field', () => {
      expect(validateField('clientContactPhone', '123')).toBe('Invalid phone format');
      expect(validateField('clientContactPhone', '(555) 123-4567')).toBeNull();
    });
    
    it('should validate URL fields', () => {
      expect(validateField('clientUrl', 'not-a-url')).toBe('Invalid URL format');
      expect(validateField('clientUrl', 'https://example.com')).toBeNull();
    });
  });
  
  // ========== INTEGRATION TESTS ==========
  
  describe('Full Configuration Validation', () => {
    it('should validate complete valid configuration', () => {
      const completeConfig: ClientConfigData = {
        clientName: 'Acme Corporation',
        description: 'Leading technology company',
        contactEmail: 'contact@acme.com',
        status: 'active',
        clientCode: 'ACME-2026',
        clientRegion: 'US/CA',
        clientSourceCode: 'SRC-ACME-001',
        clientContactName: 'John Smith',
        clientContactPhone: '(555) 123-4567',
        clientTaxId: '12-3456789',
        clientAddressLine1: '123 Main Street',
        clientCity: 'San Francisco',
        clientPostalCode: '94102',
        clientCountryState: 'CA',
        clientCountry: 'US',
        clientAccountManager: 'Sarah Williams',
        clientAccountManagerEmail: 'sarah@halo.com',
        clientUrl: 'https://www.acme.com',
        clientAllowSessionTimeoutExtend: true,
        clientAuthenticationMethod: 'SSO',
        clientInvoiceType: 'Client',
        clientErpSystem: 'SAP',
        clientSso: 'Azure'
      };
      
      const result = validateClientConfiguration(completeConfig);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(Object.keys(result.fieldErrors)).toHaveLength(0);
    });
    
    it('should collect multiple errors', () => {
      const invalidConfig: ClientConfigData = {
        clientName: 'A', // Too short
        contactEmail: 'invalid-email',
        status: 'active',
        clientContactPhone: '123', // Too short
        clientUrl: 'not-a-url',
        clientAccountManagerEmail: 'also-invalid'
      };
      
      const result = validateClientConfiguration(invalidConfig);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
      expect(Object.keys(result.fieldErrors).length).toBeGreaterThan(3);
    });
  });
});
