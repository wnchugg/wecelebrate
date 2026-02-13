#!/bin/bash

# This script renames all .tsx files in /supabase/functions/server to .ts
# and updates all import statements

echo "🔄 Renaming .tsx files to .ts for Supabase deployment..."

# Files to rename
FILES=(
  "index.tsx"
  "seed.tsx"
  "security.tsx"
  "kv_env.tsx"
  "erp_integration.tsx"
  "erp_scheduler.tsx"
)

for file in "${FILES[@]}"; do
  SOURCE="/supabase/functions/server/$file"
  if [ -f "$SOURCE" ]; then
    DEST="${SOURCE%.tsx}.ts"
    echo "  Renaming: $file → ${file%.tsx}.ts"
    cp "$SOURCE" "$DEST"
    rm "$SOURCE"
  fi
done

echo "✅ All files renamed!"
echo ""
echo "Note: Import statements still reference .tsx extensions."
echo "Run fast_apply_tool to update them."
