// Global utility types and helpers

// Make all properties of T optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Make specific keys of T required
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Make specific keys of T optional
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Extract non-nullable fields from T
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

// Async function type
export type AsyncFunction<T = void> = (...args: any[]) => Promise<T>;

// Extract promise result type
export type PromiseType<T> = T extends Promise<infer U> ? U : T;

// JSON-serializable types
export type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONValue[] 
  | { [key: string]: JSONValue };

export type JSONObject = { [key: string]: JSONValue };

// API Response helpers
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: string;
}

export type ApiResult<T = unknown> = ApiSuccess<T> | ApiError;

// Pagination types
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationInfo;
}

// Sort and filter types
export type SortOrder = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  order: SortOrder;
}

export interface FilterConfig<T> {
  field: keyof T;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

// Form types
export type FormErrors<T> = Partial<Record<keyof T, string>>;

export type FormTouched<T> = Partial<Record<keyof T, boolean>>;

export interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Event handler types
export type InputChangeHandler = React.ChangeEvent<HTMLInputElement>;
export type TextareaChangeHandler = React.ChangeEvent<HTMLTextAreaElement>;
export type SelectChangeHandler = React.ChangeEvent<HTMLSelectElement>;
export type FormSubmitHandler = React.FormEvent<HTMLFormElement>;
export type ButtonClickHandler = React.MouseEvent<HTMLButtonElement>;

// Component prop types
export type WithClassName<T = {}> = T & { className?: string };
export type WithChildren<T = {}> = T & { children?: React.ReactNode };
export type WithOptionalChildren<T = {}> = T & { children?: React.ReactNode };

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStatus {
  status: Status;
  error?: string;
}

// ID types
export type ID = string | number;
export type UUID = string;

// Timestamp types
export type ISODateString = string;
export type UnixTimestamp = number;

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Role types
export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

// Type guards
export function isApiSuccess<T>(result: ApiResult<T>): result is ApiSuccess<T> {
  return result.success === true;
}

export function isApiError(result: ApiResult<any>): result is ApiError {
  return result.success === false;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T = any>(value: unknown): value is T[] {
  return Array.isArray(value);
}
