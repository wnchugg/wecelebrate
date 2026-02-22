-- Optimize policy: Admin users have full access to sites
-- Table: public.sites
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid())))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid()))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users have full access to sites" ON public.sites;

-- Create optimized policy
CREATE POLICY "Admin users have full access to sites"
  ON public.sites
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users have full access to sites
-- Table: public.sites

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users have full access to sites" ON public.sites;

-- Restore original policy
CREATE POLICY "Admin users have full access to sites"
  ON public.sites
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

COMMIT;
