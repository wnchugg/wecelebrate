/// <reference types="vitest" />

import { vi } from 'vitest';
import type { ReactElement } from 'react';

/**
 * Mock implementation types
 */
export type MockFn<T extends (...args: any[]) => any> = ReturnType<typeof vi.fn>;
export type MockedFunction<T extends (...args: any[]) => any> = ReturnType<typeof vi.fn>;
export type MockedObject<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? MockedFunction<T[K]>
    : T[K];
};

/**
 * Create a mocked version of an object
 */
export function createMockedObject<T extends Record<string, any>>(obj: T): MockedObject<T> {
  const mocked = {} as MockedObject<T>;
  
  for (const key in obj) {
    if (typeof obj[key] === 'function') {
      (mocked as any)[key] = vi.fn();
    } else {
      (mocked as any)[key] = obj[key];
    }
  }
  
  return mocked;
}

/**
 * Spy on a method
 */
export function createSpy<T extends Record<string, any>, K extends keyof T>(
  object: T,
  method: K
): ReturnType<typeof vi.spyOn> {
  return vi.spyOn(object, method as any);
}

/**
 * Mock timer utilities
 */
export const mockTimers = {
  useFake: () => vi.useFakeTimers(),
  useReal: () => vi.useRealTimers(),
  advanceBy: (ms: number) => vi.advanceTimersByTime(ms),
  runAll: () => vi.runAllTimers(),
  runPending: () => vi.runOnlyPendingTimers(),
};

/**
 * Create mock context value
 */
export function createMockContext<T>(value: Partial<T>): T {
  return value as T;
}

/**
 * Assert that a value is defined
 */
export function assertDefined<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error('Expected value to be defined');
  }
}

/**
 * Type guard for React elements
 */
export function isReactElement(value: any): value is ReactElement {
  return value && typeof value === 'object' && '$$typeof' in value;
}

/**
 * Create a deferred promise for testing async operations
 */
export function createDeferred<T = void>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: any) => void;
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  
  return { promise, resolve, reject };
}

/**
 * Flush all promises in the queue
 */
export async function flushPromises(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Create a mock fetch response
 */
export function createMockFetchResponse<T>(
  data: T,
  options?: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  }
): Response {
  return {
    ok: (options?.status ?? 200) >= 200 && (options?.status ?? 200) < 300,
    status: options?.status ?? 200,
    statusText: options?.statusText ?? 'OK',
    headers: new Headers(options?.headers),
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    clone: function() { return this; },
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic',
    url: '',
  } as Response;
}