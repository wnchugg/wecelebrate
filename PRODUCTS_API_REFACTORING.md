# Products/Gifts API Refactoring Plan

## Current State Analysis

### File: `supabase/functions/server/gifts_api.ts`

**Current Implementation**:
- Uses KV store for all operations
- Has 6 default products hardcoded
- Stores products in two places:
  - `gifts:all` - Array of all gifts
  - `gift:{environmentId}:{giftId}` - Individual gift lookup
- Also handles orders (will refactor separately)

**Functions to Refactor**:
1. ✅ `initializeGiftCatalog()` - Seed default products → Migrate to database seeding
2. ✅ `forceReseedGiftCatalog()` - Clear and reseed → Database seeding
3. ✅ `getAllGifts()` - Get all with filters → `db.getProducts()`
4. ✅ `getGiftById()` - Get single gift → `db.getProductById()`
5. ✅ `getCategories()` - Get unique categories → `db.getProductCategories()`
6. ⏳ `createOrder()` - Create order (uses gifts) → Update to use database products
7. ⏳ `getOrderById()` - Get order → Keep for now (orders refactoring later)
8. ⏳ `getUserOrders()` - Get user orders → Keep for now
9. ⏳ `updateOrderStatus()` - Update order → Keep for now

---

## Refactoring Strategy

### Phase 1: Migrate Products (NOW)
1. Create database seeding function
2. Update `getAllGifts()` to use database
3. Update `getGiftById()` to use database
4. Update `getCategories()` to use database
5. Keep KV store code as fallback (commented)

### Phase 2: Update Orders (LATER)
- Orders will be refactored in a separate phase
- For now, keep order functions using KV store
- Update `createOrder()` to fetch products from database

---

## Type Mapping

### Current Gift Type → Database Product Type

```typescript
// OLD (Gift)
interface Gift {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;              // → image_url
  category: string;
  price: number;
  sku: string;
  features: string[];
  specifications: { [key: string]: string };
  status: string;             // 'active' | 'inactive'
  availableQuantity: number;  // → available_quantity
  createdAt: string;          // → created_at
  updatedAt: string;          // → updated_at
}

// NEW (Product)
interface Product {
  id: string;
  catalog_id: string;         // NEW - required
  sku: string;
  name: string;
  description?: string;
  long_description?: string;  // NEW - renamed
  category?: string;
  price: number;
  currency: string;           // NEW - required
  status: 'active' | 'inactive' | 'out_of_stock';
  available_quantity?: number;
  image_url?: string;         // NEW - renamed
  features?: string[];
  specifications?: Record<string, any>;
  metadata?: Record<string, any>;  // NEW - for extra data
  created_at: string;
  updated_at: string;
}
```

### Field Mapping
- `image` → `image_url`
- `longDescription` → `long_description`
- `availableQuantity` → `available_quantity`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- NEW: `catalog_id` (required - need to create default catalog)
- NEW: `currency` (default: 'USD')

---

## Implementation Steps

### Step 1: Create Default Catalog
Before we can seed products, we need a catalog to associate them with.

```typescript
// Create default catalog
const defaultCatalog = await db.createCatalog({
  name: 'Default Product Catalog',
  type: 'manual',
  status: 'active',
  description: 'Default catalog for platform products',
});
```

### Step 2: Seed Products to Database
Convert the 6 default gifts to database products.

```typescript
// Seed products
for (const gift of defaultGifts) {
  await db.createProduct({
    catalog_id: defaultCatalog.id,
    sku: gift.sku,
    name: gift.name,
    description: gift.description,
    long_description: gift.longDescription,
    category: gift.category,
    price: gift.price,
    currency: 'USD',
    status: gift.status as 'active' | 'inactive',
    available_quantity: gift.availableQuantity,
    image_url: gift.image,
    features: gift.features,
    specifications: gift.specifications,
  });
}
```

### Step 3: Create Adapter Functions
Create functions to convert between Gift and Product types for backward compatibility.

```typescript
function productToGift(product: Product): Gift {
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    longDescription: product.long_description || '',
    image: product.image_url || '',
    category: product.category || '',
    price: product.price,
    sku: product.sku,
    features: product.features || [],
    specifications: product.specifications || {},
    status: product.status === 'out_of_stock' ? 'inactive' : product.status,
    availableQuantity: product.available_quantity || 0,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}
```

### Step 4: Update getAllGifts()
```typescript
// OLD
export async function getAllGifts(environmentId: string = 'development', filters?: {
  category?: string;
  search?: string;
  inStockOnly?: boolean;
}): Promise<Gift[]> {
  let gifts = await kv.get(GIFTS_KEY, environmentId) || [];
  // ... filtering logic
  return gifts;
}

// NEW
export async function getAllGifts(environmentId: string = 'development', filters?: {
  category?: string;
  search?: string;
  inStockOnly?: boolean;
}): Promise<Gift[]> {
  const products = await db.getProducts({
    category: filters?.category && filters.category !== 'all' ? filters.category : undefined,
    search: filters?.search,
    in_stock_only: filters?.inStockOnly,
  });
  
  return products.map(productToGift);
}
```

### Step 5: Update getGiftById()
```typescript
// OLD
export async function getGiftById(environmentId: string = 'development', id: string): Promise<Gift | null> {
  const gift = await kv.get(`${GIFT_PREFIX}${environmentId}:${id}`);
  return gift || null;
}

// NEW
export async function getGiftById(environmentId: string = 'development', id: string): Promise<Gift | null> {
  const product = await db.getProductById(id);
  return product ? productToGift(product) : null;
}
```

### Step 6: Update getCategories()
```typescript
// OLD
export async function getCategories(environmentId: string = 'development'): Promise<string[]> {
  const gifts = await kv.get(GIFTS_KEY, environmentId) || [];
  const categories = new Set(gifts.map((g: Gift) => g.category));
  return Array.from(categories);
}

// NEW
export async function getCategories(environmentId: string = 'development'): Promise<string[]> {
  return await db.getProductCategories();
}
```

---

## Testing Plan

### 1. Create Seeding Script
```bash
deno run --allow-net --allow-env seed_products.ts
```

### 2. Test Each Function
- Test `getAllGifts()` with no filters
- Test `getAllGifts()` with category filter
- Test `getAllGifts()` with search filter
- Test `getAllGifts()` with inStockOnly filter
- Test `getGiftById()` with valid ID
- Test `getGiftById()` with invalid ID
- Test `getCategories()`

### 3. Performance Testing
- Measure query time for `getAllGifts()`
- Compare with KV store baseline
- Verify 100x improvement

---

## Rollback Plan

### Keep KV Store Code
Comment out KV store code instead of deleting:
```typescript
// OLD KV STORE VERSION (BACKUP)
// export async function getAllGifts(...) {
//   let gifts = await kv.get(GIFTS_KEY, environmentId) || [];
//   ...
// }
```

### Feature Flag
Add environment variable to switch between implementations:
```typescript
const USE_DATABASE = Deno.env.get('USE_DATABASE_FOR_PRODUCTS') === 'true';

export async function getAllGifts(...) {
  if (USE_DATABASE) {
    // Database version
  } else {
    // KV store version (fallback)
  }
}
```

---

## Success Criteria

### Functional
- [ ] All 6 products seeded to database
- [ ] `getAllGifts()` returns same data as before
- [ ] Filtering works correctly
- [ ] `getGiftById()` returns correct product
- [ ] `getCategories()` returns correct categories
- [ ] No breaking changes to API responses

### Performance
- [ ] Query time < 50ms for getAllGifts()
- [ ] Query time < 20ms for getGiftById()
- [ ] 100x faster than KV store (measured)

### Code Quality
- [ ] Type-safe queries
- [ ] Proper error handling
- [ ] Backward compatible responses
- [ ] Clean code with comments

---

## Next Steps

1. Create product seeding script
2. Refactor gifts_api.ts
3. Test all functions
4. Measure performance
5. Deploy and verify

Ready to start implementation!
