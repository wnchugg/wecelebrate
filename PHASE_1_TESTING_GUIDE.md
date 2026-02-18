# Phase 1 Testing Guide

## ✅ Setup Complete

- Database migration executed
- Backend code deployed
- All Phase 1 fields ready to test

## Testing Checklist

Test each field to ensure it persists correctly after save and reload.

### Test 1: Gifts Per User
1. Go to Site Configuration → **Products & Gifts** tab
2. Find "Gifts Per User" in the Gift Selection Settings section
3. Change the value to a different number (e.g., 3)
4. Click Save
5. Reload the page
6. ✅ Verify the value persisted

**Expected:** Value should be saved and displayed correctly after reload

**Note:** Value must be at least 1 (database constraint)

---

### Test 2: Default Language
1. Go to Site Configuration → General Settings
2. Change "Default Language" (e.g., from 'en' to 'es')
3. Click Save
4. Reload the page
5. ✅ Verify the value persisted

**Expected:** Language selection should be saved

---

### Test 3: Default Currency
1. Go to Site Configuration → General Settings
2. Change "Default Currency" (e.g., from 'USD' to 'EUR')
3. Click Save
4. Reload the page
5. ✅ Verify the value persisted

**Expected:** Currency selection should be saved

---

### Test 4: Default Country
1. Go to Site Configuration → General Settings
2. Change "Default Country" (e.g., from 'US' to 'CA')
3. Click Save
4. Reload the page
5. ✅ Verify the value persisted

**Expected:** Country selection should be saved

---

### Test 5: Allow Quantity Selection
1. Go to Site Configuration → General Settings
2. Toggle "Allow Quantity Selection" checkbox
3. Click Save
4. Reload the page
5. ✅ Verify the checkbox state persisted

**Expected:** Checkbox should maintain its state after reload

---

### Test 6: Show Pricing
1. Go to Site Configuration → General Settings
2. Toggle "Show Pricing" checkbox
3. Click Save
4. Reload the page
5. ✅ Verify the checkbox state persisted

**Expected:** Checkbox should maintain its state after reload

---

### Test 7: Skip Review Page
1. Go to Site Configuration → General Settings (or wherever this setting is)
2. Toggle "Skip Review Page" checkbox
3. Click Save
4. Reload the page
5. ✅ Verify the checkbox state persisted

**Expected:** Checkbox should maintain its state after reload

---

### Test 8: Availability Dates
1. Go to Site Configuration → General Settings
2. Set "Availability Start Date" (e.g., today's date)
3. Set "Availability End Date" (e.g., 30 days from now)
4. Click Save
5. Reload the page
6. ✅ Verify both dates persisted

**Expected:** Both dates should be saved and displayed correctly

**Note:** These map to `selection_start_date` and `selection_end_date` in the database

---

### Test 9: Expired Message
1. Go to Site Configuration → General Settings
2. Change the "Expired Message" text
3. Click Save
4. Reload the page
5. ✅ Verify the message persisted

**Expected:** Custom message should be saved

---

### Test 10: Skip Landing Page (Already Working)
1. Go to Site Configuration → Landing Page Settings
2. Toggle "Enable Landing Page" (which sets skipLandingPage)
3. Click Save
4. Launch the site
5. ✅ Verify landing page is skipped/shown based on setting

**Expected:** Landing page behavior should match the setting

---

### Test 11: Default Gift Settings
1. Go to Site Configuration → General Settings
2. Set "Default Gift" (if you have products)
3. Set "Days After Close to Assign Default Gift"
4. Click Save
5. Reload the page
6. ✅ Verify both settings persisted

**Expected:** Default gift and days should be saved

---

## Browser Console Checks

While testing, check the browser console for debug logs:

### When Saving:
Look for logs from `SiteContext`:
```
[SiteContext] Updating site: <site-id>
[SiteContext] Updates being sent: {...}
[SiteContext] Updates.settings: {...}
[SiteContext] Update result: {...}
[SiteContext] Result.data.settings: {...}
```

### Backend Logs:
Look for logs from the backend:
```
[mapSiteFieldsToDatabase] Input settings: {...}
[mapSiteFieldsToDatabase] Extracted settings fields: {...}
[CRUD DB] Mapped fields: [...]
[CRUD DB] Final transformed site settings: {...}
```

### When Loading Site:
Look for logs from `PublicSiteContext` (if testing public site):
```
[PublicSiteContext] Site data received: {...}
[PublicSiteContext] response.site.settings: {...}
```

---

## Common Issues and Solutions

### Issue: Field not persisting
**Check:**
1. Is the field in the `settings` object when saving?
2. Is it being extracted in `mapSiteFieldsToDatabase()`?
3. Is it being reconstructed in the CRUD function?
4. Does the database column exist?

**Solution:** Check browser console logs to see where the data is being lost

### Issue: Field shows old value after reload
**Check:**
1. Was the save successful? (check for success toast)
2. Is the database column being updated? (check Supabase dashboard)
3. Is the settings reconstruction happening? (check console logs)

**Solution:** Look at the backend logs to see if the field is being mapped correctly

### Issue: Auto-save not working
**Check:**
1. Is auto-save enabled?
2. Are you waiting long enough for auto-save to trigger?
3. Check for any errors in console

**Solution:** Use manual save button to test first

---

## Success Criteria

All 13 Phase 1 fields should:
- ✅ Save successfully (show success toast)
- ✅ Persist to database (visible in Supabase dashboard)
- ✅ Load correctly on page reload
- ✅ Display correct values in the UI
- ✅ Work with both manual save and auto-save

---

## After Testing

Once all tests pass:

1. ✅ Remove debug logging from:
   - `supabase/functions/server/helpers.ts`
   - `supabase/functions/server/crud_db.ts`
   - `src/app/context/SiteContext.tsx`
   - `src/app/context/PublicSiteContext.tsx`
   - `src/app/pages/Landing.tsx`

2. ✅ Deploy cleaned-up backend:
   ```bash
   ./deploy-backend.sh dev
   ```

3. ✅ Consider implementing Phase 2 fields (see SITE_CONFIGURATION_FIELD_AUDIT.md)

---

## Quick Test Script

For a quick smoke test, you can:

1. Edit any site configuration
2. Change 3-4 different Phase 1 fields
3. Save
4. Reload page
5. Verify all changed fields persisted

If this works, all the infrastructure is working correctly!

---

## Database Verification

You can also verify directly in Supabase:

1. Go to Table Editor → sites
2. Find your test site
3. Check the new columns:
   - `gifts_per_user`
   - `default_language`
   - `default_currency`
   - `default_country`
   - `allow_quantity_selection`
   - `show_pricing`
   - `skip_review_page`
   - `expired_message`
   - `default_gift_id`
   - `default_gift_days_after_close`
   - `selection_start_date`
   - `selection_end_date`

All values should match what you set in the UI.

---

## Report Issues

If any field is not working:
1. Note which field
2. Check browser console for errors
3. Check backend logs in Supabase
4. Verify the database column exists
5. Check if the field is in the settings object when saving

The debug logs should help identify where the issue is occurring.
