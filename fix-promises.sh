#!/bin/bash

# Script to fix common promise-related linting issues
# This handles the most common patterns automatically

echo "Fixing common promise patterns..."

# Pattern 1: navigate() calls - add void operator
echo "1. Fixing navigate() calls..."
find src/app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/^\([[:space:]]*\)navigate(/\1void navigate(/g' \
  -e 's/\([[:space:]]\)navigate(/\1void navigate(/g' \
  {} +

# Pattern 2: clipboard.writeText() - add void operator
echo "2. Fixing clipboard.writeText() calls..."
find src/app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/^\([[:space:]]*\)navigator\.clipboard\.writeText(/\1void navigator.clipboard.writeText(/g' \
  -e 's/\([[:space:]]\)navigator\.clipboard\.writeText(/\1void navigator.clipboard.writeText(/g' \
  {} +

# Pattern 3: toast() calls that might be async - add void operator
echo "3. Fixing toast() calls..."
find src/app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/^\([[:space:]]*\)toast\.promise(/\1void toast.promise(/g' \
  {} +

# Pattern 4: Common async function calls in useEffect - add void operator
echo "4. Fixing common async calls in useEffect..."
find src/app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/^\([[:space:]]*\)checkConnection(/\1void checkConnection(/g' \
  -e 's/^\([[:space:]]*\)fetchData(/\1void fetchData(/g' \
  -e 's/^\([[:space:]]*\)loadData(/\1void loadData(/g' \
  -e 's/^\([[:space:]]*\)initialize(/\1void initialize(/g' \
  {} +

echo "Done! Run 'npm run lint' to check remaining issues."
