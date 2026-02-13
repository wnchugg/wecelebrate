#!/bin/bash

# 🚀 SIMPLE TYPESCRIPT DIAGNOSTIC
# Just copy/paste this entire script into your terminal

echo "=================================================="
echo "🔍 TypeScript Quick Diagnostic"
echo "=================================================="
echo ""

# Count errors
echo "📊 Total Errors:"
npm run type-check 2>&1 | grep "error TS" | wc -l
echo ""

# First 20 errors
echo "=================================================="
echo "📋 First 20 Errors:"
echo "=================================================="
npm run type-check 2>&1 | grep "error TS" | head -20
echo ""

# Top 10 files
echo "=================================================="
echo "📁 Top 10 Files with Most Errors:"
echo "=================================================="
npm run type-check 2>&1 | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -10
echo ""

# Error types
echo "=================================================="
echo "🔢 Error Types:"
echo "=================================================="
npm run type-check 2>&1 | grep "error TS" | sed 's/.*error \(TS[0-9]*\).*/\1/' | sort | uniq -c | sort -rn | head -10
echo ""

echo "=================================================="
echo "✅ Done! Share this output with me."
echo "=================================================="
