# Test Watch Mode Resource Fix - Preservation Baseline

## Observation Date
2024-01-XX (Unfixed Code - Before Implementing Fix)

## Purpose
This document captures the baseline behavior of watch mode commands, CI performance, safety warnings, and coverage generation on UNFIXED code. These behaviors MUST be preserved after implementing the fix.

## Preservation Requirements

### 3.1: CI Testing Performance
**Requirement**: CI testing via `test:full` must continue to use higher resource limits (maxConcurrency: 4, maxWorkers: 4)

**Current Configuration**:
```bash
test:full: vitest --run --maxConcurrency=4 --maxWorkers=4
```

**Observed Behavior**:
- Command includes explicit `--maxConcurrency=4` and `--maxWorkers=4` overrides
- These overrides take precedence over vitest.config.ts defaults
- Tests execute with 4 concurrent test files and 4 worker processes
- Fast execution time suitable for CI environment
- Process exits after completion due to `--run` flag

**Expected After Fix**:
- Same behavior - command-line overrides will continue to work
- CI performance maintained even after changing defaults to 2
- No regression in execution time

### 3.2: Explicit Watch Mode Commands
**Requirement**: Explicit watch mode commands must continue to run in watch mode

**Watch Mode Commands**:
1. `test:watch` - `vitest --maxConcurrency=2`
2. `test:button:watch` - `vitest src/app/components/ui/__tests__/button.test.tsx`
3. `test:ui-components:watch` - `vitest src/app/components/ui/__tests__/`
4. `test:integration:watch` - `vitest src/app/__tests__/integration/`

**Observed Behavior**:
- All watch mode commands correctly omit `--run` flag
- Vitest enters watch mode by default when `--run` is absent
- Process continues running after tests complete
- File changes trigger automatic re-execution
- User can interact with watch mode (press keys for actions)
- Process only exits when user manually terminates (Ctrl+C)

**Expected After Fix**:
- Identical behavior - watch mode commands continue to work
- Process stays running and watches for file changes
- No change to watch mode functionality

### 3.3: Test Scripts with --run Flag
**Requirement**: Test scripts with `--run` flag must continue to exit after completion

**Commands with --run Flag** (21 commands):
- `test:safe` - `vitest --run --maxConcurrency=2 --maxWorkers=2`
- `test:full` - `vitest --run --maxConcurrency=4 --maxWorkers=4`
- `test:coverage` - `vitest --run --coverage --maxConcurrency=2`
- `test:changed` - `vitest --run --changed --maxConcurrency=2`
- `test:related` - `vitest --run --related --maxConcurrency=2`
- `test:button` - `vitest --run src/app/components/ui/__tests__/button.test.tsx`
- `test:ui-components` - `vitest --run src/app/components/ui/__tests__/`
- `test:integration` - `vitest --run src/app/__tests__/integration/`
- `test:type-tests` - `vitest --run src/app/types/__tests__/ src/types/__tests__/`
- `test:utils` - `vitest --run src/app/utils/__tests__/`
- `test:app-components` - `vitest --run src/app/components/__tests__/`
- `test:admin-components` - `vitest --run src/app/components/admin/__tests__/`
- `test:contexts` - `vitest --run src/app/context/__tests__/`
- `test:services` - `vitest --run src/app/services/__tests__/ src/services/__tests__/`
- `test:hooks` - `vitest --run src/app/hooks/__tests__/`
- `test:pages-user` - `vitest --run src/app/pages/__tests__/`
- `test:pages-admin` - `vitest --run src/app/pages/admin/__tests__/`
- `test:backend` - `vitest --run supabase/functions/server/tests/`
- `test:bulkimport` - `vitest --run src/app/utils/__tests__/bulkImport.test.tsx`
- `test:dashboard` - `vitest --run src/app/pages/admin/__tests__/Dashboard.test.tsx`
- `test:dashboard-integration` - `vitest --run src/app/pages/admin/__tests__/Dashboard.integration.test.tsx`

**Observed Behavior**:
- All commands include `--run` flag
- Tests execute once and process exits immediately after completion
- No watch mode activation
- Resources released after test completion
- Exit code reflects test results (0 for pass, non-zero for fail)

**Expected After Fix**:
- Identical behavior - all commands continue to exit after completion
- No change to single-run execution mode

### 3.4: Coverage Reports
**Requirement**: Coverage reports must continue to produce accurate coverage data

**Coverage Command**:
```bash
test:coverage: vitest --run --coverage --maxConcurrency=2
```

**Observed Behavior**:
- Coverage provider: v8
- Reporters: text, json, html
- Coverage data collected during test execution
- Reports generated in `coverage/` directory
- Accurate line, branch, function, and statement coverage
- Excludes configured paths (node_modules, test files, etc.)

**Expected After Fix**:
- Identical coverage data accuracy
- Same report formats and output
- No change to coverage collection or reporting

### 3.5: Test Scripts via npm
**Requirement**: Test scripts executed via npm must continue to respect flags and options in package.json

**Safety Warning Command**:
```bash
npm test
```

**Observed Behavior**:
- Displays warning message: "⚠️  Use test:safe for local testing or test:full for CI"
- Exits with code 1 (prevents accidental test execution)
- Does NOT run any tests
- Safety mechanism to prevent unintended watch mode or resource usage

**Expected After Fix**:
- Identical behavior - warning message still displays
- No tests executed
- Exit code 1 maintained
- Safety mechanism preserved

## Configuration Analysis

### Current vitest.config.ts (Unfixed)
```typescript
maxConcurrency: 4,        // Max 4 test files running at once
poolOptions: {
  forks: {
    maxForks: 4,          // Max 4 worker processes
    minForks: 1,
    singleFork: false,
  }
},
maxWorkers: 4,            // Max 4 workers
minWorkers: 1,
```

### Expected vitest.config.ts (After Fix)
```typescript
maxConcurrency: 2,        // Max 2 test files running at once (safe for local dev)
poolOptions: {
  forks: {
    maxForks: 2,          // Max 2 worker processes (matches maxWorkers)
    minForks: 1,
    singleFork: false,
  }
},
maxWorkers: 2,            // Max 2 workers (safe for local dev)
minWorkers: 1,
```

### Command-Line Override Behavior
- Command-line flags take precedence over config file defaults
- `test:full` uses `--maxConcurrency=4 --maxWorkers=4` overrides
- After fix, these overrides will continue to work
- CI performance preserved through explicit overrides

## Preservation Test Strategy

### Property-Based Testing Approach
Property-based tests will generate many test cases to verify:
1. Watch mode commands continue to omit `--run` flag
2. CI command continues to have proper overrides
3. Safety warning command continues to prevent test execution
4. All non-watch commands continue to have `--run` flag

### Test Categories
1. **Watch Mode Preservation**: Verify watch commands stay in watch mode
2. **CI Performance Preservation**: Verify test:full uses maxConcurrency=4, maxWorkers=4
3. **Safety Warning Preservation**: Verify npm test shows warning and exits
4. **Coverage Preservation**: Verify coverage generation works correctly

## Conclusion

All preservation requirements are currently satisfied in the unfixed code:
- ✅ CI testing uses higher resource limits via command-line overrides
- ✅ Watch mode commands correctly omit `--run` flag
- ✅ Non-watch commands correctly include `--run` flag
- ✅ Coverage generation works correctly
- ✅ Safety warning prevents accidental test execution

After implementing the fix (changing defaults to 2), these behaviors MUST remain unchanged.
