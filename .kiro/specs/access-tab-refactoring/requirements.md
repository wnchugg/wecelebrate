# Access Tab Refactoring - Requirements

## Overview
The Access tab in Site Configuration needs to be refactored to properly separate Simple Authentication (for sites without employee data) from Advanced Authentication (for sites with employee data), eliminate duplicate sections, and move SFTP configuration to the appropriate location.

## Problem Statement
The current Access tab has several issues:
1. **Duplicate functionality**: Both the SiteConfiguration Access tab and the AccessManagement component have overlapping validation method selectors
2. **Incorrect SFTP placement**: SFTP automation is shown in site-level settings but should be in client-level settings
3. **Confusing structure**: The distinction between Simple Auth and Advanced Auth is not clear
4. **Backend integration issues**: One section works with the backend, the other doesn't

## User Stories

### 1. As an admin, I want a clear distinction between Simple and Advanced authentication
**Acceptance Criteria:**
- 1.1 The Access tab shows two clear authentication types: Simple Auth and Advanced Auth
- 1.2 Simple Auth is for sites without full employee data (email validation, serial cards, magic links)
- 1.3 Advanced Auth is for sites with employee data (SSO, user/password, roles & access groups)
- 1.4 Only one authentication type can be active at a time
- 1.5 Switching between types is intuitive and clear

### 2. As an admin, I want to configure Simple Authentication methods
**Acceptance Criteria:**
- 2.1 When Simple Auth is selected, I can choose from: Email Validation, Serial Card, or Magic Link
- 2.2 For Email Validation, I can configure allowed domains and email whitelists
- 2.3 For Serial Card, I can upload/manage serial card numbers
- 2.4 For Magic Link, I can configure email settings
- 2.5 All Simple Auth settings are saved to the backend correctly

### 3. As an admin, I want to configure Advanced Authentication (SSO)
**Acceptance Criteria:**
- 3.1 When Advanced Auth is selected, I can configure SSO settings
- 3.2 I can choose from multiple SSO providers (Azure AD, Okta, Google, SAML, OAuth, OpenID)
- 3.3 I can configure OAuth/OpenID settings (Client ID, Secret, URLs, Scopes)
- 3.4 I can configure SAML settings (IdP Entry Point, Entity ID, Certificate, ACS URL)
- 3.5 I can configure attribute mapping for user fields
- 3.6 I can test the SSO connection
- 3.7 All SSO settings are saved to the backend correctly

### 4. As an admin, I want to manage employee access lists
**Acceptance Criteria:**
- 4.1 For Simple Auth, I can upload employee lists (email, employee ID, or serial card)
- 4.2 For Advanced Auth, I can manage employees with roles and access groups
- 4.3 I can import employees via CSV upload
- 4.4 I can add/edit/delete individual employees
- 4.5 I can search and filter the employee list
- 4.6 Employee data is stored at the site level

### 5. As an admin, I want SFTP automation configured at the client level
**Acceptance Criteria:**
- 5.1 SFTP configuration is NOT shown in the Site Configuration Access tab
- 5.2 SFTP configuration is available in Client Configuration settings
- 5.3 SFTP automation can import employee data for multiple sites
- 5.4 SFTP settings are stored at the client level, not site level

### 6. As an admin, I want no duplicate validation method selectors
**Acceptance Criteria:**
- 6.1 There is only ONE place to select the validation method in the Access tab
- 6.2 The validation method selector in SiteConfiguration controls the overall authentication type
- 6.3 The AccessManagement component does NOT have its own validation method selector
- 6.4 The AccessManagement component adapts to the validation method set in SiteConfiguration

### 7. As an admin, I want to manage user accounts for Advanced Authentication
**Acceptance Criteria:**
- 7.1 I can view a list of all users with Advanced Authentication
- 7.2 I can edit user details (name, email, employee ID, role)
- 7.3 I can set a temporary password for a user
- 7.4 I can force a user to reset their password on next login
- 7.5 I can activate/deactivate user accounts
- 7.6 I can assign roles and permissions to users
- 7.7 All user management actions are logged for audit purposes

### 8. As an admin, I want site managers to access SSO-enabled sites without SSO
**Acceptance Criteria:**
- 8.1 When SSO is configured, there is an option to "Allow Admin Bypass"
- 8.2 When Admin Bypass is enabled, a special login URL is available for site managers
- 8.3 Site managers can login with username/password even when SSO is required
- 8.4 The bypass login page is separate from the main SSO login flow
- 8.5 Bypass login requires additional security (e.g., 2FA, IP whitelist)
- 8.6 Bypass login activity is logged for security auditing
- 8.7 The bypass URL is only accessible to users with site manager role

### 9. As a site admin, I want to proxy login as an employee
**Acceptance Criteria:**
- 9.1 In the employee list, there is a "Login As" action for each employee
- 9.2 Clicking "Login As" opens the employee's site view in a new tab/window
- 9.3 The proxy session is clearly marked (banner showing "Viewing as [Employee Name]")
- 9.4 The proxy session has read-only access (cannot make purchases/changes)
- 9.5 The proxy session can be ended at any time
- 9.6 All proxy login actions are logged with admin user ID and employee ID
- 9.7 Proxy login requires specific permission (not all admins can do this)
- 9.8 Proxy login sessions have a time limit (e.g., 30 minutes)

## Technical Requirements

### Data Model
- `validationMethod` field on Site: `'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso'`
- Simple Auth methods: `email`, `employeeId`, `serialCard`, `magic_link`
- Advanced Auth method: `sso`
- SSO configuration stored in site settings
- Employee data stored at site level
- SFTP configuration stored at client level

**Advanced Authentication User Model:**
```typescript
interface AdvancedAuthUser {
  id: string;
  siteId: string;
  email: string;
  employeeId?: string;
  name: string;
  role: 'employee' | 'manager' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  authMethod: 'sso' | 'password' | 'both';
  temporaryPassword?: string;
  forcePasswordReset: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**SSO Configuration with Admin Bypass:**
```typescript
interface SSOConfig {
  enabled: boolean;
  provider: string;
  // ... existing SSO fields
  allowAdminBypass: boolean;
  bypassUrl?: string;
  bypassRequires2FA: boolean;
  bypassAllowedIPs?: string[];
}
```

**Proxy Login Session:**
```typescript
interface ProxyLoginSession {
  id: string;
  adminUserId: string;
  employeeUserId: string;
  siteId: string;
  startTime: Date;
  expiresAt: Date;
  isActive: boolean;
  readOnly: true;
}
```

### Component Structure
```
SiteConfiguration (Access Tab)
├── Authentication Type Selector (Simple vs Advanced)
├── Simple Auth Configuration (if validationMethod !== 'sso')
│   ├── Validation Method Dropdown (email, serialCard, magic_link)
│   ├── Method-Specific Settings
│   └── AccessManagement Component (employee list management)
└── Advanced Auth Configuration (if validationMethod === 'sso')
    ├── SSO Configuration Card
    └── AccessManagement Component (employee & access group management)
```

### Backend Integration
- All validation method changes must be saved via `saveSiteDraft` or `updateSite`
- Employee data managed via `employeeApi` service
- SSO configuration saved in site settings
- SFTP configuration managed separately at client level

## Out of Scope
- Creating new SSO providers
- Implementing actual SSO authentication flow (backend)
- Building SFTP automation functionality
- Migrating existing employee data
- Implementing the actual proxy login backend authentication flow
- Building the 2FA system for admin bypass (can use existing 2FA if available)

## Success Metrics
- Single source of truth for validation method selection
- Clear separation between Simple and Advanced auth
- No duplicate UI elements
- All settings properly saved to backend
- SFTP configuration moved to client settings
