# Test Fix Plan - Systematic Resolution

**Date:** February 15, 2026  
**Current Status:** 69 failed | 56 passed | 1 skipped (126 total)

## Fix Strategy

### Phase 1: Infrastructure Fixes (High Impact) ⚡
Fix issues that affect multiple tests at once.

1. ✅ **Radix UI hasPointerCapture** - Fix select component tests (7 errors)
2. **Navigation/Router Setup** - Fix 30+ navigation tests
3. **Dashboard Mock Data** - Fix dashboard tests
4. **Context Provider Setup** - Fix component tests with missing context

### Phase 2: Component Tests (Medium Impact) 🔧
Fix individual component test suites.

5. Language Selector tests
6. Site Switcher tests
7. Currency Display tests
8. Layout tests
9. Other component tests

### Phase 3: Integration & E2E (Lower Impact) 🎯
Fix integration and end-to-end tests.

10. E2E catalog tests
11. Complex scenario tests
12. Performance benchmarks
13. Backend API tests

## Phase 1: Infrastructure Fixes

### Fix 1: Radix UI hasPointerCapture ✅ IN PROGRESS
**Status:** Polyfill added but still failing  
**Next:** Check if polyfill is being applied correctly

### Fix 2: Navigation/Router Setup
**Files Affected:** 30+ tests  
**Issue:** Router context not properly mocked  
**Solution:** Create proper router test wrapper

### Fix 3: Dashboard Mock Data
**Files Affected:** Multiple dashboard tests  
**Issue:** Mock data structure mismatch  
**Solution:** Update mock data to match API response

### Fix 4: Context Provider Setup
**Files Affected:** 10+ component tests  
**Issue:** Missing context providers in tests  
**Solution:** Create test wrapper with all providers

## Execution Plan

### Step 1: Fix hasPointerCapture (Current)
- Verify polyfill is loaded
- Check if HTMLElement needs polyfill
- Test with select component

### Step 2: Create Router Test Wrapper
- Create `src/test/RouterTestWrapper.tsx`
- Wrap all navigation tests
- Fix 30+ tests at once

### Step 3: Fix Dashboard Mocks
- Update mock data structure
- Fix API response format
- Test dashboard components

### Step 4: Create Context Test Wrapper
- Create `src/test/ContextTestWrapper.tsx`
- Include all context providers
- Wrap component tests

### Step 5: Fix Remaining Tests
- Work through each failing test file
- Document fixes
- Verify all tests pass

## Progress Tracking

- [ ] Phase 1: Infrastructure (0/4 complete)
- [ ] Phase 2: Components (0/10 complete)
- [ ] Phase 3: Integration (0/4 complete)

## Target

**Goal:** 100% tests passing (126/126 test files)  
**Current:** 44% passing (56/126 test files)  
**Remaining:** 69 test files to fix

---

**Next Action:** Continue with hasPointerCapture fix
