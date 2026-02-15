/**
 * Performance Optimization Hooks
 * Custom hooks for performance monitoring and optimization
 * Phase 2.3: Performance Optimization
 */

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';
import { logger } from '../utils/logger';

// Re-export hooks from dedicated files to avoid duplication
export { useDebounce } from './useDebounce';
export { useThrottle } from './useThrottle';

/**
 * Hook to measure component render time
 */
export function useRenderTime(componentName: string, enabled = true) {
  const renderStart = useRef<number>(0);

  if (enabled) {
    renderStart.current = performance.now();
  }

  useEffect(() => {
    if (enabled) {
      const renderTime = performance.now() - renderStart.current;
      performanceMonitor.recordMetric(`${componentName} render`, renderTime);
    }
  });
}

/**
 * Hook to measure component mount time
 */
export function useMountTime(componentName: string, enabled = true) {
  useEffect(() => {
    if (!enabled) return () => {}; // Return empty cleanup

    const mountStart = performance.now();

    return () => {
      const mountTime = performance.now() - mountStart;
      performanceMonitor.recordMetric(`${componentName} mount duration`, mountTime);
    };
  }, [componentName, enabled]);
}

/**
 * Hook to track re-renders and their causes
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        logger.log(`[WhyDidYouUpdate] ${name}`, changedProps);
      }
    }

    previousProps.current = props;
  });
}

/**
 * Hook to measure async operation time
 */
export function useMeasureAsync() {
  return useCallback(async <T,>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    return performanceMonitor.measureAsync(name, fn);
  }, []);
}

/**
 * Hook to detect slow renders
 */
export function useSlowRenderDetection(
  componentName: string,
  threshold = 16 // 16ms = 60fps
) {
  const renderStart = useRef<number>(0);
  renderStart.current = performance.now();

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    
    if (renderTime > threshold) {
      logger.warn(
        `[SlowRender] ${componentName} took ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }
  });
}

/**
 * Hook for intersection observer (lazy loading, infinite scroll)
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  useEffect(() => {
    if (!ref.current) return () => {}; // Return empty cleanup

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Hook for media query matching (responsive design)
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

/**
 * Hook for window size tracking (optimized)
 */
export function useWindowSize() {
  const [size, setSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 150); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}

/**
 * Hook for idle callback (run code when browser is idle)
 */
export function useIdleCallback(callback: () => void, deps: React.DependencyList) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(callback);
      return () => (window as any).cancelIdleCallback(id);
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeout = setTimeout(callback, 1);
      return () => clearTimeout(timeout);
    }
  }, deps);
}

/**
 * Hook for memoizing expensive computations with cache
 */
export function useMemoWithCache<T>(
  factory: () => T,
  deps: React.DependencyList,
  cacheKey?: string
): T {
  const cache = useRef<Map<string, T>>(new Map());
  
  return useMemo(() => {
    if (cacheKey && cache.current.has(cacheKey)) {
      return cache.current.get(cacheKey);
    }

    const value = factory();
    
    if (cacheKey) {
      cache.current.set(cacheKey, value);
    }

    return value;
  }, deps);
}

/**
 * Hook to batch state updates (reduce re-renders)
 */
export function useBatchedUpdates() {
  const pendingUpdates = useRef<Array<() => void>>([]);
  const rafId = useRef<number | null>(null);

  const flush = useCallback(() => {
    const updates = pendingUpdates.current;
    pendingUpdates.current = [];
    rafId.current = null;

    React.startTransition(() => {
      updates.forEach(update => update());
    });
  }, []);

  const batchUpdate = useCallback((update: () => void) => {
    pendingUpdates.current.push(update);

    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(flush);
    }
  }, [flush]);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return batchUpdate;
}