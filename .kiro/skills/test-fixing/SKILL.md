---
name: test-fixing
description: Run tests and systematically fix all failing tests using smart error grouping. Use when user asks to fix failing tests, mentions test failures, runs test suite and failures occur, or requests to make tests pass.
---

# Test Fixing

Systematically identify and fix all failing tests using smart grouping strategies.

## When to Use

- Explicitly asks to fix tests ("fix these tests", "make tests pass")
- Reports test failures ("tests are failing", "test suite is broken")
- Completes implementation and wants tests passing
- Mentions CI/CD failures due to tests

## Systematic Approach

### 1. Initial Test Run

Run the appropriate test command to identify all failing tests:
```bash
npm run test:safe  # Local development
npm run test:full  # CI environment
```

Analyze output for:
- Total number of failures
- Error types and patterns
- Affected modules/files

### 2. Smart Error Grouping

Group similar failures by:
- **Error type**: ImportError, TypeError, AssertionError, etc.
- **Module/file**: Same file causing multiple test failures
- **Root cause**: Missing dependencies, API changes, refactoring impacts

Prioritize groups by:
- Number of affected tests (highest impact first)
- Dependency order (fix infrastructure before functionality)

### 3. Systematic Fixing Process

For each group (starting with highest impact):

1. **Identify root cause**
   - Read relevant code
   - Check recent changes with `git diff`
   - Understand the error pattern

2. **Implement fix**
   - Use editCode or strReplace for code changes
   - Follow project conventions (see steering files)
   - Make minimal, focused changes

3. **Verify fix**
   - Run subset of tests for this group
   - Use test category scripts:
     ```bash
     npm run test:ui-components
     npm run test:app-components
     npm run test:services
     npm run test:hooks
     ```
   - Ensure group passes before moving on

4. **Move to next group**

### 4. Fix Order Strategy

**Infrastructure first:**
- Import errors
- Missing dependencies
- Configuration issues

**Then API changes:**
- Function signature changes
- Module reorganization
- Renamed variables/functions

**Finally, logic issues:**
- Assertion failures
- Business logic bugs
- Edge case handling

### 5. Final Verification

After all groups fixed:
- Run complete test suite: `npm run test:safe` or `npm run test:full`
- Verify no regressions
- Check test coverage remains intact

## Best Practices

- Fix one group at a time
- Run focused tests after each fix
- Use `git diff` to understand recent changes
- Look for patterns in failures
- Don't move to next group until current passes
- Keep changes minimal and focused
- Follow test timeout rules (max 10 seconds per test/hook)

## Example Workflow

User: "The tests are failing after my refactor"

1. Run `npm run test:safe` → 15 failures identified
2. Group errors:
   - 8 ImportErrors (module renamed)
   - 5 TypeErrors (function signature changed)
   - 2 AssertionErrors (logic bugs)
3. Fix ImportErrors first → Run `npm run test:app-components` → Verify
4. Fix TypeErrors → Run `npm run test:services` → Verify
5. Fix AssertionErrors → Run focused tests → Verify
6. Run full suite → All pass ✓

## Integration with CI/CD

- Ensure fixes pass `npm run lint:validate`
- Run `npm run type-check` after fixes
- Verify no new lint warnings introduced
- Follow pre-commit quality gates
