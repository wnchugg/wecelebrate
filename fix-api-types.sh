#!/bin/bash

# Script to fix common TypeScript unsafe patterns in API files
# Fixes: response.json() -> response.json() as { ... }

echo "Fixing TypeScript type safety issues in API files..."

# Find all TypeScript files with errors
FILES=$(npx eslint src --ext .ts,.tsx -f json 2>/dev/null | jq -r '.[] | select(.errorCount > 0 and (.filePath | contains("Api") or contains("Service"))) | .filePath' | sort -u)

for file in $FILES; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Count errors before
    BEFORE=$(npx eslint "$file" -f json 2>/dev/null | jq '.[0].errorCount // 0')
    
    # Apply fixes using sed (macOS compatible)
    # Fix pattern: const error = await response.json();
    sed -i '' 's/const error = await response\.json();/const error = await response.json() as { error?: string };/g' "$file"
    
    # Fix pattern: const data = await response.json();
    # This is more complex and needs manual review, so we'll skip automated fixes for now
    
    # Count errors after
    AFTER=$(npx eslint "$file" -f json 2>/dev/null | jq '.[0].errorCount // 0')
    
    if [ "$BEFORE" != "$AFTER" ]; then
      echo "  ✓ Reduced errors from $BEFORE to $AFTER"
    fi
  fi
done

echo "Done!"
