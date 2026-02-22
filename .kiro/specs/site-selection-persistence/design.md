# Design Document: Site Selection Persistence

## Overview

This bugfix implements localStorage-based persistence for site selection in the admin panel. The current implementation stores site selection only in React state, causing it to be lost on page refreshes, navigation, or component re-renders. This design adds a persistence layer that saves the selected site ID to localStorage and restores it on subsequent loads, while maintaining the existing auto-selection fallback behavior.

The fix is minimal and focused: it adds localStorage read/write operations at strategic points in the SiteContext component without changing the overall architecture or data flow.

## Architecture

The solution follows a layered approach:

1. **Persistence Layer**: localStorage operations wrapped in try-catch for error handling
2. **State Management Layer**: Existing React state in SiteContext
3. **Restoration Logic**: Runs during the data loading useEffect to restore persisted selection
4. **Cleanup Logic**: Clears persisted selection on logout

The persistence layer is implemented as a set of utility functions within SiteContext.tsx to keep the changes localized and minimize impact on other components.

## Components and Interfaces

### Modified Component: SiteContext

**Location**: `src/app/context/SiteContext.tsx`

**New Constants**:
```typescript
const SITE_SELECTION_STORAGE_KEY = 'admin_selected_site_id';
```

**New Utility Functions**:

```typescript
// Persist site ID to localStorage
function persistSiteSelection(siteId: string): void {
  try {
    localStorage.setItem(SITE_SELECTION_STORAGE_KEY, siteId);
    logger.info('[SiteContext] Persisted site selection', { siteId });
  } catch (error) {
    logger.error('[SiteContext] Failed to persist site selection', { error });
    // Continue operation - persistence failure should not break functionality
  }
}

// Retrieve persisted site ID from localStorage
function getPersistedSiteSelection(): string | null {
  try {
    return localStorage.getItem(SITE_SELECTION_STORAGE_KEY);
  } catch (error) {
    logger.error('[SiteContext] Failed to read persisted site selection', { error });
    return null;
  }
}

// Clear persisted site selection from localStorage
function clearPersistedSiteSelection(): void {
  try {
    localStorage.removeItem(SITE_SELECTION_STORAGE_KEY);
    logger.info('[SiteContext] Cleared persisted site selection');
  } catch (error) {
    logger.error('[SiteContext] Failed to clear persisted site selection', { error });
  }
}
```

**Modified Logic**:

1. **Site Selection Restoration** (in the `loadData` useEffect, after sites are loaded):
   - Check for persisted site ID using `getPersistedSiteSelection()`
   - If found, validate it exists in the loaded sites array
   - If valid, restore that site as `currentSite`
   - If invalid, clear the stale value and fall back to auto-selection
   - If not found, proceed with existing auto-selection logic

2. **Site Selection Persistence** (in `setCurrentSite` wrapper):
   - Wrap the existing `setCurrentSite` state setter
   - When a site is set (not null), call `persistSiteSelection(site.id)`
   - When null is set, call `clearPersistedSiteSelection()`

3. **Logout Cleanup** (new useEffect):
   - Listen for authentication state changes
   - When `isAdminAuthenticated` becomes false, call `clearPersistedSiteSelection()`
   - Also clear `currentSite` state

### Unchanged Components

- **AdminLayout.tsx**: No changes needed. The `handleSiteChange` function already calls `setCurrentSite`, which will now trigger persistence automatically.
- Other components using `useSite()` hook: No changes needed.

## Data Models

No new data models are introduced. The solution uses the existing `Site` interface and stores only the site ID (string) in localStorage.

**localStorage Schema**:
```typescript
{
  "admin_selected_site_id": "site-123" // string | null
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Site Selection Persistence

*For any* site selection (manual or auto-selected), when a site is set as the current site, the site ID should be persisted to localStorage and retrievable on subsequent reads.

**Validates: Requirements 1.1, 1.2, 3.4**

### Property 2: Valid Site Restoration

*For any* valid site ID stored in localStorage that matches a site in the loaded sites array, initializing the SiteContext should restore that site as the current selection.

**Validates: Requirements 2.1, 2.2**

### Property 3: Auto-Selection Fallback

*For any* set of loaded sites with at least one active site, when no valid persisted selection exists, the first active site should be auto-selected and persisted.

**Validates: Requirements 3.1**

### Property 4: Logout Clears Selection

*For any* authenticated session with a selected site, when the user logs out (authentication state becomes false), both the localStorage persisted value and the React state current site should be cleared.

**Validates: Requirements 4.1, 4.2**

## Error Handling

All localStorage operations are wrapped in try-catch blocks to handle potential errors:

1. **localStorage.setItem() failures**: Log error and continue operation. The application remains functional even if persistence fails.

2. **localStorage.getItem() failures**: Log error and return null, triggering the auto-selection fallback.

3. **localStorage.removeItem() failures**: Log error and continue. Logout proceeds normally even if cleanup fails.

4. **Invalid persisted site ID**: When a persisted ID doesn't match any loaded site (e.g., site was deleted), clear the stale value and proceed with auto-selection.

All errors are logged using the existing `logger` utility for debugging and monitoring purposes.

## Testing Strategy

### Dual Testing Approach

This bugfix requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing

**Library**: For TypeScript/React, use `fast-check` for property-based testing.

**Configuration**:
- Each property test must run a minimum of 100 iterations
- Each test must be tagged with a comment referencing the design property
- Tag format: `// Feature: site-selection-persistence, Property {number}: {property_text}`

**Property Test Cases**:

1. **Property 1 Test**: Generate random site objects, call setCurrentSite, verify localStorage contains the site ID
   - Tag: `// Feature: site-selection-persistence, Property 1: Site selection persistence`

2. **Property 2 Test**: Generate random sites, persist one site ID to localStorage, initialize context, verify that site is restored
   - Tag: `// Feature: site-selection-persistence, Property 2: Valid site restoration`

3. **Property 3 Test**: Generate random site arrays with at least one active site, clear localStorage, initialize context, verify first active site is selected and persisted
   - Tag: `// Feature: site-selection-persistence, Property 3: Auto-selection fallback`

4. **Property 4 Test**: Set up authenticated state with selected site, trigger logout, verify localStorage is cleared and state is null
   - Tag: `// Feature: site-selection-persistence, Property 4: Logout clears selection`

### Unit Testing

**Unit Test Cases**:

1. **localStorage write failure**: Mock localStorage.setItem to throw, verify error is logged and operation continues
2. **localStorage read failure**: Mock localStorage.getItem to throw, verify error is logged and auto-selection occurs
3. **Invalid persisted site ID**: Set a non-existent site ID in localStorage, verify it's cleared and auto-selection occurs
4. **No active sites**: Load only inactive sites, verify first site (regardless of status) is selected
5. **Empty site list**: Load zero sites, verify currentSite is set to null
6. **Persistence on auto-selection**: Verify that auto-selected sites are also persisted to localStorage

### Integration Testing

Test the complete flow in a browser environment:
1. Login → select site → verify localStorage
2. Refresh page → verify site is restored
3. Navigate between admin pages → verify site remains selected
4. Logout → verify localStorage is cleared
5. Login again → verify auto-selection occurs (no persisted value)

### Test File Location

- Unit and property tests: `src/app/context/__tests__/SiteContext.persistence.test.tsx`
- Integration tests: `src/app/context/__tests__/SiteContext.integration.test.tsx`
