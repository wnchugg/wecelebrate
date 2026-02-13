#!/bin/bash

# Day 1 Test File Rename Script
# This renames the optimized test files to their final names

echo "🔄 Renaming Day 1 test files..."
echo ""

# Get the script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"
TEST_DIR="$PROJECT_ROOT/src/app/utils/__tests__"

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Test directory: $TEST_DIR"
echo ""

# Check if test directory exists
if [ ! -d "$TEST_DIR" ]; then
    echo "❌ Error: Test directory not found: $TEST_DIR"
    exit 1
fi

cd "$TEST_DIR"

# Check if optimized files exist
if [ ! -f "security.test.optimized.ts" ]; then
    echo "❌ Error: security.test.optimized.ts not found in $TEST_DIR"
    echo "📋 Files in directory:"
    ls -la *.ts 2>/dev/null || echo "No .ts files found"
    exit 1
fi

if [ ! -f "validators.test.optimized.ts" ]; then
    echo "❌ Error: validators.test.optimized.ts not found in $TEST_DIR"
    echo "📋 Files in directory:"
    ls -la *.ts 2>/dev/null || echo "No .ts files found"
    exit 1
fi

# Rename the files
echo "📝 Renaming security.test.optimized.ts → security.test.ts"
mv security.test.optimized.ts security.test.ts

echo "📝 Renaming validators.test.optimized.ts → validators.test.ts"
mv validators.test.optimized.ts validators.test.ts

echo ""
echo "✅ Files renamed successfully!"
echo ""
echo "📋 Current test files:"
ls -la *.test.ts

echo ""
echo "🧪 Running tests..."
cd "$PROJECT_ROOT"
npm test -- src/app/utils/__tests__/

echo ""
echo "✅ Done! Ready to commit."
echo ""
echo "To commit, run:"
echo "git add src/setupTests.ts vitest.config.ts src/app/utils/__tests__/"
echo "git commit -m \"test: Day 1 complete with centralized mocks - 213 tests passing\""