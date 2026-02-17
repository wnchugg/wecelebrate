# Branding Architecture - Normalized Design

## Overview

The branding system uses a **normalized database design** with a separate `brands` table that both clients and sites can reference. This provides reusability, consistency, and flexibility.

## Database Schema

### Brands Table (Migration 006)
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  status TEXT DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Clients Table (Migration 008)
```sql
ALTER TABLE clients ADD COLUMN:
  - default_brand_id UUID REFERENCES brands(id)
  - branding_overrides JSONB DEFAULT '{}'
  - header_footer_config JSONB DEFAULT '{}'
```

### Sites Table (Migration 008)
```sql
ALTER TABLE sites ADD COLUMN:
  - brand_id UUID REFERENCES brands(id)
  - branding_overrides JSONB DEFAULT '{}'
```

## Branding Hierarchy

```
┌─────────────────┐
│  Brand Template │  ← Reusable brand configurations
│  (brands table) │     (colors, logos, fonts, etc.)
└────────┬────────┘
         │
         ├──────────────────────────────┐
         │                              │
         ▼                              ▼
┌────────────────┐            ┌────────────────┐
│     Client     │            │      Site      │
│ default_brand  │            │    brand_id    │
│   + overrides  │            │   + overrides  │
└────────────────┘            └────────────────┘
```

## Lookup Logic

### For a Site:
1. **Start with brand template**
   - Use `site.brand_id` if set
   - Otherwise use `client.default_brand_id`
   - Otherwise use system default

2. **Apply client overrides**
   - Merge `client.branding_overrides` on top of brand

3. **Apply site overrides**
   - Merge `site.branding_overrides` on top of result

### For a Client:
1. **Start with brand template**
   - Use `client.default_brand_id`
   - Otherwise use system default

2. **Apply client overrides**
   - Merge `client.branding_overrides` on top of brand

## API Functions

### CRUD Functions (crud_db.ts)

#### Brand Management
- `getBrands(filters)` - List all brands
- `getBrandById(id)` - Get single brand
- `createBrand(input)` - Create new brand
- `updateBrand(id, updates)` - Update brand
- `deleteBrand(id)` - Delete brand

#### Branding Helpers
- `getSiteEffectiveBranding(siteId)` - Get computed branding for a site
- `getClientEffectiveBranding(clientId)` - Get computed branding for a client

### V2 Endpoints (endpoints_v2.ts)

#### Brand Endpoints
- `GET /v2/brands` - List brands
- `GET /v2/brands/:id` - Get brand
- `POST /v2/brands` - Create brand
- `PUT /v2/brands/:id` - Update brand
- `DELETE /v2/brands/:id` - Delete brand

#### Branding Endpoints
- `GET /v2/sites/:id/branding` - Get effective branding for site
- `GET /v2/clients/:id/branding` - Get effective branding for client

## Frontend Integration

### Admin Pages

#### Brands Management (`/admin/brands-management`)
- Create and manage reusable brand templates
- Configure colors, logos, fonts
- Set brand status (active/inactive)

#### Branding Configuration (`/admin/branding-configuration`)
- Select brand for client or site
- Override specific branding properties
- Configure header/footer settings

#### Site Configuration (`/admin/sites/:id`)
- Branding tab to select/override brand for specific site

### Context Updates (SiteContext.tsx)

The `updateClient` function now properly calls the v2 API:
```typescript
const updateClient = async (id: string, updates: Partial<Client>) => {
  const response = await apiRequest(`/v2/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  // Updates local state after successful API call
};
```

## Use Cases

### Use Case 1: Single Brand Client
```
Client: "Acme Corp"
  default_brand_id: "acme-corporate-brand"
  branding_overrides: {}

Site: "Employee Onboarding 2026"
  brand_id: null (inherits from client)
  branding_overrides: {}

Result: Uses "acme-corporate-brand" template
```

### Use Case 2: Multi-Brand Client
```
Client: "Acme Corp"
  default_brand_id: "acme-corporate-brand"
  branding_overrides: {}

Site: "Retail Division Awards"
  brand_id: "acme-retail-brand"
  branding_overrides: {}

Result: Uses "acme-retail-brand" template (overrides client default)
```

### Use Case 3: Site-Specific Customization
```
Client: "Acme Corp"
  default_brand_id: "acme-corporate-brand"
  branding_overrides: {}

Site: "Holiday Special 2026"
  brand_id: null (inherits from client)
  branding_overrides: {
    primary_color: "#FF0000",  // Holiday red
    logo_url: "/holiday-logo.png"
  }

Result: Uses "acme-corporate-brand" with red color and holiday logo
```

### Use Case 4: Client-Wide Override
```
Client: "Acme Corp"
  default_brand_id: "acme-corporate-brand"
  branding_overrides: {
    primary_color: "#0066CC"  // New corporate blue
  }

Site 1: "Onboarding"
  brand_id: null
  branding_overrides: {}

Site 2: "Awards"
  brand_id: null
  branding_overrides: {}

Result: Both sites use new blue color (client override applies to all)
```

## Benefits

### 1. Reusability
- Create brand templates once, use across multiple clients/sites
- Build a library of pre-configured brands

### 2. Consistency
- Update brand template → all sites using it update automatically
- Maintain brand consistency across multiple sites

### 3. Flexibility
- Override specific properties at client or site level
- Support multi-brand clients (different divisions/departments)

### 4. Maintainability
- Centralized brand management
- Clear hierarchy: Brand → Client → Site
- Easy to understand and debug

### 5. Performance
- Efficient queries with proper indexes
- Can cache brand templates
- JOINs are fast with indexed foreign keys

## Migration Path

### Step 1: Run Migrations
```bash
# Migration 006: Create brands table
# Migration 008: Add brand references to clients and sites
```

### Step 2: Create Default Brands
```sql
-- Run seed-phase5a-data.sql to create sample brands
```

### Step 3: Assign Brands to Clients
```sql
-- Update existing clients to use default brand
UPDATE clients 
SET default_brand_id = (SELECT id FROM brands WHERE name = 'WeCelebrate' LIMIT 1)
WHERE default_brand_id IS NULL;
```

### Step 4: Deploy Backend
```bash
supabase functions deploy make-server-6fcaeea3 --no-verify-jwt
```

### Step 5: Update Frontend
- BrandingConfiguration page already supports this model
- SiteContext.updateClient now calls v2 API
- No additional frontend changes needed

## Next Steps

1. ✅ Database migrations created
2. ✅ CRUD functions implemented
3. ✅ V2 endpoints exist
4. ✅ Helper functions for effective branding
5. ✅ Frontend context updated
6. ⏳ Run migrations in Supabase dashboard
7. ⏳ Seed sample brands
8. ⏳ Deploy backend functions
9. ⏳ Test branding flow end-to-end
10. ⏳ Update existing clients/sites to use brands

## Testing Checklist

- [ ] Create a new brand via brands-management page
- [ ] Assign brand to a client via branding-configuration
- [ ] Verify site inherits client's brand
- [ ] Override brand at site level
- [ ] Update brand template and verify changes propagate
- [ ] Test multi-brand client scenario
- [ ] Verify branding overrides work correctly
- [ ] Test header/footer configuration
