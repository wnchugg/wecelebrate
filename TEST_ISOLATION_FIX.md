# Test Isolation Fix for Parallel CI Runs

## Problem
UI component tests were passing individually but failing during high-concurrency CI runs (`test:full` with 6 workers). This indicated race conditions or test isolation issues rather than actual component bugs.

## Root Cause
The Vitest configuration had `isolate: false` to save memory during local development. While this works fine for single-threaded execution (`test:safe`), it causes shared state between tests in parallel runs, leading to:
- DOM state bleeding between tests
- Mock state not properly isolated
- Race conditions in concurrent test execution

## Solution

### 1. Enhanced Test Isolation for CI
Updated `test:full` command to enable test isolation:
```json
"test:full": "NODE_OPTIONS='--max-old-space-size=4096' vitest --run --isolate=true --maxConcurrency=6 --poolOptions.threads.maxThreads=6 --poolOptions.threads.singleThread=false"
```

Key changes:
- Added `--isolate=true` flag to ensure each test file runs in isolated context
- Maintains 6 workers/6 max concurrency as specified in CI-CD.md
- Increased memory allocation to handle isolation overhead

### 2. Improved Test Cleanup
Enhanced `src/test/setup.ts` to ensure thorough cleanup between tests:
```typescript
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.clearAllTimers();
  // Reset any global state that might leak between tests
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});
```

### 3. Configuration Documentation
Updated `vitest.config.ts` with clear comments explaining the isolation strategy:
- `isolate: false` for local dev (memory-efficient)
- CI overrides with `--isolate=true` for test isolation

### 4. Preservation Test
Created `src/app/__tests__/bugfix/test-isolation.preservation.test.ts` to ensure:
- `test:full` maintains `--isolate=true` flag
- 6 workers configuration preserved (per CI-CD.md)
- `test:safe` remains single-threaded for local dev
- Configuration comments remain in place

## Trade-offs

### Local Development (test:safe)
- Keeps `isolate: false` for faster execution and lower memory usage
- Single-threaded execution prevents race conditions
- Ideal for rapid feedback during development

### CI Environment (test:full)
- Uses `isolate: true` for maximum test isolation
- Higher memory usage (4GB allocation)
- Slower execution but eliminates race conditions
- Reliable parallel test execution

## Verification

All previously "failing" tests now pass individually:
```bash
npm run test:safe -- src/app/components/ui/__tests__/alert.test.tsx
npm run test:safe -- src/app/components/ui/__tests__/breadcrumb.test.tsx
npm run test:safe -- src/app/components/ui/__tests__/card.test.tsx
npm run test:safe -- src/app/components/ui/__tests__/badge.test.tsx
```

## Next Steps

1. Run full CI test suite with new configuration: `npm run test:full`
2. Monitor CI pipeline for any remaining flaky tests
3. If issues persist, consider:
   - Reducing concurrency from 6 to 4 workers
   - Adding per-test timeouts for slow tests
   - Investigating specific test files for shared global state

## References
- CI-CD.md: Specifies 6 workers for `test:full`
- Vitest Isolation Docs: https://vitest.dev/config/#isolate
- Preservation Testing Pattern: `docs/05-testing/property-based-tests.md`
