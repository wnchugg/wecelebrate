-- Optimize policy: Site users can view their site's orders
-- Table: public.orders
-- Original USING: (site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = auth.uid()) AND (site_users.status = 'active'::text))))
-- Optimized USING: (site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = (SELECT auth.uid())) AND (site_users.status = 'active'::text))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Site users can view their site's orders" ON public.orders;

-- Create optimized policy
CREATE POLICY "Site users can view their site's orders"
  ON public.orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = (SELECT auth.uid())) AND (site_users.status = 'active'::text)))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Site users can view their site's orders
-- Table: public.orders

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Site users can view their site's orders" ON public.orders;

-- Restore original policy
CREATE POLICY "Site users can view their site's orders"
  ON public.orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((site_id IN ( SELECT site_users.site_id
   FROM site_users
  WHERE ((site_users.id = auth.uid()) AND (site_users.status = 'active'::text)))));

COMMIT;
