/**
 * Deploy Database Schema
 * 
 * Deploys the schema.sql to the Supabase database
 * Run with: deno run --allow-net --allow-env --allow-read deploy_schema.ts
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'NOT SET');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('================================================================================');
console.log('Database Schema Deployment');
console.log('================================================================================');
console.log('');
console.log('📍 Target:', SUPABASE_URL);
console.log('');

// Read schema file
const schemaPath = new URL('./schema.sql', import.meta.url).pathname;
const schema = await Deno.readTextFile(schemaPath);

console.log('📄 Schema file loaded:', schemaPath);
console.log('📊 Schema size:', schema.length, 'bytes');
console.log('');

// Split schema into individual statements
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log('📝 Found', statements.length, 'SQL statements');
console.log('');

// Execute each statement
let successCount = 0;
let errorCount = 0;

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  const preview = statement.substring(0, 80).replace(/\s+/g, ' ');
  
  console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
    
    if (error) {
      // Check if error is about existing objects (which is OK)
      if (error.message.includes('already exists') || 
          error.message.includes('does not exist')) {
        console.log('   ⚠️  Warning:', error.message.substring(0, 100));
        successCount++;
      } else {
        console.error('   ❌ Error:', error.message);
        errorCount++;
      }
    } else {
      console.log('   ✅ Success');
      successCount++;
    }
  } catch (err: any) {
    console.error('   ❌ Exception:', err.message);
    errorCount++;
  }
}

console.log('');
console.log('================================================================================');
console.log('Deployment Summary');
console.log('================================================================================');
console.log('✅ Successful:', successCount);
console.log('❌ Errors:', errorCount);
console.log('📊 Total:', statements.length);
console.log('');

if (errorCount === 0) {
  console.log('🎉 Schema deployment completed successfully!');
} else {
  console.log('⚠️  Schema deployment completed with errors');
  console.log('   Some errors may be expected (e.g., "already exists")');
}

console.log('');
console.log('Next steps:');
console.log('1. Verify tables exist: SELECT tablename FROM pg_tables WHERE schemaname = \'public\';');
console.log('2. Test database access: deno run --allow-net --allow-env test_db_access.ts');
console.log('3. Start API refactoring');
console.log('');
