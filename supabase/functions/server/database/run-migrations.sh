#!/bin/bash

# Run database migrations
# Usage: ./run-migrations.sh [migration_number]
# If no migration number is provided, runs all migrations

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get Supabase project ref from environment or use default
PROJECT_REF=${SUPABASE_PROJECT_REF:-"wjfcqqrlhwdvvjmefxky"}

echo -e "${YELLOW}Running database migrations...${NC}"
echo "Project: $PROJECT_REF"
echo ""

# Check if specific migration number provided
MIGRATION_NUM=$1

if [ -n "$MIGRATION_NUM" ]; then
    # Run specific migration
    MIGRATION_FILE="migrations/$(printf '%03d' $MIGRATION_NUM)_*.sql"
    if ls $MIGRATION_FILE 1> /dev/null 2>&1; then
        echo -e "${YELLOW}Running migration $MIGRATION_NUM...${NC}"
        supabase db execute --file "$MIGRATION_FILE" --project-ref "$PROJECT_REF"
        echo -e "${GREEN}✓ Migration $MIGRATION_NUM complete${NC}"
    else
        echo -e "${RED}✗ Migration file not found: $MIGRATION_FILE${NC}"
        exit 1
    fi
else
    # Run all migrations in order
    for file in migrations/*.sql; do
        if [ -f "$file" ]; then
            echo -e "${YELLOW}Running $(basename $file)...${NC}"
            supabase db execute --file "$file" --project-ref "$PROJECT_REF"
            echo -e "${GREEN}✓ $(basename $file) complete${NC}"
            echo ""
        fi
    done
fi

echo -e "${GREEN}All migrations complete!${NC}"
