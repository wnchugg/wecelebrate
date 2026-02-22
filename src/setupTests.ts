/**
 * Test Setup File - Common Mocks and Configuration
 * 
 * This file is automatically loaded before all tests via Vitest configuration.
 * It provides common mocks for browser APIs and utilities that are needed
 * across multiple test files.
 * 
 * Usage:
 * - This file runs automatically before each test file
 * - All mocks are set up globally
 * - Individual tests can override these mocks if needed
 * 
 * @see https://vitest.dev/config/#setupfiles
 */

import { vi, beforeAll, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// ==================== BROWSER API MOCKS ====================

/**
 * Mock Document API - ONLY if needed
 * jsdom already provides a full document, so we only add extensions if needed
 */
beforeAll(() => {
  // jsdom provides document, so we don't need to replace it
  // Only extend it if needed for specific functionality
  
  // Ensure document.body exists
  if (!document.body) {
    const body = document.createElement('body');
    document.documentElement.appendChild(body);
  }
});

/**
 * Mock Crypto API
 * Used for: Token generation, random value generation, hashing
 */
beforeAll(() => {
  // Crypto already exists in Node.js, so we need to extend it rather than replace it
  const cryptoMock = {
    // Random value generation
    getRandomValues: vi.fn((array: Uint8Array | Uint32Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
    
    // UUID generation (v4)
    randomUUID: vi.fn(() => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }),
    
    // Subtle crypto (for advanced cryptographic operations)
    subtle: {
      digest: vi.fn(async (algorithm: string, data: BufferSource) => {
        // Mock hash - return a simple ArrayBuffer
        return new ArrayBuffer(32);
      }),
      encrypt: vi.fn(async () => new ArrayBuffer(32)),
      decrypt: vi.fn(async () => new ArrayBuffer(32)),
      sign: vi.fn(async () => new ArrayBuffer(32)),
      verify: vi.fn(async () => true),
      generateKey: vi.fn(async () => ({})),
      importKey: vi.fn(async () => ({})),
      exportKey: vi.fn(async () => new ArrayBuffer(32)),
    },
  };
  
  // Use Object.defineProperty to override the read-only crypto
  Object.defineProperty(global, 'crypto', {
    value: cryptoMock,
    writable: true,
    configurable: true,
  });
});

/**
 * Mock Storage APIs (localStorage and sessionStorage)
 * Used for: Data persistence, session management, token storage
 */
beforeAll(() => {
  // Create storage implementation that can be shared
  const createStorageMock = () => {
    const storage = new Map<string, string>();
    
    return {
      getItem: vi.fn((key: string) => storage.get(key) || null),
      setItem: vi.fn((key: string, value: string) => {
        storage.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        storage.delete(key);
      }),
      clear: vi.fn(() => {
        storage.clear();
      }),
      key: vi.fn((index: number) => {
        const keys = Array.from(storage.keys());
        return keys[index] || null;
      }),
      get length() {
        return storage.size;
      },
      // Internal storage reference for test access
      _storage: storage,
    };
  };
  
  global.localStorage = createStorageMock() as any;
  global.sessionStorage = createStorageMock() as any;
});

/**
 * Mock Window API extensions
 * Used for: Browser environment checks, navigation, events
 * NOTE: jsdom already provides window, we just extend it
 */
beforeAll(() => {
  // Don't replace window, just add missing properties
  
  // matchMedia (for responsive design)
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
  
  // IntersectionObserver (for lazy loading)
  if (!global.IntersectionObserver) {
    global.IntersectionObserver = class IntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);
      root: Element | null = null;
      rootMargin = '';
      thresholds: number[] = [];
    } as any;
  }
  
  // ResizeObserver (for resize detection)
  if (!global.ResizeObserver) {
    global.ResizeObserver = class ResizeObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    } as any;
  }
  
  // Request animation frame (if not already provided by jsdom)
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = vi.fn((callback) => {
      return setTimeout(() => callback(), 16) as any;
    });
  }
  
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = vi.fn((id) => {
      clearTimeout(id);
    });
  }
  
  // Pointer Capture API polyfill (for Radix UI Select)
  // jsdom doesn't implement these methods, but Radix UI Select uses them
  if (typeof Element !== 'undefined') {
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = vi.fn(() => false);
    }
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = vi.fn();
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = vi.fn();
    }
    
    // scrollIntoView polyfill (for Radix UI Select)
    // jsdom doesn't implement scrollIntoView but Radix UI uses it for keyboard navigation
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }
  }
  
  // Also add to HTMLElement for broader compatibility
  if (typeof HTMLElement !== 'undefined') {
    if (!HTMLElement.prototype.hasPointerCapture) {
      HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
    }
    if (!HTMLElement.prototype.setPointerCapture) {
      HTMLElement.prototype.setPointerCapture = vi.fn();
    }
    if (!HTMLElement.prototype.releasePointerCapture) {
      HTMLElement.prototype.releasePointerCapture = vi.fn();
    }
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = vi.fn();
    }
  }
});

/**
 * Mock Base64 Encoding/Decoding (btoa, atob)
 * Used for: Token encoding, data encoding
 */
beforeAll(() => {
  global.btoa = vi.fn((str: string) => {
    return Buffer.from(str, 'binary').toString('base64');
  });
  
  global.atob = vi.fn((str: string) => {
    return Buffer.from(str, 'base64').toString('binary');
  });
});

/**
 * Mock Fetch API
 * Used for: HTTP requests, API calls
 */
beforeAll(() => {
  global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    // Default mock response
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: async () => ({ success: true }),
      text: async () => 'Success',
      blob: async () => new Blob(),
      arrayBuffer: async () => new ArrayBuffer(0),
      clone: () => this,
      redirected: false,
      type: 'basic',
      url: typeof input === 'string' ? input : input.toString(),
    } as Response;
  });
  
  // Mock Headers
  global.Headers = class Headers {
    private headers = new Map<string, string>();
    
    append(name: string, value: string) {
      this.headers.set(name.toLowerCase(), value);
    }
    
    delete(name: string) {
      this.headers.delete(name.toLowerCase());
    }
    
    get(name: string) {
      return this.headers.get(name.toLowerCase()) || null;
    }
    
    has(name: string) {
      return this.headers.has(name.toLowerCase());
    }
    
    set(name: string, value: string) {
      this.headers.set(name.toLowerCase(), value);
    }
    
    forEach(callback: (value: string, key: string) => void) {
      this.headers.forEach((value, key) => callback(value, key));
    }
  } as any;
  
  // Mock Request
  global.Request = class Request {
    url: string;
    method: string;
    headers: Headers;
    
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      this.url = typeof input === 'string' ? input : input.toString();
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
    }
  } as any;
  
  // Mock Response
  global.Response = class Response {
    ok: boolean;
    status: number;
    statusText: string;
    headers: Headers;
    body: any;
    
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = body;
      this.ok = (init?.status || 200) >= 200 && (init?.status || 200) < 300;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers);
    }
    
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
    
    async text() {
      return String(this.body || '');
    }
    
    async blob() {
      return new Blob([this.body || '']);
    }
    
    async arrayBuffer() {
      return new ArrayBuffer(0);
    }
    
    clone() {
      return new Response(this.body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
      });
    }
  } as any;
});

/**
 * Mock URL and URLSearchParams
 * Used for: URL parsing, query string handling
 */
beforeAll(() => {
  // URL is usually available in Node.js, but ensure it's properly mocked
  if (!global.URL) {
    global.URL = class URL {
      href: string;
      origin: string;
      protocol: string;
      username: string;
      password: string;
      host: string;
      hostname: string;
      port: string;
      pathname: string;
      search: string;
      searchParams: URLSearchParams;
      hash: string;
      
      constructor(url: string, base?: string) {
        // Simple URL parsing
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const parser = new (require('url').URL)(url, base);
        this.href = parser.href;
        this.origin = parser.origin;
        this.protocol = parser.protocol;
        this.username = parser.username;
        this.password = parser.password;
        this.host = parser.host;
        this.hostname = parser.hostname;
        this.port = parser.port;
        this.pathname = parser.pathname;
        this.search = parser.search;
        this.hash = parser.hash;
        this.searchParams = new URLSearchParams(parser.search);
      }
      
      toString() {
        return this.href;
      }
    } as any;
  }
  
  // URLSearchParams is usually available, but ensure it works
  if (!global.URLSearchParams) {
    global.URLSearchParams = class URLSearchParams {
      private params = new Map<string, string[]>();
      
      constructor(init?: string | Record<string, string> | URLSearchParams) {
        if (typeof init === 'string') {
          this.parseString(init);
        } else if (init instanceof URLSearchParams) {
          this.params = new Map(init.params);
        } else if (init) {
          Object.entries(init).forEach(([key, value]) => {
            this.append(key, value);
          });
        }
      }
      
      private parseString(str: string) {
        const cleaned = str.startsWith('?') ? str.slice(1) : str;
        cleaned.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key) {
            this.append(
              decodeURIComponent(key),
              decodeURIComponent(value || '')
            );
          }
        });
      }
      
      append(name: string, value: string) {
        if (!this.params.has(name)) {
          this.params.set(name, []);
        }
        this.params.get(name).push(value);
      }
      
      delete(name: string) {
        this.params.delete(name);
      }
      
      get(name: string) {
        const values = this.params.get(name);
        return values ? values[0] : null;
      }
      
      getAll(name: string) {
        return this.params.get(name) || [];
      }
      
      has(name: string) {
        return this.params.has(name);
      }
      
      set(name: string, value: string) {
        this.params.set(name, [value]);
      }
      
      toString() {
        const parts: string[] = [];
        this.params.forEach((values, key) => {
          values.forEach(value => {
            parts.push(
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            );
          });
        });
        return parts.join('&');
      }
    } as any;
  }
});

/**
 * Mock File and Blob APIs
 * Used for: File upload testing, blob handling
 */
beforeAll(() => {
  // Blob is usually available in Node.js, but ensure it's mocked
  if (!global.Blob) {
    global.Blob = class Blob {
      size: number;
      type: string;
      
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        this.type = options?.type || '';
        this.size = parts?.reduce((acc, part) => {
          if (typeof part === 'string') return acc + part.length;
          if (part instanceof ArrayBuffer) return acc + part.byteLength;
          return acc;
        }, 0) || 0;
      }
      
      async text() {
        return '';
      }
      
      async arrayBuffer() {
        return new ArrayBuffer(this.size);
      }
      
      slice() {
        return new Blob();
      }
    } as any;
  }
  
  // File extends Blob
  if (!global.File) {
    global.File = class File extends Blob {
      name: string;
      lastModified: number;
      
      constructor(
        parts: BlobPart[],
        name: string,
        options?: FilePropertyBag
      ) {
        super(parts, options);
        this.name = name;
        this.lastModified = options?.lastModified || Date.now();
      }
    } as any;
  }
  
  // FileReader
  if (!global.FileReader) {
    global.FileReader = class FileReader {
      result: string | ArrayBuffer | null = null;
      error: Error | null = null;
      readyState: number = 0;
      
      onload: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onprogress: ((event: any) => void) | null = null;
      
      readAsText(blob: Blob) {
        setTimeout(() => {
          this.result = '';
          this.readyState = 2;
          if (this.onload) this.onload({ target: this });
        }, 0);
      }
      
      readAsDataURL(blob: Blob) {
        setTimeout(() => {
          this.result = 'data:text/plain;base64,';
          this.readyState = 2;
          if (this.onload) this.onload({ target: this });
        }, 0);
      }
      
      readAsArrayBuffer(blob: Blob) {
        setTimeout(() => {
          this.result = new ArrayBuffer(0);
          this.readyState = 2;
          if (this.onload) this.onload({ target: this });
        }, 0);
      }
      
      abort() {
        this.readyState = 2;
      }
    } as any;
  }
});

/**
 * Mock MutationObserver
 * Used for: DOM change detection
 */
beforeAll(() => {
  global.MutationObserver = class MutationObserver {
    constructor(callback: MutationCallback) {}
    
    observe = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
  } as any;
});

// ==================== UTILITY MOCKS ====================

/**
 * Mock console methods to reduce noise in tests
 * Tests can override these if they need to verify console output
 */
beforeAll(() => {
  // Store original console methods
  const originalConsole = { ...console };
  
  // Optionally suppress console output in tests
  // Uncomment these to silence console in tests:
  // global.console.log = vi.fn();
  // global.console.warn = vi.fn();
  // global.console.error = vi.fn();
  // global.console.info = vi.fn();
  // global.console.debug = vi.fn();
});

// ==================== CLEANUP ====================

/**
 * Clean up after each test to prevent state leakage
 */
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Clear storage
  if (global.localStorage && '_storage' in global.localStorage) {
    (global.localStorage as any)._storage.clear();
  }
  if (global.sessionStorage && '_storage' in global.sessionStorage) {
    (global.sessionStorage as any)._storage.clear();
  }
  
  // Reset fetch mock
  if (global.fetch) {
    vi.mocked(global.fetch).mockReset();
  }
});

// ==================== CUSTOM MATCHERS ====================

/**
 * Custom matchers can be added here
 * Example: toBeWithinRange matcher
 */
// import { expect } from 'vitest';
// expect.extend({
//   toBeWithinRange(received: number, floor: number, ceiling: number) {
//     const pass = received >= floor && received <= ceiling;
//     return {
//       pass,
//       message: () =>
//         pass
//           ? `expected ${received} not to be within range ${floor} - ${ceiling}`
//           : `expected ${received} to be within range ${floor} - ${ceiling}`,
//     };
//   },
// });

// ==================== TEST UTILITIES ====================

/**
 * Helper function to wait for async operations
 * Usage: await waitFor(() => expect(something).toBe(true))
 */
export async function waitFor(
  callback: () => void,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 1000, interval = 50 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      callback();
      return;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  // One final attempt
  callback();
}

/**
 * Helper function to flush all promises
 * Useful for waiting for all async operations to complete
 */
export async function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Helper to create a mock file for testing
 */
export function createMockFile(
  content: string,
  filename: string,
  options: { type?: string; lastModified?: number } = {}
): File {
  return new File([content], filename, {
    type: options.type || 'text/plain',
    lastModified: options.lastModified || Date.now(),
  });
}

/**
 * Helper to create a mock blob
 */
export function createMockBlob(
  content: string,
  options: { type?: string } = {}
): Blob {
  return new Blob([content], {
    type: options.type || 'text/plain',
  });
}

/**
 * Helper to simulate a delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== ENVIRONMENT SETUP ====================

/**
 * Set up test environment variables
 */
beforeAll(() => {
  // Set common environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.VITE_API_URL = 'https://api.test.example.com';
});

// ==================== GLOBAL TYPE AUGMENTATION ====================

/**
 * Augment global types for TypeScript
 */
declare global {
  interface Window {
    fetch: typeof fetch;
  }
  
  // Custom matcher types (if using custom matchers)
  // namespace Vi {
  //   interface Matchers<R = any> {
  //     toBeWithinRange(floor: number, ceiling: number): R;
  //   }
  // }
}

// ==================== EXPORT MOCKS FOR TEST ACCESS ====================

/**
 * Export mock instances so tests can access and configure them
 */
export const mocks = {
  document: global.document,
  crypto: global.crypto,
  localStorage: global.localStorage,
  sessionStorage: global.sessionStorage,
  window: global.window,
  fetch: global.fetch,
};

/**
 * Helper to reset all mocks to their initial state
 * Useful for tests that need a clean slate
 */
export function resetAllMocks() {
  vi.clearAllMocks();
  
  if (global.localStorage && '_storage' in global.localStorage) {
    (global.localStorage as any)._storage.clear();
  }
  if (global.sessionStorage && '_storage' in global.sessionStorage) {
    (global.sessionStorage as any)._storage.clear();
  }
  if (global.document && '_cookie' in global.document) {
    (global.document as any)._cookie = '';
  }
}

// Log setup completion (can be removed in production)
console.log('✅ Test setup complete - All mocks initialized');