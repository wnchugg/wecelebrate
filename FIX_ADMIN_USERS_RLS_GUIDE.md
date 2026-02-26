# Fix admin_users RLS Infinite Recursion - Implementation Guide

## Problem

The backend integration tests are failing with:
```
infinite recursion detected in policy for relation "admin_users"
```

## Root Cause

The RLS policy on `admin_users` table checks if a user exists in `admin_users` by querying the same table:

```sql
CREATE POLICY "Only admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));
```

This creates infinite recursion:
1. Query tries to access `admin_users`
2. RLS policy checks if user is in `admin_users` (queries `admin_users`)
3. That query triggers RLS on `admin_users` again
4. Infinite loop!

## Solution

Replace the problematic policy with one that uses `auth.uid()` directly without querying `admin_users`.

## Implementation Steps

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky
   - Navigate to: SQL Editor

2. **Copy and Execute the Migration**
   - Copy the entire contents of: `supabase/migrations/fix_admin_users_rls_infinite_recursion.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter

3. **Verify the Fix**
   - Run this verification query:
   ```sql
   SELECT policyname, cmd, qual, with_check
   FROM pg_policies
   WHERE tablename = 'admin_users'
   ORDER BY policyname;
   ```
   
   - Expected output (3 policies):
     - `Admin users can view their own record` - SELECT - `(id = auth.uid())`
     - `Admin users can update their own record` - UPDATE - `(id = auth.uid())`
     - `Service role has full access to admin_users` - ALL - `true`

4. **Test the Backend**
   ```bash
   npm run test:backend
   ```
   
   - The 7 failing tests in `client_integration.vitest.test.ts` should now pass

### Option 2: Via Supabase CLI

```bash
# Link to your project (if not already linked)
supabase link --project-ref wjfcqqrlhwdvvjmefxky

# Apply the migration
supabase db push
```

### Option 3: Via psql (if you have direct database access)

```bash
# Connect to the database
psql "postgresql://postgres:[YOUR_PASSWORD]@db.wjfcqqrlhwdvvjmefxky.supabase.co:5432/postgres"

# Run the migration
\i supabase/migrations/fix_admin_users_rls_infinite_recursion.sql
```

## What Changed

### Before (Problematic)
```sql
-- This causes infinite recursion
CREATE POLICY "Only admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));
```

### After (Fixed)
```sql
-- Users can view their own record (no recursion)
CREATE POLICY "Admin users can view their own record"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own record
CREATE POLICY "Admin users can update their own record"
  ON public.admin_users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Service role has full access (for backend operations)
CREATE POLICY "Service role has full access to admin_users"
  ON public.admin_users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

## Impact on Other Tables

The fix also affects other tables that check admin permissions. After applying this fix, those policies will work correctly because they can now query `admin_users` without triggering infinite recursion.

### Tables with admin checks (will now work):
- `clients`
- `catalogs`
- `brands`
- `employees`
- `orders`
- `site_product_exclusions`
- `site_catalog_assignments`
- `site_price_overrides`
- `site_category_exclusions`
- `site_gift_configs`
- `email_templates`
- `sites`
- `analytics_events`
- `audit_logs`
- `site_users`

All these tables have policies like:
```sql
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
```

These will now work because querying `admin_users` no longer causes recursion.

## Testing

### 1. Test Backend Integration Tests
```bash
npm run test:backend
```

Expected: 7 previously failing tests should now pass:
- `should create client with all fields and return complete object`
- `should create client with only required fields`
- `should load existing client, update fields, and return complete object`
- `should update only changed fields and preserve all others`
- `should retrieve client with all fields in correct format`
- `should handle null values in optional fields correctly`
- `should complete full lifecycle: create -> read -> update -> read -> delete`

### 2. Test Admin Authentication
```bash
# In Supabase SQL Editor, test that admin users can query their own record:
SELECT * FROM admin_users WHERE id = auth.uid();
```

### 3. Test Service Role Access
The backend Edge Functions use the service role, which should have full access to all admin_users records.

## Rollback (if needed)

If you need to rollback this change:

```sql
-- Drop the new policies
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Service role has full access to admin_users" ON public.admin_users;

-- Restore the old policy (WARNING: This will cause infinite recursion again!)
CREATE POLICY "Only admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));
```

## Additional Notes

### Why This Fix Works

1. **Direct auth.uid() check**: Instead of querying `admin_users` to check if a user is an admin, we directly check if the user's ID matches the record's ID.

2. **Service role bypass**: The service role (used by backend Edge Functions) has full access and bypasses RLS entirely, so it can query all admin_users records.

3. **No circular dependency**: The policy no longer depends on querying the same table it's protecting.

### Security Implications

- **Before**: Only admins could view admin_users (but it didn't work due to recursion)
- **After**: Authenticated users can view their own admin_users record only
- **Service role**: Backend can still manage all admin users

This is actually more secure and follows the principle of least privilege - users can only see their own data.

## Completion Checklist

- [ ] Migration file created: `supabase/migrations/fix_admin_users_rls_infinite_recursion.sql`
- [ ] Migration applied to development database (wjfcqqrlhwdvvjmefxky)
- [ ] Verification query executed successfully
- [ ] Backend integration tests passing (`npm run test:backend`)
- [ ] Migration applied to production database (if applicable)
- [ ] Documentation updated

## Support

If you encounter issues:
1. Check the Supabase logs: Dashboard > Logs
2. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'admin_users';`
3. Check existing policies: `SELECT * FROM pg_policies WHERE tablename = 'admin_users';`
4. Contact the database administrator or Supabase support

---

**Created**: February 26, 2026
**Issue**: Backend integration tests failing with infinite recursion
**Resolution**: Replace recursive RLS policy with direct auth.uid() check
