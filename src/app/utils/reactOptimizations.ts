/**
 * P1.5 - React Component Optimization Utilities
 * 
 * Helper functions and hooks for optimizing React component performance
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// Re-export common hooks from dedicated files
export { useDebounce } from '../hooks/useDebounce';
export { useThrottle } from '../hooks/useThrottle';
export { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * Custom hook for detecting if component is mounted
 * Prevents state updates on unmounted components
 */
export function useIsMounted(): () => boolean {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

/**
 * Custom hook for previous value
 * Useful for comparing current vs previous props/state
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Custom hook for stable callback reference
 * Alternative to useCallback that doesn't require dependency array
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Custom hook for lazy initialization
 * Expensive computations that should only run once
 */
export function useLazyRef<T>(initializer: () => T): T {
  const ref = useRef<T | null>(null);
  
  if (ref.current === null) {
    ref.current = initializer();
  }
  
  return ref.current;
}

/**
 * Custom hook for window size with debouncing
 */
export function useWindowSize(debounceMs: number = 150) {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return () => {}; // Return empty cleanup

    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [debounceMs]);

  return size;
}

/**
 * Custom hook for intersection observer
 * Useful for lazy loading and infinite scroll
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return () => {}; // Return empty cleanup

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return entry;
}

/**
 * Utility function to create a memoized selector
 */
export function createMemoizedSelector<TInput, TOutput>(
  selector: (input: TInput) => TOutput
): (input: TInput) => TOutput {
  let lastInput: TInput | undefined;
  let lastOutput: TOutput | undefined;

  return (input: TInput): TOutput => {
    if (input === lastInput && lastOutput !== undefined) {
      return lastOutput;
    }

    lastInput = input;
    lastOutput = selector(input);
    return lastOutput;
  };
}

/**
 * Batch multiple state updates to prevent multiple re-renders
 * Note: React 18+ automatically batches updates, but this can be useful for older versions
 */
export function batchUpdates(callback: () => void): void {
  // In React 18+, all updates are automatically batched
  // This is a no-op but kept for API compatibility
  callback();
}

/**
 * Shallow comparison for props/state
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}