-- ============================================================================
-- Rollback Script: Revert Content Migration to Translations
-- Description: Rolls back the migration by clearing translations and language settings
-- Author: Kiro AI
-- Date: February 19, 2026
-- Spec: .kiro/specs/multi-language-content/
-- Task: 2.1 Create migration script for all 16 priority sections (Rollback)
-- ============================================================================

-- WARNING: This script will clear all translations and reset language settings
-- Only run this if you need to revert the migration

DO $$
DECLARE
  site_count INTEGER;
BEGIN
  RAISE NOTICE 'Starting migration rollback...';
  
  -- Count sites before rollback
  SELECT COUNT(*) INTO site_count FROM sites;
  RAISE NOTICE 'Rolling back % sites', site_count;
  
  -- Clear translations and reset language settings
  UPDATE sites
  SET
    translations = '{}'::jsonb,
    available_languages = ARRAY['en'],
    settings = settings - 'defaultLanguage',
    updated_at = NOW();
  
  RAISE NOTICE 'Rollback completed for % sites', site_count;
  RAISE NOTICE 'Translations cleared, available_languages reset to [''en''], defaultLanguage removed from settings';
END $$;
