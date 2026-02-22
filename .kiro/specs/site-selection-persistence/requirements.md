# Requirements Document

## Introduction

This bugfix addresses the issue where site selection in the admin panel is not persisted across page refreshes and navigation. Currently, when a user logs into the admin panel and navigates to site-configuration, they see a "No Site Selected" message even though sites are loaded and one should be auto-selected. The root cause is that the site selection is only stored in React state without any persistence mechanism (localStorage), causing the selection to be lost on page refreshes, navigation between routes, or component re-renders.

## Glossary

- **Site_Selection_Manager**: The component responsible for managing site selection state and persistence
- **SiteContext**: React context that provides site-related data and operations throughout the admin application
- **localStorage**: Browser storage mechanism for persisting data across sessions
- **Active_Site**: A site with status set to 'active' in the system

## Requirements

### Requirement 1: Persist Site Selection

**User Story:** As an admin user, I want my site selection to be remembered across page refreshes and navigation, so that I don't have to re-select the site every time I navigate or refresh the page.

#### Acceptance Criteria

1. WHEN a site is selected (either manually or auto-selected), THE Site_Selection_Manager SHALL persist the site ID to localStorage
2. WHEN the site selection changes, THE Site_Selection_Manager SHALL update the persisted value in localStorage immediately
3. WHEN localStorage write fails, THE Site_Selection_Manager SHALL log the error and continue operation without throwing

### Requirement 2: Restore Persisted Selection

**User Story:** As an admin user, I want the system to restore my previously selected site when I return to the admin panel, so that I can continue working with the same site context.

#### Acceptance Criteria

1. WHEN the SiteContext loads site data, THE Site_Selection_Manager SHALL check localStorage for a previously selected site ID
2. IF a persisted site ID exists and matches a loaded site, THEN THE Site_Selection_Manager SHALL restore that site as the current selection
3. IF a persisted site ID exists but does not match any loaded site, THEN THE Site_Selection_Manager SHALL clear the invalid persisted value and proceed with auto-selection
4. WHEN localStorage read fails, THE Site_Selection_Manager SHALL log the error and proceed with auto-selection

### Requirement 3: Fallback to Auto-Selection

**User Story:** As an admin user, I want the system to automatically select the first active site when no previous selection exists, so that I have a working site context immediately upon login.

#### Acceptance Criteria

1. WHEN no persisted site selection exists in localStorage, THE Site_Selection_Manager SHALL auto-select the first Active_Site from the loaded sites
2. IF no Active_Site exists, THEN THE Site_Selection_Manager SHALL select the first site from the loaded sites
3. IF no sites exist, THEN THE Site_Selection_Manager SHALL set the current site to null
4. WHEN auto-selection occurs, THE Site_Selection_Manager SHALL persist the auto-selected site ID to localStorage

### Requirement 4: Clear Selection on Logout

**User Story:** As an admin user, I want my site selection to be cleared when I log out, so that the next user doesn't inherit my site context.

#### Acceptance Criteria

1. WHEN the admin user logs out, THE Site_Selection_Manager SHALL remove the persisted site ID from localStorage
2. WHEN authentication state changes to unauthenticated, THE Site_Selection_Manager SHALL clear the current site selection from React state
