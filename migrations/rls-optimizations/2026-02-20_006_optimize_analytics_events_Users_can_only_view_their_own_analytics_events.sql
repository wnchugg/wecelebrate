-- Optimize policy: Users can only view their own analytics events
-- Table: public.analytics_events
-- Original USING: ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))) OR (user_id = (auth.uid())::text))
-- Optimized USING: ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))) OR (user_id = ((SELECT auth.uid()))::text))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Users can only view their own analytics events" ON public.analytics_events;

-- Create optimized policy
CREATE POLICY "Users can only view their own analytics events"
  ON public.analytics_events
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))) OR (user_id = ((SELECT auth.uid()))::text)));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Users can only view their own analytics events
-- Table: public.analytics_events

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Users can only view their own analytics events" ON public.analytics_events;

-- Restore original policy
CREATE POLICY "Users can only view their own analytics events"
  ON public.analytics_events
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))) OR (user_id = (auth.uid())::text)));

COMMIT;
