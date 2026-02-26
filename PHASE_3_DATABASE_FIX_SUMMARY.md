# Phase 3: Database RLS Policy Fix - Summary

## Issue Identified

Backend integration tests failing with:
```
infinite recursion detected in policy for relation "admin_users"
```

**Affected Tests**: 7 tests in `supabase/functions/server/tests/client_integration.vitest.test.ts`

## Root Cause Analysis

The RLS policy on the `admin_users` table was checking if a user exists in `admin_users` by querying the same table, creating an infinite loop:

```sql
-- Problematic policy in fix_all_security_issues.sql (line 213)
CREATE POLICY "Only admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));
```

**Recursion Flow**:
1. Query attempts to access `admin_users` table
2. RLS policy triggers and checks: "Is this user in admin_users?"
3. To answer that, it queries `admin_users` table
4. Step 2 triggers again → infinite recursion

## Solution Implemented

Created migration: `supabase/migrations/fix_admin_users_rls_infinite_recursion.sql`

**Key Changes**:
1. Drop the recursive policy
2. Create new policies that use `auth.uid()` directly (no table query)
3. Allow users to view/update their own record only
4. Grant service role full access for backend operations

```sql
-- New policies (no recursion)
CREATE POLICY "Admin users can view their own record"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admin users can update their own record"
  ON public.admin_users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Service role has full access to admin_users"
  ON public.admin_users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

## Files Created

1. **Migration File**: `supabase/migrations/fix_admin_users_rls_infinite_recursion.sql`
   - SQL migration to fix the RLS policies
   - Includes verification queries
   - Well-documented with comments

2. **Implementation Guide**: `FIX_ADMIN_USERS_RLS_GUIDE.md`
   - Step-by-step instructions for applying the fix
   - Multiple implementation options (Dashboard, CLI, psql)
   - Verification steps
   - Rollback instructions
   - Security implications explained

3. **Application Script**: `scripts/apply-admin-users-rls-fix.ts`
   - TypeScript script for automated migration application
   - Requires service role key
   - Includes error handling and verification

## Implementation Status

⚠️ **PENDING**: Migration needs to be applied to the database

### To Apply the Fix:

**Option 1: Supabase Dashboard (Easiest)**
1. Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/sql
2. Copy contents of `supabase/migrations/fix_admin_users_rls_infinite_recursion.sql`
3. Paste and execute in SQL Editor
4. Run verification query
5. Test: `npm run test:backend`

**Option 2: Supabase CLI**
```bash
supabase link --project-ref wjfcqqrlhwdvvjmefxky
supabase db push
```

**Option 3: TypeScript Script**
```bash
SUPABASE_SERVICE_ROLE_KEY=your_key npm run tsx scripts/apply-admin-users-rls-fix.ts
```

## Expected Impact

### Before Fix
- ❌ 7 backend integration tests failing
- ❌ Cannot query `admin_users` table due to infinite recursion
- ❌ All tables with admin checks affected (12+ tables)

### After Fix
- ✅ All 7 backend integration tests passing
- ✅ Admin users can query their own record
- ✅ Service role has full access for backend operations
- ✅ All dependent tables work correctly

### Affected Tables (will work after fix)
All tables with policies checking admin status:
- clients, catalogs, brands, employees, orders
- site_product_exclusions, site_catalog_assignments
- site_price_overrides, site_category_exclusions
- site_gift_configs, email_templates, sites
- analytics_events, audit_logs, site_users

## Security Considerations

### Before
- **Intent**: Only admins can view admin_users
- **Reality**: Nobody can view due to infinite recursion

### After
- **Authenticated users**: Can view/update their own record only
- **Service role**: Full access (backend operations)
- **Principle**: Least privilege - users see only their own data

This is actually MORE secure than the intended original design.

## Testing Plan

1. **Apply Migration** (see Implementation Status above)

2. **Verify Policies**
   ```sql
   SELECT policyname, cmd, qual
   FROM pg_policies
   WHERE tablename = 'admin_users'
   ORDER BY policyname;
   ```

3. **Run Backend Tests**
   ```bash
   npm run test:backend
   ```
   Expected: 7 previously failing tests now pass

4. **Test Admin Authentication**
   ```sql
   SELECT * FROM admin_users WHERE id = auth.uid();
   ```
   Should return the current user's record

5. **Full Test Suite**
   ```bash
   npm run test:safe
   ```
   All tests should pass (frontend already passing)

## Rollback Plan

If issues arise, rollback is simple:
```sql
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Service role has full access to admin_users" ON public.admin_users;

-- Restore old policy (will cause recursion again)
CREATE POLICY "Only admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));
```

## Documentation

- ✅ Migration file with inline comments
- ✅ Comprehensive implementation guide
- ✅ Automated application script
- ✅ Verification queries included
- ✅ Security implications documented
- ✅ Rollback instructions provided

## Next Steps

1. **Apply the migration** using one of the three options above
2. **Verify** the fix with the provided queries
3. **Test** backend integration tests
4. **Update** TEST_FIXING_PLAN.md to mark Phase 3 backend as complete
5. **Proceed** to Phase 4: Pages & Components tests

## Related Issues

- Original issue: Backend integration tests failing (Phase 3)
- Related file: `supabase/migrations/fix_all_security_issues.sql` (line 213)
- Test file: `supabase/functions/server/tests/client_integration.vitest.test.ts`

## Lessons Learned

1. **RLS Policy Design**: Never query the same table you're protecting in an RLS policy
2. **Use auth.uid() directly**: For self-referential checks, use `auth.uid()` without table queries
3. **Service role bypass**: Backend operations should use service role to bypass RLS
4. **Test with real database**: RLS issues only appear when testing against actual database

---

**Status**: ✅ Solution Ready - Awaiting Database Application
**Created**: February 26, 2026
**Phase**: 3 - Integration Tests (Backend)
**Priority**: High - Blocks 7 backend integration tests
