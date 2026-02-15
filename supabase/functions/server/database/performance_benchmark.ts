/**
 * Performance Benchmark Suite
 * 
 * Measures actual performance of database-backed APIs
 * Compares to theoretical KV store performance
 * 
 * Run with: deno run --allow-net --allow-env --unsafely-ignore-certificate-errors performance_benchmark.ts
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as db from './db.ts';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://wjfcqqrlhwdvvjmefxky.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data IDs (will be created during setup)
let testClientId: string;
let testSiteId: string;
let testCatalogId: string;
let testProductIds: string[] = [];
let testOrderIds: string[] = [];

// Benchmark results
interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  p50: number;
  p95: number;
  p99: number;
  opsPerSecond: number;
}

const results: BenchmarkResult[] = [];

// Utility functions
function logSection(title: string) {
  console.log('');
  console.log('═'.repeat(60));
  console.log(`📊 ${title}`);
  console.log('═'.repeat(60));
}

function logTest(name: string) {
  console.log('');
  console.log(`🔍 ${name}`);
  console.log('─'.repeat(60));
}

function logResult(result: BenchmarkResult) {
  console.log(`✅ Completed ${result.iterations} iterations`);
  console.log(`   Average: ${result.avgTime.toFixed(2)}ms`);
  console.log(`   Min: ${result.minTime.toFixed(2)}ms`);
  console.log(`   Max: ${result.maxTime.toFixed(2)}ms`);
  console.log(`   P50: ${result.p50.toFixed(2)}ms`);
  console.log(`   P95: ${result.p95.toFixed(2)}ms`);
  console.log(`   P99: ${result.p99.toFixed(2)}ms`);
  console.log(`   Throughput: ${result.opsPerSecond.toFixed(0)} ops/sec`);
}

async function benchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number = 100
): Promise<BenchmarkResult> {
  const times: number[] = [];
  
  // Warm-up
  await fn();
  
  // Run benchmark
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  // Calculate statistics
  times.sort((a, b) => a - b);
  const totalTime = times.reduce((sum, t) => sum + t, 0);
  const avgTime = totalTime / iterations;
  const minTime = times[0];
  const maxTime = times[times.length - 1];
  const p50 = times[Math.floor(iterations * 0.50)];
  const p95 = times[Math.floor(iterations * 0.95)];
  const p99 = times[Math.floor(iterations * 0.99)];
  const opsPerSecond = 1000 / avgTime;
  
  const result: BenchmarkResult = {
    name,
    iterations,
    totalTime,
    avgTime,
    minTime,
    maxTime,
    p50,
    p95,
    p99,
    opsPerSecond,
  };
  
  results.push(result);
  return result;
}

// Setup test data
async function setup() {
  logSection('Setup: Creating Test Data');
  
  try {
    // Create test client
    const client = await db.insertClient({
      name: 'Performance Test Client',
      contact_email: 'perf-test@example.com',
      status: 'active',
    });
    testClientId = client.id;
    console.log(`✅ Created test client: ${testClientId}`);
    
    // Create test site
    const site = await db.createSite({
      client_id: testClientId,
      name: 'Performance Test Site',
      slug: `perf-test-site-${Date.now()}`,
      status: 'active',
    });
    testSiteId = site.id;
    console.log(`✅ Created test site: ${testSiteId}`);
    
    // Create test catalog
    const catalog = await db.createCatalog({
      name: 'Performance Test Catalog',
      type: 'manual',
      status: 'active',
    });
    testCatalogId = catalog.id;
    console.log(`✅ Created test catalog: ${testCatalogId}`);
    
    // Create test products (100 products for realistic testing)
    console.log('Creating 100 test products...');
    for (let i = 0; i < 100; i++) {
      const product = await db.createProduct({
        catalog_id: testCatalogId,
        sku: `PERF-TEST-${i.toString().padStart(3, '0')}`,
        name: `Performance Test Product ${i}`,
        description: `Test product for performance benchmarking`,
        category: `Category ${i % 10}`,
        price: 10 + (i * 0.5),
        status: 'active',
      });
      testProductIds.push(product.id);
    }
    console.log(`✅ Created 100 test products`);
    
    // Create test orders (50 orders for realistic testing)
    console.log('Creating 50 test orders...');
    for (let i = 0; i < 50; i++) {
      const order = await db.createOrder({
        client_id: testClientId,
        site_id: testSiteId,
        product_id: testProductIds[i % testProductIds.length],
        order_number: `PERF-${Date.now()}-${i}`,
        customer_name: `Test Customer ${i}`,
        customer_email: `customer${i}@example.com`,
        status: 'pending',
        total_amount: 100 + (i * 10),
        shipping_address: {
          fullName: `Test Customer ${i}`,
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
        },
        items: [{
          product_id: testProductIds[i % testProductIds.length],
          quantity: 1,
          price: 100,
        }],
      });
      testOrderIds.push(order.id);
    }
    console.log(`✅ Created 50 test orders`);
    
    console.log('');
    console.log('✅ Setup complete!');
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    Deno.exit(1);
  }
}

// Cleanup test data
async function cleanup() {
  logSection('Cleanup: Deleting Test Data');
  
  try {
    // Delete orders
    for (const orderId of testOrderIds) {
      await db.deleteOrder(orderId);
    }
    console.log(`✅ Deleted ${testOrderIds.length} test orders`);
    
    // Delete products
    for (const productId of testProductIds) {
      await db.deleteProduct(productId);
    }
    console.log(`✅ Deleted ${testProductIds.length} test products`);
    
    // Delete catalog
    await db.deleteCatalog(testCatalogId);
    console.log(`✅ Deleted test catalog`);
    
    // Delete site
    await db.deleteSite(testSiteId);
    console.log(`✅ Deleted test site`);
    
    // Delete client
    await db.deleteClient(testClientId);
    console.log(`✅ Deleted test client`);
    
    console.log('');
    console.log('✅ Cleanup complete!');
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Benchmark tests
async function runBenchmarks() {
  logSection('Performance Benchmarks');
  
  // 1. Single record lookup
  logTest('Test 1: Get Product by ID (Single Record Lookup)');
  const result1 = await benchmark(
    'Get Product by ID',
    async () => {
      await db.getProductById(testProductIds[0]);
    },
    100
  );
  logResult(result1);
  
  // 2. List query with pagination
  logTest('Test 2: List Products (Paginated Query)');
  const result2 = await benchmark(
    'List Products',
    async () => {
      await db.getProducts({ limit: 20, offset: 0 });
    },
    100
  );
  logResult(result2);
  
  // 3. Filtered query
  logTest('Test 3: Filter Products by Category');
  const result3 = await benchmark(
    'Filter Products',
    async () => {
      await db.getProducts({ category: 'Category 1', limit: 20 });
    },
    100
  );
  logResult(result3);
  
  // 4. Complex JOIN query (orders with product info)
  logTest('Test 4: Get Orders (JOIN Query)');
  const result4 = await benchmark(
    'Get Orders with Products',
    async () => {
      await db.getOrders({ site_id: testSiteId, limit: 20 });
    },
    100
  );
  logResult(result4);
  
  // 5. Aggregation query
  logTest('Test 5: Get Catalog Statistics (Aggregation)');
  const result5 = await benchmark(
    'Catalog Statistics',
    async () => {
      await db.getCatalogById(testCatalogId);
    },
    100
  );
  logResult(result5);
  
  // 6. Create operation
  logTest('Test 6: Create Product (INSERT)');
  const createdProductIds: string[] = [];
  const result6 = await benchmark(
    'Create Product',
    async () => {
      const product = await db.createProduct({
        catalog_id: testCatalogId,
        sku: `BENCH-${Date.now()}-${Math.random()}`,
        name: 'Benchmark Product',
        description: 'Created during benchmark',
        price: 99.99,
        status: 'active',
      });
      createdProductIds.push(product.id);
    },
    50
  );
  logResult(result6);
  
  // Cleanup created products
  for (const id of createdProductIds) {
    await db.deleteProduct(id);
  }
  
  // 7. Update operation
  logTest('Test 7: Update Product (UPDATE)');
  const result7 = await benchmark(
    'Update Product',
    async () => {
      await db.updateProduct(testProductIds[0], {
        price: 99.99 + Math.random(),
      });
    },
    50
  );
  logResult(result7);
  
  // 8. Complex configuration query
  logTest('Test 8: Get Site Catalog Configuration (Complex Query)');
  const result8 = await benchmark(
    'Get Site Config',
    async () => {
      await db.getSiteCatalogConfig(testSiteId);
    },
    100
  );
  logResult(result8);
}

// Generate summary report
function generateReport() {
  logSection('Performance Benchmark Summary');
  
  console.log('');
  console.log('📊 Results Summary:');
  console.log('');
  console.log('┌─────────────────────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐');
  console.log('│ Test Name                           │ Avg (ms) │ P50 (ms) │ P95 (ms) │ P99 (ms) │ Ops/sec  │');
  console.log('├─────────────────────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤');
  
  for (const result of results) {
    const name = result.name.padEnd(35);
    const avg = result.avgTime.toFixed(1).padStart(8);
    const p50 = result.p50.toFixed(1).padStart(8);
    const p95 = result.p95.toFixed(1).padStart(8);
    const p99 = result.p99.toFixed(1).padStart(8);
    const ops = result.opsPerSecond.toFixed(0).padStart(8);
    
    console.log(`│ ${name} │ ${avg} │ ${p50} │ ${p95} │ ${p99} │ ${ops} │`);
  }
  
  console.log('└─────────────────────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘');
  
  // Calculate overall statistics
  const avgOfAvgs = results.reduce((sum, r) => sum + r.avgTime, 0) / results.length;
  const totalOps = results.reduce((sum, r) => sum + r.opsPerSecond, 0);
  
  console.log('');
  console.log('📈 Overall Statistics:');
  console.log(`   Average query time: ${avgOfAvgs.toFixed(2)}ms`);
  console.log(`   Total throughput: ${totalOps.toFixed(0)} ops/sec`);
  
  // Performance assessment
  console.log('');
  console.log('✅ Performance Assessment:');
  
  if (avgOfAvgs < 50) {
    console.log('   🎉 EXCELLENT - Average query time < 50ms');
  } else if (avgOfAvgs < 100) {
    console.log('   ✅ GOOD - Average query time < 100ms');
  } else if (avgOfAvgs < 200) {
    console.log('   ⚠️  ACCEPTABLE - Average query time < 200ms');
  } else {
    console.log('   ❌ NEEDS IMPROVEMENT - Average query time > 200ms');
  }
  
  // Comparison to KV store
  console.log('');
  console.log('📊 Comparison to KV Store:');
  console.log('');
  console.log('   KV Store (estimated):');
  console.log('   - Single lookup: ~10ms');
  console.log('   - List query (N+1): ~10ms * N (100+ items = 1000ms+)');
  console.log('   - Complex query: Not possible (requires multiple lookups)');
  console.log('');
  console.log('   Database (actual):');
  console.log(`   - Single lookup: ${results[0]?.avgTime.toFixed(1)}ms`);
  console.log(`   - List query: ${results[1]?.avgTime.toFixed(1)}ms`);
  console.log(`   - Complex query: ${results[3]?.avgTime.toFixed(1)}ms`);
  console.log('');
  
  const listImprovement = (1000 / (results[1]?.avgTime || 1)).toFixed(0);
  console.log(`   🚀 Performance Improvement: ${listImprovement}x faster for list queries`);
  
  console.log('');
  console.log('═'.repeat(60));
  console.log('✅ Benchmark Complete!');
  console.log('═'.repeat(60));
}

// Main execution
async function main() {
  console.log('🚀 Performance Benchmark Suite');
  console.log('═'.repeat(60));
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log('');
  
  try {
    await setup();
    await runBenchmarks();
    generateReport();
    await cleanup();
  } catch (error: any) {
    console.error('');
    console.error('❌ Benchmark failed:', error.message);
    console.error(error.stack);
    
    // Try to cleanup even if benchmark failed
    try {
      await cleanup();
    } catch (cleanupError) {
      console.error('❌ Cleanup also failed:', cleanupError);
    }
    
    Deno.exit(1);
  }
}

// Run the benchmark
main();
