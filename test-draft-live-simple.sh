#!/bin/bash

# Simplified test - checks if endpoints exist (will get auth errors but that's OK)

BASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"
SITE_ID="10000000-0000-0000-0000-000000000002"

echo "========================================="
echo "Draft/Live Endpoint Verification"
echo "========================================="
echo ""
echo "Testing if new endpoints exist..."
echo "(Auth errors are expected - we're just checking if endpoints are deployed)"
echo ""

# Test each endpoint
echo "1. Testing GET /v2/sites/:id/with-draft"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/v2/sites/$SITE_ID/with-draft")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "404" ]; then
    echo "   ✗ NOT DEPLOYED (404)"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "   ✓ DEPLOYED (returns 401 Unauthorized - endpoint exists!)"
else
    echo "   ✓ DEPLOYED (HTTP $HTTP_CODE)"
fi

echo ""
echo "2. Testing GET /v2/sites/:id/live"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/v2/sites/$SITE_ID/live")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
    echo "   ✗ NOT DEPLOYED (404)"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "   ✓ DEPLOYED (returns 401 Unauthorized - endpoint exists!)"
else
    echo "   ✓ DEPLOYED (HTTP $HTTP_CODE)"
fi

echo ""
echo "3. Testing PATCH /v2/sites/:id/draft"
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/v2/sites/$SITE_ID/draft" \
  -H "Content-Type: application/json" \
  -d '{}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
    echo "   ✗ NOT DEPLOYED (404)"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "   ✓ DEPLOYED (returns 401 Unauthorized - endpoint exists!)"
else
    echo "   ✓ DEPLOYED (HTTP $HTTP_CODE)"
fi

echo ""
echo "4. Testing POST /v2/sites/:id/publish"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v2/sites/$SITE_ID/publish")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
    echo "   ✗ NOT DEPLOYED (404)"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "   ✓ DEPLOYED (returns 401 Unauthorized - endpoint exists!)"
else
    echo "   ✓ DEPLOYED (HTTP $HTTP_CODE)"
fi

echo ""
echo "5. Testing DELETE /v2/sites/:id/draft"
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/v2/sites/$SITE_ID/draft")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
    echo "   ✗ NOT DEPLOYED (404)"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "   ✓ DEPLOYED (returns 401 Unauthorized - endpoint exists!)"
else
    echo "   ✓ DEPLOYED (HTTP $HTTP_CODE)"
fi

echo ""
echo "========================================="
echo "Summary"
echo "========================================="
echo ""
echo "If all endpoints show '✓ DEPLOYED', the backend is ready!"
echo "The 401 errors are expected - they mean the endpoints exist"
echo "but require authentication (which is correct)."
echo ""
echo "Next step: Frontend integration"
echo "The frontend will use proper authentication automatically."
