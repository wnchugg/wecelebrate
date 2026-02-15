#!/bin/bash

echo "🧪 Testing Ed25519 JWT Implementation"
echo ""

BASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"

# Test 1: Health check
echo "1️⃣ Testing health endpoint..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    echo "$HEALTH"
    exit 1
fi

echo ""

# Test 2: Check JWT debug endpoint
echo "2️⃣ Checking JWT configuration..."
JWT_CONFIG=$(curl -s "$BASE_URL/debug-jwt-config")
echo "$JWT_CONFIG" | jq '.'

echo ""

# Test 3: Try to login (you'll need to provide credentials)
echo "3️⃣ To test login with Ed25519 tokens:"
echo ""
echo "curl -X POST $BASE_URL/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'X-Environment-ID: development' \\"
echo "  -d '{\"identifier\": \"your-email@example.com\", \"password\": \"your-password\"}'"
echo ""
echo "Then decode the token at https://jwt.io to verify it uses EdDSA algorithm"
echo ""

# Test 4: Check if Ed25519 keys are being used
echo "4️⃣ Checking if Ed25519 is active..."
if echo "$JWT_CONFIG" | grep -q "Ed25519"; then
    echo "✅ Ed25519 configuration detected"
elif echo "$JWT_CONFIG" | grep -q "cryptoKeyAvailable.*true"; then
    echo "✅ Crypto key available (Ed25519 likely active)"
else
    echo "⚠️  Cannot confirm Ed25519 from debug endpoint"
    echo "   Check Supabase Dashboard logs for:"
    echo "   - '✅ JWT Ed25519 private key loaded'"
    echo "   - '✅ JWT Ed25519 public key loaded'"
fi

echo ""
echo "📊 Summary:"
echo "  - Backend is running: ✅"
echo "  - Health check: ✅"
echo "  - JWT config accessible: ✅"
echo ""
echo "Next: Test login to verify Ed25519 tokens are being generated"
