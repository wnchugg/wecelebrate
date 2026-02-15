# Day 4 Execution Guide: Test Migration on Copy
## Phase 1: Database Optimization

**Date:** February 18, 2026  
**Duration:** 8 hours  
**Goal:** Test migration on copy of production and verify everything works

---

## Overview

Today we'll test the migration script on a copy of production data to ensure:
1. All data migrates correctly
2. No data loss or corruption
3. Foreign key relationships are intact
4. Query performance improves significantly
5. No critical issues before production migration

---

## Prerequisites

### 1. Environment Variables

Ensure these are set:
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 2. Tools Installed

```bash
# Deno
deno --version

# PostgreSQL client (for manual queries)
psql --version

# Supabase CLI (optional)
supabase --version
```

---

## Step-by-Step Execution

### Step 1: Create Database Schema (30 minutes)

**1.1 Connect to Database:**
```bash
psql "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

**1.2 Run Schema Creation:**
```sql
\i supabase/functions/server/database/schema.sql
```

**Expected Output:**
```
CREATE TABLE
CREATE INDEX
CREATE INDEX
...
CREATE TRIGGER
CREATE VIEW
```

**1.3 Install Test Helper Functions:**
```sql
\i supabase/functions/server/database/test_helpers.sql
```

**1.4 Verify Schema:**
```sql
-- List all tables
\dt

-- Check table structures
\d clients
\d sites
\d products

-- Verify indexes
\di
```

**✅ Checkpoint:** All tables, indexes, and functions created successfully

---

### Step 2: Backup Current Data (15 minutes)

**2.1 Backup KV Store:**
```bash
pg_dump -h db.[project].supabase.co \
  -U postgres \
  -d postgres \
  -t kv_store_6fcaeea3 \
  -F c \
  -f kv_store_backup_$(date +%Y%m%d_%H%M%S).dump
```

**2.2 Verify Backup:**
```bash
ls -lh kv_store_backup_*.dump
```

**2.3 Store Backup Safely:**
```bash
# Copy to safe location
cp kv_store_backup_*.dump ~/backups/
```

**✅ Checkpoint:** Backup created and verified

---

### Step 3: Run Dry Run (30 minutes)

**3.1 Navigate to Database Directory:**
```bash
cd supabase/functions/server/database
```

**3.2 Run Dry Run:**
```bash
deno run --allow-net --allow-env migrate_kv_to_tables.ts --dry-run --verbose
```

**3.3 Review Output:**
- Check for validation errors
- Verify record counts
- Note any skipped records
- Review error messages

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
📋 Found X clients to migrate
[DRY RUN] Would migrate X clients
...
================================================================================
Migration Summary
================================================================================
Duration: XX.XX seconds
Successful: XXXX
Failed: 0
Skipped: 0
================================================================================
✅ DRY RUN COMPLETE - No changes were made
```

**3.4 Document Results:**
- Copy output to `MIGRATION_TEST_RESULTS.md`
- Note any issues found
- Decide if ready to proceed

**✅ Checkpoint:** Dry run completed with no critical errors

---

### Step 4: Run Live Migration (1 hour)

**4.1 Final Confirmation:**
```bash
# Verify backup exists
ls -lh ~/backups/kv_store_backup_*.dump

# Verify you're on test environment (not production!)
echo $SUPABASE_URL
```

**4.2 Run Live Migration:**
```bash
deno run --allow-net --allow-env migrate_kv_to_tables.ts --verbose
```

**4.3 Monitor Progress:**
- Watch for errors
- Note duration
- Check batch processing
- Verify success counts

**Expected Output:**
```
================================================================================
KV Store to Relational Tables Migration
================================================================================
Mode: LIVE
...
📋 Starting clients migration...
✅ Migrated X clients
📋 Starting catalogs migration...
✅ Migrated X catalogs
📋 Starting sites migration...
✅ Migrated X sites
📋 Starting products migration...
📋 Processing batch 1/X (100 products)
✅ Migrated batch 1/X (100 products)
...
================================================================================
Migration Summary
================================================================================
Duration: XX.XX seconds
Successful: XXXX
Failed: 0
Skipped: 0
================================================================================
✅ MIGRATION COMPLETE
```

**4.4 Document Results:**
- Copy output to `MIGRATION_TEST_RESULTS.md`
- Note duration
- Record any errors

**✅ Checkpoint:** Migration completed successfully

---

### Step 5: Run Automated Tests (30 minutes)

**5.1 Run Test Suite:**
```bash
deno run --allow-net --allow-env test_migration.ts
```

**Expected Output:**
```
================================================================================
Migration Testing - Day 4
================================================================================

=== Test 1: Record Counts ===
✅ Clients Count: KV: X, SQL: X
✅ Catalogs Count: KV: X, SQL: X
✅ Sites Count: KV: X, SQL: X
✅ Products Count: KV: X, SQL: X
✅ Employees Count: KV: X, SQL: X
✅ Orders Count: KV: X, SQL: X

=== Test 2: Foreign Key Relationships ===
✅ Sites Foreign Keys: All sites have valid clients
✅ Products Foreign Keys: All products have valid catalogs
✅ Orders Foreign Keys: All orders have valid sites/clients

=== Test 3: Data Integrity ===
✅ Client Data Integrity: Sample client data matches
✅ Product Data Integrity: Sample product data matches

=== Test 4: Query Performance ===
✅ Product Listing Performance: KV: XXXms, SQL: XXms (XX% faster)
✅ Site Query Performance: KV: XXms, SQL: XXms (XX% faster)
✅ Order Count Performance: KV: XXXms, SQL: XXms (XX% faster)

=== Test 5: Index Usage ===
✅ Index Usage (Active Products): Query time: XXms (using index)

================================================================================
Test Summary
================================================================================
Total Tests: XX
Passed: XX
Failed: 0

Performance Improvements:
  List 100 Products by Catalog: XXXms → XXms (XX% faster)
  Get Site with Client Info: XXms → XXms (XX% faster)
  Count Orders by Client: XXXms → XXms (XX% faster)
================================================================================

✅ Test report saved to: migration_test_report.json
```

**5.2 Review Test Report:**
```bash
cat migration_test_report.json
```

**5.3 Document Results:**
- Copy test output to `MIGRATION_TEST_RESULTS.md`
- Attach `migration_test_report.json`
- Note any failed tests

**✅ Checkpoint:** All automated tests passed

---

### Step 6: Manual Verification (1 hour)

**6.1 Connect to Database:**
```bash
psql "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

**6.2 Verify Record Counts:**
```sql
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
```

**6.3 Check Foreign Keys:**
```sql
-- Check for orphaned records
SELECT * FROM check_orphaned_sites();
SELECT * FROM check_orphaned_products();
SELECT * FROM check_orphaned_orders();
SELECT * FROM check_orphaned_employees();
```

**6.4 Sample Data Verification:**
```sql
-- Sample client
SELECT * FROM clients LIMIT 5;

-- Sample site with client
SELECT 
  s.id,
  s.name as site_name,
  s.slug,
  c.name as client_name,
  cat.name as catalog_name
FROM sites s
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN catalogs cat ON s.catalog_id = cat.id
LIMIT 5;

-- Sample products
SELECT * FROM products LIMIT 5;

-- Sample orders
SELECT 
  o.order_number,
  o.customer_email,
  o.status,
  s.name as site_name,
  c.name as client_name
FROM orders o
LEFT JOIN sites s ON o.site_id = s.id
LEFT JOIN clients c ON o.client_id = c.id
LIMIT 5;
```

**6.5 Test Views:**
```sql
-- Active products view
SELECT * FROM active_products_view LIMIT 10;

-- Site products view
SELECT * FROM site_products_view LIMIT 10;

-- Orders summary view
SELECT * FROM orders_summary_view LIMIT 10;
```

**✅ Checkpoint:** Manual verification completed, all data looks correct

---

### Step 7: Performance Testing (1 hour)

**7.1 Test Product Listing:**
```sql
-- Get a catalog ID
SELECT id FROM catalogs LIMIT 1;

-- Test query with EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE catalog_id = '[catalog-id-from-above]' 
  AND is_active = true
ORDER BY name
LIMIT 100;
```

**Expected:** Index Scan, < 50ms

**7.2 Test Client Report:**
```sql
-- Get a client ID
SELECT id FROM clients LIMIT 1;

-- Test aggregation query
EXPLAIN ANALYZE
SELECT 
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE client_id = '[client-id-from-above]'
  AND created_at >= '2026-01-01'
  AND created_at < '2026-02-01';
```

**Expected:** Index Scan, < 100ms

**7.3 Test Product Search:**
```sql
EXPLAIN ANALYZE
SELECT * FROM products
WHERE name ILIKE '%gift%'
  AND is_active = true
LIMIT 20;
```

**Expected:** Index Scan (trigram), < 100ms

**7.4 Check Index Usage:**
```sql
SELECT * FROM check_index_usage();
```

**7.5 Analyze Table Stats:**
```sql
SELECT * FROM analyze_table_stats();
```

**✅ Checkpoint:** Performance tests show significant improvements

---

### Step 8: Document Results (1 hour)

**8.1 Complete Test Results Document:**
- Fill in all sections of `MIGRATION_TEST_RESULTS.md`
- Include all test outputs
- Document any issues found
- Add recommendations

**8.2 Create Summary:**
- Overall success/failure
- Performance improvements
- Issues found
- Next steps

**8.3 Share with Team:**
- Send test results document
- Schedule review meeting
- Get approval to proceed

**✅ Checkpoint:** Documentation complete

---

## Success Criteria

### Must Pass ✅
- [ ] All record counts match between KV and SQL
- [ ] Zero orphaned records (foreign keys intact)
- [ ] Sample data matches exactly
- [ ] Query performance 10x+ faster
- [ ] All automated tests pass
- [ ] No data loss or corruption

### Should Pass ⚠️
- [ ] Migration completes in < 10 minutes
- [ ] Zero failed records
- [ ] Zero skipped records
- [ ] Indexes being used correctly

### Nice to Have 🎯
- [ ] Query performance 100x+ faster
- [ ] Migration completes in < 5 minutes
- [ ] All manual verification passes

---

## Troubleshooting

### Issue: Migration Fails with Validation Errors

**Solution:**
1. Review error messages
2. Fix data in KV store
3. Re-run dry run
4. Re-run migration

### Issue: Foreign Key Violations

**Solution:**
1. Check for orphaned records in KV store
2. Fix data integrity issues
3. Re-run migration

### Issue: Performance Not Improved

**Solution:**
1. Check if indexes were created
2. Run ANALYZE on tables
3. Check EXPLAIN ANALYZE output
4. Verify indexes being used

### Issue: Data Mismatch

**Solution:**
1. Compare KV and SQL data side-by-side
2. Check migration script logic
3. Fix transformation issues
4. Re-run migration

---

## Rollback Procedure

If tests fail and you need to rollback:

```bash
# Clear new tables
deno run --allow-net --allow-env rollback_migration.ts --confirm

# Verify KV store still intact
# Re-run migration after fixing issues
```

---

## Next Steps

### If All Tests Pass ✅
1. Document results
2. Get team approval
3. Proceed to Day 5: Schema Adjustments
4. Plan production migration

### If Tests Fail ❌
1. Document all issues
2. Fix critical problems
3. Update migration script
4. Re-run Day 4 tests
5. Do not proceed until passing

---

## Time Tracking

| Task | Estimated | Actual | Notes |
|------|-----------|--------|-------|
| Create Schema | 30 min | ___ | |
| Backup Data | 15 min | ___ | |
| Dry Run | 30 min | ___ | |
| Live Migration | 1 hour | ___ | |
| Automated Tests | 30 min | ___ | |
| Manual Verification | 1 hour | ___ | |
| Performance Testing | 1 hour | ___ | |
| Documentation | 1 hour | ___ | |
| **Total** | **6 hours** | ___ | |

---

**Status:** Ready to Execute  
**Risk Level:** Low (test environment)  
**Confidence:** High  
**Next:** Day 5 - Schema Adjustments
