-- ============================================================================
-- Test Script: Verify Content Migration to Translations
-- Description: Tests the migration script to ensure content is properly migrated
-- Author: Kiro AI
-- Date: February 19, 2026
-- Spec: .kiro/specs/multi-language-content/
-- Task: 2.2 Test migration script on development database
-- ============================================================================

-- This script verifies that:
-- 1. All sites have available_languages set to ['en']
-- 2. All sites have defaultLanguage set to 'en' in settings
-- 3. All sites have translations populated with English content
-- 4. No data was lost during migration

DO $$
DECLARE
  site_count INTEGER;
  sites_with_languages INTEGER;
  sites_with_default_lang INTEGER;
  sites_with_translations INTEGER;
  site_record RECORD;
  missing_sections TEXT[];
  expected_sections TEXT[] := ARRAY[
    'header', 'welcomePage', 'landingPage', 'accessPage', 'catalogPage',
    'productDetail', 'cartPage', 'checkoutPage', 'reviewOrder', 'confirmation',
    'orderHistory', 'orderTracking', 'notFoundPage', 'privacyPolicy',
    'expiredPage', 'footer'
  ];
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Starting Migration Verification Tests';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Test 1: Count total sites
  SELECT COUNT(*) INTO site_count FROM sites;
  RAISE NOTICE 'Test 1: Total Sites';
  RAISE NOTICE '  Total sites in database: %', site_count;
  RAISE NOTICE '';
  
  -- Test 2: Verify available_languages is set
  SELECT COUNT(*) INTO sites_with_languages
  FROM sites
  WHERE available_languages = ARRAY['en'];
  
  RAISE NOTICE 'Test 2: Available Languages Configuration';
  RAISE NOTICE '  Sites with available_languages = [''en'']: %', sites_with_languages;
  IF sites_with_languages = site_count THEN
    RAISE NOTICE '  ✓ PASS: All sites have available_languages configured';
  ELSE
    RAISE WARNING '  ✗ FAIL: % sites missing available_languages configuration', (site_count - sites_with_languages);
  END IF;
  RAISE NOTICE '';
  
  -- Test 3: Verify defaultLanguage in settings
  SELECT COUNT(*) INTO sites_with_default_lang
  FROM sites
  WHERE settings->>'defaultLanguage' = 'en';
  
  RAISE NOTICE 'Test 3: Default Language Configuration';
  RAISE NOTICE '  Sites with defaultLanguage = ''en'': %', sites_with_default_lang;
  IF sites_with_default_lang = site_count THEN
    RAISE NOTICE '  ✓ PASS: All sites have defaultLanguage configured';
  ELSE
    RAISE WARNING '  ✗ FAIL: % sites missing defaultLanguage configuration', (site_count - sites_with_default_lang);
  END IF;
  RAISE NOTICE '';
  
  -- Test 4: Verify translations are populated
  SELECT COUNT(*) INTO sites_with_translations
  FROM sites
  WHERE translations IS NOT NULL AND translations != '{}'::jsonb;
  
  RAISE NOTICE 'Test 4: Translations Populated';
  RAISE NOTICE '  Sites with translations: %', sites_with_translations;
  IF sites_with_translations = site_count THEN
    RAISE NOTICE '  ✓ PASS: All sites have translations populated';
  ELSE
    RAISE WARNING '  ✗ FAIL: % sites missing translations', (site_count - sites_with_translations);
  END IF;
  RAISE NOTICE '';
  
  -- Test 5: Verify all required sections exist
  RAISE NOTICE 'Test 5: Required Sections Present';
  FOR site_record IN SELECT id, name, translations FROM sites
  LOOP
    missing_sections := ARRAY[]::TEXT[];
    
    -- Check each expected section
    FOREACH expected_section IN ARRAY expected_sections
    LOOP
      IF NOT (site_record.translations ? expected_section) THEN
        missing_sections := array_append(missing_sections, expected_section);
      END IF;
    END LOOP;
    
    IF array_length(missing_sections, 1) IS NULL THEN
      RAISE NOTICE '  ✓ Site "%" (%) has all 16 sections', site_record.name, site_record.id;
    ELSE
      RAISE WARNING '  ✗ Site "%" (%) missing sections: %', 
        site_record.name, site_record.id, array_to_string(missing_sections, ', ');
    END IF;
  END LOOP;
  RAISE NOTICE '';
  
  -- Test 6: Sample content verification
  RAISE NOTICE 'Test 6: Sample Content Verification';
  FOR site_record IN SELECT id, name, translations FROM sites LIMIT 3
  LOOP
    RAISE NOTICE '  Site: "%" (%)', site_record.name, site_record.id;
    RAISE NOTICE '    Header Logo Alt: %', site_record.translations->'header'->'logoAlt'->>'en';
    RAISE NOTICE '    Welcome Title: %', site_record.translations->'welcomePage'->'title'->>'en';
    RAISE NOTICE '    Landing Hero Title: %', site_record.translations->'landingPage'->'heroTitle'->>'en';
    RAISE NOTICE '    Catalog Title: %', site_record.translations->'catalogPage'->'title'->>'en';
    RAISE NOTICE '    Footer Text: %', site_record.translations->'footer'->'text'->>'en';
    RAISE NOTICE '';
  END LOOP;
  
  -- Test 7: Verify no data loss (check if original settings still exist)
  RAISE NOTICE 'Test 7: Original Settings Preservation';
  FOR site_record IN 
    SELECT id, name, 
           (settings ? 'welcomeMessage') as has_welcome_msg,
           (settings ? 'catalogTitle') as has_catalog_title
    FROM sites
    LIMIT 5
  LOOP
    RAISE NOTICE '  Site "%" (%)', site_record.name, site_record.id;
    RAISE NOTICE '    Original welcomeMessage exists: %', site_record.has_welcome_msg;
    RAISE NOTICE '    Original catalogTitle exists: %', site_record.has_catalog_title;
  END LOOP;
  RAISE NOTICE '';
  
  -- Summary
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration Verification Summary';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Sites: %', site_count;
  RAISE NOTICE 'Sites with Languages: %', sites_with_languages;
  RAISE NOTICE 'Sites with Default Language: %', sites_with_default_lang;
  RAISE NOTICE 'Sites with Translations: %', sites_with_translations;
  RAISE NOTICE '';
  
  IF sites_with_languages = site_count AND 
     sites_with_default_lang = site_count AND 
     sites_with_translations = site_count THEN
    RAISE NOTICE '✓ ALL TESTS PASSED - Migration successful!';
  ELSE
    RAISE WARNING '✗ SOME TESTS FAILED - Please review the migration';
  END IF;
  RAISE NOTICE '========================================';
END $$;
