#!/bin/bash

# Fix Regex Issues in security.ts
# Fixes three double-backslash regex patterns

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FILE="supabase/functions/server/security.ts"

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Fix security.ts Regex Issues${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo -e "${RED}✗${NC} Error: $FILE not found!"
    exit 1
fi

# Create backup
BACKUP="${FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$FILE" "$BACKUP"
echo -e "${GREEN}✓${NC} Backup created: $BACKUP"
echo ""

# Count issues before
ISSUES_BEFORE=$(grep -c '\\\\w\|\\\\D\|\\\\\\.' "$FILE" || true)
echo -e "${YELLOW}→${NC} Found $ISSUES_BEFORE regex issues with double backslashes"
echo ""

# Fix 1: Line ~156 - String sanitization (on\w+= event handler remover)
echo -e "${YELLOW}→${NC} Fixing: .replace(/on\\\\w+=/gi, '') → .replace(/on\\w+=/gi, '')"
sed -i 's|/on\\\\w+=/gi|/on\\w+=/gi|g' "$FILE"

# Fix 2: Line ~276 - Email validation regex (\. should be \.)
echo -e "${YELLOW}→${NC} Fixing: Email regex \\\\. → \\."
sed -i 's|\\\\\\.|\\.|g' "$FILE"

# Fix 3: Line ~338 - Phone validation (\\D should be \D)
echo -e "${YELLOW}→${NC} Fixing: .replace(/\\\\D/g, '') → .replace(/\\D/g, '')"
sed -i 's|/\\\\\\\\D/g|/\\D/g|g' "$FILE"

echo ""

# Count issues after
ISSUES_AFTER=$(grep -c '\\\\w\|\\\\D\|\\\\\\.' "$FILE" || true)

if [ "$ISSUES_AFTER" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} All regex issues fixed!"
    echo ""
    echo "Changes made:"
    echo "  - Fixed on\\w+= pattern in string sanitization"
    echo "  - Fixed \\. pattern in email validation"
    echo "  - Fixed \\D pattern in phone validation"
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}   Success! Ready to redeploy${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review changes: diff $BACKUP $FILE"
    echo "  2. Deploy to dev: ./scripts/redeploy-backend.sh dev"
    echo "  3. Test login at: http://localhost:5173/admin/login"
    echo ""
else
    echo -e "${RED}✗${NC} Warning: $ISSUES_AFTER issues still remain"
    echo ""
    echo "Remaining issues:"
    grep -n '\\\\w\|\\\\D\|\\\\\\.' "$FILE" || true
    echo ""
    echo "You can restore the backup if needed:"
    echo "  cp $BACKUP $FILE"
    exit 1
fi
