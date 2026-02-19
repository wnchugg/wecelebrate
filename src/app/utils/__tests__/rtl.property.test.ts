/**
 * Property-Based Tests for RTL Utilities
 * Feature: internationalization-improvements
 * 
 * These tests verify universal properties that should hold true across all valid inputs.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { isRTL, getTextDirection, RTL_LANGUAGES } from '../rtl';

describe('RTL Utilities Property-Based Tests', () => {
  /**
   * Feature: internationalization-improvements
   * Property 22: Text direction matches language directionality
   * 
   * **Validates: Requirements 9.4, 9.6, 9.7**
   * 
   * For any language code, the getTextDirection function should return 'rtl' for
   * Arabic and Hebrew, and 'ltr' for all other languages.
   * 
   * This test verifies that:
   * 1. Arabic (ar) always returns 'rtl'
   * 2. Hebrew (he) always returns 'rtl'
   * 3. All other language codes return 'ltr'
   * 4. The function is consistent for the same input
   * 5. The function handles various language code formats
   */
  it('Property 22: Text direction matches language directionality', () => {
    fc.assert(
      fc.property(
        // Generate random language codes (2-5 lowercase letters, optionally with hyphen and region)
        fc.oneof(
          fc.stringMatching(/^[a-z]{2}$/), // Simple 2-letter codes
          fc.stringMatching(/^[a-z]{2}-[A-Z]{2}$/), // Language with region (e.g., en-US)
          fc.stringMatching(/^[a-z]{2,5}$/) // Longer language codes
        ),
        (languageCode) => {
          const direction = getTextDirection(languageCode);

          // Property 1: Result should always be either 'ltr' or 'rtl'
          expect(['ltr', 'rtl']).toContain(direction);

          // Property 2: Arabic should always return 'rtl'
          if (languageCode === 'ar') {
            expect(direction).toBe('rtl');
            expect(isRTL(languageCode)).toBe(true);
          }

          // Property 3: Hebrew should always return 'rtl'
          if (languageCode === 'he') {
            expect(direction).toBe('rtl');
            expect(isRTL(languageCode)).toBe(true);
          }

          // Property 4: All other languages should return 'ltr'
          if (languageCode !== 'ar' && languageCode !== 'he') {
            expect(direction).toBe('ltr');
            expect(isRTL(languageCode)).toBe(false);
          }

          // Property 5: Consistency - calling the function twice should return the same result
          const direction2 = getTextDirection(languageCode);
          expect(direction).toBe(direction2);

          // Property 6: isRTL and getTextDirection should be consistent
          const isRtl = isRTL(languageCode);
          if (isRtl) {
            expect(direction).toBe('rtl');
          } else {
            expect(direction).toBe('ltr');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: isRTL returns boolean for all inputs
   * 
   * For any language code, isRTL should always return a boolean value.
   */
  it('Property: isRTL returns boolean for all inputs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        (languageCode) => {
          const result = isRTL(languageCode);

          // Property 1: Result should always be a boolean
          expect(typeof result).toBe('boolean');

          // Property 2: Result should be either true or false
          expect([true, false]).toContain(result);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: getTextDirection returns valid direction for all inputs
   * 
   * For any language code, getTextDirection should always return either 'ltr' or 'rtl'.
   */
  it('Property: getTextDirection returns valid direction for all inputs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        (languageCode) => {
          const result = getTextDirection(languageCode);

          // Property 1: Result should always be a string
          expect(typeof result).toBe('string');

          // Property 2: Result should be either 'ltr' or 'rtl'
          expect(['ltr', 'rtl']).toContain(result);

          // Property 3: Result should match the expected value based on isRTL
          if (isRTL(languageCode)) {
            expect(result).toBe('rtl');
          } else {
            expect(result).toBe('ltr');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: RTL_LANGUAGES constant contains only Arabic and Hebrew
   * 
   * The RTL_LANGUAGES constant should contain exactly the languages that are RTL.
   */
  it('Property: RTL_LANGUAGES constant is correct', () => {
    // Property 1: RTL_LANGUAGES should be an array
    expect(Array.isArray(RTL_LANGUAGES)).toBe(true);

    // Property 2: RTL_LANGUAGES should contain 'ar' and 'he'
    expect(RTL_LANGUAGES).toContain('ar');
    expect(RTL_LANGUAGES).toContain('he');

    // Property 3: RTL_LANGUAGES should have exactly 2 elements
    expect(RTL_LANGUAGES.length).toBe(2);

    // Property 4: All languages in RTL_LANGUAGES should return true for isRTL
    RTL_LANGUAGES.forEach((lang) => {
      expect(isRTL(lang)).toBe(true);
      expect(getTextDirection(lang)).toBe('rtl');
    });
  });

  /**
   * Property: Known RTL languages always return 'rtl'
   * 
   * For the known RTL languages (Arabic and Hebrew), the functions should
   * consistently return RTL direction.
   */
  it('Property: Known RTL languages always return rtl', () => {
    const rtlLanguages = ['ar', 'he'];

    rtlLanguages.forEach((lang) => {
      // Property 1: isRTL should return true
      expect(isRTL(lang)).toBe(true);

      // Property 2: getTextDirection should return 'rtl'
      expect(getTextDirection(lang)).toBe('rtl');

      // Property 3: Language should be in RTL_LANGUAGES constant
      expect(RTL_LANGUAGES).toContain(lang);
    });
  });

  /**
   * Property: Known LTR languages always return 'ltr'
   * 
   * For known LTR languages, the functions should consistently return LTR direction.
   */
  it('Property: Known LTR languages always return ltr', () => {
    const ltrLanguages = [
      'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko',
      'en-US', 'en-GB', 'es-MX', 'fr-CA', 'pt-BR', 'zh-CN', 'zh-TW'
    ];

    ltrLanguages.forEach((lang) => {
      // Property 1: isRTL should return false
      expect(isRTL(lang)).toBe(false);

      // Property 2: getTextDirection should return 'ltr'
      expect(getTextDirection(lang)).toBe('ltr');

      // Property 3: Language should NOT be in RTL_LANGUAGES constant
      expect(RTL_LANGUAGES).not.toContain(lang);
    });
  });

  /**
   * Property: Case sensitivity
   * 
   * The functions should be case-sensitive. 'AR' and 'ar' should be treated differently.
   */
  it('Property: Functions are case-sensitive', () => {
    // Property 1: Lowercase 'ar' should be RTL
    expect(isRTL('ar')).toBe(true);
    expect(getTextDirection('ar')).toBe('rtl');

    // Property 2: Uppercase 'AR' should NOT be RTL (case-sensitive)
    expect(isRTL('AR')).toBe(false);
    expect(getTextDirection('AR')).toBe('ltr');

    // Property 3: Lowercase 'he' should be RTL
    expect(isRTL('he')).toBe(true);
    expect(getTextDirection('he')).toBe('rtl');

    // Property 4: Uppercase 'HE' should NOT be RTL (case-sensitive)
    expect(isRTL('HE')).toBe(false);
    expect(getTextDirection('HE')).toBe('ltr');
  });

  /**
   * Property: Empty string and edge cases
   * 
   * The functions should handle edge cases like empty strings gracefully.
   */
  it('Property: Edge cases are handled correctly', () => {
    // Property 1: Empty string should return LTR
    expect(isRTL('')).toBe(false);
    expect(getTextDirection('')).toBe('ltr');

    // Property 2: Whitespace should return LTR
    expect(isRTL(' ')).toBe(false);
    expect(getTextDirection(' ')).toBe('ltr');

    // Property 3: Invalid language codes should return LTR
    expect(isRTL('invalid')).toBe(false);
    expect(getTextDirection('invalid')).toBe('ltr');

    // Property 4: Numbers should return LTR
    expect(isRTL('123')).toBe(false);
    expect(getTextDirection('123')).toBe('ltr');
  });

  /**
   * Property: Idempotence
   * 
   * Calling the functions multiple times with the same input should always
   * return the same result.
   */
  it('Property: Functions are idempotent', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        (languageCode) => {
          // Call isRTL multiple times
          const result1 = isRTL(languageCode);
          const result2 = isRTL(languageCode);
          const result3 = isRTL(languageCode);

          // Property 1: All calls should return the same result
          expect(result1).toBe(result2);
          expect(result2).toBe(result3);

          // Call getTextDirection multiple times
          const dir1 = getTextDirection(languageCode);
          const dir2 = getTextDirection(languageCode);
          const dir3 = getTextDirection(languageCode);

          // Property 2: All calls should return the same result
          expect(dir1).toBe(dir2);
          expect(dir2).toBe(dir3);
        }
      ),
      { numRuns: 100 }
    );
  });
});
