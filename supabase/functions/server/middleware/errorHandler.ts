/**
 * Error Handling Middleware
 * 
 * Maps database errors to safe, user-friendly messages
 * Prevents sensitive information leakage
 */

import { Context } from 'npm:hono';

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: any;
}

/**
 * Database error code mappings
 */
const ERROR_MAPPINGS: Record<string, { message: string; code: string }> = {
  // Unique constraint violations
  '23505': {
    message: 'A record with this identifier already exists',
    code: 'DUPLICATE_RECORD',
  },
  // Foreign key violations
  '23503': {
    message: 'Referenced record not found',
    code: 'INVALID_REFERENCE',
  },
  // Not null violations
  '23502': {
    message: 'Required field is missing',
    code: 'MISSING_REQUIRED_FIELD',
  },
  // Check constraint violations
  '23514': {
    message: 'Invalid value provided',
    code: 'INVALID_VALUE',
  },
  // Invalid text representation
  '22P02': {
    message: 'Invalid data format',
    code: 'INVALID_FORMAT',
  },
  // Numeric value out of range
  '22003': {
    message: 'Value out of acceptable range',
    code: 'VALUE_OUT_OF_RANGE',
  },
};

/**
 * Map database error to safe error response
 */
export function mapDatabaseError(error: any): ErrorResponse {
  // Check if it's a Supabase/PostgreSQL error
  if (error.code && ERROR_MAPPINGS[error.code]) {
    const mapping = ERROR_MAPPINGS[error.code];
    return {
      success: false,
      error: mapping.code,
      message: mapping.message,
      code: error.code,
    };
  }
  
  // Handle specific error messages
  if (error.message) {
    // Unique constraint with field name
    if (error.message.includes('duplicate key')) {
      return {
        success: false,
        error: 'DUPLICATE_RECORD',
        message: 'A record with this identifier already exists',
      };
    }
    
    // Foreign key with field name
    if (error.message.includes('violates foreign key')) {
      return {
        success: false,
        error: 'INVALID_REFERENCE',
        message: 'Referenced record not found',
      };
    }
    
    // Not null constraint
    if (error.message.includes('null value')) {
      return {
        success: false,
        error: 'MISSING_REQUIRED_FIELD',
        message: 'Required field is missing',
      };
    }
  }
  
  // Generic database error
  return {
    success: false,
    error: 'DATABASE_ERROR',
    message: 'An error occurred while processing your request',
  };
}

/**
 * Global error handler middleware
 */
export async function errorHandler(err: Error, c: Context) {
  console.error('[Error]', {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
    user: c.get('user')?.id,
  });
  
  // Map error to safe response
  const errorResponse = mapDatabaseError(err);
  
  // Determine status code
  let statusCode = 500;
  if (errorResponse.error === 'DUPLICATE_RECORD') statusCode = 409;
  if (errorResponse.error === 'INVALID_REFERENCE') statusCode = 404;
  if (errorResponse.error === 'MISSING_REQUIRED_FIELD') statusCode = 400;
  if (errorResponse.error === 'INVALID_VALUE') statusCode = 400;
  if (errorResponse.error === 'INVALID_FORMAT') statusCode = 400;
  
  return c.json(errorResponse, statusCode);
}

/**
 * Wrap async route handlers with error handling
 */
export function asyncHandler(
  fn: (c: Context) => Promise<Response>
) {
  return async (c: Context) => {
    try {
      return await fn(c);
    } catch (error) {
      return errorHandler(error as Error, c);
    }
  };
}

/**
 * Validation error helper
 */
export function validationError(message: string, details?: any): ErrorResponse {
  return {
    success: false,
    error: 'VALIDATION_ERROR',
    message,
    details,
  };
}

/**
 * Not found error helper
 */
export function notFoundError(resource: string): ErrorResponse {
  return {
    success: false,
    error: 'NOT_FOUND',
    message: `${resource} not found`,
  };
}

/**
 * Unauthorized error helper
 */
export function unauthorizedError(message: string = 'Unauthorized'): ErrorResponse {
  return {
    success: false,
    error: 'UNAUTHORIZED',
    message,
  };
}

/**
 * Forbidden error helper
 */
export function forbiddenError(message: string = 'Forbidden'): ErrorResponse {
  return {
    success: false,
    error: 'FORBIDDEN',
    message,
  };
}
