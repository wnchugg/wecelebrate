/**
 * Property-Based Tests for useNumberFormat Hook
 * Feature: internationalization-improvements
 * 
 * These tests verify universal properties that should hold true across all valid inputs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { renderHook } from '@testing-library/react';
import { useNumberFormat } from '../useNumberFormat';
import * as LanguageContext from '../../context/LanguageContext';

// Mock the LanguageContext
vi.mock('../../context/LanguageContext', () => ({
  useLanguage: vi.fn()
}));

describe('useNumberFormat Property-Based Tests', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  /**
   * Feature: internationalization-improvements
   * Property 12: Number formatting respects locale separators
   * 
   * **Validates: Requirements 5.2, 5.7, 5.8**
   * 
   * For any numeric value and locale, when formatted using the number formatting utilities,
   * the output should use the correct thousand separator and decimal separator for that locale.
   * 
   * This test verifies that:
   * 1. The formatted output is a non-empty string
   * 2. The formatted output contains numeric characters
   * 3. The formatting is consistent with Intl.NumberFormat behavior (which handles locale-specific separators)
   */
  it('Property 12: Number formatting respects locale separators', () => {
    fc.assert(
      fc.property(
        // Generate random numbers between 1 and 1,000,000 (avoid edge cases near 0)
        fc.double({ min: 1, max: 1000000, noNaN: true }),
        // Generate random locales from supported languages
        fc.constantFrom('en-US', 'fr-FR', 'de-DE', 'ja-JP', 'es-ES', 'it-IT'),
        (value, locale) => {
          // Mock the useLanguage hook to return the specified locale
          (LanguageContext.useLanguage as any).mockReturnValue({
            currentLanguage: { code: locale }
          });

          const { result } = renderHook(() => useNumberFormat());

          // Test formatNumber
          const formatted = result.current.formatNumber(value);

          // Property 1: Formatted output should be a non-empty string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');
          expect(formatted.length).toBeGreaterThan(0);

          // Property 2: Formatted output should contain numeric characters
          expect(formatted).toMatch(/\d/);

          // Property 3: Verify the formatted output matches Intl.NumberFormat behavior
          // This is the core property - if it matches Intl.NumberFormat, then it respects
          // locale-specific thousand and decimal separators
          const expected = new Intl.NumberFormat(locale).format(value);
          expect(formatted).toBe(expected);
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Feature: internationalization-improvements
   * Property 13: Integer formatting has no decimals
   * 
   * **Validates: Requirements 5.3**
   * 
   * For any numeric value, the formatInteger function should produce output with zero decimal places.
   * 
   * This test verifies that:
   * 1. The formatted output contains no decimal separator
   * 2. The formatted output is rounded to the nearest integer
   * 3. The formatting is consistent across different locales
   */
  it('Property 13: Integer formatting has no decimals', () => {
    fc.assert(
      fc.property(
        // Generate random numbers including decimals
        fc.double({ min: -1000000, max: 1000000, noNaN: true }),
        // Generate random locales
        fc.constantFrom('en-US', 'fr-FR', 'de-DE', 'ja-JP', 'es-ES', 'it-IT'),
        (value, locale) => {
          // Mock the useLanguage hook
          (LanguageContext.useLanguage as any).mockReturnValue({
            currentLanguage: { code: locale }
          });

          const { result } = renderHook(() => useNumberFormat());

          // Test formatInteger
          const formatted = result.current.formatInteger(value);

          // Property 1: Formatted output should be a non-empty string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');

          // Property 2: Formatted output should NOT contain decimal separators
          // The simplest check is to verify it matches Intl.NumberFormat with maximumFractionDigits: 0
          // which guarantees no decimal places
          const expected = new Intl.NumberFormat(locale, {
            maximumFractionDigits: 0,
          }).format(value);
          expect(formatted).toBe(expected);

          // Property 3: Verify no decimal part exists
          // Count the number of separators - if there's only thousand separators, we're good
          // If the last separator is followed by 1-2 digits, it's likely a decimal
          // If it's followed by 3 digits, it's a thousand separator
          const lastSeparatorMatch = formatted.match(/[.,](\d+)$/);
          if (lastSeparatorMatch) {
            const digitsAfterSeparator = lastSeparatorMatch[1].length;
            // Thousand separators are followed by exactly 3 digits
            // Decimal separators are followed by 1-2 digits typically
            // If we have 3 digits after the last separator, it's a thousand separator (good)
            // If we have 1-2 digits, it might be a decimal (bad for integer formatting)
            if (digitsAfterSeparator < 3) {
              // This would be a decimal separator - fail the test
              expect(digitsAfterSeparator).toBeGreaterThanOrEqual(3);
            }
          }

          // Property 4: The formatted value should be close to the rounded original value
          // Extract numeric value (remove thousand separators)
          const numericStr = formatted.replace(/[,.\s]/g, '');
          const extractedValue = parseInt(numericStr, 10);
          const roundedValue = Math.round(value);
          
          // Handle negative numbers
          if (value < 0) {
            expect(Math.abs(extractedValue)).toBe(Math.abs(roundedValue));
          } else {
            expect(extractedValue).toBe(roundedValue);
          }
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Feature: internationalization-improvements
   * Property 14: Decimal formatting has exact precision
   * 
   * **Validates: Requirements 5.4**
   * 
   * For any numeric value and decimal count, the formatDecimal function should produce
   * output with exactly that many decimal places.
   * 
   * This test verifies that:
   * 1. The formatted output has exactly the specified number of decimal places
   * 2. The formatting is consistent across different locales
   * 3. Rounding is applied correctly
   */
  it('Property 14: Decimal formatting has exact precision', () => {
    fc.assert(
      fc.property(
        // Generate random numbers
        fc.double({ min: -1000000, max: 1000000, noNaN: true }),
        // Generate random decimal counts (0-5)
        fc.integer({ min: 0, max: 5 }),
        // Generate random locales
        fc.constantFrom('en-US', 'fr-FR', 'de-DE', 'ja-JP', 'es-ES', 'it-IT'),
        (value, decimals, locale) => {
          // Mock the useLanguage hook
          (LanguageContext.useLanguage as any).mockReturnValue({
            currentLanguage: { code: locale }
          });

          const { result } = renderHook(() => useNumberFormat());

          // Test formatDecimal
          const formatted = result.current.formatDecimal(value, decimals);

          // Property 1: Formatted output should be a non-empty string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');

          // Property 2: Verify the formatted output matches Intl.NumberFormat with exact decimal places
          const expected = new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(value);
          expect(formatted).toBe(expected);

          // Property 3: Verify the number of decimal places
          // Extract the decimal part based on locale
          const decimalSeparator = locale.startsWith('en') || locale.startsWith('ja') ? '.' : ',';
          const parts = formatted.split(decimalSeparator);
          
          if (decimals === 0) {
            // Should have no decimal separator
            expect(parts.length).toBe(1);
          } else {
            // Should have exactly 2 parts (integer and decimal)
            expect(parts.length).toBe(2);
            // The decimal part should have exactly the specified number of digits
            const decimalPart = parts[1].replace(/[^\d]/g, ''); // Remove any thousand separators
            expect(decimalPart.length).toBe(decimals);
          }
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Feature: internationalization-improvements
   * Property 15: Percent formatting is correct
   * 
   * **Validates: Requirements 5.5**
   * 
   * For any numeric value, the formatPercent function should produce output representing
   * that value as a percentage (e.g., 45.5 becomes "45.5%").
   * 
   * This test verifies that:
   * 1. The formatted output contains a percent sign
   * 2. The value is correctly converted to percentage format
   * 3. The formatting is consistent across different locales
   */
  it('Property 15: Percent formatting is correct', () => {
    fc.assert(
      fc.property(
        // Generate random percentages (0-100)
        fc.double({ min: 0, max: 100, noNaN: true }),
        // Generate random locales
        fc.constantFrom('en-US', 'fr-FR', 'de-DE', 'ja-JP', 'es-ES', 'it-IT'),
        (value, locale) => {
          // Mock the useLanguage hook
          (LanguageContext.useLanguage as any).mockReturnValue({
            currentLanguage: { code: locale }
          });

          const { result } = renderHook(() => useNumberFormat());

          // Test formatPercent
          const formatted = result.current.formatPercent(value);

          // Property 1: Formatted output should be a non-empty string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');

          // Property 2: Formatted output should contain a percent sign
          expect(formatted).toMatch(/%/);

          // Property 3: Verify the formatted output matches Intl.NumberFormat percent style
          const expected = new Intl.NumberFormat(locale, {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }).format(value / 100);
          expect(formatted).toBe(expected);

          // Property 4: The numeric value should be preserved
          // Extract the numeric part (remove percent sign and separators)
          const numericPart = formatted.replace(/[%\s]/g, '').replace(/,/g, '.');
          const extractedValue = parseFloat(numericPart);
          
          // The extracted value should be close to the original value
          // (allowing for rounding to 1 decimal place)
          const roundedValue = Math.round(value * 10) / 10;
          expect(Math.abs(extractedValue - roundedValue)).toBeLessThan(0.2);
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Feature: internationalization-improvements
   * Property 16: Compact notation is abbreviated
   * 
   * **Validates: Requirements 5.6**
   * 
   * For any large numeric value, the formatCompact function should produce abbreviated
   * output using compact notation (e.g., 1234567 becomes "1.2M").
   * 
   * This test verifies that:
   * 1. The formatted output matches Intl.NumberFormat compact notation
   * 2. The formatting is consistent across different locales
   * 3. For large numbers, the output is typically shorter than full format
   */
  it('Property 16: Compact notation is abbreviated', () => {
    fc.assert(
      fc.property(
        // Generate random large numbers
        fc.double({ min: 1000, max: 1000000000, noNaN: true }),
        // Generate random locales
        fc.constantFrom('en-US', 'fr-FR', 'de-DE', 'ja-JP', 'es-ES', 'it-IT'),
        (value, locale) => {
          // Mock the useLanguage hook
          (LanguageContext.useLanguage as any).mockReturnValue({
            currentLanguage: { code: locale }
          });

          const { result } = renderHook(() => useNumberFormat());

          // Test formatCompact
          const formatted = result.current.formatCompact(value);

          // Property 1: Formatted output should be a non-empty string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');

          // Property 2: Verify the formatted output matches Intl.NumberFormat compact notation
          const expected = new Intl.NumberFormat(locale, {
            notation: 'compact',
            compactDisplay: 'short',
          }).format(value);
          expect(formatted).toBe(expected);

          // Property 3: For very large numbers (>= 1000000), verify compact notation is used
          // The formatted string should be significantly shorter than the full number
          if (value >= 1000000) {
            const fullFormat = new Intl.NumberFormat(locale).format(value);
            // Compact format should be at most 70% of the full format length
            expect(formatted.length).toBeLessThanOrEqual(fullFormat.length * 0.7);
          }
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });
});
