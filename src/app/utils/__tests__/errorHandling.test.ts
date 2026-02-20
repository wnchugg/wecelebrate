/**
 * Error Handling Utils Test Suite
 * Day 3 - Morning Session
 * Tests for src/app/utils/errorHandling.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractErrorMessage,
  handleCatchError,
  isNetworkError,
  isAuthError,
  isValidationError
} from '../errorHandling';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// Mock frontendSecurity
vi.mock('../frontendSecurity', () => ({
  logSecurityEvent: vi.fn()
}));

describe('Error Handling Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // NOTE: The following tests are commented out because the functions they test
  // (classifyError, formatErrorMessage, getErrorSeverity, createAppError, logError)
  // are not currently exported from errorHandling.ts
  // These tests should be re-enabled if those functions are added back

  /*
  describe('Error Classification', () => {
    it('should classify network errors', () => {
      const error = new TypeError('Failed to fetch');
      expect(classifyError(error)).toBe('network');
    });

    it('should classify authentication errors from status 401', () => {
      const error = { status: 401, message: 'Unauthorized' };
      expect(classifyError(error)).toBe('authentication');
    });

    it('should classify authorization errors from status 403', () => {
      const error = { status: 403, message: 'Forbidden' };
      expect(classifyError(error)).toBe('authorization');
    });

    it('should classify not found errors from status 404', () => {
      const error = { status: 404, message: 'Not found' };
      expect(classifyError(error)).toBe('not_found');
    });

    it('should classify conflict errors from status 409', () => {
      const error = { status: 409, message: 'Conflict' };
      expect(classifyError(error)).toBe('conflict');
    });

    it('should classify validation errors from status 400', () => {
      const error = { status: 400, message: 'Bad request' };
      expect(classifyError(error)).toBe('validation');
    });

    it('should classify rate limit errors from status 429', () => {
      const error = { status: 429, message: 'Too many requests' };
      expect(classifyError(error)).toBe('rate_limit');
    });

    it('should classify server errors from status 500', () => {
      const error = { status: 500, message: 'Internal server error' };
      expect(classifyError(error)).toBe('server');
    });

    it('should classify by message content - unauthorized', () => {
      const error = { message: 'Unauthorized access' };
      expect(classifyError(error)).toBe('authentication');
    });

    it('should classify login credential errors as authentication', () => {
      const error = { message: 'Invalid login credentials' };
      expect(classifyError(error)).toBe('authentication');
    });

    it('should classify validation errors from message', () => {
      const error = { message: 'Validation failed' };
      expect(classifyError(error)).toBe('validation');
    });

    it('should classify rate limit from message', () => {
      const error = { message: 'Rate limit exceeded' };
      expect(classifyError(error)).toBe('rate_limit');
    });

    it('should default to unknown for unclassified errors', () => {
      const error = { message: 'Something went wrong' };
      expect(classifyError(error)).toBe('unknown');
    });

    it('should handle errors without message', () => {
      const error = {};
      expect(classifyError(error)).toBe('unknown');
    });

    it('should handle null error', () => {
      expect(classifyError(null)).toBe('unknown');
    });

    it('should handle undefined error', () => {
      expect(classifyError(undefined)).toBe('unknown');
    });
  });

  describe('Error Message Formatting', () => {
    it('should format simple error message', () => {
      const error = new Error('Something went wrong');
      const formatted = formatErrorMessage(error);
      expect(formatted).toBe('Something went wrong');
    });

    it('should extract message from error object', () => {
      const error = { message: 'Custom error message' };
      const formatted = formatErrorMessage(error);
      expect(formatted).toBe('Custom error message');
    });

    it('should provide default message for errors without message', () => {
      const error = {};
      const formatted = formatErrorMessage(error);
      expect(formatted).toBe('An unexpected error occurred');
    });

    it('should handle string errors', () => {
      const formatted = formatErrorMessage('Error string');
      expect(formatted).toBe('Error string');
    });

    it('should handle null', () => {
      const formatted = formatErrorMessage(null);
      expect(formatted).toBe('An unexpected error occurred');
    });

    it('should handle undefined', () => {
      const formatted = formatErrorMessage(undefined);
      expect(formatted).toBe('An unexpected error occurred');
    });

    it('should sanitize HTML in error messages', () => {
      const error = { message: '<script>alert("xss")</script>' };
      const formatted = formatErrorMessage(error);
      expect(formatted).not.toContain('<script>');
    });

    it('should truncate very long error messages', () => {
      const longMessage = 'a'.repeat(1000);
      const error = { message: longMessage };
      const formatted = formatErrorMessage(error, { maxLength: 100 });
      expect(formatted.length).toBeLessThanOrEqual(103); // 100 + '...'
    });

    it('should format error with context', () => {
      const error = { message: 'Error occurred' };
      const formatted = formatErrorMessage(error, { context: 'User login' });
      expect(formatted).toContain('User login');
    });

    it('should format user-friendly network error', () => {
      const error = new TypeError('Failed to fetch');
      const formatted = formatErrorMessage(error, { userFriendly: true });
      expect(formatted).toContain('network');
    });
  });

  describe('Error Severity', () => {
    it('should assign critical severity to authentication errors', () => {
      const error = { status: 401 };
      const severity = getErrorSeverity(error);
      expect(severity).toBe('critical');
    });

    it('should assign error severity to server errors', () => {
      const error = { status: 500 };
      const severity = getErrorSeverity(error);
      expect(severity).toBe('error');
    });

    it('should assign warning severity to validation errors', () => {
      const error = { status: 400 };
      const severity = getErrorSeverity(error);
      expect(severity).toBe('warning');
    });

    it('should assign info severity to not found errors', () => {
      const error = { status: 404 };
      const severity = getErrorSeverity(error);
      expect(severity).toBe('info');
    });

    it('should handle unknown errors with error severity', () => {
      const error = {};
      const severity = getErrorSeverity(error);
      expect(severity).toBe('error');
    });
  });

  describe('App Error Creation', () => {
    it('should create app error with all fields', () => {
      const error = new Error('Test error');
      const appError = createAppError(error);
      
      expect(appError.type).toBeDefined();
      expect(appError.severity).toBeDefined();
      expect(appError.message).toBe('Test error');
      expect(appError.timestamp).toBeInstanceOf(Date);
    });

    it('should create app error with user-friendly message', () => {
      const error = { status: 401 };
      const appError = createAppError(error);
      
      expect(appError.userMessage).toBeDefined();
      expect(appError.userMessage).not.toBe(appError.message);
    });

    it('should include recovery actions for authentication errors', () => {
      const error = { status: 401 };
      const appError = createAppError(error);
      
      expect(appError.recoveryActions).toBeDefined();
      expect(appError.recoveryActions!.length).toBeGreaterThan(0);
    });

    it('should include context when provided', () => {
      const error = new Error('Test');
      const context = { userId: '123', action: 'login' };
      const appError = createAppError(error, context);
      
      expect(appError.context).toEqual(context);
    });

    it('should classify error type correctly', () => {
      const networkError = new TypeError('Failed to fetch');
      const appError = createAppError(networkError);
      
      expect(appError.type).toBe('network');
    });
  });

  describe('Toast Notifications', () => {
    it('should show success toast', () => {
      const { toast } = require('sonner');
      showSuccessToast('Success message');
      
      expect(toast.success).toHaveBeenCalledWith('Success message');
    });

    it('should show error toast', () => {
      const { toast } = require('sonner');
      showErrorToast('Error message');
      
      expect(toast.error).toHaveBeenCalledWith('Error message');
    });

    it('should show warning toast', () => {
      const { toast } = require('sonner');
      showWarningToast('Warning message');
      
      expect(toast.warning).toHaveBeenCalledWith('Warning message');
    });

    it('should show info toast', () => {
      const { toast } = require('sonner');
      showInfoToast('Info message');
      
      expect(toast.info).toHaveBeenCalledWith('Info message');
    });

    it('should show error toast with title', () => {
      const { toast } = require('sonner');
      showErrorToast('Error', 'Details');
      
      expect(toast.error).toHaveBeenCalled();
    });
  });

  /*
  describe('Error Logging', () => {
    it('should log error to console', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      
      logError(error);
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should log error with context', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      const context = { userId: '123' };
      
      logError(error, context);
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should log security events for authentication errors', () => {
      const { logSecurityEvent } = require('../frontendSecurity');
      const error = { status: 401, message: 'Unauthorized' };
      
      logError(error);
      
      expect(logSecurityEvent).toHaveBeenCalled();
    });

    it('should handle logging of null error', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => logError(null)).not.toThrow();
      
      consoleError.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular reference errors', () => {
      const error: any = { message: 'Circular' };
      error.self = error;
      
      expect(() => formatErrorMessage(error)).not.toThrow();
    });

    it('should handle errors with non-string messages', () => {
      const error = { message: 123 };
      const formatted = formatErrorMessage(error);
      
      expect(typeof formatted).toBe('string');
    });

    it('should handle errors with symbol properties', () => {
      const sym = Symbol('test');
      const error = { [sym]: 'value', message: 'Test' };
      
      expect(() => classifyError(error)).not.toThrow();
    });

    it('should handle errors with getters', () => {
      const error = {
        get message() {
          throw new Error('Getter error');
        }
      };
      
      expect(() => formatErrorMessage(error)).not.toThrow();
    });
  });

  describe('Multiple Error Types', () => {
    it('should handle Error instances', () => {
      const error = new Error('Standard error');
      expect(classifyError(error)).toBe('unknown');
    });

    it('should handle TypeError instances', () => {
      const error = new TypeError('Type error');
      expect(classifyError(error)).toBe('unknown');
    });

    it('should handle RangeError instances', () => {
      const error = new RangeError('Range error');
      expect(classifyError(error)).toBe('unknown');
    });

    it('should handle custom error classes', () => {
      class CustomError extends Error {
        status = 500;
      }
      const error = new CustomError('Custom');
      expect(classifyError(error)).toBe('server');
    });
  });
  */

  // Tests for functions that DO exist
  describe('extractErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error');
      expect(extractErrorMessage(error)).toBe('Test error');
    });

    it('should use fallback for unknown errors', () => {
      expect(extractErrorMessage(null)).toBe('An unexpected error occurred');
    });

    it('should use custom fallback', () => {
      expect(extractErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
    });
  });

  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      const error = new TypeError('Failed to fetch');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should detect timeout errors', () => {
      const error = new Error('Request timeout');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for non-network errors', () => {
      const error = new Error('Something else');
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('should detect 401 errors', () => {
      const error = { statusCode: 401, message: 'Unauthorized' };
      expect(isAuthError(error)).toBe(true);
    });

    it('should detect 403 errors', () => {
      const error = { status: 403, message: 'Forbidden' };
      expect(isAuthError(error)).toBe(true);
    });

    it('should detect unauthorized message', () => {
      const error = new Error('Unauthorized access');
      expect(isAuthError(error)).toBe(true);
    });

    it('should return false for non-auth errors', () => {
      const error = new Error('Something else');
      expect(isAuthError(error)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should detect 400 errors', () => {
      const error = { statusCode: 400, message: 'Bad request' };
      expect(isValidationError(error)).toBe(true);
    });

    it('should detect 422 errors', () => {
      const error = { status: 422, message: 'Unprocessable entity' };
      expect(isValidationError(error)).toBe(true);
    });

    it('should detect validation message', () => {
      const error = new Error('Validation failed');
      expect(isValidationError(error)).toBe(true);
    });

    it('should return false for non-validation errors', () => {
      const error = new Error('Something else');
      expect(isValidationError(error)).toBe(false);
    });
  });

  describe('handleCatchError', () => {
    it('should convert unknown error to AppError', () => {
      const error = new Error('Test error');
      const appError = handleCatchError(error);
      
      expect(appError.message).toBe('Test error');
    });

    it('should use default message', () => {
      const appError = handleCatchError(null, 'Default message');
      
      expect(appError.message).toContain('Default message');
    });
  });
});
