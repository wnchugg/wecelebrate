#!/bin/bash

# Backend Health Diagnostic Script
# Run this to check the health of all backend services

echo "======================================"
echo "🔍 WeCelebrate Backend Health Check"
echo "======================================"
echo ""

# Get Supabase URL from environment or use default
SUPABASE_URL=${SUPABASE_URL:-"https://wjfcqqrlhwdvvjmefxky.supabase.co"}
PROJECT_ID=$(echo $SUPABASE_URL | sed -E 's|https://([^.]+).*|\1|')

echo "📦 Project ID: $PROJECT_ID"
echo "🌐 Supabase URL: $SUPABASE_URL"
echo ""

# Function to check endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo "✅ OK (HTTP $status_code)"
        return 0
    else
        echo "❌ FAIL (HTTP $status_code)"
        echo "   Response: ${body:0:100}"
        return 1
    fi
}

# Check health endpoint
echo "1️⃣ Checking server health endpoint..."
check_endpoint "Health Check" "$SUPABASE_URL/functions/v1/make-server-6fcaeea3/health"
echo ""

# Check database test endpoint
echo "2️⃣ Checking database connectivity..."
check_endpoint "Database Test" "$SUPABASE_URL/functions/v1/make-server-6fcaeea3/test-db"
echo ""

# Check JWT configuration
echo "3️⃣ Checking JWT configuration..."
check_endpoint "JWT Config" "$SUPABASE_URL/functions/v1/make-server-6fcaeea3/debug-jwt-config"
echo ""

# Check backend configuration
echo "4️⃣ Checking backend configuration..."
check_endpoint "Backend Config" "$SUPABASE_URL/functions/v1/make-server-6fcaeea3/debug/backend-config"
echo ""

# Summary
echo "======================================"
echo "📊 Health Check Summary"
echo "======================================"
echo ""
echo "If all checks passed (✅), your backend is healthy!"
echo "If any checks failed (❌), review the errors above."
echo ""
echo "Common issues:"
echo "  • 502/504 errors: Services still starting up (wait 2-5 minutes)"
echo "  • 401 errors: Authentication/JWT configuration issue"
echo "  • 500 errors: Check Edge Function logs in Supabase Dashboard"
echo "  • Connection timeout: Check firewall/network settings"
echo ""
echo "For detailed logs, check Supabase Dashboard → Edge Functions → Logs"
echo ""
