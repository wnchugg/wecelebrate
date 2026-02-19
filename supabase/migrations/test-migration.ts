/**
 * Migration Test Script
 * Description: Tests the content migration to translations structure
 * Author: Kiro AI
 * Date: February 19, 2026
 * Spec: .kiro/specs/multi-language-content/
 * Task: 2.2 Test migration script on development database
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wjfcqqrlhwdvvjmefxky.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Please set it with: export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

/**
 * Run a SQL file
 */
async function runSqlFile(filePath: string): Promise<void> {
  const sql = fs.readFileSync(filePath, 'utf-8');
  const { error } = await supabase.rpc('exec_sql', { sql });
  
  if (error) {
    throw new Error(`Failed to execute ${filePath}: ${error.message}`);
  }
}

/**
 * Test 1: Verify all sites have available_languages set
 */
async function testAvailableLanguages(): Promise<TestResult> {
  const { data: sites, error } = await supabase
    .from('sites')
    .select('id, name, available_languages');
  
  if (error) {
    return {
      name: 'Available Languages Configuration',
      passed: false,
      message: `Database error: ${error.message}`,
    };
  }
  
  const sitesWithLanguages = sites?.filter(s => 
    s.available_languages && 
    Array.isArray(s.available_languages) && 
    s.available_languages.includes('en')
  ) || [];
  
  const passed = sitesWithLanguages.length === sites?.length;
  
  return {
    name: 'Available Languages Configuration',
    passed,
    message: passed 
      ? `✓ All ${sites?.length} sites have available_languages = ['en']`
      : `✗ ${sites?.length - sitesWithLanguages.length} sites missing available_languages`,
    details: {
      total: sites?.length,
      configured: sitesWithLanguages.length,
    },
  };
}

/**
 * Test 2: Verify all sites have defaultLanguage in settings
 */
async function testDefaultLanguage(): Promise<TestResult> {
  const { data: sites, error } = await supabase
    .from('sites')
    .select('id, name, settings');
  
  if (error) {
    return {
      name: 'Default Language Configuration',
      passed: false,
      message: `Database error: ${error.message}`,
    };
  }
  
  const sitesWithDefaultLang = sites?.filter(s => 
    s.settings && 
    typeof s.settings === 'object' && 
    (s.settings as any).defaultLanguage === 'en'
  ) || [];
  
  const passed = sitesWithDefaultLang.length === sites?.length;
  
  return {
    name: 'Default Language Configuration',
    passed,
    message: passed 
      ? `✓ All ${sites?.length} sites have defaultLanguage = 'en'`
      : `✗ ${sites?.length - sitesWithDefaultLang.length} sites missing defaultLanguage`,
    details: {
      total: sites?.length,
      configured: sitesWithDefaultLang.length,
    },
  };
}

/**
 * Test 3: Verify all sites have translations populated
 */
async function testTranslationsPopulated(): Promise<TestResult> {
  const { data: sites, error } = await supabase
    .from('sites')
    .select('id, name, translations');
  
  if (error) {
    return {
      name: 'Translations Populated',
      passed: false,
      message: `Database error: ${error.message}`,
    };
  }
  
  const sitesWithTranslations = sites?.filter(s => 
    s.translations && 
    typeof s.translations === 'object' && 
    Object.keys(s.translations).length > 0
  ) || [];
  
  const passed = sitesWithTranslations.length === sites?.length;
  
  return {
    name: 'Translations Populated',
    passed,
    message: passed 
      ? `✓ All ${sites?.length} sites have translations populated`
      : `✗ ${sites?.length - sitesWithTranslations.length} sites missing translations`,
    details: {
      total: sites?.length,
      populated: sitesWithTranslations.length,
    },
  };
}

/**
 * Test 4: Verify all required sections exist
 */
async function testRequiredSections(): Promise<TestResult> {
  const expectedSections = [
    'header', 'welcomePage', 'landingPage', 'accessPage', 'catalogPage',
    'productDetail', 'cartPage', 'checkoutPage', 'reviewOrder', 'confirmation',
    'orderHistory', 'orderTracking', 'notFoundPage', 'privacyPolicy',
    'expiredPage', 'footer'
  ];
  
  const { data: sites, error } = await supabase
    .from('sites')
    .select('id, name, translations');
  
  if (error) {
    return {
      name: 'Required Sections Present',
      passed: false,
      message: `Database error: ${error.message}`,
    };
  }
  
  const siteResults = sites?.map(site => {
    const translations = site.translations as any || {};
    const missingSections = expectedSections.filter(section => !translations[section]);
    
    return {
      id: site.id,
      name: site.name,
      hasSections: missingSections.length === 0,
      missingSections,
    };
  }) || [];
  
  const sitesWithAllSections = siteResults.filter(s => s.hasSections);
  const passed = sitesWithAllSections.length === sites?.length;
  
  return {
    name: 'Required Sections Present',
    passed,
    message: passed 
      ? `✓ All ${sites?.length} sites have all 16 required sections`
      : `✗ ${sites?.length - sitesWithAllSections.length} sites missing sections`,
    details: {
      total: sites?.length,
      complete: sitesWithAllSections.length,
      sitesWithMissingSections: siteResults.filter(s => !s.hasSections).map(s => ({
        name: s.name,
        missing: s.missingSections,
      })),
    },
  };
}

/**
 * Test 5: Sample content verification
 */
async function testSampleContent(): Promise<TestResult> {
  const { data: sites, error } = await supabase
    .from('sites')
    .select('id, name, translations')
    .limit(3);
  
  if (error) {
    return {
      name: 'Sample Content Verification',
      passed: false,
      message: `Database error: ${error.message}`,
    };
  }
  
  const samples = sites?.map(site => {
    const translations = site.translations as any || {};
    return {
      name: site.name,
      headerLogoAlt: translations.header?.logoAlt?.en,
      welcomeTitle: translations.welcomePage?.title?.en,
      landingHeroTitle: translations.landingPage?.heroTitle?.en,
      catalogTitle: translations.catalogPage?.title?.en,
      footerText: translations.footer?.text?.en,
    };
  }) || [];
  
  const hasContent = samples.every(s => 
    s.headerLogoAlt || s.welcomeTitle || s.landingHeroTitle || s.catalogTitle || s.footerText
  );
  
  return {
    name: 'Sample Content Verification',
    passed: hasContent,
    message: hasContent 
      ? `✓ Sample content verified for ${samples.length} sites`
      : `✗ Some sites missing content`,
    details: { samples },
  };
}

/**
 * Test 6: Verify no data loss (backward compatibility)
 */
async function testBackwardCompatibility(): Promise<TestResult> {
  const { data: sites, error } = await supabase
    .from('sites')
    .select('id, name, settings, translations');
  
  if (error) {
    return {
      name: 'Backward Compatibility',
      passed: false,
      message: `Database error: ${error.message}`,
    };
  }
  
  // Check that sites with original settings also have translations
  const sitesWithBothOldAndNew = sites?.filter(site => {
    const settings = site.settings as any || {};
    const translations = site.translations as any || {};
    
    // If site had welcomeMessage in settings, it should have it in translations
    const hasOldWelcome = settings.welcomeMessage;
    const hasNewWelcome = translations.welcomePage?.message?.en;
    
    // If site had catalogTitle in settings, it should have it in translations
    const hasOldCatalog = settings.catalogTitle;
    const hasNewCatalog = translations.catalogPage?.title?.en;
    
    // At least one should be migrated if it existed
    return (!hasOldWelcome || hasNewWelcome) && (!hasOldCatalog || hasNewCatalog);
  }) || [];
  
  const passed = sitesWithBothOldAndNew.length === sites?.length;
  
  return {
    name: 'Backward Compatibility',
    passed,
    message: passed 
      ? `✓ All ${sites?.length} sites maintain backward compatibility`
      : `✗ ${sites?.length - sitesWithBothOldAndNew.length} sites may have data loss`,
    details: {
      total: sites?.length,
      compatible: sitesWithBothOldAndNew.length,
    },
  };
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('========================================');
  console.log('Content Migration Verification Tests');
  console.log('========================================');
  console.log('');
  
  try {
    // Run all tests
    results.push(await testAvailableLanguages());
    results.push(await testDefaultLanguage());
    results.push(await testTranslationsPopulated());
    results.push(await testRequiredSections());
    results.push(await testSampleContent());
    results.push(await testBackwardCompatibility());
    
    // Print results
    console.log('Test Results:');
    console.log('─────────────────────────────────────');
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`);
      console.log(`   ${result.message}`);
      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      }
    });
    
    // Summary
    console.log('\n========================================');
    console.log('Summary');
    console.log('========================================');
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    console.log(`Tests Passed: ${passed}/${total}`);
    
    if (passed === total) {
      console.log('\n✓ ALL TESTS PASSED - Migration successful!');
      process.exit(0);
    } else {
      console.log('\n✗ SOME TESTS FAILED - Please review the migration');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
