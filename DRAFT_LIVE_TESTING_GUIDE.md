# Draft/Live Architecture - Testing Guide

## Prerequisites

1. **Database Migration**: Run the migration to add `draft_settings` column
   ```sql
   -- In Supabase Dashboard SQL Editor
   -- Run: supabase/migrations/add_draft_settings_column.sql
   ```

2. **Backend Deployed**: Verify backend is deployed with draft/live endpoints
   - Check: `https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/:id/draft`

3. **Frontend Deployed**: Deploy the updated frontend code

## Test Scenarios

### Scenario 1: Save Draft Changes (Don't Affect Live)

**Goal**: Verify that saving changes doesn't affect the live public site

**Steps**:
1. Log in to admin dashboard
2. Navigate to Site Configuration
3. Change the site name from "Test Site" to "Test Site DRAFT"
4. Click "Save" button
5. Wait for success toast: "Configuration saved successfully"
6. Open the public site in a new incognito window
7. **Expected**: Public site still shows "Test Site" (not "Test Site DRAFT")

**What's Happening**:
- Changes saved to `draft_settings` JSONB column
- Live columns remain unchanged
- Public site reads from live columns only

---

### Scenario 2: Publish Draft to Live

**Goal**: Verify that publishing merges draft changes to live

**Steps**:
1. Continue from Scenario 1 (with draft changes saved)
2. Click "Publish Site" button in header
3. Publish modal appears showing changes:
   - Site Name: "Test Site" → "Test Site DRAFT"
4. Click "Confirm & Publish" button
5. Wait for success toast: "Site published successfully! 🎉"
6. Refresh the public site in incognito window
7. **Expected**: Public site now shows "Test Site DRAFT"

**What's Happening**:
- Backend merges `draft_settings` into live columns
- Backend clears `draft_settings` column
- Public site now reads updated live data

---

### Scenario 3: Discard Draft Changes

**Goal**: Verify that discarding draft removes changes without affecting live

**Steps**:
1. Make changes to site configuration (e.g., change primary color)
2. Click "Save" button
3. Wait for success toast
4. Click "Discard Draft" button (red outline button next to Publish)
5. Confirm in the dialog: "Are you sure you want to discard all draft changes?"
6. Wait for success toast: "Draft discarded"
7. Page reloads automatically
8. **Expected**: Changes are gone, site shows live data

**What's Happening**:
- Backend clears `draft_settings` column
- Frontend reloads to show live data only
- Live site was never affected

---

### Scenario 4: Auto-Save Draft

**Goal**: Verify that auto-save works and doesn't affect live

**Steps**:
1. Make changes to site configuration
2. Wait 30 seconds (don't click Save)
3. Look for toast notification: "Draft auto-saved"
4. Check public site in incognito window
5. **Expected**: Public site doesn't show changes (still live data)

**What's Happening**:
- Auto-save triggers after 30 seconds of inactivity
- Changes saved to `draft_settings` column
- Live columns remain unchanged

---

### Scenario 5: Publish Modal Shows Correct Changes

**Goal**: Verify publish modal compares draft vs live (not draft vs draft)

**Steps**:
1. Start with a published site (no draft changes)
2. Make changes to multiple fields:
   - Site name: "Test Site" → "Updated Site"
   - Primary color: #D91C81 → #FF0000
   - Gifts per user: 1 → 3
3. Click "Save" button
4. Click "Publish Site" button
5. **Expected**: Publish modal shows exactly 3 changes:
   - Site Name: "Test Site" → "Updated Site"
   - Primary Color: #D91C81 → #FF0000
   - Gifts Per User: 1 → 3
6. **Not Expected**: Modal should NOT show unchanged fields or false positives

**What's Happening**:
- Modal fetches live data via `GET /v2/sites/:id/live`
- Compares current state (draft) vs live data
- Only shows actual differences

---

## API Endpoint Testing

### Test Draft Save Endpoint

```bash
# Get your auth token from browser console:
# localStorage.getItem('jala_access_token')

curl -X PATCH \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/draft' \
  -H 'Content-Type: application/json' \
  -H 'X-Access-Token: YOUR_JWT_TOKEN' \
  -H 'X-Environment-ID: development' \
  -d '{
    "name": "Test Draft Save",
    "settings": {
      "giftsPerUser": 5
    }
  }'

# Expected Response:
# {
#   "success": true,
#   "data": { ... site with draft merged ... }
# }
```

### Test Publish Endpoint

```bash
curl -X POST \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/publish' \
  -H 'Content-Type: application/json' \
  -H 'X-Access-Token: YOUR_JWT_TOKEN' \
  -H 'X-Environment-ID: development'

# Expected Response:
# {
#   "success": true,
#   "data": { ... site with draft merged to live ... },
#   "message": "Site published successfully"
# }
```

### Test Get Live Data Endpoint

```bash
curl -X GET \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/live' \
  -H 'X-Access-Token: YOUR_JWT_TOKEN' \
  -H 'X-Environment-ID: development'

# Expected Response:
# {
#   "success": true,
#   "data": { ... site with ONLY live data, no draft ... }
# }
```

### Test Discard Draft Endpoint

```bash
curl -X DELETE \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/draft' \
  -H 'X-Access-Token: YOUR_JWT_TOKEN' \
  -H 'X-Environment-ID: development'

# Expected Response:
# {
#   "success": true,
#   "data": { ... site with draft_settings cleared ... },
#   "message": "Draft discarded successfully"
# }
```

---

## Database Verification

### Check Draft Settings Column

```sql
-- View draft_settings for a specific site
SELECT 
  id,
  name,
  status,
  draft_settings,
  updated_at
FROM sites
WHERE id = 'YOUR_SITE_ID';

-- Expected:
-- - draft_settings is NULL when no draft exists
-- - draft_settings is JSONB object when draft exists
-- - draft_settings contains only changed fields
```

### Check Live vs Draft Data

```sql
-- Compare live columns vs draft_settings
SELECT 
  id,
  name as live_name,
  draft_settings->>'name' as draft_name,
  gifts_per_user as live_gifts_per_user,
  (draft_settings->'settings'->>'giftsPerUser')::int as draft_gifts_per_user
FROM sites
WHERE id = 'YOUR_SITE_ID';

-- Expected:
-- - live_name shows published value
-- - draft_name shows draft value (or NULL if not changed)
-- - Same for other fields
```

---

## Common Issues & Solutions

### Issue 1: 401 Unauthorized

**Symptom**: API calls return 401 error

**Solution**:
1. Check that you're logged in to admin dashboard
2. Verify JWT token exists: `sessionStorage.getItem('jala_access_token')`
3. Check token is valid: `window.inspectJALAToken()`
4. If expired, log out and log back in

### Issue 2: Changes Appear on Live Site Immediately

**Symptom**: Saving changes affects public site without publishing

**Solution**:
1. Check that frontend is using `saveSiteDraft()` not `updateSite()`
2. Verify backend endpoint is `/v2/sites/:id/draft` not `/v2/sites/:id`
3. Check database: `draft_settings` column should have data, live columns unchanged

### Issue 3: Publish Modal Shows No Changes

**Symptom**: Publish modal says "No changes detected" when there are changes

**Solution**:
1. Check that `originalSiteData` is loaded from `getSiteLive()` endpoint
2. Verify `getSiteLive()` returns live data only (no draft merged)
3. Check browser console for errors in `loadLiveData()` function

### Issue 4: Discard Draft Doesn't Work

**Symptom**: Clicking "Discard Draft" doesn't remove changes

**Solution**:
1. Check that endpoint is `DELETE /v2/sites/:id/draft`
2. Verify backend clears `draft_settings` column
3. Check that page reloads after discard (to show live data)

---

## Success Criteria

✅ **Draft Save**: Changes saved without affecting live site
✅ **Publish**: Draft changes merged to live and visible on public site
✅ **Discard**: Draft changes removed, live site unchanged
✅ **Auto-Save**: Works every 30 seconds, doesn't affect live
✅ **Publish Modal**: Shows accurate diff between draft and live
✅ **No False Positives**: Unchanged fields don't appear in publish modal

---

**Next Steps After Testing**:
1. If all tests pass → Deploy to production
2. If issues found → Debug and fix before deploying
3. Monitor production for any draft/live errors
4. Gather user feedback on new workflow

---

**Date**: 2026-02-17
**Status**: Ready for testing
