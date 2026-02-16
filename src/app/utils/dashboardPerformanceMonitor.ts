/**
 * Dashboard Performance Monitor
 * 
 * Utility for monitoring and logging dashboard performance metrics
 * Helps identify bottlenecks and optimization opportunities
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalDuration: number;
    averageDuration: number;
    slowest: PerformanceMetric | null;
    fastest: PerformanceMetric | null;
  };
}

class DashboardPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Only enable in development or when explicitly enabled
    this.enabled = import.meta.env.DEV || localStorage.getItem('enablePerformanceMonitoring') === 'true';
  }

  /**
   * Start timing an operation
   */
  startTimer(name: string, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    const startTime = performance.now();
    this.timers.set(name, startTime);

    console.warn(`[Performance] ⏱️ Started: ${name}`, metadata);
  }

  /**
   * End timing an operation and record the metric
   */
  endTimer(name: string, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`[Performance] ⚠️ Timer "${name}" was never started`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    this.timers.delete(name);

    const color = duration > 1000 ? '🔴' : duration > 500 ? '🟡' : '🟢';
    console.warn(`[Performance] ${color} Completed: ${name} in ${duration.toFixed(2)}ms`, metadata);

    // Warn about slow operations
    if (duration > 1000) {
      console.warn(`[Performance] ⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Mark a specific point in time
   */
  mark(name: string, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    performance.mark(name);
    console.warn(`[Performance] 📍 Mark: ${name}`, metadata);
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark: string) {
    if (!this.enabled) return;

    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      
      if (measure) {
        const metric: PerformanceMetric = {
          name,
          duration: measure.duration,
          timestamp: Date.now(),
        };

        this.metrics.push(metric);
        console.warn(`[Performance] 📏 Measured: ${name} = ${measure.duration.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error(`[Performance] Failed to measure ${name}:`, error);
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get a performance report
   */
  getReport(): PerformanceReport {
    if (this.metrics.length === 0) {
      return {
        metrics: [],
        summary: {
          totalDuration: 0,
          averageDuration: 0,
          slowest: null,
          fastest: null,
        },
      };
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / this.metrics.length;
    const slowest = this.metrics.reduce((prev, current) =>
      current.duration > prev.duration ? current : prev
    );
    const fastest = this.metrics.reduce((prev, current) =>
      current.duration < prev.duration ? current : prev
    );

    return {
      metrics: this.getMetrics(),
      summary: {
        totalDuration,
        averageDuration,
        slowest,
        fastest,
      },
    };
  }

  /**
   * Print a formatted performance report
   */
  printReport() {
    if (!this.enabled) {
      console.warn('[Performance] Monitoring is disabled');
      return;
    }

    const report = this.getReport();

    console.warn('📊 Dashboard Performance Report');
    console.warn(`Total Operations: ${report.metrics.length}`);
    console.warn(`Total Duration: ${report.summary.totalDuration.toFixed(2)}ms`);
    console.warn(`Average Duration: ${report.summary.averageDuration.toFixed(2)}ms`);
    
    if (report.summary.slowest) {
      console.warn(`Slowest: ${report.summary.slowest.name} (${report.summary.slowest.duration.toFixed(2)}ms)`);
    }
    
    if (report.summary.fastest) {
      console.warn(`Fastest: ${report.summary.fastest.name} (${report.summary.fastest.duration.toFixed(2)}ms)`);
    }

    console.warn(
      report.metrics.map(m => ({
        Name: m.name,
        'Duration (ms)': m.duration.toFixed(2),
        Timestamp: new Date(m.timestamp).toLocaleTimeString(),
      }))
    );
    
    // End of report (no groupEnd needed)
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
    this.timers.clear();
    performance.clearMarks();
    performance.clearMeasures();
    console.warn('[Performance] Cleared all metrics');
  }

  /**
   * Enable performance monitoring
   */
  enable() {
    this.enabled = true;
    localStorage.setItem('enablePerformanceMonitoring', 'true');
    console.warn('[Performance] ✅ Monitoring enabled');
  }

  /**
   * Disable performance monitoring
   */
  disable() {
    this.enabled = false;
    localStorage.removeItem('enablePerformanceMonitoring');
    console.warn('[Performance] ❌ Monitoring disabled');
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Monitor a function execution
   */
  async monitorAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.startTimer(name, metadata);
    try {
      const result = await fn();
      this.endTimer(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endTimer(name, { ...metadata, success: false, error });
      throw error;
    }
  }

  /**
   * Monitor a synchronous function execution
   */
  monitor<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.startTimer(name, metadata);
    try {
      const result = fn();
      this.endTimer(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endTimer(name, { ...metadata, success: false, error });
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardPerformanceMonitor = new DashboardPerformanceMonitor();

// Expose to window for debugging in console
if (typeof window !== 'undefined') {
  (window as any).dashboardPerfMon = dashboardPerformanceMonitor;
}

/**
 * React Hook for performance monitoring
 */
export function usePerformanceMonitor() {
  return {
    startTimer: (name: string, metadata?: Record<string, any>) =>
      dashboardPerformanceMonitor.startTimer(name, metadata),
    endTimer: (name: string, metadata?: Record<string, any>) =>
      dashboardPerformanceMonitor.endTimer(name, metadata),
    mark: (name: string, metadata?: Record<string, any>) =>
      dashboardPerformanceMonitor.mark(name, metadata),
    measure: (name: string, startMark: string, endMark: string) =>
      dashboardPerformanceMonitor.measure(name, startMark, endMark),
    getReport: () => dashboardPerformanceMonitor.getReport(),
    printReport: () => dashboardPerformanceMonitor.printReport(),
    clear: () => dashboardPerformanceMonitor.clear(),
    monitorAsync: <T,>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>) =>
      dashboardPerformanceMonitor.monitorAsync(name, fn, metadata),
    monitor: <T,>(name: string, fn: () => T, metadata?: Record<string, any>) =>
      dashboardPerformanceMonitor.monitor(name, fn, metadata),
  };
}

// Console helper functions
console.warn(`
📊 Dashboard Performance Monitor
--------------------------------
Access via: window.dashboardPerfMon

Commands:
  dashboardPerfMon.enable()      - Enable monitoring
  dashboardPerfMon.disable()     - Disable monitoring
  dashboardPerfMon.printReport() - Show performance report
  dashboardPerfMon.clear()       - Clear all metrics
  dashboardPerfMon.getReport()   - Get raw report data
`);
