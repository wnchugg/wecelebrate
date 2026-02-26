/**
 * Auth Context Integration Test Suite
 * Day 14 - Morning Session (Part 2)
 * Tests for AuthContext integration with authentication flows
 */

import { vi } from 'vitest';

// Use vi.hoisted to create mock functions that can be referenced in vi.mock
const { mockLogSecurityEvent, mockStartSessionTimer, mockClearSessionTimer, mockResetSessionTimer } = vi.hoisted(() => ({
  mockLogSecurityEvent: vi.fn(),
  mockStartSessionTimer: vi.fn(),
  mockClearSessionTimer: vi.fn(),
  mockResetSessionTimer: vi.fn(),
}));

vi.mock('../../utils/security', () => ({
  logSecurityEvent: mockLogSecurityEvent,
  startSessionTimer: mockStartSessionTimer,
  clearSessionTimer: mockClearSessionTimer,
  resetSessionTimer: mockResetSessionTimer,
}));

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router';
import { ReactNode } from 'react';

// Test component that uses AuthContext
function TestAuthComponent() {
  const { isAuthenticated, userIdentifier, user, authenticate, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-identifier">{userIdentifier || 'none'}</div>
      <div data-testid="user-email">{user?.email || 'none'}</div>
      <div data-testid="user-name">{user?.name || 'none'}</div>
      <div data-testid="user-id">{user?.id || 'none'}</div>
      
      <button onClick={() => authenticate('user@example.com')}>
        Authenticate with Email
      </button>
      <button onClick={() => authenticate('user@example.com', {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John Doe',
        employeeId: 'EMP-001',
      })}>
        Authenticate with Full User Data
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Auth Context Integration Suite', () => {
  beforeEach(() => {
    mockLogSecurityEvent.mockClear();
    mockStartSessionTimer.mockClear();
    mockClearSessionTimer.mockClear();
    mockResetSessionTimer.mockClear();
    vi.resetModules(); // Reset module cache
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Context Provider', () => {
    it('should verify mocks are set up correctly', () => {
      // Verify mocks are mock functions
      expect(vi.isMockFunction(mockLogSecurityEvent)).toBe(true);
      expect(vi.isMockFunction(mockStartSessionTimer)).toBe(true);
      expect(vi.isMockFunction(mockClearSessionTimer)).toBe(true);
      expect(vi.isMockFunction(mockResetSessionTimer)).toBe(true);
    });

    it('should provide auth context to children', () => {
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('auth-status')).toBeInTheDocument();
      expect(screen.getByTestId('user-identifier')).toBeInTheDocument();
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });

    it('should initialize as not authenticated', () => {
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    it('should initialize with null user identifier', () => {
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('user-identifier')).toHaveTextContent('none');
    });

    it('should initialize with null user', () => {
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('user-email')).toHaveTextContent('none');
      expect(screen.getByTestId('user-id')).toHaveTextContent('none');
    });
  });

  describe('Authentication - Email Only', () => {
    it('should authenticate user with email', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
    });

    it('should set user identifier', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      
      await waitFor(() => {
        expect(screen.getByTestId('user-identifier')).toHaveTextContent('user@example.com');
      });
    });

    it('should create basic user object from identifier', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('user@example.com');
        expect(screen.getByTestId('user-id')).toHaveTextContent('user@example.com');
      });
    });

    it('should log security event on authentication', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      
      await waitFor(() => {
        expect(mockLogSecurityEvent).toHaveBeenCalledWith({
          action: 'authentication',
          status: 'success',
          details: { userIdentifier: 'user@example.com' }
        });
      });
    });

    it('should start session timer on authentication', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      
      await waitFor(() => {
        expect(mockStartSessionTimer).toHaveBeenCalled();
      });
    });
  });

  describe('Authentication - Full User Data', () => {
    it('should authenticate with full user data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Full User Data'));
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
    });

    it('should set user email from full data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Full User Data'));
      
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('user@example.com');
      });
    });

    it('should set user name from full data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Full User Data'));
      
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
      });
    });

    it('should set user ID from full data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Full User Data'));
      
      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-123');
      });
    });

    it('should set user identifier from email', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Full User Data'));
      
      await waitFor(() => {
        expect(screen.getByTestId('user-identifier')).toHaveTextContent('user@example.com');
      });
    });
  });

  describe('Logout', () => {
    it('should logout user', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'));
      
      await user.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });

    it('should clear user identifier on logout', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      await user.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(screen.getByTestId('user-identifier')).toHaveTextContent('none');
      });
    });

    it('should clear user data on logout', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Full User Data'));
      await user.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('none');
        expect(screen.getByTestId('user-name')).toHaveTextContent('none');
        expect(screen.getByTestId('user-id')).toHaveTextContent('none');
      });
    });

    it('should log security event on logout', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      await user.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(mockLogSecurityEvent).toHaveBeenCalledWith({
          action: 'logout',
          status: 'success',
          details: { userIdentifier: 'user@example.com' }
        });
      });
    });

    it('should clear session timer on logout', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      await user.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(mockClearSessionTimer).toHaveBeenCalled();
      });
    });

    it('should handle logout when not authenticated', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      // Logout without authenticating
      await user.click(screen.getByText('Logout'));
      
      // Should not error
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });
  });

  describe('Session Management', () => {
    it('should start session timer on authentication', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      
      await waitFor(() => {
        expect(mockStartSessionTimer).toHaveBeenCalledWith(expect.any(Function));
      });
    });

    it('should setup activity listeners when authenticated', async () => {
      const user = userEvent.setup();
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      
      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      });
      
      addEventListenerSpy.mockRestore();
    });

    it('should cleanup activity listeners on logout', async () => {
      const user = userEvent.setup();
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      await user.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(removeEventListenerSpy).toHaveBeenCalled();
      });
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Re-authentication', () => {
    it('should allow re-authentication after logout', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      // First authentication
      await user.click(screen.getByText('Authenticate with Email'));
      await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'));
      
      // Logout
      await user.click(screen.getByText('Logout'));
      await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated'));
      
      // Re-authenticate
      await user.click(screen.getByText('Authenticate with Email'));
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
    });

    it('should update user data on re-authentication', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      await user.click(screen.getByText('Logout'));
      await user.click(screen.getByText('Authenticate with Full User Data'));
      
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple authentication calls', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      await user.click(screen.getByText('Authenticate with Email'));
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
    });

    it('should handle multiple logout calls', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      await user.click(screen.getByText('Logout'));
      await user.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });

    it('should maintain auth state across re-renders', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'));
      
      // Force re-render
      rerender(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      // Auth should be maintained
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });
  });

  describe('Security Event Logging', () => {
    it('should log authentication event with correct parameters', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      
      await waitFor(() => {
        expect(mockLogSecurityEvent).toHaveBeenCalledWith({
          action: 'authentication',
          status: 'success',
          details: { userIdentifier: 'user@example.com' }
        });
      });
    });

    it('should log logout event with user identifier', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Authenticate with Email'));
      mockLogSecurityEvent.mockClear(); // Clear authentication log
      
      await user.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(mockLogSecurityEvent).toHaveBeenCalledWith({
          action: 'logout',
          status: 'success',
          details: { userIdentifier: 'user@example.com' }
        });
      });
    });

    it('should log logout without identifier when not authenticated', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(mockLogSecurityEvent).toHaveBeenCalledWith({
          action: 'logout',
          status: 'success',
          details: { userIdentifier: undefined }
        });
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete auth flow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      // Initial state
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      
      // Authenticate
      await user.click(screen.getByText('Authenticate with Full User Data'));
      await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'));
      expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
      
      // Logout
      await user.click(screen.getByText('Logout'));
      await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated'));
      expect(screen.getByTestId('user-name')).toHaveTextContent('none');
    });

    it('should handle switching between different auth methods', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );
      
      // Email only auth
      await user.click(screen.getByText('Authenticate with Email'));
      await waitFor(() => expect(screen.getByTestId('user-name')).toHaveTextContent('none'));
      
      // Full data auth (should update)
      await user.click(screen.getByText('Authenticate with Full User Data'));
      await waitFor(() => expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe'));
    });
  });
});
