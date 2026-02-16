# Multi-Catalog Architecture: Testing Scenarios 🧪

**Project:** wecelebrate Platform - Multi-Catalog System  
**Test Plan Date:** February 11, 2026  
**Test Coverage:** Phases 1-4 (Complete System)

---

## 📋 Testing Overview

This document provides comprehensive testing scenarios for the multi-catalog architecture, covering:
- **Unit Tests** - Individual function testing
- **Integration Tests** - Component and API integration
- **End-to-End Tests** - Complete user workflows
- **Edge Cases** - Boundary conditions and errors
- **Performance Tests** - Load and stress testing
- **Security Tests** - Authentication and authorization
- **User Acceptance Tests** - Real-world scenarios

---

## 🎯 Test Environment Setup

### Prerequisites
```bash
# Backend running
✓ Supabase server running
✓ KV store initialized
✓ Environment variables set

# Frontend running
✓ Development server started
✓ Admin user authenticated
✓ Test data available
```

### Test Data Requirements
```javascript
// Test Catalogs
- 1 ERP catalog (SAP)
- 1 Vendor catalog (ExternalVendor)
- 1 Manual catalog (Curated)
- 1 Dropship catalog (DirectShip)

// Test Sites
- 3 sites with different configurations
- 1 site with no catalog assigned
- 1 site with full exclusions configured

// Test Products
- 100+ products across catalogs
- Mix of statuses (active, discontinued, out of stock)
- Various price ranges
- Multiple categories, brands, tags
```

---

# Phase 1: Type Definitions Testing

## Test Suite 1.1: Type Validation

### TC-1.1.1: Catalog Type Structure
**Objective:** Verify Catalog type accepts valid data

**Test Data:**
```typescript
const validCatalog: Catalog = {
  id: 'cat-001',
  name: 'SAP Main Catalog',
  description: 'Primary ERP catalog',
  type: 'erp',
  status: 'active',
  source: {
    sourceSystem: 'SAP',
    sourceId: 'SAP-001',
    apiEndpoint: 'https://api.sap.example.com',
    authMethod: 'oauth',
    credentials: { token: 'encrypted-token' },
  },
  settings: {
    autoSync: true,
    syncFrequency: 'daily',
    syncTime: '02:00',
  },
  totalProducts: 1500,
  activeProducts: 1450,
  lastSyncedAt: '2026-02-11T02:00:00Z',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-02-11T02:00:00Z',
  createdBy: 'admin-001',
};
```

**Expected Result:** ✅ No type errors

**Test Steps:**
1. Create catalog object with all required fields
2. Verify TypeScript compilation passes
3. Verify all optional fields accepted
4. Verify type constraints (e.g., status enum)

---

### TC-1.1.2: SiteCatalogConfig Type Structure
**Objective:** Verify SiteCatalogConfig type structure

**Test Data:**
```typescript
const validConfig: SiteCatalogConfig = {
  id: 'config-001',
  siteId: 'site-001',
  catalogId: 'cat-001',
  exclusions: {
    excludedCategories: ['Electronics', 'Jewelry'],
    excludedSkus: ['SKU-001', 'SKU-002'],
    excludedTags: ['seasonal'],
    excludedBrands: ['BrandX'],
  },
  overrides: {
    allowPriceOverride: true,
    priceAdjustment: 15,
    customPricing: { 'SKU-001': 99.99 },
  },
  availability: {
    hideOutOfStock: true,
    hideDiscontinued: true,
    minimumInventory: 5,
    maximumPrice: 500,
    minimumPrice: 10,
    onlyShowFeatured: false,
  },
  effectiveFrom: '2026-02-01T00:00:00Z',
  createdAt: '2026-02-01T00:00:00Z',
  updatedAt: '2026-02-11T00:00:00Z',
  createdBy: 'admin-001',
  updatedBy: 'admin-001',
};
```

**Expected Result:** ✅ No type errors

---

### TC-1.1.3: Invalid Type Detection
**Objective:** Verify TypeScript catches invalid data

**Test Cases:**
```typescript
// ❌ Should fail - invalid status
const invalidCatalog1: Catalog = {
  status: 'invalid-status', // Error: not in CatalogStatus enum
  // ... other fields
};

// ❌ Should fail - invalid type
const invalidCatalog2: Catalog = {
  type: 'unknown', // Error: not in CatalogType enum
  // ... other fields
};

// ❌ Should fail - missing required field
const invalidCatalog3: Catalog = {
  name: 'Test',
  // Missing other required fields
};
```

**Expected Result:** ✅ TypeScript compilation errors

---

# Phase 2: Backend API Testing

## Test Suite 2.1: Catalog CRUD Operations

### TC-2.1.1: Create Catalog (POST /catalogs)
**Objective:** Successfully create a new catalog

**Prerequisites:**
- Admin authenticated
- Valid request body

**Request:**
```http
POST /make-server-6fcaeea3/catalogs
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
Content-Type: application/json

{
  "name": "Test SAP Catalog",
  "description": "Test catalog for SAP integration",
  "type": "erp",
  "status": "active",
  "source": {
    "sourceSystem": "SAP",
    "sourceId": "SAP-TEST-001",
    "apiEndpoint": "https://api.sap.test.com",
    "authMethod": "oauth"
  },
  "settings": {
    "autoSync": true,
    "syncFrequency": "daily",
    "syncTime": "02:00"
  }
}
```

**Expected Response:**
```json
{
  "catalog": {
    "id": "cat-[generated-id]",
    "name": "Test SAP Catalog",
    "type": "erp",
    "status": "active",
    "totalProducts": 0,
    "activeProducts": 0,
    "createdAt": "[timestamp]",
    "updatedAt": "[timestamp]"
  }
}
```

**Status Code:** 201 Created

**Validation:**
- ✓ Catalog ID generated
- ✓ All fields saved correctly
- ✓ Timestamps populated
- ✓ Total products initialized to 0
- ✓ Catalog stored in KV store

---

### TC-2.1.2: Get Catalog by ID (GET /catalogs/:id)
**Objective:** Retrieve specific catalog

**Request:**
```http
GET /make-server-6fcaeea3/catalogs/cat-001
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
```

**Expected Response:**
```json
{
  "catalog": {
    "id": "cat-001",
    "name": "SAP Main Catalog",
    "description": "Primary ERP catalog",
    "type": "erp",
    "status": "active",
    // ... all catalog fields
  }
}
```

**Status Code:** 200 OK

**Validation:**
- ✓ Returns correct catalog
- ✓ All fields present
- ✓ Timestamps valid
- ✓ Source credentials NOT exposed

---

### TC-2.1.3: List All Catalogs (GET /catalogs)
**Objective:** Retrieve list of catalogs with filters

**Test Cases:**

**Case A: No filters**
```http
GET /make-server-6fcaeea3/catalogs
```
Expected: All catalogs returned

**Case B: Filter by status**
```http
GET /make-server-6fcaeea3/catalogs?status=active
```
Expected: Only active catalogs

**Case C: Filter by type**
```http
GET /make-server-6fcaeea3/catalogs?type=erp
```
Expected: Only ERP catalogs

**Case D: Multiple filters**
```http
GET /make-server-6fcaeea3/catalogs?status=active&type=vendor
```
Expected: Active vendor catalogs only

**Case E: Search by name**
```http
GET /make-server-6fcaeea3/catalogs?search=SAP
```
Expected: Catalogs with "SAP" in name

**Validation:**
- ✓ Correct catalogs returned
- ✓ Filters work correctly
- ✓ Search is case-insensitive
- ✓ Empty array if no matches

---

### TC-2.1.4: Update Catalog (PUT /catalogs/:id)
**Objective:** Update existing catalog

**Request:**
```http
PUT /make-server-6fcaeea3/catalogs/cat-001
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
Content-Type: application/json

{
  "name": "Updated SAP Catalog",
  "description": "Updated description",
  "settings": {
    "autoSync": false,
    "syncFrequency": "weekly"
  }
}
```

**Expected Response:**
```json
{
  "catalog": {
    "id": "cat-001",
    "name": "Updated SAP Catalog",
    "description": "Updated description",
    "updatedAt": "[new-timestamp]",
    // ... other fields unchanged
  }
}
```

**Status Code:** 200 OK

**Validation:**
- ✓ Updated fields changed
- ✓ Unchanged fields preserved
- ✓ updatedAt timestamp updated
- ✓ createdAt unchanged
- ✓ Audit trail logged

---

### TC-2.1.5: Delete Catalog (DELETE /catalogs/:id)
**Objective:** Soft delete catalog

**Request:**
```http
DELETE /make-server-6fcaeea3/catalogs/cat-001
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Catalog deleted successfully"
}
```

**Status Code:** 200 OK

**Validation:**
- ✓ Catalog status set to 'inactive'
- ✓ Catalog not physically deleted
- ✓ Can still retrieve catalog
- ✓ Appears in deleted list

---

### TC-2.1.6: Get Catalog Statistics (GET /catalogs/:id/stats)
**Objective:** Retrieve catalog statistics

**Request:**
```http
GET /make-server-6fcaeea3/catalogs/cat-001/stats
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
```

**Expected Response:**
```json
{
  "stats": {
    "catalogId": "cat-001",
    "totalProducts": 1500,
    "activeProducts": 1450,
    "inactiveProducts": 50,
    "categoriesCount": 25,
    "brandsCount": 50,
    "averagePrice": 125.50,
    "priceRange": {
      "min": 5.00,
      "max": 999.99
    },
    "lastSyncedAt": "2026-02-11T02:00:00Z",
    "syncStatus": "success"
  }
}
```

**Status Code:** 200 OK

---

## Test Suite 2.2: Site Catalog Configuration

### TC-2.2.1: Create Site Catalog Config (POST /sites/:siteId/catalog-config)
**Objective:** Assign catalog to site

**Request:**
```http
POST /make-server-6fcaeea3/sites/site-001/catalog-config
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
Content-Type: application/json

{
  "catalogId": "cat-001",
  "exclusions": {
    "excludedCategories": ["Electronics"],
    "excludedSkus": ["SKU-001", "SKU-002"],
    "excludedTags": ["seasonal"],
    "excludedBrands": ["BrandX"]
  },
  "overrides": {
    "allowPriceOverride": true,
    "priceAdjustment": 15
  },
  "availability": {
    "hideOutOfStock": true,
    "hideDiscontinued": true,
    "minimumInventory": 5
  }
}
```

**Expected Response:**
```json
{
  "config": {
    "id": "config-[generated-id]",
    "siteId": "site-001",
    "catalogId": "cat-001",
    "exclusions": { /* as sent */ },
    "overrides": { /* as sent */ },
    "availability": { /* as sent */ },
    "createdAt": "[timestamp]",
    "updatedAt": "[timestamp]"
  }
}
```

**Status Code:** 201 Created

**Validation:**
- ✓ Config created successfully
- ✓ Site-catalog relationship established
- ✓ All settings saved correctly
- ✓ Can retrieve config immediately

---

### TC-2.2.2: Get Site Catalog Config (GET /sites/:siteId/catalog-config)
**Objective:** Retrieve site's catalog configuration

**Request:**
```http
GET /make-server-6fcaeea3/sites/site-001/catalog-config
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
```

**Expected Response:**
```json
{
  "config": {
    "id": "config-001",
    "siteId": "site-001",
    "catalogId": "cat-001",
    "exclusions": { /* ... */ },
    "overrides": { /* ... */ },
    "availability": { /* ... */ }
  }
}
```

**Status Code:** 200 OK

---

### TC-2.2.3: Update Site Catalog Config (PUT /sites/:siteId/catalog-config)
**Objective:** Update site configuration

**Request:**
```http
PUT /make-server-6fcaeea3/sites/site-001/catalog-config
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
Content-Type: application/json

{
  "exclusions": {
    "excludedCategories": ["Electronics", "Jewelry"]
  }
}
```

**Expected Response:**
```json
{
  "config": {
    "id": "config-001",
    "siteId": "site-001",
    "exclusions": {
      "excludedCategories": ["Electronics", "Jewelry"],
      "excludedSkus": ["SKU-001", "SKU-002"], // preserved
      "excludedTags": ["seasonal"], // preserved
      "excludedBrands": ["BrandX"] // preserved
    },
    "updatedAt": "[new-timestamp]"
  }
}
```

**Status Code:** 200 OK

**Validation:**
- ✓ Updated fields changed
- ✓ Unchanged fields preserved
- ✓ Timestamp updated

---

### TC-2.2.4: Add Exclusions (POST /sites/:siteId/catalog-config/exclusions)
**Objective:** Add exclusions incrementally

**Request:**
```http
POST /make-server-6fcaeea3/sites/site-001/catalog-config/exclusions
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
Content-Type: application/json

{
  "excludedCategories": ["NewCategory"],
  "excludedSkus": ["SKU-999"]
}
```

**Expected Response:**
```json
{
  "config": {
    "exclusions": {
      "excludedCategories": ["Electronics", "Jewelry", "NewCategory"],
      "excludedSkus": ["SKU-001", "SKU-002", "SKU-999"]
    }
  }
}
```

**Status Code:** 200 OK

**Validation:**
- ✓ New exclusions added
- ✓ Existing exclusions preserved
- ✓ No duplicates created

---

### TC-2.2.5: Remove Exclusions (DELETE /sites/:siteId/catalog-config/exclusions)
**Objective:** Remove specific exclusions

**Request:**
```http
DELETE /make-server-6fcaeea3/sites/site-001/catalog-config/exclusions
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
Content-Type: application/json

{
  "excludedCategories": ["Electronics"],
  "excludedSkus": ["SKU-001"]
}
```

**Expected Response:**
```json
{
  "config": {
    "exclusions": {
      "excludedCategories": ["Jewelry", "NewCategory"],
      "excludedSkus": ["SKU-002", "SKU-999"]
    }
  }
}
```

**Status Code:** 200 OK

**Validation:**
- ✓ Specified exclusions removed
- ✓ Other exclusions preserved

---

### TC-2.2.6: Set Price Override (PUT /sites/:siteId/catalog-config/price/:sku)
**Objective:** Set custom price for specific SKU

**Request:**
```http
PUT /make-server-6fcaeea3/sites/site-001/catalog-config/price/SKU-001
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
Content-Type: application/json

{
  "price": 149.99
}
```

**Expected Response:**
```json
{
  "config": {
    "overrides": {
      "customPricing": {
        "SKU-001": 149.99
      }
    }
  }
}
```

**Status Code:** 200 OK

---

## Test Suite 2.3: Migration System

### TC-2.3.1: Get Migration Status (GET /migration/status)
**Objective:** Check migration status

**Request:**
```http
GET /make-server-6fcaeea3/migration/status
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
```

**Expected Response (Before Migration):**
```json
{
  "migrated": false,
  "statistics": {
    "totalCatalogs": 4,
    "totalProducts": 1500,
    "productsNeedingMigration": 1500,
    "sitesNeedingConfig": 15
  }
}
```

**Expected Response (After Migration):**
```json
{
  "migrated": true,
  "statistics": {
    "totalCatalogs": 4,
    "totalProducts": 1500,
    "productsNeedingMigration": 0,
    "sitesNeedingConfig": 2
  },
  "migratedAt": "2026-02-11T10:00:00Z",
  "migratedBy": "admin-001"
}
```

**Status Code:** 200 OK

---

### TC-2.3.2: Run Migration (POST /migration/run)
**Objective:** Execute migration process

**Request:**
```http
POST /make-server-6fcaeea3/migration/run
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
Content-Type: application/json

{
  "defaultCatalogId": "cat-001",
  "dryRun": false
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Migration completed successfully",
  "results": {
    "productsProcessed": 1500,
    "productsMigrated": 1500,
    "productsSkipped": 0,
    "errors": []
  },
  "duration": 5234
}
```

**Status Code:** 200 OK

**Validation:**
- ✓ All products processed
- ✓ Product sources added
- ✓ Default catalog assigned
- ✓ No data loss
- ✓ Migration flag set

---

### TC-2.3.3: Dry Run Migration (POST /migration/run with dryRun: true)
**Objective:** Test migration without changes

**Request:**
```http
POST /make-server-6fcaeea3/migration/run
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
Content-Type: application/json

{
  "defaultCatalogId": "cat-001",
  "dryRun": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Dry run completed",
  "results": {
    "productsProcessed": 1500,
    "productsWouldBeMigrated": 1500,
    "productsWouldBeSkipped": 0
  }
}
```

**Status Code:** 200 OK

**Validation:**
- ✓ No actual changes made
- ✓ Accurate prediction
- ✓ Can run multiple times

---

### TC-2.3.4: Rollback Migration (POST /migration/rollback)
**Objective:** Undo migration (development only)

**Request:**
```http
POST /make-server-6fcaeea3/migration/rollback
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
```

**Expected Response (Development):**
```json
{
  "success": true,
  "message": "Migration rolled back successfully",
  "results": {
    "productsProcessed": 1500,
    "sourcesRemoved": 1500
  }
}
```

**Expected Response (Production):**
```json
{
  "error": "Rollback not allowed in production"
}
```

**Status Code:** 200 OK (dev) / 403 Forbidden (prod)

**Validation:**
- ✓ Dev: Product sources removed
- ✓ Dev: Migration flag cleared
- ✓ Prod: Rollback blocked
- ✓ Prod: Security enforced

---

## Test Suite 2.4: Error Handling

### TC-2.4.1: Unauthorized Access
**Objective:** Verify authentication required

**Request:**
```http
GET /make-server-6fcaeea3/catalogs
Authorization: Bearer ${publicAnonKey}
// No X-Access-Token header
```

**Expected Response:**
```json
{
  "error": "Unauthorized: Invalid or missing access token"
}
```

**Status Code:** 401 Unauthorized

---

### TC-2.4.2: Invalid Catalog ID
**Objective:** Handle non-existent catalog

**Request:**
```http
GET /make-server-6fcaeea3/catalogs/invalid-id
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
```

**Expected Response:**
```json
{
  "error": "Catalog not found"
}
```

**Status Code:** 404 Not Found

---

### TC-2.4.3: Invalid Request Body
**Objective:** Validate request data

**Request:**
```http
POST /make-server-6fcaeea3/catalogs
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
Content-Type: application/json

{
  "name": "", // Empty name
  "type": "invalid-type" // Invalid type
}
```

**Expected Response:**
```json
{
  "error": "Validation error",
  "details": [
    "Name is required",
    "Type must be one of: erp, vendor, manual, dropship"
  ]
}
```

**Status Code:** 400 Bad Request

---

### TC-2.4.4: Duplicate Catalog Creation
**Objective:** Prevent duplicate catalogs

**Request:**
```http
POST /make-server-6fcaeea3/catalogs
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
Content-Type: application/json

{
  "name": "SAP Main Catalog", // Name already exists
  "type": "erp"
}
```

**Expected Response:**
```json
{
  "error": "Catalog with this name already exists"
}
```

**Status Code:** 409 Conflict

---

### TC-2.4.5: Site Without Catalog Config
**Objective:** Handle missing configuration

**Request:**
```http
GET /make-server-6fcaeea3/sites/site-999/catalog-config
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
```

**Expected Response:**
```json
{
  "error": "No catalog configuration found for this site"
}
```

**Status Code:** 404 Not Found

---

### TC-2.4.6: Migration Already Run
**Objective:** Prevent double migration

**Request:**
```http
POST /make-server-6fcaeea3/migration/run
Authorization: Bearer ${publicAnonKey}
X-Access-Token: ${adminToken}
```

**Expected Response:**
```json
{
  "error": "Migration has already been run",
  "migratedAt": "2026-02-11T10:00:00Z"
}
```

**Status Code:** 409 Conflict

---

# Phase 3: Frontend Catalog Management UI Testing

## Test Suite 3.1: Catalog Management Page

### TC-3.1.1: Load Catalog List
**Objective:** Display all catalogs

**Steps:**
1. Navigate to `/admin/catalogs`
2. Wait for page load

**Expected Result:**
- ✓ Loading spinner appears initially
- ✓ Catalogs displayed in card layout
- ✓ Each card shows:
  - Catalog name
  - Description
  - Type badge
  - Status badge
  - Product count
  - Last synced time
  - Action buttons (View, Edit, Delete)
- ✓ Search bar visible
- ✓ Filter dropdowns visible
- ✓ "Create Catalog" button visible

**Test Data:** Minimum 4 catalogs of different types

---

### TC-3.1.2: Search Catalogs
**Objective:** Filter catalogs by search term

**Steps:**
1. Navigate to `/admin/catalogs`
2. Enter "SAP" in search box
3. Observe results

**Expected Result:**
- ✓ Only catalogs with "SAP" in name shown
- ✓ Search is case-insensitive
- ✓ Results update in real-time
- ✓ Clear search shows all catalogs

**Test Cases:**
- Search: "SAP" → Shows SAP catalogs
- Search: "vendor" → Shows vendor catalogs
- Search: "xyz123" → Shows "No catalogs found" message
- Clear search → Shows all catalogs

---

### TC-3.1.3: Filter by Status
**Objective:** Filter catalogs by status

**Steps:**
1. Navigate to `/admin/catalogs`
2. Select "Active" from status dropdown
3. Observe results

**Expected Result:**
- ✓ Only active catalogs shown
- ✓ Inactive catalogs hidden
- ✓ Filter persists on page refresh

**Test Cases:**
- Filter: Active → Only active catalogs
- Filter: Inactive → Only inactive catalogs
- Filter: All → All catalogs

---

### TC-3.1.4: Filter by Type
**Objective:** Filter catalogs by type

**Steps:**
1. Navigate to `/admin/catalogs`
2. Select "ERP" from type dropdown
3. Observe results

**Expected Result:**
- ✓ Only ERP catalogs shown
- ✓ Other types hidden

**Test Cases:**
- Filter: ERP → Only ERP catalogs
- Filter: Vendor → Only vendor catalogs
- Filter: Manual → Only manual catalogs
- Filter: Dropship → Only dropship catalogs
- Filter: All → All catalogs

---

### TC-3.1.5: Combined Filters
**Objective:** Apply multiple filters simultaneously

**Steps:**
1. Navigate to `/admin/catalogs`
2. Enter "SAP" in search
3. Select "Active" status
4. Select "ERP" type

**Expected Result:**
- ✓ Shows only active ERP catalogs with "SAP" in name
- ✓ All filters work together
- ✓ Removing one filter updates results

---

### TC-3.1.6: View Catalog Details
**Objective:** Navigate to catalog details

**Steps:**
1. Navigate to `/admin/catalogs`
2. Click "View" button on a catalog

**Expected Result:**
- ✓ Navigates to `/admin/catalogs/[catalogId]`
- ✓ Shows detailed catalog information
- ✓ All fields visible

---

### TC-3.1.7: Delete Catalog
**Objective:** Soft delete a catalog

**Steps:**
1. Navigate to `/admin/catalogs`
2. Click "Delete" button on a catalog
3. Confirm deletion in dialog

**Expected Result:**
- ✓ Confirmation dialog appears
- ✓ Dialog shows catalog name
- ✓ After confirmation:
  - Success message appears
  - Catalog status changes to "Inactive"
  - Catalog moves to inactive list
- ✓ Catalog still in database (soft delete)

---

### TC-3.1.8: Empty State
**Objective:** Display empty state when no catalogs

**Steps:**
1. Navigate to `/admin/catalogs`
2. Apply filters that return no results

**Expected Result:**
- ✓ "No catalogs found" message displayed
- ✓ Helpful text shown
- ✓ "Create Catalog" button visible
- ✓ Clear filters option shown

---

## Test Suite 3.2: Catalog Create/Edit Page

### TC-3.2.1: Create New Catalog - Success Flow
**Objective:** Create catalog successfully

**Steps:**
1. Navigate to `/admin/catalogs`
2. Click "Create Catalog" button
3. Fill in form:
   - Name: "Test ERP Catalog"
   - Description: "Test description"
   - Type: ERP
   - Status: Active
4. Fill in source configuration:
   - Source System: "SAP"
   - Source ID: "SAP-TEST"
   - API Endpoint: "https://api.test.com"
   - Auth Method: "OAuth"
5. Configure settings:
   - Enable auto-sync
   - Frequency: Daily
   - Sync time: 02:00
6. Click "Create Catalog"

**Expected Result:**
- ✓ Form validates successfully
- ✓ API call made
- ✓ Success message appears
- ✓ Redirected to catalog list
- ✓ New catalog visible in list
- ✓ All data saved correctly

---

### TC-3.2.2: Create Catalog - Validation Errors
**Objective:** Validate required fields

**Steps:**
1. Navigate to `/admin/catalogs/create`
2. Click "Create Catalog" without filling form

**Expected Result:**
- ✓ Error messages appear for required fields:
  - "Name is required"
  - "Type is required"
  - "Source system is required"
- ✓ Form not submitted
- ✓ Error messages in red

**Test Cases:**
- Empty name → Error
- Empty type → Error
- Empty source system → Error
- Invalid URL format → Error
- Negative sync frequency → Error

---

### TC-3.2.3: Edit Existing Catalog
**Objective:** Update catalog successfully

**Steps:**
1. Navigate to `/admin/catalogs/cat-001`
2. Update name: "Updated Catalog Name"
3. Update description: "Updated description"
4. Click "Save Changes"

**Expected Result:**
- ✓ Form pre-populated with existing data
- ✓ Changes saved successfully
- ✓ Success message appears
- ✓ Updated data visible immediately
- ✓ updatedAt timestamp updated

---

### TC-3.2.4: Edit Catalog - Cancel Changes
**Objective:** Discard unsaved changes

**Steps:**
1. Navigate to `/admin/catalogs/cat-001`
2. Make some changes
3. Click "Cancel" button

**Expected Result:**
- ✓ Confirmation dialog appears
- ✓ After confirmation:
  - Redirected to catalog list
  - Changes not saved
  - Original data preserved

---

### TC-3.2.5: Source Configuration Types
**Objective:** Different auth methods work correctly

**Test Cases:**

**Case A: OAuth Authentication**
- Select "OAuth"
- Token field appears
- Can enter encrypted token
- Saves correctly

**Case B: API Key Authentication**
- Select "API Key"
- API key field appears
- Can enter key
- Saves correctly

**Case C: Basic Authentication**
- Select "Basic"
- Username and password fields appear
- Can enter credentials
- Saves correctly (encrypted)

---

### TC-3.2.6: Auto-Sync Configuration
**Objective:** Sync settings work correctly

**Steps:**
1. Enable auto-sync checkbox
2. Select frequency: "Daily"
3. Set time: "02:00"

**Expected Result:**
- ✓ Sync options appear when enabled
- ✓ Sync options hidden when disabled
- ✓ Time picker shows 24-hour format
- ✓ Settings saved correctly

---

### TC-3.2.7: Pricing Configuration
**Objective:** Pricing rules configured correctly

**Steps:**
1. Navigate to pricing section
2. Configure:
   - Default markup: 15%
   - Markup type: Percentage
   - Round prices: Yes
   - Round to: $0.99
3. Save

**Expected Result:**
-✓ All pricing fields saved
- ✓ Markup calculated correctly in preview
- ✓ Rounding rules applied

---

## Test Suite 3.3: Catalog Migration Page

### TC-3.3.1: View Migration Status - Before Migration
**Objective:** Display current migration status

**Steps:**
1. Navigate to `/admin/catalogs/migrate`
2. Observe status dashboard

**Expected Result:**
- ✓ "Migration Status: Not Started" badge
- ✓ Statistics shown:
  - Total catalogs: 4
  - Total products: 1500
  - Products needing migration: 1500
  - Sites needing config: 15
- ✓ "Run Migration" button enabled
- ✓ "What is migration?" section visible
- ✓ Warning messages shown

---

### TC-3.3.2: View Migration Status - After Migration
**Objective:** Display completed migration status

**Steps:**
1. Navigate to `/admin/catalogs/migrate`
2. Observe status dashboard (after migration completed)

**Expected Result:**
- ✓ "Migration Status: Completed" badge (green)
- ✓ Updated statistics:
  - Products needing migration: 0
  - Sites needing config: 2 (sites created after)
- ✓ Migration timestamp shown
- ✓ Migrated by user shown
- ✓ "Run Migration" button disabled
- ✓ Success message displayed

---

### TC-3.3.3: Run Migration - Success
**Objective:** Execute migration successfully

**Steps:**
1. Navigate to `/admin/catalogs/migrate`
2. Select default catalog from dropdown
3. Click "Run Migration"
4. Confirm in dialog
5. Wait for completion

**Expected Result:**
- ✓ Confirmation dialog appears
- ✓ Dialog shows:
  - Number of products to migrate
  - Selected default catalog
  - Warning about production
- ✓ After confirmation:
  - Loading indicator appears
  - Progress shown (if available)
  - Success message on completion
- ✓ Statistics update automatically
- ✓ Status changes to "Completed"

---

### TC-3.3.4: Run Migration - Validation
**Objective:** Prevent invalid migration

**Steps:**
1. Navigate to `/admin/catalogs/migrate`
2. Click "Run Migration" without selecting catalog

**Expected Result:**
- ✓ Error message: "Please select a default catalog"
- ✓ Dialog doesn't open
- ✓ Migration doesn't start

---

### TC-3.3.5: Dry Run Migration
**Objective:** Test migration without changes

**Steps:**
1. Navigate to `/admin/catalogs/migrate`
2. Check "Dry Run" checkbox
3. Select default catalog
4. Click "Run Migration"
5. Confirm

**Expected Result:**
- ✓ Dry run executes
- ✓ Results shown:
  - Products that would be migrated
  - Products that would be skipped
  - Estimated duration
- ✓ No actual changes made
- ✓ Can run multiple times
- ✓ Status remains "Not Started"

---

### TC-3.3.6: Rollback Migration (Development)
**Objective:** Undo migration in dev environment

**Prerequisites:**
- Migration already completed
- Development environment

**Steps:**
1. Navigate to `/admin/catalogs/migrate`
2. Click "Rollback Migration" button
3. Confirm action (with warnings)
4. Wait for completion

**Expected Result:**
- ✓ Rollback button visible (dev only)
- ✓ Warning dialog appears
- ✓ After confirmation:
  - Migration undone
  - Product sources removed
  - Status changes to "Not Started"
  - Statistics reset
- ✓ Success message shown

---

### TC-3.3.7: Rollback Blocked (Production)
**Objective:** Prevent rollback in production

**Prerequisites:**
- Production environment

**Steps:**
1. Navigate to `/admin/catalogs/migrate`
2. Look for "Rollback Migration" button

**Expected Result:**
- ✓ Rollback button NOT visible
- ✓ Or button disabled with tooltip
- ✓ If somehow attempted:
  - Error message: "Rollback not allowed in production"
  - API returns 403 Forbidden

---

### TC-3.3.8: Migration Error Handling
**Objective:** Handle migration errors gracefully

**Test Cases:**

**Case A: Network Error**
- Simulate network failure
- Error message displayed
- Retry option available
- Status unchanged

**Case B: Partial Failure**
- Some products fail
- Error details shown
- Successful count displayed
- Can continue or rollback

**Case C: Server Error**
- Backend returns 500
- User-friendly error message
- Technical details logged
- Support contact information

---

# Phase 4: Site Catalog Configuration Testing

## Test Suite 4.1: Site Catalog Configuration Page

### TC-4.1.1: Load Configuration - No Catalog Assigned
**Objective:** Handle site without catalog

**Steps:**
1. Select site without catalog
2. Navigate to `/admin/site-catalog-configuration`

**Expected Result:**
- ✓ Page loads successfully
- ✓ Catalog dropdown shows "-- Select a Catalog --"
- ✓ Configuration sections hidden
- ✓ Only catalog selection visible
- ✓ Save button disabled

---

### TC-4.1.2: Load Configuration - Existing Config
**Objective:** Load existing configuration

**Prerequisites:**
- Site has catalog assigned
- Exclusions configured

**Steps:**
1. Select configured site
2. Navigate to `/admin/site-catalog-configuration`

**Expected Result:**
- ✓ Catalog pre-selected in dropdown
- ✓ Catalog info box displayed
- ✓ All sections visible
- ✓ Excluded categories loaded as pills
- ✓ Excluded SKUs loaded as pills
- ✓ Excluded tags loaded as pills
- ✓ Excluded brands loaded as pills
- ✓ Price override settings loaded
- ✓ Availability rules loaded
- ✓ All checkboxes reflect saved state

---

### TC-4.1.3: Select Catalog
**Objective:** Assign catalog to site

**Steps:**
1. Navigate to configuration page
2. Select catalog from dropdown
3. Observe changes

**Expected Result:**
- ✓ Info box appears with catalog details
- ✓ Configuration sections appear
- ✓ All sections expandable
- ✓ Save button enabled

---

### TC-4.1.4: Add Category Exclusion
**Objective:** Exclude product category

**Steps:**
1. Scroll to "Product Exclusions" section
2. Type "Electronics" in category input
3. Press Enter (or click Add)

**Expected Result:**
- ✓ "Electronics" appears as pill/tag
- ✓ Input field clears
- ✓ Can add multiple categories
- ✓ Duplicate prevention works
- ✓ Pills have X button to remove

**Test Cases:**
- Add "Electronics" → Pill appears
- Try add "Electronics" again → Ignored (duplicate)
- Add "Jewelry" → Second pill appears
- Press Enter → Adds category
- Click Add button → Adds category

---

### TC-4.1.5: Remove Category Exclusion
**Objective:** Remove excluded category

**Steps:**
1. Click X button on "Electronics" pill

**Expected Result:**
- ✓ Pill removed immediately
- ✓ Other pills unchanged
- ✓ No confirmation needed

---

### TC-4.1.6: Add SKU Exclusion
**Objective:** Exclude specific SKUs

**Steps:**
1. Type "SKU-12345" in SKU input
2. Press Enter

**Expected Result:**
- ✓ SKU appears as pill with monospace font
- ✓ Input clears
- ✓ Can add multiple SKUs
- ✓ SKUs displayed differently than categories

---

### TC-4.1.7: Add Tag Exclusion
**Objective:** Exclude by tag

**Steps:**
1. Type "seasonal" in tag input
2. Press Enter

**Expected Result:**
- ✓ Tag appears with tag icon
- ✓ Input clears
- ✓ Can add multiple tags

---

### TC-4.1.8: Add Brand Exclusion
**Objective:** Exclude by brand

**Steps:**
1. Type "BrandX" in brand input
2. Press Enter

**Expected Result:**
- ✓ Brand appears as pill
- ✓ Input clears
- ✓ Can add multiple brands

---

### TC-4.1.9: Configure Price Override
**Objective:** Set price adjustment

**Steps:**
1. Check "Allow price overrides" checkbox
2. Enter "15" in adjustment field
3. Observe changes

**Expected Result:**
- ✓ Adjustment field appears when enabled
- ✓ Accepts positive and negative numbers
- ✓ Range validation: -100 to +100
- ✓ Help text visible
- ✓ Field hidden when checkbox unchecked

**Test Cases:**
- 15 → 15% increase
- -10 → 10% decrease
- 0 → No adjustment
- 101 → Validation error
- -101 → Validation error

---

### TC-4.1.10: Configure Availability Rules
**Objective:** Set visibility rules

**Steps:**
1. Check "Hide out of stock products"
2. Check "Hide discontinued products"
3. Enter "5" for minimum inventory
4. Enter "10" for minimum price
5. Enter "500" for maximum price
6. Check "Only show featured products"

**Expected Result:**
- ✓ All checkboxes toggle correctly
- ✓ Numeric inputs accept valid numbers
- ✓ Min price < Max price validation
- ✓ Inventory >= 0 validation
- ✓ Help text visible for each field

---

### TC-4.1.11: Save Configuration
**Objective:** Persist all settings

**Steps:**
1. Configure all settings
2. Click "Save Configuration"
3. Wait for completion

**Expected Result:**
- ✓ Saving indicator appears
- ✓ Button disabled during save
- ✓ Button text changes to "Saving..."
- ✓ Success message appears
- ✓ Page reloads data
- ✓ All settings persist correctly

---

### TC-4.1.12: Reset Configuration
**Objective:** Discard unsaved changes

**Steps:**
1. Make several changes
2. Click "Reset" button

**Expected Result:**
- ✓ All fields reset to saved values
- ✓ Unsaved changes discarded
- ✓ No confirmation dialog needed
- ✓ Success message appears

---

### TC-4.1.13: No Site Selected Warning
**Objective:** Handle missing site selection

**Steps:**
1. Deselect site (or navigate without site)
2. Navigate to `/admin/site-catalog-configuration`

**Expected Result:**
- ✓ Warning message displayed
- ✓ Yellow background with alert icon
- ✓ Message: "No Site Selected"
- ✓ Instructions to select site
- ✓ Form not displayed

---

### TC-4.1.14: Switch Sites
**Objective:** Handle site switching

**Steps:**
1. Configure site-001
2. Switch to site-002 (different config)
3. Observe changes

**Expected Result:**
- ✓ Page reloads with new site data
- ✓ Different catalog may be selected
- ✓ Different exclusions shown
- ✓ Previous site data saved
- ✓ No data cross-contamination

---

### TC-4.1.15: Catalog Info Box
**Objective:** Display catalog details

**Steps:**
1. Select catalog from dropdown
2. Observe info box

**Expected Result:**
- ✓ Blue info box appears
- ✓ Displays:
  - Catalog name
  - Description
  - Type (ERP/Vendor/Manual/Dropship)
  - Source system
  - Active products count
  - Total products count
- ✓ Info icon visible
- ✓ Proper formatting

---

# End-to-End User Workflows

## Test Suite 5.1: Complete Catalog Setup Flow

### TC-5.1.1: New System Setup (End-to-End)
**Objective:** Complete setup from scratch

**Scenario:** Admin setting up wecelebrate for first time

**Steps:**
1. **Create Catalogs**
   - Navigate to Catalog Management
   - Create "Primary ERP Catalog" (SAP)
   - Create "Secondary Vendor Catalog"
   - Create "Premium Manual Catalog"
   - Verify all created successfully

2. **Run Migration**
   - Navigate to Migration tool
   - Select "Primary ERP Catalog" as default
   - Run migration
   - Verify completion
   - Verify all products migrated

3. **Configure First Site**
   - Select "Enterprise Client Site"
   - Navigate to Site Catalog Configuration
   - Assign "Primary ERP Catalog"
   - Exclude categories: ["Budget Items", "Discontinued"]
   - Set 20% price markup
   - Hide out of stock products
   - Save configuration

4. **Configure Second Site**
   - Select "SMB Client Site"
   - Navigate to Site Catalog Configuration
   - Assign "Secondary Vendor Catalog"
   - Exclude brands: ["Premium Brand"]
   - Set 10% price markdown
   - Only show featured products
   - Save configuration

5. **Verify Setup**
   - Check all sites have catalogs
   - Verify products visible correctly
   - Check prices adjusted per site
   - Confirm exclusions working

**Expected Result:**
- ✓ Complete system operational
- ✓ All catalogs configured
- ✓ All sites configured
- ✓ Products displayed correctly
- ✓ Pricing accurate
- ✓ Exclusions working

**Duration:** ~15-20 minutes

---

### TC-5.1.2: Add New ERP Integration
**Objective:** Integrate new ERP system

**Scenario:** Client wants to add Oracle ERP

**Steps:**
1. **Create Oracle Catalog**
   - Navigate to Catalog Management
   - Click "Create Catalog"
   - Enter:
     - Name: "Oracle Production Catalog"
     - Type: ERP
     - Source: Oracle
     - API endpoint: oracle-api-url
     - Credentials: oracle-creds
   - Configure auto-sync (daily at 03:00)
   - Save catalog

2. **Initial Sync** (Manual test)
   - Trigger sync via API or backend
   - Wait for completion
   - Verify products imported
   - Check product count

3. **Assign to Sites**
   - Select sites that need Oracle products
   - Assign Oracle catalog
   - Configure exclusions per site
   - Save configurations

4. **Verify Integration**
   - Check products visible on sites
   - Verify sync working automatically
   - Test product updates sync
   - Confirm pricing correct

**Expected Result:**
- ✓ Oracle catalog operational
- ✓ Products syncing automatically
- ✓ Sites display Oracle products
- ✓ Updates propagate correctly

---

### TC-5.1.3: Seasonal Catalog Changeover
**Objective:** Switch site to seasonal catalog

**Scenario:** Holiday season - switch to holiday catalog

**Steps:**
1. **Create Seasonal Catalog**
   - Create "Holiday 2026 Catalog"
   - Type: Manual
   - Add curated holiday products

2. **Prepare Sites**
   - Identify sites for holiday catalog
   - Document current configurations

3. **Switch Catalogs**
   - For each site:
     - Navigate to Site Catalog Configuration
     - Change catalog to "Holiday 2026 Catalog"
     - Remove price overrides
     - Enable "Only show featured"
     - Save

4. **Verify Switch**
   - Check sites show holiday products
   - Verify regular products hidden
   - Confirm pricing correct
   - Test customer experience

5. **Post-Season Revert**
   - Switch sites back to regular catalogs
   - Restore previous configurations
   - Verify smooth transition

**Expected Result:**
- ✓ Seamless catalog switchover
- ✓ No downtime
- ✓ Correct products displayed
- ✓ Easy revert process

---

## Test Suite 5.2: Error Recovery Workflows

### TC-5.2.1: Handle Failed Migration
**Objective:** Recover from migration failure

**Scenario:** Migration fails halfway through

**Steps:**
1. Start migration
2. Simulate failure (network/server error)
3. Observe error state
4. Check system state:
   - Are some products migrated?
   - Is data consistent?
   - Can we retry?
5. Retry migration
6. Verify completion

**Expected Result:**
- ✓ Error clearly communicated
- ✓ Data remains consistent
- ✓ Can safely retry
- ✓ No data corruption

---

### TC-5.2.2: Recover from Incorrect Configuration
**Objective:** Fix wrong site configuration

**Scenario:** Admin assigned wrong catalog to site

**Steps:**
1. Site configured with wrong catalog
2. Customer reports wrong products
3. Admin identifies issue
4. Changes to correct catalog
5. Verifies fix

**Expected Result:**
- ✓ Quick identification of issue
- ✓ Easy to change catalog
- ✓ Immediate effect
- ✓ Customer sees correct products

---

# Edge Cases & Boundary Testing

## Test Suite 6.1: Edge Cases

### TC-6.1.1: Very Large Catalog
**Objective:** Handle catalog with 10,000+ products

**Test Data:**
- Catalog with 10,000 products
- Multiple categories, brands, tags

**Test Cases:**
- Create catalog → Should succeed
- Load catalog statistics → Should load quickly
- Assign to site → Should work
- Apply exclusions → Should filter correctly
- Page load performance → Under 2 seconds

**Expected Result:**
- ✓ Handles large data sets
- ✓ No performance degradation
- ✓ Pagination works
- ✓ Filters efficient

---

### TC-6.1.2: Many Exclusions
**Objective:** Handle extensive exclusion lists

**Test Data:**
- 100 excluded categories
- 500 excluded SKUs
- 50 excluded brands
- 100 excluded tags

**Test Cases:**
- Add all exclusions → Should succeed
- Save configuration → Should complete
- Load configuration → Should display all
- Remove exclusions → Should work
- Performance → No lag

**Expected Result:**
- ✓ Handles large exclusion lists
- ✓ UI remains responsive
- ✓ All exclusions apply correctly

---

### TC-6.1.3: Special Characters in Names
**Objective:** Handle special characters

**Test Cases:**
- Catalog name: "Test & Sons' Catalog™"
- Category: "Home & Garden"
- SKU: "SKU-001/A"
- Brand: "Brand's (Premium)"

**Expected Result:**
- ✓ All special characters accepted
- ✓ Properly escaped in API
- ✓ Display correctly in UI
- ✓ No injection vulnerabilities

---

### TC-6.1.4: Concurrent Users
**Objective:** Handle simultaneous edits

**Scenario:** Two admins edit same catalog

**Steps:**
1. Admin A opens catalog for edit
2. Admin B opens same catalog
3. Admin A saves changes
4. Admin B tries to save

**Expected Result:**
- ✓ Conflict detected
- ✓ Warning message shown
- ✓ Option to reload and see changes
- ✓ No data loss

---

### TC-6.1.5: Network Interruption
**Objective:** Handle network failures gracefully

**Test Cases:**

**Case A: Save During Network Failure**
- Start saving configuration
- Disconnect network
- Observe behavior

Expected:
- ✓ Error message displayed
- ✓ Retry option available
- ✓ Data preserved locally
- ✓ Can retry when reconnected

**Case B: Load During Network Failure**
- Navigate to page
- No network connection

Expected:
- ✓ Error message displayed
- ✓ Graceful degradation
- ✓ Retry option
- ✓ No crash

---

### TC-6.1.6: Extreme Price Adjustments
**Objective:** Handle edge case pricing

**Test Cases:**
- Price adjustment: 100% (double price)
- Price adjustment: -100% (free)
- Price adjustment: 0.01% (minimal)
- Price adjustment: -99.99% (almost free)

**Expected Result:**
- ✓ All valid percentages accepted
- ✓ Calculations accurate
- ✓ Validation prevents invalid values
- ✓ Warnings for extreme values

---

### TC-6.1.7: Empty Catalog
**Objective:** Handle catalog with no products

**Steps:**
1. Create new catalog
2. Don't add any products
3. Assign to site
4. View site products

**Expected Result:**
- ✓ Empty state message shown
- ✓ No errors
- ✓ Helpful instructions displayed
- ✓ Can add products later

---

### TC-6.1.8: Circular Dependencies
**Objective:** Prevent catalog reference loops

**Test Cases:**
- Catalog A references Catalog B
- Catalog B references Catalog A
- (If catalog inheritance exists)

**Expected Result:**
- ✓ Circular references detected
- ✓ Error message displayed
- ✓ Save prevented
- ✓ Suggestions provided

---

# Performance Testing

## Test Suite 7.1: Load Testing

### TC-7.1.1: Page Load Times
**Objective:** Measure page performance

**Pages to Test:**
- Catalog Management
- Catalog Edit
- Migration Tool
- Site Configuration

**Metrics:**
- Initial load: < 2 seconds
- Interactive: < 3 seconds
- Data fetch: < 1 second

**Test Conditions:**
- Fast 3G network
- Mid-range device
- Chrome browser

---

### TC-7.1.2: API Response Times
**Objective:** Measure API performance

**Endpoints to Test:**
- GET /catalogs
- POST /catalogs
- GET /sites/:id/catalog-config
- POST /migration/run

**Metrics:**
- Simple GET: < 500ms
- Complex query: < 1000ms
- Write operations: < 1500ms
- Migration: < 30 seconds (1000 products)

---

### TC-7.1.3: Concurrent Users
**Objective:** Handle multiple simultaneous users

**Test Setup:**
- 10 users loading catalog list
- 5 users creating catalogs
- 3 users configuring sites

**Expected Result:**
- ✓ All requests complete successfully
- ✓ No timeouts
- ✓ No data corruption
- ✓ Response times acceptable

---

### TC-7.1.4: Large Data Set Performance
**Objective:** Performance with large datasets

**Test Data:**
- 50 catalogs
- 50,000 products
- 100 sites
- 100 configurations

**Test Cases:**
- Load catalog list → < 2 seconds
- Search catalogs → < 1 second
- Filter catalogs → < 500ms
- Load site config → < 1 second

---

# Security Testing

## Test Suite 8.1: Authentication & Authorization

### TC-8.1.1: Unauthenticated Access
**Objective:** Verify authentication required

**Test Cases:**
- Access /admin/catalogs without token
- Access API without X-Access-Token
- Use expired token
- Use invalid token

**Expected Result:**
- ✓ 401 Unauthorized
- ✓ Redirect to login
- ✓ Error message displayed
- ✓ No data exposed

---

### TC-8.1.2: Non-Admin Access
**Objective:** Verify admin-only access

**Test Cases:**
- Regular user tries to access admin pages
- Regular user tries to call admin APIs

**Expected Result:**
- ✓ 403 Forbidden
- ✓ Access denied message
- ✓ No data exposed

---

### TC-8.1.3: SQL Injection Prevention
**Objective:** Prevent SQL injection

**Test Cases:**
- Catalog name: "'; DROP TABLE catalogs; --"
- Search term: "' OR '1'='1"
- SKU: "'; DELETE FROM products WHERE '1'='1"

**Expected Result:**
- ✓ Input sanitized
- ✓ No SQL execution
- ✓ Safe storage
- ✓ Safe retrieval

---

### TC-8.1.4: XSS Prevention
**Objective:** Prevent cross-site scripting

**Test Cases:**
- Catalog name: "<script>alert('XSS')</script>"
- Description: "<img src=x onerror=alert('XSS')>"
- Category: "<iframe src='evil.com'></iframe>"

**Expected Result:**
- ✓ Scripts don't execute
- ✓ HTML escaped
- ✓ Safe display
- ✓ No vulnerabilities

---

### TC-8.1.5: Sensitive Data Exposure
**Objective:** Verify credentials protected

**Test Cases:**
- View catalog source credentials
- Check API responses
- Inspect browser storage
- Check error messages

**Expected Result:**
- ✓ Credentials never in frontend
- ✓ Not in API responses
- ✓ Not in local storage
- ✓ Not in error messages

---

# User Acceptance Testing (UAT)

## Test Suite 9.1: Real-World Scenarios

### TC-9.1.1: Admin Daily Tasks
**Objective:** Test typical daily admin workflow

**Scenario:** Morning routine

**Tasks:**
1. Check all catalog sync status
2. Review any sync errors
3. Configure new site for client
4. Add product exclusions per client request
5. Update pricing for one site
6. Verify changes on frontend

**Expected Result:**
- ✓ All tasks completed efficiently
- ✓ UI intuitive
- ✓ No confusion
- ✓ Time: < 15 minutes

---

### TC-9.1.2: Client Onboarding
**Objective:** Set up new client from scratch

**Scenario:** New enterprise client

**Tasks:**
1. Create new site
2. Assign appropriate catalog
3. Configure exclusions per contract
4. Set custom pricing
5. Test frontend experience
6. Train client admin

**Expected Result:**
- ✓ Smooth onboarding
- ✓ All requirements met
- ✓ Client satisfied
- ✓ Time: < 30 minutes

---

### TC-9.1.3: Seasonal Configuration
**Objective:** Prepare for holiday season

**Scenario:** Holiday prep

**Tasks:**
1. Create holiday catalog
2. Curate holiday products
3. Switch multiple sites to holiday catalog
4. Configure holiday pricing
5. Schedule revert post-season

**Expected Result:**
- ✓ Easy bulk operations
- ✓ Preview capability
- ✓ Scheduled changes work
- ✓ Smooth revert

---

### TC-9.1.4: Troubleshooting
**Objective:** Diagnose and fix issues

**Scenario:** Customer reports wrong products

**Tasks:**
1. Identify affected site
2. Review catalog configuration
3. Check exclusions
4. Verify product assignments
5. Fix issue
6. Confirm resolution

**Expected Result:**
- ✓ Issue identified quickly
- ✓ Fix straightforward
- ✓ Verification easy
- ✓ Time: < 10 minutes

---

# Test Execution Plan

## Testing Phases

### Phase 1: Unit Testing (Day 1-2)
- Run all unit tests
- Fix critical bugs
- Achieve 90%+ pass rate

### Phase 2: Integration Testing (Day 3-4)
- Test API integration
- Test component integration
- Fix integration bugs

### Phase 3: E2E Testing (Day 5-6)
- Run end-to-end workflows
- Test user journeys
- Fix workflow bugs

### Phase 4: Performance Testing (Day 7)
- Load testing
- Stress testing
- Optimize bottlenecks

### Phase 5: Security Testing (Day 8)
- Security audit
- Penetration testing
- Fix vulnerabilities

### Phase 6: UAT (Day 9-10)
- Real user testing
- Feedback collection
- Final adjustments

---

## Test Automation Recommendations

### Automated Tests (Priority)
1. ✅ API endpoint tests
2. ✅ Form validation tests
3. ✅ CRUD operation tests
4. ✅ Authentication tests
5. ✅ Type safety tests

### Manual Tests (Required)
1. ✅ UI/UX evaluation
2. ✅ Cross-browser testing
3. ✅ Accessibility testing
4. ✅ Visual regression
5. ✅ User workflow testing

### Tools Recommended
- **Unit Tests:** Jest, React Testing Library
- **E2E Tests:** Playwright, Cypress
- **API Tests:** Postman, Insomnia
- **Performance:** Lighthouse, WebPageTest
- **Security:** OWASP ZAP, Burp Suite

---

## Test Data Management

### Test Data Sets
```javascript
// testData.ts
export const testCatalogs = [
  { id: 'cat-test-001', name: 'Test SAP Catalog', type: 'erp' },
  { id: 'cat-test-002', name: 'Test Vendor Catalog', type: 'vendor' },
  { id: 'cat-test-003', name: 'Test Manual Catalog', type: 'manual' },
  { id: 'cat-test-004', name: 'Test Dropship Catalog', type: 'dropship' },
];

export const testSites = [
  { id: 'site-test-001', name: 'Test Enterprise Site' },
  { id: 'site-test-002', name: 'Test SMB Site' },
  { id: 'site-test-003', name: 'Test Unconfigured Site' },
];

export const testProducts = [
  { sku: 'TEST-001', name: 'Test Product 1', price: 99.99 },
  { sku: 'TEST-002', name: 'Test Product 2', price: 149.99 },
  // ... more products
];
```

---

## Success Criteria

### Definition of Done
- ✅ All critical tests passing (100%)
- ✅ All high-priority tests passing (95%+)
- ✅ Medium-priority tests passing (90%+)
- ✅ No critical bugs
- ✅ Performance metrics met
- ✅ Security audit passed
- ✅ UAT sign-off received

### Quality Metrics
- **Code Coverage:** > 80%
- **Bug Density:** < 2 bugs per 1000 LOC
- **Performance:** All pages < 3s load time
- **Availability:** 99.9% uptime
- **Security:** Zero critical vulnerabilities

---

## Bug Tracking Template

### Bug Report Format
```markdown
## Bug ID: BUG-001
**Title:** Catalog save fails with special characters

**Priority:** High
**Severity:** Medium
**Status:** Open

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Environment: Development

**Steps to Reproduce:**
1. Navigate to Create Catalog
2. Enter name with apostrophe: "Client's Catalog"
3. Click Save
4. Error appears

**Expected Result:**
Catalog saves successfully

**Actual Result:**
Error: "Invalid characters in catalog name"

**Screenshots:**
[Attach screenshot]

**Assigned To:** Developer Name
**Found By:** Tester Name
**Date:** 2026-02-11
```

---

## Test Summary Report Template

```markdown
# Test Execution Summary
**Date:** 2026-02-11
**Phase:** Phase 4 - Site Configuration
**Tester:** QA Team

## Summary
- Total Tests: 150
- Passed: 145
- Failed: 3
- Blocked: 2
- Pass Rate: 96.7%

## Critical Issues
1. BUG-001: Catalog save fails with special characters (High)
2. BUG-003: Migration timeout on large datasets (Medium)

## Recommendations
1. Fix critical bugs before release
2. Add more validation for special characters
3. Optimize migration for large datasets
4. Add progress indicators

## Sign-Off
- QA Lead: ✅ Approved
- Development Lead: ✅ Approved
- Product Owner: ⏳ Pending
```

---

## 🎉 Conclusion

This comprehensive testing plan covers:
- ✅ 150+ test cases
- ✅ 9 test suites
- ✅ All 4 phases
- ✅ Unit, integration, E2E tests
- ✅ Performance testing
- ✅ Security testing
- ✅ UAT scenarios
- ✅ Edge cases
- ✅ Error handling

**The multi-catalog architecture is ready for thorough testing!** 🚀

---

**Document Version:** 1.0  
**Last Updated:** February 11, 2026  
**Maintained By:** QA Team  
**Next Review:** After implementation
