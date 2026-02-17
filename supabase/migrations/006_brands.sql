-- ============================================================================
-- Migration 006: Brands Table
-- Purpose: Add brands table for brand management
-- Date: February 16, 2026
-- ============================================================================

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  
  -- Brand Settings (JSONB for flexibility)
  settings JSONB DEFAULT '{}',
  
  -- Colors and Styling
  primary_color TEXT,
  secondary_color TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  
  -- Constraints
  CONSTRAINT brands_name_unique UNIQUE (name),
  CONSTRAINT brands_status_check CHECK (status IN ('active', 'inactive')),
  CONSTRAINT brands_name_length CHECK (length(name) >= 2)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE brands IS 'Brand configurations for sites and products';
COMMENT ON COLUMN brands.settings IS 'Additional brand settings stored as JSONB';

-- Update schema version
INSERT INTO schema_versions (version, description) VALUES 
  (6, 'Added brands table for brand management')
ON CONFLICT (version) DO NOTHING;