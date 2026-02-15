/**
 * Migration Testing Script
 * Phase 1: Database Optimization - Day 4
 * 
 * This script tests the migration on a copy of production data
 * and generates a comprehensive test report.
 * 
 * Usage:
 *   deno run --allow-net --allow-env test_migration.ts
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from '../kv_env.ts';

// ============================================================================
// Configuration
// ============================================================================

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  performanceMetrics: PerformanceMetric[];
}

interface PerformanceMetric {
  operation: string;
  kvTime: number;
  sqlTime: number;
  improvement: string;
}

const testResults: TestResult[] = [];
const performanceMetrics: PerformanceMetric[] = [];

// ============================================================================
// Logging Utilities
// ============================================================================

function log(message: string, level: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warn: '⚠️',
  }[level];
  console.log(`${prefix} ${message}`);
}

function addTestResult(testName: string, passed: boolean, message: string, details?: any) {
  testResults.push({ testName, passed, message, details });
  log(`${testName}: ${message}`, passed ? 'success' : 'error');
}

// ============================================================================
// Data Integrity Tests
// ============================================================================

/**
 * Test 1: Verify record counts match between KV and SQL
 */
async function testRecordCounts(): Promise<void> {
  log('\n=== Test 1: Record Counts ===');
  
  try {
    // Clients
    const kvClients: string[] = await kv.get('clients:all') || [];
    const { count: sqlClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    addTestResult(
      'Clients Count',
      kvClients.length === sqlClients,
      `KV: ${kvClients.length}, SQL: ${sqlClients}`,
      { kv: kvClients.length, sql: sqlClients }
    );
    
    // Catalogs
    const kvCatalogs: string[] = await kv.get('catalogs:all') || [];
    const { count: sqlCatalogs } = await supabase
      .from('catalogs')
      .select('*', { count: 'exact', head: true });
    
    addTestResult(
      'Catalogs Count',
      kvCatalogs.length === sqlCatalogs,
      `KV: ${kvCatalogs.length}, SQL: ${sqlCatalogs}`,
      { kv: kvCatalogs.length, sql: sqlCatalogs }
    );
    
    // Sites
    const kvSites: string[] = await kv.get('sites:all') || [];
    const { count: sqlSites } = await supabase
      .from('sites')
      .select('*', { count: 'exact', head: true });
    
    addTestResult(
      'Sites Count',
      kvSites.length === sqlSites,
      `KV: ${kvSites.length}, SQL: ${sqlSites}`,
      { kv: kvSites.length, sql: sqlSites }
    );
    
    // Products
    const kvProducts: string[] = await kv.get('gifts:all') || [];
    const { count: sqlProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    addTestResult(
      'Products Count',
      kvProducts.length === sqlProducts,
      `KV: ${kvProducts.length}, SQL: ${sqlProducts}`,
      { kv: kvProducts.length, sql: sqlProducts }
    );
    
    // Employees
    const kvEmployees: string[] = await kv.get('employees:all') || [];
    const { count: sqlEmployees } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    addTestResult(
      'Employees Count',
      kvEmployees.length === sqlEmployees,
      `KV: ${kvEmployees.length}, SQL: ${sqlEmployees}`,
      { kv: kvEmployees.length, sql: sqlEmployees }
    );
    
    // Orders
    const kvOrders: string[] = await kv.get('orders:all') || [];
    const { count: sqlOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    addTestResult(
      'Orders Count',
      kvOrders.length === sqlOrders,
      `KV: ${kvOrders.length}, SQL: ${sqlOrders}`,
      { kv: kvOrders.length, sql: sqlOrders }
    );
    
  } catch (error) {
    addTestResult('Record Counts', false, `Error: ${error.message}`);
  }
}

/**
 * Test 2: Verify foreign key relationships
 */
async function testForeignKeys(): Promise<void> {
  log('\n=== Test 2: Foreign Key Relationships ===');
  
  try {
    // Check for orphaned sites (sites without valid client)
    const { data: orphanedSites } = await supabase.rpc('check_orphaned_sites', {});
    const orphanedSitesCount = orphanedSites?.[0]?.count || 0;
    
    addTestResult(
      'Sites Foreign Keys',
      orphanedSitesCount === 0,
      orphanedSitesCount === 0 
        ? 'All sites have valid clients' 
        : `Found ${orphanedSitesCount} orphaned sites`,
      { orphanedCount: orphanedSitesCount }
    );
    
    // Check for orphaned products (products without valid catalog)
    const { data: orphanedProducts } = await supabase.rpc('check_orphaned_products', {});
    const orphanedProductsCount = orphanedProducts?.[0]?.count || 0;
    
    addTestResult(
      'Products Foreign Keys',
      orphanedProductsCount === 0,
      orphanedProductsCount === 0 
        ? 'All products have valid catalogs' 
        : `Found ${orphanedProductsCount} orphaned products`,
      { orphanedCount: orphanedProductsCount }
    );
    
    // Check for orphaned orders (orders without valid site/client)
    const { data: orphanedOrders } = await supabase.rpc('check_orphaned_orders', {});
    const orphanedOrdersCount = orphanedOrders?.[0]?.count || 0;
    
    addTestResult(
      'Orders Foreign Keys',
      orphanedOrdersCount === 0,
      orphanedOrdersCount === 0 
        ? 'All orders have valid sites/clients' 
        : `Found ${orphanedOrdersCount} orphaned orders`,
      { orphanedCount: orphanedOrdersCount }
    );
    
  } catch (error) {
    // If RPC functions don't exist, do manual checks
    log('RPC functions not found, doing manual checks...', 'warn');
    
    // Manual check for orphaned sites
    const { data: sites } = await supabase
      .from('sites')
      .select('id, client_id, clients(id)')
      .is('clients.id', null);
    
    addTestResult(
      'Sites Foreign Keys (Manual)',
      !sites || sites.length === 0,
      sites && sites.length > 0 
        ? `Found ${sites.length} orphaned sites` 
        : 'All sites have valid clients',
      { orphanedCount: sites?.length || 0 }
    );
    
    // Manual check for orphaned products
    const { data: products } = await supabase
      .from('products')
      .select('id, catalog_id, catalogs(id)')
      .is('catalogs.id', null);
    
    addTestResult(
      'Products Foreign Keys (Manual)',
      !products || products.length === 0,
      products && products.length > 0 
        ? `Found ${products.length} orphaned products` 
        : 'All products have valid catalogs',
      { orphanedCount: products?.length || 0 }
    );
  }
}

/**
 * Test 3: Verify data integrity (sample records)
 */
async function testDataIntegrity(): Promise<void> {
  log('\n=== Test 3: Data Integrity ===');
  
  try {
    // Get a sample client from KV
    const clientIds: string[] = await kv.get('clients:all') || [];
    if (clientIds.length > 0) {
      const sampleClientId = clientIds[0];
      const kvClient = await kv.get(`client:${sampleClientId}`);
      const { data: sqlClient } = await supabase
        .from('clients')
        .select('*')
        .eq('id', sampleClientId)
        .single();
      
      const fieldsMatch = 
        kvClient.name === sqlClient.name &&
        kvClient.contact_email === sqlClient.contact_email &&
        kvClient.status === sqlClient.status;
      
      addTestResult(
        'Client Data Integrity',
        fieldsMatch,
        fieldsMatch 
          ? 'Sample client data matches' 
          : 'Sample client data mismatch',
        { kvClient, sqlClient }
      );
    }
    
    // Get a sample product from KV
    const productIds: string[] = await kv.get('gifts:all') || [];
    if (productIds.length > 0) {
      const sampleProductId = productIds[0];
      const kvProduct = await kv.get(`gift:${sampleProductId}`);
      const { data: sqlProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', sampleProductId)
        .single();
      
      const fieldsMatch = 
        kvProduct.name === sqlProduct.name &&
        kvProduct.sku === sqlProduct.sku &&
        kvProduct.price === sqlProduct.price;
      
      addTestResult(
        'Product Data Integrity',
        fieldsMatch,
        fieldsMatch 
          ? 'Sample product data matches' 
          : 'Sample product data mismatch',
        { kvProduct, sqlProduct }
      );
    }
    
  } catch (error) {
    addTestResult('Data Integrity', false, `Error: ${error.message}`);
  }
}

// ============================================================================
// Performance Tests
// ============================================================================

/**
 * Test 4: Compare query performance (KV vs SQL)
 */
async function testQueryPerformance(): Promise<void> {
  log('\n=== Test 4: Query Performance ===');
  
  try {
    // Test 1: List products by catalog
    const catalogIds: string[] = await kv.get('catalogs:all') || [];
    if (catalogIds.length > 0) {
      const testCatalogId = catalogIds[0];
      
      // KV approach (N+1 queries)
      const kvStart = performance.now();
      const giftIds: string[] = await kv.get(`catalog_gifts:${testCatalogId}`) || [];
      const kvProducts = [];
      for (const giftId of giftIds.slice(0, 100)) {  // Limit to 100 for testing
        const product = await kv.get(`gift:${giftId}`);
        if (product) kvProducts.push(product);
      }
      const kvTime = performance.now() - kvStart;
      
      // SQL approach (single query)
      const sqlStart = performance.now();
      const { data: sqlProducts } = await supabase
        .from('products')
        .select('*')
        .eq('catalog_id', testCatalogId)
        .eq('is_active', true)
        .limit(100);
      const sqlTime = performance.now() - sqlStart;
      
      const improvement = ((kvTime - sqlTime) / kvTime * 100).toFixed(1);
      
      performanceMetrics.push({
        operation: 'List 100 Products by Catalog',
        kvTime: Math.round(kvTime),
        sqlTime: Math.round(sqlTime),
        improvement: `${improvement}% faster`,
      });
      
      addTestResult(
        'Product Listing Performance',
        sqlTime < kvTime,
        `KV: ${Math.round(kvTime)}ms, SQL: ${Math.round(sqlTime)}ms (${improvement}% faster)`,
        { kvTime, sqlTime, improvement }
      );
    }
    
    // Test 2: Get site with client info
    const siteIds: string[] = await kv.get('sites:all') || [];
    if (siteIds.length > 0) {
      const testSiteId = siteIds[0];
      
      // KV approach (multiple queries)
      const kvStart = performance.now();
      const kvSite = await kv.get(`site:${testSiteId}`);
      const kvClient = kvSite ? await kv.get(`client:${kvSite.client_id}`) : null;
      const kvTime = performance.now() - kvStart;
      
      // SQL approach (single query with JOIN)
      const sqlStart = performance.now();
      const { data: sqlSite } = await supabase
        .from('sites')
        .select('*, clients(*)')
        .eq('id', testSiteId)
        .single();
      const sqlTime = performance.now() - sqlStart;
      
      const improvement = ((kvTime - sqlTime) / kvTime * 100).toFixed(1);
      
      performanceMetrics.push({
        operation: 'Get Site with Client Info',
        kvTime: Math.round(kvTime),
        sqlTime: Math.round(sqlTime),
        improvement: `${improvement}% faster`,
      });
      
      addTestResult(
        'Site Query Performance',
        sqlTime < kvTime,
        `KV: ${Math.round(kvTime)}ms, SQL: ${Math.round(sqlTime)}ms (${improvement}% faster)`,
        { kvTime, sqlTime, improvement }
      );
    }
    
    // Test 3: Count orders by client
    const clientIds: string[] = await kv.get('clients:all') || [];
    if (clientIds.length > 0) {
      const testClientId = clientIds[0];
      
      // KV approach (load all, filter in memory)
      const kvStart = performance.now();
      const allOrderIds: string[] = await kv.get('orders:all') || [];
      let kvCount = 0;
      for (const orderId of allOrderIds) {
        const order = await kv.get(`order:${orderId}`);
        if (order && order.client_id === testClientId) {
          kvCount++;
        }
      }
      const kvTime = performance.now() - kvStart;
      
      // SQL approach (single query with COUNT)
      const sqlStart = performance.now();
      const { count: sqlCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', testClientId);
      const sqlTime = performance.now() - sqlStart;
      
      const improvement = ((kvTime - sqlTime) / kvTime * 100).toFixed(1);
      
      performanceMetrics.push({
        operation: 'Count Orders by Client',
        kvTime: Math.round(kvTime),
        sqlTime: Math.round(sqlTime),
        improvement: `${improvement}% faster`,
      });
      
      addTestResult(
        'Order Count Performance',
        sqlTime < kvTime && kvCount === sqlCount,
        `KV: ${Math.round(kvTime)}ms, SQL: ${Math.round(sqlTime)}ms (${improvement}% faster)`,
        { kvTime, sqlTime, improvement, kvCount, sqlCount }
      );
    }
    
  } catch (error) {
    addTestResult('Query Performance', false, `Error: ${error.message}`);
  }
}

/**
 * Test 5: Test indexes are being used
 */
async function testIndexUsage(): Promise<void> {
  log('\n=== Test 5: Index Usage ===');
  
  try {
    // This would require EXPLAIN ANALYZE which isn't directly available via Supabase client
    // We'll do a simple check to ensure queries are fast
    
    const start = performance.now();
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(100);
    const time = performance.now() - start;
    
    addTestResult(
      'Index Usage (Active Products)',
      time < 100,  // Should be < 100ms with index
      `Query time: ${Math.round(time)}ms ${time < 100 ? '(using index)' : '(may not be using index)'}`,
      { time, recordCount: data?.length }
    );
    
  } catch (error) {
    addTestResult('Index Usage', false, `Error: ${error.message}`);
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests(): Promise<TestReport> {
  log('='.repeat(80));
  log('Migration Testing - Day 4');
  log('='.repeat(80));
  
  const startTime = new Date();
  
  // Run all tests
  await testRecordCounts();
  await testForeignKeys();
  await testDataIntegrity();
  await testQueryPerformance();
  await testIndexUsage();
  
  // Generate report
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = testResults.filter(r => !r.passed).length;
  
  const report: TestReport = {
    timestamp: startTime.toISOString(),
    totalTests: testResults.length,
    passedTests,
    failedTests,
    results: testResults,
    performanceMetrics,
  };
  
  // Print summary
  log('\n' + '='.repeat(80));
  log('Test Summary');
  log('='.repeat(80));
  log(`Total Tests: ${report.totalTests}`);
  log(`Passed: ${passedTests}`, 'success');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'error' : 'success');
  
  if (performanceMetrics.length > 0) {
    log('\nPerformance Improvements:');
    performanceMetrics.forEach(metric => {
      log(`  ${metric.operation}: ${metric.kvTime}ms → ${metric.sqlTime}ms (${metric.improvement})`);
    });
  }
  
  if (failedTests > 0) {
    log('\nFailed Tests:', 'error');
    testResults.filter(r => !r.passed).forEach(result => {
      log(`  ❌ ${result.testName}: ${result.message}`, 'error');
    });
  }
  
  log('='.repeat(80));
  
  // Save report to file
  const reportJson = JSON.stringify(report, null, 2);
  await Deno.writeTextFile('migration_test_report.json', reportJson);
  log('\n✅ Test report saved to: migration_test_report.json', 'success');
  
  return report;
}

// ============================================================================
// Entry Point
// ============================================================================

if (import.meta.main) {
  try {
    const report = await runAllTests();
    
    // Exit with appropriate code
    Deno.exit(report.failedTests === 0 ? 0 : 1);
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    Deno.exit(1);
  }
}

export { runAllTests, testRecordCounts, testForeignKeys, testDataIntegrity, testQueryPerformance, testIndexUsage };
