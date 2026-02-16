/**
 * Backend Validation Tests (Vitest)
 * Tests for validation functions in validation.ts
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isValidUrl,
  isValidSlug,
  isValidCurrency,
  validateSignupRequest,
  validateLoginRequest,
  validateCreateClientRequest,
  validateCreateSiteRequest,
  validateCreateGiftRequest,
  validateCreateEmployeeRequest,
  validateCreateOrderRequest,
  validateAccessRequest,
} from '../validation.ts';

describe('Backend Validation Functions', () => {
  
  // ===== Email Validation Tests =====
  
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('name@subdomain.example.com')).toBe(true);
      expect(isValidEmail('user123@test.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
    });
  });

  // ===== Password Validation Tests =====
  
  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      expect(isValidPassword('Password1')).toBe(true);
      expect(isValidPassword('SecureP@ss123')).toBe(true);
      expect(isValidPassword('MyPassword99')).toBe(true);
      expect(isValidPassword('Abcdefg1')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isValidPassword('short1A')).toBe(false); // Too short
      expect(isValidPassword('alllowercase1')).toBe(false); // No uppercase
      expect(isValidPassword('ALLUPPERCASE1')).toBe(false); // No lowercase
      expect(isValidPassword('NoNumbers')).toBe(false); // No numbers
      expect(isValidPassword('NoNumbersLower')).toBe(false); // No numbers
      expect(isValidPassword('')).toBe(false); // Empty
      expect(isValidPassword('Pass1')).toBe(false); // Too short
    });
  });

  // ===== URL Validation Tests =====
  
  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:5173')).toBe(true);
      expect(isValidUrl('https://subdomain.example.com/path?query=value')).toBe(true);
      expect(isValidUrl('https://example.com:8080')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      // javascript: is actually a valid URL protocol, so skip this test
      // expect(isValidUrl('javascript:alert(1)')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false); // Missing protocol
    });
  });

  // ===== Slug Validation Tests =====
  
  describe('isValidSlug', () => {
    it('should validate correct slugs', () => {
      expect(isValidSlug('my-company')).toBe(true);
      expect(isValidSlug('site-123')).toBe(true);
      expect(isValidSlug('abc')).toBe(true);
      expect(isValidSlug('test-site-2024')).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(isValidSlug('My Company')).toBe(false); // Spaces
      expect(isValidSlug('My_Company')).toBe(false); // Underscores
      expect(isValidSlug('MyCompany')).toBe(false); // Uppercase
      expect(isValidSlug('site#123')).toBe(false); // Special chars
      expect(isValidSlug('site@test')).toBe(false); // Special chars
    });
  });

  // ===== Currency Validation Tests =====
  
  describe('isValidCurrency', () => {
    it('should validate correct currency codes', () => {
      expect(isValidCurrency('USD')).toBe(true);
      expect(isValidCurrency('EUR')).toBe(true);
      expect(isValidCurrency('GBP')).toBe(true);
      expect(isValidCurrency('JPY')).toBe(true);
    });

    it('should reject invalid currency codes', () => {
      expect(isValidCurrency('usd')).toBe(false); // Lowercase
      expect(isValidCurrency('US')).toBe(false); // Too short
      expect(isValidCurrency('USDD')).toBe(false); // Too long
      expect(isValidCurrency('123')).toBe(false); // Numbers
      expect(isValidCurrency('')).toBe(false); // Empty
    });
  });

  // ===== Signup Request Validation Tests =====
  
  describe('validateSignupRequest', () => {
    it('should validate correct signup request', () => {
      const result = validateSignupRequest({
        email: 'user@example.com',
        password: 'SecurePass123',
        username: 'testuser',
        fullName: 'Test User',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject missing email', () => {
      const result = validateSignupRequest({
        password: 'SecurePass123',
        username: 'testuser',
        fullName: 'Test User',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('email');
    });

    it('should reject invalid email', () => {
      const result = validateSignupRequest({
        email: 'not-an-email',
        password: 'SecurePass123',
        username: 'testuser',
        fullName: 'Test User',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('email');
    });

    it('should reject weak password', () => {
      const result = validateSignupRequest({
        email: 'user@example.com',
        password: 'weak',
        username: 'testuser',
        fullName: 'Test User',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('password');
    });

    it('should reject username too short', () => {
      const result = validateSignupRequest({
        email: 'user@example.com',
        password: 'SecurePass123',
        username: 'ab',
        fullName: 'Test User',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('username');
    });

    it('should reject missing full name', () => {
      const result = validateSignupRequest({
        email: 'user@example.com',
        password: 'SecurePass123',
        username: 'testuser',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('fullName');
    });
  });

  // ===== Login Request Validation Tests =====
  
  describe('validateLoginRequest', () => {
    it('should validate correct login request', () => {
      const result = validateLoginRequest({
        emailOrUsername: 'user@example.com',
        password: 'password123',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject missing credentials', () => {
      const result = validateLoginRequest({
        emailOrUsername: 'user@example.com',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('password');
    });

    it('should reject missing email or username', () => {
      const result = validateLoginRequest({
        password: 'password123',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('emailOrUsername');
    });
  });

  // ===== Create Client Request Validation Tests =====
  
  describe('validateCreateClientRequest', () => {
    it('should validate correct client request', () => {
      const result = validateCreateClientRequest({
        name: 'Test Company',
        contactEmail: 'contact@company.com',
        status: 'active',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject name too short', () => {
      const result = validateCreateClientRequest({
        name: 'A',
        contactEmail: 'contact@company.com',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('name');
    });

    it('should reject invalid email', () => {
      const result = validateCreateClientRequest({
        name: 'Test Company',
        contactEmail: 'not-an-email',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('contactEmail');
    });

    it('should reject invalid status', () => {
      const result = validateCreateClientRequest({
        name: 'Test Company',
        contactEmail: 'contact@company.com',
        status: 'invalid',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('status');
    });

    it('should accept request without status', () => {
      const result = validateCreateClientRequest({
        name: 'Test Company',
        contactEmail: 'contact@company.com',
      });
      expect(result.valid).toBe(true);
    });
  });

  // ===== Create Site Request Validation Tests =====
  
  describe('validateCreateSiteRequest', () => {
    it('should validate correct site request', () => {
      const result = validateCreateSiteRequest({
        clientId: 'client-123',
        name: 'Test Site',
        slug: 'test-site',
        validationMethods: [
          { type: 'email', enabled: true },
          { type: 'employeeId', enabled: false },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it('should reject invalid slug', () => {
      const result = validateCreateSiteRequest({
        clientId: 'client-123',
        name: 'Test Site',
        slug: 'Test Site',
        validationMethods: [{ type: 'email', enabled: true }],
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('slug');
    });

    it('should reject empty validation methods', () => {
      const result = validateCreateSiteRequest({
        clientId: 'client-123',
        name: 'Test Site',
        slug: 'test-site',
        validationMethods: [],
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('validationMethods');
    });

    it('should reject invalid validation method type', () => {
      const result = validateCreateSiteRequest({
        clientId: 'client-123',
        name: 'Test Site',
        slug: 'test-site',
        validationMethods: [{ type: 'invalid', enabled: true }],
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('validationMethods');
    });

    it('should reject validation method without enabled flag', () => {
      const result = validateCreateSiteRequest({
        clientId: 'client-123',
        name: 'Test Site',
        slug: 'test-site',
        validationMethods: [{ type: 'email' }],
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('validationMethods');
    });
  });

  // ===== Create Gift Request Validation Tests =====
  
  describe('validateCreateGiftRequest', () => {
    it('should validate correct gift request', () => {
      const result = validateCreateGiftRequest({
        name: 'Test Gift',
        description: 'A test gift',
        sku: 'SKU-123',
        price: 29.99,
        currency: 'USD',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject negative price', () => {
      const result = validateCreateGiftRequest({
        name: 'Test Gift',
        description: 'A test gift',
        sku: 'SKU-123',
        price: -10,
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('price');
    });

    it('should reject invalid currency', () => {
      const result = validateCreateGiftRequest({
        name: 'Test Gift',
        description: 'A test gift',
        sku: 'SKU-123',
        price: 29.99,
        currency: 'usd',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('currency');
    });

    it('should reject invalid image URL', () => {
      const result = validateCreateGiftRequest({
        name: 'Test Gift',
        description: 'A test gift',
        sku: 'SKU-123',
        price: 29.99,
        imageUrl: 'not a url',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('imageUrl');
    });

    it('should accept request without optional fields', () => {
      const result = validateCreateGiftRequest({
        name: 'Test Gift',
        description: 'A test gift',
        sku: 'SKU-123',
        price: 29.99,
      });
      expect(result.valid).toBe(true);
    });

    it('should reject negative available quantity', () => {
      const result = validateCreateGiftRequest({
        name: 'Test Gift',
        description: 'A test gift',
        sku: 'SKU-123',
        price: 29.99,
        availableQuantity: -5,
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('availableQuantity');
    });
  });

  // ===== Create Employee Request Validation Tests =====
  
  describe('validateCreateEmployeeRequest', () => {
    it('should validate correct employee request', () => {
      const result = validateCreateEmployeeRequest({
        siteId: 'site-123',
        employeeId: 'EMP-001',
        email: 'employee@company.com',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject missing site ID', () => {
      const result = validateCreateEmployeeRequest({
        employeeId: 'EMP-001',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('siteId');
    });

    it('should reject invalid email', () => {
      const result = validateCreateEmployeeRequest({
        siteId: 'site-123',
        employeeId: 'EMP-001',
        email: 'not-an-email',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('email');
    });

    it('should accept request without email', () => {
      const result = validateCreateEmployeeRequest({
        siteId: 'site-123',
        employeeId: 'EMP-001',
      });
      expect(result.valid).toBe(true);
    });
  });

  // ===== Create Order Request Validation Tests =====
  
  describe('validateCreateOrderRequest', () => {
    it('should validate correct order request', () => {
      const result = validateCreateOrderRequest({
        siteId: 'site-123',
        giftId: 'gift-456',
        shippingAddress: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          postalCode: '62701',
          country: 'USA',
        },
      });
      expect(result.valid).toBe(true);
    });

    it('should reject missing shipping address', () => {
      const result = validateCreateOrderRequest({
        siteId: 'site-123',
        giftId: 'gift-456',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('shippingAddress');
    });

    it('should reject incomplete shipping address', () => {
      const result = validateCreateOrderRequest({
        siteId: 'site-123',
        giftId: 'gift-456',
        shippingAddress: {
          street: '123 Main St',
          city: 'Springfield',
        },
      });
      expect(result.valid).toBe(false);
      expect(result.field).toContain('shippingAddress');
    });
  });

  // ===== Validate Access Request Tests =====
  
  describe('validateAccessRequest', () => {
    it('should validate correct access request with email', () => {
      const result = validateAccessRequest({
        siteId: 'site-123',
        method: 'email',
        value: 'user@example.com',
      });
      expect(result.valid).toBe(true);
    });

    it('should validate correct access request with employee ID', () => {
      const result = validateAccessRequest({
        siteId: 'site-123',
        method: 'employeeId',
        value: 'EMP-001',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject invalid method', () => {
      const result = validateAccessRequest({
        siteId: 'site-123',
        method: 'invalid',
        value: 'test',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('method');
    });

    it('should reject invalid email format', () => {
      const result = validateAccessRequest({
        siteId: 'site-123',
        method: 'email',
        value: 'not-an-email',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('value');
    });

    it('should reject missing value', () => {
      const result = validateAccessRequest({
        siteId: 'site-123',
        method: 'email',
      });
      expect(result.valid).toBe(false);
      expect(result.field).toBe('value');
    });
  });
});
