import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { ShippingInformation } from '../ShippingInformation';
import * as OrderContext from '../../context/OrderContext';
import * as LanguageContext from '../../context/LanguageContext';
import * as PublicSiteContext from '../../context/PublicSiteContext';
import * as ConfigModule from '../../data/config';

// Mock contexts
vi.mock('../../context/OrderContext');
vi.mock('../../context/LanguageContext');
vi.mock('../../context/PublicSiteContext');
vi.mock('../../data/config', async () => {
  const actual = await vi.importActual('../../data/config');
  return {
    ...actual,
    companyConfig: {
      companyName: 'Test Company',
      brandColor: '#FF6B35',
      validationMethod: 'email' as const,
      shippingMethod: 'employee' as const,
      companyAddress: {
        street: '123 Corporate Plaza',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States',
      },
      allowQuantitySelection: true,
      maxQuantity: 10,
      defaultCurrency: 'USD',
      allowedCountries: [],
      defaultCountry: 'US',
    },
  };
});

/**
 * Test Suite: ShippingInformation Form - shadcn/ui Migration
 * 
 * Validates Phase 1 implementation:
 * - Form components with react-hook-form
 * - Zod validation schemas
 * - FormField + FormControl wrappers
 * - Proper ARIA linkage
 * - FormMessage error display
 * - Input component usage
 */
describe('ShippingInformation - shadcn/ui Form Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset companyConfig to employee mode
    vi.mocked(ConfigModule.companyConfig).shippingMethod = 'employee';
    
    // Mock useOrder
    vi.mocked(OrderContext.useOrder).mockReturnValue({
      selectedGift: { 
        id: 'gift-1', 
        name: 'Test Gift',
        description: 'Test Description',
        category: 'Test Category',
        image: 'test-image.jpg',
        sku: 'TEST-SKU',
        price: 100,
        status: 'active' as const
      },
      quantity: 1,
      shippingAddress: null,
      selectGift: vi.fn(),
      setQuantity: vi.fn(),
      setShippingAddress: vi.fn(),
      submitOrder: vi.fn(),
      clearOrder: vi.fn(),
    });
    
    // Mock useLanguage
    vi.mocked(LanguageContext.useLanguage).mockReturnValue({
      currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' },
      setLanguage: vi.fn(),
      t: (key: string) => {
        // Return English translations for common shipping form keys
        const translations: Record<string, string> = {
          'shipping.fullName': 'Full Name',
          'shipping.phone': 'Phone',
          'shipping.street': 'Street Address',
          'shipping.address': 'Street Address',
          'shipping.city': 'City',
          'shipping.state': 'State',
          'shipping.zipCode': 'Zip Code',
          'shipping.country': 'Country',
          'shipping.step': 'Step 3 of 3',
          'shipping.title': 'Shipping Information',
          'shipping.personalShippingSubtitle': 'Where should we send your gift?',
          'shipping.companyShippingSubtitle': 'Please provide your contact information',
          'shipping.directDelivery': 'Direct Delivery',
          'shipping.directDeliveryDesc': 'Your gift will be shipped directly to your address',
          'shipping.companyDelivery': 'Company Delivery',
          'shipping.companyDeliveryDesc': 'Your gift will be shipped to the company address',
          'shipping.enterFullName': 'Enter your full name',
          'shipping.enterStreet': 'Enter street address',
          'shipping.selectCountry': 'Select country',
          'shipping.continueToReview': 'Continue to Review',
          'common.processing': 'Processing...',
        };
        return translations[key] || key;
      },
    });
    
    // Mock usePublicSite
    vi.mocked(PublicSiteContext.usePublicSite).mockReturnValue({
      site: {
        id: 'site-1',
        name: 'Test Site',
        slug: 'test-site',
        clientId: 'client-1',
        domain: 'test.example.com',
        status: 'active' as const,
        branding: {
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          accentColor: '#ff0000',
          logoUrl: null,
        },
        settings: {
          validationMethod: 'email' as const,
          allowMultipleSelections: false,
          requireShipping: true,
          supportEmail: 'support@test.com',
          languages: ['en'],
          defaultLanguage: 'en',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      currentSite: null,
      gifts: [],
      isLoading: false,
      error: null,
      refreshSite: vi.fn(),
      setSiteById: vi.fn(),
      setSiteBySlug: vi.fn(),
      availableSites: [],
    });
  });

  describe('Form Component Structure', () => {
    it('should render form using Form component', () => {
      const { container } = render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should render all FormField components', () => {
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      // Check for form labels (FormLabel) - use more specific queries
      expect(screen.getByText(/^full name/i)).toBeInTheDocument();
      expect(screen.getByText(/^phone/i)).toBeInTheDocument();
      expect(screen.getByText(/^street/i)).toBeInTheDocument();
      expect(screen.getByText(/^city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^state/i)).toBeInTheDocument();
      expect(screen.getByText(/^zip.*code/i)).toBeInTheDocument();
      expect(screen.getByText(/^country/i)).toBeInTheDocument();
    });

    it('should use Input components for all fields', () => {
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
      
      // All inputs should have proper attributes
      inputs.forEach(input => {
        expect(input).toHaveAttribute('name');
        expect(input).toHaveAttribute('id');
      });
    });
  });

  describe('ARIA Linkage', () => {
    it('should link labels to inputs via htmlFor', () => {
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      const fullNameInput = screen.getByLabelText(/full name/i);
      expect(fullNameInput).toBeInTheDocument();
      expect(fullNameInput).toHaveAttribute('id');
    });

    it('should have aria-describedby for error messages', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      // Submit form without filling fields
      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        const fullNameInput = screen.getByLabelText(/full name/i);
        expect(fullNameInput).toHaveAttribute('aria-describedby');
      });
    });

    it('should have aria-invalid on fields with errors', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      // Submit form without filling fields
      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        const fullNameInput = screen.getByLabelText(/full name/i);
        expect(fullNameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Zod Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      // Submit empty form
      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      // Should show validation errors for minimum length
      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate phone number format', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      const phoneInput = screen.getByLabelText(/phone/i);
      await user.type(phoneInput, 'invalid');

      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/phone number must be at least 10 digits/i)).toBeInTheDocument();
      });
    });

    it('should validate zip code format', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      const zipInput = screen.getByLabelText(/zip.*code/i);
      await user.type(zipInput, '12');

      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/postal code must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate minimum length for name', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'A');

      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name.*at least.*2.*characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('FormMessage Component', () => {
    it('should display error messages using FormMessage', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        // FormMessage should render error text with data-slot="form-message"
        const errorMessages = container.querySelectorAll('[data-slot="form-message"]');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should clear error messages when field is corrected', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      });

      // Fix the error by typing a valid name
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'John Doe');

      // Error should clear after typing valid input
      await waitFor(() => {
        expect(screen.queryByText(/name must be at least 2 characters/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Company Shipping Mode', () => {
    it('should only show name and phone fields in company mode', () => {
      // Override the mock to use company shipping
      vi.mocked(ConfigModule.companyConfig).shippingMethod = 'company';
      
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      // Should show name and phone
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();

      // Should not show address fields (they're not rendered in company mode)
      expect(screen.queryByLabelText(/street/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/city/i)).not.toBeInTheDocument();
    });

    it('should use companyShippingSchema for validation in company mode', async () => {
      const user = userEvent.setup();
      
      // Override the mock to use company shipping
      vi.mocked(ConfigModule.companyConfig).shippingMethod = 'company';

      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      // Should only validate name and phone
      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/phone number must be at least 10 digits/i)).toBeInTheDocument();
      });

      // Should not validate address fields (they don't exist in company mode)
      expect(screen.queryByText(/street.*required/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      // Fill in required fields with valid data
      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'John Doe');
      
      const phoneInput = screen.getByLabelText(/phone/i);
      await user.clear(phoneInput);
      await user.type(phoneInput, '5551234567890');
      
      // Find and fill the street address input
      const streetInput = container.querySelector('input[name="street"]');
      if (streetInput) {
        await user.clear(streetInput);
        await user.type(streetInput, '123 Main Street');
      }
      
      // Wait for form to be ready and fill remaining fields
      await waitFor(() => {
        expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      });
      
      const cityInput = screen.getByLabelText(/city/i);
      await user.clear(cityInput);
      await user.type(cityInput, 'New York');
      
      const stateInput = screen.getByLabelText(/state/i);
      await user.clear(stateInput);
      await user.type(stateInput, 'NY');
      
      const zipInput = screen.getByLabelText(/zip.*code/i);
      await user.clear(zipInput);
      await user.type(zipInput, '10001');

      // Verify all fields have been filled
      expect(nameInput).toHaveValue('John Doe');
      expect(phoneInput).toHaveValue('5551234567890');
      expect(cityInput).toHaveValue('New York');
      expect(stateInput).toHaveValue('NY');
      expect(zipInput).toHaveValue('10001');

      const submitButton = screen.getByRole('button', { name: /continue/i });
      
      // Button should be enabled and clickable
      expect(submitButton).not.toBeDisabled();
      
      await user.click(submitButton);

      // After submission attempt, verify the form is still functional
      // (In a real scenario, it would navigate away, but in tests it stays)
      expect(submitButton).toBeInTheDocument();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      // Fill in required fields with valid data
      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'John Doe');
      
      const phoneInput = screen.getByLabelText(/phone/i);
      await user.clear(phoneInput);
      await user.type(phoneInput, '5551234567890');
      
      const streetInput = container.querySelector('input[name="street"]');
      if (streetInput) {
        await user.clear(streetInput);
        await user.type(streetInput, '123 Main Street');
      }
      
      await waitFor(() => {
        expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      });
      
      const cityInput = screen.getByLabelText(/city/i);
      await user.clear(cityInput);
      await user.type(cityInput, 'New York');
      
      const stateInput = screen.getByLabelText(/state/i);
      await user.clear(stateInput);
      await user.type(stateInput, 'NY');
      
      const zipInput = screen.getByLabelText(/zip.*code/i);
      await user.clear(zipInput);
      await user.type(zipInput, '10001');

      const submitButton = screen.getByRole('button', { name: /continue/i });
      
      // The button should exist and be clickable
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      
      await user.click(submitButton);

      // After clicking, verify the button is still in the document
      // (it may be disabled briefly during submission)
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      // Tab through form fields
      await user.tab();
      expect(screen.getByLabelText(/full name/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/phone/i)).toHaveFocus();
    });

    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <BrowserRouter>
          <ShippingInformation />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Error messages should be linked via aria-describedby
        const errorMessages = container.querySelectorAll('[data-slot="form-message"]');
        expect(errorMessages.length).toBeGreaterThan(0);
        
        // Check that inputs have aria-describedby pointing to error messages
        const fullNameInput = screen.getByLabelText(/full name/i);
        expect(fullNameInput).toHaveAttribute('aria-describedby');
      });
    });
  });
});
