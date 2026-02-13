#!/bin/bash

# Production Hardening: Replace console.log with logger
# This script converts all console.log/info/warn statements to use the logger utility
# console.error is preserved as it's allowed in production

set -e

echo "🔧 Production Hardening: Fixing Console Statements"
echo "=================================================="
echo ""

# Count occurrences before fix
BEFORE_LOG=$(grep -r "console\.log" src --include="*.ts" --include="*.tsx" | wc -l || echo "0")
BEFORE_INFO=$(grep -r "console\.info" src --include="*.ts" --include="*.tsx" | wc -l || echo "0")
BEFORE_WARN=$(grep -r "console\.warn" src --include="*.ts" --include="*.tsx" | wc -l || echo "0")

echo "📊 Found Issues:"
echo "   - console.log:  $BEFORE_LOG occurrences"
echo "   - console.info: $BEFORE_INFO occurrences"
echo "   - console.warn: $BEFORE_WARN occurrences"
echo ""

# Create backup
echo "💾 Creating backup..."
BACKUP_DIR="./backups/console-fix-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r src "$BACKUP_DIR/"
echo "   ✅ Backup created: $BACKUP_DIR"
echo ""

# Fix console statements
echo "🔨 Replacing console statements with logger..."

# 1. Replace console.log with logger.log
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/console\.log/logger.log/g' {} +

# 2. Replace console.info with logger.info
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/console\.info/logger.info/g' {} +

# 3. Replace console.warn with logger.warn
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/console\.warn/logger.warn/g' {} +

# 4. Replace console.debug with logger.debug
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/console\.debug/logger.debug/g' {} +

echo "   ✅ Console statements replaced"
echo ""

# Add logger imports where needed
echo "🔨 Adding logger imports..."

# Find files that use logger but don't import it
FILES_NEEDING_IMPORT=$(grep -l "logger\." src/**/*.{ts,tsx} 2>/dev/null | \
  xargs grep -L "import.*logger.*from" 2>/dev/null || echo "")

if [ -n "$FILES_NEEDING_IMPORT" ]; then
  echo "   Found $(echo "$FILES_NEEDING_IMPORT" | wc -l) files needing logger import"
  
  for file in $FILES_NEEDING_IMPORT; do
    # Calculate relative path to logger
    DIR_DEPTH=$(echo "$file" | grep -o "/" | wc -l)
    RELATIVE_PATH=""
    for i in $(seq 1 $DIR_DEPTH); do
      RELATIVE_PATH="../$RELATIVE_PATH"
    done
    RELATIVE_PATH="${RELATIVE_PATH}utils/logger"
    
    # Add import at the top (after existing imports)
    sed -i '' "1a\\
import { logger } from '$RELATIVE_PATH';\\
" "$file"
  done
  
  echo "   ✅ Logger imports added"
else
  echo "   ℹ️  No files need logger import (already imported)"
fi

echo ""

# Count after fix
AFTER_LOG=$(grep -r "console\.log" src --include="*.ts" --include="*.tsx" | wc -l || echo "0")
AFTER_INFO=$(grep -r "console\.info" src --include="*.ts" --include="*.tsx" | wc -l || echo "0")
AFTER_WARN=$(grep -r "console\.warn" src --include="*.ts" --include="*.tsx" | wc -l || echo "0")

echo "📊 Results:"
echo "   - console.log:  $BEFORE_LOG → $AFTER_LOG"
echo "   - console.info: $BEFORE_INFO → $AFTER_INFO"
echo "   - console.warn: $BEFORE_WARN → $AFTER_WARN"
echo ""

# Calculate total fixed
FIXED=$((BEFORE_LOG + BEFORE_INFO + BEFORE_WARN - AFTER_LOG - AFTER_INFO - AFTER_WARN))

echo "✅ Fixed $FIXED console statements!"
echo ""
echo "⚠️  console.error statements preserved (allowed in production)"
echo ""
echo "📝 Next Steps:"
echo "   1. Review changes: git diff src"
echo "   2. Test the app: npm run dev"
echo "   3. Run linter: npm run lint"
echo "   4. If satisfied, commit: git add . && git commit -m 'fix: replace console statements with logger'"
echo ""
