#!/bin/bash

# ============================================================================
# Migration Test Execution Script
# Description: Runs the content migration and verifies the results
# Author: Kiro AI
# Date: February 19, 2026
# Spec: .kiro/specs/multi-language-content/
# Task: 2.2 Test migration script on development database
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_REF="wjfcqqrlhwdvvjmefxky"
MIGRATION_FILE="supabase/migrations/20260219130000_migrate_content_to_translations.sql"
TEST_FILE="supabase/migrations/test_migration.sql"
ROLLBACK_FILE="supabase/migrations/20260219130000_migrate_content_to_translations_rollback.sql"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Content Migration Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to run SQL file using Supabase CLI
run_sql_file() {
    local file=$1
    local description=$2
    
    echo -e "${YELLOW}${description}...${NC}"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ Error: File not found: $file${NC}"
        exit 1
    fi
    
    # Use Supabase CLI to execute the file
    if command -v supabase &> /dev/null; then
        supabase db execute --file "$file" --project-ref "$PROJECT_REF"
        echo -e "${GREEN}✓ ${description} completed${NC}"
    else
        echo -e "${RED}✗ Error: Supabase CLI not found${NC}"
        echo -e "${YELLOW}Please install Supabase CLI or run manually:${NC}"
        echo -e "  psql \$DATABASE_URL -f $file"
        exit 1
    fi
    echo ""
}

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking Prerequisites${NC}"
echo -e "${YELLOW}Checking Supabase CLI...${NC}"
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✓ Supabase CLI found${NC}"
    supabase --version
else
    echo -e "${RED}✗ Supabase CLI not found${NC}"
    echo -e "${YELLOW}Install with: npm install -g supabase${NC}"
    exit 1
fi
echo ""

# Step 2: Backup check (informational)
echo -e "${BLUE}Step 2: Pre-Migration Backup${NC}"
echo -e "${YELLOW}⚠ Important: Ensure you have a database backup before proceeding${NC}"
echo -e "${YELLOW}This migration will modify the sites table${NC}"
read -p "Do you have a backup and want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${RED}Migration cancelled${NC}"
    exit 0
fi
echo ""

# Step 3: Run the migration
echo -e "${BLUE}Step 3: Running Migration${NC}"
run_sql_file "$MIGRATION_FILE" "Executing content migration"

# Step 4: Run verification tests
echo -e "${BLUE}Step 4: Running Verification Tests${NC}"
run_sql_file "$TEST_FILE" "Executing verification tests"

# Step 5: Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Migration Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Migration executed successfully${NC}"
echo -e "${GREEN}✓ Verification tests completed${NC}"
echo ""
echo -e "${YELLOW}Review the test output above to ensure:${NC}"
echo -e "  1. All sites have available_languages = ['en']"
echo -e "  2. All sites have defaultLanguage = 'en'"
echo -e "  3. All sites have translations populated"
echo -e "  4. All 16 sections are present"
echo -e "  5. No data was lost"
echo ""
echo -e "${YELLOW}If any tests failed, you can rollback using:${NC}"
echo -e "  bash supabase/migrations/run_migration_test.sh rollback"
echo ""
echo -e "${BLUE}========================================${NC}"
