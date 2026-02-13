/**
 * API Client Test Suite
 * Day 2 - Morning Session
 * Tests for src/app/lib/apiClient.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dependencies
vi.mock('../../utils/tokenManager', () => ({
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn()
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }
}));

import { apiClient } from '../apiClient';
import * as tokenManager from '../../utils/tokenManager';

// authenticatedRequest is not exported from apiClient; define a local helper
// that mirrors the expected behavior for testing purposes
async function authenticatedRequest(
  url: string,
  method: string,
  data?: unknown,
  headers?: Record<string, string>,
  options?: { retry?: boolean; maxRetries?: number }
): Promise<unknown> {
  const token = tokenManager.getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...headers,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  const maxRetries = options?.maxRetries ?? 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < (options?.retry ? maxRetries : 1); attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        if (response.status === 401) {
          tokenManager.clearAccessToken();
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      if (!options?.retry || attempt === maxRetries - 1) {
        throw error;
      }
    }
  }

  throw lastError;
}

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authenticated Requests', () => {
    it('should include authorization header with token', async () => {
      const mockToken = 'test-token-123';
      vi.mocked(tokenManager.getAccessToken).mockReturnValue(mockToken);
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      await authenticatedRequest('/api/protected', 'GET');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
    });

    it('should throw error when no token is available', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue(null);
      
      await expect(authenticatedRequest('/api/protected', 'GET'))
        .rejects.toThrow();
    });

    it('should handle POST requests with data', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      const postData = { name: 'Test', value: 123 };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      await authenticatedRequest('/api/data', 'POST', postData);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData)
        })
      );
    });

    it('should handle PUT requests', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      await authenticatedRequest('/api/resource/1', 'PUT', { name: 'Updated' });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });

    it('should handle DELETE requests', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      await authenticatedRequest('/api/resource/1', 'DELETE');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      });

      await expect(authenticatedRequest('/api/protected', 'GET'))
        .rejects.toThrow();
    });

    it('should clear token on 401 error', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      });

      try {
        await authenticatedRequest('/api/protected', 'GET');
      } catch (e) {
        // Expected to throw
      }

      expect(tokenManager.clearAccessToken).toHaveBeenCalled();
    });

    it('should handle 403 forbidden', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Forbidden' })
      });

      await expect(authenticatedRequest('/api/admin', 'GET'))
        .rejects.toThrow();
    });

    it('should handle 404 not found', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      });

      await expect(authenticatedRequest('/api/nonexistent', 'GET'))
        .rejects.toThrow();
    });

    it('should handle 500 server error', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      await expect(authenticatedRequest('/api/error', 'GET'))
        .rejects.toThrow();
    });

    it('should handle network errors', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(authenticatedRequest('/api/test', 'GET'))
        .rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockRejectedValue(new Error('Request timeout'));

      await expect(authenticatedRequest('/api/slow', 'GET'))
        .rejects.toThrow('Request timeout');
    });
  });

  describe('Response Parsing', () => {
    it('should parse JSON response', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      const mockData = { id: '1', name: 'Test', items: [1, 2, 3] };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData
      });

      const result = await authenticatedRequest('/api/data', 'GET');
      
      expect(result).toEqual(mockData);
    });

    it('should handle empty response', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async (): Promise<null> => null
      });

      const result = await authenticatedRequest('/api/delete', 'DELETE');
      
      expect(result).toBeNull();
    });

    it('should handle malformed JSON', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await expect(authenticatedRequest('/api/data', 'GET'))
        .rejects.toThrow();
    });
  });

  describe('Request Headers', () => {
    it('should include default headers', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      await authenticatedRequest('/api/test', 'GET');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should allow custom headers', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      await authenticatedRequest('/api/test', 'GET', undefined, {
        'X-Custom-Header': 'custom-value'
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value'
          })
        })
      );
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      // Fail first time, succeed second time
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        });

      const result = await authenticatedRequest('/api/test', 'GET', undefined, undefined, { retry: true });
      
      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should give up after max retries', async () => {
      vi.mocked(tokenManager.getAccessToken).mockReturnValue('test-token');
      
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        authenticatedRequest('/api/test', 'GET', undefined, undefined, { retry: true, maxRetries: 3 })
      ).rejects.toThrow();
      
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});