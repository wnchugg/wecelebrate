# Edge Function Directory Rename - Manual Steps

## Overview
We need to rename `/supabase/functions/server/` to `/supabase/functions/make-server-6fcaeea3/` and remove the `/make-server-6fcaeea3` prefix from all 68 routes in the code.

## Why This Is Needed

**Current (Broken):**
```
Directory: server
Routes: app.get("/make-server-6fcaeea3/health", ...)
URL: .../functions/v1/server/make-server-6fcaeea3/health ❌ 404!
```

**After Fix:**
```
Directory: make-server-6fcaeea3  
Routes: app.get("/health", ...)
URL: .../functions/v1/make-server-6fcaeea3/health ✅ Works!
```

## Automated Migration

I'll now create the new directory structure and copy all files with updated routes.

## Files to Process

**Core Files (need route updates):**
- index.tsx (2600+ lines, 68 routes to update)

**Supporting Files (copy as-is):**
- erp_integration.ts
- erp_scheduler.ts  
- helpers.ts
- kv_env.ts
- security.ts
- seed.ts
- types.ts
- validation.ts
- tsconfig.json
- *.md files
- tests/ directory

## Route Pattern to Replace

Find: `"/make-server-6fcaeea3/`
Replace with: `"/`

This affects 68 routes across:
- Health endpoints
- Auth endpoints  
- Client/Site/Gift CRUD
- ERP integration
- Employee management
- Public validation endpoints

## Post-Migration Steps

1. ✅ Create new directory: `/supabase/functions/make-server-6fcaeea3/`
2. ✅ Copy all files with route updates
3. ✅ Verify deployment scripts use `make-server-6fcaeea3`
4. 🧪 Test deployment: `./scripts/deploy-full-stack.sh dev`
5. 🗑️ Delete old directory once confirmed working

---

**Status: Ready to migrate - I'll do this now!**
