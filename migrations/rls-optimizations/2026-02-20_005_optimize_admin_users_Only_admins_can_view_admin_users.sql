-- Optimize policy: Only admins can view admin users
-- Table: public.admin_users
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users admin_users_1
  WHERE (admin_users_1.id = auth.uid())))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users admin_users_1
  WHERE (admin_users_1.id = (SELECT auth.uid()))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Only admins can view admin users" ON public.admin_users;

-- Create optimized policy
CREATE POLICY "Only admins can view admin users"
  ON public.admin_users
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users admin_users_1
  WHERE (admin_users_1.id = (SELECT auth.uid())))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Only admins can view admin users
-- Table: public.admin_users

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Only admins can view admin users" ON public.admin_users;

-- Restore original policy
CREATE POLICY "Only admins can view admin users"
  ON public.admin_users
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users admin_users_1
  WHERE (admin_users_1.id = auth.uid()))));

COMMIT;
