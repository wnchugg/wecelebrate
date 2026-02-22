#!/bin/bash

# Test applying one migration
# Usage: ./test-one.sh

export DATABASE_URL="postgresql://postgres.wjfcqqrlhwdvvjmefxky:74rRtfqMw0BHCyXo@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"

echo "🔍 Before migration:"
psql "$DATABASE_URL" -c "SELECT substring(qual, 1, 100) FROM pg_policies WHERE tablename = 'admin_permissions' AND policyname = 'Admin users can view permissions';"

echo ""
echo "📝 Applying migration..."
echo ""

# Extract just the UP migration (before ROLLBACK)
sed -n '1,/^-- ROLLBACK SCRIPT:/p' 2026-02-20_001_optimize_admin_permissions_Admin_users_can_view_permissions.sql | head -n -1 | psql "$DATABASE_URL"

echo ""
echo "🔍 After migration:"
psql "$DATABASE_URL" -c "SELECT substring(qual, 1, 100) FROM pg_policies WHERE tablename = 'admin_permissions' AND policyname = 'Admin users can view permissions';"
