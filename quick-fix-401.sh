#!/bin/bash

# Quick fix for 401 "Missing authorization header" error

echo "🔧 Quick Fix: 401 Authorization Error"
echo "======================================"
echo ""

# Check directory
echo "📁 Checking directory structure..."
if [ ! -d "supabase/functions/make-server-6fcaeea3" ]; then
    if [ -d "supabase/functions/server" ]; then
        echo "⚠️  Found 'server' directory - renaming to 'make-server-6fcaeea3'..."
        mv supabase/functions/server supabase/functions/make-server-6fcaeea3
        echo "✅ Renamed!"
    else
        echo "❌ Error: Cannot find Edge Function directory!"
        exit 1
    fi
else
    echo "✅ Directory structure correct!"
fi

echo ""
echo "🔑 Authenticating with Supabase..."
echo ""

# Logout and login fresh
supabase logout > /dev/null 2>&1
supabase login

if [ $? -ne 0 ]; then
    echo "❌ Authentication failed!"
    exit 1
fi

echo ""
echo "🔗 Linking to Development project..."
supabase link --project-ref wjfcqqrlhwdvvjmefxky

if [ $? -ne 0 ]; then
    echo "❌ Failed to link project!"
    exit 1
fi

echo ""
echo "📤 Deploying with --no-verify-jwt flag..."
echo "(This allows public endpoints without auth headers)"
echo ""

supabase functions deploy make-server-6fcaeea3 --project-ref wjfcqqrlhwdvvjmefxky --no-verify-jwt

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing health endpoint..."
echo ""

sleep 3  # Give function time to initialize

HEALTH_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health"

response=$(curl -s -w "\n%{http_code}" "$HEALTH_URL")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo "Response Code: $http_code"
echo "Response Body: $body"
echo ""

if [ "$http_code" = "200" ]; then
    echo "=========================================="
    echo "✅ SUCCESS! Backend is working!"
    echo "=========================================="
    echo ""
    echo "Health URL: $HEALTH_URL"
    echo ""
    echo "Next Steps:"
    echo "1. Create admin user: https://jala2-dev.netlify.app/admin/bootstrap"
    echo "2. Login: https://jala2-dev.netlify.app/admin"
    echo ""
else
    echo "⚠️  Warning: Received HTTP $http_code"
    echo "The function may still be initializing."
    echo "Please wait 30 seconds and try again:"
    echo ""
    echo "curl $HEALTH_URL"
    echo ""
fi
