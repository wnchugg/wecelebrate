# Database Not Initialized Error - Fixed

## Problem

After deploying to development, the frontend showed "database may not be initialized" error. The console logs showed:

```
[PublicSiteContext] No sites available - database may not be initialized
```

## Root Cause

The `/public/sites` endpoint was still using the KV store instead of the PostgreSQL database:

```typescript
// OLD CODE in migrated_resources.ts
const allSites = await kv.getByPrefix('site:', environmentId);
```

The database tables exist and v2 endpoints work fine, but the public sites endpoint hadn't been migrated to use the database.

## Solution

### 1. Created Database-Backed Public Sites Endpoint

Added `getPublicSitesV2` function in `supabase/functions/server/endpoints_v2.ts`:

```typescript
export async function getPublicSitesV2(c: Context) {
  try {
    console.log('[Public Sites V2] Fetching active sites from database');
    
    // Get only active sites from database
    const result = await crudDb.getSites({ status: 'active', limit: 100, offset: 0 });
    
    if (!result.success) {
      return c.json({ success: false, error: result.error }, 500);
    }
    
    // Transform to public site format
    const publicSites = result.data.map((site: any) => ({
      id: site.id,
      name: site.name,
      clientId: site.clientId,
      domain: site.slug,
      status: site.status || 'active',
      branding: site.branding || {},
      settings: site.settings || {},
      siteUrl: site.siteCustomDomainUrl,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    }));
    
    return c.json({ sites: publicSites });
  } catch (error: any) {
    console.error('[Public Sites V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}
```

### 2. Registered the Endpoint

Added route in `supabase/functions/server/index.tsx`:

```typescript
// PUBLIC SITES (no auth required)
app.get("/make-server-6fcaeea3/v2/public/sites", v2.getPublicSitesV2);
```

### 3. Updated Frontend to Use V2 Endpoint

Changed `src/app/utils/api.ts`:

```typescript
// OLD
async getActiveSites() {
  return apiRequest<{ sites: PublicSite[] }>('/public/sites', {
    method: 'GET',
  });
}

// NEW
async getActiveSites() {
  return apiRequest<{ sites: PublicSite[] }>('/v2/public/sites', {
    method: 'GET',
  });
}
```

## Files Changed

1. `supabase/functions/server/endpoints_v2.ts` - Added `getPublicSitesV2` function
2. `supabase/functions/server/index.tsx` - Registered `/v2/public/sites` route
3. `src/app/utils/api.ts` - Updated frontend to call `/v2/public/sites`

## Testing

After deploying these changes:

1. The frontend will call `/v2/public/sites`
2. The endpoint will query the PostgreSQL database for active sites
3. Sites will be returned in the correct format
4. The "database not initialized" error will disappear

## Deployment Steps

1. Deploy the backend:
   ```bash
   cd supabase/functions
   supabase functions deploy make-server-6fcaeea3
   ```

2. Deploy the frontend:
   ```bash
   npm run build
   # Deploy to Netlify
   ```

3. Test:
   - Open the development site
   - Check browser console - should see sites loading
   - No "database not initialized" errors

## Why This Happened

The migration from KV store to database was done incrementally. The v2 admin endpoints were migrated first, but the public endpoints were still using the old KV store code. This fix completes the migration for the public sites endpoint.

## Related Endpoints

These endpoints are now using the database:
- ✅ `/v2/clients` - Admin CRUD
- ✅ `/v2/sites` - Admin CRUD  
- ✅ `/v2/public/sites` - Public (NEW)
- ✅ `/v2/products` - Admin CRUD
- ✅ `/v2/employees` - Admin CRUD
- ✅ `/v2/orders` - Admin CRUD
- ✅ `/v2/brands` - Admin CRUD
- ✅ `/v2/email-templates` - Admin CRUD

These endpoints still use KV store (to be migrated):
- ⏳ `/public/sites/:siteId` - Get specific site
- ⏳ `/public/sites/:siteId/gifts` - Get site gifts
- ⏳ Legacy CRUD endpoints (non-v2)
