# API Refactoring Plan - KV Store to Database Tables

## Date: February 15, 2026
## Goal: Replace KV store with PostgreSQL tables for 100-1000x performance improvement

---

## Phase 1: Create Database Access Layer ✅ COMPLETE
- [x] Schema design (schema.sql)
- [x] Migration scripts
- [x] Test infrastructure

---

## Phase 2: Create Database Helper Module (NOW)

### Step 1: Create `db.ts` - Database Access Layer
A new module that provides clean database access functions to replace KV store calls.

**Key Functions**:
```typescript
// Products
export async function getProducts(filters?: ProductFilters): Promise<Product[]>
export async function getProductById(id: string): Promise<Product | null>
export async function createProduct(data: CreateProductInput): Promise<Product>
export async function updateProduct(id: string, data: UpdateProductInput): Promise<Product>
export async function deleteProduct(id: string): Promise<void>

// Catalogs
export async function getCatalogs(filters?: CatalogFilters): Promise<Catalog[]>
export async function getCatalogById(id: string): Promise<Catalog | null>
export async function createCatalog(data: CreateCatalogInput): Promise<Catalog>
export async function updateCatalog(id: string, data: UpdateCatalogInput): Promise<Catalog>
export async function deleteCatalog(id: string): Promise<void>

// Clients
export async function getClients(filters?: ClientFilters): Promise<Client[]>
export async function getClientById(id: string): Promise<Client | null>
export async function createClient(data: CreateClientInput): Promise<Client>
export async function updateClient(id: string, data: UpdateClientInput): Promise<Client>
export async function deleteClient(id: string): Promise<void>

// Sites
export async function getSites(filters?: SiteFilters): Promise<Site[]>
export async function getSiteById(id: string): Promise<Site | null>
export async function createSite(data: CreateSiteInput): Promise<Site>
export async function updateSite(id: string, data: UpdateSiteInput): Promise<Site>
export async function deleteSite(id: string): Promise<void>

// Employees
export async function getEmployees(filters?: EmployeeFilters): Promise<Employee[]>
export async function getEmployeeById(id: string): Promise<Employee | null>
export async function createEmployee(data: CreateEmployeeInput): Promise<Employee>
export async function updateEmployee(id: string, data: UpdateEmployeeInput): Promise<Employee>
export async function deleteEmployee(id: string): Promise<void>

// Orders
export async function getOrders(filters?: OrderFilters): Promise<Order[]>
export async function getOrderById(id: string): Promise<Order | null>
export async function createOrder(data: CreateOrderInput): Promise<Order>
export async function updateOrder(id: string, data: UpdateOrderInput): Promise<Order>
export async function deleteOrder(id: string): Promise<void>
```

---

## Phase 3: Refactor API Endpoints

### Priority 1: Products/Gifts API
**File**: `supabase/functions/server/gifts_api.ts`

**Changes**:
- Replace `kv.get('gifts:all')` → `db.getProducts()`
- Replace `kv.get('gift:...')` → `db.getProductById()`
- Replace `kv.set()` → `db.createProduct()` / `db.updateProduct()`
- Remove KV-specific logic (key prefixes, manual indexing)

**Impact**: 6 products currently in KV store

---

### Priority 2: Catalogs API
**File**: `supabase/functions/server/catalogs_api.ts`

**Changes**:
- Replace `kv.get('catalogs:all')` → `db.getCatalogs()`
- Replace `kv.get('catalogs:...')` → `db.getCatalogById()`
- Replace manual indexing → Database queries with WHERE clauses
- Remove catalog_gifts array → Use JOIN queries

**Impact**: 0 catalogs currently (empty)

---

### Priority 3: CRUD Factory Refactoring
**File**: `supabase/functions/server/crud_factory.ts`

**Options**:
1. **Option A**: Create new `db_crud_factory.ts` that uses database
2. **Option B**: Add database mode to existing `crud_factory.ts`
3. **Option C**: Deprecate CRUD factory, use direct database calls

**Recommendation**: Option A (cleanest separation)

**Affected Resources**:
- Clients (0 records)
- Sites (0 records)
- Employees (0 records)
- Orders (0 records)

---

### Priority 4: Migrated Resources
**File**: `supabase/functions/server/migrated_resources.ts`

**Changes**:
- Update `setupClientRoutes()` to use database
- Update `setupSiteRoutes()` to use database
- Update `setupEmployeeRoutes()` to use database
- Update `setupOrderRoutes()` to use database

---

## Phase 4: Testing & Validation

### Step 1: Unit Tests
- Test each database function
- Verify CRUD operations
- Test filtering and pagination

### Step 2: Integration Tests
- Test API endpoints
- Verify response formats match existing
- Test error handling

### Step 3: Performance Tests
- Measure query times
- Verify index usage
- Compare to KV store baseline

---

## Phase 5: Deployment

### Step 1: Deploy Schema
```bash
psql $DATABASE_URL -f supabase/functions/server/database/schema.sql
```

### Step 2: Deploy Refactored Code
- Deploy new `db.ts` module
- Deploy refactored API endpoints
- Monitor for errors

### Step 3: Verify
- Test all endpoints
- Check performance metrics
- Verify data integrity

---

## Implementation Order

### Day 1: Database Layer (2-3 hours)
1. Create `db.ts` with all database functions
2. Create TypeScript types for all entities
3. Test database connections

### Day 2: Products & Catalogs (2-3 hours)
4. Refactor `gifts_api.ts` to use `db.ts`
5. Refactor `catalogs_api.ts` to use `db.ts`
6. Test endpoints

### Day 3: CRUD Resources (3-4 hours)
7. Create `db_crud_factory.ts`
8. Refactor `migrated_resources.ts`
9. Test all CRUD endpoints

### Day 4: Testing & Deployment (2-3 hours)
10. Run integration tests
11. Deploy schema to database
12. Deploy refactored code
13. Verify and monitor

**Total Estimated Time**: 9-13 hours

---

## Success Metrics

### Performance Improvements
- List 1000 products: 1,001 queries → 1 query (1000x faster)
- Get client with sites: 101 queries → 1 query (100x faster)
- Order history: 1,001 queries → 1 query (1000x faster)

### Code Quality
- Remove ~500 lines of KV store logic
- Add proper database indexes
- Enable complex queries (JOINs, aggregations)

### Maintainability
- Standard SQL queries (easier to debug)
- Database constraints (data integrity)
- Better error messages

---

## Risk Mitigation

### Backward Compatibility
- Keep KV store code temporarily
- Feature flag for database vs KV
- Gradual rollout

### Rollback Plan
- Keep KV store intact
- Can revert code deployment
- Database schema is additive (no data loss)

### Testing Strategy
- Test on development first
- Verify all endpoints work
- Load test before production

---

## Next Steps

1. ✅ Create this plan
2. ⏳ Create `db.ts` module
3. ⏳ Refactor products API
4. ⏳ Refactor catalogs API
5. ⏳ Refactor CRUD resources
6. ⏳ Test and deploy

---

## Questions Before Starting

1. **Deploy schema now or later?**
   - Now: Can test with real database immediately
   - Later: Can develop and test locally first

2. **Keep KV store as fallback?**
   - Yes: Safer, can rollback easily
   - No: Cleaner code, forces migration

3. **Gradual or all-at-once?**
   - Gradual: One API at a time
   - All-at-once: Faster but riskier

**Recommendation**: Deploy schema now, keep KV fallback, refactor gradually
