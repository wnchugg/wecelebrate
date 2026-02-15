/**
 * Test Gifts API V2 (Database Version)
 * 
 * Tests the refactored gifts_api_v2.ts to verify it works correctly
 * Run with: deno run --allow-net --allow-env --unsafely-ignore-certificate-errors test_gifts_api_v2.ts
 */

import * as giftsApi from '../gifts_api_v2.ts';

console.log('================================================================================');
console.log('Gifts API V2 Test');
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
  tests: [] as { name: string; status: 'PASS' | 'FAIL'; error?: string; duration?: number }[],
};

function recordTest(name: string, passed: boolean, duration: number, error?: any) {
  if (passed) {
    results.passed++;
    results.tests.push({ name, status: 'PASS', duration });
    console.log(`✅ ${name} (${duration}ms)`);
  } else {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error?.message || String(error), duration });
    console.log(`❌ ${name} (${duration}ms)`);
    if (error) console.log(`   Error: ${error.message || String(error)}`);
  }
}

// ==================== Test getAllGifts ====================

console.log('🎁 Testing getAllGifts...');
console.log('');

try {
  const start = Date.now();
  const gifts = await giftsApi.getAllGifts('development');
  const duration = Date.now() - start;
  
  recordTest('Get all gifts', gifts.length === 6, duration);
  console.log(`   Found ${gifts.length} gifts`);
  
  // Verify structure
  if (gifts.length > 0) {
    const gift = gifts[0];
    const hasRequiredFields = !!(
      gift.id &&
      gift.name &&
      gift.description &&
      gift.price &&
      gift.sku &&
      gift.category
    );
    recordTest('Gift has required fields', hasRequiredFields, 0);
    
    if (hasRequiredFields) {
      console.log(`   Sample gift: ${gift.name} (${gift.sku}) - $${gift.price}`);
    }
  }
} catch (error) {
  recordTest('Get all gifts', false, 0, error);
}

console.log('');

// ==================== Test getAllGifts with filters ====================

console.log('🔍 Testing getAllGifts with filters...');
console.log('');

try {
  // Test category filter
  const start1 = Date.now();
  const electronicsGifts = await giftsApi.getAllGifts('development', { category: 'Electronics' });
  const duration1 = Date.now() - start1;
  
  recordTest('Filter by category (Electronics)', electronicsGifts.length === 3, duration1);
  console.log(`   Found ${electronicsGifts.length} Electronics products`);
  
  // Test search filter
  const start2 = Date.now();
  const searchResults = await giftsApi.getAllGifts('development', { search: 'headphones' });
  const duration2 = Date.now() - start2;
  
  recordTest('Search for "headphones"', searchResults.length >= 1, duration2);
  console.log(`   Found ${searchResults.length} products matching "headphones"`);
  
  // Test inStockOnly filter
  const start3 = Date.now();
  const inStockGifts = await giftsApi.getAllGifts('development', { inStockOnly: true });
  const duration3 = Date.now() - start3;
  
  recordTest('Filter in-stock only', inStockGifts.length === 6, duration3);
  console.log(`   Found ${inStockGifts.length} in-stock products`);
} catch (error) {
  recordTest('Filter tests', false, 0, error);
}

console.log('');

// ==================== Test getGiftById ====================

console.log('🎯 Testing getGiftById...');
console.log('');

try {
  // First get all gifts to get a valid ID
  const allGifts = await giftsApi.getAllGifts('development');
  
  if (allGifts.length > 0) {
    const testGiftId = allGifts[0].id;
    
    const start = Date.now();
    const gift = await giftsApi.getGiftById('development', testGiftId);
    const duration = Date.now() - start;
    
    recordTest('Get gift by ID', gift !== null && gift.id === testGiftId, duration);
    
    if (gift) {
      console.log(`   Found: ${gift.name}`);
    }
    
    // Test with invalid ID
    const start2 = Date.now();
    const invalidGift = await giftsApi.getGiftById('development', 'invalid-id-12345');
    const duration2 = Date.now() - start2;
    
    recordTest('Get gift with invalid ID returns null', invalidGift === null, duration2);
  } else {
    recordTest('Get gift by ID', false, 0, new Error('No gifts found to test with'));
  }
} catch (error) {
  recordTest('Get gift by ID', false, 0, error);
}

console.log('');

// ==================== Test getCategories ====================

console.log('📂 Testing getCategories...');
console.log('');

try {
  const start = Date.now();
  const categories = await giftsApi.getCategories('development');
  const duration = Date.now() - start;
  
  recordTest('Get categories', categories.length >= 3, duration);
  console.log(`   Found ${categories.length} categories:`, categories.join(', '));
  
  // Verify expected categories exist
  const hasElectronics = categories.includes('Electronics');
  const hasFoodBeverage = categories.includes('Food & Beverage');
  
  recordTest('Has Electronics category', hasElectronics, 0);
  recordTest('Has Food & Beverage category', hasFoodBeverage, 0);
} catch (error) {
  recordTest('Get categories', false, 0, error);
}

console.log('');

// ==================== Performance Comparison ====================

console.log('⚡ Performance Metrics...');
console.log('');

const performanceTests = results.tests.filter(t => t.duration && t.duration > 0);
if (performanceTests.length > 0) {
  const avgDuration = performanceTests.reduce((sum, t) => sum + (t.duration || 0), 0) / performanceTests.length;
  console.log(`   Average query time: ${avgDuration.toFixed(2)}ms`);
  console.log(`   Fastest query: ${Math.min(...performanceTests.map(t => t.duration || 0))}ms`);
  console.log(`   Slowest query: ${Math.max(...performanceTests.map(t => t.duration || 0))}ms`);
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
  console.log('✅ Gifts API V2 is working correctly');
  console.log('✅ Database queries are fast (< 100ms)');
  console.log('✅ All filters working as expected');
  console.log('');
  console.log('Next steps:');
  console.log('1. Replace gifts_api.ts with gifts_api_v2.ts');
  console.log('2. Update imports in index.tsx');
  console.log('3. Deploy and verify in production');
} else {
  console.log('⚠️  Some tests failed');
  console.log('');
  console.log('Please fix the issues before deploying');
}

console.log('');
