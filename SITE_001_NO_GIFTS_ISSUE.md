# Site-001 No Gifts Found Issue

## Problem
When navigating to the gift selection page for Site-001, no gifts are displayed and an error occurs.

## Root Cause
Site-001 does not have any gifts assigned to it. The backend endpoint `/public/sites/:siteId/gifts` returns an empty array when there are no site-gift assignments.

## How Gift Assignment Works

### Backend Logic (supabase/functions/server/index.tsx:6377-6490)
1. Endpoint: `GET /public/sites/:siteId/gifts`
2. Checks if site exists and is active
3. Verifies selection period (startDate to endDate)
4. Fetches site-gift assignments using key pattern: `site-gift-assignment:{siteId}:{giftId}`
5. Returns empty array if no assignments found

### Key Pattern
```
site-gift-assignment:{siteId}:{giftId}
```

Example:
```
site-gift-assignment:site-001:gift-001
site-gift-assignment:site-001:gift-002
```

## Solution: Assign Gifts to Site-001

### Option 1: Use Admin Interface (Recommended)

1. **Navigate to Site Gift Configuration**
   - Go to: `/admin/site-gifts`
   - Or from Site Management, click on Site-001 and select "Configure Gifts"

2. **Select Site-001**
   - Choose "Site-001" from the site selector

3. **Assign Gifts**
   - Select which gifts should be available for this site
   - Set priority (optional) - higher priority gifts appear first
   - Set quantity limits (optional)
   - Save configuration

### Option 2: Backend API (For Testing)

Create gift assignments directly via API:

```bash
# Example: Assign gift-001 to site-001
curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/admin/site-gift-assignments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: development" \
  -d '{
    "siteId": "site-001",
    "giftId": "gift-001",
    "priority": 1,
    "quantityLimit": null
  }'
```

### Option 3: Seed Demo Data

If you want to quickly populate Site-001 with gifts for testing:

1. **Check if gifts exist**
   ```bash
   # List all gifts
   curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/admin/gifts \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "X-Environment-ID: development"
   ```

2. **Create gifts if needed**
   - Go to `/admin/gifts`
   - Create some sample gifts

3. **Assign all gifts to Site-001**
   - Go to `/admin/site-gifts`
   - Select Site-001
   - Check all available gifts
   - Save

## Verification

After assigning gifts, verify they appear:

1. **Check Backend**
   ```bash
   curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/sites/site-001/gifts \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "X-Environment-ID: development"
   ```

2. **Check Frontend**
   - Navigate to Site-001 landing page
   - Complete access validation
   - Should see gifts on gift selection page

## Common Issues

### Issue: "Site not found"
**Cause**: Site-001 doesn't exist in the database
**Solution**: Create Site-001 via `/admin/sites`

### Issue: "Site is not active"
**Cause**: Site status is not "active"
**Solution**: Edit Site-001 and set status to "active"

### Issue: "Selection period has not started yet" or "Selection period has ended"
**Cause**: Current date is outside the site's startDate/endDate range
**Solution**: Edit Site-001 and update the date range to include today

### Issue: Empty gifts array but no error
**Cause**: No gifts assigned to the site
**Solution**: Follow "Assign Gifts to Site-001" steps above

### Issue: Gifts exist but not showing
**Cause**: Gifts might be inactive or out of inventory
**Solution**: 
- Check gift status is "active"
- If inventory tracking is enabled, ensure quantity > 0

## Related Files
- Backend: `supabase/functions/server/index.tsx` (line 6377)
- Frontend: `src/app/pages/GiftSelection.tsx`
- Admin UI: `src/app/pages/admin/SiteGiftConfiguration.tsx`
- Route: `/admin/site-gifts`

## Quick Fix for Testing

If you just want to test the flow quickly:

1. Go to `/admin/gifts` and create 2-3 sample gifts
2. Go to `/admin/site-gifts`
3. Select Site-001
4. Check all gifts
5. Save
6. Navigate back to Site-001 gift selection page
7. Gifts should now appear

## Date
February 13, 2026
