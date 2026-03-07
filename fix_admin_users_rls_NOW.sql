-- ============================================================================
-- IMMEDIATE FIX: admin_users RLS Infinite Recursion
-- ============================================================================
-- Copy and paste this entire script into Supabase SQL Editor and run it.
-- This will forcefully fix the infinite recursion issue.
-- ============================================================================

-- Step 1: Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Only admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users have full access to admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Service role has full access to admin_users" ON public.admin_users;

-- Step 2: Create the correct policies (no recursion)

CREATE POLICY "Admin users can view their own record"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admin users can update their own record"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Service role has full access to admin_users"
  ON public.admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 3: Verify (this will show you the 3 new policies)
SELECT 
    policyname,
    cmd,
    qual as "using_clause",
    with_check as "with_check_clause"
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- Expected output:
-- 1. Admin users can view their own record | SELECT | (id = auth.uid()) | NULL
-- 2. Admin users can update their own record | UPDATE | (id = auth.uid()) | (id = auth.uid())
-- 3. Service role has full access to admin_users | ALL | true | true
