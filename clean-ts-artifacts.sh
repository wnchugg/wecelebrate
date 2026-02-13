#!/bin/bash

# TypeScript Build Artifacts Cleanup Script
# Removes stale .d.ts and .tsbuildinfo files that can cause TS6305 errors

echo "🧹 Cleaning TypeScript build artifacts..."

# Remove any stray .d.ts files in the root
echo "  → Removing root .d.ts files..."
rm -f vite.config.d.ts
rm -f vite.config.minimal.d.ts
rm -f vitest.config.d.ts
rm -f playwright.config.d.ts
rm -f *.d.ts 2>/dev/null

# Remove TypeScript build info files
echo "  → Removing .tsbuildinfo files..."
rm -rf node_modules/.tmp/*.tsbuildinfo 2>/dev/null
rm -f *.tsbuildinfo 2>/dev/null
rm -f tsconfig.tsbuildinfo 2>/dev/null

# Remove any accidentally generated .d.ts files in config directories
echo "  → Removing config .d.ts files..."
find . -maxdepth 1 -name "*.config.d.ts" -type f -delete 2>/dev/null
find . -maxdepth 1 -name "*.d.ts" -type f -delete 2>/dev/null

# Clean Vite cache
echo "  → Cleaning Vite cache..."
rm -rf node_modules/.vite 2>/dev/null

# Clean TypeScript cache
echo "  → Cleaning TypeScript cache..."
rm -rf .tsbuildinfo 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "Now run: npm run type-check"