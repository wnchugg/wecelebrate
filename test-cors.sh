#!/bin/bash

echo "🧪 Testing CORS Configuration"
echo "=============================="
echo ""

# Test URLs
DEV_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health"
PROD_URL="https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health"

# Origins to test
NETLIFY_ORIGIN="https://jala2-dev.netlify.app"
LOCALHOST_ORIGIN="http://localhost:5173"

echo "Testing Development Backend..."
echo "URL: $DEV_URL"
echo ""

# Test 1: Simple GET request (should always work)
echo "Test 1: Simple GET request (no origin)"
echo "---------------------------------------"
response=$(curl -s -w "\nHTTP Status: %{http_code}\n" "$DEV_URL")
echo "$response"
echo ""

# Test 2: OPTIONS preflight from Netlify
echo "Test 2: CORS Preflight from Netlify"
echo "------------------------------------"
echo "Origin: $NETLIFY_ORIGIN"
echo ""
cors_response=$(curl -s -X OPTIONS "$DEV_URL" \
  -H "Origin: $NETLIFY_ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -i 2>&1)

echo "$cors_response" | grep -i "access-control" || echo "⚠️ No Access-Control headers found!"
echo ""

# Check for specific headers
if echo "$cors_response" | grep -q "access-control-allow-origin"; then
    echo "✅ Access-Control-Allow-Origin header present"
    echo "$cors_response" | grep -i "access-control-allow-origin"
else
    echo "❌ Access-Control-Allow-Origin header MISSING!"
fi

if echo "$cors_response" | grep -q "access-control-allow-methods"; then
    echo "✅ Access-Control-Allow-Methods header present"
    echo "$cors_response" | grep -i "access-control-allow-methods"
else
    echo "❌ Access-Control-Allow-Methods header MISSING!"
fi

echo ""

# Test 3: OPTIONS preflight from localhost
echo "Test 3: CORS Preflight from Localhost"
echo "--------------------------------------"
echo "Origin: $LOCALHOST_ORIGIN"
echo ""
cors_localhost=$(curl -s -X OPTIONS "$DEV_URL" \
  -H "Origin: $LOCALHOST_ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -i 2>&1)

echo "$cors_localhost" | grep -i "access-control" || echo "⚠️ No Access-Control headers found!"
echo ""

# Test 4: GET request with Origin header
echo "Test 4: GET request with Origin header"
echo "---------------------------------------"
get_with_origin=$(curl -s "$DEV_URL" \
  -H "Origin: $NETLIFY_ORIGIN" \
  -i 2>&1)

if echo "$get_with_origin" | grep -q "access-control-allow-origin"; then
    echo "✅ CORS headers present in GET response"
    echo "$get_with_origin" | grep -i "access-control-allow-origin"
else
    echo "❌ CORS headers MISSING in GET response!"
fi

echo ""
echo "=============================="
echo "📋 Diagnosis:"
echo ""

# Check if CORS is working
if echo "$cors_response" | grep -q "access-control-allow-origin.*$NETLIFY_ORIGIN"; then
    echo "✅ CORS is configured correctly for Netlify!"
    echo ""
    echo "Your frontend should be able to connect."
elif echo "$cors_response" | grep -q "access-control-allow-origin.*\*"; then
    echo "⚠️ CORS is using wildcard (*) - works but less secure"
    echo ""
    echo "Consider setting ALLOWED_ORIGINS to specific domains."
else
    echo "❌ CORS is NOT configured for Netlify!"
    echo ""
    echo "🔧 Fix Required:"
    echo ""
    echo "1. Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/functions"
    echo "2. Add environment variable:"
    echo "   Name: ALLOWED_ORIGINS"
    echo "   Value: https://jala2-dev.netlify.app,http://localhost:5173,http://localhost:3000"
    echo "3. Save and redeploy the backend:"
    echo "   ./deploy-backend.sh"
    echo ""
fi

echo "=============================="
echo ""
echo "💡 Quick Fix Commands:"
echo ""
echo "# After setting ALLOWED_ORIGINS in Supabase Dashboard:"
echo "./deploy-backend.sh"
echo ""
echo "# Or run the guided fix:"
echo "chmod +x quick-cors-fix.sh"
echo "./quick-cors-fix.sh"
echo ""
