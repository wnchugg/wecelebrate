# JALA 2 Refactoring - Step-by-Step Guide
## Detailed Implementation Instructions

---

## 🎯 STEP 1: Backend File Consolidation (Est: 2 hours)

### 1.1 Analyze Current State

**Check which files have both .ts and .tsx:**

```bash
cd /supabase/functions/server
ls -la *.ts *.tsx | sort
```

**Expected Output:**
```
erp_integration.ts
erp_integration.tsx
erp_scheduler.ts
erp_scheduler.tsx
index.ts
index.tsx
kv_env.ts
kv_env.tsx
security.ts
security.tsx
seed.ts
seed.tsx
email_service.tsx (only)
gifts_api.ts (only)
```

### 1.2 Decision Matrix

| File | Keep Extension | Reason | Action |
|------|---------------|---------|--------|
| `index` | .ts + .tsx | Supabase requires .ts, code in .tsx | Keep both |
| `email_service` | .tsx | Contains JSX for emails | Keep .tsx only |
| `gifts_api` | .ts | No JSX | Keep .ts only |
| `erp_integration` | .ts | No JSX | DELETE .tsx, keep .ts |
| `erp_scheduler` | .ts | No JSX | DELETE .tsx, keep .ts |
| `kv_env` | .ts | No JSX | DELETE .tsx, keep .ts |
| `security` | .ts | No JSX | DELETE .tsx, keep .ts |
| `seed` | .ts | No JSX | DELETE .tsx, keep .ts |

### 1.3 Verify No JSX in Files

Before deleting .tsx files, verify they don't contain JSX:

```bash
# Check for JSX elements
grep -l "<[A-Z]" erp_integration.tsx erp_scheduler.tsx kv_env.tsx security.tsx seed.tsx
```

If this returns nothing, safe to delete.

### 1.4 Update index.tsx Imports

**Before (index.tsx):**
```typescript
import { seedDatabase } from "./seed.ts";
import { rateLimit, securityHeaders, ... } from "./security.ts";
import * as kv from "./kv_env.ts";
import * as erp from "./erp_integration.ts";
import * as scheduler from "./erp_scheduler.ts";
import * as giftsApi from "./gifts_api.ts";
import * as emailService from "./email_service.tsx";
```

**After (no change needed - already correct):**
✅ Already importing from .ts files

### 1.5 Check Other Backend Files

Search for imports from .tsx files:

```bash
cd /supabase/functions/server
grep -r "\.tsx" *.ts *.tsx | grep import
```

Update any found to use .ts

### 1.6 Delete Duplicate Files

**CRITICAL: Only delete after verifying imports are updated**

```bash
# DO NOT RUN YET - verify first!
# rm erp_integration.tsx
# rm erp_scheduler.tsx
# rm kv_env.tsx
# rm security.tsx
# rm seed.tsx
```

### 1.7 Testing

1. Build the function locally (if possible)
2. Check imports resolve correctly
3. Deploy to dev and test health endpoint

---

## 🎯 STEP 2: Consolidate API Clients (Est: 4 hours)

### 2.1 Find All Files Using Old API

```bash
cd /src/app
grep -r "from '@/app/lib/api'" . --include="*.tsx" --include="*.ts"
grep -r "from './lib/api'" . --include="*.tsx" --include="*.ts"
grep -r 'from "../lib/api' . --include="*.tsx" --include="*.ts"
```

### 2.2 Compare API Implementations

**Methods in api.ts NOT in apiClient.ts:**

1. ✅ `giftApi.initializeCatalog()` - POST /gifts/initialize
2. ✅ `giftApi.getCategories()` - GET /gifts/categories/list
3. ✅ `orderToHistoryItem()` - Helper function
4. ✅ `ensureCatalogInitialized()` - Helper function

**Methods in apiClient.ts NOT in api.ts:**
- Full auth module ✅
- Full clients module ✅
- Full sites module ✅
- Full employees module ✅
- Validation module ✅
- Better typing ✅

### 2.3 Add Missing Methods to apiClient.ts

**Location:** After line 476 in `/src/app/lib/apiClient.ts`

```typescript
// Add to gifts module (around line 469)
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

**Add helper functions after apiClient object (around line 615):**

```typescript
// ===== Helper Functions =====

/**
 * Convert Order to OrderHistoryItem format
 */
export function orderToHistoryItem(order: Order): OrderHistoryItem {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderDate: order.orderDate,
    status: order.status,
    gift: {
      id: order.gift.id,
      name: order.gift.name,
      image: order.gift.image,
      category: order.gift.category
    },
    quantity: order.quantity,
    estimatedDelivery: order.estimatedDelivery
  };
}

/**
 * Helper to ensure catalog is initialized
 */
let catalogInitialized = false;

export async function ensureCatalogInitialized(): Promise<void> {
  if (catalogInitialized) return;
  
  try {
    // Try to get gifts first - if empty, initialize
    const response = await apiClient.gifts.list({ limit: 1 });
    
    if (response.data.length === 0) {
      console.log('Initializing gift catalog...');
      await apiClient.gifts.initializeCatalog();
      catalogInitialized = true;
      console.log('Gift catalog initialized successfully');
    } else {
      catalogInitialized = true;
      console.log(`Gift catalog already has ${response.total} gifts`);
    }
  } catch (error) {
    console.error('Failed to initialize catalog:', error);
    // Don't throw - allow app to continue with empty catalog
  }
}
```

**Add OrderHistoryItem type to api.types.ts:**

```typescript
export interface OrderHistoryItem {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  gift: {
    id: string;
    name: string;
    image: string;
    category: string;
  };
  quantity: number;
  estimatedDelivery: string;
}
```

### 2.4 Update CatalogInitializer Component

**File:** `/src/app/components/CatalogInitializer.tsx`

**Before:**
```typescript
import { ensureCatalogInitialized } from '@/app/lib/api';
```

**After:**
```typescript
import { ensureCatalogInitialized } from '@/app/lib/apiClient';
```

### 2.5 Find and Update All Gift/Order API Calls

**Search pattern:**
```bash
grep -r "giftApi\." /src/app --include="*.tsx" --include="*.ts"
grep -r "orderApi\." /src/app --include="*.tsx" --include="*.ts"
```

**Migration mapping:**

| Old API | New API |
|---------|---------|
| `giftApi.getAll()` | `apiClient.gifts.list()` |
| `giftApi.getById(id)` | `apiClient.gifts.get(id)` |
| `giftApi.getCategories()` | `apiClient.gifts.getCategories()` |
| `giftApi.search(query)` | `apiClient.gifts.list({ search: query })` |
| `giftApi.initializeCatalog()` | `apiClient.gifts.initializeCatalog()` |
| `orderApi.create(data)` | `apiClient.orders.create(data)` |
| `orderApi.getById(id)` | `apiClient.orders.get(id)` |
| `orderApi.getUserOrders(userId)` | Need to add this method |
| `orderApi.updateStatus(...)` | `apiClient.orders.update(...)` |

**Note:** Return types differ slightly:
- Old: `Gift[]` directly
- New: `PaginatedResponse<Gift>` with `{ data: Gift[], total, page, limit }`

### 2.6 Add Missing Order Method

```typescript
// In apiClient.orders module
async getUserOrders(userId: string): Promise<Order[]> {
  const response = await apiRequest<{ success: true; data: Order[] }>(
    `/users/${userId}/orders`,
    { requireAuth: true }
  );
  return response.data;
},
```

### 2.7 Update Import Statements

Create a search and replace list:

```typescript
// Old imports
import { giftApi, orderApi } from '@/app/lib/api';
import { ensureCatalogInitialized } from '@/app/lib/api';
import type { Gift, Order } from '@/app/lib/api';

// New imports
import { apiClient } from '@/app/lib/apiClient';
import { ensureCatalogInitialized } from '@/app/lib/apiClient';
import type { Gift, Order } from '@/app/types/api.types';
```

### 2.8 Delete Old API File

**CRITICAL: Only after all imports updated and tested**

```bash
# Verify no remaining references
grep -r "from '@/app/lib/api'" /src/app

# If clean, delete
# rm /src/app/lib/api.ts
```

### 2.9 Testing Checklist

- [ ] Gift catalog loads
- [ ] Gift filtering works
- [ ] Gift detail page works
- [ ] Order creation works
- [ ] Order tracking works
- [ ] Order history works
- [ ] Admin gift management works

---

## 🎯 STEP 3: Environment Configuration Refactor (Est: 2 hours)

### 3.1 Rename Files

**Option A: Manual Rename**

1. Create new files with new names
2. Copy content
3. Update types/interfaces
4. Update imports
5. Delete old files

**Option B: Git Rename (preserves history)**

```bash
git mv /src/app/config/environment.ts /src/app/config/buildConfig.ts
git mv /src/app/config/environments.ts /src/app/config/deploymentEnvironments.ts
```

### 3.2 Update buildConfig.ts (formerly environment.ts)

**Changes needed:**

```typescript
// OLD
export type Environment = 'development' | 'staging' | 'production';
export interface EnvironmentConfig { ... }
export const env = { ... }

// NEW
export type BuildEnvironment = 'development' | 'staging' | 'production';
export interface BuildConfig { ... }
export const buildEnv = { ... }

// Update all references inside file
function detectEnvironment(): BuildEnvironment { ... }
function getEnvironmentConfig(): BuildConfig { ... }
```

### 3.3 Update deploymentEnvironments.ts (formerly environments.ts)

**Changes needed:**

```typescript
// OLD
export interface EnvironmentConfig { ... }

// NEW
export interface DeploymentEnvironment { ... }

// Update all usages
const fallbackEnvironments: Record<string, DeploymentEnvironment> = { ... }
```

### 3.4 Find All Import References

```bash
grep -r "from '@/app/config/environment'" /src/app
grep -r "from '@/app/config/environments'" /src/app
grep -r "import.*environment" /src/app | grep config
```

### 3.5 Update Imports

**Pattern 1: Build environment**
```typescript
// OLD
import { env } from '@/app/config/environment';
import type { Environment, EnvironmentConfig } from '@/app/config/environment';

// NEW
import { buildEnv } from '@/app/config/buildConfig';
import type { BuildEnvironment, BuildConfig } from '@/app/config/buildConfig';
```

**Pattern 2: Deployment environment**
```typescript
// OLD
import { getCurrentEnvironment } from '@/app/config/environments';
import type { EnvironmentConfig } from '@/app/config/environments';

// NEW
import { getCurrentEnvironment } from '@/app/config/deploymentEnvironments';
import type { DeploymentEnvironment } from '@/app/config/deploymentEnvironments';
```

### 3.6 Update apiClient.ts

This file uses both! Update carefully:

```typescript
// Line 61
import { getCurrentEnvironment } from '@/app/config/deploymentEnvironments';

// Usage at line 73
const env = getCurrentEnvironment(); // This is DeploymentEnvironment
```

### 3.7 Testing

- [ ] App builds without errors
- [ ] Environment detection works
- [ ] Environment switcher works
- [ ] Build config feature flags work

---

## 🎯 STEP 4: Security Audit (Est: 3 hours)

### 4.1 Frontend Secret Check

```bash
# Should return NOTHING
grep -r "SUPABASE_SERVICE_ROLE_KEY" /src/app
grep -r "service_role" /src/app

# Verify only anon key used
grep -r "SUPABASE.*KEY" /src/app
```

### 4.2 CORS Configuration Check

**File:** `/supabase/functions/server/index.tsx`

**Verify:**
- [ ] ALLOWED_ORIGINS environment variable is set
- [ ] Origin validation logic is correct
- [ ] Credentials set to false (or properly handled)

### 4.3 Form Input Sanitization

**Files to check:**
- All admin forms
- User validation forms
- Shipping information forms

**Verify:**
- [ ] React Hook Form validation
- [ ] Zod schema validation
- [ ] Backend sanitization middleware

### 4.4 Rate Limiting Test

```bash
# Test rate limiting on login endpoint
for i in {1..20}; do
  curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/auth/login \
    -H "Content-Type: application/json" \
    -d '{"emailOrUsername":"test","password":"test"}'
  sleep 0.1
done
```

Should see 429 Too Many Requests after threshold.

### 4.5 XSS Prevention Check

**Test user inputs:**
```javascript
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
';DROP TABLE users;--
```

**Verify:**
- [ ] Inputs are escaped in display
- [ ] React automatically escapes (should be default)
- [ ] No dangerouslySetInnerHTML usage (or properly sanitized)

### 4.6 Authentication Flow Audit

**Verify:**
- [ ] Admin login requires valid JWT
- [ ] JWT expires appropriately
- [ ] Logout clears tokens
- [ ] Protected routes check authentication
- [ ] No token leakage in console/logs

---

## 🎯 STEP 5: Testing & Verification (Est: 2 hours)

### 5.1 Run Automated Tests

```bash
npm run test
npm run type-check
npm run lint
```

### 5.2 Build Tests

```bash
# Development build
npm run build

# Staging build
npm run build:staging

# Production build
npm run build:production

# Check bundle size
ls -lh dist/assets/
```

### 5.3 Manual Testing Checklist

#### Public User Flow
- [ ] Landing page loads
- [ ] Site selection works
- [ ] Access validation works
- [ ] Gift selection loads gifts
- [ ] Gift detail shows details
- [ ] Shipping information form validates
- [ ] Review order shows summary
- [ ] Order confirmation displays
- [ ] Order tracking works

#### Admin Dashboard
- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Client management CRUD works
- [ ] Site management CRUD works
- [ ] Gift management CRUD works
- [ ] Employee management works
- [ ] Order management works
- [ ] Email templates work
- [ ] Environment switcher works

#### Email System
- [ ] Order confirmation email sends
- [ ] Shipping notification email sends
- [ ] Delivery confirmation email sends

### 5.4 Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## 🎯 STEP 6: Documentation Update (Est: 1 hour)

### 6.1 Update ARCHITECTURE.md

Add section about refactoring changes:
- API client consolidation
- Environment configuration structure
- Backend file organization

### 6.2 Update API Documentation

**File:** `/supabase/functions/server/API_DOCUMENTATION.md`

Verify all endpoints are documented.

### 6.3 Update Deployment Guide

**File:** `/DEPLOYMENT_GUIDE.md`

Update with any new steps or changes.

### 6.4 Create CHANGELOG.md

Document all refactoring changes:

```markdown
# Changelog

## [2.0.1] - 2026-02-07 - Pre-Deployment Refactor

### Changed
- Consolidated duplicate API clients into single implementation
- Renamed environment configuration files for clarity
- Standardized backend file extensions
- Improved type safety across codebase

### Removed
- `/src/app/lib/api.ts` (merged into apiClient.ts)
- Duplicate backend `.tsx` files

### Fixed
- Import confusion from duplicate files
- Environment configuration naming conflicts
```

---

## ✅ Final Checklist

### Before Merge
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Build succeeds
- [ ] Bundle size acceptable
- [ ] All manual tests passing

### Merge
- [ ] Create pull request
- [ ] Code review
- [ ] Merge to main

### Deploy
- [ ] Deploy to dev environment
- [ ] Smoke test dev
- [ ] Deploy to production
- [ ] Smoke test production
- [ ] Monitor for errors

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify email sending
- [ ] User acceptance testing

---

## 🚨 Rollback Plan

If issues arise:

1. **Immediate rollback:**
   ```bash
   git revert <refactor-commit-hash>
   git push
   ```

2. **Redeploy previous version:**
   - Deploy last known good commit
   - Verify functionality

3. **Investigate issues:**
   - Check error logs
   - Identify breaking change
   - Fix forward or stay rolled back

---

## 📞 Support

If stuck during refactoring:

1. **Check this guide** - detailed steps above
2. **Review REFACTORING_PLAN.md** - high-level overview
3. **Git diff** - see what changed
4. **Test incrementally** - don't change everything at once

---

**Document Version:** 1.0  
**Created:** February 7, 2026  
**Last Updated:** February 7, 2026  
**Status:** Ready to Execute
