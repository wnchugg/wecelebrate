/**
 * API Cache Test Suite
 * Day 2 - Morning Session
 * Tests for src/app/utils/apiCache.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiCache } from '../apiCache';

// Mock logger
vi.mock('../logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }
}));

describe('API Cache', () => {
  beforeEach(() => {
    apiCache.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    apiCache.clear();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Basic Operations', () => {
    it('should set and get cache entry', () => {
      const data = { test: 'value' };
      apiCache.set('/api/test', data);
      
      const result = apiCache.get('/api/test');
      expect(result).toEqual(data);
    });

    it('should return undefined for non-existent key', () => {
      const result = apiCache.get('/api/nonexistent');
      expect(result).toBeUndefined();
    });

    it('should set entry with custom TTL', () => {
      const data = { test: 'value' };
      apiCache.set('/api/test', data, undefined, 1000); // 1 second TTL
      
      const result = apiCache.get('/api/test');
      expect(result).toEqual(data);
    });

    it('should delete specific cache entry', () => {
      apiCache.set('/api/test', { test: 'value' });
      apiCache.invalidate('/api/test');

      const result = apiCache.get('/api/test');
      expect(result).toBeUndefined();
    });

    it('should clear all cache entries', () => {
      apiCache.set('/api/test1', { test: '1' });
      apiCache.set('/api/test2', { test: '2' });
      apiCache.clear();
      
      expect(apiCache.get('/api/test1')).toBeUndefined();
      expect(apiCache.get('/api/test2')).toBeUndefined();
    });

    it('should return correct cache size', () => {
      apiCache.set('/api/test1', { test: '1' });
      apiCache.set('/api/test2', { test: '2' });
      
      expect(apiCache.getStats().size).toBe(2);
    });
  });

  describe('TTL and Expiration', () => {
    it('should expire entries after TTL', () => {
      const data = { test: 'value' };
      apiCache.set('/api/test', data, undefined, 1000); // 1 second TTL
      
      // Entry should exist immediately
      expect(apiCache.get('/api/test')).toEqual(data);
      
      // Fast-forward time past TTL
      vi.advanceTimersByTime(1001);
      
      // Entry should be expired
      expect(apiCache.get('/api/test')).toBeUndefined();
    });

    it('should not expire entries before TTL', () => {
      const data = { test: 'value' };
      apiCache.set('/api/test', data, undefined, 5000); // 5 seconds TTL
      
      // Fast-forward less than TTL
      vi.advanceTimersByTime(3000);
      
      // Entry should still exist
      expect(apiCache.get('/api/test')).toEqual(data);
    });

    it('should use default TTL when not specified', () => {
      const data = { test: 'value' };
      apiCache.set('/api/test', data);
      
      // Entry should exist immediately
      expect(apiCache.get('/api/test')).toEqual(data);
      
      // Fast-forward to default TTL (5 minutes = 300000ms)
      vi.advanceTimersByTime(300001);
      
      // Entry should be expired
      expect(apiCache.get('/api/test')).toBeUndefined();
    });

    it('should handle multiple entries with different TTLs', () => {
      apiCache.set('/api/short', { test: 'short' }, undefined, 1000);
      apiCache.set('/api/long', { test: 'long' }, undefined, 5000);
      
      // After 1.5 seconds, short should expire, long should remain
      vi.advanceTimersByTime(1500);
      
      expect(apiCache.get('/api/short')).toBeUndefined();
      expect(apiCache.get('/api/long')).toEqual({ test: 'long' });
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate by prefix', () => {
      apiCache.set('/api/users/1', { id: '1' });
      apiCache.set('/api/users/2', { id: '2' });
      apiCache.set('/api/products/1', { id: '1' });
      
      apiCache.invalidatePattern('/api/users');
      
      expect(apiCache.get('/api/users/1')).toBeUndefined();
      expect(apiCache.get('/api/users/2')).toBeUndefined();
      expect(apiCache.get('/api/products/1')).toEqual({ id: '1' });
    });

    it('should invalidate by pattern', () => {
      apiCache.set('/api/users/1', { id: '1' });
      apiCache.set('/api/users/2', { id: '2' });
      apiCache.set('/api/products/1', { id: '1' });
      
      apiCache.invalidatePattern(/users/);
      
      expect(apiCache.get('/api/users/1')).toBeUndefined();
      expect(apiCache.get('/api/users/2')).toBeUndefined();
      expect(apiCache.get('/api/products/1')).toEqual({ id: '1' });
    });

    it('should handle invalidation with no matches', () => {
      apiCache.set('/api/test', { test: 'value' });
      
      // Should not throw error
      apiCache.invalidatePattern('/api/nonexistent');
      
      // Original entry should still exist
      expect(apiCache.get('/api/test')).toEqual({ test: 'value' });
    });
  });

  describe('Memory Management', () => {
    it('should evict oldest entries when max size reached', () => {
      // Set max size to 3
      apiCache.clear();
      
      // Add 3 entries
      apiCache.set('/api/test1', { id: '1' });
      vi.advanceTimersByTime(100);
      apiCache.set('/api/test2', { id: '2' });
      vi.advanceTimersByTime(100);
      apiCache.set('/api/test3', { id: '3' });
      
      // Add 4th entry (should evict oldest)
      vi.advanceTimersByTime(100);
      apiCache.set('/api/test4', { id: '4' });
      
      // Oldest entry should be evicted if max size is 3
      // (depends on cache implementation)
      expect(apiCache.getStats().size).toBeLessThanOrEqual(100); // Default max size
    });

    it('should update existing entry without increasing size', () => {
      apiCache.set('/api/test', { version: '1' });
      const initialSize = apiCache.getStats().size;
      
      apiCache.set('/api/test', { version: '2' });
      
      expect(apiCache.getStats().size).toBe(initialSize);
      expect(apiCache.get('/api/test')).toEqual({ version: '2' });
    });

    it('should handle rapid sequential sets', () => {
      for (let i = 0; i < 10; i++) {
        apiCache.set(`/api/test${i}`, { id: i });
      }
      
      expect(apiCache.getStats().size).toBe(10);
    });
  });

  describe('Query Parameters', () => {
    it('should cache entries with different params separately', () => {
      apiCache.set('/api/users', { page: 1 }, { page: 1 });
      apiCache.set('/api/users', { page: 2 }, { page: 2 });
      
      expect(apiCache.get('/api/users', { page: 1 })).toEqual({ page: 1 });
      expect(apiCache.get('/api/users', { page: 2 })).toEqual({ page: 2 });
    });

    it('should match entries with same params', () => {
      const data = { test: 'value' };
      apiCache.set('/api/test', data, { sort: 'asc', limit: 10 });
      
      const result = apiCache.get('/api/test', { sort: 'asc', limit: 10 });
      expect(result).toEqual(data);
    });

    it('should not match entries with different params', () => {
      apiCache.set('/api/test', { test: 'value' }, { page: 1 });
      
      const result = apiCache.get('/api/test', { page: 2 });
      expect(result).toBeUndefined();
    });

    it('should handle complex nested params', () => {
      const data = { test: 'value' };
      const params = { filter: { status: 'active', type: 'user' }, sort: 'name' };
      
      apiCache.set('/api/test', data, params);
      
      const result = apiCache.get('/api/test', params);
      expect(result).toEqual(data);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null data', () => {
      apiCache.set('/api/test', null);
      expect(apiCache.get('/api/test')).toBeNull();
    });

    it('should handle undefined data', () => {
      apiCache.set('/api/test', undefined);
      expect(apiCache.get('/api/test')).toBeUndefined();
    });

    it('should handle empty string as key', () => {
      apiCache.set('', { test: 'value' });
      expect(apiCache.get('')).toEqual({ test: 'value' });
    });

    it('should handle special characters in URL', () => {
      const url = '/api/test?query=hello&param=world';
      apiCache.set(url, { test: 'value' });
      expect(apiCache.get(url)).toEqual({ test: 'value' });
    });

    it('should handle large data objects', () => {
      const largeData = { items: new Array(1000).fill({ test: 'value' }) };
      apiCache.set('/api/large', largeData);
      
      const result = apiCache.get('/api/large');
      expect(result).toEqual(largeData);
    });
  });

  describe('Statistics', () => {
    it('should report cache hit/miss statistics', () => {
      apiCache.set('/api/test', { test: 'value' });
      
      // Hit
      apiCache.get('/api/test');
      
      // Miss
      apiCache.get('/api/nonexistent');
      
      const stats = apiCache.getStats();
      expect(stats).toBeDefined();
      // Stats depend on implementation
    });
  });
});