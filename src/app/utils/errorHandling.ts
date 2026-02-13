/**
 * Error Handling Utilities
 * Helper functions for consistent error handling across the application
 */

import { toast } from 'sonner';
import { AppError, getErrorMessage, toAppError } from '../types/error.types';
import { logger } from './logger';

/**
 * Display success toast notification
 */
export function showSuccessToast(title: string, message?: string): void {
  if (message) {
    toast.success(title, {
      description: message,
    });
  } else {
    toast.success(title);
  }
}

/**
 * Display error toast notification
 */
export function showErrorToast(title: string | unknown, message?: string | Record<string, unknown>): void {
  // If second parameter is an object, treat it as options and ignore it for now
  // This maintains backward compatibility with calls that pass { operation: 'xxx' }
  const actualMessage = typeof message === 'string' ? message : undefined;
  
  if (typeof title === 'string') {
    if (actualMessage) {
      toast.error(title, {
        description: actualMessage,
      });
    } else {
      toast.error(title);
    }
  } else {
    // If title is an error object, extract the message
    const errorMessage = extractErrorMessage(title);
    if (actualMessage) {
      toast.error(actualMessage, {
        description: errorMessage,
      });
    } else {
      toast.error(errorMessage);
    }
  }
}

/**
 * Display warning toast notification
 */
export function showWarningToast(title: string, message?: string): void {
  if (message) {
    toast.warning(title, {
      description: message,
    });
  } else {
    toast.warning(title);
  }
}

/**
 * Display info toast notification
 */
export function showInfoToast(title: string, message?: string): void {
  if (message) {
    toast.info(title, {
      description: message,
    });
  } else {
    toast.info(title);
  }
}

/**
 * Handle error in catch block with proper typing
 * 
 * @example
 * try {
 *   await someAsyncOperation();
 * } catch (error) {
 *   handleCatchError(error, 'Failed to perform operation');
 * }
 */
export function handleCatchError(
  error: unknown,
  defaultMessage = 'An error occurred'
): AppError {
  const appError = toAppError(error, defaultMessage);
  logger.error(appError.message, appError);
  return appError;
}

/**
 * Safe error message extraction for UI display
 * Use this in catch blocks when displaying errors to users
 * 
 * @example
 * catch (error) {
 *   toast.error(extractErrorMessage(error));
 * }
 */
export function extractErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred'
): string {
  try {
    return getErrorMessage(error) || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Wrap async functions with error handling
 * Returns a tuple of [data, error]
 * 
 * @example
 * const [data, error] = await withErrorHandling(fetchData());
 * if (error) {
 *   // handle error
 * }
 */
export async function withErrorHandling<T>(
  promise: Promise<T>
): Promise<[T | null, AppError | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, toAppError(error)];
  }
}

/**
 * Async error boundary wrapper
 * Catches errors and calls error handler
 * 
 * @example
 * await asyncTryCatch(
 *   async () => await riskyOperation(),
 *   (error) => toast.error(error.message)
 * );
 */
export async function asyncTryCatch<T>(
  fn: () => Promise<T>,
  onError: (error: AppError) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const appError = toAppError(error);
    onError(appError);
    return null;
  }
}

/**
 * Type-safe error assertion
 * Asserts that a value is an error and throws if not
 */
export function assertError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) {
    throw new Error(`Expected Error, got ${typeof error}`);
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('cors') ||
    message.includes('connection')
  );
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  
  if (typeof error === 'object' && error !== null) {
    const statusCode = (error as any).statusCode || (error as any).status;
    if (statusCode === 401 || statusCode === 403) {
      return true;
    }
  }
  
  return (
    message.includes('unauthorized') ||
    message.includes('unauthenticated') ||
    message.includes('forbidden') ||
    message.includes('401') ||
    message.includes('403')
  );
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  
  if (typeof error === 'object' && error !== null) {
    const statusCode = (error as any).statusCode || (error as any).status;
    if (statusCode === 400 || statusCode === 422) {
      return true;
    }
  }
  
  return (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('400') ||
    message.includes('422')
  );
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  const appError = toAppError(error);
  
  return {
    message: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    details: appError.details,
    stack: appError.stack,
    timestamp: new Date().toISOString(),
  };
}