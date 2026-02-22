-- Optimize policy: Site users can read their own site
-- Table: public.sites
-- Original USING: (EXISTS ( SELECT 1
   FROM site_users
  WHERE ((site_users.id = auth.uid()) AND (site_users.site_id = sites.id))))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM site_users
  WHERE ((site_users.id = (SELECT auth.uid())) AND (site_users.site_id = sites.id))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Site users can read their own site" ON public.sites;

-- Create optimized policy
CREATE POLICY "Site users can read their own site"
  ON public.sites
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM site_users
  WHERE ((site_users.id = (SELECT auth.uid())) AND (site_users.site_id = sites.id)))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Site users can read their own site
-- Table: public.sites

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Site users can read their own site" ON public.sites;

-- Restore original policy
CREATE POLICY "Site users can read their own site"
  ON public.sites
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM site_users
  WHERE ((site_users.id = auth.uid()) AND (site_users.site_id = sites.id)))));

COMMIT;
