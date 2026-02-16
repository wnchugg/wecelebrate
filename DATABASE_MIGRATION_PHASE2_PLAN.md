# Database Migration Phase 2 - CRUD Operations Plan

**Date**: February 16, 2026  
**Status**: Planning & Foundation Complete  
**Approach**: Gradual migration with dual support

## What Was Accomplished

### 1. CRUD API Layer Created ✅

Created `supabase/functions/server/crud_db.ts` - A comprehensive database-backed CRUD API layer:

**Clients**:
- `getClients(filters)` - List all clients with filtering
- `getClientById(id)` - Get single client
- `createClient(input)` - Create new client
- `updateClient(id, input)` - Update client
- `deleteClient(id)` - Delete client

**Sites**:
- `getSites(filters)` - List all sites with filtering
- `getSiteById(id)` - Get single site
- `getSiteBySlug(slug)` - Get site by slug
- `createSite(input)` - Create new site
- `updateSite(id, input)` - Update site
- `deleteSite(id)` - Delete site

**Products**:
- `getProducts(filters)` - List all products with filtering
- `getProductById(id)` - Get single product
- `createProduct(input)` - Create new product
- `updateProduct(id, input)` - Update product
- `deleteProduct(id)` - Delete product

**Employees**:
- `getEmployees(filters)` - List all employees with filtering
- `getEmployeeById(id)` - Get single employee
- `createEmployee(input)` - Create new employee
- `updateEmployee(id, input)` - Update employee
- `deleteEmployee(id)` - Delete employee

**Orders**:
- `getOrders(filters)` - List all orders with filtering
- `getOrderById(id)` - Get single order
- `getOrderByNumber(orderNumber)` - Get order by number
- `createOrder(input)` - Create new order
- `updateOrder(id, input)` - Update order
- `deleteOrder(id)` - Delete order

**Utilities**:
- `getProductCategories()` - Get all product categories
- `getOrderStats(filters)` - Get order statistics

### 2. Database Helper Functions Available ✅

All CRUD operations use the existing `database/db.ts` helper functions:
- Proper error handling
- Type safety with TypeScript
- Efficient SQL queries with indexes
- Transaction support where needed

## Migration Strategy

### Approach: Gradual Migration

Instead of replacing all KV operations at once (high risk), we'll use a gradual approach:

1. **Create New Endpoints** - Add new database-backed endpoints alongside existing KV ones
2. **Test Thoroughly** - Ensure new endpoints work correctly
3. **Update Frontend** - Point frontend to new endpoints
4. **Deprecate Old Endpoints** - Mark KV endpoints as deprecated
5. **Remove KV Code** - After verification, remove KV store code

### Phase 2A: Add New Database Endpoints (2-3 hours)

Add new endpoints to `index.tsx`:

```typescript
// New database-backed endpoints
app.get("/make-server-6fcaeea3/v2/clients", verifyAdmin, async (c) => {
  const { getClients } = await import('./crud_db.ts');
  const filters = {
    status: c.req.query('status'),
    search: c.req.query('search'),
    limit: parseInt(c.req.query('limit') || '50'),
    offset: parseInt(c.req.query('offset') || '0'),
  };
  const result = await getClients(filters);
  return c.json(result);
});

app.get("/make-server-6fcaeea3/v2/clients/:id", verifyAdmin, async (c) => {
  const { getClientById } = await import('./crud_db.ts');
  const id = c.req.param('id');
  const result = await getClientById(id);
  return c.json(result);
});

app.post("/make-server-6fcaeea3/v2/clients", verifyAdmin, async (c) => {
  const { createClient } = await import('./crud_db.ts');
  const input = await c.req.json();
  const result = await createClient(input);
  return c.json(result);
});

app.put("/make-server-6fcaeea3/v2/clients/:id", verifyAdmin, async (c) => {
  const { updateClient } = await import('./crud_db.ts');
  const id = c.req.param('id');
  const input = await c.req.json();
  const result = await updateClient(id, input);
  return c.json(result);
});

app.delete("/make-server-6fcaeea3/v2/clients/:id", verifyAdmin, async (c) => {
  const { deleteClient } = await import('./crud_db.ts');
  const id = c.req.param('id');
  const result = await deleteClient(id);
  return c.json(result);
});
```

Repeat for:
- Sites (5 endpoints)
- Products (5 endpoints)
- Employees (5 endpoints)
- Orders (6 endpoints)

**Total**: ~26 new endpoints

### Phase 2B: Update Reseed Endpoint (1 hour)

Update `/dev/reseed` to use database instead of KV store:

```typescript
app.post("/make-server-6fcaeea3/dev/reseed", verifyAdmin, async (c) => {
  try {
    // Clear database tables
    await clearDatabaseTables();
    
    // Seed with database functions
    await seedDatabaseTables();
    
    return c.json({ 
      success: true, 
      message: 'Database reseeded successfully',
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
```

### Phase 2C: Create Tests (2-3 hours)

Create test files for each entity:
- `tests/clients_crud.test.ts`
- `tests/sites_crud.test.ts`
- `tests/products_crud.test.ts`
- `tests/employees_crud.test.ts`
- `tests/orders_crud.test.ts`

Each test file should cover:
- GET all (with filters)
- GET by ID
- POST (create)
- PUT (update)
- DELETE
- Error cases

### Phase 2D: Update Frontend (2-3 hours)

Update frontend API calls to use new `/v2/` endpoints:
- Admin dashboard
- Client management
- Site management
- Product management
- Employee management
- Order management

### Phase 2E: Remove KV Code (1-2 hours)

After verification:
- Remove old KV endpoints
- Remove `kv_store.tsx`
- Remove `kv_env.ts`
- Update documentation

## Alternative: Quick Win Approach

If full migration is too time-consuming, we can take a "quick win" approach:

### Option 1: Migrate Only Critical Paths

Focus on the most-used operations:
1. **Dashboard** (already done ✅)
2. **Order Creation** - High business value
3. **Employee Lookup** - High frequency
4. **Site Configuration** - Admin operations

Leave less-critical operations in KV store for now.

### Option 2: Hybrid Approach

Keep KV store for some operations, use database for others:
- **Database**: Orders, Employees, Products (transactional data)
- **KV Store**: Configurations, Settings, Cache (configuration data)

This reduces migration scope while getting performance benefits.

## Recommendation

Given the size and complexity of the codebase, I recommend:

### Immediate (Today):
1. ✅ CRUD API layer created (`crud_db.ts`)
2. ✅ Dashboard endpoints migrated and tested
3. **Next**: Add 5-10 most critical endpoints using `crud_db.ts`

### Short Term (This Week):
1. Add database-backed endpoints for Orders (most business-critical)
2. Add database-backed endpoints for Employees (high frequency)
3. Test thoroughly with existing frontend

### Medium Term (Next Week):
1. Complete all CRUD endpoints
2. Update frontend to use new endpoints
3. Deprecate KV endpoints

### Long Term (Next Month):
1. Remove KV store code
2. Update all documentation
3. Performance optimization

## Files Created

- ✅ `supabase/functions/server/crud_db.ts` - Complete CRUD API layer
- ✅ `supabase/functions/server/dashboard_db.ts` - Dashboard functions (Phase 1)
- ✅ `supabase/functions/server/database/db.ts` - Database helpers (existing)
- ✅ `supabase/functions/server/database/seed-test-data.ts` - Database seeding

## Next Steps

### Option A: Full Migration (6-8 hours)
Continue with Phase 2A-2E as outlined above.

### Option B: Incremental Migration (2-3 hours)
1. Add 5-10 critical endpoints using `crud_db.ts`
2. Test with frontend
3. Gradually add more endpoints over time

### Option C: Document & Pause (30 minutes)
1. Document what's been done
2. Create clear migration guide for future work
3. Focus on other priorities

## Questions to Answer

1. **Which approach do you prefer?** (Full, Incremental, or Document & Pause)
2. **Which entities are most critical?** (Orders, Employees, Products?)
3. **Is frontend update in scope?** (Or just backend API?)
4. **Timeline constraints?** (How much time available?)

## Summary

We've built a solid foundation:
- ✅ Complete CRUD API layer ready to use
- ✅ Dashboard endpoints proven working
- ✅ Database schema tested and validated
- ✅ All helper functions available

The migration can proceed at whatever pace makes sense for your project priorities.

---

**Status**: Foundation Complete, Ready for Endpoint Migration  
**Risk**: Low (proven approach, gradual migration)  
**Effort**: 2-8 hours depending on approach  
**Impact**: High (complete KV store removal possible)
