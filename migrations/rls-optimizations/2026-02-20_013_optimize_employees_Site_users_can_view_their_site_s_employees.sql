-- Optimize policy: Site users can view their site's employees
-- Table: public.employees
-- Original USING: (site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = auth.uid()) AND (site_users.status = 'active'::text))))
-- Optimized USING: (site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = (SELECT auth.uid())) AND (site_users.status = 'active'::text))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Site users can view their site's employees" ON public.employees;

-- Create optimized policy
CREATE POLICY "Site users can view their site's employees"
  ON public.employees
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = (SELECT auth.uid())) AND (site_users.status = 'active'::text)))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Site users can view their site's employees
-- Table: public.employees

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Site users can view their site's employees" ON public.employees;

-- Restore original policy
CREATE POLICY "Site users can view their site's employees"
  ON public.employees
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = auth.uid()) AND (site_users.status = 'active'::text)))));

COMMIT;
