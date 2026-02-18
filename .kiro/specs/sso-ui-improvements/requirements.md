# SSO Configuration UI Improvements - Requirements

## Introduction

The SSO configuration UI in the Site Configuration Access tab currently displays all SSO fields simultaneously, regardless of the selected provider type. This creates a confusing user experience where OAuth/OpenID fields and SAML fields are both visible at once. Additionally, once SSO is configured, the full form remains displayed instead of showing a compact summary with edit/disable options. This spec addresses these UX issues while maintaining all existing SSO functionality.

## Glossary

- **SSO**: Single Sign-On authentication system
- **OAuth**: Open Authorization protocol for delegated access
- **OpenID**: Authentication layer on top of OAuth 2.0
- **SAML**: Security Assertion Markup Language for exchanging authentication data
- **IdP**: Identity Provider that authenticates users
- **Provider**: The SSO service being used (Azure AD, Okta, Google, etc.)
- **Configured State**: UI state showing SSO is already set up with summary view
- **Edit Mode**: UI state showing full SSO configuration form
- **Access Tab**: The authentication configuration section in Site Configuration

## Requirements

### Requirement 1: Provider-Specific Field Display

**User Story:** As a site administrator, I want to see only the SSO fields relevant to my selected provider, so that I'm not confused by irrelevant configuration options.

#### Acceptance Criteria

1. WHEN an OAuth-based provider is selected (Azure AD, Okta, Google, OAuth 2.0, OpenID Connect), THE Access Tab SHALL display only OAuth/OpenID configuration fields
2. WHEN a SAML-based provider is selected (Generic SAML 2.0), THE Access Tab SHALL display only SAML configuration fields
3. WHEN no provider is selected, THE Access Tab SHALL display the provider selection dropdown without configuration fields
4. WHEN the provider selection changes, THE Access Tab SHALL immediately update to show only the relevant fields for the new provider
5. THE Access Tab SHALL display attribute mapping fields for all provider types

### Requirement 2: Configured State Display

**User Story:** As a site administrator, I want to see a compact summary when SSO is already configured, so that I can quickly understand the current setup without seeing the full form.

#### Acceptance Criteria

1. WHEN SSO is configured and saved, THE Access Tab SHALL display a configured state card instead of the full configuration form
2. THE configured state card SHALL display the provider name
3. THE configured state card SHALL display the client ID or entity ID
4. THE configured state card SHALL display the redirect/callback URL
5. THE configured state card SHALL display whether auto-provisioning is enabled
6. THE configured state card SHALL display whether admin bypass is enabled

### Requirement 3: Edit and Disable Actions

**User Story:** As a site administrator, I want to edit or disable my SSO configuration from the configured state, so that I can make changes without navigating away.

#### Acceptance Criteria

1. WHEN viewing the configured state, THE Access Tab SHALL display an "Edit Configuration" button
2. WHEN the "Edit Configuration" button is clicked, THE Access Tab SHALL expand to show the full configuration form with current values
3. WHEN viewing the configured state, THE Access Tab SHALL display a "Disable SSO" button
4. WHEN the "Disable SSO" button is clicked, THE Access Tab SHALL prompt for confirmation
5. WHEN SSO disable is confirmed, THE Access Tab SHALL clear the SSO configuration and return to the provider selection state

### Requirement 4: Edit Mode Behavior

**User Story:** As a site administrator, I want to save or cancel my changes when editing SSO configuration, so that I have control over when changes are applied.

#### Acceptance Criteria

1. WHEN in edit mode, THE Access Tab SHALL display a "Save Changes" button
2. WHEN in edit mode, THE Access Tab SHALL display a "Cancel" button
3. WHEN "Save Changes" is clicked, THE Access Tab SHALL validate all required fields
4. WHEN validation passes, THE Access Tab SHALL save the configuration and return to configured state
5. WHEN "Cancel" is clicked, THE Access Tab SHALL discard changes and return to configured state without saving

### Requirement 5: Initial Configuration Flow

**User Story:** As a site administrator configuring SSO for the first time, I want a clear workflow to set up my provider, so that I can successfully configure authentication.

#### Acceptance Criteria

1. WHEN SSO is not configured, THE Access Tab SHALL display the provider selection dropdown
2. WHEN a provider is selected for the first time, THE Access Tab SHALL display the full configuration form for that provider
3. WHEN all required fields are filled, THE Access Tab SHALL enable the "Save Configuration" button
4. WHEN "Save Configuration" is clicked, THE Access Tab SHALL validate and save the configuration
5. WHEN configuration is saved successfully, THE Access Tab SHALL transition to the configured state

### Requirement 6: Field Validation

**User Story:** As a site administrator, I want clear validation feedback on SSO fields, so that I know what needs to be corrected before saving.

#### Acceptance Criteria

1. WHEN a required field is empty, THE Access Tab SHALL display a validation error message
2. WHEN a URL field contains an invalid URL format, THE Access Tab SHALL display a validation error message
3. WHEN validation errors exist, THE Access Tab SHALL disable the save button
4. WHEN all validation errors are resolved, THE Access Tab SHALL enable the save button
5. WHEN validation fails on save attempt, THE Access Tab SHALL display error messages next to the relevant fields

### Requirement 7: Preserve Existing Functionality

**User Story:** As a site administrator, I want all existing SSO features to continue working, so that the UI improvements don't break my authentication setup.

#### Acceptance Criteria

1. THE Access Tab SHALL maintain all OAuth/OpenID configuration fields (Client ID, Client Secret, Authorization URL, Token URL, User Info URL, Scope, Redirect URI)
2. THE Access Tab SHALL maintain all SAML configuration fields (IdP Entry Point, Issuer/Entity ID, X.509 Certificate, ACS URL)
3. THE Access Tab SHALL maintain attribute mapping fields (Email, First Name, Last Name, Employee ID)
4. THE Access Tab SHALL maintain additional settings (Auto-Provision Users, Require MFA, Session Timeout)
5. THE Access Tab SHALL maintain admin bypass configuration (Allow Bypass, Bypass URL, Require 2FA, Allowed IPs)
6. THE Access Tab SHALL maintain the "Test SSO Connection" functionality
7. THE Access Tab SHALL save all configuration changes through the existing auto-save mechanism

### Requirement 8: Visual Design Consistency

**User Story:** As a site administrator, I want the SSO UI improvements to match the existing design system, so that the interface feels cohesive.

#### Acceptance Criteria

1. THE configured state card SHALL use the same Card component styling as other configuration sections
2. THE edit and disable buttons SHALL use the existing Button component variants
3. THE provider-specific field sections SHALL maintain the existing color-coded backgrounds (blue for OAuth, purple for SAML)
4. THE configured state SHALL use appropriate icons from the existing icon set
5. THE transitions between states SHALL be smooth and not jarring

## Technical Requirements

### State Management

The component will need to track:
- `ssoConfigured`: boolean indicating if SSO is set up
- `ssoEditMode`: boolean indicating if user is editing configuration
- `selectedProvider`: string for the current provider type
- `providerCategory`: 'oauth' | 'saml' | null derived from selectedProvider

### Provider Categorization

```typescript
const OAUTH_PROVIDERS = ['azure', 'okta', 'google', 'oauth2', 'openid', 'custom'];
const SAML_PROVIDERS = ['saml'];

function getProviderCategory(provider: string): 'oauth' | 'saml' | null {
  if (OAUTH_PROVIDERS.includes(provider)) return 'oauth';
  if (SAML_PROVIDERS.includes(provider)) return 'saml';
  return null;
}
```

### UI States

1. **Unconfigured State**: No provider selected, show provider dropdown only
2. **Initial Configuration State**: Provider selected but not saved, show full form
3. **Configured State**: SSO saved, show summary card with Edit/Disable buttons
4. **Edit Mode State**: Editing existing configuration, show full form with Save/Cancel buttons

### Data Persistence

All SSO configuration data should be saved to the site settings through the existing auto-save mechanism when:
- Initial configuration is saved
- Edited configuration is saved
- SSO is disabled (clearing the configuration)

## Out of Scope

- Changes to SSO authentication backend logic
- New SSO provider integrations
- Changes to the SSO testing functionality
- Migration of existing SSO configurations
- Changes to the AccessManagement component
- Changes to employee management features

## Success Metrics

- Only relevant fields are displayed based on provider selection
- Configured SSO shows compact summary instead of full form
- Users can edit and disable SSO from the configured state
- All existing SSO functionality continues to work
- No breaking changes to existing SSO configurations
