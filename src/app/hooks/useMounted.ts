/**
 * useMounted Hook
 * Check if component is currently mounted
 */

import { useEffect, useRef, useCallback } from 'react';

export function useMounted(): () => boolean {
  const mountedRef = useRef(false);
  
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  const isMounted = useCallback(() => mountedRef.current, []);
  
  return isMounted;
}
