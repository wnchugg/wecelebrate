/**
 * CreateSiteModal Component Tests
 * 
 * Coverage:
 * - Form rendering
 * - Field validation
 * - Template selection
 * - Validation method options
 * - Shipping mode options
 * - Submit functionality
 * - Loading state
 * 
 * Total Tests: 13
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { CreateSiteModal } from '../CreateSiteModal';

// Mock utilities
vi.mock('../../../utils/api', () => ({
  apiRequest: vi.fn(),
}));

vi.mock('../../../utils/errorHandling', () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

vi.mock('../../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { apiRequest } from '../../../utils/api';
import type { Client } from '../../../types/api.types';

const mockClients: Client[] = [
  {
    id: 'client1',
    name: 'Acme Corp',
    contactEmail: 'contact@acmecorp.com',
    status: 'active' as const,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'client2',
    name: 'TechCo',
    contactEmail: 'info@techco.com',
    status: 'active' as const,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('CreateSiteModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when open', () => {
      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      expect(screen.getByText(/create new site/i)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      renderWithRouter(
        <CreateSiteModal
          isOpen={false}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      expect(screen.queryByText(/create new site/i)).not.toBeInTheDocument();
    });

    it('should render form fields', () => {
      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      expect(screen.getByLabelText(/site name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/domain/i)).toBeInTheDocument();
    });

    it('should render template options', () => {
      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      expect(screen.getByText('Event Gifting')).toBeInTheDocument();
      expect(screen.getByText('Service Awards')).toBeInTheDocument();
      expect(screen.getByText('Hybrid')).toBeInTheDocument();
    });

    it('should render validation method options', () => {
      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      expect(screen.getByLabelText(/validation method/i)).toBeInTheDocument();
    });

    it('should render shipping mode options', () => {
      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      expect(screen.getByLabelText(/shipping mode/i)).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update site name field', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      const nameInput = screen.getByLabelText(/site name/i);
      await user.type(nameInput, 'New Site');

      expect(nameInput).toHaveValue('New Site');
    });

    it('should select client', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      const clientSelect = screen.getByLabelText(/client/i);
      await user.selectOptions(clientSelect, 'client1');

      expect(clientSelect).toHaveValue('client1');
    });

    it('should select template', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      const serviceAwardsTemplate = screen.getByText('Service Awards');
      await user.click(serviceAwardsTemplate);

      // Template should be visually selected
      expect(serviceAwardsTemplate.closest('button')).toHaveClass('ring-2');
    });
  });

  describe('Form Submission', () => {
    it('should call onSuccess after successful submission', async () => {
      const handleSuccess = vi.fn();
      const user = userEvent.setup();

      vi.mocked(apiRequest).mockResolvedValue({ success: true });

      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={handleSuccess}
          clients={mockClients}
        />
      );

      // Fill form
      const nameInput = screen.getByLabelText(/site name/i);
      await user.type(nameInput, 'Test Site');

      const clientSelect = screen.getByLabelText(/client/i);
      await user.selectOptions(clientSelect, 'client1');

      const domainInput = screen.getByLabelText(/domain/i);
      await user.type(domainInput, 'test-site');

      // Submit
      const submitButton = screen.getByRole('button', { name: /create site/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();

      vi.mocked(apiRequest).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      // Fill required fields
      const nameInput = screen.getByLabelText(/site name/i);
      await user.type(nameInput, 'Test Site');

      const submitButton = screen.getByRole('button', { name: /create site/i });
      await user.click(submitButton);

      expect(screen.getByText(/creating/i)).toBeInTheDocument();
    });

    it('should handle submission error', async () => {
      const user = userEvent.setup();

      vi.mocked(apiRequest).mockRejectedValue(new Error('API Error'));

      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      const nameInput = screen.getByLabelText(/site name/i);
      await user.type(nameInput, 'Test Site');

      const submitButton = screen.getByRole('button', { name: /create site/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create site/i })).not.toBeDisabled();
      });
    });
  });

  describe('Close Behavior', () => {
    it('should call onClose when cancel is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <CreateSiteModal
          isOpen={true}
          onClose={handleClose}
          onSuccess={vi.fn()}
          clients={mockClients}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(handleClose).toHaveBeenCalled();
    });
  });
});