# Multi-Language Content Management - E2E Testing Guide

## Overview
This guide provides step-by-step instructions for manually testing the multi-language content management system. Follow each section carefully and document any issues found.

---

## Test Environment Setup

### Prerequisites
1. Development server running (`npm run dev`)
2. Database with migration applied
3. Admin account credentials
4. Test site created in the system

### Browser Requirements
- Test in Chrome/Edge (primary)
- Test in Firefox (secondary)
- Test in Safari (if available)

---

## 16.1 Admin Workflow Testing

### Test Case 1.1: Configure Languages

**Objective:** Verify language configuration functionality

**Steps:**
1. Log in to admin dashboard
2. Navigate to Site Configuration page
3. Locate the "Available Languages" section
4. Click on the MultiLanguageSelector component

**Expected Results:**
- [ ] All 20 supported languages are displayed
- [ ] Search/filter functionality works
- [ ] Default language (English) is visually indicated
- [ ] Default language checkbox cannot be unchecked
- [ ] Selected language count is displayed correctly

**Test Actions:**
1. Select 3-5 languages (e.g., English, Spanish, French, German, Arabic)
2. Try to uncheck the default language (should be prevented)
3. Use search to filter languages
4. Change default language to Spanish using "Set as default" button
5. Verify English checkbox becomes enabled
6. Verify Spanish checkbox cannot be unchecked

**Pass Criteria:**
- All expected results are met
- No console errors
- UI is responsive and intuitive

---

### Test Case 1.2: Enter Translations

**Objective:** Verify translation input functionality across all components

**Steps:**
1. In Site Configuration, locate a TranslatableInput field (e.g., Header > Logo Alt Text)
2. Verify tabs are displayed for each selected language
3. Default language tab should be shown first

**Expected Results:**
- [ ] Tabs displayed for all selected languages
- [ ] Default language tab is first
- [ ] Status indicators show (empty, translated, required)
- [ ] Character count displays correctly
- [ ] "Copy from default language" button is available

**Test Actions:**

#### Header Section
1. Enter English text in "Logo Alt Text": "Company Logo"
2. Switch to Spanish tab
3. Click "Copy from default language" button
4. Modify Spanish text: "Logotipo de la Empresa"
5. Switch to French tab
6. Enter French text: "Logo de l'Entreprise"
7. Leave German and Arabic empty

#### Welcome Page Section
1. Enter English title: "Welcome to Our Store"
2. Enter English message (textarea): "We're glad you're here. Browse our products and find what you need."
3. Enter English button text: "Get Started"
4. Add Spanish translations for all three fields
5. Add French translations for title and button only (leave message empty)

#### Cart Page Section
1. Enter translations for at least 5 fields
2. Test maxLength validation (if applicable)
3. Test required field validation

**Pass Criteria:**
- All inputs accept text correctly
- Tab switching works smoothly
- Copy functionality works
- Character counts are accurate
- Status indicators update correctly

---

### Test Case 1.3: Review Progress

**Objective:** Verify translation progress tracking

**Steps:**
1. Scroll to "Translation Progress" section
2. Review completion percentages for each language

**Expected Results:**
- [ ] Progress bars displayed for each selected language
- [ ] Completion percentages are accurate
- [ ] Color coding: complete (green), incomplete (yellow/red)
- [ ] Count shows completed/total fields
- [ ] Progress updates in real-time as translations are entered

**Test Actions:**
1. Note the completion percentage for Spanish
2. Add a new Spanish translation to any field
3. Verify percentage increases
4. Calculate expected percentage manually and compare
5. Check that default language (English) shows highest completion

**Pass Criteria:**
- Percentages are mathematically correct
- Visual indicators are clear
- Real-time updates work

---

### Test Case 1.4: Save Draft

**Objective:** Verify draft saving functionality

**Steps:**
1. After entering translations, click "Save Draft" button
2. Wait for confirmation message

**Expected Results:**
- [ ] Success message displayed
- [ ] No errors in console
- [ ] Page doesn't reload unnecessarily
- [ ] Draft indicator shows in UI

**Test Actions:**
1. Save draft with partial translations
2. Refresh the page
3. Verify all entered translations are preserved
4. Verify selected languages are preserved
5. Verify default language is preserved
6. Check database (if possible) to confirm draft_settings contains translations

**Pass Criteria:**
- All data persists after refresh
- No data loss
- Draft state is clearly indicated

---

### Test Case 1.5: Publish Validation

**Objective:** Verify publish validation prevents invalid publishes

**Steps:**
1. Ensure some required fields in default language are empty
2. Click "Publish" button

**Expected Results:**
- [ ] Publish is prevented
- [ ] Error message lists specific missing translations
- [ ] Error message is clear and actionable
- [ ] UI highlights missing fields (if implemented)

**Test Actions:**
1. Try to publish with missing default language translations
2. Note the error messages
3. Fill in the missing default language translations
4. Try to publish with missing non-default language translations
5. Verify warning is shown but publish is allowed
6. Complete all default language required fields
7. Publish successfully

**Pass Criteria:**
- Validation prevents invalid publishes
- Error messages are specific
- Warnings don't block publish
- Successful publish works

---

### Test Case 1.6: Publish Success

**Objective:** Verify successful publish workflow

**Steps:**
1. With all required default language translations complete
2. Click "Publish" button

**Expected Results:**
- [ ] Success message displayed
- [ ] Translations copied from draft to live
- [ ] Available languages copied from draft to live
- [ ] Public site immediately reflects changes
- [ ] Draft indicator removed or updated

**Test Actions:**
1. Publish the site
2. Open public site in new tab
3. Verify translations appear
4. Return to admin
5. Make a new change in draft
6. Verify public site doesn't show the new draft change
7. Publish again
8. Verify public site now shows the new change

**Pass Criteria:**
- Publish completes successfully
- Live site updates immediately
- Draft changes don't affect live until published

---

## 16.2 Public Site Workflow Testing

### Test Case 2.1: View Site in Different Languages

**Objective:** Verify language selector and content display

**Steps:**
1. Open public site
2. Locate language selector (usually in header or footer)
3. Verify only configured languages are shown

**Expected Results:**
- [ ] Language selector shows only available languages
- [ ] Current language is indicated
- [ ] Language names are displayed correctly
- [ ] Selector is accessible and usable

**Test Actions:**
1. Note the default language content
2. Select Spanish from language selector
3. Verify all translated content updates
4. Select French
5. Verify content updates again
6. Select a language with partial translations
7. Verify fallback behavior (see next test case)

**Pass Criteria:**
- Only configured languages appear
- Language selection works
- Content updates appropriately

---

### Test Case 2.2: Test Language Switching

**Objective:** Verify language switching updates all content

**Steps:**
1. On public site, switch between languages
2. Navigate to different pages
3. Verify language persists across navigation

**Expected Results:**
- [ ] All content updates when language changes
- [ ] Language preference persists in localStorage
- [ ] Language persists across page navigation
- [ ] Language persists after page refresh
- [ ] No flash of wrong language content

**Test Actions:**
1. Set language to Spanish
2. Navigate to Welcome page → verify Spanish content
3. Navigate to Landing page → verify Spanish content
4. Navigate to Catalog page → verify Spanish content
5. Navigate to Cart page → verify Spanish content
6. Refresh the page → verify Spanish is still selected
7. Open site in new tab → verify Spanish is remembered
8. Clear localStorage → verify defaults to site default language

**Pass Criteria:**
- Language switching is instant
- Persistence works correctly
- No content flashing

---

### Test Case 2.3: Test Fallback Behavior

**Objective:** Verify fallback chain works correctly

**Steps:**
1. Select a language with partial translations (e.g., German with only some fields translated)
2. Navigate through pages
3. Observe which content appears

**Expected Results:**
- [ ] Translated content shows in selected language
- [ ] Missing translations fall back to default language
- [ ] If default missing, falls back to English
- [ ] If English missing, shows first available translation
- [ ] No empty strings or undefined values displayed

**Test Actions:**
1. Select German (assuming partial translations)
2. On Welcome page:
   - If German title exists → should show German
   - If German title missing → should show default language (Spanish or English)
3. Navigate to a page with no German translations
4. Verify all content falls back appropriately
5. Check browser console for fallback warnings (should log missing translations)
6. Verify fallback string is used as last resort

**Pass Criteria:**
- Fallback chain works as designed
- No broken UI
- Console warnings are helpful
- User always sees content

---

### Test Case 2.4: Test RTL Layout

**Objective:** Verify RTL languages display correctly

**Steps:**
1. If Arabic was configured, select Arabic from language selector
2. Observe layout changes

**Expected Results:**
- [ ] Page direction changes to RTL
- [ ] Text alignment is right-aligned
- [ ] Layout mirrors appropriately
- [ ] Icons and images flip correctly
- [ ] Navigation elements are mirrored
- [ ] Forms and inputs work correctly in RTL

**Test Actions:**
1. Select Arabic
2. Navigate through all pages
3. Check Header layout
4. Check Footer layout
5. Check form inputs (if any)
6. Check buttons and CTAs
7. Switch back to LTR language (English)
8. Verify layout returns to LTR

**Pass Criteria:**
- RTL layout is correct
- No layout breaking
- Smooth transition between LTR and RTL

---

## 16.3 Test All 16 Priority Sections

### Test Case 3.1: Header Translations

**Fields to Test:**
- Logo Alt Text
- Home Link
- Products Link
- About Link
- Contact Link
- CTA Button

**Test Actions:**
1. Verify each field displays translated content
2. Test in at least 2 languages
3. Test fallback for missing translations

**Pass:** [ ]

---

### Test Case 3.2: Welcome Page Translations

**Fields to Test:**
- Title
- Message
- Button Text

**Test Actions:**
1. Navigate to Welcome page
2. Switch languages
3. Verify all fields update
4. Test with partial translations

**Pass:** [ ]

---

### Test Case 3.3: Landing Page Translations

**Fields to Test:**
- Hero Title
- Hero Subtitle
- Hero CTA

**Test Actions:**
1. Navigate to Landing page
2. Switch languages
3. Verify hero section updates
4. Check visual layout with different text lengths

**Pass:** [ ]

---

### Test Case 3.4: Access Validation Page Translations

**Fields to Test:**
- Title
- Description
- Button Text
- Error Message
- Success Message

**Test Actions:**
1. Navigate to Access Validation page
2. Switch languages
3. Trigger error message (if possible)
4. Trigger success message (if possible)
5. Verify all states show translated content

**Pass:** [ ]

---

### Test Case 3.5: Catalog Page Translations

**Fields to Test:**
- Title
- Description
- Empty Message
- Filter All Text
- Search Placeholder

**Test Actions:**
1. Navigate to Catalog/Products page
2. Switch languages
3. Test with products present
4. Test with no products (empty state)
5. Verify search placeholder updates

**Pass:** [ ]

---

### Test Case 3.6: Product Detail Page Translations

**Fields to Test:**
- Back Button
- Add to Cart
- Buy Now
- Out of Stock
- Specifications
- Description

**Test Actions:**
1. Navigate to a product detail page
2. Switch languages
3. Verify all buttons and labels update
4. Test out of stock state (if possible)

**Pass:** [ ]

---

### Test Case 3.7: Cart Page Translations

**Fields to Test:**
- Title
- Empty Message
- Empty Description
- Browse Button
- Remove Button
- Clear Cart Button
- Subtotal Label
- Shipping Label
- Tax Label
- Total Label
- Checkout Button
- Continue Shopping Button
- Security Notice

**Test Actions:**
1. Navigate to Cart page
2. Test with empty cart
3. Add items to cart
4. Test with items in cart
5. Switch languages in both states
6. Verify all labels and buttons update

**Pass:** [ ]

---

### Test Case 3.8: Checkout Page Translations

**Fields to Test:**
- Title
- Shipping Title
- Payment Title
- Order Summary
- Place Order Button
- Free Shipping Message

**Test Actions:**
1. Navigate to Checkout page
2. Switch languages
3. Verify all section headings update
4. Verify buttons update
5. Check free shipping message (if applicable)

**Pass:** [ ]

---

### Test Case 3.9: Review Order Page Translations

**Fields to Test:**
- Title
- Instructions
- Confirm Button
- Edit Button
- Shipping Label
- Items Label

**Test Actions:**
1. Navigate to Review Order page
2. Switch languages
3. Verify all labels and buttons update
4. Test edit functionality (if applicable)

**Pass:** [ ]

---

### Test Case 3.10: Confirmation Page Translations

**Fields to Test:**
- Title
- Message
- Order Number Label
- Tracking Label
- Next Steps
- Continue Button

**Test Actions:**
1. Navigate to Confirmation page (complete an order if needed)
2. Switch languages
3. Verify all content updates
4. Check that dynamic content (order numbers) still displays

**Pass:** [ ]

---

### Test Case 3.11: Order History Page Translations

**Fields to Test:**
- Title
- Description
- Empty Title
- Empty Message
- Browse Button
- View Details Button
- Status labels (Pending, Confirmed, Shipped, Delivered, Cancelled)

**Test Actions:**
1. Navigate to Order History page
2. Test with no orders (empty state)
3. Test with orders present
4. Switch languages in both states
5. Verify status labels update

**Pass:** [ ]

---

### Test Case 3.12: Order Tracking Page Translations

**Fields to Test:**
- Title
- Order Number Label
- Placed On Label
- Status Label
- Order Placed Label & Description
- Order Confirmed Label & Description
- Shipped Label & Description
- Delivered Label & Description
- Tracking Number Label
- Estimated Delivery Label
- Gift Details Label
- Shipping Address Label
- Return Home Button
- Print Button
- Support Message

**Test Actions:**
1. Navigate to Order Tracking page
2. Switch languages
3. Verify all status labels update
4. Verify all timeline descriptions update
5. Check buttons update

**Pass:** [ ]

---

### Test Case 3.13: Not Found Page Translations

**Fields to Test:**
- Title
- Message
- Home Button
- Admin Login Button
- Client Portal Button

**Test Actions:**
1. Navigate to a non-existent URL (trigger 404)
2. Switch languages
3. Verify all content updates
4. Test all buttons work

**Pass:** [ ]

---

### Test Case 3.14: Privacy Policy Page Translations

**Fields to Test:**
- Title
- Last Updated
- Introduction Title
- Introduction Text
- Information Collected Title
- How We Use Title
- Your Rights Title
- Data Security Title
- Contact Title
- Privacy Settings Button

**Test Actions:**
1. Navigate to Privacy Policy page
2. Switch languages
3. Verify all section headings update
4. Verify all content updates
5. Check button updates

**Pass:** [ ]

---

### Test Case 3.15: Selection Period Expired Page Translations

**Fields to Test:**
- Title
- Message
- Contact Message
- Return Home Button

**Test Actions:**
1. Navigate to Selection Period Expired page
2. Switch languages
3. Verify all content updates
4. Test button works

**Pass:** [ ]

---

### Test Case 3.16: Footer Translations

**Fields to Test:**
- Text
- Privacy Link
- Terms Link
- Contact Link

**Test Actions:**
1. Check footer on any page
2. Switch languages
3. Verify footer content updates
4. Verify links update
5. Check footer on multiple pages

**Pass:** [ ]

---

## Test Results Summary

### Admin Workflow (16.1)
- [ ] Test Case 1.1: Configure Languages
- [ ] Test Case 1.2: Enter Translations
- [ ] Test Case 1.3: Review Progress
- [ ] Test Case 1.4: Save Draft
- [ ] Test Case 1.5: Publish Validation
- [ ] Test Case 1.6: Publish Success

### Public Site Workflow (16.2)
- [ ] Test Case 2.1: View Site in Different Languages
- [ ] Test Case 2.2: Test Language Switching
- [ ] Test Case 2.3: Test Fallback Behavior
- [ ] Test Case 2.4: Test RTL Layout

### Priority Sections (16.3)
- [ ] Test Case 3.1: Header
- [ ] Test Case 3.2: Welcome Page
- [ ] Test Case 3.3: Landing Page
- [ ] Test Case 3.4: Access Validation Page
- [ ] Test Case 3.5: Catalog Page
- [ ] Test Case 3.6: Product Detail Page
- [ ] Test Case 3.7: Cart Page
- [ ] Test Case 3.8: Checkout Page
- [ ] Test Case 3.9: Review Order Page
- [ ] Test Case 3.10: Confirmation Page
- [ ] Test Case 3.11: Order History Page
- [ ] Test Case 3.12: Order Tracking Page
- [ ] Test Case 3.13: Not Found Page
- [ ] Test Case 3.14: Privacy Policy Page
- [ ] Test Case 3.15: Selection Period Expired Page
- [ ] Test Case 3.16: Footer

---

## Issues Found

### Critical Issues
_Document any critical issues that prevent core functionality_

### Major Issues
_Document any major issues that significantly impact user experience_

### Minor Issues
_Document any minor issues or polish items_

### Suggestions
_Document any suggestions for improvements_

---

## Sign-Off

**Tester Name:** ___________________
**Date:** ___________________
**Overall Result:** [ ] PASS [ ] FAIL [ ] PASS WITH ISSUES

**Notes:**
