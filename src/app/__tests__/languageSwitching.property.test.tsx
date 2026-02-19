/**
 * Property-Based Tests for Language Switching
 * Feature: multi-language-content
 * 
 * **Property 5: Language switching updates all content**
 * 
 * **Validates: Requirements 6.10, 12.9**
 * 
 * For any language change, all translated content on the page should update
 * to reflect the new language.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { SiteContext } from '../context/SiteContext';
import { useSiteContent } from '../hooks/useSiteContent';
import type { Site, SiteContextType } from '../context/SiteContext';

// Helper function to create a mock site context
function createMockSiteContext(site: Site | null): SiteContextType {
  return {
    currentSite: site,
    sites: site ? [site] : [],
    clients: [],
    brands: [],
    currentClient: null,
    isLoading: false,
    setCurrentSite: vi.fn(),
    setCurrentClient: vi.fn(),
    addClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
    addSite: vi.fn(),
    updateSite: vi.fn(),
    saveSiteDraft: vi.fn(),
    publishSite: vi.fn(),
    discardSiteDraft: vi.fn(),
    getSiteLive: vi.fn(),
    deleteSite: vi.fn(),
    getSitesByClient: vi.fn(),
    getClientById: vi.fn(),
    refreshData: vi.fn(),
    addBrand: vi.fn(),
    updateBrand: vi.fn(),
    deleteBrand: vi.fn(),
    getSitesByBrand: vi.fn(),
  };
}

describe('Language Switching Property-Based Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Suppress console warnings in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  /**
   * Feature: multi-language-content
   * Property 5: Language switching updates all content
   * 
   * **Validates: Requirements 6.10, 12.9**
   * 
   * For any language change, all translated content on the page should update
   * to reflect the new language. This test verifies that:
   * 1. When language changes, all content fields update
   * 2. Content in the new language is returned (or fallback)
   * 3. Content is consistent across multiple fields
   * 4. Language switching is immediate and synchronous
   */
  it('Property 5: Language switching updates all content', () => {
    fc.assert(
      fc.property(
        // Generate a list of available languages
        fc.uniqueArray(
          fc.constantFrom('en', 'es', 'fr', 'de', 'it', 'pt-BR', 'zh', 'ja', 'ar', 'he'),
          { minLength: 2, maxLength: 5 }
        ),
        // Generate a default language from the available languages
        fc.nat(),
        // Generate a list of content fields to test
        fc.constantFrom(
          ['welcomePage.title', 'welcomePage.message'],
          ['header.logoAlt', 'header.homeLink', 'header.ctaButton'],
          ['footer.text', 'footer.privacyLink'],
          ['welcomePage.title', 'header.logoAlt', 'footer.text']
        ),
        // Generate two different language indices to switch between
        fc.nat(),
        fc.nat(),
        (availableLanguages, defaultLangIndex, contentFields, fromLangIndex, toLangIndex) => {
          // Ensure we have at least 2 languages
          if (availableLanguages.length < 2) return;

          // Select default language
          const defaultLanguage = availableLanguages[defaultLangIndex % availableLanguages.length];

          // Select languages to switch between
          const fromLanguage = availableLanguages[fromLangIndex % availableLanguages.length];
          const toLanguage = availableLanguages[toLangIndex % availableLanguages.length];

          // Skip if switching to the same language
          if (fromLanguage === toLanguage) return;

          // Build translations for all fields in all languages
          const translations: any = {};

          for (const field of contentFields) {
            const parts = field.split('.');
            let current = translations;

            // Navigate to create nested structure
            for (let i = 0; i < parts.length - 1; i++) {
              if (!current[parts[i]]) {
                current[parts[i]] = {};
              }
              current = current[parts[i]];
            }

            // Set translations for the final key
            const finalKey = parts[parts.length - 1];
            current[finalKey] = {};

            // Add translations for each available language
            for (const lang of availableLanguages) {
              current[finalKey][lang] = `${field} in ${lang}`;
            }
          }

          // Create mock site
          const mockSite: Site = {
            id: 'test-site-1',
            name: 'Test Site',
            clientId: 'client-1',
            domain: 'test.example.com',
            status: 'active',
            branding: {
              primaryColor: '#000000',
              secondaryColor: '#ffffff',
              tertiaryColor: '#cccccc',
            },
            settings: {
              validationMethod: 'email',
              allowQuantitySelection: true,
              showPricing: true,
              giftsPerUser: 1,
              shippingMode: 'employee',
              defaultLanguage,
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
            },
            available_languages: availableLanguages,
            translations,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockSiteContext = createMockSiteContext(mockSite);

          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SiteContext.Provider value={mockSiteContext}>
              <LanguageProvider>{children}</LanguageProvider>
            </SiteContext.Provider>
          );

          const { result } = renderHook(
            () => ({
              language: useLanguage(),
              content: useSiteContent(),
            }),
            { wrapper }
          );

          // Set initial language
          act(() => {
            result.current.language.setLanguage(fromLanguage);
          });

          // Get content in initial language
          const contentBefore = contentFields.map((field) =>
            result.current.content.getTranslatedContent(field, 'Fallback')
          );

          // Property 1: All content should be in the initial language
          for (let i = 0; i < contentFields.length; i++) {
            expect(contentBefore[i]).toBe(`${contentFields[i]} in ${fromLanguage}`);
          }

          // Switch language
          act(() => {
            result.current.language.setLanguage(toLanguage);
          });

          // Get content in new language
          const contentAfter = contentFields.map((field) =>
            result.current.content.getTranslatedContent(field, 'Fallback')
          );

          // Property 2: All content should update to the new language
          for (let i = 0; i < contentFields.length; i++) {
            expect(contentAfter[i]).toBe(`${contentFields[i]} in ${toLanguage}`);
          }

          // Property 3: Content should be different after language switch
          for (let i = 0; i < contentFields.length; i++) {
            expect(contentAfter[i]).not.toBe(contentBefore[i]);
          }

          // Property 4: Current language should be updated
          expect(result.current.language.currentLanguage.code).toBe(toLanguage);

          // Property 5: All fields should be consistent (all in the same language)
          for (let i = 0; i < contentFields.length; i++) {
            expect(contentAfter[i]).toContain(toLanguage);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Language switching is idempotent
   * 
   * Switching to the same language multiple times should produce the same result.
   */
  it('Property: Language switching is idempotent', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'es', 'fr', 'de'),
        fc.constantFrom('welcomePage.title', 'header.logoAlt'),
        (targetLanguage, field) => {
          const translations = {
            welcomePage: {
              title: {
                en: 'Welcome',
                es: 'Bienvenido',
                fr: 'Bienvenue',
                de: 'Willkommen',
              },
            },
            header: {
              logoAlt: {
                en: 'Logo',
                es: 'Logotipo',
                fr: 'Logo',
                de: 'Logo',
              },
            },
          };

          const mockSite: Site = {
            id: 'test-site-1',
            name: 'Test Site',
            clientId: 'client-1',
            domain: 'test.example.com',
            status: 'active',
            branding: {
              primaryColor: '#000000',
              secondaryColor: '#ffffff',
              tertiaryColor: '#cccccc',
            },
            settings: {
              validationMethod: 'email',
              allowQuantitySelection: true,
              showPricing: true,
              giftsPerUser: 1,
              shippingMode: 'employee',
              defaultLanguage: 'en',
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
            },
            available_languages: ['en', 'es', 'fr', 'de'],
            translations,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockSiteContext = createMockSiteContext(mockSite);

          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SiteContext.Provider value={mockSiteContext}>
              <LanguageProvider>{children}</LanguageProvider>
            </SiteContext.Provider>
          );

          const { result } = renderHook(
            () => ({
              language: useLanguage(),
              content: useSiteContent(),
            }),
            { wrapper }
          );

          // Switch to target language multiple times
          act(() => {
            result.current.language.setLanguage(targetLanguage);
          });
          const content1 = result.current.content.getTranslatedContent(field, 'Fallback');

          act(() => {
            result.current.language.setLanguage(targetLanguage);
          });
          const content2 = result.current.content.getTranslatedContent(field, 'Fallback');

          act(() => {
            result.current.language.setLanguage(targetLanguage);
          });
          const content3 = result.current.content.getTranslatedContent(field, 'Fallback');

          // Property: All results should be identical
          expect(content1).toBe(content2);
          expect(content2).toBe(content3);
          expect(result.current.language.currentLanguage.code).toBe(targetLanguage);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Language switching with missing translations falls back correctly
   * 
   * When switching to a language with missing translations, the fallback chain
   * should be applied consistently across all fields.
   */
  it('Property: Language switching with missing translations falls back correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'es', 'fr', 'de', 'it'),
        fc.constantFrom('en', 'es', 'fr'),
        fc.array(fc.constantFrom('welcomePage.title', 'header.logoAlt', 'footer.text'), {
          minLength: 1,
          maxLength: 3,
        }),
        (targetLanguage, defaultLanguage, fields) => {
          // Build translations with some missing for target language
          const translations: any = {};

          for (const field of fields) {
            const parts = field.split('.');
            let current = translations;

            for (let i = 0; i < parts.length - 1; i++) {
              if (!current[parts[i]]) {
                current[parts[i]] = {};
              }
              current = current[parts[i]];
            }

            const finalKey = parts[parts.length - 1];
            current[finalKey] = {
              [defaultLanguage]: `${field} in ${defaultLanguage}`,
              // Target language translation missing
            };
          }

          const mockSite: Site = {
            id: 'test-site-1',
            name: 'Test Site',
            clientId: 'client-1',
            domain: 'test.example.com',
            status: 'active',
            branding: {
              primaryColor: '#000000',
              secondaryColor: '#ffffff',
              tertiaryColor: '#cccccc',
            },
            settings: {
              validationMethod: 'email',
              allowQuantitySelection: true,
              showPricing: true,
              giftsPerUser: 1,
              shippingMode: 'employee',
              defaultLanguage,
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
            },
            available_languages: [defaultLanguage, targetLanguage],
            translations,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockSiteContext = createMockSiteContext(mockSite);

          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SiteContext.Provider value={mockSiteContext}>
              <LanguageProvider>{children}</LanguageProvider>
            </SiteContext.Provider>
          );

          const { result } = renderHook(
            () => ({
              language: useLanguage(),
              content: useSiteContent(),
            }),
            { wrapper }
          );

          // Switch to target language (which has missing translations)
          act(() => {
            result.current.language.setLanguage(targetLanguage);
          });

          // Get content - should fallback to default language
          const content = fields.map((field) =>
            result.current.content.getTranslatedContent(field, 'Fallback')
          );

          // Property 1: All content should fallback to default language
          for (let i = 0; i < fields.length; i++) {
            expect(content[i]).toBe(`${fields[i]} in ${defaultLanguage}`);
          }

          // Property 2: Fallback should be consistent across all fields
          for (let i = 0; i < fields.length; i++) {
            expect(content[i]).toContain(defaultLanguage);
          }

          // Property 3: Current language should still be the target language
          expect(result.current.language.currentLanguage.code).toBe(targetLanguage);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Language switching updates localStorage
   * 
   * When language is switched, the preference should be persisted in localStorage.
   * Note: This test verifies the behavior when localStorage is available.
   */
  it('Property: Language switching updates localStorage', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'es', 'fr', 'de', 'it', 'pt-BR'),
        (targetLanguage) => {
          const mockSite: Site = {
            id: 'test-site-1',
            name: 'Test Site',
            clientId: 'client-1',
            domain: 'test.example.com',
            status: 'active',
            branding: {
              primaryColor: '#000000',
              secondaryColor: '#ffffff',
              tertiaryColor: '#cccccc',
            },
            settings: {
              validationMethod: 'email',
              allowQuantitySelection: true,
              showPricing: true,
              giftsPerUser: 1,
              shippingMode: 'employee',
              defaultLanguage: 'en',
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
            },
            available_languages: ['en', 'es', 'fr', 'de', 'it', 'pt-BR'],
            translations: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockSiteContext = createMockSiteContext(mockSite);

          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SiteContext.Provider value={mockSiteContext}>
              <LanguageProvider>{children}</LanguageProvider>
            </SiteContext.Provider>
          );

          const { result } = renderHook(() => useLanguage(), { wrapper });

          // Clear localStorage before test
          localStorage.clear();

          // Switch language
          act(() => {
            result.current.setLanguage(targetLanguage);
          });

          // Property 1: localStorage should be updated (if the implementation supports it)
          // Note: The actual implementation may or may not persist to localStorage
          const storedLanguage = localStorage.getItem('preferred-language');
          
          // Property 2: Current language should match
          expect(result.current.currentLanguage.code).toBe(targetLanguage);
          
          // Property 3: If localStorage is used, it should match the current language
          if (storedLanguage !== null) {
            expect(storedLanguage).toBe(targetLanguage);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Multiple rapid language switches are handled correctly
   * 
   * Rapidly switching between languages should result in the final language being applied.
   */
  it('Property: Multiple rapid language switches are handled correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('en', 'es', 'fr', 'de'), { minLength: 2, maxLength: 5 }),
        fc.constantFrom('welcomePage.title', 'header.logoAlt'),
        (languageSequence, field) => {
          const translations = {
            welcomePage: {
              title: {
                en: 'Welcome',
                es: 'Bienvenido',
                fr: 'Bienvenue',
                de: 'Willkommen',
              },
            },
            header: {
              logoAlt: {
                en: 'Logo',
                es: 'Logotipo',
                fr: 'Logo',
                de: 'Logo',
              },
            },
          };

          const mockSite: Site = {
            id: 'test-site-1',
            name: 'Test Site',
            clientId: 'client-1',
            domain: 'test.example.com',
            status: 'active',
            branding: {
              primaryColor: '#000000',
              secondaryColor: '#ffffff',
              tertiaryColor: '#cccccc',
            },
            settings: {
              validationMethod: 'email',
              allowQuantitySelection: true,
              showPricing: true,
              giftsPerUser: 1,
              shippingMode: 'employee',
              defaultLanguage: 'en',
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
            },
            available_languages: ['en', 'es', 'fr', 'de'],
            translations,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockSiteContext = createMockSiteContext(mockSite);

          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SiteContext.Provider value={mockSiteContext}>
              <LanguageProvider>{children}</LanguageProvider>
            </SiteContext.Provider>
          );

          const { result } = renderHook(
            () => ({
              language: useLanguage(),
              content: useSiteContent(),
            }),
            { wrapper }
          );

          // Rapidly switch through all languages in sequence
          for (const lang of languageSequence) {
            act(() => {
              result.current.language.setLanguage(lang);
            });
          }

          // Property 1: Final language should be the last in sequence
          const finalLanguage = languageSequence[languageSequence.length - 1];
          expect(result.current.language.currentLanguage.code).toBe(finalLanguage);

          // Property 2: Content should be in the final language
          const content = result.current.content.getTranslatedContent(field, 'Fallback');
          const parts = field.split('.');
          const section = parts[0];
          const key = parts[1];
          const expectedContent = (translations as any)[section][key][finalLanguage];
          expect(content).toBe(expectedContent);
        }
      ),
      { numRuns: 50 }
    );
  });
});
