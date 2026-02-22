/**
 * Property-Based Tests for LanguageContext
 * Feature: internationalization-improvements
 * 
 * These tests verify universal properties that should hold true across all valid inputs.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import fc from 'fast-check';
import { LanguageProvider, useLanguage, languages } from '../LanguageContext';
import { getTextDirection } from '../../utils/rtl';

// Mock translations
vi.mock('../../i18n/translations', () => ({
  t: vi.fn((key: string, lang: string) => `${key}_${lang}`),
}));

describe('LanguageContext Property-Based Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  afterEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );

  /**
   * Feature: internationalization-improvements
   * Property 23: Language change updates DOM attributes
   * 
   * **Validates: Requirements 9.8, 9.9**
   * 
   * For any language change, the document root element's dir and lang attributes
   * should be updated to match the new language's direction and code.
   * 
   * This test verifies that:
   * 1. When language changes, document.documentElement.dir is updated
   * 2. When language changes, document.documentElement.lang is updated
   * 3. The dir attribute matches the expected direction (rtl for ar/he, ltr for others)
   * 4. The lang attribute matches the language code
   * 5. Multiple language changes update the attributes correctly
   * 6. The attributes are synchronized with the language state
   */
  it('Property 23: Language change updates DOM attributes', () => {
    fc.assert(
      fc.property(
        // Generate a sequence of language changes (use valid language codes from our languages array)
        fc.array(
          fc.constantFrom(...languages.map(l => l.code)),
          { minLength: 1, maxLength: 5 }
        ),
        (languageCodes) => {
          // Ensure we have at least one language code
          if (languageCodes.length === 0) {
            return;
          }

          const { result } = renderHook(() => useLanguage(), { wrapper });

          // Test each language change in sequence
          languageCodes.forEach((languageCode) => {
            act(() => {
              result.current.setLanguage(languageCode);
            });

            // Property 1: document.documentElement.lang should be updated to the language code
            expect(document.documentElement.lang).toBe(languageCode);

            // Property 2: document.documentElement.dir should be updated to the correct direction
            const expectedDirection = getTextDirection(languageCode);
            expect(document.documentElement.dir).toBe(expectedDirection);

            // Property 3: The direction should match RTL for Arabic and Hebrew
            if (languageCode === 'ar' || languageCode === 'he') {
              expect(document.documentElement.dir).toBe('rtl');
            } else {
              expect(document.documentElement.dir).toBe('ltr');
            }

            // Property 4: The current language in context should match
            expect(result.current.currentLanguage.code).toBe(languageCode);

            // Property 5: The attributes should be synchronized
            expect(document.documentElement.lang).toBe(result.current.currentLanguage.code);
            expect(document.documentElement.dir).toBe(getTextDirection(result.current.currentLanguage.code));
          });

          // Property 6: After all changes, the final state should be consistent
          const finalLanguageCode = languageCodes[languageCodes.length - 1];
          expect(document.documentElement.lang).toBe(finalLanguageCode);
          expect(document.documentElement.dir).toBe(getTextDirection(finalLanguageCode));
          expect(result.current.currentLanguage.code).toBe(finalLanguageCode);
        }
      ),
      { numRuns: 25 } // Reduced for faster execution with React rendering
    );
  });

  /**
   * Property: DOM attributes are always in sync with language state
   * 
   * For any language in the system, when set, the DOM attributes should
   * always match the language state.
   */
  it('Property: DOM attributes are always in sync with language state', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...languages.map(l => l.code)),
        (languageCode) => {
          const { result } = renderHook(() => useLanguage(), { wrapper });

          act(() => {
            result.current.setLanguage(languageCode);
          });

          // Property 1: lang attribute matches current language code
          expect(document.documentElement.lang).toBe(result.current.currentLanguage.code);

          // Property 2: dir attribute matches expected direction for current language
          const expectedDirection = getTextDirection(result.current.currentLanguage.code);
          expect(document.documentElement.dir).toBe(expectedDirection);

          // Property 3: Both attributes are non-empty
          expect(document.documentElement.lang).toBeTruthy();
          expect(document.documentElement.dir).toBeTruthy();

          // Property 4: dir attribute is either 'ltr' or 'rtl'
          expect(['ltr', 'rtl']).toContain(document.documentElement.dir);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: RTL languages always set dir to 'rtl'
   * 
   * For any RTL language (Arabic or Hebrew), the dir attribute should
   * always be set to 'rtl'.
   */
  it('Property: RTL languages always set dir to rtl', () => {
    const rtlLanguages = languages.filter(l => l.rtl);

    rtlLanguages.forEach((lang) => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage(lang.code);
      });

      // Property 1: dir should be 'rtl'
      expect(document.documentElement.dir).toBe('rtl');

      // Property 2: lang should match the language code
      expect(document.documentElement.lang).toBe(lang.code);

      // Property 3: Current language should be the RTL language
      expect(result.current.currentLanguage.code).toBe(lang.code);
      expect(result.current.currentLanguage.rtl).toBe(true);
    });
  });

  /**
   * Property: LTR languages always set dir to 'ltr'
   * 
   * For any LTR language (non-RTL), the dir attribute should
   * always be set to 'ltr'.
   */
  it('Property: LTR languages always set dir to ltr', () => {
    const ltrLanguages = languages.filter(l => !l.rtl);

    fc.assert(
      fc.property(
        fc.constantFrom(...ltrLanguages.map(l => l.code)),
        (languageCode) => {
          const { result } = renderHook(() => useLanguage(), { wrapper });

          act(() => {
            result.current.setLanguage(languageCode);
          });

          // Property 1: dir should be 'ltr'
          expect(document.documentElement.dir).toBe('ltr');

          // Property 2: lang should match the language code
          expect(document.documentElement.lang).toBe(languageCode);

          // Property 3: Current language should not be RTL
          expect(result.current.currentLanguage.rtl).not.toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Switching between RTL and LTR updates direction correctly
   * 
   * When switching from an RTL language to an LTR language (or vice versa),
   * the dir attribute should be updated correctly.
   */
  it('Property: Switching between RTL and LTR updates direction correctly', () => {
    const rtlLanguages = languages.filter(l => l.rtl).map(l => l.code);
    const ltrLanguages = languages.filter(l => !l.rtl).map(l => l.code);

    fc.assert(
      fc.property(
        fc.constantFrom(...rtlLanguages),
        fc.constantFrom(...ltrLanguages),
        (rtlLang, ltrLang) => {
          const { result } = renderHook(() => useLanguage(), { wrapper });

          // Start with RTL language
          act(() => {
            result.current.setLanguage(rtlLang);
          });

          // Property 1: Should be RTL
          expect(document.documentElement.dir).toBe('rtl');
          expect(document.documentElement.lang).toBe(rtlLang);

          // Switch to LTR language
          act(() => {
            result.current.setLanguage(ltrLang);
          });

          // Property 2: Should be LTR
          expect(document.documentElement.dir).toBe('ltr');
          expect(document.documentElement.lang).toBe(ltrLang);

          // Switch back to RTL language
          act(() => {
            result.current.setLanguage(rtlLang);
          });

          // Property 3: Should be RTL again
          expect(document.documentElement.dir).toBe('rtl');
          expect(document.documentElement.lang).toBe(rtlLang);
        }
      ),
      { numRuns: 25 }
    );
  });

  /**
   * Property: Language code is always a valid string
   * 
   * The lang attribute should always be a non-empty string matching
   * a valid language code format.
   */
  it('Property: Language code is always a valid string', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...languages.map(l => l.code)),
        (languageCode) => {
          const { result } = renderHook(() => useLanguage(), { wrapper });

          act(() => {
            result.current.setLanguage(languageCode);
          });

          // Property 1: lang attribute should be a non-empty string
          expect(typeof document.documentElement.lang).toBe('string');
          expect(document.documentElement.lang.length).toBeGreaterThan(0);

          // Property 2: lang attribute should match the language code
          expect(document.documentElement.lang).toBe(languageCode);

          // Property 3: lang attribute should be a valid language code format
          // (2-5 lowercase letters, optionally with hyphen and region)
          expect(document.documentElement.lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Multiple rapid language changes maintain consistency
   * 
   * Even with rapid language changes, the DOM attributes should always
   * reflect the most recent language change.
   */
  it('Property: Multiple rapid language changes maintain consistency', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom(...languages.map(l => l.code)),
          { minLength: 3, maxLength: 10 }
        ),
        (languageCodes) => {
          const { result } = renderHook(() => useLanguage(), { wrapper });

          // Apply all language changes
          languageCodes.forEach((languageCode) => {
            act(() => {
              result.current.setLanguage(languageCode);
            });
          });

          // Property 1: Final state should match the last language code
          const finalLanguageCode = languageCodes[languageCodes.length - 1];
          expect(document.documentElement.lang).toBe(finalLanguageCode);

          // Property 2: Direction should match the final language
          const expectedDirection = getTextDirection(finalLanguageCode);
          expect(document.documentElement.dir).toBe(expectedDirection);

          // Property 3: Context state should match DOM attributes
          expect(result.current.currentLanguage.code).toBe(finalLanguageCode);
          expect(document.documentElement.lang).toBe(result.current.currentLanguage.code);
        }
      ),
      { numRuns: 25 }
    );
  });

  /**
   * Property: Initial render sets DOM attributes
   * 
   * When the LanguageProvider is first rendered, it should set the
   * DOM attributes to match the initial language.
   */
  it('Property: Initial render sets DOM attributes', () => {
    // Test with default language (English)
    const { result } = renderHook(() => useLanguage(), { wrapper });

    // Property 1: lang attribute should be set
    expect(document.documentElement.lang).toBeTruthy();

    // Property 2: dir attribute should be set
    expect(document.documentElement.dir).toBeTruthy();

    // Property 3: Attributes should match the current language
    expect(document.documentElement.lang).toBe(result.current.currentLanguage.code);
    expect(document.documentElement.dir).toBe(getTextDirection(result.current.currentLanguage.code));

    // Property 4: Default should be English with LTR
    expect(result.current.currentLanguage.code).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
