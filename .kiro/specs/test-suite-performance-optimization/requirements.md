# Test Suite Performance Optimization Requirements

## Problem Statement

The full test suite (`npm run test:safe`) takes approximately 2-3 minutes to complete with 189 test files. While this is acceptable, there are opportunities to improve speed for both local development and CI environments without sacrificing test reliability.

## Current Performance Baseline

- **Test Files**: 189 files
- **Current Duration**: 120-180 seconds (2-3 minutes)
- **Local Config**: Single-threaded, maxConcurrency=1 (ultra-conservative)
- **CI Config**: 4 workers, maxConcurrency=4
- **Target**: Reduce to 60-90 seconds (50% improvement)

## Optimization Goals

### 1. Faster CI Execution (Primary Goal)
- Increase parallelism from 4 to 8 workers for CI
- Enable better resource utilization on GitHub Actions runners
- Target: 60-90 seconds for full suite in CI

### 2. Smarter Test Categorization (Secondary Goal)
- Identify slow tests and fast tests
- Run fast tests first for quicker feedback
- Group related tests for better cache utilization

### 3. Improved Caching (Tertiary Goal)
- Optimize Vitest cache configuration
- Enable dependency caching
- Reduce redundant module loading

### 4. Optional: Test Sharding for CI (Future Enhancement)
- Split tests across multiple CI jobs
- Run test categories in parallel
- Aggregate results at the end

## Requirements

### R1: Maintain Test Reliability
**Priority**: Critical
- All optimizations MUST NOT reduce test reliability
- Tests must produce identical results before and after optimization
- No flaky tests introduced by parallelism changes

### R2: Preserve Local Development Experience
**Priority**: High
- `test:safe` remains single-threaded for MacBook-friendly execution
- No changes to local resource limits
- Developers can still run tests without system slowdown

### R3: Optimize CI Performance
**Priority**: High
- Increase `test:full` parallelism to 8 workers
- Enable better thread pool configuration
- Target 50% speed improvement (120s → 60s)

### R4: Implement Test Sequencing
**Priority**: Medium
- Fast tests run before slow tests
- Critical tests run first for quick feedback
- Property-based tests run last (they're typically slower)

### R5: Optimize Test Setup
**Priority**: Medium
- Minimize setup file overhead
- Lazy-load heavy mocks
- Reduce global setup time

### R6: Enable Test Sharding (Optional)
**Priority**: Low
- Split tests across multiple CI jobs
- Run test categories in parallel
- Reduce total CI time to under 60 seconds

## Success Criteria

1. **Speed Improvement**: CI test execution reduced by 40-50%
2. **Reliability**: All tests pass with same results as before
3. **Resource Usage**: No increase in memory consumption
4. **Developer Experience**: Local testing remains fast and responsive
5. **CI Stability**: No increase in flaky tests or timeouts

## Non-Goals

- Reducing test coverage
- Skipping slow tests
- Removing property-based tests
- Changing test isolation guarantees
- Modifying test timeout limits

## Constraints

- Must work on GitHub Actions runners (2-4 cores)
- Must work on MacBook Pro (local development)
- Must maintain compatibility with Vitest 3.2.4
- Must preserve all existing test functionality
- Must not break preservation tests
