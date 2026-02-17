# Implementation Plan: Site Selection Persistence

## Overview

This implementation plan adds localStorage-based persistence for site selection in the admin panel. The changes are focused on the SiteContext component, adding utility functions for localStorage operations and modifying the site selection and restoration logic.

## Tasks

- [x] 1. Add localStorage utility functions to SiteContext
  - Add constant `SITE_SELECTION_STORAGE_KEY = 'admin_selected_site_id'`
  - Implement `persistSiteSelection(siteId: string): void` with try-catch and logging
  - Implement `getPersistedSiteSelection(): string | null` with try-catch and logging
  - Implement `clearPersistedSiteSelection(): void` with try-catch and logging
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.4, 4.1_

- [ ] 2. Modify site selection to persist to localStorage
  - [x] 2.1 Wrap setCurrentSite to add persistence logic
    - When site is not null, call `persistSiteSelection(site.id)`
    - When site is null, call `clearPersistedSiteSelection()`
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 2.2 Write property test for site selection persistence
    - **Property 1: Site Selection Persistence**
    - **Validates: Requirements 1.1, 1.2, 3.4**
  
  - [ ]* 2.3 Write unit test for localStorage write failure
    - Mock localStorage.setItem to throw error
    - Verify error is logged and operation continues without throwing
    - _Requirements: 1.3_

- [ ] 3. Add site restoration logic to loadData useEffect
  - [x] 3.1 Implement restoration logic after sites are loaded
    - Call `getPersistedSiteSelection()` to get persisted site ID
    - If persisted ID exists, find matching site in loaded sites array
    - If match found, set as currentSite and set corresponding client
    - If no match found, call `clearPersistedSiteSelection()` and proceed with auto-selection
    - If no persisted ID, proceed with existing auto-selection logic
    - Ensure auto-selected sites are also persisted via the wrapped setCurrentSite
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 3.2 Write property test for valid site restoration
    - **Property 2: Valid Site Restoration**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ]* 3.3 Write property test for auto-selection fallback
    - **Property 3: Auto-Selection Fallback**
    - **Validates: Requirements 3.1**
  
  - [ ]* 3.4 Write unit tests for edge cases
    - Test invalid persisted site ID (not in loaded sites)
    - Test localStorage read failure
    - Test no active sites (only inactive sites)
    - Test empty site list
    - _Requirements: 2.3, 2.4, 3.2, 3.3_

- [ ] 4. Add logout cleanup logic
  - [x] 4.1 Add useEffect to clear selection on logout
    - Watch `isAdminAuthenticated` state
    - When it becomes false, call `clearPersistedSiteSelection()`
    - Also set `currentSite` to null
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 4.2 Write property test for logout clears selection
    - **Property 4: Logout Clears Selection**
    - **Validates: Requirements 4.1, 4.2**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All localStorage operations use try-catch for error handling
- Existing auto-selection logic is preserved as fallback
- No changes needed to AdminLayout or other components
- Property tests should run minimum 100 iterations each
- Use `fast-check` library for property-based testing in TypeScript
