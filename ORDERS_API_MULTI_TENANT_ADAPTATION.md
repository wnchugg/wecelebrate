# Orders API Multi-Tenant Schema Adaptation

## Current Situation

The database schema uses a complex multi-tenant structure, but our API code was written for a simpler single-tenant model. We need to adapt the code to work with the existing schema.

## Schema Differences

### Database Schema (Multi-Tenant)
```sql
CREATE TABLE orders (
  id UUID,
  client_id UUID NOT NULL REFERENCES clients(id),
  site_id UUID NOT NULL REFERENCES sites(id),
  product_id UUID REFERENCES products(id),
  employee_id UUID REFERENCES employees(id),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_employee_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  shipping_address JSONB NOT NULL,
  tracking_number TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);
```

### API Code Expectations (Simple)
```typescript
interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_email: string;
  site_id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  status: OrderStatus;
  shipping_address: {...};
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  metadata?: {...};
}
```

## Key Differences

1. **Required Fields**:
   - Schema: `client_id`, `site_id` (both required)
   - API: `user_id`, `user_email` (site_id optional)

2. **Order Items**:
   - Schema: `items` JSONB array, `total_amount`
   - API: `quantity`, `unit_price`, `total_price`

3. **Customer Info**:
   - Schema: `customer_name`, `customer_email`, `customer_employee_id`
   - API: `user_id`, `user_email`

4. **Status Values**:
   - Schema: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
   - API: 'pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'

5. **Timestamps**:
   - Schema: `confirmed_at`, `shipped_at`, `delivered_at`, `cancelled_at`
   - API: `estimated_delivery`, `actual_delivery`

## Adaptation Strategy

### Option 1: Update Schema (NOT RECOMMENDED)
Change the database schema to match the API - but you said you need the complex multi-tenant schema.

### Option 2: Adapter Layer (RECOMMENDED)
Create adapter functions to translate between database and API formats.

## Implementation Plan

### Step 1: Update Types (database/types.ts)

Match the actual database schema:

```typescript
export interface Order {
  id: string;
  client_id: string;
  site_id: string;
  product_id?: string;
  employee_id?: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_employee_id?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  shipping_address: Record<string, any>;
  tracking_number?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  metadata?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}
```

### Step 2: Create Adapter Functions (gifts_api_v2.ts)

```typescript
// Convert API order input to database format
function apiOrderToDbOrder(apiOrder: {
  userId: string;
  userEmail: string;
  giftId: string;
  quantity: number;
  shippingAddress: any;
  siteId?: string;
}, product: Product, clientId: string, siteId: string): CreateOrderInput {
  const unitPrice = product.price;
  const totalPrice = unitPrice * apiOrder.quantity;
  
  return {
    client_id: clientId,
    site_id: siteId,
    product_id: apiOrder.giftId,
    order_number: db.generateOrderNumber(),
    customer_name: apiOrder.shippingAddress.fullName,
    customer_email: apiOrder.userEmail,
    customer_employee_id: apiOrder.userId,
    status: 'pending',
    total_amount: totalPrice,
    currency: product.currency,
    shipping_address: apiOrder.shippingAddress,
    items: [{
      product_id: apiOrder.giftId,
      quantity: apiOrder.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
    }],
    metadata: {
      timeline: [...]
    },
  };
}

// Convert database order to API format
function dbOrderToApiOrder(dbOrder: Order, product: Product): ApiOrder {
  const item = dbOrder.items[0]; // Assuming single item orders for now
  
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    userId: dbOrder.customer_employee_id || dbOrder.customer_email,
    userEmail: dbOrder.customer_email,
    siteId: dbOrder.site_id,
    gift: productToGift(product),
    quantity: item.quantity,
    status: mapDbStatusToApiStatus(dbOrder.status),
    shippingAddress: dbOrder.shipping_address,
    trackingNumber: dbOrder.tracking_number,
    orderDate: dbOrder.created_at,
    estimatedDelivery: calculateEstimatedDelivery(dbOrder),
    actualDelivery: dbOrder.delivered_at,
    timeline: dbOrder.metadata?.timeline || [],
  };
}

// Map database status to API status
function mapDbStatusToApiStatus(dbStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'pending': 'pending',
    'confirmed': 'processing',
    'processing': 'processing',
    'shipped': 'shipped',
    'delivered': 'delivered',
    'cancelled': 'cancelled',
  };
  return statusMap[dbStatus] || 'pending';
}
```

### Step 3: Update Database Functions (database/db.ts)

Update to match actual schema:

```typescript
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      client_id: input.client_id,
      site_id: input.site_id,
      product_id: input.product_id,
      employee_id: input.employee_id,
      order_number: input.order_number,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_employee_id: input.customer_employee_id,
      status: input.status || 'pending',
      total_amount: input.total_amount,
      currency: input.currency || 'USD',
      shipping_address: input.shipping_address,
      tracking_number: input.tracking_number,
      items: input.items,
      metadata: input.metadata,
      notes: input.notes,
    })
    .select()
    .single();
  
  if (error) handleError('createOrder', error);
  return data;
}
```

### Step 4: Handle Missing Data

Since we don't have `client_id` in the current system:

**Option A**: Create a default client
```typescript
// Create or get default client
const DEFAULT_CLIENT_ID = await getOrCreateDefaultClient();
```

**Option B**: Derive from site
```typescript
// Get site and use its client_id
const site = await db.getSiteById(siteId);
const clientId = site.client_id;
```

**Option C**: Make client_id nullable in schema (requires schema change)

## Recommended Approach

1. **Create default client** for the system
2. **Use adapter functions** to translate between formats
3. **Map statuses** appropriately
4. **Store order items** in JSONB array
5. **Keep timeline** in metadata
6. **Use timestamp fields** for status tracking

## Next Steps

1. Decide on client_id strategy (default client vs. site-based)
2. Update types.ts to match database schema
3. Create adapter functions in gifts_api_v2.ts
4. Update database functions in db.ts
5. Update test files
6. Test end-to-end order flow

## Questions to Answer

1. **Client ID**: Should we create a default client, or derive from site?
2. **Multi-item orders**: Do we need to support multiple items per order?
3. **Employee tracking**: Should we link to employee table or just store ID?
4. **Status mapping**: How should we map between the two status sets?

