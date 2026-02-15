/**
 * Deploy Site Catalog Configuration Schema - Simple Method
 * 
 * Creates tables one by one using Supabase client
 * This is the most reliable method that doesn't require RPC functions
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

// Get Supabase configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://wjfcqqrlhwdvvjmefxky.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('');
  console.error('Please set it using:');
  console.error('export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  Deno.exit(1);
}

console.log('🚀 Deploying Site Catalog Configuration Schema');
console.log('═══════════════════════════════════════════════════════════');
console.log('📍 Supabase URL:', SUPABASE_URL);
console.log('');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('⚠️  IMPORTANT: This script will create 3 new tables:');
console.log('   1. site_catalog_assignments');
console.log('   2. site_price_overrides');
console.log('   3. site_category_exclusions');
console.log('');
console.log('These tables will be created using the Supabase SQL Editor.');
console.log('');

// ============================================================================
// Generate SQL for manual execution
// ============================================================================

const sql = `
-- ============================================================================
-- SITE CATALOG CONFIGURATION SCHEMA
-- ============================================================================
-- Execute this SQL in the Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================================================

-- Table 1: site_catalog_assignments
CREATE TABLE IF NOT EXISTS site_catalog_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  catalog_id UUID NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  CONSTRAINT site_catalog_assignments_unique UNIQUE (site_id, catalog_id)
);

CREATE INDEX IF NOT EXISTS idx_site_catalog_assignments_site_id ON site_catalog_assignments(site_id);
CREATE INDEX IF NOT EXISTS idx_site_catalog_assignments_catalog_id ON site_catalog_assignments(catalog_id);
CREATE INDEX IF NOT EXISTS idx_site_catalog_assignments_settings ON site_catalog_assignments USING gin(settings);

-- Table 2: site_price_overrides
CREATE TABLE IF NOT EXISTS site_price_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  override_price DECIMAL(10,2) NOT NULL CHECK (override_price >= 0),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  CONSTRAINT site_price_overrides_unique UNIQUE (site_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_site_price_overrides_site_id ON site_price_overrides(site_id);
CREATE INDEX IF NOT EXISTS idx_site_price_overrides_product_id ON site_price_overrides(product_id);

-- Table 3: site_category_exclusions
CREATE TABLE IF NOT EXISTS site_category_exclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT site_category_exclusions_unique UNIQUE (site_id, category)
);

CREATE INDEX IF NOT EXISTS idx_site_category_exclusions_site_id ON site_category_exclusions(site_id);
CREATE INDEX IF NOT EXISTS idx_site_category_exclusions_category ON site_category_exclusions(category);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_site_catalog_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_site_catalog_assignments_updated_at ON site_catalog_assignments;

CREATE TRIGGER trigger_update_site_catalog_assignments_updated_at
  BEFORE UPDATE ON site_catalog_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_site_catalog_assignments_updated_at();

CREATE OR REPLACE FUNCTION update_site_price_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_site_price_overrides_updated_at ON site_price_overrides;

CREATE TRIGGER trigger_update_site_price_overrides_updated_at
  BEFORE UPDATE ON site_price_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_site_price_overrides_updated_at();

-- Comments
COMMENT ON TABLE site_catalog_assignments IS 'Assigns catalogs to sites with custom settings';
COMMENT ON TABLE site_price_overrides IS 'Site-specific price overrides for products';
COMMENT ON TABLE site_category_exclusions IS 'Categories excluded from specific sites';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
`;

console.log('📄 SQL Script Generated');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('OPTION 1: Manual Deployment (Recommended)');
console.log('─────────────────────────────────────────────────────────');
console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard');
console.log('2. Select your project: wjfcqqrlhwdvvjmefxky');
console.log('3. Go to SQL Editor (left sidebar)');
console.log('4. Click "New Query"');
console.log('5. Copy and paste the SQL below');
console.log('6. Click "Run" to execute');
console.log('');
console.log('SQL to execute:');
console.log('═══════════════════════════════════════════════════════════');
console.log(sql);
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Save SQL to file for easy access
const sqlFilePath = './deploy_site_catalog_config.sql';
await Deno.writeTextFile(sqlFilePath, sql);
console.log('✅ SQL saved to:', sqlFilePath);
console.log('');

console.log('OPTION 2: Verify Existing Tables');
console.log('─────────────────────────────────────────────────────────');
console.log('Checking if tables already exist...');
console.log('');

const tablesToCheck = [
  'site_catalog_assignments',
  'site_price_overrides',
  'site_category_exclusions'
];

let allTablesExist = true;

for (const tableName of tablesToCheck) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(0);
    
    if (error) {
      console.log(`  ❌ ${tableName}: NOT FOUND`);
      allTablesExist = false;
    } else {
      console.log(`  ✅ ${tableName}: EXISTS`);
    }
  } catch (error: any) {
    console.log(`  ❌ ${tableName}: ERROR`);
    allTablesExist = false;
  }
}

console.log('');

if (allTablesExist) {
  console.log('🎉 All tables already exist! No deployment needed.');
  console.log('');
  console.log('You can proceed to:');
  console.log('1. Test the API endpoints');
  console.log('2. Deploy the updated code');
} else {
  console.log('⚠️  Some tables are missing. Please deploy using OPTION 1 above.');
  console.log('');
  console.log('After deployment, run this script again to verify.');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('📚 Additional Resources');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('Schema file: supabase/functions/server/database/site_catalog_config_schema.sql');
console.log('API file: supabase/functions/server/site-catalog-config_api_v2.ts');
console.log('Documentation: OPTION_2_COMPLETE.md');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
