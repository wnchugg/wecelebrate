# Test Quick Reference Card

## 🚀 Quick Commands

```bash
# Run ALL tests (recommended before commit)
npm run test:all

# Run Vitest tests only (fastest, for local dev)
npm run test:safe

# Run with watch mode (for TDD)
npm run test:watch

# Run E2E tests
npm run test:e2e

# Type check + Lint
npm run type-check && npm run lint
```

## 📊 Test Coverage

| Test Suite | Files | Tests | Pass Rate |
|------------|-------|-------|-----------|
| Vitest | 123 | 2,859 | 99.1% |
| Playwright | 2 | - | - |
| Deno | 3 | ~90 | - |
| **Total** | **128** | **~2,949** | **99.1%** |

## 🎯 Test Runners

| Runner | Purpose | Command |
|--------|---------|---------|
| **Vitest** | Frontend & logic tests | `npm run test:safe` |
| **Playwright** | E2E browser tests | `npm run test:e2e` |
| **Deno** | Backend integration | `deno test --allow-net --allow-env` |
| **TypeScript** | Type checking | `npm run type-check` |
| **ESLint** | Code quality | `npm run lint` |

## 📁 Test Locations

```
src/app/
├── components/__tests__/       → Component tests
├── hooks/__tests__/            → Hook tests
├── pages/__tests__/            → Page tests
├── services/__tests__/         → Service tests
└── utils/__tests__/            → Utility tests

e2e/                            → Playwright E2E tests

supabase/functions/server/tests/
├── *.vitest.test.ts           → Backend logic (Vitest)
└── *.test.ts                  → Backend integration (Deno)
```

## 🔧 Specific Test Commands

```bash
# By Category
npm run test:ui-components      # UI components
npm run test:admin-components   # Admin components
npm run test:contexts           # React contexts
npm run test:hooks              # Custom hooks
npm run test:services           # Services
npm run test:utils              # Utilities
npm run test:integration        # Integration tests

# By Feature
npm run test:dashboard          # Dashboard tests
npm run test:backend            # Backend tests

# With Options
npm run test:all:verbose        # Detailed output
npm run test:all:coverage       # With coverage
npm run test:e2e:ui             # Playwright UI mode
npm run test:e2e:debug          # Debug mode
```

## ⚠️ Important Notes

### DO ✅
- Use `npm run test:safe` for local testing
- Use `npm run test:all` before committing
- Use `npm run test:watch` for TDD
- Run specific suites during development

### DON'T ❌
- Never use `npm test` (blocked to prevent system overload)
- Don't run all tests repeatedly (use watch mode)
- Don't skip type-check before commit

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Out of memory | Use `test:safe` instead of `test:full` |
| Playwright fails | Run `npx playwright install` |
| Deno tests not found | Install Deno: https://deno.land |
| Type errors | Run `npm run type-check` |
| Lint errors | Run `npm run lint` |

## 📈 Performance

| Command | Time | RAM Usage |
|---------|------|-----------|
| `test:safe` | ~30-50s | 400-800 MB |
| `test:full` | ~20-30s | 800-1600 MB |
| `test:e2e` | ~2-5m | Varies |
| `test:all` | ~3-7m | Varies |

## 🎨 Test Patterns

### Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

it('should render', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Hook Test
```typescript
import { renderHook } from '@testing-library/react';
import { useMyHook } from './useMyHook';

it('should return value', () => {
  const { result } = renderHook(() => useMyHook());
  expect(result.current).toBe(true);
});
```

### E2E Test
```typescript
import { test, expect } from '@playwright/test';

test('should navigate', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Link');
  await expect(page).toHaveURL(/.*target/);
});
```

## 📚 Documentation

- **Full Guide**: `TESTING.md`
- **Progress**: `TEST_FIX_PROGRESS.md`
- **Safe Testing**: `SAFE_TESTING_GUIDE.md`
- **Deployment**: `DEPLOYMENT_TEST_FIXES.md`

## 🎯 Before Commit Checklist

- [ ] Run `npm run test:all`
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] All tests passing
- [ ] No type errors
- [ ] No lint errors

---

**Quick Help**: Run `npm run test:all -- --help` for options
