#!/bin/bash

# Comprehensive Test Runner
# Runs all tests with their respective test runners
# Usage: ./test-all.sh [--verbose] [--coverage]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
VERBOSE=false
COVERAGE=false
FAILED_TESTS=()

# Parse arguments
for arg in "$@"; do
  case $arg in
    --verbose)
      VERBOSE=true
      shift
      ;;
    --coverage)
      COVERAGE=true
      shift
      ;;
    --help)
      echo "Usage: ./test-all.sh [--verbose] [--coverage]"
      echo ""
      echo "Options:"
      echo "  --verbose   Show detailed test output"
      echo "  --coverage  Generate coverage reports"
      echo "  --help      Show this help message"
      exit 0
      ;;
  esac
done

# Print header
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Comprehensive Test Suite - All Test Runners           ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Track overall results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_SUITES=0

# Function to run a test suite
run_test_suite() {
  local name=$1
  local command=$2
  local description=$3
  
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Running: ${name}${NC}"
  echo -e "${BLUE}Description: ${description}${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  
  if $VERBOSE; then
    if eval "$command"; then
      echo -e "${GREEN}✓ ${name} passed${NC}"
      echo ""
      return 0
    else
      echo -e "${RED}✗ ${name} failed${NC}"
      FAILED_TESTS+=("$name")
      echo ""
      return 1
    fi
  else
    if eval "$command" > /tmp/test-output-$$.log 2>&1; then
      echo -e "${GREEN}✓ ${name} passed${NC}"
      
      # Extract test counts if available
      if grep -q "Test Files" /tmp/test-output-$$.log; then
        grep "Test Files\|Tests" /tmp/test-output-$$.log | tail -2
      fi
      echo ""
      rm -f /tmp/test-output-$$.log
      return 0
    else
      echo -e "${RED}✗ ${name} failed${NC}"
      echo ""
      echo "Last 20 lines of output:"
      tail -20 /tmp/test-output-$$.log
      echo ""
      FAILED_TESTS+=("$name")
      rm -f /tmp/test-output-$$.log
      return 1
    fi
  fi
}

# 1. Vitest Tests (Main Test Suite)
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  1. Vitest Tests (Frontend & Backend Logic)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if $COVERAGE; then
  VITEST_CMD="npm run test:coverage"
else
  VITEST_CMD="npm run test:safe"
fi

if run_test_suite "Vitest Tests" "$VITEST_CMD" "All Vitest-compatible tests (123 files, 2859 tests)"; then
  ((PASSED_TESTS++))
else
  ((FAILED_SUITES++))
fi

# 2. Playwright E2E Tests
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  2. Playwright E2E Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if command -v playwright &> /dev/null || [ -f "node_modules/.bin/playwright" ]; then
  if run_test_suite "Playwright E2E" "npm run test:e2e" "End-to-end tests with Playwright"; then
    ((PASSED_TESTS++))
  else
    ((FAILED_SUITES++))
  fi
else
  echo -e "${YELLOW}⚠ Playwright not found - skipping E2E tests${NC}"
  echo -e "${YELLOW}  Install with: npx playwright install${NC}"
  echo ""
fi

# 3. Deno Backend Tests
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  3. Deno Backend Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check for Deno in common locations
DENO_CMD=""
if command -v deno &> /dev/null; then
  DENO_CMD="deno"
elif [ -f "$HOME/.deno/bin/deno" ]; then
  DENO_CMD="$HOME/.deno/bin/deno"
fi

if [ -n "$DENO_CMD" ]; then
  # Dashboard API Tests
  if [ -f "supabase/functions/server/tests/dashboard_api.test.ts" ]; then
    if run_test_suite "Deno: Dashboard API" \
      "cd supabase/functions/server/tests && DENO_TLS_CA_STORE=system $DENO_CMD test --allow-net --allow-env --no-check dashboard_api.test.ts" \
      "Dashboard analytics API tests (30 tests)"; then
      ((PASSED_TESTS++))
    else
      ((FAILED_SUITES++))
    fi
  fi
  
  # Helpers Tests
  if [ -f "supabase/functions/server/tests/helpers.test.ts" ]; then
    if run_test_suite "Deno: Helpers" \
      "cd supabase/functions/server/tests && DENO_TLS_CA_STORE=system $DENO_CMD test --allow-net --allow-env --no-check helpers.test.ts" \
      "Backend helper function tests"; then
      ((PASSED_TESTS++))
    else
      ((FAILED_SUITES++))
    fi
  fi
  
  # Validation Tests
  if [ -f "supabase/functions/server/tests/validation.test.ts" ]; then
    if run_test_suite "Deno: Validation" \
      "cd supabase/functions/server/tests && DENO_TLS_CA_STORE=system $DENO_CMD test --allow-net --allow-env --no-check validation.test.ts" \
      "Backend validation function tests"; then
      ((PASSED_TESTS++))
    else
      ((FAILED_SUITES++))
    fi
  fi
else
  echo -e "${YELLOW}⚠ Deno not found - skipping Deno backend tests${NC}"
  echo -e "${YELLOW}  Install from: https://deno.land/#installation${NC}"
  echo ""
fi

# 4. Type Checking
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  4. TypeScript Type Checking${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if run_test_suite "Type Check" "npm run type-check" "TypeScript type checking"; then
  ((PASSED_TESTS++))
else
  ((FAILED_SUITES++))
fi

# 5. Linting
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  5. ESLint Code Quality${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if run_test_suite "Lint Check" "npm run lint" "ESLint code quality checks"; then
  ((PASSED_TESTS++))
else
  ((FAILED_SUITES++))
fi

# Print Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                        Test Summary                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL_SUITES=$((PASSED_TESTS + FAILED_SUITES))

if [ $FAILED_SUITES -eq 0 ]; then
  echo -e "${GREEN}✓ All test suites passed! (${PASSED_TESTS}/${TOTAL_SUITES})${NC}"
  echo ""
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                    🎉 SUCCESS! 🎉                              ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}✗ ${FAILED_SUITES} test suite(s) failed${NC}"
  echo -e "${GREEN}✓ ${PASSED_TESTS} test suite(s) passed${NC}"
  echo ""
  
  if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    echo -e "${RED}Failed test suites:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
      echo -e "${RED}  - ${test}${NC}"
    done
    echo ""
  fi
  
  echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║                      TESTS FAILED                              ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
