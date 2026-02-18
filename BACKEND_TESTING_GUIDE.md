# Backend Draft/Live Testing Guide

## Prerequisites

Before testing, you need to:

1. ✅ Run the database migration
2. ✅ Deploy the backend with new endpoints
3. ✅ Have a test site to work with

## Step 1: Run Database Migration

You need to add the `draft_settings` column to the sites table in your development database.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky
2. Navigate to SQL Editor
3. Run this SQL:

```sql
-- Add draft_settings column to store unpublished changes
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS draft_settings JSONB DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN sites.draft_settings IS 'Draft configuration changes not yet published. NULL means no draft changes exist.';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sites' AND column_name = 'draft_settings';
```

Expected output:
```
column_name      | data_type | is_nullable
-----------------+-----------+-------------
draft_settings   | jsonb     | YES
```

### Option B: Using Migration File

If you have Supabase CLI configured:

```bash
# Apply the migration
supabase db push

# Or manually run the migration file
psql $DATABASE_URL -f supabase/migrations/add_draft_settings_column.sql
```

## Step 2: Deploy Backend

The backend code has been updated with new endpoints. You need to deploy it:

```bash
# Navigate to server directory
cd supabase/functions/server

# Deploy the function
supabase functions deploy server --no-verify-jwt
```

Or if you're using the Supabase dashboard:
1. Go to Edge Functions
2. Deploy the `server` function
3. Wait for deployment to complete

## Step 3: Verify Deployment

Check that the new endpoints are available:

```bash
# Test health check
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Step 4: Get a Test Site ID

You need a site ID to test with. You can get one from:

1. **From the admin dashboard**: Go to Sites page and copy a site ID
2. **From the database**: Run this SQL in Supabase dashboard:

```sql
SELECT id, name, slug, status FROM sites LIMIT 5;
```

Copy one of the site IDs (UUID format).

## Step 5: Test the New Endpoints

Replace `YOUR_SITE_ID` with an actual site ID from your database.
Replace `YOUR_AUTH_TOKEN` with your admin auth token.

### Test 1: Get Site with Draft (Should work even without draft)

```bash
curl -X GET \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/with-draft' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "_hasUnpublishedChanges": false,
    ...
  }
}
```

### Test 2: Get Live Site Data

```bash
curl -X GET \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/live' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "defaultCurrency": "USD",
    ...
  }
}
```

Note: Should NOT include `_hasUnpublishedChanges` or `draft_settings`.

### Test 3: Save Draft Changes

```bash
curl -X PATCH \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/draft' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "settings": {
      "defaultCurrency": "EUR",
      "giftsPerUser": 3,
      "showPricing": false
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "settings": {
      "defaultCurrency": "EUR",
      "giftsPerUser": 3,
      "showPricing": false,
      ...
    },
    "_hasUnpublishedChanges": true
  },
  "message": "Draft saved successfully"
}
```

### Test 4: Verify Draft in Database

Run this SQL in Supabase dashboard:

```sql
SELECT 
  id,
  name,
  default_currency as live_currency,
  gifts_per_user as live_gifts,
  draft_settings
FROM sites 
WHERE id = 'YOUR_SITE_ID';
```

**Expected Output:**
```
id          | name        | live_currency | live_gifts | draft_settings
------------+-------------+---------------+------------+------------------
YOUR_SITE_ID| Site Name   | USD           | 1          | {"default_currency": "EUR", "gifts_per_user": 3, ...}
```

Notice:
- Live columns still have old values (USD, 1)
- draft_settings has new values (EUR, 3)

### Test 5: Get Site with Draft (After Saving)

```bash
curl -X GET \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/with-draft' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "settings": {
      "defaultCurrency": "EUR",  // Draft value
      "giftsPerUser": 3,          // Draft value
      ...
    },
    "_hasUnpublishedChanges": true
  }
}
```

### Test 6: Get Live (Should Still Show Old Values)

```bash
curl -X GET \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/live' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "settings": {
      "defaultCurrency": "USD",  // Still old value
      "giftsPerUser": 1,          // Still old value
      ...
    }
  }
}
```

### Test 7: Publish Draft to Live

```bash
curl -X POST \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/publish' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "settings": {
      "defaultCurrency": "EUR",  // Now live
      "giftsPerUser": 3,          // Now live
      ...
    },
    "_hasUnpublishedChanges": false,
    "status": "active"
  },
  "message": "Site published successfully"
}
```

### Test 8: Verify Publish in Database

```sql
SELECT 
  id,
  name,
  default_currency as live_currency,
  gifts_per_user as live_gifts,
  draft_settings,
  status
FROM sites 
WHERE id = 'YOUR_SITE_ID';
```

**Expected Output:**
```
id          | name      | live_currency | live_gifts | draft_settings | status
------------+-----------+---------------+------------+----------------+--------
YOUR_SITE_ID| Site Name | EUR           | 3          | null           | active
```

Notice:
- Live columns now have new values (EUR, 3)
- draft_settings is NULL (cleared after publish)
- status is 'active'

### Test 9: Save Another Draft

```bash
curl -X PATCH \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/draft' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "settings": {
      "defaultCurrency": "GBP",
      "giftsPerUser": 5
    }
  }'
```

### Test 10: Discard Draft

```bash
curl -X DELETE \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/draft' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "settings": {
      "defaultCurrency": "EUR",  // Back to live value
      "giftsPerUser": 3,          // Back to live value
      ...
    }
  },
  "message": "Draft discarded successfully"
}
```

### Test 11: Verify Discard in Database

```sql
SELECT 
  id,
  name,
  default_currency,
  gifts_per_user,
  draft_settings
FROM sites 
WHERE id = 'YOUR_SITE_ID';
```

**Expected Output:**
```
id          | name      | default_currency | gifts_per_user | draft_settings
------------+-----------+------------------+----------------+----------------
YOUR_SITE_ID| Site Name | EUR              | 3              | null
```

Notice:
- Live columns unchanged (EUR, 3)
- draft_settings is NULL (discarded)

## Test Results Checklist

- [ ] Migration ran successfully (draft_settings column exists)
- [ ] Backend deployed successfully
- [ ] Test 1: Get site with draft works
- [ ] Test 2: Get live site data works
- [ ] Test 3: Save draft changes works
- [ ] Test 4: Draft stored in database (live columns unchanged)
- [ ] Test 5: Get with draft shows draft values
- [ ] Test 6: Get live shows old values (not draft)
- [ ] Test 7: Publish merges draft to live
- [ ] Test 8: Database shows live columns updated, draft cleared
- [ ] Test 9: Can save another draft after publish
- [ ] Test 10: Discard draft works
- [ ] Test 11: Database shows draft cleared, live unchanged

## Common Issues

### Issue 1: "Column draft_settings does not exist"
**Solution**: Run the migration (Step 1)

### Issue 2: "404 Not Found" on new endpoints
**Solution**: Deploy the backend (Step 2)

### Issue 3: "Unauthorized" errors
**Solution**: Make sure you're using a valid admin auth token

### Issue 4: "Site not found"
**Solution**: Use a valid site ID from your database

### Issue 5: Draft not saving
**Solution**: Check backend logs in Supabase dashboard → Edge Functions → Logs

## Success Criteria

✅ All 11 tests pass
✅ Draft changes stored separately from live
✅ Live columns only update on publish
✅ Draft can be discarded
✅ End users see live values only

## Next Steps After Testing

Once all tests pass:
1. Update frontend to use new endpoints
2. Test full workflow in UI
3. Deploy to production

## Quick Test Script

Save this as `test-draft-live.sh`:

```bash
#!/bin/bash

# Configuration
SITE_ID="YOUR_SITE_ID"
AUTH_TOKEN="YOUR_AUTH_TOKEN"
BASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"

echo "Testing Draft/Live Backend..."
echo "=============================="

echo -e "\n1. Get site with draft..."
curl -s -X GET "$BASE_URL/v2/sites/$SITE_ID/with-draft" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.data._hasUnpublishedChanges'

echo -e "\n2. Save draft..."
curl -s -X PATCH "$BASE_URL/v2/sites/$SITE_ID/draft" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"settings":{"defaultCurrency":"EUR","giftsPerUser":3}}' | jq '.success'

echo -e "\n3. Get with draft (should show EUR)..."
curl -s -X GET "$BASE_URL/v2/sites/$SITE_ID/with-draft" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.data.settings.defaultCurrency'

echo -e "\n4. Get live (should show USD)..."
curl -s -X GET "$BASE_URL/v2/sites/$SITE_ID/live" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.data.settings.defaultCurrency'

echo -e "\n5. Publish..."
curl -s -X POST "$BASE_URL/v2/sites/$SITE_ID/publish" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.success'

echo -e "\n6. Get live (should now show EUR)..."
curl -s -X GET "$BASE_URL/v2/sites/$SITE_ID/live" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.data.settings.defaultCurrency'

echo -e "\nDone!"
```

Make it executable and run:
```bash
chmod +x test-draft-live.sh
./test-draft-live.sh
```
