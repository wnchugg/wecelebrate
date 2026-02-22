-- Optimize policy: Site users can view their site configurations
-- Table: public.site_gift_configs
-- Original USING: (site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = auth.uid()) AND (site_users.status = 'active'::text))))
-- Optimized USING: (site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = (SELECT auth.uid())) AND (site_users.status = 'active'::text))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Site users can view their site configurations" ON public.site_gift_configs;

-- Create optimized policy
CREATE POLICY "Site users can view their site configurations"
  ON public.site_gift_configs
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = (SELECT auth.uid())) AND (site_users.status = 'active'::text)))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Site users can view their site configurations
-- Table: public.site_gift_configs

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Site users can view their site configurations" ON public.site_gift_configs;

-- Restore original policy
CREATE POLICY "Site users can view their site configurations"
  ON public.site_gift_configs
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = auth.uid()) AND (site_users.status = 'active'::text)))));

COMMIT;
