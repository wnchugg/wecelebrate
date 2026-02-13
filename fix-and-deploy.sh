#!/bin/bash

# Automated script to rename Edge Function directory and deploy

echo "🔧 JALA 2 Edge Function Directory Fix"
echo "======================================"
echo ""
echo "This will:"
echo "  1. Rename /supabase/functions/server"
echo "  2. To: /supabase/functions/make-server-6fcaeea3"
echo "  3. Deploy the backend"
echo ""

# Check if source directory exists
if [ ! -d "supabase/functions/server" ]; then
    echo "⚠️  Directory 'supabase/functions/server' not found."
    echo ""
    
    # Check if already renamed
    if [ -d "supabase/functions/make-server-6fcaeea3" ]; then
        echo "✅ Directory already renamed to 'make-server-6fcaeea3'"
        echo ""
        read -p "Deploy now? (y/n): " deploy_choice
        if [ "$deploy_choice" = "y" ] || [ "$deploy_choice" = "Y" ]; then
            ./deploy-backend.sh
        fi
        exit 0
    fi
    
    echo "❌ Error: Cannot find server directory!"
    exit 1
fi

echo "📁 Found: supabase/functions/server"
echo ""
read -p "Proceed with rename? (y/n): " proceed

if [ "$proceed" != "y" ] && [ "$proceed" != "Y" ]; then
    echo "❌ Operation cancelled."
    exit 0
fi

echo ""
echo "🔄 Renaming directory..."

# Rename the directory
mv supabase/functions/server supabase/functions/make-server-6fcaeea3

# Verify
if [ -d "supabase/functions/make-server-6fcaeea3" ] && [ -f "supabase/functions/make-server-6fcaeea3/index.tsx" ]; then
    echo "✅ Directory renamed successfully!"
    echo ""
    echo "New structure:"
    echo "  /supabase/functions/make-server-6fcaeea3/"
    ls -1 supabase/functions/make-server-6fcaeea3/ | head -10
    echo ""
    
    # Ask about deployment
    read -p "Deploy backend now? (y/n): " deploy_choice
    if [ "$deploy_choice" = "y" ] || [ "$deploy_choice" = "Y" ]; then
        echo ""
        ./deploy-backend.sh
    else
        echo ""
        echo "✅ Rename complete! Run ./deploy-backend.sh when ready."
    fi
else
    echo "❌ Error: Rename failed!"
    exit 1
fi
