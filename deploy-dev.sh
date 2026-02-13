#!/bin/bash

# Deploy backend to Development Supabase project
# Usage: ./deploy-dev.sh

echo "🚀 Deploying backend to Development environment..."
echo "Project: wjfcqqrlhwdvvjmefxky"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Link to Development project
echo "🔗 Linking to Development project..."
supabase link --project-ref wjfcqqrlhwdvvjmefxky

# Deploy the Edge Function (actual directory is 'server', deployed URL will still be make-server-6fcaeea3)
echo "📦 Deploying Edge Function..."
supabase functions deploy server --project-ref wjfcqqrlhwdvvjmefxky

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚙️  Next steps:"
echo "1. Set environment variables in Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/functions"
echo ""
echo "   Required secrets:"
echo "   - ALLOWED_ORIGINS = *"
echo "   - SEED_ON_STARTUP = false"
echo ""
echo "2. Test the deployment:"
echo "   curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server/health"
echo ""
echo "3. Run the full auth test:"
echo "   ./auth-test.sh"