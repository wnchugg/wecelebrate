#!/bin/bash

# Fix all @/app/ imports to use relative paths
# This script will replace path aliases with relative imports for Figma Make compatibility

echo "🔧 Fixing import paths for Figma Make compatibility..."

# Function to fix imports in a file
fix_file_imports() {
    local file=$1
    local dir=$(dirname "$file")
    
    echo "Processing: $file"
    
    # Components importing from @/app/components/ui/* -> ./ui/*
    sed -i.bak 's|from ["'\''"]@/app/components/ui/|from "./ui/|g' "$file"
    
    # Components importing from @/app/components/* -> ./
    sed -i.bak 's|from ["'\''"]@/app/components/|from "./|g' "$file"
    
    # Context imports from @/app/context/* -> ../context/
    sed -i.bak 's|from ["'\''"]@/app/context/|from "../context/|g' "$file"
    
    # Utils imports from @/app/utils/* -> ../utils/
    sed -i.bak 's|from ["'\''"]@/app/utils/|from "../utils/|g' "$file"
    
    # Data imports from @/app/data/* -> ../data/
    sed -i.bak 's|from ["'\''"]@/app/data/|from "../data/|g' "$file"
    
    # Config imports from @/app/config/* -> ../config/
    sed -i.bak 's|from ["'\''"]@/app/config/|from "../config/|g' "$file"
    
    # Pages imports from @/app/pages/* -> ../pages/
    sed -i.bak 's|from ["'\''"]@/app/pages/|from "../pages/|g' "$file"
    
    # Remove backup file
    rm -f "${file}.bak"
}

# Fix components directory
echo "📁 Fixing /src/app/components/..."
find src/app/components -name "*.tsx" -o -name "*.ts" | while read file; do
    fix_file_imports "$file"
done

# Fix pages directory
echo "📁 Fixing /src/app/pages/..."
find src/app/pages -name "*.tsx" -o -name "*.ts" 2>/dev/null | while read file; do
    fix_file_imports "$file"
done

# Fix context directory
echo "📁 Fixing /src/app/context/..."
find src/app/context -name "*.tsx" -o -name "*.ts" 2>/dev/null | while read file; do
    fix_file_imports "$file"
done

# Fix utils directory
echo "📁 Fixing /src/app/utils/..."
find src/app/utils -name "*.tsx" -o -name "*.ts" 2>/dev/null | while read file; do
    fix_file_imports "$file"
done

echo "✅ Import path fixes complete!"
echo ""
echo "🧹 Cleaning up..."
find src/app -name "*.bak" -delete
echo "✅ Cleanup complete!"
