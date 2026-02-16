# Phase 2: Orders API Refactoring Plan

## Goal
Refactor Orders API from KV store to PostgreSQL database for better performance, querying, and reporting capabilities.

---

## Current State Analysis

### Orders in KV Store
```typescript
// Current storage pattern
order:{orderId}                    // Individual order
user_orders:{userId}               // Array of order IDs per user
order_counter                      // Global counter for order numbers
```

### Current Order Structure
```typescript
interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  siteId?: string;
  gift: Gift;                      // Full gift object embedded
  quantity: number;
  status: OrderStatus;
  shippingAddress: { ... };
  trackingNumber?: string;
  carrier?: string;
  orderDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  timeline: Array<{ ... }>;
}
```

### Issues with Current Approach
1. **Embedded gift data** - Gift object duplicated in every order
2. **No relationships** - Can't query orders by product
3. **Limited reporting** - Hard to get order statistics
4. **No inventory tracking** - Manual inventory updates
5. **Timeline in JSON** - Hard to query order history

---

## Database Schema (Already Exists!)

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  site_id UUID REFERENCES sites(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  shipping_address JSONB,
  tracking_number TEXT,
  carrier TEXT,
  estimated_delivery TEXT,
  actual_delivery TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Differences from KV Version
1. **product_id** instead of embedded gift object
2. **unit_price** and **total_price** for accurate pricing
3. **site_id** as proper foreign key
4. **metadata** JSONB for timeline and extra data
5. **Proper indexes** for fast queries

---

## Migration Strategy

### Step 1: Update Types
Match database schema in `types.ts`:
- Add `product_id` field
- Add `unit_price` and `total_price`
- Move timeline to metadata
- Keep backward compatibility

### Step 2: Create Adapter Functions
```typescript
// Convert database Order to API Order format
function dbOrderToApiOrder(dbOrder: DbOrder, product: Product): Order {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    userId: dbOrder.user_id,
    userEmail: dbOrder.user_email,
    siteId: dbOrder.site_id,
    gift: productToGift(product),  // Fetch and convert product
    quantity: dbOrder.quantity,
    status: dbOrder.status,
    shippingAddress: dbOrder.shipping_address,
    trackingNumber: dbOrder.tracking_number,
    carrier: dbOrder.carrier,
    orderDate: dbOrder.created_at,
    estimatedDelivery: dbOrder.estimated_delivery,
    actualDelivery: dbOrder.actual_delivery,
    timeline: dbOrder.metadata?.timeline || [],
  };
}
```

### Step 3: Refactor Order Functions
1. `createOrder()` - Store in database with product_id
2. `getOrderById()` - Query database with JOIN
3. `getUserOrders()` - Query with WHERE clause
4. `updateOrderStatus()` - Update database record

### Step 4: Add New Capabilities
- Get orders by product
- Get orders by site
- Order statistics and reporting
- Revenue calculations
- Inventory tracking

---

## Implementation Steps

### 1. Update Database Functions (db.ts)
Already have basic CRUD, need to add:
- `getOrdersWithProducts()` - JOIN with products table
- `getOrdersByUser()` - Optimized user query
- `getOrdersBySite()` - Site-specific orders
- `getOrderStats()` - Already exists!

### 2. Update gifts_api_v2.ts
Replace KV store calls with database calls:
```typescript
// OLD
await kv.set(`order:${orderId}`, order);

// NEW
await db.createOrder({
  order_number: orderNumber,
  user_id: userId,
  user_email: userEmail,
  product_id: giftId,
  quantity: quantity,
  unit_price: gift.price,
  total_price: gift.price * quantity,
  shipping_address: shippingAddress,
  status: 'pending',
  metadata: { timeline: [...] },
});
```

### 3. Handle Order Counter
Options:
1. Use database sequence
2. Use UUID (no counter needed)
3. Generate order number from timestamp + random

**Recommendation**: Use timestamp-based order numbers

### 4. Test Everything
- Create order
- Get order by ID
- Get user orders
- Update order status
- Verify inventory updates
- Test timeline updates

---

## Benefits of Database Version

### Performance
- **100x faster** for user order history (1 query vs N queries)
- **Instant reporting** with SQL aggregations
- **Better caching** with database query cache

### Features
- Query orders by product
- Query orders by site
- Revenue reports by date range
- Inventory tracking
- Order analytics

### Data Integrity
- Foreign key constraints
- Proper relationships
- Atomic updates
- Transaction support

---

## Backward Compatibility

### API Interface
Keep same function signatures:
```typescript
export async function createOrder(
  environmentId: string,
  orderData: { ... }
): Promise<Order>
```

### Response Format
Convert database format to API format:
- Fetch product and convert to Gift
- Extract timeline from metadata
- Format dates consistently

---

## Testing Plan

### Unit Tests
1. Create order with valid product
2. Create order with invalid product (should fail)
3. Get order by ID
4. Get orders for user
5. Update order status
6. Verify inventory updates

### Integration Tests
1. Create order → Check inventory decreased
2. Update status → Check timeline updated
3. Get user orders → Verify sorting
4. Cancel order → Check inventory restored

### Performance Tests
1. Create 100 orders
2. Query user with 50 orders
3. Get order statistics
4. Compare with KV store baseline

---

## Rollback Plan

### Keep KV Store Version
Comment out instead of deleting:
```typescript
// OLD KV STORE VERSION (BACKUP)
// export async function createOrder(...) {
//   await kv.set(`order:${orderId}`, order);
// }
```

### Feature Flag
```typescript
const USE_DATABASE_FOR_ORDERS = Deno.env.get('USE_DATABASE_FOR_ORDERS') === 'true';
```

---

## Timeline

### Step 1: Update db.ts (30 min)
- Add order query functions
- Add JOIN support
- Test queries

### Step 2: Update gifts_api_v2.ts (1 hour)
- Refactor createOrder()
- Refactor getOrderById()
- Refactor getUserOrders()
- Refactor updateOrderStatus()

### Step 3: Testing (30 min)
- Create test suite
- Run all tests
- Verify performance

### Step 4: Documentation (30 min)
- Update API docs
- Create migration guide
- Document new features

**Total Time**: 2-3 hours

---

## Success Criteria

### Functional
- [ ] Create order stores in database
- [ ] Get order fetches from database
- [ ] User orders query works
- [ ] Status updates work
- [ ] Inventory updates work
- [ ] Timeline updates work

### Performance
- [ ] Create order < 200ms
- [ ] Get order < 100ms
- [ ] User orders < 200ms
- [ ] Status update < 150ms

### Code Quality
- [ ] Type-safe queries
- [ ] Error handling
- [ ] Backward compatible
- [ ] Well tested

---

## Ready to Start!

Let's begin with Step 1: Updating the database functions in `db.ts` to support orders with product JOINs.
