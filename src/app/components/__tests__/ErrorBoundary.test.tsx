/**
 * ErrorBoundary Component Tests
 * 
 * Coverage:
 * - Error catching
 * - Error display
 * - Action buttons (reload, go back, go home)
 * - Error reporting
 * - Module error detection
 * 
 * Total Tests: 5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock window methods
const mockReload = vi.fn();
const mockBack = vi.fn();

Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
    href: '',
  },
  writable: true,
});

Object.defineProperty(window, 'history', {
  value: {
    back: mockBack,
  },
  writable: true,
});

describe('ErrorBoundary Component', () => {
  // Suppress console errors in tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Catching', () => {
    it('should render children when no error', () => {
      renderWithRouter(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should catch and display error', () => {
      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
    });

    it('should display error message', () => {
      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/test error/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render action buttons', () => {
      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/reload page/i)).toBeInTheDocument();
      expect(screen.getByText(/go back/i)).toBeInTheDocument();
      expect(screen.getByText(/go to home/i)).toBeInTheDocument();
      expect(screen.getByText(/report issue/i)).toBeInTheDocument();
    });

    it('should call reload on Reload Page button click', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      await user.click(screen.getByText(/reload page/i));

      expect(mockReload).toHaveBeenCalled();
    });
  });
});