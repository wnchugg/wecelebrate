# Implementation Plan: Multi-Language Content Management

## Overview

This implementation plan addresses multi-language content management for 9 priority customer-facing pages. The implementation is organized into 5 phases over 22 hours (3 days) and includes comprehensive testing throughout.

The plan focuses on actionable coding tasks that build incrementally, with property-based and unit testing integrated to catch errors early.

## Tasks

### Phase 1: Database & Backend (4 hours)

- [ ] 1. Database schema changes
  - [x] 1.1 Add available_languages column to sites table
    - Execute ALTER TABLE to add TEXT[] column
    - Set default value to ARRAY['en']
    - _Requirements: 1.4, 1.5_
  
  - [x] 1.2 Add translations column to sites table
    - Execute ALTER TABLE to add JSONB column
    - Set default value to '{}'::jsonb
    - _Requirements: 3.1, 3.2_
  
  - [x] 1.3 Add draft_available_languages column to sites table
    - Execute ALTER TABLE to add TEXT[] column
    - Set default value to NULL
    - _Requirements: 9.2_
  
  - [x] 1.4 Create database indexes
    - Create GIN index on available_languages
    - Create GIN index on translations
    - _Requirements: 3.4, 3.5, 3.6_

- [ ] 2. Migration script for existing content
  - [x] 2.1 Create migration script for all 16 priority sections
    - Migrate Header content to English translations
    - Migrate Welcome Page content to English translations
    - Migrate Landing Page content to English translations
    - Migrate Access Validation Page content to English translations
    - Migrate Catalog Page content to English translations
    - Migrate Product Detail Page content to English translations
    - Migrate Cart Page content to English translations
    - Migrate Checkout Page content to English translations
    - Migrate Review Order Page content to English translations
    - Migrate Confirmation Page content to English translations
    - Migrate Order History Page content to English translations
    - Migrate Order Tracking Page content to English translations
    - Migrate Not Found Page content to English translations
    - Migrate Privacy Policy Page content to English translations
    - Migrate Selection Period Expired Page content to English translations
    - Migrate Footer content to English translations
    - Set defaultLanguage to 'en' for all existing sites
    - Set available_languages to ['en'] for all existing sites
    - _Requirements: 8.1-8.18_
  
  - [x] 2.2 Test migration script on development database
    - Verify all content migrated correctly
    - Verify no data loss
    - Verify backward compatibility
    - _Requirements: 8.18_

- [x] 3. Backend API updates
  - [x] 3.1 Update Site type definition in api.types.ts
    - Add available_languages field
    - Add translations field
    - Add draft_available_languages field
    - Update settings type to include defaultLanguage
    - _Requirements: 1.4, 3.1, 9.2_
  
  - [x] 3.2 Update CRUD operations in crud_db.ts
    - Add support for available_languages in create/update
    - Add support for translations in create/update
    - Add support for draft_available_languages in create/update
    - Add validation for language codes
    - _Requirements: 1.4, 3.1, 9.2_

### Phase 2: Core Components & Utilities (5 hours)

- [x] 4. Create MultiLanguageSelector component
  - [x] 4.1 Implement MultiLanguageSelector in src/app/components/admin/MultiLanguageSelector.tsx
    - Create component with search/filter functionality
    - Implement checkbox list for all 20 supported languages
    - Add visual indicator for default language
    - Implement "Set as default" button
    - Prevent unchecking default language
    - Display count of selected languages
    - _Requirements: 1.1, 1.2, 1.3, 1.6_
  
  - [x] 4.2 Write unit tests for MultiLanguageSelector
    - Test language selection/deselection
    - Test default language cannot be unchecked
    - Test "Set as default" functionality
    - Test search/filter functionality
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 5. Create TranslatableInput component
  - [x] 5.1 Implement TranslatableInput in src/app/components/admin/TranslatableInput.tsx
    - Create tabbed interface for each language
    - Display default language tab first
    - Implement status indicators (translated, empty, required)
    - Add "Copy from default language" button
    - Display character count
    - Implement validation for required fields
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.9_
  
  - [x] 5.2 Write unit tests for TranslatableInput
    - Test tab rendering for all languages
    - Test default language tab shown first
    - Test status indicators
    - Test copy from default functionality
    - Test character count display
    - Test required field validation
    - _Requirements: 2.1-2.9_

- [x] 6. Create TranslatableTextarea component
  - [x] 6.1 Implement TranslatableTextarea in src/app/components/admin/TranslatableTextarea.tsx
    - Similar to TranslatableInput but with textarea
    - Support rows prop for height
    - Support maxLength prop
    - _Requirements: 2.1-2.9, 10.7, 10.8_
  
  - [x] 6.2 Write unit tests for TranslatableTextarea
    - Test textarea rendering
    - Test rows prop
    - Test maxLength prop
    - _Requirements: 2.1-2.9_

- [x] 7. Create TranslationProgress component
  - [x] 7.1 Implement TranslationProgress in src/app/components/admin/TranslationProgress.tsx
    - Calculate completion percentage per language
    - Display progress bar per language
    - Color-code complete vs incomplete
    - Show count of completed/total fields
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 4.8_
  
  - [x] 7.2 Write unit tests for TranslationProgress
    - Test completion percentage calculation
    - Test progress bar rendering
    - Test color coding
    - Test count display
    - _Requirements: 4.1-4.8_

- [x] 8. Create useSiteContent hook
  - [x] 8.1 Implement useSiteContent in src/app/hooks/useSiteContent.ts
    - Implement getTranslatedContent function
    - Navigate to field using path
    - Implement fallback chain (current → default → English → first → fallback)
    - Add comprehensive error handling
    - Add type checking at each step
    - Add console warnings for missing translations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_
  
  - [x] 8.2 Write unit tests for useSiteContent
    - Test translation retrieval with valid path
    - Test fallback to default language
    - Test fallback to English
    - Test fallback to first available translation
    - Test fallback to provided fallback string
    - Test error handling for invalid paths
    - Test error handling for malformed objects
    - _Requirements: 6.1-6.9, 11.1-11.8_
  
  - [x] 8.3 Write property test for translation retrieval always returns string
    - **Property 1: Translation retrieval always returns a string**
    - Test with random paths and fallbacks
    - **Validates: Requirements 6.1, 6.6, 11.1, 11.2, 11.3**
  
  - [x] 8.4 Write property test for fallback chain termination
    - **Property 2: Fallback chain always terminates with a value**
    - Test with random paths and non-empty fallbacks
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**

- [x] 9. Create translation validation utilities
  - [x] 9.1 Implement validateTranslations in src/app/utils/translationValidation.ts
    - Calculate completion percentage
    - Identify missing translations
    - Return validation result with missing translations list
    - _Requirements: 4.1, 4.4, 4.5, 4.6, 4.7_
  
  - [x] 9.2 Implement canPublishTranslations in src/app/utils/translationValidation.ts
    - Validate default language translations for required fields
    - Return publish eligibility with reason
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 9.3 Write unit tests for translation validation
    - Test completion percentage calculation
    - Test missing translations identification
    - Test canPublish with complete translations
    - Test canPublish with missing translations
    - Test canPublish with partial translations
    - _Requirements: 4.1-4.7, 5.1-5.3_
  
  - [x] 9.4 Write property test for completion percentage bounds
    - **Property 3: Completion percentage is always between 0 and 100**
    - Test with random translations, fields, and languages
    - **Validates: Requirements 4.1, 4.6, 4.7**
  
  - [x] 9.5 Write property test for default language validation
    - **Property 4: Default language validation is strict**
    - Test that missing default language translations prevent publish
    - **Validates: Requirements 5.1, 5.2, 5.3**

### Phase 3: Site Configuration Integration (5 hours)

- [x] 10. Integrate language configuration in Site Configuration
  - [x] 10.1 Add language configuration section to SiteConfiguration.tsx
    - Add MultiLanguageSelector component
    - Add state for availableLanguages
    - Add state for defaultLanguage
    - Implement onChange handlers
    - _Requirements: 1.1, 1.2, 1.3, 1.6_
  
  - [x] 10.2 Add translation progress section to SiteConfiguration.tsx
    - Add TranslationProgress component
    - Define required fields list
    - Display completion for each language
    - _Requirements: 4.1, 4.2, 4.3, 4.8_

- [x] 11. Replace text inputs with translatable components
  - [x] 11.1 Replace Header inputs
    - Replace logoAlt input with TranslatableInput
    - Replace homeLink input with TranslatableInput
    - Replace productsLink input with TranslatableInput
    - Replace aboutLink input with TranslatableInput
    - Replace contactLink input with TranslatableInput
    - Replace ctaButton input with TranslatableInput
    - _Requirements: 2.1-2.9, 7.1_
  
  - [x] 11.2 Replace Welcome Page inputs
    - Replace title input with TranslatableInput
    - Replace message input with TranslatableTextarea
    - Replace buttonText input with TranslatableInput
    - _Requirements: 2.1-2.9, 7.2_
  
  - [x] 11.3 Replace Landing Page inputs
    - Replace heroTitle input with TranslatableInput
    - Replace heroSubtitle input with TranslatableInput
    - Replace heroCTA input with TranslatableInput
    - _Requirements: 2.1-2.9, 7.3_
  
  - [x] 11.4 Replace Access Validation Page inputs
    - Replace title input with TranslatableInput
    - Replace description input with TranslatableTextarea
    - Replace buttonText input with TranslatableInput
    - Replace errorMessage input with TranslatableInput
    - Replace successMessage input with TranslatableInput
    - _Requirements: 2.1-2.9, 7.4_
  
  - [x] 11.5 Replace Catalog Page inputs
    - Replace title input with TranslatableInput
    - Replace description input with TranslatableTextarea
    - Replace emptyMessage input with TranslatableInput
    - Replace filterAllText input with TranslatableInput
    - Replace searchPlaceholder input with TranslatableInput
    - _Requirements: 2.1-2.9, 7.5_
  
  - [x] 11.6 Replace Product Detail Page inputs
    - Replace backButton input with TranslatableInput
    - Replace addToCart input with TranslatableInput
    - Replace buyNow input with TranslatableInput
    - Replace outOfStock input with TranslatableInput
    - Replace specifications input with TranslatableInput
    - Replace description input with TranslatableInput
    - _Requirements: 2.1-2.9, 7.6_
  
  - [x] 11.7 Replace Checkout Page inputs
    - Replace title input with TranslatableInput
    - Replace shippingTitle input with TranslatableInput
    - Replace paymentTitle input with TranslatableInput
    - Replace orderSummary input with TranslatableInput
    - Replace placeOrderButton input with TranslatableInput
    - Replace freeShippingMessage input with TranslatableInput
    - _Requirements: 2.1-2.9, 7.7_
  
  - [x] 11.8 Replace Review Order Page inputs
    - Replace title input with TranslatableInput
    - Replace instructions input with TranslatableTextarea
    - Replace confirmButton input with TranslatableInput
    - Replace editButton input with TranslatableInput
    - Replace shippingLabel input with TranslatableInput
    - Replace itemsLabel input with TranslatableInput
    - _Requirements: 2.1-2.9, 7.8_
  
  - [x] 11.9 Replace Confirmation Page inputs
    - Replace title input with TranslatableInput
    - Replace message input with TranslatableTextarea
    - Replace orderNumberLabel input with TranslatableInput
    - Replace trackingLabel input with TranslatableInput
    - Replace nextSteps input with TranslatableTextarea
    - Replace continueButton input with TranslatableInput
    - _Requirements: 2.1-2.9, 7.9_
  
  - [x] 11.10 Replace Footer inputs
    - Replace text input with TranslatableTextarea
    - Replace privacyLink input with TranslatableInput
    - Replace termsLink input with TranslatableInput
    - Replace contactLink input with TranslatableInput
    - _Requirements: 2.1-2.9, 7.16_
  
  - [x] 11.11 Replace Cart Page inputs
    - Replace title input with TranslatableInput
    - Replace emptyMessage input with TranslatableInput
    - Replace emptyDescription input with TranslatableTextarea
    - Replace button text inputs with TranslatableInput
    - Replace label inputs with TranslatableInput
    - _Requirements: 2.1-2.9, 7.7_
  
  - [x] 11.12 Replace Order History Page inputs
    - Replace title input with TranslatableInput
    - Replace description input with TranslatableTextarea
    - Replace emptyTitle input with TranslatableInput
    - Replace emptyMessage input with TranslatableTextarea
    - Replace status labels with TranslatableInput
    - _Requirements: 2.1-2.9, 7.11_
  
  - [x] 11.13 Replace Order Tracking Page inputs
    - Replace title input with TranslatableInput
    - Replace status labels with TranslatableInput
    - Replace message inputs with TranslatableTextarea
    - Replace button text inputs with TranslatableInput
    - _Requirements: 2.1-2.9, 7.12_
  
  - [x] 11.14 Replace Not Found Page inputs
    - Replace title input with TranslatableInput
    - Replace message input with TranslatableTextarea
    - Replace button text inputs with TranslatableInput
    - _Requirements: 2.1-2.9, 7.13_
  
  - [x] 11.15 Replace Privacy Policy Page inputs
    - Replace section titles with TranslatableInput
    - Replace content sections with TranslatableTextarea
    - Replace button text inputs with TranslatableInput
    - _Requirements: 2.1-2.9, 7.14_
  
  - [x] 11.16 Replace Selection Period Expired Page inputs
    - Replace title input with TranslatableInput
    - Replace message input with TranslatableTextarea
    - Replace button text inputs with TranslatableInput
    - _Requirements: 2.1-2.9, 7.15_

- [x] 12. Integrate validation with draft/publish workflow
  - [x] 12.1 Add validation before publish
    - Call canPublishTranslations before publish
    - Display error if validation fails
    - Prevent publish if default language translations missing
    - Display warning if non-default languages incomplete
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 12.2 Add validation on save draft
    - Call validateTranslations on save
    - Display validation results
    - Allow saving with incomplete translations
    - _Requirements: 5.7, 5.8_
  
  - [x] 12.3 Update draft/publish logic for translations
    - Store translations in draft_settings on save
    - Store available_languages in draft_available_languages on save
    - Copy translations to settings on publish
    - Copy available_languages on publish
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.8_

### Phase 4: Public Site Integration (4 hours)

- [x] 13. Update public pages to use useSiteContent
  - [x] 13.1 Update Header component
    - Import useSiteContent hook
    - Replace hardcoded logoAlt with getTranslatedContent
    - Replace hardcoded homeLink with getTranslatedContent
    - Replace hardcoded productsLink with getTranslatedContent
    - Replace hardcoded aboutLink with getTranslatedContent
    - Replace hardcoded contactLink with getTranslatedContent
    - Replace hardcoded ctaButton with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.1_
  
  - [x] 13.2 Update Welcome page (src/app/pages/Welcome.tsx)
    - Import useSiteContent hook
    - Replace hardcoded title with getTranslatedContent
    - Replace hardcoded message with getTranslatedContent
    - Replace hardcoded buttonText with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.2_
  
  - [x] 13.3 Update Landing page (src/app/pages/Landing.tsx)
    - Import useSiteContent hook
    - Replace hardcoded heroTitle with getTranslatedContent
    - Replace hardcoded heroSubtitle with getTranslatedContent
    - Replace hardcoded heroCTA with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.3_
  
  - [x] 13.4 Update Access Validation page (src/app/pages/AccessValidation.tsx)
    - Import useSiteContent hook
    - Replace hardcoded title with getTranslatedContent
    - Replace hardcoded description with getTranslatedContent
    - Replace hardcoded buttonText with getTranslatedContent
    - Replace hardcoded errorMessage with getTranslatedContent
    - Replace hardcoded successMessage with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.4_
  
  - [x] 13.5 Update Catalog page (src/app/pages/Products.tsx)
    - Import useSiteContent hook
    - Replace hardcoded title with getTranslatedContent
    - Replace hardcoded description with getTranslatedContent
    - Replace hardcoded emptyMessage with getTranslatedContent
    - Replace hardcoded filterAllText with getTranslatedContent
    - Replace hardcoded searchPlaceholder with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.5_
  
  - [x] 13.6 Update Product Detail page (src/app/pages/ProductDetail.tsx)
    - Import useSiteContent hook
    - Replace hardcoded backButton with getTranslatedContent
    - Replace hardcoded addToCart with getTranslatedContent
    - Replace hardcoded buyNow with getTranslatedContent
    - Replace hardcoded outOfStock with getTranslatedContent
    - Replace hardcoded specifications with getTranslatedContent
    - Replace hardcoded description with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.6_
  
  - [x] 13.7 Update Checkout page (src/app/pages/Checkout.tsx)
    - Import useSiteContent hook
    - Replace hardcoded title with getTranslatedContent
    - Replace hardcoded shippingTitle with getTranslatedContent
    - Replace hardcoded paymentTitle with getTranslatedContent
    - Replace hardcoded orderSummary with getTranslatedContent
    - Replace hardcoded placeOrderButton with getTranslatedContent
    - Replace hardcoded freeShippingMessage with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.7_
  
  - [x] 13.8 Update Review Order page (src/app/pages/ReviewOrder.tsx)
    - Import useSiteContent hook
    - Replace hardcoded title with getTranslatedContent
    - Replace hardcoded instructions with getTranslatedContent
    - Replace hardcoded confirmButton with getTranslatedContent
    - Replace hardcoded editButton with getTranslatedContent
    - Replace hardcoded shippingLabel with getTranslatedContent
    - Replace hardcoded itemsLabel with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.8_
  
  - [x] 13.9 Update Confirmation page (src/app/pages/Confirmation.tsx)
    - Import useSiteContent hook
    - Replace hardcoded title with getTranslatedContent
    - Replace hardcoded message with getTranslatedContent
    - Replace hardcoded orderNumberLabel with getTranslatedContent
    - Replace hardcoded trackingLabel with getTranslatedContent
    - Replace hardcoded nextSteps with getTranslatedContent
    - Replace hardcoded continueButton with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.9_
  
  - [x] 13.10 Update Footer component
    - Import useSiteContent hook
    - Replace hardcoded text with getTranslatedContent
    - Replace hardcoded privacyLink with getTranslatedContent
    - Replace hardcoded termsLink with getTranslatedContent
    - Replace hardcoded contactLink with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.16_
  
  - [x] 13.11 Update Cart page (src/app/pages/Cart.tsx)
    - Import useSiteContent hook
    - Replace hardcoded title with getTranslatedContent
    - Replace hardcoded emptyMessage with getTranslatedContent
    - Replace hardcoded button text with getTranslatedContent
    - Replace hardcoded labels with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.7_
  
  - [x] 13.12 Update Order History page (src/app/pages/OrderHistory.tsx)
    - Import useSiteContent hook
    - Replace hardcoded title with getTranslatedContent
    - Replace hardcoded description with getTranslatedContent
    - Replace hardcoded emptyMessage with getTranslatedContent
    - Replace hardcoded status labels with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.11_
  
  - [x] 13.13 Update Order Tracking page (src/app/pages/OrderTracking.tsx)
    - Import useSiteContent hook
    - Replace hardcoded title with getTranslatedContent
    - Replace hardcoded status labels with getTranslatedContent
    - Replace hardcoded messages with getTranslatedContent
    - Replace hardcoded button text with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.12_
  
  - [x] 13.14 Update Not Found page (src/app/pages/NotFound.tsx)
    - Import useSiteContent hook
    - Replace hardcoded title with getTranslatedContent
    - Replace hardcoded message with getTranslatedContent
    - Replace hardcoded button text with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.13_
  
  - [x] 13.15 Update Privacy Policy page (src/app/pages/PrivacyPolicy.tsx)
    - Import useSiteContent hook
    - Replace hardcoded section titles with getTranslatedContent
    - Replace hardcoded content with getTranslatedContent
    - Replace hardcoded button text with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.14_
  
  - [x] 13.16 Update Selection Period Expired page (src/app/pages/SelectionPeriodExpired.tsx)
    - Import useSiteContent hook
    - Replace hardcoded title with getTranslatedContent
    - Replace hardcoded message with getTranslatedContent
    - Replace hardcoded button text with getTranslatedContent
    - _Requirements: 6.1-6.10, 7.15_

- [x] 14. Test language switching and fallback behavior
  - [x] 14.1 Test language switching on public site
    - Verify all content updates when language changes
    - Verify language preference persists in localStorage
    - _Requirements: 6.10, 12.9_
  
  - [x] 14.2 Test fallback behavior
    - Test fallback to default language
    - Test fallback to English
    - Test fallback to first available translation
    - Test fallback to provided fallback string
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_

### Phase 5: Testing & Documentation (4 hours)

- [x] 15. Integration tests
  - [x] 15.1 Write integration test for language switching
    - Test that language switching updates all translated content
    - Test that missing translations fall back correctly
    - Test that RTL layout works with translated content
    - _Requirements: 6.10, 12.4, 12.9_
  
  - [x] 15.2 Write integration test for draft/publish workflow
    - Test that draft changes don't affect live site
    - Test that publish copies translations correctly
    - Test that validation prevents invalid publish
    - _Requirements: 9.3, 9.4, 9.5, 9.7_
  
  - [x] 15.3 Write property test for language switching
    - **Property 5: Language switching updates all content**
    - Test that all content updates when language changes
    - **Validates: Requirements 6.10, 12.9**
  
  - [x] 15.4 Write property test for draft isolation
    - **Property 6: Draft changes don't affect live site**
    - Test that draft changes don't appear on live site
    - **Validates: Requirements 9.3, 9.7**

- [x] 16. Manual E2E testing
  - [x] 16.1 Test admin workflow
    - Configure languages
    - Enter translations
    - Review progress
    - Save draft
    - Publish
    - _Requirements: 1.1-1.8, 2.1-2.9, 4.1-4.8, 5.1-5.8_
  
  - [x] 16.2 Test public site workflow
    - View site in different languages
    - Test language switching
    - Test fallback behavior
    - Test RTL layout
    - _Requirements: 6.1-6.10, 12.1-12.9_
  
  - [x] 16.3 Test all 16 priority sections
    - Test Header translations
    - Test Welcome page translations
    - Test Landing page translations
    - Test Access Validation page translations
    - Test Catalog page translations
    - Test Product Detail page translations
    - Test Cart page translations
    - Test Checkout page translations
    - Test Review Order page translations
    - Test Confirmation page translations
    - Test Order History page translations
    - Test Order Tracking page translations
    - Test Not Found page translations
    - Test Privacy Policy page translations
    - Test Selection Period Expired page translations
    - Test Footer translations
    - _Requirements: 7.1-7.17_

- [ ] 17. Bug fixes and polish
  - [ ] 17.1 Fix any bugs found during testing
    - Address translation retrieval issues
    - Address validation issues
    - Address UI/UX issues
    - _Requirements: All_
  
  - [ ] 17.2 Performance optimization
    - Optimize translation retrieval
    - Optimize component rendering
    - Optimize validation
    - _Requirements: Performance requirements_

- [ ] 18. Documentation
  - [ ] 18.1 Create admin user guide
    - Document how to configure languages
    - Document how to enter translations
    - Document translation progress
    - Document validation and publishing
    - _Requirements: 1.1-1.8, 2.1-2.9, 4.1-4.8, 5.1-5.8_
  
  - [ ] 18.2 Create developer documentation
    - Document useSiteContent hook
    - Document translation components
    - Document validation utilities
    - Document integration with i18n formatting
    - _Requirements: 6.1-6.10, 10.1-10.9, 12.1-12.9_
  
  - [ ] 18.3 Update API documentation
    - Document new database columns
    - Document new API endpoints
    - Document migration process
    - _Requirements: 3.1-3.6, 8.1-8.11_

- [ ] 19. Final checkpoint - All phases complete
  - Ensure all tests pass (unit, property, integration)
  - Verify all 16 sections support translations (2 global + 14 pages)
  - Verify admin can configure languages
  - Verify admin can enter translations
  - Verify translation progress works
  - Verify validation prevents invalid publish
  - Verify public site displays correct content
  - Verify language switching works
  - Verify fallback chain works
  - Verify RTL layout works
  - Verify integration with i18n formatting
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at the end of each phase
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation is organized by priority: Database → Components → Integration → Public Site → Testing
- All components leverage existing infrastructure (LanguageContext, Site_Config, draft/publish workflow)
- Error handling is built into each utility to gracefully handle invalid inputs
- Use fast-check library for property-based testing in TypeScript
- Each property test must include a comment tag referencing the design property
