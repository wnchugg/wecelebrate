#!/bin/bash

# JALA2 Backend Deployment Script for Mac
# This script will copy backend files from Figma Make and deploy to Supabase

set -e  # Exit on any error

echo "🚀 JALA2 Backend Deployment Script"
echo "=================================="
echo ""

# Your project credentials
PROJECT_ID="lmffeqwhrnbsbhdztwyv"
SUPABASE_URL="https://lmffeqwhrnbsbhdztwyv.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZmZlcXdocm5ic2JoZHp0d3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDg1MDgsImV4cCI6MjA4NTkyNDUwOH0.QxEhaoN_sgHLxwLpgqqdhkEAHyNyi4ivFIgPhsWQ83s"

echo "📋 Project: $PROJECT_ID"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
else
    echo "✅ Supabase CLI installed"
fi

# Create working directory
WORK_DIR="$HOME/JALA2-backend"
echo ""
echo "📁 Creating working directory: $WORK_DIR"
mkdir -p "$WORK_DIR/supabase/functions/make-server-6fcaeea3"
cd "$WORK_DIR"

# Check if already linked
if [ ! -f ".git/config" ] && [ ! -d ".supabase" ]; then
    echo ""
    echo "🔗 Linking to Supabase project..."
    echo "When prompted, enter your database password."
    supabase link --project-ref "$PROJECT_ID"
else
    echo "✅ Already linked to Supabase"
fi

# Ask for Service Role Key
echo ""
echo "🔑 Please enter your Service Role Key:"
echo "Get it from: https://app.supabase.com/project/$PROJECT_ID/settings/api"
read -s SERVICE_ROLE_KEY

# Confirm Service Role Key
if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Service Role Key is required!"
    exit 1
fi

echo ""
echo "✅ Service Role Key received"

# Check if backend files exist
echo ""
echo "📂 Checking for backend files..."

if [ ! -f "supabase/functions/make-server-6fcaeea3/index.ts" ]; then
    echo ""
    echo "⚠️  Backend files not found in: $WORK_DIR/supabase/functions/make-server-6fcaeea3/"
    echo ""
    echo "You need to copy the following files from Figma Make:"
    echo "  1. /supabase/functions/server/index.tsx → supabase/functions/make-server-6fcaeea3/index.ts"
    echo "  2. /supabase/functions/server/kv_store.tsx → supabase/functions/make-server-6fcaeea3/kv_store.ts"
    echo "  3. /supabase/functions/server/security.tsx → supabase/functions/make-server-6fcaeea3/security.ts"
    echo "  4. /supabase/functions/server/seed.tsx → supabase/functions/make-server-6fcaeea3/seed.ts"
    echo ""
    echo "OPTIONS:"
    echo ""
    echo "A) Copy files manually:"
    echo "   1. Open each file in Figma Make"
    echo "   2. Copy the content"
    echo "   3. Create the file on your Mac:"
    echo "      nano $WORK_DIR/supabase/functions/make-server-6fcaeea3/[filename].ts"
    echo "   4. Paste and save (Ctrl+X, Y, Enter)"
    echo ""
    echo "B) Export project from Figma Make (if available):"
    echo "   1. Look for Export/Download button in Figma Make"
    echo "   2. Extract to $WORK_DIR"
    echo "   3. Rename files from .tsx to .ts"
    echo ""
    echo "After copying files, run this script again:"
    echo "  bash $0"
    echo ""
    exit 1
fi

echo "✅ Backend files found"

# Set environment secrets
echo ""
echo "🔐 Setting environment secrets..."

# Create .env file
cat > .env << EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
ALLOWED_ORIGINS=*
EOF

# Upload secrets
supabase secrets set --env-file .env

# Verify secrets
echo ""
echo "✅ Secrets configured. Verifying..."
supabase secrets list

# Deploy the function
echo ""
echo "🚀 Deploying Edge Function..."
echo "This may take 1-2 minutes..."
echo ""

supabase functions deploy make-server-6fcaeea3

echo ""
echo "✅ Deployment complete!"
echo ""

# Test the deployment
echo "🧪 Testing deployment..."
HEALTH_CHECK=$(curl -s "https://$PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health" \
  -H "Authorization: Bearer $ANON_KEY")

if [ "$HEALTH_CHECK" = '{"status":"ok"}' ]; then
    echo "✅ Health check passed!"
    echo ""
    echo "🎉 SUCCESS! Your backend is deployed and working!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Go to your Figma Make app: /admin/environment-config"
    echo "2. Click 'Edit' on Development environment"
    echo "3. Enter:"
    echo "   - Supabase URL: $SUPABASE_URL"
    echo "   - Anon Key: $ANON_KEY"
    echo "4. Click 'Save' then 'Test Connection'"
    echo ""
    echo "You should see: ✅ Development environment is online!"
else
    echo "⚠️  Health check returned: $HEALTH_CHECK"
    echo ""
    echo "The function deployed but may have issues."
    echo "Check logs: supabase functions logs make-server-6fcaeea3"
fi

echo ""
echo "Done! 🎉"
