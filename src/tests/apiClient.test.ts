/**
 * API Client Tests
 * Phase 4: Frontend Refactoring
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setAccessToken,
  getAccessToken,
  clearAccessToken,
  ApiError,
} from '../app/lib/apiClient';

describe('Token Management', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  it('stores access token', () => {
    const token = 'test-token-123';
    setAccessToken(token);
    expect(getAccessToken()).toBe(token);
  });

  it('retrieves stored token', () => {
    const token = 'test-token-456';
    sessionStorage.setItem('jala_access_token', token);
    expect(getAccessToken()).toBe(token);
  });

  it('clears access token', () => {
    setAccessToken('test-token');
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it('handles null token', () => {
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});

describe('ApiError', () => {
  it('creates error with message and status code', () => {
    const error = new ApiError('Test error', 400);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ApiError');
  });

  it('creates error with response data', () => {
    const response = {
      error: 'Validation Error',
      field: 'email',
      message: 'Invalid email',
    };
    const error = new ApiError('Validation Error', 400, response);
    expect(error.response).toEqual(response);
  });

  it('is instance of Error', () => {
    const error = new ApiError('Test', 500);
    expect(error instanceof Error).toBe(true);
    expect(error instanceof ApiError).toBe(true);
  });
});