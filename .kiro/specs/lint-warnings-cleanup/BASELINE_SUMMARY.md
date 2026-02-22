# Lint Warnings Cleanup - Baseline Summary

**Date:** February 20, 2026  
**Baseline File:** `.kiro/specs/lint-warnings-cleanup/baseline.json`

## Overview

This document provides a detailed summary of the lint warning baseline captured before starting the systematic cleanup effort.

## Total Counts

| Metric | Count |
|--------|-------|
| **Total Issues** | **5,147** |
| Warnings | 5,147 |
| Errors | 0 |
| Files Affected | 347 |
| Rule Categories | 19 |

## Warning Categories (Detailed)

### Critical Priority (Root Causes & Runtime Safety)

| # | Rule | Count | Files | Priority | Phase |
|---|------|-------|-------|----------|-------|
| 1 | `@typescript-eslint/no-explicit-any` | 993 | 178 | CRITICAL | Phase 1 |
| 2 | `@typescript-eslint/no-floating-promises` | 155 | 68 | CRITICAL | Phase 2 |
| 3 | `@typescript-eslint/no-misused-promises` | 265 | 109 | CRITICAL | Phase 3 |
| 4 | `react-hooks/exhaustive-deps` | 56 | 45 | CRITICAL | Phase 4 |

**Subtotal: 1,469 warnings (28.5%)**

### High Priority (Type Safety Cascade)

| # | Rule | Count | Files | Priority | Phase |
|---|------|-------|-------|----------|-------|
| 5 | `@typescript-eslint/no-unsafe-member-access` | 1,640 | 136 | HIGH | Phase 5 |
| 6 | `@typescript-eslint/no-unsafe-assignment` | 836 | 139 | HIGH | Phase 6 |
| 7 | `@typescript-eslint/no-unsafe-argument` | 417 | 105 | HIGH | Phase 7 |
| 8 | `@typescript-eslint/no-unsafe-call` | 135 | 40 | HIGH | Phase 8 |
| 9 | `@typescript-eslint/no-unsafe-return` | 106 | 35 | HIGH | Phase 9 |

**Subtotal: 3,134 warnings (60.9%)**

### Medium Priority (Code Quality)

| # | Rule | Count | Files | Priority | Phase |
|---|------|-------|-------|----------|-------|
| 10 | `unused-imports/no-unused-vars` | 350 | 158 | MEDIUM | Phase 10 |
| 11 | `react-refresh/only-export-components` | 53 | 26 | MEDIUM | Phase 11 |

**Subtotal: 403 warnings (7.8%)**

### Low Priority (Minor Issues)

| # | Rule | Count | Files | Priority | Phase |
|---|------|-------|-------|----------|-------|
| 12 | `@typescript-eslint/require-await` | 56 | 26 | LOW | Phase 12 |
| 13 | `@typescript-eslint/no-empty-object-type` | 30 | 5 | LOW | Phase 13 |
| 14 | `@typescript-eslint/no-base-to-string` | 19 | 10 | LOW | Phase 13 |
| 15 | `no-useless-escape` | 13 | 4 | LOW | Phase 13 |
| 16 | `promise/param-names` | 11 | 4 | LOW | Phase 13 |
| 17 | `@typescript-eslint/no-redundant-type-constituents` | 7 | 5 | LOW | Phase 13 |
| 18 | `promise/catch-or-return` | 4 | 4 | LOW | Phase 13 |
| 19 | `prefer-const` | 1 | 1 | LOW | Phase 13 |

**Subtotal: 141 warnings (2.7%)**

## Key Observations

### 1. Actual Total vs. Expected

- **Expected:** 5,149 warnings (from initial analysis)
- **Actual:** 5,147 warnings
- **Difference:** -2 warnings (within margin of error)

The slight difference is likely due to:
- Files being modified between initial count and baseline capture
- Different counting methods (some tools may count differently)

### 2. Distribution Analysis

The warnings are heavily concentrated in type safety issues:

- **Type Safety Issues (no-unsafe-*):** 3,134 warnings (60.9%)
- **Explicit Any Types:** 993 warnings (19.3%)
- **Promise Handling:** 420 warnings (8.2%)
- **Code Quality:** 403 warnings (7.8%)
- **React Issues:** 109 warnings (2.1%)
- **Minor Issues:** 88 warnings (1.7%)

### 3. File Impact

- **347 files** have at least one lint warning
- Average: **14.8 warnings per affected file**
- Most impacted categories affect **100+ files** each

### 4. Dependency Chain

The warnings follow a clear dependency chain:

```
explicit any (993)
    ↓
unsafe member access (1,640)
unsafe assignment (836)
unsafe argument (417)
unsafe call (135)
unsafe return (106)
```

Fixing explicit `any` types first should reduce many downstream warnings automatically.

## Validation Infrastructure

Three scripts have been created to support the cleanup:

1. **Baseline Script** (`scripts/lint-baseline.js`)
   - Captures current warning state
   - Creates JSON baseline file
   - Shows summary by category

2. **Validation Script** (`scripts/lint-validate.js`)
   - Compares current state to baseline
   - Detects improvements and regressions
   - Can validate specific categories

3. **Test Wrapper** (`scripts/test-wrapper.js`)
   - Runs test suite
   - Provides pass/fail result
   - Shows test summary

### NPM Scripts Added

```bash
npm run lint:baseline          # Create/update baseline
npm run lint:validate          # Validate against baseline
npm run lint:validate:verbose  # Validate with detailed output
```

## Next Steps

1. ✅ Validation infrastructure created
2. ✅ Baseline captured and documented
3. ⏭️ Begin Phase 1: Fix explicit `any` types (993 warnings)

## Usage Examples

### Create Baseline
```bash
npm run lint:baseline
```

### Validate After Fixes
```bash
# Validate specific category
node scripts/lint-validate.js --category @typescript-eslint/no-explicit-any

# Validate all changes
npm run lint:validate

# Validate with verbose output
npm run lint:validate:verbose
```

### Run Tests
```bash
node scripts/test-wrapper.js
```

## Files Created

1. `scripts/lint-baseline.js` - Baseline measurement script
2. `scripts/lint-validate.js` - Validation script
3. `scripts/test-wrapper.js` - Test execution wrapper
4. `.kiro/specs/lint-warnings-cleanup/baseline.json` - Baseline data
5. `.kiro/specs/lint-warnings-cleanup/VALIDATION_INFRASTRUCTURE.md` - Documentation
6. `.kiro/specs/lint-warnings-cleanup/BASELINE_SUMMARY.md` - This file

## Notes

- All scripts are executable and use Node.js
- Scripts handle large output (up to 50MB)
- Validation script exits with code 1 if regressions detected
- Test wrapper can run with or without coverage
- Baseline should be updated only when intentionally resetting progress
