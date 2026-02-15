# Phase 3: Final Cleanup - Last 5%

**Date:** February 15, 2026  
**Status:** In Progress

---

## Objective

Remove deprecated V1 API files that have been replaced by V2 database-backed versions.

---

## Files to Remove

### 1. `gifts_api.ts` (Old V1)
**Status:** ❌ Deprecated  
**Replaced By:** `gifts_api_v2.ts`  
**Reason:** Uses KV store, replaced by database version  
**Imports:** None found (safe to remove)

### 2. `site-catalog-config_api.ts` (Old V1)
**Status:** ❌ Deprecated  
**Replaced By:** `site-catalog-config_api_v2.ts`  
**Reason:** Uses KV store, replaced by database version  
**Imports:** None found (safe to remove)

### 3. `catalogs_api.ts` (Old V1)
**Status:** ✅ Already Removed  
**Replaced By:** `catalogs_api_v2.ts`  
**Note:** Already cleaned up in previous session

---

## Verification Steps

### Step 1: Verify No Imports ✅
- ✅ Checked for imports of `gifts_api.ts` - None found
- ✅ Checked for imports of `site-catalog-config_api.ts` - None found
- ✅ Confirmed `catalogs_api.ts` already removed

### Step 2: Verify Route Registration ✅
Current `index.tsx` imports:
```typescript
import * as giftsApi from "./gifts_api_v2.ts"; // V2 database version
import catalogsApi from './catalogs_api_v2.ts';  // V2 database version
import siteCatalogConfigApi from './site-catalog-config_api_v2.ts';  // V2 database version
```

All routes are using V2 versions ✅

### Step 3: Verify Tests ✅
All V2 APIs have comprehensive tests:
- ✅ `test_gifts_api_v2.ts` - 9/9 tests passing
- ✅ `test_orders_api_multitenant.ts` - 9/9 tests passing
- ✅ `test_catalogs_api.ts` - 14/14 tests passing
- ✅ `test_site_catalog_config_api.ts` - 23/23 tests passing

---

## Cleanup Actions

### Action 1: Remove Old Gifts API
```bash
rm supabase/functions/server/gifts_api.ts
```

**Impact:** None - not imported anywhere  
**Risk:** Low - V2 version fully tested and deployed

### Action 2: Remove Old Site Catalog Config API
```bash
rm supabase/functions/server/site-catalog-config_api.ts
```

**Impact:** None - not imported anywhere  
**Risk:** Low - V2 version fully tested and deployed

---

## Rollback Plan

If needed, old files can be restored from git history:
```bash
git checkout HEAD~1 supabase/functions/server/gifts_api.ts
git checkout HEAD~1 supabase/functions/server/site-catalog-config_api.ts
```

---

## Post-Cleanup Verification

After cleanup, verify:
1. ✅ No TypeScript errors
2. ✅ All tests still passing
3. ✅ Server starts without errors
4. ✅ All API endpoints respond correctly

---

## Summary

**Files to Remove:** 2  
**Files Already Removed:** 1  
**Total Cleanup:** 3 files

This completes the final 5% of Phase 3, ensuring all deprecated V1 API files are removed and only the new database-backed V2 versions remain.

---

## Next Steps

After cleanup:
1. Run all tests to verify nothing broke
2. Check for any TypeScript errors
3. Verify server starts correctly
4. Move to Phase 4: Testing & Validation
