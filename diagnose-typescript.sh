#!/bin/bash

# TypeScript Diagnostic Script
# Run this to help diagnose the 918 errors

echo "================================================================"
echo "TypeScript Error Diagnostic Tool"
echo "================================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create reports directory
mkdir -p /tmp/typescript-reports

echo "${BLUE}Step 1: Counting total errors...${NC}"
TOTAL_ERRORS=$(npm run type-check 2>&1 | grep "error TS" | wc -l)
echo "Total errors: ${RED}$TOTAL_ERRORS${NC}"
echo ""

echo "${BLUE}Step 2: Getting first 50 errors...${NC}"
npm run type-check 2>&1 | grep "error TS" | head -50 > /tmp/typescript-reports/first-50-errors.txt
cat /tmp/typescript-reports/first-50-errors.txt
echo ""
echo "Full list saved to: /tmp/typescript-reports/first-50-errors.txt"
echo ""

echo "${BLUE}Step 3: Error breakdown by type...${NC}"
npm run type-check 2>&1 | grep "error TS" | sed 's/.*error \(TS[0-9]*\).*/\1/' | sort | uniq -c | sort -rn > /tmp/typescript-reports/errors-by-type.txt
cat /tmp/typescript-reports/errors-by-type.txt
echo ""
echo "Full list saved to: /tmp/typescript-reports/errors-by-type.txt"
echo ""

echo "${BLUE}Step 4: Top 20 files with most errors...${NC}"
npm run type-check 2>&1 | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -20 > /tmp/typescript-reports/top-20-files.txt
cat /tmp/typescript-reports/top-20-files.txt
echo ""
echo "Full list saved to: /tmp/typescript-reports/top-20-files.txt"
echo ""

echo "${BLUE}Step 5: Testing individual directories...${NC}"
echo ""

echo "${YELLOW}Checking src/app/types/${NC}"
TYPE_ERRORS=$(npx tsc --noEmit src/app/types/**/*.ts 2>&1 | grep "error TS" | wc -l || echo "0")
echo "Types: ${TYPE_ERRORS} errors"

echo "${YELLOW}Checking src/app/utils/${NC}"
UTIL_ERRORS=$(npx tsc --noEmit src/app/utils/**/*.ts 2>&1 | grep "error TS" | wc -l || echo "0")
echo "Utils: ${UTIL_ERRORS} errors"

echo "${YELLOW}Checking src/app/hooks/${NC}"
HOOK_ERRORS=$(npx tsc --noEmit src/app/hooks/**/*.ts 2>&1 | grep "error TS" | wc -l || echo "0")
echo "Hooks: ${HOOK_ERRORS} errors"

echo "${YELLOW}Checking src/app/components/${NC}"
COMPONENT_ERRORS=$(npx tsc --noEmit src/app/components/**/*.tsx 2>&1 | grep "error TS" | wc -l || echo "0")
echo "Components: ${COMPONENT_ERRORS} errors"

echo "${YELLOW}Checking src/app/pages/${NC}"
PAGE_ERRORS=$(npx tsc --noEmit src/app/pages/**/*.tsx 2>&1 | grep "error TS" | wc -l || echo "0")
echo "Pages: ${PAGE_ERRORS} errors"

echo ""
echo "================================================================"
echo "Summary"
echo "================================================================"
echo ""
echo "Total errors: ${RED}$TOTAL_ERRORS${NC}"
echo ""
echo "By directory:"
echo "  Types:      $TYPE_ERRORS"
echo "  Utils:      $UTIL_ERRORS"
echo "  Hooks:      $HOOK_ERRORS"
echo "  Components: $COMPONENT_ERRORS"
echo "  Pages:      $PAGE_ERRORS"
echo ""
echo "Reports saved in: /tmp/typescript-reports/"
echo ""
echo "================================================================"
echo "Next Steps"
echo "================================================================"
echo ""
echo "1. Review the first 50 errors:"
echo "   cat /tmp/typescript-reports/first-50-errors.txt"
echo ""
echo "2. See error type breakdown:"
echo "   cat /tmp/typescript-reports/errors-by-type.txt"
echo ""
echo "3. See most problematic files:"
echo "   cat /tmp/typescript-reports/top-20-files.txt"
echo ""
echo "4. Generate full report:"
echo "   npm run type-check 2>&1 > /tmp/typescript-reports/full-report.txt"
echo ""
echo "5. Share the reports with me for targeted fixes!"
echo ""
