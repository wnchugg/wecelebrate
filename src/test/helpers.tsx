/**
 * Test Helpers and Mock Utilities
 * Provides reusable test helpers, mock data, and type-safe test utilities
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { LanguageProvider } from '../app/context/LanguageContext';

// ==================== Type-Safe Mock Builders ====================

export interface MockBuilderOptions<T> {
  defaults: T;
  overrides?: Partial<T>;
}

/**
 * Create a type-safe mock object
 */
export function createMock<T>(defaults: T, overrides?: Partial<T>): T {
  return { ...defaults, ...overrides };
}

/**
 * Create an array of mocks
 */
export function createMocks<T>(defaults: T, count: number, overridesFn?: (index: number) => Partial<T>): T[] {
  return Array.from({ length: count }, (_, index) =>
    createMock(defaults, overridesFn?.(index))
  );
}

// ==================== Common Mock Data ====================

export const mockSite = {
  id: 'site-test-1',
  name: 'Test Site',
  clientId: 'client-test-1',
  slug: 'test-site',
  domain: 'test.example.com',
  status: 'active' as const,
  isActive: true,
  validationMethods: [
    {
      type: 'email' as const,
      enabled: true,
    }
  ],
  branding: {
    primaryColor: '#D91C81',
    secondaryColor: '#B71569',
    tertiaryColor: '#00B4CC',
  },
  settings: {
    validationMethod: 'email' as const,
    allowMultipleSelections: true,
    allowQuantitySelection: true,
    showPricing: true,
    giftsPerUser: 1,
    shippingMode: 'employee' as const,
    defaultLanguage: 'en',
    enableLanguageSelector: true,
    defaultCurrency: 'USD',
    allowedCountries: [] as string[],
    defaultCountry: 'US',
    requireShipping: true,
    supportEmail: 'support@test.com',
    languages: ['en'],
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const mockClient = {
  id: 'client-test-1',
  name: 'Test Client',
  status: 'active' as const,
  contactEmail: 'client@test.com',
  contactName: 'Test Contact',
  industry: 'Technology',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const mockGift = {
  id: 'gift-test-1',
  name: 'Test Gift',
  description: 'A test gift item',
  category: 'Electronics',
  image: '/test-image.jpg',
  sku: 'TEST-001',
  price: 100,
  status: 'active' as const,
  inStock: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const mockProduct = {
  id: 'product-test-1',
  name: 'Test Product',
  description: 'This is a test product description',
  price: 99.99,
  points: 1000,
  image: 'https://example.com/product.jpg',
  category: 'Electronics',
  inStock: true,
  features: ['Feature 1', 'Feature 2'],
};

export const mockEmployee = {
  id: 'employee-test-1',
  employeeId: 'EMP001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  department: 'Engineering',
  location: 'New York',
  status: 'active' as const,
};

export const mockAdminUser = {
  id: 'admin-test-1',
  username: 'testadmin',
  email: 'admin@test.com',
  role: 'admin' as const,
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const mockOrder = {
  id: 'order-test-1',
  orderNumber: 'ORD-001',
  orderDate: '2026-01-01T00:00:00Z',
  siteId: 'site-test-1',
  employeeId: 'employee-test-1',
  giftId: 'gift-test-1',
  quantity: 1,
  shippingAddress: {
    street: '123 Test St',
    city: 'Test City',
    state: 'TS',
    postalCode: '12345',
    country: 'US',
  },
  status: 'pending' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const mockCatalog = {
  id: 'catalog-test-1',
  name: 'Test Catalog',
  type: 'manual' as const,
  status: 'active' as const,
  description: 'A test catalog',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

// ==================== Test Wrappers ====================

interface WrapperOptions {
  initialRoute?: string;
  routerProps?: any;
}

/**
 * Custom render function with Router wrapper
 */
export function renderWithRouter(
  ui: ReactElement,
  optionsOrRoute?: WrapperOptions & Omit<RenderOptions, 'wrapper'> | string
) {
  // Support both (ui, '/route') and (ui, { initialRoute: '/route' }) formats
  const options = typeof optionsOrRoute === 'string' 
    ? { initialRoute: optionsOrRoute }
    : optionsOrRoute;
    
  const { initialRoute = '/', routerProps = {}, ...renderOptions } = options || {};

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <LanguageProvider>
        <MemoryRouter initialEntries={[initialRoute]} {...routerProps}>
          {children}
        </MemoryRouter>
      </LanguageProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// ==================== Mock API Responses ====================

export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true as const,
    data,
    message,
  };
}

export function createErrorResponse(error: string, message?: string) {
  return {
    success: false as const,
    error,
    message,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number = 1,
  pageSize: number = 10,
  total?: number
) {
  const totalItems = total ?? data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    success: true as const,
    data,
    pagination: {
      page,
      pageSize,
      totalPages,
      totalItems,
    },
  };
}

// ==================== Mock Functions ====================

export function createMockFetch(response: any, ok: boolean = true, status: number = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Headers(),
  });
}

export function createMockFetchError(error: string) {
  return vi.fn().mockRejectedValue(new Error(error));
}

// ==================== Async Test Utilities ====================

/**
 * Wait for async operations to complete
 */
export function wait(ms: number = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Flush all pending promises
 */
export async function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

// ==================== Type Guards for Testing ====================

export function expectToBeType<T>(value: unknown): asserts value is T {
  // Runtime check placeholder - TypeScript will handle the assertion
}

export function expectToBeDefined<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error('Expected value to be defined');
  }
}

// ==================== Test Data Generators ====================

export function generateId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateEmail(name: string = 'test'): string {
  return `${name}-${Date.now()}@test.com`;
}

export function generatePhoneNumber(): string {
  return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
}

export function generateDateString(daysFromNow: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}

// ==================== Validation Helpers ====================

export function expectValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function expectValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function expectValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// ==================== Console Mock Helpers ====================

export function mockConsole() {
  const originalConsole = { ...console };
  
  console.log = vi.fn();
  console.info = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
  console.debug = vi.fn();

  return {
    restore: () => {
      Object.assign(console, originalConsole);
    },
    mocks: {
      log: console.log as ReturnType<typeof vi.fn>,
      info: console.info as ReturnType<typeof vi.fn>,
      warn: console.warn as ReturnType<typeof vi.fn>,
      error: console.error as ReturnType<typeof vi.fn>,
      debug: console.debug as ReturnType<typeof vi.fn>,
    },
  };
}

// ==================== LocalStorage Mock ====================

export function mockLocalStorage() {
  const storage: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    get length() {
      return Object.keys(storage).length;
    },
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
  };
}

// ==================== SessionStorage Mock ====================

export function mockSessionStorage() {
  return mockLocalStorage(); // Same implementation
}

// ==================== Window Mock Helpers ====================

export function mockWindowLocation(url: string) {
  const originalLocation = window.location;
  delete (window as any).location;
  window.location = new URL(url) as any;

  return {
    restore: () => {
      (window as any).location = originalLocation;
    },
  };
}

export function mockWindowMatchMedia(matches: boolean = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}