/**
 * Performance Testing Utilities
 * Provides benchmarking and performance measurement tools for critical paths
 */

import { performance } from 'node:perf_hooks';

export interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface PerformanceBenchmark {
  name: string;
  iterations: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  medianDuration: number;
  p95Duration: number;
  p99Duration: number;
}

class PerformanceMonitor {
  private marks: Map<string, PerformanceMark> = new Map();
  private measurements: Map<string, number[]> = new Map();

  /**
   * Start a performance mark
   */
  mark(name: string): void {
    this.marks.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * End a performance mark and record duration
   */
  measure(name: string): number | null {
    const mark = this.marks.get(name);
    if (!mark) {
      console.warn(`Performance mark "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - mark.startTime;
    
    mark.endTime = endTime;
    mark.duration = duration;

    // Store measurement
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name).push(duration);

    return duration;
  }

  /**
   * Get all measurements for a mark
   */
  getMeasurements(name: string): number[] {
    return this.measurements.get(name) || [];
  }

  /**
   * Clear all marks and measurements
   */
  clear(): void {
    this.marks.clear();
    this.measurements.clear();
  }

  /**
   * Get statistics for a mark
   */
  getStats(name: string): PerformanceBenchmark | null {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const total = sorted.reduce((sum, val) => sum + val, 0);
    
    return {
      name,
      iterations: measurements.length,
      totalDuration: total,
      averageDuration: total / measurements.length,
      minDuration: sorted[0],
      maxDuration: sorted[sorted.length - 1],
      medianDuration: sorted[Math.floor(sorted.length / 2)],
      p95Duration: sorted[Math.floor(sorted.length * 0.95)],
      p99Duration: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * Print benchmark results
   */
  printBenchmark(name: string): void {
    const stats = this.getStats(name);
    if (!stats) {
      console.log(`No measurements found for "${name}"`);
      return;
    }

    console.log(`\n📊 Performance Benchmark: ${name}`);
    console.log(`   Iterations: ${stats.iterations}`);
    console.log(`   Average:    ${stats.averageDuration.toFixed(2)}ms`);
    console.log(`   Median:     ${stats.medianDuration.toFixed(2)}ms`);
    console.log(`   Min:        ${stats.minDuration.toFixed(2)}ms`);
    console.log(`   Max:        ${stats.maxDuration.toFixed(2)}ms`);
    console.log(`   P95:        ${stats.p95Duration.toFixed(2)}ms`);
    console.log(`   P99:        ${stats.p99Duration.toFixed(2)}ms`);
  }

  /**
   * Print all benchmarks
   */
  printAllBenchmarks(): void {
    const names = Array.from(this.measurements.keys());
    if (names.length === 0) {
      console.log('No benchmarks recorded');
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE BENCHMARK RESULTS');
    console.log('='.repeat(60));
    
    names.forEach(name => this.printBenchmark(name));
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// Global performance monitor instance
export const perfMonitor = new PerformanceMonitor();

/**
 * Benchmark a function
 */
export async function benchmark<T>(
  name: string,
  fn: () => T | Promise<T>,
  iterations: number = 100
): Promise<PerformanceBenchmark | null> {
  console.log(`🏃 Running benchmark: ${name} (${iterations} iterations)`);
  
  for (let i = 0; i < iterations; i++) {
    perfMonitor.mark(name);
    await fn();
    perfMonitor.measure(name);
  }

  const stats = perfMonitor.getStats(name);
  if (stats) {
    perfMonitor.printBenchmark(name);
  }
  
  return stats;
}

/**
 * Assert performance threshold
 */
export function assertPerformance(
  name: string,
  maxAverageDuration: number,
  maxP95Duration?: number
): void {
  const stats = perfMonitor.getStats(name);
  
  if (!stats) {
    throw new Error(`No performance data found for "${name}"`);
  }

  if (stats.averageDuration > maxAverageDuration) {
    throw new Error(
      `Performance threshold exceeded for "${name}": ` +
      `average ${stats.averageDuration.toFixed(2)}ms > ${maxAverageDuration}ms`
    );
  }

  if (maxP95Duration && stats.p95Duration > maxP95Duration) {
    throw new Error(
      `Performance threshold exceeded for "${name}": ` +
      `P95 ${stats.p95Duration.toFixed(2)}ms > ${maxP95Duration}ms`
    );
  }
}

/**
 * Create a performance profiler for React components
 */
export function profileRender(componentName: string) {
  return {
    onRender(
      id: string,
      phase: 'mount' | 'update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number
    ) {
      const markName = `${componentName}-${phase}`;
      if (!perfMonitor.getMeasurements(markName).length) {
        perfMonitor.mark(markName);
      }
      perfMonitor.getMeasurements(markName).push(actualDuration);
      
      if (actualDuration > 16.67) { // Slower than 60fps
        console.warn(
          `⚠️  Slow render detected: ${componentName} (${phase}) took ${actualDuration.toFixed(2)}ms`
        );
      }
    },
  };
}

/**
 * Measure time to first byte (TTFB) for API calls
 */
export async function measureTTFB(
  name: string,
  fetchFn: () => Promise<Response>
): Promise<number> {
  perfMonitor.mark(name);
  await fetchFn();
  const duration = perfMonitor.measure(name);
  return duration || 0;
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string, renderFn: () => void): number {
  const markName = `render-${componentName}`;
  perfMonitor.mark(markName);
  renderFn();
  return perfMonitor.measure(markName) || 0;
}

/**
 * Performance thresholds for critical paths
 */
export const PERFORMANCE_THRESHOLDS = {
  // Page load thresholds (ms)
  PAGE_LOAD: {
    FAST: 1000,
    ACCEPTABLE: 2500,
    SLOW: 5000,
  },
  
  // Component render thresholds (ms)
  RENDER: {
    FAST: 16.67, // 60fps
    ACCEPTABLE: 33.33, // 30fps
    SLOW: 100,
  },
  
  // API call thresholds (ms)
  API: {
    FAST: 100,
    ACCEPTABLE: 500,
    SLOW: 2000,
  },
  
  // User interaction thresholds (ms)
  INTERACTION: {
    FAST: 50,
    ACCEPTABLE: 100,
    SLOW: 300,
  },
};

/**
 * Log performance warning if threshold exceeded
 */
export function checkPerformanceThreshold(
  name: string,
  duration: number,
  threshold: { FAST: number; ACCEPTABLE: number; SLOW: number }
): void {
  if (duration < threshold.FAST) {
    console.log(`✅ ${name}: ${duration.toFixed(2)}ms (FAST)`);
  } else if (duration < threshold.ACCEPTABLE) {
    console.log(`⚠️  ${name}: ${duration.toFixed(2)}ms (ACCEPTABLE)`);
  } else if (duration < threshold.SLOW) {
    console.warn(`⚠️  ${name}: ${duration.toFixed(2)}ms (SLOW)`);
  } else {
    console.error(`❌ ${name}: ${duration.toFixed(2)}ms (TOO SLOW)`);
  }
}
