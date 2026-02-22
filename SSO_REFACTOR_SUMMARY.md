# SSO Configuration Refactor Summary

## Current State
The SSO configuration card shows all fields at once, which is overwhelming and shows irrelevant fields for different provider types.

## Desired State

### 1. Condensed View (when SSO is configured)
Show a summary card with:
- Provider name and icon
- Status badge (Configured/Active)
- Key configuration details (masked)
- Edit and Remove buttons

### 2. Configuration View (when adding/editing)
Show only relevant fields based on selected provider:

**Azure AD / Okta / Google:**
- Client ID
- Client Secret  
- Tenant ID (Azure only)
- Domain (Okta/Google)
- Redirect URI (auto-generated, read-only)

**Generic OAuth 2.0 / OpenID Connect:**
- Client ID
- Client Secret
- Authorization URL
- Token URL
- User Info URL
- Scope
- Redirect URI

**Generic SAML 2.0:**
- IdP Entry Point (SSO URL)
- Issuer / Entity ID
- X.509 Certificate
- Assertion Consumer Service URL (auto-generated, read-only)

### 3. Common Sections (all providers)
- Attribute Mapping
- Additional Settings (Auto-provision, MFA, Session timeout)
- Admin Bypass Configuration
- Test Connection button

## Implementation Plan

1. Add state variables:
   - `ssoConfigured` - boolean
   - `ssoEditMode` - boolean
   - Provider-specific fields

2. Create condensed view component
3. Create provider-specific configuration forms
4. Add Edit/Remove handlers
5. Update save logic to set `ssoConfigured = true`

## Files to Modify
- `src/app/pages/admin/SiteConfiguration.tsx` - Main refactor
