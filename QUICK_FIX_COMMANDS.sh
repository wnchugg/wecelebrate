#!/bin/bash
# TypeScript Quick Fix Commands
# Run these to continue fixing the remaining ~580 errors

echo "========================================="
echo "TypeScript Error Fix - Quick Commands"
echo "========================================="
echo ""

# Phase 2: Test Utilities (30-45 min, ~100 errors)
echo "Phase 2: Fix Test Utilities"
echo "----------------------------"
echo ""

echo "1. Replace jest.fn() with vi.fn():"
echo "   find src/ -type f \( -name '*.test.ts' -o -name '*.test.tsx' \) -print0 | xargs -0 sed -i.bak 's/jest\.fn()/vi.fn()/g'"
echo ""

echo "2. Replace jest.Mock with vi.Mock (careful - review manually):"
echo "   find src/ -type f \( -name '*.test.ts' -o -name '*.test.tsx' -o -name 'testUtils.ts' \) -print0 | xargs -0 sed -i.bak 's/jest\.Mock/vi.Mock/g'"
echo ""

echo "3. Replace jest.SpyInstance with vi.SpyInstance:"
echo "   find src/ -type f \( -name '*.test.ts' -o -name '*.test.tsx' -o -name 'testUtils.ts' \) -print0 | xargs -0 sed -i.bak 's/jest\.SpyInstance/vi.SpyInstance/g'"
echo ""

echo "4. Check remaining jest references:"
echo "   grep -r 'jest\.' src/ --include='*.ts' --include='*.tsx' | wc -l"
echo ""

# Phase 3: useEffect Returns (15-20 min, ~30 errors)
echo "Phase 3: Fix useEffect Returns"
echo "-------------------------------"
echo ""

echo "1. Find all problematic useEffect calls:"
echo "   npm run type-check 2>&1 | grep 'TS7030'"
echo ""

echo "2. Pattern to fix manually in each file:"
echo "   // Change:"
echo "   useEffect(() => {"
echo "     if (!condition) return;"
echo "   }, [deps]);"
echo ""
echo "   // To:"
echo "   useEffect(() => {"
echo "     if (!condition) return undefined;"
echo "     return undefined; // or cleanup function"
echo "   }, [deps]);"
echo ""

# Phase 4: Add Return Types (20-30 min, ~30 errors)
echo "Phase 4: Add Return Type Annotations"
echo "-------------------------------------"
echo ""

echo "1. Find all functions missing return types:"
echo "   npm run type-check 2>&1 | grep 'TS7010'"
echo ""

echo "2. Add return types manually to each function"
echo ""

# Validation Commands
echo "========================================="
echo "Validation Commands"
echo "========================================="
echo ""

echo "Count total remaining errors:"
echo "  npm run type-check 2>&1 | grep 'error TS' | wc -l"
echo ""

echo "Count by error type:"
echo "  npm run type-check 2>&1 | grep 'error TS' | cut -d':' -f4 | cut -d' ' -f2 | sort | uniq -c | sort -rn"
echo ""

echo "Check specific error pattern:"
echo "  npm run type-check 2>&1 | grep 'TS7030' | wc -l  # useEffect returns"
echo "  npm run type-check 2>&1 | grep 'TS7010' | wc -l  # Missing return types"
echo "  npm run type-check 2>&1 | grep 'TS2339' | wc -l  # Property doesn't exist"
echo "  npm run type-check 2>&1 | grep 'TS2322' | wc -l  # Type assignment"
echo ""

echo "Check specific file:"
echo "  npx tsc --noEmit src/path/to/file.tsx"
echo ""

# Backup Commands
echo "========================================="
echo "Backup & Safety Commands"
echo "========================================="
echo ""

echo "Create backup before batch changes:"
echo "  tar -czf typescript-fixes-backup-$(date +%Y%m%d-%H%M%S).tar.gz src/"
echo ""

echo "Restore from backup:"
echo "  tar -xzf typescript-fixes-backup-TIMESTAMP.tar.gz"
echo ""

# Git Commands
echo "========================================="
echo "Git Commands"
echo "========================================="
echo ""

echo "Create checkpoint after each phase:"
echo "  git add ."
echo "  git commit -m 'TypeScript fixes: Phase X complete - Y errors fixed'"
echo ""

echo "Show files changed:"
echo "  git status --short"
echo ""

# Progress Tracking
echo "========================================="
echo "Progress Tracking"
echo "========================================="
echo ""

echo "Track progress:"
echo "  echo 'Before Phase X:' && npm run type-check 2>&1 | grep 'error TS' | wc -l"
echo "  # ... make changes ..."
echo "  echo 'After Phase X:' && npm run type-check 2>&1 | grep 'error TS' | wc -l"
echo ""

echo "Generate error report:"
echo "  npm run type-check 2>&1 | grep 'error TS' > typescript-errors-$(date +%Y%m%d).log"
echo ""

# Specific File Fixes
echo "========================================="
echo "Specific Problem Files"
echo "========================================="
echo ""

echo "Most error-prone files (fix these for big impact):"
echo "  1. src/app/utils/testUtils.ts (~29 errors)"
echo "  2. src/app/components/admin/__tests__/DataTable.test.tsx (~40 errors)"
echo "  3. src/app/pages/admin/*.tsx (various, ~100 total)"
echo "  4. src/app/hooks/__tests__/*.test.ts (various, ~50 total)"
echo ""

echo "Fix testUtils.ts first:"
echo "  code src/app/utils/testUtils.ts"
echo ""

# Final Check
echo "========================================="
echo "Final Validation"
echo "========================================="
echo ""

echo "Run full type check:"
echo "  npm run type-check"
echo ""

echo "Run tests to ensure no runtime breakage:"
echo "  npm test"
echo ""

echo "Check for any remaining issues:"
echo "  npm run lint"
echo ""

echo "========================================="
echo "Ready to continue! Start with Phase 2."
echo "========================================="
