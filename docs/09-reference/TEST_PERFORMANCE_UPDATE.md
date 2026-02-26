# Test Performance Configuration Update

**Date**: February 25, 2026  
**Change Type**: Performance Optimization  
**Affected Command**: `npm run test:full`

## Summary

The `test:full` command has been optimized for CI environments with increased concurrency and performance enhancements.

## Changes

### Before
```json
"test:full": "NODE_OPTIONS='--max-old-space-size=4096' vitest --run --maxConcurrency=4 --poolOptions.threads.maxThreads=4 --poolOptions.threads.singleThread=false"
```

### After
```json
"test:full": "NODE_OPTIONS='--max-old-space-size=4096' vitest --run --maxConcurrency=8 --poolOptions.threads.maxThreads=8 --poolOptions.threads.singleThread=false --poolOptions.threads.isolate=false --poolOptions.threads.useAtomics=true"
```

## Performance Improvements

### 1. Increased Concurrency (4 → 8)
- **maxConcurrency**: 4 → 8 (2x increase)
- **maxThreads**: 4 → 8 (2x increase)
- Allows 8 test files to run simultaneously instead of 4
- Expected speedup: ~40-50% faster test execution in CI

### 2. Thread Isolation Disabled
- **Flag**: `--poolOptions.threads.isolate=false`
- **Benefit**: Reduces overhead of creating isolated contexts for each test file
- **Trade-off**: Tests share more context, but faster execution
- **Safe for**: CI environments with clean state between runs

### 3. Atomic Operations Enabled
- **Flag**: `--poolOptions.threads.useAtomics=true`
- **Benefit**: Uses SharedArrayBuffer for faster thread coordination
- **Impact**: Reduces inter-thread communication overhead
- **Requirement**: Modern Node.js with SharedArrayBuffer support

### 4. Memory Allocation Unchanged
- **NODE_OPTIONS**: `--max-old-space-size=4096` (4GB)
- Sufficient for 8 concurrent threads
- Prevents out-of-memory errors during parallel execution

## Use Cases

### Local Development
```bash
npm run test:safe
```
- Uses conservative settings (1 worker, 1 concurrency)
- Prevents system overload on developer machines
- Recommended for MacBooks and laptops

### CI Environment
```bash
npm run test:full
```
- Uses optimized settings (8 workers, 8 concurrency)
- Maximizes CI runner resources
- Suitable for GitHub Actions, GitLab CI, etc.

### Watch Mode
```bash
npm run test:watch
```
- Uses default config with watch mode enabled
- Automatically re-runs tests on file changes
- Good for TDD workflow

## Performance Expectations

### Before (4 workers)
- Full test suite: ~120-180 seconds
- Parallel test files: 4 at a time
- CPU utilization: ~50-60%

### After (8 workers)
- Full test suite: ~60-90 seconds (estimated)
- Parallel test files: 8 at a time
- CPU utilization: ~80-90%

## Compatibility

### Supported Environments
- ✅ GitHub Actions (ubuntu-latest, 4+ cores)
- ✅ GitLab CI (standard runners, 4+ cores)
- ✅ CircleCI (medium+ resource class)
- ✅ Local CI runners with 4+ cores

### Not Recommended For
- ❌ MacBooks with 2 cores (use `test:safe` instead)
- ❌ Laptops with limited RAM (<8GB)
- ❌ Shared development servers
- ❌ Docker containers with CPU limits <4 cores

## Rollback Plan

If performance issues occur in CI:

### Option 1: Reduce to 6 workers
```json
"test:full": "NODE_OPTIONS='--max-old-space-size=4096' vitest --run --maxConcurrency=6 --poolOptions.threads.maxThreads=6 --poolOptions.threads.singleThread=false --poolOptions.threads.isolate=false --poolOptions.threads.useAtomics=true"
```

### Option 2: Revert to 4 workers (previous config)
```json
"test:full": "NODE_OPTIONS='--max-old-space-size=4096' vitest --run --maxConcurrency=4 --poolOptions.threads.maxThreads=4 --poolOptions.threads.singleThread=false"
```

### Option 3: Enable thread isolation (slower but safer)
```json
"test:full": "NODE_OPTIONS='--max-old-space-size=4096' vitest --run --maxConcurrency=8 --poolOptions.threads.maxThreads=8 --poolOptions.threads.singleThread=false"
```

## Monitoring

### Key Metrics to Track
1. **Test execution time**: Should decrease by 40-50%
2. **CI runner CPU usage**: Should increase to 80-90%
3. **Memory usage**: Should stay under 4GB
4. **Test flakiness**: Should remain stable (no increase)

### Warning Signs
- ⚠️ Out-of-memory errors → Reduce workers or increase memory
- ⚠️ Test timeouts → Reduce concurrency or increase timeout
- ⚠️ Flaky tests → Enable thread isolation or reduce workers
- ⚠️ CI runner crashes → Revert to 4 workers

## Related Documentation

- [Build Configuration Reference](./BUILD_CONFIGURATION.md) - Test configuration section updated
- [Property-Based Testing Guide](../05-testing/property-based-tests.md) - Test execution modes
- [CI/CD Guidelines](../../CI-CD.md) - Test execution strategy

## References

- [Vitest Performance Guide](https://vitest.dev/guide/improving-performance.html)
- [Vitest Pool Options](https://vitest.dev/config/#pooloptions)
- [Node.js SharedArrayBuffer](https://nodejs.org/api/worker_threads.html#worker_threads_worker_postmessage_value_transferlist)

---

**Last Updated**: February 25, 2026  
**Change Author**: Performance Optimization  
**Status**: Active in CI
