/**
 * API Response Type Guards
 * Type guards and validators for API responses
 */

import type { ApiResponse, PaginatedResponse, SuccessResponse } from '../types/api.types';
import type { Client, Site, Gift, Employee, Order } from '../../types';

/**
 * Check if response is successful API response
 */
export function isSuccessResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    response !== null &&
    typeof response === 'object' &&
    'success' in response &&
    response.success === true &&
    'data' in response
  );
}

/**
 * Check if response is error API response
 */
export function isErrorResponse(response: unknown): response is ApiResponse<never> & { error: string } {
  return (
    response !== null &&
    typeof response === 'object' &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

/**
 * Check if response is paginated
 */
export function isPaginatedResponse<T>(response: unknown): response is PaginatedResponse<T> {
  return (
    isSuccessResponse(response) &&
    'pagination' in response &&
    response.pagination !== null &&
    typeof response.pagination === 'object' &&
    'page' in response.pagination &&
    'pageSize' in response.pagination &&
    'total' in response.pagination
  );
}

/**
 * Check if value is Client
 */
export function isClient(value: unknown): value is Client {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'name' in value &&
    'status' in value
  );
}

/**
 * Check if value is Site
 */
export function isSite(value: unknown): value is Site {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'name' in value &&
    'clientId' in value &&
    'status' in value
  );
}

/**
 * Check if value is Gift
 */
export function isGift(value: unknown): value is Gift {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'name' in value &&
    'price' in value &&
    'category' in value
  );
}

/**
 * Check if value is Employee
 */
export function isEmployee(value: unknown): value is Employee {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'employeeId' in value &&
    'firstName' in value &&
    'lastName' in value &&
    'email' in value
  );
}

/**
 * Check if value is Order
 */
export function isOrder(value: unknown): value is Order {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'orderNumber' in value &&
    'userId' in value &&
    'status' in value
  );
}

/**
 * Validate API response and extract data
 */
export function validateApiResponse<T>(
  response: unknown,
  validator?: (data: unknown) => data is T
): T {
  if (!isSuccessResponse(response)) {
    const error = isErrorResponse(response) ? response.error : 'Invalid API response';
    throw new Error(error);
  }
  
  const successResponse = response as SuccessResponse<T>;
  if (validator && !validator(successResponse.data)) {
    throw new Error('API response data validation failed');
  }

  return successResponse.data as T;
}

/**
 * Validate paginated API response
 */
export function validatePaginatedResponse<T>(
  response: unknown,
  validator?: (item: unknown) => item is T
): PaginatedResponse<T> {
  if (!isPaginatedResponse(response)) {
    throw new Error('Invalid paginated API response');
  }
  
  if (validator && Array.isArray(response.data)) {
    const invalidItems = response.data.filter((item: unknown) => !validator(item));
    if (invalidItems.length > 0) {
      throw new Error(`${invalidItems.length} items failed validation`);
    }
  }
  
  return response as PaginatedResponse<T>;
}

/**
 * Safe API response handler
 */
export async function handleApiResponse<T>(
  promise: Promise<unknown>,
  validator?: (data: unknown) => data is T
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await promise;
    const data = validateApiResponse<T>(response, validator);
    return { data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: message };
  }
}

/**
 * Extract error message from API response
 */
export function extractErrorMessage(response: unknown): string {
  if (isErrorResponse(response)) {
    return response.error;
  }
  
  if (response && typeof response === 'object' && 'message' in response && typeof response.message === 'string') {
    return response.message;
  }
  
  if (response instanceof Error) {
    return response.message;
  }
  
  return 'An unknown error occurred';
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    (error instanceof Error && error.message.toLowerCase().includes('network')) ||
    (error instanceof Error && error.message.toLowerCase().includes('fetch'))
  );
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: unknown): boolean {
  const message = (error && typeof error === 'object' && 'message' in error ? error.message : '') || 
                  (error && typeof error === 'object' && 'error' in error ? error.error : '') || '';
  const statusCode = error && typeof error === 'object' && ('status' in error ? error.status : 'statusCode' in error ? error.statusCode : undefined);
  
  return (
    statusCode === 401 ||
    statusCode === 403 ||
    String(message).toLowerCase().includes('unauthorized') ||
    String(message).toLowerCase().includes('authentication') ||
    String(message).toLowerCase().includes('token')
  );
}

/**
 * Check if error is validation error
 */
export function isValidationError(error: unknown): boolean {
  const message = (error && typeof error === 'object' && 'message' in error ? error.message : '') || 
                  (error && typeof error === 'object' && 'error' in error ? error.error : '') || '';
  const statusCode = error && typeof error === 'object' && ('status' in error ? error.status : 'statusCode' in error ? error.statusCode : undefined);
  
  return (
    statusCode === 400 ||
    statusCode === 422 ||
    String(message).toLowerCase().includes('validation') ||
    String(message).toLowerCase().includes('invalid')
  );
}

/**
 * Check if error is not found error
 */
export function isNotFoundError(error: unknown): boolean {
  const message = (error && typeof error === 'object' && 'message' in error ? error.message : '') || 
                  (error && typeof error === 'object' && 'error' in error ? error.error : '') || '';
  const statusCode = error && typeof error === 'object' && ('status' in error ? error.status : 'statusCode' in error ? error.statusCode : undefined);
  
  return (
    statusCode === 404 ||
    String(message).toLowerCase().includes('not found')
  );
}

/**
 * Check if error is server error
 */
export function isServerError(error: unknown): boolean {
  const statusCode = error && typeof error === 'object' && ('status' in error ? error.status : 'statusCode' in error ? error.statusCode : undefined);
  return typeof statusCode === 'number' && statusCode >= 500 && statusCode < 600;
}

/**
 * Normalize API error
 */
export function normalizeApiError(error: unknown): {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
} {
  const status = error && typeof error === 'object' && ('status' in error ? error.status : 'statusCode' in error ? error.statusCode : undefined);
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  const details = error && typeof error === 'object' && ('details' in error ? error.details : 'data' in error ? error.data : undefined);
  
  return {
    message: extractErrorMessage(error),
    status: typeof status === 'number' ? status : undefined,
    code: typeof code === 'string' ? code : undefined,
    details,
  };
}

/**
 * Create standardized API error
 */
export function createApiError(
  message: string,
  status?: number,
  code?: string,
  details?: unknown
): Error & { status?: number; code?: string; details?: unknown } {
  const error = new Error(message) as Error & {
    status?: number;
    code?: string;
    details?: any;
  };
  
  if (status) error.status = status;
  if (code) error.code = code;
  if (details) error.details = details;
  
  return error;
}

/**
 * Retry failed API request
 */
export async function retryApiRequest<T>(
  requestFn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    delay?: number;
    shouldRetry?: (error: unknown) => boolean;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const delay = options?.delay ?? 1000;
  const shouldRetry = options?.shouldRetry ?? isNetworkError;
  
  let lastError: unknown;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw lastError;
}

/**
 * Batch API requests
 */
export async function batchApiRequests<T>(
  requests: Array<() => Promise<T>>,
  options?: {
    batchSize?: number;
    delay?: number;
  }
): Promise<T[]> {
  const batchSize = options?.batchSize ?? 5;
  const delay = options?.delay ?? 100;
  const results: T[] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);
    
    if (i + batchSize < requests.length && delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

/**
 * Transform API response data
 */
export function transformApiResponse<T, U>(
  response: ApiResponse<T>,
  transformer: (data: T) => U
): ApiResponse<U> {
  if (!isSuccessResponse(response)) {
    return response as ApiResponse<U>;
  }
  
  const successResponse = response as SuccessResponse<T>;
  return {
    ...successResponse,
    data: transformer(successResponse.data as T),
  };
}

/**
 * Merge multiple API responses
 */
export function mergeApiResponses<T>(
  ...responses: Array<ApiResponse<T[]>>
): ApiResponse<T[]> {
  // Check if all responses are successful
  for (const response of responses) {
    if (isErrorResponse(response)) {
      return response;
    }
  }

  // All responses are successful, merge the data
  const mergedData: T[] = [];
  for (const response of responses) {
    if (isSuccessResponse(response) && 'data' in response) {
      mergedData.push(...response.data);
    }
  }

  return {
    success: true,
    data: mergedData,
  } as ApiResponse<T[]>;
}
