-- Optimize policy: Admin users have full access to brands
-- Table: public.brands
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid())))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid()))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users have full access to brands" ON public.brands;

-- Create optimized policy
CREATE POLICY "Admin users have full access to brands"
  ON public.brands
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users have full access to brands
-- Table: public.brands

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users have full access to brands" ON public.brands;

-- Restore original policy
CREATE POLICY "Admin users have full access to brands"
  ON public.brands
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

COMMIT;
