/**
 * Type Guards and Runtime Type Checking
 * Provides type-safe runtime checks for various data types
 */

// ==================== Primitive Type Guards ====================

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isNotEmpty<T>(value: T | null | undefined | ''): value is T {
  return isDefined(value) && value !== '';
}

// ==================== Object Type Guards ====================

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(guard);
}

export function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]] {
  return isArray(value) && value.length > 0;
}

// ==================== Function Type Guards ====================

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isAsyncFunction(value: unknown): value is (...args: any[]) => Promise<any> {
  return isFunction(value) && value.constructor.name === 'AsyncFunction';
}

// ==================== Date Type Guards ====================

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return isDate(date);
}

export function isISODateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoRegex.test(value);
}

// ==================== Validation Type Guards ====================

export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isUUID(value: unknown): value is string {
  if (!isString(value)) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isPhoneNumber(value: unknown): value is string {
  if (!isString(value)) return false;
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
}

export function isPostalCode(value: unknown, country: 'US' | 'UK' | 'CA' = 'US'): value is string {
  if (!isString(value)) return false;
  
  const patterns = {
    US: /^\d{5}(-\d{4})?$/,
    UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
  };
  
  return patterns[country].test(value);
}

// ==================== Numeric Type Guards ====================

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

export function isInRange(value: unknown, min: number, max: number): value is number {
  return isNumber(value) && value >= min && value <= max;
}

// ==================== Application-Specific Type Guards ====================

export interface WithId {
  id: string | number;
}

export function hasId(value: unknown): value is WithId {
  return isObject(value) && ('id' in value) && (isString(value.id) || isNumber(value.id));
}

export interface WithTimestamps {
  createdAt: string;
  updatedAt: string;
}

export function hasTimestamps(value: unknown): value is WithTimestamps {
  return (
    isObject(value) &&
    'createdAt' in value &&
    'updatedAt' in value &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

export interface WithStatus {
  status: string;
}

export function hasStatus(value: unknown): value is WithStatus {
  return isObject(value) && 'status' in value && isString(value.status);
}

// ==================== Error Type Guards ====================

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isErrorWithMessage(value: unknown): value is Error & { message: string } {
  return isError(value) && isString(value.message);
}

export function isErrorWithCode(value: unknown): value is Error & { code: string } {
  return isError(value) && 'code' in value && isString((value as any).code);
}

// ==================== Promise Type Guards ====================

export function isPromise<T = any>(value: unknown): value is Promise<T> {
  return (
    isObject(value) &&
    'then' in value &&
    isFunction(value.then) &&
    'catch' in value &&
    isFunction(value.catch)
  );
}

// ==================== Response Type Guards ====================

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export type Response<T = any> = SuccessResponse<T> | ErrorResponse;

export function isSuccessResponse<T>(response: unknown): response is SuccessResponse<T> {
  return (
    isObject(response) &&
    'success' in response &&
    response.success === true &&
    'data' in response
  );
}

export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    isObject(response) &&
    'success' in response &&
    response.success === false &&
    'error' in response &&
    isString(response.error)
  );
}

// ==================== Complex Type Guards ====================

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export function isPaginatedData<T>(value: unknown): value is PaginatedData<T> {
  return (
    isObject(value) &&
    'data' in value &&
    isArray(value.data) &&
    'pagination' in value &&
    isObject(value.pagination) &&
    'page' in value.pagination &&
    'pageSize' in value.pagination &&
    'totalPages' in value.pagination &&
    'totalItems' in value.pagination &&
    isNumber(value.pagination.page) &&
    isNumber(value.pagination.pageSize) &&
    isNumber(value.pagination.totalPages) &&
    isNumber(value.pagination.totalItems)
  );
}

// ==================== Key Checking ====================

export function hasKey<K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> {
  return isObject(value) && key in value;
}

export function hasKeys<K extends string>(
  value: unknown,
  keys: K[]
): value is Record<K, unknown> {
  return isObject(value) && keys.every(key => key in value);
}

export function hasRequiredKeys<T, K extends keyof T>(
  value: unknown,
  keys: K[]
): value is Required<Pick<T, K>> & Partial<Omit<T, K>> {
  if (!isObject(value)) return false;
  return keys.every(key => String(key) in value && isDefined(value[String(key)]));
}

// ==================== Assert Functions ====================

export function assertIsDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (!isDefined(value)) {
    throw new TypeError(message || 'Value must be defined');
  }
}

export function assertIsString(value: unknown, message?: string): asserts value is string {
  if (!isString(value)) {
    throw new TypeError(message || 'Value must be a string');
  }
}

export function assertIsNumber(value: unknown, message?: string): asserts value is number {
  if (!isNumber(value)) {
    throw new TypeError(message || 'Value must be a number');
  }
}

export function assertIsArray(value: unknown, message?: string): asserts value is unknown[] {
  if (!isArray(value)) {
    throw new TypeError(message || 'Value must be an array');
  }
}

export function assertIsObject(
  value: unknown,
  message?: string
): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new TypeError(message || 'Value must be an object');
  }
}

// ==================== Conversion Guards ====================

export function toNumber(value: unknown): number | null {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const num = Number(value);
    return isNumber(num) ? num : null;
  }
  return null;
}

export function toString(value: unknown): string {
  if (isString(value)) return value;
  if (isNumber(value) || isBoolean(value)) return String(value);
  if (isNull(value)) return '';
  if (isUndefined(value)) return '';
  if (isObject(value)) return JSON.stringify(value);
  return String(value);
}

export function toBoolean(value: unknown): boolean {
  if (isBoolean(value)) return value;
  if (isString(value)) {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') return true;
    if (lower === 'false' || lower === '0' || lower === 'no') return false;
  }
  if (isNumber(value)) return value !== 0;
  return Boolean(value);
}

// ==================== Safe Access ====================

export function safeGet<T>(
  obj: unknown,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!isObject(obj)) return defaultValue;
  
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (!isObject(current) || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return isDefined(current) ? current : defaultValue;
}

export function safeSet<T extends Record<string, any>>(
  obj: T,
  path: string,
  value: any
): T {
  if (!isObject(obj)) return obj;
  
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  if (!lastKey) return obj;
  
  let current: any = obj;
  
  for (const key of keys) {
    if (!isObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
  return obj;
}
