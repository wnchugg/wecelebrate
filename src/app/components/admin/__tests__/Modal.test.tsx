/**
 * Modal Component Tests
 * 
 * Coverage:
 * - Open/close behavior
 * - Size variants
 * - Escape key handling
 * - Backdrop click
 * - Footer rendering
 * - Body scroll lock
 * 
 * Total Tests: 12
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { Modal } from '../Modal';

describe('Modal Component', () => {
  describe('Rendering', () => {
    it('should render modal when open', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      renderWithRouter(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('should render modal title', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={vi.fn()} title="Create New Item">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Create New Item')).toBeInTheDocument();
    });

    it('should render footer when provided', () => {
      renderWithRouter(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Test Modal"
          footer={
            <div>
              <button>Cancel</button>
              <button>Save</button>
            </div>
          }
        >
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Close Behavior', () => {
    it('should call onClose when close button is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(handleClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      // Click on backdrop (not the modal content)
      const backdrop = document.querySelector('.bg-black.bg-opacity-50');
      await user.click(backdrop!);

      expect(handleClose).toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      await user.keyboard('{Escape}');

      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Size Variants', () => {
    it('should render small size', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" size="sm">
          <p>Content</p>
        </Modal>
      );

      const modal = container.querySelector('.max-w-md');
      expect(modal).toBeInTheDocument();
    });

    it('should render medium size by default', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      const modal = container.querySelector('.max-w-lg');
      expect(modal).toBeInTheDocument();
    });

    it('should render large size', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" size="lg">
          <p>Content</p>
        </Modal>
      );

      const modal = container.querySelector('.max-w-2xl');
      expect(modal).toBeInTheDocument();
    });

    it('should render extra large size', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" size="xl">
          <p>Content</p>
        </Modal>
      );

      const modal = container.querySelector('.max-w-4xl');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when modal opens', () => {
      const { rerender } = renderWithRouter(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('');

      rerender(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should unlock body scroll when modal closes', () => {
      const { rerender } = renderWithRouter(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('unset');
    });
  });
});