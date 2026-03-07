#!/bin/bash
# Extract all floating promise warnings with file paths and line numbers
npm run lint 2>&1 | grep -B1 "@typescript-eslint/no-floating-promises" | grep -E "^/" | sed 's|/Users/nicholuschugg/nicholus-chugg/jala2-app/||' | while read line; do
  file=$(echo "$line" | awk '{print $1}')
  echo "$file"
done | sort -u
