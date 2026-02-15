
-- ============================================================================
-- SITE CATALOG CONFIGURATION SCHEMA
-- ============================================================================
-- Execute this SQL in the Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================================================

-- Table 1: site_catalog_assignments
CREATE TABLE IF NOT EXISTS site_catalog_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  catalog_id UUID NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  CONSTRAINT site_catalog_assignments_unique UNIQUE (site_id, catalog_id)
);

CREATE INDEX IF NOT EXISTS idx_site_catalog_assignments_site_id ON site_catalog_assignments(site_id);
CREATE INDEX IF NOT EXISTS idx_site_catalog_assignments_catalog_id ON site_catalog_assignments(catalog_id);
CREATE INDEX IF NOT EXISTS idx_site_catalog_assignments_settings ON site_catalog_assignments USING gin(settings);

-- Table 2: site_price_overrides
CREATE TABLE IF NOT EXISTS site_price_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  override_price DECIMAL(10,2) NOT NULL CHECK (override_price >= 0),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  CONSTRAINT site_price_overrides_unique UNIQUE (site_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_site_price_overrides_site_id ON site_price_overrides(site_id);
CREATE INDEX IF NOT EXISTS idx_site_price_overrides_product_id ON site_price_overrides(product_id);

-- Table 3: site_category_exclusions
CREATE TABLE IF NOT EXISTS site_category_exclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT site_category_exclusions_unique UNIQUE (site_id, category)
);

CREATE INDEX IF NOT EXISTS idx_site_category_exclusions_site_id ON site_category_exclusions(site_id);
CREATE INDEX IF NOT EXISTS idx_site_category_exclusions_category ON site_category_exclusions(category);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_site_catalog_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_site_catalog_assignments_updated_at ON site_catalog_assignments;

CREATE TRIGGER trigger_update_site_catalog_assignments_updated_at
  BEFORE UPDATE ON site_catalog_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_site_catalog_assignments_updated_at();

CREATE OR REPLACE FUNCTION update_site_price_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_site_price_overrides_updated_at ON site_price_overrides;

CREATE TRIGGER trigger_update_site_price_overrides_updated_at
  BEFORE UPDATE ON site_price_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_site_price_overrides_updated_at();

-- Comments
COMMENT ON TABLE site_catalog_assignments IS 'Assigns catalogs to sites with custom settings';
COMMENT ON TABLE site_price_overrides IS 'Site-specific price overrides for products';
COMMENT ON TABLE site_category_exclusions IS 'Categories excluded from specific sites';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
