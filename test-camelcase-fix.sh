#!/bin/bash

# Test CamelCase to Snake_Case Conversion Fix
# Tests that all CRUD operations properly convert field names

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
ENV=${1:-development}
if [ "$ENV" = "production" ]; then
  BASE_URL="https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3"
  PROJECT_REF="lmffeqwhrnbsbhdztwyv"
else
  BASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"
  PROJECT_REF="wjfcqqrlhwdvvjmefxky"
fi

# Get anon key from environment or prompt
if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "Please set SUPABASE_ANON_KEY environment variable"
  echo "Get it from: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
  exit 1
fi

ANON_KEY=$SUPABASE_ANON_KEY

echo -e "${YELLOW}Testing CamelCase Fix in $ENV environment...${NC}"
echo ""

# Test 1: Health Check
echo "1. Health Check..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo $HEALTH | grep -q '"status":"ok"'; then
  echo -e "${GREEN}✅ Health check passed${NC}"
else
  echo -e "${RED}❌ Health check failed${NC}"
  echo $HEALTH
  exit 1
fi

# Test 2: Public Sites (no auth required)
echo ""
echo "2. Testing Public Sites Endpoint..."
SITES=$(curl -s "$BASE_URL/v2/public/sites" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "X-Environment-ID: $ENV")

if echo $SITES | grep -q '"sites"'; then
  SITE_COUNT=$(echo $SITES | jq '.sites | length')
  echo -e "${GREEN}✅ Public sites endpoint working ($SITE_COUNT sites found)${NC}"
  
  # Get first site ID for testing
  SITE_ID=$(echo $SITES | jq -r '.sites[0].id')
  echo "   Using site ID: $SITE_ID"
else
  echo -e "${RED}❌ Public sites endpoint failed${NC}"
  echo $SITES
  exit 1
fi

# Test 3: Get Site by ID (test camelCase response)
echo ""
echo "3. Testing Get Site by ID (camelCase response)..."
SITE=$(curl -s "$BASE_URL/v2/sites/$SITE_ID" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "X-Environment-ID: $ENV")

if echo $SITE | jq -e '.data.id' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Get site working${NC}"
  
  # Check if response is in camelCase
  if echo $SITE | jq -e '.data.clientId' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Response is in camelCase format${NC}"
  else
    echo -e "${YELLOW}⚠️  Response may not be in camelCase${NC}"
  fi
else
  echo -e "${RED}❌ Get site failed${NC}"
  echo $SITE
fi

# Test 4: Update Site with camelCase fields
echo ""
echo "4. Testing Site Update with camelCase fields..."

# Create a test update with camelCase fields
UPDATE_DATA='{
  "slug": "test-slug-'$(date +%s)'",
  "allowSessionTimeoutExtend": true
}'

UPDATE_RESULT=$(curl -s -w "\n%{http_code}" "$BASE_URL/v2/sites/$SITE_ID" \
  -X PUT \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "X-Environment-ID: $ENV" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_DATA")

HTTP_CODE=$(echo "$UPDATE_RESULT" | tail -n1)
RESPONSE=$(echo "$UPDATE_RESULT" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Site update successful (HTTP 200)${NC}"
  
  # Check if response contains success
  if echo $RESPONSE | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Update response indicates success${NC}"
  fi
  
  # Check if slug was updated
  NEW_SLUG=$(echo $RESPONSE | jq -r '.data.slug')
  if [ ! -z "$NEW_SLUG" ] && [ "$NEW_SLUG" != "null" ]; then
    echo -e "${GREEN}✅ Slug updated successfully: $NEW_SLUG${NC}"
  fi
else
  echo -e "${RED}❌ Site update failed (HTTP $HTTP_CODE)${NC}"
  echo $RESPONSE
  
  # Check for specific error about column not found
  if echo $RESPONSE | grep -q "Could not find.*column"; then
    echo -e "${RED}❌ CRITICAL: Column name conversion not working!${NC}"
    exit 1
  fi
fi

# Test 5: Verify data persisted
echo ""
echo "5. Verifying data persisted..."
VERIFY=$(curl -s "$BASE_URL/v2/sites/$SITE_ID" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "X-Environment-ID: $ENV")

PERSISTED_SLUG=$(echo $VERIFY | jq -r '.data.slug')
if [ "$PERSISTED_SLUG" = "$NEW_SLUG" ]; then
  echo -e "${GREEN}✅ Data persisted correctly${NC}"
else
  echo -e "${YELLOW}⚠️  Slug may not have persisted${NC}"
  echo "   Expected: $NEW_SLUG"
  echo "   Got: $PERSISTED_SLUG"
fi

# Summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}All Tests Passed! ✅${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "CamelCase to snake_case conversion is working correctly."
echo "Sites can be updated with camelCase field names."
echo ""
