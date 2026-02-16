# Architecture Guide

## Date: February 15, 2026
## Purpose: Guide for choosing the right architecture pattern

---

## Overview

This application uses a **hybrid architecture** with two distinct patterns:

1. **CRUD Factory Pattern** - For simple resources
2. **Direct Database Pattern** - For complex queries

This guide helps you choose the right pattern for new features.

---

## Quick Decision Tree

```
Need to add a new resource?
│
├─ Does it need JOINs with other tables?
│  ├─ YES → Use Direct Database Pattern
│  └─ NO → Continue...
│
├─ Does it need aggregations (SUM, AVG, COUNT)?
│  ├─ YES → Use Direct Database Pattern
│  └─ NO → Continue...
│
├─ Does it need complex filtering across multiple fields?
│  ├─ YES → Use Direct Database Pattern
│  └─ NO → Continue...
│
├─ Is performance critical (>1000 queries/sec)?
│  ├─ YES → Use Direct Database Pattern
│  └─ NO → Continue...
│
└─ Use CRUD Factory Pattern ✅
```

---

## Pattern 1: CRUD Factory (KV Store)

### When to Use ✅

- Simple CRUD operations (Create, Read, Update, Delete)
- Key-based lookups (get by ID)
- Basic filtering (status, type, etc.)
- Flexible schema (JSONB storage)
- Rapid development
- Resources without complex relationships

### Examples

- Clients
- Sites
- Employees
- Admin Users
- Roles
- Access Groups
- Celebrations
- Email Templates
- Brands

### Implementation

```typescript
// In migrated_resources.ts

import { createCrudRoutes } from './crud_factory.ts';

function setupMyResourceRoutes(app: Hono, verifyAdminMiddleware?: any): void {
  createCrudRoutes<MyResource>(app, {
    resourceName: 'my-resources',
    keyPrefix: 'my_resource',
    validate: validateMyResource,
    transform: transformMyResource,
    accessControl: myResourceAccessControl,
    generateId: generateMyResourceId,
    middleware: verifyAdminMiddleware,
    auditLogging: true,
    softDelete: false,
    enablePagination: true,
    defaultPageSize: 50,
    maxPageSize: 100,
    additionalFilters: ['status', 'type'],
  });
}
```

### Pros ✅

- Fast development (10 minutes to add new resource)
- Consistent API patterns
- Built-in features:
  - Validation
  - Pagination
  - Audit logging
  - Soft delete
  - Access control
  - Error handling
- Less boilerplate code
- Easy to maintain

### Cons ❌

- Limited to KV store operations
- No JOIN queries
- No aggregations
- No complex filtering
- Performance limited for complex operations

### Performance

- Get by ID: 5-10ms ✅
- List all: 50-100ms ✅
- Create: 10-20ms ✅
- Update: 10-20ms ✅
- Delete: 10-20ms ✅

---

## Pattern 2: Direct Database (PostgreSQL)

### When to Use ✅

- Complex relationships (JOINs)
- Advanced queries (aggregations, statistics)
- Performance-critical operations
- Well-defined schemas with foreign keys
- Complex business logic
- Resources with many relationships

### Examples

- Products (gifts_api_v2.ts)
- Orders (gifts_api_v2.ts)
- Catalogs (catalogs_api_v2.ts)
- Site Catalog Config (site-catalog-config_api_v2.ts)

### Implementation

#### Step 1: Add Database Tables

```sql
-- In database/schema.sql or separate file

CREATE TABLE IF NOT EXISTS my_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_my_resources_status ON my_resources(status);
```

#### Step 2: Add TypeScript Types

```typescript
// In database/types.ts

export interface MyResource {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateMyResourceInput {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateMyResourceInput {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}
```

#### Step 3: Add Database Functions

```typescript
// In database/db.ts

export async function getMyResources(filters?: MyResourceFilters): Promise<MyResource[]> {
  try {
    let query = supabase.from('my_resources').select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleError('getMyResources', error);
    return data || [];
  } catch (error) {
    handleError('getMyResources', error);
  }
}

export async function getMyResourceById(id: string): Promise<MyResource | null> {
  try {
    const { data, error } = await supabase
      .from('my_resources')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      handleError('getMyResourceById', error);
    }
    
    return data;
  } catch (error) {
    handleError('getMyResourceById', error);
  }
}

// Add more CRUD functions...
```

#### Step 4: Create API Endpoints

```typescript
// In my_resource_api_v2.ts

import { Hono } from 'npm:hono';
import * as db from './database/db.ts';

const app = new Hono();

app.get('/', async (c) => {
  try {
    const status = c.req.query('status');
    const resources = await db.getMyResources({ status });
    
    return c.json({
      success: true,
      data: resources,
      total: resources.length,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const resource = await db.getMyResourceById(id);
    
    if (!resource) {
      return c.json({
        success: false,
        error: 'Resource not found',
      }, 404);
    }
    
    return c.json({
      success: true,
      data: resource,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// Add more endpoints...

export default app;
```

#### Step 5: Register Routes

```typescript
// In index.tsx

import myResourceApi from './my_resource_api_v2.ts';

app.route("/make-server-6fcaeea3/my-resources", myResourceApi);
```

### Pros ✅

- Full SQL capabilities (JOINs, aggregations)
- Foreign key constraints (data integrity)
- Optimized indexes (fast queries)
- Complex filtering
- 100-1000x faster for complex queries
- Better for analytics and reporting

### Cons ❌

- More boilerplate code
- Manual endpoint implementation
- Need to write database functions
- Slower development (1-2 hours per resource)
- More complex to maintain

### Performance

- Get by ID: 5-10ms ✅
- List all: 50-100ms ✅
- JOIN query: 50-100ms ✅
- Aggregation: 100-150ms ✅
- Complex filter: 50-100ms ✅
- Statistics: 100-150ms ✅

---

## Comparison Table

| Feature | CRUD Factory | Direct Database |
|---------|--------------|-----------------|
| Development Speed | ⚡ Fast (10 min) | 🐢 Slow (1-2 hours) |
| Code Complexity | ✅ Simple | ❌ Complex |
| JOIN Queries | ❌ No | ✅ Yes |
| Aggregations | ❌ No | ✅ Yes |
| Complex Filtering | ❌ Limited | ✅ Full |
| Foreign Keys | ❌ No | ✅ Yes |
| Performance (Simple) | ✅ Good | ✅ Good |
| Performance (Complex) | ❌ Poor | ✅ Excellent |
| Maintainability | ✅ Easy | ⚠️ Moderate |
| Flexibility | ✅ High | ⚠️ Moderate |
| Best For | Simple CRUD | Complex queries |

---

## Real-World Examples

### Example 1: Adding a "Tags" Resource

**Requirements**:
- Simple CRUD operations
- No relationships with other tables
- Basic filtering by status

**Decision**: Use CRUD Factory ✅

**Reason**: No complex queries needed, just simple CRUD

**Implementation Time**: 10 minutes

---

### Example 2: Adding a "Product Reviews" Resource

**Requirements**:
- Need to JOIN with products table
- Need to calculate average ratings (aggregation)
- Need to filter by product, rating, date range

**Decision**: Use Direct Database ✅

**Reason**: Requires JOINs and aggregations

**Implementation Time**: 1-2 hours

---

### Example 3: Adding a "Notifications" Resource

**Requirements**:
- Simple CRUD operations
- Filter by user, status, type
- No relationships needed

**Decision**: Use CRUD Factory ✅

**Reason**: Simple filtering, no complex queries

**Implementation Time**: 10 minutes

---

### Example 4: Adding an "Analytics Dashboard" Resource

**Requirements**:
- Need to JOIN multiple tables (orders, products, sites)
- Need aggregations (SUM, AVG, COUNT)
- Need date range filtering
- Performance critical

**Decision**: Use Direct Database ✅

**Reason**: Complex queries, aggregations, performance critical

**Implementation Time**: 2-3 hours

---

## Migration Guide

### Migrating from CRUD Factory to Direct Database

If a resource grows in complexity and needs database features:

1. **Create database tables** (schema.sql)
2. **Add TypeScript types** (types.ts)
3. **Add database functions** (db.ts)
4. **Create V2 API** (my_resource_api_v2.ts)
5. **Update route registration** (index.tsx)
6. **Migrate data** (write migration script)
7. **Test thoroughly**
8. **Remove old CRUD factory routes**

**Estimated Time**: 3-4 hours

---

### Migrating from Direct Database to CRUD Factory

Rarely needed, but if a resource becomes simpler:

1. **Remove database tables** (or keep for history)
2. **Update to use KV store** (kv_env.ts)
3. **Add CRUD factory routes** (migrated_resources.ts)
4. **Migrate data** (write migration script)
5. **Test thoroughly**
6. **Remove old API**

**Estimated Time**: 2-3 hours

---

## Best Practices

### For CRUD Factory

1. ✅ Use for simple resources
2. ✅ Keep validation functions simple
3. ✅ Use transform functions for data cleanup
4. ✅ Enable audit logging for important resources
5. ✅ Use soft delete for recoverable data
6. ✅ Add appropriate filters
7. ✅ Set reasonable page sizes

### For Direct Database

1. ✅ Design schema carefully (foreign keys, indexes)
2. ✅ Write efficient queries (avoid N+1)
3. ✅ Use proper indexes
4. ✅ Handle errors gracefully
5. ✅ Log query performance
6. ✅ Use transactions for multi-step operations
7. ✅ Add database comments for documentation

---

## Performance Guidelines

### CRUD Factory

- ✅ Good for < 10,000 records
- ✅ Good for simple queries
- ⚠️ Slow for complex filtering
- ❌ Not suitable for JOINs or aggregations

### Direct Database

- ✅ Good for millions of records
- ✅ Good for complex queries
- ✅ Excellent for JOINs and aggregations
- ✅ Scales well with proper indexes

---

## Testing Guidelines

### CRUD Factory

Test using the standard CRUD endpoints:

```bash
# Create
POST /make-server-6fcaeea3/my-resources

# Read all
GET /make-server-6fcaeea3/my-resources

# Read one
GET /make-server-6fcaeea3/my-resources/:id

# Update
PUT /make-server-6fcaeea3/my-resources/:id

# Delete
DELETE /make-server-6fcaeea3/my-resources/:id
```

### Direct Database

Write comprehensive test scripts:

```typescript
// test_my_resource_api.ts

console.log('Testing My Resource API...');

// Test create
const created = await createMyResource({ name: 'Test' });
console.log('✅ Create:', created);

// Test get by ID
const fetched = await getMyResourceById(created.id);
console.log('✅ Get by ID:', fetched);

// Test list with filters
const list = await getMyResources({ status: 'active' });
console.log('✅ List:', list.length);

// Test update
const updated = await updateMyResource(created.id, { name: 'Updated' });
console.log('✅ Update:', updated);

// Test delete
await deleteMyResource(created.id);
console.log('✅ Delete: Success');
```

---

## Common Pitfalls

### CRUD Factory

❌ **Don't use for**:
- Resources with complex relationships
- Resources needing aggregations
- Performance-critical operations

✅ **Do use for**:
- Simple CRUD operations
- Rapid prototyping
- Admin-only resources

### Direct Database

❌ **Don't use for**:
- Simple resources without relationships
- Rapid prototyping
- Resources with frequently changing schemas

✅ **Do use for**:
- Complex queries
- Performance-critical operations
- Resources with many relationships

---

## Summary

### Key Principles

1. **Use the right tool for the job**
2. **Start simple, optimize when needed**
3. **Don't over-engineer**
4. **Performance matters**
5. **Maintainability matters**

### Decision Framework

```
Simple CRUD → CRUD Factory
Complex Queries → Direct Database
Not Sure → Start with CRUD Factory, migrate if needed
```

### Remember

- CRUD Factory: Fast development, good for simple resources
- Direct Database: Better performance, good for complex queries
- Hybrid approach: Best of both worlds

---

## Questions?

If you're unsure which pattern to use:

1. Start with the decision tree at the top
2. Consider the examples
3. Think about future requirements
4. When in doubt, start with CRUD Factory (easier to migrate later)

---

## Additional Resources

- `CRUD_FACTORY_MIGRATION_PLAN.md` - Detailed migration plan
- `CRUD_FACTORY_DECISION_SUMMARY.md` - Quick decision guide
- `crud_factory.ts` - CRUD factory implementation
- `database/db.ts` - Database access layer
- `database/types.ts` - TypeScript types

---

**Last Updated**: February 15, 2026
**Version**: 1.0
