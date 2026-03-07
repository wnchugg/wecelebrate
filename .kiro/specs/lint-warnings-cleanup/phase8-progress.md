# Phase 8: Unsafe Call Warnings - Progress Report

**Date**: March 2, 2026  
**Phase**: 8 - Unsafe Calls 🔄 IN PROGRESS  
**Target**: Reduce warnings below 50  
**Starting Count**: 111 warnings  
**Current Count**: 85 warnings (need to verify with fresh lint run)
**Fixed This Phase**: 26+ warnings  
**Remaining to Target**: 35 warnings (need to fix 35 more to reach <50)

## Overall Impact

**Total Warnings**: ~1,015 (estimated, down from 1,289 at session start)  
**Total Fixed This Session**: ~274 warnings (across all categories)  
**Overall Progress**: 80% complete (4,134+ of 5,149 warnings fixed)

## Session Progress Summary

### Files Fixed This Session (8 files, 26+ warnings)

1. ✅ **src/app/utils/loaders.ts** - Fixed 5 unsafe-call warnings
   - Added explicit generic type parameters to handleLoaderError calls
   - Pattern: `handleLoaderError<Type>(error)` instead of `handleLoaderError(error)`

2. ✅ **src/app/pages/admin/ScheduledEmailManagement.tsx** - Fixed 9 toast warnings
   - Added void pattern to all toast.error() and toast.success() calls
   - Pattern: `void toast.error(...)` and `void toast.success(...)`

3. ✅ **src/app/pages/admin/ScheduledTriggersManagement.tsx** - Fixed 6 toast warnings
   - Added void pattern to all toast calls
   - Pattern: `void toast.error(...)` and `void toast.success(...)`

4. ✅ **src/app/pages/admin/WebhookManagement.tsx** - Fixed 9 toast warnings
   - Added void pattern to all toast calls
   - Pattern: `void toast.error(...)` and `void toast.success(...)`

5. ✅ **src/app/components/DraggableGiftCard.tsx** - Previously fixed (5 warnings)
6. ✅ **src/app/pages/CelebrationTest.tsx** - Previously fixed (4 warnings)
7. ✅ **src/app/pages/InitialSeed.tsx** - Previously fixed (7 warnings)
8. ✅ **src/setupTests.ts** - Previously fixed (multiple warnings)
9. ✅ **src/test/setup.ts** - Previously fixed (8 warnings)

### Patterns Applied

1. **void pattern for toast calls** - Ignore return values from toast notifications:
   ```typescript
   void toast.error('Error message');
   void toast.success('Success message');
   ```

2. **Explicit generic types for loaders** - Added type parameters to generic functions:
   ```typescript
   return handleLoaderError<Client[]>(error);
   return handleLoaderError<{ gifts: Gift[]; categories: string[]; }>(error);
   ```

3. **void pattern for drag/drop** - Ignore return values from react-dnd functions:
   ```typescript
   void drop(ref);
   void drag(ref);
   ```

4. **response.json().catch() handlers** - Added explicit return type annotations:
   ```typescript
   const data = await response.json().catch((): Type => ({ error: 'Failed' })) as Type;
   ```

## Remaining Work

The remaining 85 unsafe-call warnings need investigation. Main patterns still to fix:

### Patterns Still to Fix
1. **More toast calls** - Additional files may have toast calls without void pattern
2. **Response method calls** - More files with `.json()`, `.text()` that need type annotations
3. **API method calls** - Methods on objects typed as `unknown` or `any`
4. **Array/object method calls** - `.map()`, `.filter()` on types that cannot be resolved
5. **Test file mocks** - More vi.fn() calls that need type annotations

## Next Steps

To complete Phase 8 and reach the <50 target:

1. Run fresh lint to verify current count
2. Identify remaining files with unsafe-call warnings
3. Continue applying void pattern for calls where return value is not used
4. Add explicit type annotations to response method calls
5. Use type guards before calling methods on unknown types

## Success Metrics

- Phase 8 Target: <50 unsafe call warnings (currently at 85, need 35 more fixes)
- Overall Target: Continue toward 0 warnings
- No regressions in completed phases
- All tests continue to pass
- Progress: 23% complete (26 of 61 fixes done)
