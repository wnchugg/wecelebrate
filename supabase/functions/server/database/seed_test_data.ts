/**
 * Seed Test Data for Multi-Tenant Schema
 * 
 * Creates test client, site, and catalog for testing orders
 * Run with: deno run --allow-net --allow-env --unsafely-ignore-certificate-errors seed_test_data.ts
 */

import * as db from './db.ts';

console.log('================================================================================');
console.log('Seed Test Data for Multi-Tenant Schema');
console.log('================================================================================');
console.log('');

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  Deno.exit(1);
}

console.log('📍 Environment:', SUPABASE_URL);
console.log('');

try {
  // ==================== Check Existing Data ====================
  
  console.log('Checking existing data...');
  console.log('');
  
  const existingClients = await db.getClients({ search: 'Test Company' });
  const existingSites = await db.getSites({ search: 'Test Site' });
  const existingCatalogs = await db.getCatalogs({ search: 'Default Catalog' });
  
  let client, site, catalog;
  
  // ==================== Create or Get Client ====================
  
  if (existingClients.length > 0) {
    client = existingClients[0];
    console.log(`✅ Using existing client: ${client.name} (${client.id})`);
  } else {
    console.log('Creating test client...');
    client = await db.insertClient({
      name: 'Test Company',
      contact_email: 'admin@testcompany.com',
      status: 'active',
      client_code: 'TEST',
      client_contact_name: 'Test Admin',
      client_contact_phone: '555-0100',
    });
    console.log(`✅ Created client: ${client.name} (${client.id})`);
  }
  console.log('');
  
  // ==================== Create or Get Site ====================
  
  if (existingSites.length > 0) {
    site = existingSites[0];
    console.log(`✅ Using existing site: ${site.name} (${site.id})`);
  } else {
    console.log('Creating test site...');
    site = await db.createSite({
      client_id: client.id,
      name: 'Test Site',
      slug: 'test-site',
      status: 'active',
    });
    console.log(`✅ Created site: ${site.name} (${site.id})`);
  }
  console.log('');
  
  // ==================== Create or Get Catalog ====================
  
  if (existingCatalogs.length > 0) {
    catalog = existingCatalogs[0];
    console.log(`✅ Using existing catalog: ${catalog.name} (${catalog.id})`);
  } else {
    console.log('Creating default catalog...');
    catalog = await db.createCatalog({
      name: 'Default Catalog',
      description: 'Default product catalog for testing',
      type: 'manual',
      status: 'active',
    });
    console.log(`✅ Created catalog: ${catalog.name} (${catalog.id})`);
  }
  console.log('');
  
  // ==================== Check Products ====================
  
  const products = await db.getProducts({ catalog_id: catalog.id });
  console.log(`📦 Products in catalog: ${products.length}`);
  
  if (products.length === 0) {
    console.log('');
    console.log('⚠️  No products found in catalog');
    console.log('   Run seed_products.ts to add products:');
    console.log('   deno run --allow-net --allow-env --unsafely-ignore-certificate-errors seed_products.ts');
  } else {
    console.log('   Sample products:');
    products.slice(0, 3).forEach(p => {
      console.log(`   - ${p.name} (${p.sku}) - $${p.price}`);
    });
  }
  console.log('');
  
  // ==================== Summary ====================
  
  console.log('================================================================================');
  console.log('Test Data Summary');
  console.log('================================================================================');
  console.log('');
  console.log(`✅ Client: ${client.name}`);
  console.log(`   ID: ${client.id}`);
  console.log(`   Status: ${client.status}`);
  console.log('');
  console.log(`✅ Site: ${site.name}`);
  console.log(`   ID: ${site.id}`);
  console.log(`   Client ID: ${site.client_id}`);
  console.log(`   Status: ${site.status}`);
  console.log('');
  console.log(`✅ Catalog: ${catalog.name}`);
  console.log(`   ID: ${catalog.id}`);
  console.log(`   Products: ${products.length}`);
  console.log('');
  
  if (products.length > 0) {
    console.log('🎉 Test data is ready!');
    console.log('');
    console.log('You can now run the orders API test:');
    console.log('deno run --allow-net --allow-env --unsafely-ignore-certificate-errors test_orders_api_multitenant.ts');
  } else {
    console.log('⚠️  Need to seed products before testing orders');
    console.log('');
    console.log('Run: deno run --allow-net --allow-env --unsafely-ignore-certificate-errors seed_products.ts');
  }
  console.log('');
  
} catch (error: any) {
  console.error('❌ Error seeding test data:', error.message);
  console.error(error);
  Deno.exit(1);
}
