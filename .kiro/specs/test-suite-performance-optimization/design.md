# Test Suite Performance Optimization Design

## Overview

This optimization improves test suite execution speed by 40-50% through increased parallelism, smarter test sequencing, and better resource utilization. The approach is conservative and focuses on CI performance while preserving the local development experience.

## Optimization Strategies

### Strategy 1: Increase CI Parallelism (Immediate Win)

**Current State**:
```json
"test:full": "NODE_OPTIONS='--max-old-space-size=4096' vitest --run --maxConcurrency=4 --poolOptions.threads.maxThreads=4 --poolOptions.threads.singleThread=false"
```

**Optimized State**:
```json
"test:full": "NODE_OPTIONS='--max-old-space-size=4096' vitest --run --maxConcurrency=8 --poolOptions.threads.maxThreads=8 --poolOptions.threads.singleThread=false --poolOptions.threads.isolate=false"
```

**Rationale**:
- GitHub Actions runners have 2-4 cores
- With 189 test files, 8 workers provides better throughput
- `isolate=false` reduces memory overhead while maintaining test isolation
- Expected improvement: 30-40% faster

### Strategy 2: Test Sequencing (Medium Win)

**Implementation**:
```typescript
// In vitest.config.ts
test: {
  sequence: {
    shuffle: false,           // Disable random shuffling
    concurrent: true,         // Allow concurrent execution
    setupFiles: 'list',       // Run setup files in order
    hooks: 'stack',           // Run hooks in stack order
  },
}
```

**Rationale**:
- Predictable test order improves cache hit rates
- Concurrent execution within files speeds up property-based tests
- Expected improvement: 10-15% faster

### Strategy 3: Optimize Thread Pool (Small Win)

**Implementation**:
```typescript
// In vitest.config.ts
poolOptions: {
  threads: {
    maxThreads: 1,            // Local: 1 thread
    minThreads: 1,            // Keep worker alive
    singleThread: true,       // Force single-threaded locally
    isolate: false,           // Share context (faster)
    useAtomics: true,         // Enable atomic operations (faster)
  }
}
```

**Rationale**:
- `useAtomics: true` enables faster inter-thread communication
- `isolate: false` reduces memory copying overhead
- Expected improvement: 5-10% faster

### Strategy 4: Improve Caching (Small Win)

**Implementation**:
```typescript
// In vitest.config.ts
test: {
  cache: {
    dir: '.vitest/cache'
  },
  deps: {
    optimizer: {
      web: {
        enabled: true,        // Enable web dependency optimization
      },
      ssr: {
        enabled: true,        // Enable SSR dependency optimization
      },
    },
  },
}
```

**Rationale**:
- Better dependency optimization reduces module loading time
- Vitest cache improves re-run performance
- Expected improvement: 5-10% faster on subsequent runs

### Strategy 5: Test Categorization Script (Optional Enhancement)

Create a script to identify slow tests and run them last:

```javascript
// scripts/test-with-sequencing.js
const { execSync } = require('child_process');

// Fast tests (run first for quick feedback)
const fastCategories = [
  'test:utils',
  'test:type-tests',
  'test:hooks',
];

// Medium tests
const mediumCategories = [
  'test:ui-components',
  'test:app-components',
  'test:contexts',
];

// Slow tests (run last)
const slowCategories = [
  'test:integration',
  'test:pages-user',
  'test:pages-admin',
  'test:admin-components',
];

// Run in sequence: fast → medium → slow
[...fastCategories, ...mediumCategories, ...slowCategories].forEach(category => {
  console.log(`Running ${category}...`);
  execSync(`npm run ${category}`, { stdio: 'inherit' });
});
```

**Rationale**:
- Developers get feedback from fast tests quickly
- Slow tests don't block fast test results
- Expected improvement: Better perceived performance

## Implementation Plan

### Phase 1: Low-Risk Optimizations (Immediate)

1. **Update `test:full` command** in package.json:
   - Increase workers from 4 to 8
   - Add `--poolOptions.threads.isolate=false`
   - Add `--poolOptions.threads.useAtomics=true`

2. **Add test sequencing** to vitest.config.ts:
   - Set `sequence.shuffle = false`
   - Set `sequence.concurrent = true`

3. **Enable dependency optimization** in vitest.config.ts:
   - Add `deps.optimizer.web.enabled = true`
   - Add `deps.optimizer.ssr.enabled = true`

### Phase 2: Medium-Risk Optimizations (After Testing)

4. **Add `useAtomics` to thread pool** in vitest.config.ts:
   - Set `poolOptions.threads.useAtomics = true`

5. **Create test sequencing script** (optional):
   - Add `scripts/test-with-sequencing.js`
   - Add `test:sequenced` npm script

### Phase 3: Advanced Optimizations (Future)

6. **Implement test sharding** for CI:
   - Split tests across multiple GitHub Actions jobs
   - Use matrix strategy to run categories in parallel
   - Aggregate results with a final job

## Expected Performance Improvements

| Optimization | Expected Improvement | Risk Level |
|--------------|---------------------|------------|
| Increase CI parallelism (4→8) | 30-40% | Low |
| Test sequencing | 10-15% | Low |
| Thread pool optimization | 5-10% | Low |
| Dependency optimization | 5-10% | Low |
| Test categorization script | Perceived improvement | Low |
| Test sharding (future) | 50-60% | Medium |

**Total Expected Improvement**: 40-50% faster (120s → 60-70s)

## Risk Mitigation

### Risk 1: Increased Parallelism Causes Flaky Tests
**Mitigation**: 
- Run preservation tests to verify no behavior changes
- Monitor CI for increased failure rates
- Rollback if flakiness increases

### Risk 2: Memory Pressure from More Workers
**Mitigation**:
- Set `NODE_OPTIONS='--max-old-space-size=4096'` (already done)
- Monitor memory usage in CI
- Reduce workers if OOM errors occur

### Risk 3: Test Isolation Issues
**Mitigation**:
- Keep `isolate: false` only for thread pool, not test level
- Maintain `clearMocks`, `restoreMocks`, `mockReset` in config
- Run full test suite multiple times to verify consistency

## Validation Strategy

### Before Optimization
1. Run `npm run test:full` 3 times and record duration
2. Verify all tests pass consistently
3. Document baseline: ~120-180 seconds

### After Optimization
1. Run `npm run test:full` 3 times and record duration
2. Verify all tests still pass consistently
3. Compare results: expect 60-90 seconds (40-50% improvement)
4. Run preservation tests to verify no behavior changes

### Success Criteria
- ✅ All tests pass with same results
- ✅ Duration reduced by 40-50%
- ✅ No increase in flaky tests
- ✅ No memory issues in CI
- ✅ Preservation tests pass

## Rollback Plan

If optimizations cause issues:

1. **Immediate Rollback**: Revert package.json changes
   ```bash
   git checkout HEAD -- package.json
   npm run test:full
   ```

2. **Partial Rollback**: Reduce workers incrementally
   ```json
   "test:full": "... --maxConcurrency=6 --poolOptions.threads.maxThreads=6"
   ```

3. **Full Rollback**: Revert all vitest.config.ts changes
   ```bash
   git checkout HEAD -- vitest.config.ts package.json
   ```

## Monitoring

After deployment, monitor:
- CI test duration (should be 60-90s)
- CI failure rate (should remain constant)
- Memory usage (should stay under 4GB)
- Flaky test reports (should not increase)

## Future Enhancements

1. **Test Sharding**: Split tests across multiple CI jobs
2. **Parallel Test Categories**: Run categories concurrently
3. **Smart Test Selection**: Only run tests affected by changes
4. **Test Result Caching**: Cache passing test results
5. **Distributed Testing**: Use multiple machines for testing
