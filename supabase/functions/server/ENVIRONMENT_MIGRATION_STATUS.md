# Environment-Aware Backend Migration Status

## ✅ COMPLETED

### Infrastructure
- ✅ Created `/supabase/functions/server/kv_env.tsx` - Environment-aware KV store wrapper
- ✅ Updated imports in `index.tsx` to use `kv_env.tsx` instead of `kv_store.tsx`
- ✅ Added `X-Environment-ID` to CORS allowed headers
- ✅ Updated `verifyAdmin` middleware to pass `environmentId` through context
- ✅ Created `getSupabaseClient(environmentId)` helper function

### Auth Endpoints (CRITICAL - ALL UPDATED)
- ✅ `/health` - Now environment-aware
- ✅ `/test-db` - Now environment-aware  
- ✅ `/bootstrap/create-admin` - Now environment-aware
- ✅ `/public/environments` - Now environment-aware
- ✅ `/auth/signup` - Now environment-aware (uses correct Supabase client + KV)
- ✅ `/auth/login` - Now environment-aware (uses correct Supabase client + KV)
- ✅ `/auth/password-reset` - Now environment-aware
- ✅ `/auth/session` - Now environment-aware
- ⚠️  `/auth/logout` - Needs update

### Protected Endpoints (PARTIAL)
- ✅ `/clients` GET - Updated
- ⚠️  All other client/site/gift/order endpoints need `environmentId` passed to KV operations

## ⚠️ REMAINING WORK

### Pattern for Protected Endpoints:
All protected endpoints that use `verifyAdmin` middleware now have access to:
```typescript
const environmentId = c.get('environmentId') || 'development';
```

This needs to be added to EVERY KV operation in protected endpoints:
```typescript
// OLD:
const client = await kv.get(`clients:${id}`);

// NEW:
const environmentId = c.get('environmentId') || 'development';
const client = await kv.get(`clients:${id}`, environmentId);
```

### Endpoints Still Needing Updates (40+):
1. All `/clients/*` endpoints (create, update, delete, get by ID)
2. All `/sites/*` endpoints  
3. All `/public/sites/*` endpoints (needs X-Environment-ID header)
4. All `/gifts/*` endpoints
5. All `/orders/*` endpoints
6. All `/config/environments/*` endpoints (these should probably use development only)
7. All `/dev/*` endpoints
8. All ERP integration endpoints

### Special Cases:

#### Environment Config Endpoints
The `/config/environments/*` endpoints manage environment configurations themselves.
These should probably ALWAYS use the development environment KV store, not be environment-aware.

#### Public Endpoints
Public endpoints like `/public/sites/:siteId/gifts` need to extract:
```typescript
const environmentId = c.req.header('X-Environment-ID') || 'development';
```

## 🚀 DEPLOYMENT INSTRUCTIONS

### Prerequisites
You MUST set this environment variable in PRODUCTION Supabase project:
```
SUPABASE_SERVICE_ROLE_KEY_PROD=<production_service_role_key>
```

### Steps:
1. Copy entire `/supabase/functions/server/` folder
2. Deploy to **Development** Supabase (wjfcqqrlhwdvjmefxky)
3. Deploy to **Production** Supabase (lmffeqwhrnbsbhdztwyv)
4. Set `SUPABASE_SERVICE_ROLE_KEY_PROD` in Production environment variables

## 🔍 TESTING

### Test Development Environment:
```bash
curl -H "X-Environment-ID: development" \
     https://wjfcqqrlhwdvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

### Test Production Environment:  
```bash
curl -H "X-Environment-ID: production" \
     https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health
```

## ⚡ QUICK FIX NEEDED

The fastest way to complete this migration is to:
1. Search for all `await kv.` calls in protected endpoints
2. Add `const environmentId = c.get('environmentId') || 'development';` at the start
3. Pass `environmentId` as the last parameter to every KV call

Total estimated changes: ~50 lines need the environmentId variable added, ~60 KV calls need the parameter added.
