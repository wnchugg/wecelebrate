# Site Key Pattern Fix - "No Sites Configured" Issue Resolution

## Problem
After logging in, users were seeing "no sites configured" even though the database was seeded with sites. This was because the backend was using inconsistent key patterns to store and retrieve sites.

## Root Cause
The application underwent a migration from simple key patterns to environment-aware key patterns:
- **Old pattern**: `sites:${siteId}` and `clients:${clientId}`
- **New pattern**: `site:${environmentId}:${siteId}` and `client:${environmentId}:${clientId}`

However, there were **duplicate endpoints** in `/supabase/functions/server/index.tsx` that were still using the old patterns, while the seed function and migrated CRUD routes were using the new patterns. This caused a mismatch where:
1. Sites were being **stored** with keys like `site:development:site-001`
2. Sites were being **queried** with patterns like `sites:` (missing environment ID and using plural form)

## Files Fixed
Fixed `/supabase/functions/server/index.tsx` with the following changes:

### 1. Public Sites Endpoint (Line ~2551)
**Before**: `kv.getByPrefix('sites:', environmentId)`  
**After**: `kv.getByPrefix('site:', environmentId)`

### 2. Public Site by ID Endpoint (Line ~2589)
**Before**: `kv.get('sites:${siteId}', environmentId)`  
**After**: `kv.get('site:${environmentId}:${siteId}', environmentId)`

### 3. Public Environments Endpoint (Line ~899)
**Before**: `kv.getByPrefix('sites:', environmentId)`  
**After**: `kv.getByPrefix('site:', environmentId)`

**Also fixed clients**: 
**Before**: `kv.getByPrefix('clients:', environmentId)`  
**After**: `kv.getByPrefix('client:', environmentId)`

### 4. Manual Reseed Cleanup (Lines ~3991-3998)
**Sites**:
- **Before**: `kv.getByPrefix('sites:', environmentId)` and `kv.del('sites:${site.id}')`  
- **After**: `kv.getByPrefix('site:', environmentId)` and `kv.del('site:${environmentId}:${site.id}')`

**Clients**:
- **Before**: `kv.getByPrefix('clients:', environmentId)` and `kv.del('clients:${client.id}')`  
- **After**: `kv.getByPrefix('client:', environmentId)` and `kv.del('client:${environmentId}:${client.id}')`

### 5. Public Gifts Endpoint Site Lookup (Line ~5317)
**Before**: `kv.get('sites:${siteId}', environmentId)`  
**After**: `kv.get('site:${environmentId}:${siteId}', environmentId)`

## Key Pattern Reference
For future development, always use these patterns:

| Resource | Get All (Prefix) | Get One (Key) |
|----------|------------------|---------------|
| Clients  | `client:` | `client:${environmentId}:${clientId}` |
| Sites    | `site:` | `site:${environmentId}:${siteId}` |
| Gifts    | `gift:` | `gift:${environmentId}:${giftId}` |
| Products | `product:` | `product:${environmentId}:${productId}` |

**Note**: Use singular form (client, site) not plural (clients, sites)

## Verification
After these fixes:
1. The Initial Seed page successfully creates sites with the correct key pattern
2. Admin login loads sites correctly from the database
3. Site selection page displays available sites
4. Public endpoints can find sites by ID

## Related Files
- ✅ `/supabase/functions/server/index.tsx` - Fixed (this fix)
- ✅ `/supabase/functions/server/seed.ts` - Already correct
- ✅ `/supabase/functions/server/migrated_resources.ts` - Already correct  
- ✅ `/supabase/functions/server/resources/clients.ts` - Already correct
- ✅ `/supabase/functions/server/resources/sites.ts` - Already correct

## Impact
This fix ensures that:
- Sites created during initial seed are properly retrieved after admin login
- All CRUD operations use consistent key patterns
- Environment isolation works correctly
- No more "no sites configured" errors when sites exist in the database
