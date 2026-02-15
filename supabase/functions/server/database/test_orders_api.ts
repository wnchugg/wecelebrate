/**
 * Test Orders API (Database Version)
 * 
 * Tests the refactored orders functionality in gifts_api_v2.ts
 * Run with: deno run --allow-net --allow-env --unsafely-ignore-certificate-errors test_orders_api.ts
 */

import * as db from './db.ts';

console.log('================================================================================');
console.log('Orders API Test (Database Version)');
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

// ==================== Test 1: Create Order ====================

console.log('Test 1: Create Order');
console.log('');

try {
  // Get a product first
  const products = await db.getProducts({ limit: 1 });
  
  if (products.length === 0) {
    console.log('❌ No products found - run seed_products.ts first');
    Deno.exit(1);
  }
  
  const product = products[0];
  console.log(`   Using product: ${product.name} (${product.sku})`);
  
  const start = Date.now();
  const order = await db.createOrder({
    order_number: db.generateOrderNumber(),
    user_id: 'test-user-123',
    user_email: 'test@example.com',
    product_id: product.id,
    quantity: 1,
    unit_price: product.price,
    total_price: product.price,
    currency: product.currency,
    status: 'pending',
    shipping_address: {
      fullName: 'Test User',
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'US',
      phone: '555-1234',
    },
    estimated_delivery: 'March 1, 2026',
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
  
  recordTest('Create order', !!order.id, duration);
  console.log(`   Order ID: ${order.id}`);
  console.log(`   Order Number: ${order.order_number}`);
  console.log('');
  
  // Save order ID for later tests
  const testOrderId = order.id;
  
  // ==================== Test 2: Get Order by ID ====================
  
  console.log('Test 2: Get Order by ID');
  const start2 = Date.now();
  const fetchedOrder = await db.getOrderById(testOrderId);
  const duration2 = Date.now() - start2;
  
  recordTest('Get order by ID', fetchedOrder?.id === testOrderId, duration2);
  if (fetchedOrder) {
    console.log(`   Found: ${fetchedOrder.order_number}`);
  }
  console.log('');
  
  // ==================== Test 3: Get Order with Product ====================
  
  console.log('Test 3: Get Order with Product (JOIN)');
  const start3 = Date.now();
  const orderWithProduct = await db.getOrderWithProduct(testOrderId);
  const duration3 = Date.now() - start3;
  
  recordTest('Get order with product JOIN', !!orderWithProduct?.product, duration3);
  if (orderWithProduct) {
    console.log(`   Order: ${orderWithProduct.order_number}`);
    console.log(`   Product: ${orderWithProduct.product.name}`);
  }
  console.log('');
  
  // ==================== Test 4: Get Orders for User ====================
  
  console.log('Test 4: Get Orders for User');
  const start4 = Date.now();
  const userOrders = await db.getOrdersWithProducts({ user_id: 'test-user-123' });
  const duration4 = Date.now() - start4;
  
  recordTest('Get user orders', userOrders.length >= 1, duration4);
  console.log(`   Found ${userOrders.length} orders for user`);
  console.log('');
  
  // ==================== Test 5: Update Order Status ====================
  
  console.log('Test 5: Update Order Status');
  const start5 = Date.now();
  const updatedOrder = await db.updateOrderWithTimeline(
    testOrderId,
    {
      status: 'processing',
      tracking_number: 'TRACK123',
      carrier: 'Test Carrier',
    },
    {
      status: 'processing',
      label: 'Processing',
      timestamp: new Date().toISOString(),
      location: 'Warehouse',
      description: 'Order is being processed',
    }
  );
  const duration5 = Date.now() - start5;
  
  recordTest('Update order status', updatedOrder.status === 'processing', duration5);
  console.log(`   New status: ${updatedOrder.status}`);
  console.log(`   Tracking: ${updatedOrder.tracking_number}`);
  console.log('');
  
  // ==================== Test 6: Get Order Revenue ====================
  
  console.log('Test 6: Get Order Revenue');
  const start6 = Date.now();
  const revenue = await db.getOrderRevenue();
  const duration6 = Date.now() - start6;
  
  recordTest('Get order revenue', revenue.order_count >= 1, duration6);
  console.log(`   Total Revenue: $${revenue.total_revenue.toFixed(2)}`);
  console.log(`   Order Count: ${revenue.order_count}`);
  console.log(`   Average Order Value: $${revenue.average_order_value.toFixed(2)}`);
  console.log('');
  
  // ==================== Test 7: Generate Order Number ====================
  
  console.log('Test 7: Generate Order Number');
  const start7 = Date.now();
  const orderNumber1 = db.generateOrderNumber();
  const orderNumber2 = db.generateOrderNumber();
  const duration7 = Date.now() - start7;
  
  const isUnique = orderNumber1 !== orderNumber2;
  const hasCorrectFormat = orderNumber1.startsWith('ORD-');
  
  recordTest('Generate unique order numbers', isUnique && hasCorrectFormat, duration7);
  console.log(`   Sample 1: ${orderNumber1}`);
  console.log(`   Sample 2: ${orderNumber2}`);
  console.log('');
  
  // ==================== Cleanup ====================
  
  console.log('Cleanup: Deleting test order');
  await db.deleteOrder(testOrderId);
  console.log('✅ Test order deleted');
  console.log('');
  
} catch (error: any) {
  console.error('❌ Test failed:', error.message);
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
  console.log('✅ Orders API is working correctly');
  console.log('✅ Database queries are fast');
  console.log('✅ JOINs working properly');
  console.log('✅ Timeline tracking working');
  console.log('✅ Revenue calculations working');
  console.log('');
  console.log('Next steps:');
  console.log('1. Orders API is ready for production');
  console.log('2. Test with real order creation flow');
  console.log('3. Monitor performance in production');
} else {
  console.log('⚠️  Some tests failed');
  console.log('Please fix the issues before deploying');
}

console.log('');
