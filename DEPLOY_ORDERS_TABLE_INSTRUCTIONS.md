# Deploy Orders Table - Quick Instructions

## The Error You Saw

The error "trigger already exists" means you tried to run the full `schema.sql` file which includes all tables (clients, sites, products, etc.) that already exist in your database.

## What You Need to Do

You only need to deploy the **orders table**, not the entire schema.

## Step-by-Step Instructions

### Option 1: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   ```
   https://wjfcqqrlhwdvvjmefxky.supabase.co
   ```

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy the SQL**
   - Open file: `supabase/functions/server/database/deploy_orders_schema.sql`
   - Copy ALL the contents (Cmd+A, Cmd+C)

4. **Paste and Run**
   - Paste into the SQL Editor
   - Click "Run" button (or Cmd+Enter)

5. **Verify Success**
   - You should see: "Orders table created successfully with multi-tenant schema!"
   - No errors should appear

### Option 2: Verify After Deployment

After running the SQL, verify it worked:

```bash
cd supabase/functions/server/database
deno run --allow-net --allow-env --unsafely-ignore-certificate-errors verify_orders_schema.ts
```

## What the Script Does

The `deploy_orders_schema.sql` script:

1. ✅ Drops the old orders table (if it exists)
2. ✅ Creates new orders table with multi-tenant schema
3. ✅ Creates all necessary indexes
4. ✅ Shows success message

## The New Orders Table Structure

```sql
CREATE TABLE orders (
  -- IDs
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL,      -- NEW: Required
  site_id UUID NOT NULL,         -- NEW: Required
  product_id UUID,
  employee_id UUID,
  
  -- Order Info
  order_number TEXT UNIQUE,
  customer_name TEXT,            -- NEW: Replaces user_id
  customer_email TEXT,           -- NEW: Replaces user_email
  customer_employee_id TEXT,     -- NEW: Optional employee reference
  
  -- Order Details
  status TEXT,                   -- NEW: Different values
  total_amount NUMERIC(10,2),    -- NEW: Replaces unit_price/total_price
  currency TEXT,
  
  -- Shipping
  shipping_address JSONB,
  tracking_number TEXT,
  
  -- Items
  items JSONB,                   -- NEW: Array of items
  
  -- Metadata
  metadata JSONB,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,      -- NEW
  shipped_at TIMESTAMPTZ,        -- NEW
  delivered_at TIMESTAMPTZ,      -- NEW
  cancelled_at TIMESTAMPTZ       -- NEW
);
```

## Key Changes from Old Schema

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `user_id` | `customer_employee_id` | Optional employee reference |
| `user_email` | `customer_email` | Required |
| - | `customer_name` | NEW: Required |
| - | `client_id` | NEW: Required (from site) |
| `site_id` (optional) | `site_id` | Now required |
| `quantity`, `unit_price`, `total_price` | `items` JSONB, `total_amount` | Multi-item support |
| `estimated_delivery`, `actual_delivery` | `confirmed_at`, `shipped_at`, `delivered_at` | Proper timestamps |

## Status Values Changed

**Old API Statuses:**
- pending, processing, shipped, in_transit, out_for_delivery, delivered, cancelled

**New Database Statuses:**
- pending, confirmed, processing, shipped, delivered, cancelled

The adapter layer handles the mapping automatically!

## After Deployment

Once the table is deployed, you can:

1. **Test the API**
   ```bash
   cd supabase/functions/server/database
   deno run --allow-net --allow-env --unsafely-ignore-certificate-errors test_orders_api.ts
   ```

2. **Check in Dashboard**
   - Go to Table Editor → orders
   - Verify the structure matches

3. **Start Using**
   - The API functions in `gifts_api_v2.ts` are ready to use
   - They automatically handle the multi-tenant schema

## Troubleshooting

### "relation does not exist"
- The orders table wasn't created
- Run `deploy_orders_schema.sql` again

### "foreign key violation"
- Make sure clients and sites tables exist
- Run the verification script to check

### "column does not exist"
- The old schema is still in place
- Make sure you ran `deploy_orders_schema.sql`, not `schema.sql`

## Need Help?

If you see any errors:
1. Copy the full error message
2. Check which SQL file you ran
3. Verify prerequisite tables exist (clients, sites, products)

The adapter layer ensures your existing code continues to work without changes!
