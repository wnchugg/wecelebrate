/**
 * AuthContext Tests
 * Day 8 - Week 2: Context Testing
 * Target: 26 tests
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
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth, User } from '../AuthContext';

// Use the mock functions directly
const logSecurityEvent = mockLogSecurityEvent;
const startSessionTimer = mockStartSessionTimer;
const clearSessionTimer = mockClearSessionTimer;
const resetSessionTimer = mockResetSessionTimer;

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Provider Setup', () => {
    it('should provide auth context', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('userIdentifier');
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('authenticate');
      expect(result.current).toHaveProperty('logout');
    });

    it('should have initial unauthenticated state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.userIdentifier).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide authenticate function', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(typeof result.current.authenticate).toBe('function');
    });

    it('should provide logout function', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(typeof result.current.logout).toBe('function');
    });
  });

  describe('Authentication Flow', () => {
    it('should authenticate with identifier only', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.userIdentifier).toBe('user@example.com');
    });

    it('should create basic user object from identifier', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      expect(result.current.user).toEqual({
        id: 'user@example.com',
        email: 'user@example.com',
      });
    });

    it('should authenticate with full user data', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      const userData: User = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John Doe',
        employeeId: 'EMP-001',
      };
      
      act(() => {
        result.current.authenticate('user@example.com', userData);
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(userData);
    });

    it('should log security event on authentication', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      expect(logSecurityEvent).toHaveBeenCalledWith({
        action: 'authentication',
        status: 'success',
        details: { userIdentifier: 'user@example.com' },
      });
    });

    it('should start session timer on authentication', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      expect(startSessionTimer).toHaveBeenCalled();
    });

    it('should update user identifier on authentication', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user1@example.com');
      });
      
      expect(result.current.userIdentifier).toBe('user1@example.com');
      
      act(() => {
        result.current.authenticate('user2@example.com');
      });
      
      expect(result.current.userIdentifier).toBe('user2@example.com');
    });

    it('should handle multiple authentications', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user1@example.com');
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      
      act(() => {
        result.current.authenticate('user2@example.com');
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.userIdentifier).toBe('user2@example.com');
    });
  });

  describe('Logout Flow', () => {
    it('should logout authenticated user', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      
      act(() => {
        result.current.logout();
      });
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.userIdentifier).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it('should log security event on logout', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      vi.clearAllMocks();
      
      act(() => {
        result.current.logout();
      });
      
      expect(logSecurityEvent).toHaveBeenCalledWith({
        action: 'logout',
        status: 'success',
        details: { userIdentifier: 'user@example.com' },
      });
    });

    it('should clear session timer on logout', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      vi.clearAllMocks();
      
      act(() => {
        result.current.logout();
      });
      
      expect(clearSessionTimer).toHaveBeenCalled();
    });

    it('should handle logout without authentication', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(() => {
        act(() => {
          result.current.logout();
        });
      }).not.toThrow();
      
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should clear user data on logout', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      const userData: User = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John Doe',
      };
      
      act(() => {
        result.current.authenticate('user@example.com', userData);
      });
      
      expect(result.current.user).toEqual(userData);
      
      act(() => {
        result.current.logout();
      });
      
      expect(result.current.user).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should reset session timer on user activity when authenticated', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      vi.clearAllMocks();
      
      // Simulate user activity
      act(() => {
        document.dispatchEvent(new Event('mousedown'));
      });
      
      expect(resetSessionTimer).toHaveBeenCalled();
    });

    it('should listen to multiple activity events', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      vi.clearAllMocks();
      
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      
      events.forEach(eventType => {
        vi.clearAllMocks();
        act(() => {
          document.dispatchEvent(new Event(eventType));
        });
        expect(resetSessionTimer).toHaveBeenCalled();
      });
    });

    it('should not reset timer when not authenticated', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Not authenticated
      expect(result.current.isAuthenticated).toBe(false);
      
      act(() => {
        document.dispatchEvent(new Event('mousedown'));
      });
      
      expect(resetSessionTimer).not.toHaveBeenCalled();
    });

    it('should remove event listeners on logout', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      act(() => {
        result.current.logout();
      });
      
      // Should remove all 4 event listeners
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(4);
    });

    it('should clear timer on unmount', () => {
      const { result, unmount } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      vi.clearAllMocks();
      
      unmount();
      
      expect(clearSessionTimer).toHaveBeenCalled();
    });
  });

  describe('Context Updates', () => {
    it('should update isAuthenticated state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current.isAuthenticated).toBe(false);
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should update userIdentifier state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current.userIdentifier).toBeNull();
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      expect(result.current.userIdentifier).toBe('user@example.com');
    });

    it('should update user state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current.user).toBeNull();
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      expect(result.current.user).not.toBeNull();
    });

    it('should maintain state across re-renders', () => {
      const { result, rerender } = renderHook(() => useAuth(), { wrapper });
      
      act(() => {
        result.current.authenticate('user@example.com');
      });
      
      const userBefore = result.current.user;
      
      rerender();
      
      expect(result.current.user).toBe(userBefore);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});