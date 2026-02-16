/**
 * useApi Hook Test Suite
 * Day 4 - Afternoon Session
 * Tests for src/app/hooks/useApi.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useQuery, useMutation, usePagination } from '../useApi';
import { ApiError } from '../../lib/apiClient';

describe('useApi Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useQuery Hook', () => {
    it('should initialize with default state', () => {
      const queryFn = vi.fn().mockResolvedValue({ data: 'test' });

      const { result } = renderHook(() =>
        useQuery(['test'], queryFn, { enabled: false })
      );

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch data on mount when enabled', async () => {
      const mockData = { id: '1', name: 'Test' };
      const queryFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useQuery(['test'], queryFn)
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it('should not fetch when enabled is false', () => {
      const queryFn = vi.fn().mockResolvedValue({ data: 'test' });

      renderHook(() =>
        useQuery(['test'], queryFn, { enabled: false })
      );

      expect(queryFn).not.toHaveBeenCalled();
    });

    it('should set loading state during fetch', async () => {
      const queryFn = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: 'test' }), 100))
      );

      const { result } = renderHook(() =>
        useQuery(['test'], queryFn)
      );

      // Should be loading initially
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle fetch errors', async () => {
      const mockError = new ApiError('Fetch failed', 500);
      const queryFn = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useQuery(['test'], queryFn)
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(mockError);
      });
    });

    it('should call onSuccess callback', async () => {
      const mockData = { id: '1' };
      const queryFn = vi.fn().mockResolvedValue(mockData);
      const onSuccess = vi.fn();

      renderHook(() =>
        useQuery(['test'], queryFn, { onSuccess })
      );

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockData);
      });
    });

    it('should call onError callback', async () => {
      const mockError = new ApiError('Error', 500);
      const queryFn = vi.fn().mockRejectedValue(mockError);
      const onError = vi.fn();

      renderHook(() =>
        useQuery(['test'], queryFn, { onError })
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(mockError);
      });
    });

    it('should support manual refetch', async () => {
      const mockData = { id: '1' };
      const queryFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useQuery(['test'], queryFn, { refetchOnMount: false })
      );

      expect(queryFn).not.toHaveBeenCalled();

      await act(async () => {
        await result.current.refetch();
      });

      expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it('should handle non-ApiError errors', async () => {
      const genericError = new Error('Generic error');
      const queryFn = vi.fn().mockRejectedValue(genericError);

      const { result } = renderHook(() =>
        useQuery(['test'], queryFn)
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeInstanceOf(ApiError);
      });
    });

    it('should refetch on mount when refetchOnMount is true', async () => {
      const queryFn = vi.fn().mockResolvedValue({ data: 'test' });

      renderHook(() =>
        useQuery(['test'], queryFn, { refetchOnMount: true })
      );

      await waitFor(() => {
        expect(queryFn).toHaveBeenCalledTimes(1);
      });
    });

    it('should support query key array', async () => {
      const mockData = { id: '1' };
      const queryFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useQuery(['users', '1'], queryFn)
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });
    });
  });

  describe('useMutation Hook', () => {
    it('should initialize with default state', () => {
      const mutationFn = vi.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should execute mutation', async () => {
      const mockResponse = { success: true, id: '1' };
      const mutationFn = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      let response;
      await act(async () => {
        response = await result.current.mutateAsync({ name: 'Test' });
      });

      expect(response).toEqual(mockResponse);
      expect(mutationFn).toHaveBeenCalledWith({ name: 'Test' });
    });

    it('should set loading state during mutation', async () => {
      const mutationFn = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      act(() => {
        result.current.mutate({});
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle mutation errors', async () => {
      const mockError = new ApiError('Mutation failed', 400);
      const mutationFn = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      await act(async () => {
        try {
          await result.current.mutateAsync({});
        } catch (e) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(mockError);
      });
    });

    it('should call onSuccess callback', async () => {
      const mockResponse = { success: true };
      const mutationFn = vi.fn().mockResolvedValue(mockResponse);
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useMutation(mutationFn, { onSuccess })
      );

      const variables = { name: 'Test' };
      await act(async () => {
        await result.current.mutateAsync(variables);
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockResponse, variables);
      });
    });

    it('should call onError callback', async () => {
      const mockError = new ApiError('Error', 400);
      const mutationFn = vi.fn().mockRejectedValue(mockError);
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useMutation(mutationFn, { onError })
      );

      const variables = { name: 'Test' };
      await act(async () => {
        try {
          await result.current.mutateAsync(variables);
        } catch (e) {
          // Expected
        }
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(mockError, variables);
      });
    });

    it('should reset mutation state', () => {
      const mutationFn = vi.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      // Manually set some state to simulate after mutation
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should support mutate without waiting', () => {
      const mutationFn = vi.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      act(() => {
        result.current.mutate({ name: 'Test' });
      });

      expect(mutationFn).toHaveBeenCalledWith({ name: 'Test' });
    });

    it('should handle non-ApiError errors in mutation', async () => {
      const genericError = new Error('Generic error');
      const mutationFn = vi.fn().mockRejectedValue(genericError);

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      await act(async () => {
        try {
          await result.current.mutateAsync({});
        } catch (e) {
          // Expected
        }
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeInstanceOf(ApiError);
      });
    });

    it('should update data after successful mutation', async () => {
      const mockResponse = { success: true, id: '123' };
      const mutationFn = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      await act(async () => {
        await result.current.mutateAsync({});
      });

      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle multiple sequential mutations', async () => {
      const mutationFn = vi.fn()
        .mockResolvedValueOnce({ id: '1' })
        .mockResolvedValueOnce({ id: '2' });

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      await act(async () => {
        await result.current.mutateAsync({ name: 'First' });
      });

      expect(result.current.data).toEqual({ id: '1' });

      await act(async () => {
        await result.current.mutateAsync({ name: 'Second' });
      });

      expect(result.current.data).toEqual({ id: '2' });
    });
  });

  describe('usePagination Hook', () => {
    it('should initialize with default pagination', () => {
      const { result } = renderHook(() => usePagination());

      expect(result.current.page).toBe(1);
      expect(result.current.limit).toBe(50);
    });

    it('should initialize with custom values', () => {
      const { result } = renderHook(() =>
        usePagination({ initialPage: 2, initialLimit: 25 })
      );

      expect(result.current.page).toBe(2);
      expect(result.current.limit).toBe(25);
    });

    it('should set page', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPage(5);
      });

      expect(result.current.page).toBe(5);
    });

    it('should set limit', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setLimit(50);
      });

      expect(result.current.limit).toBe(50);
    });

    it('should go to next page', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(2);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(3);
    });

    it('should go to previous page', () => {
      const { result } = renderHook(() =>
        usePagination({ initialPage: 3 })
      );

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(2);
    });

    it('should not go below page 1', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(1);
    });

    it('should reset pagination', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPage(5);
        result.current.setLimit(100);
      });

      expect(result.current.page).toBe(5);
      expect(result.current.limit).toBe(100);

      act(() => {
        result.current.reset();
      });

      expect(result.current.page).toBe(1);
      expect(result.current.limit).toBe(50);
    });

    it('should provide pagination params object', () => {
      const { result } = renderHook(() =>
        usePagination({ initialPage: 2, initialLimit: 25 })
      );

      expect(result.current.paginationParams).toEqual({
        page: 2,
        limit: 25
      });
    });

    it('should update pagination params when page changes', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setPage(3);
      });

      expect(result.current.paginationParams.page).toBe(3);
    });

    it('should update pagination params when limit changes', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.setLimit(100);
      });

      expect(result.current.paginationParams.limit).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeout in query', async () => {
      const queryFn = vi.fn().mockRejectedValue(
        new ApiError('Request timeout', 408)
      );

      const { result } = renderHook(() =>
        useQuery(['test'], queryFn)
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error?.statusCode).toBe(408);
      });
    });

    it('should handle server errors in mutation', async () => {
      const mutationFn = vi.fn().mockRejectedValue(
        new ApiError('Internal server error', 500)
      );

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      await act(async () => {
        try {
          await result.current.mutateAsync({});
        } catch (e) {
          // Expected
        }
      });

      await waitFor(() => {
        expect(result.current.error?.statusCode).toBe(500);
      });
    });

    it('should handle validation errors', async () => {
      const mutationFn = vi.fn().mockRejectedValue(
        new ApiError('Validation failed', 422)
      );

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      await act(async () => {
        try {
          await result.current.mutateAsync({});
        } catch (e) {
          // Expected
        }
      });

      await waitFor(() => {
        expect(result.current.error?.statusCode).toBe(422);
      });
    });
  });

  describe('Loading States', () => {
    it('should track loading state in query', async () => {
      const queryFn = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: 'test' }), 50))
      );

      const { result } = renderHook(() =>
        useQuery(['test'], queryFn)
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should track loading state in mutation', async () => {
      const mutationFn = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 50))
      );

      const { result } = renderHook(() =>
        useMutation(mutationFn)
      );

      act(() => {
        result.current.mutate({});
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should reset loading state after error', async () => {
      const queryFn = vi.fn().mockRejectedValue(new ApiError('Error', 500));

      const { result } = renderHook(() =>
        useQuery(['test'], queryFn)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent queries', async () => {
      const queryFn1 = vi.fn().mockResolvedValue({ id: '1' });
      const queryFn2 = vi.fn().mockResolvedValue({ id: '2' });

      const { result: result1 } = renderHook(() =>
        useQuery(['test1'], queryFn1)
      );

      const { result: result2 } = renderHook(() =>
        useQuery(['test2'], queryFn2)
      );

      await waitFor(() => {
        expect(result1.current.data).toEqual({ id: '1' });
        expect(result2.current.data).toEqual({ id: '2' });
      });
    });

    it('should handle rapid pagination changes', () => {
      const { result } = renderHook(() => usePagination());

      act(() => {
        result.current.nextPage();
        result.current.nextPage();
        result.current.nextPage();
        result.current.prevPage();
      });

      expect(result.current.page).toBe(3);
    });

    it('should handle mutation with no variables', async () => {
      const mutationFn = vi.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useMutation<{ success: boolean }, void>(mutationFn)
      );

      await act(async () => {
        await result.current.mutateAsync(undefined as any);
      });

      expect(mutationFn).toHaveBeenCalled();
    });
  });
});
