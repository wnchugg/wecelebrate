/**
 * Test Database Access Layer
 * 
 * Tests the db.ts module to verify database connectivity and CRUD operations
 * Run with: deno run --allow-net --allow-env --unsafely-ignore-certificate-errors test_db_access.ts
 */

import * as db from './db.ts';

console.log('================================================================================');
console.log('Database Access Layer Test');
console.log('================================================================================');
console.log('');

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.log('📍 Environment:');
console.log('   SUPABASE_URL:', SUPABASE_URL || 'NOT SET');
console.log('   SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
console.log('');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  Deno.exit(1);
}

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: [] as { name: string; status: 'PASS' | 'FAIL'; error?: string }[],
};

function recordTest(name: string, passed: boolean, error?: any) {
  if (passed) {
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error?.message || String(error) });
    console.log(`❌ ${name}`);
    if (error) console.log(`   Error: ${error.message || String(error)}`);
  }
}

// ==================== Test Clients ====================

console.log('📦 Testing Clients...');
console.log('');

try {
  // Test: Get all clients (should work even if empty)
  const clients = await db.getClients();
  recordTest('Get all clients', true);
  console.log(`   Found ${clients.length} clients`);
} catch (error) {
  recordTest('Get all clients', false, error);
}

try {
  // Test: Create client
  const newClient = await db.insertClient({
    name: 'Test Client',
    contact_email: 'test@example.com',
    status: 'active',
  });
  recordTest('Create client', !!newClient.id);
  console.log(`   Created client: ${newClient.id}`);
  
  // Test: Get client by ID
  const fetchedClient = await db.getClientById(newClient.id);
  recordTest('Get client by ID', fetchedClient?.id === newClient.id);
  
  // Test: Update client
  const updatedClient = await db.updateClient(newClient.id, {
    name: 'Updated Test Client',
  });
  recordTest('Update client', updatedClient.name === 'Updated Test Client');
  
  // Test: Delete client
  await db.deleteClient(newClient.id);
  const deletedClient = await db.getClientById(newClient.id);
  recordTest('Delete client', deletedClient === null);
} catch (error) {
  recordTest('Client CRUD operations', false, error);
}

console.log('');

// ==================== Test Catalogs ====================

console.log('📚 Testing Catalogs...');
console.log('');

try {
  const catalogs = await db.getCatalogs();
  recordTest('Get all catalogs', true);
  console.log(`   Found ${catalogs.length} catalogs`);
} catch (error) {
  recordTest('Get all catalogs', false, error);
}

try {
  const newCatalog = await db.createCatalog({
    name: 'Test Catalog',
    type: 'manual',
    status: 'active',
  });
  recordTest('Create catalog', !!newCatalog.id);
  console.log(`   Created catalog: ${newCatalog.id}`);
  
  await db.deleteCatalog(newCatalog.id);
  recordTest('Delete catalog', true);
} catch (error) {
  recordTest('Catalog CRUD operations', false, error);
}

console.log('');

// ==================== Test Products ====================

console.log('🎁 Testing Products...');
console.log('');

try {
  const products = await db.getProducts();
  recordTest('Get all products', true);
  console.log(`   Found ${products.length} products`);
} catch (error) {
  recordTest('Get all products', false, error);
}

// Note: Creating products requires a catalog_id, so we'll skip create test for now

console.log('');

// ==================== Test Sites ====================

console.log('🏢 Testing Sites...');
console.log('');

try {
  const sites = await db.getSites();
  recordTest('Get all sites', true);
  console.log(`   Found ${sites.length} sites`);
} catch (error) {
  recordTest('Get all sites', false, error);
}

console.log('');

// ==================== Test Employees ====================

console.log('👥 Testing Employees...');
console.log('');

try {
  const employees = await db.getEmployees();
  recordTest('Get all employees', true);
  console.log(`   Found ${employees.length} employees`);
} catch (error) {
  recordTest('Get all employees', false, error);
}

console.log('');

// ==================== Test Orders ====================

console.log('📦 Testing Orders...');
console.log('');

try {
  const orders = await db.getOrders();
  recordTest('Get all orders', true);
  console.log(`   Found ${orders.length} orders`);
} catch (error) {
  recordTest('Get all orders', false, error);
}

console.log('');

// ==================== Summary ====================

console.log('================================================================================');
console.log('Test Summary');
console.log('================================================================================');
console.log('');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`📊 Total: ${results.passed + results.failed}`);
console.log('');

if (results.failed > 0) {
  console.log('Failed tests:');
  results.tests
    .filter(t => t.status === 'FAIL')
    .forEach(t => {
      console.log(`   ❌ ${t.name}`);
      if (t.error) console.log(`      ${t.error}`);
    });
  console.log('');
}

if (results.failed === 0) {
  console.log('🎉 All tests passed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Deploy schema to database (if not already done)');
  console.log('2. Start refactoring API endpoints to use db.ts');
  console.log('3. Test each refactored endpoint');
} else {
  console.log('⚠️  Some tests failed');
  console.log('');
  console.log('Possible issues:');
  console.log('1. Schema not deployed yet - run schema.sql in Supabase SQL editor');
  console.log('2. Database connection issues');
  console.log('3. Permission issues with service role key');
}

console.log('');
