# Implementation Plan: Internationalization Improvements

## Overview

This implementation plan addresses comprehensive internationalization improvements for the e-commerce application. The implementation is organized into three priority phases (Critical, Important, Enhancement) and leverages JavaScript's built-in Intl API while extending existing infrastructure (LanguageContext, CurrencyDisplay, Site_Config).

The plan focuses on actionable coding tasks that build incrementally, with property-based and unit testing integrated throughout to catch errors early.

## Tasks

### Phase 1: Critical Improvements

- [ ] 1. Extend Site_Config with internationalization settings
  - [ ] 1.1 Add i18n configuration interface to Site_Config type definition
    - Add currency settings (currency, currencyDisplay, decimalPlaces)
    - Add date/time settings (timezone, dateFormat, timeFormat)
    - Add name formatting settings (nameOrder, nameFormat)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_
  
  - [ ] 1.2 Create default i18n configuration constants
    - Define DEFAULT_I18N_CONFIG object with sensible defaults
    - Export from configuration module
    - _Requirements: 13.1-13.9_

- [ ] 2. Implement currency formatting hook and utilities
  - [ ] 2.1 Create useCurrencyFormat hook in src/app/hooks/useCurrencyFormat.ts
    - Wrap existing CurrencyDisplay logic
    - Return formatPrice, formatRange, currency, and symbol functions
    - Implement getCurrencySymbol helper function
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 2.2 Write property test for currency formatting locale compliance
    - **Property 1: Currency formatting respects locale**
    - Test with random amounts and locales
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 2.3**
  
  - [ ]* 2.3 Write property test for currency configuration
    - **Property 2: Currency configuration is respected**
    - **Validates: Requirements 1.7**
  
  - [ ]* 2.4 Write property test for currency display format
    - **Property 3: Currency display format is respected**
    - **Validates: Requirements 1.8**
  
  - [ ]* 2.5 Write property test for currency decimal precision
    - **Property 4: Currency decimal precision is respected**
    - **Validates: Requirements 1.9**
  
  - [ ]* 2.6 Write property test for currency range formatting
    - **Property 5: Currency range formatting is consistent**
    - **Validates: Requirements 2.4**
  
  - [ ]* 2.7 Write unit tests for currency formatting edge cases
    - Test zero amounts, negative amounts, very large numbers
    - Test invalid currency codes with fallback behavior
    - Test specific locale examples (en-US, fr-FR, ja-JP)
    - _Requirements: 1.2-1.9, 2.1-2.5_

- [ ] 3. Replace hardcoded currency symbols throughout application
  - [ ] 3.1 Update product pages to use CurrencyDisplay component
    - Replace hardcoded $ symbols in ProductDetail.tsx
    - Replace hardcoded $ symbols in ProductCard.tsx
    - _Requirements: 1.1, 1.2, 1.6_
  
  - [ ] 3.2 Update checkout and order pages to use CurrencyDisplay component
    - Replace hardcoded $ in Checkout.tsx
    - Replace hardcoded $ in OrderHistory.tsx
    - Replace hardcoded $ in OrderTracking.tsx
    - _Requirements: 1.1, 1.3, 1.4, 1.6_
  
  - [ ] 3.3 Update admin pages to use CurrencyDisplay component
    - Replace hardcoded $ in AnalyticsDashboard.tsx
    - Replace hardcoded $ in CatalogPerformanceAnalytics.tsx
    - Replace hardcoded $ in EmailTemplates.tsx
    - _Requirements: 1.1, 1.5, 1.6_

- [ ] 4. Implement date and time formatting utilities
  - [ ] 4.1 Create useDateFormat hook in src/app/hooks/useDateFormat.ts
    - Implement formatDate using Intl.DateTimeFormat
    - Implement formatShortDate for abbreviated dates
    - Implement formatTime with 12h/24h locale detection
    - Implement formatRelative using Intl.RelativeTimeFormat
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [ ] 4.2 Create timezone utility functions in src/app/utils/timezone.ts
    - Implement convertToSiteTimezone function
    - Implement addDaysInTimezone function
    - _Requirements: 4.4, 4.5_
  
  - [ ]* 4.3 Write property test for date formatting locale compliance
    - **Property 6: Date formatting respects locale**
    - **Validates: Requirements 3.2, 3.8, 3.9, 3.10**
  
  - [ ]* 4.4 Write property test for short date formatting
    - **Property 7: Short date formatting is abbreviated**
    - **Validates: Requirements 3.3**
  
  - [ ]* 4.5 Write property test for time formatting conventions
    - **Property 8: Time formatting respects locale conventions**
    - Test 12h format for English, 24h for others
    - **Validates: Requirements 3.4, 3.5, 3.6**
  
  - [ ]* 4.6 Write property test for relative time formatting
    - **Property 9: Relative time formatting is contextual**
    - **Validates: Requirements 3.7**
  
  - [ ]* 4.7 Write property test for timezone conversion
    - **Property 10: Timezone conversion preserves moment in time**
    - Verify Unix timestamp remains unchanged
    - **Validates: Requirements 4.4**
  
  - [ ]* 4.8 Write property test for delivery date calculation
    - **Property 11: Delivery date calculation accounts for timezone**
    - **Validates: Requirements 4.5**
  
  - [ ]* 4.9 Write unit tests for date formatting edge cases
    - Test invalid dates, null values, undefined
    - Test specific locale examples (en-US, fr-FR, ja-JP)
    - Test 12h vs 24h time format switching
    - _Requirements: 3.1-3.11, 4.1-4.5_

- [ ] 5. Replace hardcoded date formatting with useDateFormat
  - [ ] 5.1 Update order and tracking pages
    - Replace hardcoded 'en-US' locale in OrderHistory.tsx
    - Replace hardcoded 'en-US' locale in OrderTracking.tsx
    - Replace hardcoded 'en-US' locale in Celebration.tsx
    - _Requirements: 3.8, 3.9, 3.11_
  
  - [ ] 5.2 Update admin pages
    - Replace hardcoded 'en-US' locale in ClientPortal.tsx
    - Replace hardcoded 'en-US' locale in AuditLogs.tsx
    - _Requirements: 3.10, 3.11_

- [ ] 6. Extend translation system with missing translation keys
  - [ ] 6.1 Add form placeholder translation keys to translations.ts
    - Add 'form.searchCountries', 'form.searchProducts', 'form.enterEmail', etc.
    - Provide translations for all 20 supported languages
    - _Requirements: 6.1_
  
  - [ ] 6.2 Add shipping message translation keys to translations.ts
    - Add 'shipping.freeShippingThreshold', 'shipping.estimatedDelivery', 'shipping.trackingNumber'
    - Provide translations for all 20 supported languages
    - _Requirements: 6.5_
  
  - [ ] 6.3 Add currency and date label translation keys to translations.ts
    - Add 'currency.priceRange', 'currency.total', 'currency.subtotal'
    - Add 'date.createdOn', 'date.updatedOn', 'date.expiresOn'
    - Provide translations for all 20 supported languages
    - _Requirements: 6.6, 6.7_
  
  - [ ] 6.4 Add button label and notification message translation keys
    - Add translation keys for all button labels
    - Add translation keys for all notification messages
    - Add translation keys for section headers
    - _Requirements: 6.2, 6.3, 6.4_

- [ ] 7. Implement translation parameter interpolation
  - [ ] 7.1 Create translateWithParams utility in src/app/utils/translationHelpers.ts
    - Implement parameter replacement logic using regex
    - Handle missing parameters gracefully (leave placeholder unchanged)
    - Support multiple placeholders in single string
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 7.2 Write property test for parameter interpolation
    - **Property 17: Parameter interpolation replaces all placeholders**
    - Test with random translation keys and parameter objects
    - **Validates: Requirements 6.8, 7.2, 7.3**
  
  - [ ]* 7.3 Write property test for missing parameters
    - **Property 18: Missing parameters leave placeholders unchanged**
    - **Validates: Requirements 7.4**
  
  - [ ]* 7.4 Write unit tests for translation interpolation
    - Test single placeholder replacement
    - Test multiple placeholder replacement
    - Test missing parameters
    - Test empty parameter object
    - _Requirements: 6.8, 7.1-7.4_

- [ ] 8. Replace hardcoded text with translation keys
  - [ ] 8.1 Update form placeholders throughout application
    - Replace hardcoded placeholders in all input components
    - Use t() function with new translation keys
    - _Requirements: 6.1, 6.9_
  
  - [ ] 8.2 Update button labels and notification messages
    - Replace hardcoded button text with translation keys
    - Replace hardcoded notification messages with translation keys
    - Replace hardcoded section headers with translation keys
    - _Requirements: 6.2, 6.3, 6.4, 6.9_
  
  - [ ] 8.3 Update shipping and currency messages with parameter interpolation
    - Use translateWithParams for free shipping threshold messages
    - Use translateWithParams for estimated delivery messages
    - Use translateWithParams for tracking number messages
    - _Requirements: 6.10, 6.11, 6.12_

- [ ] 9. Checkpoint - Phase 1 Complete
  - Ensure all Phase 1 tests pass (both unit and property tests)
  - Verify currency formatting works correctly across all pages
  - Verify date formatting works correctly across all pages
  - Verify all translations are present and parameter interpolation works
  - Test with multiple locales (en-US, fr-FR, ja-JP, de-DE)
  - Ask the user if questions arise

### Phase 2: Important Improvements

- [ ] 10. Implement number formatting utilities
  - [ ] 10.1 Create useNumberFormat hook in src/app/hooks/useNumberFormat.ts
    - Implement formatNumber using Intl.NumberFormat
    - Implement formatInteger (zero decimal places)
    - Implement formatDecimal (configurable decimal places)
    - Implement formatPercent (percentage formatting)
    - Implement formatCompact (compact notation for large numbers)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 10.2 Write property test for number formatting locale compliance
    - **Property 12: Number formatting respects locale separators**
    - Test thousand separators and decimal separators
    - **Validates: Requirements 5.2, 5.7, 5.8**
  
  - [ ]* 10.3 Write property test for integer formatting
    - **Property 13: Integer formatting has no decimals**
    - **Validates: Requirements 5.3**
  
  - [ ]* 10.4 Write property test for decimal formatting precision
    - **Property 14: Decimal formatting has exact precision**
    - **Validates: Requirements 5.4**
  
  - [ ]* 10.5 Write property test for percent formatting
    - **Property 15: Percent formatting is correct**
    - **Validates: Requirements 5.5**
  
  - [ ]* 10.6 Write property test for compact notation
    - **Property 16: Compact notation is abbreviated**
    - Test that large numbers use K, M, B notation
    - **Validates: Requirements 5.6**
  
  - [ ]* 10.7 Write unit tests for number formatting edge cases
    - Test zero, negative numbers, very large numbers
    - Test specific locale examples (en-US uses commas, fr-FR uses spaces, de-DE uses periods)
    - _Requirements: 5.1-5.8_

- [ ] 11. Replace hardcoded number formatting with useNumberFormat
  - [ ] 11.1 Update product pages
    - Replace toLocaleString() calls with formatNumber
    - Update product points display to use formatInteger
    - _Requirements: 5.7_
  
  - [ ] 11.2 Update analytics pages
    - Replace number formatting in AnalyticsDashboard.tsx
    - Replace number formatting in CatalogPerformanceAnalytics.tsx
    - Use formatCompact for large metrics
    - _Requirements: 5.8_

- [ ] 12. Implement name formatting utilities
  - [ ] 12.1 Create useNameFormat hook in src/app/hooks/useNameFormat.ts
    - Implement formatFullName with locale-aware name order
    - Implement formatFormalName with title support
    - Handle Asian locales (ja, zh, ko) with family-first order
    - Handle Western locales with given-first order
    - Support middle names
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 12.2 Write property test for Asian name order
    - **Property 19: Asian locale name order is family-first**
    - Test with ja, zh, ko locales
    - **Validates: Requirements 8.2, 8.4**
  
  - [ ]* 12.3 Write property test for Western name order
    - **Property 20: Western locale name order is given-first**
    - **Validates: Requirements 8.3, 8.5**
  
  - [ ]* 12.4 Write property test for formal name formatting
    - **Property 21: Formal name includes title**
    - **Validates: Requirements 8.6**
  
  - [ ]* 12.5 Write unit tests for name formatting
    - Test specific locales (en-US, ja-JP, zh-CN, ko-KR)
    - Test with and without middle names
    - Test with and without titles
    - _Requirements: 8.1-8.8_

- [ ] 13. Update user-facing name displays
  - [ ] 13.1 Update user profile displays
    - Use useNameFormat for displaying user names in profile components
    - Apply to all user profile pages
    - _Requirements: 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 13.2 Update order and admin displays
    - Use useNameFormat in order history
    - Use useNameFormat in admin user lists
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [ ] 14. Implement RTL layout support
  - [ ] 14.1 Create RTL utility functions in src/app/utils/rtl.ts
    - Define RTL_LANGUAGES constant array ['ar', 'he']
    - Implement isRTL function (returns true for Arabic and Hebrew)
    - Implement getTextDirection function (returns 'rtl' or 'ltr')
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  
  - [ ] 14.2 Integrate RTL detection in root App component
    - Import useLanguage hook and RTL utilities
    - Add useEffect to update document.documentElement.dir on language change
    - Add useEffect to update document.documentElement.lang on language change
    - _Requirements: 9.8, 9.9_
  
  - [ ]* 14.3 Write property test for text direction detection
    - **Property 22: Text direction matches language directionality**
    - **Validates: Requirements 9.4, 9.6, 9.7**
  
  - [ ]* 14.4 Write property test for DOM attribute updates
    - **Property 23: Language change updates DOM attributes**
    - **Validates: Requirements 9.8, 9.9**
  
  - [ ]* 14.5 Write unit tests for RTL detection
    - Test Arabic (ar) returns true for isRTL
    - Test Hebrew (he) returns true for isRTL
    - Test other languages return false for isRTL
    - Test getTextDirection returns correct values
    - _Requirements: 9.1-9.9_

- [ ] 15. Update CSS to use logical properties for RTL support
  - [ ] 15.1 Audit and update margin properties
    - Replace margin-left with margin-inline-start
    - Replace margin-right with margin-inline-end
    - Update all component stylesheets
    - _Requirements: 9.10_
  
  - [ ] 15.2 Audit and update padding properties
    - Replace padding-left with padding-inline-start
    - Replace padding-right with padding-inline-end
    - Update all component stylesheets
    - _Requirements: 9.11_
  
  - [ ] 15.3 Audit and update text alignment properties
    - Replace text-align: left with text-align: start
    - Replace text-align: right with text-align: end
    - Update all component stylesheets
    - _Requirements: 9.12_

- [ ] 16. Checkpoint - Phase 2 Complete
  - Ensure all Phase 2 tests pass (both unit and property tests)
  - Verify number formatting works correctly with locale-specific separators
  - Verify name formatting respects cultural conventions
  - Verify RTL layout works for Arabic and Hebrew languages
  - Test RTL layout in browser with ar and he locales
  - Verify CSS logical properties work correctly
  - Ask the user if questions arise

### Phase 3: Enhancement Improvements

- [ ] 17. Enhance address validation with country-specific rules
  - [ ] 17.1 Add postal code validation patterns to src/app/utils/addressValidation.ts
    - Define postalCodePatterns object with regex for all supported countries
    - Include patterns for US, CA, GB, DE, FR, JP, CN, IN, AU, BR, MX, ES, IT, NL, SE, NO
    - Implement validatePostalCode function
    - _Requirements: 10.1-10.11_
  
  - [ ] 17.2 Implement validateAddressLine function in addressValidation.ts
    - Add PO Box validation for US addresses (reject if contains "P.O. Box")
    - Add minimum length validation (reject if < 3 characters)
    - Return descriptive error messages or null if valid
    - _Requirements: 10.12, 10.13, 10.14_
  
  - [ ]* 17.3 Write property test for address length validation
    - **Property 24: Short addresses are rejected**
    - **Validates: Requirements 10.13**
  
  - [ ]* 17.4 Write unit tests for address validation
    - Test PO Box detection for US addresses
    - Test postal code patterns for each supported country
    - Test minimum length validation
    - Test valid addresses pass validation
    - _Requirements: 10.1-10.14_

- [ ] 18. Integrate address validation with AddressInput component
  - [ ] 18.1 Update AddressInput to use postal code validation
    - Call validatePostalCode on postal code field blur
    - Display validation errors to user
    - Prevent form submission if invalid
    - _Requirements: 10.1-10.11_
  
  - [ ] 18.2 Update AddressInput to use address line validation
    - Call validateAddressLine on address field blur
    - Display validation errors to user
    - Prevent form submission if invalid
    - _Requirements: 10.12, 10.13_

- [ ] 19. Implement address autocomplete component
  - [ ] 19.1 Create AddressAutocomplete component in src/app/components/ui/address-autocomplete.tsx
    - Implement search input with onChange handler
    - Implement debouncing for search queries (300ms delay)
    - Implement suggestion list rendering
    - Handle suggestion selection with onClick
    - _Requirements: 11.1, 11.2_
  
  - [ ] 19.2 Implement address service integration functions
    - Create fetchAddressSuggestions function (placeholder for API integration)
    - Create parseAddressSuggestion function to convert API response to AddressData
    - Handle service errors gracefully (return empty array on failure)
    - _Requirements: 11.2, 11.4_
  
  - [ ] 19.3 Add country filtering to autocomplete
    - Accept optional country prop
    - Pass country parameter to fetchAddressSuggestions
    - Filter suggestions by country when specified
    - _Requirements: 11.3_
  
  - [ ]* 19.4 Write property test for country filtering
    - **Property 25: Country filter limits results**
    - **Validates: Requirements 11.3**
  
  - [ ]* 19.5 Write property test for address parsing
    - **Property 26: Suggestion selection parses address**
    - Verify all required fields are present
    - **Validates: Requirements 11.4**
  
  - [ ]* 19.6 Write property test for callback invocation
    - **Property 27: Suggestion selection invokes callback**
    - **Validates: Requirements 11.5**
  
  - [ ]* 19.7 Write unit tests for address autocomplete
    - Test suggestion rendering
    - Test selection handling
    - Test service error handling
    - Test debouncing behavior
    - _Requirements: 11.1-11.5_

- [ ] 20. Implement measurement unit conversion utilities
  - [ ] 20.1 Create useUnits hook in src/app/hooks/useUnits.ts
    - Implement getUnitSystem function (imperial for US/LR/MM, metric for others)
    - Implement formatWeight function (grams to lbs or kg/g)
    - Implement formatLength function (cm to inches or cm)
    - Return system identifier
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_
  
  - [ ]* 20.2 Write property test for unit system detection
    - **Property 28: Unit system matches country conventions**
    - **Validates: Requirements 12.2**
  
  - [ ]* 20.3 Write property test for weight conversion to imperial
    - **Property 29: Weight conversion to imperial is accurate**
    - Verify conversion factor 453.592 grams per pound
    - **Validates: Requirements 12.3**
  
  - [ ]* 20.4 Write property test for weight conversion to metric
    - **Property 30: Weight conversion to metric kilograms is threshold-based**
    - Verify >= 1000g displays as kg, < 1000g displays as g
    - **Validates: Requirements 12.4, 12.5**
  
  - [ ]* 20.5 Write property test for length conversion to imperial
    - **Property 31: Length conversion to imperial is accurate**
    - Verify conversion factor 2.54 cm per inch
    - **Validates: Requirements 12.6**
  
  - [ ]* 20.6 Write property test for length in metric
    - **Property 32: Length in metric preserves centimeters**
    - **Validates: Requirements 12.7**
  
  - [ ]* 20.7 Write unit tests for unit conversion
    - Test specific conversions (1000g to 2.20lbs, 100cm to 39.4in)
    - Test threshold behavior (999g vs 1000g)
    - Test imperial countries (US, LR, MM)
    - Test metric countries
    - _Requirements: 12.1-12.8_

- [ ] 21. Integrate unit conversion in product displays
  - [ ] 21.1 Update product specification displays
    - Use useUnits formatWeight for product weight display
    - Use useUnits formatLength for product dimension display
    - Apply to ProductDetail.tsx
    - Apply to ProductCard.tsx
    - _Requirements: 12.3, 12.4, 12.5, 12.6, 12.7_

- [ ] 22. Final checkpoint - All phases complete
  - Ensure all tests pass (unit and property tests across all phases)
  - Verify all 20 languages work correctly
  - Verify RTL layout for Arabic and Hebrew
  - Verify currency formatting across all pages
  - Verify date formatting across all pages
  - Verify number formatting across all pages
  - Verify name formatting for different locales (Western and Asian)
  - Verify address validation for all supported countries
  - Verify unit conversion for metric and imperial systems
  - Test complete user flows in different locales
  - Test edge cases and error handling
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at the end of each phase
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation is organized by priority: Critical (Phase 1) → Important (Phase 2) → Enhancement (Phase 3)
- All formatting utilities leverage JavaScript's built-in Intl API for standards compliance
- Error handling is built into each utility to gracefully handle invalid inputs
- Use fast-check library for property-based testing in TypeScript
- Each property test must include a comment tag referencing the design property
