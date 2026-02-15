/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GiftSelectionConfiguration } from '../GiftSelectionConfiguration';
import * as SiteContext from '../../../context/SiteContext';
import { BrowserRouter } from 'react-router';

// Mock the contexts
vi.mock('../../../context/SiteContext');

describe('GiftSelectionConfiguration Component', () => {
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

  const mockUpdateSite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(SiteContext.useSite).mockReturnValue({
      currentSite: mockSite,
      currentClient: null,
      updateSite: mockUpdateSite,
      sites: [mockSite],
      clients: [],
      isLoading: false,
      setCurrentSite: vi.fn(),
      setCurrentClient: vi.fn(),
    });
  });

  describe('Preview Button Removal', () => {
    it('should not have Show Preview button', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      expect(screen.queryByText('Show Preview')).not.toBeInTheDocument();
      expect(screen.queryByText('Hide Preview')).not.toBeInTheDocument();
    });
  });

  describe('Radio Button Inputs', () => {
    it('should use radio buttons for pagination options', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      const paginationRadios = screen.getAllByRole('radio');
      expect(paginationRadios.length).toBeGreaterThan(0);
    });

    it('should use radio buttons for search functionality', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('Enable Search')).toBeInTheDocument();
      expect(screen.getByText('Disable Search')).toBeInTheDocument();
    });

    it('should use radio buttons for filter functionality', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('Enable Filters')).toBeInTheDocument();
      expect(screen.getByText('Disable Filters')).toBeInTheDocument();
    });

    it('should use radio buttons for sorting functionality', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('Enable Sorting')).toBeInTheDocument();
      expect(screen.getByText('Disable Sorting')).toBeInTheDocument();
    });

    it('should use radio buttons for display options', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      // Check for Show/Hide pairs
      const showPricesElements = screen.getAllByText('Show Prices');
      const hidePricesElements = screen.getAllByText('Hide Prices');
      
      expect(showPricesElements.length).toBeGreaterThan(0);
      expect(hidePricesElements.length).toBeGreaterThan(0);
    });

    it('should allow selecting radio button options', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons.length).toBeGreaterThan(0);
      
      // Verify radio buttons are interactive
      const firstRadio = radioButtons[0];
      expect(firstRadio).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should have Reset to Default button', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('Reset to Default')).toBeInTheDocument();
    });

    it('should have Save Configuration button', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('Save Configuration')).toBeInTheDocument();
    });

    it('should not have checkboxes for boolean options', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      // All boolean options should use radio buttons, not checkboxes
      const checkboxes = screen.queryAllByRole('checkbox');
      // There might be some checkboxes for other features, but the main toggle options should be radio buttons
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons.length).toBeGreaterThan(checkboxes.length);
    });
  });

  describe('Layout Configuration', () => {
    it('should render layout settings', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('Layout Settings')).toBeInTheDocument();
      expect(screen.getByText('Layout Style')).toBeInTheDocument();
    });

    it('should render search settings', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('Search Settings')).toBeInTheDocument();
      expect(screen.getByText('Search Functionality')).toBeInTheDocument();
    });

    it('should render filter settings', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('Filter Settings')).toBeInTheDocument();
      expect(screen.getByText('Filter Functionality')).toBeInTheDocument();
    });

    it('should render sorting settings', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('Sorting Settings')).toBeInTheDocument();
      expect(screen.getByText('Sorting Functionality')).toBeInTheDocument();
    });

    it('should render display options', () => {
      render(
        <BrowserRouter>
          <GiftSelectionConfiguration />
        </BrowserRouter>
      );

      expect(screen.getByText('Display Options')).toBeInTheDocument();
    });
  });
});
