-- Optimize policy: Admin users can update their own proxy sessions
-- Table: public.proxy_sessions
-- Original USING: (admin_id = auth.uid())
-- Optimized USING: (admin_id = (SELECT auth.uid()))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users can update their own proxy sessions" ON public.proxy_sessions;

-- Create optimized policy
CREATE POLICY "Admin users can update their own proxy sessions"
  ON public.proxy_sessions
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((admin_id = (SELECT auth.uid())));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users can update their own proxy sessions
-- Table: public.proxy_sessions

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users can update their own proxy sessions" ON public.proxy_sessions;

-- Restore original policy
CREATE POLICY "Admin users can update their own proxy sessions"
  ON public.proxy_sessions
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((admin_id = auth.uid()));

COMMIT;
