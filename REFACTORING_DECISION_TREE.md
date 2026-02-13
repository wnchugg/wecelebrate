# JALA 2 Refactoring - Decision Tree
## Visual Guide for Making Refactoring Decisions

---

## 🌳 Main Decision Tree

```
START: Ready to refactor?
│
├─❓ Do you have uncommitted changes?
│  ├─ YES → Commit or stash first
│  └─ NO  → Continue ↓
│
├─❓ Are you on main/master branch?
│  ├─ YES → Create feature branch: git checkout -b refactor/pre-deployment
│  └─ NO  → Continue ↓
│
├─❓ Have you run the analysis script?
│  ├─ NO  → Run: ./scripts/analyze-codebase.sh
│  │       └─ Review output ↓
│  └─ YES → Continue ↓
│
├─❓ Analysis shows critical issues?
│  ├─ YES → Fix in this order:
│  │       1. Backend file duplication
│  │       2. API client consolidation  
│  │       3. Security audit
│  │       └─ Then continue ↓
│  └─ NO  → Continue ↓
│
├─❓ All tests currently passing?
│  ├─ NO  → Fix tests first, then continue
│  └─ YES → Proceed with refactoring ↓
│
└─ ✅ Ready to start! Follow REFACTORING_STEPS.md
```

---

## 🔀 Backend File Decision Tree

```
For each backend file:

❓ Does file have both .ts and .tsx versions?
│
├─ YES → ↓
│  │
│  ❓ Is this index.ts/index.tsx?
│  ├─ YES → KEEP BOTH
│  │       index.ts = thin wrapper
│  │       index.tsx = main logic
│  │
│  └─ NO → ↓
│     │
│     ❓ Does .tsx file contain JSX (<Component />)?
│     │
│     ├─ YES → DELETE .ts version
│     │        KEEP .tsx
│     │        (e.g., email_service.tsx)
│     │
│     └─ NO → DELETE .tsx version
│              KEEP .ts
│              (e.g., erp_integration.ts)
│
└─ NO → ↓
   │
   ❓ File is .tsx but no JSX inside?
   │
   ├─ YES → RENAME to .ts
   │
   └─ NO → KEEP AS IS
```

---

## 🔄 API Client Migration Decision Tree

```
For each file importing from lib/api:

❓ What are you importing?
│
├─ giftApi
│  ├─ .getAll() → apiClient.gifts.list()
│  ├─ .getById(id) → apiClient.gifts.get(id)
│  ├─ .getCategories() → apiClient.gifts.getCategories()
│  ├─ .search(q) → apiClient.gifts.list({ search: q })
│  └─ .initializeCatalog() → apiClient.gifts.initializeCatalog()
│
├─ orderApi
│  ├─ .create(data) → apiClient.orders.create(data)
│  ├─ .getById(id) → apiClient.orders.get(id)
│  ├─ .getUserOrders(userId) → apiClient.orders.getUserOrders(userId)
│  └─ .updateStatus(...) → apiClient.orders.update(id, { status, ... })
│
├─ Types (Gift, Order, OrderStatus)
│  └─ Import from: @/app/types/api.types
│
├─ ensureCatalogInitialized()
│  └─ Import from: @/app/lib/apiClient
│
└─ orderToHistoryItem()
   └─ Import from: @/app/lib/apiClient

⚠️ NOTE: Return types changed!
   OLD: Gift[] directly
   NEW: PaginatedResponse<Gift> with .data property
   
   FIX: const response = await apiClient.gifts.list();
        const gifts = response.data; // Array of gifts
```

---

## 🌍 Environment Config Decision Tree

```
❓ What kind of environment config do you need?

├─ Build-time configuration
│  (Feature flags, API timeout, analytics settings)
│  │
│  └─ Use: buildConfig.ts
│     Import: import { buildEnv } from '@/app/config/buildConfig';
│     Types: BuildEnvironment, BuildConfig
│     Usage: buildEnv.isDevelopment, buildEnv.hasFeature('...')
│
└─ Runtime Supabase project switching
   (Dev database vs Prod database)
   │
   └─ Use: deploymentEnvironments.ts
      Import: import { getCurrentEnvironment } from '@/app/config/deploymentEnvironments';
      Types: EnvironmentType, DeploymentEnvironment
      Usage: const env = getCurrentEnvironment();

❓ File imports 'EnvironmentConfig' - which one?
│
├─ From 'config/environment' → Rename to BuildConfig from buildConfig.ts
└─ From 'config/environments' → Rename to DeploymentEnvironment from deploymentEnvironments.ts
```

---

## 🧪 Testing Decision Tree

```
❓ What testing stage are you at?

├─ Before making changes
│  └─ Run full test suite to establish baseline
│     1. npm run test
│     2. npm run type-check
│     3. npm run lint
│     └─ All passing? → Proceed with refactoring
│
├─ During refactoring (after each major change)
│  └─ Quick validation
│     1. npm run type-check
│     2. Test affected feature manually
│     └─ Still works? → Continue
│
├─ After completing a module
│  └─ Module testing
│     1. npm run test
│     2. Test all features in that module
│     └─ Working? → Commit and continue
│
└─ After all refactoring
   └─ Full validation
      1. npm run test (all tests)
      2. npm run type-check
      3. npm run lint
      4. npm run build
      5. Manual test all features
      6. Check bundle size
      └─ All good? → Ready to deploy

❓ Test failed?
│
├─ TypeScript error
│  └─ Fix type imports and definitions
│
├─ Import error
│  └─ Update import paths
│
├─ Runtime error
│  └─ Check method name changes (giftApi → apiClient.gifts)
│
└─ Logic error
   └─ Check return type changes (direct array vs paginated response)
```

---

## 🚀 Deployment Decision Tree

```
❓ Ready to deploy?

├─ All tests passing?
│  ├─ NO → Fix tests first
│  └─ YES → Continue ↓
│
├─ Build succeeds?
│  ├─ NO → Fix build errors
│  └─ YES → Continue ↓
│
├─ Manual testing complete?
│  ├─ NO → Complete manual testing
│  └─ YES → Continue ↓
│
├─ Code reviewed?
│  ├─ NO → Request code review
│  └─ YES → Continue ↓
│
└─ ✅ Ready to deploy!
   │
   ❓ Which environment?
   │
   ├─ Development
   │  └─ 1. Deploy backend
   │     2. Deploy frontend
   │     3. Smoke test
   │     4. Monitor logs
   │
   ├─ Staging
   │  └─ 1. Deploy backend
   │     2. Deploy frontend
   │     3. Full feature testing
   │     4. Performance check
   │     5. Monitor logs
   │
   └─ Production
      └─ 1. Final staging test
         2. Backup current version
         3. Deploy backend
         4. Deploy frontend
         5. Immediate smoke test
         6. Monitor logs closely
         7. Keep rollback ready

❓ Deployment failed?
│
├─ Backend error
│  └─ Check server logs
│     Fix and redeploy backend
│
├─ Frontend error
│  └─ Check console errors
│     Fix and redeploy frontend
│
└─ Both working but features broken
   └─ Check API endpoint changes
      Verify environment configs
```

---

## 🔒 Security Audit Decision Tree

```
❓ What to audit?

├─ Frontend code
│  │
│  ❓ Contains SUPABASE_SERVICE_ROLE_KEY?
│  ├─ YES → ⚠️ CRITICAL! Remove immediately
│  └─ NO → ✅ Continue ↓
│  │
│  ❓ Contains hardcoded JWT tokens?
│  ├─ YES → Move to environment config or remove
│  └─ NO → ✅ Continue ↓
│  │
│  ❓ User input properly validated?
│  ├─ NO → Add validation (Zod schemas)
│  └─ YES → ✅ Continue ↓
│  │
│  ❓ Using dangerouslySetInnerHTML?
│  ├─ YES → Sanitize input or use safer method
│  └─ NO → ✅ Frontend secure
│
├─ Backend code
│  │
│  ❓ CORS properly configured?
│  ├─ NO → Set proper ALLOWED_ORIGINS
│  └─ YES → ✅ Continue ↓
│  │
│  ❓ Rate limiting enabled?
│  ├─ NO → Enable rate limiting middleware
│  └─ YES → ✅ Continue ↓
│  │
│  ❓ Input sanitization active?
│  ├─ NO → Add sanitize middleware
│  └─ YES → ✅ Continue ↓
│  │
│  ❓ Authentication required for admin routes?
│  ├─ NO → Add verifyAdmin middleware
│  └─ YES → ✅ Backend secure
│
└─ API communication
   │
   ❓ Using HTTPS?
   ├─ NO → ⚠️ Enable HTTPS
   └─ YES → ✅ Continue ↓
   │
   ❓ Tokens stored securely?
   ├─ NO → Use sessionStorage/cookies with httpOnly
   └─ YES → ✅ API secure
```

---

## 📁 File Organization Decision Tree

```
❓ Where should this file go?

├─ Is it documentation (.md)?
│  │
│  ├─ Architecture docs → /docs/architecture/
│  ├─ Deployment guides → /docs/deployment/
│  ├─ Feature specs → /docs/features/
│  ├─ Fix summaries → /docs/fixes/
│  ├─ Testing docs → /docs/testing/
│  ├─ Compliance docs → /docs/compliance/
│  └─ Main README → /README.md (root)
│
├─ Is it a script (.sh, .js)?
│  │
│  ├─ Deployment scripts → /scripts/deployment/
│  ├─ Migration scripts → /scripts/migration/
│  ├─ Testing scripts → /scripts/testing/
│  └─ Utility scripts → /scripts/
│
├─ Is it configuration?
│  │
│  ├─ Build config → Root (tsconfig.json, vite.config.ts, etc.)
│  ├─ App config → /src/app/config/
│  └─ Backend config → /supabase/functions/server/
│
└─ Is it source code?
   │
   ├─ Frontend → /src/app/
   │  ├─ Components → /src/app/components/
   │  ├─ Pages → /src/app/pages/
   │  ├─ Context → /src/app/context/
   │  ├─ Hooks → /src/app/hooks/
   │  ├─ Utils → /src/app/utils/
   │  └─ Types → /src/app/types/
   │
   └─ Backend → /supabase/functions/server/
      ├─ Main logic → .ts files
      ├─ JSX templates → .tsx files
      └─ Tests → /tests/
```

---

## 🎯 Priority Decision Tree

```
❓ What should I work on first?

START with highest priority critical issues:

P0 (Must fix before deployment):
├─ 1. Backend file duplication
├─ 2. API client consolidation
└─ 3. Security audit

└─ All P0 complete?
   │
   ├─ NO → Continue with P0 items
   └─ YES → Move to P1 ↓

P1 (Should fix before deployment):
├─ 4. Environment config rename
├─ 5. Type safety improvements
└─ 6. Remove debug console.logs

└─ All P1 complete?
   │
   ├─ NO → Continue with P1 items
   └─ YES → Deploy or continue to P2 ↓

P2 (Fix post-deployment):
├─ 7. Root directory cleanup
├─ 8. Documentation consolidation
├─ 9. Performance optimizations
└─ 10. Test coverage expansion

❓ Time constraint?
│
├─ Less than 1 day → Do only P0
├─ Less than 2 days → Do P0 + P1
└─ More than 2 days → Do P0 + P1 + selected P2
```

---

## 🤔 Common Scenarios

### Scenario 1: Found a duplicate file

```
❓ File exists as both .ts and .tsx?
└─ Follow "Backend File Decision Tree" above
```

### Scenario 2: Import error after refactoring

```
❓ Module not found error?
├─ Check if you deleted the old file
├─ Did you update the import path?
└─ Is the new module exported correctly?
```

### Scenario 3: Type error after API consolidation

```
❓ Property doesn't exist on type?
├─ Did you change from giftApi to apiClient.gifts?
├─ Did you handle PaginatedResponse.data?
└─ Did you update the type import?
```

### Scenario 4: Environment config confusion

```
❓ Which environment config should I use?
└─ Follow "Environment Config Decision Tree" above
```

### Scenario 5: Ready to deploy but uncertain

```
❓ Should I deploy now?
└─ Follow "Deployment Decision Tree" above
```

---

## 📊 Quick Reference Matrix

| If you need to... | Do this... |
|-------------------|------------|
| Fix duplicate backend files | Follow Backend File Decision Tree |
| Update API call | Follow API Client Migration Tree |
| Import environment config | Follow Environment Config Decision Tree |
| Run tests | Follow Testing Decision Tree |
| Deploy | Follow Deployment Decision Tree |
| Check security | Follow Security Audit Decision Tree |
| Organize files | Follow File Organization Decision Tree |
| Prioritize work | Follow Priority Decision Tree |

---

## 💡 Pro Tips

1. **When in doubt, run the analysis script:**
   ```bash
   ./scripts/analyze-codebase.sh
   ```

2. **Make one change at a time:**
   - Fix all backend files → Test
   - Merge API clients → Test  
   - Rename configs → Test

3. **Commit frequently:**
   ```bash
   git add .
   git commit -m "fix: consolidate backend files"
   ```

4. **Keep refactoring branch clean:**
   - Don't mix refactoring with new features
   - Don't fix bugs unrelated to refactoring
   - Stay focused on the plan

5. **Document decisions:**
   - Note why you made changes
   - Update CHANGELOG.md
   - Add comments for complex changes

---

**Version:** 1.0  
**Created:** February 7, 2026  
**Last Updated:** February 7, 2026  
**Status:** Ready to Use

---

## 🎯 Your Current Position

Mark where you are in the refactoring process:

```
[ ] Haven't started - Review this document first
[ ] Planning phase - Using decision trees to plan
[ ] In progress - Actively refactoring
[ ] Testing phase - Validating changes
[ ] Deployment phase - Ready to deploy
[ ] Complete - Refactoring done!
```
