-- ============================================================================
-- STEP-BY-STEP FIX: admin_users RLS Infinite Recursion
-- ============================================================================
-- Run each section separately in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop all existing policies
-- Copy and run this first:
-- ============================================================================

DROP POLICY IF EXISTS "Only admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users have full access to admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update their own record" ON public.admin_users;
DROP POLICY IF EXISTS "Service role has full access to admin_users" ON public.admin_users;

-- ============================================================================
-- STEP 2: Create policy for viewing own record
-- Copy and run this second:
-- ============================================================================

CREATE POLICY "Admin users can view their own record"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ============================================================================
-- STEP 3: Create policy for updating own record
-- Copy and run this third:
-- ============================================================================

CREATE POLICY "Admin users can update their own record"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- STEP 4: Create policy for service role
-- Copy and run this fourth:
-- ============================================================================

CREATE POLICY "Service role has full access to admin_users"
  ON public.admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STEP 5: Verify the fix
-- Copy and run this last to verify:
-- ============================================================================

SELECT 
    policyname,
    cmd,
    qual as "using_clause"
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- You should see exactly 3 policies:
-- 1. Admin users can view their own record
-- 2. Admin users can update their own record  
-- 3. Service role has full access to admin_users
