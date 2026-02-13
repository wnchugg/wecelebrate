# Quick Testing Checklist ✅

**Quick reference for testing the Multi-Catalog Architecture**

---

## 🚀 Quick Start Testing

### Prerequisites Check
```bash
□ Backend server running
□ Frontend dev server running  
□ Admin user authenticated
□ Test data loaded
□ Browser DevTools open
```

---

## Phase 1: Backend API Testing (30 min)

### Catalog CRUD
```bash
□ POST /catalogs - Create catalog
□ GET /catalogs - List all catalogs
□ GET /catalogs/:id - Get specific catalog
□ PUT /catalogs/:id - Update catalog
□ DELETE /catalogs/:id - Delete catalog
□ GET /catalogs/:id/stats - Get statistics
```

### Site Configuration
```bash
□ POST /sites/:siteId/catalog-config - Create config
□ GET /sites/:siteId/catalog-config - Get config
□ PUT /sites/:siteId/catalog-config - Update config
□ DELETE /sites/:siteId/catalog-config - Delete config
```

### Migration
```bash
□ GET /migration/status - Check status
□ POST /migration/run - Run migration
□ POST /migration/rollback - Rollback (dev only)
```

---

## Phase 2: Frontend UI Testing (45 min)

### Catalog Management (`/admin/catalogs`)
```bash
□ Page loads without errors
□ Catalogs display in cards
□ Search works
□ Filter by status works
□ Filter by type works
□ "Create Catalog" button visible
□ Can navigate to create page
□ Can edit existing catalog
□ Can delete catalog (soft delete)
□ Empty state displays correctly
```

### Catalog Create/Edit (`/admin/catalogs/create`)
```bash
□ Form loads correctly
□ All fields present
□ Required field validation works
□ Can fill in basic info
□ Can configure source
□ Can set sync settings
□ Can configure pricing
□ Save button works
□ Success message appears
□ Redirects after save
□ Edit mode pre-populates data
□ Cancel button works
```

### Catalog Migration (`/admin/catalogs/migrate`)
```bash
□ Page loads status correctly
□ Statistics display
□ "What is migration?" section visible
□ Can select default catalog
□ "Run Migration" button works
□ Confirmation dialog appears
□ Migration executes successfully
□ Progress indicator shows (if applicable)
□ Success message appears
□ Statistics update after migration
□ Status changes to "Completed"
□ "Rollback" button shows in dev only
```

### Site Catalog Configuration (`/admin/site-catalog-configuration`)
```bash
□ Page requires site selection
□ Warning shown if no site selected
□ Catalog dropdown loads options
□ Can select catalog
□ Info box displays catalog details
□ Configuration sections appear
□ Can add category exclusions
□ Can add SKU exclusions
□ Can add tag exclusions
□ Can add brand exclusions
□ Can remove exclusions (X button)
□ Pills display correctly
□ Enter key adds exclusions
□ Duplicate prevention works
□ Price override checkbox works
□ Price adjustment field appears/hides
□ Availability checkboxes work
□ Numeric fields validate
□ Save button disabled when no catalog
□ Save button works
□ Success message appears
□ Reset button works
□ Data persists after save
```

---

## Phase 3: Integration Testing (30 min)

### End-to-End Workflow
```bash
□ Create new catalog via UI
□ Verify catalog in database (API call)
□ Run migration
□ Verify products migrated (check backend)
□ Configure site catalog
□ Verify configuration saved (API call)
□ Load site config again
□ Verify all settings loaded correctly
```

### Navigation Integration
```bash
□ "Catalog Management" link in sidebar
□ "Catalog Migration" link in sidebar
□ "Site Catalog" link in sidebar (site-specific)
□ Active page highlighted in navigation
□ Can navigate between pages
□ Breadcrumbs work (if present)
□ Back button works
□ URL updates correctly
```

### Site Context Integration
```bash
□ Site selector works
□ Current site displays in header
□ Switching sites updates config page
□ Site-specific data loads correctly
□ No data cross-contamination between sites
```

---

## Phase 4: Error Handling (15 min)

### Network Errors
```bash
□ Disconnect network during save
□ Error message displays
□ Retry option available
□ Reconnect and retry works
```

### Validation Errors
```bash
□ Empty required field → Error message
□ Invalid data type → Error message
□ Out of range value → Error message
□ Duplicate name → Error message
```

### Not Found Errors
```bash
□ Invalid catalog ID → 404 message
□ Missing site config → Appropriate message
□ Deleted catalog → Graceful handling
```

### Permission Errors
```bash
□ No auth token → 401 redirect
□ Invalid token → 401 redirect
□ Non-admin user → 403 message
```

---

## Phase 5: Edge Cases (20 min)

### Data Edge Cases
```bash
□ Catalog with 0 products
□ Catalog with 10,000+ products
□ Site with 100+ exclusions
□ Special characters in names
□ Very long names (255+ chars)
□ Extreme price adjustments (±100%)
□ Negative inventory values
```

### UI Edge Cases
```bash
□ Narrow viewport (mobile)
□ Very wide viewport (4K monitor)
□ Long catalog name wrapping
□ Many pills/tags display correctly
□ Empty search results
□ Loading states
□ Disabled button states
```

### Concurrent Operations
```bash
□ Two admins edit same catalog
□ Save during ongoing migration
□ Delete catalog in use by site
□ Rapid clicking save button
```

---

## Phase 6: Performance Testing (15 min)

### Page Load Times
```bash
□ Catalog Management < 2 seconds
□ Catalog Edit < 2 seconds
□ Migration Tool < 2 seconds
□ Site Configuration < 2 seconds
```

### API Response Times
```bash
□ GET /catalogs < 500ms
□ POST /catalogs < 1 second
□ Migration < 30 seconds (1000 products)
□ Site config save < 1 second
```

### User Experience
```bash
□ No UI freezing
□ Smooth scrolling
□ Responsive interactions
□ No memory leaks (check DevTools)
```

---

## Phase 7: Security Testing (10 min)

### Authentication
```bash
□ Unauthenticated access blocked
□ Expired token handled
□ Invalid token rejected
□ Admin-only access enforced
```

### Input Validation
```bash
□ SQL injection attempts blocked
□ XSS attempts sanitized
□ Script tags escaped
□ HTML injection prevented
```

### Data Protection
```bash
□ Credentials not in frontend
□ Credentials not in API responses
□ Sensitive data encrypted
□ No data in error messages
```

---

## Phase 8: Cross-Browser Testing (20 min)

### Browser Compatibility
```bash
Chrome:
□ All features work
□ UI displays correctly
□ Performance good

Firefox:
□ All features work
□ UI displays correctly
□ Performance good

Safari:
□ All features work
□ UI displays correctly
□ Performance good

Edge:
□ All features work
□ UI displays correctly
□ Performance good
```

---

## Phase 9: Accessibility Testing (15 min)

### Keyboard Navigation
```bash
□ Can tab through all fields
□ Can submit forms with Enter
□ Focus indicators visible
□ Logical tab order
□ Escape closes dialogs
```

### Screen Reader
```bash
□ Form labels read correctly
□ Error messages announced
□ Success messages announced
□ Buttons have descriptive text
□ Icons have alt text
```

### Visual Accessibility
```bash
□ Sufficient color contrast
□ Text readable at 200% zoom
□ No color-only indicators
□ Focus visible
```

---

## Phase 10: Mobile Testing (15 min)

### Mobile Responsiveness
```bash
□ Layout adapts to mobile
□ Text readable (no horizontal scroll)
□ Buttons touchable (44x44px min)
□ Forms usable on mobile
□ Dropdowns work on mobile
□ Pills/tags wrap correctly
□ Navigation accessible
```

### Touch Interactions
```bash
□ Tap targets adequate size
□ Swipe gestures work (if any)
□ No hover-only interactions
□ Virtual keyboard doesn't break layout
```

---

## Critical Path Test (10 min)

**Must pass before deployment:**

```bash
1. □ Create catalog successfully
2. □ Run migration successfully
3. □ Assign catalog to site successfully
4. □ Add exclusions successfully
5. □ Save configuration successfully
6. □ Load configuration correctly
7. □ Edit configuration successfully
8. □ Switch between sites correctly
9. □ All API calls authenticated
10. □ No console errors
```

---

## Smoke Test (5 min)

**Quick verification after deployment:**

```bash
□ Can log in as admin
□ Can access /admin/catalogs
□ Catalogs display
□ Can access /admin/catalogs/create
□ Can access /admin/catalogs/migrate
□ Migration status loads
□ Can access /admin/site-catalog-configuration
□ Site config loads
□ No 404 errors
□ No 500 errors
□ No console errors
```

---

## Regression Test (30 min)

**Test after any bug fixes:**

```bash
□ Original bug is fixed
□ Related functionality still works
□ No new bugs introduced
□ Performance not degraded
□ UI still correct
□ All integrations work
□ Type safety maintained
```

---

## Pre-Deployment Checklist

```bash
□ All critical tests passing
□ No console errors
□ No console warnings (critical)
□ TypeScript compiles (0 errors)
□ Lint passes
□ Build succeeds
□ All APIs responding
□ Environment variables set
□ Database migrations run
□ Backup created
□ Rollback plan ready
□ Documentation updated
□ Team notified
```

---

## Test Execution Tracking

### Session Info
```
Date: _______________
Tester: _______________
Environment: _______________
Browser: _______________
Duration: _______________
```

### Results Summary
```
Total Tests: _____
Passed: _____
Failed: _____
Blocked: _____
Skipped: _____
Pass Rate: _____%
```

### Critical Issues Found
```
1. _________________________________
2. _________________________________
3. _________________________________
```

### Notes
```
_________________________________________
_________________________________________
_________________________________________
```

### Sign-Off
```
□ Ready for next phase
□ Needs fixes before proceeding
□ Blocked - cannot continue

Tester Signature: _______________
Date: _______________
```

---

## Quick Command Reference

### Start Testing Session
```bash
# Terminal 1: Start backend
cd supabase/functions
deno run --allow-all server/index.tsx

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Open browser
open http://localhost:5173/admin/catalogs
```

### Check Logs
```bash
# Backend logs
tail -f server.log

# Frontend logs
# Open browser DevTools → Console
```

### Test Data Reset
```bash
# Clear test data
npm run test:reset-data

# Load test data
npm run test:load-data
```

---

## Quick Bug Report Template

```markdown
**BUG-XXX:** [Brief Description]

**Priority:** Critical / High / Medium / Low
**Steps:**
1. Step one
2. Step two
3. Step three

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Screenshot:** [Attach if helpful]
```

---

## Testing Tips 💡

### Efficient Testing
1. ✅ Start with smoke test
2. ✅ Then critical path
3. ✅ Then comprehensive tests
4. ✅ Document as you go
5. ✅ Take screenshots of bugs

### Common Issues to Check
1. ✅ Console errors
2. ✅ Network failures
3. ✅ Loading states
4. ✅ Error messages
5. ✅ Data persistence
6. ✅ Navigation
7. ✅ Authentication

### Best Practices
1. ✅ Test in clean environment
2. ✅ Clear browser cache
3. ✅ Use incognito mode
4. ✅ Test with real data
5. ✅ Test edge cases
6. ✅ Test on real devices
7. ✅ Document everything

---

**Total Testing Time:** ~4-5 hours for complete coverage  
**Minimum Time:** ~30 minutes for critical path + smoke test

**Use this checklist to ensure thorough testing of the multi-catalog architecture!** ✅

