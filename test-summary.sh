#!/bin/bash
echo "=== Test Summary from test-results-final.log ==="
echo ""
echo "Failed Test Files:"
grep "tests |" test-results-final.log | grep "failed" | sed 's/^[[:space:]]*//' | head -25
echo ""
echo "Statistics:"
failed_files=$(grep "tests |" test-results-final.log | grep "failed" | wc -l | tr -d ' ')
passed_files=$(grep "tests)" test-results-final.log | grep -v "failed" | wc -l | tr -d ' ')
echo "Test files with failures: $failed_files"
echo "Test files passing: $passed_files"
echo "Total test files: $((failed_files + passed_files))"
