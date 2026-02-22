-- Optimize policy: Admin users have full access to employees
-- Table: public.employees
-- Original USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid())))
-- Optimized USING: (EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid()))))

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users have full access to employees" ON public.employees;

-- Create optimized policy
CREATE POLICY "Admin users have full access to employees"
  ON public.employees
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = (SELECT auth.uid())))));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Admin users have full access to employees
-- Table: public.employees

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Admin users have full access to employees" ON public.employees;

-- Restore original policy
CREATE POLICY "Admin users have full access to employees"
  ON public.employees
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((EXISTS ( SELECT 1
   FROM admin_users
  WHERE (admin_users.id = auth.uid()))));

COMMIT;
