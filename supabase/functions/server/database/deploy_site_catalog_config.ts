/**
 * Deploy Site Catalog Configuration Schema
 * 
 * Deploys the new tables for site-catalog configuration to Supabase
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

// Get Supabase configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://wjfcqqrlhwdvvjmefxky.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  Deno.exit(1);
}

console.log('🚀 Deploying Site Catalog Configuration Schema...');
console.log('📍 Supabase URL:', SUPABASE_URL);
console.log('');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Read the schema file
const schemaPath = new URL('./site_catalog_config_schema.sql', import.meta.url).pathname;
const schemaSQL = await Deno.readTextFile(schemaPath);

console.log('📄 Schema file loaded:', schemaPath);
console.log('📏 Schema size:', schemaSQL.length, 'characters');
console.log('');

// Split SQL into individual statements
const statements = schemaSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log('📊 Found', statements.length, 'SQL statements to execute');
console.log('');

// Execute each statement
let successCount = 0;
let errorCount = 0;

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  
  // Skip comments and empty statements
  if (statement.startsWith('--') || statement.trim().length === 0) {
    continue;
  }
  
  // Extract statement type for logging
  const statementType = statement.split(/\s+/)[0].toUpperCase();
  const tableName = statement.match(/TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i)?.[1] || 
                    statement.match(/INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i)?.[1] ||
                    statement.match(/FUNCTION\s+(\w+)/i)?.[1] ||
                    statement.match(/TRIGGER\s+(\w+)/i)?.[1] ||
                    'unknown';
  
  try {
    console.log(`[${i + 1}/${statements.length}] Executing: ${statementType} ${tableName}...`);
    
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: statement + ';'
    });
    
    if (error) {
      // Check if error is about already existing objects (which is OK)
      if (error.message?.includes('already exists') || 
          error.message?.includes('duplicate')) {
        console.log(`  ⚠️  Already exists (skipping): ${tableName}`);
        successCount++;
      } else {
        console.error(`  ❌ Error:`, error.message);
        errorCount++;
      }
    } else {
      console.log(`  ✅ Success`);
      successCount++;
    }
  } catch (error: any) {
    console.error(`  ❌ Exception:`, error.message);
    errorCount++;
  }
  
  console.log('');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 Deployment Summary');
console.log('═══════════════════════════════════════════════════════════');
console.log('✅ Successful:', successCount);
console.log('❌ Errors:', errorCount);
console.log('📝 Total statements:', statements.length);
console.log('');

if (errorCount === 0) {
  console.log('🎉 Schema deployment completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Verify tables exist in Supabase dashboard');
  console.log('2. Test the API endpoints');
  console.log('3. Deploy the updated code');
} else {
  console.log('⚠️  Schema deployment completed with errors');
  console.log('Please review the errors above and fix any issues');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
