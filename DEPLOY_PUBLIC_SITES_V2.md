# Deploy Public Sites V2 Endpoint

## Summary

Fixed the "database not initialized" error by migrating the `/public/sites` endpoint from KV store to PostgreSQL database.

## Changes Made

### Backend Changes

1. **supabase/functions/server/endpoints_v2.ts**
   - Added `getPublicSitesV2()` function that queries the database for active sites
   - Returns sites in the correct PublicSite format

2. **supabase/functions/server/index.tsx**
   - Registered new route: `GET /make-server-6fcaeea3/v2/public/sites`
   - No authentication required (public endpoint)

### Frontend Changes

3. **src/app/utils/api.ts**
   - Updated `publicSiteApi.getActiveSites()` to call `/v2/public/sites` instead of `/public/sites`

## Deployment Steps

### 1. Deploy Backend

```bash
cd supabase/functions
supabase functions deploy make-server-6fcaeea3
```

Expected output:
```
Deploying function make-server-6fcaeea3...
Function deployed successfully
```

### 2. Build and Deploy Frontend

```bash
# Build the frontend
npm run build

# Deploy to Netlify (or your hosting platform)
netlify deploy --prod
```

### 3. Verify Deployment

1. Open your development site in a browser
2. Open browser console (F12)
3. Look for these log messages:
   ```
   [Public Sites V2] Fetching active sites from database
   [Public Sites V2] Returning X active sites
   ```
4. Verify no "database not initialized" errors appear

### 4. Test the Endpoint Directly

```bash
# Test the new v2 endpoint
curl -X GET "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/public/sites" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Environment-ID: development"
```

Expected response:
```json
{
  "sites": [
    {
      "id": "...",
      "name": "Site Name",
      "clientId": "...",
      "domain": "site-slug",
      "status": "active",
      "branding": {...},
      "settings": {...},
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

## Rollback Plan

If issues occur, you can rollback the frontend change:

1. In `src/app/utils/api.ts`, change back to:
   ```typescript
   async getActiveSites() {
     return apiRequest<{ sites: PublicSite[] }>('/public/sites', {
       method: 'GET',
     });
   }
   ```

2. Redeploy frontend

The old `/public/sites` endpoint still exists and uses KV store as a fallback.

## What This Fixes

- ✅ "Database not initialized" error on frontend
- ✅ Sites now load from PostgreSQL database
- ✅ Consistent with other v2 endpoints
- ✅ Better performance (database vs KV store)
- ✅ Proper filtering of active sites

## Next Steps

After this deployment, consider migrating these remaining public endpoints:

1. `/public/sites/:siteId` - Get specific site by ID
2. `/public/sites/:siteId/gifts` - Get gifts for a site

These can follow the same pattern:
- Add v2 function in `endpoints_v2.ts`
- Register route in `index.tsx`
- Update frontend to use v2 endpoint
