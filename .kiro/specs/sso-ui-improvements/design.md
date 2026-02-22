# SSO Configuration UI Improvements - Design

## Overview

This design refactors the SSO configuration UI to provide a cleaner, more intuitive experience by:
1. Showing only provider-relevant fields (OAuth vs SAML)
2. Displaying a compact "configured" state when SSO is already set up
3. Providing clear Edit/Disable actions from the configured state
4. Maintaining all existing SSO functionality

The design introduces a state machine approach with four distinct UI states: Unconfigured, Initial Configuration, Configured, and Edit Mode.

## Architecture

### UI State Machine

The SSO configuration UI operates as a state machine with the following states and transitions:

```
┌─────────────────┐
│  Unconfigured   │ (No provider selected)
│  State          │
└────────┬────────┘
         │ Select Provider
         ▼
┌─────────────────┐
│  Initial Config │ (Provider selected, not saved)
│  State          │
└────────┬────────┘
         │ Save Configuration
         ▼
┌─────────────────┐
│  Configured     │ (SSO saved, summary view)
│  State          │◄─────────┐
└────┬────┬───────┘          │
     │    │                  │
     │    │ Disable SSO      │
     │    └──────────────────┘
     │                       
     │ Edit Configuration    
     ▼                       
┌─────────────────┐          
│  Edit Mode      │ (Editing existing config)
│  State          │          
└────────┬────────┘          
         │ Save/Cancel       
         └───────────────────►
```

### State Determination Logic

```typescript
function determineUIState(
  ssoProvider: string | null,
  ssoConfigured: boolean,
  ssoEditMode: boolean
): 'unconfigured' | 'initial' | 'configured' | 'edit' {
  if (!ssoProvider) return 'unconfigured';
  if (ssoConfigured && !ssoEditMode) return 'configured';
  if (ssoConfigured && ssoEditMode) return 'edit';
  return 'initial';
}
```

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

## Components and Interfaces

### Main Component Structure

The SSO configuration section will be refactored into smaller, focused components:

```tsx
<Card className="border-2 border-[#D91C81]">
  <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
    <CardTitle className="flex items-center gap-2">
      <Shield className="w-5 h-5 text-[#D91C81]" />
      SSO Configuration
    </CardTitle>
    <CardDescription>Configure Single Sign-On authentication settings</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6 pt-6">
    {uiState === 'unconfigured' && <ProviderSelection />}
    {uiState === 'initial' && <InitialConfigurationForm />}
    {uiState === 'configured' && <ConfiguredStateSummary />}
    {uiState === 'edit' && <EditModeForm />}
  </CardContent>
</Card>
```

### 1. ProviderSelection Component

Displays only the provider dropdown when no provider is selected.

```tsx
function ProviderSelection() {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        SSO Provider *
      </label>
      <select
        value={ssoProvider}
        onChange={handleProviderChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
      >
        <option value="">Select a provider...</option>
        <option value="azure">Microsoft Azure AD / Entra ID</option>
        <option value="okta">Okta</option>
        <option value="google">Google Workspace</option>
        <option value="saml">Generic SAML 2.0</option>
        <option value="oauth2">Generic OAuth 2.0</option>
        <option value="openid">OpenID Connect</option>
        <option value="custom">Custom Provider</option>
      </select>
      <p className="text-xs text-gray-500 mt-1">
        Select your organization's identity provider
      </p>
    </div>
  );
}
```

### 2. ConfiguredStateSummary Component

Displays a compact summary of the current SSO configuration with Edit/Disable actions.

```tsx
function ConfiguredStateSummary() {
  const providerName = getProviderDisplayName(ssoProvider);
  const providerCategory = getProviderCategory(ssoProvider);
  
  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-green-900">SSO is Active</p>
          <p className="text-sm text-green-700">
            Users will authenticate through {providerName}
          </p>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Provider</p>
          <p className="text-sm font-medium text-gray-900">{providerName}</p>
        </div>
        
        {providerCategory === 'oauth' && (
          <>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Client ID</p>
              <p className="text-sm font-medium text-gray-900 font-mono truncate">
                {ssoClientId || 'Not set'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Redirect URI</p>
              <p className="text-sm font-medium text-gray-900 font-mono truncate">
                {ssoRedirectUri}
              </p>
            </div>
          </>
        )}
        
        {providerCategory === 'saml' && (
          <>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Entity ID</p>
              <p className="text-sm font-medium text-gray-900 font-mono truncate">
                {ssoEntityId || 'Not set'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">ACS URL</p>
              <p className="text-sm font-medium text-gray-900 font-mono truncate">
                {ssoAcsUrl}
              </p>
            </div>
          </>
        )}
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Auto-Provision</p>
          <p className="text-sm font-medium text-gray-900">
            {ssoAutoProvision ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Admin Bypass</p>
          <p className="text-sm font-medium text-gray-900">
            {allowAdminBypass ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="default"
          onClick={handleEditConfiguration}
          className="flex-1"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Configuration
        </Button>
        <Button
          variant="destructive"
          onClick={handleDisableSSO}
          className="flex-1"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Disable SSO
        </Button>
      </div>
    </div>
  );
}
```

### 3. InitialConfigurationForm Component

Displays the full configuration form for first-time setup.

```tsx
function InitialConfigurationForm() {
  const providerCategory = getProviderCategory(ssoProvider);
  
  return (
    <div className="space-y-6">
      {/* Provider Selection (read-only in this state) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          SSO Provider *
        </label>
        <select
          value={ssoProvider}
          onChange={handleProviderChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
        >
          <option value="">Select a provider...</option>
          {/* ... provider options ... */}
        </select>
      </div>

      {/* Provider-Specific Fields */}
      {providerCategory === 'oauth' && <OAuthFields />}
      {providerCategory === 'saml' && <SAMLFields />}
      
      {/* Common Fields */}
      <AttributeMappingFields />
      <AdditionalSettingsFields />
      <AdminBypassFields />
      
      {/* Test Connection */}
      <TestConnectionButton />
      
      {/* Save Button */}
      <div className="pt-4 border-t">
        <Button
          onClick={handleSaveConfiguration}
          disabled={!isFormValid}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
```

### 4. EditModeForm Component

Displays the full configuration form with current values and Save/Cancel actions.

```tsx
function EditModeForm() {
  const providerCategory = getProviderCategory(ssoProvider);
  
  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-900">
          You are editing your SSO configuration. Changes will not take effect until you save.
        </p>
      </div>

      {/* Provider Selection (read-only in edit mode) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          SSO Provider *
        </label>
        <Input
          value={getProviderDisplayName(ssoProvider)}
          readOnly
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          To change providers, disable SSO and configure a new provider
        </p>
      </div>

      {/* Provider-Specific Fields */}
      {providerCategory === 'oauth' && <OAuthFields />}
      {providerCategory === 'saml' && <SAMLFields />}
      
      {/* Common Fields */}
      <AttributeMappingFields />
      <AdditionalSettingsFields />
      <AdminBypassFields />
      
      {/* Test Connection */}
      <TestConnectionButton />
      
      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleCancelEdit}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveChanges}
          disabled={!isFormValid}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
```

### 5. OAuthFields Component

Displays OAuth/OpenID-specific configuration fields.

```tsx
function OAuthFields() {
  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M12 15V17M12 7V13M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        OAuth 2.0 / OpenID Connect Settings
      </h4>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Client ID *
        </label>
        <Input
          type="text"
          value={ssoClientId}
          onChange={(e) => setSsoClientId(e.target.value)}
          placeholder="e.g., abc123xyz789"
        />
        {validationErrors.clientId && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.clientId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Client Secret *
        </label>
        <Input
          type="password"
          value={ssoClientSecret}
          onChange={(e) => setSsoClientSecret(e.target.value)}
          placeholder="Enter client secret"
        />
        <p className="text-xs text-gray-500 mt-1">
          Keep this secret secure. Never share it publicly.
        </p>
        {validationErrors.clientSecret && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.clientSecret}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Authorization URL *
        </label>
        <Input
          type="url"
          value={ssoAuthUrl}
          onChange={(e) => setSsoAuthUrl(e.target.value)}
          placeholder="https://login.provider.com/oauth/authorize"
        />
        {validationErrors.authUrl && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.authUrl}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Token URL *
        </label>
        <Input
          type="url"
          value={ssoTokenUrl}
          onChange={(e) => setSsoTokenUrl(e.target.value)}
          placeholder="https://login.provider.com/oauth/token"
        />
        {validationErrors.tokenUrl && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.tokenUrl}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          User Info URL
        </label>
        <Input
          type="url"
          value={ssoUserInfoUrl}
          onChange={(e) => setSsoUserInfoUrl(e.target.value)}
          placeholder="https://login.provider.com/oauth/userinfo"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Scope
        </label>
        <Input
          type="text"
          value={ssoScope}
          onChange={(e) => setSsoScope(e.target.value)}
          placeholder="openid profile email"
        />
        <p className="text-xs text-gray-500 mt-1">
          Space-separated list of OAuth scopes
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Redirect URI (Callback URL) *
        </label>
        <div className="flex gap-2">
          <Input
            type="url"
            value={ssoRedirectUri}
            readOnly
            className="bg-gray-50"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyRedirectUri}
          >
            Copy
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Add this URL to your provider's allowed redirect URIs
        </p>
      </div>
    </div>
  );
}
```

### 6. SAMLFields Component

Displays SAML-specific configuration fields.

```tsx
function SAMLFields() {
  return (
    <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        SAML 2.0 Settings
      </h4>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          IdP Entry Point (SSO URL) *
        </label>
        <Input
          type="url"
          value={ssoIdpEntryPoint}
          onChange={(e) => setSsoIdpEntryPoint(e.target.value)}
          placeholder="https://sso.provider.com/saml/sso"
        />
        {validationErrors.idpEntryPoint && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.idpEntryPoint}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Issuer / Entity ID *
        </label>
        <Input
          type="text"
          value={ssoEntityId}
          onChange={(e) => setSsoEntityId(e.target.value)}
          placeholder="urn:your-app:entity-id"
        />
        {validationErrors.entityId && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.entityId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          X.509 Certificate *
        </label>
        <textarea
          rows={4}
          value={ssoCertificate}
          onChange={(e) => setSsoCertificate(e.target.value)}
          placeholder="Paste your X.509 certificate here..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono text-xs"
        />
        <p className="text-xs text-gray-500 mt-1">
          Public certificate from your identity provider
        </p>
        {validationErrors.certificate && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.certificate}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Assertion Consumer Service URL *
        </label>
        <div className="flex gap-2">
          <Input
            type="url"
            value={ssoAcsUrl}
            readOnly
            className="bg-gray-50"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyAcsUrl}
          >
            Copy
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Configure this URL in your IdP as the ACS URL
        </p>
      </div>
    </div>
  );
}
```

## Data Models

### SSO Configuration State

```typescript
interface SSOConfigState {
  // Provider info
  ssoProvider: string | null;
  ssoConfigured: boolean;
  ssoEditMode: boolean;
  
  // OAuth/OpenID fields
  ssoClientId: string;
  ssoClientSecret: string;
  ssoAuthUrl: string;
  ssoTokenUrl: string;
  ssoUserInfoUrl: string;
  ssoScope: string;
  ssoRedirectUri: string;
  
  // SAML fields
  ssoIdpEntryPoint: string;
  ssoEntityId: string;
  ssoCertificate: string;
  ssoAcsUrl: string;
  
  // Attribute mapping
  ssoEmailAttribute: string;
  ssoFirstNameAttribute: string;
  ssoLastNameAttribute: string;
  ssoEmployeeIdAttribute: string;
  
  // Additional settings
  ssoAutoProvision: boolean;
  ssoRequireMFA: boolean;
  ssoSessionTimeout: number;
  
  // Admin bypass
  allowAdminBypass: boolean;
  bypassRequires2FA: boolean;
  bypassAllowedIPs: string;
}
```

### Validation Errors

```typescript
interface ValidationErrors {
  // OAuth errors
  clientId?: string;
  clientSecret?: string;
  authUrl?: string;
  tokenUrl?: string;
  
  // SAML errors
  idpEntryPoint?: string;
  entityId?: string;
  certificate?: string;
}
```

### UI State Derivation

```typescript
type UIState = 'unconfigured' | 'initial' | 'configured' | 'edit';

function getUIState(config: SSOConfigState): UIState {
  if (!config.ssoProvider) return 'unconfigured';
  if (config.ssoConfigured && !config.ssoEditMode) return 'configured';
  if (config.ssoConfigured && config.ssoEditMode) return 'edit';
  return 'initial';
}
```


## Error Handling

### Validation

Field validation occurs at multiple points:

1. **Real-time validation**: As users type, validate format (URLs, required fields)
2. **Save-time validation**: Before saving, validate all required fields are filled
3. **Backend validation**: Server-side validation of SSO configuration

```typescript
function validateOAuthFields(config: SSOConfigState): ValidationErrors {
  const errors: ValidationErrors = {};
  
  if (!config.ssoClientId?.trim()) {
    errors.clientId = 'Client ID is required';
  }
  
  if (!config.ssoClientSecret?.trim()) {
    errors.clientSecret = 'Client Secret is required';
  }
  
  if (!config.ssoAuthUrl?.trim()) {
    errors.authUrl = 'Authorization URL is required';
  } else if (!isValidUrl(config.ssoAuthUrl)) {
    errors.authUrl = 'Please enter a valid URL';
  }
  
  if (!config.ssoTokenUrl?.trim()) {
    errors.tokenUrl = 'Token URL is required';
  } else if (!isValidUrl(config.ssoTokenUrl)) {
    errors.tokenUrl = 'Please enter a valid URL';
  }
  
  return errors;
}

function validateSAMLFields(config: SSOConfigState): ValidationErrors {
  const errors: ValidationErrors = {};
  
  if (!config.ssoIdpEntryPoint?.trim()) {
    errors.idpEntryPoint = 'IdP Entry Point is required';
  } else if (!isValidUrl(config.ssoIdpEntryPoint)) {
    errors.idpEntryPoint = 'Please enter a valid URL';
  }
  
  if (!config.ssoEntityId?.trim()) {
    errors.entityId = 'Entity ID is required';
  }
  
  if (!config.ssoCertificate?.trim()) {
    errors.certificate = 'X.509 Certificate is required';
  }
  
  return errors;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

### State Transition Errors

Handle errors during state transitions:

```typescript
async function handleSaveConfiguration() {
  try {
    // Validate fields
    const providerCategory = getProviderCategory(ssoProvider);
    const errors = providerCategory === 'oauth' 
      ? validateOAuthFields(config)
      : validateSAMLFields(config);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix validation errors before saving');
      return;
    }
    
    // Save configuration
    setSsoConfigured(true);
    setSsoEditMode(false);
    setHasChanges(true); // Trigger auto-save
    
    toast.success('SSO configuration saved successfully');
  } catch (error) {
    console.error('Failed to save SSO configuration:', error);
    toast.error('Failed to save SSO configuration. Please try again.');
  }
}
```

### Disable SSO Confirmation

```typescript
function handleDisableSSO() {
  // Show confirmation dialog
  if (confirm('Are you sure you want to disable SSO? Users will no longer be able to authenticate through your identity provider.')) {
    try {
      // Clear SSO configuration
      setSsoProvider(null);
      setSsoConfigured(false);
      setSsoEditMode(false);
      
      // Clear all SSO fields
      clearSSOFields();
      
      setHasChanges(true); // Trigger auto-save
      
      toast.success('SSO has been disabled');
    } catch (error) {
      console.error('Failed to disable SSO:', error);
      toast.error('Failed to disable SSO. Please try again.');
    }
  }
}
```

### Cancel Edit Handling

```typescript
function handleCancelEdit() {
  // Restore original values from saved configuration
  restoreOriginalValues();
  
  // Exit edit mode
  setSsoEditMode(false);
  
  toast.info('Changes discarded');
}
```

## Testing Strategy

### Unit Tests

Unit tests will focus on specific behaviors and edge cases:

1. **Provider categorization**
   - Test `getProviderCategory()` returns 'oauth' for OAuth providers
   - Test `getProviderCategory()` returns 'saml' for SAML providers
   - Test `getProviderCategory()` returns null for empty/invalid providers

2. **UI state determination**
   - Test `getUIState()` returns 'unconfigured' when no provider selected
   - Test `getUIState()` returns 'initial' when provider selected but not configured
   - Test `getUIState()` returns 'configured' when SSO is configured and not in edit mode
   - Test `getUIState()` returns 'edit' when SSO is configured and in edit mode

3. **Validation functions**
   - Test `validateOAuthFields()` catches missing required fields
   - Test `validateOAuthFields()` catches invalid URL formats
   - Test `validateSAMLFields()` catches missing required fields
   - Test `validateSAMLFields()` catches invalid URL formats
   - Test `isValidUrl()` correctly identifies valid and invalid URLs

4. **Component rendering**
   - Test ProviderSelection renders when state is 'unconfigured'
   - Test InitialConfigurationForm renders when state is 'initial'
   - Test ConfiguredStateSummary renders when state is 'configured'
   - Test EditModeForm renders when state is 'edit'
   - Test OAuthFields renders only for OAuth providers
   - Test SAMLFields renders only for SAML providers

5. **State transitions**
   - Test selecting a provider transitions from 'unconfigured' to 'initial'
   - Test saving configuration transitions from 'initial' to 'configured'
   - Test clicking Edit transitions from 'configured' to 'edit'
   - Test clicking Save in edit mode transitions from 'edit' to 'configured'
   - Test clicking Cancel in edit mode transitions from 'edit' to 'configured'
   - Test disabling SSO transitions from 'configured' to 'unconfigured'

6. **Data persistence**
   - Test saving configuration triggers auto-save mechanism
   - Test disabling SSO clears all SSO fields
   - Test canceling edit restores original values

### Integration Tests

Integration tests will verify the complete user flows:

1. **First-time SSO setup flow**
   - Start with no SSO configured
   - Select OAuth provider
   - Fill in OAuth fields
   - Save configuration
   - Verify configured state displays correct summary

2. **Edit existing SSO flow**
   - Start with configured SSO
   - Click Edit Configuration
   - Modify fields
   - Save changes
   - Verify configured state reflects changes

3. **Cancel edit flow**
   - Start with configured SSO
   - Click Edit Configuration
   - Modify fields
   - Click Cancel
   - Verify configured state shows original values

4. **Disable SSO flow**
   - Start with configured SSO
   - Click Disable SSO
   - Confirm disable
   - Verify returns to unconfigured state

5. **Provider switching flow**
   - Start with no SSO configured
   - Select OAuth provider
   - Verify OAuth fields display
   - Change to SAML provider
   - Verify SAML fields display

6. **Validation error flow**
   - Start configuring SSO
   - Leave required fields empty
   - Attempt to save
   - Verify validation errors display
   - Fill in required fields
   - Verify save succeeds

### Manual Testing Checklist

- [ ] Verify only OAuth fields show for OAuth providers
- [ ] Verify only SAML fields show for SAML providers
- [ ] Verify configured state shows correct summary for OAuth
- [ ] Verify configured state shows correct summary for SAML
- [ ] Verify Edit button opens full form with current values
- [ ] Verify Cancel button discards changes
- [ ] Verify Save button persists changes
- [ ] Verify Disable SSO clears configuration
- [ ] Verify validation errors prevent saving
- [ ] Verify all existing SSO functionality still works
- [ ] Verify auto-save mechanism triggers correctly
- [ ] Verify Test SSO Connection button works in all states
- [ ] Verify admin bypass settings persist correctly
- [ ] Verify attribute mapping settings persist correctly


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be consolidated:

- Properties 2.2-2.6 (configured state display requirements) can be combined into a single comprehensive property about configured state rendering
- Properties 4.1-4.2 (edit mode button display) can be combined into a single property about edit mode UI elements
- Properties 6.3-6.4 (save button state based on validation) are inverses and can be combined
- Properties 7.1-7.6 (field maintenance) are all regression tests that can be verified through examples rather than properties

### Provider-Specific Field Display Properties

Property 1: OAuth provider field exclusivity
*For any* OAuth-based provider selection (Azure AD, Okta, Google, OAuth 2.0, OpenID Connect, Custom), the rendered UI should display OAuth/OpenID configuration fields and should not display SAML configuration fields.
**Validates: Requirements 1.1**

Property 2: Provider change field consistency
*For any* sequence of provider selections, the displayed configuration fields should always match the category of the currently selected provider (OAuth fields for OAuth providers, SAML fields for SAML providers).
**Validates: Requirements 1.4**

Property 3: Attribute mapping field invariant
*For any* provider type selection (OAuth or SAML), the attribute mapping fields (Email, First Name, Last Name, Employee ID) should always be displayed.
**Validates: Requirements 1.5**

### Configured State Properties

Property 4: Configured state display completeness
*For any* configured SSO setup, the configured state card should display all of: provider name, client ID (OAuth) or entity ID (SAML), redirect/callback URL, auto-provisioning status, and admin bypass status.
**Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**

Property 5: Configured state transition
*For any* valid SSO configuration that is saved, the UI state should transition from 'initial' or 'edit' to 'configured', and the configured state card should be displayed instead of the full configuration form.
**Validates: Requirements 2.1**

### Edit and Disable Action Properties

Property 6: Configured state action buttons
*For any* SSO in configured state, both "Edit Configuration" and "Disable SSO" buttons should be rendered and visible.
**Validates: Requirements 3.1, 3.3**

Property 7: Edit mode data preservation
*For any* configured SSO, when transitioning to edit mode, all current configuration values should be present and editable in the form fields.
**Validates: Requirements 3.2**

Property 8: Disable SSO state reset
*For any* configured SSO, when disable is confirmed, the UI state should transition to 'unconfigured', all SSO configuration fields should be cleared, and the provider selection dropdown should be displayed.
**Validates: Requirements 3.5**

### Edit Mode Properties

Property 9: Edit mode action buttons
*For any* SSO in edit mode, both "Save Changes" and "Cancel" buttons should be rendered and visible.
**Validates: Requirements 4.1, 4.2**

Property 10: Save triggers validation
*For any* save attempt (initial configuration or edit mode), validation should execute before persisting data, and if validation fails, the data should not be saved.
**Validates: Requirements 4.3, 5.4**

Property 11: Successful save state transition
*For any* SSO configuration where validation passes, saving should transition the UI state to 'configured' and display the configured state card.
**Validates: Requirements 4.4, 5.5**

Property 12: Cancel preserves original values
*For any* SSO in edit mode, clicking Cancel should discard all changes, restore the original configuration values, and transition back to configured state. This is a round-trip property: configured → edit → cancel → configured should preserve all values.
**Validates: Requirements 4.5**

### Initial Configuration Properties

Property 13: Initial configuration form display
*For any* provider selection from unconfigured state, the UI should transition to 'initial' state and display the full configuration form appropriate for that provider's category.
**Validates: Requirements 5.2**

Property 14: Save button state based on validation
*For any* SSO configuration form (initial or edit), the save button should be enabled if and only if all required fields are filled and all validation rules pass.
**Validates: Requirements 5.3, 6.3, 6.4**

### Validation Properties

Property 15: Required field validation
*For any* required field that is empty or contains only whitespace, a validation error message should be displayed for that field.
**Validates: Requirements 6.1**

Property 16: URL field validation
*For any* URL field (Authorization URL, Token URL, User Info URL, IdP Entry Point, etc.) that contains a value that is not a valid URL format, a validation error message should be displayed for that field.
**Validates: Requirements 6.2**

Property 17: Validation error display location
*For any* field with a validation error, the error message should be displayed adjacent to or near that specific field in the UI.
**Validates: Requirements 6.5**

### Data Persistence Properties

Property 18: Auto-save trigger on state changes
*For any* SSO configuration change (save, disable, or edit completion), the auto-save mechanism should be triggered by setting the hasChanges flag to true.
**Validates: Requirements 7.7**

