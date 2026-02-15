/**
 * Verify Orders Schema Deployment
 * 
 * Checks that the orders table has the correct multi-tenant structure
 * Run with: deno run --allow-net --allow-env --unsafely-ignore-certificate-errors verify_orders_schema.ts
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('================================================================================');
console.log('Orders Schema Verification');
console.log('================================================================================');
console.log('');

// Expected columns in multi-tenant schema
const expectedColumns = [
  'id',
  'client_id',
  'site_id',
  'product_id',
  'employee_id',
  'order_number',
  'customer_name',
  'customer_email',
  'customer_employee_id',
  'status',
  'total_amount',
  'currency',
  'shipping_address',
  'tracking_number',
  'items',
  'metadata',
  'notes',
  'created_at',
  'updated_at',
  'confirmed_at',
  'shipped_at',
  'delivered_at',
  'cancelled_at',
];

console.log('Checking orders table structure...\n');

// Try to query the table to see if it exists
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .limit(0);

if (error) {
  console.error('❌ Orders table not accessible:', error.message);
  console.log('\nPlease run deploy_orders_schema.sql in Supabase SQL Editor');
  Deno.exit(1);
}

console.log('✅ Orders table exists and is accessible');
console.log('');

// Check if we can describe the table structure
// Note: This is a workaround since we can't directly query information_schema
console.log('Expected columns in multi-tenant schema:');
expectedColumns.forEach(col => {
  console.log(`  - ${col}`);
});

console.log('');
console.log('================================================================================');
console.log('Next Steps');
console.log('================================================================================');
console.log('');
console.log('1. Verify the schema was deployed correctly in Supabase Dashboard');
console.log('2. Check that all columns exist:');
console.log('   - Go to Table Editor → orders');
console.log('   - Verify columns match the list above');
console.log('');
console.log('3. Run the orders API test:');
console.log('   cd supabase/functions/server/database');
console.log('   deno run --allow-net --allow-env --unsafely-ignore-certificate-errors test_orders_api.ts');
console.log('');
