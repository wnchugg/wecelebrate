#!/bin/bash

# Batch fix all @/app/ imports to relative paths
# This script fixes all TypeScript/TSX files in src/app

echo "🔧 Fixing @/app/ imports in all files..."
echo ""

# Find all .ts and .tsx files in src/app and fix them
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | while IFS= read -r -d '' file; do
  # Skip if file doesn't contain @/app/
  if ! grep -q '@/app/' "$file" 2>/dev/null; then
    continue
  fi
  
  echo "Fixing: $file"
  
  # Create backup
  cp "$file" "$file.bak"
  
  # Apply fixes based on file location
  # For files in /src/app/components/
  if [[ "$file" == *"/components/"* ]] && [[ "$file" != *"/admin/"* ]]; then
    sed -i.tmp \
      -e 's|from ["\x27]@/app/components/ui/|from "./ui/|g' \
      -e 's|from ["\x27]@/app/components/|from "./|g' \
      -e 's|from ["\x27]@/app/context/|from "../context/|g' \
      -e 's|from ["\x27]@/app/utils/|from "../utils/|g' \
      -e 's|from ["\x27]@/app/data/|from "../data/|g' \
      -e 's|from ["\x27]@/app/config/|from "../config/|g' \
      -e 's|from ["\x27]@/app/hooks/|from "../hooks/|g' \
      -e 's|from ["\x27]@/app/types/|from "../types/|g' \
      -e 's|from ["\x27]@/app/lib/|from "../lib/|g' \
      -e 's|from ["\x27]@/app/i18n/|from "../i18n/|g' \
      -e 's|from ["\x27]@/app/schemas/|from "../schemas/|g' \
      -e 's|import(["\x27]@/app/components/|import("./|g' \
      -e 's|import(["\x27]@/app/|import("../|g' \
      "$file"
  
  # For files in /src/app/components/admin/
  elif [[ "$file" == *"/components/admin/"* ]]; then
    sed -i.tmp \
      -e 's|from ["\x27]@/app/components/ui/|from "../ui/|g' \
      -e 's|from ["\x27]@/app/components/|from "../|g' \
      -e 's|from ["\x27]@/app/context/|from "../../context/|g' \
      -e 's|from ["\x27]@/app/utils/|from "../../utils/|g' \
      -e 's|from ["\x27]@/app/data/|from "../../data/|g' \
      -e 's|from ["\x27]@/app/config/|from "../../config/|g' \
      -e 's|from ["\x27]@/app/hooks/|from "../../hooks/|g' \
      -e 's|from ["\x27]@/app/types/|from "../../types/|g' \
      -e 's|from ["\x27]@/app/lib/|from "../../lib/|g' \
      -e 's|import(["\x27]@/app/components/ui/|import("../ui/|g' \
      -e 's|import(["\x27]@/app/components/|import("../|g' \
      -e 's|import(["\x27]@/app/|import("../../|g' \
      "$file"
  
  # For files in other src/app subdirectories
  else
    sed -i.tmp \
      -e 's|from ["\x27]@/app/components/ui/|from "../components/ui/|g' \
      -e 's|from ["\x27]@/app/components/|from "../components/|g' \
      -e 's|from ["\x27]@/app/context/|from "../context/|g' \
      -e 's|from ["\x27]@/app/utils/|from "../utils/|g' \
      -e 's|from ["\x27]@/app/data/|from "../data/|g' \
      -e 's|from ["\x27]@/app/config/|from "../config/|g' \
      -e 's|from ["\x27]@/app/hooks/|from "../hooks/|g' \
      -e 's|from ["\x27]@/app/types/|from "../types/|g' \
      -e 's|from ["\x27]@/app/lib/|from "../lib/|g' \
      -e 's|from ["\x27]@/app/i18n/|from "../i18n/|g' \
      -e 's|from ["\x27]@/app/schemas/|from "../schemas/|g' \
      -e 's|import(["\x27]@/app/|import("../|g' \
      "$file"
  fi
  
  # Remove temp file
  rm -f "$file.tmp"
  
  echo "  ✓ Fixed"
done

echo ""
echo "✅ All files processed!"
echo ""
echo "🔍 Verifying..."

# Check for any remaining @/app/ imports
remaining=$(grep -r '@/app/' src/app --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)

if [ "$remaining" -eq 0 ]; then
  echo "✅ SUCCESS! No @/app/ imports found."
  echo ""
  echo "🚀 Ready to publish in Figma Make!"
else
  echo "⚠️  Found $remaining remaining @/app/ imports:"
  grep -r '@/app/' src/app --include="*.ts" --include="*.tsx" -n
fi

echo ""
echo "📁 Backup files created with .bak extension"
echo "   To restore: for f in src/app/**/*.bak; do mv \"\$f\" \"\${f%.bak}\"; done"
