#!/bin/bash

# ============================================
# JALA 2 - Complete API Route Testing Suite
# Tests all 55 migrated CRUD routes
# ============================================

# Configuration
API_BASE="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"
ENV_ID="development"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test results
declare -a FAILED_ROUTES

# Function to test a route
test_route() {
    local method=$1
    local endpoint=$2
    local auth=$3
    local data=$4
    local description=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}Testing:${NC} $method $endpoint"
    echo -e "${YELLOW}Description:${NC} $description"
    
    # Build curl command
    local curl_cmd="curl -s -w '\n%{http_code}' -X $method '$API_BASE$endpoint'"
    
    # Add headers
    curl_cmd="$curl_cmd -H 'X-Environment-Id: $ENV_ID'"
    curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
    
    if [ "$auth" = "admin" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer \$AUTH_TOKEN'"
    fi
    
    # Add data for POST/PUT
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    # Execute request
    local response=$(eval $curl_cmd)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    # Check result
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 400 ]; then
        echo -e "${GREEN}✅ PASSED${NC} - HTTP $http_code"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED${NC} - HTTP $http_code"
        echo -e "${RED}Response:${NC} $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        FAILED_ROUTES+=("$method $endpoint - HTTP $http_code")
    fi
    
    echo "---"
}

# Header
echo "============================================"
echo "  JALA 2 API - Complete Route Testing"
echo "  Environment: Development"
echo "  Base URL: $API_BASE"
echo "============================================"
echo ""

# Check for auth token
if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  WARNING: AUTH_TOKEN not set${NC}"
    echo "For admin routes, export your token:"
    echo "  export AUTH_TOKEN='your-token-here'"
    echo ""
    echo "Continuing with public routes only..."
    echo ""
fi

echo "============================================"
echo "  1. CLIENTS RESOURCE (7 routes)"
echo "============================================"
echo ""

test_route "GET" "/clients" "admin" "" "List all clients (paginated)"
test_route "GET" "/clients?page=1&pageSize=10" "admin" "" "List clients with pagination"
test_route "GET" "/clients?status=active" "admin" "" "List clients filtered by status"

# We'll test POST/PUT/DELETE if we have sample data
if [ -n "$AUTH_TOKEN" ]; then
    # Create a test client
    CLIENT_DATA='{"name":"Test Client","contactEmail":"test@example.com","status":"active"}'
    echo -e "${BLUE}Creating test client...${NC}"
    CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/clients" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "X-Environment-Id: $ENV_ID" \
        -H "Content-Type: application/json" \
        -d "$CLIENT_DATA")
    
    CLIENT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$CLIENT_ID" ]; then
        echo -e "${GREEN}✅ Created test client: $CLIENT_ID${NC}"
        test_route "GET" "/clients/$CLIENT_ID" "admin" "" "Get client by ID"
        test_route "GET" "/clients/$CLIENT_ID/sites" "admin" "" "Get client's sites"
        test_route "GET" "/clients/$CLIENT_ID/employees" "admin" "" "Get client's employees"
        
        # Update client
        UPDATE_DATA='{"name":"Test Client Updated","status":"active"}'
        test_route "PUT" "/clients/$CLIENT_ID" "admin" "$UPDATE_DATA" "Update client"
        
        # Don't delete yet - we'll use it for other tests
    fi
fi

echo ""
echo "============================================"
echo "  2. SITES RESOURCE (7 routes)"
echo "============================================"
echo ""

test_route "GET" "/sites" "admin" "" "List all sites (paginated)"
test_route "GET" "/sites?page=1&pageSize=10" "admin" "" "List sites with pagination"
test_route "GET" "/public/sites" "public" "" "Get active sites (public)"

if [ -n "$AUTH_TOKEN" ] && [ -n "$CLIENT_ID" ]; then
    # Create a test site
    SITE_DATA="{\"clientId\":\"$CLIENT_ID\",\"name\":\"Test Site\",\"startDate\":\"2026-01-01T00:00:00Z\",\"endDate\":\"2026-12-31T23:59:59Z\",\"status\":\"active\"}"
    echo -e "${BLUE}Creating test site...${NC}"
    CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/sites" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "X-Environment-Id: $ENV_ID" \
        -H "Content-Type: application/json" \
        -d "$SITE_DATA")
    
    SITE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$SITE_ID" ]; then
        echo -e "${GREEN}✅ Created test site: $SITE_ID${NC}"
        test_route "GET" "/sites/$SITE_ID" "admin" "" "Get site by ID"
        test_route "GET" "/public/sites/$SITE_ID" "public" "" "Get site by ID (public)"
        
        # Update site
        UPDATE_DATA='{"name":"Test Site Updated","status":"active"}'
        test_route "PUT" "/sites/$SITE_ID" "admin" "$UPDATE_DATA" "Update site"
    fi
fi

echo ""
echo "============================================"
echo "  3. GIFTS RESOURCE (6 routes)"
echo "============================================"
echo ""

test_route "GET" "/admin/gifts" "admin" "" "List all gifts (paginated)"
test_route "GET" "/admin/gifts?page=1&pageSize=10" "admin" "" "List gifts with pagination"
test_route "GET" "/admin/gifts?category=electronics&status=active" "admin" "" "List gifts with filters"

if [ -n "$AUTH_TOKEN" ]; then
    # Create a test gift
    GIFT_DATA='{"name":"Test Gift","description":"Test gift item","category":"test","price":99.99,"status":"active","inventoryTracking":true,"inventoryQuantity":100}'
    echo -e "${BLUE}Creating test gift...${NC}"
    CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/admin/gifts" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "X-Environment-Id: $ENV_ID" \
        -H "Content-Type: application/json" \
        -d "$GIFT_DATA")
    
    GIFT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$GIFT_ID" ]; then
        echo -e "${GREEN}✅ Created test gift: $GIFT_ID${NC}"
        test_route "GET" "/admin/gifts/$GIFT_ID" "admin" "" "Get gift by ID"
        
        # Update gift
        UPDATE_DATA='{"name":"Test Gift Updated","price":149.99,"status":"active"}'
        test_route "PUT" "/admin/gifts/$GIFT_ID" "admin" "$UPDATE_DATA" "Update gift"
    fi
fi

if [ -n "$SITE_ID" ]; then
    test_route "GET" "/public/sites/$SITE_ID/gifts" "public" "" "Get gifts for site (public)"
fi

echo ""
echo "============================================"
echo "  4. ORDERS RESOURCE (6 routes)"
echo "============================================"
echo ""

test_route "GET" "/orders" "admin" "" "List all orders (paginated)"
test_route "GET" "/orders?page=1&pageSize=10" "admin" "" "List orders with pagination"

if [ -n "$SITE_ID" ]; then
    test_route "GET" "/orders?siteId=$SITE_ID&status=pending" "admin" "" "List orders with filters"
fi

if [ -n "$SITE_ID" ] && [ -n "$GIFT_ID" ]; then
    # Create a test order (public)
    ORDER_DATA="{\"siteId\":\"$SITE_ID\",\"employeeEmail\":\"test@example.com\",\"giftId\":\"$GIFT_ID\",\"shippingAddress\":{\"addressLine1\":\"123 Test St\",\"city\":\"TestCity\",\"state\":\"TS\",\"postalCode\":\"12345\",\"country\":\"USA\"}}"
    test_route "POST" "/public/orders" "public" "$ORDER_DATA" "Create order (public)"
    
    # Get the order we just created
    if [ -n "$AUTH_TOKEN" ]; then
        ORDERS_RESPONSE=$(curl -s -X GET "$API_BASE/orders?siteId=$SITE_ID" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "X-Environment-Id: $ENV_ID")
        
        ORDER_ID=$(echo "$ORDERS_RESPONSE" | grep -o '"id":"ORD-[^"]*"' | head -1 | cut -d'"' -f4)
        
        if [ -n "$ORDER_ID" ]; then
            echo -e "${GREEN}✅ Created test order: $ORDER_ID${NC}"
            test_route "GET" "/orders/$ORDER_ID" "admin" "" "Get order by ID"
            
            # Update order
            UPDATE_DATA='{"status":"confirmed"}'
            test_route "PUT" "/orders/$ORDER_ID" "admin" "$UPDATE_DATA" "Update order status"
        fi
    fi
fi

echo ""
echo "============================================"
echo "  5. EMPLOYEES RESOURCE (5 routes)"
echo "============================================"
echo ""

test_route "GET" "/employees" "admin" "" "List all employees (paginated)"
test_route "GET" "/employees?page=1&pageSize=10" "admin" "" "List employees with pagination"

if [ -n "$AUTH_TOKEN" ] && [ -n "$CLIENT_ID" ]; then
    # Create a test employee
    EMP_DATA="{\"clientId\":\"$CLIENT_ID\",\"email\":\"employee@test.com\",\"firstName\":\"Test\",\"lastName\":\"Employee\",\"status\":\"active\"}"
    echo -e "${BLUE}Creating test employee...${NC}"
    CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/employees" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "X-Environment-Id: $ENV_ID" \
        -H "Content-Type: application/json" \
        -d "$EMP_DATA")
    
    EMP_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$EMP_ID" ]; then
        echo -e "${GREEN}✅ Created test employee: $EMP_ID${NC}"
        test_route "GET" "/employees/$EMP_ID" "admin" "" "Get employee by ID"
        
        # Update employee
        UPDATE_DATA='{"firstName":"Updated","lastName":"Employee","status":"active"}'
        test_route "PUT" "/employees/$EMP_ID" "admin" "$UPDATE_DATA" "Update employee"
    fi
fi

echo ""
echo "============================================"
echo "  6. ADMIN USERS RESOURCE (5 routes)"
echo "============================================"
echo ""

test_route "GET" "/admin/users" "admin" "" "List all admin users (paginated)"
test_route "GET" "/admin/users?page=1&pageSize=10" "admin" "" "List admin users with pagination"

if [ -n "$AUTH_TOKEN" ]; then
    # Create a test admin user
    ADMIN_DATA='{"email":"admin@test.com","firstName":"Test","lastName":"Admin","role":"admin","status":"active"}'
    echo -e "${BLUE}Creating test admin user...${NC}"
    CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/admin/users" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "X-Environment-Id: $ENV_ID" \
        -H "Content-Type: application/json" \
        -d "$ADMIN_DATA")
    
    ADMIN_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$ADMIN_ID" ]; then
        echo -e "${GREEN}✅ Created test admin user: $ADMIN_ID${NC}"
        test_route "GET" "/admin/users/$ADMIN_ID" "admin" "" "Get admin user by ID"
        
        # Update admin user
        UPDATE_DATA='{"firstName":"Updated","lastName":"Admin","status":"active"}'
        test_route "PUT" "/admin/users/$ADMIN_ID" "admin" "$UPDATE_DATA" "Update admin user"
    fi
fi

echo ""
echo "============================================"
echo "  7. ROLES RESOURCE (5 routes)"
echo "============================================"
echo ""

test_route "GET" "/roles" "admin" "" "List all roles (paginated)"
test_route "GET" "/roles?page=1&pageSize=10" "admin" "" "List roles with pagination"

if [ -n "$AUTH_TOKEN" ]; then
    # Create a test role
    ROLE_DATA='{"name":"Test Role","description":"Test role for testing","permissions":["read","write"],"status":"active"}'
    echo -e "${BLUE}Creating test role...${NC}"
    CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/roles" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "X-Environment-Id: $ENV_ID" \
        -H "Content-Type: application/json" \
        -d "$ROLE_DATA")
    
    ROLE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$ROLE_ID" ]; then
        echo -e "${GREEN}✅ Created test role: $ROLE_ID${NC}"
        test_route "GET" "/roles/$ROLE_ID" "admin" "" "Get role by ID"
        
        # Update role
        UPDATE_DATA='{"name":"Test Role Updated","status":"active"}'
        test_route "PUT" "/roles/$ROLE_ID" "admin" "$UPDATE_DATA" "Update role"
    fi
fi

echo ""
echo "============================================"
echo "  8. ACCESS GROUPS RESOURCE (5 routes)"
echo "============================================"
echo ""

test_route "GET" "/access-groups" "admin" "" "List all access groups (paginated)"
test_route "GET" "/access-groups?page=1&pageSize=10" "admin" "" "List access groups with pagination"

if [ -n "$AUTH_TOKEN" ]; then
    # Create a test access group
    GROUP_DATA='{"name":"Test Access Group","description":"Test group for testing","permissions":["read","write"],"status":"active"}'
    echo -e "${BLUE}Creating test access group...${NC}"
    CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/access-groups" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "X-Environment-Id: $ENV_ID" \
        -H "Content-Type: application/json" \
        -d "$GROUP_DATA")
    
    GROUP_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$GROUP_ID" ]; then
        echo -e "${GREEN}✅ Created test access group: $GROUP_ID${NC}"
        test_route "GET" "/access-groups/$GROUP_ID" "admin" "" "Get access group by ID"
        
        # Update access group
        UPDATE_DATA='{"name":"Test Access Group Updated","status":"active"}'
        test_route "PUT" "/access-groups/$GROUP_ID" "admin" "$UPDATE_DATA" "Update access group"
    fi
fi

echo ""
echo "============================================"
echo "  9. CELEBRATIONS RESOURCE (5 routes)"
echo "============================================"
echo ""

test_route "GET" "/celebrations" "admin" "" "List all celebrations (paginated)"
test_route "GET" "/celebrations?page=1&pageSize=10" "admin" "" "List celebrations with pagination"

if [ -n "$AUTH_TOKEN" ] && [ -n "$CLIENT_ID" ]; then
    # Create a test celebration
    CELEB_DATA="{\"clientId\":\"$CLIENT_ID\",\"type\":\"birthday\",\"date\":\"2026-06-15T00:00:00Z\",\"title\":\"Test Birthday\",\"status\":\"active\"}"
    echo -e "${BLUE}Creating test celebration...${NC}"
    CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/celebrations" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "X-Environment-Id: $ENV_ID" \
        -H "Content-Type: application/json" \
        -d "$CELEB_DATA")
    
    CELEB_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$CELEB_ID" ]; then
        echo -e "${GREEN}✅ Created test celebration: $CELEB_ID${NC}"
        test_route "GET" "/celebrations/$CELEB_ID" "admin" "" "Get celebration by ID"
        
        # Update celebration
        UPDATE_DATA='{"title":"Test Birthday Updated","status":"active"}'
        test_route "PUT" "/celebrations/$CELEB_ID" "admin" "$UPDATE_DATA" "Update celebration"
    fi
fi

echo ""
echo "============================================"
echo "  10. EMAIL TEMPLATES RESOURCE (5 routes)"
echo "============================================"
echo ""

test_route "GET" "/email-templates" "admin" "" "List all email templates (paginated)"
test_route "GET" "/email-templates?page=1&pageSize=10" "admin" "" "List email templates with pagination"

if [ -n "$AUTH_TOKEN" ]; then
    # Create a test email template
    TEMPLATE_DATA='{"name":"Test Template","subject":"Test Email","body":"This is a test email template.","templateType":"test","language":"en","status":"active"}'
    echo -e "${BLUE}Creating test email template...${NC}"
    CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/email-templates" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "X-Environment-Id: $ENV_ID" \
        -H "Content-Type: application/json" \
        -d "$TEMPLATE_DATA")
    
    TEMPLATE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$TEMPLATE_ID" ]; then
        echo -e "${GREEN}✅ Created test email template: $TEMPLATE_ID${NC}"
        test_route "GET" "/email-templates/$TEMPLATE_ID" "admin" "" "Get email template by ID"
        
        # Update email template
        UPDATE_DATA='{"name":"Test Template Updated","subject":"Test Email Updated","body":"Updated email body","status":"active"}'
        test_route "PUT" "/email-templates/$TEMPLATE_ID" "admin" "$UPDATE_DATA" "Update email template"
    fi
fi

echo ""
echo "============================================"
echo "  CLEANUP - DELETE TEST DATA"
echo "============================================"
echo ""

# Clean up test data (if IDs were created)
if [ -n "$AUTH_TOKEN" ]; then
    [ -n "$TEMPLATE_ID" ] && test_route "DELETE" "/email-templates/$TEMPLATE_ID" "admin" "" "Delete test email template"
    [ -n "$CELEB_ID" ] && test_route "DELETE" "/celebrations/$CELEB_ID" "admin" "" "Delete test celebration"
    [ -n "$GROUP_ID" ] && test_route "DELETE" "/access-groups/$GROUP_ID" "admin" "" "Delete test access group"
    [ -n "$ROLE_ID" ] && test_route "DELETE" "/roles/$ROLE_ID" "admin" "" "Delete test role"
    [ -n "$ADMIN_ID" ] && test_route "DELETE" "/admin/users/$ADMIN_ID" "admin" "" "Delete test admin user"
    [ -n "$EMP_ID" ] && test_route "DELETE" "/employees/$EMP_ID" "admin" "" "Delete test employee"
    [ -n "$ORDER_ID" ] && test_route "DELETE" "/orders/$ORDER_ID" "admin" "" "Delete test order (soft)"
    [ -n "$GIFT_ID" ] && test_route "DELETE" "/admin/gifts/$GIFT_ID" "admin" "" "Delete test gift (soft)"
    [ -n "$SITE_ID" ] && test_route "DELETE" "/sites/$SITE_ID" "admin" "" "Delete test site"
    [ -n "$CLIENT_ID" ] && test_route "DELETE" "/clients/$CLIENT_ID" "admin" "" "Delete test client"
fi

echo ""
echo "============================================"
echo "  TEST SUMMARY"
echo "============================================"
echo ""
echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ ALL TESTS PASSED! 🎉${NC}"
else
    echo ""
    echo -e "${RED}❌ FAILED ROUTES:${NC}"
    for route in "${FAILED_ROUTES[@]}"; do
        echo -e "  ${RED}•${NC} $route"
    done
fi

echo ""
echo "============================================"
