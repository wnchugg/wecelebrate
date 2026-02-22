# Requirements Document

## Introduction

This specification addresses a critical bug in the SiteConfiguration component where user interactions with authentication method selection are lost due to a race condition between state updates and automatic mode switching. When a user clicks "Advanced Auth" or "Simple Auth" buttons, the selection triggers an auto-switch to draft mode, which then reloads all form fields from the current site data, immediately overwriting the user's selection. This makes it impossible for users to change authentication methods.

## Glossary

- **SiteConfiguration**: The React component that manages site configuration settings
- **validationMethod**: The state variable that stores the authentication method ('email', 'employeeId', 'serialCard', 'magic_link', or 'sso')
- **hasChanges**: Boolean state flag indicating whether the form has unsaved changes
- **configMode**: The current configuration mode ('live' or 'draft')
- **handleModeToggle**: Function that switches between live and draft modes and reloads form fields
- **Auto-switch**: The useEffect hook that automatically switches from live to draft mode when hasChanges becomes true
- **Form_Field_Reload**: The process in handleModeToggle that resets all form fields from currentSite data
- **Race_Condition**: The timing issue where user changes are made, auto-switch triggers, and then handleModeToggle overwrites the changes
- **User_Change_Flag**: A new flag to track when the user is actively making changes that should not be overwritten

## Requirements

### Requirement 1: Preserve Authentication Method Selection

**User Story:** As a site administrator, I want to switch between Simple Auth and Advanced Auth authentication methods, so that I can configure the appropriate authentication for my site.

#### Acceptance Criteria

1. WHEN a user clicks the "Advanced Auth" button, THE System SHALL set validationMethod to 'sso' and preserve this value through the auto-switch to draft mode
2. WHEN a user clicks the "Simple Auth" button, THE System SHALL set validationMethod to 'email' and preserve this value through the auto-switch to draft mode
3. WHEN the auto-switch to draft mode occurs after an authentication method change, THE System SHALL not reload form fields from currentSite
4. WHEN a user manually toggles between draft and live modes (not auto-switch), THE System SHALL reload form fields as expected

### Requirement 2: Prevent Form Field Reset During Auto-Switch

**User Story:** As a site administrator, I want my form changes to persist when the system auto-switches to draft mode, so that I don't lose my work.

#### Acceptance Criteria

1. WHEN the auto-switch to draft mode is triggered by user changes, THE System SHALL skip the form field reload in handleModeToggle
2. WHEN a user makes any form field change that triggers auto-switch, THE System SHALL preserve all pending changes
3. WHEN the auto-switch completes, THE System SHALL clear the user change flag to allow normal mode switching behavior

### Requirement 3: Maintain Existing Mode Switching Behavior

**User Story:** As a site administrator, I want the draft/live mode switching to continue working as expected for manual switches, so that I can view live vs draft configurations.

#### Acceptance Criteria

1. WHEN a user manually clicks the "Live" mode button, THE System SHALL reload all form fields from live site data
2. WHEN a user manually clicks the "Draft" mode button, THE System SHALL reload all form fields from draft site data
3. WHEN switching modes manually, THE System SHALL display appropriate toast notifications
4. WHEN the user has unsaved changes and attempts to switch from draft to live, THE System SHALL show the unsaved changes modal

### Requirement 4: Track User-Initiated Changes

**User Story:** As the system, I need to distinguish between auto-switches and manual mode switches, so that I can apply the correct behavior for each case.

#### Acceptance Criteria

1. WHEN a user makes a form field change, THE System SHALL set a user change flag before setting hasChanges to true
2. WHEN the auto-switch useEffect detects hasChanges is true, THE System SHALL check the user change flag
3. WHEN handleModeToggle is called with the user change flag set, THE System SHALL skip form field reload
4. WHEN handleModeToggle completes, THE System SHALL clear the user change flag
5. WHEN a user manually clicks a mode button, THE System SHALL not set the user change flag

### Requirement 5: Handle Edge Cases

**User Story:** As a site administrator, I want the authentication method selection to work reliably in all scenarios, so that I can configure my site without worrying about edge cases.

#### Acceptance Criteria

1. WHEN a user rapidly clicks between Simple Auth and Advanced Auth, THE System SHALL preserve the final selection
2. WHEN a user changes authentication method while already in draft mode, THE System SHALL not trigger auto-switch
3. WHEN a user changes authentication method and then immediately changes another field, THE System SHALL preserve both changes
4. WHEN the component unmounts during an auto-switch, THE System SHALL not cause errors or memory leaks
