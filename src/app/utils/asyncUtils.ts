/**
 * Async/Promise Utility Functions
 * Utilities for working with async operations
 */

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: Error) => void;
  }
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const delay = options?.delay ?? 1000;
  const backoff = options?.backoff ?? 2;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      if (options?.onRetry) {
        options.onRetry(attempt, lastError);
      }
      
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await sleep(waitTime);
    }
  }
  
  throw lastError!;
}

/**
 * Execute promises with a timeout
 */
export async function timeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage || `Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Execute async function with timeout and retry
 */
export async function timeoutWithRetry<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions?: Parameters<typeof retry>[1]
): Promise<T> {
  return retry(() => timeout(fn(), timeoutMs), retryOptions);
}

/**
 * Debounce an async function
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  let latestResolve: ((value: any) => void) | null = null;
  let latestReject: ((reason: any) => void) | null = null;
  
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    
    return new Promise((resolve, reject) => {
      latestResolve = resolve;
      latestReject = reject;
      
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          if (latestResolve === resolve) {
            resolve(result);
          }
        } catch (error) {
          if (latestReject === reject) {
            reject(error);
          }
        }
      }, delay);
    });
  }) as T;
}

/**
 * Throttle an async function
 */
export function throttleAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): T {
  let isThrottled = false;
  let pendingArgs: any[] | null = null;
  
  return (async (...args: any[]) => {
    if (isThrottled) {
      pendingArgs = args;
      return;
    }
    
    isThrottled = true;
    const result = await fn(...args);
    
    setTimeout(() => {
      isThrottled = false;
      if (pendingArgs) {
        const args = pendingArgs;
        pendingArgs = null;
        void fn(...args);
      }
    }, delay);
    
    return result;
  }) as T;
}

/**
 * Execute promises in batches
 */
export async function batchExecute<T>(
  items: T[],
  batchSize: number,
  executor: (item: T) => Promise<any>,
  delayBetweenBatches?: number
): Promise<any[]> {
  const results: any[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(executor));
    results.push(...batchResults);
    
    if (delayBetweenBatches && i + batchSize < items.length) {
      await sleep(delayBetweenBatches);
    }
  }
  
  return results;
}

/**
 * Execute promises sequentially
 */
export async function sequential<T>(
  items: T[],
  executor: (item: T, index: number) => Promise<any>
): Promise<any[]> {
  const results: any[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const result = await executor(items[i], i);
    results.push(result);
  }
  
  return results;
}

/**
 * Execute promises in parallel with concurrency limit
 */
export async function parallel<T>(
  items: T[],
  concurrency: number,
  executor: (item: T) => Promise<any>
): Promise<any[]> {
  const results: any[] = new Array(items.length);
  let currentIndex = 0;
  
  async function executeNext(index: number): Promise<void> {
    while (currentIndex < items.length) {
      const itemIndex = currentIndex++;
      results[itemIndex] = await executor(items[itemIndex]);
    }
  }
  
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, (_, i) =>
    executeNext(i)
  );
  
  await Promise.all(workers);
  return results;
}

/**
 * Race multiple promises and return the first successful one
 */
export async function raceSuccess<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    let errorCount = 0;
    const errors: Error[] = [];
    
    promises.forEach(promise => {
      promise
        .then(resolve)
        .catch(error => {
          errors.push(error);
          errorCount++;
          
          if (errorCount === promises.length) {
            reject(new Error(`All promises failed: ${errors.map(e => e.message).join(', ')}`));
          }
        });
    });
  });
}

/**
 * Execute with fallback
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    return await primary();
  } catch {
    return await fallback();
  }
}

/**
 * Execute with multiple fallbacks
 */
export async function withFallbacks<T>(
  ...fns: Array<() => Promise<T>>
): Promise<T> {
  let lastError: Error;
  
  for (const fn of fns) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  
  throw lastError!;
}

/**
 * Memoize async function results
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    maxAge?: number;
    keyFn?: (...args: Parameters<T>) => string;
  }
): T {
  const cache = new Map<string, { value: any; timestamp: number }>();
  const maxAge = options?.maxAge ?? Infinity;
  const keyFn = options?.keyFn ?? ((...args: Parameters<T>) => JSON.stringify(args));
  
  return (async (...args: Parameters<T>) => {
    const key = keyFn(...args);
    const cached = cache.get(key);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < maxAge) {
        return cached.value;
      }
      cache.delete(key);
    }
    
    const value = await fn(...args);
    cache.set(key, { value, timestamp: Date.now() });
    
    return value;
  }) as T;
}

/**
 * Create an abortable promise
 */
export function abortable<T>(
  executor: (signal: AbortSignal) => Promise<T>
): { promise: Promise<T>; abort: () => void } {
  const controller = new AbortController();
  
  const promise = executor(controller.signal);
  
  return {
    promise,
    abort: () => controller.abort(),
  };
}

/**
 * Poll for a condition
 */
export async function poll<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  options?: {
    interval?: number;
    maxAttempts?: number;
    timeout?: number;
  }
): Promise<T> {
  const interval = options?.interval ?? 1000;
  const maxAttempts = options?.maxAttempts ?? Infinity;
  const timeoutMs = options?.timeout ?? Infinity;
  
  const startTime = Date.now();
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    if (Date.now() - startTime >= timeoutMs) {
      throw new Error('Polling timeout');
    }
    
    const result = await fn();
    
    if (condition(result)) {
      return result;
    }
    
    attempts++;
    await sleep(interval);
  }
  
  throw new Error('Max polling attempts reached');
}

/**
 * Create a deferred promise
 */
export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

export function deferred<T>(): Deferred<T> {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  
  return { promise, resolve: resolve!, reject: reject! };
}

/**
 * Wait for multiple promises and collect results/errors
 */
export async function allSettled<T>(
  promises: Promise<T>[]
): Promise<Array<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: any }>> {
  return Promise.allSettled(promises);
}

/**
 * Safe async function wrapper
 */
export function safeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<{ data: Awaited<ReturnType<T>> | null; error: Error | null }> {
  return async (...args: Parameters<T>) => {
    try {
      const data = await fn(...args);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };
}
