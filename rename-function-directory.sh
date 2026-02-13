#!/bin/bash

# Script to rename Edge Function directory from 'server' to 'make-server-6fcaeea3'
# and remove route prefixes

set -e

echo "🔧 Renaming Edge Function Directory"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Source and destination
SRC_DIR="supabase/functions/server"
DEST_DIR="supabase/functions/make-server-6fcaeea3"

# Check if source exists
if [ ! -d "$SRC_DIR" ]; then
    echo "❌ Source directory not found: $SRC_DIR"
    exit 1
fi

# Create destination directory
echo -e "${BLUE}Creating new directory: ${DEST_DIR}${NC}"
mkdir -p "$DEST_DIR"

# Copy all files
echo -e "${BLUE}Copying files...${NC}"
cp -r "$SRC_DIR"/* "$DEST_DIR/"

# Update index.tsx to remove route prefixes
echo -e "${BLUE}Updating routes in index.tsx...${NC}"
if [ -f "$DEST_DIR/index.tsx" ]; then
    # Replace all instances of "/make-server-6fcaeea3/ with "/
    sed -i 's|"/make-server-6fcaeea3/|"/|g' "$DEST_DIR/index.tsx"
    # Also update the console.log message about reseed
    sed -i 's|/make-server-6fcaeea3/dev/reseed|/dev/reseed|g' "$DEST_DIR/index.tsx"
    echo -e "${GREEN}✓ Routes updated${NC}"
else
    echo "⚠️  index.tsx not found"
fi

# Count the routes that were updated
ROUTE_COUNT=$(grep -c 'app\.\(get\|post\|put\|delete\)("/[^"]*"' "$DEST_DIR/index.tsx" || echo "0")
echo -e "${GREEN}✓ Updated ${ROUTE_COUNT} routes${NC}"

echo ""
echo -e "${GREEN}✓ Directory renamed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Delete old directory: rm -rf $SRC_DIR"
echo "2. Deploy: ./scripts/deploy-full-stack.sh dev"
echo ""
