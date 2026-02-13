#!/bin/bash

echo "🔧 Renaming Edge Function Directory"
echo "====================================="
echo ""

# Check if server directory exists
if [ -d "supabase/functions/server" ]; then
    echo "✅ Found 'server' directory"
    echo "📁 Renaming to 'make-server-6fcaeea3'..."
    
    # Remove target directory if it exists
    if [ -d "supabase/functions/make-server-6fcaeea3" ]; then
        echo "⚠️  Target directory already exists, removing it first..."
        rm -rf supabase/functions/make-server-6fcaeea3
    fi
    
    # Rename
    mv supabase/functions/server supabase/functions/make-server-6fcaeea3
    
    if [ $? -eq 0 ]; then
        echo "✅ Renamed successfully!"
        echo ""
        echo "📂 Current structure:"
        ls -la supabase/functions/
        echo ""
        echo "✅ Ready to deploy!"
        echo ""
        echo "Next step: Run ./deploy-backend.sh"
    else
        echo "❌ Rename failed!"
        exit 1
    fi
elif [ -d "supabase/functions/make-server-6fcaeea3" ]; then
    echo "✅ Directory already correctly named: make-server-6fcaeea3"
    echo ""
    echo "📂 Current structure:"
    ls -la supabase/functions/
    echo ""
    echo "✅ Ready to deploy!"
    echo ""
    echo "Next step: Run ./deploy-backend.sh"
else
    echo "❌ Error: Cannot find Edge Function directory!"
    echo ""
    echo "Expected: supabase/functions/server"
    echo "Or: supabase/functions/make-server-6fcaeea3"
    echo ""
    echo "Current directory contents:"
    ls -la supabase/functions/ 2>/dev/null || echo "Directory does not exist!"
    exit 1
fi
