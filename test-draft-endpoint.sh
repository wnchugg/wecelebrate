#!/bin/bash

# Test if the draft endpoint exists
# This will help us determine if the backend was deployed correctly

echo "🧪 Testing Draft/Live Endpoints"
echo ""

SITE_ID="10000000-0000-0000-0000-000000000002"
BASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"

echo "Testing endpoints (will return 401 if they exist, 404 if they don't):"
echo ""

# Test 1: GET /v2/sites/:id/with-draft
echo "1️⃣ Testing GET /v2/sites/:id/with-draft"
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  "${BASE_URL}/v2/sites/${SITE_ID}/with-draft"
echo ""

# Test 2: GET /v2/sites/:id/live
echo "2️⃣ Testing GET /v2/sites/:id/live"
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  "${BASE_URL}/v2/sites/${SITE_ID}/live"
echo ""

# Test 3: PATCH /v2/sites/:id/draft
echo "3️⃣ Testing PATCH /v2/sites/:id/draft"
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}' \
  "${BASE_URL}/v2/sites/${SITE_ID}/draft"
echo ""

# Test 4: POST /v2/sites/:id/publish
echo "4️⃣ Testing POST /v2/sites/:id/publish"
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  -X POST \
  "${BASE_URL}/v2/sites/${SITE_ID}/publish"
echo ""

# Test 5: DELETE /v2/sites/:id/draft
echo "5️⃣ Testing DELETE /v2/sites/:id/draft"
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  -X DELETE \
  "${BASE_URL}/v2/sites/${SITE_ID}/draft"
echo ""

echo "Expected results:"
echo "  401 = Endpoint exists but requires authentication ✅"
echo "  404 = Endpoint doesn't exist (backend not deployed) ❌"
echo "  500 = Endpoint exists but has an error ⚠️"
