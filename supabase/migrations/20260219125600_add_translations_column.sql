-- ============================================================================
-- Migration: Add translations column to sites table
-- Date: 2026-02-19
-- Task: 1.2 Add translations column to sites table
-- Requirements: 3.1, 3.2
-- ============================================================================

-- Add translations column to store multi-language content for each site
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN sites.translations IS 'JSONB object storing multi-language translations for site content. Structure: { fieldPath: { languageCode: translatedText } }. Example: { "welcomePage.title": { "en": "Welcome", "es": "Bienvenido" } }';

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_sites_translations 
  ON sites USING GIN (translations);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
