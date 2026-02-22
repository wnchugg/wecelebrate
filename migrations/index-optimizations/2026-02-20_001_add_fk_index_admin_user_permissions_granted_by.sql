-- Add index for foreign key: admin_user_permissions_granted_by_fkey
-- Table: public.admin_user_permissions
-- Columns: granted_by
-- Impact: Improves join performance and referential integrity checks

-- Note: CREATE INDEX CONCURRENTLY cannot run inside a transaction block
-- This is safe for production as it doesn't lock the table

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_user_permissions_fk_granted_by
  ON public.admin_user_permissions (granted_by);


-- ROLLBACK SCRIPT:
-- ------------------------------------------------------------------------------
-- Remove index for foreign key: admin_user_permissions_granted_by_fkey
-- Table: public.admin_user_permissions

-- Note: DROP INDEX CONCURRENTLY cannot run inside a transaction block

-- DROP INDEX CONCURRENTLY IF EXISTS public.idx_admin_user_permissions_fk_granted_by;
