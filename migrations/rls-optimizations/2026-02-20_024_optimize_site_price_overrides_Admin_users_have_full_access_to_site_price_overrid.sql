-- Optimize policy: Admin users have full access to site_price_overrides
-- Table: public.site_price_overrides
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid())))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid()))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users have full access to site_price_overrides" ON public.site_price_overrides;

-- Create optimized policy
CREATE POLICY "Admin users have full access to site_price_overrides"
  ON public.site_price_overrides
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users have full access to site_price_overrides
-- Table: public.site_price_overrides

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users have full access to site_price_overrides" ON public.site_price_overrides;

-- Restore original policy
CREATE POLICY "Admin users have full access to site_price_overrides"
  ON public.site_price_overrides
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

COMMIT;
