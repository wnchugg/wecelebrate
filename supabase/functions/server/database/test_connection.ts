/**
 * Simple Connection Test Script
 * Tests if we can connect to Supabase and read from KV store
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

console.log('='.repeat(80));
console.log('Supabase Connection Test');
console.log('='.repeat(80));
console.log('');

// Check environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.log('1. Environment Variables:');
console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Not set'}`);
if (supabaseUrl) {
  console.log(`   URL: ${supabaseUrl}`);
}
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ Set' : '❌ Not set'}`);
if (supabaseKey) {
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...${supabaseKey.substring(supabaseKey.length - 10)}`);
}
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ ERROR: Environment variables not set!');
  console.log('');
  console.log('Please run:');
  console.log('  export SUPABASE_URL="https://your-project.supabase.co"');
  console.log('  export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  console.log('');
  Deno.exit(1);
}

// Try to create client
console.log('2. Creating Supabase Client...');
try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('   ✅ Client created successfully');
  console.log('');
  
  // Try to query KV store
  console.log('3. Testing Database Connection...');
  const { data, error } = await supabase
    .from('kv_store_6fcaeea3')
    .select('key')
    .limit(1);
  
  if (error) {
    console.log(`   ❌ Database error: ${error.message}`);
    console.log('');
    console.log('Possible issues:');
    console.log('  - Wrong project URL');
    console.log('  - Wrong service role key');
    console.log('  - Table kv_store_6fcaeea3 does not exist');
    console.log('  - Network/firewall issues');
    Deno.exit(1);
  }
  
  console.log('   ✅ Database connection successful');
  console.log(`   Found ${data?.length || 0} records in KV store`);
  console.log('');
  
  // Try to get a specific key
  console.log('4. Testing KV Store Read...');
  const { data: clientsData, error: clientsError } = await supabase
    .from('kv_store_6fcaeea3')
    .select('value')
    .eq('key', 'clients:all')
    .maybeSingle();
  
  if (clientsError) {
    console.log(`   ⚠️  Warning: ${clientsError.message}`);
  } else if (clientsData) {
    const clientIds = clientsData.value || [];
    console.log(`   ✅ Successfully read 'clients:all' key`);
    console.log(`   Found ${Array.isArray(clientIds) ? clientIds.length : 0} clients`);
  } else {
    console.log(`   ℹ️  Key 'clients:all' not found (database might be empty)`);
  }
  console.log('');
  
  console.log('='.repeat(80));
  console.log('✅ ALL TESTS PASSED - Connection is working!');
  console.log('='.repeat(80));
  console.log('');
  console.log('You can now run:');
  console.log('  deno run --allow-net --allow-env supabase/functions/server/database/check_current_data.ts');
  
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
  console.log('');
  console.log('Stack trace:');
  console.log(error.stack);
  Deno.exit(1);
}
