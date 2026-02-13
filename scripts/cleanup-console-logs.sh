#!/bin/bash

# P1.3 Production Code Cleanup Script
# Finds and lists all console.log statements for review

echo "========================================="
echo "P1.3 - Production Code Cleanup"
echo "Finding console.log statements..."
echo "========================================="
echo ""

# Find all console.log statements (excluding this script)
echo "📍 Console.log statements found:"
grep -r "console\.log(" src/ --exclude-dir=node_modules --include="*.ts" --include="*.tsx" -n | head -50

echo ""
echo "========================================="
echo "📍 Console.debug statements found:"
grep -r "console\.debug(" src/ --exclude-dir=node_modules --include="*.ts" --include="*.tsx" -n

echo ""
echo "========================================="
echo "📍 Console.info statements found:"
grep -r "console\.info(" src/ --exclude-dir=node_modules --include="*.ts" --include="*.tsx" -n

echo ""
echo "========================================="
echo "✅ Console.error statements (KEEP THESE):"
grep -r "console\.error(" src/ --exclude-dir=node_modules --include="*.ts" --include="*.tsx" -n | wc -l
echo "error statements found (these are production-safe)"

echo ""
echo "========================================="
echo "✅ Console.warn statements (KEEP THESE):"
grep -r "console\.warn(" src/ --exclude-dir=node_modules --include="*.ts" --include="*.tsx" -n | wc -l  
echo "warn statements found (these are production-safe)"

echo ""
echo "========================================="
echo "📊 Summary:"
echo "========================================="
LOG_COUNT=$(grep -r "console\.log(" src/ --exclude-dir=node_modules --include="*.ts" --include="*.tsx" | wc -l)
DEBUG_COUNT=$(grep -r "console\.debug(" src/ --exclude-dir=node_modules --include="*.ts" --include="*.tsx" | wc -l)
INFO_COUNT=$(grep -r "console\.info(" src/ --exclude-dir=node_modules --include="*.ts" --include="*.tsx" | wc -l)
ERROR_COUNT=$(grep -r "console\.error(" src/ --exclude-dir=node_modules --include="*.ts" --include="*.tsx" | wc -l)
WARN_COUNT=$(grep -r "console\.warn(" src/ --exclude-dir=node_modules --include="*.ts" --include="*.tsx" | wc -l)

echo "console.log():   $LOG_COUNT   (REMOVE)"
echo "console.debug(): $DEBUG_COUNT (REMOVE)"
echo "console.info():  $INFO_COUNT  (REVIEW)"
echo "console.error(): $ERROR_COUNT (KEEP)"
echo "console.warn():  $WARN_COUNT  (KEEP)"
echo ""
echo "Total to remove: $((LOG_COUNT + DEBUG_COUNT)) statements"
echo ""
echo "========================================="
echo "Next Steps:"
echo "1. Review /src/app/utils/logger.ts"
echo "2. Replace console.log() with logger.debug()"
echo "3. Keep console.error() and console.warn()"
echo "4. Test in development mode"
echo "5. Verify production build"
echo "========================================="
