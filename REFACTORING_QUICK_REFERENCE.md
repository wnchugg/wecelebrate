# JALA 2 Refactoring - Quick Reference Card
## One-Page Cheat Sheet for Pre-Deployment Refactor

---

## 🎯 Quick Start

```bash
# 1. Create feature branch
git checkout -b refactor/pre-deployment

# 2. Run analysis script
chmod +x scripts/analyze-codebase.sh
./scripts/analyze-codebase.sh

# 3. Follow REFACTORING_STEPS.md for detailed instructions
```

---

## 📋 Checklist

### Priority 0 (MUST DO)
- [ ] **Backend Files** - Consolidate .ts/.tsx duplicates
- [ ] **API Client** - Merge api.ts into apiClient.ts
- [ ] **Security Audit** - Verify no secrets in frontend

### Priority 1 (SHOULD DO)
- [ ] **Environment Config** - Rename for clarity
- [ ] **Type Safety** - Fix 'any' types
- [ ] **Testing** - Run full test suite

### Priority 2 (NICE TO DO)
- [ ] **Root Cleanup** - Move docs to /docs
- [ ] **Console Logs** - Remove debug logs
- [ ] **Performance** - Optimize bundle size

---

## 🔧 Quick Fixes

### Backend File Consolidation

```bash
cd supabase/functions/server

# Keep these:
# - index.ts (required by Supabase CLI)
# - index.tsx (main logic)
# - email_service.tsx (has JSX)
# - gifts_api.ts (no JSX)

# Delete these after consolidating:
rm erp_integration.tsx
rm erp_scheduler.tsx
rm kv_env.tsx
rm security.tsx
rm seed.tsx
```

### API Client Migration

**Add to apiClient.ts (around line 469):**

```typescript
async initializeCatalog(): Promise<void> {
  await apiRequest('/admin/gifts/initialize', {
    method: 'POST',
    requireAuth: true,
  });
},

async getCategories(): Promise<string[]> {
  const response = await apiRequest<{ categories: string[] }>(
    '/gifts/categories/list',
    { requireAuth: true }
  );
  return response.categories;
},
```

**Replace imports:**

```typescript
// OLD
import { giftApi, orderApi } from '@/app/lib/api';

// NEW
import { apiClient } from '@/app/lib/apiClient';

// Usage changes:
giftApi.getAll() → apiClient.gifts.list()
giftApi.getById(id) → apiClient.gifts.get(id)
orderApi.create(data) → apiClient.orders.create(data)
```

### Environment Config Rename

```bash
# Rename files
git mv src/app/config/environment.ts src/app/config/buildConfig.ts
git mv src/app/config/environments.ts src/app/config/deploymentEnvironments.ts

# Update imports everywhere
# OLD: import { env } from '@/app/config/environment';
# NEW: import { buildEnv } from '@/app/config/buildConfig';
```

---

## 🔍 Search & Replace Patterns

### Find All API Imports

```bash
grep -r "from '@/app/lib/api'" src/app
grep -r "giftApi\." src/app
grep -r "orderApi\." src/app
```

### Find Environment Imports

```bash
grep -r "from '@/app/config/environment'" src/app
grep -r "from '@/app/config/environments'" src/app
```

### Find Console Logs

```bash
grep -r "console\.log" src/app | grep -v node_modules
```

### Find 'any' Types

```bash
grep -r ": any" src/app | grep -v node_modules | grep -v ".d.ts"
```

---

## 🧪 Testing Commands

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Tests
npm run test

# Build (all variants)
npm run build
npm run build:staging
npm run build:production

# Check bundle size
ls -lh dist/assets/

# Preview build
npm run preview
```

---

## 🚨 Common Errors & Solutions

### Error: Module not found '/lib/api'

**Cause:** Forgot to update import after deleting api.ts

**Fix:**
```typescript
import { apiClient } from '@/app/lib/apiClient';
```

### Error: Cannot find name 'giftApi'

**Cause:** Using old API client variable

**Fix:**
```typescript
// OLD: const gifts = await giftApi.getAll();
// NEW: 
const response = await apiClient.gifts.list();
const gifts = response.data;
```

### Error: Type 'EnvironmentConfig' has no property...

**Cause:** Importing wrong environment config type

**Fix:**
```typescript
// For build config:
import type { BuildConfig } from '@/app/config/buildConfig';

// For deployment config:
import type { DeploymentEnvironment } from '@/app/config/deploymentEnvironments';
```

### Error: Module has duplicate exports

**Cause:** Backend file exists in both .ts and .tsx

**Fix:** Delete the .tsx version (unless it has JSX)

---

## 📊 Validation Checklist

### Before Committing

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run build` succeeds
- [ ] No duplicate files in backend
- [ ] No imports from deleted files
- [ ] All TODOs documented

### Before Deploying

- [ ] All manual tests pass
- [ ] Admin dashboard works
- [ ] User flow works (all 6 steps)
- [ ] Email system works
- [ ] Environment switcher works
- [ ] Bundle size acceptable (<500KB gzipped)

### After Deploying

- [ ] Health check passes
- [ ] No errors in logs
- [ ] Order creation works
- [ ] Email sending works
- [ ] Admin login works

---

## 📞 Need Help?

1. **Detailed guide:** See `REFACTORING_STEPS.md`
2. **Overview:** See `REFACTORING_PLAN.md`
3. **Analysis:** Run `./scripts/analyze-codebase.sh`
4. **Git diff:** See what changed with `git diff`

---

## 🎯 File Migration Map

| Old Location | New Location | Action |
|-------------|--------------|--------|
| `lib/api.ts` | `lib/apiClient.ts` | Merge & delete old |
| `config/environment.ts` | `config/buildConfig.ts` | Rename |
| `config/environments.ts` | `config/deploymentEnvironments.ts` | Rename |
| `server/erp_integration.tsx` | `server/erp_integration.ts` | Consolidate |
| `server/erp_scheduler.tsx` | `server/erp_scheduler.ts` | Consolidate |
| `server/kv_env.tsx` | `server/kv_env.ts` | Consolidate |
| `server/security.tsx` | `server/security.ts` | Consolidate |
| `server/seed.tsx` | `server/seed.ts` | Consolidate |

---

## 💾 Rollback Procedure

If something breaks:

```bash
# Quick rollback
git reset --hard HEAD

# Or revert specific commit
git revert <commit-hash>

# Or checkout specific file
git checkout HEAD -- path/to/file.ts
```

---

## ⏱️ Time Estimates

| Task | Time | Priority |
|------|------|----------|
| Backend consolidation | 2h | P0 |
| API client merge | 4h | P0 |
| Environment rename | 2h | P1 |
| Security audit | 3h | P0 |
| Testing | 2h | P0 |
| **TOTAL CRITICAL** | **13h** | **~2 days** |

---

## 🎉 Success Criteria

✅ Refactoring is complete when:

1. No duplicate backend files
2. Single API client (apiClient.ts)
3. Clear environment config naming
4. All tests passing
5. Build succeeds with no errors
6. Successful dev deployment
7. All user flows working

---

**Last Updated:** February 7, 2026  
**Version:** 1.0  
**Status:** Ready to Use

---

## 📝 Quick Notes Space

Use this space for notes during refactoring:

```
Completed:
- [ ] 

In Progress:
- [ ] 

Issues Found:
- [ ] 

Next Steps:
- [ ] 
```
