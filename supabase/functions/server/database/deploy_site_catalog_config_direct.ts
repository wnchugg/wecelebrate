/**
 * Deploy Site Catalog Configuration Schema - Direct Method
 * 
 * Deploys the new tables using direct SQL execution
 * This method executes the SQL file directly without using RPC
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

// Get Supabase configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://wjfcqqrlhwdvvjmefxky.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  Deno.exit(1);
}

console.log('🚀 Deploying Site Catalog Configuration Schema (Direct Method)...');
console.log('📍 Supabase URL:', SUPABASE_URL);
console.log('');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('📋 Creating tables...');
console.log('');

// ============================================================================
// Table 1: site_catalog_assignments
// ============================================================================

console.log('[1/3] Creating site_catalog_assignments table...');

try {
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
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
    `
  });
  
  if (error) {
    if (error.message?.includes('already exists')) {
      console.log('  ⚠️  Table already exists (skipping)');
    } else {
      console.error('  ❌ Error:', error.message);
    }
  } else {
    console.log('  ✅ Table created successfully');
  }
} catch (error: any) {
  console.error('  ❌ Exception:', error.message);
}

console.log('');

// ============================================================================
// Table 2: site_price_overrides
// ============================================================================

console.log('[2/3] Creating site_price_overrides table...');

try {
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
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
    `
  });
  
  if (error) {
    if (error.message?.includes('already exists')) {
      console.log('  ⚠️  Table already exists (skipping)');
    } else {
      console.error('  ❌ Error:', error.message);
    }
  } else {
    console.log('  ✅ Table created successfully');
  }
} catch (error: any) {
  console.error('  ❌ Exception:', error.message);
}

console.log('');

// ============================================================================
// Table 3: site_category_exclusions
// ============================================================================

console.log('[3/3] Creating site_category_exclusions table...');

try {
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
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
    `
  });
  
  if (error) {
    if (error.message?.includes('already exists')) {
      console.log('  ⚠️  Table already exists (skipping)');
    } else {
      console.error('  ❌ Error:', error.message);
    }
  } else {
    console.log('  ✅ Table created successfully');
  }
} catch (error: any) {
  console.error('  ❌ Exception:', error.message);
}

console.log('');

// ============================================================================
// Triggers
// ============================================================================

console.log('📋 Creating triggers...');
console.log('');

console.log('[1/2] Creating trigger for site_catalog_assignments...');

try {
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
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
    `
  });
  
  if (error) {
    console.error('  ❌ Error:', error.message);
  } else {
    console.log('  ✅ Trigger created successfully');
  }
} catch (error: any) {
  console.error('  ❌ Exception:', error.message);
}

console.log('');

console.log('[2/2] Creating trigger for site_price_overrides...');

try {
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
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
    `
  });
  
  if (error) {
    console.error('  ❌ Error:', error.message);
  } else {
    console.log('  ✅ Trigger created successfully');
  }
} catch (error: any) {
  console.error('  ❌ Exception:', error.message);
}

console.log('');

// ============================================================================
// Verification
// ============================================================================

console.log('🔍 Verifying deployment...');
console.log('');

const tablesToCheck = [
  'site_catalog_assignments',
  'site_price_overrides',
  'site_category_exclusions'
];

for (const tableName of tablesToCheck) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
    
    if (error) {
      console.log(`  ❌ ${tableName}: NOT FOUND`);
    } else {
      console.log(`  ✅ ${tableName}: EXISTS`);
    }
  } catch (error: any) {
    console.log(`  ❌ ${tableName}: ERROR - ${error.message}`);
  }
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('🎉 Deployment Complete!');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('Next steps:');
console.log('1. ✅ Verify tables exist in Supabase dashboard');
console.log('2. 🧪 Test the API endpoints');
console.log('3. 🚀 Deploy the updated code');
console.log('');
console.log('Tables created:');
console.log('  • site_catalog_assignments');
console.log('  • site_price_overrides');
console.log('  • site_category_exclusions');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
