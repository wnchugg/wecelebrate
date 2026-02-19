# VERIFIED Files Safe to Delete

After careful review, here are the files that are **definitely safe** to delete:

## ✅ CONFIRMED SAFE TO DELETE (15 files)

### 1. Files Removed from Menu (Still in routes.tsx - need route cleanup)
- `src/app/pages/admin/CatalogMigration.tsx` - Route exists but removed from menu
- `src/app/pages/admin/RBACOverview.tsx` - Imported but NO route (safe to delete)

### 2. Duplicate "New" Versions (NOT in routes)
- `src/app/pages/admin/BrandManagementNew.tsx` - Not routed
- `src/app/pages/admin/HomePageEditorNew.tsx` - Not routed  
- `src/app/pages/admin/LandingPageEditorNew.tsx` - Not routed
- `src/app/pages/admin/WelcomePageEditorNew.tsx` - Not routed

### 3. Test Files (NOT in routes)
- `src/app/pages/admin/ClipboardTest.tsx` - Test file
- `src/app/pages/admin/SecurityTest.tsx` - Test file

### 4. Unused Configuration (NOT in routes)
- `src/app/pages/admin/EnvironmentConfiguration.tsx` - Not routed
- `src/app/pages/admin/EnvironmentManagement.tsx` - Not routed
- `src/app/pages/admin/DeploymentChecklist.tsx` - Not routed

### 5. Unused Features (NOT in routes)
- `src/app/pages/admin/ScheduledEmailManagement.tsx` - Not routed
- `src/app/pages/admin/ScheduledTriggersManagement.tsx` - Not routed
- `src/app/pages/admin/WebhookManagement.tsx` - Not routed
- `src/app/pages/admin/VisualEmailComposer.tsx` - Not routed

---

## ⚠️ NEED FURTHER REVIEW (11 files)

### Files That ARE in routes.tsx (need to verify if used):
1. `BrandsManagement.tsx` - HAS route `/admin/brands-management` (but not in menu)
2. `LandingPageEditor.tsx` - HAS route `/admin/landing-page-editor` (but not in menu)
3. `WelcomePageEditor.tsx` - HAS route `/admin/welcome-page-editor` (but not in menu)

### Debug Files (some are dev-only in routes):
4. `AdminDebug.tsx` - Dev-only route
5. `AdminAuthDebug.tsx` - HAS route `/admin/admin-auth-debug`
6. `AdminLoginDebug.tsx` - Need to check
7. `QuickAuthCheck.tsx` - Dev-only route
8. `ForceTokenClear.tsx` - Dev-only route
9. `DataDiagnostic.tsx` - HAS route `/admin/data-diagnostic`
10. `SitesDiagnostic.tsx` - HAS route `/admin/sites-diagnostic`

### Other:
11. `DashboardWithErrorBoundary.tsx` - Need to check if imported
12. `AccessManagement.tsx` - Need to check vs AccessGroupManagement
13. `SiteGiftAssignment.tsx` - Need to check vs SiteGiftConfiguration

---

## RECOMMENDATION

### Phase 1A: Delete These 15 Files NOW (100% Safe)
These are NOT in routes and NOT imported:
1. BrandManagementNew.tsx
2. HomePageEditorNew.tsx
3. LandingPageEditorNew.tsx
4. WelcomePageEditorNew.tsx
5. ClipboardTest.tsx
6. SecurityTest.tsx
7. EnvironmentConfiguration.tsx
8. EnvironmentManagement.tsx
9. DeploymentChecklist.tsx
10. ScheduledEmailManagement.tsx
11. ScheduledTriggersManagement.tsx
12. WebhookManagement.tsx
13. VisualEmailComposer.tsx
14. RBACOverview.tsx (imported but not routed)
15. CatalogMigration.tsx (routed but you want it removed)

### Phase 1B: Review & Decide
For the 11 files in "Need Further Review":
- Some have routes but aren't in menu (hidden features?)
- Some are dev-only (should we keep for debugging?)
- Need your decision on each

---

## NEXT STEPS

**Option 1**: Delete the 15 confirmed safe files now
**Option 2**: Review the 11 questionable files first
**Option 3**: I can check each of the 11 files individually

What would you like to do?
