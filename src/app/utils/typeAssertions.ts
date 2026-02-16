/**
 * Type Assertion Utilities
 * Helper functions for type assertions and narrowing
 */

/**
 * Assert a value is defined (not null or undefined)
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value is null or undefined');
  }
}

/**
 * Assert a value is not null
 */
export function assertNotNull<T>(
  value: T | null,
  message?: string
): asserts value is T {
  if (value === null) {
    throw new Error(message || 'Value is null');
  }
}

/**
 * Assert a value is truthy
 */
export function assertTruthy<T>(
  value: T,
  message?: string
): asserts value is Exclude<T, false | 0 | '' | null | undefined> {
  if (!value) {
    throw new Error(message || 'Value is falsy');
  }
}

/**
 * Assert a condition is true
 */
export function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Assert unreachable code (for exhaustive checks)
 */
export function assertUnreachable(value: never, message?: string): never {
  throw new Error(message || `Unreachable code reached with value: ${String(value)}`);
}

/**
 * Check if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if value is not null
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Check if value is string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if value is number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if value is boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Check if value is function
 */
export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function';
}

/**
 * Check if value is object (not null, not array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if value is array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Check if value is Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if value is Promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (
    isObject(value) &&
    'then' in value &&
    isFunction(value.then)
  );
}

/**
 * Check if value is Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (isNullish(value)) return true;
  if (isString(value)) return value.trim().length === 0;
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if value is not empty
 */
export function isNotEmpty<T>(value: T | null | undefined): value is T {
  return !isEmpty(value);
}

/**
 * Check if string is valid email
 */
export function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Check if string is valid URL
 */
export function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is valid UUID
 */
export function isUuid(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Check if value is valid JSON string
 */
export function isJsonString(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe type cast with validation
 */
export function safeCast<T>(
  value: unknown,
  validator: (val: unknown) => val is T,
  fallback: T
): T {
  return validator(value) ? value : fallback;
}

/**
 * Get type name of value
 */
export function getTypeName(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (value instanceof Error) return 'error';
  if (value instanceof Promise) return 'promise';
  return typeof value;
}

/**
 * Ensure value is array
 */
export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Narrow type to specific string literal
 */
export function isLiteral<T extends string>(
  value: string,
  literals: readonly T[]
): value is T {
  return literals.includes(value as T);
}

/**
 * Check if value has property
 */
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

/**
 * Check if value has properties
 */
export function hasProperties<K extends string>(
  obj: unknown,
  keys: readonly K[]
): obj is Record<K, unknown> {
  return isObject(obj) && keys.every(key => key in obj);
}

/**
 * Type-safe Object.keys
 */
export function objectKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Type-safe Object.entries
 */
export function objectEntries<T extends object>(
  obj: T
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Type-safe Object.values
 */
export function objectValues<T extends object>(obj: T): Array<T[keyof T]> {
  return Object.values(obj) as Array<T[keyof T]>;
}

/**
 * Type-safe Object.fromEntries
 */
export function objectFromEntries<K extends string | number | symbol, V>(
  entries: Iterable<readonly [K, V]>
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

/**
 * Exhaustive switch helper
 */
export function exhaustive(_value: never): never {
  throw new Error('Exhaustive check failed');
}

/**
 * Type predicate combiner (AND)
 */
export function and<T, U>(
  predA: (val: unknown) => val is T,
  predB: (val: unknown) => val is U
): (val: unknown) => val is T & U {
  return (val): val is T & U => predA(val) && predB(val);
}

/**
 * Type predicate combiner (OR)
 */
export function or<T, U>(
  predA: (val: unknown) => val is T,
  predB: (val: unknown) => val is U
): (val: unknown) => val is T | U {
  return (val): val is T | U => predA(val) || predB(val);
}

/**
 * Negate type predicate
 */
export function not<T>(
  pred: (val: unknown) => val is T
): (val: unknown) => boolean {
  return (val): boolean => !pred(val);
}
