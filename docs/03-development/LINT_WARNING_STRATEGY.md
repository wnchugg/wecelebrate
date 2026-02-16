# Lint Warning Fixing Strategy

**Date:** February 15, 2026  
**Current State:** 0 errors, 4,757 warnings

## Warning Breakdown

| Rule | Count | Priority | Approach |
|------|-------|----------|----------|
| no-unsafe-member-access | 1,269 | Medium | Type assertions, proper typing |
| no-explicit-any | 800 | High | Replace with proper types |
| no-unused-vars | 695 | High | Remove or prefix with _ |
| no-unsafe-assignment | 563 | Medium | Type assertions, proper typing |
| no-unsafe-argument | 291 | Medium | Type assertions, proper typing |
| no-floating-promises | 273 | High | Add void operator or .catch() |
| no-misused-promises | 268 | High | Fix async/await usage |
| no-require-imports | 117 | Low | Convert to ES6 imports |
| no-unsafe-call | 113 | Medium | Type assertions |
| no-unsafe-return | 103 | Medium | Type assertions |
| require-await | 54 | Low | Remove async or add await |
| no-base-to-string | 18 | Medium | Add .toString() or String() |
| no-empty-object-type | 12 | Low | Replace {} with object |
| no-redundant-type-constituents | 6 | Low | Simplify union types |

## Fixing Strategy

### Phase 1: Quick Wins (High Priority, Easy Fixes)
1. **no-unused-vars (695)** - Remove unused variables or prefix with `_`
2. **require-await (54)** - Remove unnecessary async keywords
3. **no-require-imports (117)** - Convert require() to import
4. **no-redundant-type-constituents (6)** - Simplify types
5. **no-empty-object-type (12)** - Replace {} with object

**Estimated Impact:** ~884 warnings (18.6%)

### Phase 2: Promise Handling (High Priority, Important)
1. **no-floating-promises (273)** - Add void operator or .catch()
2. **no-misused-promises (268)** - Fix async/await in event handlers

**Estimated Impact:** ~541 warnings (11.4%)

### Phase 3: Type Safety (Medium Priority, Gradual)
1. **no-explicit-any (800)** - Replace with proper types
2. **no-unsafe-member-access (1,269)** - Add type guards
3. **no-unsafe-assignment (563)** - Add type assertions
4. **no-unsafe-argument (291)** - Add type assertions
5. **no-unsafe-call (113)** - Add type guards
6. **no-unsafe-return (103)** - Add type assertions
7. **no-base-to-string (18)** - Add explicit conversions

**Estimated Impact:** ~3,157 warnings (66.4%)

## Decision: Focus on High-Impact, Low-Risk Fixes

Given the large number of warnings, we should focus on:
1. Fixes that don't change runtime behavior
2. Fixes that improve code quality
3. Fixes that are low-risk

### Recommended Approach

**Do Fix:**
- ✅ Unused variables (no runtime impact)
- ✅ Floating promises (prevents bugs)
- ✅ Misused promises (prevents bugs)
- ✅ Unnecessary async (cleaner code)
- ✅ Empty object types (better types)
- ✅ Redundant type constituents (cleaner types)

**Consider Carefully:**
- ⚠️ no-explicit-any (requires understanding context)
- ⚠️ no-unsafe-* rules (may require significant refactoring)

**Defer:**
- 🔄 Large-scale type refactoring (do incrementally)

## Implementation Plan

### Step 1: Unused Variables (695 warnings)
- Prefix with `_` if intentionally unused
- Remove if truly unused
- **Risk:** Low
- **Impact:** High (14.6% of warnings)

### Step 2: Floating Promises (273 warnings)
- Add `void` operator for fire-and-forget
- Add `.catch()` for error handling
- **Risk:** Medium (changes error handling)
- **Impact:** Medium (5.7% of warnings)

### Step 3: Misused Promises (268 warnings)
- Fix event handlers that return promises
- **Risk:** Low
- **Impact:** Medium (5.6% of warnings)

### Step 4: Unnecessary Async (54 warnings)
- Remove async keyword where no await
- **Risk:** Low
- **Impact:** Low (1.1% of warnings)

### Step 5: Type Improvements (18 warnings)
- Fix empty object types
- Fix redundant type constituents
- **Risk:** Low
- **Impact:** Low (0.4% of warnings)

## Expected Results

After Phase 1 (Quick Wins):
- **Warnings:** ~3,873 (18.6% reduction)
- **Time:** 1-2 hours
- **Risk:** Low

After Phase 2 (Promise Handling):
- **Warnings:** ~3,332 (30% reduction)
- **Time:** 2-3 hours
- **Risk:** Medium

After Phase 3 (Type Safety):
- **Warnings:** ~175 (96% reduction)
- **Time:** 8-12 hours
- **Risk:** High (requires careful review)

## Recommendation

Start with Phase 1 (Quick Wins) to get immediate results with low risk. Then evaluate whether to continue with Phase 2 and 3 based on project priorities.
