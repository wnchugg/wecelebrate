#!/bin/bash

echo "=== Unsafe Member Access Analysis ==="
echo ""
echo "Total warnings:"
npm run lint 2>&1 | grep -c "@typescript-eslint/no-unsafe-member-access"
echo ""
echo "Top 20 files with most warnings:"
npm run lint 2>&1 | grep -B 1 "@typescript-eslint/no-unsafe-member-access" | grep "^/" | sed 's|/Users/nicholuschugg/nicholus-chugg/jala2-app/||' | sort | uniq -c | sort -rn | head -20
echo ""
echo "Sample warnings (first 10):"
npm run lint 2>&1 | grep "@typescript-eslint/no-unsafe-member-access" | head -10
