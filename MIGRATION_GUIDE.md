# Migration Guide: KV Store to Relational Tables
## Phase 1: Database Optimization

**Date:** February 15-17, 2026  
**Status:** Ready for Testing  
**Risk Level:** Low (with rollback capability)

---

## Overview

This guide provides step-by-step instructions for migrating data from the generic KV store to proper relational tables. The migration is designed to be safe, reversible, and zero-downtime.

---

## Prerequisites

### 1. Environment Setup

Ensure you have the following environment variables set:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 2. Database Schema

The new schema must be created before running the migration:

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Run the schema creation script
\i supabase/functions/server/database/schema.sql
```

### 3. Deno Installation

The migration scripts require Deno:

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Verify installation
deno --version
```

---

## Migration Steps

### Step 1: Dry Run (Recommended)

Always start with a dry run to preview the migration without making changes:

```bash
cd supabase/functions/server/database

# Run dry run
deno run --allow-net --allow-env migrate_kv_to_tables.ts --dry-run --verbose
```

**Expected Output:**
```
================================================================================
KV Store to Relational Tables Migration
================================================================================
Mode: DRY RUN
Batch Size: 100
Validation: ENABLED
================================================================================
📋 Starting clients migration...
📋 Found 5 clients to migrate
[DRY RUN] Would migrate 5 clients
📋 Starting catalogs migration...
📋 Found 3 catalogs to migrate
[DRY RUN] Would migrate 3 catalogs
...
================================================================================
Migration Summary
================================================================================
Duration: 12.45 seconds
Total Records: 0
Successful: 1523
Failed: 0
Skipped: 0
================================================================================
✅ DRY RUN COMPLETE - No changes were made
```

**Review the output carefully:**
- Check for any validation errors
- Verify record counts match expectations
- Note any skipped records

---

### Step 2: Backup Current Data (Critical!)

Before running the live migration, create a backup:

```bash
# Backup KV store table
pg_dump -h db.[project].supabase.co \
  -U postgres \
  -d postgres \
  -t kv_store_6fcaeea3 \
  -F c \
  -f kv_store_backup_$(date +%Y%m%d_%H%M%S).dump

# Verify backup
ls -lh kv_store_backup_*.dump
```

**Store the backup in a safe location!**

---

### Step 3: Run Live Migration

Once the dry run looks good and you have a backup:

```bash
# Run live migration
deno run --allow-net --allow-env migrate_kv_to_tables.ts --verbose
```

**Expected Output:**
```
================================================================================
KV Store to Relational Tables Migration
================================================================================
Mode: LIVE
Batch Size: 100
Validation: ENABLED
================================================================================
📋 Starting clients migration...
📋 Found 5 clients to migrate
✅ Migrated 5 clients
📋 Starting catalogs migration...
📋 Found 3 catalogs to migrate
✅ Migrated 3 catalogs
📋 Starting sites migration...
📋 Found 12 sites to migrate
✅ Migrated 12 sites
📋 Starting products migration...
📋 Found 1523 products to migrate
📋 Processing batch 1/16 (100 products)
✅ Migrated batch 1/16 (100 products)
...
✅ Completed products migration (1523 total)
📋 Starting employees migration...
📋 Found 245 employees to migrate
✅ Migrated 245 employees
📋 Starting orders migration...
📋 Found 89 orders to migrate
✅ Migrated 89 orders
================================================================================
Migration Summary
================================================================================
Duration: 45.23 seconds
Total Records: 0
Successful: 1877
Failed: 0
Skipped: 0
================================================================================
✅ MIGRATION COMPLETE
```

**Monitor the migration:**
- Watch for any errors
- Note the duration
- Verify success counts

---

### Step 4: Verify Migration

After migration completes, verify the data:

```sql
-- Connect to database
psql "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

-- Check record counts
SELECT 'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'sites', COUNT(*) FROM sites
UNION ALL
SELECT 'catalogs', COUNT(*) FROM catalogs
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;

-- Sample data checks
SELECT * FROM clients LIMIT 5;
SELECT * FROM sites LIMIT 5;
SELECT * FROM products LIMIT 5;

-- Check foreign key relationships
SELECT 
  s.name as site_name,
  c.name as client_name,
  cat.name as catalog_name
FROM sites s
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN catalogs cat ON s.catalog_id = cat.id
LIMIT 10;

-- Check for orphaned records
SELECT COUNT(*) as orphaned_sites 
FROM sites s 
LEFT JOIN clients c ON s.client_id = c.id 
WHERE c.id IS NULL;

SELECT COUNT(*) as orphaned_products 
FROM products p 
LEFT JOIN catalogs c ON p.catalog_id = c.id 
WHERE c.id IS NULL;
```

**Expected Results:**
- All counts should match KV store counts
- No orphaned records
- Foreign key relationships intact
- Sample data looks correct

---

### Step 5: Performance Testing

Test query performance on the new tables:

```sql
-- Test 1: List products by catalog (should be fast)
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE catalog_id = 'your-catalog-id' 
  AND is_active = true
ORDER BY name
LIMIT 100;

-- Expected: Index Scan, < 10ms

-- Test 2: Client monthly report (should be fast)
EXPLAIN ANALYZE
SELECT 
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue
FROM orders
WHERE client_id = 'your-client-id'
  AND created_at >= '2026-01-01'
  AND created_at < '2026-02-01';

-- Expected: Index Scan, < 50ms

-- Test 3: Product search (should be fast)
EXPLAIN ANALYZE
SELECT * FROM products
WHERE name ILIKE '%gift%'
  AND is_active = true
LIMIT 20;

-- Expected: Index Scan (using trigram), < 100ms
```

**Performance Targets:**
- Product listing: < 50ms
- Client reports: < 100ms
- Product search: < 100ms
- Order lookup: < 10ms

---

## Rollback Procedure

If something goes wrong, you can rollback the migration:

### Option 1: Clear New Tables (Fast)

```bash
# This deletes all data from new tables but keeps KV store intact
deno run --allow-net --allow-env rollback_migration.ts --confirm
```

**Expected Output:**
```
================================================================================
Migration Rollback Script
================================================================================
⚠️  CONFIRMED: Rolling back migration...
Tables to rollback: orders, employees, site_product_exclusions, products, sites, catalogs, clients, analytics_events, admin_users, audit_logs
================================================================================
📋 Rolling back table: orders
📋 Found 89 records in orders
✅ Rolled back orders (deleted 89 records)
...
================================================================================
✅ ROLLBACK COMPLETE
================================================================================
The KV store data remains intact.
You can re-run the migration script when ready.
```

### Option 2: Restore from Backup (If needed)

```bash
# Restore KV store from backup
pg_restore -h db.[project].supabase.co \
  -U postgres \
  -d postgres \
  -c \
  kv_store_backup_20260215_143022.dump
```

---

## Troubleshooting

### Issue: Migration fails with "Invalid UUID"

**Cause:** Some IDs in KV store are not valid UUIDs

**Solution:**
```bash
# Run with validation disabled to see all issues
deno run --allow-net --allow-env migrate_kv_to_tables.ts --dry-run --skip-validation

# Fix invalid IDs in KV store before re-running
```

### Issue: Migration fails with "Foreign key violation"

**Cause:** Referenced records don't exist (e.g., site references non-existent client)

**Solution:**
```bash
# Check for orphaned records in KV store
# Fix data integrity issues before re-running
```

### Issue: Migration is too slow

**Cause:** Large number of products

**Solution:**
```bash
# Increase batch size
deno run --allow-net --allow-env migrate_kv_to_tables.ts --batch-size=500
```

### Issue: Out of memory

**Cause:** Processing too many records at once

**Solution:**
```bash
# Decrease batch size
deno run --allow-net --allow-env migrate_kv_to_tables.ts --batch-size=50
```

---

## Post-Migration Checklist

- [ ] Verify all record counts match
- [ ] Check for orphaned records
- [ ] Test query performance
- [ ] Run application smoke tests
- [ ] Monitor error logs
- [ ] Keep KV store backup for 30 days
- [ ] Document any issues encountered
- [ ] Update team on migration status

---

## Next Steps (Week 2)

After successful migration:

1. **Implement Dual-Write Layer** (Days 6-7)
   - Write to both KV store and new tables
   - Monitor for consistency

2. **Gradual Read Migration** (Days 8-9)
   - Switch reads endpoint by endpoint
   - Keep KV store as fallback

3. **Complete Migration** (Future)
   - All traffic on new tables
   - Deprecate KV store

---

## Support

If you encounter issues:

1. Check the error logs
2. Review the troubleshooting section
3. Run rollback if needed
4. Contact the development team

---

## Migration Metrics

Track these metrics during migration:

| Metric | Target | Actual |
|--------|--------|--------|
| Migration Duration | < 5 minutes | _____ |
| Success Rate | 100% | _____ |
| Failed Records | 0 | _____ |
| Skipped Records | < 1% | _____ |
| Query Performance | 10-100x faster | _____ |

---

**Status:** ✅ Ready for Testing  
**Next:** Day 4 - Test Migration on Copy of Production
