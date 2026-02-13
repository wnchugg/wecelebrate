#!/bin/bash

# TypeScript Error Batch Fix Script
# Run this to systematically fix the ~900 remaining errors

echo "========================================="
echo "TypeScript Batch Fix Automation"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Count errors function
count_errors() {
    npm run type-check 2>&1 | grep "error TS" | wc -l
}

echo "Initial error count:"
INITIAL_ERRORS=$(count_errors)
echo -e "${RED}$INITIAL_ERRORS errors${NC}"
echo ""

# ============================================================================
# BATCH 1: Replace useEffect missing returns (~30-50 errors)
# ============================================================================
echo "========================================="
echo "BATCH 1: Fixing useEffect returns"
echo "========================================="
echo ""

echo "Finding useEffect patterns that need fixing..."

# This is a complex pattern that needs manual review
# Showing files that likely need fixes
echo "Files with useEffect that may need fixes:"
grep -r "useEffect(() => {" /src --include="*.tsx" --include="*.ts" | wc -l

echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "   Run: npm run type-check 2>&1 | grep 'TS7030'"
echo "   Fix each useEffect to return undefined or cleanup function"
echo ""

read -p "Press Enter when ready to continue..."

# ============================================================================
# BATCH 2: Add missing return type annotations (~30 errors)
# ============================================================================
echo "========================================="
echo "BATCH 2: Finding functions missing return types"
echo "========================================="
echo ""

echo "Functions with missing return types:"
npm run type-check 2>&1 | grep "TS7010" | head -20

echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "   Run: npm run type-check 2>&1 | grep 'TS7010'"
echo "   Add explicit return type annotations to each function"
echo ""

read -p "Press Enter when ready to continue..."

# ============================================================================
# BATCH 3: Fix React Hook Form types (~10-20 errors)
# ============================================================================
echo "========================================="
echo "BATCH 3: Fix React Hook Form imports"
echo "========================================="
echo ""

echo "Checking for React Hook Form resolver issues..."
grep -r "zodResolver" /src --include="*.tsx" --include="*.ts" | wc -l

echo ""
echo "✅ Ensure @hookform/resolvers is installed"
echo "   npm install @hookform/resolvers"
echo ""

read -p "Press Enter when ready to continue..."

# ============================================================================
# BATCH 4: Check current progress
# ============================================================================
echo "========================================="
echo "Progress Check"
echo "========================================="
echo ""

CURRENT_ERRORS=$(count_errors)
FIXED=$((INITIAL_ERRORS - CURRENT_ERRORS))

echo -e "Initial errors:  ${RED}$INITIAL_ERRORS${NC}"
echo -e "Current errors:  ${YELLOW}$CURRENT_ERRORS${NC}"
echo -e "Fixed so far:    ${GREEN}$FIXED${NC}"
echo ""

if [ $FIXED -gt 0 ]; then
    PERCENT=$((100 * FIXED / INITIAL_ERRORS))
    echo -e "${GREEN}Progress: $PERCENT% complete${NC}"
else
    echo -e "${YELLOW}No automated fixes applied yet${NC}"
fi

echo ""
echo "========================================="
echo "Next Steps"
echo "========================================="
echo ""

echo "1. Fix high-impact files manually:"
echo "   - /src/app/utils/testUtils.ts (DONE ✅)"
echo "   - Test files with jest references"
echo "   - Components with useEffect issues"
echo ""

echo "2. Run targeted type checks:"
echo "   npx tsc --noEmit src/app/components/**/*.tsx"
echo "   npx tsc --noEmit src/app/pages/**/*.tsx"
echo "   npx tsc --noEmit src/app/hooks/**/*.ts"
echo ""

echo "3. Fix by error type:"
echo "   npm run type-check 2>&1 | grep 'TS2339' > property-errors.log"
echo "   npm run type-check 2>&1 | grep 'TS2322' > type-assignment-errors.log"
echo ""

echo "4. Generate full error report:"
echo "   npm run type-check 2>&1 > typescript-errors-full.log"
echo ""

echo "========================================="
echo "Script complete!"
echo "========================================="
