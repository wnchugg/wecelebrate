#!/bin/bash

echo "=== Current Lint Warning State Analysis ==="
echo ""
echo "Generating comprehensive warning breakdown..."
echo ""

# Run lint and capture output
LINT_OUTPUT=$(npm run lint 2>&1)

# Count each rule type
echo "Warning counts by rule:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Critical type safety issues
echo ""
echo "🔴 CRITICAL - Type Safety (Root Causes):"
EXPLICIT_ANY=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-explicit-any" || echo "0")
echo "  @typescript-eslint/no-explicit-any: $EXPLICIT_ANY"

echo ""
echo "🔴 CRITICAL - Promise Handling:"
FLOATING=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-floating-promises" || echo "0")
MISUSED=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-misused-promises" || echo "0")
echo "  @typescript-eslint/no-floating-promises: $FLOATING"
echo "  @typescript-eslint/no-misused-promises: $MISUSED"

echo ""
echo "🔴 CRITICAL - React Hooks:"
HOOKS=$(echo "$LINT_OUTPUT" | grep -c "react-hooks/exhaustive-deps" || echo "0")
echo "  react-hooks/exhaustive-deps: $HOOKS"

echo ""
echo "🟠 HIGH - Type Safety (Cascading from any):"
UNSAFE_MEMBER=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-unsafe-member-access" || echo "0")
UNSAFE_ASSIGN=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-unsafe-assignment" || echo "0")
UNSAFE_ARG=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-unsafe-argument" || echo "0")
UNSAFE_CALL=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-unsafe-call" || echo "0")
UNSAFE_RETURN=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-unsafe-return" || echo "0")
echo "  @typescript-eslint/no-unsafe-member-access: $UNSAFE_MEMBER"
echo "  @typescript-eslint/no-unsafe-assignment: $UNSAFE_ASSIGN"
echo "  @typescript-eslint/no-unsafe-argument: $UNSAFE_ARG"
echo "  @typescript-eslint/no-unsafe-call: $UNSAFE_CALL"
echo "  @typescript-eslint/no-unsafe-return: $UNSAFE_RETURN"

echo ""
echo "🟡 MEDIUM - Code Quality:"
UNUSED_VARS=$(echo "$LINT_OUTPUT" | grep -c "unused-imports/no-unused-vars" || echo "0")
UNUSED_IMPORTS=$(echo "$LINT_OUTPUT" | grep -c "unused-imports/no-unused-imports" || echo "0")
REACT_REFRESH=$(echo "$LINT_OUTPUT" | grep -c "react-refresh/only-export-components" || echo "0")
echo "  unused-imports/no-unused-vars: $UNUSED_VARS"
echo "  unused-imports/no-unused-imports: $UNUSED_IMPORTS"
echo "  react-refresh/only-export-components: $REACT_REFRESH"

echo ""
echo "🟢 LOW - Minor Issues:"
REQUIRE_AWAIT=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/require-await" || echo "0")
UNNECESSARY_ASSERTION=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-unnecessary-type-assertion" || echo "0")
BASE_TO_STRING=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-base-to-string" || echo "0")
REDUNDANT_TYPE=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-redundant-type-constituents" || echo "0")
EMPTY_OBJECT=$(echo "$LINT_OUTPUT" | grep -c "@typescript-eslint/no-empty-object-type" || echo "0")
echo "  @typescript-eslint/require-await: $REQUIRE_AWAIT"
echo "  @typescript-eslint/no-unnecessary-type-assertion: $UNNECESSARY_ASSERTION"
echo "  @typescript-eslint/no-base-to-string: $BASE_TO_STRING"
echo "  @typescript-eslint/no-redundant-type-constituents: $REDUNDANT_TYPE"
echo "  @typescript-eslint/no-empty-object-type: $EMPTY_OBJECT"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Calculate totals
CRITICAL=$((EXPLICIT_ANY + FLOATING + MISUSED + HOOKS))
HIGH=$((UNSAFE_MEMBER + UNSAFE_ASSIGN + UNSAFE_ARG + UNSAFE_CALL + UNSAFE_RETURN))
MEDIUM=$((UNUSED_VARS + UNUSED_IMPORTS + REACT_REFRESH))
LOW=$((REQUIRE_AWAIT + UNNECESSARY_ASSERTION + BASE_TO_STRING + REDUNDANT_TYPE + EMPTY_OBJECT))
TOTAL=$((CRITICAL + HIGH + MEDIUM + LOW))

echo "Summary by Priority:"
echo "  🔴 CRITICAL: $CRITICAL warnings"
echo "  🟠 HIGH:     $HIGH warnings"
echo "  🟡 MEDIUM:   $MEDIUM warnings"
echo "  🟢 LOW:      $LOW warnings"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 TOTAL:    $TOTAL warnings"
echo ""

# Compare to original baseline
echo "Progress vs Original Baseline (5,149 warnings):"
FIXED=$((5149 - TOTAL))
PERCENT=$((FIXED * 100 / 5149))
echo "  Fixed: $FIXED warnings ($PERCENT%)"
echo "  Remaining: $TOTAL warnings"
echo ""
