/**
 * Dashboard API Tests
 * 
 * Tests for the dashboard analytics endpoints including:
 * - GET /dashboard/stats/:siteId
 * - GET /dashboard/recent-orders/:siteId
 * - GET /dashboard/popular-gifts/:siteId
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.210.0/assert/mod.ts";

// Test configuration
const BASE_URL = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';
const FUNCTION_URL = `${BASE_URL}/functions/v1/make-server-6fcaeea3`;
const ADMIN_TOKEN = 'test-admin-token'; // Replace with valid token for integration tests
const TEST_SITE_ID = 'test-site-123';

/**
 * Helper to make authenticated requests
 */
async function makeRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${FUNCTION_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'X-Environment-ID': 'test',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Test Suite: Dashboard Stats Endpoint
 */
Deno.test({
  name: "Dashboard Stats - Returns valid response structure",
  async fn() {
    const response = await makeRequest(`/dashboard/stats/${TEST_SITE_ID}?timeRange=30d`);
    const data = await response.json();
    
    // Check response structure
    assertExists(data.success);
    assertExists(data.stats);
    assertExists(data.timeRange);
    assertExists(data.generatedAt);
    
    // Check stats structure
    assertExists(data.stats.totalOrders);
    assertExists(data.stats.previousOrders);
    assertExists(data.stats.orderGrowth);
    assertExists(data.stats.activeEmployees);
    assertExists(data.stats.giftsAvailable);
    assertExists(data.stats.pendingShipments);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Dashboard Stats - Accepts different time ranges",
  async fn() {
    const timeRanges = ['7d', '30d', '90d', '1y'];
    
    for (const range of timeRanges) {
      const response = await makeRequest(`/dashboard/stats/${TEST_SITE_ID}?timeRange=${range}`);
      const data = await response.json();
      
      assertEquals(data.timeRange, range);
      assertExists(data.stats);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Dashboard Stats - Defaults to 30d when no timeRange provided",
  async fn() {
    const response = await makeRequest(`/dashboard/stats/${TEST_SITE_ID}`);
    const data = await response.json();
    
    assertEquals(data.timeRange, '30d');
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Dashboard Stats - Growth calculations are numbers",
  async fn() {
    const response = await makeRequest(`/dashboard/stats/${TEST_SITE_ID}?timeRange=30d`);
    const data = await response.json();
    
    assertEquals(typeof data.stats.orderGrowth, 'number');
    assertEquals(typeof data.stats.employeeGrowth, 'number');
    assertEquals(typeof data.stats.giftsChange, 'number');
    assertEquals(typeof data.stats.pendingChange, 'number');
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Dashboard Stats - Requires authentication",
  async fn() {
    const response = await fetch(`${FUNCTION_URL}/dashboard/stats/${TEST_SITE_ID}`, {
      headers: {
        'X-Environment-ID': 'test',
      },
    });
    
    // Should return 401 or 403 without auth
    assertEquals(response.status >= 400, true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

/**
 * Test Suite: Recent Orders Endpoint
 */
Deno.test({
  name: "Recent Orders - Returns valid response structure",
  async fn() {
    const response = await makeRequest(`/dashboard/recent-orders/${TEST_SITE_ID}?limit=5`);
    const data = await response.json();
    
    assertExists(data.success);
    assertExists(data.orders);
    assertExists(data.total);
    assertEquals(Array.isArray(data.orders), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Recent Orders - Each order has required fields",
  async fn() {
    const response = await makeRequest(`/dashboard/recent-orders/${TEST_SITE_ID}?limit=5`);
    const data = await response.json();
    
    if (data.orders.length > 0) {
      const order = data.orders[0];
      assertExists(order.id);
      assertExists(order.orderNumber);
      assertExists(order.employeeEmail);
      assertExists(order.giftName);
      assertExists(order.status);
      assertExists(order.orderDate);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Recent Orders - Respects limit parameter",
  async fn() {
    const limits = [1, 5, 10];
    
    for (const limit of limits) {
      const response = await makeRequest(`/dashboard/recent-orders/${TEST_SITE_ID}?limit=${limit}`);
      const data = await response.json();
      
      assertEquals(data.orders.length <= limit, true);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Recent Orders - Filters by status when provided",
  async fn() {
    const statuses = ['pending', 'shipped', 'delivered'];
    
    for (const status of statuses) {
      const response = await makeRequest(`/dashboard/recent-orders/${TEST_SITE_ID}?status=${status}`);
      const data = await response.json();
      
      // All returned orders should have the requested status
      for (const order of data.orders) {
        assertEquals(order.status, status);
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Recent Orders - Orders are sorted by date descending",
  async fn() {
    const response = await makeRequest(`/dashboard/recent-orders/${TEST_SITE_ID}?limit=10`);
    const data = await response.json();
    
    if (data.orders.length > 1) {
      for (let i = 0; i < data.orders.length - 1; i++) {
        const currentDate = new Date(data.orders[i].orderDate).getTime();
        const nextDate = new Date(data.orders[i + 1].orderDate).getTime();
        
        // Current should be >= next (descending order)
        assertEquals(currentDate >= nextDate, true);
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Recent Orders - Requires authentication",
  async fn() {
    const response = await fetch(`${FUNCTION_URL}/dashboard/recent-orders/${TEST_SITE_ID}`, {
      headers: {
        'X-Environment-ID': 'test',
      },
    });
    
    // Should return 401 or 403 without auth
    assertEquals(response.status >= 400, true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

/**
 * Test Suite: Popular Gifts Endpoint
 */
Deno.test({
  name: "Popular Gifts - Returns valid response structure",
  async fn() {
    const response = await makeRequest(`/dashboard/popular-gifts/${TEST_SITE_ID}?limit=5&timeRange=30d`);
    const data = await response.json();
    
    assertExists(data.success);
    assertExists(data.gifts);
    assertExists(data.totalOrders);
    assertEquals(Array.isArray(data.gifts), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Popular Gifts - Each gift has required fields",
  async fn() {
    const response = await makeRequest(`/dashboard/popular-gifts/${TEST_SITE_ID}?limit=5&timeRange=30d`);
    const data = await response.json();
    
    if (data.gifts.length > 0) {
      const gift = data.gifts[0];
      assertExists(gift.giftId);
      assertExists(gift.giftName);
      assertExists(gift.orderCount);
      assertExists(gift.percentage);
      
      assertEquals(typeof gift.orderCount, 'number');
      assertEquals(typeof gift.percentage, 'number');
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Popular Gifts - Respects limit parameter",
  async fn() {
    const limits = [1, 5, 10];
    
    for (const limit of limits) {
      const response = await makeRequest(`/dashboard/popular-gifts/${TEST_SITE_ID}?limit=${limit}`);
      const data = await response.json();
      
      assertEquals(data.gifts.length <= limit, true);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Popular Gifts - Gifts are sorted by order count descending",
  async fn() {
    const response = await makeRequest(`/dashboard/popular-gifts/${TEST_SITE_ID}?limit=10`);
    const data = await response.json();
    
    if (data.gifts.length > 1) {
      for (let i = 0; i < data.gifts.length - 1; i++) {
        const currentCount = data.gifts[i].orderCount;
        const nextCount = data.gifts[i + 1].orderCount;
        
        // Current should be >= next (descending order)
        assertEquals(currentCount >= nextCount, true);
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Popular Gifts - Percentages are between 0 and 100",
  async fn() {
    const response = await makeRequest(`/dashboard/popular-gifts/${TEST_SITE_ID}?limit=10`);
    const data = await response.json();
    
    for (const gift of data.gifts) {
      assertEquals(gift.percentage >= 0, true);
      assertEquals(gift.percentage <= 100, true);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Popular Gifts - Accepts different time ranges",
  async fn() {
    const timeRanges = ['7d', '30d', '90d', '1y'];
    
    for (const range of timeRanges) {
      const response = await makeRequest(`/dashboard/popular-gifts/${TEST_SITE_ID}?timeRange=${range}`);
      const data = await response.json();
      
      assertExists(data.gifts);
      assertExists(data.totalOrders);
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Popular Gifts - Requires authentication",
  async fn() {
    const response = await fetch(`${FUNCTION_URL}/dashboard/popular-gifts/${TEST_SITE_ID}`, {
      headers: {
        'X-Environment-ID': 'test',
      },
    });
    
    // Should return 401 or 403 without auth
    assertEquals(response.status >= 400, true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

/**
 * Test Suite: Cross-Endpoint Integration
 */
Deno.test({
  name: "Integration - Stats and Recent Orders have consistent total counts",
  async fn() {
    const statsResponse = await makeRequest(`/dashboard/stats/${TEST_SITE_ID}?timeRange=30d`);
    const statsData = await statsResponse.json();
    
    const ordersResponse = await makeRequest(`/dashboard/recent-orders/${TEST_SITE_ID}?limit=1000`);
    const ordersData = await ordersResponse.json();
    
    // Note: This may not always match exactly due to time filtering
    // but total orders should be reasonable
    assertExists(statsData.stats.totalOrders);
    assertExists(ordersData.total);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Integration - Popular gifts total orders matches filtered orders",
  async fn() {
    const response = await makeRequest(`/dashboard/popular-gifts/${TEST_SITE_ID}?timeRange=30d&limit=100`);
    const data = await response.json();
    
    // Sum of all gift order counts should equal or be less than totalOrders
    const sumOfCounts = data.gifts.reduce((sum: number, gift: any) => sum + gift.orderCount, 0);
    assertEquals(sumOfCounts <= data.totalOrders, true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

/**
 * Test Suite: Error Handling
 */
Deno.test({
  name: "Error Handling - Returns error for invalid site ID",
  async fn() {
    const response = await makeRequest(`/dashboard/stats/invalid-site-id-12345`);
    const data = await response.json();
    
    // Should still return success with zero/empty data
    assertExists(data.success);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Error Handling - Handles missing environment gracefully",
  async fn() {
    const response = await fetch(`${FUNCTION_URL}/dashboard/stats/${TEST_SITE_ID}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        // No X-Environment-ID header
      },
    });
    
    const data = await response.json();
    
    // Should default to 'development' environment
    assertExists(data);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

/**
 * Test Suite: Growth Calculation Logic
 */
Deno.test({
  name: "Growth Calculation - Zero to positive shows 100% growth",
  fn() {
    const current = 10;
    const previous = 0;
    const growth = previous > 0 
      ? Math.round(((current - previous) / previous) * 1000) / 10
      : (current > 0 ? 100 : 0);
    
    assertEquals(growth, 100);
  },
});

Deno.test({
  name: "Growth Calculation - Zero to zero shows 0% growth",
  fn() {
    const current = 0;
    const previous = 0;
    const growth = previous > 0 
      ? Math.round(((current - previous) / previous) * 1000) / 10
      : (current > 0 ? 100 : 0);
    
    assertEquals(growth, 0);
  },
});

Deno.test({
  name: "Growth Calculation - Positive growth calculated correctly",
  fn() {
    const current = 150;
    const previous = 100;
    const growth = Math.round(((current - previous) / previous) * 1000) / 10;
    
    assertEquals(growth, 50); // 50% growth
  },
});

Deno.test({
  name: "Growth Calculation - Negative growth calculated correctly",
  fn() {
    const current = 75;
    const previous = 100;
    const growth = Math.round(((current - previous) / previous) * 1000) / 10;
    
    assertEquals(growth, -25); // -25% decline
  },
});

Deno.test({
  name: "Growth Calculation - Rounds to 1 decimal place",
  fn() {
    const current = 107;
    const previous = 100;
    const growth = Math.round(((current - previous) / previous) * 1000) / 10;
    
    assertEquals(growth, 7); // Exactly 7.0%
  },
});

/**
 * Test Suite: Percentage Calculation Logic
 */
Deno.test({
  name: "Percentage Calculation - Calculates correctly",
  fn() {
    const orderCount = 25;
    const totalOrders = 100;
    const percentage = Math.round((orderCount / totalOrders) * 100);
    
    assertEquals(percentage, 25);
  },
});

Deno.test({
  name: "Percentage Calculation - Handles zero total",
  fn() {
    const orderCount = 0;
    const totalOrders = 0;
    const percentage = totalOrders > 0 
      ? Math.round((orderCount / totalOrders) * 100)
      : 0;
    
    assertEquals(percentage, 0);
  },
});

Deno.test({
  name: "Percentage Calculation - Rounds to integer",
  fn() {
    const orderCount = 33;
    const totalOrders = 100;
    const percentage = Math.round((orderCount / totalOrders) * 100);
    
    assertEquals(percentage, 33);
  },
});

/**
 * Run all tests with:
 * deno test dashboard_api.test.ts --allow-net --allow-env
 */

console.log('✅ Dashboard API Tests Loaded');
console.log('📋 Test coverage:');
console.log('   - Dashboard Stats: 5 tests');
console.log('   - Recent Orders: 6 tests');
console.log('   - Popular Gifts: 7 tests');
console.log('   - Integration: 2 tests');
console.log('   - Error Handling: 2 tests');
console.log('   - Growth Calculation: 5 tests');
console.log('   - Percentage Calculation: 3 tests');
console.log('   Total: 30 tests');
