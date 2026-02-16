# Automated Test Examples 🤖

**Sample automated tests for the Multi-Catalog Architecture**

These examples show how to write automated tests using popular testing frameworks.

---

## Test Framework Setup

### Package Installation
```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  vitest \
  @vitest/ui \
  msw \
  @playwright/test
```

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

---

## Unit Tests

### 1. Type Definition Tests

```typescript
// src/types/__tests__/catalog.test.ts
import { describe, it, expect } from 'vitest';
import type { Catalog, SiteCatalogConfig, CatalogType, CatalogStatus } from '../catalog';

describe('Catalog Types', () => {
  it('should accept valid Catalog object', () => {
    const catalog: Catalog = {
      id: 'cat-001',
      name: 'Test Catalog',
      description: 'Test description',
      type: 'erp',
      status: 'active',
      source: {
        sourceSystem: 'SAP',
        sourceId: 'SAP-001',
        apiEndpoint: 'https://api.test.com',
        authMethod: 'oauth',
        credentials: {},
      },
      settings: {
        autoSync: true,
        syncFrequency: 'daily',
        syncTime: '02:00',
      },
      totalProducts: 100,
      activeProducts: 95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(catalog.id).toBe('cat-001');
    expect(catalog.type).toBe('erp');
    expect(catalog.status).toBe('active');
  });

  it('should accept valid catalog types', () => {
    const types: CatalogType[] = ['erp', 'vendor', 'manual', 'dropship'];
    expect(types).toHaveLength(4);
  });

  it('should accept valid catalog statuses', () => {
    const statuses: CatalogStatus[] = ['active', 'inactive', 'draft'];
    expect(statuses).toHaveLength(3);
  });

  it('should accept valid SiteCatalogConfig object', () => {
    const config: SiteCatalogConfig = {
      id: 'config-001',
      siteId: 'site-001',
      catalogId: 'cat-001',
      exclusions: {
        excludedCategories: ['Electronics'],
        excludedSkus: ['SKU-001'],
        excludedTags: ['seasonal'],
        excludedBrands: ['BrandX'],
      },
      overrides: {
        allowPriceOverride: true,
        priceAdjustment: 15,
      },
      availability: {
        hideOutOfStock: true,
        hideDiscontinued: true,
        minimumInventory: 5,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(config.siteId).toBe('site-001');
    expect(config.exclusions.excludedCategories).toContain('Electronics');
    expect(config.overrides.priceAdjustment).toBe(15);
  });
});
```

---

### 2. API Service Tests

```typescript
// src/services/__tests__/catalogApi.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchCatalogs, createCatalog, fetchSiteCatalogConfig } from '../catalogApi';

// Mock fetch
global.fetch = vi.fn();

describe('Catalog API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCatalogs', () => {
    it('should fetch all catalogs successfully', async () => {
      const mockCatalogs = [
        { id: 'cat-001', name: 'Catalog 1', type: 'erp' },
        { id: 'cat-002', name: 'Catalog 2', type: 'vendor' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ catalogs: mockCatalogs }),
      });

      const result = await fetchCatalogs();

      expect(result).toEqual(mockCatalogs);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should filter catalogs by status', async () => {
      const mockCatalogs = [
        { id: 'cat-001', name: 'Catalog 1', status: 'active' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ catalogs: mockCatalogs }),
      });

      const result = await fetchCatalogs({ status: 'active' });

      expect(result).toEqual(mockCatalogs);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=active'),
        expect.any(Object)
      );
    });

    it('should throw error on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to fetch catalogs' }),
      });

      await expect(fetchCatalogs()).rejects.toThrow('Failed to fetch catalogs');
    });
  });

  describe('createCatalog', () => {
    it('should create catalog successfully', async () => {
      const catalogData = {
        name: 'New Catalog',
        type: 'erp' as const,
        description: 'Test catalog',
      };

      const mockResponse = {
        id: 'cat-new',
        ...catalogData,
        status: 'active',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ catalog: mockResponse }),
      });

      const result = await createCatalog(catalogData);

      expect(result.id).toBe('cat-new');
      expect(result.name).toBe('New Catalog');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(catalogData),
        })
      );
    });
  });

  describe('fetchSiteCatalogConfig', () => {
    it('should fetch site config successfully', async () => {
      const mockConfig = {
        id: 'config-001',
        siteId: 'site-001',
        catalogId: 'cat-001',
        exclusions: {},
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ config: mockConfig }),
      });

      const result = await fetchSiteCatalogConfig('site-001');

      expect(result).toEqual(mockConfig);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('site-001'),
        expect.any(Object)
      );
    });

    it('should throw error if config not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Config not found' }),
      });

      await expect(fetchSiteCatalogConfig('site-999')).rejects.toThrow(
        'Config not found'
      );
    });
  });
});
```

---

## Component Tests

### 3. CatalogManagement Component Tests

```typescript
// src/pages/admin/__tests__/CatalogManagement.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CatalogManagement from '../CatalogManagement';
import * as catalogApi from '../../../services/catalogApi';

// Mock API
vi.mock('../../../services/catalogApi');

const mockCatalogs = [
  {
    id: 'cat-001',
    name: 'SAP Main Catalog',
    description: 'Primary ERP catalog',
    type: 'erp',
    status: 'active',
    totalProducts: 1500,
    activeProducts: 1450,
    source: { sourceSystem: 'SAP' },
  },
  {
    id: 'cat-002',
    name: 'Vendor Catalog',
    description: 'External vendor products',
    type: 'vendor',
    status: 'active',
    totalProducts: 500,
    activeProducts: 480,
    source: { sourceSystem: 'VendorAPI' },
  },
];

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <CatalogManagement />
    </BrowserRouter>
  );
};

describe('CatalogManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(catalogApi.fetchCatalogs).mockResolvedValue(mockCatalogs);
  });

  it('should render loading state initially', () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display catalogs after loading', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('SAP Main Catalog')).toBeInTheDocument();
      expect(screen.getByText('Vendor Catalog')).toBeInTheDocument();
    });
  });

  it('should display catalog statistics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('1500')).toBeInTheDocument(); // total products
      expect(screen.getByText('1450')).toBeInTheDocument(); // active products
    });
  });

  it('should filter catalogs by search term', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('SAP Main Catalog')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search catalogs...');
    await user.type(searchInput, 'SAP');

    await waitFor(() => {
      expect(screen.getByText('SAP Main Catalog')).toBeInTheDocument();
      expect(screen.queryByText('Vendor Catalog')).not.toBeInTheDocument();
    });
  });

  it('should filter catalogs by type', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('SAP Main Catalog')).toBeInTheDocument();
    });

    const typeFilter = screen.getByRole('combobox', { name: /type/i });
    await user.selectOptions(typeFilter, 'erp');

    await waitFor(() => {
      expect(screen.getByText('SAP Main Catalog')).toBeInTheDocument();
      expect(screen.queryByText('Vendor Catalog')).not.toBeInTheDocument();
    });
  });

  it('should navigate to create page when clicking Create button', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Create Catalog')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create catalog/i });
    await user.click(createButton);

    // Check navigation (you'd mock navigate and check it was called)
    expect(window.location.pathname).toBe('/admin/catalogs/create');
  });

  it('should handle empty state', async () => {
    vi.mocked(catalogApi.fetchCatalogs).mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no catalogs found/i)).toBeInTheDocument();
    });
  });

  it('should handle API error', async () => {
    vi.mocked(catalogApi.fetchCatalogs).mockRejectedValue(
      new Error('Failed to fetch')
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });
});
```

---

### 4. SiteCatalogConfiguration Component Tests

```typescript
// src/pages/admin/__tests__/SiteCatalogConfiguration.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SiteCatalogConfiguration from '../SiteCatalogConfiguration';
import { SiteProvider } from '../../../context/SiteContext';
import * as catalogApi from '../../../services/catalogApi';

vi.mock('../../../services/catalogApi');

const mockSite = {
  id: 'site-001',
  name: 'Test Site',
};

const mockCatalogs = [
  { id: 'cat-001', name: 'Catalog 1', type: 'erp' },
  { id: 'cat-002', name: 'Catalog 2', type: 'vendor' },
];

const mockConfig = {
  id: 'config-001',
  siteId: 'site-001',
  catalogId: 'cat-001',
  exclusions: {
    excludedCategories: ['Electronics'],
    excludedSkus: ['SKU-001'],
    excludedTags: [],
    excludedBrands: [],
  },
  overrides: {
    allowPriceOverride: true,
    priceAdjustment: 15,
  },
  availability: {
    hideOutOfStock: true,
    hideDiscontinued: true,
  },
};

const renderComponent = (currentSite = mockSite) => {
  return render(
    <BrowserRouter>
      <SiteProvider value={{ currentSite }}>
        <SiteCatalogConfiguration />
      </SiteProvider>
    </BrowserRouter>
  );
};

describe('SiteCatalogConfiguration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(catalogApi.fetchCatalogs).mockResolvedValue(mockCatalogs);
    vi.mocked(catalogApi.fetchSiteCatalogConfig).mockResolvedValue(mockConfig);
  });

  it('should show warning when no site selected', () => {
    renderComponent(null);
    expect(screen.getByText(/no site selected/i)).toBeInTheDocument();
  });

  it('should load catalogs and config', async () => {
    renderComponent();

    await waitFor(() => {
      expect(catalogApi.fetchCatalogs).toHaveBeenCalled();
      expect(catalogApi.fetchSiteCatalogConfig).toHaveBeenCalledWith('site-001');
    });
  });

  it('should display selected catalog info', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Catalog 1')).toBeInTheDocument();
    });
  });

  it('should display existing exclusions as pills', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('SKU-001')).toBeInTheDocument();
    });
  });

  it('should add category exclusion', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter category name');
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(input, 'Jewelry');
    await user.click(addButton);

    expect(screen.getByText('Jewelry')).toBeInTheDocument();
  });

  it('should add category exclusion with Enter key', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter category name');
    await user.type(input, 'Toys{Enter}');

    expect(screen.getByText('Toys')).toBeInTheDocument();
    expect(input).toHaveValue(''); // Input should clear
  });

  it('should prevent duplicate exclusions', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter category name');
    await user.type(input, 'Electronics{Enter}');

    // Should still only have one "Electronics" pill
    const pills = screen.getAllByText('Electronics');
    expect(pills).toHaveLength(1);
  });

  it('should remove exclusion when clicking X', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove electronics/i });
    await user.click(removeButton);

    expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
  });

  it('should toggle price override', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      const checkbox = screen.getByLabelText(/allow price overrides/i);
      expect(checkbox).toBeChecked();
    });

    const checkbox = screen.getByLabelText(/allow price overrides/i);
    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.queryByLabelText(/global price adjustment/i)).not.toBeInTheDocument();
  });

  it('should update price adjustment', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      const input = screen.getByLabelText(/global price adjustment/i);
      expect(input).toHaveValue(15);
    });

    const input = screen.getByLabelText(/global price adjustment/i);
    await user.clear(input);
    await user.type(input, '20');

    expect(input).toHaveValue(20);
  });

  it('should save configuration', async () => {
    const user = userEvent.setup();
    vi.mocked(catalogApi.createOrUpdateSiteCatalogConfig).mockResolvedValue(mockConfig);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save configuration/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(catalogApi.createOrUpdateSiteCatalogConfig).toHaveBeenCalledWith(
        'site-001',
        expect.objectContaining({
          catalogId: 'cat-001',
          exclusions: expect.any(Object),
        })
      );
    });

    expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
  });

  it('should disable save when no catalog selected', async () => {
    vi.mocked(catalogApi.fetchSiteCatalogConfig).mockRejectedValue(
      new Error('Not found')
    );

    renderComponent();

    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /save configuration/i });
      expect(saveButton).toBeDisabled();
    });
  });

  it('should reset configuration', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    // Add new exclusion
    const input = screen.getByPlaceholderText('Enter category name');
    await user.type(input, 'NewCategory{Enter}');
    expect(screen.getByText('NewCategory')).toBeInTheDocument();

    // Click reset
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    // Should reload original data
    await waitFor(() => {
      expect(catalogApi.fetchSiteCatalogConfig).toHaveBeenCalledTimes(2);
    });
  });
});
```

---

## Integration Tests (Playwright)

### 5. End-to-End Workflow Test

```typescript
// e2e/catalog-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Catalog Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');
  });

  test('complete catalog setup workflow', async ({ page }) => {
    // Step 1: Navigate to catalog management
    await page.click('text=Catalog Management');
    await page.waitForURL('/admin/catalogs');
    await expect(page.locator('h1')).toContainText('Catalog Management');

    // Step 2: Create new catalog
    await page.click('text=Create Catalog');
    await page.waitForURL('/admin/catalogs/create');

    await page.fill('[name="name"]', 'E2E Test Catalog');
    await page.fill('[name="description"]', 'Automated test catalog');
    await page.selectOption('[name="type"]', 'erp');
    await page.selectOption('[name="status"]', 'active');

    await page.fill('[name="sourceSystem"]', 'TestERP');
    await page.fill('[name="sourceId"]', 'TEST-001');
    await page.fill('[name="apiEndpoint"]', 'https://api.test.com');

    await page.click('button:has-text("Create Catalog")');

    // Verify success
    await expect(page.locator('.success-message')).toBeVisible();
    await page.waitForURL('/admin/catalogs');

    // Step 3: Verify catalog in list
    await expect(page.locator('text=E2E Test Catalog')).toBeVisible();

    // Step 4: Run migration
    await page.click('text=Catalog Migration');
    await page.waitForURL('/admin/catalogs/migrate');

    await page.selectOption('[name="defaultCatalogId"]', { label: 'E2E Test Catalog' });
    await page.click('button:has-text("Run Migration")');

    // Confirm dialog
    await page.click('button:has-text("Confirm")');

    // Wait for completion
    await expect(page.locator('text=Migration completed')).toBeVisible({ timeout: 30000 });

    // Step 5: Configure site
    await page.click('text=Site Catalog');
    await page.waitForURL('/admin/site-catalog-configuration');

    await page.selectOption('[name="catalogId"]', { label: 'E2E Test Catalog' });

    // Add exclusions
    await page.fill('[placeholder="Enter category name"]', 'TestCategory');
    await page.press('[placeholder="Enter category name"]', 'Enter');
    await expect(page.locator('text=TestCategory')).toBeVisible();

    // Set price override
    await page.check('[name="allowPriceOverride"]');
    await page.fill('[name="priceAdjustment"]', '10');

    // Save configuration
    await page.click('button:has-text("Save Configuration")');
    await expect(page.locator('text=saved successfully')).toBeVisible();

    // Step 6: Verify configuration persists
    await page.reload();
    await expect(page.locator('text=TestCategory')).toBeVisible();
    await expect(page.locator('[name="priceAdjustment"]')).toHaveValue('10');
  });

  test('search and filter catalogs', async ({ page }) => {
    await page.goto('/admin/catalogs');

    // Test search
    await page.fill('[placeholder="Search catalogs..."]', 'SAP');
    await expect(page.locator('text=SAP Main Catalog')).toBeVisible();
    await expect(page.locator('text=Vendor Catalog')).not.toBeVisible();

    // Clear search
    await page.fill('[placeholder="Search catalogs..."]', '');
    await expect(page.locator('text=Vendor Catalog')).toBeVisible();

    // Test type filter
    await page.selectOption('[name="typeFilter"]', 'erp');
    await expect(page.locator('.catalog-card')).toHaveCount(2); // Assuming 2 ERP catalogs

    // Test status filter
    await page.selectOption('[name="statusFilter"]', 'active');
    await expect(page.locator('.catalog-card[data-status="inactive"]')).toHaveCount(0);
  });

  test('edit existing catalog', async ({ page }) => {
    await page.goto('/admin/catalogs');

    // Click edit on first catalog
    await page.click('.catalog-card:first-child button:has-text("Edit")');
    await page.waitForURL(/\/admin\/catalogs\/.+/);

    // Update name
    const nameInput = page.locator('[name="name"]');
    const originalName = await nameInput.inputValue();
    await nameInput.fill('Updated ' + originalName);

    // Save
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=updated successfully')).toBeVisible();

    // Verify on list page
    await page.goto('/admin/catalogs');
    await expect(page.locator(`text=Updated ${originalName}`)).toBeVisible();
  });

  test('handle validation errors', async ({ page }) => {
    await page.goto('/admin/catalogs/create');

    // Try to submit empty form
    await page.click('button:has-text("Create Catalog")');

    // Check for validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Type is required')).toBeVisible();
  });

  test('add multiple exclusions', async ({ page }) => {
    await page.goto('/admin/site-catalog-configuration');

    // Select catalog first
    await page.selectOption('[name="catalogId"]', { index: 1 });

    // Add multiple categories
    const categories = ['Category1', 'Category2', 'Category3'];
    for (const category of categories) {
      await page.fill('[placeholder="Enter category name"]', category);
      await page.press('[placeholder="Enter category name"]', 'Enter');
      await expect(page.locator(`text=${category}`)).toBeVisible();
    }

    // Add multiple SKUs
    const skus = ['SKU-001', 'SKU-002', 'SKU-003'];
    for (const sku of skus) {
      await page.fill('[placeholder="Enter SKU"]', sku);
      await page.press('[placeholder="Enter SKU"]', 'Enter');
      await expect(page.locator(`text=${sku}`)).toBeVisible();
    }

    // Save
    await page.click('button:has-text("Save Configuration")');
    await expect(page.locator('text=saved successfully')).toBeVisible();
  });
});
```

---

## Mock Service Worker (MSW) Setup

### 6. API Mocking

```typescript
// src/test/mocks/handlers.ts
import { rest } from 'msw';

const API_BASE = 'http://localhost:54321/functions/v1/make-server-6fcaeea3';

export const handlers = [
  // Get all catalogs
  rest.get(`${API_BASE}/catalogs`, (req, res, ctx) => {
    const status = req.url.searchParams.get('status');
    const type = req.url.searchParams.get('type');

    let catalogs = [
      { id: 'cat-001', name: 'Catalog 1', type: 'erp', status: 'active' },
      { id: 'cat-002', name: 'Catalog 2', type: 'vendor', status: 'active' },
      { id: 'cat-003', name: 'Catalog 3', type: 'manual', status: 'inactive' },
    ];

    if (status) {
      catalogs = catalogs.filter(c => c.status === status);
    }
    if (type) {
      catalogs = catalogs.filter(c => c.type === type);
    }

    return res(ctx.json({ catalogs }));
  }),

  // Create catalog
  rest.post(`${API_BASE}/catalogs`, async (req, res, ctx) => {
    const body = await req.json();
    
    return res(
      ctx.status(201),
      ctx.json({
        catalog: {
          id: 'cat-new',
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }),

  // Get site catalog config
  rest.get(`${API_BASE}/sites/:siteId/catalog-config`, (req, res, ctx) => {
    const { siteId } = req.params;

    if (siteId === 'site-404') {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Config not found' })
      );
    }

    return res(
      ctx.json({
        config: {
          id: 'config-001',
          siteId,
          catalogId: 'cat-001',
          exclusions: {
            excludedCategories: ['Electronics'],
            excludedSkus: [],
          },
        },
      })
    );
  }),

  // Migration status
  rest.get(`${API_BASE}/migration/status`, (req, res, ctx) => {
    return res(
      ctx.json({
        migrated: false,
        statistics: {
          totalCatalogs: 4,
          totalProducts: 1500,
          productsNeedingMigration: 1500,
        },
      })
    );
  }),

  // Run migration
  rest.post(`${API_BASE}/migration/run`, async (req, res, ctx) => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return res(
      ctx.json({
        success: true,
        message: 'Migration completed successfully',
        results: {
          productsProcessed: 1500,
          productsMigrated: 1500,
        },
      })
    );
  }),
];
```

```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// src/test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';
import '@testing-library/jest-dom';

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

---

## Performance Tests

### 7. Load Time Tests

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('catalog list page loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/admin/catalogs');
    await page.waitForSelector('.catalog-card');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('site configuration page loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/admin/site-catalog-configuration');
    await page.waitForSelector('select[name="catalogId"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('handles large exclusion lists without lag', async ({ page }) => {
    await page.goto('/admin/site-catalog-configuration');
    await page.selectOption('[name="catalogId"]', { index: 1 });

    // Add 50 exclusions
    for (let i = 0; i < 50; i++) {
      await page.fill('[placeholder="Enter category name"]', `Category ${i}`);
      await page.press('[placeholder="Enter category name"]', 'Enter');
    }

    // Measure scroll performance
    const startTime = Date.now();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const scrollTime = Date.now() - startTime;

    expect(scrollTime).toBeLessThan(100);
  });
});
```

---

## Accessibility Tests

### 8. A11y Tests

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('catalog management page is accessible', async ({ page }) => {
    await page.goto('/admin/catalogs');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('site configuration page is accessible', async ({ page }) => {
    await page.goto('/admin/site-catalog-configuration');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/admin/catalogs/create');

    // Tab through form fields
    await page.keyboard.press('Tab');
    await expect(page.locator('[name="name"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[name="description"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[name="type"]')).toBeFocused();
  });
});
```

---

## Running Tests

### Test Commands

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:a11y": "playwright test accessibility"
  }
}
```

### Run Tests
```bash
# Unit & integration tests
npm run test

# Watch mode
npm run test -- --watch

# UI mode
npm run test:ui

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui

# Accessibility tests
npm run test:a11y
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

**These test examples provide a solid foundation for automated testing of your multi-catalog architecture!** 🧪✅

