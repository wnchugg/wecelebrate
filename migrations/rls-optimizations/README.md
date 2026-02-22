# RLS Policy Optimizations

Generated on: 2026-02-20

## Summary

This directory contains 28 migration scripts to optimize RLS (Row Level Security) policies in your Supabase database.

### What These Migrations Do

Each migration wraps `auth.uid()`, `auth.jwt()`, and `auth.role()` function calls in `(SELECT ...)` subqueries. This optimization causes PostgreSQL to evaluate these functions **once per query** instead of **once per row**, resulting in significant performance improvements.

### Performance Impact

- **28 policies** will be optimized
- **21 tables** affected
- **Estimated improvement**: 30-95% reduction in auth function evaluations
- **Most impacted**: Tables with many rows (employees, orders, products, etc.)

## Before Applying

⚠️ **IMPORTANT**: These migrations will modify your database policies. Please:

1. **Review each migration** - Understand what changes are being made
2. **Test in development first** - Apply to a dev/staging environment before production
3. **Back up your database** - Create a backup before applying
4. **Apply one at a time** - Don't run all migrations at once initially
5. **Monitor performance** - Check query performance after applying

## How to Apply

### Option 1: Apply Single Migration (Recommended for Testing)

```bash
# Review the migration first
cat 2026-02-20_001_optimize_admin_permissions_Admin_users_can_view_permissions.sql

# Apply it
psql $DATABASE_URL -f 2026-02-20_001_optimize_admin_permissions_Admin_users_can_view_permissions.sql

# Test your application
# If everything works, proceed to the next migration
```

### Option 2: Apply All Migrations (After Testing)

```bash
# Apply all migrations in order
for file in 2026-02-20_*.sql; do
  echo "Applying $file..."
  psql $DATABASE_URL -f "$file"
  if [ $? -ne 0 ]; then
    echo "❌ Failed to apply $file"
    exit 1
  fi
  echo "✓ Applied $file"
  echo ""
done
```

### Option 3: Use Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of a migration file
4. Paste and run it
5. Verify the policy was updated in the Database > Policies section

## Rollback

Each migration file includes a rollback script at the bottom. If you need to revert a migration:

```bash
# Extract the rollback section from the migration file
tail -n 20 2026-02-20_001_optimize_admin_permissions_Admin_users_can_view_permissions.sql

# Or manually run the rollback SQL from the file
```

## Migration List

| # | Table | Policy | Impact |
|---|-------|--------|--------|
| 001 | admin_permissions | Admin users can view permissions | ~30% |
| 002 | admin_permissions | Super admins can manage permissions | ~30% |
| 003 | admin_user_permissions | Admin users can view their own permissions | ~30% |
| 004 | admin_user_permissions | Super admins can manage user permissions | ~30% |
| 005 | admin_users | Only admins can view admin users | ~30% |
| 006 | analytics_events | Users can only view their own analytics events | ~30% |
| 007 | audit_logs | Only admins can view audit logs | ~30% |
| 008 | brands | Admin users have full access to brands | ~30% |
| 009 | catalogs | Admin users have full access to catalogs | ~30% |
| 010 | clients | Admin users have full access to clients | ~30% |
| 011 | email_templates | Admin users have full access to email_templates | ~30% |
| 012 | employees | Admin users have full access to employees | ~30% |
| 013 | employees | Site users can view their site's employees | ~30% |
| 014 | orders | Admin users have full access to orders | ~30% |
| 015 | orders | Site users can view their site's orders | ~30% |
| 016 | products | Authenticated users can view products | ~30% |
| 017 | proxy_sessions | Admin users can update their own proxy sessions | ~30% |
| 018 | proxy_sessions | Admin users can view their own proxy sessions | ~30% |
| 019 | schema_versions | Authenticated users can view schema versions | ~30% |
| 020 | site_catalog_assignments | Admin users have full access | ~30% |
| 021 | site_category_exclusions | Admin users have full access | ~30% |
| 022 | site_gift_configs | Admin users have full access | ~30% |
| 023 | site_gift_configs | Site users can view their site configurations | ~30% |
| 024 | site_price_overrides | Admin users have full access | ~30% |
| 025 | site_product_exclusions | Admin users have full access | ~30% |
| 026 | site_users | Site users access control | ~30% |
| 027 | sites | Admin users have full access to sites | ~30% |
| 028 | sites | Site users can read their own site | ~30% |

## Example: Before and After

### Before Optimization
```sql
CREATE POLICY "Admin users can view permissions"
  ON public.admin_permissions
  FOR SELECT TO public
  USING ((EXISTS ( SELECT 1
     FROM admin_users
    WHERE (admin_users.id = auth.uid()))));
```

**Problem**: `auth.uid()` is called for EVERY row in admin_permissions

### After Optimization
```sql
CREATE POLICY "Admin users can view permissions"
  ON public.admin_permissions
  FOR SELECT TO public
  USING ((EXISTS ( SELECT 1
     FROM admin_users
    WHERE (admin_users.id = (SELECT auth.uid())))));
```

**Benefit**: `auth.uid()` is called ONCE per query, result is reused for all rows

## Verification

After applying migrations, verify they work:

```sql
-- Check that policies were updated
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND qual LIKE '%(SELECT auth.uid())%'
ORDER BY tablename, policyname;

-- Should return 28 policies with optimized auth functions
```

## Support

If you encounter issues:
1. Check the rollback script in each migration file
2. Review the Supabase logs for any errors
3. Test queries manually to ensure they still work
4. Contact your database administrator if needed

## Generated By

Database Optimizer CLI v1.0
- Tool: `npm run db-optimizer:analyze`
- Generator: `npm run db-optimizer:generate`
- Date: 2026-02-20
