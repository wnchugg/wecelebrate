# Additional Navigation and Gift Display Fixes

## Issues Fixed

### 1. Welcome Page Still Showing When Disabled
**Problem**: Welcome page was showing even when `enableWelcomePage` was set to `false` for Site-001.

**Root Cause**: 
- The redirect logic in the useEffect was working, but there was a brief flash of content before the redirect
- No early return to prevent rendering when welcome page is disabled

**Fix**:
- Added early return in Welcome.tsx render function to show loading state when `enableWelcomePage === false`
- Added `return` statement in useEffect after navigate to prevent further execution
- This prevents any flash of welcome page content before redirect

**Files Changed**:
- `src/app/pages/Welcome.tsx` (lines 172-185)

### 2. Product Images Not Showing
**Problem**: Product images were not displaying on the gift selection page.

**Root Cause**: 
- Backend gift data uses `image` field (from seed data in gifts_api.ts)
- Frontend expects `imageUrl` field
- Field name mismatch caused images to be undefined

**Fix**:
- Updated backend public gifts endpoint to map `image` to `imageUrl` for frontend compatibility
- Also maps `price` to `value` for consistency
- Applied to both list endpoint (`/public/sites/:siteId/gifts`) and single gift endpoint (`/public/gifts/:giftId`)

**Files Changed**:
- `supabase/functions/server/index.tsx` (lines 6524-6548, 6592-6612)

### 3. Gift Detail Navigation Error
**Problem**: Clicking on a product caused an error because the route was incorrect.

**Root Cause**: 
- GiftSelection was navigating to `/gift-detail/${giftId}` (absolute path)
- Should navigate to `../gift-detail/${giftId}` (relative to parent) to stay within site context
- Route definition was missing `:giftId` parameter in site routes

**Fix**:
- Updated route definition to include `:giftId` parameter: `gift-detail/:giftId`
- Updated handleSelectGift to use relative path with parent navigation (`../gift-detail/${giftId}`)
- This keeps navigation within the `/site/:siteId/` context

**Files Changed**:
- `src/app/routes.tsx` (line 240)
- `src/app/pages/GiftSelection.tsx` (lines 176-179)

### 4. Single Gift Endpoint Key Pattern
**Problem**: Single gift endpoint was using incorrect key pattern.

**Root Cause**: 
- Used `gift:${giftId}` instead of `gift:${environmentId}:${giftId}`
- Inconsistent with CRUD factory pattern

**Fix**:
- Updated to use correct key pattern matching CRUD factory

**Files Changed**:
- `supabase/functions/server/index.tsx` (line 6592)

## Summary of Changes

### Frontend Changes
1. **Welcome.tsx**:
   - Added early return to prevent rendering when welcome page disabled
   - Added return statement after navigate in useEffect
   - Enhanced logging

2. **GiftSelection.tsx**:
   - Fixed navigation to use relative path (`../gift-detail/${giftId}`)

3. **routes.tsx**:
   - Added `:giftId` parameter to gift-detail route in site routes

### Backend Changes
1. **index.tsx**:
   - Fixed gift key patterns in public endpoints
   - Added field mapping: `image` → `imageUrl`, `price` → `value`
   - Applied to both list and single gift endpoints

## Testing Checklist

- [ ] Navigate to `/site/site-001/access`
- [ ] Enter valid email
- [ ] Verify welcome page is skipped (goes directly to gift-selection)
- [ ] Verify product images are displayed
- [ ] Click on a product
- [ ] Verify navigation to `/site/site-001/gift-detail/:giftId` works
- [ ] Verify product detail page loads correctly

## Deployment

1. Type check: ✅ Passed
2. Backend deployment: Pending
3. Frontend deployment: Pending
