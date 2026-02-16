# Database Migration Plan - KV Store to PostgreSQL

**Date**: February 16, 2026  
**Status**: Planning Phase  
**Scope**: Complete migration from KV store to PostgreSQL database

## Executive Summary

The backend currently uses a KV (Key-Value) store for data persistence. We need to migrate all operations to use the PostgreSQL database schema that was created in Phase 1.

**Current State**: ~395 KV operations across the backend  
**Target State**: 0 KV operations, all data in PostgreSQL  
**Expected Performance Improvement**: 100-1000x faster queries

## Migration Scope

### Files Using KV Store

Based on analysis, the following files have KV dependencies:

1. **Core Backend** (`index.tsx`) - ~200+ operations
   - Dashboard endpoints
   - Client/Site CRUD
   - Order management
   - Employee management
   - Gift/Product management
   - Site configurations

2. **HRIS Integration** (`hris.tsx`) - ~30 operations
   - Connection management
   - Sync history
   - Employee sync

3. **Scheduled Triggers** (`scheduled_triggers.tsx`) - ~15 operations
   - Reminder emails
   - Anniversary notifications
   - Trigger logs

4. **Catalog Migration** (`catalog-migration.ts`) - ~25 operations
   - Legacy catalog support
   - Gift-catalog relationships

5. **Seed Scripts** (`seed.ts`, `seed-demo-sites.tsx`) - ~20 operations
   - Database seeding
   - Demo data creation

6. **Other Files**:
   - `email_automation.tsx`
   - `webhook_system.tsx`
   - `kv_store.tsx`
   - `kv_env.ts`

### Database Schema Available

The following tables are already defined in `database/schema.sql`:

✅ **clients** - Client organizations  
✅ **sites** - Celebration sites  
✅ **catalogs** - Product catalogs  
✅ **products** - Gift products  
✅ **site_product_exclusions** - Product filtering  
✅ **employees** - Employee records  
✅ **orders** - Order transactions  
✅ **analytics_events** - Event tracking  
✅ **admin_users** - Admin accounts  
✅ **audit_logs** - Audit trail  

### Additional Tables Needed

❌ **hris_connections** - HRIS integration configs  
❌ **hris_sync_history** - Sync execution logs  
❌ **scheduled_trigger_logs** - Trigger execution logs  
❌ **site_catalog_assignments** - Site-catalog relationships (exists in separate file)  
❌ **email_templates** - Email template storage  
❌ **webhook_configs** - Webhook configurations  

## Migration Strategy

### Phase 1: Preparation (Current)
1. ✅ Analyze KV usage across codebase
2. ✅ Document current schema
3. ⏳ Create missing database tables
4. ⏳ Create database helper functions

### Phase 2: Core Entities Migration
1. Migrate Client operations
2. Migrate Site operations
3. Migrate Product/Gift operations
4. Migrate Employee operations
5. Migrate Order operations

### Phase 3: Dashboard & Analytics
1. Migrate dashboard stats endpoint
2. Migrate recent orders endpoint
3. Migrate popular gifts endpoint
4. Update analytics queries

### Phase 4: Integrations
1. Migrate HRIS integration
2. Migrate scheduled triggers
3. Migrate email automation
4. Migrate webhook system

### Phase 5: Cleanup
1. Remove KV store files
2. Update documentation
3. Update seed scripts
4. Remove KV dependencies

## Migration Approach

### Option A: Big Bang Migration (Not Recommended)
- Migrate everything at once
- High risk
- Difficult to test
- Long deployment window

### Option B: Gradual Migration (Recommended)
- Migrate one entity type at a time
- Test each migration
- Can rollback individual changes
- Lower risk

### Option C: Dual-Write Pattern
- Write to both KV and DB
- Read from DB, fallback to KV
- Gradual cutover
- Safest but most complex

**Recommendation**: Use Option B (Gradual Migration) with the following order:

1. **Clients** (lowest risk, foundational)
2. **Sites** (depends on clients)
3. **Products** (independent)
4. **Employees** (depends on sites)
5. **Orders** (depends on all above)
6. **Dashboard** (read-only, depends on orders)
7. **Integrations** (lowest priority)

## Technical Implementation

### Database Helper Pattern

Instead of:
```typescript
// KV Store
const client = await kv.get(`client:${environmentId}:${clientId}`, environmentId);
await kv.set(`client:${environmentId}:${clientId}`, client, environmentId);
```

Use:
```typescript
// Database
import * as db from './database/db.ts';
const client = await db.getClientById(clientId);
await db.updateClient(clientId, updates);
```

### Migration Checklist Per Entity

For each entity type:

- [ ] Create database helper functions in `database/db.ts`
- [ ] Update CREATE operations
- [ ] Update READ operations
- [ ] Update UPDATE operations
- [ ] Update DELETE operations
- [ ] Update LIST/QUERY operations
- [ ] Test with existing data
- [ ] Update tests
- [ ] Deploy and monitor

## Risk Assessment

### High Risk Areas
1. **Dashboard endpoints** - High traffic, performance critical
2. **Order creation** - Business critical
3. **Authentication** - Security critical

### Mitigation Strategies
1. Comprehensive testing before deployment
2. Database indexes for performance
3. Monitoring and alerting
4. Rollback plan for each phase
5. Feature flags for gradual rollout

## Performance Considerations

### Expected Improvements
- **KV Store**: O(n) for prefix scans, no joins
- **PostgreSQL**: O(log n) with indexes, efficient joins

### Optimization Strategies
1. Add indexes on foreign keys
2. Add indexes on frequently queried fields
3. Use database views for complex queries
4. Implement connection pooling
5. Cache frequently accessed data

## Testing Strategy

### Unit Tests
- Test each database helper function
- Mock database responses
- Test error handling

### Integration Tests
- Test full CRUD operations
- Test with real database
- Test data consistency

### Performance Tests
- Benchmark query performance
- Compare KV vs DB performance
- Load testing

### Migration Tests
- Test data migration scripts
- Verify data integrity
- Test rollback procedures

## Rollback Plan

For each migration phase:

1. **Backup**: Take database snapshot before migration
2. **Feature Flag**: Use environment variable to toggle KV/DB
3. **Monitoring**: Track errors and performance
4. **Rollback**: Switch back to KV if issues detected
5. **Data Sync**: Sync any new data back to KV if needed

## Timeline Estimate

### Conservative Estimate
- Phase 1 (Preparation): 2-3 hours
- Phase 2 (Core Entities): 4-6 hours
- Phase 3 (Dashboard): 2-3 hours
- Phase 4 (Integrations): 3-4 hours
- Phase 5 (Cleanup): 1-2 hours

**Total**: 12-18 hours of development time

### Aggressive Estimate
- All phases: 6-8 hours (if no issues)

## Success Criteria

✅ All KV operations replaced with database operations  
✅ All tests passing  
✅ Performance equal or better than KV  
✅ No data loss  
✅ Dashboard API tests still passing (30/30)  
✅ Documentation updated  
✅ KV store files removed  

## Next Steps

1. **Immediate**: Create missing database tables
2. **Next**: Implement database helper functions
3. **Then**: Start with Client migration
4. **Finally**: Remove KV dependencies

## Questions to Answer

1. Do we need to migrate existing KV data to database?
2. Should we keep KV as a cache layer?
3. What's the deployment strategy?
4. Do we need a maintenance window?
5. How do we handle the admin user authentication (currently in KV)?

## Notes

- The database schema is already created and deployed
- The `database/db.ts` file already has some helper functions
- Dashboard API tests are currently passing with KV data
- After migration, we'll need to reseed the database
- Admin authentication may need special handling

---

**Status**: Ready to begin Phase 1  
**Priority**: High (technical debt reduction)  
**Impact**: High (performance improvement, scalability)
