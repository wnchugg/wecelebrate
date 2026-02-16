# Testing Infrastructure Documentation

## Overview

This document describes the comprehensive testing infrastructure for the wecelebrate application, including unit tests, integration tests, E2E tests, visual regression tests, and performance benchmarks.

## Table of Contents

1. [Test Suites](#test-suites)
2. [Running Tests](#running-tests)
3. [Test Coverage](#test-coverage)
4. [Performance Benchmarks](#performance-benchmarks)
5. [Visual Regression Testing](#visual-regression-testing)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Best Practices](#best-practices)

---

## Test Suites

### 1. Unit Tests (652 tests)
**Location:** `/src/app/components/ui/__tests__/`

**Purpose:** Test individual UI components in isolation

**Coverage:**
- Button components
- Form inputs
- Cards and layouts
- Navigation components
- All Radix UI components

**Run Command:**
```bash
npm run test:ui-components
```

### 2. Integration Tests (201 tests)
**Location:** `/src/app/__tests__/`

**Purpose:** Test component interactions and data flow

**Test Files:**
- `routes.test.tsx` (81 tests) - Route configuration and navigation
- `navigationFlow.test.tsx` (25 tests) - Navigation patterns
- `crossComponentIntegration.test.tsx` (26 tests) - Context integration
- `complexScenarios.e2e.test.tsx` (22 tests) - Complex workflows
- `completeShoppingFlow.e2e.test.tsx` (22 tests) - Shopping journeys
- `userJourney.e2e.test.tsx` (25 tests) - User workflows

**Run Command:**
```bash
npm run test:integration
# or
npm test -- src/app/__tests__/
```

### 3. Performance Benchmarks
**Location:** `/src/app/__tests__/performance.benchmark.test.tsx`

**Purpose:** Measure and assert performance thresholds

**Tests:**
- Component rendering performance
- User interaction responsiveness
- Context update speed
- Memory usage tracking

**Run Command:**
```bash
npm test -- src/app/__tests__/performance.benchmark.test.tsx
```

### 4. Visual Regression Tests
**Location:** `/src/app/__tests__/visual/`

**Purpose:** Catch unintended visual changes

**Coverage:**
- Component appearance across browsers
- Responsive design (mobile, tablet, desktop)
- Dark mode consistency
- Multi-language UI
- Component states (hover, focus, active)
- Error states

**Run Command:**
```bash
npx playwright test --config=playwright.visual.config.ts
```

---

## Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Run specific test file
npm test -- path/to/test.tsx

# Run tests matching pattern
npm test -- --grep "should render"
```

### Test Commands Reference

```bash
# Unit tests
npm run test:ui-components         # UI component tests
npm run test:ui-components:watch   # Watch mode

# Integration tests  
npm run test:integration           # All integration tests
npm run test:integration:watch     # Watch mode

# Coverage
npm run test:coverage              # Generate coverage report

# E2E tests (Playwright)
npm run test:e2e                   # Run E2E tests
npm run test:e2e:ui                # Run with Playwright UI
npm run test:e2e:debug             # Debug mode

# Visual regression
npx playwright test --config=playwright.visual.config.ts
npx playwright test --config=playwright.visual.config.ts --update-snapshots  # Update baselines

# Performance
npm test -- src/app/__tests__/performance.benchmark.test.tsx
```

---

## Test Coverage

### Current Coverage

| Metric | Coverage | Status |
|--------|----------|--------|
| Total Tests | 853+ | ✅ 100% passing |
| UI Components | 652 | ✅ Complete |
| Integration | 201 | ✅ Complete |
| Routes | 81 | ✅ Complete |
| Statements | ~85% | ✅ Good |
| Branches | ~80% | ✅ Good |
| Functions | ~82% | ✅ Good |
| Lines | ~85% | ✅ Good |

### Viewing Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Configuration

Coverage is configured in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'node_modules/',
    'src/test/',
    'src/setupTests.ts',
    '**/*.d.ts',
    '**/*.config.*',
    '**/mockData',
    '**/__tests__/**',
  ],
}
```

### Coverage Thresholds

We aim for:
- **Statements:** 85%+
- **Branches:** 80%+  
- **Functions:** 80%+
- **Lines:** 85%+

---

## Performance Benchmarks

### Performance Thresholds

```typescript
export const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD: {
    FAST: 1000ms,
    ACCEPTABLE: 2500ms,
    SLOW: 5000ms,
  },
  
  RENDER: {
    FAST: 16.67ms,      // 60fps
    ACCEPTABLE: 33.33ms, // 30fps
    SLOW: 100ms,
  },
  
  API: {
    FAST: 100ms,
    ACCEPTABLE: 500ms,
    SLOW: 2000ms,
  },
  
  INTERACTION: {
    FAST: 50ms,
    ACCEPTABLE: 100ms,
    SLOW: 300ms,
  },
};
```

### Running Benchmarks

```bash
# Run all performance benchmarks
npm test -- src/app/__tests__/performance.benchmark.test.tsx

# View detailed results
npm test -- src/app/__tests__/performance.benchmark.test.tsx --reporter=verbose
```

### Performance Metrics Tracked

1. **Component Rendering**
   - Small lists (10 items): < 50ms avg
   - Medium lists (50 items): < 100ms avg
   - Large lists (100 items): < 200ms avg

2. **User Interactions**
   - Button clicks: < 10ms avg
   - Form input: < 20ms avg

3. **Context Updates**
   - Cart context: < 30ms avg
   - Auth context: < 30ms avg
   - Language context: < 30ms avg

4. **Memory Usage**
   - No memory leaks on repeated renders
   - Reasonable heap size growth

### Performance Assertions

```typescript
import { assertPerformance } from '@/test/utils/performance';

// Assert average duration
assertPerformance('render-component', 50); // < 50ms

// Assert P95 duration
assertPerformance('api-call', 100, 200); // avg < 100ms, P95 < 200ms
```

---

## Visual Regression Testing

### Setup

Visual regression tests use Playwright to capture screenshots and compare them against baselines.

### Configuration

Visual tests are configured in `playwright.visual.config.ts`:

- **Browsers:** Chromium, Firefox, WebKit
- **Viewports:** Desktop (1280x720), Mobile (Pixel 5, iPhone 12), Tablet (iPad Pro)
- **Output:** `/test-results/visual/`
- **Snapshots:** `/src/app/__tests__/visual/snapshots/`

### Running Visual Tests

```bash
# Run all visual tests
npx playwright test --config=playwright.visual.config.ts

# Run specific browser
npx playwright test --config=playwright.visual.config.ts --project=chromium

# Run specific test
npx playwright test --config=playwright.visual.config.ts homepage

# Update snapshots (after intentional UI changes)
npx playwright test --config=playwright.visual.config.ts --update-snapshots

# View report
npx playwright show-report test-results/visual-report
```

### Visual Test Coverage

- ✅ Homepage (all viewports)
- ✅ Product pages
- ✅ Cart page
- ✅ Checkout form
- ✅ Dark mode
- ✅ Multi-language (ES, FR, DE)
- ✅ Component states (hover, focus, active)
- ✅ Error states
- ✅ Admin interface
- ✅ Mobile responsive design

### When to Update Snapshots

Update snapshots when:
- You intentionally change UI design
- You update component styling
- You add new features with UI changes

**Never** update snapshots to "fix" a failing test without understanding why it failed!

---

## CI/CD Pipeline

### Pipeline Overview

Our CI/CD pipeline runs automatically on:
- Push to `main`, `develop`, `staging` branches
- Pull requests to `main`, `develop`
- Manual trigger via GitHub Actions

### Pipeline Stages

```
1. Code Quality
   ├─ ESLint
   ├─ Prettier
   └─ TypeScript check

2. Tests
   ├─ Unit tests
   ├─ Integration tests
   └─ E2E tests

3. Coverage
   └─ Coverage report

4. Performance
   └─ Benchmark tests

5. Visual Regression
   └─ Screenshot comparison

6. Build
   ├─ Staging build
   └─ Production build

7. Security
   ├─ Trivy scan
   └─ npm audit

8. Deploy
   ├─ Staging (on develop)
   └─ Production (on main)
```

### Workflow Files

- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline
- `.github/workflows/code-quality.yml` - Daily quality reports

### Deployment Environments

| Branch | Environment | URL |
|--------|-------------|-----|
| `develop` | Staging | https://staging.wecelebrate.app |
| `main` | Production | https://wecelebrate.app |

### Artifacts

The pipeline generates and stores:
- Test results (7 days)
- Coverage reports (30 days)
- Performance benchmarks (30 days)
- Visual test screenshots (30 days)
- Build artifacts (7 days)

---

## Best Practices

### Writing Tests

1. **Follow AAA Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange
     const input = 'test';
     
     // Act
     const result = functionUnderTest(input);
     
     // Assert
     expect(result).toBe('expected');
   });
   ```

2. **Use Descriptive Names**
   ```typescript
   // Good
   it('should display error message when form is submitted empty', () => {});
   
   // Bad
   it('should work', () => {});
   ```

3. **Test User Behavior, Not Implementation**
   ```typescript
   // Good - tests what user sees
   expect(screen.getByText('Welcome')).toBeInTheDocument();
   
   // Bad - tests implementation details
   expect(component.state.isLoaded).toBe(true);
   ```

4. **Use Testing Library Queries**
   - Prefer `getByRole`, `getByLabelText`, `getByText`
   - Avoid `getByTestId` unless necessary
   - Use `getAllBy` for multiple elements

5. **Async Testing**
   ```typescript
   // Use waitFor for async assertions
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument();
   });
   
   // Use userEvent for interactions
   const user = userEvent.setup();
   await user.click(screen.getByRole('button'));
   ```

### Performance Testing

1. **Set Realistic Thresholds**
   - Based on actual user experience
   - Account for CI environment being slower

2. **Run Multiple Iterations**
   - Minimum 30-50 iterations for statistical significance
   - Report median and P95, not just average

3. **Isolate Tests**
   - Clear performance marks between tests
   - Avoid interference from other tests

### Visual Regression

1. **Stable Environments**
   - Disable animations in tests
   - Use fixed data (no random content)
   - Wait for `networkidle` state

2. **Meaningful Snapshots**
   - Capture full user flows, not just individual elements
   - Test different states (loading, error, success)

3. **Maintain Baselines**
   - Review visual diffs carefully
   - Document why snapshots were updated
   - Keep baselines in version control

### CI/CD

1. **Fast Feedback**
   - Run linting first (fastest)
   - Parallel test execution
   - Fail fast on critical errors

2. **Reliable Tests**
   - Avoid flaky tests
   - Use retries for network-dependent tests
   - Mock external dependencies

3. **Security**
   - Never commit secrets
   - Use environment variables
   - Run security scans regularly

---

## Troubleshooting

### Tests Failing Locally

```bash
# Clear test cache
rm -rf node_modules/.vitest

# Reinstall dependencies
pnpm install

# Run specific test
npm test -- path/to/test.tsx --reporter=verbose
```

### Visual Tests Failing

```bash
# View diff report
npx playwright show-report test-results/visual-report

# Update snapshots if change is intentional
npx playwright test --config=playwright.visual.config.ts --update-snapshots
```

### Performance Tests Failing

- Check if threshold is too strict
- Run locally to compare
- Look for memory leaks or infinite loops

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## Maintenance

### Weekly
- Review test coverage reports
- Check for flaky tests
- Update dependencies

### Monthly
- Review performance trends
- Update visual baselines if needed
- Audit test suite for redundancy

### Quarterly
- Review and update thresholds
- Evaluate new testing tools
- Refactor test utilities

---

**Last Updated:** February 11, 2026  
**Maintained By:** Engineering Team  
**Questions?** Contact the testing team
