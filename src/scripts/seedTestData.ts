/**
 * Test Data Seeding Script
 * 
 * This script seeds the database with test data for development and testing.
 * Run with: npm run seed:test-data
 */

import { createClient } from '@supabase/supabase-js';
import { mockCatalogs, mockSiteConfigs, mockSites } from '../test/mockData/catalogData';

// Get Supabase credentials from environment or use defaults
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Seed catalogs
 */
async function seedCatalogs() {
  console.warn('🌱 Seeding catalogs...');
  
  for (const catalog of mockCatalogs) {
    try {
      // Store in KV store with catalog key
      const key = `catalog:${catalog.id}`;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-6fcaeea3/catalogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(catalog),
      });

      if (response.ok) {
        console.warn(`  ✓ Created catalog: ${catalog.name}`);
      } else {
        const error = await response.json();
        console.error(`  ✗ Failed to create catalog ${catalog.name}:`, error);
      }
    } catch (error) {
      console.error(`  ✗ Error creating catalog ${catalog.name}:`, error);
    }
  }

  console.warn(`✅ Seeded ${mockCatalogs.length} catalogs\n`);
}

/**
 * Seed sites
 */
async function seedSites() {
  console.warn('🌱 Seeding sites...');
  
  for (const site of mockSites) {
    try {
      const key = `site:${site.id}`;
      // In a real scenario, you'd call your site creation API
      // For now, we'll just log it
      console.warn(`  ✓ Would create site: ${site.name}`);
    } catch (error) {
      console.error(`  ✗ Error creating site ${site.name}:`, error);
    }
  }

  console.warn(`✅ Would seed ${mockSites.length} sites\n`);
}

/**
 * Seed site catalog configurations
 */
async function seedSiteConfigs() {
  console.warn('🌱 Seeding site catalog configurations...');
  
  for (const config of mockSiteConfigs) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-6fcaeea3/sites/${config.siteId}/catalog-config`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({
            catalogId: config.catalogId,
            exclusions: config.exclusions,
            overrides: config.overrides,
            availability: config.availability,
          }),
        }
      );

      if (response.ok) {
        console.warn(`  ✓ Created config for site: ${config.siteId}`);
      } else {
        const error = await response.json();
        console.error(`  ✗ Failed to create config for ${config.siteId}:`, error);
      }
    } catch (error) {
      console.error(`  ✗ Error creating config for ${config.siteId}:`, error);
    }
  }

  console.warn(`✅ Seeded ${mockSiteConfigs.length} site configurations\n`);
}

/**
 * Clear all test data
 */
async function clearTestData() {
  console.warn('🧹 Clearing test data...');
  
  try {
    // Clear catalogs
    for (const catalog of mockCatalogs) {
      await fetch(`${SUPABASE_URL}/functions/v1/make-server-6fcaeea3/catalogs/${catalog.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      });
    }
    console.warn('  ✓ Cleared catalogs');

    // Clear site configs
    for (const config of mockSiteConfigs) {
      await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-6fcaeea3/sites/${config.siteId}/catalog-config`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );
    }
    console.warn('  ✓ Cleared site configurations');

    console.warn('✅ Test data cleared\n');
  } catch (error) {
    console.error('✗ Error clearing test data:', error);
  }
}

/**
 * Main seeding function
 */
async function seed() {
  console.warn('\n🚀 Starting test data seeding...\n');

  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');
  const onlyClear = args.includes('--clear-only');

  try {
    if (shouldClear || onlyClear) {
      await clearTestData();
    }

    if (!onlyClear) {
      await seedCatalogs();
      await seedSites();
      await seedSiteConfigs();
    }

    console.warn('🎉 Test data seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

/**
 * Simple seeding function that just logs the data (for testing)
 */
function seedSimple() {
  console.warn('\n📊 Test Data Summary:\n');
  console.warn(`Catalogs: ${mockCatalogs.length}`);
  mockCatalogs.forEach((c) => console.warn(`  - ${c.name} (${c.type})`));
  
  console.warn(`\nSites: ${mockSites.length}`);
  mockSites.forEach((s) => console.warn(`  - ${s.name}`));
  
  console.warn(`\nSite Configurations: ${mockSiteConfigs.length}`);
  mockSiteConfigs.forEach((c) => {
    const site = mockSites.find((s) => s.id === c.siteId);
    const catalog = mockCatalogs.find((cat) => cat.id === c.catalogId);
    console.warn(`  - ${site?.name} → ${catalog?.name}`);
  });
  
  console.warn('\n✅ Use this data for manual testing or API testing\n');
}

// Run the appropriate function based on environment
if (process.env.NODE_ENV === 'test' || process.argv.includes('--simple')) {
  void seedSimple();
} else {
  void seed();
}

// Export for use in other scripts
export { seedCatalogs, seedSites, seedSiteConfigs, clearTestData, seedSimple };
