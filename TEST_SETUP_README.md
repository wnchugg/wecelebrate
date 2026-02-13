# Test Infrastructure Setup ✅

This document explains how to use the test infrastructure for the wecelebrate multi-catalog architecture.

---

## 📁 Test File Structure

```
wecelebrate-app/
├── src/
│   ├── test/
│   │   ├── setup.ts                    # Test setup & global config
│   │   ├── mockData/
│   │   │   └── catalogData.ts          # Mock test data
│   │   ├── mocks/
│   │   │   ├── handlers.ts             # MSW API handlers
│   │   │   └── server.ts               # MSW server setup
│   │   └── utils/
│   │       └── testUtils.tsx           # Test utilities
│   ├── types/__tests__/
│   │   └── catalog.test.ts             # Type definition tests
│   ├── services/__tests__/
│   │   └── catalogApi.test.ts          # API service tests
│   └── scripts/
│       └── seedTestData.ts             # Data seeding script
├── e2e/
│   └── catalog.spec.ts                 # E2E tests
├── vitest.config.ts                    # Vitest configuration
└── playwright.config.ts                # Playwright configuration
```

---

## 🚀 Quick Start

### 1. Run Unit Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### 2. Run E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug
```

### 3. Seed Test Data
```bash
# View test data summary
npm run seed:test-data:simple

# Seed test data to backend
npm run seed:test-data

# Clear and re-seed test data
npm run seed:test-data:clear
```

---

## 🧪 Test Types

### Unit Tests (Vitest)
Located in `src/**/__tests__/` directories.

**Examples:**
- `src/types/__tests__/catalog.test.ts` - Type validation tests
- `src/services/__tests__/catalogApi.test.ts` - API service tests

**Run:** `npm test`

### Integration Tests (Vitest + MSW)
Uses Mock Service Worker to mock API calls.

**MSW Setup:**
- Handlers: `src/test/mocks/handlers.ts`
- Server: `src/test/mocks/server.ts`

### E2E Tests (Playwright)
Located in `e2e/` directory.

**Examples:**
- `e2e/catalog.spec.ts` - Catalog management workflows

**Run:** `npm run test:e2e`

---

## 📊 Test Data

### Mock Data
All mock data is in `src/test/mockData/catalogData.ts`:

```typescript
import {
  mockCatalogs,       // 5 test catalogs
  mockSiteConfigs,    // 3 test configurations
  mockSites,          // 4 test sites
  mockMigrationStatus,
  mockMigrationResult,
} from '@/test/mockData/catalogData';
```

### Helper Functions
```typescript
import {
  getCatalogById,
  getSiteConfigBySiteId,
  filterCatalogs,
} from '@/test/mockData/catalogData';
```

---

## 🔧 Configuration

### Vitest Config (`vitest.config.ts`)
```typescript
{
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
  }
}
```

### Playwright Config (`playwright.config.ts`)
```typescript
{
  testDir: './e2e',
  baseURL: 'http://localhost:5173',
  projects: ['chromium', 'firefox', 'webkit'],
}
```

---

## 📝 Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { fetchCatalogs } from '../catalogApi';

describe('fetchCatalogs', () => {
  it('should fetch all catalogs', async () => {
    const catalogs = await fetchCatalogs();
    expect(catalogs).toHaveLength(5);
  });
});
```

### Component Test Example
```typescript
import { render, screen } from '@/test/utils/testUtils';
import CatalogManagement from '../CatalogManagement';

describe('CatalogManagement', () => {
  it('should render catalog list', async () => {
    render(<CatalogManagement />);
    expect(await screen.findByText('SAP Main Catalog')).toBeInTheDocument();
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('should create catalog', async ({ page }) => {
  await page.goto('/admin/catalogs/create');
  await page.fill('[name="name"]', 'New Catalog');
  await page.click('button:has-text("Create")');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## 🎯 Test Coverage Goals

| Category | Goal | Current |
|----------|------|---------|
| Types | 100% | ✅ 100% |
| Services | 90%+ | ✅ 95% |
| Components | 80%+ | 🔄 In Progress |
| E2E Workflows | Key paths | 🔄 In Progress |

---

## 🐛 Debugging Tests

### Vitest
```bash
# Run specific test file
npm test src/services/__tests__/catalogApi.test.ts

# Run tests matching pattern
npm test -- catalog

# Debug with UI
npm run test:ui
```

### Playwright
```bash
# Debug mode (opens browser)
npm run test:e2e:debug

# Run specific test
npx playwright test catalog.spec.ts

# Show report
npx playwright show-report
```

---

## 🔍 MSW (Mock Service Worker)

### How It Works
MSW intercepts network requests and returns mock responses.

### Handlers Location
`src/test/mocks/handlers.ts`

### Available Endpoints
```typescript
// Catalogs
GET    /catalogs
GET    /catalogs/:id
POST   /catalogs
PUT    /catalogs/:id
DELETE /catalogs/:id
GET    /catalogs/:id/stats

// Site Configurations
GET    /sites/:siteId/catalog-config
POST   /sites/:siteId/catalog-config
PUT    /sites/:siteId/catalog-config
DELETE /sites/:siteId/catalog-config

// Migration
GET    /migration/status
POST   /migration/run
POST   /migration/rollback
```

### Adding New Handlers
```typescript
// In src/test/mocks/handlers.ts
http.get(`${API_BASE}/your-endpoint`, () => {
  return HttpResponse.json({ data: 'your data' });
}),
```

---

## 📈 CI/CD Integration

### GitHub Actions Example
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

---

## 🎓 Best Practices

### ✅ Do's
1. **Write tests for new features** before marking as complete
2. **Use descriptive test names** that explain what's being tested
3. **Test both success and failure cases**
4. **Mock external dependencies** (APIs, databases)
5. **Keep tests independent** - no test should depend on another
6. **Use test data from mockData** - don't hardcode in tests

### ❌ Don'ts
1. **Don't test implementation details** - test behavior
2. **Don't share state between tests**
3. **Don't use real API calls in unit tests**
4. **Don't skip tests** unless temporarily needed
5. **Don't commit failing tests**

---

## 🔄 Test Workflow

### Before Committing
```bash
# 1. Run type check
npm run type-check

# 2. Run tests
npm test

# 3. Check coverage
npm run test:coverage

# 4. Run E2E tests (if changes affect UI)
npm run test:e2e
```

### Before Deploying
```bash
# Full test suite
npm test && npm run test:e2e

# Check coverage threshold
npm run test:coverage
```

---

## 📚 Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)

### Internal Docs
- `/TESTING_SCENARIOS.md` - Comprehensive test scenarios
- `/TESTING_CHECKLIST.md` - Quick testing checklist
- `/AUTOMATED_TEST_EXAMPLES.md` - More test examples

---

## 🆘 Troubleshooting

### Tests Fail with "Cannot find module"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MSW Not Intercepting Requests
```bash
# Check that setup.ts is properly configured
# Make sure server.listen() is called in beforeAll
```

### Playwright Tests Timeout
```bash
# Increase timeout in test
test.setTimeout(60000);

# Or in config
use: { timeout: 60000 }
```

### Coverage Not Generated
```bash
# Install coverage provider
npm install -D @vitest/coverage-v8

# Run with coverage
npm run test:coverage
```

---

## 📞 Support

For issues or questions about tests:
1. Check this README
2. Check `/TESTING_SCENARIOS.md` for specific test cases
3. Check `/AUTOMATED_TEST_EXAMPLES.md` for code examples
4. Review test files for similar patterns

---

**Happy Testing! 🎉**
