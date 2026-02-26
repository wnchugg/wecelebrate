# Test Failures Fix Bugfix Design

## Overview

The JALA 2 test suite experiences two distinct issues preventing reliable test execution: (1) test commands hang indefinitely when running collective test suites, and (2) service layer tests fail due to incomplete Supabase client mocking. This bugfix addresses both issues through targeted fixes to test scripts and mock implementations, ensuring the test suite can run reliably in both local development and CI/CD environments.

The fix approach is minimal and surgical: add the `--run` flag to test scripts to prevent watch mode hanging, and enhance Supabase mocks to properly chain the `.single()` method. These changes restore test suite functionality without modifying any production code or test logic.

## Glossary

- **Bug_Condition (C)**: The condition that triggers test failures - when running collective test commands or when service tests use `.single()` method
- **Property (P)**: The desired behavior - test suites complete execution within reasonable time and all service tests pass with proper mocking
- **Preservation**: Existing test functionality that must remain unchanged - individual test execution, passing tests, mock behavior for non-`.single()` methods
- **vitest**: The test runner used for unit and integration tests in the JALA 2 project
- **Watch Mode**: Vitest's default behavior where it monitors files and re-runs tests on changes (blocks script completion)
- **Run Mode**: Vitest's one-time execution mode (enabled with `--run` flag) that exits after test completion
- **Supabase Query Builder**: Chainable API for database queries (e.g., `from().select().eq().single()`)
- **Mock Chaining**: Pattern where mocked methods return objects with additional mockable methods
- **test:safe**: npm script for local test execution with limited concurrency (2 workers, 2 max concurrency)
- **test:full**: npm script for CI test execution with higher concurrency (4 workers, 4 max concurrency)
- **test:services**: npm script for running service layer tests only

## Bug Details

### Fault Condition

The bug manifests in two distinct scenarios:

**Scenario 1: Test Suite Timeout**
The test runner hangs indefinitely when executing collective test commands (`npm run test:safe`, `npm run test:full`, `npm run test:services`). The `vitest run` command in package.json lacks the `--run` flag, causing vitest to enter watch mode by default. In watch mode, the process never exits, waiting for file changes to trigger re-runs.

**Scenario 2: Supabase Mock Failure**
Service layer tests fail when calling Supabase query builder methods that end with `.single()`. The mock implementations properly chain methods like `from()`, `select()`, `eq()`, but fail to return a mock for `.single()`, resulting in `undefined` or method-not-found errors.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type TestExecutionContext
  OUTPUT: boolean
  
  RETURN (input.command IN ['test:safe', 'test:full', 'test:services']
         AND input.vitestConfig.watchMode == true)
         OR
         (input.testType == 'service'
         AND input.queryChain.endsWith('.single()')
         AND input.mockChain['.single()'] == undefined)
END FUNCTION
```

### Examples

**Timeout Issue:**
- Running `npm run test:safe` causes the terminal to hang after displaying test results, never returning to the command prompt
- Running `npm run test:services` executes tests but never completes, blocking CI/CD pipelines
- The process must be manually killed with Ctrl+C to regain terminal control
- Expected: Tests run once and exit with status code 0 (pass) or 1 (fail)

**Mocking Issue:**
- Test: `proxyLoginApi.test.ts` - `createProxySession` test fails with "Cannot read property 'single' of undefined"
- Test: `proxyLoginApi.test.ts` - `getCurrentProxySession` test fails when mock chain reaches `.single()`
- Test: `userApi.permissions.test.ts` - Tests calling `from().select().eq().single()` fail with mock errors
- Expected: Mock chain returns `{ data: mockData, error: null }` structure for `.single()` calls

**Edge Cases:**
- Individual test execution (e.g., `npm run test:button`) works correctly because it targets specific files
- Tests using `.select()` without `.single()` pass because those mocks are properly implemented
- Tests in watch mode work interactively but block automated execution

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Individual test file execution must continue to work (e.g., `npm run test:button`)
- All 74 currently passing service tests must continue to pass after mock enhancement
- Component tests (UI, admin, pages) must continue to pass with existing mocks
- Test configuration settings (timeout, concurrency, pool options) must remain unchanged
- Mock behavior for non-`.single()` Supabase methods must remain unchanged
- Test setup mocks for browser APIs (matchMedia, IntersectionObserver, ResizeObserver) must remain unchanged
- Property-based preservation tests (13 tests) must continue to pass
- Test isolation and cleanup behavior must remain unchanged

**Scope:**
All test execution patterns that do NOT involve collective test commands or `.single()` method calls should be completely unaffected by this fix. This includes:
- Watch mode when explicitly requested (e.g., `npm run test:watch`)
- Tests using other Supabase methods (insert, update, delete, select without single)
- E2E tests (Playwright in `e2e/` directory)
- Backend tests (Deno in `supabase/functions/server/tests/`)

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

### Root Cause 1: Missing --run Flag in Test Scripts

**Issue**: The `vitest run` command in package.json does not include the `--run` flag, despite the command name suggesting one-time execution.

**Evidence**:
- `package.json` line 23: `"test:safe": "vitest run --maxConcurrency=2 --maxWorkers=2"`
- `package.json` line 24: `"test:full": "vitest run --maxConcurrency=4 --maxWorkers=4"`
- `package.json` line 40: `"test:services": "vitest run src/app/services/__tests__/ src/services/__tests__/"`

**Why This Causes Hanging**:
- Vitest's `run` subcommand is ambiguous - it can mean "run tests" but doesn't force non-watch mode
- Without explicit `--run` flag, vitest may default to watch mode based on terminal detection
- In CI environments or when piped, vitest enters watch mode and waits indefinitely
- The process never exits, blocking automated workflows

**Confirmation**: The working test scripts like `test:watch` explicitly use `vitest` without `run`, while broken scripts use `vitest run` without `--run` flag, creating ambiguity.

### Root Cause 2: Incomplete Mock Chain for .single() Method

**Issue**: Service test mocks properly chain `from()`, `select()`, `eq()`, but fail to return a mock object with a `.single()` method.

**Evidence from proxyLoginApi.test.ts**:
```typescript
const mockFrom = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({  // ✓ This works
        data: mockSession,
        error: null,
      }),
    }),
  }),
});
```

**Why Some Tests Fail**:
- When the query chain is `from().insert().select().single()`, the mock must chain through `insert()` first
- If `insert()` mock doesn't return an object with `select()`, the chain breaks
- If `select()` mock doesn't return an object with `single()`, the chain breaks
- The mock structure must exactly match the query builder API shape

**Pattern Analysis**:
- Working: `from().select().eq().single()` - mock properly chains all methods
- Failing: `from().insert().select().single()` - `insert()` mock may not return proper chain
- Failing: `from().select().eq().gt().single()` - `gt()` mock may not return proper chain

### Root Cause 3: Inconsistent Mock Patterns Across Test Files

**Issue**: Different test files use different mocking strategies, leading to inconsistent behavior.

**Evidence**:
- `proxyLoginApi.test.ts`: Uses inline mock chains with proper `.single()` support
- `userApi.permissions.test.ts`: Uses `vi.mocked(supabase.from).mockReturnValue()` pattern
- `permissionService.test.ts`: Uses global `vi.mock()` with partial implementation

**Why This Causes Failures**:
- Global mocks in `vi.mock()` may not include `.single()` method
- Inline mocks may be overridden by global mocks
- Test-specific mocks may not properly reset between tests

## Correctness Properties

Property 1: Fault Condition - Test Suite Completion

_For any_ test execution command where the bug condition holds (collective test commands like `test:safe`, `test:full`, `test:services`), the fixed test scripts SHALL complete execution within reasonable time (under 2 minutes for full suite, under 30 seconds for service tests) and exit with appropriate status code (0 for pass, 1 for fail).

**Validates: Requirements 2.1, 2.2, 2.5**

Property 2: Fault Condition - Supabase Mock Chaining

_For any_ service test where a Supabase query chain ends with `.single()`, the fixed mock implementation SHALL return a properly structured response with `{ data: mockData, error: null }` for success cases and `{ data: null, error: mockError }` for error cases, allowing the test to execute without mock-related failures.

**Validates: Requirements 2.3, 2.4**

Property 3: Preservation - Individual Test Execution

_For any_ test execution that targets individual test files or uses watch mode explicitly, the fixed test scripts SHALL produce exactly the same behavior as the original scripts, preserving all existing functionality for targeted test execution.

**Validates: Requirements 3.1, 3.4**

Property 4: Preservation - Non-Single Query Mocks

_For any_ service test that uses Supabase query methods other than `.single()` (select, insert, update, delete, eq, etc.), the fixed mock implementation SHALL produce exactly the same behavior as the original mocks, preserving all existing test functionality.

**Validates: Requirements 3.2, 3.3, 3.6**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `package.json`

**Function**: Test scripts (lines 23-40)

**Specific Changes**:

1. **Add --run Flag to Collective Test Scripts**:
   - Change `"test:safe": "vitest run --maxConcurrency=2 --maxWorkers=2"`
   - To: `"test:safe": "vitest --run --maxConcurrency=2 --maxWorkers=2"`
   - Change `"test:full": "vitest run --maxConcurrency=4 --maxWorkers=4"`
   - To: `"test:full": "vitest --run --maxConcurrency=4 --maxWorkers=4"`
   - Change all category-specific test scripts (test:services, test:ui-components, etc.)
   - To include `--run` flag: `"test:services": "vitest --run src/app/services/__tests__/"`

2. **Verify Watch Mode Scripts Remain Unchanged**:
   - Keep `"test:watch": "vitest --maxConcurrency=2"` (no --run flag)
   - Keep `"test:ui-components:watch": "vitest src/app/components/ui/__tests__/"` (no --run flag)
   - These scripts should explicitly NOT have --run flag to enable watch mode

**File**: `src/app/services/__tests__/*.test.ts` (5 files)

**Function**: Supabase mock setup in each test file

**Specific Changes**:

3. **Enhance Mock Chain for .single() Method**:
   - Review each service test file's mock implementation
   - Ensure all query builder methods return objects with next method in chain
   - Specifically ensure `.select()` returns object with `.single()` method
   - Ensure `.eq()`, `.gt()`, `.lt()` return objects with `.single()` method
   - Pattern: Every chainable method must return `{ nextMethod: vi.fn().mockReturnValue(...) }`

4. **Standardize Mock Pattern Across Test Files**:
   - Use consistent inline mock pattern: `vi.fn().mockReturnValue({ ... })`
   - Avoid global `vi.mock()` for Supabase client (causes override issues)
   - Each test should set up its own mock chain for full control
   - Clear mocks in `beforeEach()` to prevent cross-test contamination

5. **Add Helper Function for Common Mock Chains** (Optional Enhancement):
   - Create `src/test/helpers/supabaseMocks.ts` with reusable mock builders
   - Export functions like `createSelectSingleMock(data)`, `createInsertSelectSingleMock(data)`
   - Reduces duplication and ensures consistent mock structure
   - Tests can import and use: `mockFrom.mockReturnValue(createSelectSingleMock(mockData))`

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: 
1. Run `npm run test:safe` and measure execution time - expect it to hang indefinitely (manual Ctrl+C required)
2. Run `npm run test:services` and observe hanging behavior
3. Run individual service tests and capture specific `.single()` mock errors
4. Document exact error messages and stack traces for each failing test

**Test Cases**:
1. **Timeout Test**: Run `npm run test:safe` with 2-minute timeout (will timeout on unfixed code)
2. **Service Test Execution**: Run `npm run test:services` with 30-second timeout (will timeout on unfixed code)
3. **Single Mock Test**: Run `proxyLoginApi.test.ts` individually (will fail with mock errors on unfixed code)
4. **Query Chain Test**: Run `userApi.permissions.test.ts` individually (will fail with undefined method errors on unfixed code)

**Expected Counterexamples**:
- Test runner hangs after displaying "Test Files X passed (Y)" message
- Error: "Cannot read property 'single' of undefined" in service tests
- Error: "TypeError: mockChain.single is not a function"
- Process must be killed manually, never exits with status code

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed scripts and mocks produce the expected behavior.

**Pseudocode:**
```
FOR ALL testCommand WHERE isBugCondition(testCommand) DO
  result := executeTestCommand_fixed(testCommand)
  ASSERT result.completed == true
  ASSERT result.exitCode IN [0, 1]  // 0 = pass, 1 = fail
  ASSERT result.duration < maxExpectedDuration
END FOR

FOR ALL serviceTest WHERE usesQueryChain(serviceTest, '.single()') DO
  result := executeTest_fixed(serviceTest)
  ASSERT result.mockError == null
  ASSERT result.testPassed == true
END FOR
```

**Test Execution**:
1. Run `npm run test:safe` - should complete in under 2 minutes
2. Run `npm run test:full` - should complete in under 2 minutes
3. Run `npm run test:services` - should complete in under 30 seconds
4. Run each service test file individually - all should pass
5. Verify exit codes are 0 (all tests pass) or 1 (some tests fail, but execution completes)

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed scripts and mocks produce the same result as the original implementation.

**Pseudocode:**
```
FOR ALL testCommand WHERE NOT isBugCondition(testCommand) DO
  ASSERT executeTestCommand_original(testCommand) = executeTestCommand_fixed(testCommand)
END FOR

FOR ALL serviceTest WHERE NOT usesQueryChain(serviceTest, '.single()') DO
  ASSERT executeTest_original(serviceTest) = executeTest_fixed(serviceTest)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: 
1. Observe behavior on UNFIXED code for individual test execution (e.g., `npm run test:button`)
2. Observe behavior on UNFIXED code for watch mode (e.g., `npm run test:watch`)
3. Write property-based tests capturing that behavior
4. Run tests on FIXED code and verify identical behavior

**Test Cases**:
1. **Individual Test Preservation**: Verify `npm run test:button` produces same results before and after fix
2. **Watch Mode Preservation**: Verify `npm run test:watch` enters watch mode correctly after fix
3. **Non-Single Mock Preservation**: Verify tests using `select()`, `insert()`, `update()` without `.single()` pass identically
4. **Component Test Preservation**: Verify UI component tests pass with same results
5. **Property Test Preservation**: Verify all 13 property-based preservation tests pass

### Unit Tests

- Test that `test:safe` script completes execution within 2 minutes
- Test that `test:services` script completes execution within 30 seconds
- Test that service tests using `.single()` pass with proper mock data
- Test that mock chains properly return expected `{ data, error }` structure
- Test that individual test execution continues to work
- Test that watch mode scripts enter watch mode correctly

### Property-Based Tests

- Generate random test command combinations and verify completion behavior
- Generate random Supabase query chains and verify mock chaining works
- Test that all non-buggy test patterns continue to work across many scenarios
- Verify mock cleanup happens correctly between tests across many test runs

### Integration Tests

- Test full test suite execution with `npm run test:safe`
- Test service layer test execution with `npm run test:services`
- Test that CI/CD pipeline can run tests without hanging
- Test that all 74 passing service tests continue to pass after fix
- Test that test results are properly reported and exit codes are correct
