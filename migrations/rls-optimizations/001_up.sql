-- Optimize policy: Admin users can view permissions
-- Table: public.admin_permissions

BEGIN;

DROP POLICY IF EXISTS "Admin users can view permissions" ON public.admin_permissions;

CREATE POLICY "Admin users can view permissions"
  ON public.admin_permissions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))));

COMMIT;
