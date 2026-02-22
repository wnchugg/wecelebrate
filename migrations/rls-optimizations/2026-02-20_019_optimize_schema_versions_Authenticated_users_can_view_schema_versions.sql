-- Optimize policy: Authenticated users can view schema versions
-- Table: public.schema_versions
-- Original USING: (auth.role() = 'authenticated'::text)
-- Optimized USING: ((SELECT auth.role()) = 'authenticated'::text)

BEGIN;

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can view schema versions" ON public.schema_versions;

-- Create optimized policy
CREATE POLICY "Authenticated users can view schema versions"
  ON public.schema_versions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.role()) = 'authenticated'::text));

COMMIT;


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Rollback optimization: Authenticated users can view schema versions
-- Table: public.schema_versions

BEGIN;

-- Drop optimized policy
DROP POLICY IF EXISTS "Authenticated users can view schema versions" ON public.schema_versions;

-- Restore original policy
CREATE POLICY "Authenticated users can view schema versions"
  ON public.schema_versions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((auth.role() = 'authenticated'::text));

COMMIT;
