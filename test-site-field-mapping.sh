#!/bin/bash

# Test Site Field Mapping Fix
# Tests that frontend fields are properly mapped to database columns

echo "════════════════════════════════════════"
echo "   Testing Site Field Mapping"
echo "════════════════════════════════════════"
echo ""

# Get the site ID from the first site
SITE_ID="10000000-0000-0000-0000-000000000001"
API_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"

echo "→ Test 1: Update site with slug field"
echo "  Testing: slug field (should work)"
echo ""

RESPONSE=$(curl -s -X PUT "${API_URL}/v2/sites/${SITE_ID}" \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: development" \
  -d '{
    "slug": "tech-corp-us-test"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✓ Test 1 PASSED: Slug update successful"
else
  echo "✗ Test 1 FAILED: Slug update failed"
fi
echo ""

echo "→ Test 2: Update site with allowSessionTimeoutExtend"
echo "  Testing: camelCase field that maps to allow_session_timeout_extend"
echo ""

RESPONSE=$(curl -s -X PUT "${API_URL}/v2/sites/${SITE_ID}" \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: development" \
  -d '{
    "allowSessionTimeoutExtend": true
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✓ Test 2 PASSED: allowSessionTimeoutExtend update successful"
else
  echo "✗ Test 2 FAILED: allowSessionTimeoutExtend update failed"
fi
echo ""

echo "→ Test 3: Update site with domain field (should be ignored)"
echo "  Testing: domain field that doesn't exist in database"
echo ""

RESPONSE=$(curl -s -X PUT "${API_URL}/v2/sites/${SITE_ID}" \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: development" \
  -d '{
    "domain": "test.example.com",
    "name": "Tech Corp US"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✓ Test 3 PASSED: Update successful (domain field ignored)"
else
  echo "✗ Test 3 FAILED: Update failed (domain field should be ignored)"
fi
echo ""

echo "→ Test 4: Update site with siteCustomDomainUrl"
echo "  Testing: correct field name for custom domain"
echo ""

RESPONSE=$(curl -s -X PUT "${API_URL}/v2/sites/${SITE_ID}" \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: development" \
  -d '{
    "siteCustomDomainUrl": "https://custom.techcorp.com"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✓ Test 4 PASSED: siteCustomDomainUrl update successful"
else
  echo "✗ Test 4 FAILED: siteCustomDomainUrl update failed"
fi
echo ""

echo "→ Test 5: Update site with multiple fields"
echo "  Testing: combination of valid and ignored fields"
echo ""

RESPONSE=$(curl -s -X PUT "${API_URL}/v2/sites/${SITE_ID}" \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: development" \
  -d '{
    "slug": "tech-corp-us",
    "allowSessionTimeoutExtend": false,
    "domain": "ignored.example.com",
    "siteAccountManager": "John Doe",
    "settings": {"ignored": "field"}
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✓ Test 5 PASSED: Multiple field update successful"
else
  echo "✗ Test 5 FAILED: Multiple field update failed"
fi
echo ""

echo "════════════════════════════════════════"
echo "   Testing Complete"
echo "════════════════════════════════════════"
echo ""
echo "Check the Supabase logs for detailed field mapping:"
echo "supabase functions logs make-server-6fcaeea3 --project-ref wjfcqqrlhwdvvjmefxky"
