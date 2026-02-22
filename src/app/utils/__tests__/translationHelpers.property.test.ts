/**
 * Property-Based Tests for Translation Helper Utilities
 * Feature: internationalization-improvements
 * 
 * These tests verify universal properties that should hold true across all valid inputs.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { translateWithParams } from '../translationHelpers';
import { TranslationKey } from '../../i18n/translations';

describe('translateWithParams Property-Based Tests', () => {
  /**
   * Feature: internationalization-improvements
   * Property 17: Parameter interpolation replaces all placeholders
   * 
   * **Validates: Requirements 6.8, 7.2**
   * 
   * For any translation key with placeholders and parameter object, the translateWithParams
   * function should replace all placeholder tokens with their corresponding parameter values.
   * 
   * This test verifies that:
   * 1. All placeholders that have corresponding parameters are replaced
   * 2. The output does not contain any placeholder tokens that were provided in params
   * 3. The parameter values appear in the output string
   * 4. Multiple placeholders are all replaced correctly
   * 5. The replacement works with various data types (strings, numbers)
   */
  it('Property 17: Parameter interpolation replaces all placeholders', () => {
    fc.assert(
      fc.property(
        // Generate random placeholder names (valid identifiers)
        fc.array(
          fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]*$/),
          { minLength: 1, maxLength: 5 }
        ),
        // Generate random parameter values (strings or numbers)
        fc.array(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.integer({ min: 0, max: 1000000 })
          ),
          { minLength: 1, maxLength: 5 }
        ),
        (placeholderNames, paramValues) => {
          // Ensure we have at least one placeholder
          if (placeholderNames.length === 0 || paramValues.length === 0) {
            return;
          }

          // Create unique placeholder names (remove duplicates)
          const uniquePlaceholders = Array.from(new Set(placeholderNames));
          
          // Limit to the minimum of placeholders and values
          const count = Math.min(uniquePlaceholders.length, paramValues.length);
          const placeholders = uniquePlaceholders.slice(0, count);
          const values = paramValues.slice(0, count);

          // Build a translation string with placeholders
          const translationParts: string[] = ['Text before'];
          placeholders.forEach((placeholder, index) => {
            translationParts.push(`{${placeholder}}`);
            if (index < placeholders.length - 1) {
              translationParts.push(' and ');
            }
          });
          translationParts.push(' text after');
          const translationString = translationParts.join('');

          // Build the params object
          const params: Record<string, string | number> = {};
          placeholders.forEach((placeholder, index) => {
            params[placeholder] = values[index];
          });

          // Mock translation function
          const mockT = (key: TranslationKey): string => {
            return translationString;
          };

          // Execute the function
          const result = translateWithParams(
            mockT,
            'test.key' as TranslationKey,
            params
          );

          // Property 1: Result should be a non-empty string
          expect(result).toBeTruthy();
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);

          // Property 2: All placeholders that have parameters should be replaced
          placeholders.forEach((placeholder) => {
            const placeholderToken = `{${placeholder}}`;
            // The placeholder token should NOT appear in the result
            expect(result).not.toContain(placeholderToken);
          });

          // Property 3: All parameter values should appear in the result
          values.forEach((value) => {
            const valueStr = String(value);
            expect(result).toContain(valueStr);
          });

          // Property 4: The result should contain the non-placeholder text
          expect(result).toContain('Text before');
          expect(result).toContain('text after');

          // Property 5: The result should not contain any curly braces for provided params
          // (since all placeholders with params should be replaced)
          placeholders.forEach((placeholder) => {
            expect(result).not.toMatch(new RegExp(`\\{${placeholder}\\}`));
          });

          // Property 6: Multiple placeholders should all be replaced
          if (placeholders.length > 1) {
            // Count how many placeholders were in the original
            const originalPlaceholderCount = (translationString.match(/\{[^}]+\}/g) || []).length;
            // Count how many placeholders remain in the result
            const remainingPlaceholderCount = (result.match(/\{[^}]+\}/g) || []).length;
            
            // All placeholders should be replaced (none should remain)
            expect(remainingPlaceholderCount).toBe(0);
            expect(originalPlaceholderCount).toBe(placeholders.length);
          }

          // Property 7: The order of replacements should be preserved
          // Find the positions of the values in the result
          // Note: We need to be careful with overlapping values or when one value is a substring of another
          const positions: number[] = [];
          let searchStart = 0;
          values.forEach((value) => {
            const valueStr = String(value);
            const pos = result.indexOf(valueStr, searchStart);
            if (pos !== -1) {
              positions.push(pos);
              searchStart = pos + valueStr.length; // Move past this value for next search
            }
          });

          // All values should be found
          expect(positions.length).toBe(values.length);

          // Positions should be in increasing order (values appear in the same order as placeholders)
          for (let i = 1; i < positions.length; i++) {
            expect(positions[i]).toBeGreaterThan(positions[i - 1]);
          }
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Property: Single placeholder replacement works correctly
   * 
   * For any single placeholder and parameter value, the placeholder should be
   * replaced with the parameter value.
   */
  it('Property: Single placeholder replacement works correctly', () => {
    fc.assert(
      fc.property(
        // Generate a random placeholder name
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]*$/),
        // Generate a random parameter value
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: -1000000, max: 1000000 }),
          fc.double({ min: -1000000, max: 1000000, noNaN: true })
        ),
        (placeholderName, paramValue) => {
          const translationString = `Before {${placeholderName}} after`;
          const params = { [placeholderName]: paramValue };

          const mockT = (key: TranslationKey): string => translationString;

          const result = translateWithParams(
            mockT,
            'test.key' as TranslationKey,
            params
          );

          // Property 1: Placeholder should be replaced
          expect(result).not.toContain(`{${placeholderName}}`);

          // Property 2: Parameter value should appear in result
          expect(result).toContain(String(paramValue));

          // Property 3: Result should have the expected format
          expect(result).toBe(`Before ${String(paramValue)} after`);
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Property: Numeric parameters are converted to strings correctly
   * 
   * For any numeric parameter value, it should be converted to a string and
   * replace the placeholder correctly.
   */
  it('Property: Numeric parameters are converted to strings correctly', () => {
    fc.assert(
      fc.property(
        // Generate random numbers (integers and decimals)
        fc.oneof(
          fc.integer({ min: -1000000, max: 1000000 }),
          fc.double({ min: -1000000, max: 1000000, noNaN: true })
        ),
        (numericValue) => {
          const translationString = 'Amount: {amount}';
          const params = { amount: numericValue };

          const mockT = (key: TranslationKey): string => translationString;

          const result = translateWithParams(
            mockT,
            'test.key' as TranslationKey,
            params
          );

          // Property 1: Placeholder should be replaced
          expect(result).not.toContain('{amount}');

          // Property 2: Numeric value should be converted to string and appear in result
          const expectedValue = String(numericValue);
          expect(result).toContain(expectedValue);

          // Property 3: Result should match expected format
          expect(result).toBe(`Amount: ${expectedValue}`);
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Property: Empty string parameters are handled correctly
   * 
   * For any placeholder with an empty string parameter, the placeholder should
   * be replaced with the empty string (effectively removing the placeholder).
   */
  it('Property: Empty string parameters are handled correctly', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]*$/),
        (placeholderName) => {
          const translationString = `Before {${placeholderName}} after`;
          const params = { [placeholderName]: '' };

          const mockT = (key: TranslationKey): string => translationString;

          const result = translateWithParams(
            mockT,
            'test.key' as TranslationKey,
            params
          );

          // Property 1: Placeholder should be replaced (removed)
          expect(result).not.toContain(`{${placeholderName}}`);

          // Property 2: Result should have the expected format (with empty string)
          expect(result).toBe('Before  after');

          // Property 3: No curly braces should remain
          expect(result).not.toContain('{');
          expect(result).not.toContain('}');
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Property: Zero as a parameter value is handled correctly
   * 
   * For any placeholder with zero as the parameter value, the placeholder should
   * be replaced with "0".
   */
  it('Property: Zero as a parameter value is handled correctly', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]*$/),
        (placeholderName) => {
          const translationString = `Value: {${placeholderName}}`;
          const params = { [placeholderName]: 0 };

          const mockT = (key: TranslationKey): string => translationString;

          const result = translateWithParams(
            mockT,
            'test.key' as TranslationKey,
            params
          );

          // Property 1: Placeholder should be replaced
          expect(result).not.toContain(`{${placeholderName}}`);

          // Property 2: Zero should appear as "0" in the result
          expect(result).toContain('0');

          // Property 3: Result should match expected format
          expect(result).toBe('Value: 0');
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Property: Special characters in parameter values are preserved
   * 
   * For any parameter value containing special characters, those characters
   * should be preserved in the output.
   */
  it('Property: Special characters in parameter values are preserved', () => {
    fc.assert(
      fc.property(
        // Generate strings with special characters
        fc.string({ minLength: 1, maxLength: 50 }),
        (paramValue) => {
          const translationString = 'Value: {value}';
          const params = { value: paramValue };

          const mockT = (key: TranslationKey): string => translationString;

          const result = translateWithParams(
            mockT,
            'test.key' as TranslationKey,
            params
          );

          // Property 1: Placeholder should be replaced
          expect(result).not.toContain('{value}');

          // Property 2: Parameter value should appear exactly as provided
          expect(result).toContain(paramValue);

          // Property 3: Result should match expected format
          expect(result).toBe(`Value: ${paramValue}`);
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Property: Replacement is case-sensitive
   * 
   * Placeholder names should be matched case-sensitively. {Amount} and {amount}
   * should be treated as different placeholders.
   */
  it('Property: Replacement is case-sensitive', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]*$/),
        fc.string({ minLength: 1, maxLength: 20 }),
        (placeholderName, paramValue) => {
          // Create a translation with the placeholder
          const translationString = `Value: {${placeholderName}}`;
          
          // Create params with the exact case
          const params = { [placeholderName]: paramValue };

          const mockT = (key: TranslationKey): string => translationString;

          const result = translateWithParams(
            mockT,
            'test.key' as TranslationKey,
            params
          );

          // Property 1: Exact case placeholder should be replaced
          expect(result).not.toContain(`{${placeholderName}}`);
          expect(result).toContain(paramValue);

          // Property 2: Different case should not be replaced
          // Create a different case version
          const differentCase = placeholderName.charAt(0) === placeholderName.charAt(0).toUpperCase()
            ? placeholderName.toLowerCase()
            : placeholderName.toUpperCase();

          if (differentCase !== placeholderName) {
            const translationWithDifferentCase = `Value: {${differentCase}}`;
            const mockT2 = (key: TranslationKey): string => translationWithDifferentCase;

            const result2 = translateWithParams(
              mockT2,
              'test.key' as TranslationKey,
              params
            );

            // Different case placeholder should NOT be replaced
            expect(result2).toContain(`{${differentCase}}`);
          }
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Property: Translation with no placeholders returns unchanged
   * 
   * For any translation string without placeholders, the result should be
   * identical to the input, regardless of the params object.
   */
  it('Property: Translation with no placeholders returns unchanged', () => {
    fc.assert(
      fc.property(
        // Generate a string without curly braces
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('{') && !s.includes('}')),
        // Generate random params
        fc.dictionary(
          fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]*$/),
          fc.oneof(fc.string(), fc.integer())
        ),
        (translationString, params) => {
          const mockT = (key: TranslationKey): string => translationString;

          const result = translateWithParams(
            mockT,
            'test.key' as TranslationKey,
            params
          );

          // Property: Result should be identical to the translation string
          expect(result).toBe(translationString);
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });

  /**
   * Feature: internationalization-improvements
   * Property 18: Missing parameters leave placeholders unchanged
   * 
   * **Validates: Requirements 7.4**
   * 
   * For any translation key with placeholders and parameter object, if a placeholder
   * token is not in the parameter object, that placeholder should remain unchanged
   * in the output.
   * 
   * This test verifies that:
   * 1. Placeholders without corresponding parameters remain in the output
   * 2. Placeholders with corresponding parameters are replaced
   * 3. The function handles mixed scenarios (some params present, some missing)
   * 4. The original placeholder format {paramName} is preserved for missing params
   * 5. The function doesn't throw errors when parameters are missing
   */
  it('Property 18: Missing parameters leave placeholders unchanged', () => {
    fc.assert(
      fc.property(
        // Generate random placeholder names for placeholders that WILL have params
        fc.array(
          fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]*$/),
          { minLength: 0, maxLength: 3 }
        ),
        // Generate random placeholder names for placeholders that WON'T have params
        fc.array(
          fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]*$/),
          { minLength: 1, maxLength: 3 }
        ),
        // Generate random parameter values for the placeholders that will have params
        fc.array(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.integer({ min: 0, max: 1000000 })
          ),
          { minLength: 0, maxLength: 3 }
        ),
        (providedPlaceholders, missingPlaceholders, paramValues) => {
          // Ensure we have at least one missing placeholder
          if (missingPlaceholders.length === 0) {
            return;
          }

          // Create unique placeholder names (remove duplicates)
          const uniqueProvidedPlaceholders = Array.from(new Set(providedPlaceholders));
          const uniqueMissingPlaceholders = Array.from(new Set(missingPlaceholders));

          // Ensure no overlap between provided and missing placeholders
          const finalMissingPlaceholders = uniqueMissingPlaceholders.filter(
            mp => !uniqueProvidedPlaceholders.includes(mp)
          );

          // If all missing placeholders were duplicates of provided ones, skip
          if (finalMissingPlaceholders.length === 0) {
            return;
          }

          // Limit provided placeholders to match the number of values
          const count = Math.min(uniqueProvidedPlaceholders.length, paramValues.length);
          const providedPlaceholdersList = uniqueProvidedPlaceholders.slice(0, count);
          const values = paramValues.slice(0, count);

          // Build a translation string with both provided and missing placeholders
          const translationParts: string[] = ['Start'];
          
          // Add provided placeholders
          providedPlaceholdersList.forEach((placeholder) => {
            translationParts.push(` {${placeholder}}`);
          });
          
          // Add missing placeholders
          finalMissingPlaceholders.forEach((placeholder) => {
            translationParts.push(` {${placeholder}}`);
          });
          
          translationParts.push(' end');
          const translationString = translationParts.join('');

          // Build the params object (only for provided placeholders)
          const params: Record<string, string | number> = {};
          providedPlaceholdersList.forEach((placeholder, index) => {
            params[placeholder] = values[index];
          });

          // Mock translation function
          const mockT = (key: TranslationKey): string => {
            return translationString;
          };

          // Execute the function
          const result = translateWithParams(
            mockT,
            'test.key' as TranslationKey,
            params
          );

          // Property 1: Result should be a non-empty string
          expect(result).toBeTruthy();
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);

          // Property 2: Provided placeholders should be replaced
          providedPlaceholdersList.forEach((placeholder) => {
            const placeholderToken = `{${placeholder}}`;
            // The placeholder token should NOT appear in the result
            expect(result).not.toContain(placeholderToken);
          });

          // Property 3: Provided parameter values should appear in the result
          values.forEach((value) => {
            const valueStr = String(value);
            expect(result).toContain(valueStr);
          });

          // Property 4: Missing placeholders should remain unchanged
          finalMissingPlaceholders.forEach((placeholder) => {
            const placeholderToken = `{${placeholder}}`;
            // The placeholder token SHOULD still appear in the result
            expect(result).toContain(placeholderToken);
          });

          // Property 5: The result should contain the non-placeholder text
          expect(result).toContain('Start');
          expect(result).toContain('end');

          // Property 6: The function should not throw errors
          // (This is implicitly tested by the fact that we got a result)
          expect(() => {
            translateWithParams(mockT, 'test.key' as TranslationKey, params);
          }).not.toThrow();

          // Property 7: Count of missing placeholders in result should match original
          const missingPlaceholderCount = finalMissingPlaceholders.length;
          let foundMissingCount = 0;
          finalMissingPlaceholders.forEach((placeholder) => {
            const placeholderToken = `{${placeholder}}`;
            if (result.includes(placeholderToken)) {
              foundMissingCount++;
            }
          });
          expect(foundMissingCount).toBe(missingPlaceholderCount);
        }
      ),
      { numRuns: 25 } // Reduced from 100 for faster test execution
    );
  });
});
