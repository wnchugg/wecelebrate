#!/bin/bash

# Deploy Backend with V2 Endpoints
# Deploys the updated backend with database-backed CRUD endpoints

set -e

echo "🚀 Deploying Backend with V2 Endpoints..."
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# The function is deployed from the server directory
# The actual function name on Supabase is make-server-6fcaeea3
echo "📦 Deploying server function as make-server-6fcaeea3..."

# Create a temporary symlink for deployment
if [ ! -L "supabase/functions/make-server-6fcaeea3" ]; then
  ln -s server supabase/functions/make-server-6fcaeea3
  echo "✓ Created symlink for deployment"
fi

supabase functions deploy make-server-6fcaeea3 \
  --project-ref wjfcqqrlhwdvvjmefxky \
  --no-verify-jwt

# Clean up symlink
rm supabase/functions/make-server-6fcaeea3

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Test endpoints: cd supabase/functions/server/tests && ./test-v2-endpoints.sh"
echo "   2. Check health: curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health"
echo ""
