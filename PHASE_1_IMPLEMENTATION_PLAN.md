# Phase 1: Database Optimization - Implementation Plan

**Timeline:** 2 weeks (February 15 - February 28, 2026)  
**Budget:** $10,000 (80 hours)  
**Goal:** Improve query performance by 10-50x through proper database structure

---

## Week 1: Schema Design & Migration Script

### Day 1: Schema Design & Review (Monday, Feb 15)

**Tasks:**
- [x] Review current KV store structure
- [ ] Design new PostgreSQL schema with proper tables
- [ ] Define indexes for optimal query performance
- [ ] Define foreign key relationships
- [ ] Define constraints and validation rules
- [ ] Review schema with team

**Deliverables:**
- `schema.sql` - Complete database schema
- `SCHEMA_DESIGN.md` - Documentation of design decisions

**Time:** 8 hours

---

### Day 2-3: Migration Script Development (Tuesday-Wednesday, Feb 16-17)

**Tasks:**
- [ ] Write migration script to transform KV data to new tables
- [ ] Handle data type conversions (JSONB → proper columns)
- [ ] Implement data validation during migration
- [ ] Create rollback script
- [ ] Add progress logging and error handling

**Deliverables:**
- `migrate_kv_to_tables.ts` - Migration script
- `rollback_migration.ts` - Rollback script
- `MIGRATION_GUIDE.md` - Step-by-step migration instructions

**Time:** 16 hours

---

### Day 4: Test Migration on Copy (Thursday, Feb 18)

**Tasks:**
- [ ] Create copy of production database
- [ ] Run migration script on copy
- [ ] Verify data integrity
- [ ] Check all relationships
- [ ] Test queries on new schema
- [ ] Measure performance improvements

**Deliverables:**
- `MIGRATION_TEST_RESULTS.md` - Test results and metrics
- List of issues found and fixes needed

**Time:** 8 hours

---

### Day 5: Schema Adjustments (Friday, Feb 19)

**Tasks:**
- [ ] Fix issues found during testing
- [ ] Optimize indexes based on test results
- [ ] Add missing constraints
- [ ] Update migration script
- [ ] Re-test migration

**Deliverables:**
- Updated `schema.sql`
- Updated `migrate_kv_to_tables.ts`
- `SCHEMA_CHANGES.md` - Log of changes made

**Time:** 8 hours

---

## Week 2: Dual-Write Implementation & Gradual Migration

### Day 6-7: Dual-Write Layer (Monday-Tuesday, Feb 22-23)

**Tasks:**
- [ ] Create database abstraction layer
- [ ] Implement dual-write logic (write to both KV and new tables)
- [ ] Add feature flag to control dual-write behavior
- [ ] Update all write operations to use dual-write
- [ ] Add monitoring for write consistency

**Deliverables:**
- `database_abstraction.ts` - Database abstraction layer
- `dual_write_service.ts` - Dual-write implementation
- Updated API endpoints to use dual-write

**Time:** 16 hours

---

### Day 8-9: Gradual Read Migration (Wednesday-Thursday, Feb 24-25)

**Tasks:**
- [ ] Create feature flags for read source (KV vs new tables)
- [ ] Migrate read operations endpoint by endpoint
- [ ] Add fallback logic (if new table fails, read from KV)
- [ ] Monitor query performance
- [ ] Compare results between KV and new tables

**Deliverables:**
- Updated API endpoints to read from new tables
- `READ_MIGRATION_STATUS.md` - Status of each endpoint
- Performance comparison metrics

**Time:** 16 hours

---

### Day 10: Performance Testing & Validation (Friday, Feb 26)

**Tasks:**
- [ ] Run load tests on new schema
- [ ] Measure query performance improvements
- [ ] Test with realistic data volumes
- [ ] Verify data consistency between KV and new tables
- [ ] Document performance gains

**Deliverables:**
- `PERFORMANCE_TEST_RESULTS.md` - Detailed performance metrics
- Load test reports
- Recommendations for next steps

**Time:** 8 hours

---

## Implementation Strategy

### Approach: Gradual Migration (Low Risk)

**Phase 1a: Preparation (Week 1)**
```
Current State:
┌─────────────────┐
│   KV Store      │ ← All reads and writes
└─────────────────┘

After Week 1:
┌─────────────────┐     ┌─────────────────┐
│   KV Store      │     │  New Tables     │
│   (Active)      │     │  (Created,      │
│                 │     │   Empty)        │
└─────────────────┘     └─────────────────┘
```

**Phase 1b: Dual-Write (Week 2, Days 1-2)**
```
┌─────────────────┐     ┌─────────────────┐
│   KV Store      │ ←── │  New Tables     │
│   (Reads)       │     │  (Writes)       │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
         ↑                       ↑
         └───── Dual Write ──────┘
```

**Phase 1c: Gradual Read Migration (Week 2, Days 3-4)**
```
┌─────────────────┐     ┌─────────────────┐
│   KV Store      │     │  New Tables     │
│   (Fallback)    │ ←── │  (Primary)      │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
         ↑                       ↑
         └─── Read if fail ──────┘
```

**Phase 1d: Complete Migration (Future)**
```
┌─────────────────┐     ┌─────────────────┐
│   KV Store      │     │  New Tables     │
│   (Deprecated)  │     │  (All traffic)  │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

---

## Database Schema Overview

### Core Tables

1. **clients** - Client organizations
2. **sites** - Individual celebration sites
3. **catalogs** - Product catalogs
4. **products** - Individual products/gifts
5. **orders** - Customer orders
6. **site_product_exclusions** - Products excluded from specific sites
7. **analytics_events** - User activity tracking

### Key Indexes

**High-Impact Indexes:**
- `idx_products_catalog_id` - For filtering products by catalog
- `idx_orders_client_created` - For client reports (composite index)
- `idx_products_name_trgm` - For full-text product search
- `idx_sites_client_id` - For listing client's sites

**Performance Targets:**
- List 1000 products: 1,001 queries → 1 query (1000x improvement)
- Client monthly report: 100,001 queries → 1 query (100,000x improvement)
- Product search: Full table scan → Index scan (50x improvement)

---

## Risk Mitigation

### Rollback Plan

**If migration fails:**
1. Disable dual-write feature flag
2. Route all reads back to KV store
3. Investigate and fix issues
4. Re-enable when ready

**Rollback time:** < 5 minutes (feature flag toggle)

### Data Consistency Checks

**During dual-write period:**
- Compare write counts (KV vs new tables)
- Randomly sample records and compare
- Monitor for write errors
- Alert on inconsistencies

### Monitoring

**Key Metrics:**
- Query execution time (P50, P95, P99)
- Database connection count
- Error rates per endpoint
- Data consistency percentage
- Cache hit rate (for Phase 2)

---

## Success Criteria

### Week 1 Success Criteria
- [ ] New schema created and tested
- [ ] Migration script successfully transforms all KV data
- [ ] No data loss during migration
- [ ] All relationships and constraints working
- [ ] Performance tests show 10x+ improvement

### Week 2 Success Criteria
- [ ] Dual-write implemented for all write operations
- [ ] At least 50% of read operations migrated to new tables
- [ ] No increase in error rates
- [ ] Query performance improved by 10x+ on migrated endpoints
- [ ] Data consistency > 99.9% between KV and new tables

### Overall Phase 1 Success
- [ ] 100x faster queries for product listings
- [ ] 100x faster queries for reports
- [ ] Database load reduced by 50%+
- [ ] Zero downtime during migration
- [ ] Rollback plan tested and ready

---

## Files to Create/Modify

### New Files
- `supabase/migrations/001_create_new_schema.sql`
- `supabase/functions/server/database/schema.sql`
- `supabase/functions/server/database/migrate_kv_to_tables.ts`
- `supabase/functions/server/database/rollback_migration.ts`
- `supabase/functions/server/database/database_abstraction.ts`
- `supabase/functions/server/database/dual_write_service.ts`
- `SCHEMA_DESIGN.md`
- `MIGRATION_GUIDE.md`
- `MIGRATION_TEST_RESULTS.md`
- `PERFORMANCE_TEST_RESULTS.md`

### Files to Modify
- `supabase/functions/server/catalogs_api.ts` - Use new tables
- `supabase/functions/server/products_api.ts` - Use new tables
- `supabase/functions/server/orders_api.ts` - Use new tables
- `supabase/functions/server/sites_api.ts` - Use new tables
- `supabase/functions/server/clients_api.ts` - Use new tables

---

## Next Steps

**Ready to start?**

1. **Today:** Create database schema design
2. **Tomorrow:** Start migration script development
3. **This week:** Complete Week 1 tasks
4. **Next week:** Implement dual-write and gradual migration

**Shall we begin with Day 1: Schema Design?**
