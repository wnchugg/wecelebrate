#!/bin/bash

# Systematic Test Runner for wecelebrate Platform
# Usage: ./run-systematic-tests.sh [category]
# Example: ./run-systematic-tests.sh ui-components

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test categories
declare -A TEST_CATEGORIES=(
  ["type-tests"]="src/app/types/__tests__/ src/types/__tests__/"
  ["utils"]="src/app/utils/__tests__/"
  ["ui-components"]="src/app/components/ui/__tests__/"
  ["app-components"]="src/app/components/__tests__/"
  ["admin-components"]="src/app/components/admin/__tests__/"
  ["contexts"]="src/app/context/__tests__/"
  ["pages-user"]="src/app/pages/__tests__/"
  ["pages-admin"]="src/app/pages/admin/__tests__/"
  ["services"]="src/app/services/__tests__/ src/services/__tests__/"
  ["hooks"]="src/app/hooks/__tests__/"
  ["integration"]="src/app/__tests__/"
  ["backend"]="supabase/functions/server/tests/"
)

# Priority order
PRIORITY_ORDER=(
  "type-tests"
  "utils"
  "ui-components"
  "app-components"
  "admin-components"
  "contexts"
  "services"
  "hooks"
  "pages-user"
  "pages-admin"
  "integration"
  "backend"
)

# Function to print header
print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

# Function to print success
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print info
print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to run tests for a category
run_category() {
  local category=$1
  local paths=${TEST_CATEGORIES[$category]}
  
  if [ -z "$paths" ]; then
    print_error "Unknown category: $category"
    echo "Available categories: ${!TEST_CATEGORIES[@]}"
    return 1
  fi
  
  print_header "Testing: $category"
  print_info "Test paths: $paths"
  echo ""
  
  # Run the tests
  if npm test $paths; then
    print_success "Category '$category' PASSED!"
    return 0
  else
    print_error "Category '$category' FAILED!"
    return 1
  fi
}

# Function to run all categories in priority order
run_all_categories() {
  local total=${#PRIORITY_ORDER[@]}
  local passed=0
  local failed=0
  local failed_categories=()
  
  print_header "Running All Test Categories in Priority Order"
  print_info "Total categories: $total"
  echo ""
  
  for category in "${PRIORITY_ORDER[@]}"; do
    if run_category "$category"; then
      ((passed++))
    else
      ((failed++))
      failed_categories+=("$category")
    fi
    echo ""
  done
  
  # Print summary
  print_header "Test Execution Summary"
  echo "Total Categories: $total"
  print_success "Passed: $passed"
  
  if [ $failed -gt 0 ]; then
    print_error "Failed: $failed"
    echo ""
    print_error "Failed Categories:"
    for cat in "${failed_categories[@]}"; do
      echo "  - $cat"
    done
    return 1
  else
    print_success "All categories passed! 🎉"
    return 0
  fi
}

# Function to show menu
show_menu() {
  print_header "wecelebrate Systematic Test Runner"
  echo "Choose a test category to run:"
  echo ""
  
  local i=1
  for category in "${PRIORITY_ORDER[@]}"; do
    printf "%2d. %s\n" $i "$category"
    ((i++))
  done
  
  echo ""
  echo " 0. Run All Categories"
  echo " q. Quit"
  echo ""
}

# Function to run interactive mode
run_interactive() {
  while true; do
    show_menu
    read -p "Enter your choice: " choice
    
    case $choice in
      0)
        run_all_categories
        read -p "Press Enter to continue..."
        ;;
      q|Q)
        print_info "Exiting..."
        exit 0
        ;;
      [1-9]|1[0-2])
        local index=$((choice - 1))
        local category=${PRIORITY_ORDER[$index]}
        run_category "$category"
        read -p "Press Enter to continue..."
        ;;
      *)
        print_error "Invalid choice!"
        sleep 1
        ;;
    esac
  done
}

# Function to show usage
show_usage() {
  echo "Usage: $0 [category|all|interactive]"
  echo ""
  echo "Categories:"
  for category in "${PRIORITY_ORDER[@]}"; do
    echo "  - $category"
  done
  echo ""
  echo "Options:"
  echo "  all         - Run all categories in priority order"
  echo "  interactive - Interactive menu mode"
  echo "  [category]  - Run specific category"
  echo ""
  echo "Examples:"
  echo "  $0 ui-components    # Run UI component tests"
  echo "  $0 all              # Run all tests"
  echo "  $0 interactive      # Interactive mode"
  echo "  $0                  # Interactive mode (default)"
}

# Main execution
main() {
  if [ $# -eq 0 ]; then
    # No arguments - run interactive mode
    run_interactive
  else
    case $1 in
      help|--help|-h)
        show_usage
        ;;
      all)
        run_all_categories
        ;;
      interactive)
        run_interactive
        ;;
      *)
        run_category "$1"
        ;;
    esac
  fi
}

# Run main
main "$@"
