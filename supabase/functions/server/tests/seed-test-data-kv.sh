#!/bin/bash

# Seed Test Data Using Backend Endpoint
# This script calls the backend reseed endpoint which will populate test data

set -e

# Configuration
BACKEND_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"
ENV_ID="development"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load token from .env
if [ -f .env ]; then
  source .env
else
  echo -e "${RED}❌ .env file not found${NC}"
  echo "Run: ./create-test-user.sh first"
  exit 1
fi

if [ -z "$TEST_ADMIN_TOKEN" ]; then
  echo -e "${RED}❌ TEST_ADMIN_TOKEN not set in .env${NC}"
  echo "Run: ./create-test-user.sh first"
  exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Seed Test Data for Dashboard Tests               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Reseed the database
echo -e "${YELLOW}Step 1: Reseeding database with sample data...${NC}"
echo ""

RESEED_RESPONSE=$(curl -s -X POST "$BACKEND_URL/dev/reseed" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN" \
  -H "X-Environment-ID: $ENV_ID" \
  -H "Content-Type: application/json")

echo "Response: $RESEED_RESPONSE"
echo ""

if echo "$RESEED_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Database reseeded successfully${NC}"
else
  echo -e "${RED}✗ Failed to reseed database${NC}"
  exit 1
fi

echo ""

# Step 2: Verify data was created
echo -e "${YELLOW}Step 2: Verifying test data...${NC}"
echo ""

# Check clients
echo "Checking clients..."
CLIENTS_RESPONSE=$(curl -s "$BACKEND_URL/clients" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN" \
  -H "X-Environment-ID: $ENV_ID")

CLIENT_COUNT=$(echo "$CLIENTS_RESPONSE" | grep -o '"id"' | wc -l | tr -d ' ')
echo "  Found $CLIENT_COUNT clients"

# Check sites
echo "Checking sites..."
SITES_RESPONSE=$(curl -s "$BACKEND_URL/sites" \
  -H "X-Access-Token: $TEST_ADMIN_TOKEN" \
  -H "X-Environment-ID: $ENV_ID")

SITE_COUNT=$(echo "$SITES_RESPONSE" | grep -o '"id"' | wc -l | tr -d ' ')
echo "  Found $SITE_COUNT sites"

echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     Seeding Complete!                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Database Status:${NC}"
echo "  Clients: $CLIENT_COUNT"
echo "  Sites: $SITE_COUNT"
echo ""
echo -e "${YELLOW}Note:${NC} The reseed endpoint creates sample data including:"
echo "  - 4 clients"
echo "  - 7 sites"
echo "  - Gift catalog"
echo "  - Site configurations"
echo ""
echo -e "${YELLOW}To run dashboard API tests:${NC}"
echo "  cd $(dirname "$0")"
echo "  source .env"
echo "  DENO_TLS_CA_STORE=system deno test --allow-net --allow-env --no-check dashboard_api.test.ts"
echo ""
echo -e "${GREEN}✓ Ready to run tests!${NC}"
