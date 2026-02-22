-- Add RLS Policies for Tables Missing Them
-- Fixes INFO level warnings for kv_store_6fcaeea3 and sites tables

-- =====================================================
-- 1. KV Store Table Policies
-- =====================================================
-- The kv_store is used by the backend for key-value storage
-- Only service role should have access (backend only)

-- Policy: Service role has full access to kv_store
CREATE POLICY "Service role has full access to kv_store"
ON public.kv_store_6fcaeea3
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Authenticated users can read kv_store (if needed for frontend)
-- Uncomment if frontend needs to read from kv_store
-- CREATE POLICY "Authenticated users can read kv_store"
-- ON public.kv_store_6fcaeea3
-- FOR SELECT
-- TO authenticated
-- USING (true);

COMMENT ON POLICY "Service role has full access to kv_store" ON public.kv_store_6fcaeea3 
IS 'Backend service role can read/write all kv_store data';

-- =====================================================
-- 2. Sites Table Policies
-- =====================================================
-- Sites are accessed by both admins and site users

-- Policy: Admin users have full access to all sites
CREATE POLICY "Admin users have full access to sites"
ON public.sites
FOR ALL
TO authenticated
USING (
  -- Check if user is an admin
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  )
);

-- Policy: Site users can read their own site
CREATE POLICY "Site users can read their own site"
ON public.sites
FOR SELECT
TO authenticated
USING (
  -- Check if user is a site_user for this site
  EXISTS (
    SELECT 1 FROM site_users
    WHERE site_users.id = auth.uid()
      AND site_users.site_id = sites.id
  )
);

-- Policy: Service role has full access to sites (for backend operations)
CREATE POLICY "Service role has full access to sites"
ON public.sites
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON POLICY "Admin users have full access to sites" ON public.sites 
IS 'Admin users can manage all sites';

COMMENT ON POLICY "Site users can read their own site" ON public.sites 
IS 'Site users can view their own site details';

COMMENT ON POLICY "Service role has full access to sites" ON public.sites 
IS 'Backend service role can manage all sites';

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify policies were created:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename IN ('kv_store_6fcaeea3', 'sites')
-- ORDER BY tablename, policyname;
