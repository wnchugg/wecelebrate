/**
 * Property-Based Tests for useSiteContent Hook
 * Feature: multi-language-content
 * 
 * These tests verify universal properties that should hold true across all valid inputs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { renderHook } from '@testing-library/react';
import { useSiteContent } from '../useSiteContent';
import { useSite } from '../../context/SiteContext';
import { useLanguage } from '../../context/LanguageContext';

// Mock the context hooks
vi.mock('../../context/SiteContext', () => ({
  useSite: vi.fn()
}));

vi.mock('../../context/LanguageContext', () => ({
  useLanguage: vi.fn()
}));

describe('useSiteContent Property-Based Tests', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Suppress console warnings in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  /**
   * Feature: multi-language-content
   * Property 1: Translation retrieval always returns a string
   * 
   * **Validates: Requirements 6.1, 6.6, 11.1, 11.2, 11.3**
   * 
   * For any field path and fallback string, when getTranslatedContent is called,
   * the result should always be a string (never null or undefined).
   * 
   * This test verifies that:
   * 1. The return value is always a string
   * 2. The return value is never null or undefined
   * 3. The return value is never an object or array
   * 4. The function handles invalid inputs gracefully
   * 5. The function handles missing translations gracefully
   */
  it('Property 1: Translation retrieval always returns a string', () => {
    fc.assert(
      fc.property(
        // Generate random paths (valid and invalid)
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }), // Random strings
          fc.constantFrom('welcomePage.title', 'header.logoAlt', 'footer.text', 'nonExistent.path'), // Known paths
          fc.constant(''), // Empty string
          fc.constant('a.b.c.d.e.f.g.h.i.j') // Very deep path
        ),
        // Generate random fallback strings
        fc.oneof(
          fc.string({ minLength: 0, maxLength: 100 }), // Random strings
          fc.constant(''), // Empty fallback
          fc.constant('Default Text'), // Non-empty fallback
          fc.constant('Fallback with special chars: !@#$%^&*()') // Special characters
        ),
        // Generate random language codes
        fc.constantFrom('en', 'es', 'fr', 'de', 'it', 'pt-BR', 'zh', 'ja', 'ar', 'he'),
        // Generate random translation structures
        fc.oneof(
          // Valid translation structure
          fc.constant({
            welcomePage: {
              title: { en: 'Welcome', es: 'Bienvenido', fr: 'Bienvenue' },
              message: { en: 'Hello', es: 'Hola', fr: 'Bonjour' }
            },
            header: {
              logoAlt: { en: 'Logo', es: 'Logotipo', fr: 'Logo' }
            },
            footer: {
              text: { en: 'Footer', es: 'Pie de página', fr: 'Pied de page' }
            }
          }),
          // Empty translations
          fc.constant({}),
          // Null translations
          fc.constant(null),
          // Undefined translations
          fc.constant(undefined),
          // Malformed translations (non-object at leaf)
          fc.constant({
            welcomePage: {
              title: 'Not an object'
            }
          }),
          // Partial translations
          fc.constant({
            welcomePage: {
              title: { en: 'Welcome' } // Only English
            }
          }),
          // Empty string translations
          fc.constant({
            welcomePage: {
              title: { en: '', es: '', fr: '' }
            }
          })
        ),
        (path, fallback, languageCode, translations) => {
          // Mock the contexts
          (useSite as any).mockReturnValue({
            currentSite: {
              translations,
              settings: {
                defaultLanguage: 'en'
              }
            }
          });

          (useLanguage as any).mockReturnValue({
            currentLanguage: { code: languageCode }
          });

          const { result } = renderHook(() => useSiteContent());
          const translation = result.current.getTranslatedContent(path, fallback);

          // Property 1: Result should always be a string
          expect(typeof translation).toBe('string');

          // Property 2: Result should never be null or undefined
          expect(translation).not.toBeNull();
          expect(translation).not.toBeUndefined();

          // Property 3: Result should never be an object or array
          expect(typeof translation).not.toBe('object');
          expect(Array.isArray(translation)).toBe(false);

          // Property 4: Result should be either a translation or the fallback
          // If we got a non-empty result, it should be a valid string
          if (translation.length > 0) {
            expect(translation).toBeTruthy();
          } else {
            // Empty string is valid if fallback was empty
            expect(fallback).toBe('');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: multi-language-content
   * Property 2: Fallback chain always terminates with a value
   * 
   * **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**
   * 
   * For any field path with a non-empty fallback string, when getTranslatedContent is called,
   * the result should always be a non-empty string.
   * 
   * This test verifies that:
   * 1. When a non-empty fallback is provided, the result is never empty
   * 2. The fallback chain tries all available options before using the fallback
   * 3. The function handles missing translations at each level of the fallback chain
   * 4. The function returns the fallback when all translation attempts fail
   */
  it('Property 2: Fallback chain always terminates with a value', () => {
    fc.assert(
      fc.property(
        // Generate random paths
        fc.oneof(
          fc.constantFrom('welcomePage.title', 'header.logoAlt', 'footer.text'),
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0)
        ),
        // Generate non-empty fallback strings
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        // Generate random language codes
        fc.constantFrom('en', 'es', 'fr', 'de', 'it', 'pt-BR', 'zh', 'ja', 'ar', 'he'),
        // Generate random default language codes
        fc.constantFrom('en', 'es', 'fr', 'de'),
        // Generate random translation availability scenarios
        fc.oneof(
          // Scenario 1: Current language available
          fc.record({
            currentLangAvailable: fc.constant(true),
            defaultLangAvailable: fc.constant(true),
            englishAvailable: fc.constant(true),
            otherLangAvailable: fc.constant(true)
          }),
          // Scenario 2: Only default language available
          fc.record({
            currentLangAvailable: fc.constant(false),
            defaultLangAvailable: fc.constant(true),
            englishAvailable: fc.constant(false),
            otherLangAvailable: fc.constant(false)
          }),
          // Scenario 3: Only English available
          fc.record({
            currentLangAvailable: fc.constant(false),
            defaultLangAvailable: fc.constant(false),
            englishAvailable: fc.constant(true),
            otherLangAvailable: fc.constant(false)
          }),
          // Scenario 4: Only other language available
          fc.record({
            currentLangAvailable: fc.constant(false),
            defaultLangAvailable: fc.constant(false),
            englishAvailable: fc.constant(false),
            otherLangAvailable: fc.constant(true)
          }),
          // Scenario 5: No translations available
          fc.record({
            currentLangAvailable: fc.constant(false),
            defaultLangAvailable: fc.constant(false),
            englishAvailable: fc.constant(false),
            otherLangAvailable: fc.constant(false)
          })
        ),
        (path, fallback, currentLang, defaultLang, scenario) => {
          // Build translations based on scenario
          // Avoid conflicts by using consistent naming
          const translations: any = {};
          const pathParts = path.split('.');
          
          // Navigate to create the nested structure
          let current = translations;
          for (let i = 0; i < pathParts.length - 1; i++) {
            current[pathParts[i]] = {};
            current = current[pathParts[i]];
          }
          
          // Set the final translations object
          const finalKey = pathParts[pathParts.length - 1];
          current[finalKey] = {};
          
          // Add translations based on scenario, avoiding duplicates
          const addedLanguages = new Set<string>();
          
          if (scenario.currentLangAvailable && !addedLanguages.has(currentLang)) {
            current[finalKey][currentLang] = `Translation in ${currentLang}`;
            addedLanguages.add(currentLang);
          }
          
          if (scenario.defaultLangAvailable && !addedLanguages.has(defaultLang)) {
            current[finalKey][defaultLang] = `Translation in ${defaultLang}`;
            addedLanguages.add(defaultLang);
          }
          
          if (scenario.englishAvailable && !addedLanguages.has('en')) {
            current[finalKey]['en'] = 'Translation in en';
            addedLanguages.add('en');
          }
          
          if (scenario.otherLangAvailable && !addedLanguages.has('fr')) {
            current[finalKey]['fr'] = 'Translation in fr';
            addedLanguages.add('fr');
          }

          // Mock the contexts
          (useSite as any).mockReturnValue({
            currentSite: {
              translations,
              settings: {
                defaultLanguage: defaultLang
              }
            }
          });

          (useLanguage as any).mockReturnValue({
            currentLanguage: { code: currentLang }
          });

          const { result } = renderHook(() => useSiteContent());
          const translation = result.current.getTranslatedContent(path, fallback);

          // Property 1: Result should always be a non-empty string
          expect(translation).toBeTruthy();
          expect(translation.length).toBeGreaterThan(0);
          expect(typeof translation).toBe('string');

          // Property 2: Result should be either a translation or the fallback
          // Build list of possible values based on what was actually added to translations
          const possibleValues: string[] = [];
          
          // Check what translations were actually added
          const addedTranslations = Object.keys(current[finalKey]);
          
          for (const lang of addedTranslations) {
            possibleValues.push(`Translation in ${lang}`);
          }
          
          // Always include fallback as a possibility
          possibleValues.push(fallback);

          expect(possibleValues).toContain(translation);

          // Property 3: If no translations are available, should return fallback
          if (!scenario.currentLangAvailable && 
              !scenario.defaultLangAvailable && 
              !scenario.englishAvailable && 
              !scenario.otherLangAvailable) {
            expect(translation).toBe(fallback);
          }

          // Property 4: If current language is available, should return it
          if (scenario.currentLangAvailable) {
            expect(translation).toBe(`Translation in ${currentLang}`);
          }

          // Property 5: If current language is not available but default is, should return default
          if (!scenario.currentLangAvailable && scenario.defaultLangAvailable && currentLang !== defaultLang) {
            expect(translation).toBe(`Translation in ${defaultLang}`);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Translation retrieval is deterministic
   * 
   * For the same inputs (path, fallback, language, translations), the function should
   * always return the same result.
   */
  it('Property: Translation retrieval is deterministic', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcomePage.title', 'header.logoAlt'),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('en', 'es', 'fr'),
        (path, fallback, languageCode) => {
          const translations = {
            welcomePage: {
              title: { en: 'Welcome', es: 'Bienvenido', fr: 'Bienvenue' }
            },
            header: {
              logoAlt: { en: 'Logo', es: 'Logotipo', fr: 'Logo' }
            }
          };

          (useSite as any).mockReturnValue({
            currentSite: {
              translations,
              settings: {
                defaultLanguage: 'en'
              }
            }
          });

          (useLanguage as any).mockReturnValue({
            currentLanguage: { code: languageCode }
          });

          const { result } = renderHook(() => useSiteContent());
          
          // Call the function multiple times with the same inputs
          const result1 = result.current.getTranslatedContent(path, fallback);
          const result2 = result.current.getTranslatedContent(path, fallback);
          const result3 = result.current.getTranslatedContent(path, fallback);

          // Property: All results should be identical
          expect(result1).toBe(result2);
          expect(result2).toBe(result3);
          expect(result1).toBe(result3);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Empty or whitespace translations are skipped in fallback chain
   * 
   * For any translation that is empty or contains only whitespace, the fallback chain
   * should skip it and try the next option.
   */
  it('Property: Empty or whitespace translations are skipped in fallback chain', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcomePage.title', 'header.logoAlt'),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('en', 'es', 'fr', 'de'),
        // Generate whitespace strings
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.constant('\t'),
          fc.constant('\n'),
          fc.constant('  \t  \n  ')
        ),
        (path, fallback, languageCode, whitespace) => {
          const translations = {
            welcomePage: {
              title: { 
                en: whitespace, // Empty/whitespace in English
                es: 'Bienvenido', // Valid Spanish
                fr: whitespace, // Empty/whitespace in French
                de: 'Willkommen' // Valid German
              }
            },
            header: {
              logoAlt: { 
                en: whitespace,
                es: 'Logotipo',
                fr: whitespace,
                de: 'Logo'
              }
            }
          };

          (useSite as any).mockReturnValue({
            currentSite: {
              translations,
              settings: {
                defaultLanguage: 'en'
              }
            }
          });

          (useLanguage as any).mockReturnValue({
            currentLanguage: { code: languageCode }
          });

          const { result } = renderHook(() => useSiteContent());
          const translation = result.current.getTranslatedContent(path, fallback);

          // Property: Result should not be empty or whitespace-only
          // (unless fallback is also empty/whitespace)
          if (fallback.trim().length > 0) {
            expect(translation.trim().length).toBeGreaterThan(0);
          }

          // Property: Result should be one of the valid translations or the fallback
          const validTranslations = ['Bienvenido', 'Willkommen', 'Logotipo', 'Logo', fallback];
          expect(validTranslations).toContain(translation);

          // Property: Result should not be the whitespace string
          expect(translation).not.toBe(whitespace);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Non-string translation values are skipped in fallback chain
   * 
   * For any translation that is not a string (number, boolean, object, array, null, undefined),
   * the fallback chain should skip it and try the next option.
   */
  it('Property: Non-string translation values are skipped in fallback chain', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcomePage.title', 'header.logoAlt'),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('en', 'es', 'fr'),
        // Generate non-string values
        fc.oneof(
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined),
          fc.constant({}),
          fc.constant([])
        ),
        (path, fallback, languageCode, nonStringValue) => {
          const translations = {
            welcomePage: {
              title: { 
                en: nonStringValue, // Non-string in English
                es: 'Bienvenido', // Valid Spanish
                fr: nonStringValue // Non-string in French
              }
            },
            header: {
              logoAlt: { 
                en: nonStringValue,
                es: 'Logotipo',
                fr: nonStringValue
              }
            }
          };

          (useSite as any).mockReturnValue({
            currentSite: {
              translations,
              settings: {
                defaultLanguage: 'en'
              }
            }
          });

          (useLanguage as any).mockReturnValue({
            currentLanguage: { code: languageCode }
          });

          const { result } = renderHook(() => useSiteContent());
          const translation = result.current.getTranslatedContent(path, fallback);

          // Property: Result should always be a string
          expect(typeof translation).toBe('string');

          // Property: Result should be one of the valid translations or the fallback
          const validTranslations = ['Bienvenido', 'Logotipo', fallback];
          expect(validTranslations).toContain(translation);

          // Property: Result should not be the non-string value converted to string
          if (nonStringValue !== null && nonStringValue !== undefined) {
            expect(translation).not.toBe(String(nonStringValue));
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
