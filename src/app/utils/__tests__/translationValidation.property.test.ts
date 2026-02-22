/**
 * Property-based tests for translation validation utilities
 * 
 * Property 3: Completion percentage is always between 0 and 100
 * Property 4: Default language validation is strict
 * 
 * Requirements: 4.1, 4.6, 4.7, 5.1, 5.2, 5.3
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateTranslations,
  canPublishTranslations
} from '../translationValidation';

describe('Property-based tests for translation validation', () => {
  /**
   * Property 3: Completion percentage is always between 0 and 100
   * 
   * For any set of translations, required fields, and available languages,
   * the completion percentage should always be between 0 and 100 (inclusive).
   * 
   * Validates: Requirements 4.1, 4.6, 4.7
   */
  it('Property 3: completion percentage is always between 0 and 100', () => {
    fc.assert(
      fc.property(
        // Generate random translations
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 30 }), // field names
          fc.dictionary(
            fc.constantFrom('en', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'pt', 'ru', 'it'), // language codes
            fc.string({ minLength: 0, maxLength: 100 }) // translation text
          )
        ),
        // Generate random required fields
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 20 }),
        // Generate random available languages
        fc.array(
          fc.constantFrom('en', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'pt', 'ru', 'it'),
          { minLength: 0, maxLength: 10 }
        ),
        (translations, requiredFields, availableLanguages) => {
          const result = validateTranslations(translations, requiredFields, availableLanguages);
          
          // Property: completion percentage must be between 0 and 100
          expect(result.completionPercentage).toBeGreaterThanOrEqual(0);
          expect(result.completionPercentage).toBeLessThanOrEqual(100);
          
          // Additional invariant: percentage must be an integer
          expect(Number.isInteger(result.completionPercentage)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Default language validation is strict
   * 
   * For any set of translations and required fields, if any required field
   * is missing a default language translation, canPublishTranslations should
   * return false.
   * 
   * Validates: Requirements 5.1, 5.2, 5.3
   */
  it('Property 4: default language validation is strict', () => {
    fc.assert(
      fc.property(
        // Generate random required fields
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 10 }),
        // Generate default language
        fc.constantFrom('en', 'es', 'fr', 'de', 'ja'),
        // Generate whether to include default language translations
        fc.array(fc.boolean()),
        (requiredFields, defaultLanguage, includeDefaults) => {
          // Build translations based on includeDefaults array
          const translations: Record<string, Record<string, string>> = {};
          
          requiredFields.forEach((field, index) => {
            translations[field] = {};
            
            // Add some other language translations
            translations[field]['other'] = 'some text';
            
            // Conditionally add default language translation
            if (includeDefaults[index % includeDefaults.length]) {
              translations[field][defaultLanguage] = 'default text';
            }
          });
          
          const result = canPublishTranslations(translations, requiredFields, defaultLanguage);
          
          // Check if all required fields have default language translations
          const allDefaultsPresent = requiredFields.every((field, index) => {
            return includeDefaults[index % includeDefaults.length];
          });
          
          // Property: canPublish should be true only if all defaults are present
          if (allDefaultsPresent) {
            expect(result.canPublish).toBe(true);
          } else {
            expect(result.canPublish).toBe(false);
            expect(result.reason).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: validateTranslations is consistent with missing translations count', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 30 }),
          fc.dictionary(
            fc.constantFrom('en', 'es', 'fr', 'de'),
            fc.string({ minLength: 0, maxLength: 50 })
          )
        ),
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 10 }),
        fc.array(fc.constantFrom('en', 'es', 'fr', 'de'), { minLength: 1, maxLength: 4 }),
        (translations, requiredFields, availableLanguages) => {
          const result = validateTranslations(translations, requiredFields, availableLanguages);
          
          const totalExpected = requiredFields.length * availableLanguages.length;
          const missingCount = result.missingTranslations.length;
          const completedCount = totalExpected - missingCount;
          
          // Property: completion percentage should match the ratio
          const expectedPercentage = totalExpected === 0 ? 100 : Math.round((completedCount / totalExpected) * 100);
          expect(result.completionPercentage).toBe(expectedPercentage);
          
          // Property: isComplete should be true only when no missing translations
          expect(result.isComplete).toBe(missingCount === 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: canPublishTranslations ignores non-default language completeness', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 10 }),
        fc.constantFrom('en', 'es', 'fr'),
        fc.array(fc.constantFrom('de', 'ja', 'zh', 'ar'), { minLength: 1, maxLength: 5 }),
        (requiredFields, defaultLanguage, otherLanguages) => {
          // Create translations with all default language translations present
          const translations: Record<string, Record<string, string>> = {};
          
          requiredFields.forEach(field => {
            translations[field] = {
              [defaultLanguage]: 'default text'
              // Intentionally omit other languages
            };
          });
          
          const result = canPublishTranslations(translations, requiredFields, defaultLanguage);
          
          // Property: should be able to publish even if other languages are missing
          expect(result.canPublish).toBe(true);
          expect(result.reason).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: empty or whitespace-only translations are treated as missing', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
        fc.constantFrom('en', 'es', 'fr'),
        fc.array(fc.constantFrom('', '   ', '\t', '\n', '  \t\n  ')),
        (requiredFields, defaultLanguage, emptyValues) => {
          // Create translations with empty/whitespace values
          const translations: Record<string, Record<string, string>> = {};
          
          requiredFields.forEach((field, index) => {
            translations[field] = {
              [defaultLanguage]: emptyValues[index % emptyValues.length]
            };
          });
          
          const result = canPublishTranslations(translations, requiredFields, defaultLanguage);
          
          // Property: should not be able to publish with empty/whitespace translations
          expect(result.canPublish).toBe(false);
          expect(result.reason).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
