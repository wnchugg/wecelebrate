-- Optimize policy: Super admins can manage permissions
-- Table: public.admin_permissions
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = auth.uid()) AND (admin_users.role = 'super_admin'::text))))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = (SELECT auth.uid())) AND (admin_users.role = 'super_admin'::text))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.admin_permissions;

-- Create optimized policy
CREATE POLICY "Super admins can manage permissions"
  ON public.admin_permissions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = (SELECT auth.uid())) AND (admin_users.role = 'super_admin'::text)))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Super admins can manage permissions
-- Table: public.admin_permissions

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.admin_permissions;

-- Restore original policy
CREATE POLICY "Super admins can manage permissions"
  ON public.admin_permissions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = auth.uid()) AND (admin_users.role = 'super_admin'::text)))));

COMMIT;
