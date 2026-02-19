/**
 * Property-Based Tests for Address Validation
 * Feature: internationalization-improvements
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateAddressLine } from '../addressValidation';

describe('Address Validation Properties', () => {
  /**
   * Property 24: Short addresses are rejected
   * Validates: Requirements 10.13
   */
  it('Property 24: Short addresses are rejected', () => {
    fc.assert(
      fc.property(
        // Generate strings with length 0-2 characters
        fc.string({ minLength: 0, maxLength: 2 }),
        fc.constantFrom('US', 'CA', 'GB', 'DE', 'FR', 'JP', 'CN', 'IN', 'AU', 'BR', 'MX'),
        (shortAddress, country) => {
          const result = validateAddressLine(shortAddress, country);
          
          // Short addresses (< 3 characters) should be rejected
          expect(result).not.toBeNull();
          expect(result).toBe('Address too short');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Valid length addresses are accepted (when not PO Box)', () => {
    fc.assert(
      fc.property(
        // Generate strings with length >= 3 characters that don't contain PO Box
        // and are not whitespace-only
        fc.string({ minLength: 3, maxLength: 100 })
          .filter(str => !/P\.?O\.?\s*Box/i.test(str))
          .filter(str => str.trim().length >= 3), // Filter out whitespace-only strings
        fc.constantFrom('US', 'CA', 'GB', 'DE', 'FR', 'JP', 'CN', 'IN', 'AU', 'BR', 'MX'),
        (validAddress, country) => {
          const result = validateAddressLine(validAddress, country);
          
          // Valid length addresses should pass (unless they're PO Boxes for US)
          if (country === 'US' && /P\.?O\.?\s*Box/i.test(validAddress)) {
            expect(result).not.toBeNull();
          } else {
            expect(result).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: US PO Box addresses are rejected', () => {
    fc.assert(
      fc.property(
        // Generate PO Box variations
        fc.constantFrom(
          'PO Box 123',
          'P.O. Box 456',
          'P.O.Box 789',
          'po box 111',
          'P O Box 222'
        ),
        (poBoxAddress) => {
          const result = validateAddressLine(poBoxAddress, 'US');
          
          // US PO Box addresses should be rejected
          expect(result).not.toBeNull();
          expect(result).toBe('PO Boxes not allowed for this country');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property: Non-US PO Box addresses are accepted', () => {
    fc.assert(
      fc.property(
        // Generate PO Box variations
        fc.constantFrom(
          'PO Box 123',
          'P.O. Box 456',
          'P.O.Box 789'
        ),
        fc.constantFrom('CA', 'GB', 'DE', 'FR', 'JP', 'CN', 'IN', 'AU', 'BR', 'MX'),
        (poBoxAddress, country) => {
          const result = validateAddressLine(poBoxAddress, country);
          
          // Non-US countries should accept PO Box addresses
          expect(result).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });
});
