# Gift Assignment Fix Complete

## Problem
Site-001 gift configuration was saved successfully in the admin panel, but gifts were not showing up on the public gift selection page.

## Root Cause
There were TWO different endpoints for fetching gifts with different data storage patterns:

1. **Admin Endpoint**: `/sites/:siteId/gifts` 
   - Uses key: `site_configs:{siteId}`
   - Used by admin panel to display/edit configuration

2. **Public Endpoint**: `/public/sites/:siteId/gifts`
   - Uses keys: `site-gift-assignment:{siteId}:{giftId}`
   - Used by public gift selection page

When saving gift configuration, only the `site_configs:{siteId}` key was being updated, but the public endpoint was looking for `site-gift-assignment` keys that didn't exist.

## Solution
Updated the PUT endpoint `/sites/:siteId/gift-config` to create both:
1. The `site_configs:{siteId}` key (for admin panel)
2. The `site-gift-assignment:{siteId}:{giftId}` keys (for public endpoint)

### Changes Made

**File**: `supabase/functions/server/index.tsx` (line 3501-3610)

**What it does now**:
1. Saves the configuration to `site_configs:{siteId}`
2. Deletes all existing `site-gift-assignment:{siteId}:*` keys
3. Creates new `site-gift-assignment` keys based on the assignment strategy:
   - **explicit**: Creates assignments for each gift in `includedGiftIds`
   - **all**: Creates assignments for all active gifts
   - **price_levels**: Creates assignments for gifts in the selected price level
   - **exclusions**: Creates assignments for all gifts except excluded ones

## Deployment Steps

1. **Deploy Backend**
   ```bash
   mv supabase/functions/server supabase/functions/make-server-6fcaeea3 && \
   supabase functions deploy make-server-6fcaeea3 --project-ref wjfcqqrlhwdvvjmefxky && \
   mv supabase/functions/make-server-6fcaeea3 supabase/functions/server
   ```

2. **Re-save Gift Configuration**
   - Go to `/admin/site-gifts`
   - Select Site-001
   - Verify the 3 gifts are still selected
   - Click "Save Configuration"
   - This will create the `site-gift-assignment` keys

3. **Verify**
   - Navigate to Site-001 gift selection page
   - Should now see the 3 assigned gifts

## Testing

### Verify Assignment Keys Created
After re-saving, check the backend logs for:
```
[Save Gift Config] Created 3 explicit gift assignments
```

### Verify Public Endpoint
```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/sites/site-001/gifts \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Environment-ID: development"
```

Should return:
```json
{
  "gifts": [
    { "id": "gift-001", "name": "...", ... },
    { "id": "gift-002", "name": "...", ... },
    { "id": "gift-003", "name": "...", ... }
  ],
  "site": { ... }
}
```

## Related Changes

Also improved error messaging in `GiftSelection.tsx`:
- Shows helpful message when no gifts assigned: "No gifts have been assigned to this site yet. Please go to Admin → Site Gifts to assign gifts."
- Hides "Clear All Filters" button when showing error message

## Files Modified
1. `supabase/functions/server/index.tsx` - Added gift assignment key creation
2. `src/app/pages/GiftSelection.tsx` - Improved error messaging

## Date
February 13, 2026
