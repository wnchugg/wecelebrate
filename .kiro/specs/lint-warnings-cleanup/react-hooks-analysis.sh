#!/bin/bash

echo "=== React Hooks Exhaustive Deps Analysis ==="
echo ""
echo "Total warnings:"
npm run lint 2>&1 | grep -c "react-hooks/exhaustive-deps"
echo ""
echo "Top 20 files with most warnings:"
npm run lint 2>&1 | grep -B 1 "react-hooks/exhaustive-deps" | grep "^/" | sed 's|/Users/nicholuschugg/nicholus-chugg/jala2-app/||' | sort | uniq -c | sort -rn | head -20
echo ""
echo "Sample warnings (first 10):"
npm run lint 2>&1 | grep "react-hooks/exhaustive-deps" | head -10
