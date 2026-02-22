-- Optimize policy: Site users access control
-- Table: public.site_users
-- Original USING: ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))) OR ((id = auth.uid()) AND (status = 'active'::text)))
-- Optimized USING: ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))) OR ((id = (SELECT auth.uid())) AND (status = 'active'::text)))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Site users access control" ON public.site_users;

-- Create optimized policy
CREATE POLICY "Site users access control"
  ON public.site_users
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))) OR ((id = (SELECT auth.uid())) AND (status = 'active'::text))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Site users access control
-- Table: public.site_users

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Site users access control" ON public.site_users;

-- Restore original policy
CREATE POLICY "Site users access control"
  ON public.site_users
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))) OR ((id = auth.uid()) AND (status = 'active'::text))));

COMMIT;
