# ✅ Day 2 Testing Checklist - Client & Site Management

Use this checklist to verify all features work correctly after Day 2 implementation.

---

## 🧪 Client Management Testing

### ✅ Page Load & Display
- [ ] Navigate to `/admin/clients`
- [ ] Page loads without errors
- [ ] Stats dashboard displays (Total, Active, Sites, Inactive)
- [ ] Client list loads from backend
- [ ] Loading spinner shows while data loads
- [ ] Empty state shows if no clients exist

### ✅ Create Client
- [ ] Click "Add Client" button
- [ ] Modal opens
- [ ] Form fields render correctly
- [ ] Click "Cancel" - modal closes without saving
- [ ] Click "Add Client" again
- [ ] Try to submit empty form - validation error shows
- [ ] Fill in required field (Name)
- [ ] Fill in optional fields (Description, Email, Phone, Address)
- [ ] Toggle Active/Inactive switch
- [ ] Submit form
- [ ] Success toast appears
- [ ] Modal closes
- [ ] New client appears in list
- [ ] Stats update correctly

### ✅ Edit Client
- [ ] Click edit icon on existing client
- [ ] Modal opens with pre-filled data
- [ ] Modify name
- [ ] Modify description
- [ ] Change contact info
- [ ] Toggle active status
- [ ] Submit form
- [ ] Success toast appears
- [ ] Changes reflected in list
- [ ] Stats update if status changed

### ✅ Delete Client
- [ ] Create test client with NO sites
- [ ] Click delete icon
- [ ] Confirmation dialog appears
- [ ] Cancel - nothing happens
- [ ] Click delete again
- [ ] Confirm deletion
- [ ] Success toast appears
- [ ] Client removed from list
- [ ] Stats update correctly

### ✅ Delete Protection (Cascade)
- [ ] Create client
- [ ] Create site for that client
- [ ] Try to delete client
- [ ] Error toast shows: "Cannot delete client with X site(s)"
- [ ] Client remains in list
- [ ] Delete the site first
- [ ] Now delete client succeeds

### ✅ Search & Filter
- [ ] Create multiple clients (at least 3)
- [ ] Type in search box - list filters in real-time
- [ ] Clear search - full list returns
- [ ] Select "Active Only" - only active clients show
- [ ] Select "Inactive Only" - only inactive clients show
- [ ] Select "All Clients" - all show
- [ ] Combine search + filter - both work together

### ✅ View Client Sites
- [ ] Create client with at least 2 sites
- [ ] Click "X Sites" link on client card
- [ ] Redirects to `/admin/sites?client={id}`
- [ ] Site list filtered to that client's sites only

### ✅ UI/UX Details
- [ ] Client avatar shows first letter
- [ ] Active badge is green
- [ ] Inactive badge is gray
- [ ] Contact info displays correctly (email, phone, address icons)
- [ ] Site badges show under client (first 5 + count)
- [ ] Hover effects work on cards
- [ ] Mobile: Cards stack properly
- [ ] Mobile: Modal is scrollable

---

## 🧪 Site Management Testing

### ✅ Page Load & Display
- [ ] Navigate to `/admin/sites`
- [ ] Page loads without errors
- [ ] Stats dashboard displays (Total, Active, Draft, Inactive)
- [ ] Site table loads from backend
- [ ] Loading spinner shows while data loads
- [ ] Empty state shows if no sites exist

### ✅ Create Site
- [ ] Click "Create New Site" button
- [ ] Modal opens
- [ ] Form fields render correctly
- [ ] Client dropdown populated with active clients only
- [ ] Color pickers show default colors
- [ ] Try to submit empty form - validation errors
- [ ] Fill in Name (required)
- [ ] Select Client (required)
- [ ] Fill in Domain
- [ ] Fill in Description
- [ ] Change primary color using color picker
- [ ] Change primary color using hex input
- [ ] Change secondary color
- [ ] Select validation method (email/employeeId/serialCard/magicLink)
- [ ] Select status (draft/active/inactive)
- [ ] Submit form
- [ ] Success toast appears
- [ ] Modal closes
- [ ] New site appears in table
- [ ] Stats update correctly

### ✅ Edit Site
- [ ] Click edit icon on existing site
- [ ] Modal opens with pre-filled data
- [ ] All fields show correct values
- [ ] Color pickers show correct colors
- [ ] Modify name
- [ ] Change client
- [ ] Change domain
- [ ] Change colors
- [ ] Change validation method
- [ ] Change status
- [ ] Submit form
- [ ] Success toast appears
- [ ] Changes reflected in table
- [ ] Stats update if status changed

### ✅ Delete Site
- [ ] Click ⋮ menu on site
- [ ] Click "Delete Site"
- [ ] Confirmation dialog appears
- [ ] Cancel - nothing happens
- [ ] Click delete again
- [ ] Confirm deletion
- [ ] Success toast appears
- [ ] Site removed from table
- [ ] Stats update correctly

### ✅ Toggle Status (Activate/Deactivate)
- [ ] Find active site
- [ ] Click ⋮ menu → "Deactivate Site"
- [ ] Success toast appears
- [ ] Status badge changes to "inactive"
- [ ] Stats update (Active count decreases)
- [ ] Click ⋮ menu → "Activate Site"
- [ ] Status changes back to "active"
- [ ] Stats update (Active count increases)

### ✅ Duplicate Site
- [ ] Click ⋮ menu → "Duplicate Site"
- [ ] Success toast appears
- [ ] New site appears with "(Copy)" suffix
- [ ] New site has status "draft"
- [ ] Domain updated with "-copy" suffix
- [ ] All other settings copied
- [ ] Original site unchanged

### ✅ Search & Filter
- [ ] Create multiple sites (at least 5)
- [ ] Type in search box - table filters by name
- [ ] Search by client name - works
- [ ] Search by domain - works
- [ ] Clear search - full list returns
- [ ] Select status filter "Active" - only active sites show
- [ ] Select status filter "Draft" - only draft sites show
- [ ] Select status filter "Inactive" - only inactive sites show
- [ ] Select client filter - only that client's sites show
- [ ] Combine search + status filter + client filter - all work together
- [ ] Clear filters - full list returns

### ✅ URL Parameters
- [ ] Manually navigate to `/admin/sites?status=active`
- [ ] Only active sites show
- [ ] Status filter dropdown shows "Active"
- [ ] Navigate to `/admin/sites?client={clientId}`
- [ ] Only that client's sites show
- [ ] Client filter dropdown shows that client
- [ ] Navigate to `/admin/sites?status=draft&client={clientId}`
- [ ] Both filters applied correctly

### ✅ Manage Gifts Link
- [ ] Click ⋮ menu → "Manage Gifts"
- [ ] Redirects to `/admin/sites/{id}/manage-gifts`
- [ ] (Page may not be built yet - just verify navigation works)

### ✅ UI/UX Details
- [ ] Site avatar uses branding color
- [ ] Status badge colors correct (green/amber/gray)
- [ ] Client name displayed correctly
- [ ] Domain displayed with globe icon
- [ ] Updated date formatted correctly
- [ ] Dropdown menu shows/hides on click
- [ ] Clicking outside dropdown closes it
- [ ] Table scrolls horizontally on mobile
- [ ] Modal scrolls on mobile
- [ ] Color picker inputs work on mobile
- [ ] Hover effects work on table rows

---

## 🧪 Integration Testing

### ✅ Client → Site Workflow
- [ ] Create new client "Integration Test Co"
- [ ] Navigate to Site Management
- [ ] Create new site
- [ ] Select "Integration Test Co" from client dropdown
- [ ] Complete site creation
- [ ] Navigate back to Client Management
- [ ] Verify site count increased on client card
- [ ] Click "View Sites" on client
- [ ] Verify site appears in filtered list

### ✅ Site → Client Workflow
- [ ] Create site
- [ ] Note the client it's assigned to
- [ ] Try to delete that client
- [ ] Verify cascade protection works
- [ ] Delete the site
- [ ] Now delete client succeeds

### ✅ Employee Management Integration
- [ ] Create client and site
- [ ] Navigate to Employee Management
- [ ] Verify new site appears in site selector
- [ ] Select the site
- [ ] Verify employee import works
- [ ] Navigate back to Site Management
- [ ] Verify site still shows correct data

---

## 🧪 Error Handling Testing

### ✅ Network Errors
- [ ] Open DevTools Network tab
- [ ] Set network to "Offline"
- [ ] Try to load Client Management
- [ ] Verify error message displays
- [ ] Try to create client
- [ ] Verify error toast appears
- [ ] Set network back to "Online"
- [ ] Refresh page
- [ ] Verify data loads correctly

### ✅ Validation Errors
- [ ] Try to create client with empty name
- [ ] Verify error message
- [ ] Try to create site without selecting client
- [ ] Verify error message
- [ ] Enter invalid hex color (e.g., "zzz")
- [ ] Verify validation handles it

### ✅ Backend Errors
- [ ] If backend returns 500 error
- [ ] Verify error toast appears
- [ ] Verify error message is user-friendly
- [ ] Verify UI doesn't break

---

## 🧪 Performance Testing

### ✅ Large Dataset
- [ ] Create 50+ clients (can use bulk insert via backend)
- [ ] Navigate to Client Management
- [ ] Verify page loads in < 2 seconds
- [ ] Verify search is instant
- [ ] Verify scrolling is smooth
- [ ] Create 100+ sites
- [ ] Navigate to Site Management
- [ ] Verify table renders in < 3 seconds
- [ ] Verify filtering is instant

---

## 🧪 Mobile Responsiveness

### ✅ Client Management Mobile
- [ ] Open on mobile device or responsive mode (320px width)
- [ ] Stats cards stack vertically
- [ ] Search and filter stack vertically
- [ ] Client cards are full width
- [ ] Action buttons visible
- [ ] Modal fits screen
- [ ] Form inputs are touch-friendly
- [ ] All text readable

### ✅ Site Management Mobile
- [ ] Table scrolls horizontally
- [ ] Stats cards stack vertically
- [ ] Filters stack vertically
- [ ] Dropdown menus position correctly
- [ ] Modal fits screen
- [ ] Color picker works on touch
- [ ] Form inputs are touch-friendly

---

## 🧪 Browser Compatibility

Test in each browser:

### ✅ Chrome
- [ ] All features work
- [ ] Color picker works
- [ ] No console errors

### ✅ Firefox
- [ ] All features work
- [ ] Color picker works
- [ ] No console errors

### ✅ Safari
- [ ] All features work
- [ ] Color picker works
- [ ] No console errors

### ✅ Edge
- [ ] All features work
- [ ] Color picker works
- [ ] No console errors

---

## 🧪 Accessibility Testing

### ✅ Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Can open modals with Enter
- [ ] Can close modals with Escape
- [ ] Can navigate dropdown menus
- [ ] Focus indicators visible

### ✅ Screen Reader
- [ ] Form labels read correctly
- [ ] Button purposes announced
- [ ] Status changes announced
- [ ] Error messages announced

### ✅ Color Contrast
- [ ] Text readable on all backgrounds
- [ ] Status badges meet WCAG AA
- [ ] Links distinguishable

---

## 🧪 Data Persistence

### ✅ Refresh Testing
- [ ] Create client
- [ ] Refresh page (F5)
- [ ] Verify client still exists
- [ ] Edit client
- [ ] Refresh page
- [ ] Verify changes persisted
- [ ] Same tests for sites

### ✅ Multi-Tab Testing
- [ ] Open Client Management in 2 tabs
- [ ] Create client in Tab 1
- [ ] Refresh Tab 2
- [ ] Verify client appears
- [ ] Edit in Tab 1
- [ ] Refresh Tab 2
- [ ] Verify changes reflected

---

## 📊 Test Results Summary

After completing all tests, fill out:

**Date Tested:** _____________  
**Tested By:** _____________  
**Environment:** [ ] Development [ ] Production

### Pass/Fail Summary:
- Client Management: ____ / ____ tests passed
- Site Management: ____ / ____ tests passed
- Integration: ____ / ____ tests passed
- Error Handling: ____ / ____ tests passed
- Performance: ____ / ____ tests passed
- Mobile: ____ / ____ tests passed
- Browser Compat: ____ / ____ tests passed
- Accessibility: ____ / ____ tests passed
- Data Persistence: ____ / ____ tests passed

**Overall Status:** [ ] ✅ Ready for Production [ ] ⚠️ Issues Found [ ] ❌ Critical Bugs

### Issues Found:
1. _______________________________________
2. _______________________________________
3. _______________________________________

### Notes:
_____________________________________________
_____________________________________________
_____________________________________________

---

## 🎯 Success Criteria

Day 2 is considered **COMPLETE** when:
- [ ] All Client Management CRUD operations work
- [ ] All Site Management CRUD operations work
- [ ] Search and filtering work on both pages
- [ ] Error handling works correctly
- [ ] Mobile responsive on both pages
- [ ] Data persists across page refreshes
- [ ] No console errors
- [ ] Backend integration confirmed

**Status:** _________ ✅❌⏳

---

*Testing Checklist v1.0 - Created February 7, 2026*
