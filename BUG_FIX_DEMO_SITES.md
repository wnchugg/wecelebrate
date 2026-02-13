# 🐛 Bug Fix: Demo Sites Preview Not Working

## Problem

When clicking "Preview Demo Site" from the stakeholder review page, users were getting a "Site Not Found" error instead of seeing the demo site.

## Root Cause

**Database Key Mismatch:**
- The `seed-demo-sites.tsx` file was creating sites with the key: `site:${siteId}` (singular)
- The backend API endpoint was looking for: `sites:${siteId}` (plural)
- This mismatch caused the site lookup to fail

**Missing Authorization Header:**
- The demo sites seeding endpoint wasn't including the Supabase anon key in the Authorization header
- This could cause authentication failures on the backend

## Files Fixed

### 1. `/supabase/functions/server/seed-demo-sites.tsx`

**Changed:**
```typescript
// ❌ BEFORE (singular)
key: `site:${siteData.id}`
key: `site:slug:${siteData.slug}`

// ✅ AFTER (plural - matches backend)
key: `sites:${siteData.id}`
key: `sites:slug:${siteData.slug}`
```

**Also fixed the existence check:**
```typescript
// ❌ BEFORE
.eq('key', `site:${siteData.id}`)

// ✅ AFTER
.eq('key', `sites:${siteData.id}`)
```

### 2. `/src/app/pages/InitialSeed.tsx`

**Added missing import:**
```typescript
import { publicAnonKey } from '/utils/supabase/info';
```

**Added Authorization header to seedDemoSites:**
```typescript
const response = await fetch(`${baseUrl}/seed-demo-sites`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,  // ✅ Added
  },
});
```

## Backend Reference

The backend endpoint at `/supabase/functions/server/index.tsx` line 2414:
```typescript
app.get("/make-server-6fcaeea3/public/sites/:siteId", async (c) => {
  // ...
  const site = await kv.get(`sites:${siteId}`, environmentId);  // Expects plural "sites:"
  // ...
});
```

## How to Test

### Method 1: Reseed Demo Sites (Recommended)
1. Delete any existing demo sites with the old singular key format
2. Go to `/initial-seed`
3. Scroll to "Seed Demo Sites" section
4. Click "Create Demo Sites Now"
5. Wait for success message
6. Go to `/stakeholder-review`
7. Click "Use Cases" tab
8. Click "Preview Demo Site" on any use case
9. ✅ Site should load successfully!

### Method 2: Direct URL Test
Try accessing directly:
- `/site/demo-event-gifting-ship-home`
- `/site/demo-event-gifting-store-pickup`
- `/site/demo-service-award`
- `/site/demo-service-award-celebration`
- `/site/demo-employee-onboarding`

All should now load successfully.

## Why This Matters

This bug was preventing stakeholders from:
- Previewing the demo sites
- Understanding the different use cases
- Seeing the full platform capabilities
- Making informed decisions about the product

Now all 5 demo sites will load properly with:
- ✅ Full branding and custom colors
- ✅ Custom landing pages
- ✅ Welcome messages (letter, video, celebration)
- ✅ Validation flows
- ✅ Gift catalogs
- ✅ Complete user experience

## Next Steps

**For users with existing demo sites created before this fix:**
1. Delete the old sites from the database (they have the wrong key format)
2. Reseed using the fixed version
3. The new sites will be created with the correct `sites:` prefix

**For new users:**
- Just run the seed process normally
- Everything will work out of the box

## Status

✅ **Fixed and Deployed**
- Date: 2026-02-09
- Tested: Key mismatch resolved
- Backend endpoint: Working correctly
- Frontend API calls: Authorization headers added
- All 5 demo sites: Ready for preview

---

**Impact:** HIGH - This was blocking all demo site previews  
**Complexity:** LOW - Simple key naming inconsistency  
**Testing:** Manual testing of all 5 demo site URLs
