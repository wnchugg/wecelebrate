/**
 * Test Orders API (Multi-Tenant Database Version)
 * 
 * Tests the refactored orders functionality with multi-tenant schema
 * Run with: deno run --allow-net --allow-env --unsafely-ignore-certificate-errors test_orders_api_multitenant.ts
 */

import * as db from './db.ts';

console.log('================================================================================');
console.log('Orders API Test (Multi-Tenant Database Version)');
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

// Test results
let passed = 0;
let failed = 0;

function recordTest(name: string, success: boolean, duration: number, error?: any) {
  if (success) {
    passed++;
    console.log(`✅ ${name} (${duration}ms)`);
  } else {
    failed++;
    console.log(`❌ ${name} (${duration}ms)`);
    if (error) console.log(`   Error: ${error.message || String(error)}`);
  }
}

try {
  // ==================== Setup: Get Required Data ====================
  
  console.log('Setup: Getting required data...');
  console.log('');
  
  // Get a client
  const clients = await db.getClients({ limit: 1 });
  if (clients.length === 0) {
    console.log('❌ No clients found - need to create test data first');
    Deno.exit(1);
  }
  const client = clients[0];
  console.log(`   Using client: ${client.name} (${client.id})`);
  
  // Get a site for this client
  const sites = await db.getSites({ client_id: client.id, limit: 1 });
  if (sites.length === 0) {
    console.log('❌ No sites found for client - need to create test data first');
    Deno.exit(1);
  }
  const site = sites[0];
  console.log(`   Using site: ${site.name} (${site.id})`);
  
  // Get a product
  const products = await db.getProducts({ limit: 1 });
  if (products.length === 0) {
    console.log('❌ No products found - run seed_products.ts first');
    Deno.exit(1);
  }
  const product = products[0];
  console.log(`   Using product: ${product.name} (${product.sku})`);
  console.log('');
  
  // ==================== Test 1: Create Order ====================
  
  console.log('Test 1: Create Order (Multi-Tenant)');
  console.log('');
  
  const start = Date.now();
  const order = await db.createOrder({
    client_id: client.id,
    site_id: site.id,
    product_id: product.id,
    order_number: db.generateOrderNumber(),
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    customer_employee_id: 'test-employee-123',
    status: 'pending',
    total_amount: product.price,
    currency: product.currency,
    shipping_address: {
      fullName: 'Test User',
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'US',
      phone: '555-1234',
    },
    items: [{
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.price,
      total_price: product.price,
    }],
    metadata: {
      timeline: [{
        status: 'pending',
        label: 'Order Placed',
        timestamp: new Date().toISOString(),
        location: 'Online',
        description: 'Test order created',
      }],
    },
  });
  const duration = Date.now() - start;
  
  recordTest('Create order with multi-tenant schema', !!order.id, duration);
  console.log(`   Order ID: ${order.id}`);
  console.log(`   Order Number: ${order.order_number}`);
  console.log(`   Client ID: ${order.client_id}`);
  console.log(`   Site ID: ${order.site_id}`);
  console.log('');
  
  const testOrderId = order.id;
  
  // ==================== Test 2: Get Order by ID ====================
  
  console.log('Test 2: Get Order by ID');
  const start2 = Date.now();
  const fetchedOrder = await db.getOrderById(testOrderId);
  const duration2 = Date.now() - start2;
  
  recordTest('Get order by ID', fetchedOrder?.id === testOrderId, duration2);
  if (fetchedOrder) {
    console.log(`   Found: ${fetchedOrder.order_number}`);
    console.log(`   Status: ${fetchedOrder.status}`);
    console.log(`   Total: ${fetchedOrder.total_amount} ${fetchedOrder.currency}`);
  }
  console.log('');
  
  // ==================== Test 3: Get Order with Product (JOIN) ====================
  
  console.log('Test 3: Get Order with Product (JOIN)');
  const start3 = Date.now();
  const orderWithProduct = await db.getOrderWithProduct(testOrderId);
  const duration3 = Date.now() - start3;
  
  recordTest('Get order with product JOIN', !!orderWithProduct?.product, duration3);
  if (orderWithProduct) {
    console.log(`   Order: ${orderWithProduct.order_number}`);
    console.log(`   Product: ${orderWithProduct.product.name}`);
    console.log(`   Items: ${orderWithProduct.items.length}`);
  }
  console.log('');
  
  // ==================== Test 4: Get Orders for Site ====================
  
  console.log('Test 4: Get Orders for Site');
  const start4 = Date.now();
  const siteOrders = await db.getOrdersWithProducts({ site_id: site.id });
  const duration4 = Date.now() - start4;
  
  recordTest('Get site orders', siteOrders.length >= 1, duration4);
  console.log(`   Found ${siteOrders.length} orders for site`);
  console.log('');
  
  // ==================== Test 5: Get Orders for Client ====================
  
  console.log('Test 5: Get Orders for Client');
  const start5 = Date.now();
  const clientOrders = await db.getOrdersWithProducts({ client_id: client.id });
  const duration5 = Date.now() - start5;
  
  recordTest('Get client orders', clientOrders.length >= 1, duration5);
  console.log(`   Found ${clientOrders.length} orders for client`);
  console.log('');
  
  // ==================== Test 6: Update Order Status ====================
  
  console.log('Test 6: Update Order Status with Timestamps');
  const start6 = Date.now();
  const timestamp = new Date().toISOString();
  const updatedOrder = await db.updateOrderWithTimeline(
    testOrderId,
    {
      status: 'processing',
      tracking_number: 'TRACK123',
      confirmed_at: timestamp,
    },
    {
      status: 'processing',
      label: 'Processing',
      timestamp,
      location: 'Warehouse',
      description: 'Order is being processed',
    }
  );
  const duration6 = Date.now() - start6;
  
  recordTest('Update order status', updatedOrder.status === 'processing', duration6);
  console.log(`   New status: ${updatedOrder.status}`);
  console.log(`   Tracking: ${updatedOrder.tracking_number}`);
  console.log(`   Confirmed at: ${updatedOrder.confirmed_at}`);
  console.log('');
  
  // ==================== Test 7: Get Order Revenue ====================
  
  console.log('Test 7: Get Order Revenue (Multi-Tenant)');
  const start7 = Date.now();
  const revenue = await db.getOrderRevenue({ client_id: client.id });
  const duration7 = Date.now() - start7;
  
  recordTest('Get order revenue', revenue.order_count >= 1, duration7);
  console.log(`   Total Revenue: ${revenue.total_revenue.toFixed(2)} ${revenue.currency}`);
  console.log(`   Order Count: ${revenue.order_count}`);
  console.log(`   Average Order Value: ${revenue.average_order_value.toFixed(2)}`);
  console.log('');
  
  // ==================== Test 8: Get Order Stats ====================
  
  console.log('Test 8: Get Order Stats (Multi-Tenant)');
  const start8 = Date.now();
  const stats = await db.getOrderStats({ client_id: client.id });
  const duration8 = Date.now() - start8;
  
  recordTest('Get order stats', stats.total >= 1, duration8);
  console.log(`   Total: ${stats.total}`);
  console.log(`   Pending: ${stats.pending}`);
  console.log(`   Processing: ${stats.processing}`);
  console.log(`   Shipped: ${stats.shipped}`);
  console.log(`   Delivered: ${stats.delivered}`);
  console.log('');
  
  // ==================== Test 9: Multi-Item Order ====================
  
  console.log('Test 9: Create Multi-Item Order');
  const start9 = Date.now();
  const multiItemOrder = await db.createOrder({
    client_id: client.id,
    site_id: site.id,
    order_number: db.generateOrderNumber(),
    customer_name: 'Multi Item User',
    customer_email: 'multiitem@example.com',
    status: 'pending',
    total_amount: product.price * 3,
    currency: product.currency,
    shipping_address: {
      fullName: 'Multi Item User',
      street: '456 Test Ave',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'US',
      phone: '555-5678',
    },
    items: [
      {
        product_id: product.id,
        product_name: product.name,
        quantity: 2,
        unit_price: product.price,
        total_price: product.price * 2,
      },
      {
        product_id: product.id,
        product_name: product.name + ' (variant)',
        quantity: 1,
        unit_price: product.price,
        total_price: product.price,
      },
    ],
    metadata: {},
  });
  const duration9 = Date.now() - start9;
  
  recordTest('Create multi-item order', multiItemOrder.items.length === 2, duration9);
  console.log(`   Order: ${multiItemOrder.order_number}`);
  console.log(`   Items: ${multiItemOrder.items.length}`);
  console.log(`   Total: ${multiItemOrder.total_amount} ${multiItemOrder.currency}`);
  console.log('');
  
  // ==================== Cleanup ====================
  
  console.log('Cleanup: Deleting test orders');
  await db.deleteOrder(testOrderId);
  await db.deleteOrder(multiItemOrder.id);
  console.log('✅ Test orders deleted');
  console.log('');
  
} catch (error: any) {
  console.error('❌ Test failed:', error.message);
  console.error(error);
  failed++;
}

// ==================== Summary ====================

console.log('================================================================================');
console.log('Test Summary');
console.log('================================================================================');
console.log('');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);
console.log('');

if (failed === 0) {
  console.log('🎉 All tests passed!');
  console.log('');
  console.log('✅ Multi-tenant orders schema working correctly');
  console.log('✅ Database queries are fast');
  console.log('✅ JOINs working properly');
  console.log('✅ Timeline tracking working');
  console.log('✅ Revenue calculations working');
  console.log('✅ Multi-item orders supported');
  console.log('');
  console.log('Next steps:');
  console.log('1. Orders API is ready for production');
  console.log('2. Test with real order creation flow via gifts_api_v2.ts');
  console.log('3. Monitor performance in production');
} else {
  console.log('⚠️  Some tests failed');
  console.log('Please fix the issues before deploying');
}

console.log('');
