#!/bin/bash

# Frontend Migration Test Script
# Tests that v2 endpoints are working correctly

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Frontend Migration Test - V2 Endpoints                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Load environment variables
if [ -f "supabase/functions/server/tests/.env" ]; then
  source supabase/functions/server/tests/.env
else
  echo "❌ Error: .env file not found"
  exit 1
fi

# Configuration
BACKEND_URL="${SUPABASE_URL}/functions/v1/make-server-6fcaeea3"
ENV_ID="development"

echo "Backend URL: $BACKEND_URL"
echo "Environment: $ENV_ID"
echo "Token: ${TEST_ADMIN_TOKEN:0:20}..."
echo ""

# Test counter
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local expected_field="$4"
  
  echo -n "Testing $name... "
  
  response=$(curl -s -X "$method" \
    -H "X-Access-Token: $TEST_ADMIN_TOKEN" \
    -H "X-Environment-ID: $ENV_ID" \
    -H "Content-Type: application/json" \
    "$BACKEND_URL$endpoint")
  
  # Check if response contains expected field
  if echo "$response" | grep -q "\"$expected_field\""; then
    echo "✅ PASS"
    ((PASSED++))
    return 0
  else
    echo "❌ FAIL"
    echo "   Response: $response"
    ((FAILED++))
    return 1
  fi
}

echo "════════════════════════════════════════════════════════════════"
echo "Testing V2 Endpoints"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Test Clients
echo "📦 Clients Endpoints:"
test_endpoint "GET /v2/clients" "GET" "/v2/clients" "data"
test_endpoint "GET /v2/clients/:id" "GET" "/v2/clients/00000000-0000-0000-0000-000000000001" "data"
echo ""

# Test Sites
echo "🏢 Sites Endpoints:"
test_endpoint "GET /v2/sites" "GET" "/v2/sites" "data"
test_endpoint "GET /v2/sites/:id" "GET" "/v2/sites/00000000-0000-0000-0000-000000000002" "data"
test_endpoint "GET /v2/sites?client_id" "GET" "/v2/sites?client_id=00000000-0000-0000-0000-000000000001" "data"
echo ""

# Test Products
echo "🎁 Products Endpoints:"
test_endpoint "GET /v2/products" "GET" "/v2/products" "data"
test_endpoint "GET /v2/products/:id" "GET" "/v2/products/00000000-0000-0000-0000-000000000020" "data"
echo ""

# Test Employees
echo "👥 Employees Endpoints:"
test_endpoint "GET /v2/employees" "GET" "/v2/employees?site_id=00000000-0000-0000-0000-000000000002" "data"
test_endpoint "GET /v2/employees/:id" "GET" "/v2/employees/00000000-0000-0000-0000-000000000010" "data"
echo ""

# Test Orders
echo "📦 Orders Endpoints:"
test_endpoint "GET /v2/orders" "GET" "/v2/orders" "data"
test_endpoint "GET /v2/orders/:id" "GET" "/v2/orders/00000000-0000-0000-0000-000000000040" "data"
test_endpoint "GET /v2/orders?site_id" "GET" "/v2/orders?site_id=00000000-0000-0000-0000-000000000002" "data"
echo ""

# Test Dashboard (already migrated in Phase 1)
echo "📊 Dashboard Endpoints:"
test_endpoint "GET /dashboard/stats" "GET" "/dashboard/stats/00000000-0000-0000-0000-000000000002?timeRange=30d" "stats"
test_endpoint "GET /dashboard/recent-orders" "GET" "/dashboard/recent-orders/00000000-0000-0000-0000-000000000002?limit=5" "orders"
test_endpoint "GET /dashboard/popular-gifts" "GET" "/dashboard/popular-gifts/00000000-0000-0000-0000-000000000002?limit=5&timeRange=30d" "gifts"
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════"
echo "Test Summary"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "📊 Total:  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 All tests passed!"
  echo ""
  echo "Next steps:"
  echo "  1. Open http://localhost:5173/admin/login in your browser"
  echo "  2. Login with test admin credentials"
  echo "  3. Test the admin dashboard features"
  echo "  4. Verify clients, sites, employees, and orders load correctly"
  exit 0
else
  echo "⚠️  Some tests failed. Please check the output above."
  exit 1
fi
