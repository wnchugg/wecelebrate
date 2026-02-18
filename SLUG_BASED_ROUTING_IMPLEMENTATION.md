# Slug-Based Routing Implementation

## Overview

Implemented environment-aware, slug-based routing for public site URLs. Sites can now be accessed using human-readable slugs instead of UUIDs, with automatic environment detection.

## What Changed

### 1. Environment-Aware URL Generation

**File**: `src/app/utils/url.ts`

Added new functions:
- `getPublicSiteUrlBySlug(slug, environmentId?)` - Generates environment-aware URLs
- `getEnvironmentBaseUrl(environmentId?)` - Gets the base URL for current environment

**URL Structure by Environment**:
- Development: `https://development--wecelebrate.netlify.app/site/{slug}`
- Test: `https://test--wecelebrate.netlify.app/site/{slug}`
- UAT: `https://uat--wecelebrate.netlify.app/site/{slug}`
- Production: `https://wecelebrate.netlify.app/site/{slug}`
- Local: `http://localhost:5173/site/{slug}`

### 2. Backend API Endpoint

**Files**: 
- `supabase/functions/server/crud_db.ts` - Added `getSiteBySlug()`
- `supabase/functions/server/endpoints_v2.ts` - Added `getSiteBySlugV2()`
- `supabase/functions/server/index.tsx` - Registered routes:
  - Admin: `GET /v2/sites/slug/:slug` (requires auth)
  - Public: `GET /v2/public/sites/slug/:slug` (no auth)
- `supabase/functions/server/database/db.ts` - Already had `getSiteBySlug()` query

### 3. Frontend Site Loading

**File**: `src/app/components/SiteLoaderWrapper.tsx`

Updated to support both UUID and slug-based routing:
- Detects if parameter is UUID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- If UUID: calls `setSiteById()`
- If slug: calls `setSiteBySlug()`

### 4. Public Site Context

**File**: `src/app/context/PublicSiteContext.tsx`

Added:
- `setSiteBySlug(slug)` method to interface
- Implementation that loads site by slug from backend
- Error handling for slug-not-found scenarios

### 5. Public Site API

**File**: `src/app/utils/api.ts`

Added:
- `publicSiteApi.getSiteBySlug(slug)` - Calls `/v2/public/sites/slug/:slug`

### 6. Admin UI Updates

**File**: `src/app/pages/admin/SiteConfiguration.tsx`

Updated:
- Site URL input now shows environment-aware base URL
- Preview link uses `getPublicSiteUrlBySlug()`
- "Launch Site" button uses slug instead of UUID (if slug exists)

## Usage Examples

### Admin Console
When editing a site in development environment:
```
Input shows: https://development--wecelebrate.netlify.app/site/
User enters: techcorpus
Preview shows: https://development--wecelebrate.netlify.app/site/techcorpus
```

### Public Access
Users can access sites via:
- **Slug** (preferred): `https://wecelebrate.netlify.app/site/techcorpus`
- **UUID** (legacy): `https://wecelebrate.netlify.app/site/10000000-0000-0000-0000-000000000001`

Both work seamlessly - the system auto-detects which format is being used.

## Testing

### Backend Deployed ✅
```bash
./deploy-backend.sh
```

### Frontend Changes
The frontend changes are in the code. To test locally:
1. Restart your dev server: `npm run dev`
2. Go to admin console
3. Edit a site and add a slug
4. Save the site
5. Click "Launch Site" - should use slug-based URL
6. Navigate to the slug URL - should load the site

### Test URLs

**Development Environment**:
- Admin: `http://localhost:5173/admin/site-configuration`
- Public (slug): `http://localhost:5173/site/techcorpus`
- Public (UUID): `http://localhost:5173/site/10000000-0000-0000-0000-000000000001`

**Production URLs** (after deployment):
- Development: `https://development--wecelebrate.netlify.app/site/techcorpus`
- Production: `https://wecelebrate.netlify.app/site/techcorpus`

## Benefits

1. **SEO Friendly**: Human-readable URLs instead of UUIDs
2. **Environment Aware**: Automatically uses correct domain based on deployment environment
3. **Backward Compatible**: UUID-based URLs still work
4. **User Friendly**: Easier to share and remember site URLs
5. **Branding**: Custom slugs can match company names

## Next Steps

1. Test slug-based routing in local dev environment
2. Verify environment detection works correctly
3. Test both slug and UUID access methods
4. Deploy frontend to see environment-aware URLs in action
5. Consider adding slug validation to prevent duplicates

## Files Modified

### Backend
- `supabase/functions/server/crud_db.ts`
- `supabase/functions/server/endpoints_v2.ts`
- `supabase/functions/server/index.tsx`

### Frontend
- `src/app/utils/url.ts`
- `src/app/components/SiteLoaderWrapper.tsx`
- `src/app/context/PublicSiteContext.tsx`
- `src/app/utils/api.ts`
- `src/app/pages/admin/SiteConfiguration.tsx`

## Deployment Status

- ✅ Backend deployed to development
- 🔄 Frontend changes ready (restart dev server to test)
- ⏳ Pending: Frontend build and push to GitHub for Netlify deployment
