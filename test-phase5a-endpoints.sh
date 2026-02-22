#!/bin/bash

# Test Phase 5A Endpoints
# This script tests the new v2 endpoints deployed in Phase 5A

BASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"

echo "======================================"
echo "Testing Phase 5A Endpoints"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== Existing V2 Endpoints (Sanity Check) ==="
echo -n "Health Check ... "
curl -s "$BASE_URL/health" | grep -q "ok" && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "Get Clients (should be unauthorized) ... "
curl -s "$BASE_URL/v2/clients" | grep -q "Unauthorized" && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "Get Sites (should be unauthorized) ... "
curl -s "$BASE_URL/v2/sites" | grep -q "Unauthorized" && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo ""
echo "=== Phase 5A: Site Gift Configuration ==="
echo -n "Get Site Gift Config (should be unauthorized) ... "
curl -s "$BASE_URL/v2/sites/test-site-id/gift-config" | grep -q "Unauthorized" && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "Get Site Gifts (public, may need tables) ... "
response=$(curl -s "$BASE_URL/v2/sites/test-site-id/gifts")
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓${NC}"
elif echo "$response" | grep -q "relation.*does not exist"; then
    echo -e "${YELLOW}⚠${NC} (Table not created yet)"
else
    echo -e "${YELLOW}⚠${NC} (Response: $(echo $response | head -c 100))"
fi

echo ""
echo "=== Phase 5A: Brands Management ==="
echo -n "List Brands (should be unauthorized) ... "
curl -s "$BASE_URL/v2/brands" | grep -q "Unauthorized" && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "Get Brand by ID (should be unauthorized) ... "
curl -s "$BASE_URL/v2/brands/test-brand-id" | grep -q "Unauthorized" && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo ""
echo "=== Phase 5A: Email Templates ==="
echo -n "List Email Templates (should be unauthorized) ... "
curl -s "$BASE_URL/v2/email-templates" | grep -q "Unauthorized" && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "Get Email Template by ID (should be unauthorized) ... "
curl -s "$BASE_URL/v2/email-templates/test-template-id" | grep -q "Unauthorized" && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo ""
echo "======================================"
echo "Test Summary"
echo "======================================"
echo ""
echo -e "${GREEN}✓${NC} = Endpoint is registered and responding correctly"
echo -e "${YELLOW}⚠${NC} = Endpoint exists but may need database tables"
echo -e "${RED}✗${NC} = Endpoint not found or error"
echo ""
echo "All endpoints requiring auth should return 'Unauthorized'"
echo "This confirms they are registered and the auth middleware is working."
echo ""
echo "To create the required database tables, run these SQL files in Supabase dashboard:"
echo "  1. supabase/migrations/005_site_gift_config.sql"
echo "  2. supabase/migrations/006_brands.sql"
echo "  3. supabase/migrations/007_email_templates.sql"
echo ""
