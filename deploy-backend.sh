#!/bin/bash

# JALA 2 Backend Deployment Script
# This script deploys the Supabase Edge Function backend

set -e  # Exit on error

echo "🚀 JALA 2 Backend Deployment Script"
echo "===================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
    echo "✅ Supabase CLI installed!"
    echo ""
fi

# Ask which environment to deploy to
echo "Which environment do you want to deploy to?"
echo "1) Development (wjfcqqrlhwdvvjmefxky)"
echo "2) Production (lmffeqwhrnbsbhdztwyv)"
echo ""
read -p "Enter choice [1-2]: " env_choice

if [ "$env_choice" = "1" ]; then
    PROJECT_REF="wjfcqqrlhwdvvjmefxky"
    ENV_NAME="Development"
elif [ "$env_choice" = "2" ]; then
    PROJECT_REF="lmffeqwhrnbsbhdztwyv"
    ENV_NAME="Production"
else
    echo "❌ Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "📍 Deploying to: $ENV_NAME ($PROJECT_REF)"
echo ""

# Login to Supabase
echo "🔑 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "Please login to Supabase:"
    supabase login
fi
echo "✅ Authenticated!"
echo ""

# Link project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref "$PROJECT_REF"
echo "✅ Project linked!"
echo ""

# Deploy Edge Function
echo "📤 Deploying Edge Function 'make-server-6fcaeea3'..."
supabase functions deploy make-server-6fcaeea3 --no-verify-jwt
echo "✅ Edge Function deployed!"
echo ""

# Test the deployment
echo "🧪 Testing deployment..."
HEALTH_URL="https://${PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3/health"
echo "Testing: $HEALTH_URL"
echo ""

if curl -s -f "$HEALTH_URL" > /dev/null; then
    echo "✅ Backend is responding!"
    echo ""
    echo "Response:"
    curl -s "$HEALTH_URL" | jq '.' || curl -s "$HEALTH_URL"
    echo ""
else
    echo "⚠️  Warning: Backend health check failed."
    echo "The function may still be initializing. Please wait 30-60 seconds and try again."
    echo ""
fi

# Success message
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Backend URL: https://${PROJECT_REF}.supabase.co/functions/v1/make-server-6fcaeea3"
echo "Health Check: $HEALTH_URL"
echo ""
echo "Next Steps:"
echo "1. Go to your admin page and check 'Backend Connection Status'"
echo "2. Create an admin user at /admin/bootstrap"
echo "3. Run initial database seed at /admin/initial-seed"
echo ""
echo "For more information, see /docs/BACKEND_CONNECTION_FIX.md"
echo ""