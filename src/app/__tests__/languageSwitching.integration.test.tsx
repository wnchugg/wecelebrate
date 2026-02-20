import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { SiteProvider, SiteContext } from '../context/SiteContext';
import { useSiteContent } from '../hooks/useSiteContent';
import type { Site } from '../context/SiteContext';

// Mock site with translations
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
  available_languages: ['en', 'es', 'fr'],
  translations: {
    welcomePage: {
      title: {
        en: 'Welcome',
        es: 'Bienvenido',
        fr: 'Bienvenue',
      },
      message: {
        en: 'Welcome to our site',
        es: 'Bienvenido a nuestro sitio',
        fr: 'Bienvenue sur notre site',
      },
      buttonText: {
        en: 'Get Started',
        es: 'Comenzar',
        fr: 'Commencer',
      },
    },
    header: {
      logoAlt: {
        en: 'Company Logo',
        es: 'Logo de la Empresa',
        fr: 'Logo de l\'Entreprise',
      },
      homeLink: {
        en: 'Home',
        es: 'Inicio',
        fr: 'Accueil',
      },
    },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Test component that uses translations
function TestComponent() {
  const { getTranslatedContent } = useSiteContent();
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <div>
      <div data-testid="current-language">{currentLanguage.code}</div>
      <div data-testid="welcome-title">
        {getTranslatedContent('welcomePage.title', 'Welcome')}
      </div>
      <div data-testid="welcome-message">
        {getTranslatedContent('welcomePage.message', 'Welcome message')}
      </div>
      <div data-testid="button-text">
        {getTranslatedContent('welcomePage.buttonText', 'Button')}
      </div>
      <div data-testid="logo-alt">
        {getTranslatedContent('header.logoAlt', 'Logo')}
      </div>
      <button onClick={() => setLanguage('es')} data-testid="switch-to-spanish">
        Switch to Spanish
      </button>
      <button onClick={() => setLanguage('fr')} data-testid="switch-to-french">
        Switch to French
      </button>
      <button onClick={() => setLanguage('en')} data-testid="switch-to-english">
        Switch to English
      </button>
    </div>
  );
}

// Wrapper component with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SiteProvider>{children}</SiteProvider>
    </LanguageProvider>
  );
}

describe('Language Switching Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock the SiteContext to return our mock site
    vi.mock('../context/SiteContext', async () => {
      const actual = await vi.importActual('../context/SiteContext');
      return {
        ...actual,
        useSite: () => ({
          currentSite: mockSite,
          sites: [mockSite],
          clients: [] as any[],
          brands: [] as any[],
          currentClient: null as any,
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
        }),
      };
    });
  });

  it('should display content in default language (English) on initial load', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('Welcome');
    expect(screen.getByTestId('welcome-message')).toHaveTextContent('Welcome to our site');
    expect(screen.getByTestId('button-text')).toHaveTextContent('Get Started');
    expect(screen.getByTestId('logo-alt')).toHaveTextContent('Company Logo');
  });

  it('should update all content when switching to Spanish', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Initially in English
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('Welcome');

    // Switch to Spanish
    await user.click(screen.getByTestId('switch-to-spanish'));

    // Wait for content to update
    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('es');
    });

    // Verify all content updated to Spanish
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('Bienvenido');
    expect(screen.getByTestId('welcome-message')).toHaveTextContent('Bienvenido a nuestro sitio');
    expect(screen.getByTestId('button-text')).toHaveTextContent('Comenzar');
    expect(screen.getByTestId('logo-alt')).toHaveTextContent('Logo de la Empresa');
  });

  it('should update all content when switching to French', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Switch to French
    await user.click(screen.getByTestId('switch-to-french'));

    // Wait for content to update
    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('fr');
    });

    // Verify all content updated to French
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('Bienvenue');
    expect(screen.getByTestId('welcome-message')).toHaveTextContent('Bienvenue sur notre site');
    expect(screen.getByTestId('button-text')).toHaveTextContent('Commencer');
    expect(screen.getByTestId('logo-alt')).toHaveTextContent('Logo de l\'Entreprise');
  });

  it('should switch between multiple languages correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Start in English
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('Welcome');

    // Switch to Spanish
    await user.click(screen.getByTestId('switch-to-spanish'));
    await waitFor(() => {
      expect(screen.getByTestId('welcome-title')).toHaveTextContent('Bienvenido');
    });

    // Switch to French
    await user.click(screen.getByTestId('switch-to-french'));
    await waitFor(() => {
      expect(screen.getByTestId('welcome-title')).toHaveTextContent('Bienvenue');
    });

    // Switch back to English
    await user.click(screen.getByTestId('switch-to-english'));
    await waitFor(() => {
      expect(screen.getByTestId('welcome-title')).toHaveTextContent('Welcome');
    });
  });

  it('should persist language preference in localStorage', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Switch to Spanish
    await user.click(screen.getByTestId('switch-to-spanish'));

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('es');
    });

    // Check localStorage
    expect(localStorage.getItem('preferred-language')).toBe('es');

    // Switch to French
    await user.click(screen.getByTestId('switch-to-french'));

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('fr');
    });

    // Check localStorage updated
    expect(localStorage.getItem('preferred-language')).toBe('fr');
  });

  it('should restore language preference from localStorage on mount', () => {
    // Set language preference in localStorage
    localStorage.setItem('preferred-language', 'es');

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Should load with Spanish
    expect(screen.getByTestId('current-language')).toHaveTextContent('es');
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('Bienvenido');
  });

  it('should update document direction and lang attributes when switching languages', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Initially English (LTR)
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');

    // Switch to Spanish (still LTR)
    await user.click(screen.getByTestId('switch-to-spanish'));

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('es');
    });
    expect(document.documentElement.dir).toBe('ltr');
  });
});

describe('Language Switching with RTL Layout', () => {
  // Mock site with RTL language (Arabic)
  const mockSiteWithRTL: Site = {
    id: 'test-site-rtl',
    name: 'Test Site RTL',
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
    available_languages: ['en', 'ar', 'he'],
    translations: {
      welcomePage: {
        title: {
          en: 'Welcome',
          ar: 'مرحبا',
          he: 'ברוך הבא',
        },
        message: {
          en: 'Welcome to our site',
          ar: 'مرحبا بك في موقعنا',
          he: 'ברוכים הבאים לאתר שלנו',
        },
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  function RTLTestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <SiteContext.Provider
        value={{
          currentSite: mockSiteWithRTL,
          sites: [mockSiteWithRTL],
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
        }}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </SiteContext.Provider>
    );
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('should apply RTL layout when switching to Arabic', async () => {
    const user = userEvent.setup();
    
    function RTLTestComponent() {
      const { getTranslatedContent } = useSiteContent();
      const { currentLanguage, setLanguage } = useLanguage();

      return (
        <div>
          <div data-testid="current-language">{currentLanguage.code}</div>
          <div data-testid="current-direction">{document.documentElement.dir}</div>
          <div data-testid="welcome-title">
            {getTranslatedContent('welcomePage.title', 'Welcome')}
          </div>
          <button onClick={() => setLanguage('ar')} data-testid="switch-to-arabic">
            Switch to Arabic
          </button>
          <button onClick={() => setLanguage('en')} data-testid="switch-to-english">
            Switch to English
          </button>
        </div>
      );
    }

    render(
      <RTLTestWrapper>
        <RTLTestComponent />
      </RTLTestWrapper>
    );

    // Initially English (LTR)
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('Welcome');

    // Switch to Arabic (RTL)
    await user.click(screen.getByTestId('switch-to-arabic'));

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });

    // Verify content updated to Arabic
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('مرحبا');
  });

  it('should apply RTL layout when switching to Hebrew', async () => {
    const user = userEvent.setup();
    
    function RTLTestComponent() {
      const { getTranslatedContent } = useSiteContent();
      const { currentLanguage, setLanguage } = useLanguage();

      return (
        <div>
          <div data-testid="current-language">{currentLanguage.code}</div>
          <div data-testid="welcome-title">
            {getTranslatedContent('welcomePage.title', 'Welcome')}
          </div>
          <button onClick={() => setLanguage('he')} data-testid="switch-to-hebrew">
            Switch to Hebrew
          </button>
        </div>
      );
    }

    render(
      <RTLTestWrapper>
        <RTLTestComponent />
      </RTLTestWrapper>
    );

    // Switch to Hebrew (RTL)
    await user.click(screen.getByTestId('switch-to-hebrew'));

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('he');
      expect(document.documentElement.dir).toBe('rtl');
    });

    // Verify content updated to Hebrew
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('ברוך הבא');
  });

  it('should switch between LTR and RTL correctly', async () => {
    const user = userEvent.setup();
    
    function RTLTestComponent() {
      const { getTranslatedContent } = useSiteContent();
      const { currentLanguage, setLanguage } = useLanguage();

      return (
        <div>
          <div data-testid="welcome-title">
            {getTranslatedContent('welcomePage.title', 'Welcome')}
          </div>
          <button onClick={() => setLanguage('en')} data-testid="switch-to-english">
            English
          </button>
          <button onClick={() => setLanguage('ar')} data-testid="switch-to-arabic">
            Arabic
          </button>
        </div>
      );
    }

    render(
      <RTLTestWrapper>
        <RTLTestComponent />
      </RTLTestWrapper>
    );

    // Start in English (LTR)
    expect(document.documentElement.dir).toBe('ltr');
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('Welcome');

    // Switch to Arabic (RTL)
    await user.click(screen.getByTestId('switch-to-arabic'));
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('rtl');
      expect(screen.getByTestId('welcome-title')).toHaveTextContent('مرحبا');
    });

    // Switch back to English (LTR)
    await user.click(screen.getByTestId('switch-to-english'));
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('ltr');
      expect(screen.getByTestId('welcome-title')).toHaveTextContent('Welcome');
    });
  });

  it('should handle missing RTL translations with fallback', async () => {
    const user = userEvent.setup();
    
    // Site with incomplete Arabic translations
    const incompleteSite: Site = {
      ...mockSiteWithRTL,
      translations: {
        welcomePage: {
          title: {
            en: 'Welcome',
            ar: 'مرحبا',
          },
          message: {
            en: 'Welcome to our site',
            // Arabic translation missing
          },
        },
      },
    };

    function IncompleteRTLTestWrapper({ children }: { children: React.ReactNode }) {
      return (
        <SiteContext.Provider
          value={{
            currentSite: incompleteSite,
            sites: [incompleteSite],
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
          }}
        >
          <LanguageProvider>{children}</LanguageProvider>
        </SiteContext.Provider>
      );
    }

    function RTLTestComponent() {
      const { getTranslatedContent } = useSiteContent();
      const { currentLanguage, setLanguage } = useLanguage();

      return (
        <div>
          <div data-testid="welcome-title">
            {getTranslatedContent('welcomePage.title', 'Welcome')}
          </div>
          <div data-testid="welcome-message">
            {getTranslatedContent('welcomePage.message', 'Welcome message')}
          </div>
          <button onClick={() => setLanguage('ar')} data-testid="switch-to-arabic">
            Arabic
          </button>
        </div>
      );
    }

    render(
      <IncompleteRTLTestWrapper>
        <RTLTestComponent />
      </IncompleteRTLTestWrapper>
    );

    // Switch to Arabic
    await user.click(screen.getByTestId('switch-to-arabic'));

    await waitFor(() => {
      expect(document.documentElement.dir).toBe('rtl');
    });

    // Title should be in Arabic
    expect(screen.getByTestId('welcome-title')).toHaveTextContent('مرحبا');

    // Message should fallback to English (default language)
    expect(screen.getByTestId('welcome-message')).toHaveTextContent('Welcome to our site');
  });
});

describe('Language Switching with useSiteContent Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    
    // Mock the SiteContext
    vi.mock('../context/SiteContext', async () => {
      const actual = await vi.importActual('../context/SiteContext');
      return {
        ...actual,
        useSite: () => ({
          currentSite: mockSite,
          sites: [mockSite],
          clients: [] as any[],
          brands: [] as any[],
          currentClient: null as any,
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
        }),
      };
    });
  });

  it('should return translated content for current language', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>
        <SiteProvider>{children}</SiteProvider>
      </LanguageProvider>
    );

    const { result: languageResult } = renderHook(() => useLanguage(), { wrapper });
    const { result: contentResult } = renderHook(() => useSiteContent(), { wrapper });

    // Default language is English
    expect(languageResult.current.currentLanguage.code).toBe('en');
    
    const title = contentResult.current.getTranslatedContent('welcomePage.title', 'Fallback');
    expect(title).toBe('Welcome');
  });

  it('should update translated content when language changes', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>
        <SiteProvider>{children}</SiteProvider>
      </LanguageProvider>
    );

    // Combine both hooks in a single renderHook call so they share the same context
    const { result } = renderHook(
      () => ({
        language: useLanguage(),
        content: useSiteContent(),
      }),
      { wrapper }
    );

    // Initially English
    let title = result.current.content.getTranslatedContent('welcomePage.title', 'Fallback');
    expect(title).toBe('Welcome');

    // Switch to Spanish
    act(() => {
      result.current.language.setLanguage('es');
    });

    // Content should update
    title = result.current.content.getTranslatedContent('welcomePage.title', 'Fallback');
    expect(title).toBe('Bienvenido');

    // Switch to French
    act(() => {
      result.current.language.setLanguage('fr');
    });

    // Content should update again
    title = result.current.content.getTranslatedContent('welcomePage.title', 'Fallback');
    expect(title).toBe('Bienvenue');
  });
});
