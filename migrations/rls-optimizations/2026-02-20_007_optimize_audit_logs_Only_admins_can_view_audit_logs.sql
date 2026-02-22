-- Optimize policy: Only admins can view audit logs
-- Table: public.audit_logs
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid())))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid()))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;

-- Create optimized policy
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Only admins can view audit logs
-- Table: public.audit_logs

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;

-- Restore original policy
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

COMMIT;
