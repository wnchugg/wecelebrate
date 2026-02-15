/**
 * Storage Utility Functions
 * Provides safe localStorage and sessionStorage operations with error handling
 */

/**
 * Safely get item from localStorage
 */
export function getLocalStorage<T = string>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue ?? null;
    
    // Try to parse as JSON, fallback to string
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T;
    }
  } catch (error) {
    console.error(`Error reading from localStorage: ${error}`);
    return defaultValue ?? null;
  }
}

/**
 * Safely set item in localStorage
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage: ${error}`);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage: ${error}`);
    return false;
  }
}

/**
 * Safely clear all items from localStorage
 */
export function clearLocalStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
    return false;
  }
}

/**
 * Safely get item from sessionStorage
 */
export function getSessionStorage<T = string>(key: string, defaultValue?: T): T | null {
  try {
    const item = sessionStorage.getItem(key);
    if (item === null) return defaultValue ?? null;
    
    // Try to parse as JSON, fallback to string
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T;
    }
  } catch (error) {
    console.error(`Error reading from sessionStorage: ${error}`);
    return defaultValue ?? null;
  }
}

/**
 * Safely set item in sessionStorage
 */
export function setSessionStorage<T>(key: string, value: T): boolean {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error writing to sessionStorage: ${error}`);
    return false;
  }
}

/**
 * Safely remove item from sessionStorage
 */
export function removeSessionStorage(key: string): boolean {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from sessionStorage: ${error}`);
    return false;
  }
}

/**
 * Safely clear all items from sessionStorage
 */
export function clearSessionStorage(): boolean {
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing sessionStorage: ${error}`);
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if sessionStorage is available
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage size in bytes
 */
export function getStorageSize(storage: 'local' | 'session'): number {
  try {
    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    let size = 0;
    
    for (const key in storageObj) {
      if (Object.prototype.hasOwnProperty.call(storageObj, key)) {
        size += key.length + (storageObj[key]?.length || 0);
      }
    }
    
    return size;
  } catch {
    return 0;
  }
}

/**
 * Get all keys from storage
 */
export function getStorageKeys(storage: 'local' | 'session'): string[] {
  try {
    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    return Object.keys(storageObj);
  } catch {
    return [];
  }
}

/**
 * Storage with expiry support
 */
export function setStorageWithExpiry<T>(
  key: string,
  value: T,
  expiryMs: number,
  storage: 'local' | 'session' = 'local'
): boolean {
  const item = {
    value,
    expiry: Date.now() + expiryMs,
  };
  
  const setFn = storage === 'local' ? setLocalStorage : setSessionStorage;
  return setFn(key, item);
}

/**
 * Get storage item with expiry check
 */
export function getStorageWithExpiry<T>(
  key: string,
  storage: 'local' | 'session' = 'local'
): T | null {
  const getFn = storage === 'local' ? getLocalStorage : getSessionStorage;
  const item = getFn<{ value: T; expiry: number }>(key);
  
  if (!item) return null;
  
  // Check if expired
  if (Date.now() > item.expiry) {
    const removeFn = storage === 'local' ? removeLocalStorage : removeSessionStorage;
    removeFn(key);
    return null;
  }
  
  return item.value;
}
