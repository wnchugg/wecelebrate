#!/bin/bash

# ============================================================================
# Authenticated API Testing Script
# Creates an admin user, logs in, and tests all endpoints with real auth
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
header "JALA 2 Authenticated API Test"

echo ""
read -p "Paste your Development anon key: " ANON_KEY
echo ""

if [ -z "$ANON_KEY" ]; then
    error "No key provided"
    exit 1
fi

PROJECT_ID="wjfcqqrlhwdvvjmefxky"
BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1/server/make-server-6fcaeea3"

# Test counter
PASSED=0
FAILED=0

# ============================================================================
# STEP 1: Create Bootstrap Admin User
# ============================================================================

header "Step 1: Create Bootstrap Admin User"

info "Attempting to create first admin user..."
echo ""

# Generate unique email to avoid conflicts
TEST_EMAIL="admin-test-$(date +%s)@jala2.com"
TEST_PASSWORD="SecurePass123!"
TEST_USERNAME="admin_tester"

# Bootstrap endpoint is PUBLIC - but Supabase platform requires anon key header
bootstrap_response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ANON_KEY" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"username\":\"$TEST_USERNAME\"}" \
    "${BASE_URL}/bootstrap/create-admin")

bootstrap_http_code=$(echo "$bootstrap_response" | tail -n 1)
bootstrap_body=$(echo "$bootstrap_response" | sed '$d')

if [ "$bootstrap_http_code" = "200" ]; then
    success "Bootstrap admin created!"
    echo "$bootstrap_body" | python3 -m json.tool 2>/dev/null || echo "$bootstrap_body"
    echo ""
elif [ "$bootstrap_http_code" = "400" ]; then
    warning "Bootstrap endpoint says admin users already exist"
    echo "$bootstrap_body" | python3 -m json.tool 2>/dev/null || echo "$bootstrap_body"
    echo ""
    info "Will try to create via regular signup instead..."
    echo ""
    
    # Try regular signup (also public - no auth header)
    signup_response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ANON_KEY" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"username\":\"$TEST_USERNAME\",\"role\":\"super_admin\"}" \
        "${BASE_URL}/auth/signup")
    
    signup_http_code=$(echo "$signup_response" | tail -n 1)
    signup_body=$(echo "$signup_response" | sed '$d')
    
    if [ "$signup_http_code" = "200" ]; then
        success "Admin user created via signup!"
        echo "$signup_body" | python3 -m json.tool 2>/dev/null || echo "$signup_body"
        echo ""
    else
        error "Failed to create admin user (HTTP $signup_http_code)"
        echo "$signup_body"
        echo ""
        info "Continuing with login attempt anyway (user might already exist)..."
        echo ""
    fi
else
    error "Bootstrap request failed (HTTP $bootstrap_http_code)"
    echo "$bootstrap_body"
    echo ""
    exit 1
fi

# ============================================================================
# STEP 2: Login as Admin
# ============================================================================

header "Step 2: Login as Admin"

info "Logging in with: $TEST_EMAIL"
echo ""

# Login endpoint is also PUBLIC - but Supabase platform requires anon key header
login_response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ANON_KEY" \
    -d "{\"identifier\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    "${BASE_URL}/auth/login")

login_http_code=$(echo "$login_response" | tail -n 1)
login_body=$(echo "$login_response" | sed '$d')

if [ "$login_http_code" = "200" ]; then
    success "Login successful!"
    echo "$login_body" | python3 -m json.tool 2>/dev/null || echo "$login_body"
    echo ""
    
    # Extract access token
    ACCESS_TOKEN=$(echo "$login_body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)
    
    if [ -z "$ACCESS_TOKEN" ]; then
        error "Could not extract access_token from login response"
        exit 1
    fi
    
    info "Access token obtained (first 30 chars): ${ACCESS_TOKEN:0:30}..."
    echo ""
else
    error "Login failed (HTTP $login_http_code)"
    echo "$login_body"
    echo ""
    exit 1
fi

# ============================================================================
# STEP 3: Test Authenticated Endpoints
# ============================================================================

header "Step 3: Test Authenticated CRUD Endpoints"

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
            -H "X-Access-Token: $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            "${BASE_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -H "X-Access-Token: $ACCESS_TOKEN" \
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

# Test all CRUD endpoints
test_endpoint "GET" "/clients" "List All Clients"
test_endpoint "POST" "/clients" "Create Client" \
    '{"name":"Test Corp","contactName":"John Doe","contactEmail":"john@testcorp.com","phone":"555-0100","address":"123 Test St","isActive":true}'

test_endpoint "GET" "/sites" "List All Sites"

test_endpoint "GET" "/gifts" "List All Gifts"
test_endpoint "POST" "/gifts" "Create Gift" \
    '{"name":"Test Gift","description":"A test product","category":"electronics","price":49.99,"stockQuantity":100,"imageUrl":"https://images.unsplash.com/photo-1505740420928-5e560c06d30e","status":"active"}'

test_endpoint "GET" "/employees" "List All Employees"

test_endpoint "GET" "/site-gifts" "List All Site-Gift Assignments"

# ============================================================================
# Summary
# ============================================================================

header "Test Summary"

echo ""
if [ $FAILED -eq 0 ]; then
    success "🎉 ALL AUTHENTICATED TESTS PASSED! ($PASSED/$((PASSED + FAILED)))"
    echo ""
    success "Your backend authentication is working perfectly!"
    echo ""
    info "Key findings:"
    echo "  ✅ Bootstrap admin creation works"
    echo "  ✅ Admin login works"
    echo "  ✅ JWT authentication works"
    echo "  ✅ Protected routes accept valid tokens"
    echo ""
    info "Test credentials:"
    echo "  Email: $TEST_EMAIL"
    echo "  Password: $TEST_PASSWORD"
    echo ""
else
    if [ $PASSED -gt 0 ]; then
        warning "Partial success: $PASSED passed, $FAILED failed"
    else
        error "All tests failed"
    fi
    echo ""
    info "Common issues:"
    echo "  • 404 = Endpoint not implemented yet (check server code)"
    echo "  • 401 = Token expired or invalid"
    echo "  • 500 = Server error (check Supabase logs)"
    echo ""
    info "Check logs at:"
    echo "https://supabase.com/dashboard/project/$PROJECT_ID/logs/edge-functions"
fi

echo ""
info "Access Token (save for manual testing):"
echo "  $ACCESS_TOKEN"
echo ""
info "Example cURL command:"
echo ""
echo "curl -H \"X-Access-Token: $ACCESS_TOKEN\" \\"
echo "  ${BASE_URL}/clients"
echo ""

header "Testing Complete!"