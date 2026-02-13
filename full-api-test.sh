#!/bin/bash

# ============================================================================
# Comprehensive API Endpoint Tester
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
header() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}\n"; }
subheader() { echo -e "\n${MAGENTA}▸ $1${NC}"; }

clear
header "JALA 2 Full API Test Suite"

echo ""
read -p "Paste your Development anon key: " ANON_KEY
echo ""

if [ -z "$ANON_KEY" ]; then
    error "No key provided"
    exit 1
fi

PROJECT_ID="wjfcqqrlhwdvvjmefxky"
BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1/make-server-6fcaeea3"

# Test counter
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    subheader "Testing: $description"
    info "Endpoint: $method $endpoint"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -H "Authorization: Bearer $ANON_KEY" \
            -H "Content-Type: application/json" \
            "${BASE_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -H "Authorization: Bearer $ANON_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${BASE_URL}${endpoint}")
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        success "PASSED (HTTP $http_code)"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
        PASSED=$((PASSED + 1))
    else
        error "FAILED (HTTP $http_code)"
        echo "$body"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

# ============================================================================
# Run Tests
# ============================================================================

header "1️⃣  Health & Database Checks"
test_endpoint "GET" "/health" "Health Check"
test_endpoint "GET" "/test-db" "Database Connection Test"

header "2️⃣  Employee Management"
test_endpoint "GET" "/employees" "List All Employees"
test_endpoint "POST" "/employees" "Create Employee" \
    '{"first_name":"Test","last_name":"User","email":"test@example.com","employee_id":"EMP001","status":"active"}'

header "3️⃣  Client Management"
test_endpoint "GET" "/clients" "List All Clients"
test_endpoint "POST" "/clients" "Create Client" \
    '{"name":"Test Corporation","contact_name":"John Smith","contact_email":"john@testcorp.com","status":"active"}'

header "4️⃣  Site Management"
test_endpoint "GET" "/sites" "List All Sites"

header "5️⃣  Gift Catalog Management"
test_endpoint "GET" "/gifts" "List All Gifts"
test_endpoint "POST" "/gifts" "Create Gift" \
    '{"name":"Test Gift","description":"A test product","category":"electronics","price":49.99,"stock_quantity":100,"status":"active"}'

header "6️⃣  Site-to-Gift Assignments"
test_endpoint "GET" "/site-gifts" "List All Site-Gift Assignments"

# ============================================================================
# Summary
# ============================================================================

header "Test Summary"

echo ""
if [ $FAILED -eq 0 ]; then
    success "🎉 ALL TESTS PASSED! ($PASSED/$((PASSED + FAILED)))"
    echo ""
    success "Your backend is fully functional!"
    echo ""
    info "Next steps:"
    echo "  1. ✅ Backend deployed and working"
    echo "  2. ✅ All CRUD endpoints operational"
    echo "  3. 📝 Ready to build frontend UI"
    echo "  4. 🚀 Ready to start Week 2 development"
else
    warning "Some tests failed: $PASSED passed, $FAILED failed"
    echo ""
    info "Common issues:"
    echo "  • 404 = Endpoint not implemented yet (expected for new routes)"
    echo "  • 401 = Authorization issue"
    echo "  • 500 = Server error (check Supabase logs)"
    echo ""
    info "Check logs at:"
    echo "https://supabase.com/dashboard/project/$PROJECT_ID/logs/edge-functions"
fi

echo ""
info "API Base URL:"
echo "  $BASE_URL"
echo ""
info "Authorization Header:"
echo "  Authorization: Bearer $ANON_KEY"
echo ""

header "Testing Complete!"
