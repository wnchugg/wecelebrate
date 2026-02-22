-- Optimize policy: Admin users have full access to site_product_exclusions
-- Table: public.site_product_exclusions
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid())))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid()))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users have full access to site_product_exclusions" ON public.site_product_exclusions;

-- Create optimized policy
CREATE POLICY "Admin users have full access to site_product_exclusions"
  ON public.site_product_exclusions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users have full access to site_product_exclusions
-- Table: public.site_product_exclusions

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users have full access to site_product_exclusions" ON public.site_product_exclusions;

-- Restore original policy
CREATE POLICY "Admin users have full access to site_product_exclusions"
  ON public.site_product_exclusions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

COMMIT;
