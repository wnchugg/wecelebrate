/**
 * Object Utility Functions
 * Provides object manipulation and transformation utilities
 */

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          (output as Record<string, any>)[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Check if a value is a plain object
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Pick specified keys from an object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Omit specified keys from an object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  
  for (const key of keys) {
    delete result[key];
  }
  
  return result;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

/**
 * Check if two objects are deeply equal
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get nested property value using dot notation
 */
export function get<T = any>(obj: any, path: string, defaultValue?: T): T {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
}

/**
 * Set nested property value using dot notation
 */
export function set<T extends Record<string, any>>(obj: T, path: string, value: any): T {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      (current as Record<string, any>)[key] = {};
    }
    current = current[key];
  }

  (current as Record<string, any>)[lastKey] = value;
  return obj;
}

/**
 * Check if object has a nested property
 */
export function has(obj: any, path: string): boolean {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || !(key in current)) {
      return false;
    }
    current = current[key];
  }
  
  return true;
}

/**
 * Flatten a nested object
 */
export function flatten(obj: Record<string, any>, prefix: string = ''): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (isObject(obj[key]) && !Array.isArray(obj[key])) {
        Object.assign(result, flatten(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  
  return result;
}

/**
 * Unflatten a flat object (reverse of flatten)
 */
export function unflatten(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      set(result, key, obj[key]);
    }
  }
  
  return result;
}

/**
 * Get all keys of an object including nested keys
 */
export function deepKeys(obj: Record<string, any>, prefix: string = ''): string[] {
  const keys: string[] = [];
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      keys.push(newKey);
      
      if (isObject(obj[key]) && !Array.isArray(obj[key])) {
        keys.push(...deepKeys(obj[key], newKey));
      }
    }
  }
  
  return keys;
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: Record<string, any> | null | undefined): boolean {
  return !obj || Object.keys(obj).length === 0;
}

/**
 * Map object values
 */
export function mapValues<T extends Record<string, any>, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = fn(obj[key], key);
    }
  }
  
  return result;
}

/**
 * Map object keys
 */
export function mapKeys<T extends Record<string, any>>(
  obj: T,
  fn: (key: keyof T) => string
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[fn(key)] = obj[key];
    }
  }
  
  return result;
}

/**
 * Filter object by predicate
 */
export function filter<T extends Record<string, any>>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && predicate(obj[key], key)) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Invert object keys and values
 */
export function invert<T extends Record<string, string | number>>(obj: T): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[String(obj[key])] = key;
    }
  }
  
  return result;
}

/**
 * Get object entries with proper typing
 */
export function entries<T extends Record<string, any>>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * Get object keys with proper typing
 */
export function keys<T extends Record<string, any>>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * Get object values with proper typing
 */
export function values<T extends Record<string, any>>(obj: T): T[keyof T][] {
  return Object.values(obj) as T[keyof T][];
}
