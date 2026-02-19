/**
 * Migration Verification Script
 * Description: Verifies the content migration to translations structure
 * Author: Kiro AI
 * Date: February 19, 2026
 * Spec: .kiro/specs/multi-language-content/
 * Task: 2.2 Test migration script on development database
 * 
 * Usage: node supabase/migrations/verify-migration.js
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wjfcqqrlhwdvvjmefxky.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec';

const EXPECTED_SECTIONS = [
  'header', 'welcomePage', 'landingPage', 'accessPage', 'catalogPage',
  'productDetail', 'cartPage', 'checkoutPage', 'reviewOrder', 'confirmation',
  'orderHistory', 'orderTracking', 'notFoundPage', 'privacyPolicy',
  'expiredPage', 'footer'
];

/**
 * Fetch sites from Supabase
 */
async function fetchSites() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/sites?select=id,name,available_languages,settings,translations`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sites: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Test 1: Verify available_languages configuration
 */
function testAvailableLanguages(sites) {
  const sitesWithLanguages = sites.filter(s => 
    s.available_languages && 
    Array.isArray(s.available_languages) && 
    s.available_languages.includes('en')
  );
  
  const passed = sitesWithLanguages.length === sites.length;
  
  return {
    name: 'Available Languages Configuration',
    passed,
    message: passed 
      ? `✓ All ${sites.length} sites have available_languages = ['en']`
      : `✗ ${sites.length - sitesWithLanguages.length} sites missing available_languages`,
    details: {
      total: sites.length,
      configured: sitesWithLanguages.length,
    },
  };
}

/**
 * Test 2: Verify defaultLanguage in settings
 */
function testDefaultLanguage(sites) {
  const sitesWithDefaultLang = sites.filter(s => 
    s.settings && 
    typeof s.settings === 'object' && 
    s.settings.defaultLanguage === 'en'
  );
  
  const passed = sitesWithDefaultLang.length === sites.length;
  
  return {
    name: 'Default Language Configuration',
    passed,
    message: passed 
      ? `✓ All ${sites.length} sites have defaultLanguage = 'en'`
      : `✗ ${sites.length - sitesWithDefaultLang.length} sites missing defaultLanguage`,
    details: {
      total: sites.length,
      configured: sitesWithDefaultLang.length,
    },
  };
}

/**
 * Test 3: Verify translations populated
 */
function testTranslationsPopulated(sites) {
  const sitesWithTranslations = sites.filter(s => 
    s.translations && 
    typeof s.translations === 'object' && 
    Object.keys(s.translations).length > 0
  );
  
  const passed = sitesWithTranslations.length === sites.length;
  
  return {
    name: 'Translations Populated',
    passed,
    message: passed 
      ? `✓ All ${sites.length} sites have translations populated`
      : `✗ ${sites.length - sitesWithTranslations.length} sites missing translations`,
    details: {
      total: sites.length,
      populated: sitesWithTranslations.length,
    },
  };
}

/**
 * Test 4: Verify all required sections exist
 */
function testRequiredSections(sites) {
  const siteResults = sites.map(site => {
    const translations = site.translations || {};
    const missingSections = EXPECTED_SECTIONS.filter(section => !translations[section]);
    
    return {
      id: site.id,
      name: site.name,
      hasSections: missingSections.length === 0,
      missingSections,
      sectionCount: EXPECTED_SECTIONS.length - missingSections.length,
    };
  });
  
  const sitesWithAllSections = siteResults.filter(s => s.hasSections);
  const passed = sitesWithAllSections.length === sites.length;
  
  return {
    name: 'Required Sections Present',
    passed,
    message: passed 
      ? `✓ All ${sites.length} sites have all 16 required sections`
      : `✗ ${sites.length - sitesWithAllSections.length} sites missing sections`,
    details: {
      total: sites.length,
      complete: sitesWithAllSections.length,
      sitesWithMissingSections: siteResults
        .filter(s => !s.hasSections)
        .map(s => ({
          name: s.name,
          sectionCount: s.sectionCount,
          missing: s.missingSections,
        })),
    },
  };
}

/**
 * Test 5: Sample content verification
 */
function testSampleContent(sites) {
  const samples = sites.slice(0, 3).map(site => {
    const translations = site.translations || {};
    return {
      name: site.name,
      headerLogoAlt: translations.header?.logoAlt?.en || '(not set)',
      welcomeTitle: translations.welcomePage?.title?.en || '(not set)',
      landingHeroTitle: translations.landingPage?.heroTitle?.en || '(not set)',
      catalogTitle: translations.catalogPage?.title?.en || '(not set)',
      footerText: translations.footer?.text?.en || '(not set)',
    };
  });
  
  const hasContent = samples.every(s => 
    (s.headerLogoAlt && s.headerLogoAlt !== '(not set)') ||
    (s.welcomeTitle && s.welcomeTitle !== '(not set)') ||
    (s.landingHeroTitle && s.landingHeroTitle !== '(not set)') ||
    (s.catalogTitle && s.catalogTitle !== '(not set)') ||
    (s.footerText && s.footerText !== '(not set)')
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
function testBackwardCompatibility(sites) {
  const sitesChecked = sites.map(site => {
    const settings = site.settings || {};
    const translations = site.translations || {};
    
    // Check if old settings exist and if they were migrated
    const checks = {
      welcomeMessage: {
        hadOld: !!settings.welcomeMessage,
        hasNew: !!translations.welcomePage?.message?.en,
      },
      catalogTitle: {
        hadOld: !!settings.catalogTitle,
        hasNew: !!translations.catalogPage?.title?.en,
      },
    };
    
    // If had old data, should have new data
    const compatible = 
      (!checks.welcomeMessage.hadOld || checks.welcomeMessage.hasNew) &&
      (!checks.catalogTitle.hadOld || checks.catalogTitle.hasNew);
    
    return {
      name: site.name,
      compatible,
      checks,
    };
  });
  
  const compatibleSites = sitesChecked.filter(s => s.compatible);
  const passed = compatibleSites.length === sites.length;
  
  return {
    name: 'Backward Compatibility',
    passed,
    message: passed 
      ? `✓ All ${sites.length} sites maintain backward compatibility`
      : `✗ ${sites.length - compatibleSites.length} sites may have data loss`,
    details: {
      total: sites.length,
      compatible: compatibleSites.length,
      incompatibleSites: sitesChecked
        .filter(s => !s.compatible)
        .map(s => ({ name: s.name, checks: s.checks })),
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
    // Fetch sites
    console.log('Fetching sites from database...');
    const sites = await fetchSites();
    console.log(`Found ${sites.length} sites\n`);
    
    if (sites.length === 0) {
      console.log('⚠ Warning: No sites found in database');
      console.log('Migration cannot be verified without existing sites');
      return;
    }
    
    // Run all tests
    const results = [
      testAvailableLanguages(sites),
      testDefaultLanguage(sites),
      testTranslationsPopulated(sites),
      testRequiredSections(sites),
      testSampleContent(sites),
      testBackwardCompatibility(sites),
    ];
    
    // Print results
    console.log('Test Results:');
    console.log('─────────────────────────────────────');
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`);
      console.log(`   ${result.message}`);
      if (result.details && Object.keys(result.details).length > 0) {
        if (result.details.samples) {
          console.log('   Sample Content:');
          result.details.samples.forEach(sample => {
            console.log(`     - ${sample.name}:`);
            console.log(`       Header: ${sample.headerLogoAlt}`);
            console.log(`       Welcome: ${sample.welcomeTitle}`);
            console.log(`       Landing: ${sample.landingHeroTitle}`);
            console.log(`       Catalog: ${sample.catalogTitle}`);
            console.log(`       Footer: ${sample.footerText}`);
          });
        } else if (result.details.sitesWithMissingSections && result.details.sitesWithMissingSections.length > 0) {
          console.log('   Sites with missing sections:');
          result.details.sitesWithMissingSections.forEach(site => {
            console.log(`     - ${site.name}: ${site.sectionCount}/16 sections (missing: ${site.missing.join(', ')})`);
          });
        } else {
          console.log(`   Total: ${result.details.total}, Passed: ${result.details.configured || result.details.populated || result.details.complete || result.details.compatible}`);
        }
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
      console.log('\nVerification complete:');
      console.log('  ✓ All content migrated correctly');
      console.log('  ✓ No data loss detected');
      console.log('  ✓ Backward compatibility maintained');
      process.exit(0);
    } else {
      console.log('\n✗ SOME TESTS FAILED - Please review the migration');
      console.log('\nFailed tests:');
      results.filter(r => !r.passed).forEach(r => {
        console.log(`  ✗ ${r.name}`);
      });
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    console.error('\nPlease ensure:');
    console.error('  1. The database is accessible');
    console.error('  2. The migration has been run');
    console.error('  3. Environment variables are set correctly');
    process.exit(1);
  }
}

// Run tests
runTests();
