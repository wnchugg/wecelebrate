# Implementation Plan: Auth Tab Auto-Switch Fix

## Overview

This implementation fixes a race condition where user-initiated authentication method changes are overwritten by the auto-switch to draft mode. The fix introduces a flag-based mechanism to distinguish between user-initiated changes (which should preserve form values) and manual mode switches (which should reload form fields).

## Tasks

- [x] 1. Add isUserInitiatedChange state flag
  - Add new state variable: `const [isUserInitiatedChange, setIsUserInitiatedChange] = useState(false);`
  - Place it near other mode-related state variables (configMode, hasChanges)
  - _Requirements: 4.1_

- [x] 2. Modify the main sync useEffect to respect the flag
  - [x] 2.1 Update the sync useEffect dependency array
    - Add `isUserInitiatedChange` to the dependency array of the large sync useEffect (around line 200)
    - This ensures the effect re-runs when the flag changes
    - _Requirements: 2.1, 2.2_
  
  - [x] 2.2 Add conditional check to skip sync during user changes
    - Wrap the entire sync logic in: `if (currentSite && !isUserInitiatedChange) { ... }`
    - This prevents form field reload when user is making changes
    - _Requirements: 2.1, 2.2_

- [x] 3. Update Advanced Auth button click handler
  - [x] 3.1 Add flag setting to Advanced Auth button
    - Modify the onClick handler to set `isUserInitiatedChange` to true before other state changes
    - Order: `setIsUserInitiatedChange(true)` → `setValidationMethod('sso')` → `setHasChanges(true)`
    - Located around line 3777 in SiteConfiguration.tsx
    - _Requirements: 1.1, 4.1_

- [x] 4. Update Simple Auth button click handler
  - [x] 4.1 Add flag setting to Simple Auth button
    - Modify the onClick handler to set `isUserInitiatedChange` to true before other state changes
    - Order: `setIsUserInitiatedChange(true)` → `setValidationMethod('email')` → `setHasChanges(true)`
    - Located around line 3747 in SiteConfiguration.tsx
    - _Requirements: 1.2, 4.1_

- [x] 5. Add useEffect to clear the flag after mode switch
  - [x] 5.1 Create new useEffect to detect mode changes
    - Add useEffect that watches `[configMode, isUserInitiatedChange]`
    - When `configMode === 'draft' && isUserInitiatedChange === true`, call `setIsUserInitiatedChange(false)`
    - Place this after the auto-switch useEffect (around line 570)
    - _Requirements: 2.3, 4.4_

- [x] 6. Checkpoint - Manual testing of core functionality
  - Test clicking "Advanced Auth" in live mode - verify it stays selected
  - Test clicking "Simple Auth" in live mode - verify it stays selected
  - Test that manual mode switching still reloads fields correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 7. Write unit tests for authentication method selection
  - [ ]* 7.1 Test Advanced Auth button preserves selection
    - **Example 1: Advanced Auth Selection Preserved**
    - **Validates: Requirements 1.1, 2.1**
    - Test that clicking Advanced Auth sets validationMethod to 'sso' and preserves it through auto-switch
    - _Requirements: 1.1, 2.1_
  
  - [ ]* 7.2 Test Simple Auth button preserves selection
    - **Example 2: Simple Auth Selection Preserved**
    - **Validates: Requirements 1.2, 2.1**
    - Test that clicking Simple Auth sets validationMethod to 'email' and preserves it through auto-switch
    - _Requirements: 1.2, 2.1_
  
  - [ ]* 7.3 Test flag lifecycle
    - **Example 3: User Change Flag Lifecycle**
    - **Validates: Requirements 2.3, 4.1, 4.4**
    - Test that isUserInitiatedChange is set on click and cleared after auto-switch
    - _Requirements: 2.3, 4.1, 4.4_

- [ ]* 8. Write unit tests for manual mode switching
  - [ ]* 8.1 Test manual mode switch reloads fields
    - **Example 4: Manual Mode Switch Reloads Fields**
    - **Validates: Requirements 3.1, 3.2, 4.5**
    - Test that manually clicking Live or Draft mode buttons reloads form fields
    - _Requirements: 3.1, 3.2, 4.5_
  
  - [ ]* 8.2 Test no auto-switch when already in draft
    - **Example 5: No Auto-Switch When Already in Draft**
    - **Validates: Requirements 5.2**
    - Test that changing auth method while in draft mode doesn't trigger auto-switch
    - _Requirements: 5.2_

- [ ]* 9. Write unit tests for edge cases
  - [ ]* 9.1 Test multiple rapid changes preserved
    - **Example 6: Multiple Rapid Changes Preserved**
    - **Validates: Requirements 5.3**
    - Test that making multiple rapid field changes preserves all of them
    - _Requirements: 5.3_
  
  - [ ]* 9.2 Test rapid toggle between auth methods
    - **Example 7: Rapid Toggle Between Auth Methods**
    - **Validates: Requirements 5.1**
    - Test that rapidly clicking between Simple and Advanced Auth preserves final selection
    - _Requirements: 5.1_
  
  - [ ]* 9.3 Test component unmount cleanup
    - Test that component unmounting during auto-switch doesn't cause errors
    - Verify useEffect cleanup functions prevent memory leaks
    - _Requirements: 5.4_

- [ ]* 10. Write property-based test for form field preservation
  - [ ]* 10.1 Implement property test with fast-check
    - **Property 1: Form Field Preservation During Auto-Switch**
    - **Validates: Requirements 2.1, 2.2**
    - Generate random form field values and verify they're preserved through auto-switch
    - Configure test to run minimum 100 iterations
    - Tag: **Feature: auth-tab-auto-switch-fix, Property 1: Form field preservation during auto-switch**
    - _Requirements: 2.1, 2.2_

- [ ] 11. Final checkpoint - Comprehensive testing
  - Run all unit tests and verify they pass
  - Run property-based test with 100+ iterations
  - Perform manual testing checklist from design document
  - Verify no console errors or warnings
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The core fix is in tasks 1-5, which modify the component to use the flag
- Task 6 is a checkpoint to verify the fix works before writing tests
- Tasks 7-10 provide comprehensive test coverage
- Each test task references specific requirements for traceability
- Property test validates the fix works universally across all form fields
- Unit tests validate specific scenarios and edge cases
