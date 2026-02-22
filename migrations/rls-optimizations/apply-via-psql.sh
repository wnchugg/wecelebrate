#!/bin/bash

# Apply all RLS optimization migrations via psql
# Usage: ./apply-via-psql.sh

set -e

# Configuration
export DATABASE_URL="postgresql://postgres.wjfcqqrlhwdvvjmefxky:74rRtfqMw0BHCyXo@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"

echo "🔧 RLS Policy Optimization - psql Migration Script"
echo "=================================================="
echo ""

# Test connection
echo "Testing database connection..."
if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo "❌ Failed to connect to database"
  exit 1
fi
echo "✓ Connected"
echo ""

# Count migrations
TOTAL=$(ls -1 2026-02-20_*.sql 2>/dev/null | wc -l | tr -d ' ')
echo "Found $TOTAL migration files"
echo ""

# Confirm
read -p "Apply all $TOTAL migrations? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

echo ""
SUCCESS=0
FAILED=0

# Process each migration
for file in 2026-02-20_*.sql; do
  # Extract policy name from filename
  NAME=$(echo "$file" | sed 's/2026-02-20_[0-9]*_optimize_//' | sed 's/.sql$//' | cut -c1-50)
  
  echo "📝 $NAME..."
  
  # Extract UP migration (everything before ROLLBACK)
  UP_SQL=$(awk '/^-- ROLLBACK SCRIPT:/{exit} {print}' "$file")
  
  # Apply migration
  if echo "$UP_SQL" | psql "$DATABASE_URL" > /dev/null 2>&1; then
    echo "   ✓ Success"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "   ❌ Failed"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "=================================================="
echo "✨ Summary:"
echo "   Success: $SUCCESS"
echo "   Failed: $FAILED"
echo ""

# Verify
echo "🔍 Verifying optimizations..."
OPTIMIZED=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND (qual LIKE '%( SELECT auth.uid()%' OR qual LIKE '%( SELECT auth.jwt()%' OR qual LIKE '%( SELECT auth.role()%');" | tr -d ' ')

echo "   Optimized policies: $OPTIMIZED / $TOTAL"
echo ""

if [ "$OPTIMIZED" -eq "$TOTAL" ]; then
  echo "🎉 All migrations applied successfully!"
else
  echo "⚠️  Some migrations may need review"
fi

echo ""
echo "Done!"
