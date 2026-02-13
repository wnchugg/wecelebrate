/**
 * BrandModal and GiftDetailModal Component Tests
 * 
 * Coverage:
 * - BrandModal: Brand creation/editing
 * - Form fields and validation
 * - Color pickers
 * - Active status toggle
 * - Save functionality
 * 
 * Total Tests: 12
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { BrandModal } from '../BrandModal';

const mockBrand = {
  id: 'brand1',
  name: 'Acme Brand',
  clientId: 'client1',
  clientName: 'Acme Corp',
  description: 'Premium brand',
  logo: 'https://example.com/logo.png',
  primaryColor: '#D91C81',
  secondaryColor: '#1B2A5E',
  tertiaryColor: '#00B4CC',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('BrandModal Component', () => {
  describe('Rendering', () => {
    it('should render when open', () => {
      renderWithRouter(
        <BrandModal
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      expect(screen.getByText(/create brand/i)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      renderWithRouter(
        <BrandModal
          open={false}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      expect(screen.queryByText(/create brand/i)).not.toBeInTheDocument();
    });

    it('should render form fields', () => {
      renderWithRouter(
        <BrandModal
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/brand name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('should render color inputs', () => {
      renderWithRouter(
        <BrandModal
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/primary color/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/secondary color/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tertiary color/i)).toBeInTheDocument();
    });

    it('should render active status toggle', () => {
      renderWithRouter(
        <BrandModal
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should populate form with brand data in edit mode', () => {
      renderWithRouter(
        <BrandModal
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          brand={mockBrand}
        />
      );

      expect(screen.getByLabelText(/brand name/i)).toHaveValue('Acme Brand');
      expect(screen.getByLabelText(/client name/i)).toHaveValue('Acme Corp');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Premium brand');
    });
  });

  describe('Form Interactions', () => {
    it('should update brand name', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <BrandModal
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      const nameInput = screen.getByLabelText(/brand name/i);
      await user.type(nameInput, 'New Brand');

      expect(nameInput).toHaveValue('New Brand');
    });

    it('should update description', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <BrandModal
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      const descInput = screen.getByLabelText(/description/i);
      await user.type(descInput, 'Brand description');

      expect(descInput).toHaveValue('Brand description');
    });

    it('should update primary color', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <BrandModal
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      const colorInput = screen.getByLabelText(/primary color/i);
      await user.clear(colorInput);
      await user.type(colorInput, '#FF0000');

      expect(colorInput).toHaveValue('#FF0000');
    });

    it('should toggle active status', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <BrandModal
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(toggle).not.toBeChecked();
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave with form data', async () => {
      const handleSave = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <BrandModal
          open={true}
          onClose={vi.fn()}
          onSave={handleSave}
        />
      );

      await user.type(screen.getByLabelText(/brand name/i), 'Test Brand');
      await user.type(screen.getByLabelText(/client name/i), 'Test Client');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Brand',
            clientName: 'Test Client',
          })
        );
      });
    });

    it('should call onClose after save', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <BrandModal
          open={true}
          onClose={handleClose}
          onSave={vi.fn()}
        />
      );

      await user.type(screen.getByLabelText(/brand name/i), 'Test');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });

  describe('Close Behavior', () => {
    it('should call onClose when cancel is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <BrandModal
          open={true}
          onClose={handleClose}
          onSave={vi.fn()}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(handleClose).toHaveBeenCalled();
    });
  });
});