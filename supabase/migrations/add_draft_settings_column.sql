-- ============================================================================
-- Add Draft Settings Support
-- Enables draft/live workflow for site configuration
-- Date: February 17, 2026
-- ============================================================================

-- Add draft_settings column to store unpublished changes
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS draft_settings JSONB DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN sites.draft_settings IS 'Draft configuration changes not yet published. NULL means no draft changes exist.';

-- When draft_settings is NULL, the site uses the live column values
-- When draft_settings has data, it contains the draft version of settings
-- On publish, draft_settings is merged into the live columns and then cleared

