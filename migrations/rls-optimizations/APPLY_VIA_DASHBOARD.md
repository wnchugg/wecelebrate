# Apply Migrations via Supabase Dashboard

Since `psql` is not installed, you can easily apply these migrations through the Supabase Dashboard.

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/sql/new

### 2. Apply First Migration (Test)

1. Open the file: `2026-02-20_001_optimize_admin_permissions_Admin_users_can_view_permissions.sql`
2. Copy the **UP migration** section (everything before "-- ROLLBACK SCRIPT:")
3. Paste it into the Supabase SQL Editor
4. Click "Run" or press Cmd+Enter
5. You should see "Success. No rows returned"

### 3. Verify It Worked

Run this query in the SQL Editor:

```sql
SELECT policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'admin_permissions'
  AND policyname = 'Admin users can view permissions';
```

You should see the optimized version with `(SELECT auth.uid())`.

### 4. Test Your Application

- Log in to your app as an admin
- Verify permissions work correctly
- Check that everything functions normally

### 5. Apply Remaining Migrations

Once you've verified the first migration works, repeat steps 2-3 for each remaining migration file:

- `2026-02-20_002_*.sql`
- `2026-02-20_003_*.sql`
- ... and so on through `2026-02-20_028_*.sql`

## Quick Copy-Paste List

Here are all 28 migrations in order. Apply them one at a time:

1. ✅ `2026-02-20_001_optimize_admin_permissions_Admin_users_can_view_permissions.sql`
2. ⬜ `2026-02-20_002_optimize_admin_permissions_Super_admins_can_manage_permissions.sql`
3. ⬜ `2026-02-20_003_optimize_admin_user_permissions_Admin_users_can_view_their_own_permissions.sql`
4. ⬜ `2026-02-20_004_optimize_admin_user_permissions_Super_admins_can_manage_user_permissions.sql`
5. ⬜ `2026-02-20_005_optimize_admin_users_Only_admins_can_view_admin_users.sql`
6. ⬜ `2026-02-20_006_optimize_analytics_events_Users_can_only_view_their_own_analytics_events.sql`
7. ⬜ `2026-02-20_007_optimize_audit_logs_Only_admins_can_view_audit_logs.sql`
8. ⬜ `2026-02-20_008_optimize_brands_Admin_users_have_full_access_to_brands.sql`
9. ⬜ `2026-02-20_009_optimize_catalogs_Admin_users_have_full_access_to_catalogs.sql`
10. ⬜ `2026-02-20_010_optimize_clients_Admin_users_have_full_access_to_clients.sql`
11. ⬜ `2026-02-20_011_optimize_email_templates_Admin_users_have_full_access_to_email_templates.sql`
12. ⬜ `2026-02-20_012_optimize_employees_Admin_users_have_full_access_to_employees.sql`
13. ⬜ `2026-02-20_013_optimize_employees_Site_users_can_view_their_site_s_employees.sql`
14. ⬜ `2026-02-20_014_optimize_orders_Admin_users_have_full_access_to_orders.sql`
15. ⬜ `2026-02-20_015_optimize_orders_Site_users_can_view_their_site_s_orders.sql`
16. ⬜ `2026-02-20_016_optimize_products_Authenticated_users_can_view_products.sql`
17. ⬜ `2026-02-20_017_optimize_proxy_sessions_Admin_users_can_update_their_own_proxy_sessions.sql`
18. ⬜ `2026-02-20_018_optimize_proxy_sessions_Admin_users_can_view_their_own_proxy_sessions.sql`
19. ⬜ `2026-02-20_019_optimize_schema_versions_Authenticated_users_can_view_schema_versions.sql`
20. ⬜ `2026-02-20_020_optimize_site_catalog_assignments_Admin_users_have_full_access_to_site_catalog_assig.sql`
21. ⬜ `2026-02-20_021_optimize_site_category_exclusions_Admin_users_have_full_access_to_site_category_excl.sql`
22. ⬜ `2026-02-20_022_optimize_site_gift_configs_Admin_users_have_full_access_to_site_gift_configs.sql`
23. ⬜ `2026-02-20_023_optimize_site_gift_configs_Site_users_can_view_their_site_configurations.sql`
24. ⬜ `2026-02-20_024_optimize_site_price_overrides_Admin_users_have_full_access_to_site_price_overrid.sql`
25. ⬜ `2026-02-20_025_optimize_site_product_exclusions_Admin_users_have_full_access_to_site_product_exclu.sql`
26. ⬜ `2026-02-20_026_optimize_site_users_Site_users_access_control.sql`
27. ⬜ `2026-02-20_027_optimize_sites_Admin_users_have_full_access_to_sites.sql`
28. ⬜ `2026-02-20_028_optimize_sites_Site_users_can_read_their_own_site.sql`

## Batch Apply (Advanced)

If you want to apply multiple migrations at once:

1. Open several migration files
2. Copy all the UP migration sections (before rollback)
3. Paste them all into the SQL Editor
4. Run them together

**Note**: Only do this after testing the first few individually!

## Verify All Migrations

After applying all migrations, run this query:

```sql
SELECT COUNT(*) as optimized_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND qual LIKE '%(SELECT auth.uid())%';
```

Should return: **28**

## Rollback a Migration

If you need to undo a migration:

1. Open the migration file
2. Scroll to the bottom (after "-- ROLLBACK SCRIPT:")
3. Copy the rollback SQL
4. Paste into SQL Editor
5. Run it

## Alternative: Install psql (Optional)

If you want to use `psql` in the future:

```bash
# Install PostgreSQL client tools
brew install postgresql
```

Then you can use the `psql` commands from the other guides.

## Tips

- ✅ Apply during low-traffic times
- ✅ Test in development first if possible
- ✅ Keep the migration files for reference
- ✅ Monitor your application after applying
- ✅ Have rollback scripts ready

## Need Help?

- Check the main README.md in this directory
- Review RLS_OPTIMIZATION_SUMMARY.md in the project root
- Test one migration at a time
- Verify each one works before proceeding
