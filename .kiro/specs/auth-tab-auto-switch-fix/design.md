# Design Document: Auth Tab Auto-Switch Fix

## Overview

This design addresses a race condition in the SiteConfiguration component where user-initiated changes to authentication methods are immediately overwritten by an automatic mode switch. The issue occurs because:

1. User clicks "Advanced Auth" → sets `validationMethod = 'sso'` and `hasChanges = true`
2. useEffect detects `hasChanges = true` → auto-switches to draft mode
3. Auto-switch calls `handleModeToggle('draft')` → reloads all form fields from `currentSite`
4. Form reload overwrites `validationMethod` back to its original value

The solution introduces a flag-based mechanism to distinguish between user-initiated changes (which should skip form reload) and manual mode switches (which should reload form fields).

## Architecture

### Current Flow (Problematic)

```
User clicks "Advanced Auth"
  ↓
setValidationMethod('sso')
setHasChanges(true)
  ↓
useEffect [hasChanges, configMode] triggers
  ↓
Auto-switch: setConfigMode('draft')
  ↓
useEffect [configMode] triggers (if exists) OR
handleModeToggle is called elsewhere
  ↓
handleModeToggle('draft') executes
  ↓
Reloads ALL form fields from currentSite
  ↓
validationMethod reset to original value ❌
```

### Proposed Flow (Fixed)

```
User clicks "Advanced Auth"
  ↓
setIsUserInitiatedChange(true)  ← NEW FLAG
setValidationMethod('sso')
setHasChanges(true)
  ↓
useEffect [hasChanges, configMode] triggers
  ↓
Auto-switch: setConfigMode('draft')
  ↓
useEffect [configMode] detects isUserInitiatedChange = true
  ↓
Skips form field reload
Clears isUserInitiatedChange flag
  ↓
validationMethod preserved ✓
```

## Components and Interfaces

### New State Variable

```typescript
const [isUserInitiatedChange, setIsUserInitiatedChange] = useState(false);
```

This flag tracks whether the current change was initiated by user interaction (as opposed to programmatic updates or mode switches).

### Modified Auto-Switch useEffect

The existing auto-switch useEffect needs to be enhanced to set the flag when switching modes:

```typescript
// Current implementation
useEffect(() => {
  if (hasChanges && configMode === 'live') {
    setConfigMode('draft');
    toast.info('Switched to Draft mode', {
      description: 'Your changes will be saved as a draft. Publish when ready.',
      duration: 3000
    });
  }
}, [hasChanges, configMode]);
```

This will be modified to set a flag that handleModeToggle can check.

### Modified handleModeToggle Function

The `handleModeToggle` function needs to check the flag before reloading form fields:

```typescript
const handleModeToggle = async (newMode: 'live' | 'draft', skipReload = false) => {
  if (newMode === configMode) return;
  
  // Check for unsaved changes when leaving draft mode
  if (configMode === 'draft' && newMode === 'live' && hasChanges) {
    setPendingModeSwitch('live');
    setShowUnsavedChangesModal(true);
    return;
  }
  
  if (newMode === 'live') {
    // Switching to live mode - always fetch and display live data
    // ... existing live mode logic ...
  } else {
    // Switching to draft mode
    if (!skipReload) {
      // Only reload form fields if not skipping
      // ... existing draft mode reload logic ...
    }
    
    setConfigMode('draft');
    setHasChanges(false);
    
    toast.info('Switched to Draft Mode', {
      description: 'You can now edit and save changes.',
      duration: 3000
    });
  }
};
```

### Modified Button Click Handlers

Both authentication method buttons need to set the flag before making changes:

```typescript
// Advanced Auth button
<button
  onClick={() => {
    setIsUserInitiatedChange(true);
    setValidationMethod('sso');
    setHasChanges(true);
  }}
  // ... rest of button props
>

// Simple Auth button
<button
  onClick={() => {
    if (validationMethod === 'sso') {
      setIsUserInitiatedChange(true);
      setValidationMethod('email');
      setHasChanges(true);
    }
  }}
  // ... rest of button props
>
```

### New useEffect for Mode Change Detection

A new useEffect will detect when configMode changes and handle the flag:

```typescript
useEffect(() => {
  // When mode changes to draft due to user-initiated change
  if (configMode === 'draft' && isUserInitiatedChange) {
    // Clear the flag after mode switch completes
    setIsUserInitiatedChange(false);
  }
}, [configMode, isUserInitiatedChange]);
```

## Data Models

### State Variables

```typescript
// Existing
const [configMode, setConfigMode] = useState<'live' | 'draft'>('live');
const [hasChanges, setHasChanges] = useState(false);
const [validationMethod, setValidationMethod] = useState<'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso'>(
  currentSite?.settings?.validationMethod || 'email'
);

// New
const [isUserInitiatedChange, setIsUserInitiatedChange] = useState(false);
```

### Function Signatures

```typescript
// Modified signature (optional parameter)
const handleModeToggle = async (
  newMode: 'live' | 'draft',
  skipReload?: boolean
) => Promise<void>;

// Existing signatures remain unchanged
const setValidationMethod: (value: 'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso') => void;
const setHasChanges: (value: boolean) => void;
const setConfigMode: (value: 'live' | 'draft') => void;
```

## Alternative Approach: Direct Flag Check

An alternative simpler approach is to modify the auto-switch useEffect to call handleModeToggle with a skip flag:

```typescript
// Modified auto-switch useEffect
useEffect(() => {
  if (hasChanges && configMode === 'live') {
    handleModeToggle('draft', true); // Skip reload
    toast.info('Switched to Draft mode', {
      description: 'Your changes will be saved as a draft. Publish when ready.',
      duration: 3000
    });
  }
}, [hasChanges, configMode]);
```

This approach is simpler but requires careful handling to ensure the auto-switch doesn't call handleModeToggle if it's already being called elsewhere.

## Recommended Approach

After analysis, the recommended approach is a hybrid:

1. **Add `isUserInitiatedChange` flag** to track user-initiated changes
2. **Modify auto-switch useEffect** to check the flag and skip calling handleModeToggle entirely
3. **Add new useEffect** to detect mode changes and clear the flag
4. **Keep handleModeToggle unchanged** to maintain existing behavior for manual switches

This approach:
- Minimizes changes to existing code
- Clearly separates auto-switch from manual switch behavior
- Avoids potential issues with calling handleModeToggle from useEffect
- Makes the code more maintainable

### Revised Auto-Switch Implementation

```typescript
// Auto-switch to draft mode when changes are detected
useEffect(() => {
  if (hasChanges && configMode === 'live' && !isUserInitiatedChange) {
    // This is a programmatic change, use normal flow
    setConfigMode('draft');
    toast.info('Switched to Draft mode', {
      description: 'Your changes will be saved as a draft. Publish when ready.',
      duration: 3000
    });
  } else if (hasChanges && configMode === 'live' && isUserInitiatedChange) {
    // This is a user-initiated change, skip reload
    setConfigMode('draft');
    // Don't trigger handleModeToggle - just switch mode
    toast.info('Switched to Draft mode', {
      description: 'Your changes will be saved as a draft. Publish when ready.',
      duration: 3000
    });
  }
}, [hasChanges, configMode, isUserInitiatedChange]);

// Clear flag after mode switch completes
useEffect(() => {
  if (configMode === 'draft' && isUserInitiatedChange) {
    setIsUserInitiatedChange(false);
  }
}, [configMode, isUserInitiatedChange]);
```

Wait, this still has an issue. The problem is that the auto-switch useEffect just sets `configMode`, but somewhere else `handleModeToggle` must be getting called. Let me reconsider...

Actually, looking at the code more carefully, the auto-switch useEffect only calls `setConfigMode('draft')` directly. It doesn't call `handleModeToggle`. So the issue must be that there's another useEffect that watches `configMode` and calls `handleModeToggle`, OR the form fields are being reloaded in the main sync useEffect.

Looking back at the code, I see the main sync useEffect at the beginning that syncs all form fields when `currentSite` changes. The issue is likely that when we switch to draft mode, `currentSite` might be getting updated, which triggers the sync useEffect.

Let me revise the approach:

## Revised Architecture

The actual issue is that the large sync useEffect (around line 200-450) reloads all form fields whenever `currentSite` changes. When auto-switching to draft mode, if `currentSite` updates, this triggers the sync useEffect which overwrites all form fields.

### Root Cause Analysis

```
User clicks "Advanced Auth"
  ↓
setValidationMethod('sso')
setHasChanges(true)
  ↓
Auto-switch useEffect triggers
  ↓
setConfigMode('draft')
  ↓
currentSite might update (context refresh)
  ↓
Sync useEffect [currentSite] triggers
  ↓
Reloads ALL form fields from currentSite
  ↓
validationMethod reset ❌
```

### Solution: Skip Sync During User Changes

The solution is to prevent the sync useEffect from running when we have user-initiated changes:

```typescript
// Sync state when currentSite changes
useEffect(() => {
  if (currentSite && !isUserInitiatedChange) {
    // Only sync if not a user-initiated change
    setSiteName(currentSite.name || '');
    setSiteUrl(currentSite.slug || '');
    // ... all other field syncs ...
  }
}, [currentSite, isUserInitiatedChange]);
```

This prevents the sync from overwriting user changes while still allowing it to work for other scenarios (like when switching sites or loading initial data).


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Form Field Preservation During Auto-Switch

*For any* form field change made by a user in live mode, when the auto-switch to draft mode is triggered, the changed field value should be preserved and not overwritten by the sync from currentSite.

**Validates: Requirements 2.1, 2.2**

This property ensures that the core fix works universally across all form fields, not just the authentication method. Any user-initiated change should survive the auto-switch process.

### Example Test Cases

While property-based testing is valuable, this bugfix is primarily about specific UI interactions and state management. The following example tests provide comprehensive coverage:

#### Example 1: Advanced Auth Selection Preserved

Test that clicking "Advanced Auth" button preserves the selection through auto-switch.

**Validates: Requirements 1.1, 2.1**

**Test Steps:**
1. Start in live mode with validationMethod = 'email'
2. Click "Advanced Auth" button
3. Wait for auto-switch to complete
4. Assert validationMethod === 'sso'
5. Assert configMode === 'draft'

#### Example 2: Simple Auth Selection Preserved

Test that clicking "Simple Auth" button (when currently on Advanced Auth) preserves the selection through auto-switch.

**Validates: Requirements 1.2, 2.1**

**Test Steps:**
1. Start in live mode with validationMethod = 'sso'
2. Click "Simple Auth" button
3. Wait for auto-switch to complete
4. Assert validationMethod === 'email'
5. Assert configMode === 'draft'

#### Example 3: User Change Flag Lifecycle

Test that the isUserInitiatedChange flag is set and cleared correctly.

**Validates: Requirements 2.3, 4.1, 4.4**

**Test Steps:**
1. Start in live mode
2. Click "Advanced Auth" button
3. Assert isUserInitiatedChange === true (immediately after click)
4. Wait for auto-switch to complete
5. Assert isUserInitiatedChange === false (after mode switch)
6. Assert configMode === 'draft'

#### Example 4: Manual Mode Switch Reloads Fields

Test that manually switching modes still reloads form fields as expected.

**Validates: Requirements 3.1, 3.2, 4.5**

**Test Steps:**
1. Start in draft mode with validationMethod = 'sso'
2. Manually click "Live" mode button
3. Assert form fields are reloaded from live data
4. Assert validationMethod matches live data (not 'sso')
5. Manually click "Draft" mode button
6. Assert form fields are reloaded from draft data

#### Example 5: No Auto-Switch When Already in Draft

Test that changing auth method while already in draft mode doesn't trigger auto-switch.

**Validates: Requirements 5.2**

**Test Steps:**
1. Start in draft mode
2. Click "Advanced Auth" button
3. Assert validationMethod === 'sso'
4. Assert configMode === 'draft' (no mode change)
5. Assert no toast notification about mode switch

#### Example 6: Multiple Rapid Changes Preserved

Test that making multiple rapid changes preserves all of them.

**Validates: Requirements 5.3**

**Test Steps:**
1. Start in live mode
2. Click "Advanced Auth" button
3. Immediately change another field (e.g., siteName)
4. Wait for auto-switch to complete
5. Assert validationMethod === 'sso'
6. Assert siteName has the new value
7. Assert configMode === 'draft'

#### Example 7: Rapid Toggle Between Auth Methods

Test that rapidly clicking between Simple and Advanced Auth preserves the final selection.

**Validates: Requirements 5.1**

**Test Steps:**
1. Start in live mode with validationMethod = 'email'
2. Click "Advanced Auth" button
3. Immediately click "Simple Auth" button
4. Immediately click "Advanced Auth" button again
5. Wait for all state updates to complete
6. Assert validationMethod === 'sso' (final selection)
7. Assert configMode === 'draft'

## Error Handling

### Potential Error Scenarios

1. **Component Unmounts During Auto-Switch**
   - Risk: Memory leaks or state updates on unmounted component
   - Mitigation: Use cleanup functions in useEffect hooks
   - Detection: React will warn in development mode

2. **currentSite Updates During User Change**
   - Risk: Sync useEffect might still trigger despite flag
   - Mitigation: Include isUserInitiatedChange in useEffect dependency array
   - Detection: Unit tests will catch this

3. **Flag Not Cleared**
   - Risk: Flag remains true, preventing future syncs
   - Mitigation: Multiple useEffect hooks to ensure flag is cleared
   - Detection: Subsequent mode switches will fail tests

4. **Race Condition with Multiple Rapid Clicks**
   - Risk: State updates might interleave incorrectly
   - Mitigation: React's batching should handle this, but test thoroughly
   - Detection: Rapid click tests will catch this

### Error Recovery

The fix is designed to be fail-safe:
- If the flag fails to set, worst case is the old buggy behavior (field reset)
- If the flag fails to clear, worst case is one missed sync (user can manually refresh)
- No data corruption or permanent state issues

## Testing Strategy

### Unit Tests

Focus on specific scenarios and edge cases:

1. **Authentication Method Selection**
   - Test both Simple Auth and Advanced Auth button clicks
   - Verify validationMethod is set correctly
   - Verify hasChanges is set to true
   - Verify isUserInitiatedChange is set to true

2. **Auto-Switch Behavior**
   - Test that auto-switch occurs when hasChanges becomes true in live mode
   - Test that auto-switch does not occur when already in draft mode
   - Test that auto-switch does not occur when hasChanges is false

3. **Form Field Preservation**
   - Test that validationMethod is preserved through auto-switch
   - Test that other form fields are also preserved
   - Test that multiple simultaneous changes are preserved

4. **Manual Mode Switching**
   - Test that manual switch to live mode reloads fields
   - Test that manual switch to draft mode reloads fields
   - Test that unsaved changes modal appears when appropriate

5. **Flag Lifecycle**
   - Test that isUserInitiatedChange is set on user action
   - Test that isUserInitiatedChange is cleared after auto-switch
   - Test that isUserInitiatedChange is not set on manual mode switch

6. **Edge Cases**
   - Test rapid clicking between auth methods
   - Test changing auth method while in draft mode
   - Test multiple rapid field changes
   - Test component unmount during auto-switch (cleanup)

### Property-Based Tests

Run with minimum 100 iterations:

1. **Property Test: Form Field Preservation**
   - **Feature: auth-tab-auto-switch-fix, Property 1: Form field preservation during auto-switch**
   - Generate random form field values
   - Set field value and trigger auto-switch
   - Verify field value is preserved
   - This tests that the fix works for any form field, not just validationMethod

### Integration Tests

1. **Full User Flow**
   - Start in live mode
   - Click Advanced Auth
   - Wait for auto-switch
   - Make additional changes
   - Save draft
   - Verify all changes are saved

2. **Mode Switching Flow**
   - Start in live mode
   - Make changes and auto-switch to draft
   - Manually switch back to live
   - Verify fields are reloaded from live data
   - Manually switch to draft
   - Verify fields are reloaded from draft data

### Manual Testing Checklist

1. Click "Advanced Auth" in live mode → verify it stays selected
2. Click "Simple Auth" in live mode → verify it stays selected
3. Rapidly click between Simple and Advanced → verify final selection persists
4. Change auth method while in draft mode → verify no auto-switch occurs
5. Change auth method, then immediately change another field → verify both persist
6. Manually switch between live and draft modes → verify fields reload correctly
7. Make changes in draft, try to switch to live → verify unsaved changes modal appears

### Test Configuration

- **Unit tests**: Jest + React Testing Library
- **Property tests**: fast-check (for TypeScript/React)
- **Integration tests**: Playwright or Cypress for full UI testing
- **Minimum iterations for property tests**: 100
- **Test environment**: Mock SiteContext with controlled currentSite updates

### Success Criteria

All tests must pass, including:
- All unit tests for specific scenarios
- Property test with 100+ iterations
- All integration tests
- Manual testing checklist completed without issues
- No console errors or warnings
- No memory leaks detected
