/**
 * Common Types and Patterns
 * Shared types used across the application
 */

// ==================== Callback Types ====================

export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;
export type Callback<T> = (value: T) => void;
export type AsyncCallback<T> = (value: T) => Promise<void>;
export type BiCallback<T, U> = (first: T, second: U) => void;
export type AsyncBiCallback<T, U> = (first: T, second: U) => Promise<void>;

// ==================== Event Handler Types ====================

export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;
export type ClickHandler<T = HTMLButtonElement> = (event: React.MouseEvent<T>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type KeyboardHandler = (event: React.KeyboardEvent) => void;
export type FocusHandler = (event: React.FocusEvent) => void;

// ==================== Component Prop Types ====================

export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children?: React.ReactNode;
}

export interface WithStyle {
  style?: React.CSSProperties;
}

export interface WithDisabled {
  disabled?: boolean;
}

export interface WithLoading {
  loading?: boolean;
  isLoading?: boolean;
}

export interface WithError {
  error?: string | null;
}

export interface WithDataTestId {
  'data-testid'?: string;
}

// Combined common props
export type CommonProps = WithClassName & WithChildren & WithDataTestId;

// ==================== Form Field Types ====================

export interface BaseField {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

export interface TextField extends BaseField {
  type: 'text' | 'email' | 'password' | 'tel' | 'url';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface NumberField extends BaseField {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectField extends BaseField {
  type: 'select';
  options: Array<{ label: string; value: string | number }>;
  multiple?: boolean;
}

export interface CheckboxField extends BaseField {
  type: 'checkbox';
  checked?: boolean;
}

export interface TextAreaField extends BaseField {
  type: 'textarea';
  rows?: number;
  cols?: number;
  minLength?: number;
  maxLength?: number;
}

export type FormFieldType = TextField | NumberField | SelectField | CheckboxField | TextAreaField;

// ==================== Modal/Dialog Types ====================

export interface ModalProps extends CommonProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: VoidCallback;
  title?: string;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export interface DialogProps extends ModalProps {
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: VoidCallback | AsyncVoidCallback;
  onCancel?: VoidCallback;
  variant?: 'default' | 'destructive' | 'warning';
}

// ==================== Table Types ====================

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface TableRow {
  id: string | number;
  [key: string]: any;
}

export interface TableProps<T = TableRow> extends CommonProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: Callback<T>;
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: Callback<Set<string | number>>;
}

// ==================== List/Collection Types ====================

export interface ListItem {
  id: string | number;
  label: string;
  value?: any;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface ListProps<T = ListItem> extends CommonProps {
  items: T[];
  onItemClick?: Callback<T>;
  selectedItem?: T;
  loading?: boolean;
  emptyMessage?: string;
  renderItem?: (item: T, index: number) => React.ReactNode;
}

// ==================== Pagination Types ====================

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: Callback<number>;
  pageSize?: number;
  onPageSizeChange?: Callback<number>;
  pageSizeOptions?: number[];
}

// ==================== Sort/Filter Types ====================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T = any> {
  key: keyof T | string;
  direction: SortDirection;
}

export interface FilterConfig<T = any> {
  key: keyof T | string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

export interface SearchConfig {
  query: string;
  fields?: string[];
  caseSensitive?: boolean;
}

// ==================== API Response Types ====================

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, any>;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: PaginationInfo;
  meta?: Record<string, any>;
}

// ==================== Loading State Types ====================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  status: LoadingState;
  data: T | null;
  error: string | null;
}

export interface AsyncActionState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
}

// ==================== File Upload Types ====================

export interface FileUploadProps extends CommonProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onFileSelect: Callback<File[]>;
  onError?: Callback<string>;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: Date;
}

// ==================== Notification/Toast Types ====================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: VoidCallback;
  };
}

// ==================== Route/Navigation Types ====================

export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  protected?: boolean;
  redirect?: string;
  meta?: {
    title?: string;
    description?: string;
    requiresAuth?: boolean;
    roles?: string[];
  };
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

// ==================== Theme/Style Types ====================

export type ColorScheme = 'light' | 'dark' | 'auto';
export type ThemeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'solid' | 'outline' | 'ghost' | 'link';

// ==================== Type Guards ====================

export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.success === true;
}

export function isErrorResponse(response: ApiResponse<any>): response is ErrorResponse {
  return response.success === false;
}

export function isPaginatedResponse<T>(response: any): response is PaginatedResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    response.success === true &&
    Array.isArray(response.data) &&
    response.pagination &&
    typeof response.pagination === 'object'
  );
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isNotEmpty<T>(value: T | null | undefined | ''): value is T {
  return isDefined(value) && value !== '';
}

// ==================== Utility Types ====================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

// ==================== Date/Time Types ====================

export type DateString = string; // ISO 8601 format
export type TimeString = string; // HH:mm:ss format
export type DateTimeString = string; // ISO 8601 with time
export type Timestamp = number; // Unix timestamp in milliseconds

export interface DateRange {
  start: Date | DateString;
  end: Date | DateString;
}

export interface TimeRange {
  start: TimeString;
  end: TimeString;
}

// ==================== ID Types ====================

export type ID = string | number;
export type UUID = string;
export type SlugID = string;

// ==================== Generic Handlers ====================

export type ChangeValueHandler<T> = (value: T) => void;
export type AsyncChangeValueHandler<T> = (value: T) => Promise<void>;
export type UpdateHandler<T> = (updates: Partial<T>) => void;
export type AsyncUpdateHandler<T> = (updates: Partial<T>) => Promise<void>;
