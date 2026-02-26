-- ============================================================================
-- Fix Infinite Recursion in admin_users RLS Policy (Version 2)
-- ============================================================================
-- 
-- Problem: The existing policy checks if a user exists in admin_users by
-- querying admin_users, which triggers RLS on admin_users, creating infinite
-- recursion.
--
-- Solution: Allow authenticated users to view their own admin_users record
-- directly using auth.uid() without querying the table.
--
-- This version forcefully drops all existing policies first.
-- ============================================================================

-- Step 1: Drop ALL existing policies on admin_users (force clean slate)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'admin_users' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 2: Create new policies that don't cause recursion

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

-- Step 3: Add comments for documentation
COMMENT ON POLICY "Admin users can view their own record" ON public.admin_users 
IS 'Allows admin users to view their own record without causing infinite recursion';

COMMENT ON POLICY "Admin users can update their own record" ON public.admin_users 
IS 'Allows admin users to update their own profile information';

COMMENT ON POLICY "Service role has full access to admin_users" ON public.admin_users 
IS 'Backend service role can manage all admin users';

-- Step 4: Verify the new policies
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'admin_users'
    AND schemaname = 'public';
    
    RAISE NOTICE 'Total policies on admin_users: %', policy_count;
    
    IF policy_count != 3 THEN
        RAISE WARNING 'Expected 3 policies but found %. Please verify manually.', policy_count;
    ELSE
        RAISE NOTICE 'SUCCESS: All 3 policies created correctly!';
    END IF;
END $$;

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
