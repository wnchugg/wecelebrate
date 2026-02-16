import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for throttling a callback function
 * @param callback - The function to throttle
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The throttled callback function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const lastRan = useRef<number>(0); // Start at 0 so first call executes immediately
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRan.current;

      if (timeSinceLastRun >= delay) {
        callback(...args);
        lastRan.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastRan.current = Date.now();
          },
          delay - timeSinceLastRun
        );
      }
    },
    [callback, delay]
  );
}
