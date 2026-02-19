/**
 * ClientConfiguration Component Tests
 * 
 * Tests for the ClientConfiguration page component
 * Covers form rendering, field updates, validation, and save operations
 * 
 * Created: February 18, 2026
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { ClientConfiguration } from '../ClientConfiguration';
import * as apiUtils from '../../../utils/api';

// Mock the API utilities
vi.mock('../../../utils/api', () => ({
  apiRequest: vi.fn(),
}));

// Mock the error handling utilities
vi.mock('../../../utils/errorHandling', () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

// Mock the validation utilities
vi.mock('../../../utils/clientConfigValidation', () => ({
  validateClientConfiguration: vi.fn(() => ({
    valid: true,
    errors: [],
    fieldErrors: {},
    warnings: []
  })),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockClient = {
  id: 'client-123',
  name: 'Test Client',
  description: 'Test Description',
  contactEmail: 'contact@test.com',
  status: 'active',
  clientCode: 'TEST-001',
  clientRegion: 'US/CA',
  clientSourceCode: 'SRC-001',
  clientContactName: 'John Doe',
  clientContactPhone: '(555) 123-4567',
  clientTaxId: '12-3456789',
  clientAddressLine1: '123 Main St',
  clientAddressLine2: 'Suite 100',
  clientAddressLine3: '',
  clientCity: 'San Francisco',
  clientPostalCode: '94102',
  clientCountryState: 'CA',
  clientCountry: 'US',
  clientAccountManager: 'Sarah Williams',
  clientAccountManagerEmail: 'sarah@halo.com',
  clientImplementationManager: 'Michael Chen',
  clientImplementationManagerEmail: 'michael@halo.com',
  technologyOwner: 'Alex Johnson',
  technologyOwnerEmail: 'alex@halo.com',
  clientUrl: 'https://www.test.com',
  clientCustomUrl: 'https://gifts.test.com',
  clientAllowSessionTimeoutExtend: true,
  clientAuthenticationMethod: 'SSO',
  clientHasEmployeeData: true,
  clientInvoiceType: 'Client',
  clientInvoiceTemplateType: 'US',
  clientPoType: 'Standard',
  clientPoNumber: 'PO-2026-001',
  clientErpSystem: 'SAP',
  clientSso: 'Azure',
  clientHrisSystem: 'Workday',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
};

function renderClientConfiguration(clientId = 'client-123') {
  return render(
    <MemoryRouter initialEntries={[`/admin/clients/${clientId}/configuration`]}>
      <Routes>
        <Route path="/admin/clients/:clientId/configuration" element={<ClientConfiguration />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ClientConfiguration Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiUtils.apiRequest as any).mockResolvedValue({
      success: true,
      data: mockClient,
    });
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      renderClientConfiguration();
      expect(screen.getByText(/Loading client configuration/i)).toBeInTheDocument();
    });

    it('should render all 6 tabs', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByText('General')).toBeInTheDocument();
      });

      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('Account Team')).toBeInTheDocument();
      expect(screen.getByText('App Settings')).toBeInTheDocument();
      expect(screen.getByText('Billing')).toBeInTheDocument();
      expect(screen.getByText('Integrations')).toBeInTheDocument();
    });

    it('should display client name in header', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByText('Test Client')).toBeInTheDocument();
      });
    });

    it('should render save button', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load client data on mount', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(apiUtils.apiRequest).toHaveBeenCalledWith('/v2/clients/client-123');
      });
    });

    it('should populate form fields with loaded data', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('Test Client');
        expect(nameInput).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('TEST-001')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      (apiUtils.apiRequest as any).mockRejectedValue(new Error('API Error'));
      
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(apiUtils.apiRequest).toHaveBeenCalled();
      });
    });
  });

  describe('Form Interactions', () => {
    it('should enable save button when changes are made', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Test Client');
      fireEvent.change(nameInput, { target: { value: 'Updated Client' } });

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /Save Changes/i });
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('should show unsaved changes badge when form is dirty', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Test Client');
      fireEvent.change(nameInput, { target: { value: 'Updated Client' } });

      await waitFor(() => {
        expect(screen.getByText(/Unsaved Changes/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Address tab when clicked', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByText('General')).toBeInTheDocument();
      });

      const addressTab = screen.getByText('Address');
      fireEvent.click(addressTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/Address Line 1/i)).toBeInTheDocument();
      });
    });

    it('should preserve form data when switching tabs', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
      });

      // Change name in General tab
      const nameInput = screen.getByDisplayValue('Test Client');
      fireEvent.change(nameInput, { target: { value: 'Updated Client' } });

      // Switch to Address tab
      const addressTab = screen.getByText('Address');
      fireEvent.click(addressTab);

      // Switch back to General tab
      const generalTab = screen.getByText('General');
      fireEvent.click(generalTab);

      // Verify name change is preserved
      await waitFor(() => {
        expect(screen.getByDisplayValue('Updated Client')).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('should call API with updated data when save is clicked', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Test Client');
      fireEvent.change(nameInput, { target: { value: 'Updated Client' } });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(apiUtils.apiRequest).toHaveBeenCalledWith(
          '/v2/clients/client-123',
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('Updated Client'),
          })
        );
      });
    });

    it('should show loading state while saving', async () => {
      (apiUtils.apiRequest as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Test Client');
      fireEvent.change(nameInput, { target: { value: 'Updated Client' } });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
    });

    it('should clear dirty state after successful save', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Test Client');
      fireEvent.change(nameInput, { target: { value: 'Updated Client' } });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByText(/Unsaved Changes/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Field-Specific Tests', () => {
    it('should render all basic info fields', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Client Name/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Client Code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Client Region/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Source Code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tax ID/i)).toBeInTheDocument();
    });

    it('should render contact fields', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Contact Name/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Contact Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contact Phone/i)).toBeInTheDocument();
    });

    it('should render status dropdown with correct value', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        const statusSelect = screen.getByLabelText(/Status/i);
        expect(statusSelect).toHaveValue('active');
      });
    });
  });

  describe('Address Tab', () => {
    it('should render all address fields', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByText('Address')).toBeInTheDocument();
      });

      const addressTab = screen.getByText('Address');
      fireEvent.click(addressTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/Address Line 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Address Line 2/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/State\/Province/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Postal Code/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
      });
    });
  });

  describe('Account Team Tab', () => {
    it('should render all account team fields', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByText('Account Team')).toBeInTheDocument();
      });

      const accountTab = screen.getByText('Account Team');
      fireEvent.click(accountTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/Account Manager Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Account Manager Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Implementation Manager Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Technology Owner Name/i)).toBeInTheDocument();
      });
    });
  });

  describe('App Settings Tab', () => {
    it('should render all app settings fields', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByText('App Settings')).toBeInTheDocument();
      });

      const appTab = screen.getByText('App Settings');
      fireEvent.click(appTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/Client URL/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Custom Domain URL/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Authentication Method/i)).toBeInTheDocument();
      });
    });

    it('should render boolean toggles for app settings', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByText('App Settings')).toBeInTheDocument();
      });

      const appTab = screen.getByText('App Settings');
      fireEvent.click(appTab);

      await waitFor(() => {
        expect(screen.getByText(/4-Hour Session Timeout/i)).toBeInTheDocument();
        expect(screen.getByText(/Has Employee Data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Billing Tab', () => {
    it('should render all billing fields', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByText('Billing')).toBeInTheDocument();
      });

      const billingTab = screen.getByText('Billing');
      fireEvent.click(billingTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/Invoice Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Invoice Template Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/PO Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/PO Number/i)).toBeInTheDocument();
      });
    });
  });

  describe('Integrations Tab', () => {
    it('should render all integration fields', async () => {
      renderClientConfiguration();
      
      await waitFor(() => {
        expect(screen.getByText('Integrations')).toBeInTheDocument();
      });

      const integrationsTab = screen.getByText('Integrations');
      fireEvent.click(integrationsTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/ERP System/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/SSO Provider/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/HRIS System/i)).toBeInTheDocument();
      });
    });
  });
});
