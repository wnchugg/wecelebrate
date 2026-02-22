# Implementation Plan: SSO Configuration UI Improvements

## Overview

This implementation refactors the SSO configuration UI in the Site Configuration Access tab to show only provider-relevant fields and introduce a configured state with edit/disable actions. The implementation follows a state machine approach with four distinct UI states: Unconfigured, Initial Configuration, Configured, and Edit Mode.

## Tasks

- [x] 1. Add state management for SSO UI states
  - Add `ssoConfigured` boolean state to track if SSO is set up
  - Add `ssoEditMode` boolean state to track if user is editing
  - Add helper function `getProviderCategory()` to categorize providers as 'oauth' or 'saml'
  - Add helper function `getUIState()` to determine current UI state
  - Add helper function `getProviderDisplayName()` to get human-readable provider names
  - _Requirements: 1.1, 1.2, 2.1, 3.2, 4.4_

- [ ] 2. Implement provider-specific field display logic
  - [x] 2.1 Extract OAuth fields into OAuthFields component
    - Move all OAuth/OpenID fields (Client ID, Client Secret, URLs, Scope) into separate component
    - Add validation error display for each field
    - Accept onChange handlers as props
    - _Requirements: 1.1, 7.1_
  
  - [ ]* 2.2 Write property test for OAuth field exclusivity
    - **Property 1: OAuth provider field exclusivity**
    - **Validates: Requirements 1.1**
  
  - [x] 2.3 Extract SAML fields into SAMLFields component
    - Move all SAML fields (IdP Entry Point, Entity ID, Certificate, ACS URL) into separate component
    - Add validation error display for each field
    - Accept onChange handlers as props
    - _Requirements: 1.2, 7.2_
  
  - [x] 2.4 Update main SSO card to conditionally render field components
    - Use `getProviderCategory()` to determine which fields to show
    - Render OAuthFields when category is 'oauth'
    - Render SAMLFields when category is 'saml'
    - Always render attribute mapping and additional settings
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [ ]* 2.5 Write property test for provider change field consistency
    - **Property 2: Provider change field consistency**
    - **Validates: Requirements 1.4**
  
  - [ ]* 2.6 Write property test for attribute mapping invariant
    - **Property 3: Attribute mapping field invariant**
    - **Validates: Requirements 1.5**

- [ ] 3. Implement ConfiguredStateSummary component
  - [x] 3.1 Create ConfiguredStateSummary component
    - Display status banner with green checkmark
    - Show provider name using `getProviderDisplayName()`
    - Display Client ID for OAuth or Entity ID for SAML
    - Display Redirect URI for OAuth or ACS URL for SAML
    - Display auto-provision status
    - Display admin bypass status
    - Add "Edit Configuration" button with onClick handler
    - Add "Disable SSO" button with onClick handler
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.3_
  
  - [ ]* 3.2 Write property test for configured state display completeness
    - **Property 4: Configured state display completeness**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**
  
  - [ ]* 3.3 Write property test for configured state action buttons
    - **Property 6: Configured state action buttons**
    - **Validates: Requirements 3.1, 3.3**

- [ ] 4. Implement state transition handlers
  - [x] 4.1 Implement handleSaveConfiguration function
    - Validate all required fields based on provider category
    - If validation fails, set validation errors and show toast
    - If validation passes, set `ssoConfigured` to true
    - Set `ssoEditMode` to false
    - Trigger auto-save by setting `hasChanges` to true
    - Show success toast
    - _Requirements: 4.3, 4.4, 5.4, 5.5, 7.7_
  
  - [x] 4.2 Implement handleEditConfiguration function
    - Set `ssoEditMode` to true
    - Store current values for potential cancel operation
    - _Requirements: 3.2_
  
  - [x] 4.3 Implement handleCancelEdit function
    - Restore original values from stored backup
    - Set `ssoEditMode` to false
    - Show info toast
    - _Requirements: 4.5_
  
  - [x] 4.4 Implement handleDisableSSO function
    - Show confirmation dialog
    - If confirmed, clear all SSO configuration fields
    - Set `ssoProvider` to null
    - Set `ssoConfigured` to false
    - Set `ssoEditMode` to false
    - Trigger auto-save by setting `hasChanges` to true
    - Show success toast
    - _Requirements: 3.4, 3.5_
  
  - [ ]* 4.5 Write property test for configured state transition
    - **Property 5: Configured state transition**
    - **Validates: Requirements 2.1**
  
  - [ ]* 4.6 Write property test for edit mode data preservation
    - **Property 7: Edit mode data preservation**
    - **Validates: Requirements 3.2**
  
  - [ ]* 4.7 Write property test for disable SSO state reset
    - **Property 8: Disable SSO state reset**
    - **Validates: Requirements 3.5**
  
  - [ ]* 4.8 Write property test for cancel preserves original values
    - **Property 12: Cancel preserves original values**
    - **Validates: Requirements 4.5**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement validation functions
  - [x] 6.1 Create validateOAuthFields function
    - Check Client ID is not empty
    - Check Client Secret is not empty
    - Check Authorization URL is not empty and is valid URL
    - Check Token URL is not empty and is valid URL
    - Return validation errors object
    - _Requirements: 6.1, 6.2_
  
  - [x] 6.2 Create validateSAMLFields function
    - Check IdP Entry Point is not empty and is valid URL
    - Check Entity ID is not empty
    - Check X.509 Certificate is not empty
    - Return validation errors object
    - _Requirements: 6.1, 6.2_
  
  - [x] 6.3 Create isValidUrl helper function
    - Use URL constructor to validate URL format
    - Return true if valid, false if invalid
    - _Requirements: 6.2_
  
  - [ ]* 6.4 Write property test for required field validation
    - **Property 15: Required field validation**
    - **Validates: Requirements 6.1**
  
  - [ ]* 6.5 Write property test for URL field validation
    - **Property 16: URL field validation**
    - **Validates: Requirements 6.2**
  
  - [ ]* 6.6 Write property test for save button state
    - **Property 14: Save button state based on validation**
    - **Validates: Requirements 5.3, 6.3, 6.4**

- [ ] 7. Update main SSO card rendering logic
  - [x] 7.1 Add conditional rendering based on UI state
    - When `uiState === 'unconfigured'`, render only provider selection dropdown
    - When `uiState === 'initial'`, render full configuration form with "Save Configuration" button
    - When `uiState === 'configured'`, render ConfiguredStateSummary component
    - When `uiState === 'edit'`, render full configuration form with info banner and "Save Changes"/"Cancel" buttons
    - _Requirements: 1.3, 2.1, 3.2, 4.1, 4.2, 5.1, 5.2_
  
  - [x] 7.2 Update provider selection dropdown handler
    - When provider changes, update `ssoProvider` state
    - Clear validation errors
    - Trigger `hasChanges` flag
    - _Requirements: 1.4_
  
  - [ ]* 7.3 Write property test for initial configuration form display
    - **Property 13: Initial configuration form display**
    - **Validates: Requirements 5.2**
  
  - [ ]* 7.4 Write property test for edit mode action buttons
    - **Property 9: Edit mode action buttons**
    - **Validates: Requirements 4.1, 4.2**

- [ ] 8. Add validation error display to form fields
  - [x] 8.1 Update OAuthFields to show validation errors
    - Display error message below each field when validation error exists
    - Style error messages in red text
    - _Requirements: 6.5_
  
  - [x] 8.2 Update SAMLFields to show validation errors
    - Display error message below each field when validation error exists
    - Style error messages in red text
    - _Requirements: 6.5_
  
  - [ ]* 8.3 Write property test for validation error display location
    - **Property 17: Validation error display location**
    - **Validates: Requirements 6.5**

- [ ] 9. Implement save button state management
  - [x] 9.1 Add isFormValid computed value
    - Check all required fields are filled based on provider category
    - Check no validation errors exist
    - Return boolean
    - _Requirements: 5.3, 6.3, 6.4_
  
  - [x] 9.2 Update save buttons to use isFormValid
    - Disable "Save Configuration" button when `!isFormValid`
    - Disable "Save Changes" button when `!isFormValid`
    - _Requirements: 5.3, 6.3_
  
  - [ ]* 9.3 Write property test for save triggers validation
    - **Property 10: Save triggers validation**
    - **Validates: Requirements 4.3, 5.4**
  
  - [ ]* 9.4 Write property test for successful save state transition
    - **Property 11: Successful save state transition**
    - **Validates: Requirements 4.4, 5.5**

- [ ] 10. Add auto-save integration
  - [x] 10.1 Ensure all state changes trigger hasChanges flag
    - Verify `handleSaveConfiguration` sets `hasChanges` to true
    - Verify `handleDisableSSO` sets `hasChanges` to true
    - Verify provider selection changes set `hasChanges` to true
    - _Requirements: 7.7_
  
  - [ ]* 10.2 Write property test for auto-save trigger
    - **Property 18: Auto-save trigger on state changes**
    - **Validates: Requirements 7.7**

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Manual testing and verification
  - Test OAuth provider selection shows only OAuth fields
  - Test SAML provider selection shows only SAML fields
  - Test configured state displays correct summary
  - Test Edit button opens form with current values
  - Test Cancel button discards changes
  - Test Disable SSO clears configuration
  - Test validation prevents saving with empty required fields
  - Test validation prevents saving with invalid URLs
  - Verify all existing SSO functionality still works
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation maintains all existing SSO functionality while improving the UX
