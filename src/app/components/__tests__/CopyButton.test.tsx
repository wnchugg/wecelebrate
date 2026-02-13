/**
 * CopyButton Component Tests
 * 
 * Coverage:
 * - Copy functionality
 * - Success/error states
 * - Size variants
 * - Icon only vs. with text
 * - Callback handlers
 * 
 * Total Tests: 7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { CopyButton } from '../CopyButton';

// Mock clipboard utility
vi.mock('../../utils/clipboard', () => ({
  copyToClipboard: vi.fn(),
}));

import { copyToClipboard } from '../../utils/clipboard';

describe('CopyButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render copy button', () => {
      renderWithRouter(<CopyButton text="Test text" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render icon only by default', () => {
      renderWithRouter(<CopyButton text="Test text" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.queryByText('Copy')).not.toBeInTheDocument();
    });

    it('should render with text when iconOnly is false', () => {
      renderWithRouter(<CopyButton text="Test text" iconOnly={false} />);
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('should call copyToClipboard when button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(copyToClipboard).mockResolvedValue({ success: true, method: 'clipboard-api' });

      renderWithRouter(<CopyButton text="Test text to copy" />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(copyToClipboard).toHaveBeenCalledWith('Test text to copy');
    });

    it('should show success state on successful copy', async () => {
      const user = userEvent.setup();
      vi.mocked(copyToClipboard).mockResolvedValue({ success: true, method: 'clipboard-api' });

      renderWithRouter(<CopyButton text="Test" iconOnly={false} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('should call onCopySuccess callback on success', async () => {
      const handleSuccess = vi.fn();
      const user = userEvent.setup();
      vi.mocked(copyToClipboard).mockResolvedValue({ success: true, method: 'clipboard-api' });

      renderWithRouter(<CopyButton text="Test" onCopySuccess={handleSuccess} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it('should call onCopyFail callback on failure', async () => {
      const handleFail = vi.fn();
      const user = userEvent.setup();
      vi.mocked(copyToClipboard).mockResolvedValue({
        success: false,
        error: 'Copy failed',
        method: 'clipboard-api',
      });

      renderWithRouter(<CopyButton text="Test" onCopyFail={handleFail} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(handleFail).toHaveBeenCalledWith('Copy failed');
      });
    });
  });

  describe('Size Variants', () => {
    it('should render small size', () => {
      renderWithRouter(<CopyButton text="Test" size="sm" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-1', 'text-xs');
    });

    it('should render medium size by default', () => {
      renderWithRouter(<CopyButton text="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-1.5', 'text-sm');
    });
  });
});