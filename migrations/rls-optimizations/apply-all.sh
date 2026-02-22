#!/bin/bash

# Apply all RLS optimization migrations
# Usage: ./apply-all.sh

set -e  # Exit on error

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo ""
  echo "Please set it first:"
  echo "  export DATABASE_URL='postgresql://postgres.wjfcqqrlhwdvvjmefxky:74rRtfqMw0BHCyXo@aws-1-us-east-2.pooler.supabase.com:5432/postgres'"
  echo ""
  exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo "❌ ERROR: psql command not found"
  echo ""
  echo "Please add PostgreSQL to your PATH:"
  echo "  export PATH=\"/opt/homebrew/opt/postgresql@14/bin:\$PATH\""
  echo ""
  exit 1
fi

echo "🔧 RLS Policy Optimization - Migration Script"
echo "=============================================="
echo ""
echo "Database: $(echo $DATABASE_URL | sed 's/:.*@/@/' | sed 's/postgresql:\/\///')"
echo ""

# Count migration files
MIGRATION_COUNT=$(ls -1 2026-02-20_*.sql 2>/dev/null | wc -l | tr -d ' ')

if [ "$MIGRATION_COUNT" -eq 0 ]; then
  echo "❌ No migration files found"
  exit 1
fi

echo "Found $MIGRATION_COUNT migration files"
echo ""

# Ask for confirmation
read -p "Apply all $MIGRATION_COUNT migrations? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "Applying migrations..."
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0

# Apply each migration
for file in 2026-02-20_*.sql; do
  echo "📝 Applying: $file"
  
  if psql "$DATABASE_URL" -f "$file" > /dev/null 2>&1; then
    echo "   ✓ Success"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "   ❌ Failed"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  
  echo ""
done

echo "=============================================="
echo "✨ Migration Summary:"
echo "   Success: $SUCCESS_COUNT"
echo "   Failed: $FAIL_COUNT"
echo ""

# Verify results
echo "🔍 Verifying optimizations..."
OPTIMIZED_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND qual LIKE '%(SELECT auth.uid())%';" | tr -d ' ')

echo "   Optimized policies: $OPTIMIZED_COUNT"
echo ""

if [ "$OPTIMIZED_COUNT" -eq "$MIGRATION_COUNT" ]; then
  echo "🎉 All migrations applied successfully!"
else
  echo "⚠️  Some migrations may not have applied correctly"
  echo "   Expected: $MIGRATION_COUNT"
  echo "   Found: $OPTIMIZED_COUNT"
fi

echo ""
echo "Done!"
