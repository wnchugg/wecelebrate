# Design Document: Draft Change Indicators and Discard

## Overview

This feature enhances the existing draft/live workflow by adding visual indicators for unpublished changes and the ability to discard draft modifications. The system already supports a draft_settings column that stores unpublished changes separately from live data. This design adds UI components and interactions to make the draft state more visible and manageable.

The feature consists of two main components:
1. A change indicator displayed in live mode when draft_settings is populated
2. A discard functionality in draft mode to clear draft_settings and revert to live values

## Architecture

### System Context

The feature integrates with the existing draft/live architecture:

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React)                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SiteConfiguration Component                                │
│  ├─ Mode Toggle (Live/Draft)                               │
│  ├─ Change Indicator (NEW) ◄─── Shows when draft exists   │
│  ├─ Discard Button (NEW) ◄────── Clears draft_settings    │
│  └─ Publish Button                                         │
│                                                             │
│  SiteContext                                                │
│  ├─ currentSite (with _hasUnpublishedChanges flag)        │
│  ├─ discardSiteDraft(id) (NEW)                            │
│  └─ getSiteLive(id)                                        │
│                                                             │
│  DiscardConfirmationModal (NEW)                            │
│  └─ Warns before discarding changes                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend (Supabase Functions)                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  GET /v2/sites/:id                                         │
│  └─ Returns site with _hasUnpublishedChanges flag         │
│                                                             │
│  DELETE /v2/sites/:id/draft (NEW)                         │
│  └─ Clears draft_settings column                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Database (PostgreSQL)                                       │
├─────────────────────────────────────────────────────────────┤
│  sites table                                                │
│  ├─ id, name, slug, ... (live columns)                    │
│  └─ draft_settings JSONB (nullable)                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Loading Site with Change Detection
```
1. Frontend requests site: GET /v2/sites/:id
2. Backend loads site from database
3. Backend checks if draft_settings is populated
4. Backend sets _hasUnpublishedChanges flag
5. Backend merges draft_settings over live columns (for admin view)
6. Frontend receives site with flag
7. Frontend displays change indicator if flag is true
```

#### Discarding Draft Changes
```
1. User clicks "Discard Draft" button
2. Frontend shows confirmation modal
3. User confirms discard
4. Frontend calls: DELETE /v2/sites/:id/draft
5. Backend validates site exists
6. Backend sets draft_settings = null
7. Backend returns updated site data
8. Frontend updates SiteContext
9. Frontend reloads form with live values
10. Frontend hides discard button and change indicator
```

## Components and Interfaces

### Frontend Components

#### 1. UnpublishedChangesIndicator Component

A new component that displays when viewing a site in live mode with unpublished draft changes.

```typescript
interface UnpublishedChangesIndicatorProps {
  onNavigateToDraft: () => void;
}

function UnpublishedChangesIndicator({ onNavigateToDraft }: UnpublishedChangesIndicatorProps) {
  // Displays a badge/pill with icon
  // Shows tooltip on hover with information
  // Clickable to switch to draft mode
}
```

**Placement**: Between the mode toggle and "View Live" button in the SiteConfiguration header.

**Visual Design**:
- Amber/orange color scheme (warning, not error)
- Icon: AlertCircle or FileEdit
- Text: "Unpublished Changes" or "Draft Pending"
- Tooltip: "You have unpublished changes in draft mode. Click to view and edit."

#### 2. DiscardConfirmationModal Component

A modal dialog that confirms the discard action before proceeding.

```typescript
interface DiscardConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDiscarding: boolean;
  siteName: string;
}

function DiscardConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDiscarding,
  siteName
}: DiscardConfirmationModalProps) {
  // Displays warning message
  // Shows site name for context
  // Provides Cancel and Confirm buttons
  // Disables buttons during discard operation
  // Shows loading state while discarding
}
```

**Modal Content**:
- Title: "Discard Draft Changes?"
- Warning icon (AlertTriangle)
- Message: "This will permanently delete all draft changes for [Site Name] and revert to the published version. This action cannot be undone."
- Buttons: "Cancel" (outline) and "Discard Changes" (destructive red)

#### 3. SiteConfiguration Component Updates

Modifications to the existing SiteConfiguration component:

```typescript
// Add state for discard modal
const [showDiscardModal, setShowDiscardModal] = useState(false);
const [isDiscarding, setIsDiscarding] = useState(false);

// Add handler for discard action
const handleDiscardDraft = async () => {
  setShowDiscardModal(true);
};

const handleConfirmDiscard = async () => {
  try {
    setIsDiscarding(true);
    await discardSiteDraft(currentSite.id);
    
    // Reload site data to show live values
    const liveData = await getSiteLive(currentSite.id);
    
    // Update all form fields with live values
    // ... (update state for all form fields)
    
    setHasChanges(false);
    setShowDiscardModal(false);
    
    toast.success('Draft discarded', {
      description: 'All changes have been reverted to the published version.'
    });
  } catch (error) {
    toast.error('Failed to discard draft', {
      description: error.message
    });
  } finally {
    setIsDiscarding(false);
  }
};

// Render change indicator in live mode
{configMode === 'live' && currentSite._hasUnpublishedChanges && (
  <UnpublishedChangesIndicator 
    onNavigateToDraft={() => handleModeToggle('draft')}
  />
)}

// Render discard button in draft mode (already exists, needs wiring)
{configMode === 'draft' && currentSite._hasUnpublishedChanges && !hasChanges && (
  <Button
    onClick={handleDiscardDraft}
    variant="outline"
    className="border-red-300 text-red-600 hover:bg-red-50"
  >
    <History className="w-4 h-4 mr-2" />
    Discard Draft
  </Button>
)}
```

### Backend API

#### Existing Endpoint Enhancement

**GET /v2/sites/:id**

Already returns `_hasUnpublishedChanges` flag. No changes needed.

Response:
```typescript
{
  success: true,
  data: {
    id: string,
    name: string,
    // ... other fields
    draft_settings: object | null,
    _hasUnpublishedChanges: boolean  // true if draft_settings is populated
  }
}
```

#### New Endpoint

**DELETE /v2/sites/:id/draft**

Clears the draft_settings column and returns updated site data.

Request:
```
DELETE /v2/sites/:id/draft
Authorization: Bearer <token>
```

Response (Success):
```typescript
{
  success: true,
  data: {
    id: string,
    name: string,
    // ... other fields (live values only)
    draft_settings: null,
    _hasUnpublishedChanges: false
  },
  message: "Draft changes discarded successfully"
}
```

Response (Error - Site Not Found):
```typescript
{
  success: false,
  error: "Site not found",
  message: "No site exists with the provided ID"
}
```

Response (Error - Server Error):
```typescript
{
  success: false,
  error: "Internal server error",
  message: "Failed to discard draft changes"
}
```

### SiteContext Updates

The SiteContext already has the `discardSiteDraft` method implemented. It needs to be properly wired to the UI.

```typescript
const discardSiteDraft = async (id: string): Promise<void> => {
  try {
    // Clear draft_settings column
    const result = await apiRequest<{ success: boolean; data: Site; message?: string }>(
      `/v2/sites/${id}/draft`,
      { method: 'DELETE' }
    );
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to discard draft');
    }
    
    // Update local state with live-only data
    setSites(prev => prev.map(s => s.id === id ? { ...s, ...result.data } : s));
    
    // Update currentSite if it's the one being updated
    if (currentSite?.id === id) {
      setCurrentSite({ ...currentSite, ...result.data });
    }
  } catch (error) {
    console.error('Failed to discard draft:', error);
    throw error;
  }
};
```

## Data Models

### Site Model (Extended)

The Site interface already includes the necessary fields. The key field for this feature:

```typescript
interface Site {
  // ... existing fields
  
  // Internal flag set by backend (not stored in DB)
  _hasUnpublishedChanges?: boolean;  // true when draft_settings is populated
  _draftSettings?: object;           // Copy of draft_settings for reference
}
```

### Database Schema

No changes needed. The existing schema already supports this feature:

```sql
CREATE TABLE sites (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  -- ... other live columns
  draft_settings JSONB DEFAULT NULL,  -- Stores unpublished changes
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Discard API Call on Confirmation
*For any* site with draft_settings populated, when an admin confirms the discard action, the system should make a DELETE request to `/v2/sites/:id/draft`.
**Validates: Requirements 2.4**

### Property 2: Live Values Displayed After Discard
*For any* site, after discarding draft changes, all form fields should display values that match the live column values from the database.
**Validates: Requirements 2.5, 7.4**

### Property 3: Draft Change Flag Accuracy
*For any* site loaded for admin view, the `_hasUnpublishedChanges` flag should be true if and only if `draft_settings` is non-null.
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: Modal Cancellation Preserves Draft
*For any* site with draft changes, when an admin clicks "Cancel" in the discard confirmation modal, the system should not call the discard API and draft_settings should remain unchanged.
**Validates: Requirements 4.4**

### Property 5: Modal Confirmation Triggers Discard
*For any* site with draft changes, when an admin clicks "Confirm Discard" in the modal, the system should call the discard API and close the modal.
**Validates: Requirements 4.5**

### Property 6: Backend Flag Inclusion
*For any* site request to the admin API, the response should include the `_hasUnpublishedChanges` flag.
**Validates: Requirements 6.1**

### Property 7: Backend Draft Clearing
*For any* site, when the discard endpoint is called, the backend should set `draft_settings` to null in the database.
**Validates: Requirements 6.2**

### Property 8: Successful Discard Response
*For any* site, when the discard operation succeeds, the backend should return site data with `draft_settings` as null and `_hasUnpublishedChanges` as false.
**Validates: Requirements 6.3**

### Property 9: Site Existence Validation
*For any* non-existent site ID, when the discard endpoint is called, the backend should return an error response without attempting to modify the database.
**Validates: Requirements 6.5**

### Property 10: Context State Update After Discard
*For any* site, after discarding draft changes, the SiteContext should contain the updated site data with `_hasUnpublishedChanges` set to false and no draft data in state.
**Validates: Requirements 7.1, 7.2, 7.3**

### Property 11: Mode Equivalence After Discard
*For any* site after discarding draft changes, switching between live and draft modes should display identical values in all form fields.
**Validates: Requirements 7.5**

### Property 12: Change Detection Update After Discard
*For any* site, after discarding draft changes, the change detection system (used by PublishConfirmationModal) should report zero changes when comparing current state to live state.
**Validates: Requirements 5.3, 5.4**

## Error Handling

### Frontend Error Scenarios

1. **Discard API Failure**
   - Scenario: Network error or server error during discard
   - Handling: Display error toast with message, keep modal open, allow retry
   - User Action: User can try again or cancel

2. **Site Not Found**
   - Scenario: Site was deleted by another admin during discard
   - Handling: Display error toast, close modal, redirect to site list
   - User Action: User selects a different site

3. **Concurrent Modification**
   - Scenario: Another admin published or modified the site during discard
   - Handling: Display warning toast, reload site data, close modal
   - User Action: User sees updated state

### Backend Error Scenarios

1. **Invalid Site ID**
   - Response: 404 Not Found
   - Message: "Site not found"

2. **Database Connection Error**
   - Response: 500 Internal Server Error
   - Message: "Failed to discard draft changes"
   - Logging: Log full error details for debugging

3. **Authorization Failure**
   - Response: 403 Forbidden
   - Message: "You don't have permission to modify this site"

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **UnpublishedChangesIndicator Component**
   - Renders correctly with proper styling
   - Calls onNavigateToDraft when clicked
   - Shows tooltip on hover

2. **DiscardConfirmationModal Component**
   - Renders with correct warning message
   - Disables buttons during discard operation
   - Shows loading state while discarding
   - Calls onConfirm when confirm button clicked
   - Calls onClose when cancel button clicked

3. **SiteConfiguration Component**
   - Shows change indicator in live mode when _hasUnpublishedChanges is true
   - Hides change indicator in live mode when _hasUnpublishedChanges is false
   - Shows discard button in draft mode when _hasUnpublishedChanges is true
   - Hides discard button in draft mode when _hasUnpublishedChanges is false
   - Opens modal when discard button clicked
   - Updates form fields after successful discard

4. **Backend Discard Endpoint**
   - Returns 404 for non-existent site
   - Returns 500 on database error
   - Returns success response with null draft_settings

### Property-Based Tests

Property-based tests will verify universal properties across all inputs. Each test should run a minimum of 100 iterations.

1. **Property 1: Discard API Call on Confirmation**
   - Generate: Random site with draft_settings
   - Action: Confirm discard
   - Assert: DELETE request made to correct endpoint
   - Tag: `Feature: draft-change-indicators-and-discard, Property 1: Discard API Call on Confirmation`

2. **Property 2: Live Values Displayed After Discard**
   - Generate: Random site with draft_settings different from live values
   - Action: Discard draft
   - Assert: All form fields match live values
   - Tag: `Feature: draft-change-indicators-and-discard, Property 2: Live Values Displayed After Discard`

3. **Property 3: Draft Change Flag Accuracy**
   - Generate: Random site (with or without draft_settings)
   - Action: Load site for admin
   - Assert: _hasUnpublishedChanges === (draft_settings !== null)
   - Tag: `Feature: draft-change-indicators-and-discard, Property 3: Draft Change Flag Accuracy`

4. **Property 4: Modal Cancellation Preserves Draft**
   - Generate: Random site with draft_settings
   - Action: Open modal, click cancel
   - Assert: No API call made, draft_settings unchanged
   - Tag: `Feature: draft-change-indicators-and-discard, Property 4: Modal Cancellation Preserves Draft`

5. **Property 5: Modal Confirmation Triggers Discard**
   - Generate: Random site with draft_settings
   - Action: Open modal, click confirm
   - Assert: API called, modal closed
   - Tag: `Feature: draft-change-indicators-and-discard, Property 5: Modal Confirmation Triggers Discard`

6. **Property 6: Backend Flag Inclusion**
   - Generate: Random site
   - Action: Request site from admin API
   - Assert: Response includes _hasUnpublishedChanges field
   - Tag: `Feature: draft-change-indicators-and-discard, Property 6: Backend Flag Inclusion`

7. **Property 7: Backend Draft Clearing**
   - Generate: Random site with draft_settings
   - Action: Call discard endpoint
   - Assert: draft_settings is null in database
   - Tag: `Feature: draft-change-indicators-and-discard, Property 7: Backend Draft Clearing`

8. **Property 8: Successful Discard Response**
   - Generate: Random site with draft_settings
   - Action: Call discard endpoint
   - Assert: Response has draft_settings=null and _hasUnpublishedChanges=false
   - Tag: `Feature: draft-change-indicators-and-discard, Property 8: Successful Discard Response`

9. **Property 9: Site Existence Validation**
   - Generate: Random non-existent site ID
   - Action: Call discard endpoint
   - Assert: Error response returned, no database modification attempted
   - Tag: `Feature: draft-change-indicators-and-discard, Property 9: Site Existence Validation`

10. **Property 10: Context State Update After Discard**
    - Generate: Random site with draft_settings
    - Action: Discard draft
    - Assert: SiteContext has updated site with _hasUnpublishedChanges=false
    - Tag: `Feature: draft-change-indicators-and-discard, Property 10: Context State Update After Discard`

11. **Property 11: Mode Equivalence After Discard**
    - Generate: Random site with draft_settings
    - Action: Discard draft, switch between modes
    - Assert: All form values identical in both modes
    - Tag: `Feature: draft-change-indicators-and-discard, Property 11: Mode Equivalence After Discard`

12. **Property 12: Change Detection Update After Discard**
    - Generate: Random site with draft_settings
    - Action: Discard draft
    - Assert: Change detection reports zero changes
    - Tag: `Feature: draft-change-indicators-and-discard, Property 12: Change Detection Update After Discard`

### Integration Tests

1. **End-to-End Discard Flow**
   - Create site with draft changes
   - Navigate to site configuration in live mode
   - Verify change indicator appears
   - Click indicator to switch to draft mode
   - Click discard button
   - Confirm in modal
   - Verify form shows live values
   - Verify change indicator disappears

2. **Concurrent User Scenario**
   - User A opens site in draft mode
   - User B discards draft changes
   - User A attempts to save changes
   - Verify appropriate conflict handling

### Test Configuration

- **Property Test Library**: Use `fast-check` for TypeScript/JavaScript
- **Minimum Iterations**: 100 per property test
- **Test Environment**: Jest with React Testing Library for frontend, Vitest for backend
- **Mocking**: Mock API calls in frontend tests, mock database in backend tests
