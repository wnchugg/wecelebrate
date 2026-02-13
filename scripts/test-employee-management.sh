#!/bin/bash

# Employee Management Test Runner
# Runs all tests related to employee management and allowed domains

echo "🧪 Running Employee Management Tests..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}1. Frontend Service Tests (employeeApi)${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
npm test -- src/app/services/__tests__/employeeApi.test.ts --run --reporter=verbose
if [ $? -eq 0 ]; then
    echo "${GREEN}✓ Frontend Service Tests Passed${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 11))
else
    echo "${RED}✗ Frontend Service Tests Failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 11))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 11))
echo ""

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}2. Backend API Tests (employee_management)${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
npm test -- supabase/functions/server/tests/employee_management.test.ts --run --reporter=verbose
if [ $? -eq 0 ]; then
    echo "${GREEN}✓ Backend API Tests Passed${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 31))
else
    echo "${RED}✗ Backend API Tests Failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 31))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 31))
echo ""

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}3. Component Integration Tests (AccessManagement)${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
npm test -- src/app/pages/admin/__tests__/AccessManagement.test.tsx --run --reporter=verbose
if [ $? -eq 0 ]; then
    echo "${GREEN}✓ Component Integration Tests Passed${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 24))
else
    echo "${RED}✗ Component Integration Tests Failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 24))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 24))
echo ""

# Summary
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}Test Summary${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Total Tests: ${TOTAL_TESTS}"
echo "${GREEN}Passed: ${PASSED_TESTS}${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
    echo "${RED}Failed: ${FAILED_TESTS}${NC}"
fi
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "${GREEN}✓ All Employee Management Tests Passed! 🎉${NC}"
    exit 0
else
    echo "${RED}✗ Some tests failed. Please review the output above.${NC}"
    exit 1
fi
