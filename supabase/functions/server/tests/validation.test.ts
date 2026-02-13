/**
 * Backend Validation Tests
 * Phase 3: Backend Refactoring
 */

import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
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
} from '../validation.ts';

// ===== Email Validation Tests =====

Deno.test('isValidEmail - valid emails', () => {
  assertEquals(isValidEmail('user@example.com'), true);
  assertEquals(isValidEmail('test.user+tag@domain.co.uk'), true);
  assertEquals(isValidEmail('name@subdomain.example.com'), true);
});

Deno.test('isValidEmail - invalid emails', () => {
  assertEquals(isValidEmail('notanemail'), false);
  assertEquals(isValidEmail('@example.com'), false);
  assertEquals(isValidEmail('user@'), false);
  assertEquals(isValidEmail(''), false);
  assertEquals(isValidEmail('user @example.com'), false);
});

// ===== Password Validation Tests =====

Deno.test('isValidPassword - valid passwords', () => {
  assertEquals(isValidPassword('Password1'), true);
  assertEquals(isValidPassword('SecureP@ss123'), true);
  assertEquals(isValidPassword('MyPassword99'), true);
});

Deno.test('isValidPassword - invalid passwords', () => {
  assertEquals(isValidPassword('short1A'), false); // Too short
  assertEquals(isValidPassword('alllowercase1'), false); // No uppercase
  assertEquals(isValidPassword('ALLUPPERCASE1'), false); // No lowercase
  assertEquals(isValidPassword('NoNumbers'), false); // No numbers
  assertEquals(isValidPassword(''), false); // Empty
});

// ===== URL Validation Tests =====

Deno.test('isValidUrl - valid URLs', () => {
  assertEquals(isValidUrl('https://example.com'), true);
  assertEquals(isValidUrl('http://localhost:5173'), true);
  assertEquals(isValidUrl('https://subdomain.example.com/path?query=value'), true);
});

Deno.test('isValidUrl - invalid URLs', () => {
  assertEquals(isValidUrl('not a url'), false);
  assertEquals(isValidUrl('javascript:alert(1)'), false);
  assertEquals(isValidUrl(''), false);
});

// ===== Slug Validation Tests =====

Deno.test('isValidSlug - valid slugs', () => {
  assertEquals(isValidSlug('my-company'), true);
  assertEquals(isValidSlug('site-123'), true);
  assertEquals(isValidSlug('abc'), true);
});

Deno.test('isValidSlug - invalid slugs', () => {
  assertEquals(isValidSlug('My Company'), false); // Spaces
  assertEquals(isValidSlug('My_Company'), false); // Underscores
  assertEquals(isValidSlug('MyCompany'), false); // Uppercase
  assertEquals(isValidSlug('site#123'), false); // Special chars
});

// ===== Currency Validation Tests =====

Deno.test('isValidCurrency - valid currencies', () => {
  assertEquals(isValidCurrency('USD'), true);
  assertEquals(isValidCurrency('EUR'), true);
  assertEquals(isValidCurrency('GBP'), true);
});

Deno.test('isValidCurrency - invalid currencies', () => {
  assertEquals(isValidCurrency('usd'), false); // Lowercase
  assertEquals(isValidCurrency('US'), false); // Too short
  assertEquals(isValidCurrency('USDD'), false); // Too long
  assertEquals(isValidCurrency('123'), false); // Numbers
});

// ===== Signup Request Validation Tests =====

Deno.test('validateSignupRequest - valid request', () => {
  const result = validateSignupRequest({
    email: 'user@example.com',
    password: 'SecurePass123',
    username: 'testuser',
    fullName: 'Test User',
  });
  assertEquals(result.valid, true);
});

Deno.test('validateSignupRequest - missing email', () => {
  const result = validateSignupRequest({
    password: 'SecurePass123',
    username: 'testuser',
    fullName: 'Test User',
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'email');
});

Deno.test('validateSignupRequest - invalid email', () => {
  const result = validateSignupRequest({
    email: 'not-an-email',
    password: 'SecurePass123',
    username: 'testuser',
    fullName: 'Test User',
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'email');
});

Deno.test('validateSignupRequest - weak password', () => {
  const result = validateSignupRequest({
    email: 'user@example.com',
    password: 'weak',
    username: 'testuser',
    fullName: 'Test User',
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'password');
});

Deno.test('validateSignupRequest - username too short', () => {
  const result = validateSignupRequest({
    email: 'user@example.com',
    password: 'SecurePass123',
    username: 'ab',
    fullName: 'Test User',
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'username');
});

// ===== Login Request Validation Tests =====

Deno.test('validateLoginRequest - valid request', () => {
  const result = validateLoginRequest({
    emailOrUsername: 'user@example.com',
    password: 'password123',
  });
  assertEquals(result.valid, true);
});

Deno.test('validateLoginRequest - missing credentials', () => {
  const result = validateLoginRequest({
    emailOrUsername: 'user@example.com',
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'password');
});

// ===== Create Client Request Validation Tests =====

Deno.test('validateCreateClientRequest - valid request', () => {
  const result = validateCreateClientRequest({
    name: 'Test Company',
    contactEmail: 'contact@company.com',
    status: 'active',
  });
  assertEquals(result.valid, true);
});

Deno.test('validateCreateClientRequest - name too short', () => {
  const result = validateCreateClientRequest({
    name: 'A',
    contactEmail: 'contact@company.com',
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'name');
});

Deno.test('validateCreateClientRequest - invalid email', () => {
  const result = validateCreateClientRequest({
    name: 'Test Company',
    contactEmail: 'not-an-email',
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'contactEmail');
});

Deno.test('validateCreateClientRequest - invalid status', () => {
  const result = validateCreateClientRequest({
    name: 'Test Company',
    contactEmail: 'contact@company.com',
    status: 'invalid',
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'status');
});

// ===== Create Site Request Validation Tests =====

Deno.test('validateCreateSiteRequest - valid request', () => {
  const result = validateCreateSiteRequest({
    clientId: 'client-123',
    name: 'Test Site',
    slug: 'test-site',
    validationMethods: [
      { type: 'email', enabled: true },
      { type: 'employeeId', enabled: false },
    ],
  });
  assertEquals(result.valid, true);
});

Deno.test('validateCreateSiteRequest - invalid slug', () => {
  const result = validateCreateSiteRequest({
    clientId: 'client-123',
    name: 'Test Site',
    slug: 'Test Site',
    validationMethods: [{ type: 'email', enabled: true }],
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'slug');
});

Deno.test('validateCreateSiteRequest - no validation methods', () => {
  const result = validateCreateSiteRequest({
    clientId: 'client-123',
    name: 'Test Site',
    slug: 'test-site',
    validationMethods: [],
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'validationMethods');
});

Deno.test('validateCreateSiteRequest - invalid validation method type', () => {
  const result = validateCreateSiteRequest({
    clientId: 'client-123',
    name: 'Test Site',
    slug: 'test-site',
    validationMethods: [{ type: 'invalid', enabled: true }],
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'validationMethods');
});

// ===== Create Gift Request Validation Tests =====

Deno.test('validateCreateGiftRequest - valid request', () => {
  const result = validateCreateGiftRequest({
    name: 'Test Gift',
    description: 'A test gift',
    sku: 'SKU-123',
    price: 29.99,
    currency: 'USD',
  });
  assertEquals(result.valid, true);
});

Deno.test('validateCreateGiftRequest - negative price', () => {
  const result = validateCreateGiftRequest({
    name: 'Test Gift',
    description: 'A test gift',
    sku: 'SKU-123',
    price: -10,
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'price');
});

Deno.test('validateCreateGiftRequest - invalid currency', () => {
  const result = validateCreateGiftRequest({
    name: 'Test Gift',
    description: 'A test gift',
    sku: 'SKU-123',
    price: 29.99,
    currency: 'usd',
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'currency');
});

Deno.test('validateCreateGiftRequest - invalid image URL', () => {
  const result = validateCreateGiftRequest({
    name: 'Test Gift',
    description: 'A test gift',
    sku: 'SKU-123',
    price: 29.99,
    imageUrl: 'not a url',
  });
  assertEquals(result.valid, false);
  assertEquals(result.field, 'imageUrl');
});
