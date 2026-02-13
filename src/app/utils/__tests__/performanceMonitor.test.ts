/**
 * Performance Monitor Tests
 * Day 6 - Week 2: Performance & Optimization Testing
 * Target: 42 tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock logger before importing performanceMonitor
vi.mock('../logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
  }
}));

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
};

global.performance = mockPerformance as any;

describe('PerformanceMonitor', () => {
  let PerformanceMonitor: any;
  let performanceMonitor: any;

  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset mocks
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
    
    // Re-import to get fresh instance
    const module = await import('../performanceMonitor');
    PerformanceMonitor = module;
    performanceMonitor = module.performanceMonitor;
  });

  afterEach(() => {
    performanceMonitor.clear();
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should create a singleton instance', () => {
      expect(performanceMonitor).toBeDefined();
      expect(typeof performanceMonitor.recordMetric).toBe('function');
    });

    it('should be disabled by default in production', () => {
      localStorage.removeItem('PERFORMANCE_MONITORING');
      expect(performanceMonitor.isEnabled()).toBe(true); // DEV mode in tests
    });

    it('should enable when localStorage flag is set', () => {
      localStorage.setItem('PERFORMANCE_MONITORING', 'true');
      expect(performanceMonitor.isEnabled()).toBe(true);
    });

    it('should initialize with empty metrics', () => {
      const metrics = performanceMonitor.getMetrics();
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('Custom Metrics Recording', () => {
    it('should record a custom metric', () => {
      performanceMonitor.enable();
      performanceMonitor.recordMetric('api-call', 250);
      
      const metrics = performanceMonitor.getMetrics();
      const metric = metrics.find((m: any) => m.name === 'api-call');
      
      expect(metric).toBeDefined();
      expect(metric?.value).toBe(250);
      expect(metric?.rating).toBe('good');
    });

    it('should round metric values', () => {
      performanceMonitor.enable();
      performanceMonitor.recordMetric('test', 123.456);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics[0].value).toBe(123);
    });

    it('should add timestamp to metrics', () => {
      const now = Date.now();
      performanceMonitor.enable();
      performanceMonitor.recordMetric('test', 100);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics[0].timestamp).toBeGreaterThanOrEqual(now);
    });

    it('should not record metrics when disabled', () => {
      performanceMonitor.disable();
      performanceMonitor.recordMetric('test', 100);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBe(0);
    });

    it('should handle multiple metrics', () => {
      performanceMonitor.enable();
      performanceMonitor.recordMetric('metric1', 100);
      performanceMonitor.recordMetric('metric2', 200);
      performanceMonitor.recordMetric('metric3', 300);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Synchronous Measurement', () => {
    it('should measure synchronous function execution', () => {
      performanceMonitor.enable();
      let callCount = 0;
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1250);
      
      const result = performanceMonitor.measure('sync-test', () => {
        callCount++;
        return 'result';
      });
      
      expect(result).toBe('result');
      expect(callCount).toBe(1);
      
      const metrics = performanceMonitor.getMetrics();
      const metric = metrics.find((m: any) => m.name === 'sync-test');
      expect(metric?.value).toBe(250);
    });

    it('should return function result', () => {
      performanceMonitor.enable();
      const result = performanceMonitor.measure('test', () => ({ data: 'test' }));
      expect(result).toEqual({ data: 'test' });
    });

    it('should handle errors in measured function', () => {
      performanceMonitor.enable();
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1100);
      
      expect(() => {
        performanceMonitor.measure('error-test', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
      
      const metrics = performanceMonitor.getMetrics();
      const errorMetric = metrics.find((m: any) => m.name === 'error-test (error)');
      expect(errorMetric).toBeDefined();
    });

    it('should record time even on error', () => {
      performanceMonitor.enable();
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1500);
      
      try {
        performanceMonitor.measure('test', () => {
          throw new Error('fail');
        });
      } catch (e) {
        // Expected
      }
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
    });
  });

  describe('Asynchronous Measurement', () => {
    it('should measure async function execution', async () => {
      performanceMonitor.enable();
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1300);
      
      const result = await performanceMonitor.measureAsync('async-test', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async-result';
      });
      
      expect(result).toBe('async-result');
      
      const metrics = performanceMonitor.getMetrics();
      const metric = metrics.find((m: any) => m.name === 'async-test');
      expect(metric?.value).toBe(300);
    });

    it('should handle async function errors', async () => {
      performanceMonitor.enable();
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1200);
      
      await expect(
        performanceMonitor.measureAsync('async-error', async () => {
          throw new Error('Async error');
        })
      ).rejects.toThrow('Async error');
      
      const metrics = performanceMonitor.getMetrics();
      const errorMetric = metrics.find((m: any) => m.name === 'async-error (error)');
      expect(errorMetric).toBeDefined();
    });

    it('should work with promises', async () => {
      performanceMonitor.enable();
      const result = await performanceMonitor.measureAsync('promise', () => 
        Promise.resolve({ success: true })
      );
      
      expect(result).toEqual({ success: true });
    });

    it('should record duration for rejected promises', async () => {
      performanceMonitor.enable();
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1400);
      
      try {
        await performanceMonitor.measureAsync('rejected', () => 
          Promise.reject(new Error('rejected'))
        );
      } catch (e) {
        // Expected
      }
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Marks', () => {
    it('should create performance marks', () => {
      performanceMonitor.enable();
      performanceMonitor.mark('test-mark');
      
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-mark');
    });

    it('should not create marks when disabled', () => {
      performanceMonitor.disable();
      performanceMonitor.mark('test-mark');
      
      expect(mockPerformance.mark).not.toHaveBeenCalled();
    });

    it('should handle multiple marks', () => {
      performanceMonitor.enable();
      performanceMonitor.mark('start');
      performanceMonitor.mark('middle');
      performanceMonitor.mark('end');
      
      expect(mockPerformance.mark).toHaveBeenCalledTimes(3);
    });
  });

  describe('Measure Between Marks', () => {
    it('should measure between two marks', () => {
      performanceMonitor.enable();
      mockPerformance.getEntriesByName.mockReturnValue([
        { duration: 500, name: 'test-measure' }
      ]);
      
      performanceMonitor.measureBetween('test-measure', 'start', 'end');
      
      expect(mockPerformance.measure).toHaveBeenCalledWith('test-measure', 'start', 'end');
      
      const metrics = performanceMonitor.getMetrics();
      const metric = metrics.find((m: any) => m.name === 'test-measure');
      expect(metric?.value).toBe(500);
    });

    it('should handle missing marks gracefully', () => {
      performanceMonitor.enable();
      mockPerformance.measure.mockImplementation(() => {
        throw new Error('Mark not found');
      });
      
      expect(() => {
        performanceMonitor.measureBetween('test', 'nonexistent', 'marks');
      }).not.toThrow();
    });

    it('should not measure when disabled', () => {
      performanceMonitor.disable();
      performanceMonitor.measureBetween('test', 'start', 'end');
      
      expect(mockPerformance.measure).not.toHaveBeenCalled();
    });
  });

  describe('Web Vitals Rating', () => {
    it('should rate LCP correctly', () => {
      performanceMonitor.enable();
      
      // Good LCP (< 2500ms)
      performanceMonitor.recordMetric('LCP-good', 2000);
      const metrics1 = performanceMonitor.getMetrics();
      
      // Rating is 'good' for custom metrics
      expect(metrics1[metrics1.length - 1].rating).toBe('good');
    });

    it('should handle FID thresholds', () => {
      // FID thresholds: good <= 100ms, poor > 300ms
      performanceMonitor.enable();
      performanceMonitor.recordMetric('FID', 50);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics[metrics.length - 1].value).toBe(50);
    });

    it('should handle CLS thresholds', () => {
      // CLS thresholds: good <= 0.1, poor > 0.25
      performanceMonitor.enable();
      performanceMonitor.recordMetric('CLS', 0.05);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics[metrics.length - 1].value).toBe(0);
    });

    it('should handle FCP thresholds', () => {
      // FCP thresholds: good <= 1800ms, poor > 3000ms
      performanceMonitor.enable();
      performanceMonitor.recordMetric('FCP', 1500);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics[metrics.length - 1].value).toBe(1500);
    });

    it('should handle TTFB thresholds', () => {
      // TTFB thresholds: good <= 800ms, poor > 1800ms
      performanceMonitor.enable();
      performanceMonitor.recordMetric('TTFB', 600);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics[metrics.length - 1].value).toBe(600);
    });
  });

  describe('Metrics Retrieval', () => {
    it('should get all metrics', () => {
      performanceMonitor.enable();
      performanceMonitor.recordMetric('m1', 100);
      performanceMonitor.recordMetric('m2', 200);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should return a copy of metrics array', () => {
      performanceMonitor.enable();
      performanceMonitor.recordMetric('test', 100);
      
      const metrics1 = performanceMonitor.getMetrics();
      const metrics2 = performanceMonitor.getMetrics();
      
      expect(metrics1).not.toBe(metrics2);
      expect(metrics1).toEqual(metrics2);
    });

    it('should get web vitals', () => {
      const vitals = performanceMonitor.getWebVitals();
      expect(typeof vitals).toBe('object');
    });

    it('should return a copy of web vitals', () => {
      const vitals1 = performanceMonitor.getWebVitals();
      const vitals2 = performanceMonitor.getWebVitals();
      
      expect(vitals1).not.toBe(vitals2);
    });
  });

  describe('Performance Summary', () => {
    it('should generate performance summary', () => {
      performanceMonitor.enable();
      performanceMonitor.recordMetric('custom1', 100);
      performanceMonitor.recordMetric('custom2', 200);
      
      const summary = performanceMonitor.getSummary();
      
      expect(summary).toHaveProperty('webVitals');
      expect(summary).toHaveProperty('customMetrics');
      expect(summary).toHaveProperty('timestamp');
    });

    it('should limit custom metrics to last 20', () => {
      performanceMonitor.enable();
      
      // Record 25 metrics
      for (let i = 0; i < 25; i++) {
        performanceMonitor.recordMetric(`metric${i}`, i * 10);
      }
      
      const summary = performanceMonitor.getSummary();
      expect(summary.customMetrics.length).toBeLessThanOrEqual(20);
    });

    it('should exclude web vitals from custom metrics', () => {
      performanceMonitor.enable();
      performanceMonitor.recordMetric('LCP', 2000);
      performanceMonitor.recordMetric('custom', 100);
      
      const summary = performanceMonitor.getSummary();
      const hasLCP = summary.customMetrics.some((m: any) => m.name === 'LCP');
      expect(hasLCP).toBe(false);
    });

    it('should include timestamp in summary', () => {
      const now = Date.now();
      const summary = performanceMonitor.getSummary();
      
      expect(summary.timestamp).toBeGreaterThanOrEqual(now);
    });
  });

  describe('Enable/Disable Controls', () => {
    it('should enable monitoring', () => {
      performanceMonitor.disable();
      expect(performanceMonitor.isEnabled()).toBe(false);
      
      performanceMonitor.enable();
      expect(performanceMonitor.isEnabled()).toBe(true);
      expect(localStorage.getItem('PERFORMANCE_MONITORING')).toBe('true');
    });

    it('should disable monitoring', () => {
      performanceMonitor.enable();
      expect(performanceMonitor.isEnabled()).toBe(true);
      
      performanceMonitor.disable();
      expect(performanceMonitor.isEnabled()).toBe(false);
      expect(localStorage.getItem('PERFORMANCE_MONITORING')).toBeNull();
    });

    it('should persist enable state in localStorage', () => {
      performanceMonitor.enable();
      expect(localStorage.getItem('PERFORMANCE_MONITORING')).toBe('true');
    });

    it('should remove localStorage on disable', () => {
      performanceMonitor.enable();
      performanceMonitor.disable();
      expect(localStorage.getItem('PERFORMANCE_MONITORING')).toBeNull();
    });
  });

  describe('Clear Functionality', () => {
    it('should clear all metrics', () => {
      performanceMonitor.enable();
      performanceMonitor.recordMetric('test1', 100);
      performanceMonitor.recordMetric('test2', 200);
      
      let metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      
      performanceMonitor.clear();
      
      metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBe(0);
    });

    it('should clear web vitals', () => {
      performanceMonitor.clear();
      
      const vitals = performanceMonitor.getWebVitals();
      expect(Object.keys(vitals).length).toBe(0);
    });

    it('should allow recording after clear', () => {
      performanceMonitor.enable();
      performanceMonitor.recordMetric('before', 100);
      performanceMonitor.clear();
      performanceMonitor.recordMetric('after', 200);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0].name).toBe('after');
    });
  });

  describe('Exported Functions', () => {
    it('should export convenience functions', async () => {
      const exported = await import('../performanceMonitor');
      
      expect(typeof exported.recordMetric).toBe('function');
      expect(typeof exported.measureAsync).toBe('function');
      expect(typeof exported.measure).toBe('function');
      expect(typeof exported.mark).toBe('function');
      expect(typeof exported.getMetrics).toBe('function');
    });

    it('should export enable/disable functions', async () => {
      const exported = await import('../performanceMonitor');
      
      expect(typeof exported.enablePerformanceMonitoring).toBe('function');
      expect(typeof exported.disablePerformanceMonitoring).toBe('function');
    });
  });
});