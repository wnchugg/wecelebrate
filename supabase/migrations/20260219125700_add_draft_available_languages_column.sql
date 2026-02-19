-- ============================================================================
-- Add Draft Available Languages Support
-- Enables draft language configuration for multi-language content workflow
-- Date: February 18, 2026
-- Spec: .kiro/specs/multi-language-content/
-- Task: 1.3 Add draft_available_languages column to sites table
-- Requirements: 9.2
-- ============================================================================

-- Add draft_available_languages column to store draft language configuration
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS draft_available_languages TEXT[] DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN sites.draft_available_languages IS 'Array of language codes in draft mode. NULL when no draft changes exist. Used in draft/publish workflow to preview language configuration changes before publishing.';

