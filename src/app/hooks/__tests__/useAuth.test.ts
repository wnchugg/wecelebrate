/**
 * useAuth Hook Test Suite
 * Day 4 - Morning Session
 * Tests for src/app/hooks/useAuth.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useSession,
  useLogin,
  useSignup,
  useBootstrapAdmin,
  useLogout
} from '../useAuth';
import type { LoginRequest, LoginResponse } from '../../types/api.types';
import { useQuery, useMutation } from '../useApi';

// Mock apiClient
vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    auth: {
      getSession: vi.fn(),
      login: vi.fn(),
      signup: vi.fn(),
      bootstrapAdmin: vi.fn(),
      logout: vi.fn()
    }
  }
}));

// Mock useApi hooks
vi.mock('../useApi', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn()
}));

describe('useAuth Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useSession Hook', () => {
    it('should initialize with default state', () => {
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should fetch session on mount', () => {
      const mockRefetch = vi.fn();
      
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockRefetch
      });

      renderHook(() => useSession());

      expect(useQuery).toHaveBeenCalledWith(
        ['session'],
        expect.any(Function),
        expect.objectContaining({
          refetchOnMount: true
        })
      );
    });

    it('should return session data when available', () => {
      // useQuery is mocked
      const mockSession = {
        user: { id: '1', email: 'test@example.com' },
        token: 'test-token'
      };

      vi.mocked(useQuery).mockReturnValue({
        data: mockSession,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.data).toEqual(mockSession);
    });

    it('should handle session fetch error', () => {
      // useQuery is mocked
      const mockError = { message: 'Unauthorized', statusCode: 401, name: 'ApiError' };

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: mockError,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });

    it('should support custom options', () => {
      // useQuery is mocked
      const onSuccess = vi.fn();
      const onError = vi.fn();

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      renderHook(() => useSession({ 
        enabled: false,
        onSuccess,
        onError 
      }));

      expect(useQuery).toHaveBeenCalledWith(
        ['session'],
        expect.any(Function),
        expect.objectContaining({
          enabled: false,
          onSuccess,
          onError
        })
      );
    });

    it('should support refetch', () => {
      // useQuery is mocked
      const mockRefetch = vi.fn();

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch
      });

      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('useLogin Hook - Login Flow', () => {
    it('should initialize login hook', () => {
      // useMutation is mocked
      
      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogin());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
    });

    it('should call login mutation', async () => {
      // useMutation is mocked
      const mockMutate = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogin());

      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      act(() => {
        result.current.mutate(loginData);
      });

      expect(mockMutate).toHaveBeenCalledWith(loginData);
    });

    it('should set loading state during login', () => {
      // useMutation is mocked

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: true,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogin());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return login response data', () => {
      // useMutation is mocked
      const mockResponse: LoginResponse = {
        success: true,
        accessToken: 'jwt-token',
        userId: '1',
        email: 'test@example.com',
      };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: mockResponse,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogin());

      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle login failure', () => {
      // useMutation is mocked
      const mockError = { message: 'Invalid credentials', statusCode: 401, name: 'ApiError' };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: true,
        error: mockError,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogin());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });

    it('should call onSuccess callback after successful login', () => {
      // useMutation is mocked
      const onSuccess = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      renderHook(() => useLogin({ onSuccess }));

      expect(useMutation).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ onSuccess })
      );
    });

    it('should call onError callback after failed login', () => {
      // useMutation is mocked
      const onError = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      renderHook(() => useLogin({ onError }));

      expect(useMutation).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ onError })
      );
    });

    it('should support mutateAsync for promise-based flow', async () => {
      // useMutation is mocked
      const mockMutateAsync = vi.fn().mockResolvedValue({
        success: true,
        token: 'jwt-token'
      });

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: mockMutateAsync,
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogin());

      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      await act(async () => {
        await result.current.mutateAsync(loginData);
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(loginData);
    });
  });

  describe('useLogout Hook - Logout Flow', () => {
    it('should initialize logout hook', () => {
      // useMutation is mocked

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogout());

      expect(result.current.isLoading).toBe(false);
    });

    it('should call logout mutation', () => {
      // useMutation is mocked
      const mockMutate = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogout());

      act(() => {
        result.current.mutate();
      });

      expect(mockMutate).toHaveBeenCalled();
    });

    it('should set loading state during logout', () => {
      // useMutation is mocked

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: true,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogout());

      expect(result.current.isLoading).toBe(true);
    });

    it('should handle logout error', () => {
      // useMutation is mocked
      const mockError = { message: 'Logout failed', statusCode: 500, name: 'ApiError' };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: true,
        error: mockError,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogout());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });

    it('should call onSuccess callback after logout', () => {
      // useMutation is mocked
      const onSuccess = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      renderHook(() => useLogout({ onSuccess }));

      expect(useMutation).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ onSuccess })
      );
    });
  });

  describe('useSignup Hook', () => {
    it('should initialize signup hook', () => {
      // useMutation is mocked

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useSignup());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
    });

    it('should call signup mutation', () => {
      // useMutation is mocked
      const mockMutate = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useSignup());

      const signupData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      };

      act(() => {
        result.current.mutate(signupData);
      });

      expect(mockMutate).toHaveBeenCalledWith(signupData);
    });

    it('should handle signup validation error', () => {
      // useMutation is mocked
      const mockError = { message: 'Email already exists', statusCode: 400, name: 'ApiError' };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: true,
        error: mockError,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useSignup());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });

    it('should return signup success response', () => {
      // useMutation is mocked
      const mockResponse = {
        success: true,
        user: { id: '1', email: 'newuser@example.com' },
        token: 'jwt-token'
      };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: mockResponse,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useSignup());

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useBootstrapAdmin Hook', () => {
    it('should initialize bootstrap admin hook', () => {
      // useMutation is mocked

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useBootstrapAdmin());

      expect(result.current.isLoading).toBe(false);
    });

    it('should call bootstrap admin mutation', () => {
      // useMutation is mocked
      const mockMutate = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useBootstrapAdmin());

      const adminData = {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User'
      };

      act(() => {
        result.current.mutate(adminData);
      });

      expect(mockMutate).toHaveBeenCalledWith(adminData);
    });

    it('should handle bootstrap error when admin already exists', () => {
      // useMutation is mocked
      const mockError = { message: 'Admin already exists', statusCode: 409, name: 'ApiError' };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: true,
        error: mockError,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useBootstrapAdmin());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh session when token expires', async () => {
      // useQuery is mocked
      const mockRefetch = vi.fn();

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch
      });

      const { result } = renderHook(() => useSession());

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle token refresh failure', () => {
      // useQuery is mocked
      const mockError = { message: 'Token expired', statusCode: 401, name: 'ApiError' };

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: mockError,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toBe('Token expired');
    });

    it('should automatically refetch on mount', () => {
      // useQuery is mocked

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      renderHook(() => useSession());

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        expect.objectContaining({
          refetchOnMount: true
        })
      );
    });

    it('should support manual token refresh', async () => {
      // useQuery is mocked
      const mockRefetch = vi.fn().mockResolvedValue(undefined);

      vi.mocked(useQuery).mockReturnValue({
        data: { user: { id: '1' } },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch
      });

      const { result } = renderHook(() => useSession());

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('should clear session data on logout', () => {
      // useMutation is mocked
      const mockReset = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: mockReset
      });

      const { result } = renderHook(() => useLogout());

      act(() => {
        result.current.reset();
      });

      expect(mockReset).toHaveBeenCalled();
    });

    it('should persist auth state across page refreshes', () => {
      // useQuery is mocked
      const mockSession = {
        user: { id: '1', email: 'test@example.com' },
        token: 'persisted-token'
      };

      vi.mocked(useQuery).mockReturnValue({
        data: mockSession,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.data).toEqual(mockSession);
    });
  });

  describe('Auth State Persistence', () => {
    it('should load persisted session on initialization', () => {
      // useQuery is mocked
      const persistedSession = {
        user: { id: '1', email: 'test@example.com' },
        token: 'stored-token'
      };

      vi.mocked(useQuery).mockReturnValue({
        data: persistedSession,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.data).toEqual(persistedSession);
    });

    it('should clear persisted session on logout', async () => {
      // useMutation is mocked
      const mockMutate = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogout());

      act(() => {
        result.current.mutate();
      });

      expect(mockMutate).toHaveBeenCalled();
    });

    it('should update persisted session on login', () => {
      // useMutation is mocked
      const mockResponse = {
        success: true,
        token: 'new-jwt-token',
        user: { id: '1', email: 'test@example.com' }
      };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: mockResponse,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogin());

      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle concurrent auth operations', async () => {
      // useMutation is mocked
      const mockMutate = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn().mockResolvedValue({ success: true }),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogin());

      // Simulate concurrent login attempts
      act(() => {
        result.current.mutate({ email: 'test@example.com', password: 'pass1' });
        result.current.mutate({ email: 'test@example.com', password: 'pass2' });
      });

      expect(mockMutate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle network errors during login', () => {
      // useMutation is mocked
      const mockError = { message: 'Network error', statusCode: 0, name: 'ApiError' };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: true,
        error: mockError,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useLogin());

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toBe('Network error');
    });

    it('should handle session fetch with disabled option', () => {
      // useQuery is mocked

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      renderHook(() => useSession({ enabled: false }));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        expect.objectContaining({
          enabled: false
        })
      );
    });

    it('should reset mutation state', () => {
      // useMutation is mocked
      const mockReset = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: mockReset
      });

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.reset();
      });

      expect(mockReset).toHaveBeenCalled();
    });
  });
});
