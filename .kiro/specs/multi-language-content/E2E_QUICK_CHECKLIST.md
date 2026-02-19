# Multi-Language E2E Testing - Quick Checklist

## Quick Start
1. Start dev server: `npm run dev`
2. Open admin dashboard
3. Open public site in another tab
4. Have this checklist ready

---

## 16.1 Admin Workflow (5-10 minutes)

### Language Configuration
- [ ] Select 3-5 languages
- [ ] Set default language
- [ ] Try to uncheck default (should fail)
- [ ] Change default language
- [ ] Search/filter works

### Translation Input
- [ ] Enter English translations for Header (3 fields)
- [ ] Enter English translations for Welcome Page (3 fields)
- [ ] Enter Spanish translations for same fields
- [ ] Use "Copy from default" button
- [ ] Leave some translations empty (for fallback testing)
- [ ] Character count displays correctly
- [ ] Status indicators show correctly

### Progress Tracking
- [ ] Progress bars display for each language
- [ ] Percentages are reasonable
- [ ] Updates in real-time

### Draft/Publish
- [ ] Save draft successfully
- [ ] Refresh page - data persists
- [ ] Try to publish with missing required fields (should fail)
- [ ] Fill required fields
- [ ] Publish successfully

---

## 16.2 Public Site Workflow (5-10 minutes)

### Language Switching
- [ ] Language selector shows only configured languages
- [ ] Switch to Spanish - content updates
- [ ] Switch to French - content updates
- [ ] Language persists after page refresh
- [ ] Language persists across navigation

### Fallback Testing
- [ ] Select language with partial translations
- [ ] Missing translations show default language
- [ ] No empty strings or undefined values
- [ ] Console shows fallback warnings

### RTL Testing (if Arabic configured)
- [ ] Select Arabic
- [ ] Layout mirrors to RTL
- [ ] Text is right-aligned
- [ ] Switch back to English - returns to LTR

---

## 16.3 Priority Sections (10-15 minutes)

### Quick Test (2 languages minimum)

**Global Components:**
- [ ] Header: Logo alt, nav links, CTA button
- [ ] Footer: Text, links

**Pages (test at least 5):**
- [ ] Welcome Page: Title, message, button
- [ ] Landing Page: Hero title, subtitle, CTA
- [ ] Catalog Page: Title, description, empty message
- [ ] Cart Page: Title, empty message, buttons, labels
- [ ] Not Found Page: Title, message, buttons

**Optional (if time permits):**
- [ ] Access Validation Page
- [ ] Product Detail Page
- [ ] Checkout Page
- [ ] Review Order Page
- [ ] Confirmation Page
- [ ] Order History Page
- [ ] Order Tracking Page
- [ ] Privacy Policy Page
- [ ] Selection Period Expired Page

---

## Critical Checks

### Must Pass
- [ ] No console errors
- [ ] No broken UI
- [ ] No empty strings displayed
- [ ] Language switching works
- [ ] Draft/publish workflow works
- [ ] Validation prevents invalid publish

### Should Pass
- [ ] All 16 sections have translations
- [ ] Fallback chain works correctly
- [ ] RTL layout works (if applicable)
- [ ] Progress tracking is accurate
- [ ] Real-time updates work

---

## Time Estimate
- **Minimum:** 20 minutes (quick smoke test)
- **Recommended:** 30-45 minutes (thorough test)
- **Complete:** 60-90 minutes (all sections, all languages)

---

## Quick Issue Log

**Critical:**

**Major:**

**Minor:**

**Notes:**
