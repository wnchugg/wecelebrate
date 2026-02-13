/**
 * AdminContext Tests
 * Day 8 - Week 2: Context Testing
 * Target: 12 tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AdminProvider, useAdmin } from '../AdminContext';

// Mock dependencies
vi.mock('../../utils/security', () => ({
  logSecurityEvent: vi.fn(),
  startSessionTimer: vi.fn(),
  clearSessionTimer: vi.fn(),
}));

vi.mock('../../utils/api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getSession: vi.fn(),
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(() => null),
}));

vi.mock('../../lib/apiClient', () => ({
  clearAccessToken: vi.fn(),
}));

vi.mock('../../utils/frontendSecurity', () => ({
  logSecurityEvent: vi.fn(),
}));

vi.mock('../../utils/routePreloader', () => ({
  preloadAdminRoutes: vi.fn(),
}));

vi.mock('../../utils/routeUtils', () => ({
  isPublicRoute: vi.fn(() => false),
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('AdminContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AdminProvider>{children}</AdminProvider>
  );

  describe('Provider Setup', () => {
    it('should provide admin context', async () => {
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('adminUser');
      expect(result.current).toHaveProperty('isAdminAuthenticated');
      expect(result.current).toHaveProperty('adminLogin');
      expect(result.current).toHaveProperty('adminLogout');
    });

    it('should have initial unauthenticated state', async () => {
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.isAdminAuthenticated).toBe(false);
      expect(result.current.adminUser).toBeNull();
    });

    it('should return safe defaults when used outside provider', () => {
      const { result } = renderHook(() => useAdmin());
      
      expect(result.current.adminUser).toBeNull();
      expect(result.current.isAdminAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should have loading state initially', () => {
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Admin Login', () => {
    it('should login successfully', async () => {
      const { authApi } = require('../../utils/api');
      const mockUser = {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin' as const,
      };
      
      authApi.login.mockResolvedValue({
        success: true,
        user: mockUser,
        accessToken: 'test-token',
      });
      
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.adminLogin('admin', 'password');
      });
      
      expect(loginResult).toBe(true);
      expect(result.current.isAdminAuthenticated).toBe(true);
      expect(result.current.adminUser).toEqual(mockUser);
    });

    it('should handle login failure', async () => {
      const { authApi } = require('../../utils/api');
      authApi.login.mockResolvedValue({
        success: false,
        message: 'Invalid credentials',
      });
      
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.adminLogin('admin', 'wrong');
      });
      
      expect(loginResult).toBe(false);
      expect(result.current.isAdminAuthenticated).toBe(false);
    });

    it('should start session timer on login', async () => {
      const { authApi } = require('../../utils/api');
      const { startSessionTimer } = require('../../utils/security');
      
      authApi.login.mockResolvedValue({
        success: true,
        user: {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        },
        accessToken: 'test-token',
      });
      
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.adminLogin('admin', 'password');
      });
      
      expect(startSessionTimer).toHaveBeenCalled();
    });

    it('should log security event on login', async () => {
      const { authApi } = require('../../utils/api');
      const { logSecurityEvent } = require('../../utils/security');
      
      authApi.login.mockResolvedValue({
        success: true,
        user: {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        },
        accessToken: 'test-token',
      });
      
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.adminLogin('admin', 'password');
      });
      
      expect(logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'admin_login',
          status: 'success',
        })
      );
    });

    it('should preload admin routes on login', async () => {
      const { authApi } = require('../../utils/api');
      const { preloadAdminRoutes } = require('../../utils/routePreloader');
      
      authApi.login.mockResolvedValue({
        success: true,
        user: {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        },
        accessToken: 'test-token',
      });
      
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.adminLogin('admin', 'password');
      });
      
      expect(preloadAdminRoutes).toHaveBeenCalled();
    });
  });

  describe('Admin Logout', () => {
    it('should logout successfully', async () => {
      const { authApi } = require('../../utils/api');
      
      authApi.login.mockResolvedValue({
        success: true,
        user: {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        },
        accessToken: 'test-token',
      });
      
      authApi.logout.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.adminLogin('admin', 'password');
      });
      
      expect(result.current.isAdminAuthenticated).toBe(true);
      
      await act(async () => {
        await result.current.adminLogout();
      });
      
      expect(result.current.isAdminAuthenticated).toBe(false);
      expect(result.current.adminUser).toBeNull();
    });

    it('should clear session timer on logout', async () => {
      const { authApi } = require('../../utils/api');
      const { clearSessionTimer } = require('../../utils/security');
      
      authApi.login.mockResolvedValue({
        success: true,
        user: {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        },
        accessToken: 'test-token',
      });
      
      authApi.logout.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.adminLogin('admin', 'password');
      });
      
      vi.clearAllMocks();
      
      await act(async () => {
        await result.current.adminLogout();
      });
      
      expect(clearSessionTimer).toHaveBeenCalled();
    });

    it('should log security event on logout', async () => {
      const { authApi } = require('../../utils/api');
      const { logSecurityEvent } = require('../../utils/security');
      
      authApi.login.mockResolvedValue({
        success: true,
        user: {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        },
        accessToken: 'test-token',
      });
      
      authApi.logout.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.adminLogin('admin', 'password');
      });
      
      vi.clearAllMocks();
      
      await act(async () => {
        await result.current.adminLogout();
      });
      
      expect(logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'admin_logout',
          status: 'success',
        })
      );
    });
  });

  describe('Session Management', () => {
    it('should restore session from token', async () => {
      const { authApi, getAccessToken } = require('../../utils/api');
      
      getAccessToken.mockReturnValue('existing-token');
      authApi.getSession.mockResolvedValue({
        user: {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        },
      });
      
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await waitFor(() => {
        expect(result.current.isAdminAuthenticated).toBe(true);
      });
    });

    it('should handle invalid session token', async () => {
      const { authApi, getAccessToken, setAccessToken } = require('../../utils/api');
      
      getAccessToken.mockReturnValue('invalid-token');
      authApi.getSession.mockRejectedValue(new Error('Invalid token'));
      
      const { result } = renderHook(() => useAdmin(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(setAccessToken).toHaveBeenCalledWith(null);
      expect(result.current.isAdminAuthenticated).toBe(false);
    });
  });
});
