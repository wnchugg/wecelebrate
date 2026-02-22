# Database Migration Phase 5 - Plan

**Date**: February 16, 2026  
**Status**: 📋 PLANNING  
**Goal**: Migrate remaining KV-based features to PostgreSQL database

## Current Status

### ✅ Already Migrated (Phases 1-4)
- Dashboard analytics (Phase 1)
- Clients CRUD (Phase 2)
- Sites CRUD (Phase 2)
- Products CRUD (Phase 2)
- Employees CRUD (Phase 2)
- Orders CRUD (Phase 2)
- Frontend to v2 endpoints (Phase 3)
- KV cleanup (Phase 4)

### 🔄 Still Using KV Store

Based on code analysis, these features still use KV store:

#### 1. Brands Management
**Current**: `kv.getByPrefix('brand:', environmentId)`
**Usage**: Brand configuration for sites
**Complexity**: LOW
**Priority**: MEDIUM

#### 2. Email Templates
**Current**: 
- `kv.getByPrefix('global-template:', environmentId)`
- `kv.getByPrefix('site-template:', environmentId)`
- `kv.getByPrefix('email-template:', environmentId)`
**Usage**: Email template management
**Complexity**: MEDIUM
**Priority**: MEDIUM

#### 3. Site Configuration
**Current**: `kv.get('site_configs:', siteId)`
**Usage**: Gift assignment configuration per site
**Complexity**: MEDIUM
**Priority**: HIGH (used in gift filtering)

#### 4. Gifts/Products (Legacy)
**Current**: `kv.getByPrefix('gifts:', environmentId)`
**Usage**: Legacy gift catalog (being replaced by products table)
**Complexity**: HIGH
**Priority**: HIGH

#### 5. Admin Users (Partial)
**Current**: `kv.getByPrefix('admin_users:', environmentId)`
**Usage**: Admin authentication and authorization
**Complexity**: MEDIUM
**Priority**: LOW (working well, low impact)

#### 6. Roles & Access Groups
**Current**: 
- `kv.getByPrefix('role:', environmentId)`
- `kv.getByPrefix('access_group:', environmentId)`
- `kv.getByPrefix('employee_role:', environmentId)`
- `kv.getByPrefix('employee_access_group:', environmentId)`
**Usage**: RBAC system
**Complexity**: HIGH
**Priority**: LOW (working well, complex migration)

#### 7. SFTP & Mapping Rules
**Current**:
- `kv.getByPrefix('mapping_rules:', environmentId)`
- `kv.get('sftp_config:', clientId)`
**Usage**: SFTP integration for employee data
**Complexity**: MEDIUM
**Priority**: LOW (specialized feature, working well)

## Recommended Migration Order

### Phase 5A: Site Configuration & Gifts (HIGH PRIORITY)
**Why**: These are actively used in the gift selection flow and impact user experience

1. **Site Gift Configuration**
   - Create `site_gift_configs` table
   - Migrate gift assignment strategies
   - Update gift filtering logic
   - Estimated: 4-6 hours

2. **Gifts to Products Migration**
   - Already have `products` table
   - Migrate legacy gift data to products
   - Update gift endpoints to use products table
   - Estimated: 6-8 hours

### Phase 5B: Brands & Templates (MEDIUM PRIORITY)
**Why**: Used in admin configuration, less frequent access

3. **Brands Management**
   - Create `brands` table
   - Migrate brand data
   - Update brand endpoints
   - Estimated: 2-3 hours

4. **Email Templates**
   - Create `email_templates` table
   - Migrate template data
   - Update template endpoints
   - Estimated: 3-4 hours

### Phase 5C: RBAC & Admin (LOW PRIORITY)
**Why**: Working well, complex migration, low impact

5. **Roles & Access Groups** (Optional)
   - Create `roles`, `access_groups`, `employee_roles`, `employee_access_groups` tables
   - Migrate RBAC data
   - Update authorization logic
   - Estimated: 8-10 hours

6. **Admin Users** (Optional)
   - Already have `admin_users` table in schema
   - Migrate admin user data
   - Update authentication logic
   - Estimated: 4-6 hours

7. **SFTP & Mapping** (Optional)
   - Create `sftp_configs`, `mapping_rules` tables
   - Migrate SFTP configuration
   - Update SFTP sync logic
   - Estimated: 4-6 hours

## Phase 5A Detailed Plan: Site Configuration & Gifts

### Step 1: Create Site Gift Configuration Table

```sql
CREATE TABLE IF NOT EXISTS site_gift_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  -- Assignment Strategy
  assignment_strategy TEXT NOT NULL DEFAULT 'all',  -- all, selected, excluded, categories
  
  -- Selected/Excluded Products (JSONB array of product IDs)
  selected_product_ids JSONB DEFAULT '[]',
  excluded_product_ids JSONB DEFAULT '[]',
  
  -- Category Filters (JSONB array of category names)
  included_categories JSONB DEFAULT '[]',
  excluded_categories JSONB DEFAULT '[]',
  
  -- Price Range
  min_price NUMERIC(10, 2),
  max_price NUMERIC(10, 2),
  
  -- Additional Filters (JSONB for flexibility)
  filters JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT site_gift_configs_site_unique UNIQUE (site_id),
  CONSTRAINT site_gift_configs_strategy_check CHECK (
    assignment_strategy IN ('all', 'selected', 'excluded', 'categories', 'custom')
  ),
  CONSTRAINT site_gift_configs_price_check CHECK (
    min_price IS NULL OR max_price IS NULL OR min_price <= max_price
  )
);

CREATE INDEX idx_site_gift_configs_site_id ON site_gift_configs(site_id);
CREATE INDEX idx_site_gift_configs_strategy ON site_gift_configs(assignment_strategy);
```

### Step 2: Migrate Gift Data to Products Table

The `products` table already exists in the schema. We need to:

1. **Data Migration Script**
   - Read all gifts from KV store (`gifts:*`)
   - Transform to products table format
   - Insert into products table
   - Link to appropriate catalog

2. **Create Default Catalog**
   - Create a "Legacy Gifts" catalog
   - Set type to 'manual'
   - Migrate all gifts to this catalog

### Step 3: Create Database Functions

```typescript
// crud_db.ts additions

// Site Gift Configuration
export async function getSiteGiftConfig(siteId: string) {
  const { data, error } = await supabase
    .from('site_gift_configs')
    .select('*')
    .eq('site_id', siteId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateSiteGiftConfig(siteId: string, config: any) {
  const { data, error } = await supabase
    .from('site_gift_configs')
    .upsert({
      site_id: siteId,
      ...config,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Get filtered gifts for a site
export async function getSiteGifts(siteId: string) {
  // Get site config
  const config = await getSiteGiftConfig(siteId);
  
  // Get site's catalog
  const { data: site } = await supabase
    .from('sites')
    .select('catalog_id')
    .eq('id', siteId)
    .single();
  
  if (!site?.catalog_id) {
    return { success: true, data: [] };
  }
  
  // Build query based on config
  let query = supabase
    .from('products')
    .select('*')
    .eq('catalog_id', site.catalog_id)
    .eq('status', 'active');
  
  // Apply filters based on assignment strategy
  if (config) {
    if (config.assignment_strategy === 'selected' && config.selected_product_ids?.length > 0) {
      query = query.in('id', config.selected_product_ids);
    }
    
    if (config.excluded_product_ids?.length > 0) {
      query = query.not('id', 'in', `(${config.excluded_product_ids.join(',')})`);
    }
    
    if (config.included_categories?.length > 0) {
      query = query.in('category', config.included_categories);
    }
    
    if (config.excluded_categories?.length > 0) {
      query = query.not('category', 'in', `(${config.excluded_categories.join(',')})`);
    }
    
    if (config.min_price) {
      query = query.gte('price', config.min_price);
    }
    
    if (config.max_price) {
      query = query.lte('price', config.max_price);
    }
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return { success: true, data: data || [] };
}
```

### Step 4: Create V2 Endpoints

```typescript
// endpoints_v2.ts additions

// Get site gift configuration
export async function getSiteGiftConfigV2(c: any) {
  try {
    const siteId = c.req.param('siteId');
    const config = await getSiteGiftConfig(siteId);
    
    return c.json({
      success: true,
      data: config || {
        site_id: siteId,
        assignment_strategy: 'all',
        selected_product_ids: [],
        excluded_product_ids: [],
        included_categories: [],
        excluded_categories: []
      }
    });
  } catch (error: any) {
    console.error('[Get Site Gift Config V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

// Update site gift configuration
export async function updateSiteGiftConfigV2(c: any) {
  try {
    const siteId = c.req.param('siteId');
    const updates = await c.req.json();
    
    const config = await updateSiteGiftConfig(siteId, updates);
    
    return c.json({ success: true, data: config });
  } catch (error: any) {
    console.error('[Update Site Gift Config V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

// Get filtered gifts for a site
export async function getSiteGiftsV2(c: any) {
  try {
    const siteId = c.req.param('siteId');
    const result = await getSiteGifts(siteId);
    
    return c.json(result);
  } catch (error: any) {
    console.error('[Get Site Gifts V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
}
```

### Step 5: Register Endpoints

```typescript
// index.tsx additions

// Site Gift Configuration
app.get("/make-server-6fcaeea3/v2/sites/:siteId/gift-config", verifyAdmin, v2.getSiteGiftConfigV2);
app.put("/make-server-6fcaeea3/v2/sites/:siteId/gift-config", verifyAdmin, v2.updateSiteGiftConfigV2);
app.get("/make-server-6fcaeea3/v2/sites/:siteId/gifts", v2.getSiteGiftsV2);  // Public endpoint
```

## Benefits of Phase 5A

### Performance
- 10-50x faster gift filtering
- Efficient database queries with indexes
- Better caching opportunities

### Scalability
- Can handle millions of products
- Efficient JOIN operations
- Better query optimization

### Features
- Advanced filtering (price ranges, categories)
- Better product search
- Easier to add new filter types

## Estimated Timeline

### Phase 5A (HIGH PRIORITY)
- Planning: 1 hour ✅
- Database schema: 1 hour
- Data migration script: 2 hours
- CRUD functions: 2 hours
- V2 endpoints: 2 hours
- Testing: 2 hours
- Deployment: 1 hour
**Total: 11 hours (~1.5 days)**

### Phase 5B (MEDIUM PRIORITY)
- Brands: 3 hours
- Email Templates: 4 hours
**Total: 7 hours (~1 day)**

### Phase 5C (LOW PRIORITY - Optional)
- Roles & Access Groups: 10 hours
- Admin Users: 6 hours
- SFTP & Mapping: 6 hours
**Total: 22 hours (~3 days)**

## Success Criteria

### Phase 5A
- [ ] Site gift configuration stored in database
- [ ] All gifts migrated to products table
- [ ] Gift filtering uses database queries
- [ ] V2 endpoints deployed and tested
- [ ] Frontend updated to use v2 endpoints
- [ ] Performance improved by 10-50x
- [ ] Old KV-based gift code removed

## Next Steps

1. Review and approve this plan
2. Start with Phase 5A (Site Configuration & Gifts)
3. Create database tables
4. Write migration script
5. Implement CRUD functions
6. Create v2 endpoints
7. Test thoroughly
8. Deploy to development
9. Update frontend
10. Deploy to production

---

**Status**: Ready to start Phase 5A  
**Priority**: HIGH  
**Impact**: HIGH (improves gift selection performance)  
**Risk**: MEDIUM (requires careful data migration)

