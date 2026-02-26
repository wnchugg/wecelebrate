import { describe, expect } from 'vitest';
import { test } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { emailAccessSchema, employeeIdAccessSchema, serialCardAccessSchema } from '../access.schema';

/**
 * Property-Based Tests for Access Validation Schemas
 * 
 * **Validates: Requirements 1.1, 1.2**
 * - Requirement 1.1: Form validation with Zod schemas
 * - Requirement 1.2: Proper error messages for invalid inputs
 */

describe('emailAccessSchema - Property-Based Tests', () => {
  /**
   * Custom email generator that produces emails compatible with Zod's email validator
   * Zod uses a simpler regex that doesn't support all RFC 5322 features (like quoted strings)
   */
  const simpleEmailAddress = () => fc.tuple(
    // Local part: starts with alphanumeric, can contain dots/hyphens/underscores but not consecutively
    fc.array(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 1, maxLength: 20 }).map(arr => arr.join('')),
    // Domain: alphanumeric, can contain hyphens
    fc.array(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 1, maxLength: 20 }).map(arr => arr.join('')),
    // TLD: 2-6 letters
    fc.array(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'), { minLength: 2, maxLength: 6 }).map(arr => arr.join(''))
  ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

  /**
   * **Validates: Requirements 1.1**
   * Property: Valid emails should always parse successfully
   */
  test.prop([
    simpleEmailAddress(),
  ], { numRuns: 100 })('should parse valid email addresses', (email) => {
    const data = { email };
    const result = emailAccessSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  /**
   * **Validates: Requirements 1.2**
   * Property: Invalid emails should always fail validation
   */
  test.prop([
    fc.oneof(
      fc.constant(''), // Empty string
      fc.string().filter(s => !s.includes('@')), // No @ symbol
      fc.string().filter(s => s.includes('@') && !s.includes('.')), // No domain
      fc.string({ minLength: 256 }), // Too long
    ),
  ], { numRuns: 100 })('should reject invalid email addresses', (invalidEmail) => {
    const data = { email: invalidEmail };
    const result = emailAccessSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  /**
   * **Validates: Requirements 1.1**
   * Property: Round-trip parsing should preserve valid data
   */
  test.prop([
    simpleEmailAddress(),
  ], { numRuns: 100 })('should preserve data through round-trip parsing', (email) => {
    const originalData = { email };
    const parsed = emailAccessSchema.parse(originalData);
    const reparsed = emailAccessSchema.parse(parsed);
    expect(reparsed).toEqual(parsed);
  });
});

describe('employeeIdAccessSchema - Property-Based Tests', () => {
  /**
   * **Validates: Requirements 1.1**
   * Property: Valid employee IDs should always parse successfully
   */
  test.prop([
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9-_]+$/.test(s)),
  ], { numRuns: 100 })('should parse valid employee IDs', (employeeId) => {
    const data = { employeeId };
    const result = employeeIdAccessSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  /**
   * **Validates: Requirements 1.2**
   * Property: Invalid employee IDs should always fail validation
   */
  test.prop([
    fc.oneof(
      fc.constant(''), // Empty string
      fc.string({ minLength: 51 }), // Too long
      fc.string({ minLength: 1 }).filter(s => /[^a-zA-Z0-9-_]/.test(s)), // Invalid characters
    ),
  ], { numRuns: 100 })('should reject invalid employee IDs', (invalidId) => {
    const data = { employeeId: invalidId };
    const result = employeeIdAccessSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  /**
   * **Validates: Requirements 1.1**
   * Property: Round-trip parsing should preserve valid data
   */
  test.prop([
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9-_]+$/.test(s)),
  ], { numRuns: 100 })('should preserve data through round-trip parsing', (employeeId) => {
    const originalData = { employeeId };
    const parsed = employeeIdAccessSchema.parse(originalData);
    const reparsed = employeeIdAccessSchema.parse(parsed);
    expect(reparsed).toEqual(parsed);
  });
});

describe('serialCardAccessSchema - Property-Based Tests', () => {
  /**
   * **Validates: Requirements 1.1**
   * Property: Valid serial card codes should always parse successfully
   */
  test.prop([
    fc.string({ minLength: 8, maxLength: 50 }).filter(s => /^[A-Z0-9-]+$/.test(s)),
  ], { numRuns: 100 })('should parse valid serial card codes', (serialCard) => {
    const data = { serialCard };
    const result = serialCardAccessSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  /**
   * **Validates: Requirements 1.2**
   * Property: Invalid serial card codes should always fail validation
   */
  test.prop([
    fc.oneof(
      fc.constant(''), // Empty string
      fc.string({ maxLength: 7 }), // Too short
      fc.string({ minLength: 51 }), // Too long
      fc.string({ minLength: 8 }).filter(s => /[^A-Z0-9-]/.test(s)), // Invalid characters (lowercase or special)
    ),
  ], { numRuns: 100 })('should reject invalid serial card codes', (invalidCode) => {
    const data = { serialCard: invalidCode };
    const result = serialCardAccessSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  /**
   * **Validates: Requirements 1.1**
   * Property: Round-trip parsing should preserve valid data
   */
  test.prop([
    fc.string({ minLength: 8, maxLength: 50 }).filter(s => /^[A-Z0-9-]+$/.test(s)),
  ], { numRuns: 100 })('should preserve data through round-trip parsing', (serialCard) => {
    const originalData = { serialCard };
    const parsed = serialCardAccessSchema.parse(originalData);
    const reparsed = serialCardAccessSchema.parse(parsed);
    expect(reparsed).toEqual(parsed);
  });
});
