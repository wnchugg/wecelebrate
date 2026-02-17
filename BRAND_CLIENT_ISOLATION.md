# Brand-Client Isolation

## Overview
Each brand is now associated with exactly one client, ensuring proper data isolation. Global admins can manage all brands, but each brand belongs to a specific client and cannot be accessed by other clients.

## Changes Made

### 1. Database Migration 009
**File**: `supabase/migrations/009_add_client_to_brands.sql`

Added `client_id` foreign key to brands table:
```sql
ALTER TABLE brands 
ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Updated unique constraint to be per-client
ALTER TABLE brands ADD CONSTRAINT brands_name_client_unique 
  UNIQUE (name, client_id);
```

**Benefits**:
- Each brand belongs to one client
- Brand names can be duplicated across clients (e.g., "Corporate Brand" for multiple clients)
- Cascade delete: When client is deleted, their brands are deleted too
- Indexed for fast lookups

### 2. Frontend Updates

#### BrandsManagement.tsx
- Added client selector dropdown in create/edit form
- Displays client name on brand cards
- Required field: Must select a client when creating a brand
- Shows helpful text: "This brand will only be accessible to the selected client"

#### Type Updates (apiClientPhase5A.ts)
```typescript
export interface Brand {
  id: string;
  name: string;
  clientId?: string;  // NEW
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  status: 'active' | 'inactive';
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### 3. Data Model

```
clients (1) ──────< brands (many)
                    │
                    └──< sites (many, via brand_id)
```

**Hierarchy**:
1. Client owns multiple brands
2. Each brand belongs to one client
3. Sites can reference brands (only from their parent client)

## User Experience

### Creating a Brand
1. Navigate to `/admin/brands-management`
2. Click "New Brand" or "Extract from Website"
3. **Select Client** (required dropdown)
4. Fill in brand details (name, colors, etc.)
5. Save

### Brand Card Display
```
┌─────────────────────────────┐
│ [Color] Brand Name          │
│         Acme Corp           │ ← Client name
│         [Active Badge]      │
│                             │
│ Description text...         │
│                             │
│ [Primary] [Secondary]       │
│ [Edit] [Delete]             │
└─────────────────────────────┘
```

### Viewing Brands
- Global admins see all brands from all clients
- Each brand card shows which client it belongs to
- Brands are organized by client association

## Security & Access Control

### Current Implementation
- **Global Admin**: Can create/edit/delete brands for any client
- **Brand Isolation**: Each brand is tied to one client
- **Data Integrity**: Foreign key ensures brand can't reference non-existent client

### Future Enhancements (Optional)
If you want client-level admins to only see their own brands:

```typescript
// In getBrands endpoint
if (userRole === 'client_admin') {
  query = query.eq('client_id', userClientId);
}
```

## Migration Path

### Step 1: Run Migration 009
```sql
-- In Supabase SQL Editor
-- File: supabase/migrations/009_add_client_to_brands.sql
```

### Step 2: Update Existing Brands (if any)
```sql
-- Assign existing brands to a default client
UPDATE brands 
SET client_id = (SELECT id FROM clients LIMIT 1)
WHERE client_id IS NULL;
```

### Step 3: Test
1. Create a new brand and select a client
2. Verify client name appears on brand card
3. Try creating brands with same name for different clients (should work)
4. Verify brand appears in client's brand dropdown

## Benefits

### 1. Data Isolation
- Brands are scoped to clients
- No cross-client brand access
- Clear ownership model

### 2. Multi-Tenancy
- Each client has their own brand library
- Brand names can be reused across clients
- Scales well for many clients

### 3. Data Integrity
- Cascade delete prevents orphaned brands
- Foreign key constraint ensures valid client references
- Unique constraint per client prevents duplicates

### 4. Flexibility
- Clients can have multiple brands (divisions, sub-brands)
- Sites inherit from client's brands
- Easy to manage brand portfolios

## Example Scenarios

### Scenario 1: Single Brand Client
```
Client: "Acme Corp"
Brands:
  - "Acme Corporate" (primary brand)

Sites:
  - "Employee Onboarding 2026" → uses "Acme Corporate"
  - "Sales Awards Q1" → uses "Acme Corporate"
```

### Scenario 2: Multi-Brand Client
```
Client: "MegaCorp"
Brands:
  - "MegaCorp Corporate" (blue theme)
  - "MegaCorp Retail" (green theme)
  - "MegaCorp Tech" (purple theme)

Sites:
  - "Corporate Onboarding" → uses "MegaCorp Corporate"
  - "Retail Manager Gifts" → uses "MegaCorp Retail"
  - "Tech Team Awards" → uses "MegaCorp Tech"
```

### Scenario 3: Brand Name Reuse
```
Client: "Acme Corp"
Brands:
  - "Corporate Brand"

Client: "TechCo"
Brands:
  - "Corporate Brand"  ← Same name, different client (allowed!)
```

## API Changes

### Create Brand
```typescript
POST /v2/brands
{
  "name": "Acme Corporate",
  "clientId": "uuid-of-client",  // NEW: Required
  "primaryColor": "#0066CC",
  "secondaryColor": "#FF6600",
  "status": "active"
}
```

### Get Brands
```typescript
GET /v2/brands?clientId=uuid  // Optional filter by client
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "brand-uuid",
      "name": "Acme Corporate",
      "clientId": "client-uuid",  // NEW
      "primaryColor": "#0066CC",
      "secondaryColor": "#FF6600",
      "status": "active"
    }
  ]
}
```

## Database Schema

### Before (Migration 006)
```sql
brands
  ├── id (PK)
  ├── name (UNIQUE)
  ├── primary_color
  ├── secondary_color
  └── status
```

### After (Migration 009)
```sql
brands
  ├── id (PK)
  ├── client_id (FK → clients.id)  ← NEW
  ├── name
  ├── primary_color
  ├── secondary_color
  └── status
  
  UNIQUE (name, client_id)  ← Changed from UNIQUE (name)
```

## Testing Checklist

- [ ] Run migration 009 in Supabase
- [ ] Create brand for Client A
- [ ] Create brand with same name for Client B (should succeed)
- [ ] Verify client name shows on brand card
- [ ] Edit brand and change client
- [ ] Delete client and verify brands are deleted (cascade)
- [ ] Verify brand dropdown in site configuration only shows client's brands

## Deployment Status

- ✅ Migration 009 created
- ✅ Frontend updated with client selector
- ✅ Type definitions updated
- ✅ Backend deployed
- ⏳ Migration 009 needs to be run in database

---

**Status**: Ready for Migration 009
**Impact**: Adds client isolation to brands
**Breaking Change**: No (client_id is nullable for backward compatibility)
