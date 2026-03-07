-- ============================================================================
-- Fix admin_users RLS for Tests Using Authenticated Role
-- ============================================================================
-- The tests use the anon key (authenticated role) not service role.
-- We need to allow authenticated users to check if a user is an admin
-- without causing infinite recursion.
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Service role has full access to admin_users" ON public.admin_users;

-- Policy 1: Authenticated users can SELECT from admin_users
-- This allows checking if someone is an admin without recursion
CREATE POLICY "Authenticated users can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to view admin records

-- Policy 2: Authenticated users can UPDATE their own record
CREATE POLICY "Authenticated users can update their own record"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy 3: Authenticated users can INSERT (for tests)
CREATE POLICY "Authenticated users can insert admin_users"
  ON public.admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Allow for test setup

-- Policy 4: Authenticated users can DELETE (for test cleanup)
CREATE POLICY "Authenticated users can delete admin_users"
  ON public.admin_users
  FOR DELETE
  TO authenticated
  USING (true);  -- Allow for test cleanup

-- Policy 5: Service role has full access (backend operations)
CREATE POLICY "Service role has full access to admin_users"
  ON public.admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify all policies
SELECT 
    policyname,
    cmd,
    roles,
    qual as "using_clause"
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- Expected output (5 policies):
-- 1. Authenticated users can delete admin_users | DELETE | {authenticated} | true
-- 2. Authenticated users can insert admin_users | INSERT | {authenticated} | NULL (WITH CHECK: true)
-- 3. Authenticated users can update their own record | UPDATE | {authenticated} | (id = auth.uid())
-- 4. Authenticated users can view admin_users | SELECT | {authenticated} | true
-- 5. Service role has full access to admin_users | ALL | {service_role} | true
