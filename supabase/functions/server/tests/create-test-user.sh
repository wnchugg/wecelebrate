#!/bin/bash

# Create Test User for Deno Dashboard API Tests
# This script creates a test admin user and retrieves an authenticated JWT token

set -e

# Configuration
BACKEND_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"
ENV_ID="development"
TEST_EMAIL="test-admin@wecelebrate.test"
TEST_PASSWORD="TestPassword123!"
TEST_USERNAME="testadmin"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Create Test User for Dashboard API Tests              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Create test user
echo -e "${YELLOW}Step 1: Creating test admin user...${NC}"
echo "Email: $TEST_EMAIL"
echo "Username: $TEST_USERNAME"
echo ""

SIGNUP_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: $ENV_ID" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"username\": \"$TEST_USERNAME\",
    \"role\": \"super_admin\"
  }")

echo "Response: $SIGNUP_RESPONSE"
echo ""

# Check if signup was successful or user already exists
if echo "$SIGNUP_RESPONSE" | grep -q '"user"'; then
  echo -e "${GREEN}✓ Test user created successfully${NC}"
elif echo "$SIGNUP_RESPONSE" | grep -q 'already been registered\|EMAIL_EXISTS'; then
  echo -e "${YELLOW}⚠ Test user already exists (this is fine)${NC}"
else
  echo -e "${RED}✗ Failed to create test user${NC}"
  echo "Response: $SIGNUP_RESPONSE"
  exit 1
fi

echo ""

# Step 2: Login to get JWT token
echo -e "${YELLOW}Step 2: Logging in to get JWT token...${NC}"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: $ENV_ID" \
  -d "{
    \"identifier\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract token from response
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Failed to get JWT token${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Successfully obtained JWT token${NC}"
echo ""

# Step 3: Test the token
echo -e "${YELLOW}Step 3: Testing token with health endpoint...${NC}"
echo ""

HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Environment-ID: $ENV_ID")

echo "Response: $HEALTH_RESPONSE"
echo ""

if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
  echo -e "${GREEN}✓ Token is valid and working${NC}"
else
  echo -e "${RED}✗ Token validation failed${NC}"
  exit 1
fi

echo ""

# Step 4: Save token to file
echo -e "${YELLOW}Step 4: Saving token to file...${NC}"
echo ""

TOKEN_FILE="$(dirname "$0")/.test-token"
echo "$TOKEN" > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"

echo -e "${GREEN}✓ Token saved to: $TOKEN_FILE${NC}"
echo ""

# Step 5: Create .env file for tests
echo -e "${YELLOW}Step 5: Creating .env file for tests...${NC}"
echo ""

ENV_FILE="$(dirname "$0")/.env"
cat > "$ENV_FILE" << EOF
# Test User Configuration
# Generated: $(date)

TEST_ADMIN_TOKEN=$TOKEN
TEST_ADMIN_EMAIL=$TEST_EMAIL
TEST_ADMIN_USERNAME=$TEST_USERNAME
SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
EOF

chmod 600 "$ENV_FILE"

echo -e "${GREEN}✓ Environment file created: $ENV_FILE${NC}"
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                        Setup Complete!                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Test User Credentials:${NC}"
echo "  Email:    $TEST_EMAIL"
echo "  Username: $TEST_USERNAME"
echo "  Password: $TEST_PASSWORD"
echo "  Role:     super_admin"
echo ""
echo -e "${GREEN}JWT Token:${NC}"
echo "  Saved to: $TOKEN_FILE"
echo "  Length:   ${#TOKEN} characters"
echo ""
echo -e "${GREEN}Environment File:${NC}"
echo "  Location: $ENV_FILE"
echo ""
echo -e "${YELLOW}To use the token in tests:${NC}"
echo "  export TEST_ADMIN_TOKEN=\"$TOKEN\""
echo ""
echo -e "${YELLOW}Or source the .env file:${NC}"
echo "  source $ENV_FILE"
echo ""
echo -e "${YELLOW}Run dashboard API tests:${NC}"
echo "  cd $(dirname "$0")"
echo "  source .env"
echo "  DENO_TLS_CA_STORE=system deno test --allow-net --allow-env --no-check dashboard_api.test.ts"
echo ""
echo -e "${GREEN}✓ Ready to run tests!${NC}"
