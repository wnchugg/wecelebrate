/**
 * Performance Hook Utilities
 * Provides custom hooks for performance optimization
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Use lazy state (initialize state lazily)
 */
export function useLazyState<T>(initializer: () => T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initializer);
  return [state, setState];
}

/**
 * Use memo with dependencies comparison
 */
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();
  
  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }
  
  return ref.current.value;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Use render count (for debugging)
 */
export function useRenderCount(): number {
  const count = useRef(0);
  
  useEffect(() => {
    count.current++;
  });
  
  return count.current;
}

/**
 * Use render time (for performance monitoring)
 */
export function useRenderTime(componentName: string = 'Component') {
  const startTime = useRef<number>();
  
  if (!startTime.current) {
    startTime.current = performance.now();
  }
  
  useEffect(() => {
    if (startTime.current) {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      startTime.current = undefined;
    }
  });
}

/**
 * Use why did you update (debug re-renders)
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });
      
      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previousProps.current = props;
  });
}

/**
 * Use constant (value that never changes)
 */
export function useConstant<T>(initializer: () => T): T {
  const ref = useRef<T>();
  
  if (ref.current === undefined) {
    ref.current = initializer();
  }
  
  return ref.current;
}

/**
 * Use event callback (stable callback reference)
 */
export function useEventCallback<T extends (...args: any[]) => any>(
  fn: T
): T {
  const ref = useRef<T>(fn);
  
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  
  return useCallback(
    ((...args: any[]) => ref.current(...args)) as T,
    []
  );
}

/**
 * Use deferred value (for concurrent rendering)
 */
export function useDeferredValue<T>(value: T, delay: number = 100): T {
  const [deferredValue, setDeferredValue] = useState(value);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDeferredValue(value);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [value, delay]);
  
  return deferredValue;
}

/**
 * Use virtual list (for large lists)
 */
export function useVirtualList<T>(
  items: T[],
  options: {
    containerHeight: number;
    itemHeight: number;
    overscan?: number;
  }
) {
  const { containerHeight, itemHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      offsetTop: (startIndex + index) * itemHeight,
    }));
  }, [items, startIndex, endIndex, itemHeight]);
  
  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight,
    onScroll,
  };
}

/**
 * Use batch state updates
 */
export function useBatchState<T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void, () => void] {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef<Partial<T>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  const batchUpdate = useCallback((updates: Partial<T>) => {
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, ...pendingUpdates.current }));
      pendingUpdates.current = {};
    }, 0);
  }, []);
  
  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setState(prev => ({ ...prev, ...pendingUpdates.current }));
    pendingUpdates.current = {};
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [state, batchUpdate, flushUpdates];
}

/**
 * Use requestAnimationFrame
 */
export function useAnimationFrame(callback: (time: number) => void, deps: React.DependencyList = []) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        callback(time);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Use idle callback (run when browser is idle)
 */
export function useIdleCallback(
  callback: () => void,
  options?: IdleRequestOptions
) {
  useEffect(() => {
    if (!('requestIdleCallback' in window)) {
      const timeoutId = setTimeout(callback, 1);
      return () => clearTimeout(timeoutId);
    }
    
    const idleId = requestIdleCallback(callback, options);
    
    return () => {
      cancelIdleCallback(idleId);
    };
  }, [callback, options]);
}

/**
 * Use network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

/**
 * Use battery status
 */
export function useBatteryStatus() {
  const [battery, setBattery] = useState<{
    charging: boolean;
    level: number;
    chargingTime: number;
    dischargingTime: number;
  } | null>(null);
  
  useEffect(() => {
    if (!('getBattery' in navigator)) return;
    
    (navigator as any).getBattery().then((battery: any) => {
      const updateBattery = () => {
        setBattery({
          charging: battery.charging,
          level: battery.level,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        });
      };
      
      updateBattery();
      
      battery.addEventListener('chargingchange', updateBattery);
      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingtimechange', updateBattery);
      battery.addEventListener('dischargingtimechange', updateBattery);
      
      return () => {
        battery.removeEventListener('chargingchange', updateBattery);
        battery.removeEventListener('levelchange', updateBattery);
        battery.removeEventListener('chargingtimechange', updateBattery);
        battery.removeEventListener('dischargingtimechange', updateBattery);
      };
    });
  }, []);
  
  return battery;
}

/**
 * Use memory status
 */
export function useMemoryStatus() {
  const [memory, setMemory] = useState<{
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  } | null>(null);
  
  useEffect(() => {
    if (!('memory' in performance)) return () => {}; // Return empty cleanup
    
    const updateMemory = () => {
      const mem = (performance as any).memory;
      setMemory({
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
        totalJSHeapSize: mem.totalJSHeapSize,
        usedJSHeapSize: mem.usedJSHeapSize,
      });
    };
    
    updateMemory();
    const intervalId = setInterval(updateMemory, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return memory;
}