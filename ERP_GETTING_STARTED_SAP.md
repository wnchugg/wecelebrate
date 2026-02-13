# 🚀 Getting Started: Implementing Your First Real ERP Connector

**Goal:** Connect to a real SAP system and sync products  
**Time:** 2-3 days  
**Difficulty:** Intermediate

---

## 📋 Prerequisites

### 1. SAP API Access
```
✓ SAP API endpoint URL (e.g., https://api.sap.com/s4hana/...)
✓ API credentials (OAuth token or API key)
✓ Sandbox/test environment access
✓ API documentation from SAP
✓ Sample API responses
```

### 2. Development Environment
```
✓ Supabase project with Edge Functions
✓ Admin access to wecelebrate platform
✓ Postman or similar API testing tool
✓ Access to Supabase logs
```

---

## 🎯 Step-by-Step Implementation

### STEP 1: Test SAP API Manually (30 minutes)

**Use Postman to verify API works:**

```http
GET https://api.sap.com/s4hana/products
Authorization: Bearer YOUR_SAP_API_TOKEN
Content-Type: application/json
```

**Expected Response:**
```json
{
  "d": {
    "results": [
      {
        "Material": "MAT001",
        "MaterialDescription": "Corporate Gift Set",
        "NetPrice": "45.00",
        "Currency": "USD",
        "AvailableStock": "150",
        "ProductGroup": "GIFTS"
      }
    ]
  }
}
```

**Document the response structure** - you'll need this for mapping!

---

### STEP 2: Create SAP Connector Module (2 hours)

**File:** `/supabase/functions/server/connectors/sap_connector.ts`

```typescript
/**
 * SAP S/4HANA Connector
 * Handles all SAP-specific API calls and data transformations
 */

import { ERPConnection } from '../erp_integration_enhanced.ts';

export interface SAPProduct {
  Material: string;
  MaterialDescription: string;
  NetPrice: string;
  Currency: string;
  AvailableStock: string;
  ProductGroup: string;
  MaterialWeight?: string;
  SizeOrDimensionText?: string;
}

export interface SAPOrder {
  SalesOrder?: string;
  SoldToParty: string;
  ShipToParty: string;
  SalesOrderDate: string;
  TotalNetAmount: string;
  Currency: string;
  SalesOrderItem: Array<{
    Material: string;
    RequestedQuantity: string;
    NetAmount: string;
  }>;
}

export class SAPConnector {
  private connection: ERPConnection;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(connection: ERPConnection) {
    this.connection = connection;
    this.baseUrl = connection.credentials.apiUrl || '';
    this.headers = this.buildHeaders();
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authentication
    if (this.connection.credentials.apiKey) {
      headers['Authorization'] = `Bearer ${this.connection.credentials.apiKey}`;
    }

    // SAP-specific headers
    headers['sap-client'] = '100'; // SAP client number
    headers['DataServiceVersion'] = '2.0';

    return headers;
  }

  /**
   * Fetch products from SAP
   */
  async fetchProducts(): Promise<any[]> {
    try {
      console.log(`[SAP] Fetching products from ${this.baseUrl}`);

      const response = await fetch(`${this.baseUrl}/API_PRODUCT_SRV/A_Product`, {
        method: 'GET',
        headers: this.headers,
        signal: AbortSignal.timeout(this.connection.settings.timeout || 60000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SAP API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // SAP OData format has results nested in d.results
      const sapProducts = data.d?.results || data.value || [];
      
      console.log(`[SAP] Fetched ${sapProducts.length} products`);
      
      // Transform SAP format to our standard format
      return sapProducts.map((product: SAPProduct) => this.transformProduct(product));

    } catch (error: any) {
      console.error('[SAP] Product fetch error:', error);
      throw new Error(`Failed to fetch SAP products: ${error.message}`);
    }
  }

  /**
   * Transform SAP product to our standard format
   */
  private transformProduct(sapProduct: SAPProduct): any {
    return {
      sku: sapProduct.Material.trim(),
      name: sapProduct.MaterialDescription,
      price: parseFloat(sapProduct.NetPrice),
      currency: sapProduct.Currency,
      stockQuantity: parseInt(sapProduct.AvailableStock) || 0,
      category: sapProduct.ProductGroup,
      attributes: {
        weight: sapProduct.MaterialWeight,
        dimensions: sapProduct.SizeOrDimensionText,
      },
      erpProductId: sapProduct.Material,
      erpSource: 'sap',
    };
  }

  /**
   * Submit order to SAP
   */
  async submitOrder(orderData: any): Promise<{ success: boolean; sapOrderId?: string; error?: string }> {
    try {
      console.log(`[SAP] Submitting order to ${this.baseUrl}`);

      const sapOrder = this.transformOrderToSAP(orderData);

      const response = await fetch(`${this.baseUrl}/API_SALES_ORDER_SRV/A_SalesOrder`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(sapOrder),
        signal: AbortSignal.timeout(this.connection.settings.timeout || 60000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SAP order submission failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const sapOrderId = result.d?.SalesOrder || result.SalesOrder || 'unknown';

      console.log(`[SAP] Order created: ${sapOrderId}`);

      return {
        success: true,
        sapOrderId,
      };

    } catch (error: any) {
      console.error('[SAP] Order submission error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Transform our order format to SAP format
   */
  private transformOrderToSAP(orderData: any): SAPOrder {
    return {
      SoldToParty: orderData.customerId || '0001000000',
      ShipToParty: orderData.customerId || '0001000000',
      SalesOrderDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      TotalNetAmount: orderData.totalAmount.toString(),
      Currency: orderData.currency || 'USD',
      SalesOrderItem: orderData.items.map((item: any, index: number) => ({
        SalesOrderItem: ((index + 1) * 10).toString(), // 10, 20, 30...
        Material: item.sku,
        RequestedQuantity: item.quantity.toString(),
        NetAmount: item.price.toString(),
      })),
    };
  }

  /**
   * Fetch inventory/stock levels from SAP
   */
  async fetchInventory(): Promise<any[]> {
    try {
      console.log(`[SAP] Fetching inventory from ${this.baseUrl}`);

      const response = await fetch(`${this.baseUrl}/API_MATERIAL_STOCK_SRV/A_MatlStkInAcctMod`, {
        method: 'GET',
        headers: this.headers,
        signal: AbortSignal.timeout(this.connection.settings.timeout || 60000),
      });

      if (!response.ok) {
        throw new Error(`SAP inventory fetch failed: ${response.status}`);
      }

      const data = await response.json();
      const inventory = data.d?.results || data.value || [];

      console.log(`[SAP] Fetched inventory for ${inventory.length} items`);

      return inventory.map((item: any) => ({
        sku: item.Material,
        quantity: parseInt(item.MatlWrhsStkQtyInMatlBaseUnit) || 0,
        location: item.StorageLocation,
        lastUpdated: new Date().toISOString(),
      }));

    } catch (error: any) {
      console.error('[SAP] Inventory fetch error:', error);
      throw error;
    }
  }

  /**
   * Fetch order status from SAP
   */
  async fetchOrderStatus(sapOrderId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/API_SALES_ORDER_SRV/A_SalesOrder('${sapOrderId}')`,
        {
          method: 'GET',
          headers: this.headers,
          signal: AbortSignal.timeout(this.connection.settings.timeout || 30000),
        }
      );

      if (!response.ok) {
        throw new Error(`SAP order status fetch failed: ${response.status}`);
      }

      const data = await response.json();
      const order = data.d || data;

      return {
        orderId: order.SalesOrder,
        status: order.OverallSDProcessStatus,
        deliveryStatus: order.OverallDeliveryStatus,
        totalAmount: order.TotalNetAmount,
        lastUpdated: new Date().toISOString(),
      };

    } catch (error: any) {
      console.error('[SAP] Order status fetch error:', error);
      throw error;
    }
  }
}
```

---

### STEP 3: Integrate SAP Connector into Main Module (1 hour)

**File:** `/supabase/functions/server/erp_integration_enhanced.ts`

Add import at top:
```typescript
import { SAPConnector } from './connectors/sap_connector.ts';
```

Update `syncProducts` function:
```typescript
/**
 * Sync products from ERP
 */
async function syncProducts(connection: ERPConnection): Promise<any> {
  console.log(`[ERP] Syncing products for connection: ${connection.id}`);
  
  try {
    let products: any[] = [];
    let processed = 0;
    let success = 0;
    let failed = 0;

    // Route to appropriate connector based on provider
    if (connection.provider === 'SAP') {
      const sapConnector = new SAPConnector(connection);
      products = await sapConnector.fetchProducts();
    } else if (connection.provider === 'Oracle') {
      // TODO: Implement Oracle connector
      throw new Error('Oracle connector not yet implemented');
    } else if (connection.provider === 'NetSuite') {
      // TODO: Implement NetSuite connector
      throw new Error('NetSuite connector not yet implemented');
    } else {
      throw new Error(`Unsupported ERP provider: ${connection.provider}`);
    }

    // Process products
    for (const product of products) {
      try {
        // Store product in KV store with catalog reference
        await kv.set(`erp_product:${product.sku}`, product);
        
        // TODO: Link to actual catalog system
        // await catalogService.upsertProduct(product);
        
        success++;
      } catch (error) {
        console.error(`Failed to process product ${product.sku}:`, error);
        failed++;
      }
      processed++;
    }

    console.log(`[ERP] Product sync complete: ${success}/${processed} successful`);

    return {
      processed,
      success,
      failed
    };

  } catch (error: any) {
    console.error('[ERP] Product sync failed:', error);
    throw error;
  }
}
```

Update `syncOrders` function:
```typescript
/**
 * Sync orders to ERP
 */
async function syncOrders(connection: ERPConnection, direction: ERPSyncDirection): Promise<any> {
  console.log(`[ERP] Syncing orders (${direction}) for connection: ${connection.id}`);
  
  try {
    if (direction === 'push' || direction === 'bidirectional') {
      // Get pending orders from our system
      const pendingOrders = await kv.getByPrefix('order:pending:');
      
      let processed = 0;
      let success = 0;
      let failed = 0;

      for (const orderItem of pendingOrders) {
        const order = orderItem.value;
        
        try {
          // Route to appropriate connector
          if (connection.provider === 'SAP') {
            const sapConnector = new SAPConnector(connection);
            const result = await sapConnector.submitOrder(order);
            
            if (result.success) {
              // Update order with SAP order ID
              await kv.set(`order:${order.id}`, {
                ...order,
                erpOrderId: result.sapOrderId,
                erpStatus: 'submitted',
                syncedAt: new Date().toISOString()
              });
              success++;
            } else {
              failed++;
            }
          }
        } catch (error) {
          console.error(`Failed to submit order ${order.id}:`, error);
          failed++;
        }
        processed++;
      }

      return { processed, success, failed };
    }

    // Pull orders from ERP
    if (direction === 'pull' || direction === 'bidirectional') {
      // TODO: Implement pulling orders from ERP
      return { processed: 0, success: 0, failed: 0 };
    }

    return { processed: 0, success: 0, failed: 0 };

  } catch (error: any) {
    console.error('[ERP] Order sync failed:', error);
    throw error;
  }
}
```

---

### STEP 4: Add SAP Secrets to Supabase (15 minutes)

**Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets**

Add these secrets:
```bash
SAP_API_URL=https://your-sap-instance.com/sap/opu/odata/sap
SAP_API_KEY=your-sap-api-key
SAP_CLIENT=100
SAP_USERNAME=your-sap-username
```

---

### STEP 5: Test the Integration (1 hour)

#### Test 1: Connection Test
```bash
# Login to admin panel
Navigate to: /admin/erp-connections

# Create new connection
- Name: "SAP Production Test"
- Provider: SAP
- Method: API
- API URL: (use SAP_API_URL from secrets)
- API Key: (use SAP_API_KEY from secrets)
- Enable: Products, Orders, Inventory

# Click "Test Connection"
Expected: ✅ "Connection successful! Response time: 245ms"
```

#### Test 2: Product Sync
```bash
# In the ERP connection card
- Expand the connection
- Click "Sync Now" on Products

# Check sync logs tab
Expected:
- Status: Success
- Records: 150 processed, 150 success, 0 failed
- Duration: 15s
```

#### Test 3: Verify Data
```bash
# Open Supabase Dashboard → Database → KV Store
# Look for keys starting with "erp_product:"

# Or query via API:
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/erp/sync-logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### STEP 6: Link to Catalog System (2-4 hours)

**File:** `/supabase/functions/server/erp_product_processor.ts`

```typescript
import * as kv from './kv_store.tsx';

export async function processERPProducts(
  products: any[],
  catalogId: string,
  erpConnectionId: string
): Promise<{ created: number; updated: number; failed: number }> {
  
  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const erpProduct of products) {
    try {
      // Check if product exists in catalog
      const existingProduct = await kv.get(`catalog:${catalogId}:product:${erpProduct.sku}`);

      if (existingProduct) {
        // Update existing product
        await kv.set(`catalog:${catalogId}:product:${erpProduct.sku}`, {
          ...existingProduct,
          name: erpProduct.name,
          price: erpProduct.price,
          stock: erpProduct.stockQuantity,
          lastSyncedAt: new Date().toISOString(),
          erpProductId: erpProduct.erpProductId,
          erpConnectionId,
        });
        updated++;
      } else {
        // Create new product
        const newProduct = {
          id: `prod_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          catalogId,
          sku: erpProduct.sku,
          name: erpProduct.name,
          description: erpProduct.description || '',
          price: erpProduct.price,
          currency: erpProduct.currency || 'USD',
          stock: erpProduct.stockQuantity,
          category: erpProduct.category,
          attributes: erpProduct.attributes,
          images: [],
          erpProductId: erpProduct.erpProductId,
          erpConnectionId,
          erpSource: erpProduct.erpSource,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await kv.set(`catalog:${catalogId}:product:${erpProduct.sku}`, newProduct);
        
        // Also add to catalog's product list
        const catalogProducts = await kv.get(`catalog:${catalogId}:products`) || [];
        catalogProducts.push(newProduct.id);
        await kv.set(`catalog:${catalogId}:products`, catalogProducts);
        
        created++;
      }

    } catch (error) {
      console.error(`Failed to process product ${erpProduct.sku}:`, error);
      failed++;
    }
  }

  console.log(`[Product Processor] Created: ${created}, Updated: ${updated}, Failed: ${failed}`);

  return { created, updated, failed };
}
```

Update `syncProducts` in `erp_integration_enhanced.ts`:
```typescript
import { processERPProducts } from './erp_product_processor.ts';

async function syncProducts(connection: ERPConnection): Promise<any> {
  // ... existing code to fetch products ...

  // Get the catalog ID from client/site assignment
  const assignment = await getClientERPAssignmentForConnection(connection.id);
  const catalogId = assignment?.catalogId || 'default_catalog';

  // Process products and link to catalog
  const result = await processERPProducts(products, catalogId, connection.id);

  return {
    processed: result.created + result.updated + result.failed,
    success: result.created + result.updated,
    failed: result.failed
  };
}
```

---

### STEP 7: Set Up Scheduled Sync (1 hour)

**Option A: Using Supabase pg_cron (Recommended)**

```sql
-- Run in Supabase SQL Editor
SELECT cron.schedule(
  'erp-product-sync-daily',
  '0 6 * * *', -- Every day at 6 AM
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/erp/schedules/process-due',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- Remove a job if needed
SELECT cron.unschedule('erp-product-sync-daily');
```

**Option B: Using GitHub Actions**

Create `.github/workflows/erp-sync.yml`:
```yaml
name: ERP Product Sync
on:
  schedule:
    - cron: '0 6 * * *'  # Every day at 6 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  sync-products:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger ERP Product Sync
        run: |
          curl -X POST \
            "https://${{ secrets.SUPABASE_PROJECT_ID }}.supabase.co/functions/v1/make-server-6fcaeea3/erp/connections/${{ secrets.ERP_CONNECTION_ID }}/sync" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"dataType": "products", "direction": "pull"}'
```

---

## ✅ Verification Checklist

After completing all steps:

- [ ] Can create SAP connection in UI
- [ ] Connection test shows real success (not mock)
- [ ] Manual product sync pulls real data from SAP
- [ ] Products stored in KV store with `erp_product:` prefix
- [ ] Products linked to catalog
- [ ] Products visible in catalog UI
- [ ] Sync logs show real record counts
- [ ] Can view sync statistics
- [ ] Scheduled sync executes automatically
- [ ] Can submit test order to SAP
- [ ] SAP returns real order ID

---

## 🐛 Troubleshooting

### Connection Test Fails
```
Error: "Connection error: fetch failed"

Solutions:
1. Check SAP API URL is correct
2. Verify API key is valid
3. Check network connectivity
4. Review CORS settings
5. Check Supabase Edge Function logs
```

### Products Not Appearing
```
Sync shows success but products not in catalog

Solutions:
1. Check KV store for erp_product: keys
2. Verify catalogId is correct
3. Check processERPProducts logs
4. Verify catalog exists
5. Check product SKU format
```

### Authentication Errors
```
Error: 401 Unauthorized

Solutions:
1. Regenerate SAP API token
2. Check token expiration
3. Verify sap-client header
4. Check username/password
5. Review SAP user permissions
```

---

## 📚 Resources

- **SAP S/4HANA API:** https://api.sap.com/
- **SAP OData Documentation:** https://www.sap.com/documents/2016/09/d6c8d0e7-8a7c-0010-82c7-eda71af511fa.html
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Deno Fetch API:** https://deno.land/api@v1.36.0?s=fetch

---

## 🎯 Next Steps

Once SAP is working:
1. Add Oracle connector (similar pattern)
2. Add NetSuite connector
3. Implement SFTP for legacy systems
4. Add order status tracking
5. Add inventory real-time sync
6. Build field mapping UI

---

**Estimated Time:** 6-8 hours for first working SAP integration  
**Difficulty:** Intermediate  
**Prerequisites:** SAP API access, basic TypeScript knowledge

Good luck! 🚀
