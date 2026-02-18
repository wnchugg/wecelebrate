# Backend Deployment Required

## Current Status

✅ **Code is Ready**
- All new CRUD functions added to `crud_db.ts`
- All new endpoints added to `endpoints_v2.ts`
- All routes registered in `index.tsx`
- Helper functions added to `helpers.ts`

❌ **Not Yet Deployed**
- The new endpoints are returning 404 errors
- This means the backend needs to be redeployed

## What Needs to Be Done

### Step 1: Run Database Migration

First, add the `draft_settings` column to your database:

1. Go to https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/sql
2. Click "New Query"
3. Paste this SQL:

```sql
-- Add draft_settings column
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS draft_settings JSONB DEFAULT NULL;

-- Verify it was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sites' AND column_name = 'draft_settings';
```

4. Click "Run"
5. You should see:
```
column_name      | data_type | is_nullable
-----------------+-----------+-------------
draft_settings   | jsonb     | YES
```

### Step 2: Deploy Backend

Deploy the updated backend code:

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/functions
2. Find the `server` function in the list
3. Click the three dots menu (⋮) next to it
4. Click "Deploy new version" or "Redeploy"
5. Wait for deployment to complete (usually 1-2 minutes)
6. Check the logs to ensure no errors

#### Option B: Via Supabase CLI

If you have Docker running:

```bash
cd supabase/functions
supabase functions deploy server --no-verify-jwt
```

### Step 3: Verify Deployment

After deployment, test that the new endpoints exist:

```bash
# Replace YOUR_SITE_ID and YOUR_AUTH_TOKEN
curl -X GET \
  'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/v2/sites/YOUR_SITE_ID/with-draft' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

If you get a JSON response (not 404), deployment was successful!

### Step 4: Run Tests

Once deployed, run the test script:

```bash
./test-draft-live-backend.sh
```

## New Endpoints Available After Deployment

Once deployed, these endpoints will be available:

1. `GET /v2/sites/:id/with-draft` - Get site with draft merged (admin view)
2. `GET /v2/sites/:id/live` - Get only live data (for comparison)
3. `PATCH /v2/sites/:id/draft` - Save changes to draft
4. `POST /v2/sites/:id/publish` - Publish draft to live
5. `DELETE /v2/sites/:id/draft` - Discard draft changes

## Files Modified (Ready for Deployment)

✅ `supabase/functions/server/helpers.ts` - Added draft/live helper functions
✅ `supabase/functions/server/crud_db.ts` - Added 5 new CRUD functions
✅ `supabase/functions/server/endpoints_v2.ts` - Added 5 new endpoint handlers
✅ `supabase/functions/server/index.tsx` - Registered 5 new routes
✅ `supabase/migrations/add_draft_settings_column.sql` - Migration ready to run

## Troubleshooting

### Issue: Still getting 404 after deployment
**Solution**: 
- Check Edge Function logs in Supabase dashboard
- Verify deployment completed successfully
- Try redeploying

### Issue: "Column draft_settings does not exist"
**Solution**: Run Step 1 (database migration)

### Issue: Deployment fails
**Solution**: 
- Check for syntax errors in the logs
- Ensure all imports are correct
- Try deploying via dashboard instead of CLI

## Next Steps After Deployment

1. ✅ Run database migration
2. ✅ Deploy backend
3. ✅ Verify endpoints work (no 404)
4. ✅ Run test script
5. ⏭️ Proceed with frontend integration

## Quick Deployment Checklist

- [ ] Database migration run (draft_settings column exists)
- [ ] Backend deployed via dashboard or CLI
- [ ] Deployment logs show no errors
- [ ] Test endpoint returns JSON (not 404)
- [ ] Ready to run test script

---

**Current Error:** 404 Not Found on `/v2/sites/:id/with-draft`

**Root Cause:** Backend not yet deployed with new endpoints

**Solution:** Deploy backend via Supabase Dashboard (Step 2 above)
