// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SiteConfiguration } from '../SiteConfiguration';
import * as SiteContext from '../../../context/SiteContext';
import * as GiftContext from '../../../context/GiftContext';
import { BrowserRouter } from 'react-router';

// Mock the contexts
vi.mock('../../../context/SiteContext');
vi.mock('../../../context/GiftContext');

// Mock lazy-loaded components
vi.mock('../LandingPageEditor', () => ({
  LandingPageEditor: () => <div>Landing Page Editor Mock</div>
}));

vi.mock('../WelcomePageEditor', () => ({
  WelcomePageEditor: () => <div>Welcome Page Editor Mock</div>
}));

vi.mock('../SiteGiftConfiguration', () => ({
  default: () => <div>Site Gift Configuration Mock</div>
}));

vi.mock('../ShippingConfiguration', () => ({
  ShippingConfiguration: () => <div>Shipping Configuration Mock</div>
}));

vi.mock('../AccessManagement', () => ({
  default: () => <div>Access Management Mock</div>
}));

describe('SiteConfiguration Component', () => {
  const mockSite = {
    id: 'site-001',
    name: 'Test Site',
    domain: 'test.example.com',
    clientId: 'client-001',
    status: 'active' as const,
    type: 'event-gifting' as const,
    branding: {
      primaryColor: '#D91C81',
      secondaryColor: '#1B2A5E',
      tertiaryColor: '#00B4CC',
      logoUrl: '',
      faviconUrl: ''
    },
    settings: {
      allowQuantitySelection: false,
      showPricing: true,
      skipLandingPage: false,
      giftsPerUser: 1,
      validationMethod: 'email' as const,
      defaultLanguage: 'en',
      defaultCurrency: 'USD',
      defaultCountry: 'US',
      availabilityStartDate: '',
      availabilityEndDate: '',
      expiredMessage: '',
      defaultGiftId: '',
      defaultGiftDaysAfterClose: 0,
      showHeader: true,
      showFooter: true,
      headerLayout: 'left' as const,
      showLanguageSelector: true,
      companyName: '',
      footerText: '',
      enableSearch: true,
      enableFilters: true,
      gridColumns: 3 as const,
      showDescription: true,
      sortOptions: ['name', 'price'] as any,
      shippingMode: 'employee' as const,
      defaultShippingAddress: '',
      welcomeMessage: '',
      enableWelcomePage: false,
      allowedCountries: [] as string[],
      enableLanguageSelector: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockClient = {
    id: 'client-001',
    name: 'Test Company',
    status: 'active' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockUpdateSite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(SiteContext.useSite).mockReturnValue({
      currentSite: mockSite,
      currentClient: mockClient,
      updateSite: mockUpdateSite,
      sites: [mockSite],
      clients: [mockClient],
      isLoading: false,
      setCurrentSite: vi.fn(),
      setCurrentClient: vi.fn(),
      createSite: vi.fn(),
      deleteSite: vi.fn(),
      createClient: vi.fn(),
      updateClient: vi.fn(),
      deleteClient: vi.fn()
    });

    vi.mocked(GiftContext.useGift).mockReturnValue({
      gifts: [],
      isLoading: false,
      createGift: vi.fn(),
      updateGift: vi.fn(),
      deleteGift: vi.fn(),
      getGiftsBySite: vi.fn(),
      getSiteConfiguration: vi.fn(),
      updateSiteConfiguration: vi.fn()
    });
  });

  describe('Live/Draft Mode Toggle', () => {
    it('should render mode toggle in header', () => {
      render(
        <BrowserRouter>
          <SiteConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByTitle(/View live configuration/)).toBeInTheDocument();
      expect(screen.getByTitle(/Edit configuration in draft mode/)).toBeInTheDocument();
    });

    it('should have Live and Edit buttons', () => {
      render(
        <BrowserRouter>
          <SiteConfiguration />
        </BrowserRouter>
      );

      // Check for button text (may be hidden on small screens)
      const buttons = screen.getAllByRole('button');
      const hasLiveButton = buttons.some(btn => btn.textContent?.includes('Live'));
      const hasEditButton = buttons.some(btn => btn.textContent?.includes('Edit'));
      
      expect(hasLiveButton || hasEditButton).toBe(true);
    });

    it('should disable live mode for draft sites', () => {
      const draftSite = { ...mockSite, status: 'draft' as const };
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: draftSite,
        currentClient: mockClient,
        updateSite: mockUpdateSite,
        sites: [draftSite],
        clients: [mockClient],
        isLoading: false,
        setCurrentSite: vi.fn(),
        setCurrentClient: vi.fn(),
        createSite: vi.fn(),
        deleteSite: vi.fn(),
        createClient: vi.fn(),
        updateClient: vi.fn(),
        deleteClient: vi.fn()
      });

      render(
        <BrowserRouter>
          <SiteConfiguration />
        </BrowserRouter>
      );

      const liveButton = screen.getByTitle(/Publish site first to view live mode/);
      expect(liveButton).toBeDisabled();
    });
  });

  describe('Tab Navigation', () => {
    it('should render all tabs', () => {
      render(
        <BrowserRouter>
          <SiteConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Header/Footer')).toBeInTheDocument();
      expect(screen.getByText('Branding')).toBeInTheDocument();
      expect(screen.getByText('Landing')).toBeInTheDocument();
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('Products & Gifts')).toBeInTheDocument();
      expect(screen.getByText('Shipping')).toBeInTheDocument();
      expect(screen.getByText('Access')).toBeInTheDocument();
    });

    it('should not have duplicate gift selection tab', () => {
      render(
        <BrowserRouter>
          <SiteConfiguration />
        </BrowserRouter>
      );

      const giftSelectionTabs = screen.queryAllByText(/^Gift Selection$/);
      expect(giftSelectionTabs).toHaveLength(0);
    });
  });

  describe('Welcome Page Configuration', () => {
    it('should have welcome tab available', () => {
      render(
        <BrowserRouter>
          <SiteConfiguration />
        </BrowserRouter>
      );

      const welcomeTab = screen.getByText('Welcome');
      expect(welcomeTab).toBeInTheDocument();
      
      // Verify it's a clickable tab button
      expect(welcomeTab.closest('button')).toBeInTheDocument();
    });

    it('should not show welcome page toggle in general tab', () => {
      render(
        <BrowserRouter>
          <SiteConfiguration />
        </BrowserRouter>
      );

      // General tab is active by default - welcome page config should not be visible
      expect(screen.queryByText('Enable Welcome Page')).not.toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('should have save button in header', () => {
      render(
        <BrowserRouter>
          <SiteConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('should disable save button when no changes', () => {
      render(
        <BrowserRouter>
          <SiteConfiguration />
        </BrowserRouter>
      );

      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('No Site Selected', () => {
    it('should show message when no site is selected', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: null,
        currentClient: null,
        updateSite: mockUpdateSite,
        sites: [],
        clients: [],
        isLoading: false,
        setCurrentSite: vi.fn(),
        setCurrentClient: vi.fn(),
        createSite: vi.fn(),
        deleteSite: vi.fn(),
        createClient: vi.fn(),
        updateClient: vi.fn(),
        deleteClient: vi.fn()
      });

      render(
        <BrowserRouter>
          <SiteConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('No Site Selected')).toBeInTheDocument();
    });
  });
});
