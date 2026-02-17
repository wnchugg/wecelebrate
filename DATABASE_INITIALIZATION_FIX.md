# Database Not Initialized - Fix Guide

## Problem

The frontend shows "database may not be initialized" because the base database schema hasn't been applied to your development environment. The migrations (005-010) depend on base tables that don't exist yet.

## Root Cause

The base schema (`supabase/functions/server/database/schema.sql`) creates essential tables like:
- `clients`
- `sites`
- `catalogs`
- `products`
- `employees`
- `orders`
- `schema_versions`
- Helper functions like `update_updated_at_column()`

Your migrations 005-010 reference these tables, but they were never created in your development database.

## Solution Options

### Option 1: Apply Schema via Supabase Dashboard (Recommended)

1. Go to your Supabase SQL Editor:
   https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/sql

2. Create a new query

3. Copy the entire contents of `supabase/functions/server/database/schema.sql`

4. Paste and run it

5. Then run each migration in order:
   - Copy contents of `supabase/migrations/005_site_gift_config.sql` → Run
   - Copy contents of `supabase/migrations/006_brands.sql` → Run
   - Copy contents of `supabase/migrations/007_email_templates.sql` → Run
   - Copy contents of `supabase/migrations/008_add_client_branding.sql` → Run
   - Copy contents of `supabase/migrations/009_add_client_to_brands.sql` → Run
   - Copy contents of `supabase/migrations/010_add_brand_colors.sql` → Run

### Option 2: Use Supabase CLI (If Installed)

```bash
# Apply base schema
supabase db execute --file supabase/functions/server/database/schema.sql --project-ref wjfcqqrlhwdvvjmefxky

# Apply migrations
cd supabase/functions/server/database
./run-migrations.sh
```

### Option 3: Use psql (If You Have Database Credentials)

```bash
# Get your database password from Supabase dashboard
# Settings → Database → Connection string

psql "postgresql://postgres:[YOUR_PASSWORD]@db.wjfcqqrlhwdvvjmefxky.supabase.co:5432/postgres" \
  -f supabase/functions/server/database/schema.sql

# Then run migrations
psql "postgresql://postgres:[YOUR_PASSWORD]@db.wjfcqqrlhwdvvjmefxky.supabase.co:5432/postgres" \
  -f supabase/migrations/005_site_gift_config.sql

# Repeat for migrations 006-010
```

## After Applying Schema

1. Verify tables were created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. Check schema version:
   ```sql
   SELECT * FROM schema_versions ORDER BY version;
   ```

3. Seed initial data (optional):
   ```bash
   cd supabase/functions/server/tests
   ./seed-database.sh
   ```

4. Refresh your frontend - the error should be gone!

## What Tables Should Exist

After applying the schema and migrations, you should have:

Base tables (from schema.sql):
- clients
- sites
- catalogs
- products
- site_product_exclusions
- employees
- orders
- analytics_events
- admin_users
- audit_logs
- schema_versions

Additional tables (from migrations):
- site_gift_configs (migration 005)
- brands (migration 006)
- email_templates (migration 007)

## Verification

Run this in Supabase SQL Editor to verify:

```sql
-- Check if all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check schema versions
SELECT * FROM schema_versions ORDER BY version;

-- Check if sites table has data
SELECT COUNT(*) as site_count FROM sites;
```

## Next Steps

Once the database is initialized:
1. The frontend should load without errors
2. You can create your first site via the admin dashboard
3. The PublicSiteContext will successfully fetch sites

## Need Help?

If you encounter errors:
1. Check the error message in Supabase SQL Editor
2. Look for "already exists" errors (safe to ignore if using CREATE IF NOT EXISTS)
3. Check for foreign key constraint errors (means tables created out of order)
4. Verify you're connected to the correct project (wjfcqqrlhwdvvjmefxky)
