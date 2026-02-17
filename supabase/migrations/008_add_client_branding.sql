-- ============================================================================
-- Migration 008: Add Brand References to Clients and Sites
-- Purpose: Link clients and sites to brands table for reusable branding
-- Date: February 16, 2026
-- ============================================================================

-- Add brand reference and override fields to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS default_brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branding_overrides JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS header_footer_config JSONB DEFAULT '{}';

-- Add brand reference and override fields to sites table
ALTER TABLE sites
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branding_overrides JSONB DEFAULT '{}';

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_clients_default_brand_id ON clients(default_brand_id) WHERE default_brand_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sites_brand_id ON sites(brand_id) WHERE brand_id IS NOT NULL;

-- Add indexes for JSONB override fields
CREATE INDEX IF NOT EXISTS idx_clients_branding_overrides ON clients USING gin(branding_overrides);
CREATE INDEX IF NOT EXISTS idx_clients_header_footer_config ON clients USING gin(header_footer_config);
CREATE INDEX IF NOT EXISTS idx_sites_branding_overrides ON sites USING gin(branding_overrides);

-- Comments
COMMENT ON COLUMN clients.default_brand_id IS 'Default brand for all sites under this client (can be overridden per site)';
COMMENT ON COLUMN clients.branding_overrides IS 'Client-level branding overrides that apply on top of the brand template';
COMMENT ON COLUMN clients.header_footer_config IS 'Client-level header and footer configuration';
COMMENT ON COLUMN sites.brand_id IS 'Brand for this site (if NULL, inherits from client default_brand_id)';
COMMENT ON COLUMN sites.branding_overrides IS 'Site-level branding overrides that apply on top of client/brand branding';

-- Update schema version
INSERT INTO schema_versions (version, description) VALUES 
  (8, 'Added brand references and override fields to clients and sites tables')
ON CONFLICT (version) DO NOTHING;
