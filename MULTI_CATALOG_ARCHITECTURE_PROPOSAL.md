# Multi-Catalog Architecture Proposal
## Support for Multiple ERP/Vendor Product Catalogs

**Date:** February 11, 2026  
**Status:** 🔵 PROPOSAL - Awaiting Approval  
**Priority:** HIGH - Enterprise Requirement  
**Estimated Effort:** 60-80 hours

---

## Executive Summary

This proposal outlines an architectural enhancement to support **multiple product catalogs from different ERP systems and external vendors**, with site-level catalog assignment and exclusion rules.

### Business Requirements

1. **Multiple Catalog Sources**: Import and manage products from different ERPs (SAP, Oracle, NetSuite) and external vendors
2. **Catalog-to-Site Mapping**: Each site is configured to source products from one specific catalog
3. **Site-Level Exclusions**: Sites can exclude specific categories/SKUs from their assigned catalog
4. **Independent Management**: Catalogs can be updated independently without affecting other catalogs
5. **Vendor Isolation**: Products from Vendor A don't mix with products from Vendor B

### Use Cases

**Scenario 1: Multi-Brand Client with Different Suppliers**
- Client: GlobalRetail Corp
- Site A → "Premium Brand" → Sources from Vendor A (luxury goods)
- Site B → "Essentials Brand" → Sources from Vendor B (everyday items)
- Site C → "Tech Division" → Sources from Internal ERP (electronics)

**Scenario 2: Regional Distribution**
- Client: InternationalCorp
- US Sites → US Vendor Catalog (US-compliant products, USD pricing)
- EU Sites → EU Vendor Catalog (CE-certified products, EUR pricing)
- APAC Sites → APAC Vendor Catalog (region-specific products, local currencies)

**Scenario 3: Business Unit Separation**
- Client: ConglomerateCorp
- Healthcare Division → Healthcare ERP (medical supplies catalog)
- Manufacturing Division → Manufacturing ERP (industrial goods catalog)
- Retail Division → Retail ERP (consumer products catalog)

---

## Current Architecture (Limitations)

### Current State
```
┌─────────────────────────┐
│   Global Gift Catalog   │ ← Single source of truth
│   (All Products Mixed)  │
└───────────┬─────────────┘
            │
    ┌───────┴────────┬──────────┐
    │                │          │
┌───▼────┐      ┌───▼────┐  ┌──▼─────┐
│ Site A │      │ Site B │  │ Site C │
│ Filter │      │ Filter │  │ Filter │
└────────┘      └────────┘  └────────┘
```

**Problems:**
- ❌ All products from all sources mixed together
- ❌ No way to separate ERP A products from ERP B products
- ❌ Vendor pricing conflicts (same SKU, different prices)
- ❌ No source attribution (which ERP/vendor owns the product?)
- ❌ Updates from one vendor affect all sites
- ❌ Can't manage vendor catalogs independently

---

## Proposed Architecture

### New Multi-Catalog Model
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Catalog A   │  │  Catalog B   │  │  Catalog C   │
│  (ERP: SAP)  │  │(Vendor: Acme)│  │(Oracle NetS.)│
│  500 products│  │  200 products│  │  800 products│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       │                 │                  │
   ┌───▼─────────────────▼──────────────────▼───┐
   │         Site Configuration Layer            │
   │    (Catalog Selection + Exclusions)         │
   └───┬─────────────────┬──────────────────┬───┘
       │                 │                  │
   ┌───▼────┐       ┌────▼───┐        ┌────▼───┐
   │ Site A │       │ Site B │        │ Site C │
   │Catalog A│      │Catalog B│       │Catalog C│
   │-Exclude:│      │-Exclude:│       │-Exclude:│
   │ SKU-001│       │ Category│       │  None   │
   └────────┘       └────────┘        └─────────┘
```

---

## Data Model

### 1. Catalog Entity (NEW)

```typescript
interface Catalog {
  id: string;                    // catalog_001
  name: string;                  // "SAP Production ERP"
  description?: string;          // "Main product catalog from SAP"
  type: CatalogType;             // 'erp' | 'vendor' | 'manual'
  source: CatalogSource;
  status: 'active' | 'inactive' | 'syncing' | 'error';
  
  // Metadata
  totalProducts: number;         // Cached count
  activeProducts: number;        // Currently active
  lastSyncedAt?: string;        // Last successful sync
  nextSyncAt?: string;          // Scheduled next sync
  
  // Configuration
  settings: {
    autoSync: boolean;           // Auto-sync from source
    syncFrequency?: string;      // 'daily' | 'weekly' | 'manual'
    defaultCurrency: string;     // USD, EUR, etc.
    priceMarkup?: number;        // % markup on cost
    allowSiteOverrides: boolean; // Can sites modify prices?
  };
  
  // Ownership
  managedBy?: string;            // Admin user ID
  ownerId?: string;              // Client ID (if client-specific)
  
  createdAt: string;
  updatedAt: string;
}

type CatalogType = 'erp' | 'vendor' | 'manual' | 'dropship';

interface CatalogSource {
  type: 'api' | 'file' | 'manual';
  
  // For API sources (ERP integration)
  apiConfig?: {
    endpoint: string;
    authType: 'basic' | 'oauth' | 'api_key';
    credentials: Record<string, string>; // Encrypted
    syncEndpoint: string;
  };
  
  // For file sources (CSV/Excel imports)
  fileConfig?: {
    format: 'csv' | 'xlsx' | 'json' | 'xml';
    ftpHost?: string;
    ftpPath?: string;
  };
  
  // Source identifiers
  sourceSystem: string;          // "SAP", "Oracle", "Vendor Portal"
  sourceId: string;              // External system identifier
  sourceVersion?: string;        // API version
}
```

**Storage Key:** `catalogs:{catalogId}`

---

### 2. Enhanced Gift/Product Entity

```typescript
interface Gift {
  id: string;                    // gift_001
  catalogId: string;             // ← NEW: Links to specific catalog
  
  // Product Information
  name: string;
  description: string;
  longDescription?: string;
  sku: string;                   // SKU within the catalog
  
  // Source Attribution (NEW)
  source: {
    catalogId: string;
    externalId?: string;         // ID in source system
    externalSku?: string;        // SKU in source system
    lastSyncedAt?: string;
    syncStatus: 'synced' | 'modified' | 'conflict' | 'manual';
  };
  
  // Pricing
  price: number;
  cost?: number;                 // Cost from vendor/ERP
  msrp?: number;                 // Manufacturer's suggested retail price
  currency: string;              // Inherited from catalog or overridden
  
  // Standard fields...
  category: string;
  image: string;
  images?: string[];
  inventory: {
    total: number;
    available: number;
    reserved: number;
    trackInventory: boolean;     // Some catalogs may not track
  };
  
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  
  // Metadata
  attributes?: Record<string, string>;
  variants?: GiftVariant[];
  tags?: string[];
  
  createdAt: string;
  updatedAt: string;
}
```

**Storage Keys:**
- `gifts:{giftId}` - Individual gift (unchanged)
- `catalog_gifts:{catalogId}` - Array of gift IDs in this catalog (NEW)
- `catalog_gifts:{catalogId}:{giftId}` - Direct lookup (NEW)

---

### 3. Enhanced Site Configuration

```typescript
interface SiteSettings {
  // Existing fields...
  validationMethod: ValidationMethodType;
  allowQuantitySelection: boolean;
  showPricing: boolean;
  
  // NEW: Catalog Assignment
  catalogConfig: {
    catalogId: string;           // Which catalog this site uses
    
    // Exclusion Rules (applied AFTER catalog selection)
    exclusions: {
      excludedCategories: string[];  // e.g., ["Electronics", "Alcohol"]
      excludedSkus: string[];        // e.g., ["MUG-001", "LAPTOP-500"]
      excludedTags?: string[];       // e.g., ["luxury", "restricted"]
    };
    
    // Optional: Site-level overrides
    overrides?: {
      allowPriceOverride: boolean;  // Can site modify prices?
      priceAdjustment?: number;     // % adjustment on catalog prices
      customPricing?: Record<string, number>; // SKU → custom price
    };
    
    // Availability Rules
    availability?: {
      hideOutOfStock: boolean;
      hideDiscontinued: boolean;
      minimumInventory?: number;    // Don't show if < X in stock
    };
  };
  
  // ... rest of existing fields
}
```

**Storage Key:** `sites:{siteId}` (enhanced existing structure)

---

### 4. Catalog Sync Log (NEW)

```typescript
interface CatalogSyncLog {
  id: string;
  catalogId: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed' | 'partial';
  
  results: {
    productsAdded: number;
    productsUpdated: number;
    productsRemoved: number;
    productsUnchanged: number;
    errors: Array<{
      sku: string;
      error: string;
      severity: 'warning' | 'error';
    }>;
  };
  
  metrics: {
    duration: number;             // milliseconds
    recordsProcessed: number;
    apiCalls: number;
    bytesTransferred?: number;
  };
  
  triggeredBy: string;            // 'scheduled' | 'manual' | userId
  logDetails?: string;            // Full log text
}
```

**Storage Key:** `catalog_sync_logs:{catalogId}:{timestamp}`

---

## UI/UX Design

### Admin Interface Changes

#### 1. New Admin Menu Section

```
Admin Navigation:
├─ Clients
├─ Sites
├─ 📦 CATALOG MANAGEMENT (NEW)
│  ├─ All Catalogs
│  ├─ ERP Integrations
│  ├─ Vendor Catalogs
│  └─ Sync History
├─ Gifts (now called "All Products")
├─ Orders
└─ Settings
```

---

#### 2. Catalog Management Page (`/admin/catalogs`)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  📦 Catalog Management                  [+ Add]     │
├─────────────────────────────────────────────────────┤
│  [All] [ERP] [Vendor] [Manual]    🔍 Search...     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📊 SAP Production ERP                        │  │
│  │ Status: ✅ Active | 847 products | Synced 2h│  │
│  │ Type: ERP | Auto-sync: Daily                 │  │
│  │ [View Products] [Sync Now] [Configure] [⚙️]  │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🏪 Acme Vendor Catalog                       │  │
│  │ Status: ⚠️ Syncing | 234 products           │  │
│  │ Type: Vendor | Auto-sync: Weekly             │  │
│  │ [View Products] [⏸️ Pause] [Configure] [⚙️]  │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✏️ Manual Product Catalog                    │  │
│  │ Status: ✅ Active | 125 products             │  │
│  │ Type: Manual | Last updated: 1 day ago       │  │
│  │ [View Products] [Add Product] [⚙️]           │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

#### 3. Create/Edit Catalog Modal

```
┌─────────────────────────────────────────────┐
│  Create New Catalog                    [×]  │
├─────────────────────────────────────────────┤
│                                             │
│  Catalog Type: *                           │
│  ( ) ERP Integration                       │
│  ( ) External Vendor                       │
│  (•) Manual Catalog                        │
│  ( ) Dropship Vendor                       │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Basic Information:                        │
│  Name: *                                   │
│  [Corporate Gift Catalog               ]   │
│                                             │
│  Description:                              │
│  [Main catalog for corporate gifts     ]   │
│                                             │
│  Default Currency: *                       │
│  [USD ▼]                                   │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Sync Configuration:                       │
│  ☑ Enable Auto-Sync                       │
│  Frequency: [Daily ▼]                     │
│  Next Sync: Feb 12, 2026 2:00 AM          │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Pricing Rules:                            │
│  Price Markup: [15] %                      │
│  ☑ Allow Site-Level Price Overrides       │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│            [Cancel]  [Create Catalog]      │
└─────────────────────────────────────────────┘
```

---

#### 4. Enhanced Site Configuration

**On Site Configuration page, add new "Product Catalog" section:**

```
┌─────────────────────────────────────────────────────┐
│  Site Configuration: TechCorp US                    │
├─────────────────────────────────────────────────────┤
│  [General] [Branding] [Validation] [📦 Catalog] ... │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Product Catalog Configuration                       │
│                                                      │
│  Catalog Source: *                                  │
│  [SAP Production ERP ▼]                ────────────  │
│                                        847 products  │
│                                                      │
│  ────────────────────────────────────────────────   │
│                                                      │
│  Exclusion Rules:                                   │
│                                                      │
│  Exclude Categories:                                │
│  ☑ Electronics      ☐ Food & Beverage              │
│  ☐ Gift Cards       ☐ Alcohol                       │
│  ☑ Luxury Items     ☐ Books & Media                 │
│                                                      │
│  Exclude Specific SKUs:                             │
│  [Search SKUs to exclude...           ]             │
│                                                      │
│  Currently Excluded (3):                            │
│  • LAPTOP-500 (Premium Laptop) [×]                  │
│  • WATCH-LUX (Luxury Watch) [×]                     │
│  • PHONE-999 (Latest Smartphone) [×]                │
│                                                      │
│  ────────────────────────────────────────────────   │
│                                                      │
│  Preview Available Products:                        │
│  After exclusions: 782 products available           │
│  [View Product List →]                              │
│                                                      │
│  ────────────────────────────────────────────────   │
│                                                      │
│  Price Overrides: (Optional)                        │
│  ☐ Apply site-specific price adjustments            │
│                                                      │
│  Availability Rules:                                │
│  ☑ Hide out-of-stock products                       │
│  ☑ Hide discontinued products                       │
│  Minimum Inventory: [5] units                       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

#### 5. Catalog-Aware Product List

**Enhanced `/admin/gifts` to show catalog filter:**

```
┌─────────────────────────────────────────────────────┐
│  Product Management                    [+ Add]      │
├─────────────────────────────────────────────────────┤
│  Catalog: [All Catalogs ▼]  Category: [All ▼]     │
│           └─ SAP Production (847)                   │
│           └─ Acme Vendor (234)                      │
│           └─ Manual Catalog (125)                   │
│                                                      │
│  🔍 Search products...                              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📦 SAP Production ERP (847 products)               │
│                                                      │
│  [Grid View] [List View]                           │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Product │ │  Product │ │  Product │           │
│  │    A     │ │    B     │ │    C     │           │
│  │ $99.99   │ │ $149.99  │ │ $79.99   │           │
│  │ 📊 SAP   │ │ 📊 SAP   │ │ 📊 SAP   │  ← Badge │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                      │
│  🏪 Acme Vendor Catalog (234 products)             │
│                                                      │
│  ┌──────────┐ ┌──────────┐                         │
│  │  Product │ │  Product │                         │
│  │    D     │ │    E     │                         │
│  │ $59.99   │ │ $129.99  │                         │
│  │ 🏪 Acme  │ │ 🏪 Acme  │  ← Badge                │
│  └──────────┘ └──────────┘                         │
└─────────────────────────────────────────────────────┘
```

---

## Backend Implementation

### API Endpoints (NEW)

#### Catalog Management

```typescript
// Catalog CRUD
GET    /catalogs                      // List all catalogs
GET    /catalogs/:catalogId           // Get catalog details
POST   /catalogs                      // Create catalog
PUT    /catalogs/:catalogId           // Update catalog
DELETE /catalogs/:catalogId           // Delete catalog (if no products)

// Catalog Products
GET    /catalogs/:catalogId/products  // Get all products in catalog
GET    /catalogs/:catalogId/stats     // Get catalog statistics

// Catalog Sync
POST   /catalogs/:catalogId/sync      // Trigger manual sync
GET    /catalogs/:catalogId/sync-logs // Get sync history
GET    /catalogs/:catalogId/sync-logs/:logId // Get specific sync log

// Catalog Import/Export
POST   /catalogs/:catalogId/import    // Bulk import products (CSV/Excel)
GET    /catalogs/:catalogId/export    // Export catalog to CSV
```

#### Enhanced Gift Endpoints

```typescript
// Modified to support catalog filtering
GET    /gifts?catalogId=xxx           // Filter gifts by catalog
GET    /gifts/:giftId                 // Include catalog info in response

// New catalog-specific endpoints
POST   /catalogs/:catalogId/gifts     // Add product to specific catalog
PUT    /catalogs/:catalogId/gifts/:giftId  // Update product in catalog
```

#### Site-Catalog Configuration

```typescript
// Get site's catalog configuration
GET    /sites/:siteId/catalog-config

// Update site's catalog assignment and exclusions
PUT    /sites/:siteId/catalog-config
Body: {
  catalogId: string;
  exclusions: { categories, skus, tags };
  overrides?: { priceAdjustment, customPricing };
  availability?: { hideOutOfStock, etc. };
}

// Preview: Get products that will be available on site
GET    /sites/:siteId/catalog-preview
Response: {
  catalogId: string;
  catalogName: string;
  totalInCatalog: number;
  afterExclusions: number;
  products: Gift[];
}
```

---

### Storage Schema

#### KV Store Keys

```typescript
// Catalogs
catalogs:all                           // Array of catalog IDs
catalogs:{catalogId}                   // Catalog object

// Catalog Products (indexed by catalog)
catalog_gifts:{catalogId}              // Array of gift IDs in this catalog
catalog_gifts:{catalogId}:{giftId}     // Gift belongs to catalog (boolean flag)

// Gifts (enhanced with catalogId)
gifts:all                              // Array of ALL gift IDs (unchanged)
gifts:{giftId}                         // Gift object (now includes catalogId)

// Site Catalog Config
sites:{siteId}:catalog_config          // Site's catalog configuration

// Catalog Sync Logs
catalog_sync_logs:{catalogId}:latest   // Most recent sync log
catalog_sync_logs:{catalogId}:{timestamp} // Historical sync logs

// Indexes for fast lookups
catalog_index:by_type:{type}           // Catalog IDs by type (erp/vendor/manual)
catalog_index:by_status:{status}       // Catalog IDs by status
```

---

### Filtering Logic (Server-Side)

```typescript
/**
 * Get products available for a specific site
 */
async function getSiteProducts(siteId: string): Promise<Gift[]> {
  // 1. Get site's catalog configuration
  const catalogConfig = await kv.get(`sites:${siteId}:catalog_config`);
  
  if (!catalogConfig) {
    throw new Error('Site catalog not configured');
  }
  
  // 2. Get all products from the assigned catalog
  const catalogGiftIds = await kv.get(`catalog_gifts:${catalogConfig.catalogId}`);
  const allCatalogProducts = await Promise.all(
    catalogGiftIds.map(id => kv.get(`gifts:${id}`))
  );
  
  // 3. Filter by status (only active)
  let filteredProducts = allCatalogProducts.filter(g => g.status === 'active');
  
  // 4. Apply exclusions - Categories
  if (catalogConfig.exclusions.excludedCategories?.length > 0) {
    filteredProducts = filteredProducts.filter(
      g => !catalogConfig.exclusions.excludedCategories.includes(g.category)
    );
  }
  
  // 5. Apply exclusions - SKUs
  if (catalogConfig.exclusions.excludedSkus?.length > 0) {
    filteredProducts = filteredProducts.filter(
      g => !catalogConfig.exclusions.excludedSkus.includes(g.sku)
    );
  }
  
  // 6. Apply exclusions - Tags
  if (catalogConfig.exclusions.excludedTags?.length > 0) {
    filteredProducts = filteredProducts.filter(g => {
      const productTags = g.tags || [];
      return !productTags.some(tag => 
        catalogConfig.exclusions.excludedTags.includes(tag)
      );
    });
  }
  
  // 7. Apply availability rules
  if (catalogConfig.availability?.hideOutOfStock) {
    filteredProducts = filteredProducts.filter(
      g => g.inventory.available > 0
    );
  }
  
  if (catalogConfig.availability?.hideDiscontinued) {
    filteredProducts = filteredProducts.filter(
      g => g.status !== 'discontinued'
    );
  }
  
  if (catalogConfig.availability?.minimumInventory) {
    filteredProducts = filteredProducts.filter(
      g => g.inventory.available >= catalogConfig.availability.minimumInventory
    );
  }
  
  // 8. Apply price overrides (if configured)
  if (catalogConfig.overrides?.priceAdjustment) {
    filteredProducts = filteredProducts.map(g => ({
      ...g,
      price: g.price * (1 + catalogConfig.overrides.priceAdjustment / 100),
    }));
  }
  
  if (catalogConfig.overrides?.customPricing) {
    filteredProducts = filteredProducts.map(g => {
      const customPrice = catalogConfig.overrides.customPricing[g.sku];
      return customPrice ? { ...g, price: customPrice } : g;
    });
  }
  
  return filteredProducts;
}
```

---

## ERP/Vendor Integration

### Integration Patterns

#### Pattern 1: API Sync (Real-time)

```typescript
/**
 * Sync products from external API
 */
async function syncCatalogFromAPI(catalogId: string) {
  const catalog = await kv.get(`catalogs:${catalogId}`);
  const { apiConfig } = catalog.source;
  
  // Create sync log
  const syncLog = {
    id: generateId(),
    catalogId,
    startedAt: new Date().toISOString(),
    status: 'running',
    results: {
      productsAdded: 0,
      productsUpdated: 0,
      productsRemoved: 0,
      productsUnchanged: 0,
      errors: [],
    },
  };
  
  await kv.set(`catalog_sync_logs:${catalogId}:latest`, syncLog);
  
  try {
    // 1. Fetch products from external API
    const response = await fetch(apiConfig.syncEndpoint, {
      headers: {
        'Authorization': `Bearer ${apiConfig.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    const externalProducts = await response.json();
    
    // 2. Get existing products in catalog
    const existingGiftIds = await kv.get(`catalog_gifts:${catalogId}`) || [];
    const existingGifts = await Promise.all(
      existingGiftIds.map(id => kv.get(`gifts:${id}`))
    );
    
    // 3. Compare and sync
    for (const extProduct of externalProducts) {
      const existingGift = existingGifts.find(
        g => g.source.externalId === extProduct.id
      );
      
      if (!existingGift) {
        // New product - ADD
        const newGift = mapExternalToGift(extProduct, catalogId);
        await kv.set(`gifts:${newGift.id}`, newGift);
        await addGiftToCatalog(catalogId, newGift.id);
        syncLog.results.productsAdded++;
      } else {
        // Existing product - CHECK FOR UPDATES
        const needsUpdate = hasProductChanged(existingGift, extProduct);
        
        if (needsUpdate) {
          const updatedGift = mergeProductUpdates(existingGift, extProduct);
          await kv.set(`gifts:${updatedGift.id}`, updatedGift);
          syncLog.results.productsUpdated++;
        } else {
          syncLog.results.productsUnchanged++;
        }
      }
    }
    
    // 4. Mark sync as complete
    syncLog.completedAt = new Date().toISOString();
    syncLog.status = 'completed';
    
  } catch (error) {
    syncLog.status = 'failed';
    syncLog.results.errors.push({
      sku: 'N/A',
      error: error.message,
      severity: 'error',
    });
  }
  
  // Save final sync log
  await kv.set(`catalog_sync_logs:${catalogId}:latest`, syncLog);
  await kv.set(
    `catalog_sync_logs:${catalogId}:${syncLog.startedAt}`,
    syncLog
  );
  
  return syncLog;
}
```

#### Pattern 2: File Import (Batch)

```typescript
/**
 * Import products from CSV/Excel file
 */
async function importCatalogFromFile(
  catalogId: string,
  file: File
): Promise<SyncLog> {
  const catalog = await kv.get(`catalogs:${catalogId}`);
  const syncLog = createSyncLog(catalogId);
  
  try {
    // 1. Parse file (CSV, Excel, JSON, XML)
    const records = await parseFile(file, catalog.source.fileConfig.format);
    
    // 2. Validate records
    const validationResults = validateImportRecords(records);
    
    if (validationResults.errors.length > 0) {
      syncLog.results.errors = validationResults.errors;
      throw new Error('Validation failed');
    }
    
    // 3. Import records
    for (const record of records) {
      try {
        const gift = mapImportRecordToGift(record, catalogId);
        
        // Check if SKU already exists in this catalog
        const existingGift = await findGiftBySku(catalogId, gift.sku);
        
        if (existingGift) {
          // Update existing
          await kv.set(`gifts:${existingGift.id}`, {
            ...existingGift,
            ...gift,
            updatedAt: new Date().toISOString(),
          });
          syncLog.results.productsUpdated++;
        } else {
          // Add new
          await kv.set(`gifts:${gift.id}`, gift);
          await addGiftToCatalog(catalogId, gift.id);
          syncLog.results.productsAdded++;
        }
      } catch (error) {
        syncLog.results.errors.push({
          sku: record.sku,
          error: error.message,
          severity: 'error',
        });
      }
    }
    
    syncLog.status = 'completed';
  } catch (error) {
    syncLog.status = 'failed';
  }
  
  syncLog.completedAt = new Date().toISOString();
  await saveSyncLog(catalogId, syncLog);
  
  return syncLog;
}
```

#### Pattern 3: FTP/SFTP Sync (Scheduled)

```typescript
/**
 * Download and import catalog file from FTP/SFTP
 */
async function syncCatalogFromFTP(catalogId: string) {
  const catalog = await kv.get(`catalogs:${catalogId}`);
  const { ftpHost, ftpPath } = catalog.source.fileConfig;
  
  // 1. Connect to FTP server
  const ftpClient = new FTPClient({
    host: ftpHost,
    user: catalog.source.apiConfig.credentials.ftpUser,
    password: catalog.source.apiConfig.credentials.ftpPassword,
  });
  
  await ftpClient.connect();
  
  // 2. Download latest file
  const file = await ftpClient.download(ftpPath);
  
  // 3. Import file
  const syncLog = await importCatalogFromFile(catalogId, file);
  
  // 4. Disconnect
  await ftpClient.disconnect();
  
  return syncLog;
}
```

---

## Migration Strategy

### Phase 1: Database Schema Update (Week 1)

**Tasks:**
1. ✅ Add `Catalog` entity to types
2. ✅ Create catalog CRUD endpoints
3. ✅ Add `catalogId` field to Gift entity
4. ✅ Create catalog-gift relationship indexes
5. ✅ Update site settings to include `catalogConfig`

**Backward Compatibility:**
- Existing gifts without `catalogId` → Assign to default "Legacy Catalog"
- Existing sites without `catalogConfig` → Assign to default catalog
- Old gift filtering logic still works during migration

### Phase 2: Admin UI Implementation (Week 2)

**Tasks:**
1. ✅ Create `/admin/catalogs` page
2. ✅ Create catalog CRUD modals
3. ✅ Add catalog filter to gift management
4. ✅ Add catalog badges to product cards
5. ✅ Update site configuration with catalog selector
6. ✅ Add exclusion rules UI

### Phase 3: ERP Integration Framework (Week 3)

**Tasks:**
1. ✅ Implement sync engine (API, file, FTP)
2. ✅ Create sync logs and monitoring
3. ✅ Add scheduled sync system
4. ✅ Implement conflict resolution
5. ✅ Create import/export utilities

### Phase 4: Testing & Rollout (Week 4)

**Tasks:**
1. ✅ Migrate existing data to new structure
2. ✅ Test with sample ERP data
3. ✅ Test multi-catalog site filtering
4. ✅ Load testing with 10,000+ products across catalogs
5. ✅ Documentation and training

---

## Testing Plan

### Unit Tests

```typescript
describe('Multi-Catalog System', () => {
  describe('Catalog Management', () => {
    it('should create a new catalog');
    it('should update catalog settings');
    it('should delete empty catalog');
    it('should prevent deleting catalog with products');
  });
  
  describe('Product Assignment', () => {
    it('should add product to catalog');
    it('should prevent duplicate SKUs in same catalog');
    it('should allow same SKU in different catalogs');
    it('should update catalog product count');
  });
  
  describe('Site Filtering', () => {
    it('should return only products from assigned catalog');
    it('should exclude categories correctly');
    it('should exclude SKUs correctly');
    it('should apply price overrides');
    it('should hide out-of-stock products');
  });
  
  describe('ERP Sync', () => {
    it('should sync products from API');
    it('should handle sync errors gracefully');
    it('should create sync logs');
    it('should detect product changes');
    it('should mark discontinued products');
  });
});
```

### Integration Tests

```typescript
describe('End-to-End Catalog Flow', () => {
  it('should complete full catalog lifecycle', async () => {
    // 1. Create catalog
    const catalog = await createCatalog({
      name: 'Test ERP',
      type: 'erp',
    });
    
    // 2. Import products
    await importProducts(catalog.id, testProducts);
    
    // 3. Assign to site
    await updateSiteConfig(testSite.id, {
      catalogId: catalog.id,
      exclusions: { excludedCategories: ['Electronics'] },
    });
    
    // 4. Fetch site products
    const siteProducts = await getSiteProducts(testSite.id);
    
    // 5. Verify filtering
    expect(siteProducts).not.toContain('Electronics');
    expect(siteProducts.length).toBeLessThan(testProducts.length);
  });
});
```

---

## Performance Considerations

### Optimization Strategies

1. **Caching**
   - Cache catalog product lists (TTL: 1 hour)
   - Cache site product filters (TTL: 5 minutes)
   - Invalidate cache on catalog sync or site config change

2. **Indexing**
   - Create indexes for fast catalog-to-products lookup
   - Index products by catalogId for filtering
   - Index by SKU within catalog for deduplication

3. **Lazy Loading**
   - Load catalog details on-demand
   - Paginate product lists (50 per page)
   - Defer loading product images

4. **Batch Operations**
   - Bulk product import (500 at a time)
   - Batch catalog sync updates
   - Parallel sync for multiple catalogs

### Expected Performance

- **Catalog Creation:** < 100ms
- **Product Import (1000 products):** < 10 seconds
- **Site Product Filtering:** < 500ms
- **ERP Sync (5000 products):** < 5 minutes
- **Catalog List Load:** < 200ms

---

## Security & Access Control

### Catalog-Level Permissions

```typescript
interface CatalogPermission {
  catalogId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canSync: boolean;
    canExport: boolean;
    canAssignToSites: boolean;
  };
}
```

### Access Rules

1. **Super Admins:** Full access to all catalogs
2. **Catalog Owners:** Full access to their catalogs
3. **Site Admins:** Can only assign catalogs to their sites (read-only on catalog products)
4. **ERP Credentials:** Stored encrypted, never exposed in API responses

---

## Deployment Checklist

### Pre-Deployment

- [ ] Review and approve architecture
- [ ] Estimate data migration effort
- [ ] Identify pilot clients for testing
- [ ] Create sample ERP integration (sandbox)
- [ ] Document vendor onboarding process

### Deployment

- [ ] Deploy database schema changes
- [ ] Run data migration scripts
- [ ] Deploy backend API updates
- [ ] Deploy admin UI updates
- [ ] Create default "Legacy Catalog" for existing products
- [ ] Assign all existing sites to Legacy Catalog

### Post-Deployment

- [ ] Monitor sync performance
- [ ] Train admins on catalog management
- [ ] Create vendor integration guides
- [ ] Set up alerts for sync failures
- [ ] Gather feedback from pilot clients

---

## Success Metrics

### Technical Metrics
- ✅ Support 10+ catalogs simultaneously
- ✅ Handle 50,000+ products across all catalogs
- ✅ Site filtering response time < 500ms
- ✅ ERP sync success rate > 99%
- ✅ Zero data conflicts between catalogs

### Business Metrics
- ✅ Reduce product management time by 70%
- ✅ Enable 5+ ERP/vendor integrations in Year 1
- ✅ Support clients with 10+ sites per catalog
- ✅ Automated sync reduces manual updates by 90%

---

## Risks & Mitigation

### High Risk

1. **ERP Integration Complexity**
   - *Risk:* Each ERP has different API format
   - *Mitigation:* Build adapter pattern, extensive vendor testing

2. **Data Conflicts During Sync**
   - *Risk:* Manual edits overwritten by sync
   - *Mitigation:* Conflict detection, manual review UI, sync modes

3. **Performance with Large Catalogs**
   - *Risk:* Slow filtering with 50K+ products
   - *Mitigation:* Caching, indexing, pagination

### Medium Risk

4. **SKU Collisions Between Catalogs**
   - *Risk:* Same SKU in multiple catalogs causes confusion
   - *Mitigation:* Catalog-scoped SKUs, clear labeling in UI

5. **Sync Failures**
   - *Risk:* Network issues, API changes, rate limits
   - *Mitigation:* Retry logic, error logging, admin alerts

---

## Next Steps

### Immediate Actions (This Week)
1. **Stakeholder Review** - Get approval on architecture
2. **Estimate Resources** - Assign developers (60-80 hours)
3. **Design Sprint** - Finalize UI mockups
4. **ERP Research** - Identify target ERPs for Phase 1 (SAP, Oracle, NetSuite)

### Week 1-2: Foundation
5. Implement Catalog entity and CRUD
6. Add catalogId to Gift schema
7. Create catalog-gift relationships
8. Build admin UI for catalog management

### Week 3-4: Integration
9. Implement sync engine (API, file, FTP)
10. Create first ERP adapter (pilot)
11. Build conflict resolution UI
12. Test with pilot client data

### Week 5: Rollout
13. Migrate existing data
14. Train admins on new features
15. Monitor and optimize
16. Document vendor integration process

---

## Appendix

### Sample Data Structures

#### Example Catalog (SAP ERP)
```json
{
  "id": "catalog_sap_prod_001",
  "name": "SAP Production ERP",
  "description": "Main product catalog from SAP system",
  "type": "erp",
  "source": {
    "type": "api",
    "sourceSystem": "SAP",
    "sourceId": "PRD-001",
    "apiConfig": {
      "endpoint": "https://api.sap.com/products",
      "authType": "oauth",
      "syncEndpoint": "https://api.sap.com/sync"
    }
  },
  "status": "active",
  "totalProducts": 847,
  "activeProducts": 823,
  "lastSyncedAt": "2026-02-11T14:30:00Z",
  "settings": {
    "autoSync": true,
    "syncFrequency": "daily",
    "defaultCurrency": "USD",
    "priceMarkup": 15,
    "allowSiteOverrides": true
  },
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-02-11T14:30:00Z"
}
```

#### Example Site Catalog Config
```json
{
  "siteId": "site_techcorp_us_001",
  "catalogId": "catalog_sap_prod_001",
  "exclusions": {
    "excludedCategories": ["Electronics", "Alcohol"],
    "excludedSkus": ["LAPTOP-500", "WINE-PREMIUM"],
    "excludedTags": ["luxury", "restricted"]
  },
  "overrides": {
    "allowPriceOverride": false,
    "priceAdjustment": 0
  },
  "availability": {
    "hideOutOfStock": true,
    "hideDiscontinued": true,
    "minimumInventory": 5
  }
}
```

---

**Document Status:** 🔵 PROPOSAL  
**Awaiting:** Stakeholder Approval  
**Contact:** Development Team  
**Last Updated:** February 11, 2026

---

**END OF PROPOSAL**
