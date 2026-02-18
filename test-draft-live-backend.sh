#!/bin/bash

# Draft/Live Backend Test Script
# This script tests the new draft/live endpoints

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"

echo "========================================="
echo "Draft/Live Backend Test Script"
echo "========================================="
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed${NC}"
    echo "Install with: brew install jq"
    exit 1
fi

# Get site ID and auth token
echo "Please provide the following information:"
echo ""
read -p "Site ID (UUID): " SITE_ID
read -p "Auth Token: " AUTH_TOKEN

if [ -z "$SITE_ID" ] || [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}Error: Site ID and Auth Token are required${NC}"
    exit 1
fi

echo ""
echo "Testing with Site ID: $SITE_ID"
echo "========================================="
echo ""

# Test 1: Get site with draft
echo -e "${YELLOW}Test 1: Get site with draft${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/v2/sites/$SITE_ID/with-draft" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
HAS_CHANGES=$(echo $RESPONSE | jq -r '.data._hasUnpublishedChanges')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "  Has unpublished changes: $HAS_CHANGES"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "  Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 2: Get live site data
echo -e "${YELLOW}Test 2: Get live site data${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/v2/sites/$SITE_ID/live" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
LIVE_CURRENCY=$(echo $RESPONSE | jq -r '.data.settings.defaultCurrency')
LIVE_GIFTS=$(echo $RESPONSE | jq -r '.data.settings.giftsPerUser')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "  Live Currency: $LIVE_CURRENCY"
    echo "  Live Gifts Per User: $LIVE_GIFTS"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "  Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 3: Save draft changes
echo -e "${YELLOW}Test 3: Save draft changes${NC}"
RESPONSE=$(curl -s -X PATCH "$BASE_URL/v2/sites/$SITE_ID/draft" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "defaultCurrency": "EUR",
      "giftsPerUser": 3,
      "showPricing": false
    }
  }')

SUCCESS=$(echo $RESPONSE | jq -r '.success')
DRAFT_CURRENCY=$(echo $RESPONSE | jq -r '.data.settings.defaultCurrency')
DRAFT_GIFTS=$(echo $RESPONSE | jq -r '.data.settings.giftsPerUser')
HAS_CHANGES=$(echo $RESPONSE | jq -r '.data._hasUnpublishedChanges')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "  Draft Currency: $DRAFT_CURRENCY"
    echo "  Draft Gifts Per User: $DRAFT_GIFTS"
    echo "  Has unpublished changes: $HAS_CHANGES"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "  Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 4: Verify live data unchanged
echo -e "${YELLOW}Test 4: Verify live data unchanged${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/v2/sites/$SITE_ID/live" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
CURRENT_LIVE_CURRENCY=$(echo $RESPONSE | jq -r '.data.settings.defaultCurrency')
CURRENT_LIVE_GIFTS=$(echo $RESPONSE | jq -r '.data.settings.giftsPerUser')

if [ "$SUCCESS" = "true" ] && [ "$CURRENT_LIVE_CURRENCY" = "$LIVE_CURRENCY" ]; then
    echo -e "${GREEN}✓ Success - Live data unchanged${NC}"
    echo "  Live Currency: $CURRENT_LIVE_CURRENCY (unchanged)"
    echo "  Live Gifts Per User: $CURRENT_LIVE_GIFTS (unchanged)"
else
    echo -e "${RED}✗ Failed - Live data changed unexpectedly${NC}"
    echo "  Expected: $LIVE_CURRENCY, Got: $CURRENT_LIVE_CURRENCY"
    exit 1
fi
echo ""

# Test 5: Get site with draft (should show draft values)
echo -e "${YELLOW}Test 5: Get site with draft (should show draft values)${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/v2/sites/$SITE_ID/with-draft" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
WITH_DRAFT_CURRENCY=$(echo $RESPONSE | jq -r '.data.settings.defaultCurrency')
WITH_DRAFT_GIFTS=$(echo $RESPONSE | jq -r '.data.settings.giftsPerUser')

if [ "$SUCCESS" = "true" ] && [ "$WITH_DRAFT_CURRENCY" = "EUR" ]; then
    echo -e "${GREEN}✓ Success - Draft values shown${NC}"
    echo "  Currency with draft: $WITH_DRAFT_CURRENCY"
    echo "  Gifts with draft: $WITH_DRAFT_GIFTS"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "  Expected EUR, Got: $WITH_DRAFT_CURRENCY"
    exit 1
fi
echo ""

# Test 6: Publish draft to live
echo -e "${YELLOW}Test 6: Publish draft to live${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/v2/sites/$SITE_ID/publish" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
MESSAGE=$(echo $RESPONSE | jq -r '.message')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "  Message: $MESSAGE"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "  Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 7: Verify live data updated
echo -e "${YELLOW}Test 7: Verify live data updated${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/v2/sites/$SITE_ID/live" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
PUBLISHED_CURRENCY=$(echo $RESPONSE | jq -r '.data.settings.defaultCurrency')
PUBLISHED_GIFTS=$(echo $RESPONSE | jq -r '.data.settings.giftsPerUser')

if [ "$SUCCESS" = "true" ] && [ "$PUBLISHED_CURRENCY" = "EUR" ]; then
    echo -e "${GREEN}✓ Success - Live data updated${NC}"
    echo "  Live Currency: $PUBLISHED_CURRENCY (updated)"
    echo "  Live Gifts Per User: $PUBLISHED_GIFTS (updated)"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "  Expected EUR, Got: $PUBLISHED_CURRENCY"
    exit 1
fi
echo ""

# Test 8: Save another draft
echo -e "${YELLOW}Test 8: Save another draft${NC}"
RESPONSE=$(curl -s -X PATCH "$BASE_URL/v2/sites/$SITE_ID/draft" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "defaultCurrency": "GBP",
      "giftsPerUser": 5
    }
  }')

SUCCESS=$(echo $RESPONSE | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✓ Success${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "  Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 9: Discard draft
echo -e "${YELLOW}Test 9: Discard draft${NC}"
RESPONSE=$(curl -s -X DELETE "$BASE_URL/v2/sites/$SITE_ID/draft" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
MESSAGE=$(echo $RESPONSE | jq -r '.message')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "  Message: $MESSAGE"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "  Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 10: Verify draft discarded
echo -e "${YELLOW}Test 10: Verify draft discarded${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/v2/sites/$SITE_ID/with-draft" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

SUCCESS=$(echo $RESPONSE | jq -r '.success')
FINAL_CURRENCY=$(echo $RESPONSE | jq -r '.data.settings.defaultCurrency')
HAS_CHANGES=$(echo $RESPONSE | jq -r '.data._hasUnpublishedChanges')

if [ "$SUCCESS" = "true" ] && [ "$FINAL_CURRENCY" = "EUR" ] && [ "$HAS_CHANGES" = "false" ]; then
    echo -e "${GREEN}✓ Success - Draft discarded${NC}"
    echo "  Currency: $FINAL_CURRENCY (back to live value)"
    echo "  Has unpublished changes: $HAS_CHANGES"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "  Expected EUR with no changes, Got: $FINAL_CURRENCY with changes: $HAS_CHANGES"
    exit 1
fi
echo ""

echo "========================================="
echo -e "${GREEN}All tests passed! ✓${NC}"
echo "========================================="
echo ""
echo "Summary:"
echo "  ✓ Draft/live separation working"
echo "  ✓ Draft changes stored separately"
echo "  ✓ Live data unchanged until publish"
echo "  ✓ Publish merges draft to live"
echo "  ✓ Discard removes draft changes"
echo ""
echo "Backend is ready for frontend integration!"
