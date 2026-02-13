# Multi-Catalog Implementation - Quick Checklist

**Start Date:** February 11, 2026  
**Target:** March 11, 2026 (4 weeks)

---

## Phase 1: Foundation & Data Model (Days 1-4)

### Type Definitions
- [ ] Create `/src/app/types/catalog.ts`
  - [ ] Catalog interface
  - [ ] CatalogSource interface
  - [ ] CatalogSettings interface
  - [ ] ProductSource interface
  - [ ] CatalogSyncLog interface
  - [ ] SiteCatalogConfig interface
  - [ ] All type enums

### Update Existing Types
- [ ] Modify `/src/app/types/gift.ts`
  - [ ] Add `catalogId: string`
  - [ ] Add `source: ProductSource`
  - [ ] Add `cost?: number`
  - [ ] Add `msrp?: number`
  - [ ] Import ProductSource from catalog types

### Storage & Constants
- [ ] Create `/src/app/config/storage-keys.ts`
  - [ ] Define all catalog-related keys
  - [ ] Define catalog-gift relationship keys
  - [ ] Define site catalog config keys
  - [ ] Define sync log keys
  - [ ] Define index keys

### Validation
- [ ] Create `/src/app/utils/catalog-validation.ts`
  - [ ] `validateCatalog()` function
  - [ ] `validateSiteCatalogConfig()` function
  - [ ] `sanitizeCatalogName()` function
  - [ ] `generateCatalogId()` function
  - [ ] `CatalogValidationError` class

### Exports
- [ ] Update `/src/app/types/index.ts` - Export catalog types
- [ ] Update `/src/app/utils/index.ts` - Export validation utils

### Migration
- [ ] Create `/supabase/functions/server/catalog-migration.ts`
  - [ ] `migrateToMultiCatalog()` function
  - [ ] `needsMigration()` function
  - [ ] `getMigrationStatus()` function

**Phase 1 Complete:** All types compile, no errors

---

## Phase 2: Backend API (Days 5-10)

### Catalog CRUD Routes
- [ ] `GET /catalogs` - List all catalogs
- [ ] `GET /catalogs/:catalogId` - Get catalog details
- [ ] `POST /catalogs` - Create catalog
- [ ] `PUT /catalogs/:catalogId` - Update catalog
- [ ] `DELETE /catalogs/:catalogId` - Delete catalog
- [ ] `GET /catalogs/:catalogId/stats` - Get statistics

### Enhanced Gift Routes
- [ ] Modify `GET /gifts` - Add catalogId query param
- [ ] Modify `POST /gifts` - Add catalog assignment
- [ ] Modify `PUT /gifts/:id` - Support catalog changes
- [ ] Modify `DELETE /gifts/:id` - Update catalog counts

### Site Catalog Routes
- [ ] `GET /sites/:siteId/catalog-config` - Get config
- [ ] `PUT /sites/:siteId/catalog-config` - Update config
- [ ] `GET /sites/:siteId/catalog-preview` - Preview products

### Filtering Logic
- [ ] Create `/supabase/functions/server/catalog-filter.ts`
  - [ ] `getSiteProducts()` function
  - [ ] `getCatalogStats()` function
  - [ ] Apply category exclusions
  - [ ] Apply SKU exclusions
  - [ ] Apply tag exclusions
  - [ ] Apply availability rules
  - [ ] Apply price overrides

### Migration Routes
- [ ] `POST /admin/migrate-catalogs` - Run migration
- [ ] `GET /admin/migration-status` - Check status

### Testing
- [ ] Test all catalog endpoints with Postman
- [ ] Test gift endpoints with catalog filtering
- [ ] Test site catalog configuration
- [ ] Test filtering logic with sample data
- [ ] Test migration endpoint

**Phase 2 Complete:** All APIs functional, tested

---

## Phase 3: Catalog Management UI (Days 11-15)

### Main Page
- [ ] Create `/src/app/pages/admin/CatalogManagement.tsx`
  - [ ] Catalog list view
  - [ ] Catalog cards with stats
  - [ ] Search and filter
  - [ ] Type filter (ERP/Vendor/Manual)
  - [ ] Status badges
  - [ ] Action buttons (View, Sync, Configure, Delete)
  - [ ] Empty state
  - [ ] Loading state

### Catalog Form
- [ ] Create `/src/app/components/admin/CatalogFormModal.tsx`
  - [ ] Basic information fields
  - [ ] Catalog type selector
  - [ ] Source configuration
  - [ ] Settings configuration
  - [ ] Validation
  - [ ] Save/Cancel actions

### Catalog Card
- [ ] Create `/src/app/components/admin/CatalogCard.tsx`
  - [ ] Visual design
  - [ ] Stats display
  - [ ] Status indicator
  - [ ] Quick actions menu

### Navigation
- [ ] Modify `/src/app/components/AdminLayout.tsx`
  - [ ] Add "Catalog Management" menu item
  - [ ] Add catalog icon

### Routes
- [ ] Update `/src/app/routes.ts`
  - [ ] Add `/admin/catalogs` route

### Gift Management Enhancement
- [ ] Modify `/src/app/pages/admin/GiftManagement.tsx`
  - [ ] Add catalog dropdown filter
  - [ ] Show catalog badge on product cards
  - [ ] Filter products by selected catalog
  - [ ] Update stats by catalog

**Phase 3 Complete:** Catalog management fully functional

---

## Phase 4: Site Catalog Configuration UI (Days 16-19)

### Site Configuration Tab
- [ ] Modify `/src/app/pages/admin/SiteConfiguration.tsx`
  - [ ] Add "Catalog" tab to navigation
  - [ ] Create catalog tab content section

### Catalog Selection
- [ ] Create catalog selector component
  - [ ] Dropdown of available catalogs
  - [ ] Show catalog stats
  - [ ] Change detection

### Exclusion Rules
- [ ] Create `/src/app/components/admin/CatalogExclusionRules.tsx`
  - [ ] Category exclusion grid
  - [ ] SKU exclusion search/select
  - [ ] Tag exclusion input
  - [ ] Visual feedback

### Preview
- [ ] Create `/src/app/components/admin/CatalogPreview.tsx`
  - [ ] Product count summary
  - [ ] Sample product cards
  - [ ] "View Full List" link

### Price Overrides (Optional)
- [ ] Price adjustment input
- [ ] Custom pricing per SKU

### Availability Rules
- [ ] Hide out-of-stock toggle
- [ ] Hide discontinued toggle
- [ ] Minimum inventory input

### Save & Test
- [ ] Save button functionality
- [ ] Success/error feedback
- [ ] Preview updates in real-time

**Phase 4 Complete:** Site catalog configuration working

---

## Phase 5: ERP Integration Framework (Days 20-25)

### Sync Engine
- [ ] Create `/supabase/functions/server/catalog-sync.ts`
  - [ ] API sync implementation
  - [ ] File sync implementation
  - [ ] FTP/SFTP sync implementation
  - [ ] Conflict detection
  - [ ] Error handling
  - [ ] Sync logging

### Sync History UI
- [ ] Create `/src/app/pages/admin/CatalogSyncHistory.tsx`
  - [ ] List of sync logs
  - [ ] Filter by catalog
  - [ ] Filter by status
  - [ ] View log details

### Sync Log Viewer
- [ ] Create `/src/app/components/admin/SyncLogViewer.tsx`
  - [ ] Log details modal
  - [ ] Results summary
  - [ ] Error list
  - [ ] Metrics display

### CSV Import
- [ ] Create `/src/app/components/admin/CatalogImportModal.tsx`
  - [ ] File upload
  - [ ] Format validation
  - [ ] Preview mapping
  - [ ] Import progress
  - [ ] Error reporting

### Sync Routes
- [ ] `POST /catalogs/:catalogId/sync` - Manual sync
- [ ] `GET /catalogs/:catalogId/sync-logs` - Get logs
- [ ] `POST /catalogs/:catalogId/import` - Import file

### Scheduled Sync (Optional)
- [ ] Implement cron-like scheduling
- [ ] Store schedule in catalog settings
- [ ] Execute sync automatically

**Phase 5 Complete:** ERP integration framework ready

---

## Phase 6: Migration & Testing (Days 26-29)

### Data Migration
- [ ] Backup production data
- [ ] Run migration on dev environment
- [ ] Verify migration results
- [ ] Test site functionality post-migration
- [ ] Run migration on production (if ready)

### Unit Tests
- [ ] Test catalog validation utilities
- [ ] Test storage key generation
- [ ] Test filtering logic
- [ ] Test sync engine functions

### Integration Tests
- [ ] Test catalog CRUD flow
- [ ] Test gift assignment to catalogs
- [ ] Test site catalog configuration
- [ ] Test product filtering
- [ ] Test migration process

### E2E Tests
- [ ] Create catalog via UI
- [ ] Add products to catalog
- [ ] Assign catalog to site
- [ ] Configure exclusions
- [ ] Verify filtered products
- [ ] Import products from CSV

### Performance Tests
- [ ] Test with 10,000+ products
- [ ] Test filtering speed (<500ms target)
- [ ] Test sync performance
- [ ] Test catalog switching

### Documentation
- [ ] API documentation
- [ ] User guide for catalog management
- [ ] ERP integration guide
- [ ] Migration runbook
- [ ] Troubleshooting guide

**Phase 6 Complete:** Production ready! 🎉

---

## Quick Commands

### Type Check
```bash
npm run type-check
```

### Build
```bash
npm run build
```

### Test API
```bash
# Get all catalogs
curl -X GET http://localhost:8000/make-server-6fcaeea3/catalogs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create catalog
curl -X POST http://localhost:8000/make-server-6fcaeea3/catalogs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Catalog","type":"manual",...}'
```

### Run Migration
```bash
curl -X POST http://localhost:8000/make-server-6fcaeea3/admin/migrate-catalogs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Progress Tracking

### Week 1 (Phase 1-2)
- [ ] Monday-Tuesday: Phase 1 (Types & Migration)
- [ ] Wednesday-Friday: Phase 2 (Backend API)
- [ ] Friday EOD: All backend APIs tested

### Week 2 (Phase 3)
- [ ] Monday-Wednesday: Catalog Management UI
- [ ] Thursday-Friday: Gift Management Enhancement
- [ ] Friday EOD: Can manage catalogs via UI

### Week 3 (Phase 4-5)
- [ ] Monday-Tuesday: Site Configuration UI
- [ ] Wednesday-Thursday: ERP Integration Framework
- [ ] Friday: CSV Import & Sync History
- [ ] Friday EOD: End-to-end flow working

### Week 4 (Phase 6)
- [ ] Monday: Data Migration
- [ ] Tuesday-Wednesday: Testing
- [ ] Thursday: Bug fixes & polish
- [ ] Friday: Documentation & deployment

---

## Success Metrics

- [ ] Can create and manage multiple catalogs
- [ ] Can import products from CSV
- [ ] Can assign catalog to site
- [ ] Can configure exclusion rules
- [ ] Site shows only filtered products from assigned catalog
- [ ] Filtering responds in <500ms
- [ ] Migration completes without data loss
- [ ] All tests passing
- [ ] Documentation complete

---

## Risks & Blockers

### Current Blockers
- None (ready to start)

### Potential Risks
1. **Data migration complexity** - Mitigated by testing on dev first
2. **Performance with large catalogs** - Mitigated by caching
3. **ERP API variations** - Mitigated by adapter pattern
4. **UI complexity** - Mitigated by iterative approach

---

## Team

- **Lead Developer:** [Name]
- **Backend Developer:** [Name]
- **Frontend Developer:** [Name]
- **QA Engineer:** [Name]
- **Product Owner:** [Name]

---

## Communication

- **Daily Standup:** 9:00 AM
- **Weekly Review:** Friday 3:00 PM
- **Slack Channel:** #multi-catalog-project
- **Documentation:** This file + detailed plan

---

**STATUS:** 🟢 READY TO START  
**NEXT:** Begin Phase 1 - Create type definitions  
**UPDATED:** February 11, 2026

---

**Let's ship this! 🚀**
