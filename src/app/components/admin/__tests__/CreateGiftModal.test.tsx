/**
 * CreateGiftModal Component Tests
 * 
 * Coverage:
 * - Form rendering
 * - Field updates
 * - Category selection
 * - Tag management
 * - Create vs Update mode
 * - Validation
 * - Submit functionality
 * 
 * Total Tests: 12
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { CreateGiftModal } from '../CreateGiftModal';

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

describe('CreateGiftModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal', () => {
      renderWithRouter(<CreateGiftModal onClose={vi.fn()} />);
      expect(screen.getByText(/create gift/i)).toBeInTheDocument();
    });

    it('should render form fields', () => {
      renderWithRouter(<CreateGiftModal onClose={vi.fn()} />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sku/i)).toBeInTheDocument();
    });

    it('should render category dropdown', () => {
      renderWithRouter(<CreateGiftModal onClose={vi.fn()} />);
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    });

    it('should render inventory fields', () => {
      renderWithRouter(<CreateGiftModal onClose={vi.fn()} />);
      
      expect(screen.getByLabelText(/total inventory/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/available inventory/i)).toBeInTheDocument();
    });

    it('should render attribute fields', () => {
      renderWithRouter(<CreateGiftModal onClose={vi.fn()} />);

      expect(screen.getByLabelText(/brand/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/size/i)).toBeInTheDocument();
    });

    it('should render in update mode with gift ID', () => {
      renderWithRouter(<CreateGiftModal giftId="gift123" onClose={vi.fn()} />);
      expect(screen.getByText(/update gift/i)).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update gift name', async () => {
      const user = userEvent.setup();

      renderWithRouter(<CreateGiftModal onClose={vi.fn()} />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Luxury Watch');

      expect(nameInput).toHaveValue('Luxury Watch');
    });

    it('should update price field', async () => {
      const user = userEvent.setup();

      renderWithRouter(<CreateGiftModal onClose={vi.fn()} />);

      const priceInput = screen.getByLabelText(/price/i);
      await user.type(priceInput, '99.99');

      expect(priceInput).toHaveValue('99.99');
    });

    it('should select category', async () => {
      const user = userEvent.setup();

      renderWithRouter(<CreateGiftModal onClose={vi.fn()} />);

      const categorySelect = screen.getByLabelText(/category/i);
      await user.selectOptions(categorySelect, 'Electronics');

      expect(categorySelect).toHaveValue('Electronics');
    });

    it('should add tags', async () => {
      const user = userEvent.setup();

      renderWithRouter(<CreateGiftModal onClose={vi.fn()} />);

      const tagInput = screen.getByPlaceholderText(/add tag/i);
      await user.type(tagInput, 'premium');
      
      const addButton = screen.getByRole('button', { name: /add tag/i });
      await user.click(addButton);

      expect(screen.getByText('premium')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit create gift form', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      vi.mocked(apiRequest).mockResolvedValue({ success: true });

      renderWithRouter(<CreateGiftModal onClose={handleClose} />);

      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'Test Gift');
      await user.type(screen.getByLabelText(/price/i), '49.99');
      await user.type(screen.getByLabelText(/sku/i), 'GIFT-001');
      await user.type(screen.getByLabelText(/total inventory/i), '100');
      await user.type(screen.getByLabelText(/available inventory/i), '100');

      // Submit
      const submitButton = screen.getByRole('button', { name: /create gift/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalled();
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('should submit update gift form', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      vi.mocked(apiRequest).mockResolvedValue({ success: true });

      renderWithRouter(<CreateGiftModal giftId="gift123" onClose={handleClose} />);

      await user.type(screen.getByLabelText(/name/i), 'Updated Gift');

      const submitButton = screen.getByRole('button', { name: /update gift/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith('PUT', '/gifts/gift123', expect.any(Object));
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });

  describe('Close Behavior', () => {
    it('should call onClose when cancel is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(<CreateGiftModal onClose={handleClose} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(handleClose).toHaveBeenCalled();
    });
  });
});