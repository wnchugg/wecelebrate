/**
 * Performance Monitoring Utility
 * Tracks Web Vitals and custom performance metrics
 * Phase 2.3: Performance Optimization
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitals {
  LCP?: PerformanceMetric; // Largest Contentful Paint
  FID?: PerformanceMetric; // First Input Delay
  CLS?: PerformanceMetric; // Cumulative Layout Shift
  FCP?: PerformanceMetric; // First Contentful Paint
  TTFB?: PerformanceMetric; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitals = {};
  private enabled: boolean;

  constructor() {
    // Only enable in development or when explicitly enabled
    this.enabled = import.meta.env.DEV || 
                   localStorage.getItem('PERFORMANCE_MONITORING') === 'true';
    
    if (this.enabled) {
      this.initializeWebVitals();
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private initializeWebVitals() {
    if (typeof window === 'undefined') return;

    // Observe Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.recordWebVital('LCP', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      logger.warn('LCP observer not supported');
    }

    // Observe First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordWebVital('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      logger.warn('FID observer not supported');
    }

    // Observe Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordWebVital('CLS', clsValue);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      logger.warn('CLS observer not supported');
    }

    // Observe Navigation Timing for TTFB and FCP
    if (window.performance && window.performance.getEntriesByType) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navTiming = performance.getEntriesByType('navigation')[0] as any;
          if (navTiming) {
            this.recordWebVital('TTFB', navTiming.responseStart - navTiming.requestStart);
          }

          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            this.recordWebVital('FCP', fcpEntry.startTime);
          }
        }, 0);
      });
    }
  }

  /**
   * Record a Web Vital metric
   */
  private recordWebVital(name: string, value: number) {
    const rating = this.getRating(name, value);
    const metric: PerformanceMetric = {
      name,
      value: Math.round(value),
      rating,
      timestamp: Date.now()
    };

    this.webVitals[name as keyof WebVitals] = metric;
    this.metrics.push(metric);

    if (this.enabled) {
      logger.log(`[Performance] ${name}: ${metric.value}ms (${rating})`);
    }
  }

  /**
   * Get rating for a metric based on Web Vitals thresholds
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, value: number) {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      name,
      value: Math.round(value),
      rating: 'good',
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    logger.log(`[Performance] ${name}: ${value}ms`);
  }

  /**
   * Measure and record execution time of a function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name} (error)`, duration);
      throw error;
    }
  }

  /**
   * Measure and record execution time of a synchronous function
   */
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name} (error)`, duration);
      throw error;
    }
  }

  /**
   * Mark a performance point
   */
  mark(name: string) {
    if (!this.enabled) return;
    performance.mark(name);
    logger.log(`[Performance] Mark: ${name}`);
  }

  /**
   * Measure time between two marks
   */
  measureBetween(name: string, startMark: string, endMark: string) {
    if (!this.enabled) return;
    
    try {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name);
      if (measures.length > 0) {
        const duration = measures[measures.length - 1].duration;
        this.recordMetric(name, duration);
      }
    } catch (e) {
      logger.warn(`Failed to measure between marks: ${startMark} -> ${endMark}`);
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get Web Vitals
   */
  getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const vitals = this.getWebVitals();
    const customMetrics = this.metrics.filter(m => 
      !['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(m.name)
    );

    return {
      webVitals: vitals,
      customMetrics: customMetrics.slice(-20), // Last 20 custom metrics
      timestamp: Date.now()
    };
  }

  /**
   * Log performance summary to console
   */
  logSummary() {
    if (!this.enabled) return;

    const summary = this.getSummary();
    logger.group('Performance Summary');
    logger.log('Web Vitals:', summary.webVitals);
    logger.log('Custom Metrics:', summary.customMetrics);
    logger.groupEnd();
  }

  /**
   * Enable performance monitoring
   */
  enable() {
    this.enabled = true;
    localStorage.setItem('PERFORMANCE_MONITORING', 'true');
    logger.log('[Performance] Monitoring enabled');
  }

  /**
   * Disable performance monitoring
   */
  disable() {
    this.enabled = false;
    localStorage.removeItem('PERFORMANCE_MONITORING');
    logger.log('[Performance] Monitoring disabled');
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Clear all recorded metrics
   */
  clear() {
    this.metrics = [];
    this.webVitals = {};
    logger.log('[Performance] Metrics cleared');
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for convenient usage
export const {
  recordMetric,
  measureAsync,
  measure,
  mark,
  measureBetween,
  getMetrics,
  getWebVitals,
  getSummary,
  logSummary,
  enable: enablePerformanceMonitoring,
  disable: disablePerformanceMonitoring
} = performanceMonitor;