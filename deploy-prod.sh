#!/bin/bash

# Deploy backend to Production Supabase project
# Usage: ./deploy-prod.sh

echo "🚀 Deploying backend to Production environment..."
echo "Project: lmffeqwhrnbsbhdztwyv"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Link to Production project
echo "🔗 Linking to Production project..."
supabase link --project-ref lmffeqwhrnbsbhdztwyv

# Deploy the Edge Function
echo "📦 Deploying Edge Function..."
supabase functions deploy make-server-6fcaeea3 --project-ref lmffeqwhrnbsbhdztwyv

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚙️  Next steps:"
echo "1. Set environment variables in Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv/settings/functions"
echo ""
echo "   Required secrets:"
echo "   - ALLOWED_ORIGINS = *"
echo "   - SEED_ON_STARTUP = false"
echo ""
echo "2. Test the deployment:"
echo "   curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health"
echo ""
echo "3. Seed the database (optional):"
echo "   curl -X POST https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/dev/reseed"
