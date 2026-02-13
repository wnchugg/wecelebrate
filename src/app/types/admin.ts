/**
 * Admin Component Types
 * 
 * Comprehensive type definitions for admin components to eliminate all `any` types.
 * Organized by feature area for maintainability.
 */

// ==================== Employee Import Types ====================

/**
 * Template row for employee CSV/Excel import
 */
export interface EmployeeTemplateRow {
  'Email': string;
  'First Name': string;
  'Last Name': string;
  'Department': string;
  'Employee ID'?: string;
  'Serial Card'?: string;
}

/**
 * Parsed employee data from CSV import
 */
export interface ParsedEmployee {
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  employeeId?: string;
  serialCard?: string;
  [key: string]: string | undefined; // Allow additional fields
}

/**
 * Employee import validation result
 */
export interface EmployeeValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// ==================== SFTP Configuration Types ====================

/**
 * SFTP configuration schedule options
 */
export type SftpSchedule = 'manual' | 'hourly' | 'daily' | 'weekly';

/**
 * Union type for SFTP configuration values
 */
export type SftpConfigValue = string | number | boolean | SftpSchedule;

/**
 * SFTP configuration object
 */
export interface SftpConfig {
  id?: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  remotePath: string;
  enabled: boolean;
  schedule: SftpSchedule;
  scheduleTime?: string;
  authMethod?: 'password' | 'key';
  filePattern?: string;
  autoProcess?: boolean;
  deleteAfterImport?: boolean;
  status?: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

/**
 * SFTP test result
 */
export interface SftpTestResult {
  success: boolean;
  message: string;
  details?: {
    filesFound?: number;
    connectionTime?: number;
    error?: string;
  };
}

// ==================== Store Location Types ====================

/**
 * Store location object (admin variant)
 */
export interface AdminStoreLocation {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  active: boolean;
}

/**
 * Union type for store location values
 */
export type StoreLocationValue = string | boolean;

// ==================== Schedule Execution Types ====================

/**
 * Schedule execution status
 */
export type ScheduleExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Schedule execution log entry
 */
export interface ScheduleExecutionLog {
  id: string;
  scheduleId: string;
  executionTime: string;
  status: ScheduleExecutionStatus;
  duration: number;
  recordsProcessed: number;
  recordsFailed: number;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Schedule definition
 */
export interface Schedule {
  id: string;
  name: string;
  type: 'import' | 'export' | 'sync';
  frequency: SftpSchedule;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  erpConnectionId?: string;
}

/**
 * Schedule execution result
 */
export interface ScheduleExecutionResult {
  success: boolean;
  message: string;
  recordsProcessed?: number;
  recordsFailed?: number;
  executionTime?: number;
}

// ==================== HRIS Integration Types ====================

/**
 * HRIS authentication type
 */
export type HRISAuthType = 'api_key' | 'oauth' | 'basic_auth' | 'sftp';

/**
 * HRIS provider
 */
export type HRISProvider = 'workday' | 'bamboohr' | 'adp' | 'namely' | 'custom';

/**
 * HRIS API credentials (union type for different auth methods)
 */
export type HRISCredentials =
  | { type: 'api_key'; apiKey: string; apiSecret?: string }
  | { type: 'oauth'; clientId: string; clientSecret: string; accessToken?: string; refreshToken?: string }
  | { type: 'basic_auth'; username: string; password: string }
  | { type: 'sftp'; host: string; port: number; username: string; password?: string; privateKey?: string };

/**
 * HRIS connection configuration
 */
export interface HRISConnection {
  id?: string;
  clientId: string;
  provider: HRISProvider;
  displayName?: string;
  providerName?: string;
  status: 'active' | 'inactive' | 'error';
  authType: HRISAuthType;
  credentials: HRISCredentials;
  fieldMapping: Record<string, string>;
  syncSchedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    enabled: boolean;
    lastSync?: string;
    nextSync?: string;
  };
  syncConfig?: {
    autoImport: boolean;
    updateExisting: boolean;
    deactivateMissing: boolean;
    notifyOnSync: boolean;
  };
  lastSync?: string;
  nextSync?: string;
  siteId?: string | null;
  siteIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * HRIS sync result
 */
export interface HRISSyncResult {
  success: boolean;
  recordsSynced: number;
  recordsFailed: number;
  errors?: string[];
  syncTime: number;
}

/**
 * HRIS field mapping
 */
export interface HRISFieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: 'uppercase' | 'lowercase' | 'trim' | 'date_format';
  required: boolean;
}

// ==================== Backend Health Types ====================

/**
 * Health check status
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: HealthStatus;
  responseTime: number;
  timestamp: string;
  message?: string;
  details?: {
    database?: boolean;
    storage?: boolean;
    auth?: boolean;
    [key: string]: boolean | undefined;
  };
}

/**
 * Database test result
 */
export interface DatabaseTestResult {
  success: boolean;
  responseTime: number;
  error?: string;
  details?: {
    connectionActive: boolean;
    queryExecuted: boolean;
    recordsFound?: number;
  };
}

// ==================== Admin Dashboard Types ====================

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalClients: number;
  totalSites: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  pendingOrders: number;
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  id: string;
  type: 'order' | 'user' | 'client' | 'site' | 'error';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// ==================== Bulk Operations Types ====================

/**
 * Bulk operation status
 */
export type BulkOperationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  id: string;
  operation: string;
  status: BulkOperationStatus;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  errors?: Array<{
    record: number;
    message: string;
  }>;
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

// ==================== Export Types ====================

/**
 * Export format
 */
export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
  fields?: string[];
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Export result
 */
export interface ExportResult {
  success: boolean;
  fileName: string;
  recordCount: number;
  fileSize: number;
  downloadUrl?: string;
  error?: string;
}

// ==================== Type Guards ====================

/**
 * Type guard for HRIS credentials
 */
export function isApiKeyCredentials(creds: HRISCredentials): creds is Extract<HRISCredentials, { type: 'api_key' }> {
  return creds.type === 'api_key';
}

export function isOAuthCredentials(creds: HRISCredentials): creds is Extract<HRISCredentials, { type: 'oauth' }> {
  return creds.type === 'oauth';
}

export function isBasicAuthCredentials(creds: HRISCredentials): creds is Extract<HRISCredentials, { type: 'basic_auth' }> {
  return creds.type === 'basic_auth';
}

export function isSftpCredentials(creds: HRISCredentials): creds is Extract<HRISCredentials, { type: 'sftp' }> {
  return creds.type === 'sftp';
}

/**
 * Type guard for schedule execution log
 */
export function isScheduleExecutionLog(obj: unknown): obj is ScheduleExecutionLog {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'scheduleId' in obj &&
    'status' in obj
  );
}

/**
 * Type guard for health check result
 */
export function isHealthCheckResult(obj: unknown): obj is HealthCheckResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'status' in obj &&
    'responseTime' in obj &&
    'timestamp' in obj
  );
}

// ==================== Utility Types ====================

/**
 * Form field state for admin forms
 */
export interface FormFieldState<T> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * Async operation state
 */
export interface AsyncOperationState<T = unknown> {
  loading: boolean;
  error?: string;
  data?: T;
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Sort state
 */
export interface SortState<T = string> {
  field: T;
  direction: 'asc' | 'desc';
}

/**
 * Filter state
 */
export interface FilterState {
  search?: string;
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  customFilters?: Record<string, unknown>;
}