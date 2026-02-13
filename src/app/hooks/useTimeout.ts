/**
 * useTimeout Hook
 * Declarative setTimeout
 */

import { useEffect, useRef, useCallback } from 'react';

export function useTimeout(callback: () => void, delay: number | null): {
  reset: () => void;
  clear: () => void;
} {
  const savedCallback = useRef(callback);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  const clear = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, []);
  
  const reset = useCallback(() => {
    clear();
    
    if (delay !== null) {
      timeoutId.current = setTimeout(() => {
        savedCallback.current();
      }, delay);
    }
  }, [delay, clear]);
  
  useEffect(() => {
    reset();
    return clear;
  }, [delay, reset, clear]);
  
  return { reset, clear };
}
