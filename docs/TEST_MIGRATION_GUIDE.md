# Test File Migration Guide

## Overview

This guide helps migrate existing test files to use the new comprehensive test infrastructure located in `/src/test/helpers.ts` and `/src/test/setup.ts`.

## Quick Reference

### Before (Old Pattern)
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

// Manual mock creation
const mockProduct = {
  id: 'test-1',
  name: 'Test Product',
  price: 100,
  // ... all properties manually typed
};

// Manual wrapper
function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('MyComponent', () => {
  it('renders', () => {
    render(<MyComponent product={mockProduct} />, { wrapper: Wrapper });
  });
});
```

### After (New Pattern)
```typescript
import { describe, it, expect } from 'vitest';
import { createMock, mockProduct, renderWithRouter, vi } from '@/test/helpers';

// Use pre-built mock or create custom
const customProduct = createMock(mockProduct, {
  name: 'Custom Product',
  price: 150,
});

describe('MyComponent', () => {
  it('renders', () => {
    renderWithRouter(<MyComponent product={customProduct} />);
  });
});
```

## Migration Steps

### Step 1: Update Imports

**Old:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
```

**New:**
```typescript
import { describe, it, expect } from 'vitest';
import { 
  renderWithRouter, 
  mockSite, 
  mockClient,
  createMock,
  vi 
} from '@/test/helpers';
import { screen, waitFor } from '@testing-library/react';
```

### Step 2: Replace Manual Mocks

**Old:**
```typescript
const mockSite = {
  id: 'site-1',
  name: 'Test Site',
  clientId: 'client-1',
  status: 'active',
  branding: {
    primaryColor: '#D91C81',
    secondaryColor: '#B71569',
    tertiaryColor: '#00B4CC',
  },
  settings: {
    validationMethod: 'email',
    allowQuantitySelection: true,
    showPricing: true,
    // ... 20 more properties
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};
```

**New:**
```typescript
import { mockSite, createMock } from '@/test/helpers';

// Use default
const site = mockSite;

// Or create custom
const customSite = createMock(mockSite, {
  name: 'Custom Site',
  status: 'inactive',
});
```

### Step 3: Replace Custom Wrappers

**Old:**
```typescript
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/gifts']}>
      {children}
    </MemoryRouter>
  );
}

render(<MyComponent />, { wrapper: Wrapper });
```

**New:**
```typescript
renderWithRouter(<MyComponent />, {
  initialRoute: '/gifts'
});
```

### Step 4: Replace Mock Fetch

**Old:**
```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ data: mockGifts }),
  })
);
```

**New:**
```typescript
import { createMockFetch } from '@/test/helpers';

global.fetch = createMockFetch({ data: mockGifts });
```

### Step 5: Use Test Utilities

**Old:**
```typescript
await new Promise(resolve => setTimeout(resolve, 100));
```

**New:**
```typescript
import { wait, flushPromises } from '@/test/helpers';

await wait(100);
// or
await flushPromises();
```

## Common Mock Objects

### Pre-built Mocks Available

```typescript
import {
  mockSite,
  mockClient,
  mockGift,
  mockProduct,
  mockEmployee,
  mockAdminUser,
  mockOrder,
  mockCatalog,
} from '@/test/helpers';
```

Each mock is fully typed and includes all required properties.

### Creating Custom Mocks

```typescript
import { createMock, mockGift } from '@/test/helpers';

// Single custom mock
const customGift = createMock(mockGift, {
  name: 'Special Gift',
  price: 250,
});

// Multiple mocks with variation
import { createMocks } from '@/test/helpers';

const gifts = createMocks(mockGift, 5, (index) => ({
  id: `gift-${index}`,
  name: `Gift ${index}`,
}));
// Results in: [
//   { ...mockGift, id: 'gift-0', name: 'Gift 0' },
//   { ...mockGift, id: 'gift-1', name: 'Gift 1' },
//   ...
// ]
```

## Mock API Responses

### Success Response

```typescript
import { createSuccessResponse } from '@/test/helpers';

const response = createSuccessResponse(mockGifts, 'Gifts loaded');
// { success: true, data: mockGifts, message: 'Gifts loaded' }
```

### Error Response

```typescript
import { createErrorResponse } from '@/test/helpers';

const response = createErrorResponse('Not found', 'Gift does not exist');
// { success: false, error: 'Not found', message: 'Gift does not exist' }
```

### Paginated Response

```typescript
import { createPaginatedResponse } from '@/test/helpers';

const response = createPaginatedResponse(mockGifts, 1, 10);
// {
//   success: true,
//   data: mockGifts,
//   pagination: { page: 1, pageSize: 10, totalPages: 1, totalItems: 5 }
// }
```

## Mock Utilities

### Console Mocking

```typescript
import { mockConsole } from '@/test/helpers';

describe('MyComponent', () => {
  it('logs errors', () => {
    const { mocks, restore } = mockConsole();
    
    // Your test code that logs
    myFunction();
    
    expect(mocks.error).toHaveBeenCalledWith('Error message');
    
    restore(); // Restore original console
  });
});
```

### LocalStorage Mocking

```typescript
import { mockLocalStorage } from '@/test/helpers';

describe('Storage tests', () => {
  it('stores data', () => {
    const storage = mockLocalStorage();
    Object.defineProperty(window, 'localStorage', { value: storage });
    
    localStorage.setItem('key', 'value');
    expect(storage.getItem('key')).toBe('value');
  });
});
```

### Window Mocking

```typescript
import { mockWindowLocation, mockWindowMatchMedia } from '@/test/helpers';

it('handles window.location', () => {
  const { restore } = mockWindowLocation('https://test.com');
  
  expect(window.location.href).toBe('https://test.com');
  
  restore();
});

it('handles media queries', () => {
  mockWindowMatchMedia(true); // matches: true
  
  expect(window.matchMedia('(min-width: 768px)').matches).toBe(true);
});
```

## Test Data Generators

```typescript
import { 
  generateId, 
  generateEmail, 
  generatePhoneNumber,
  generateDateString 
} from '@/test/helpers';

const id = generateId('user'); // 'user-1676385600000-abc123def'
const email = generateEmail('john'); // 'john-1676385600000@test.com'
const phone = generatePhoneNumber(); // '+11234567890'
const date = generateDateString(7); // ISO string 7 days from now
```

## Validation Helpers

```typescript
import { 
  expectValidEmail, 
  expectValidUrl, 
  expectValidUUID 
} from '@/test/helpers';

it('validates email', () => {
  expect(expectValidEmail('test@example.com')).toBe(true);
  expect(expectValidEmail('invalid')).toBe(false);
});
```

## Common Migration Patterns

### Pattern 1: Component Tests

**Before:**
```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

const mockProduct = {
  id: '1',
  name: 'Test',
  price: 100,
  // ... many properties
};

function Wrapper({ children }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

it('renders product', () => {
  render(<ProductCard product={mockProduct} />, { wrapper: Wrapper });
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

**After:**
```typescript
import { screen } from '@testing-library/react';
import { renderWithRouter, mockProduct, createMock } from '@/test/helpers';

const product = createMock(mockProduct, { name: 'Test' });

it('renders product', () => {
  renderWithRouter(<ProductCard product={product} />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Pattern 2: API Tests

**Before:**
```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: [] }),
  })
);
```

**After:**
```typescript
import { createMockFetch, createSuccessResponse } from '@/test/helpers';

global.fetch = createMockFetch(createSuccessResponse([]));
```

### Pattern 3: Context Tests

**Before:**
```typescript
const wrapper = ({ children }) => (
  <CartProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </CartProvider>
);

const { result } = renderHook(() => useCart(), { wrapper });
```

**After:**
```typescript
// Context wrapper still needed for hooks, but simplify the router part
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const { result } = renderHook(() => useCart(), { wrapper });
```

## Checklist for Migration

- [ ] Import helpers from `@/test/helpers`
- [ ] Replace manual mocks with pre-built mocks
- [ ] Use `createMock()` for customization
- [ ] Replace custom Router wrappers with `renderWithRouter()`
- [ ] Use `createMockFetch()` for fetch mocking
- [ ] Use `createSuccessResponse()`/`createErrorResponse()` for API responses
- [ ] Replace `setTimeout` with `wait()` or `flushPromises()`
- [ ] Use mock utilities (`mockConsole`, `mockLocalStorage`, etc.)
- [ ] Use test data generators for dynamic data
- [ ] Remove duplicate mock definitions

## Benefits After Migration

✅ **Reduced Code**: 50-70% less boilerplate per test file  
✅ **Type Safety**: All mocks are fully typed  
✅ **Consistency**: Same patterns across all tests  
✅ **Maintainability**: Update mocks in one place  
✅ **Readability**: Tests focus on behavior, not setup  
✅ **Reliability**: Pre-tested helper functions  

## Example: Complete Migration

### Before (100 lines)
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { GiftCard } from '../GiftCard';

const mockGift = {
  id: 'gift-1',
  name: 'Test Gift',
  description: 'Test description',
  category: 'Electronics',
  image: '/test.jpg',
  sku: 'TEST-001',
  price: 100,
  status: 'active',
  inStock: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('GiftCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders gift information', () => {
    render(<GiftCard gift={mockGift} />, { wrapper: Wrapper });
    
    expect(screen.getByText('Test Gift')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('handles click', async () => {
    const onClick = vi.fn();
    render(<GiftCard gift={mockGift} onClick={onClick} />, { wrapper: Wrapper });
    
    screen.getByRole('button').click();
    await waitFor(() => expect(onClick).toHaveBeenCalledWith(mockGift));
  });
});
```

### After (40 lines - 60% reduction)
```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter, mockGift } from '@/test/helpers';
import { GiftCard } from '../GiftCard';

describe('GiftCard', () => {
  it('renders gift information', () => {
    renderWithRouter(<GiftCard gift={mockGift} />);
    
    expect(screen.getByText('Test Gift')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('handles click', async () => {
    const onClick = vi.fn();
    renderWithRouter(<GiftCard gift={mockGift} onClick={onClick} />);
    
    screen.getByRole('button').click();
    await waitFor(() => expect(onClick).toHaveBeenCalledWith(mockGift));
  });
});
```

## Troubleshooting

### Issue: Import path not resolving
**Solution**: Check `vitest.config.ts` has the alias configured:
```typescript
resolve: {
  alias: {
    '@/test': path.resolve(__dirname, './src/test'),
  },
}
```

### Issue: Mock type mismatch
**Solution**: Use `createMock()` to ensure type safety:
```typescript
const customMock = createMock(mockGift, { price: 200 });
```

### Issue: Helper not available
**Solution**: Check it's exported from `/src/test/helpers.ts`:
```typescript
export { myHelper } from './myHelper';
```

## Need Help?

- See `/src/test/helpers.ts` for all available helpers
- See `/docs/TYPE_SAFETY_GUIDE.md` for type safety patterns
- Existing migrated tests for examples
