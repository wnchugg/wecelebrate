#!/bin/bash

# Script to rename /supabase/functions/server to /supabase/functions/make-server-6fcaeea3

echo "🔄 Renaming Edge Function Directory"
echo "====================================="
echo ""
echo "FROM: /supabase/functions/server"
echo "TO:   /supabase/functions/make-server-6fcaeea3"
echo ""

# Check if source exists
if [ ! -d "supabase/functions/server" ]; then
    echo "❌ Error: supabase/functions/server directory not found!"
    exit 1
fi

# Create new directory
echo "📁 Creating new directory structure..."
mkdir -p supabase/functions/make-server-6fcaeea3
mkdir -p supabase/functions/make-server-6fcaeea3/tests

# Copy all files
echo "📋 Copying files..."
cp -r supabase/functions/server/* supabase/functions/make-server-6fcaeea3/

# Verify copy
if [ -f "supabase/functions/make-server-6fcaeea3/index.tsx" ]; then
    echo "✅ Files copied successfully!"
else
    echo "❌ Error: Failed to copy files!"
    exit 1
fi

# Remove old directory
echo "🗑️  Removing old directory..."
rm -rf supabase/functions/server

echo ""
echo "=========================================="
echo "✅ Directory Rename Complete!"
echo "=========================================="
echo ""
echo "New structure:"
echo "  /supabase/functions/make-server-6fcaeea3/"
echo "    ├── index.tsx (main entry point)"
echo "    ├── index.ts"
echo "    ├── types.ts"
echo "    ├── helpers.ts"
echo "    ├── security.ts"
echo "    ├── validation.ts"
echo "    ├── gifts_api.ts"
echo "    ├── seed.ts"
echo "    ├── kv_store.tsx"
echo "    ├── kv_env.ts"
echo "    ├── email_service.tsx"
echo "    ├── erp_integration.ts"
echo "    ├── erp_scheduler.ts"
echo "    ├── tsconfig.json"
echo "    └── tests/"
echo ""
echo "You can now deploy with:"
echo "  ./deploy-backend.sh"
echo ""
