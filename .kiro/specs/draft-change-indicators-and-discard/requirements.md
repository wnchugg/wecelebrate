# Requirements Document

## Introduction

This feature enhances the draft/live workflow by providing visibility into unpublished changes and the ability to discard draft changes. Currently, the system supports saving changes to a draft_settings column and publishing those changes to live columns. However, users lack clear indicators when viewing live mode about whether unpublished draft changes exist, and they cannot easily discard draft changes when in draft mode.

## Glossary

- **Site**: A configuration entity in the system that can exist in draft or live mode
- **Draft_Settings**: A JSONB column containing unpublished changes that override live column values for admin view
- **Live_Mode**: The view mode where users see the published (live) configuration values
- **Draft_Mode**: The view mode where users see draft changes merged over live values
- **Admin**: A user with permissions to edit site configurations and publish changes
- **End_User**: A public user who only sees published (live) site configurations
- **Unpublished_Changes**: Modifications stored in draft_settings that have not been merged to live columns
- **Change_Indicator**: A visual element that signals the presence of unpublished changes
- **Discard_Action**: An operation that clears the draft_settings column, reverting to live values

## Requirements

### Requirement 1: Draft Change Indicator in Live Mode

**User Story:** As an admin viewing a site in live mode, I want to see a clear indicator when unpublished draft changes exist, so that I know there are pending modifications that haven't been published yet.

#### Acceptance Criteria

1. WHEN an admin views a site in live mode AND the site has draft_settings populated, THEN the System SHALL display a visual indicator showing unpublished changes exist
2. WHEN an admin views a site in live mode AND the site has draft_settings as null, THEN the System SHALL NOT display the unpublished changes indicator
3. WHEN the unpublished changes indicator is displayed, THEN the System SHALL provide a way to navigate to draft mode to view the changes
4. WHEN an admin hovers over or clicks the unpublished changes indicator, THEN the System SHALL display information about the presence of draft changes

### Requirement 2: Discard Draft Changes Functionality

**User Story:** As an admin editing a site in draft mode, I want the ability to discard all draft changes and revert to the live version, so that I can abandon unwanted modifications without publishing them.

#### Acceptance Criteria

1. WHEN an admin is in draft mode AND draft_settings is populated, THEN the System SHALL display a "Discard Draft" action
2. WHEN an admin is in draft mode AND draft_settings is null, THEN the System SHALL NOT display the "Discard Draft" action
3. WHEN an admin triggers the "Discard Draft" action, THEN the System SHALL prompt for confirmation before proceeding
4. WHEN an admin confirms the discard action, THEN the System SHALL clear the draft_settings column for that site
5. WHEN the draft_settings column is cleared, THEN the System SHALL reload the site data to display live values
6. WHEN the discard action completes successfully, THEN the System SHALL display a confirmation message to the admin

### Requirement 3: Draft Change Detection

**User Story:** As the system, I need to accurately detect when draft changes exist, so that I can correctly show or hide change indicators and discard functionality.

#### Acceptance Criteria

1. WHEN loading site data for admin view, THEN the System SHALL check if draft_settings is populated
2. WHEN draft_settings contains any non-null value, THEN the System SHALL set a flag indicating unpublished changes exist
3. WHEN draft_settings is null or undefined, THEN the System SHALL set a flag indicating no unpublished changes exist
4. WHEN the unpublished changes flag is set, THEN the System SHALL make this flag available to UI components for rendering decisions

### Requirement 4: Discard Confirmation Modal

**User Story:** As an admin, I want to confirm before discarding draft changes, so that I don't accidentally lose work.

#### Acceptance Criteria

1. WHEN an admin clicks "Discard Draft", THEN the System SHALL display a confirmation modal
2. WHEN the confirmation modal is displayed, THEN the System SHALL show a warning message about losing draft changes
3. WHEN the confirmation modal is displayed, THEN the System SHALL provide "Cancel" and "Confirm Discard" actions
4. WHEN the admin clicks "Cancel", THEN the System SHALL close the modal without discarding changes
5. WHEN the admin clicks "Confirm Discard", THEN the System SHALL execute the discard operation and close the modal
6. WHILE the discard operation is in progress, THEN the System SHALL disable the confirmation buttons and show a loading state

### Requirement 5: UI Integration with Existing Components

**User Story:** As a developer, I want the new features to integrate seamlessly with existing UI components, so that the user experience remains consistent.

#### Acceptance Criteria

1. WHEN displaying the unpublished changes indicator in live mode, THEN the System SHALL position it near the mode toggle or site header
2. WHEN displaying the "Discard Draft" action in draft mode, THEN the System SHALL position it near the "Publish" button
3. WHEN the user discards draft changes, THEN the System SHALL update the change detection state used by the PublishConfirmationModal
4. WHEN the user discards draft changes, THEN the System SHALL update the siteChangesDetector to reflect no changes
5. WHEN rendering the discard button, THEN the System SHALL use styling consistent with destructive actions (red/warning colors)

### Requirement 6: Backend API Support

**User Story:** As the frontend, I need backend API endpoints to support draft change detection and discard operations, so that I can implement the UI features.

#### Acceptance Criteria

1. WHEN the frontend requests site data for admin view, THEN the Backend SHALL include the _hasUnpublishedChanges flag in the response
2. WHEN the frontend calls the discard draft endpoint, THEN the Backend SHALL clear the draft_settings column
3. WHEN the discard operation succeeds, THEN the Backend SHALL return the updated site data with draft_settings as null
4. IF the discard operation fails, THEN the Backend SHALL return an error response with a descriptive message
5. WHEN the backend processes a discard request, THEN the Backend SHALL validate that the site exists before attempting to clear draft_settings

### Requirement 7: State Management and Synchronization

**User Story:** As the system, I need to maintain consistent state across components after discard operations, so that the UI accurately reflects the current draft/live status.

#### Acceptance Criteria

1. WHEN draft changes are discarded, THEN the System SHALL update the SiteContext with the new site data
2. WHEN draft changes are discarded, THEN the System SHALL set hasUnpublishedChanges to false
3. WHEN draft changes are discarded, THEN the System SHALL clear any cached draft data in the frontend
4. WHEN the site data is reloaded after discard, THEN the System SHALL display live values in all form fields
5. WHEN switching between live and draft modes after discard, THEN the System SHALL show identical values in both modes
