# Authentication & Multi-Tenant Integration Guide

**Status:** Middleware created ✅, Integration pending ⏳  
**Estimated Time:** 1-2 hours

---

## Current Status

### ✅ Completed
- Authentication middleware created (`middleware/auth.ts`)
- Multi-tenant isolation middleware created (`middleware/tenant.ts`)
- Error handling middleware created (`middleware/errorHandler.ts`)
- Rate limiting middleware created (`middleware/rateLimit.ts`)

### ⏳ Pending
- Integration into `index.tsx`
- Update API endpoints to use tenant filtering
- Testing the integration

---

## Integration Steps

### Step 1: Update index.tsx (30 minutes)

Add the new middleware to the main application file:

```typescript
// At the top of index.tsx, add imports:
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.ts';
import { tenantIsolationMiddleware } from './middleware/tenant.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { ipRateLimit, userRateLimit } from './middleware/rateLimit.ts';

// After creating the app, add global middleware:
const app = new Hono();

// Global error handler
app.onError(errorHandler);

// Global rate limiting (per IP)
app.use('*', ipRateLimit);

// Public routes (no auth required)
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/public/*', optionalAuthMiddleware);  // Optional auth for public endpoints

// Protected routes (auth required)
app.use('/api/*', authMiddleware);  // Require authentication
app.use('/api/*', tenantIsolationMiddleware);  // Enforce tenant isolation
app.use('/api/*', userRateLimit);  // Rate limit by user

// Continue with existing route registration...
```

### Step 2: Update API Endpoints to Use Tenant Context (30 minutes)

Each API endpoint needs to use the tenant context for filtering. Here's an example:

**Before (gifts_api_v2.ts):**
```typescript
app.get('/api/products', async (c) => {
  const products = await db.getProducts();
  return c.json({ success: true, products });
});
```

**After (with tenant filtering):**
```typescript
import { getTenantContext } from './middleware/auth.ts';
import { applyTenantFilters } from './middleware/tenant.ts';

app.get('/api/products', async (c) => {
  // Get tenant context from middleware
  const filters = applyTenantFilters(c, {
    // Any additional filters from query params
    category: c.req.query('category'),
    status: c.req.query('status'),
  });
  
  const products = await db.getProducts(filters);
  return c.json({ success: true, products });
});
```

### Step 3: Update Database Functions (Optional)

The database functions already support filtering by `client_id` and `site_id`. No changes needed if you use `applyTenantFilters`.

### Step 4: Test the Integration (30 minutes)

Create a test script to verify authentication and tenant isolation:

```typescript
// test_auth_integration.ts
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

async function testAuth() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // 1. Test without authentication (should fail)
  console.log('Test 1: No auth token');
  const response1 = await fetch(`${supabaseUrl}/functions/v1/server/api/products`);
  console.log('Status:', response1.status); // Should be 401
  
  // 2. Test with authentication
  console.log('\nTest 2: With auth token');
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password',
  });
  
  const response2 = await fetch(`${supabaseUrl}/functions/v1/server/api/products`, {
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
    },
  });
  console.log('Status:', response2.status); // Should be 200
  const data2 = await response2.json();
  console.log('Products:', data2.products?.length);
  
  // 3. Test tenant isolation
  console.log('\nTest 3: Tenant isolation');
  // Products should only show for user's tenant
  console.log('User client_id:', session?.user.user_metadata.client_id);
  console.log('Products returned:', data2.products?.length);
}

testAuth();
```

---

## Quick Integration (Minimal Changes)

If you want to integrate quickly without modifying all endpoints:

### Option A: Add Middleware Only (15 minutes)

Just add the middleware to `index.tsx` without modifying individual endpoints:

```typescript
// In index.tsx
import { authMiddleware } from './middleware/auth.ts';
import { ipRateLimit } from './middleware/rateLimit.ts';
import { errorHandler } from './middleware/errorHandler.ts';

app.onError(errorHandler);
app.use('*', ipRateLimit);
app.use('/api/*', authMiddleware);

// Existing routes continue to work
// They just now require authentication
```

**Pros:**
- Quick to implement
- Adds authentication immediately
- No endpoint changes needed

**Cons:**
- Tenant isolation not enforced yet
- Need to update endpoints later

### Option B: Full Integration (1-2 hours)

Follow all steps above for complete authentication and tenant isolation.

**Pros:**
- Complete security implementation
- Tenant isolation enforced
- Production-ready

**Cons:**
- Takes longer
- Requires testing each endpoint

---

## Testing Checklist

After integration, test:

- [ ] Health endpoint works without auth
- [ ] API endpoints require authentication
- [ ] Invalid tokens are rejected (401)
- [ ] Expired tokens are rejected (401)
- [ ] Rate limiting works (429 after limit)
- [ ] Tenant isolation works (users only see their data)
- [ ] Error messages are safe (no sensitive data)
- [ ] All existing tests still pass

---

## Rollout Strategy

### Phase 1: Add Authentication (Day 1)
- Add `authMiddleware` to `/api/*` routes
- Test authentication works
- Verify existing functionality

### Phase 2: Add Tenant Isolation (Day 2)
- Add `tenantIsolationMiddleware`
- Update endpoints to use `applyTenantFilters`
- Test tenant isolation

### Phase 3: Add Rate Limiting (Day 3)
- Add rate limiting middleware
- Test rate limits
- Monitor for issues

### Phase 4: Production (Day 4+)
- Deploy to production
- Monitor closely
- Adjust as needed

---

## Summary

**What's Done:** ✅
- All middleware code written
- All helper functions created
- Documentation complete

**What's Needed:** ⏳
- Add middleware to `index.tsx` (15-30 min)
- Update endpoints to use tenant filtering (30-60 min)
- Test integration (30 min)

**Total Time:** 1-2 hours

**Recommendation:** Start with Option A (middleware only) for quick authentication, then do full integration (Option B) before production deployment.
