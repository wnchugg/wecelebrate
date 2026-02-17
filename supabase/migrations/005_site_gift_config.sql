-- ============================================================================
-- Migration 005: Site Gift Configuration
-- Purpose: Add site gift configuration table for database-backed gift filtering
-- Date: February 16, 2026
-- ============================================================================

-- Create site_gift_configs table
CREATE TABLE IF NOT EXISTS site_gift_configs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  -- Assignment Strategy
  assignment_strategy TEXT NOT NULL DEFAULT 'all',  -- all, selected, excluded, categories
  
  -- Selected/Excluded Products (JSONB array of product IDs)
  selected_product_ids JSONB DEFAULT '[]',
  excluded_product_ids JSONB DEFAULT '[]',
  
  -- Category Filters (JSONB array of category names)
  included_categories JSONB DEFAULT '[]',
  excluded_categories JSONB DEFAULT '[]',
  
  -- Price Range
  min_price NUMERIC(10, 2),
  max_price NUMERIC(10, 2),
  
  -- Additional Filters (JSONB for flexibility)
  filters JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT site_gift_configs_site_unique UNIQUE (site_id),
  CONSTRAINT site_gift_configs_strategy_check CHECK (
    assignment_strategy IN ('all', 'selected', 'excluded', 'categories', 'custom')
  ),
  CONSTRAINT site_gift_configs_price_check CHECK (
    min_price IS NULL OR max_price IS NULL OR min_price <= max_price
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_gift_configs_site_id ON site_gift_configs(site_id);
CREATE INDEX IF NOT EXISTS idx_site_gift_configs_strategy ON site_gift_configs(assignment_strategy);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_site_gift_configs_updated_at BEFORE UPDATE ON site_gift_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE site_gift_configs IS 'Gift assignment configuration for sites';
COMMENT ON COLUMN site_gift_configs.assignment_strategy IS 'Strategy for assigning gifts: all, selected, excluded, categories, custom';
COMMENT ON COLUMN site_gift_configs.selected_product_ids IS 'Array of product IDs to include (when strategy is selected)';
COMMENT ON COLUMN site_gift_configs.excluded_product_ids IS 'Array of product IDs to exclude';
COMMENT ON COLUMN site_gift_configs.included_categories IS 'Array of categories to include';
COMMENT ON COLUMN site_gift_configs.excluded_categories IS 'Array of categories to exclude';

-- Update schema version
INSERT INTO schema_versions (version, description) VALUES 
  (5, 'Added site_gift_configs table for database-backed gift filtering')
ON CONFLICT (version) DO NOTHING;
