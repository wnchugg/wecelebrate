import { describe, expect } from 'vitest';
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { shippingSchema, companyShippingSchema } from '../shipping.schema';

/**
 * Property-Based Tests for Shipping Schemas
 * 
 * **Validates: Requirements 1.1, 1.2**
 * - Requirement 1.1: Form validation with Zod schemas
 * - Requirement 1.2: Proper error messages for invalid inputs
 */

describe('shippingSchema - Property-Based Tests', () => {
  /**
   * **Validates: Requirements 1.1**
   * Property: Valid data should always parse successfully
   */
  test.prop([
    fc.string({ minLength: 2, maxLength: 100 }).filter(s => /^[a-zA-Z\s'-]+$/.test(s)),
    fc.string({ minLength: 10, maxLength: 20 }).filter(s => /^[\d\s()+-]+$/.test(s)),
    fc.string({ minLength: 5, maxLength: 200 }),
    fc.string({ minLength: 2, maxLength: 100 }),
    fc.string({ minLength: 2, maxLength: 100 }),
    fc.string({ minLength: 3, maxLength: 20 }),
    fc.constantFrom('US', 'CA', 'GB', 'FR', 'DE', 'ES', 'IT', 'JP', 'AU', 'NZ'),
  ], { numRuns: 100 })('should parse valid shipping data', (fullName, phone, street, city, state, zipCode, country) => {
    const data = { fullName, phone, street, city, state, zipCode, country };
    const result = shippingSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  /**
   * **Validates: Requirements 1.2**
   * Property: Invalid names should always fail validation
   */
  test.prop([
    fc.oneof(
      fc.string({ maxLength: 1 }), // Too short
      fc.string({ minLength: 101 }), // Too long
      fc.string({ minLength: 2 }).filter(s => /[^a-zA-Z\s'-]/.test(s)), // Invalid characters
    ),
  ], { numRuns: 100 })('should reject invalid full names', (invalidName) => {
    const data = {
      fullName: invalidName,
      phone: '1234567890',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    };
    const result = shippingSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  /**
   * **Validates: Requirements 1.2**
   * Property: Invalid phone numbers should always fail validation
   */
  test.prop([
    fc.oneof(
      fc.string({ maxLength: 9 }), // Too short
      fc.string({ minLength: 10 }).filter(s => /[^0-9\s()+-]/.test(s)), // Invalid characters
    ),
  ], { numRuns: 100 })('should reject invalid phone numbers', (invalidPhone) => {
    const data = {
      fullName: 'John Doe',
      phone: invalidPhone,
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    };
    const result = shippingSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  /**
   * **Validates: Requirements 1.2**
   * Property: Invalid country codes should always fail validation
   */
  test.prop([
    fc.oneof(
      fc.string({ maxLength: 1 }), // Too short
      fc.string({ minLength: 3 }), // Too long
      fc.string({ minLength: 2, maxLength: 2 }).filter(s => /[^A-Z]/.test(s)), // Not uppercase
    ),
  ], { numRuns: 100 })('should reject invalid country codes', (invalidCountry) => {
    const data = {
      fullName: 'John Doe',
      phone: '1234567890',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: invalidCountry,
    };
    const result = shippingSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  /**
   * **Validates: Requirements 1.1**
   * Property: Round-trip parsing should preserve valid data
   */
  test.prop([
    fc.string({ minLength: 2, maxLength: 100 }).filter(s => /^[a-zA-Z\s'-]+$/.test(s)),
    fc.string({ minLength: 10, maxLength: 20 }).filter(s => /^[\d\s()+-]+$/.test(s)),
    fc.string({ minLength: 5, maxLength: 200 }),
    fc.string({ minLength: 2, maxLength: 100 }),
    fc.string({ minLength: 2, maxLength: 100 }),
    fc.string({ minLength: 3, maxLength: 20 }),
    fc.constantFrom('US', 'CA', 'GB', 'FR', 'DE'),
  ], { numRuns: 100 })('should preserve data through round-trip parsing', (fullName, phone, street, city, state, zipCode, country) => {
    const originalData = { fullName, phone, street, city, state, zipCode, country };
    const parsed = shippingSchema.parse(originalData);
    const reparsed = shippingSchema.parse(parsed);
    expect(reparsed).toEqual(parsed);
  });
});

describe('companyShippingSchema - Property-Based Tests', () => {
  /**
   * **Validates: Requirements 1.1**
   * Property: Valid company shipping data should always parse successfully
   */
  test.prop([
    fc.string({ minLength: 2, maxLength: 100 }).filter(s => /^[a-zA-Z\s'-]+$/.test(s)),
    fc.string({ minLength: 10, maxLength: 20 }).filter(s => /^[\d\s()+-]+$/.test(s)),
  ], { numRuns: 100 })('should parse valid company shipping data', (fullName, phone) => {
    const data = { fullName, phone };
    const result = companyShippingSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  /**
   * **Validates: Requirements 1.2**
   * Property: Invalid data should always fail validation
   */
  test.prop([
    fc.string({ maxLength: 1 }), // Too short name
    fc.string({ minLength: 10, maxLength: 20 }).filter(s => /^[\d\s()+-]+$/.test(s)),
  ], { numRuns: 100 })('should reject invalid company shipping data', (invalidName, phone) => {
    const data = { fullName: invalidName, phone };
    const result = companyShippingSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  /**
   * **Validates: Requirements 1.1**
   * Property: Round-trip parsing should preserve valid data
   */
  test.prop([
    fc.string({ minLength: 2, maxLength: 100 }).filter(s => /^[a-zA-Z\s'-]+$/.test(s)),
    fc.string({ minLength: 10, maxLength: 20 }).filter(s => /^[\d\s()+-]+$/.test(s)),
  ], { numRuns: 100 })('should preserve data through round-trip parsing', (fullName, phone) => {
    const originalData = { fullName, phone };
    const parsed = companyShippingSchema.parse(originalData);
    const reparsed = companyShippingSchema.parse(parsed);
    expect(reparsed).toEqual(parsed);
  });
});
