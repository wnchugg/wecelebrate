/**
 * API Error Types and Utilities
 * Provides type-safe error handling for API calls
 */

// ==================== Error Types ====================

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==================== Error Classes ====================

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
    };
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT_ERROR', details);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApiError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }
}

// ==================== Type Guards ====================

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response &&
    typeof (response as ApiErrorResponse).error === 'string'
  );
}

export function isApiSuccessResponse<T = unknown>(
  response: unknown
): response is ApiSuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === true &&
    'data' in response
  );
}

// ==================== Error Factory ====================

export function createApiError(
  statusCode: number,
  message: string,
  code?: string,
  details?: Record<string, unknown>
): ApiError {
  switch (statusCode) {
    case 400:
      return new ValidationError(message, details);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      return new NotFoundError(message);
    case 409:
      return new ConflictError(message, details);
    case 429:
      return new RateLimitError(message, typeof details?.retryAfter === 'number' ? details.retryAfter : undefined);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message);
    default:
      return new ApiError(message, statusCode, code, details);
  }
}

export function createErrorFromResponse(response: Response, data?: unknown): ApiError {
  const message = (data && typeof data === 'object' && 'error' in data ? data.error : null) || 
                  (data && typeof data === 'object' && 'message' in data ? data.message : null) || 
                  response.statusText || 'Request failed';
  const code = data && typeof data === 'object' && 'code' in data ? String(data.code) : undefined;
  const details = data && typeof data === 'object' && 'details' in data ? data.details as Record<string, unknown> : undefined;
  
  return createApiError(response.status, String(message), code, details);
}

// ==================== Error Parsing ====================

export function parseError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (isApiErrorResponse(error)) {
    return error.error;
  }

  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
      return (error as Record<string, unknown>).message as string;
    }
    if ('error' in error && typeof (error as Record<string, unknown>).error === 'string') {
      return (error as Record<string, unknown>).error as string;
    }
  }

  return 'An unknown error occurred';
}

export function getErrorDetails(error: unknown): Record<string, unknown> | undefined {
  if (isApiError(error)) {
    return error.details;
  }

  if (isApiErrorResponse(error)) {
    return error.details;
  }

  return undefined;
}

export function getErrorCode(error: unknown): string | undefined {
  if (isApiError(error)) {
    return error.code;
  }

  if (isApiErrorResponse(error)) {
    return error.code;
  }

  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as Record<string, unknown>).code);
  }

  return undefined;
}

export function getStatusCode(error: unknown): number {
  if (isApiError(error)) {
    return error.statusCode;
  }

  if (isApiErrorResponse(error)) {
    return error.statusCode || 500;
  }

  if (typeof error === 'object' && error !== null) {
    if ('statusCode' in error && typeof (error as Record<string, unknown>).statusCode === 'number') {
      return (error as Record<string, unknown>).statusCode as number;
    }
    if ('status' in error && typeof (error as Record<string, unknown>).status === 'number') {
      return (error as Record<string, unknown>).status as number;
    }
  }

  return 500;
}

// ==================== Error Formatting ====================

export interface FormattedError {
  title: string;
  message: string;
  details?: string;
  code?: string;
  statusCode: number;
}

export function formatError(error: unknown): FormattedError {
  const statusCode = getStatusCode(error);
  const code = getErrorCode(error);
  const message = parseError(error);
  const details = getErrorDetails(error);

  let title = 'Error';
  
  if (isValidationError(error)) {
    title = 'Validation Error';
  } else if (isAuthenticationError(error)) {
    title = 'Authentication Required';
  } else if (isAuthorizationError(error)) {
    title = 'Access Denied';
  } else if (isNotFoundError(error)) {
    title = 'Not Found';
  } else if (isRateLimitError(error)) {
    title = 'Rate Limit Exceeded';
  } else if (statusCode >= 500) {
    title = 'Server Error';
  } else if (statusCode >= 400) {
    title = 'Request Error';
  }

  return {
    title,
    message,
    details: details ? JSON.stringify(details, null, 2) : undefined,
    code,
    statusCode,
  };
}

// ==================== Retry Logic ====================

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: ApiError) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  onRetry: () => {},
};

export function isRetryableError(error: unknown, retryableStatuses: number[]): boolean {
  const statusCode = getStatusCode(error);
  return retryableStatuses.includes(statusCode) || isNetworkError(error);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < opts.maxRetries && isRetryableError(error, opts.retryableStatuses)) {
        opts.onRetry(attempt + 1, error as ApiError);
        
        // Exponential backoff
        const delay = opts.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  throw lastError;
}
