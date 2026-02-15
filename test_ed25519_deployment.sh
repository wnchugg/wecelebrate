#!/bin/bash

# Ed25519 JWT Deployment Verification Script
# Tests that Ed25519 keys are loaded and working correctly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Ed25519 JWT Deployment Test${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Configuration
BASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"

# Test 1: Health Check
echo -e "${YELLOW}Test 1:${NC} Backend Health Check"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓${NC} Backend is running"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗${NC} Backend health check failed"
    echo "   Response: $HEALTH_RESPONSE"
    exit 1
fi

echo ""

# Test 2: Login Test (Generates JWT)
echo -e "${YELLOW}Test 3:${NC} Login Test (JWT Generation)"
echo "   Testing with admin credentials..."

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@example.com",
    "password": "Admin123!"
  }')

# Check if login was successful
if echo "$LOGIN_RESPONSE" | grep -q '"access_token"'; then
    echo -e "${GREEN}✓${NC} Login successful - JWT token generated"
    
    # Extract token
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token' 2>/dev/null)
    
    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        echo "   Token: ${TOKEN:0:50}..."
        
        # Decode JWT header to check algorithm
        HEADER=$(echo "$TOKEN" | cut -d'.' -f1)
        DECODED_HEADER=$(echo "$HEADER" | base64 -d 2>/dev/null || echo "$HEADER" | base64 -D 2>/dev/null)
        
        echo ""
        echo "   JWT Header:"
        echo "$DECODED_HEADER" | jq '.' 2>/dev/null || echo "   $DECODED_HEADER"
        
        # Check algorithm
        if echo "$DECODED_HEADER" | grep -q '"alg":"EdDSA"'; then
            echo ""
            echo -e "${GREEN}✓✓✓ SUCCESS! Token uses EdDSA (Ed25519)${NC}"
        elif echo "$DECODED_HEADER" | grep -q '"alg":"HS256"'; then
            echo ""
            echo -e "${YELLOW}⚠ Token uses HS256 (fallback mode)${NC}"
            echo "   This means Ed25519 keys may not be loaded correctly"
        else
            echo ""
            echo -e "${YELLOW}⚠ Unknown algorithm${NC}"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Could not extract token from response"
    fi
else
    echo -e "${RED}✗${NC} Login failed"
    echo "   Response: $LOGIN_RESPONSE"
fi

echo ""

# Test 3: Token Verification Test
if [ -n "$TOKEN" ]; then
    echo -e "${YELLOW}Test 4:${NC} Token Verification Test"
    echo "   Testing authenticated endpoint..."
    
    VERIFY_RESPONSE=$(curl -s "$BASE_URL/admin/users" \
      -H "X-Access-Token: $TOKEN")
    
    if echo "$VERIFY_RESPONSE" | grep -q '"code":401'; then
        echo -e "${RED}✗${NC} Token verification failed"
        echo "   Response: $VERIFY_RESPONSE"
    else
        echo -e "${GREEN}✓${NC} Token verification successful"
        echo "   Authenticated request worked"
    fi
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Test Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Summary
echo "Next Steps:"
echo ""
echo "1. Check Supabase Dashboard Logs:"
echo "   → Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/functions/make-server-6fcaeea3/logs"
echo "   → Look for: '✅ JWT Ed25519 private key loaded'"
echo "   → Look for: '✅ JWT Ed25519 public key loaded'"
echo ""
echo "2. Verify Token at jwt.io:"
echo "   → Copy the token from above"
echo "   → Paste at: https://jwt.io"
echo "   → Check header shows: \"alg\": \"EdDSA\""
echo ""
echo "3. If using HS256 fallback:"
echo "   → Verify JWT_PUBLIC_KEY is set in Supabase Dashboard"
echo "   → Verify JWT_PRIVATE_KEY is set in Supabase Dashboard"
echo "   → Redeploy: ./deploy-backend.sh dev"
echo ""
