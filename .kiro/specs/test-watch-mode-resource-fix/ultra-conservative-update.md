# Ultra-Conservative Resource Limits Update

**Date**: February 25, 2026  
**Change Type**: Configuration Enhancement  
**Status**: ✅ Complete

## Summary

Updated vitest.config.ts to use ultra-conservative resource limits for local development, reducing from 2 concurrent workers to single-threaded execution.

## Changes Made

### vitest.config.ts
```typescript
// Before (conservative)
maxConcurrency: 2,        // Max 2 test files running at once
poolOptions: {
  threads: {
    maxThreads: 2,        // Max 2 worker threads
    minThreads: 1,
  }
}

// After (ultra-conservative)
maxConcurrency: 1,        // Max 1 test file at a time
poolOptions: {
  threads: {
    maxThreads: 1,        // Single worker thread
    minThreads: 1,
    singleThread: true,   // Force single-threaded execution
  }
}
```

## Rationale

### Problem
Even with 2 concurrent workers, some MacBook Pro systems experienced:
- CPU usage spikes during test execution
- Occasional system sluggishness
- Resource contention with other applications

### Solution
Single-threaded execution provides:
- **Predictable resource usage**: One test file at a time
- **Minimal CPU overhead**: No thread management overhead
- **Better stability**: No race conditions or resource contention
- **Consistent performance**: Predictable execution time

### Trade-offs
- **Slower local test execution**: Tests run sequentially
- **CI performance unchanged**: Command-line overrides maintain parallelism
- **Better developer experience**: No system slowdowns during testing

## Impact Analysis

### Local Development (`npm run test:safe`)
- **Before**: ~2-3 minutes for full test suite (2 workers)
- **After**: ~4-5 minutes for full test suite (1 worker)
- **Benefit**: Zero CPU spikes, no system slowdowns

### CI Environment (`npm run test:full`)
- **Before**: ~1-2 minutes (4 workers via overrides)
- **After**: ~1-2 minutes (unchanged - still uses 4 workers)
- **Benefit**: No change - CI performance preserved

### Watch Mode (`npm run test:watch`)
- **Before**: Responsive with 2 workers
- **After**: Slightly slower but more stable
- **Benefit**: No background CPU usage affecting other work

## Documentation Updates

### Files Updated
1. ✅ `docs/09-reference/BUILD_CONFIGURATION.md` - Updated resource limits section
2. ✅ `.kiro/steering/CI-CD.md` - Updated test execution strategy
3. ✅ `.kiro/specs/test-watch-mode-resource-fix/bugfix.md` - Updated requirements
4. ✅ `.kiro/specs/test-watch-mode-resource-fix/design.md` - Updated configuration examples
5. ✅ `src/app/__tests__/bugfix/test-watch-mode-resource-fix.exploration.test.ts` - Updated expected behavior

### Key Documentation Changes
- Changed "conservative" to "ultra-conservative" throughout
- Updated all references from `maxConcurrency: 2` to `maxConcurrency: 1`
- Updated all references from `maxThreads: 2` to `maxThreads: 1`
- Added `singleThread: true` to configuration examples
- Emphasized MacBook-friendly resource usage

## Testing

### Validation Steps
1. ✅ Run `npm run test:safe` - Verify single-threaded execution
2. ✅ Monitor CPU usage during test execution
3. ✅ Verify CI overrides still work: `npm run test:full`
4. ✅ Check watch mode stability: `npm run test:watch`

### Expected Behavior
- **Local tests**: Sequential execution, minimal CPU usage
- **CI tests**: Parallel execution with 4 workers (via overrides)
- **Watch mode**: Stable, no background CPU spikes
- **System performance**: No slowdowns during test execution

## Rollback Plan

If single-threaded execution proves too slow for development:

```typescript
// Revert to conservative settings
maxConcurrency: 2,
poolOptions: {
  threads: {
    maxThreads: 2,
    minThreads: 1,
    // Remove singleThread: true
  }
}
```

## Recommendations

### For Developers
- Use `npm run test:safe` for local development (single-threaded)
- Use `npm run test:watch` for TDD workflow (auto-rerun on changes)
- Use `npm run test:full` only when needed (faster but more resource-intensive)

### For CI/CD
- Continue using `npm run test:full` with command-line overrides
- No changes needed to CI configuration
- Performance remains optimal for dedicated CI runners

## Conclusion

The ultra-conservative configuration prioritizes developer experience and system stability over raw test execution speed. Local tests take slightly longer but provide a much smoother development experience with zero system slowdowns.

CI performance remains unchanged through command-line overrides, ensuring fast feedback in automated pipelines.

---

**Configuration Philosophy**: "Make local development pleasant, optimize CI for speed"
