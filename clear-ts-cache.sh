#!/bin/bash

# Clear TypeScript build cache
echo "🧹 Clearing TypeScript build cache..."

# Remove build info files
rm -rf node_modules/.tmp/*.tsbuildinfo 2>/dev/null || true
rm -f tsconfig.tsbuildinfo 2>/dev/null || true
rm -f tsconfig.node.tsbuildinfo 2>/dev/null || true
rm -f *.tsbuildinfo 2>/dev/null || true

# Remove any stray declaration files
rm -f vite.config.d.ts 2>/dev/null || true
rm -f vite.config.minimal.d.ts 2>/dev/null || true
rm -f vitest.config.d.ts 2>/dev/null || true

# Remove Vite cache
rm -rf node_modules/.vite 2>/dev/null || true

echo "✅ Cache cleared!"
echo ""
echo "Now run: npm run type-check"
