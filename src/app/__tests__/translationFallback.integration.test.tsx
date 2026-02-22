import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
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

describe('Translation Fallback Behavior', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Fallback to default language', () => {
    it('should fallback to default language when current language translation is missing', () => {
      // Site with Spanish as default, but German translation missing
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
          defaultLanguage: 'es', // Spanish is default
          enableLanguageSelector: true,
          defaultCurrency: 'USD',
          allowedCountries: [],
          defaultCountry: 'US',
        },
        available_languages: ['es', 'de'],
        translations: {
          welcomePage: {
            title: {
              es: 'Bienvenido',
              // German translation missing
            },
          },
        },
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

      // Switch to German
      act(() => {
        result.current.language.setLanguage('de');
      });

      // Should fallback to Spanish (default language)
      const title = result.current.content.getTranslatedContent('welcomePage.title', 'Fallback');
      expect(title).toBe('Bienvenido');
    });
  });

  describe('Fallback to English', () => {
    it('should fallback to English when current and default language translations are missing', () => {
      // Site with French as default, German selected, only English available
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
          defaultLanguage: 'fr', // French is default
          enableLanguageSelector: true,
          defaultCurrency: 'USD',
          allowedCountries: [],
          defaultCountry: 'US',
        },
        available_languages: ['fr', 'de', 'en'],
        translations: {
          welcomePage: {
            title: {
              en: 'Welcome',
              // French and German translations missing
            },
          },
        },
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

      // Switch to German
      act(() => {
        result.current.language.setLanguage('de');
      });

      // Should fallback to English
      const title = result.current.content.getTranslatedContent('welcomePage.title', 'Fallback');
      expect(title).toBe('Welcome');
    });
  });

  describe('Fallback to first available translation', () => {
    it('should fallback to first available translation when current, default, and English are missing', () => {
      // Site with only Italian translation available
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
          defaultLanguage: 'fr', // French is default
          enableLanguageSelector: true,
          defaultCurrency: 'USD',
          allowedCountries: [],
          defaultCountry: 'US',
        },
        available_languages: ['fr', 'de', 'it'],
        translations: {
          welcomePage: {
            title: {
              it: 'Benvenuto',
              // French, German, and English translations missing
            },
          },
        },
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

      // Switch to German
      act(() => {
        result.current.language.setLanguage('de');
      });

      // Should fallback to Italian (first available)
      const title = result.current.content.getTranslatedContent('welcomePage.title', 'Fallback');
      expect(title).toBe('Benvenuto');
    });
  });

  describe('Fallback to provided fallback string', () => {
    it('should return fallback string when no translations are available', () => {
      // Site with no translations
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
        available_languages: ['en'],
        translations: {
          welcomePage: {
            title: {
              // No translations at all
            },
          },
        },
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

      // Should return fallback string
      const title = result.current.getTranslatedContent('welcomePage.title', 'Default Welcome Title');
      expect(title).toBe('Default Welcome Title');
    });

    it('should return empty string when no fallback is provided and no translations exist', () => {
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
        available_languages: ['en'],
        translations: {
          welcomePage: {
            title: {},
          },
        },
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

      // Should return empty string (default fallback)
      const title = result.current.getTranslatedContent('welcomePage.title');
      expect(title).toBe('');
    });
  });

  describe('Complete fallback chain', () => {
    it('should follow complete fallback chain: current → default → English → first → fallback', () => {
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
          defaultLanguage: 'es',
          enableLanguageSelector: true,
          defaultCurrency: 'USD',
          allowedCountries: [],
          defaultCountry: 'US',
        },
        available_languages: ['en', 'es', 'fr', 'de'],
        translations: {
          field1: {
            value: {
              de: 'Deutsch',
              es: 'Español',
              en: 'English',
              fr: 'Français',
            },
          },
          field2: {
            value: {
              es: 'Español',
              en: 'English',
              fr: 'Français',
            },
          },
          field3: {
            value: {
              en: 'English',
              fr: 'Français',
            },
          },
          field4: {
            value: {
              fr: 'Français',
            },
          },
          field5: {
            value: {},
          },
        },
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

      // Switch to German
      act(() => {
        result.current.language.setLanguage('de');
      });

      // field1: has German → returns German
      expect(result.current.content.getTranslatedContent('field1.value', 'Fallback')).toBe('Deutsch');

      // field2: no German, has Spanish (default) → returns Spanish
      expect(result.current.content.getTranslatedContent('field2.value', 'Fallback')).toBe('Español');

      // field3: no German, no Spanish, has English → returns English
      expect(result.current.content.getTranslatedContent('field3.value', 'Fallback')).toBe('English');

      // field4: no German, no Spanish, no English, has French (first) → returns French
      expect(result.current.content.getTranslatedContent('field4.value', 'Fallback')).toBe('Français');

      // field5: no translations at all → returns fallback
      expect(result.current.content.getTranslatedContent('field5.value', 'Fallback')).toBe('Fallback');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string translations correctly', () => {
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
        available_languages: ['en', 'es'],
        translations: {
          welcomePage: {
            title: {
              en: '',  // Empty string
              es: 'Bienvenido',
            },
          },
        },
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

      // Empty string should be treated as missing, fallback to Spanish
      const title = result.current.getTranslatedContent('welcomePage.title', 'Fallback');
      expect(title).toBe('Bienvenido');
    });

    it('should handle whitespace-only translations correctly', () => {
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
        available_languages: ['en', 'es'],
        translations: {
          welcomePage: {
            title: {
              en: '   ',  // Whitespace only
              es: 'Bienvenido',
            },
          },
        },
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

      // Whitespace-only should be treated as missing, fallback to Spanish
      const title = result.current.getTranslatedContent('welcomePage.title', 'Fallback');
      expect(title).toBe('Bienvenido');
    });
  });
});
