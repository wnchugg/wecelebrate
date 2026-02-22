-- Optimize policy: Admin users have full access to orders
-- Table: public.orders
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid())))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid()))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users have full access to orders" ON public.orders;

-- Create optimized policy
CREATE POLICY "Admin users have full access to orders"
  ON public.orders
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users have full access to orders
-- Table: public.orders

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users have full access to orders" ON public.orders;

-- Restore original policy
CREATE POLICY "Admin users have full access to orders"
  ON public.orders
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

COMMIT;
