-- ============================================================================
-- SITE CATALOG CONFIGURATION SCHEMA
-- ============================================================================
-- Additional tables for site-catalog relationships and configurations
-- Extends the existing schema with site-specific catalog settings
-- ============================================================================

-- ============================================================================
-- SITE_CATALOG_ASSIGNMENTS TABLE
-- ============================================================================
-- Tracks which catalogs are assigned to which sites
-- A site can have multiple catalogs, and settings can be customized per assignment
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_catalog_assignments (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  catalog_id UUID NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  
  -- Configuration (stored as JSONB for flexibility)
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Settings can include:
  -- {
  --   "allowPriceOverride": true,
  --   "priceAdjustment": { "type": "percentage", "value": 10 },
  --   "hideOutOfStock": false,
  --   "hideDiscontinued": true,
  --   "minimumInventory": 5,
  --   "maximumPrice": 1000,
  --   "minimumPrice": 10,
  --   "onlyShowFeatured": false
  -- }
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT site_catalog_assignments_unique UNIQUE (site_id, catalog_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_site_catalog_assignments_site_id ON site_catalog_assignments(site_id);
CREATE INDEX IF NOT EXISTS idx_site_catalog_assignments_catalog_id ON site_catalog_assignments(catalog_id);
CREATE INDEX IF NOT EXISTS idx_site_catalog_assignments_settings ON site_catalog_assignments USING gin(settings);

-- ============================================================================
-- SITE_PRICE_OVERRIDES TABLE
-- ============================================================================
-- Site-specific price overrides for individual products
-- Allows sites to set custom pricing that differs from catalog pricing
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_price_overrides (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Override Price
  override_price DECIMAL(10,2) NOT NULL CHECK (override_price >= 0),
  
  -- Optional reason for override
  reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT site_price_overrides_unique UNIQUE (site_id, product_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_site_price_overrides_site_id ON site_price_overrides(site_id);
CREATE INDEX IF NOT EXISTS idx_site_price_overrides_product_id ON site_price_overrides(product_id);

-- ============================================================================
-- SITE_CATEGORY_EXCLUSIONS TABLE
-- ============================================================================
-- Exclude entire product categories from specific sites
-- More efficient than excluding individual products
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_category_exclusions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  -- Category to exclude
  category VARCHAR(100) NOT NULL,
  
  -- Optional reason for exclusion
  reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  
  -- Constraints
  CONSTRAINT site_category_exclusions_unique UNIQUE (site_id, category)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_site_category_exclusions_site_id ON site_category_exclusions(site_id);
CREATE INDEX IF NOT EXISTS idx_site_category_exclusions_category ON site_category_exclusions(category);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Trigger for site_catalog_assignments
CREATE OR REPLACE FUNCTION update_site_catalog_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_site_catalog_assignments_updated_at
  BEFORE UPDATE ON site_catalog_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_site_catalog_assignments_updated_at();

-- Trigger for site_price_overrides
CREATE OR REPLACE FUNCTION update_site_price_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_site_price_overrides_updated_at
  BEFORE UPDATE ON site_price_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_site_price_overrides_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE site_catalog_assignments IS 'Assigns catalogs to sites with custom settings';
COMMENT ON TABLE site_price_overrides IS 'Site-specific price overrides for products';
COMMENT ON TABLE site_category_exclusions IS 'Categories excluded from specific sites';

COMMENT ON COLUMN site_catalog_assignments.settings IS 'JSONB configuration for catalog behavior on this site';
COMMENT ON COLUMN site_price_overrides.override_price IS 'Custom price for this product on this site';
COMMENT ON COLUMN site_category_exclusions.category IS 'Product category to exclude from this site';

-- ============================================================================
-- SAMPLE QUERIES
-- ============================================================================

-- Get all catalogs assigned to a site with settings
-- SELECT sca.*, c.name as catalog_name, c.type as catalog_type
-- FROM site_catalog_assignments sca
-- INNER JOIN catalogs c ON sca.catalog_id = c.id
-- WHERE sca.site_id = 'site-uuid';

-- Get all products for a site with price overrides applied
-- SELECT p.*, 
--        COALESCE(spo.override_price, p.price) as effective_price,
--        spo.override_price IS NOT NULL as has_override
-- FROM products p
-- INNER JOIN catalogs c ON p.catalog_id = c.id
-- INNER JOIN site_catalog_assignments sca ON sca.catalog_id = c.id
-- LEFT JOIN site_price_overrides spo ON spo.site_id = sca.site_id AND spo.product_id = p.id
-- LEFT JOIN site_product_exclusions spe ON spe.site_id = sca.site_id AND spe.product_id = p.id
-- LEFT JOIN site_category_exclusions sce ON sce.site_id = sca.site_id AND sce.category = p.category
-- WHERE sca.site_id = 'site-uuid'
--   AND spe.id IS NULL  -- Not explicitly excluded
--   AND sce.id IS NULL  -- Category not excluded
--   AND p.status = 'active';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
