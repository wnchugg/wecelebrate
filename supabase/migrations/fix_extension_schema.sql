-- Move pg_trgm extension from public schema to extensions schema
-- This is a security best practice to keep extensions separate from application tables

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension to extensions schema
-- Note: This requires superuser privileges, so it may need to be run manually
-- in Supabase dashboard if this migration fails

DO $$
BEGIN
  -- Check if pg_trgm is in public schema
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pg_trgm' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Move extension to extensions schema
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
    
    RAISE NOTICE 'pg_trgm extension moved to extensions schema';
  ELSE
    RAISE NOTICE 'pg_trgm extension not found in public schema or already moved';
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to move extension. Please run manually: ALTER EXTENSION pg_trgm SET SCHEMA extensions;';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error moving extension: %', SQLERRM;
END;
$$;

-- Grant usage on extensions schema to authenticated users
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;

-- Add comment
COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions, separated from application tables for security';
