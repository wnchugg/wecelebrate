-- Optimize policy: Authenticated users can view products
-- Table: public.products
-- Original USING: (auth.role() = 'authenticated'::text)
-- Optimized USING: ((SELECT auth.role()) = 'authenticated'::text)

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;

-- Create optimized policy
CREATE POLICY "Authenticated users can view products"
  ON public.products
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.role()) = 'authenticated'::text));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Authenticated users can view products
-- Table: public.products

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;

-- Restore original policy
CREATE POLICY "Authenticated users can view products"
  ON public.products
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((auth.role() = 'authenticated'::text));

COMMIT;
