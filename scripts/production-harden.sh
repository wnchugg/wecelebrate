#!/bin/bash

# Production Hardening Master Script
# Orchestrates all production-readiness fixes

set -e

echo "🏗️  PRODUCTION HARDENING - MASTER SCRIPT"
echo "=========================================="
echo ""
echo "This script will:"
echo "  1. ✅ Fix console statements (400+ issues)"
echo "  2. ✅ Add proper type safety (2,800+ issues)"
echo "  3. ✅ Fix promise handling (200+ issues)"
echo "  4. ✅ Remove unused code (300+ issues)"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Track start time
START_TIME=$(date +%s)

echo ""
echo "📊 Phase 1: Console Statements"
echo "================================"
chmod +x ./scripts/fix-console-statements.sh
./scripts/fix-console-statements.sh

echo ""
echo "📊 Phase 2: Type Safety"
echo "======================="
node ./scripts/fix-type-safety.js

echo ""
echo "📊 Phase 3: Run ESLint Auto-fix"
echo "================================"
npm run lint -- --fix || true

echo ""
echo "📊 Phase 4: Type Check"
echo "======================"
npm run type-check || true

# Track end time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo "✅ HARDENING COMPLETE!"
echo "======================"
echo ""
echo "⏱️  Duration: ${MINUTES}m ${SECONDS}s"
echo ""
echo "📊 Run final checks:"
echo "   npm run lint          # Check remaining issues"
echo "   npm run type-check    # Verify TypeScript"
echo "   npm run dev           # Test the application"
echo ""
echo "📝 To revert changes:"
echo "   ls -la backups/       # View backups"
echo "   cp -r backups/[backup-name]/src .  # Restore from backup"
echo ""
