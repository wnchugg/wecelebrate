# Test Watch Mode Resource Fix Bugfix Design

## Overview

This bugfix addresses a critical resource consumption issue where Vitest test commands run indefinitely in watch mode instead of exiting after completion, causing excessive CPU and memory usage on local development machines (MacBook Pro). The fix involves two key changes:

1. **Ensure explicit `--run` flag usage**: Modify all test commands in package.json to include the `--run` flag, ensuring tests exit after completion unless explicitly running in watch mode
2. **Adjust resource limits for local development**: Reduce `maxConcurrency` and `maxWorkers` from 4 to 2 in vitest.config.ts for the default configuration, while maintaining higher limits for CI via command-line overrides

The strategy is minimal and surgical: change default behavior to be resource-conservative for local development while preserving CI performance through explicit overrides in the `test:full` command.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when test commands run without the `--run` flag, causing watch mode to activate
- **Property (P)**: The desired behavior when tests are executed - tests should run once and exit, releasing all resources
- **Preservation**: Existing watch mode commands, CI performance, and test execution behavior that must remain unchanged
- **Watch Mode**: Vitest's continuous execution mode that monitors file changes and re-runs tests automatically
- **`--run` flag**: Vitest CLI flag that forces single-execution mode, preventing watch mode activation
- **maxConcurrency**: Vitest configuration limiting how many test files can run simultaneously
- **maxWorkers**: Vitest configuration limiting how many worker processes can be spawned
- **test:safe**: npm script for local development testing with conservative resource limits
- **test:full**: npm script for CI testing with higher resource limits for faster execution

## Bug Details

### Fault Condition

The bug manifests when a developer runs test commands that do not explicitly include the `--run` flag. Vitest's default behavior is to enter watch mode when `--run` is absent, causing the test process to run indefinitely and consume excessive CPU and memory resources. Additionally, the current default resource limits (`maxConcurrency: 4`, `maxWorkers: 4`) are too aggressive for local development on a MacBook Pro, exacerbating the performance impact.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type TestCommandExecution
  OUTPUT: boolean
  
  RETURN (input.command does NOT contain "--run" flag)
         AND (input.environment == "local_development")
         AND (vitest enters watch mode)
         AND (process does NOT exit after test completion)
END FUNCTION
```

### Examples

- **Example 1**: Running `vitest src/app/components/ui/__tests__/` without `--run` flag causes watch mode to activate, consuming 200%+ CPU indefinitely
- **Example 2**: Running `npm run test:ui-components` (currently defined as `vitest --run src/app/components/ui/__tests__/`) correctly exits after completion
- **Example 3**: Running `npm run test:watch` (currently defined as `vitest --maxConcurrency=2`) correctly stays in watch mode as intended
- **Edge case**: Running `npm test` correctly shows warning message and exits without running tests (safety mechanism)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Explicit watch mode commands (`test:watch`, `test:button:watch`, `test:ui-components:watch`, `test:integration:watch`) must continue to run in watch mode
- CI testing via `test:full` must continue to use higher resource limits (maxConcurrency: 4, maxWorkers: 4) for faster execution
- The `npm test` safety warning must continue to prevent accidental test execution
- Coverage generation must continue to work correctly
- Test execution behavior (test discovery, filtering, reporting) must remain unchanged

**Scope:**
All test commands that are NOT explicitly watch mode commands should exit after completion. This includes:
- `test:safe`, `test:full` - Primary test execution commands
- `test:coverage`, `test:changed`, `test:related` - Specialized test commands
- All category-specific test commands (`test:ui-components`, `test:integration`, `test:contexts`, etc.)
- Individual test file commands (`test:button`, `test:bulkimport`, `test:dashboard`, etc.)

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

1. **Missing `--run` Flag in Some Commands**: While most test commands in package.json already include `--run`, any command that doesn't will trigger watch mode by default. The current configuration appears correct, but the issue may arise from:
   - Direct vitest invocations outside npm scripts
   - Commands that were recently added without `--run`
   - Developer confusion about which commands exit vs. watch

2. **Aggressive Default Resource Limits**: The vitest.config.ts file sets `maxConcurrency: 4` and `maxWorkers: 4` as defaults, which are appropriate for CI but too aggressive for local development on a MacBook Pro, causing:
   - Excessive CPU usage (4 workers × multiple threads per worker)
   - Memory pressure from running 4 test files concurrently
   - System slowdown affecting other applications

3. **Lack of Environment-Specific Configuration**: The current configuration doesn't differentiate between local development and CI environments, applying the same aggressive limits everywhere.

4. **Watch Mode as Default Behavior**: Vitest's design philosophy is to default to watch mode for developer convenience, but this conflicts with resource-constrained local environments and the expectation that test commands should exit after completion.

## Correctness Properties

Property 1: Fault Condition - Tests Exit After Completion

_For any_ test command execution where the command is intended for single-run execution (not explicitly a watch mode command), the fixed test configuration SHALL ensure the `--run` flag is present, causing the test process to execute once and exit immediately after completion, releasing all CPU and memory resources.

**Validates: Requirements 2.2, 2.4**

Property 2: Preservation - Watch Mode Commands Continue Working

_For any_ test command execution where the command is explicitly a watch mode command (e.g., `test:watch`, `test:button:watch`, `test:ui-components:watch`, `test:integration:watch`), the fixed configuration SHALL produce exactly the same behavior as the original configuration, preserving continuous execution and file watching functionality.

**Validates: Requirements 3.2**

Property 3: Preservation - CI Performance Maintained

_For any_ test execution in CI environment using the `test:full` command, the fixed configuration SHALL continue to use higher resource limits (maxConcurrency: 4, maxWorkers: 4) through command-line overrides, preserving fast test execution performance.

**Validates: Requirements 3.1**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `vitest.config.ts`

**Changes**:
1. **Reduce Default Resource Limits**: Change `maxConcurrency` from 4 to 2 and `maxWorkers` from 4 to 2 in the default configuration
   - This makes the default configuration safe for local development
   - CI can override these limits via command-line flags (already done in `test:full`)
   - Reduces CPU and memory pressure on MacBook Pro

2. **Update poolOptions.forks.maxForks**: Change from 4 to 2 to match maxWorkers
   - Ensures consistency between worker limits and fork pool limits
   - Prevents fork pool from spawning more processes than maxWorkers allows

**File**: `package.json`

**Verification**:
1. **Audit All Test Commands**: Review all test-related npm scripts to ensure `--run` flag is present for non-watch commands
   - Current audit shows all non-watch commands already have `--run` ✓
   - Watch mode commands correctly omit `--run` ✓
   - No changes needed to package.json scripts

2. **Verify Command-Line Overrides**: Confirm that `test:full` correctly overrides resource limits
   - Current: `vitest --run --maxConcurrency=4 --maxWorkers=4` ✓
   - This will override the new default limits of 2 for CI execution

### Specific Implementation

**vitest.config.ts changes:**
```typescript
// Before:
maxConcurrency: 4,        // Max 4 test files running at once
poolOptions: {
  forks: {
    maxForks: 4,          // Max 4 worker processes
    // ...
  }
},
maxWorkers: 4,            // Max 4 workers

// After:
maxConcurrency: 1,        // Max 1 test file at a time (prevents CPU overload)
poolOptions: {
  threads: {
    maxThreads: 1,        // Single worker thread (minimal resource usage)
    minThreads: 1,        // Keep at least 1 worker
    singleThread: true,   // Force single-threaded execution
  }
}
    maxForks: 2,          // Max 2 worker processes (matches maxWorkers)
    // ...
  }
},
maxWorkers: 2,            // Max 2 workers (safe for local dev)
```

**Rationale:**
- Changing defaults to 2 makes local development safe by default
- CI performance is preserved through `test:full` command-line overrides
- No changes needed to package.json since all commands already have correct flags
- Minimal, surgical change with clear separation of concerns

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code (tests running indefinitely in watch mode with high resource usage), then verify the fix works correctly (tests exit after completion with lower resource usage) and preserves existing behavior (watch mode commands still work, CI performance maintained).

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that tests run indefinitely in watch mode and consume excessive resources with current configuration.

**Test Plan**: Manually execute test commands and observe process behavior, CPU usage, and memory consumption. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Watch Mode Activation Test**: Run `vitest src/app/components/ui/__tests__/button.test.tsx` (without --run) and observe that process stays running after tests complete (will demonstrate bug on unfixed code)
2. **Resource Usage Test**: Monitor CPU and memory usage while running tests with `maxConcurrency: 4` and `maxWorkers: 4` on MacBook Pro (will show excessive resource consumption on unfixed code)
3. **Process Exit Test**: Run `npm run test:ui-components` and verify process exits after completion (should work correctly even on unfixed code due to --run flag)
4. **CI Performance Test**: Run `npm run test:full` and measure execution time (baseline for preservation checking)

**Expected Counterexamples**:
- Tests without `--run` flag stay in watch mode indefinitely
- CPU usage exceeds 200% with 4 workers on MacBook Pro
- System becomes sluggish during test execution with aggressive limits
- Possible causes: missing `--run` flag, aggressive default resource limits, no environment differentiation

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (test commands intended for single execution), the fixed configuration produces the expected behavior (tests exit after completion with reasonable resource usage).

**Pseudocode:**
```
FOR ALL testCommand WHERE isBugCondition(testCommand) DO
  result := executeTest_fixed(testCommand)
  ASSERT result.processExited == true
  ASSERT result.executionTime < baseline * 1.5
  ASSERT result.cpuUsage < 150%
  ASSERT result.memoryUsage < 2GB
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (watch mode commands, CI commands), the fixed configuration produces the same result as the original configuration.

**Pseudocode:**
```
FOR ALL testCommand WHERE NOT isBugCondition(testCommand) DO
  ASSERT executeTest_original(testCommand).behavior == executeTest_fixed(testCommand).behavior
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test command variations automatically
- It catches edge cases that manual testing might miss
- It provides strong guarantees that behavior is unchanged for watch mode and CI commands

**Test Plan**: Observe behavior on UNFIXED code first for watch mode commands and CI execution, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Watch Mode Preservation**: Verify `test:watch`, `test:button:watch`, `test:ui-components:watch`, `test:integration:watch` continue to run in watch mode after fix
2. **CI Performance Preservation**: Verify `test:full` continues to use maxConcurrency=4 and maxWorkers=4, maintaining fast execution time
3. **Coverage Preservation**: Verify `test:coverage` continues to generate accurate coverage reports
4. **Safety Warning Preservation**: Verify `npm test` continues to show warning message and exit without running tests

### Unit Tests

- Test that vitest.config.ts exports correct default values (maxConcurrency: 1, single-threaded execution)
- Test that command-line overrides work correctly (--maxConcurrency=4 --poolOptions.threads.maxThreads=4)
- Test that all non-watch test commands include --run flag
- Test that watch mode commands correctly omit --run flag

### Property-Based Tests

- Generate random test command variations and verify single-run commands exit after completion
- Generate random resource limit configurations and verify they don't exceed safe thresholds for local development
- Test that watch mode commands continue working across many file change scenarios

### Integration Tests

- Test full test execution flow with new resource limits on local machine
- Test CI execution flow with overridden resource limits
- Test switching between watch mode and single-run mode
- Test that resource usage stays within acceptable bounds during test execution
