-- ============================================================================
-- Add Available Languages Support
-- Enables per-site language configuration for multi-language content
-- Date: February 18, 2026
-- Spec: .kiro/specs/multi-language-content/
-- ============================================================================

-- Add available_languages column to store enabled languages for each site
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS available_languages TEXT[] DEFAULT ARRAY['en'];

-- Add comment
COMMENT ON COLUMN sites.available_languages IS 'Array of language codes enabled for this site. Defaults to English only. Used to configure which languages are available in the language selector and translation interface.';

-- Create GIN index for efficient array queries
CREATE INDEX IF NOT EXISTS idx_sites_available_languages 
  ON sites USING GIN (available_languages);

