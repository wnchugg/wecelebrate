-- Optimize policy: Admin users can view their own proxy sessions
-- Table: public.proxy_sessions
-- Original USING: ((admin_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = auth.uid()) AND (admin_users.role = 'super_admin'::text)))))
-- Optimized USING: ((admin_id = (SELECT auth.uid())) OR (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = (SELECT auth.uid())) AND (admin_users.role = 'super_admin'::text)))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users can view their own proxy sessions" ON public.proxy_sessions;

-- Create optimized policy
CREATE POLICY "Admin users can view their own proxy sessions"
  ON public.proxy_sessions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((admin_id = (SELECT auth.uid())) OR (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = (SELECT auth.uid())) AND (admin_users.role = 'super_admin'::text))))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users can view their own proxy sessions
-- Table: public.proxy_sessions

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users can view their own proxy sessions" ON public.proxy_sessions;

-- Restore original policy
CREATE POLICY "Admin users can view their own proxy sessions"
  ON public.proxy_sessions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((admin_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.id = auth.uid()) AND (admin_users.role = 'super_admin'::text))))));

COMMIT;
