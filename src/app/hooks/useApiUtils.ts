/**
 * API Hook Utilities
 * Provides custom hooks for API calls and data fetching
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * API request state
 */
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Use API fetch with automatic loading and error states
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = []
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  
  const isMounted = useRef(true);
  
  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await fetcher();
      
      if (isMounted.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (isMounted.current) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }
  }, [fetcher]);
  
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return {
    ...state,
    refetch: fetchData,
  };
}

/**
 * Use lazy API (fetch on demand)
 */
export function useLazyApi<T, A extends any[] = []>(
  fetcher: (...args: A) => Promise<T>
): [
  (...args: A) => Promise<void>,
  ApiState<T> & { reset: () => void }
] {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const isMounted = useRef(true);
  
  const execute = useCallback(
    async (...args: A) => {
      setState({ data: null, loading: true, error: null });
      
      try {
        const data = await fetcher(...args);
        
        if (isMounted.current) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted.current) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    },
    [fetcher]
  );
  
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return [execute, { ...state, reset }];
}

/**
 * Use mutation (for POST, PUT, DELETE, etc.)
 */
export function useMutation<T, A extends any[] = []>(
  mutationFn: (...args: A) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): [
  (...args: A) => Promise<void>,
  ApiState<T> & { reset: () => void }
] {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const isMounted = useRef(true);
  
  const mutate = useCallback(
    async (...args: A) => {
      setState({ data: null, loading: true, error: null });
      
      try {
        const data = await mutationFn(...args);
        
        if (isMounted.current) {
          setState({ data, loading: false, error: null });
          options?.onSuccess?.(data);
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        if (isMounted.current) {
          setState({ data: null, loading: false, error: errorObj });
          options?.onError?.(errorObj);
        }
      }
    },
    [mutationFn, options]
  );
  
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return [mutate, { ...state, reset }];
}

/**
 * Use paginated API
 */
export function usePaginatedApi<T>(
  fetcher: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  options?: {
    initialPage?: number;
    pageSize?: number;
  }
) {
  const { initialPage = 1, pageSize = 10 } = options || {};
  
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const isMounted = useRef(true);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher(page, pageSize);
      
      if (isMounted.current) {
        setData(result.data);
        setTotal(result.total);
        setLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }
  }, [fetcher, page, pageSize]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const nextPage = useCallback(() => {
    if (page * pageSize < total) {
      setPage(p => p + 1);
    }
  }, [page, pageSize, total]);
  
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  }, [page]);
  
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  
  return {
    data,
    total,
    loading,
    error,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: page * pageSize < total,
    hasPrevPage: page > 1,
    nextPage,
    prevPage,
    goToPage,
    refetch: fetchData,
  };
}

/**
 * Use infinite scroll API
 */
export function useInfiniteApi<T>(
  fetcher: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options?: {
    pageSize?: number;
  }
) {
  const { pageSize = 10 } = options || {};
  
  const [page, setPage] = useState(1);
  const [data, setData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const isMounted = useRef(true);
  const isLoadingRef = useRef(false);
  
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher(page, pageSize);
      
      if (isMounted.current) {
        setData(prev => [...prev, ...result.data]);
        setHasMore(result.hasMore);
        setPage(p => p + 1);
        setLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    } finally {
      isLoadingRef.current = false;
    }
  }, [fetcher, page, pageSize, hasMore]);
  
  const reset = useCallback(() => {
    setPage(1);
    setData([]);
    setHasMore(true);
    setError(null);
  }, []);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
}

/**
 * Use polling API (fetch at regular intervals)
 */
export function usePollingApi<T>(
  fetcher: () => Promise<T>,
  interval: number,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): ApiState<T> & { refetch: () => Promise<void>; stopPolling: () => void } {
  const { enabled = true, onSuccess, onError } = options || {};
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  
  const isMounted = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      const data = await fetcher();
      
      if (isMounted.current) {
        setState({ data, loading: false, error: null });
        onSuccess?.(data);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      if (isMounted.current) {
        setState({ data: null, loading: false, error: errorObj });
        onError?.(errorObj);
      }
    }
  }, [fetcher, onSuccess, onError]);
  
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return () => {}; // Return empty cleanup
    }
    
    fetchData();
    intervalRef.current = setInterval(fetchData, interval);
    
    return () => {
      stopPolling();
    };
  }, [enabled, interval, fetchData, stopPolling]);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return {
    ...state,
    refetch: fetchData,
    stopPolling,
  };
}

/**
 * Use optimistic update
 */
export function useOptimisticUpdate<T>(
  fetcher: () => Promise<T>,
  updater: (data: T | null, optimisticData: Partial<T>) => T | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const isMounted = useRef(true);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    
    try {
      const result = await fetcher();
      
      if (isMounted.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }
  }, [fetcher]);
  
  const optimisticUpdate = useCallback(
    (optimisticData: Partial<T>) => {
      setData(prev => updater(prev, optimisticData));
    },
    [updater]
  );
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return {
    data,
    loading,
    error,
    refetch: fetchData,
    optimisticUpdate,
  };
}