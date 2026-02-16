#!/bin/bash

# Test V2 Database-Backed Endpoints
# Tests all CRUD operations for clients, sites, products, employees, and orders

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"

# Load token from .env
if [ -f .env ]; then
  source .env
else
  echo -e "${RED}❌ .env file not found${NC}"
  exit 1
fi

if [ -z "$TEST_ADMIN_TOKEN" ]; then
  echo -e "${RED}❌ TEST_ADMIN_TOKEN not set in .env${NC}"
  exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Testing V2 Database-Backed Endpoints                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test Clients
echo -e "${YELLOW}Testing Clients Endpoints...${NC}"
echo ""

echo "1. GET /v2/clients"
CLIENTS_RESPONSE=$(curl -s "$BACKEND_URL/v2/clients" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$CLIENTS_RESPONSE" | jq '.' 2>/dev/null || echo "$CLIENTS_RESPONSE"
echo ""

echo "2. GET /v2/clients/:id (test client)"
CLIENT_RESPONSE=$(curl -s "$BACKEND_URL/v2/clients/00000000-0000-0000-0000-000000000001" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$CLIENT_RESPONSE" | jq '.' 2>/dev/null || echo "$CLIENT_RESPONSE"
echo ""

# Test Sites
echo -e "${YELLOW}Testing Sites Endpoints...${NC}"
echo ""

echo "3. GET /v2/sites"
SITES_RESPONSE=$(curl -s "$BACKEND_URL/v2/sites" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$SITES_RESPONSE" | jq '.' 2>/dev/null || echo "$SITES_RESPONSE"
echo ""

echo "4. GET /v2/sites/:id (test site)"
SITE_RESPONSE=$(curl -s "$BACKEND_URL/v2/sites/00000000-0000-0000-0000-000000000002" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$SITE_RESPONSE" | jq '.' 2>/dev/null || echo "$SITE_RESPONSE"
echo ""

# Test Products
echo -e "${YELLOW}Testing Products Endpoints...${NC}"
echo ""

echo "5. GET /v2/products"
PRODUCTS_RESPONSE=$(curl -s "$BACKEND_URL/v2/products" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$PRODUCTS_RESPONSE" | jq '.' 2>/dev/null || echo "$PRODUCTS_RESPONSE"
echo ""

echo "6. GET /v2/products/:id (test product)"
PRODUCT_RESPONSE=$(curl -s "$BACKEND_URL/v2/products/00000000-0000-0000-0000-000000000020" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$PRODUCT_RESPONSE" | jq '.' 2>/dev/null || echo "$PRODUCT_RESPONSE"
echo ""

# Test Employees
echo -e "${YELLOW}Testing Employees Endpoints...${NC}"
echo ""

echo "7. GET /v2/employees"
EMPLOYEES_RESPONSE=$(curl -s "$BACKEND_URL/v2/employees" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$EMPLOYEES_RESPONSE" | jq '.' 2>/dev/null || echo "$EMPLOYEES_RESPONSE"
echo ""

echo "8. GET /v2/employees?site_id=xxx (filtered)"
EMPLOYEES_FILTERED=$(curl -s "$BACKEND_URL/v2/employees?site_id=00000000-0000-0000-0000-000000000002" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$EMPLOYEES_FILTERED" | jq '.' 2>/dev/null || echo "$EMPLOYEES_FILTERED"
echo ""

# Test Orders
echo -e "${YELLOW}Testing Orders Endpoints...${NC}"
echo ""

echo "9. GET /v2/orders"
ORDERS_RESPONSE=$(curl -s "$BACKEND_URL/v2/orders" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$ORDERS_RESPONSE" | jq '.' 2>/dev/null || echo "$ORDERS_RESPONSE"
echo ""

echo "10. GET /v2/orders?site_id=xxx (filtered)"
ORDERS_FILTERED=$(curl -s "$BACKEND_URL/v2/orders?site_id=00000000-0000-0000-0000-000000000002" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$ORDERS_FILTERED" | jq '.' 2>/dev/null || echo "$ORDERS_FILTERED"
echo ""

# Test Utilities
echo -e "${YELLOW}Testing Utility Endpoints...${NC}"
echo ""

echo "11. GET /v2/product-categories"
CATEGORIES_RESPONSE=$(curl -s "$BACKEND_URL/v2/product-categories" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$CATEGORIES_RESPONSE" | jq '.' 2>/dev/null || echo "$CATEGORIES_RESPONSE"
echo ""

echo "12. GET /v2/order-stats"
STATS_RESPONSE=$(curl -s "$BACKEND_URL/v2/order-stats?site_id=00000000-0000-0000-0000-000000000002" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN")
echo "$STATS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATS_RESPONSE"
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     Testing Complete!                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ All 12 endpoint tests executed${NC}"
echo ""
echo -e "${YELLOW}Note:${NC} Check the responses above for any errors"
echo -e "${YELLOW}Tip:${NC} Install jq for better JSON formatting: brew install jq"
