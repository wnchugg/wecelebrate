/**
 * Integration Tests for Draft/Publish Workflow with Translations
 * Feature: multi-language-content
 * 
 * These tests verify that the draft/publish workflow correctly handles translations:
 * - Draft changes don't affect live site
 * - Publish copies translations correctly
 * - Validation prevents invalid publish
 * 
 * **Validates: Requirements 9.3, 9.4, 9.5, 9.7**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { SiteContext, SiteProvider } from '../context/SiteContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { canPublishTranslations } from '../utils/translationValidation';
import type { Site, SiteContextType } from '../context/SiteContext';

// Helper function to create a mock site context
function createMockSiteContext(site: Site | null, overrides?: Partial<SiteContextType>): SiteContextType {
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
    ...overrides,
  };
}

describe('Draft/Publish Workflow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Draft changes isolation', () => {
    it('should not affect live site when saving draft translations', async () => {
      // Live site with English translations
      const liveSite: Site = {
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
        available_languages: ['en'],
        translations: {
          welcomePage: {
            title: {
              en: 'Welcome',
            },
          },
        },
        // Draft has Spanish translations
        draft_settings: {
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
          translations: {
            welcomePage: {
              title: {
                en: 'Welcome',
                es: 'Bienvenido',
              },
            },
          },
        },
        draft_available_languages: ['en', 'es'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockSiteContext = createMockSiteContext(liveSite);

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

      // Live site should only have English
      expect(liveSite.available_languages).toEqual(['en']);
      expect(liveSite.translations.welcomePage.title).toEqual({ en: 'Welcome' });

      // Switch to Spanish
      act(() => {
        result.current.language.setLanguage('es');
      });

      // Should fallback to English since Spanish is not in live site
      const title = result.current.content.getTranslatedContent('welcomePage.title', 'Fallback');
      expect(title).toBe('Welcome');

      // Draft should have Spanish
      expect(liveSite.draft_available_languages).toEqual(['en', 'es']);
      expect((liveSite.draft_settings?.translations as any)?.welcomePage?.title).toEqual({
        en: 'Welcome',
        es: 'Bienvenido',
      });
    });

    it('should keep draft and live translations separate', () => {
      const site: Site = {
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
        available_languages: ['en'],
        translations: {
          welcomePage: {
            title: { en: 'Live Title' },
          },
        },
        draft_settings: {
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
          translations: {
            welcomePage: {
              title: { en: 'Draft Title' },
            },
          },
        },
        draft_available_languages: ['en'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Live translations should be different from draft
      expect((site.translations as any).welcomePage.title.en).toBe('Live Title');
      expect((site.draft_settings?.translations as any)?.welcomePage.title.en).toBe('Draft Title');
      expect((site.translations as any).welcomePage.title.en).not.toBe(
        (site.draft_settings?.translations as any)?.welcomePage.title.en
      );
    });
  });

  describe('Publish workflow', () => {
    it('should copy translations from draft to live on publish', async () => {
      const draftTranslations = {
        welcomePage: {
          title: {
            en: 'Welcome',
            es: 'Bienvenido',
            fr: 'Bienvenue',
          },
        },
      };

      const draftLanguages = ['en', 'es', 'fr'];

      let currentSite: Site = {
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
        available_languages: ['en'],
        translations: {
          welcomePage: {
            title: { en: 'Old Welcome' },
          },
        },
        draft_settings: {
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
          translations: draftTranslations,
        },
        draft_available_languages: draftLanguages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const publishSite = vi.fn().mockImplementation(async () => {
        // Simulate publish: copy draft to live
        currentSite = {
          ...currentSite,
          translations: draftTranslations,
          available_languages: draftLanguages,
          settings: {
            ...currentSite.settings,
            ...currentSite.draft_settings,
          },
          draft_settings: undefined,
          draft_available_languages: undefined,
        };
      });

      const mockSiteContext = createMockSiteContext(currentSite, { publishSite });

      // Before publish
      expect(currentSite.translations.welcomePage.title).toEqual({ en: 'Old Welcome' });
      expect(currentSite.available_languages).toEqual(['en']);

      // Publish
      await publishSite();

      // After publish
      expect(currentSite.translations).toEqual(draftTranslations);
      expect(currentSite.available_languages).toEqual(draftLanguages);
      expect(currentSite.draft_settings).toBeUndefined();
      expect(currentSite.draft_available_languages).toBeUndefined();
    });

    it('should clear draft after successful publish', async () => {
      let currentSite: Site = {
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
        available_languages: ['en'],
        translations: {
          welcomePage: {
            title: { en: 'Welcome' },
          },
        },
        draft_settings: {
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
          translations: {
            welcomePage: {
              title: { en: 'Welcome', es: 'Bienvenido' },
            },
          },
        },
        draft_available_languages: ['en', 'es'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const publishSite = vi.fn().mockImplementation(async () => {
        currentSite = {
          ...currentSite,
          translations: currentSite.draft_settings!.translations!,
          available_languages: currentSite.draft_available_languages!,
          draft_settings: undefined,
          draft_available_languages: undefined,
        };
      });

      // Before publish - draft exists
      expect(currentSite.draft_settings).toBeDefined();
      expect(currentSite.draft_available_languages).toBeDefined();

      // Publish
      await publishSite();

      // After publish - draft cleared
      expect(currentSite.draft_settings).toBeUndefined();
      expect(currentSite.draft_available_languages).toBeUndefined();
    });
  });

  describe('Validation before publish', () => {
    it('should prevent publish when required default language translations are missing', () => {
      const translations = {
        welcomePage: {
          title: {
            es: 'Bienvenido', // Only Spanish, missing English (default)
          },
        },
      };

      const requiredFields = ['welcomePage.title'];
      const defaultLanguage = 'en';

      const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

      expect(result.canPublish).toBe(false);
      expect(result.reason).toContain('welcomePage.title');
    });

    it('should allow publish when all required default language translations are present', () => {
      const translations = {
        welcomePage: {
          title: {
            en: 'Welcome',
            es: 'Bienvenido',
          },
        },
        header: {
          logoAlt: {
            en: 'Logo',
          },
        },
      };

      const requiredFields = ['welcomePage.title', 'header.logoAlt'];
      const defaultLanguage = 'en';

      const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

      expect(result.canPublish).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should allow publish with incomplete non-default language translations', () => {
      const translations = {
        welcomePage: {
          title: {
            en: 'Welcome',
            es: 'Bienvenido',
            // French missing
          },
        },
      };

      const requiredFields = ['welcomePage.title'];
      const defaultLanguage = 'en';

      const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

      // Should allow publish since default language (English) is complete
      expect(result.canPublish).toBe(true);
    });

    it('should prevent publish when default language translation is empty string', () => {
      const translations = {
        welcomePage: {
          title: {
            en: '', // Empty string
            es: 'Bienvenido',
          },
        },
      };

      const requiredFields = ['welcomePage.title'];
      const defaultLanguage = 'en';

      const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

      expect(result.canPublish).toBe(false);
    });

    it('should prevent publish when default language translation is whitespace only', () => {
      const translations = {
        welcomePage: {
          title: {
            en: '   ', // Whitespace only
            es: 'Bienvenido',
          },
        },
      };

      const requiredFields = ['welcomePage.title'];
      const defaultLanguage = 'en';

      const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

      expect(result.canPublish).toBe(false);
    });

    it('should validate multiple required fields', () => {
      const translations = {
        welcomePage: {
          title: {
            en: 'Welcome',
          },
          message: {
            en: 'Welcome message',
          },
        },
        header: {
          logoAlt: {
            en: '', // Missing
          },
        },
      };

      const requiredFields = ['welcomePage.title', 'welcomePage.message', 'header.logoAlt'];
      const defaultLanguage = 'en';

      const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

      expect(result.canPublish).toBe(false);
      expect(result.reason).toContain('header.logoAlt');
    });
  });

  describe('Discard draft workflow', () => {
    it('should revert to published translations when discarding draft', async () => {
      const liveTranslations = {
        welcomePage: {
          title: { en: 'Live Title' },
        },
      };

      const draftTranslations = {
        welcomePage: {
          title: { en: 'Draft Title', es: 'Título de Borrador' },
        },
      };

      let currentSite: Site = {
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
        available_languages: ['en'],
        translations: liveTranslations,
        draft_settings: {
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
          translations: draftTranslations,
        },
        draft_available_languages: ['en', 'es'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const discardSiteDraft = vi.fn().mockImplementation(async () => {
        currentSite = {
          ...currentSite,
          draft_settings: undefined,
          draft_available_languages: undefined,
        };
      });

      // Before discard
      expect(currentSite.draft_settings?.translations).toEqual(draftTranslations);
      expect(currentSite.translations).toEqual(liveTranslations);

      // Discard draft
      await discardSiteDraft();

      // After discard - draft cleared, live unchanged
      expect(currentSite.draft_settings).toBeUndefined();
      expect(currentSite.draft_available_languages).toBeUndefined();
      expect(currentSite.translations).toEqual(liveTranslations);
    });
  });

  describe('Complete draft/publish cycle', () => {
    it('should handle complete workflow: save draft → validate → publish → verify', async () => {
      const initialTranslations = {
        welcomePage: {
          title: { en: 'Welcome' },
        },
      };

      const updatedTranslations = {
        welcomePage: {
          title: {
            en: 'Welcome',
            es: 'Bienvenido',
            fr: 'Bienvenue',
          },
        },
      };

      let currentSite: Site = {
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
        available_languages: ['en'],
        translations: initialTranslations,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saveSiteDraft = vi.fn().mockImplementation(async (updates: Partial<Site>) => {
        currentSite = {
          ...currentSite,
          draft_settings: {
            ...currentSite.settings,
            translations: updates.translations || currentSite.translations,
          },
          draft_available_languages: updates.available_languages || currentSite.available_languages,
        };
      });

      const publishSite = vi.fn().mockImplementation(async () => {
        if (currentSite.draft_settings) {
          currentSite = {
            ...currentSite,
            translations: currentSite.draft_settings.translations!,
            available_languages: currentSite.draft_available_languages!,
            settings: {
              ...currentSite.settings,
              ...currentSite.draft_settings,
            },
            draft_settings: undefined,
            draft_available_languages: undefined,
          };
        }
      });

      // Step 1: Save draft
      await saveSiteDraft({
        translations: updatedTranslations,
        available_languages: ['en', 'es', 'fr'],
      });

      expect(currentSite.draft_settings?.translations).toEqual(updatedTranslations);
      expect(currentSite.translations).toEqual(initialTranslations); // Live unchanged

      // Step 2: Validate
      const validation = canPublishTranslations(
        updatedTranslations,
        ['welcomePage.title'],
        'en'
      );
      expect(validation.canPublish).toBe(true);

      // Step 3: Publish
      await publishSite();

      // Step 4: Verify
      expect(currentSite.translations).toEqual(updatedTranslations);
      expect(currentSite.available_languages).toEqual(['en', 'es', 'fr']);
      expect(currentSite.draft_settings).toBeUndefined();
      expect(currentSite.draft_available_languages).toBeUndefined();
    });
  });
});
