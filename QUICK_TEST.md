# Quick Test - Phase 1 Fields

## 🚀 5-Minute Smoke Test

### Step 1: Edit Site Configuration
1. Go to admin console
2. Navigate to a site configuration
3. Go to General Settings tab

### Step 2: Change Multiple Fields
Change any 3-4 of these fields:
- [ ] Gifts Per User (change the number)
- [ ] Default Language (change dropdown)
- [ ] Default Currency (change dropdown)
- [ ] Default Country (change dropdown)
- [ ] Allow Quantity Selection (toggle checkbox)
- [ ] Show Pricing (toggle checkbox)
- [ ] Availability Start Date (set a date)
- [ ] Availability End Date (set a date)

### Step 3: Save
Click the "Save" button (or wait for auto-save)

**Expected:** See success toast message

### Step 4: Reload Page
Press F5 or refresh the browser

### Step 5: Verify
Check that all the fields you changed still show the new values

---

## ✅ If This Works

All Phase 1 infrastructure is working correctly! You can proceed with comprehensive testing using PHASE_1_TESTING_GUIDE.md

---

## ❌ If Something Doesn't Work

### Check Browser Console
Look for errors or debug logs:
- `[SiteContext]` logs show save operations
- `[mapSiteFieldsToDatabase]` logs show field extraction
- `[CRUD DB]` logs show database operations

### Check Supabase Dashboard
1. Go to Table Editor → sites
2. Find your test site
3. Check if the database columns have the new values

### Common Issues

**Field not saving:**
- Check if there's an error in the console
- Verify the database column exists
- Check backend logs in Supabase Functions

**Field saves but doesn't reload:**
- Check if settings reconstruction is happening
- Look for `[CRUD DB] Final transformed site settings` log
- Verify the field is in the settings object

---

## Debug Logs to Look For

### When Saving:
```
[SiteContext] Updating site: <id>
[SiteContext] Updates.settings: { ... }
[mapSiteFieldsToDatabase] Extracted settings fields: { ... }
[CRUD DB] Mapped fields: [...]
```

### When Loading:
```
[CRUD DB] Getting site: <id>
[CRUD DB] Final settings: { ... }
[SiteContext] Updated currentSite.settings: { ... }
```

---

## Next Steps

- ✅ **If test passes:** Continue with full testing (PHASE_1_TESTING_GUIDE.md)
- ❌ **If test fails:** Check console logs and report which field failed

---

## Quick Database Check

Want to verify directly in the database?

1. Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/editor
2. Select `sites` table
3. Find your test site
4. Check these columns exist and have values:
   - `gifts_per_user`
   - `default_language`
   - `default_currency`
   - `default_country`
   - `allow_quantity_selection`
   - `show_pricing`
   - `skip_landing_page`
   - `skip_review_page`
   - `selection_start_date`
   - `selection_end_date`

All should match what you set in the UI!
