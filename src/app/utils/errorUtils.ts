/**
 * Type-safe error handling utilities
 * Eliminates the need for 'error: any' in catch blocks
 */

/**
 * Converts unknown error to string message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Type guard to check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if error has a message property
 */
export function hasErrorMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Type guard to check if error has a code property
 */
export function hasErrorCode(error: unknown): error is { code: string | number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error
  );
}

/**
 * Safely extracts error details for logging
 */
export function getErrorDetails(error: unknown): {
  message: string;
  name?: string;
  code?: string | number;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }
  
  const details: ReturnType<typeof getErrorDetails> = {
    message: getErrorMessage(error),
  };
  
  if (hasErrorCode(error)) {
    details.code = error.code;
  }
  
  return details;
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: unknown, defaultMessage = 'An error occurred'): string {
  const message = getErrorMessage(error);
  return message || defaultMessage;
}
