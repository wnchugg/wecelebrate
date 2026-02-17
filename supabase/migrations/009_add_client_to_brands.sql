-- ============================================================================
-- Migration 009: Add Client Association to Brands
-- Purpose: Associate each brand with a specific client for data isolation
-- Date: February 16, 2026
-- ============================================================================

-- Add client_id to brands table
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Add index for client_id lookups
CREATE INDEX IF NOT EXISTS idx_brands_client_id ON brands(client_id) WHERE client_id IS NOT NULL;

-- Update the unique constraint to be per-client (remove old constraint first)
ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_name_unique;
ALTER TABLE brands ADD CONSTRAINT brands_name_client_unique UNIQUE (name, client_id);

-- Comments
COMMENT ON COLUMN brands.client_id IS 'Client that owns this brand (NULL for global/system brands)';

-- Update schema version
INSERT INTO schema_versions (version, description) VALUES 
  (9, 'Added client_id to brands table for client-specific brand isolation')
ON CONFLICT (version) DO NOTHING;
