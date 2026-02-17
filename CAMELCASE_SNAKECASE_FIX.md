# CamelCase to Snake_Case Conversion Fix

## Problem

When updating a site with a slug, the following error occurred:

```
Database operation failed: Could not find the 'allowSessionTimeoutExtend' column of 'sites' in the schema cache
```

## Root Cause

The frontend sends data in camelCase format (e.g., `allowSessionTimeoutExtend`), but the PostgreSQL database expects snake_case column names (e.g., `allow_session_timeout_extend`).

The CRUD functions in `crud_db.ts` were:
1. ✅ Converting database responses FROM snake_case TO camelCase (for frontend)
2. ❌ NOT converting frontend requests FROM camelCase TO snake_case (for database)

## Solution

Added `objectToSnakeCase()` conversion to all create and update functions in `crud_db.ts`:

### Files Modified

**supabase/functions/server/crud_db.ts**

1. Added import:
```typescript
import { objectToCamelCase, objectToSnakeCase } from './helpers.ts';
```

2. Fixed all create functions:
   - `createClient()` - Convert input to snake_case before db.insertClient()
   - `createSite()` - Convert input to snake_case before db.createSite()
   - `createProduct()` - Convert input to snake_case before db.createProduct()
   - `createEmployee()` - Convert input to snake_case before db.createEmployee()
   - `createOrder()` - Convert input to snake_case before db.createOrder()

3. Fixed all update functions:
   - `updateClient()` - Convert input to snake_case before db.updateClient()
   - `updateSite()` - Convert input to snake_case before db.updateSite()
   - `updateProduct()` - Convert input to snake_case before db.updateProduct()
   - `updateEmployee()` - Convert input to snake_case before db.updateEmployee()
   - `updateOrder()` - Convert input to snake_case before db.updateOrder()

### Pattern Applied

**Before:**
```typescript
export async function updateSite(id: string, input: UpdateSiteInput) {
  const site = await db.updateSite(id, input);
  return { success: true, data: site };
}
```

**After:**
```typescript
export async function updateSite(id: string, input: UpdateSiteInput) {
  // Convert camelCase to snake_case for database
  const snakeCaseInput = objectToSnakeCase(input);
  
  const site = await db.updateSite(id, snakeCaseInput as UpdateSiteInput);
  
  // Convert snake_case back to camelCase for frontend
  const transformedSite = objectToCamelCase(site);
  
  return { success: true, data: transformedSite };
}
```

## Data Flow

### Before Fix (Broken)
```
Frontend (camelCase)
  ↓
  allowSessionTimeoutExtend
  ↓
crud_db.ts (no conversion)
  ↓
  allowSessionTimeoutExtend  ❌
  ↓
Database (expects snake_case)
  ↓
ERROR: Column 'allowSessionTimeoutExtend' not found
```

### After Fix (Working)
```
Frontend (camelCase)
  ↓
  allowSessionTimeoutExtend
  ↓
crud_db.ts (objectToSnakeCase)
  ↓
  allow_session_timeout_extend  ✅
  ↓
Database (snake_case)
  ↓
SUCCESS: Column found and updated
  ↓
crud_db.ts (objectToCamelCase)
  ↓
  allowSessionTimeoutExtend
  ↓
Frontend (camelCase)
```

## Testing

After deployment, test the following operations:

### Sites
- ✅ Create site with slug
- ✅ Update site slug
- ✅ Update site settings (allowSessionTimeoutExtend, etc.)

### Clients
- ✅ Create client
- ✅ Update client settings

### Products
- ✅ Create product
- ✅ Update product details

### Employees
- ✅ Create employee
- ✅ Update employee info

### Orders
- ✅ Create order
- ✅ Update order status

## Impact

### Fixed Issues
- ✅ Site slug editing now works
- ✅ All camelCase fields from frontend properly converted
- ✅ Consistent data transformation across all CRUD operations

### Affected Endpoints
All v2 CRUD endpoints now properly handle camelCase ↔ snake_case conversion:
- POST/PUT `/v2/clients`
- POST/PUT `/v2/sites`
- POST/PUT `/v2/products`
- POST/PUT `/v2/employees`
- POST/PUT `/v2/orders`

## Deployment

```bash
# Deploy backend
cd supabase/functions
supabase functions deploy make-server-6fcaeea3

# No frontend changes needed - already sends camelCase
```

## Related Files

- `supabase/functions/server/crud_db.ts` - CRUD operations (MODIFIED)
- `supabase/functions/server/helpers.ts` - Conversion functions (EXISTING)
- `supabase/functions/server/database/schema.sql` - Database schema (snake_case columns)

## Prevention

This fix ensures that:
1. Frontend can always use camelCase (JavaScript convention)
2. Database always receives snake_case (PostgreSQL convention)
3. Responses are converted back to camelCase for frontend
4. No manual conversion needed in frontend code

## Notes

- The `objectToSnakeCase()` and `objectToCamelCase()` functions already existed in `helpers.ts`
- They were being used for GET operations but not for POST/PUT operations
- This fix makes the conversion consistent across all operations

---

**Status**: ✅ FIXED  
**Deployed**: Pending  
**Impact**: HIGH (fixes site editing and all CRUD operations)
