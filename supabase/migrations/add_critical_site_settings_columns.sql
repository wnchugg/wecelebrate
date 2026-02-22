-- ============================================================================
-- Add Critical Site Settings Columns
-- Phase 1: High Priority Fields
-- Date: February 17, 2026
-- ============================================================================

-- Add critical settings columns to sites table
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS gifts_per_user INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS default_country TEXT DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS allow_quantity_selection BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_pricing BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_gift_id UUID,
  ADD COLUMN IF NOT EXISTS skip_review_page BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS expired_message TEXT,
  ADD COLUMN IF NOT EXISTS default_gift_days_after_close INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE sites
  ADD CONSTRAINT sites_gifts_per_user_check CHECK (gifts_per_user > 0),
  ADD CONSTRAINT sites_default_language_check CHECK (length(default_language) = 2),
  ADD CONSTRAINT sites_default_currency_check CHECK (length(default_currency) = 3),
  ADD CONSTRAINT sites_default_country_check CHECK (length(default_country) = 2),
  ADD CONSTRAINT sites_default_gift_days_check CHECK (default_gift_days_after_close >= 0);

-- Add foreign key for default_gift_id
ALTER TABLE sites
  ADD CONSTRAINT sites_default_gift_fk FOREIGN KEY (default_gift_id) REFERENCES products(id) ON DELETE SET NULL;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_sites_default_language ON sites(default_language);
CREATE INDEX IF NOT EXISTS idx_sites_default_currency ON sites(default_currency);
CREATE INDEX IF NOT EXISTS idx_sites_default_country ON sites(default_country);
CREATE INDEX IF NOT EXISTS idx_sites_default_gift_id ON sites(default_gift_id) WHERE default_gift_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN sites.gifts_per_user IS 'Number of gifts each user can select';
COMMENT ON COLUMN sites.default_language IS 'Default language code (ISO 639-1)';
COMMENT ON COLUMN sites.default_currency IS 'Default currency code (ISO 4217)';
COMMENT ON COLUMN sites.default_country IS 'Default country code (ISO 3166-1 alpha-2)';
COMMENT ON COLUMN sites.allow_quantity_selection IS 'Allow users to select quantity for gifts';
COMMENT ON COLUMN sites.show_pricing IS 'Show pricing information to users';
COMMENT ON COLUMN sites.default_gift_id IS 'Default gift assigned if user does not select within timeframe';
COMMENT ON COLUMN sites.skip_review_page IS 'Skip the review page in checkout flow';
COMMENT ON COLUMN sites.expired_message IS 'Message shown when site selection period has expired';
COMMENT ON COLUMN sites.default_gift_days_after_close IS 'Days after close to assign default gift';
