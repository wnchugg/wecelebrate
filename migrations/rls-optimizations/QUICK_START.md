# Quick Start Guide - RLS Optimizations

## TL;DR

28 migration scripts ready to optimize your RLS policies for better performance.

## Quick Commands

```bash
# 1. Review what will change
cd migrations/rls-optimizations
cat README.md

# 2. Test one migration
psql $DATABASE_URL -f 2026-02-20_001_optimize_admin_permissions_Admin_users_can_view_permissions.sql

# 3. Apply all (after testing!)
for file in 2026-02-20_*.sql; do
  psql $DATABASE_URL -f "$file" && echo "✓ $file"
done

# 4. Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pg_policies WHERE qual LIKE '%(SELECT auth.uid())%';"
```

## What This Does

Wraps `auth.uid()` calls in SELECT subqueries:
- **Before**: `auth.uid() = user_id` (called per row)
- **After**: `(SELECT auth.uid()) = user_id` (called once)

## Expected Results

- ⚡ 30-95% faster queries on tables with RLS
- 📉 Reduced database CPU usage
- ✅ Same security guarantees
- 🔄 Fully reversible

## Safety Checklist

- [ ] Reviewed at least 3 migration files
- [ ] Tested 1 migration in development
- [ ] Verified application still works
- [ ] Have database backup
- [ ] Know how to rollback (see migration file bottom)

## Rollback

Each migration file has rollback SQL at the bottom. To revert:

```bash
# View rollback section
tail -n 20 2026-02-20_001_*.sql

# Copy and run the rollback SQL
```

## Need Help?

- Full guide: `README.md` (in this directory)
- Complete summary: `../../RLS_OPTIMIZATION_SUMMARY.md`
- Troubleshooting: `../../SUPABASE_CONNECTION_TROUBLESHOOTING.md`
