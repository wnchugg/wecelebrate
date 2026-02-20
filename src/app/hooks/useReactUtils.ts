/**
 * React Hook Utilities
 * Provides custom hooks for common React patterns
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Re-export hooks from dedicated files
export { usePrevious } from './usePrevious';
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';

/**
 * Use boolean state with toggle, setTrue, setFalse helpers
 */
export function useBoolean(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);
  
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(v => !v), []);
  
  return {
    value,
    setValue,
    setTrue,
    setFalse,
    toggle,
  };
}

/**
 * Use throttled value
 */
export function useThrottle<T>(value: T, interval: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= interval) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, interval - (Date.now() - lastRan.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, interval]);
  
  return throttledValue;
}

/**
 * Use session storage with state synchronization
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue]
  );
  
  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(error);
    }
  }, [key, initialValue]);
  
  return [storedValue, setValue, removeValue];
}

/**
 * Use window size
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}

/**
 * Use media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    return window.matchMedia(query).matches;
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);
  
  return matches;
}

/**
 * Use click outside
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null);
  
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);
  
  return ref;
}

/**
 * Use intersection observer
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return () => {}; // Return empty cleanup
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [options]);
  
  return [ref, isIntersecting];
}

/**
 * Use interval
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return () => {}; // Return empty cleanup
    
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Use timeout
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return () => {}; // Return empty cleanup
    
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

/**
 * Use mounted state
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
 * Use update effect (skip first render)
 */
export function useUpdateEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Use async effect
 */
export function useAsyncEffect(
  effect: () => Promise<void | (() => void)>,
  deps?: React.DependencyList
) {
  useEffect(() => {
    const cleanup = effect();
    return () => {
      cleanup.then(cleanupFn => {
        if (typeof cleanupFn === 'function') {
          cleanupFn();
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Use clipboard
 */
export function useClipboard(timeout: number = 2000) {
  const [isCopied, setIsCopied] = useState(false);
  
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), timeout);
        return true;
      } catch {
        setIsCopied(false);
        return false;
      }
    },
    [timeout]
  );
  
  return { isCopied, copy };
}

/**
 * Use toggle
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  
  return [value, toggle, setValue];
}

/**
 * Use array state with helpers
 */
export function useArray<T>(initialValue: T[] = []) {
  const [array, setArray] = useState(initialValue);
  
  const push = useCallback((element: T) => {
    setArray(arr => [...arr, element]);
  }, []);
  
  const remove = useCallback((index: number) => {
    setArray(arr => arr.filter((_, i) => i !== index));
  }, []);
  
  const clear = useCallback(() => {
    setArray([]);
  }, []);
  
  const update = useCallback((index: number, element: T) => {
    setArray(arr => arr.map((item, i) => (i === index ? element : item)));
  }, []);
  
  return {
    array,
    set: setArray,
    push,
    remove,
    clear,
    update,
  };
}

/**
 * Use counter
 */
export function useCounter(initialValue: number = 0, step: number = 1) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + step), [step]);
  const decrement = useCallback(() => setCount(c => c - step), [step]);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return {
    count,
    increment,
    decrement,
    reset,
    set: setCount,
  };
}

/**
 * Use hover
 */
export function useHover<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T>,
  boolean
] {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);
  
  useEffect(() => {
    const node = ref.current;
    if (!node) return () => {}; // Return empty cleanup
    
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
    
    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  return [ref, isHovered];
}

/**
 * Use focus
 */
export function useFocus<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T>,
  boolean
] {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<T>(null);
  
  useEffect(() => {
    const node = ref.current;
    if (!node) return () => {}; // Return empty cleanup
    
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    
    node.addEventListener('focus', handleFocus);
    node.addEventListener('blur', handleBlur);
    
    return () => {
      node.removeEventListener('focus', handleFocus);
      node.removeEventListener('blur', handleBlur);
    };
  }, []);
  
  return [ref, isFocused];
}

/**
 * Use scroll position
 */
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState({
    x: window.pageXOffset,
    y: window.pageYOffset,
  });
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset,
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return scrollPosition;
}

/**
 * Use document title
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

/**
 * Use form field
 */
export function useFormField<T = string>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value as T);
  }, []);
  
  const onBlur = useCallback(() => {
    setTouched(true);
  }, []);
  
  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setTouched(false);
  }, [initialValue]);
  
  return {
    value,
    setValue,
    error,
    setError,
    touched,
    setTouched,
    onChange,
    onBlur,
    reset,
  };
}