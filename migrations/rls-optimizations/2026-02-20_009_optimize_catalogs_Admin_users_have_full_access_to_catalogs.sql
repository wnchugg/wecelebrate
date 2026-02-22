-- Optimize policy: Admin users have full access to catalogs
-- Table: public.catalogs
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid())))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid()))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users have full access to catalogs" ON public.catalogs;

-- Create optimized policy
CREATE POLICY "Admin users have full access to catalogs"
  ON public.catalogs
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users have full access to catalogs
-- Table: public.catalogs

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users have full access to catalogs" ON public.catalogs;

-- Restore original policy
CREATE POLICY "Admin users have full access to catalogs"
  ON public.catalogs
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

COMMIT;
