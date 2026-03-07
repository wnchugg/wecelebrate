#!/bin/bash

# Script to systematically fix explicit any types
# This will process files in batches and track progress

echo "Starting systematic fix of explicit any types..."
echo "Current count:"
npm run lint 2>&1 | grep -c "@typescript-eslint/no-explicit-any"

# Create a list of files with any warnings
npm run lint 2>&1 | grep -B1 "@typescript-eslint/no-explicit-any" | grep "^/" | sed 's|/Users/nicholuschugg/nicholus-chugg/jala2-app/||' | sort -u > /tmp/files-with-any.txt

echo ""
echo "Files to fix: $(wc -l < /tmp/files-with-any.txt)"
echo ""
echo "Top 20 files by warning count:"
python3 parse_lint.py | head -25
