/**
 * SessionTimeoutWarning Component Tests
 * 
 * Coverage:
 * - Warning visibility
 * - Countdown timer
 * - Stay logged in action
 * - Logout action
 * - Auto-close on expiry
 * 
 * Total Tests: 7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { SessionTimeoutWarning } from '../SessionTimeoutWarning';

// Mock session manager
const mockSessionManager = {
  onSessionWarning: vi.fn(),
  onSessionExpired: vi.fn(),
  getRemainingTime: vi.fn(() => 60000), // 60 seconds
};

const mockExtendSession = vi.fn();

vi.mock('../../utils/sessionManager', () => ({
  sessionManager: mockSessionManager,
  extendSession: mockExtendSession,
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SessionTimeoutWarning Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render initially', () => {
      renderWithRouter(<SessionTimeoutWarning />);

      expect(screen.queryByText(/session expiring soon/i)).not.toBeInTheDocument();
    });

    it('should render when session warning is triggered', async () => {
      let warningCallback: ((remainingMs: number) => void) | null = null;

      mockSessionManager.onSessionWarning.mockImplementation((callback) => {
        warningCallback = callback;
      });

      renderWithRouter(<SessionTimeoutWarning />);

      // Trigger warning
      if (warningCallback) {
        warningCallback(60000);
      }

      await waitFor(() => {
        expect(screen.getByText(/session expiring soon/i)).toBeInTheDocument();
      });
    });

    it('should display countdown timer', async () => {
      let warningCallback: ((remainingMs: number) => void) | null = null;

      mockSessionManager.onSessionWarning.mockImplementation((callback) => {
        warningCallback = callback;
      });

      renderWithRouter(<SessionTimeoutWarning />);

      if (warningCallback) {
        warningCallback(90000); // 90 seconds = 1:30
      }

      await waitFor(() => {
        expect(screen.getByText(/01:30/)).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('should call extendSession when Stay Logged In is clicked', async () => {
      let warningCallback: ((remainingMs: number) => void) | null = null;

      mockSessionManager.onSessionWarning.mockImplementation((callback) => {
        warningCallback = callback;
      });

      const user = userEvent.setup();

      renderWithRouter(<SessionTimeoutWarning />);

      if (warningCallback) {
        warningCallback(60000);
      }

      await waitFor(() => {
        expect(screen.getByText('Stay Logged In')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Stay Logged In'));

      expect(mockExtendSession).toHaveBeenCalled();
    });

    it('should navigate to logout when Logout Now is clicked', async () => {
      let warningCallback: ((remainingMs: number) => void) | null = null;

      mockSessionManager.onSessionWarning.mockImplementation((callback) => {
        warningCallback = callback;
      });

      const user = userEvent.setup();

      renderWithRouter(<SessionTimeoutWarning />);

      if (warningCallback) {
        warningCallback(60000);
      }

      await waitFor(() => {
        expect(screen.getByText('Logout Now')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Logout Now'));

      expect(mockNavigate).toHaveBeenCalledWith('/admin/logout');
    });

    it('should navigate to session expired when time expires', async () => {
      let expiredCallback: (() => void) | null = null;

      mockSessionManager.onSessionExpired.mockImplementation((callback) => {
        expiredCallback = callback;
      });

      renderWithRouter(<SessionTimeoutWarning />);

      if (expiredCallback) {
        expiredCallback();
      }

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/session-expired');
      });
    });
  });

  describe('Warning Message', () => {
    it('should display warning text', async () => {
      let warningCallback: ((remainingMs: number) => void) | null = null;

      mockSessionManager.onSessionWarning.mockImplementation((callback) => {
        warningCallback = callback;
      });

      renderWithRouter(<SessionTimeoutWarning />);

      if (warningCallback) {
        warningCallback(60000);
      }

      await waitFor(() => {
        expect(screen.getByText(/your session is about to expire/i)).toBeInTheDocument();
      });
    });
  });
});