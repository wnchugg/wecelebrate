# Implementation Plan: Client V2 Field Audit

## Overview

This implementation plan breaks down the client field audit feature into discrete coding tasks. The approach is to:

1. Update type definitions first (foundation)
2. Implement backend transformation logic
3. Expand the frontend form with all fields
4. Add validation logic
5. Test all CRUD operations
6. Verify end-to-end functionality

Each task builds on previous work, with checkpoints to ensure incremental validation.

## Tasks

- [x] 1. Update frontend type definitions
  - [x] 1.1 Expand Client interface in api.types.ts
    - Add all 40+ client fields with proper TypeScript types
    - Mark required vs optional fields correctly
    - Add JSDoc comments for each field
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [x] 2. Implement backend field transformation
  - [x] 2.1 Create mapClientFieldsToDatabase function in helpers.ts
    - Implement complete field mapping with client_ prefix handling
    - Handle special cases (id, name, contactEmail, status, technologyOwner, etc.)
    - Add logging for unknown fields
    - _Requirements: 5.1, 5.3_
  
  - [x] 2.2 Create mapClientFieldsFromDatabase function in helpers.ts
    - Implement reverse mapping from database to frontend format
    - Handle all special cases
    - _Requirements: 5.2, 5.3_
  
  - [x] 2.3 Write property test for field transformation round-trip
    - **Property 1: Field Transformation Round-Trip**
    - **Validates: Requirements 5.1, 5.2**
  
  - [x] 2.4 Write property test for value preservation
    - **Property 2: Value Preservation During Transformation**
    - **Validates: Requirements 5.5**
  
  - [x] 2.5 Write unit tests for special case fields
    - Test id, name, contactEmail, status, technologyOwner fields
    - Test unknown field handling
    - _Requirements: 5.3, 5.4_

- [x] 3. Implement validation functions
  - [x] 3.1 Create validation utilities in ClientManagement.tsx
    - Implement validateEmail function
    - Implement validatePhone function
    - Implement validateUrl function
    - Implement validateRequired function
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 3.2 Write property test for email validation
    - **Property 3: Email Format Validation**
    - **Validates: Requirements 2.4, 4.2**
  
  - [x] 3.3 Write property test for phone validation
    - **Property 4: Phone Format Validation**
    - **Validates: Requirements 2.5, 4.3**
  
  - [x] 3.4 Write property test for URL validation
    - **Property 5: URL Format Validation**
    - **Validates: Requirements 4.4**
  
  - [x] 3.5 Write property test for required field validation
    - **Property 7: Required Field Validation**
    - **Validates: Requirements 4.1**


- [x] 4. Expand ClientModal form with tabbed interface
  - [x] 4.1 Add Material-UI Tabs component to ClientModal
    - Create tab structure with 6 tabs
    - Implement tab navigation
    - _Requirements: 3.1, 3.2_
  
  - [x] 4.2 Implement Tab 1: Basic Info
    - Add fields: name, contactEmail, status, clientCode, clientRegion, clientSourceCode
    - Add required field indicators
    - Wire up validation
    - _Requirements: 3.3, 3.4, 9.1_
  
  - [x] 4.3 Implement Tab 2: Contact
    - Add fields: clientContactName, clientContactPhone, clientTaxId
    - Wire up phone validation
    - _Requirements: 9.2_
  
  - [x] 4.4 Implement Tab 3: Address
    - Add fields: clientAddressLine1-3, clientCity, clientPostalCode, clientCountryState, clientCountry
    - Add country dropdown
    - _Requirements: 9.3_
  
  - [x] 4.5 Implement Tab 4: Account Management
    - Add fields: clientAccountManager, clientAccountManagerEmail, clientImplementationManager, clientImplementationManagerEmail, technologyOwner, technologyOwnerEmail
    - Wire up email validation for all email fields
    - _Requirements: 9.4_
  
  - [x] 4.6 Implement Tab 5: App Settings
    - Add fields: clientUrl, clientCustomUrl, clientAllowSessionTimeoutExtend, clientAuthenticationMethod, clientHasEmployeeData
    - Wire up URL validation
    - Add checkboxes for boolean fields
    - _Requirements: 9.5_
  
  - [x] 4.7 Implement Tab 6: Billing & Integrations
    - Add fields: clientInvoiceType, clientInvoiceTemplateType, clientPoType, clientPoNumber, clientErpSystem, clientSso, clientHrisSystem
    - _Requirements: 9.6, 9.7_
  
  - [x] 4.8 Write property test for form state preservation
    - **Property 6: Form State Preservation Across Navigation**
    - **Validates: Requirements 3.5**
  
  - [x] 4.9 Write unit tests for form validation
    - Test validation triggers (blur, submit)
    - Test error message display
    - Test submit button enable/disable
    - _Requirements: 4.6, 4.7_

- [x] 5. Checkpoint - Verify form UI
  - Ensure all tabs render correctly
  - Ensure validation works on all fields
  - Ensure form state is preserved across tabs
  - Ask the user if questions arise

- [x] 6. Update backend CRUD operations
  - [x] 6.1 Update createClient in crud_db.ts
    - Use mapClientFieldsToDatabase for field transformation
    - Handle all client fields in INSERT statement
    - Return complete client object using mapClientFieldsFromDatabase
    - _Requirements: 6.1, 6.2, 6.4_
  
  - [x] 6.2 Update getClient in crud_db.ts
    - SELECT all client fields
    - Use mapClientFieldsFromDatabase for response transformation
    - _Requirements: 7.1, 8.1, 8.2_
  
  - [x] 6.3 Update updateClient in crud_db.ts
    - Use mapClientFieldsToDatabase for field transformation
    - Build dynamic UPDATE statement for changed fields only
    - Return complete updated client object
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  
  - [x] 6.4 Write property test for create operation
    - **Property 9: Create Operation Returns Complete Object**
    - **Validates: Requirements 6.2, 6.4**
  
  - [x] 6.5 Write property test for required field errors
    - **Property 10: Required Field Error Handling**
    - **Validates: Requirements 6.3**
  
  - [x] 6.6 Write property test for update operation
    - **Property 13: Update Returns Complete Object**
    - **Validates: Requirements 7.3, 7.4**
  
  - [x] 6.7 Write property test for unchanged field preservation
    - **Property 14: Preserve Unchanged Fields**
    - **Validates: Requirements 7.5, 10.3**
  
  - [x] 6.8 Write property test for retrieve and transform
    - **Property 15: Retrieve and Transform All Fields**
    - **Validates: Requirements 8.1, 8.2**


- [x] 7. Update frontend API integration
  - [x] 7.1 Update createClient API call in ClientManagement.tsx
    - Send all populated form fields
    - Handle validation errors from backend
    - Display success/error messages
    - _Requirements: 6.1, 6.6_
  
  - [x] 7.2 Update updateClient API call in ClientManagement.tsx
    - Track which fields have changed
    - Send only changed fields to backend
    - Handle validation errors
    - _Requirements: 7.2, 7.6_
  
  - [x] 7.3 Update loadClient function in ClientManagement.tsx
    - Load all client fields into form state
    - Populate all tabs with existing data
    - _Requirements: 7.1, 8.3_
  
  - [x] 7.4 Write property test for all populated fields sent
    - **Property 8: All Populated Fields Sent to API**
    - **Validates: Requirements 6.1**
  
  - [x] 7.5 Write property test for only changed fields sent
    - **Property 12: Send Only Changed Fields**
    - **Validates: Requirements 7.2**
  
  - [x] 7.6 Write property test for loading all fields
    - **Property 11: Load All Existing Fields**
    - **Validates: Requirements 7.1**

- [x] 8. Add error handling and logging
  - [x] 8.1 Implement error response formatting in helpers.ts
    - Create structured error response format
    - Include error codes, messages, and field names
    - _Requirements: 5.4_
  
  - [x] 8.2 Add error logging for transformation failures
    - Log unknown fields with context
    - Log transformation errors with input values
    - _Requirements: 5.4_
  
  - [x] 8.3 Update frontend error display
    - Show inline validation errors
    - Show API error messages in toast/alert
    - Handle network errors gracefully
    - _Requirements: 4.6, 6.6, 7.6_
  
  - [x] 8.4 Write unit tests for error handling
    - Test missing required field errors
    - Test invalid format errors
    - Test database constraint errors
    - _Requirements: 6.3, 6.6, 7.6_

- [x] 9. Checkpoint - Test CRUD operations
  - Test creating a client with all fields
  - Test creating a client with only required fields
  - Test updating a client with partial data
  - Test loading an existing client
  - Ensure all tests pass, ask the user if questions arise

- [x] 10. Add backward compatibility handling
  - [x] 10.1 Handle null values in optional fields
    - Ensure form displays empty inputs for null values
    - Ensure backend accepts null for optional fields
    - _Requirements: 8.4, 10.2_
  
  - [x] 10.2 Test with existing client records
    - Load clients created before field audit
    - Verify all existing fields are preserved
    - Verify new fields can be added to old records
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [x] 10.3 Write unit test for backward compatibility
    - Test loading old client records
    - Test updating old records without populating new fields
    - _Requirements: 10.1, 10.4_

- [x] 11. Final integration testing
  - [x] 11.1 Write integration tests for complete flows
    - Test end-to-end client creation
    - Test end-to-end client update
    - Test end-to-end client retrieval
    - _Requirements: 6.1-6.6, 7.1-7.6, 8.1-8.5_

- [x] 12. Final checkpoint - Complete verification
  - Verify all 40+ fields are working in the UI
  - Verify all CRUD operations work correctly
  - Verify validation works for all field types
  - Verify error handling works properly
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The form uses Material-UI Tabs for organizing 40+ fields into 6 logical sections
- Backend transformation functions handle the "client_" prefix automatically
- All field mappings are explicitly defined to avoid ambiguity
