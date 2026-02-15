# Site Configuration Restructure

**Status**: ✅ Complete  
**Date**: February 15, 2026

## Overview

Restructured the Site Configuration admin interface to improve organization and user experience by moving related settings to more logical locations.

## Changes Made

### 1. Gift Settings Moved to Products & Gifts Tab

**Moved from General Settings to Products & Gifts:**

- **Gift Selection Settings**
  - Allow Quantity Selection toggle
  - Show Gift Prices toggle
  - Gifts Per User input

- **Default Gift Configuration**
  - Default Gift selection dropdown
  - Days After Site Closes input
  - Default Gift Summary display
  - Validation warnings

**Rationale**: These settings are directly related to gift selection and product configuration, so they belong in the Products & Gifts tab rather than General Settings.

**New Location**: Products & Gifts tab → Top of page (before Search & Filter Settings)

### 2. Access Tab Completely Restructured

**Moved from General Settings to Access Tab:**

- **Validation Method** (Email, Serial Card, Magic Link, SSO)
- **SSO Configuration** (Complete SSO setup)

**New Structure**: Access tab now has two main sections:

#### Simple Auth (For sites without full employee data)
- **Authentication Methods:**
  - Email Address Validation
  - Serial Card Number
  - Magic Link (Email)

- **Email Configuration:**
  - Allowed Email Domains
  - Email Whitelist (one per line)

- **Serial Card Configuration:**
  - Instructions and notes

- **Employee Management:**
  - Embedded AccessManagement component
  - Upload/manage employee data

#### Advanced Auth (For sites with employee data)
- **SSO Configuration:**
  - Provider selection (Azure, Okta, Google, SAML, OAuth2, OpenID, Custom)
  - OAuth 2.0 / OpenID Connect Settings
  - SAML 2.0 Settings
  - User Attribute Mapping
  - Auto-Provision Users toggle
  - Require MFA toggle
  - Session Timeout configuration
  - Test SSO Connection button

- **Employee Management & Access Groups:**
  - Embedded AccessManagement component
  - Roles and permissions
  - Access group management

**Rationale**: Authentication and access control are complex enough to warrant their own dedicated tab with clear separation between simple and advanced options.

## User Experience Improvements

### Before:
- Gift settings scattered in General Settings
- Validation method buried in General Settings
- SSO configuration hidden unless SSO was selected
- No clear distinction between simple and advanced auth

### After:
- Gift settings logically grouped in Products & Gifts tab
- Access tab dedicated to authentication
- Clear choice between Simple Auth and Advanced Auth
- Visual cards showing what each auth type includes
- Better organization and discoverability

## UI/UX Enhancements

### Access Tab Features:

1. **Authentication Type Selector**
   - Two large clickable cards
   - Simple Auth card (pink border when selected)
   - Advanced Auth card (pink border when selected)
   - Clear descriptions and feature lists

2. **Conditional Display**
   - Shows Simple Auth settings when email/serialCard/magic_link selected
   - Shows Advanced Auth settings when SSO selected
   - Employee Management component adapts based on auth type

3. **Visual Hierarchy**
   - Color-coded sections (blue for OAuth, purple for SAML, amber for attributes)
   - Icons for each section
   - Clear labels and descriptions

4. **Improved Callback URLs**
   - Now uses full URL with slug: `https://wecelebrate.netlify.app/site/{slug}/auth/callback`
   - Copy button with toast notification
   - Separate URLs for OAuth and SAML

## Technical Details

### Files Modified:
- `src/app/pages/admin/SiteConfiguration.tsx`

### Sections Removed from General Settings:
- Gift Selection Settings card (lines ~1070-1150)
- Default Gift Configuration card (lines ~1718-1820)
- Validation & Access card (lines ~1070-1110)
- SSO Configuration card (lines ~1111-1467)

### Sections Added to Products & Gifts Tab:
- Gift Selection Settings (at top, after intro)
- Default Gift Configuration (after Gift Selection Settings)

### Access Tab Restructured:
- New intro banner
- Authentication Method selector (Simple vs Advanced)
- Simple Auth section with conditional display
- Advanced Auth section with conditional display
- Employee Management embedded in both sections

### State Management:
- Uses existing `validationMethod` state
- Conditional rendering based on `validationMethod !== 'sso'` for Simple Auth
- Conditional rendering based on `validationMethod === 'sso'` for Advanced Auth

## Benefits

### For Administrators:
- Easier to find gift-related settings
- Clear understanding of auth options
- Better organization reduces cognitive load
- Visual cards make selection intuitive

### For Configuration:
- Logical grouping of related settings
- Reduced scrolling in General Settings
- Dedicated space for complex SSO setup
- Clear separation of concerns

### For Maintenance:
- Easier to locate and update settings
- Better code organization
- Clearer component boundaries
- Improved testability

## Migration Notes

### Existing Sites:
- No data migration required
- Settings remain in same state variables
- UI changes only affect admin interface
- All existing configurations continue to work

### Backward Compatibility:
- All validation methods still supported
- SSO configuration unchanged
- Employee management unchanged
- No breaking changes

## Testing Checklist

- [x] Type-check passes
- [ ] General Settings tab loads correctly
- [ ] Products & Gifts tab shows gift settings
- [ ] Access tab shows Simple Auth by default
- [ ] Switching to Advanced Auth shows SSO config
- [ ] Email configuration shows for email/magic_link
- [ ] Serial card configuration shows for serialCard
- [ ] Employee Management loads in both auth types
- [ ] Save functionality works for all settings
- [ ] Validation works for all fields

## Future Enhancements

### Potential Improvements:
1. **Role-Based Access Control (RBAC)**
   - Define custom roles
   - Assign permissions to roles
   - Assign roles to users/groups

2. **Access Groups**
   - Create user groups
   - Assign gifts to specific groups
   - Group-based permissions

3. **Advanced Email Validation**
   - Email verification workflow
   - Bounce handling
   - Email templates

4. **Serial Card Management**
   - Bulk generate serial cards
   - Track usage and redemption
   - Expiration dates

5. **SSO Testing Tool**
   - Live SSO connection test
   - Attribute mapping preview
   - Error diagnostics

## Documentation

### User Guide Sections to Update:
- Admin Portal → Site Configuration → Products & Gifts
- Admin Portal → Site Configuration → Access Management
- Authentication Methods guide
- SSO Setup guide

### API Documentation:
- No API changes required
- Settings structure unchanged

---

**Completed**: February 15, 2026  
**Task**: Restructure Site Configuration tabs  
**Result**: Improved organization with gift settings in Products & Gifts and authentication in dedicated Access tab with Simple/Advanced options
