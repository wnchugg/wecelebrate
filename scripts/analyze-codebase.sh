#!/bin/bash

# JALA 2 Codebase Analysis Script
# Automated code review and refactoring readiness check
# Run before starting refactoring work

set -e

echo "======================================"
echo "JALA 2 Codebase Analysis"
echo "Pre-Deployment Refactoring Check"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ISSUES=0
WARNINGS=0
SUCCESS=0

# Helper functions
issue() {
    echo -e "${RED}❌ ISSUE: $1${NC}"
    ((ISSUES++))
}

warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((SUCCESS++))
}

info() {
    echo -e "ℹ️  $1"
}

section() {
    echo ""
    echo "=================="
    echo "$1"
    echo "=================="
}

# ============================================
# 1. Backend File Duplication Check
# ============================================
section "1. Backend File Duplication"

cd supabase/functions/server 2>/dev/null || {
    issue "Backend directory not found"
    exit 1
}

# Check for duplicate files
DUPLICATES=""

for base in erp_integration erp_scheduler kv_env security seed; do
    if [ -f "${base}.ts" ] && [ -f "${base}.tsx" ]; then
        DUPLICATES="${DUPLICATES}\n  - ${base}.ts + ${base}.tsx"
    fi
done

if [ -n "$DUPLICATES" ]; then
    issue "Found duplicate backend files:${DUPLICATES}"
    info "   Action: Consolidate to .ts unless file contains JSX"
else
    success "No duplicate backend files found"
fi

# Check for JSX in .tsx files
for file in *.tsx; do
    if [ -f "$file" ] && [ "$file" != "index.tsx" ] && [ "$file" != "email_service.tsx" ] && [ "$file" != "kv_store.tsx" ]; then
        if ! grep -q "<[A-Z]" "$file"; then
            warning "$file doesn't contain JSX - should be .ts"
        fi
    fi
done

cd - > /dev/null

# ============================================
# 2. API Client Duplication Check
# ============================================
section "2. API Client Duplication"

if [ -f "src/app/lib/api.ts" ] && [ -f "src/app/lib/apiClient.ts" ]; then
    issue "Found duplicate API clients: api.ts and apiClient.ts"
    
    # Count usage
    API_USAGE=$(grep -r "from '@/app/lib/api'" src/app 2>/dev/null | wc -l || echo "0")
    APICLIENT_USAGE=$(grep -r "from '@/app/lib/apiClient'" src/app 2>/dev/null | wc -l || echo "0")
    
    info "   api.ts used in: $API_USAGE files"
    info "   apiClient.ts used in: $APICLIENT_USAGE files"
    info "   Action: Consolidate into apiClient.ts"
elif [ -f "src/app/lib/apiClient.ts" ]; then
    success "Single API client found (apiClient.ts)"
elif [ -f "src/app/lib/api.ts" ]; then
    warning "Only api.ts found - consider renaming to apiClient.ts"
else
    issue "No API client found"
fi

# ============================================
# 3. Environment Configuration Check
# ============================================
section "3. Environment Configuration"

ENV_FILES=0
if [ -f "src/app/config/environment.ts" ]; then
    ((ENV_FILES++))
    info "Found: environment.ts"
fi

if [ -f "src/app/config/environments.ts" ]; then
    ((ENV_FILES++))
    info "Found: environments.ts"
fi

if [ -f "src/app/config/buildConfig.ts" ]; then
    ((ENV_FILES++))
    info "Found: buildConfig.ts (renamed)"
fi

if [ -f "src/app/config/deploymentEnvironments.ts" ]; then
    ((ENV_FILES++))
    info "Found: deploymentEnvironments.ts (renamed)"
fi

if [ "$ENV_FILES" -gt 2 ]; then
    warning "Multiple environment config files found - possible duplication"
elif [ "$ENV_FILES" -eq 2 ]; then
    # Check if they're the old names or new names
    if [ -f "src/app/config/environment.ts" ] && [ -f "src/app/config/environments.ts" ]; then
        issue "Old environment config names found"
        info "   Action: Rename to buildConfig.ts and deploymentEnvironments.ts"
    else
        success "Environment configs properly named"
    fi
else
    warning "Unexpected number of environment config files: $ENV_FILES"
fi

# ============================================
# 4. Root Directory Organization
# ============================================
section "4. Root Directory Organization"

MD_FILES=$(ls -1 *.md 2>/dev/null | wc -l || echo "0")
SH_FILES=$(ls -1 *.sh 2>/dev/null | wc -l || echo "0")

info "Markdown files in root: $MD_FILES"
info "Shell scripts in root: $SH_FILES"

if [ "$MD_FILES" -gt 10 ]; then
    warning "Many markdown files in root ($MD_FILES) - consider organizing into /docs"
fi

if [ "$SH_FILES" -gt 5 ]; then
    warning "Many shell scripts in root ($SH_FILES) - consider organizing into /scripts"
fi

DOCS_DIR_EXISTS=false
if [ -d "docs" ]; then
    DOCS_DIR_EXISTS=true
    DOCS_COUNT=$(find docs -name "*.md" 2>/dev/null | wc -l || echo "0")
    info "Documentation files in /docs: $DOCS_COUNT"
fi

SCRIPTS_DIR_EXISTS=false
if [ -d "scripts" ]; then
    SCRIPTS_DIR_EXISTS=true
    SCRIPTS_COUNT=$(find scripts -name "*.sh" 2>/dev/null | wc -l || echo "0")
    info "Script files in /scripts: $SCRIPTS_COUNT"
fi

if [ "$DOCS_DIR_EXISTS" = true ] && [ "$SCRIPTS_DIR_EXISTS" = true ]; then
    success "Proper directory structure exists"
fi

# ============================================
# 5. Security Checks
# ============================================
section "5. Security Checks"

# Check for service role key in frontend
if grep -r "SUPABASE_SERVICE_ROLE_KEY" src/app 2>/dev/null; then
    issue "SUPABASE_SERVICE_ROLE_KEY found in frontend code!"
else
    success "No service role key in frontend"
fi

# Check for hardcoded secrets
if grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" src/app 2>/dev/null | grep -v "deploymentEnvironments.ts" | grep -v "environments.ts"; then
    warning "Hardcoded JWT tokens found in frontend (outside environment configs)"
else
    success "No unexpected hardcoded tokens in frontend"
fi

# Check for console.log in production code
CONSOLE_LOGS=$(grep -r "console\.log" src/app 2>/dev/null | grep -v "node_modules" | grep -v ".min." | wc -l || echo "0")
info "Console.log statements found: $CONSOLE_LOGS"
if [ "$CONSOLE_LOGS" -gt 50 ]; then
    warning "Many console.log statements ($CONSOLE_LOGS) - consider cleanup"
fi

# ============================================
# 6. TypeScript Checks
# ============================================
section "6. TypeScript Checks"

# Check for 'any' types
ANY_TYPES=$(grep -r ": any" src/app 2>/dev/null | grep -v "node_modules" | grep -v ".d.ts" | wc -l || echo "0")
info "Files with 'any' type: $ANY_TYPES"
if [ "$ANY_TYPES" -gt 10 ]; then
    warning "Many 'any' types found ($ANY_TYPES) - consider improving type safety"
fi

# Check tsconfig.json exists
if [ -f "tsconfig.json" ]; then
    success "tsconfig.json found"
    
    # Check for strict mode
    if grep -q '"strict": true' tsconfig.json; then
        success "TypeScript strict mode enabled"
    else
        warning "TypeScript strict mode not enabled"
    fi
else
    issue "tsconfig.json not found"
fi

# ============================================
# 7. Build & Dependencies
# ============================================
section "7. Build & Dependencies"

if [ -f "package.json" ]; then
    success "package.json found"
    
    # Check for package-lock or pnpm-lock
    if [ -f "package-lock.json" ]; then
        info "Using npm (package-lock.json)"
    elif [ -f "pnpm-lock.yaml" ]; then
        info "Using pnpm (pnpm-lock.yaml)"
    elif [ -f "yarn.lock" ]; then
        info "Using yarn (yarn.lock)"
    else
        warning "No lock file found"
    fi
    
    # Check for test script
    if grep -q '"test"' package.json; then
        success "Test script configured"
    else
        warning "No test script in package.json"
    fi
    
    # Check for build scripts
    if grep -q '"build"' package.json; then
        success "Build script configured"
    else
        issue "No build script in package.json"
    fi
else
    issue "package.json not found"
fi

# ============================================
# 8. Testing
# ============================================
section "8. Testing"

TEST_FILES=$(find src/tests -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l || echo "0")
info "Test files found: $TEST_FILES"

if [ "$TEST_FILES" -gt 0 ]; then
    success "Test files exist"
else
    warning "No test files found - consider adding tests"
fi

# ============================================
# 9. Git Status
# ============================================
section "9. Git Status"

if [ -d ".git" ]; then
    success "Git repository initialized"
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        warning "Uncommitted changes detected"
        info "   Run 'git status' to see changes"
    else
        success "No uncommitted changes"
    fi
    
    # Check current branch
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    info "Current branch: $BRANCH"
    
    if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
        warning "On main branch - consider creating feature branch for refactoring"
        info "   Suggested: git checkout -b refactor/pre-deployment"
    fi
else
    warning "Not a git repository"
fi

# ============================================
# Summary
# ============================================
section "SUMMARY"

echo ""
echo "Issues Found:    $ISSUES"
echo "Warnings:        $WARNINGS"
echo "Checks Passed:   $SUCCESS"
echo ""

if [ "$ISSUES" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ Codebase is clean! Ready to proceed.${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
elif [ "$ISSUES" -eq 0 ]; then
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}⚠️  Warnings found. Review before proceeding.${NC}"
    echo -e "${YELLOW}========================================${NC}"
    exit 0
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}❌ Critical issues found! Fix before proceeding.${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
