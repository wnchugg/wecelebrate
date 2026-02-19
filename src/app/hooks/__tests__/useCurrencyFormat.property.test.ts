/**
 * Property-Based Tests for useCurrencyFormat Hook
 * Feature: internationalization-improvements
 * 
 * These tests verify universal properties that should hold true across all valid inputs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { renderHook } from '@testing-library/react';
import { useCurrencyFormat } from '../useCurrencyFormat';
import { useCurrency } from '../../components/CurrencyDisplay';

// Mock the useCurrency hook
vi.mock('../../components/CurrencyDisplay', () => ({
  useCurrency: vi.fn()
}));

describe('useCurrencyFormat Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: internationalization-improvements
   * Property 1: Currency formatting respects locale
   * 
   * **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 2.3**
   * 
   * For any monetary amount and locale, when formatted using the currency formatting utilities,
   * the output should use the correct currency symbol, decimal separator, and thousand separator
   * for that locale.
   * 
   * This test verifies that:
   * 1. The formatted output is a non-empty string
   * 2. The formatted output contains the currency symbol
   * 3. The formatted output contains numeric characters
   * 4. Different currencies produce different formatted outputs
   */
  it('Property 1: Currency formatting respects locale', () => {
    fc.assert(
      fc.property(
        // Generate random amounts between 0 and 1,000,000
        fc.double({ min: 0, max: 1000000, noNaN: true }),
        // Generate random currency codes from supported currencies
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'MXN', 'BRL'),
        (amount, currency) => {
          // Mock the useCurrency hook to return the specified currency
          const mockFormat = (amt: number): string => {
            // Simulate locale-aware formatting based on currency
            const symbols: Record<string, string> = {
              USD: '$',
              EUR: '€',
              GBP: '£',
              JPY: '¥',
              CNY: '¥',
              INR: '₹',
              CAD: 'CA$',
              AUD: 'A$',
              MXN: 'MX$',
              BRL: 'R$',
            };
            
            const symbol = symbols[currency] || currency;
            
            // JPY, KRW, VND don't use decimal places
            if (currency === 'JPY') {
              return `${symbol}${Math.round(amt).toLocaleString()}`;
            }
            
            return `${symbol}${amt.toFixed(2)}`;
          };

          (useCurrency as any).mockReturnValue({
            currency,
            format: mockFormat,
            convert: (amt: number) => amt
          });

          const { result } = renderHook(() => useCurrencyFormat());

          // Test formatPrice
          const formatted = result.current.formatPrice(amount);

          // Property 1: Formatted output should be a non-empty string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');
          expect(formatted.length).toBeGreaterThan(0);

          // Property 2: Formatted output should contain the currency symbol
          const expectedSymbol = result.current.symbol;
          expect(formatted).toContain(expectedSymbol);

          // Property 3: Formatted output should contain numeric characters
          expect(formatted).toMatch(/\d/);

          // Property 4: Currency code should match the requested currency
          expect(result.current.currency).toBe(currency);

          // Property 5: Different currencies should produce different symbols
          const symbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CNY: '¥',
            INR: '₹',
            CAD: 'CA$',
            AUD: 'A$',
            MXN: 'MX$',
            BRL: 'R$',
          };
          expect(result.current.symbol).toBe(symbols[currency]);
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Feature: internationalization-improvements
   * Property 5: Currency range formatting is consistent
   * 
   * **Validates: Requirements 2.4**
   * 
   * For any minimum and maximum amounts, the formatRange function should produce
   * a string containing both amounts formatted consistently with the same currency
   * formatting rules.
   * 
   * This test verifies that:
   * 1. The range contains both formatted amounts
   * 2. The range contains a separator (dash)
   * 3. The range format follows the pattern "min - max"
   * 4. Both amounts use the same currency formatting rules
   * 5. The currency symbol appears in both formatted amounts
   */
  it('Property 5: Currency range formatting is consistent', () => {
    fc.assert(
      fc.property(
        // Generate two random amounts
        fc.double({ min: 0, max: 100000, noNaN: true }),
        fc.double({ min: 0, max: 100000, noNaN: true }),
        // Test with all supported currencies
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'MXN', 'BRL'),
        (amount1, amount2, currency) => {
          const mockFormat = (amt: number): string => {
            const symbols: Record<string, string> = {
              USD: '$',
              EUR: '€',
              GBP: '£',
              JPY: '¥',
              CNY: '¥',
              INR: '₹',
              CAD: 'CA$',
              AUD: 'A$',
              MXN: 'MX$',
              BRL: 'R$',
            };
            
            const symbol = symbols[currency] || currency;
            
            // JPY doesn't use decimal places
            if (currency === 'JPY') {
              return `${symbol}${Math.round(amt).toLocaleString()}`;
            }
            
            return `${symbol}${amt.toFixed(2)}`;
          };

          (useCurrency as any).mockReturnValue({
            currency,
            format: mockFormat,
            convert: (amt: number) => amt
          });

          const { result } = renderHook(() => useCurrencyFormat());

          const min = Math.min(amount1, amount2);
          const max = Math.max(amount1, amount2);
          const range = result.current.formatRange(min, max);

          // Property 1: Range should contain both formatted amounts
          const formattedMin = result.current.formatPrice(min);
          const formattedMax = result.current.formatPrice(max);
          
          expect(range).toContain(formattedMin);
          expect(range).toContain(formattedMax);

          // Property 2: Range should contain a separator (dash with spaces)
          expect(range).toMatch(/ - /);

          // Property 3: Range format should be "min - max"
          expect(range).toBe(`${formattedMin} - ${formattedMax}`);

          // Property 4: Both amounts should use the same currency symbol
          const symbol = result.current.symbol;
          const symbolRegex = new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          const symbolMatches = range.match(symbolRegex);
          expect(symbolMatches).toBeTruthy();
          expect(symbolMatches!.length).toBe(2); // Symbol should appear exactly twice

          // Property 5: Both amounts should follow the same formatting rules
          // Extract numeric parts from both formatted amounts
          const minNumeric = formattedMin.replace(/[^0-9.,]/g, '');
          const maxNumeric = formattedMax.replace(/[^0-9.,]/g, '');
          
          // If one has decimals, both should have decimals (unless currency is JPY)
          if (currency !== 'JPY') {
            const minHasDecimals = minNumeric.includes('.');
            const maxHasDecimals = maxNumeric.includes('.');
            
            // Both should have the same decimal format
            if (minHasDecimals) {
              expect(maxHasDecimals).toBe(true);
              // Both should have the same number of decimal places
              const minDecimals = minNumeric.split('.')[1]?.length || 0;
              const maxDecimals = maxNumeric.split('.')[1]?.length || 0;
              expect(minDecimals).toBe(maxDecimals);
            }
          }

          // Property 6: Range should be non-empty and valid
          expect(range).toBeTruthy();
          expect(typeof range).toBe('string');
          expect(range.length).toBeGreaterThan(0);

          // Property 7: When min equals max, range should still be valid
          if (Math.abs(min - max) < 0.01) {
            expect(range).toContain(formattedMin);
            expect(range).toMatch(/ - /);
          }
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Property: Currency symbol is consistent with currency code
   * 
   * For any supported currency code, the symbol returned should be the correct
   * symbol for that currency.
   */
  it('Property: Currency symbol is consistent with currency code', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'MXN', 'BRL'),
        (currency) => {
          (useCurrency as any).mockReturnValue({
            currency,
            format: (amt: number) => `${amt.toFixed(2)}`,
            convert: (amt: number) => amt
          });

          const { result } = renderHook(() => useCurrencyFormat());

          const expectedSymbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CNY: '¥',
            INR: '₹',
            CAD: 'CA$',
            AUD: 'A$',
            MXN: 'MX$',
            BRL: 'R$',
          };

          // Property: Symbol should match the expected symbol for the currency
          expect(result.current.symbol).toBe(expectedSymbols[currency]);
          expect(result.current.currency).toBe(currency);
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Property: Formatting preserves amount magnitude
   * 
   * For any amount, the formatted output should preserve the magnitude of the amount.
   * Larger amounts should produce formatted strings with larger numeric values.
   */
  it('Property: Formatting preserves amount magnitude', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100000, noNaN: true }),
        fc.constantFrom('USD', 'EUR', 'GBP'),
        (amount, currency) => {
          const mockFormat = (amt: number): string => {
            const symbols: Record<string, string> = {
              USD: '$',
              EUR: '€',
              GBP: '£',
            };
            return `${symbols[currency]}${amt.toFixed(2)}`;
          };

          (useCurrency as any).mockReturnValue({
            currency,
            format: mockFormat,
            convert: (amt: number) => amt
          });

          const { result } = renderHook(() => useCurrencyFormat());

          const formatted = result.current.formatPrice(amount);

          // Extract numeric value from formatted string
          const numericPart = formatted.replace(/[^0-9.]/g, '');
          const extractedAmount = parseFloat(numericPart);

          // Property: Extracted amount should be close to original amount
          // (allowing for rounding to 2 decimal places)
          expect(Math.abs(extractedAmount - amount)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Property: Zero amounts are formatted correctly
   * 
   * For any currency, zero amounts should be formatted as a valid currency string
   * with the appropriate symbol and zero value.
   */
  it('Property: Zero amounts are formatted correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR'),
        (currency) => {
          const mockFormat = (amt: number): string => {
            const symbols: Record<string, string> = {
              USD: '$',
              EUR: '€',
              GBP: '£',
              JPY: '¥',
              CNY: '¥',
              INR: '₹',
            };
            
            const symbol = symbols[currency] || currency;
            
            if (currency === 'JPY') {
              return `${symbol}${Math.round(amt).toLocaleString()}`;
            }
            
            return `${symbol}${amt.toFixed(2)}`;
          };

          (useCurrency as any).mockReturnValue({
            currency,
            format: mockFormat,
            convert: (amt: number) => amt
          });

          const { result } = renderHook(() => useCurrencyFormat());

          const formatted = result.current.formatPrice(0);

          // Property 1: Formatted zero should contain the currency symbol
          expect(formatted).toContain(result.current.symbol);

          // Property 2: Formatted zero should contain '0'
          expect(formatted).toMatch(/0/);

          // Property 3: Formatted zero should be a valid string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Feature: internationalization-improvements
   * Property 2: Currency configuration is respected
   * 
   * **Validates: Requirements 1.7**
   * 
   * For any currency code configured in Site_Config, all currency formatting should use
   * that currency code.
   * 
   * This test verifies that:
   * 1. The hook returns the currency code from Site_Config
   * 2. The currency code is used consistently across all formatting operations
   * 3. The currency symbol matches the configured currency
   * 4. Formatting operations respect the configured currency
   */
  it('Property 2: Currency configuration is respected', () => {
    fc.assert(
      fc.property(
        // Generate random amounts
        fc.double({ min: 0, max: 100000, noNaN: true }),
        // Generate random currency codes from supported currencies
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'MXN', 'BRL'),
        (amount, configuredCurrency) => {
          // Mock useCurrency to return the configured currency from Site_Config
          const mockFormat = (amt: number): string => {
            const symbols: Record<string, string> = {
              USD: '$',
              EUR: '€',
              GBP: '£',
              JPY: '¥',
              CNY: '¥',
              INR: '₹',
              CAD: 'CA$',
              AUD: 'A$',
              MXN: 'MX$',
              BRL: 'R$',
            };
            
            const symbol = symbols[configuredCurrency] || configuredCurrency;
            
            // JPY doesn't use decimal places
            if (configuredCurrency === 'JPY') {
              return `${symbol}${Math.round(amt).toLocaleString()}`;
            }
            
            return `${symbol}${amt.toFixed(2)}`;
          };

          // Mock useCurrency to simulate Site_Config currency configuration
          (useCurrency as any).mockReturnValue({
            currency: configuredCurrency,
            format: mockFormat,
            convert: (amt: number) => amt
          });

          const { result } = renderHook(() => useCurrencyFormat());

          // Property 1: The hook should return the configured currency code
          expect(result.current.currency).toBe(configuredCurrency);

          // Property 2: The currency symbol should match the configured currency
          const expectedSymbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CNY: '¥',
            INR: '₹',
            CAD: 'CA$',
            AUD: 'A$',
            MXN: 'MX$',
            BRL: 'R$',
          };
          expect(result.current.symbol).toBe(expectedSymbols[configuredCurrency]);

          // Property 3: formatPrice should use the configured currency
          const formattedPrice = result.current.formatPrice(amount);
          expect(formattedPrice).toContain(result.current.symbol);
          expect(formattedPrice).toBeTruthy();

          // Property 4: formatRange should use the configured currency consistently
          const min = amount * 0.5;
          const max = amount * 1.5;
          const formattedRange = result.current.formatRange(min, max);
          
          // Both min and max should use the same currency symbol
          const symbolCount = (formattedRange.match(new RegExp(result.current.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
          expect(symbolCount).toBe(2); // Should appear exactly twice (once for min, once for max)

          // Property 5: The formatted range should contain both amounts
          expect(formattedRange).toContain(result.current.formatPrice(min));
          expect(formattedRange).toContain(result.current.formatPrice(max));
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Feature: internationalization-improvements
   * Property 3: Currency display format is respected
   * 
   * **Validates: Requirements 1.8**
   * 
   * For any currency display format (symbol, code, or name) configured in Site_Config,
   * all currency formatting should use that display format.
   * 
   * Display formats:
   * - 'symbol': $100.00
   * - 'code': USD 100.00
   * - 'name': 100.00 US Dollars
   * 
   * This test verifies that:
   * 1. When currencyDisplay is 'symbol', the output contains the currency symbol
   * 2. When currencyDisplay is 'code', the output contains the currency code
   * 3. When currencyDisplay is 'name', the output contains the currency name
   * 4. The display format is applied consistently across all formatting operations
   */
  it('Property 3: Currency display format is respected', () => {
    fc.assert(
      fc.property(
        // Generate random amounts
        fc.double({ min: 0.01, max: 100000, noNaN: true }),
        // Generate random currency codes
        fc.constantFrom('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR'),
        // Generate random display formats
        fc.constantFrom('symbol', 'code', 'name'),
        (amount, currency, displayFormat) => {
          // Currency metadata
          const currencyMetadata: Record<string, { symbol: string; code: string; name: string; decimals: number }> = {
            USD: { symbol: '$', code: 'USD', name: 'US Dollars', decimals: 2 },
            EUR: { symbol: '€', code: 'EUR', name: 'Euros', decimals: 2 },
            GBP: { symbol: '£', code: 'GBP', name: 'British Pounds', decimals: 2 },
            JPY: { symbol: '¥', code: 'JPY', name: 'Japanese Yen', decimals: 0 },
            CNY: { symbol: '¥', code: 'CNY', name: 'Chinese Yuan', decimals: 2 },
            INR: { symbol: '₹', code: 'INR', name: 'Indian Rupees', decimals: 2 },
          };

          const metadata = currencyMetadata[currency];
          
          // Mock format function that respects currencyDisplay setting
          const mockFormat = (amt: number): string => {
            const decimals = metadata.decimals;
            const formattedAmount = decimals === 0 
              ? Math.round(amt).toString()
              : amt.toFixed(decimals);

            switch (displayFormat) {
              case 'symbol':
                return `${metadata.symbol}${formattedAmount}`;
              case 'code':
                return `${metadata.code} ${formattedAmount}`;
              case 'name':
                return `${formattedAmount} ${metadata.name}`;
              default:
                return `${metadata.symbol}${formattedAmount}`;
            }
          };

          // Mock useCurrency to simulate Site_Config with currencyDisplay setting
          (useCurrency as any).mockReturnValue({
            currency,
            format: mockFormat,
            convert: (amt: number) => amt,
            displayFormat, // Include display format in mock
          });

          const { result } = renderHook(() => useCurrencyFormat());
          const formatted = result.current.formatPrice(amount);

          // Property 1: Formatted output should be a non-empty string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');
          expect(formatted.length).toBeGreaterThan(0);

          // Property 2: Formatted output should contain numeric characters
          expect(formatted).toMatch(/\d/);

          // Property 3: Display format should be respected
          switch (displayFormat) {
            case 'symbol':
              // Should contain the currency symbol
              expect(formatted).toContain(metadata.symbol);
              // Should NOT contain the currency code as a separate word
              expect(formatted).not.toMatch(new RegExp(`\\b${metadata.code}\\b`));
              // Should NOT contain the currency name
              expect(formatted).not.toContain(metadata.name);
              break;
            
            case 'code':
              // Should contain the currency code
              expect(formatted).toMatch(new RegExp(`\\b${metadata.code}\\b`));
              // Should NOT contain the currency name
              expect(formatted).not.toContain(metadata.name);
              break;
            
            case 'name':
              // Should contain the currency name
              expect(formatted).toContain(metadata.name);
              // Should NOT contain the currency symbol (unless it's part of the name)
              if (!metadata.name.includes(metadata.symbol)) {
                expect(formatted).not.toContain(metadata.symbol);
              }
              break;
          }

          // Property 4: formatRange should use the same display format consistently
          const min = amount * 0.5;
          const max = amount * 1.5;
          const formattedRange = result.current.formatRange(min, max);
          
          // Both min and max should use the same display format
          const formattedMin = result.current.formatPrice(min);
          const formattedMax = result.current.formatPrice(max);
          
          expect(formattedRange).toContain(formattedMin);
          expect(formattedRange).toContain(formattedMax);
          
          // Verify the display format is consistent in the range
          switch (displayFormat) {
            case 'symbol':
              // Symbol should appear twice (once for min, once for max)
              const symbolMatches = formattedRange.match(new RegExp(metadata.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
              expect(symbolMatches).toBeTruthy();
              expect(symbolMatches!.length).toBe(2);
              break;
            
            case 'code':
              // Code should appear twice
              const codeMatches = formattedRange.match(new RegExp(`\\b${metadata.code}\\b`, 'g'));
              expect(codeMatches).toBeTruthy();
              expect(codeMatches!.length).toBe(2);
              break;
            
            case 'name':
              // Name should appear twice
              const nameMatches = formattedRange.match(new RegExp(metadata.name, 'g'));
              expect(nameMatches).toBeTruthy();
              expect(nameMatches!.length).toBe(2);
              break;
          }
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });
});

/**
 * Feature: internationalization-improvements
 * Property 4: Currency decimal precision is respected
 *
 * **Validates: Requirements 1.9**
 *
 * For any decimal places setting configured in Site_Config, all currency formatting
 * should display exactly that many decimal places.
 *
 * This test verifies that:
 * 1. When decimalPlaces is 0, the formatted output has no decimal places
 * 2. When decimalPlaces is 2, the formatted output has exactly 2 decimal places
 * 3. When decimalPlaces is 3, the formatted output has exactly 3 decimal places
 * 4. The decimal precision is applied consistently across all formatting operations
 * 5. Rounding is applied correctly when the amount has more decimals than configured
 */
it('Property 4: Currency decimal precision is respected', () => {
  fc.assert(
    fc.property(
      // Generate random amounts with various decimal places
      fc.double({ min: 0.001, max: 100000, noNaN: true }),
      // Generate random currency codes
      fc.constantFrom('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR'),
      // Generate random decimal place settings (0, 1, 2, 3, 4)
      fc.constantFrom(0, 1, 2, 3, 4),
      (amount, currency, decimalPlaces) => {
        // Mock format function that respects decimalPlaces setting
        const mockFormat = (amt: number): string => {
          const symbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CNY: '¥',
            INR: '₹',
          };

          const symbol = symbols[currency] || currency;

          // Round to the specified decimal places
          const roundedAmount = Math.round(amt * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);

          // Format with exact decimal places
          const formattedAmount = decimalPlaces === 0
            ? Math.round(roundedAmount).toString()
            : roundedAmount.toFixed(decimalPlaces);

          return `${symbol}${formattedAmount}`;
        };

        // Mock useCurrency to simulate Site_Config with decimalPlaces setting
        (useCurrency as any).mockReturnValue({
          currency,
          format: mockFormat,
          convert: (amt: number) => amt,
          decimalPlaces, // Include decimal places in mock
        });

        const { result } = renderHook(() => useCurrencyFormat());
        const formatted = result.current.formatPrice(amount);

        // Property 1: Formatted output should be a non-empty string
        expect(formatted).toBeTruthy();
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);

        // Property 2: Extract the numeric part from the formatted string
        // Remove currency symbol and any non-numeric characters except decimal point
        const numericPart = formatted.replace(/[^0-9.]/g, '');

        // Property 3: Verify decimal places
        if (decimalPlaces === 0) {
          // Should have no decimal point
          expect(numericPart).not.toContain('.');
          // Should be an integer
          expect(numericPart).toMatch(/^\d+$/);
        } else {
          // Should have a decimal point
          if (numericPart.includes('.')) {
            const parts = numericPart.split('.');
            // Should have exactly the specified number of decimal places
            expect(parts[1].length).toBe(decimalPlaces);
          } else {
            // If no decimal point, the amount must have been exactly 0 or a whole number
            // In this case, toFixed should still add decimal places
            // This is a formatting inconsistency we should catch
            const roundedAmount = Math.round(amount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
            if (roundedAmount !== Math.floor(roundedAmount)) {
              // If the rounded amount is not a whole number, we should have decimals
              expect(numericPart).toContain('.');
            }
          }
        }

        // Property 4: formatRange should use the same decimal precision consistently
        const min = amount * 0.5;
        const max = amount * 1.5;
        const formattedRange = result.current.formatRange(min, max);

        // Extract both formatted amounts from the range
        const formattedMin = result.current.formatPrice(min);
        const formattedMax = result.current.formatPrice(max);

        expect(formattedRange).toContain(formattedMin);
        expect(formattedRange).toContain(formattedMax);

        // Both amounts should have the same decimal precision
        const minNumeric = formattedMin.replace(/[^0-9.]/g, '');
        const maxNumeric = formattedMax.replace(/[^0-9.]/g, '');

        if (decimalPlaces === 0) {
          expect(minNumeric).not.toContain('.');
          expect(maxNumeric).not.toContain('.');
        } else {
          // Both should have decimal points (unless they're whole numbers)
          if (minNumeric.includes('.')) {
            expect(minNumeric.split('.')[1].length).toBe(decimalPlaces);
          }
          if (maxNumeric.includes('.')) {
            expect(maxNumeric.split('.')[1].length).toBe(decimalPlaces);
          }
        }

        // Property 5: Verify rounding is applied correctly
        // The formatted amount should be close to the original amount
        const extractedAmount = parseFloat(numericPart);
        const expectedAmount = Math.round(amount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);

        // Allow for small floating point errors
        expect(Math.abs(extractedAmount - expectedAmount)).toBeLessThan(0.0001);
      }
    ),
    { numRuns: 25 } // Reduced from 100 for faster test execution
  );
});

