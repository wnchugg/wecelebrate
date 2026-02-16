# Frontend Migration to V2 Endpoints - Plan

## Overview

Migrate the frontend from using old KV-based endpoints to new database-backed v2 endpoints.

## Current State

The frontend currently uses these endpoints:
- `/clients` → Need to migrate to `/v2/clients`
- `/sites` → Need to migrate to `/v2/sites`
- `/products` (gifts) → Need to migrate to `/v2/products`
- `/employees` → Need to migrate to `/v2/employees`
- `/orders` → Need to migrate to `/v2/orders`

## Files to Update

### Core API Files
1. **`src/app/utils/api.ts`** - Main API utility with endpoint definitions
   - `clientApi` object
   - `siteApi` object
   - `giftApi` object (maps to products)
   - `orderApi` object

2. **`src/app/lib/apiClient.ts`** - Type-safe API client
   - `apiClient.clients` methods
   - `apiClient.sites` methods
   - `apiClient.gifts` methods (maps to products)
   - `apiClient.employees` methods
   - `apiClient.orders` methods

### Hook Files
3. **`src/app/hooks/useClients.ts`** - Already uses apiClient (no changes needed)
4. **`src/app/hooks/useSites.ts`** - Already uses apiClient (no changes needed)
5. **`src/app/hooks/useGifts.ts`** - Need to check if exists

### Service Files
6. **`src/app/services/employeeApi.ts`** - Employee API service
7. **`src/app/services/dashboardService.ts`** - Dashboard service (already uses v2?)

## Migration Strategy

### Phase 1: Update Core API Layer
1. Update `src/app/utils/api.ts` to use v2 endpoints
2. Update `src/app/lib/apiClient.ts` to use v2 endpoints
3. Ensure backward compatibility during transition

### Phase 2: Test Changes
1. Test admin dashboard
2. Test client management
3. Test site management
4. Test employee management
5. Test order management

### Phase 3: Update Response Handling
1. Verify response formats match
2. Update any response parsing if needed
3. Handle any breaking changes

## V2 Endpoint Mapping

### Clients
- `GET /clients` → `GET /v2/clients`
- `GET /clients/:id` → `GET /v2/clients/:id`
- `POST /clients` → `POST /v2/clients`
- `PUT /clients/:id` → `PUT /v2/clients/:id`
- `DELETE /clients/:id` → `DELETE /v2/clients/:id`

### Sites
- `GET /sites` → `GET /v2/sites`
- `GET /sites/:id` → `GET /v2/sites/:id`
- `GET /sites/slug/:slug` → `GET /v2/sites/slug/:slug`
- `POST /sites` → `POST /v2/sites`
- `PUT /sites/:id` → `PUT /v2/sites/:id`
- `DELETE /sites/:id` → `DELETE /v2/sites/:id`

### Products (Gifts)
- `GET /gifts` → `GET /v2/products`
- `GET /gifts/:id` → `GET /v2/products/:id`
- `POST /gifts` → `POST /v2/products`
- `PUT /gifts/:id` → `PUT /v2/products/:id`
- `DELETE /gifts/:id` → `DELETE /v2/products/:id`

### Employees
- `GET /employees` → `GET /v2/employees`
- `GET /employees/:id` → `GET /v2/employees/:id`
- `POST /employees` → `POST /v2/employees`
- `PUT /employees/:id` → `PUT /v2/employees/:id`
- `DELETE /employees/:id` → `DELETE /v2/employees/:id`

### Orders
- `GET /orders` → `GET /v2/orders`
- `GET /orders/:id` → `GET /v2/orders/:id`
- `GET /orders/number/:orderNumber` → `GET /v2/orders/number/:orderNumber`
- `POST /orders` → `POST /v2/orders`
- `PUT /orders/:id` → `PUT /v2/orders/:id`
- `DELETE /orders/:id` → `DELETE /v2/orders/:id`

## Response Format Changes

### Old Format (KV Store)
```json
{
  "success": true,
  "data": [...]
}
```

### New Format (Database)
```json
{
  "success": true,
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 50
}
```

Most v2 endpoints return the same format, so minimal changes needed.

## Testing Checklist

- [ ] Admin login works
- [ ] Client list loads
- [ ] Client create/update/delete works
- [ ] Site list loads
- [ ] Site create/update/delete works
- [ ] Employee list loads
- [ ] Employee create/update/delete works
- [ ] Order list loads
- [ ] Order create/update works
- [ ] Dashboard stats load correctly
- [ ] No console errors
- [ ] All admin pages functional

## Rollback Plan

If issues arise:
1. Revert changes to API files
2. Old endpoints still exist on backend
3. Can switch back immediately

## Timeline

- Phase 1: 30 minutes (update API layer)
- Phase 2: 30 minutes (testing)
- Phase 3: 15 minutes (fixes if needed)
- Total: ~1-1.5 hours

## Notes

- Dashboard endpoints already use database (Phase 1 complete)
- Public endpoints (`/public/sites`, `/public/gifts`) don't need changes
- Auth endpoints don't need changes
- Catalog/gift configuration endpoints are separate (not part of CRUD)
