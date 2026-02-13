#!/bin/bash

# JALA2 Development Environment Setup Script
# This script deploys the backend to a new Development Supabase project

set -e  # Exit on error

echo "🚀 JALA2 Development Environment Setup"
echo "======================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
else
    echo "✅ Supabase CLI installed"
fi

# Get development project details
echo ""
echo "📋 Enter your Development Supabase project details"
echo "   (Get these from: https://supabase.com/dashboard → Your Dev Project → Settings → API)"
echo ""

read -p "Development Project ID (Ref): " DEV_PROJECT_ID
read -p "Development Supabase URL: " DEV_SUPABASE_URL
read -p "Development Anon Key: " DEV_ANON_KEY
read -s -p "Development Service Role Key: " DEV_SERVICE_ROLE_KEY
echo ""
read -s -p "Development Database Password: " DEV_DB_PASSWORD
echo ""

# Validate inputs
if [ -z "$DEV_PROJECT_ID" ] || [ -z "$DEV_SUPABASE_URL" ] || [ -z "$DEV_ANON_KEY" ] || [ -z "$DEV_SERVICE_ROLE_KEY" ] || [ -z "$DEV_DB_PASSWORD" ]; then
    echo "❌ All fields are required!"
    exit 1
fi

# Create working directory
WORK_DIR="$HOME/JALA2-backend-dev"
echo ""
echo "📁 Creating working directory: $WORK_DIR"
mkdir -p "$WORK_DIR/supabase/functions/make-server-6fcaeea3"
cd "$WORK_DIR"

# Link to development project
echo ""
echo "🔗 Linking to Development project..."
echo "$DEV_DB_PASSWORD" | supabase link --project-ref "$DEV_PROJECT_ID" --password-stdin 2>/dev/null || {
    echo "Manual linking required..."
    supabase link --project-ref "$DEV_PROJECT_ID"
}

# Check if backend files exist
echo ""
echo "📂 Checking for backend files..."

if [ ! -f "supabase/functions/make-server-6fcaeea3/index.ts" ]; then
    echo ""
    echo "⚠️  Backend files not found!"
    echo ""
    echo "You need to copy the following files from Figma Make:"
    echo ""
    echo "  1. /supabase/functions/server/index.tsx → supabase/functions/make-server-6fcaeea3/index.ts"
    echo "  2. /supabase/functions/server/kv_store.tsx → supabase/functions/make-server-6fcaeea3/kv_store.ts"
    echo "  3. /supabase/functions/server/security.tsx → supabase/functions/make-server-6fcaeea3/security.ts"
    echo "  4. /supabase/functions/server/seed.tsx → supabase/functions/make-server-6fcaeea3/seed.ts"
    echo ""
    echo "IMPORTANT: Change file extensions from .tsx to .ts"
    echo "IMPORTANT: In index.ts, change imports from .tsx to .ts"
    echo ""
    echo "After copying files, run this script again:"
    echo "  bash $0"
    echo ""
    
    read -p "Would you like to open the folder to paste files manually? (y/n): " OPEN_FOLDER
    if [ "$OPEN_FOLDER" = "y" ]; then
        open "$WORK_DIR/supabase/functions/make-server-6fcaeea3"
    fi
    
    exit 1
fi

echo "✅ Backend files found"

# Create .env file
echo ""
echo "🔐 Setting environment secrets..."

cat > .env << EOF
SUPABASE_URL=$DEV_SUPABASE_URL
SUPABASE_ANON_KEY=$DEV_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$DEV_SERVICE_ROLE_KEY
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
echo "🚀 Deploying Edge Function to Development..."
echo "This may take 1-2 minutes..."
echo ""

supabase functions deploy make-server-6fcaeea3

echo ""
echo "✅ Deployment complete!"
echo ""

# Test the deployment
echo "🧪 Testing deployment..."
HEALTH_CHECK=$(curl -s "$DEV_SUPABASE_URL/functions/v1/make-server-6fcaeea3/health" \
  -H "Authorization: Bearer $DEV_ANON_KEY")

if [ "$HEALTH_CHECK" = '{"status":"ok"}' ]; then
    echo "✅ Health check passed!"
    echo ""
    echo "🎉 SUCCESS! Your Development backend is deployed and working!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Development Environment Configuration"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Supabase URL: $DEV_SUPABASE_URL"
    echo "Anon Key:     $DEV_ANON_KEY"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. Update Figma Make default connection:"
    echo "   - Edit /utils/supabase/info.tsx"
    echo "   - Set projectId = \"$DEV_PROJECT_ID\""
    echo "   - Set publicAnonKey = \"$DEV_ANON_KEY\""
    echo ""
    echo "2. OR configure via Admin UI:"
    echo "   - Go to /admin/environment-config"
    echo "   - Click 'Add Environment'"
    echo "   - Enter Development credentials above"
    echo "   - Click 'Save' then 'Test Connection'"
    echo ""
    echo "3. Create an admin user in Development:"
    echo "   - Go to /admin/login in Figma Make"
    echo "   - Click 'Sign Up'"
    echo "   - Create your admin account"
    echo ""
    echo "You should see: ✅ Development environment is online!"
else
    echo "⚠️  Health check returned: $HEALTH_CHECK"
    echo ""
    echo "The function deployed but may have issues."
    echo "Check logs: supabase functions logs make-server-6fcaeea3"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "Your production project (lmffeqwhrnbsbhdztwyv) is still"
echo "untouched and ready for production deployment later."
echo ""
echo "Done! 🎉"
