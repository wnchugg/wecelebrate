# Implementation Plan: Draft Change Indicators and Discard

## Overview

This implementation plan breaks down the feature into discrete coding tasks. The feature adds visual indicators for unpublished draft changes and the ability to discard those changes. The implementation follows an incremental approach, building and testing each component before integration.

## Tasks

- [x] 1. Create UnpublishedChangesIndicator component
  - Create new file `src/app/components/UnpublishedChangesIndicator.tsx`
  - Implement component with amber/orange styling
  - Add AlertCircle icon from lucide-react
  - Display "Unpublished Changes" text
  - Add tooltip showing "You have unpublished changes in draft mode. Click to view and edit."
  - Make component clickable to trigger mode switch
  - Add hover effects and transitions
  - _Requirements: 1.1, 1.3, 1.4_

- [ ]* 1.1 Write unit tests for UnpublishedChangesIndicator
  - Test component renders with correct text and icon
  - Test onClick handler is called when clicked
  - Test tooltip appears on hover
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 2. Create DiscardConfirmationModal component
  - [x] 2.1 Create modal component file
    - Create new file `src/app/components/DiscardConfirmationModal.tsx`
    - Define DiscardConfirmationModalProps interface
    - Implement modal using existing dialog/modal components
    - Add AlertTriangle icon for warning
    - Display site name in warning message
    - _Requirements: 2.3, 4.1, 4.2_

  - [x] 2.2 Implement modal actions and states
    - Add "Cancel" button that calls onClose
    - Add "Discard Changes" button (red/destructive styling) that calls onConfirm
    - Disable both buttons when isDiscarding is true
    - Show loading spinner on confirm button during discard
    - Add proper button styling consistent with destructive actions
    - _Requirements: 4.3, 4.4, 4.5, 4.6_

  - [ ]* 2.3 Write unit tests for DiscardConfirmationModal
    - Test modal renders when isOpen is true
    - Test modal does not render when isOpen is false
    - Test warning message includes site name
    - Test cancel button calls onClose
    - Test confirm button calls onConfirm
    - Test buttons are disabled when isDiscarding is true
    - Test loading state displays during discard
    - _Requirements: 2.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 3. Integrate components into SiteConfiguration
  - [x] 3.1 Add state and handlers for discard functionality
    - Add showDiscardModal state (boolean)
    - Add isDiscarding state (boolean)
    - Implement handleDiscardDraft function to open modal
    - Implement handleConfirmDiscard function with try-catch
    - Call discardSiteDraft from SiteContext
    - Reload site data using getSiteLive after discard
    - Update all form fields with live values
    - Show success toast on completion
    - Show error toast on failure
    - _Requirements: 2.4, 2.5, 2.6_

  - [x] 3.2 Add UnpublishedChangesIndicator to header
    - Import UnpublishedChangesIndicator component
    - Add conditional rendering in live mode when _hasUnpublishedChanges is true
    - Position between mode toggle and "View Live" button
    - Pass handleModeToggle('draft') as onNavigateToDraft prop
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 3.3 Wire up existing Discard Draft button
    - Update existing discard button onClick to call handleDiscardDraft
    - Ensure button only shows when: configMode === 'draft' AND _hasUnpublishedChanges AND !hasChanges
    - Verify button styling matches destructive action pattern (red border/text)
    - _Requirements: 2.1, 2.2_

  - [x] 3.4 Add DiscardConfirmationModal to component
    - Import DiscardConfirmationModal component
    - Add modal to JSX with proper props
    - Pass showDiscardModal as isOpen
    - Pass setShowDiscardModal(false) as onClose
    - Pass handleConfirmDiscard as onConfirm
    - Pass isDiscarding state
    - Pass currentSite.name as siteName
    - _Requirements: 2.3, 4.1, 4.2, 4.3_

  - [ ]* 3.5 Write integration tests for SiteConfiguration updates
    - Test change indicator appears in live mode with draft changes
    - Test change indicator does not appear without draft changes
    - Test clicking indicator switches to draft mode
    - Test discard button appears in draft mode with saved changes
    - Test discard button does not appear with unsaved changes
    - Test clicking discard button opens modal
    - Test confirming discard updates form fields
    - Test success toast appears after discard
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.5, 2.6_

- [x] 4. Checkpoint - Ensure frontend components work
  - Manually test the UI in development environment
  - Verify change indicator appears/disappears correctly
  - Verify discard button appears/disappears correctly
  - Verify modal opens and closes properly
  - Verify form updates after discard
  - Ask the user if questions arise

- [x] 5. Implement backend discard endpoint
  - [x] 5.1 Add DELETE /v2/sites/:id/draft endpoint
    - Open `supabase/functions/server/crud_db.ts`
    - Locate the existing discardSiteDraft function (already implemented)
    - Verify it clears draft_settings column
    - Verify it returns updated site data
    - Add error handling for site not found
    - Add error handling for database errors
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

  - [x] 5.2 Ensure _hasUnpublishedChanges flag is set correctly
    - Open `supabase/functions/server/helpers.ts`
    - Verify mergeDraftSettings function sets _hasUnpublishedChanges flag
    - Verify flag is true when draft_settings is populated
    - Verify flag is false when draft_settings is null
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.1_

  - [ ]* 5.3 Write unit tests for backend discard endpoint
    - Test endpoint returns 404 for non-existent site
    - Test endpoint clears draft_settings for valid site
    - Test endpoint returns site with draft_settings=null
    - Test endpoint returns _hasUnpublishedChanges=false
    - Test endpoint handles database errors gracefully
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

  - [ ]* 5.4 Write property test for draft flag accuracy
    - **Property 3: Draft Change Flag Accuracy**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [ ]* 5.5 Write property test for backend flag inclusion
    - **Property 6: Backend Flag Inclusion**
    - **Validates: Requirements 6.1**

  - [ ]* 5.6 Write property test for backend draft clearing
    - **Property 7: Backend Draft Clearing**
    - **Validates: Requirements 6.2**

  - [ ]* 5.7 Write property test for successful discard response
    - **Property 8: Successful Discard Response**
    - **Validates: Requirements 6.3**

  - [ ]* 5.8 Write property test for site existence validation
    - **Property 9: Site Existence Validation**
    - **Validates: Requirements 6.5**

- [x] 6. Implement state management updates
  - [x] 6.1 Verify SiteContext discardSiteDraft implementation
    - Open `src/app/context/SiteContext.tsx`
    - Verify discardSiteDraft method exists and is properly implemented
    - Verify it calls DELETE /v2/sites/:id/draft
    - Verify it updates sites state with returned data
    - Verify it updates currentSite if it's the discarded site
    - Verify error handling and logging
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 6.2 Write property test for context state update
    - **Property 10: Context State Update After Discard**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ]* 6.3 Write property test for mode equivalence
    - **Property 11: Mode Equivalence After Discard**
    - **Validates: Requirements 7.5**

  - [ ]* 6.4 Write property test for change detection update
    - **Property 12: Change Detection Update After Discard**
    - **Validates: Requirements 5.3, 5.4**

- [ ] 7. Write property-based tests for discard flow
  - [ ]* 7.1 Write property test for discard API call
    - **Property 1: Discard API Call on Confirmation**
    - **Validates: Requirements 2.4**

  - [ ]* 7.2 Write property test for live values after discard
    - **Property 2: Live Values Displayed After Discard**
    - **Validates: Requirements 2.5, 7.4**

  - [ ]* 7.3 Write property test for modal cancellation
    - **Property 4: Modal Cancellation Preserves Draft**
    - **Validates: Requirements 4.4**

  - [ ]* 7.4 Write property test for modal confirmation
    - **Property 5: Modal Confirmation Triggers Discard**
    - **Validates: Requirements 4.5**

- [x] 8. Final checkpoint - End-to-end testing
  - Test complete flow: view live mode → see indicator → switch to draft → discard → verify revert
  - Test with multiple sites to ensure state isolation
  - Test error scenarios (network failure, site not found)
  - Test concurrent modification scenarios
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The backend discard endpoint (discardSiteDraft) is already implemented in SiteContext and crud_db.ts
- The discard button placeholder already exists in SiteConfiguration.tsx and needs to be wired up
- Each property test should run a minimum of 100 iterations
- Use fast-check library for property-based testing in TypeScript
- All components should use existing UI component library (shadcn/ui) for consistency
