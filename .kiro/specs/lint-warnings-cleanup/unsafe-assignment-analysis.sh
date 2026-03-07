#!/bin/bash

echo "=== Unsafe Assignment Analysis ==="
echo ""
echo "Total warnings:"
npm run lint 2>&1 | grep -c "@typescript-eslint/no-unsafe-assignment"
echo ""
echo "Top 20 files with most warnings:"
npm run lint 2>&1 | grep -B 1 "@typescript-eslint/no-unsafe-assignment" | grep "^/" | sed 's|/Users/nicholuschugg/nicholus-chugg/jala2-app/||' | sort | uniq -c | sort -rn | head -20
echo ""
echo "Pattern breakdown:"
echo "- Array destructuring:"
npm run lint 2>&1 | grep "@typescript-eslint/no-unsafe-assignment" | grep -c "array destructuring"
echo "- Direct assignment:"
npm run lint 2>&1 | grep "@typescript-eslint/no-unsafe-assignment" | grep -c "Unsafe assignment of an"
