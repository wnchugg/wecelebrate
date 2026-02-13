/**
 * Error Type Definitions
 * Comprehensive error handling types for the application
 */

/**
 * Standard application error structure
 */
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  stack?: string;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Network error structure
 */
export interface NetworkError extends AppError {
  url?: string;
  method?: string;
  timeout?: boolean;
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as AppError).message === 'string'
  );
}

/**
 * Type guard to check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type-safe error extraction
 * Extracts message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  
  if (isAppError(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }
  
  return 'An unknown error occurred';
}

/**
 * Create an AppError from unknown error
 */
export function toAppError(error: unknown, defaultMessage = 'An error occurred'): AppError {
  if (isAppError(error)) {
    return error;
  }
  
  if (isError(error)) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }
  
  if (typeof error === 'string') {
    return {
      message: error,
    };
  }
  
  if (typeof error === 'object' && error !== null) {
    const message = getErrorMessage(error);
    return {
      message,
      details: error as Record<string, unknown>,
    };
  }
  
  return {
    message: defaultMessage,
  };
}

/**
 * Error handler callback type
 */
export type ErrorHandler = (error: AppError) => void;

/**
 * Async error handler callback type
 */
export type AsyncErrorHandler = (error: AppError) => Promise<void>;
