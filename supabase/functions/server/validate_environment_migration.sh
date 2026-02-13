#!/bin/bash
# Backend Environment-Awareness Validation Script

echo "🔍 Validating Environment-Aware Backend Implementation..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test 1: Check if kv_env.tsx exists
echo -n "Test 1: Environment-aware KV store exists... "
if [ -f "/supabase/functions/server/kv_env.tsx" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

# Test 2: Check if index.tsx imports kv_env
echo -n "Test 2: index.tsx imports kv_env... "
if grep -q "import \* as kv from \"./kv_env.tsx\"" /supabase/functions/server/index.tsx; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

# Test 3: Check if CORS includes X-Environment-ID
echo -n "Test 3: CORS allows X-Environment-ID header... "
if grep -q "X-Environment-ID" /supabase/functions/server/index.tsx; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

# Test 4: Check if verifyAdmin sets environmentId
echo -n "Test 4: verifyAdmin middleware sets environmentId... "
if grep -q "c.set('environmentId', environmentId)" /supabase/functions/server/index.tsx; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

# Test 5: Check if getSupabaseClient function exists
echo -n "Test 5: getSupabaseClient helper exists... "
if grep -q "function getSupabaseClient(environmentId" /supabase/functions/server/index.tsx; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

# Test 6: Count environment-aware KV calls
echo -n "Test 6: KV operations use environmentId... "
KV_WITH_ENV=$(grep -c "await kv\.\(get\|set\|del\|getByPrefix\|mget\|mset\|mdel\)([^)]*environmentId" /supabase/functions/server/index.tsx)
if [ "$KV_WITH_ENV" -gt 50 ]; then
    echo -e "${GREEN}✓ PASS${NC} ($KV_WITH_ENV environment-aware calls found)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Only $KV_WITH_ENV environment-aware calls found, expected 50+)"
    ((FAILED++))
fi

# Test 7: Check auth endpoints
echo -n "Test 7: Auth endpoints are environment-aware... "
SIGNUP_OK=$(grep -A5 "/auth/signup" /supabase/functions/server/index.tsx | grep -c "environmentId")
LOGIN_OK=$(grep -A5 "/auth/login" /supabase/functions/server/index.tsx | grep -c "environmentId")
if [ "$SIGNUP_OK" -gt 0 ] && [ "$LOGIN_OK" -gt 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

# Test 8: Check if production Supabase URL is defined
echo -n "Test 8: Production Supabase URL configured... "
if grep -q "PRODUCTION_SUPABASE_URL = 'https://lmffeqwhrnbsbhdztwyv.supabase.co'" /supabase/functions/server/index.tsx; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAILED" -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo "Backend is ready for multi-environment deployment."
    echo ""
    echo "Next steps:"
    echo "1. Set SUPABASE_SERVICE_ROLE_KEY_PROD in production Supabase"
    echo "2. Deploy to both development and production projects"
    echo "3. Update frontend to send X-Environment-ID header"
    exit 0
else
    echo ""
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo "Please review the failed tests above."
    exit 1
fi
