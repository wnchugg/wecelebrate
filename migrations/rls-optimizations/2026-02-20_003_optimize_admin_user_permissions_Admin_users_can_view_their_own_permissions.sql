-- Optimize policy: Admin users can view their own permissions
-- Table: public.admin_user_permissions
-- Original USING: ((admin_user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = auth.uid()) AND (admin_users.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
-- Optimized USING: ((admin_user_id = (SELECT auth.uid())) OR (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = (SELECT auth.uid())) AND (admin_users.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users can view their own permissions" ON public.admin_user_permissions;

-- Create optimized policy
CREATE POLICY "Admin users can view their own permissions"
  ON public.admin_user_permissions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((admin_user_id = (SELECT auth.uid())) OR (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = (SELECT auth.uid())) AND (admin_users.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users can view their own permissions
-- Table: public.admin_user_permissions

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users can view their own permissions" ON public.admin_user_permissions;

-- Restore original policy
CREATE POLICY "Admin users can view their own permissions"
  ON public.admin_user_permissions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((admin_user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = auth.uid()) AND (admin_users.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))));

COMMIT;
