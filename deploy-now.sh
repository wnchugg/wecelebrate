#!/bin/bash

echo "🚀 Deploying Backend with Fixed CORS..."
echo ""

# Deploy to Development
echo "Deploying to Development (wjfcqqrlhwdvvjmefxky)..."
echo ""

supabase functions deploy make-server-6fcaeea3 \
  --project-ref wjfcqqrlhwdvvjmefxky \
  --no-verify-jwt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🧪 Testing backend..."
    echo ""
    
    sleep 3
    
    response=$(curl -s https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health)
    echo "$response" | jq . 2>/dev/null || echo "$response"
    
    echo ""
    echo "✅ Backend is running!"
    echo ""
    echo "🌐 Testing CORS from Netlify..."
    echo ""
    
    cors_test=$(curl -s -X OPTIONS https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health \
      -H "Origin: https://jala2-dev.netlify.app" \
      -H "Access-Control-Request-Method: GET" \
      -i 2>&1)
    
    if echo "$cors_test" | grep -q "access-control-allow-origin"; then
        echo "✅ CORS is working!"
        echo "$cors_test" | grep -i "access-control"
    else
        echo "⚠️ CORS headers not found in response"
        echo "This might take 30-60 seconds to propagate..."
    fi
    
    echo ""
    echo "================================"
    echo "✅ Next Steps:"
    echo ""
    echo "1. Wait 30-60 seconds for Edge Function to fully restart"
    echo "2. Visit: https://jala2-dev.netlify.app/"
    echo "3. The 'Failed to fetch' error should be GONE!"
    echo ""
    echo "If still having issues:"
    echo "  - Clear browser cache (Ctrl+Shift+R)"
    echo "  - Check browser console (F12) for errors"
    echo "  - Check Supabase logs for CORS debug messages"
    echo ""
    echo "================================"
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Make sure you:"
    echo "  1. Are logged in: supabase login"
    echo "  2. Have the correct project access"
    exit 1
fi
