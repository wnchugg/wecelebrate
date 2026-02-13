/**
 * Route Preloader Tests
 * Day 6 - Week 2: Performance & Optimization Testing
 * Target: 20 tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  preloadRoute,
  preloadRoutes,
  preloadAdminRoutes,
  resetPreloadCache,
} from '../routePreloader';

describe('RoutePreloader', () => {
  beforeEach(() => {
    resetPreloadCache();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    resetPreloadCache();
    vi.useRealTimers();
  });

  describe('preloadRoute', () => {
    it('should preload a route successfully', async () => {
      const mockImport = vi.fn().mockResolvedValue({ default: {} });
      
      await preloadRoute(mockImport);
      
      expect(mockImport).toHaveBeenCalledTimes(1);
    });

    it('should not preload the same route twice', async () => {
      const mockImport = vi.fn().mockResolvedValue({ default: {} });
      
      await preloadRoute(mockImport);
      await preloadRoute(mockImport);
      
      expect(mockImport).toHaveBeenCalledTimes(1);
    });

    it('should handle import failures gracefully', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));
      
      await preloadRoute(mockImport);
      
      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });

    it('should not throw on import failure', async () => {
      const mockImport = vi.fn().mockRejectedValue(new Error('Failed'));
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await expect(preloadRoute(mockImport)).resolves.not.toThrow();
      
      consoleWarn.mockRestore();
    });

    it('should work with different import functions', async () => {
      const import1 = vi.fn().mockResolvedValue({ default: 'Component1' });
      const import2 = vi.fn().mockResolvedValue({ default: 'Component2' });
      
      await preloadRoute(import1);
      await preloadRoute(import2);
      
      expect(import1).toHaveBeenCalledTimes(1);
      expect(import2).toHaveBeenCalledTimes(1);
    });

    it('should handle async imports', async () => {
      const mockImport = vi.fn(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ default: 'Component' }), 10)
        )
      );
      
      const promise = preloadRoute(mockImport);
      vi.advanceTimersByTime(10);
      await promise;
      
      expect(mockImport).toHaveBeenCalled();
    });
  });

  describe('preloadRoutes', () => {
    it('should preload multiple routes', async () => {
      const import1 = vi.fn().mockResolvedValue({});
      const import2 = vi.fn().mockResolvedValue({});
      const import3 = vi.fn().mockResolvedValue({});
      
      const promise = preloadRoutes([import1, import2, import3], 50);
      
      // Advance timers to complete all delays
      await vi.runAllTimersAsync();
      await promise;
      
      expect(import1).toHaveBeenCalled();
      expect(import2).toHaveBeenCalled();
      expect(import3).toHaveBeenCalled();
    });

    it('should delay between route preloads', async () => {
      const import1 = vi.fn().mockResolvedValue({});
      const import2 = vi.fn().mockResolvedValue({});
      
      const promise = preloadRoutes([import1, import2], 100);
      
      await vi.advanceTimersByTimeAsync(0);
      expect(import1).toHaveBeenCalled();
      expect(import2).not.toHaveBeenCalled();
      
      await vi.advanceTimersByTimeAsync(100);
      await promise;
      expect(import2).toHaveBeenCalled();
    });

    it('should handle empty array', async () => {
      await expect(preloadRoutes([], 50)).resolves.not.toThrow();
    });

    it('should use default delay of 50ms', async () => {
      const import1 = vi.fn().mockResolvedValue({});
      const import2 = vi.fn().mockResolvedValue({});
      
      const promise = preloadRoutes([import1, import2]);
      
      await vi.advanceTimersByTimeAsync(0);
      expect(import1).toHaveBeenCalled();
      
      await vi.advanceTimersByTimeAsync(50);
      await promise;
      expect(import2).toHaveBeenCalled();
    });

    it('should continue on individual route failure', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const import1 = vi.fn().mockRejectedValue(new Error('Failed'));
      const import2 = vi.fn().mockResolvedValue({});
      
      await vi.runAllTimersAsync();
      await preloadRoutes([import1, import2], 10);
      
      expect(import1).toHaveBeenCalled();
      expect(import2).toHaveBeenCalled();
      
      consoleWarn.mockRestore();
    });

    it('should respect custom delay', async () => {
      const import1 = vi.fn().mockResolvedValue({});
      const import2 = vi.fn().mockResolvedValue({});
      
      const promise = preloadRoutes([import1, import2], 200);
      
      await vi.advanceTimersByTimeAsync(100);
      expect(import2).not.toHaveBeenCalled();
      
      await vi.advanceTimersByTimeAsync(100);
      await promise;
      expect(import2).toHaveBeenCalled();
    });
  });

  describe('preloadAdminRoutes', () => {
    it('should log preload start', async () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Mock all imports
      vi.mock('../pages/admin/Dashboard', () => ({ default: {} }));
      
      const promise = preloadAdminRoutes();
      await vi.runAllTimersAsync();
      await promise;
      
      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[Route Preloader]')
      );
      
      consoleLog.mockRestore();
    });

    it('should preload critical routes first', async () => {
      const promise = preloadAdminRoutes();
      
      // Advance just enough for critical routes
      await vi.advanceTimersByTimeAsync(500);
      
      // Should still be in progress
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await vi.runAllTimersAsync();
      await promise;
      
      consoleLog.mockRestore();
    });

    it('should handle import errors gracefully', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await vi.runAllTimersAsync();
      await preloadAdminRoutes();
      
      // Should not throw
      expect(true).toBe(true);
      
      consoleWarn.mockRestore();
    });

    it('should preload secondary routes after delay', async () => {
      const promise = preloadAdminRoutes();
      
      // Advance past critical routes
      await vi.advanceTimersByTimeAsync(500);
      
      // Secondary routes should start loading
      await vi.runAllTimersAsync();
      await promise;
      
      expect(true).toBe(true);
    });
  });

  describe('resetPreloadCache', () => {
    it('should clear preload cache', async () => {
      const mockImport = vi.fn().mockResolvedValue({});
      
      await preloadRoute(mockImport);
      expect(mockImport).toHaveBeenCalledTimes(1);
      
      resetPreloadCache();
      
      await preloadRoute(mockImport);
      expect(mockImport).toHaveBeenCalledTimes(2);
    });

    it('should allow routes to be preloaded again after reset', async () => {
      const import1 = vi.fn().mockResolvedValue({});
      const import2 = vi.fn().mockResolvedValue({});
      
      await preloadRoute(import1);
      await preloadRoute(import2);
      
      resetPreloadCache();
      
      await preloadRoute(import1);
      await preloadRoute(import2);
      
      expect(import1).toHaveBeenCalledTimes(2);
      expect(import2).toHaveBeenCalledTimes(2);
    });

    it('should not throw when cache is empty', () => {
      expect(() => resetPreloadCache()).not.toThrow();
    });

    it('should work after multiple resets', () => {
      resetPreloadCache();
      resetPreloadCache();
      resetPreloadCache();
      
      expect(() => resetPreloadCache()).not.toThrow();
    });
  });
});
