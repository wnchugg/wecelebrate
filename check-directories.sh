#!/bin/bash

echo "🔍 Checking Directory Structure"
echo "================================"
echo ""

# Check if supabase/functions exists
if [ ! -d "supabase/functions" ]; then
    echo "❌ ERROR: supabase/functions/ directory doesn't exist!"
    echo ""
    echo "Are you in the right directory?"
    pwd
    exit 1
fi

echo "✅ supabase/functions/ exists"
echo ""

# List all directories
echo "📁 Directories in supabase/functions/:"
ls -la supabase/functions/ | grep "^d" | awk '{print $NF}' | tail -n +4
echo ""

# Check for server directory
if [ -d "supabase/functions/server" ]; then
    echo "📂 server/ directory EXISTS"
    echo "   Files inside:"
    ls supabase/functions/server/ | head -5
    if [ -f "supabase/functions/server/index.tsx" ]; then
        echo "   ✅ Has index.tsx"
    else
        echo "   ⚠️  No index.tsx found"
    fi
else
    echo "❌ server/ directory DOES NOT EXIST"
fi

echo ""

# Check for make-server-6fcaeea3 directory
if [ -d "supabase/functions/make-server-6fcaeea3" ]; then
    echo "📂 make-server-6fcaeea3/ directory EXISTS"
    echo "   Files inside:"
    ls supabase/functions/make-server-6fcaeea3/ | head -5
    if [ -f "supabase/functions/make-server-6fcaeea3/index.tsx" ]; then
        echo "   ✅ Has index.tsx"
    else
        echo "   ⚠️  No index.tsx found"
    fi
else
    echo "❌ make-server-6fcaeea3/ directory DOES NOT EXIST"
fi

echo ""
echo "================================"
echo "🎯 Recommended Action:"
echo ""

# Determine what to do
HAS_SERVER=false
HAS_CORRECT=false
SERVER_HAS_CODE=false
CORRECT_HAS_CODE=false

if [ -d "supabase/functions/server" ]; then
    HAS_SERVER=true
    if [ -f "supabase/functions/server/index.tsx" ]; then
        SERVER_HAS_CODE=true
    fi
fi

if [ -d "supabase/functions/make-server-6fcaeea3" ]; then
    HAS_CORRECT=true
    if [ -f "supabase/functions/make-server-6fcaeea3/index.tsx" ]; then
        CORRECT_HAS_CODE=true
    fi
fi

# Scenario analysis
if [ "$CORRECT_HAS_CODE" = true ] && [ "$HAS_SERVER" = false ]; then
    echo "✅ PERFECT! Directory is correctly named."
    echo ""
    echo "Next step:"
    echo "  ./deploy-backend.sh"
    
elif [ "$CORRECT_HAS_CODE" = true ] && [ "$HAS_SERVER" = true ]; then
    echo "⚠️  Both directories exist!"
    echo ""
    echo "Fix: Remove the old 'server' directory"
    echo "  rm -rf supabase/functions/server"
    echo ""
    echo "Then deploy:"
    echo "  ./deploy-backend.sh"
    
elif [ "$SERVER_HAS_CODE" = true ] && [ "$HAS_CORRECT" = false ]; then
    echo "🔧 Need to rename 'server' to 'make-server-6fcaeea3'"
    echo ""
    echo "Fix:"
    echo "  mv supabase/functions/server supabase/functions/make-server-6fcaeea3"
    echo ""
    echo "Then deploy:"
    echo "  ./deploy-backend.sh"
    
elif [ "$SERVER_HAS_CODE" = true ] && [ "$CORRECT_HAS_CODE" = false ]; then
    echo "🔧 'server' has code, but 'make-server-6fcaeea3' is empty or missing files"
    echo ""
    echo "Fix:"
    echo "  rm -rf supabase/functions/make-server-6fcaeea3"
    echo "  mv supabase/functions/server supabase/functions/make-server-6fcaeea3"
    echo ""
    echo "Then deploy:"
    echo "  ./deploy-backend.sh"
    
else
    echo "❌ No valid Edge Function code found!"
    echo ""
    echo "Neither directory has index.tsx"
    echo ""
    echo "Possible issues:"
    echo "  1. Files not synced from Figma Make"
    echo "  2. Wrong directory"
    echo "  3. Files were deleted"
    echo ""
    echo "Check your current directory:"
    pwd
fi

echo ""
echo "================================"
