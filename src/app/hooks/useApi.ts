/**
 * Custom React Hooks for API Operations
 * Phase 4: Frontend Refactoring
 */

import { useState, useEffect, useCallback } from 'react';
import type { PaginationParams } from '../types/api.types';
import { ApiError } from '../lib/apiClient';

// ===== Hook Types =====

export interface UseQueryOptions<T> {
  enabled?: boolean;
  refetchOnMount?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  data: TData | null;
  reset: () => void;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export interface UsePaginationResult {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  paginationParams: PaginationParams;
}

// ===== useQuery Hook =====

/**
 * Hook for fetching data from API
 * Similar to React Query's useQuery but simpler
 */
export function useQuery<T>(
  queryKey: string | unknown[],
  queryFn: () => Promise<T>,
  options: UseQueryOptions<T> = {}
): UseQueryResult<T> {
  const {
    enabled = true,
    refetchOnMount = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Unknown error', 500);
      setIsError(true);
      setError(apiError);
      onError?.(apiError);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, queryFn, onSuccess, onError]);

  useEffect(() => {
    if (refetchOnMount) {
      void fetchData();
    }
  }, [fetchData, refetchOnMount]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchData,
  };
}

// ===== useMutation Hook =====

/**
 * Hook for mutating data (POST, PUT, DELETE)
 * Similar to React Query's useMutation but simpler
 */
export function useMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setIsError(false);
    setError(null);
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        onSuccess?.(result, variables);
        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError('Unknown error', 500);
        setIsError(true);
        setError(apiError);
        onError?.(apiError, variables);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, onSuccess, onError]
  );

  const mutate = useCallback(
    (variables: TVariables) => {
      mutateAsync(variables).catch(() => {
        // Error already handled in mutateAsync
      });
      return mutateAsync(variables);
    },
    [mutateAsync]
  );

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    error,
    data,
    reset,
  };
}

// ===== usePagination Hook =====

/**
 * Hook for managing pagination state
 */
export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationResult {
  const { initialPage = 1, initialLimit = 50 } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  const isFirstPage = page === 1;
  // isLastPage can't be determined without total items count
  const isLastPage = false; // Will be determined by the calling code

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    reset,
    isFirstPage,
    isLastPage,
    paginationParams: { page, limit },
  };
}

// ===== Re-export Common Hooks =====
// These hooks are defined in dedicated files to avoid duplication

export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';

// ===== useToggle Hook =====

/**
 * Hook for toggling boolean state
 */
export function useToggle(
  initialValue = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
}