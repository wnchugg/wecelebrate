#!/bin/bash

# Kill all Vitest processes
# Usage: ./scripts/kill-vitest.sh

echo "🔍 Searching for Vitest processes..."

# Find and kill all node processes running vitest (exclude this script and grep)
VITEST_PIDS=$(ps aux | grep -i "node.*vitest" | grep -v "grep" | grep -v "kill-vitest" | awk '{print $2}')

if [ -z "$VITEST_PIDS" ]; then
  echo "✓ No Vitest processes found"
  exit 0
fi

echo "Found Vitest processes:"
ps aux | grep -i "node.*vitest" | grep -v "grep" | grep -v "kill-vitest"
echo ""

echo "Killing processes: $VITEST_PIDS"
echo "$VITEST_PIDS" | xargs kill -9 2>/dev/null

echo "✓ All Vitest processes terminated"
