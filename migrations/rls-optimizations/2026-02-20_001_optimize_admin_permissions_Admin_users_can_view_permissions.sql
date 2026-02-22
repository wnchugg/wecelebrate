-- Optimize policy: Admin users can view permissions
-- Table: public.admin_permissions
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid())))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid()))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users can view permissions" ON public.admin_permissions;

-- Create optimized policy
CREATE POLICY "Admin users can view permissions"
  ON public.admin_permissions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users can view permissions
-- Table: public.admin_permissions

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users can view permissions" ON public.admin_permissions;

-- Restore original policy
CREATE POLICY "Admin users can view permissions"
  ON public.admin_permissions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

COMMIT;
