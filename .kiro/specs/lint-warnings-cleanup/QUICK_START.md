# Lint Warnings Cleanup - Quick Start Guide

## Current Status

✅ **Task 1 Complete:** Validation infrastructure set up  
📊 **Baseline Captured:** 5,147 total warnings across 19 categories  
⏭️ **Next Task:** Phase 1 - Fix explicit `any` types (993 warnings)

## Quick Commands

### Baseline & Validation

```bash
# Create/update baseline
npm run lint:baseline

# Validate all changes
npm run lint:validate

# Validate specific category
node scripts/lint-validate.js --category @typescript-eslint/no-explicit-any

# Validate with verbose output
npm run lint:validate:verbose
```

### Testing

```bash
# Run tests (safe mode)
node scripts/test-wrapper.js

# Run tests with coverage
node scripts/test-wrapper.js --coverage

# Run tests with verbose output
node scripts/test-wrapper.js --verbose
```

### Standard Workflow

```bash
# Regular lint check
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

## Workflow Per Phase

1. **Before starting fixes:**
   ```bash
   npm run lint:baseline  # Capture current state
   ```

2. **Make your fixes** (edit code to resolve warnings)

3. **Validate changes:**
   ```bash
   # Check specific category you fixed
   node scripts/lint-validate.js --category <rule-name>
   
   # Verify tests still pass
   node scripts/test-wrapper.js
   ```

4. **If validation passes:**
   ```bash
   git add .
   git commit -m "fix: resolve <rule-name> warnings"
   ```

5. **If validation fails:**
   - Review the regression report
   - Fix any new warnings introduced
   - Re-run validation

## Priority Order

| Phase | Category | Count | Priority |
|-------|----------|-------|----------|
| 1 | `@typescript-eslint/no-explicit-any` | 993 | CRITICAL |
| 2 | `@typescript-eslint/no-floating-promises` | 155 | CRITICAL |
| 3 | `@typescript-eslint/no-misused-promises` | 265 | CRITICAL |
| 4 | `react-hooks/exhaustive-deps` | 56 | CRITICAL |
| 5 | `@typescript-eslint/no-unsafe-member-access` | 1,640 | HIGH |
| 6 | `@typescript-eslint/no-unsafe-assignment` | 836 | HIGH |
| 7 | `@typescript-eslint/no-unsafe-argument` | 417 | HIGH |
| 8 | `@typescript-eslint/no-unsafe-call` | 135 | HIGH |
| 9 | `@typescript-eslint/no-unsafe-return` | 106 | HIGH |
| 10 | `unused-imports/no-unused-vars` | 350 | MEDIUM |
| 11 | `react-refresh/only-export-components` | 53 | MEDIUM |
| 12 | `@typescript-eslint/require-await` | 56 | LOW |
| 13 | Remaining minor warnings | 141 | LOW |

## Files Created

- ✅ `scripts/lint-baseline.js` - Baseline measurement
- ✅ `scripts/lint-validate.js` - Validation
- ✅ `scripts/test-wrapper.js` - Test execution
- ✅ `.kiro/specs/lint-warnings-cleanup/baseline.json` - Baseline data
- ✅ `.kiro/specs/lint-warnings-cleanup/VALIDATION_INFRASTRUCTURE.md` - Full docs
- ✅ `.kiro/specs/lint-warnings-cleanup/BASELINE_SUMMARY.md` - Detailed summary
- ✅ `.kiro/specs/lint-warnings-cleanup/QUICK_START.md` - This file

## Troubleshooting

### "Baseline file not found"
```bash
npm run lint:baseline
```

### "Validation failed - regressions detected"
- Check which categories increased
- Review recent changes with `git diff`
- Fix new warnings before committing

### "Tests failed"
```bash
# See detailed output
node scripts/test-wrapper.js --verbose
```

## Documentation

- **Full Infrastructure Docs:** `VALIDATION_INFRASTRUCTURE.md`
- **Baseline Details:** `BASELINE_SUMMARY.md`
- **Requirements:** `requirements.md`
- **Design:** `design.md`
- **Tasks:** `tasks.md`

## Ready to Start?

Begin with Phase 1:
```bash
# Check current state
node scripts/lint-validate.js --category @typescript-eslint/no-explicit-any

# Start fixing explicit any types
# (See tasks.md for detailed subtasks)
```
