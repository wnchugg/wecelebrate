#!/bin/bash

echo "=== Misused Promises Analysis ==="
echo ""
echo "Total warnings:"
npm run lint 2>&1 | grep -c "@typescript-eslint/no-misused-promises"
echo ""
echo "Files with warnings:"
npm run lint 2>&1 | grep -B 1 "@typescript-eslint/no-misused-promises" | grep "^/" | sed 's|/Users/nicholuschugg/nicholus-chugg/jala2-app/||' | sort | uniq -c | sort -rn
echo ""
echo "Sample warnings (first 15):"
npm run lint 2>&1 | grep "@typescript-eslint/no-misused-promises" | head -15
