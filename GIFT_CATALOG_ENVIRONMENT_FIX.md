# Gift/Product Catalog Environment-Awareness Fix

## Problem
After seeding the database, products weren't showing up in the Site Settings page when trying to assign gifts to sites. The admin reported: "I still don't see any products to assign."

## Root Cause
The `gifts_api.ts` module was using the old, non-environment-aware `kv_store.tsx` and storing gifts with simple keys like:
- `gifts:all` (master list)
- `gift:gift-1` (individual gifts)

However, the migrated CRUD endpoints expected environment-aware keys like:
- `gift:development:gift-1`

This mismatch meant that:
1. Gifts were stored without environment IDs
2. The admin `/gifts` endpoint couldn't find them because it searched for `gift:${environmentId}:*` pattern

## Files Fixed

### 1. `/supabase/functions/server/gifts_api.ts`
**Changes:**
- ✅ Changed import from `"./kv_store.tsx"` to `"./kv_env.ts"` (environment-aware KV)
- ✅ Updated `initializeGiftCatalog()` to accept `environmentId` parameter
- ✅ Updated `forceReseedGiftCatalog()` to accept `environmentId` parameter  
- ✅ Changed gift storage keys from `gift:${gift.id}` to `gift:${environmentId}:${gift.id}`
- ✅ Added `getAllGifts()`, `getGiftById()`, `getCategories()` functions with environmentId support
- ✅ Updated all KV operations to pass `environmentId`

**Key Pattern Changes:**
```typescript
// BEFORE
await kv.set(`gift:${gift.id}`, gift);

// AFTER
await kv.set(`gift:${environmentId}:${gift.id}`, gift, environmentId);
```

### 2. `/supabase/functions/server/seed.ts`
**Changes:**
- ✅ Updated call to `giftsApi.initializeGiftCatalog()` to pass `environmentId`

```typescript
// BEFORE
await giftsApi.initializeGiftCatalog();

// AFTER
await giftsApi.initializeGiftCatalog(environmentId);
```

### 3. `/supabase/functions/server/index.tsx`
**Changes:**
- ✅ Updated `/dev/reseed-products` endpoint to extract and pass `environmentId`

```typescript
// BEFORE
const result = await giftsApi.forceReseedGiftCatalog();

// AFTER
const environmentId = c.req.header('X-Environment-ID') || 'development';
const result = await giftsApi.forceReseedGiftCatalog(environmentId);
```

## Impact
After these fixes:
- ✅ Initial seed creates gifts with correct environment-aware keys
- ✅ Product reseed creates gifts with correct keys
- ✅ Admin gift management page can find and display gifts
- ✅ Site Settings → Gift Configuration shows available products to assign
- ✅ All gift CRUD operations work correctly across environments

## Testing Steps
1. Go to `/admin/initial-seed` and run "Reseed Product Catalog"
2. Go to Site Settings → Gift Configuration tab
3. You should now see 6 products available to assign:
   - Premium Noise-Cancelling Headphones
   - Smart Fitness Watch
   - Gourmet Coffee Collection
   - Luxury Spa Gift Set
   - Professional Chef Knife Set
   - Portable Bluetooth Speaker

## Related Files
- ✅ `/supabase/functions/server/gifts_api.ts` - Fixed (core fix)
- ✅ `/supabase/functions/server/seed.ts` - Fixed
- ✅ `/supabase/functions/server/index.tsx` - Fixed
- ✅ `/supabase/functions/server/migrated_resources.ts` - Already correct (expects environment-aware keys)

## Key Pattern Reference
| Resource Type | Prefix for getByPrefix | Full Key Pattern |
|--------------|----------------------|------------------|
| Gifts | `gift:` | `gift:${environmentId}:${giftId}` |
| Sites | `site:` | `site:${environmentId}:${siteId}` |
| Clients | `client:` | `client:${environmentId}:${clientId}` |

## Notes
- The `GIFTS_KEY = 'gifts:all'` is kept for backward compatibility as a master list
- Individual gift lookups use the environment-aware pattern
- All new helper functions (getAllGifts, getGiftById, getCategories) are environment-aware
- Order management functions remain unchanged (they don't need environment isolation yet)
