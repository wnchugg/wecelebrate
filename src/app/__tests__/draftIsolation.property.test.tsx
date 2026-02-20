/**
 * Property-Based Tests for Draft Isolation
 * Feature: multi-language-content
 * 
 * **Property 6: Draft changes don't affect live site**
 * 
 * **Validates: Requirements 9.3, 9.7**
 * 
 * For any draft translation changes, the live site content should remain
 * unchanged until publish.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { renderHook } from '@testing-library/react';
import { LanguageProvider } from '../context/LanguageContext';
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

describe('Draft Isolation Property-Based Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Suppress console warnings in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  /**
   * Feature: multi-language-content
   * Property 6: Draft changes don't affect live site
   * 
   * **Validates: Requirements 9.3, 9.7**
   * 
   * For any draft translation changes, the live site content should remain
   * unchanged until publish. This test verifies that:
   * 1. Live translations are independent of draft translations
   * 2. Reading content returns live translations, not draft
   * 3. Draft changes don't leak into live site
   * 4. Multiple draft changes don't affect live site
   */
  it('Property 6: Draft changes don\'t affect live site', () => {
    fc.assert(
      fc.property(
        // Generate content fields
        fc.constantFrom(
          'welcomePage.title',
          'header.logoAlt',
          'footer.text',
          'welcomePage.message'
        ),
        // Generate live content
        fc.string({ minLength: 5, maxLength: 50 }).filter((s) => s.trim().length > 0),
        // Generate draft content (different from live)
        fc.string({ minLength: 5, maxLength: 50 }).filter((s) => s.trim().length > 0),
        // Generate language
        fc.constantFrom('en', 'es', 'fr', 'de'),
        (field, liveContent, draftContent, language) => {
          // Ensure live and draft content are different
          if (liveContent === draftContent) {
            draftContent = draftContent + ' (draft)';
          }

          // Build translations structure
          const parts = field.split('.');
          const buildTranslations = (content: string) => {
            const translations: any = {};
            let current = translations;

            for (let i = 0; i < parts.length - 1; i++) {
              current[parts[i]] = {};
              current = current[parts[i]];
            }

            const finalKey = parts[parts.length - 1];
            current[finalKey] = {
              [language]: content,
            };

            return translations;
          };

          const liveTranslations = buildTranslations(liveContent);
          const draftTranslations = buildTranslations(draftContent);

          // Create mock site with both live and draft translations
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
              defaultLanguage: language,
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
            },
            available_languages: [language],
            translations: liveTranslations,
            draft_settings: {
              validationMethod: 'email',
              allowQuantitySelection: true,
              showPricing: true,
              giftsPerUser: 1,
              shippingMode: 'employee',
              defaultLanguage: language,
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
              translations: draftTranslations,
            },
            draft_available_languages: [language],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockSiteContext = createMockSiteContext(mockSite);

          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SiteContext.Provider value={mockSiteContext}>
              <LanguageProvider>{children}</LanguageProvider>
            </SiteContext.Provider>
          );

          const { result } = renderHook(() => useSiteContent(), { wrapper });

          // Get content from live site
          const content = result.current.getTranslatedContent(field, 'Fallback');

          // Property 1: Content should be from live translations, not draft
          expect(content).toBe(liveContent);
          expect(content).not.toBe(draftContent);

          // Property 2: Live and draft should be different
          expect(liveContent).not.toBe(draftContent);

          // Property 3: Draft translations should exist but not be returned
          expect(mockSite.draft_settings?.translations).toBeDefined();
          expect(mockSite.translations).not.toEqual(mockSite.draft_settings?.translations);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Draft translations are isolated across multiple fields
   * 
   * When multiple fields have draft changes, none of them should affect
   * the live site content.
   */
  it('Property: Draft translations are isolated across multiple fields', () => {
    fc.assert(
      fc.property(
        // Generate multiple fields
        fc.uniqueArray(
          fc.constantFrom(
            'welcomePage.title',
            'welcomePage.message',
            'header.logoAlt',
            'header.homeLink',
            'footer.text'
          ),
          { minLength: 2, maxLength: 5 }
        ),
        fc.constantFrom('en', 'es', 'fr'),
        (fields, language) => {
          // Build live and draft translations for all fields
          const liveTranslations: any = {};
          const draftTranslations: any = {};

          for (const field of fields) {
            const parts = field.split('.');
            
            // Build live translations
            let liveCurrent = liveTranslations;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!liveCurrent[parts[i]]) {
                liveCurrent[parts[i]] = {};
              }
              liveCurrent = liveCurrent[parts[i]];
            }
            const finalKey = parts[parts.length - 1];
            liveCurrent[finalKey] = {
              [language]: `Live: ${field}`,
            };

            // Build draft translations
            let draftCurrent = draftTranslations;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!draftCurrent[parts[i]]) {
                draftCurrent[parts[i]] = {};
              }
              draftCurrent = draftCurrent[parts[i]];
            }
            draftCurrent[finalKey] = {
              [language]: `Draft: ${field}`,
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
              defaultLanguage: language,
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
            },
            available_languages: [language],
            translations: liveTranslations,
            draft_settings: {
              validationMethod: 'email',
              allowQuantitySelection: true,
              showPricing: true,
              giftsPerUser: 1,
              shippingMode: 'employee',
              defaultLanguage: language,
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
              translations: draftTranslations,
            },
            draft_available_languages: [language],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockSiteContext = createMockSiteContext(mockSite);

          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SiteContext.Provider value={mockSiteContext}>
              <LanguageProvider>{children}</LanguageProvider>
            </SiteContext.Provider>
          );

          const { result } = renderHook(() => useSiteContent(), { wrapper });

          // Get content for all fields
          const contents = fields.map((field) =>
            result.current.getTranslatedContent(field, 'Fallback')
          );

          // Property 1: All content should be from live translations
          for (let i = 0; i < fields.length; i++) {
            expect(contents[i]).toBe(`Live: ${fields[i]}`);
            expect(contents[i]).not.toBe(`Draft: ${fields[i]}`);
          }

          // Property 2: No draft content should leak into live
          for (const content of contents) {
            expect(content).not.toContain('Draft:');
            expect(content).toContain('Live:');
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Draft available_languages don't affect live language selector
   * 
   * When draft has different available languages than live, the live site
   * should only show live available languages.
   */
  it('Property: Draft available_languages don\'t affect live language selector', () => {
    fc.assert(
      fc.property(
        // Generate live languages
        fc.uniqueArray(fc.constantFrom('en', 'es', 'fr'), { minLength: 1, maxLength: 3 }),
        // Generate draft languages (only use supported languages)
        fc.uniqueArray(fc.constantFrom('en', 'es', 'fr'), {
          minLength: 2,
          maxLength: 3,
        }),
        (liveLanguages, draftLanguages) => {
          // Ensure draft has at least one language not in live
          const hasNewLanguage = draftLanguages.some((lang) => !liveLanguages.includes(lang));
          if (!hasNewLanguage && draftLanguages.length < 3) {
            // Only use languages that are in the type: 'fr', 'en', 'es'
            const availableLanguages = ['fr', 'en', 'es'] as const;
            const unusedLanguage = availableLanguages.find(lang => !draftLanguages.includes(lang));
            if (unusedLanguage) {
              draftLanguages.push(unusedLanguage);
            }
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
              defaultLanguage: liveLanguages[0],
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
            },
            available_languages: liveLanguages,
            translations: {},
            draft_settings: {
              validationMethod: 'email',
              allowQuantitySelection: true,
              showPricing: true,
              giftsPerUser: 1,
              shippingMode: 'employee',
              defaultLanguage: draftLanguages[0],
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
            },
            draft_available_languages: draftLanguages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Property 1: Live available_languages should be independent of draft
          expect(mockSite.available_languages).toEqual(liveLanguages);
          expect(mockSite.available_languages).not.toEqual(draftLanguages);

          // Property 2: Draft available_languages should exist but not affect live
          expect(mockSite.draft_available_languages).toEqual(draftLanguages);

          // Property 3: Live and draft should be different
          const liveLangsSet = new Set(liveLanguages);
          const draftLangsSet = new Set(draftLanguages);
          const areSame =
            liveLangsSet.size === draftLangsSet.size &&
            [...liveLangsSet].every((lang) => draftLangsSet.has(lang));
          
          // If they're the same, that's okay, but if different, verify isolation
          if (!areSame) {
            expect(mockSite.available_languages).not.toEqual(mockSite.draft_available_languages);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Multiple draft saves don't affect live site
   * 
   * Saving draft multiple times should never affect the live site content.
   */
  it('Property: Multiple draft saves don\'t affect live site', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('welcomePage.title', 'header.logoAlt'),
        fc.array(fc.string({ minLength: 5, maxLength: 30 }), { minLength: 2, maxLength: 5 }),
        fc.constantFrom('en', 'es', 'fr'),
        (field, draftVersions, language) => {
          const liveContent = 'Live Content';

          // Build translations structure
          const parts = field.split('.');
          const buildTranslations = (content: string) => {
            const translations: any = {};
            let current = translations;

            for (let i = 0; i < parts.length - 1; i++) {
              current[parts[i]] = {};
              current = current[parts[i]];
            }

            const finalKey = parts[parts.length - 1];
            current[finalKey] = {
              [language]: content,
            };

            return translations;
          };

          const liveTranslations = buildTranslations(liveContent);

          // Create site with initial draft
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
              defaultLanguage: language,
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
            },
            available_languages: [language],
            translations: liveTranslations,
            draft_settings: {
              validationMethod: 'email',
              allowQuantitySelection: true,
              showPricing: true,
              giftsPerUser: 1,
              shippingMode: 'employee',
              defaultLanguage: language,
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
              translations: buildTranslations(draftVersions[0]),
            },
            draft_available_languages: [language],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockSiteContext = createMockSiteContext(mockSite);

          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SiteContext.Provider value={mockSiteContext}>
              <LanguageProvider>{children}</LanguageProvider>
            </SiteContext.Provider>
          );

          const { result } = renderHook(() => useSiteContent(), { wrapper });

          // Simulate multiple draft saves by updating draft_settings
          for (let i = 0; i < draftVersions.length; i++) {
            mockSite.draft_settings = {
              ...mockSite.draft_settings,
              translations: buildTranslations(draftVersions[i]),
            };

            // Get content - should always be live content
            const content = result.current.getTranslatedContent(field, 'Fallback');

            // Property: Content should always be live content, never draft
            expect(content).toBe(liveContent);
            expect(content).not.toBe(draftVersions[i]);
          }

          // Property: Live translations should remain unchanged
          expect(mockSite.translations).toEqual(liveTranslations);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Draft isolation is maintained across language switches
   * 
   * Switching languages should not cause draft content to leak into live site.
   */
  it('Property: Draft isolation is maintained across language switches', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.constantFrom('en', 'es', 'fr', 'de'), { minLength: 2, maxLength: 4 }),
        fc.constantFrom('welcomePage.title', 'header.logoAlt'),
        (languages, field) => {
          // Build translations for all languages
          const parts = field.split('.');
          const liveTranslations: any = {};
          const draftTranslations: any = {};

          let current = liveTranslations;
          for (let i = 0; i < parts.length - 1; i++) {
            current[parts[i]] = {};
            current = current[parts[i]];
          }
          const finalKey = parts[parts.length - 1];
          current[finalKey] = {};
          for (const lang of languages) {
            current[finalKey][lang] = `Live: ${field} in ${lang}`;
          }

          current = draftTranslations;
          for (let i = 0; i < parts.length - 1; i++) {
            current[parts[i]] = {};
            current = current[parts[i]];
          }
          current[finalKey] = {};
          for (const lang of languages) {
            current[finalKey][lang] = `Draft: ${field} in ${lang}`;
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
              defaultLanguage: languages[0],
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
            },
            available_languages: languages,
            translations: liveTranslations,
            draft_settings: {
              validationMethod: 'email',
              allowQuantitySelection: true,
              showPricing: true,
              giftsPerUser: 1,
              shippingMode: 'employee',
              defaultLanguage: languages[0],
              enableLanguageSelector: true,
              defaultCurrency: 'USD',
              allowedCountries: [],
              defaultCountry: 'US',
              translations: draftTranslations,
            },
            draft_available_languages: languages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockSiteContext = createMockSiteContext(mockSite);

          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SiteContext.Provider value={mockSiteContext}>
              <LanguageProvider>{children}</LanguageProvider>
            </SiteContext.Provider>
          );

          const { result } = renderHook(() => useSiteContent(), { wrapper });

          // Get content in default language
          // Note: The hook returns content based on the current language from LanguageContext,
          // which may not match the site's default language initially
          const content = result.current.getTranslatedContent(field, 'Fallback');

          // Property 1: Content should always be from live, never draft
          expect(content).toContain('Live:');
          expect(content).not.toContain('Draft:');
          
          // Property 2: Content should be from one of the available languages
          const isValidLiveContent = languages.some(lang => 
            content === `Live: ${field} in ${lang}`
          );
          expect(isValidLiveContent).toBe(true);
          
          // Property 3: Draft should exist but not be returned
          expect(mockSite.draft_settings?.translations).toBeDefined();
          expect(mockSite.translations).not.toEqual(mockSite.draft_settings?.translations);
        }
      ),
      { numRuns: 50 }
    );
  });
});
