-- Optimize policy: Admin users have full access to site_catalog_assignments
-- Table: public.site_catalog_assignments
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid())))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid()))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users have full access to site_catalog_assignments" ON public.site_catalog_assignments;

-- Create optimized policy
CREATE POLICY "Admin users have full access to site_catalog_assignments"
  ON public.site_catalog_assignments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users have full access to site_catalog_assignments
-- Table: public.site_catalog_assignments

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users have full access to site_catalog_assignments" ON public.site_catalog_assignments;

-- Restore original policy
CREATE POLICY "Admin users have full access to site_catalog_assignments"
  ON public.site_catalog_assignments
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

COMMIT;
