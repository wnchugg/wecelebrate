/**
 * Client Modal Form State Preservation Tests
 * Feature: client-v2-field-audit
 * Tests for form state preservation across tab navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import { ClientModal } from '../ClientModal';

describe('Client Modal Form State Preservation', () => {
  
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 6: Form State Preservation Across Navigation', () => {
    /**
     * Feature: client-v2-field-audit, Property 6: Form State Preservation Across Navigation
     * Validates: Requirements 3.5
     * 
     * For any form state with populated fields, navigating between tabs
     * and back should preserve all field values without data loss.
     */
    it('should preserve all field values when navigating between tabs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 2, maxLength: 50 }),
            contactEmail: fc.emailAddress(),
            clientCode: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
            clientRegion: fc.option(fc.constantFrom('US/CA', 'EMEA', 'APAC', 'LATAM', 'Global'), { nil: undefined }),
            clientContactName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
            clientContactPhone: fc.option(
              fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '-', '(', ')', '+'), { minLength: 10, maxLength: 15 })
                .map(arr => arr.join('')),
              { nil: undefined }
            ),
            clientAddressLine1: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
            clientCity: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
            clientAccountManager: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
            clientUrl: fc.option(fc.webUrl(), { nil: undefined }),
            clientInvoiceType: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
          }),
          async (formData) => {
            const { container } = render(
              <ClientModal
                open={true}
                onClose={mockOnClose}
                client={null}
                onSave={mockOnSave}
              />
            );

            // Fill in Basic Info tab
            const nameInput = screen.getByLabelText(/Client Name/i);
            const emailInput = screen.getByLabelText(/Contact Email/i);
            
            fireEvent.change(nameInput, { target: { value: formData.name } });
            fireEvent.change(emailInput, { target: { value: formData.contactEmail } });
            
            if (formData.clientCode) {
              const codeInput = screen.getByLabelText(/Client Code/i);
              fireEvent.change(codeInput, { target: { value: formData.clientCode } });
            }

            // Navigate to Contact tab
            const contactTab = screen.getByRole('tab', { name: /Contact/i });
            fireEvent.click(contactTab);
            
            await waitFor(() => {
              expect(screen.getByLabelText(/Contact Name/i)).toBeInTheDocument();
            });

            // Fill in Contact tab
            if (formData.clientContactName) {
              const contactNameInput = screen.getByLabelText(/Contact Name/i);
              fireEvent.change(contactNameInput, { target: { value: formData.clientContactName } });
            }
            
            if (formData.clientContactPhone) {
              const phoneInput = screen.getByLabelText(/Contact Phone/i);
              fireEvent.change(phoneInput, { target: { value: formData.clientContactPhone } });
            }

            // Navigate to Address tab
            const addressTab = screen.getByRole('tab', { name: /Address/i });
            fireEvent.click(addressTab);
            
            await waitFor(() => {
              expect(screen.getByLabelText(/Address Line 1/i)).toBeInTheDocument();
            });

            // Fill in Address tab
            if (formData.clientAddressLine1) {
              const addressInput = screen.getByLabelText(/Address Line 1/i);
              fireEvent.change(addressInput, { target: { value: formData.clientAddressLine1 } });
            }
            
            if (formData.clientCity) {
              const cityInput = screen.getByLabelText(/City/i);
              fireEvent.change(cityInput, { target: { value: formData.clientCity } });
            }

            // Navigate to Account Management tab
            const accountTab = screen.getByRole('tab', { name: /Account Management/i });
            fireEvent.click(accountTab);
            
            await waitFor(() => {
              expect(screen.getByLabelText(/Account Manager/i)).toBeInTheDocument();
            });

            // Fill in Account Management tab
            if (formData.clientAccountManager) {
              const accountManagerInput = screen.getByLabelText(/^Account Manager$/i);
              fireEvent.change(accountManagerInput, { target: { value: formData.clientAccountManager } });
            }

            // Navigate to App Settings tab
            const appTab = screen.getByRole('tab', { name: /App Settings/i });
            fireEvent.click(appTab);
            
            await waitFor(() => {
              expect(screen.getByLabelText(/Client URL/i)).toBeInTheDocument();
            });

            // Fill in App Settings tab
            if (formData.clientUrl) {
              const urlInput = screen.getByLabelText(/Client URL/i);
              fireEvent.change(urlInput, { target: { value: formData.clientUrl } });
            }

            // Navigate to Billing & Integrations tab
            const billingTab = screen.getByRole('tab', { name: /Billing & Integrations/i });
            fireEvent.click(billingTab);
            
            await waitFor(() => {
              expect(screen.getByLabelText(/Invoice Type/i)).toBeInTheDocument();
            });

            // Fill in Billing & Integrations tab
            if (formData.clientInvoiceType) {
              const invoiceTypeInput = screen.getByLabelText(/Invoice Type/i);
              fireEvent.change(invoiceTypeInput, { target: { value: formData.clientInvoiceType } });
            }

            // Navigate back to Basic Info tab
            const basicTab = screen.getByRole('tab', { name: /Basic Info/i });
            fireEvent.click(basicTab);
            
            await waitFor(() => {
              expect(screen.getByLabelText(/Client Name/i)).toBeInTheDocument();
            });

            // Verify Basic Info fields are preserved
            const nameInputAfter = screen.getByLabelText(/Client Name/i);
            const emailInputAfter = screen.getByLabelText(/Contact Email/i);
            
            expect(nameInputAfter.value).toBe(formData.name);
            expect(emailInputAfter.value).toBe(formData.contactEmail);
            
            if (formData.clientCode) {
              const codeInputAfter = screen.getByLabelText(/Client Code/i);
              expect(codeInputAfter.value).toBe(formData.clientCode);
            }

            // Navigate back to Contact tab and verify
            fireEvent.click(contactTab);
            
            await waitFor(() => {
              expect(screen.getByLabelText(/Contact Name/i)).toBeInTheDocument();
            });

            if (formData.clientContactName) {
              const contactNameInputAfter = screen.getByLabelText(/Contact Name/i);
              expect(contactNameInputAfter.value).toBe(formData.clientContactName);
            }
            
            if (formData.clientContactPhone) {
              const phoneInputAfter = screen.getByLabelText(/Contact Phone/i);
              expect(phoneInputAfter.value).toBe(formData.clientContactPhone);
            }

            // Navigate back to Address tab and verify
            fireEvent.click(addressTab);
            
            await waitFor(() => {
              expect(screen.getByLabelText(/Address Line 1/i)).toBeInTheDocument();
            });

            if (formData.clientAddressLine1) {
              const addressInputAfter = screen.getByLabelText(/Address Line 1/i);
              expect(addressInputAfter.value).toBe(formData.clientAddressLine1);
            }
            
            if (formData.clientCity) {
              const cityInputAfter = screen.getByLabelText(/City/i);
              expect(cityInputAfter.value).toBe(formData.clientCity);
            }

            // Navigate back to Account Management tab and verify
            fireEvent.click(accountTab);
            
            await waitFor(() => {
              expect(screen.getByLabelText(/Account Manager/i)).toBeInTheDocument();
            });

            if (formData.clientAccountManager) {
              const accountManagerInputAfter = screen.getByLabelText(/^Account Manager$/i);
              expect(accountManagerInputAfter.value).toBe(formData.clientAccountManager);
            }

            // Navigate back to App Settings tab and verify
            fireEvent.click(appTab);
            
            await waitFor(() => {
              expect(screen.getByLabelText(/Client URL/i)).toBeInTheDocument();
            });

            if (formData.clientUrl) {
              const urlInputAfter = screen.getByLabelText(/Client URL/i);
              expect(urlInputAfter.value).toBe(formData.clientUrl);
            }

            // Navigate back to Billing & Integrations tab and verify
            fireEvent.click(billingTab);
            
            await waitFor(() => {
              expect(screen.getByLabelText(/Invoice Type/i)).toBeInTheDocument();
            });

            if (formData.clientInvoiceType) {
              const invoiceTypeInputAfter = screen.getByLabelText(/Invoice Type/i);
              expect(invoiceTypeInputAfter.value).toBe(formData.clientInvoiceType);
            }
          }
        ),
        { numRuns: 10 } // Reduced runs for UI tests
      );
    });
  });

  // ===== Unit Tests for Specific Tab Navigation Scenarios =====
  
  describe('Tab Navigation - Specific Examples', () => {
    it('should preserve name and email when navigating from Basic Info to Contact and back', async () => {
      render(
        <ClientModal
          open={true}
          onClose={mockOnClose}
          client={null}
          onSave={mockOnSave}
        />
      );

      // Fill in Basic Info
      const nameInput = screen.getByLabelText(/Client Name/i);
      const emailInput = screen.getByLabelText(/Contact Email/i);
      
      fireEvent.change(nameInput, { target: { value: 'Test Client' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      // Navigate to Contact tab
      const contactTab = screen.getByRole('tab', { name: /Contact/i });
      fireEvent.click(contactTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Contact Name/i)).toBeInTheDocument();
      });

      // Navigate back to Basic Info
      const basicTab = screen.getByRole('tab', { name: /Basic Info/i });
      fireEvent.click(basicTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Client Name/i)).toBeInTheDocument();
      });

      // Verify values are preserved
      const nameInputAfter = screen.getByLabelText(/Client Name/i);
      const emailInputAfter = screen.getByLabelText(/Contact Email/i);
      
      expect(nameInputAfter.value).toBe('Test Client');
      expect(emailInputAfter.value).toBe('test@example.com');
    });

    it('should preserve address fields when navigating to other tabs and back', async () => {
      render(
        <ClientModal
          open={true}
          onClose={mockOnClose}
          client={null}
          onSave={mockOnSave}
        />
      );

      // Navigate to Address tab
      const addressTab = screen.getByRole('tab', { name: /Address/i });
      fireEvent.click(addressTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Address Line 1/i)).toBeInTheDocument();
      });

      // Fill in address fields
      const addressInput = screen.getByLabelText(/Address Line 1/i);
      const cityInput = screen.getByLabelText(/City/i);
      
      fireEvent.change(addressInput, { target: { value: '123 Main St' } });
      fireEvent.change(cityInput, { target: { value: 'New York' } });

      // Navigate to Billing tab
      const billingTab = screen.getByRole('tab', { name: /Billing & Integrations/i });
      fireEvent.click(billingTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Invoice Type/i)).toBeInTheDocument();
      });

      // Navigate back to Address tab
      fireEvent.click(addressTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Address Line 1/i)).toBeInTheDocument();
      });

      // Verify values are preserved
      const addressInputAfter = screen.getByLabelText(/Address Line 1/i);
      const cityInputAfter = screen.getByLabelText(/City/i);
      
      expect(addressInputAfter.value).toBe('123 Main St');
      expect(cityInputAfter.value).toBe('New York');
    });

    it('should preserve all fields across multiple tab navigations', async () => {
      render(
        <ClientModal
          open={true}
          onClose={mockOnClose}
          client={null}
          onSave={mockOnSave}
        />
      );

      // Fill Basic Info
      const nameInput = screen.getByLabelText(/Client Name/i);
      fireEvent.change(nameInput, { target: { value: 'Acme Corp' } });

      // Navigate to Contact and fill
      const contactTab = screen.getByRole('tab', { name: /Contact/i });
      fireEvent.click(contactTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Contact Name/i)).toBeInTheDocument();
      });
      
      const contactNameInput = screen.getByLabelText(/Contact Name/i);
      fireEvent.change(contactNameInput, { target: { value: 'John Doe' } });

      // Navigate to App Settings and fill
      const appTab = screen.getByRole('tab', { name: /App Settings/i });
      fireEvent.click(appTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Client URL/i)).toBeInTheDocument();
      });
      
      const urlInput = screen.getByLabelText(/Client URL/i);
      fireEvent.change(urlInput, { target: { value: 'https://acme.com' } });

      // Navigate back to Basic Info and verify
      const basicTab = screen.getByRole('tab', { name: /Basic Info/i });
      fireEvent.click(basicTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Client Name/i)).toBeInTheDocument();
      });
      
      const nameInputAfter = screen.getByLabelText(/Client Name/i);
      expect(nameInputAfter.value).toBe('Acme Corp');

      // Navigate back to Contact and verify
      fireEvent.click(contactTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Contact Name/i)).toBeInTheDocument();
      });
      
      const contactNameInputAfter = screen.getByLabelText(/Contact Name/i);
      expect(contactNameInputAfter.value).toBe('John Doe');

      // Navigate back to App Settings and verify
      fireEvent.click(appTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Client URL/i)).toBeInTheDocument();
      });
      
      const urlInputAfter = screen.getByLabelText(/Client URL/i);
      expect(urlInputAfter.value).toBe('https://acme.com');
    });
  });
});
