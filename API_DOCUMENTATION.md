# API Documentation

## Date: February 15, 2026
## Version: 2.0 (Database Refactored)

---

## Overview

This document provides a comprehensive overview of all API endpoints in the system.

### Base URL

```
Development: https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3
Production: https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3
```

### Authentication

Most endpoints require authentication via JWT token:

```
Headers:
  X-Access-Token: <jwt-token>
  X-Environment-ID: development | production
```

---

## API Categories

### 1. CRUD Factory APIs (KV Store)

These APIs use the CRUD factory pattern for simple CRUD operations.

**Pattern**: CRUD Factory
**Storage**: KV Store (PostgreSQL JSONB)
**Performance**: 5-100ms

#### Resources

1. **Clients** - `/clients`
2. **Sites** - `/sites`
3. **Employees** - `/employees`
4. **Admin Users** - `/admin/users`
5. **Roles** - `/roles`
6. **Access Groups** - `/access-groups`
7. **Celebrations** - `/celebrations`
8. **Email Templates** - `/email-templates`
9. **Brands** - `/brands`
10. **Gifts (Admin)** - `/admin/gifts`
11. **Orders (Admin)** - `/orders`

#### Standard Endpoints

All CRUD factory resources support these endpoints:

```
GET    /{resource}           - List all (with pagination)
GET    /{resource}/:id       - Get by ID
POST   /{resource}           - Create
PUT    /{resource}/:id       - Update
DELETE /{resource}/:id       - Delete
```

#### Query Parameters

```
page=1                    - Page number (default: 1)
pageSize=50               - Items per page (default: 50, max: 100)
status=active             - Filter by status
type=...                  - Filter by type (resource-specific)
```

#### Response Format

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 50,
    "hasMore": true
  }
}
```

---

### 2. Direct Database APIs

These APIs use direct database queries for complex operations.

**Pattern**: Direct Database
**Storage**: PostgreSQL Tables
**Performance**: 50-200ms

---

## Products/Gifts API

**File**: `gifts_api_v2.ts`
**Pattern**: Direct Database
**Performance**: ~100ms

### Endpoints

#### GET /gifts

List all products with filtering.

**Query Parameters**:
```
category=electronics      - Filter by category
search=laptop            - Search in name/description
inStockOnly=true         - Only show in-stock items
```

**Response**:
```json
{
  "success": true,
  "gifts": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Description",
      "category": "electronics",
      "price": 99.99,
      "sku": "SKU-001",
      "status": "active",
      "availableQuantity": 100
    }
  ]
}
```

**Performance**: ~100ms (single query with indexes)

---

#### GET /gifts/:id

Get a single product by ID.

**Response**:
```json
{
  "success": true,
  "gift": {
    "id": "uuid",
    "name": "Product Name",
    "description": "Description",
    "longDescription": "Long description",
    "category": "electronics",
    "price": 99.99,
    "sku": "SKU-001",
    "features": ["Feature 1", "Feature 2"],
    "specifications": {
      "weight": "1kg",
      "dimensions": "10x10x10cm"
    },
    "status": "active",
    "availableQuantity": 100
  }
}
```

**Performance**: ~5ms (indexed lookup)

---

#### GET /gifts/categories/list

Get all unique product categories.

**Response**:
```json
{
  "success": true,
  "categories": ["electronics", "clothing", "books"]
}
```

**Performance**: ~50ms (aggregation query)

---

## Orders API

**File**: `gifts_api_v2.ts`
**Pattern**: Direct Database (Multi-Tenant)
**Performance**: ~120ms

### Endpoints

#### POST /orders

Create a new order.

**Request**:
```json
{
  "userId": "user-id",
  "userEmail": "user@example.com",
  "giftId": "product-uuid",
  "quantity": 1,
  "siteId": "site-uuid",
  "shippingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "555-1234"
  }
}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "orderNumber": "ORD-00001234",
    "userId": "user-id",
    "userEmail": "user@example.com",
    "gift": { ... },
    "quantity": 1,
    "status": "pending",
    "shippingAddress": { ... },
    "orderDate": "2026-02-15T10:00:00Z",
    "estimatedDelivery": "2026-02-20T10:00:00Z"
  }
}
```

**Performance**: ~150ms (transaction with inventory update)

---

#### GET /orders/:id

Get order by ID.

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "orderNumber": "ORD-00001234",
    "status": "shipped",
    "trackingNumber": "TRACK-123",
    "carrier": "UPS",
    "timeline": [
      {
        "status": "pending",
        "label": "Order Placed",
        "timestamp": "2026-02-15T10:00:00Z",
        "description": "Your order has been placed"
      },
      {
        "status": "shipped",
        "label": "Shipped",
        "timestamp": "2026-02-16T14:00:00Z",
        "description": "Your order has been shipped"
      }
    ]
  }
}
```

**Performance**: ~100ms (single JOIN query)

---

#### GET /orders/user/:userId

Get all orders for a user.

**Response**:
```json
{
  "success": true,
  "orders": [...]
}
```

**Performance**: ~120ms (single query, no N+1)

---

#### PUT /orders/:id/status

Update order status.

**Request**:
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK-123",
  "carrier": "UPS"
}
```

**Response**:
```json
{
  "success": true,
  "order": { ... }
}
```

**Performance**: ~370ms (update + email automation)

---

## Catalogs API

**File**: `catalogs_api_v2.ts`
**Pattern**: Direct Database
**Performance**: ~120ms

### Endpoints

#### GET /catalogs

List all catalogs with filtering.

**Query Parameters**:
```
type=erp                 - Filter by type (erp, vendor, manual, dropship)
status=active            - Filter by status
ownerId=uuid             - Filter by owner
search=catalog           - Search in name/description
limit=50                 - Limit results
offset=0                 - Offset for pagination
```

**Response**:
```json
{
  "success": true,
  "catalogs": [
    {
      "id": "uuid",
      "name": "Main Catalog",
      "description": "Primary product catalog",
      "type": "erp",
      "status": "active",
      "owner_id": "uuid",
      "source": {
        "type": "erp",
        "sourceSystem": "SAP",
        "sourceId": "CAT-001"
      },
      "settings": {
        "defaultCurrency": "USD",
        "priceMarkup": 10,
        "autoSync": true
      }
    }
  ],
  "total": 1
}
```

**Performance**: ~120ms (single query with filters)

---

#### GET /catalogs/:id

Get a single catalog by ID.

**Response**:
```json
{
  "success": true,
  "catalog": { ... }
}
```

**Performance**: ~5ms (indexed lookup)

---

#### POST /catalogs

Create a new catalog.

**Request**:
```json
{
  "name": "New Catalog",
  "description": "Description",
  "type": "manual",
  "status": "active",
  "ownerId": "uuid",
  "settings": {
    "defaultCurrency": "USD",
    "priceMarkup": 10
  }
}
```

**Response**:
```json
{
  "success": true,
  "catalog": { ... }
}
```

**Performance**: ~20ms (insert)

---

#### PUT /catalogs/:id

Update a catalog.

**Request**:
```json
{
  "name": "Updated Name",
  "status": "inactive"
}
```

**Response**:
```json
{
  "success": true,
  "catalog": { ... }
}
```

**Performance**: ~20ms (update)

---

#### DELETE /catalogs/:id

Delete a catalog.

**Response**:
```json
{
  "success": true,
  "message": "Catalog deleted successfully"
}
```

**Performance**: ~20ms (delete)

---

#### GET /catalogs/:id/stats

Get catalog statistics.

**Response**:
```json
{
  "success": true,
  "stats": {
    "catalogId": "uuid",
    "totalProducts": 100,
    "activeProducts": 95,
    "inactiveProducts": 5,
    "outOfStock": 10,
    "categories": ["electronics", "clothing"],
    "categoryCount": 2,
    "priceStats": {
      "totalValue": 10000,
      "averagePrice": 100,
      "minPrice": 10,
      "maxPrice": 500
    },
    "inventoryStats": {
      "totalInventory": 1000,
      "averageInventory": 10
    }
  }
}
```

**Performance**: ~120ms (aggregation query)

---

#### GET /catalogs/:id/products

Get all products in a catalog.

**Query Parameters**:
```
category=electronics     - Filter by category
status=active            - Filter by status
search=laptop            - Search in name/description
inStockOnly=true         - Only show in-stock items
limit=50                 - Limit results
offset=0                 - Offset for pagination
```

**Response**:
```json
{
  "success": true,
  "products": [...],
  "total": 100
}
```

**Performance**: ~100ms (single query with filters)

---

## Site Catalog Configuration API

**File**: `site-catalog-config_api_v2.ts`
**Pattern**: Direct Database
**Performance**: ~50-100ms

### Endpoints

#### GET /sites/:siteId/catalog-config

Get complete site catalog configuration.

**Response**:
```json
{
  "success": true,
  "config": {
    "siteId": "uuid",
    "assignments": [
      {
        "id": "uuid",
        "site_id": "uuid",
        "catalog_id": "uuid",
        "settings": {
          "allowPriceOverride": true,
          "hideOutOfStock": false
        }
      }
    ],
    "priceOverrides": [
      {
        "id": "uuid",
        "site_id": "uuid",
        "product_id": "uuid",
        "override_price": 89.99,
        "reason": "Special pricing"
      }
    ],
    "categoryExclusions": [
      {
        "id": "uuid",
        "site_id": "uuid",
        "category": "alcohol",
        "reason": "Not allowed in this region"
      }
    ],
    "productExclusions": [
      {
        "id": "uuid",
        "site_id": "uuid",
        "product_id": "uuid",
        "reason": "Out of season"
      }
    ]
  }
}
```

**Performance**: ~100ms (4 parallel queries)

---

#### POST /sites/:siteId/catalog-config/assignments

Assign a catalog to a site.

**Request**:
```json
{
  "catalogId": "uuid",
  "settings": {
    "allowPriceOverride": true,
    "hideOutOfStock": false,
    "minimumInventory": 5
  }
}
```

**Response**:
```json
{
  "success": true,
  "assignment": { ... }
}
```

**Performance**: ~20ms (insert with foreign key validation)

---

#### PUT /sites/:siteId/catalog-config/assignments/:catalogId

Update catalog assignment settings.

**Request**:
```json
{
  "settings": {
    "hideOutOfStock": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "assignment": { ... }
}
```

**Performance**: ~20ms (update)

---

#### DELETE /sites/:siteId/catalog-config/assignments/:catalogId

Remove catalog assignment.

**Response**:
```json
{
  "success": true,
  "message": "Catalog assignment deleted successfully"
}
```

**Performance**: ~20ms (delete with cascade)

---

#### POST /sites/:siteId/catalog-config/price-overrides

Set a price override for a product.

**Request**:
```json
{
  "productId": "uuid",
  "overridePrice": 89.99,
  "reason": "Special pricing"
}
```

**Response**:
```json
{
  "success": true,
  "priceOverride": { ... }
}
```

**Performance**: ~20ms (upsert)

---

#### DELETE /sites/:siteId/catalog-config/price-overrides/:productId

Remove price override.

**Response**:
```json
{
  "success": true,
  "message": "Price override deleted successfully"
}
```

**Performance**: ~20ms (delete)

---

#### POST /sites/:siteId/catalog-config/category-exclusions

Exclude a category from a site.

**Request**:
```json
{
  "category": "alcohol",
  "reason": "Not allowed in this region"
}
```

**Response**:
```json
{
  "success": true,
  "exclusion": { ... }
}
```

**Performance**: ~20ms (insert)

---

#### DELETE /sites/:siteId/catalog-config/category-exclusions/:category

Remove category exclusion.

**Response**:
```json
{
  "success": true,
  "message": "Category exclusion deleted successfully"
}
```

**Performance**: ~20ms (delete)

---

#### POST /sites/:siteId/catalog-config/product-exclusions

Exclude a product from a site.

**Request**:
```json
{
  "productId": "uuid",
  "reason": "Out of season"
}
```

**Response**:
```json
{
  "success": true,
  "exclusion": { ... }
}
```

**Performance**: ~20ms (insert)

---

#### DELETE /sites/:siteId/catalog-config/product-exclusions/:productId

Remove product exclusion.

**Response**:
```json
{
  "success": true,
  "message": "Product exclusion deleted successfully"
}
```

**Performance**: ~20ms (delete)

---

#### GET /sites/:siteId/catalog-config/products

Get all products for a site with pricing applied.

**Response**:
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Product Name",
      "price": 99.99,
      "effective_price": 89.99,
      "has_override": true
    }
  ],
  "total": 100
}
```

**Performance**: ~100ms (complex JOIN query)

---

## Performance Summary

### CRUD Factory APIs

| Operation | Performance | Notes |
|-----------|-------------|-------|
| List all | 50-100ms | With pagination |
| Get by ID | 5-10ms | Indexed lookup |
| Create | 10-20ms | Single insert |
| Update | 10-20ms | Single update |
| Delete | 10-20ms | Single delete |

### Direct Database APIs

| API | Operation | Performance | Notes |
|-----|-----------|-------------|-------|
| Products | List all | ~100ms | Single query with indexes |
| Products | Get by ID | ~5ms | Indexed lookup |
| Products | Categories | ~50ms | Aggregation |
| Orders | Create | ~150ms | Transaction + inventory |
| Orders | Get by ID | ~100ms | Single JOIN |
| Orders | User orders | ~120ms | Single query, no N+1 |
| Orders | Update status | ~370ms | Update + email |
| Catalogs | List all | ~120ms | Single query with filters |
| Catalogs | Get stats | ~120ms | Aggregation |
| Catalogs | Products | ~100ms | JOIN query |
| Site Config | Get config | ~100ms | 4 parallel queries |
| Site Config | CRUD ops | ~20ms | Single operation |

---

## Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate/constraint violation)
- `500` - Internal Server Error

---

## Rate Limiting

Rate limits are applied per IP address:

- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 1000 requests/minute
- **Admin endpoints**: 5000 requests/minute

---

## Versioning

APIs are versioned using file suffixes:

- `gifts_api.ts` - V1 (deprecated, KV store)
- `gifts_api_v2.ts` - V2 (current, database)
- `catalogs_api.ts` - V1 (deprecated, KV store)
- `catalogs_api_v2.ts` - V2 (current, database)

---

## Testing

### Development Environment

```bash
# Set environment
export SUPABASE_URL="https://wjfcqqrlhwdvvjmefxky.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# Run tests
deno run --allow-net --allow-env --unsafely-ignore-certificate-errors \
  supabase/functions/server/database/test_gifts_api_v2.ts
```

### Test Scripts

- `test_gifts_api_v2.ts` - Products API tests
- `test_orders_api_multitenant.ts` - Orders API tests
- `test_catalogs_api.ts` - Catalogs API tests

---

## Additional Resources

- `ARCHITECTURE_GUIDE.md` - Architecture patterns and guidelines
- `CRUD_FACTORY_MIGRATION_PLAN.md` - Migration planning
- `PHASE_2_FINAL_SUMMARY.md` - Phase 2 completion summary

---

**Last Updated**: February 15, 2026
**Version**: 2.0
