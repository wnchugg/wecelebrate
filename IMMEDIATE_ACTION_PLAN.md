# Immediate Action Plan - TypeScript Fixes

## Current Status
- **Total Errors:** 918  
- **Phase 1 Applied:** Core type system fixes  
- **testUtils.ts:** ✅ FIXED (jest → vitest)

## 🎯 Next 3 High-Impact Actions (30 minutes each)

### Action 1: Fix Remaining Test Files (Target: ~80-100 errors)

**Time:** 30 minutes  
**Impact:** High

#### Step 1: Find all test files with jest references
```bash
grep -r "jest\." src/ --include="*.test.ts" --include="*.test.tsx" -l
```

#### Step 2: For each file, replace:
- `jest.fn()` → `vi.fn()`
- `jest.Mock` → `ReturnType<typeof vi.fn>`
- `jest.SpyInstance` → `ReturnType<typeof vi.spyOn>`
- `jest.mock` → `vi.mock`
- `jest.spyOn` → `vi.spyOn`

#### Step 3: Update imports
Add at top of each test file:
```typescript
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
```

#### Example fix pattern:
```typescript
// Before:
const mockFunction = jest.fn();
const spy: jest.SpyInstance = jest.spyOn(object, 'method');

// After:
const mockFunction = vi.fn();
const spy = vi.spyOn(object, 'method');
```

---

### Action 2: Fix useEffect Return Types (Target: ~30 errors)

**Time:** 20 minutes  
**Impact:** Medium

#### Step 1: Find all problematic useEffect calls
```bash
npm run type-check 2>&1 | grep "TS7030"
```

#### Step 2: Fix pattern
```typescript
// ❌ Before - Error TS7030
useEffect(() => {
  if (!condition) return;
  // ... code
}, [deps]);

// ✅ After - Fixed
useEffect(() => {
  if (!condition) return undefined;
  // ... code
  return undefined; // or return cleanup function
}, [deps]);
```

#### Common files:
- Admin components
- Dashboard components
- Context providers

---

### Action 3: Add Return Type Annotations (Target: ~20-30 errors)

**Time:** 20 minutes  
**Impact:** Medium

#### Step 1: Find functions missing return types
```bash
npm run type-check 2>&1 | grep "TS7010" | head -30
```

#### Step 2: Add explicit return types
```typescript
// ❌ Before
function fetchData() {
  return apiCall();
}

// ✅ After
function fetchData(): Promise<Data> {
  return apiCall();
}
```

---

## 🔧 Quick Command Reference

### Check Progress
```bash
# Count total errors
npm run type-check 2>&1 | grep "error TS" | wc -l

# Errors by type
npm run type-check 2>&1 | grep "error TS" | cut -d':' -f4 | sort | uniq -c | sort -rn

# Specific error patterns
npm run type-check 2>&1 | grep "TS7030" | wc -l  # useEffect
npm run type-check 2>&1 | grep "TS7010" | wc -l  # Return types  
npm run type-check 2>&1 | grep "TS2339" | wc -l  # Property errors
npm run type-check 2>&1 | grep "TS2322" | wc -l  # Assignment errors
```

### Generate Reports
```bash
# Full error log
npm run type-check 2>&1 > typescript-errors.log

# By file
npm run type-check 2>&1 | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn > errors-by-file.txt

# Top 20 most problematic files
npm run type-check 2>&1 | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -20
```

### Targeted Type Checks
```bash
# Check specific directory
npx tsc --noEmit src/app/components/**/*.tsx

# Check single file
npx tsc --noEmit src/app/pages/admin/Dashboard.tsx

# Check test files only
npx tsc --noEmit src/**/*.test.tsx
```

---

## 📊 Expected Progress

After completing these 3 actions:

| Action | Errors Fixed | Time |
|--------|--------------|------|
| Action 1: Test Files | ~80-100 | 30 min |
| Action 2: useEffect | ~30 | 20 min |
| Action 3: Return Types | ~20-30 | 20 min |
| **TOTAL** | **~130-160** | **~70 min** |

**New error count: ~758-788** (from 918)

---

## 🎯 Priority Files (Fix These First)

Based on error frequency, these files likely have the most issues:

### Test Files (High Impact)
1. `/src/app/components/__tests__/*.test.tsx`
2. `/src/app/pages/admin/__tests__/*.test.tsx`
3. `/src/app/hooks/__tests__/*.test.ts`
4. `/src/app/utils/__tests__/*.test.ts`

### Component Files
1. `/src/app/pages/admin/Dashboard.tsx`
2. `/src/app/pages/admin/AnalyticsDashboard.tsx`
3. `/src/app/pages/admin/CatalogPerformanceAnalytics.tsx`
4. `/src/app/components/admin/DataTable.tsx`

### Hook Files
1. `/src/app/hooks/useApi.ts`
2. `/src/app/hooks/useForm.ts`
3. `/src/app/hooks/useAsync.ts`

---

## 🚀 Automation Opportunities

### Semi-Automated Fixes (USE WITH CAUTION)

#### Fix jest.fn() globally
```bash
find src/ -name "*.test.ts*" -type f -exec sed -i.bak 's/jest\.fn()/vi.fn()/g' {} +
```

#### Fix jest.Mock type globally  
```bash
find src/ -name "*.test.ts*" -type f -exec sed -i.bak 's/jest\.Mock/ReturnType<typeof vi.fn>/g' {} +
```

#### Fix jest.spyOn globally
```bash
find src/ -name "*.test.ts*" -type f -exec sed -i.bak 's/jest\.spyOn/vi.spyOn/g' {} +
```

⚠️ **IMPORTANT:** Always review changes before committing!

#### Restore if needed
```bash
find src/ -name "*.bak" -exec bash -c 'mv "$0" "${0%.bak}"' {} \;
```

---

## 📝 Manual Fix Templates

### Template 1: Test File Header
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

// Your test code here
```

### Template 2: useEffect with Cleanup
```typescript
useEffect(() => {
  if (!mounted) return undefined;
  
  const cleanup = () => {
    // cleanup code
  };
  
  // effect code here
  
  return cleanup;
}, [mounted, dependencies]);
```

### Template 3: Function with Return Type
```typescript
export async function fetchData(id: string): Promise<DataType> {
  const response = await apiCall(id);
  return response.data;
}
```

---

## ✅ Validation Checklist

After each action, run:

```bash
# 1. Count errors
npm run type-check 2>&1 | grep "error TS" | wc -l

# 2. Check no new errors introduced
git diff src/

# 3. Run tests to ensure no breakage
npm test -- --run

# 4. Commit progress
git add .
git commit -m "TypeScript fixes: [Action Name] - [X] errors fixed"
```

---

## 🎯 Success Metrics

### Short-term (1-2 hours)
- [ ] Test files fixed (~100 errors)
- [ ] useEffect returns fixed (~30 errors)
- [ ] Return types added (~30 errors)
- **Target: 750-800 errors remaining**

### Medium-term (2-4 hours)
- [ ] Component prop types fixed (~150 errors)
- [ ] Hook types fixed (~50 errors)
- [ ] API types fixed (~80 errors)
- **Target: 450-550 errors remaining**

### Long-term (6-8 hours)
- [ ] All errors resolved
- [ ] Full type safety achieved
- [ ] Tests passing
- **Target: 0 errors**

---

## 🆘 Troubleshooting

### If errors increase:
1. Revert last changes: `git checkout src/path/to/file.tsx`
2. Fix errors one file at a time
3. Run type-check after each fix

### If stuck:
1. Focus on one error type (e.g., only TS7030)
2. Fix in one file completely
3. Use that as a template for others

### If overwhelmed:
1. Take top 5 most error-prone files
2. Fix those completely
3. Re-run type-check to see cascading fixes

---

**Ready to start? Run:**
```bash
chmod +x /fix-typescript-batch.sh
bash /fix-typescript-batch.sh
```

Or start manually with Action 1 above! 🚀
