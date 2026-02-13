#!/bin/bash

echo "🔧 CORS Configuration Fix"
echo "=========================="
echo ""
echo "To fix the 'Failed to fetch' error, you need to update ALLOWED_ORIGINS"
echo ""
echo "📍 Step 1: Go to Supabase Dashboard"
echo "   Development: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/functions"
echo "   Production:  https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv/settings/functions"
echo ""
echo "📍 Step 2: Add/Update Environment Variable"
echo "   Variable Name: ALLOWED_ORIGINS"
echo "   Variable Value (Development):"
echo "   https://jala2-dev.netlify.app,http://localhost:5173,http://localhost:3000"
echo ""
echo "   Variable Value (Production):"
echo "   https://jala2.netlify.app,https://jala2-dev.netlify.app"
echo ""
echo "📍 Step 3: Save the variable in Supabase Dashboard"
echo ""
echo "📍 Step 4: Redeploy the backend (press Enter to continue)..."
read

echo ""
echo "🚀 Deploying backend with new ALLOWED_ORIGINS..."
echo ""

# Check if deploy-backend.sh exists
if [ -f "./deploy-backend.sh" ]; then
    ./deploy-backend.sh
else
    echo "❌ deploy-backend.sh not found!"
    echo ""
    echo "Deploying manually..."
    
    # Ask which environment
    echo "Select environment:"
    echo "1) Development (wjfcqqrlhwdvvjmefxky)"
    echo "2) Production (lmffeqwhrnbsbhdztwyv)"
    read -p "Enter choice [1-2]: " env_choice
    
    if [ "$env_choice" = "1" ]; then
        PROJECT_REF="wjfcqqrlhwdvvjmefxky"
        ENV_NAME="Development"
    else
        PROJECT_REF="lmffeqwhrnbsbhdztwyv"
        ENV_NAME="Production"
    fi
    
    echo ""
    echo "Deploying to $ENV_NAME ($PROJECT_REF)..."
    
    # Deploy using supabase CLI
    supabase functions deploy make-server-6fcaeea3 \
      --project-ref $PROJECT_REF \
      --no-verify-jwt
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment successful!"
    else
        echo ""
        echo "❌ Deployment failed!"
        echo ""
        echo "Make sure you:"
        echo "  1. Have supabase CLI installed (npm install -g supabase)"
        echo "  2. Are logged in (supabase login)"
        echo "  3. Have the correct project reference"
        exit 1
    fi
fi

echo ""
echo "🧪 Testing backend health..."
echo ""

if [ "$PROJECT_REF" = "wjfcqqrlhwdvvjmefxky" ] || [ "$env_choice" = "1" ]; then
    BACKEND_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health"
else
    BACKEND_URL="https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health"
fi

echo "Testing: $BACKEND_URL"
echo ""

response=$(curl -s "$BACKEND_URL")
echo "$response" | jq . 2>/dev/null || echo "$response"

echo ""
echo "🧪 Testing CORS from Netlify origin..."
echo ""

curl -X OPTIONS "$BACKEND_URL" \
  -H "Origin: https://jala2-dev.netlify.app" \
  -H "Access-Control-Request-Method: GET" \
  -v 2>&1 | grep -i "access-control"

echo ""
echo "================================"
echo "✅ Next Steps:"
echo ""
echo "1. Visit: https://jala2-dev.netlify.app/"
echo "2. Check if 'Failed to fetch' error is gone"
echo "3. Open browser console (F12) to check for errors"
echo ""
echo "If still having issues:"
echo "  - Wait 60 seconds for Edge Function to fully restart"
echo "  - Clear browser cache (Ctrl+Shift+R)"
echo "  - Check browser console for CORS errors"
echo ""
echo "================================"
