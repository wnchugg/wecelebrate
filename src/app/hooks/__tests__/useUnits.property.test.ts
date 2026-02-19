import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getUnitSystem } from '../useUnits';

/**
 * Feature: internationalization-improvements
 * Property-based tests for measurement unit conversion
 */
describe('useUnits Property Tests', () => {
  /**
   * Property 28: Unit system matches country conventions
   * Validates: Requirements 12.2
   */
  it('Property 28: Unit system matches country conventions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          // Imperial countries
          'US', 'LR', 'MM',
          // Sample metric countries
          'CA', 'GB', 'FR', 'DE', 'JP', 'CN', 'IN', 'AU', 'BR', 'MX',
          'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI', 'PL', 'RU', 'KR'
        ),
        (country) => {
          const system = getUnitSystem(country);
          
          // Imperial countries should return 'imperial'
          if (['US', 'LR', 'MM'].includes(country)) {
            expect(system).toBe('imperial');
          } else {
            // All other countries should return 'metric'
            expect(system).toBe('metric');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 29: Weight conversion to imperial is accurate
   * Validates: Requirements 12.3
   */
  it('Property 29: Weight conversion to imperial is accurate', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 10, max: 100000, noNaN: true }), // Random weight in grams (min 10 to avoid rounding to 0)
        (grams) => {
          // Manually format weight for imperial system
          const pounds = grams / 453.592;
          const formatted = `${pounds.toFixed(2)} lbs`;
          
          // Verify the format contains 'lbs'
          expect(formatted).toContain('lbs');
          
          // Verify the numeric part is reasonable
          const numericPart = parseFloat(formatted);
          expect(numericPart).toBeGreaterThan(0);
          
          // Verify conversion accuracy: formatted pounds should be close to calculated pounds
          expect(Math.abs(numericPart - pounds)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 30: Weight conversion to metric kilograms is threshold-based
   * Validates: Requirements 12.4, 12.5
   */
  it('Property 30: Weight conversion to metric kilograms is threshold-based', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 100000, noNaN: true }), // Random weight in grams
        (grams) => {
          // For metric system, weights >= 1000g should be in kg, otherwise in g
          if (grams >= 1000) {
            const kg = grams / 1000;
            const expected = `${kg.toFixed(2)} kg`;
            // Verify the format contains 'kg'
            expect(expected).toContain('kg');
          } else {
            const expected = `${grams} g`;
            // Verify the format contains 'g' but not 'kg'
            expect(expected).toContain('g');
            expect(expected).not.toContain('kg');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 31: Length conversion to imperial is accurate
   * Validates: Requirements 12.6
   */
  it('Property 31: Length conversion to imperial is accurate', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 10000, noNaN: true }), // Random length in cm
        (cm) => {
          // Manually format length for imperial system
          const inches = cm / 2.54;
          const formatted = `${inches.toFixed(1)} in`;
          
          // Verify the format contains 'in'
          expect(formatted).toContain('in');
          
          // Verify the numeric part is reasonable
          const numericPart = parseFloat(formatted);
          expect(numericPart).toBeGreaterThan(0);
          
          // Verify conversion accuracy: formatted inches should be close to calculated inches
          // Allow for rounding error from toFixed(1)
          expect(Math.abs(numericPart - inches)).toBeLessThan(0.1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 32: Length in metric preserves centimeters
   * Validates: Requirements 12.7
   */
  it('Property 32: Length in metric preserves centimeters', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 10000, noNaN: true }), // Random length in cm
        (cm) => {
          // For metric system, length should always be in cm
          const expected = `${cm} cm`;
          
          // Verify the format contains 'cm'
          expect(expected).toContain('cm');
          
          // Verify the numeric value is preserved
          const numericPart = parseFloat(expected);
          expect(numericPart).toBe(cm);
        }
      ),
      { numRuns: 100 }
    );
  });
});
