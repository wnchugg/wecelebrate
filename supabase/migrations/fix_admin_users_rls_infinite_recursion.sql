-- ============================================================================
-- Fix Infinite Recursion in admin_users RLS Policy
-- ============================================================================
-- 
-- Problem: The existing policy checks if a user exists in admin_users by
-- querying admin_users, which triggers RLS on admin_users, creating infinite
-- recursion.
--
-- Solution: Allow authenticated users to view their own admin_users record
-- directly using auth.uid() without querying the table.
--
-- ============================================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Only admins can view admin users" ON public.admin_users;

-- Create a new policy that doesn't cause recursion
-- Admin users can view their own record
CREATE POLICY "Admin users can view their own record"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admin users can update their own record (for profile updates, last_login, etc.)
CREATE POLICY "Admin users can update their own record"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Service role has full access (for backend operations like user creation)
CREATE POLICY "Service role has full access to admin_users"
  ON public.admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON POLICY "Admin users can view their own record" ON public.admin_users 
IS 'Allows admin users to view their own record without causing infinite recursion';

COMMENT ON POLICY "Admin users can update their own record" ON public.admin_users 
IS 'Allows admin users to update their own profile information';

COMMENT ON POLICY "Service role has full access to admin_users" ON public.admin_users 
IS 'Backend service role can manage all admin users';

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify the policies were updated correctly:
-- 
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'admin_users'
-- ORDER BY policyname;
--
-- Expected policies:
-- 1. "Admin users can view their own record" - SELECT - (id = auth.uid())
-- 2. "Admin users can update their own record" - UPDATE - (id = auth.uid())
-- 3. "Service role has full access to admin_users" - ALL - true
-- ============================================================================

