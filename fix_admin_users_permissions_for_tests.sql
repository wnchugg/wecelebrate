-- ============================================================================
-- Add INSERT and DELETE policies for admin_users (needed for tests)
-- ============================================================================
-- The previous fix resolved infinite recursion but tests need to be able to
-- create and delete admin users for testing purposes.
-- ============================================================================

-- Allow service role to INSERT admin users (for test setup)
CREATE POLICY IF NOT EXISTS "Service role can insert admin_users"
  ON public.admin_users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to DELETE admin users (for test cleanup)
CREATE POLICY IF NOT EXISTS "Service role can delete admin_users"
  ON public.admin_users
  FOR DELETE
  TO service_role
  USING (true);

-- Verify all policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- Expected output (5 policies):
-- 1. Admin users can update their own record | UPDATE | {authenticated}
-- 2. Admin users can view their own record | SELECT | {authenticated}
-- 3. Service role can delete admin_users | DELETE | {service_role}
-- 4. Service role can insert admin_users | INSERT | {service_role}
-- 5. Service role has full access to admin_users | ALL | {service_role}
