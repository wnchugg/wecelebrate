# Backend Test Fix Instructions

## Current Status

The RLS policies on `admin_users` have been fixed and are correctly configured in the database. However, backend integration tests are still failing because they need the **service role key** to bypass RLS.

## Problem

The test file `supabase/functions/server/tests/client_integration.vitest.test.ts` tries to use:
```typescript
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
```

But `SUPABASE_SERVICE_ROLE_KEY` is not in your `.env` file, so it falls back to the anon key. The anon key requires authentication, but the tests don't authenticate, causing "permission denied" errors.

## Solution: Add Service Role Key to .env

### Step 1: Get Your Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky
2. Navigate to: **Settings → API**
3. Scroll down to **Project API keys**
4. Find the **service_role** key (it's marked as "secret" and should NOT be exposed in frontend)
5. Click the eye icon to reveal it
6. Copy the key (starts with `eyJ...`)

### Step 2: Add to .env File

Add this line to your `.env` file:

```bash
# Backend Testing - Service Role Key (NEVER expose in frontend!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your_actual_key_here
```

**IMPORTANT SECURITY NOTES**:
- ⚠️ The service role key bypasses ALL RLS policies
- ⚠️ NEVER use this key in frontend code
- ⚠️ NEVER commit this key to git (`.env` is already in `.gitignore`)
- ✅ Only use for backend tests and server-side operations

### Step 3: Verify the Fix

After adding the key, run the backend tests:

```bash
npm run test:backend
```

Expected result: All 7 previously failing tests should now pass.

## Why This Works

The service role key has the `service_role` PostgreSQL role, which bypasses RLS. The RLS policies we fixed include:

```sql
CREATE POLICY "Service role has full access to admin_users"
  ON public.admin_users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

This allows backend tests to:
1. Create test clients
2. Query admin_users table
3. Perform CRUD operations
4. Clean up test data

All without needing to authenticate as a specific user.

## Alternative: Authenticate in Tests

If you prefer NOT to use the service role key in tests, you could modify the tests to:

1. Create a test admin user
2. Sign in with that user before tests
3. Use the authenticated session for queries

However, this is more complex and slower. The service role key is the standard approach for backend integration tests.

## Verification

After adding the key, you should see:

```bash
✓ supabase/functions/server/tests/client_integration.vitest.test.ts (11)
  ✓ End-to-End Client Creation Flow (4)
  ✓ End-to-End Client Update Flow (3)
  ✓ End-to-End Client Retrieval Flow (3)
  ✓ Complete CRUD Lifecycle (1)
```

## Next Steps

Once backend tests pass:
1. Update `TEST_FIXING_PLAN.md` to mark Phase 3 backend as complete
2. Proceed to Phase 4: Pages & Components tests
3. Run full test suite: `npm run test:safe`

---

**Created**: February 26, 2026
**Phase**: 3 - Integration Tests (Backend)
**Status**: Awaiting service role key addition to .env
