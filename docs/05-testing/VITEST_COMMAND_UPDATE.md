# Vitest Command Syntax Update

**Date**: February 25, 2026  
**Status**: ✅ Complete

## Summary

Updated test commands in `package.json` to use the modern Vitest command syntax.

## Changes Made

### Before (Deprecated Syntax)
```json
{
  "test:safe": "vitest --run --maxConcurrency=2 --maxWorkers=2",
  "test:full": "vitest --run --maxConcurrency=4 --maxWorkers=4"
}
```

### After (Modern Syntax)
```json
{
  "test:safe": "vitest run --maxConcurrency=2 --maxWorkers=2",
  "test:full": "vitest run --maxConcurrency=4 --maxWorkers=4"
}
```

## Rationale

### Why `vitest run` instead of `vitest --run`?

1. **Modern Vitest Syntax**: Vitest recommends using subcommands (`run`, `watch`, `dev`) rather than flags
2. **Consistency**: Aligns with other Vitest commands like `vitest watch`, `vitest dev`
3. **Clarity**: Subcommands are more explicit about the mode of operation
4. **Future-Proof**: The `--run` flag may be deprecated in future Vitest versions

### Command Equivalence

Both syntaxes produce identical behavior:
- `vitest --run` = `vitest run` (run tests once and exit)
- `vitest` (no args) = `vitest watch` (watch mode)

## Impact

### No Behavioral Changes
- Tests execute identically
- Exit codes remain the same
- Performance is unchanged
- All test scripts work as before

### Commands Affected
- `npm run test:safe` - Local testing (2 workers, 2 max concurrency)
- `npm run test:full` - CI testing (4 workers, 4 max concurrency)

### Commands Unchanged
- `npm run test:watch` - Still uses `vitest` (watch mode)
- `npm run test:ui` - Still uses `vitest --ui`
- All category-specific test scripts - Still use `vitest run`

## Usage

### Running Tests

```bash
# Local development (recommended)
npm run test:safe

# CI environment
npm run test:full

# Watch mode (unchanged)
npm run test:watch

# Specific test file
npm run test:safe -- src/app/components/Button.test.tsx

# With coverage
npm run test:coverage
```

### Direct Vitest Commands

```bash
# Modern syntax (recommended)
vitest run                    # Run once and exit
vitest watch                  # Watch mode
vitest run --coverage         # With coverage

# Legacy syntax (still works, but not recommended)
vitest --run                  # Run once and exit
vitest --watch                # Watch mode
```

## Documentation Updates

Updated the following documentation files:
- ✅ `docs/05-testing/property-based-tests.md` - Updated example commands
- ✅ `docs/05-testing/VITEST_COMMAND_UPDATE.md` - This document

## References

- [Vitest CLI Documentation](https://vitest.dev/guide/cli.html)
- [Vitest Run Command](https://vitest.dev/guide/cli.html#vitest-run)
- [Vitest Watch Command](https://vitest.dev/guide/cli.html#vitest-watch)

## Related Specs

This change supersedes the planned changes in:
- `.kiro/specs/test-failures-fix/tasks.md` (Task 3.1)
- `.kiro/specs/test-failures-fix/design.md` (Section 3.1)

The test-failures-fix spec originally planned to add `--run` flags, but this update uses the modern `run` subcommand instead, which is the preferred approach.

---

**Status**: ✅ Complete - Modern Vitest syntax implemented  
**Breaking Changes**: None - Commands work identically  
**Action Required**: None - All existing scripts continue to work
