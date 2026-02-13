/**
 * useAsyncEffect Hook
 * Run async effects in useEffect
 */

import { useEffect, DependencyList } from 'react';

export function useAsyncEffect(
  effect: () => Promise<void | (() => void)>,
  deps?: DependencyList
): void {
  useEffect(() => {
    let cleanup: void | (() => void);
    let cancelled = false;
    
    const runEffect = async () => {
      cleanup = await effect();
    };
    
    runEffect();
    
    return () => {
      cancelled = true;
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, deps);
}
