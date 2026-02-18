# Backend Testing Checklist

## Before You Start

You need to complete these steps before testing:

### Step 1: Run Database Migration ⚠️ REQUIRED

Go to your Supabase Dashboard SQL Editor and run:

```sql
-- Add draft_settings column
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS draft_settings JSONB DEFAULT NULL;

-- Verify it was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sites' AND column_name = 'draft_settings';
```

**Expected output:**
```
column_name      | data_type | is_nullable
-----------------+-----------+-------------
draft_settings   | jsonb     | YES
```

✅ **Checkpoint**: Column `draft_settings` exists in sites table

### Step 2: Deploy Backend ⚠️ REQUIRED

The backend code has been updated. You need to deploy it:

```bash
cd supabase/functions/server
supabase functions deploy server --no-verify-jwt
```

Or use the Supabase Dashboard:
1. Go to Edge Functions
2. Deploy the `server` function
3. Wait for deployment to complete

✅ **Checkpoint**: Backend deployed successfully

### Step 3: Get Test Data

You need:
1. **Site ID**: Get from admin dashboard or database
2. **Auth Token**: Your admin authentication token

To get a site ID from database:
```sql
SELECT id, name, slug FROM sites LIMIT 5;
```

✅ **Checkpoint**: Have site ID and auth token ready

## Running the Tests

### Option 1: Automated Test Script (Recommended)

Run the test script:

```bash
./test-draft-live-backend.sh
```

It will prompt you for:
- Site ID
- Auth Token

Then it will run 10 automated tests and show results.

**Expected output:**
```
=========================================
Draft/Live Backend Test Script
=========================================

Test 1: Get site with draft
✓ Success
  Has unpublished changes: false

Test 2: Get live site data
✓ Success
  Live Currency: USD
  Live Gifts Per User: 1

Test 3: Save draft changes
✓ Success
  Draft Currency: EUR
  Draft Gifts Per User: 3
  Has unpublished changes: true

Test 4: Verify live data unchanged
✓ Success - Live data unchanged
  Live Currency: USD (unchanged)
  Live Gifts Per User: 1 (unchanged)

Test 5: Get site with draft (should show draft values)
✓ Success - Draft values shown
  Currency with draft: EUR
  Gifts with draft: 3

Test 6: Publish draft to live
✓ Success
  Message: Site published successfully

Test 7: Verify live data updated
✓ Success - Live data updated
  Live Currency: EUR (updated)
  Live Gifts Per User: 3 (updated)

Test 8: Save another draft
✓ Success

Test 9: Discard draft
✓ Success
  Message: Draft discarded successfully

Test 10: Verify draft discarded
✓ Success - Draft discarded
  Currency: EUR (back to live value)
  Has unpublished changes: false

=========================================
All tests passed! ✓
=========================================
```

### Option 2: Manual Testing

Follow the detailed steps in `BACKEND_TESTING_GUIDE.md`

## Test Results

Mark each test as you complete it:

- [ ] **Test 1**: Get site with draft - Works
- [ ] **Test 2**: Get live site data - Works
- [ ] **Test 3**: Save draft changes - Works
- [ ] **Test 4**: Live data unchanged after draft save - Verified
- [ ] **Test 5**: Get with draft shows draft values - Works
- [ ] **Test 6**: Publish draft to live - Works
- [ ] **Test 7**: Live data updated after publish - Verified
- [ ] **Test 8**: Can save another draft - Works
- [ ] **Test 9**: Discard draft - Works
- [ ] **Test 10**: Draft discarded, back to live - Verified

## Verification in Database

After running tests, verify in Supabase SQL Editor:

```sql
-- Check the site
SELECT 
  id,
  name,
  default_currency,
  gifts_per_user,
  draft_settings,
  status
FROM sites 
WHERE id = 'YOUR_SITE_ID';
```

**Expected state after all tests:**
- `default_currency`: EUR (updated from tests)
- `gifts_per_user`: 3 (updated from tests)
- `draft_settings`: null (discarded in last test)
- `status`: active

## Common Issues & Solutions

### Issue: "Column draft_settings does not exist"
**Solution**: Run Step 1 (database migration)

### Issue: "404 Not Found" on endpoints
**Solution**: Run Step 2 (deploy backend)

### Issue: "Unauthorized" errors
**Solution**: Check your auth token is valid

### Issue: Tests fail at Test 3
**Possible causes:**
- Migration not run
- Backend not deployed
- Invalid site ID

### Issue: Tests fail at Test 4
**This is critical** - means draft is writing to live columns
**Solution**: Check backend code deployment

## Success Criteria

✅ All 10 tests pass
✅ Draft changes stored in `draft_settings` column
✅ Live columns unchanged until publish
✅ Publish merges draft to live
✅ Discard clears draft

## What This Proves

When all tests pass, you've verified:

1. **Draft/Live Separation**: Changes saved to draft don't affect live
2. **Admin View**: Admins see draft values when editing
3. **Public View**: End users see only live values
4. **Publish Workflow**: Draft merges to live on publish
5. **Discard Workflow**: Draft can be safely discarded

## Next Steps

Once all tests pass:

1. ✅ Backend is ready
2. ⏭️ Proceed with frontend integration
3. ⏭️ Update SiteContext to use new endpoints
4. ⏭️ Update SiteConfiguration to save to draft
5. ⏭️ Update publish modal to compare live vs draft

## Need Help?

If tests fail:
1. Check Supabase Edge Function logs
2. Verify migration ran successfully
3. Verify backend deployed
4. Check the detailed guide: `BACKEND_TESTING_GUIDE.md`
