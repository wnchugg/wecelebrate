# Access Tab Refactoring - Tasks

## Task List

- [x] 1. Refactor AccessManagement Component
  - [x] 1.1 Add props interface (mode, validationMethod)
  - [x] 1.2 Remove internal validation method selector UI
  - [x] 1.3 Remove SFTP automation card
  - [x] 1.4 Update component to use props instead of internal state
  - [x] 1.5 Test AccessManagement with different prop combinations

- [x] 2. Update SiteConfiguration Access Tab
  - [x] 2.1 Ensure authentication type selector is working correctly
  - [x] 2.2 Pass mode and validationMethod props to AccessManagement
  - [x] 2.3 Remove duplicate validation method configuration
  - [x] 2.4 Test authentication type switching (Simple ↔ Advanced)
  - [x] 2.5 Verify auto-save works for all authentication settings

- [x] 3. Simplify Simple Auth Configuration
  - [x] 3.1 Keep validation method dropdown in SiteConfiguration
  - [x] 3.2 Keep method-specific settings (email domains, whitelists)
  - [x] 3.3 Ensure settings are properly bound to state
  - [x] 3.4 Test email validation configuration
  - [x] 3.5 Test serial card configuration
  - [x] 3.6 Test magic link configuration

- [x] 4. Verify SSO Configuration
  - [x] 4.1 Ensure SSO card only shows when validationMethod === 'sso'
  - [x] 4.2 Verify all SSO fields are properly bound
  - [x] 4.3 Test SSO provider selection
  - [x] 4.4 Test OAuth/OpenID configuration
  - [x] 4.5 Test SAML configuration
  - [x] 4.6 Test attribute mapping

- [x] 5. Test Employee Management Integration
  - [x] 5.1 Test employee list display in Simple Auth mode
  - [x] 5.2 Test employee list display in Advanced Auth mode
  - [x] 5.3 Test CSV import functionality
  - [x] 5.4 Test add/edit/delete employee
  - [x] 5.5 Test employee search and filtering
  - [x] 5.6 Verify employee data persists correctly

- [x] 6. Documentation and Cleanup
  - [x] 6.1 Update component documentation
  - [x] 6.2 Add inline comments for complex logic
  - [x] 6.3 Remove unused imports and code
  - [x] 6.4 Update type definitions if needed
  - [x] 6.5 Create user guide for Access tab configuration

- [x] 7. SFTP Configuration Migration (Future)
  - [x] 7.1 Create SFTP configuration section in ClientConfiguration
  - [x] 7.2 Move SFTP-related components to client-level
  - [x] 7.3 Update documentation for SFTP configuration location
  - [x] 7.4 Remove SFTP references from site-level documentation

- [x] 8. Implement Admin Bypass for SSO
  - [x] 8.1 Add Admin Bypass toggle to SSO configuration card
  - [x] 8.2 Add bypass URL display and copy functionality
  - [x] 8.3 Add 2FA requirement toggle for bypass
  - [x] 8.4 Add IP whitelist configuration for bypass
  - [x] 8.5 Create bypass login page component
  - [x] 8.6 Implement bypass authentication API endpoint
  - [x] 8.7 Add bypass login audit logging
  - [x] 8.8 Test bypass login flow with and without 2FA

- [x] 9. Implement User Management for Advanced Auth
  - [x] 9.1 Create AdvancedAuthUser interface and types
  - [x] 9.2 Create user list component with edit/password/proxy actions
  - [x] 9.3 Implement edit user modal
  - [x] 9.4 Implement set password modal
  - [x] 9.5 Add random password generator
  - [x] 9.6 Add force password reset checkbox
  - [x] 9.7 Create API endpoints for user management
  - [x] 9.8 Test user editing and password setting

- [x] 10. Implement Proxy Login Feature
  - [x] 10.1 Add "Login As" button to user list
  - [x] 10.2 Create proxy session API endpoint
  - [x] 10.3 Implement proxy session token generation
  - [x] 10.4 Create proxy login banner component
  - [x] 10.5 Add session expiry countdown timer
  - [x] 10.6 Implement "End Session" functionality
  - [x] 10.7 Add read-only mode enforcement for proxy sessions
  - [x] 10.8 Add proxy login audit logging
  - [x] 10.9 Test proxy login flow and session expiry
  - [x] 10.10 Test read-only restrictions in proxy mode

- [x] 11. Security and Permissions
  - [x] 11.1 Create `proxy_login` permission
  - [x] 11.2 Add permission checks for proxy login
  - [x] 11.3 Add permission checks for user management
  - [x] 11.4 Implement audit logging for all sensitive actions
  - [x] 11.5 Test permission enforcement
  - [x] 11.6 Review security of temporary password handling

## Task Details

### Task 1: Refactor AccessManagement Component

**Goal**: Remove duplicate validation method selector and SFTP configuration from AccessManagement.

**Changes**:
- Add props interface to accept `mode` and `validationMethod` from parent
- Remove the validation method selector card (lines ~310-360 in AccessManagement.tsx)
- Remove the SFTP automation card (lines ~362-390 in AccessManagement.tsx)
- Update component logic to use `validationMethod` prop instead of internal state
- Remove `validationSettings` state variable

**Files**:
- `src/app/pages/admin/AccessManagement.tsx`

**Testing**:
- Verify component renders correctly with `mode="simple"` and different validation methods
- Verify component renders correctly with `mode="advanced"`
- Verify employee management works in both modes

### Task 2: Update SiteConfiguration Access Tab

**Goal**: Ensure SiteConfiguration properly controls authentication type and passes props to AccessManagement.

**Changes**:
- Verify authentication type selector is working (already exists around line 3727)
- Update AccessManagement component invocations to pass props:
  ```tsx
  <AccessManagement 
    mode={validationMethod === 'sso' ? 'advanced' : 'simple'}
    validationMethod={validationMethod}
  />
  ```
- Remove any duplicate validation method selectors
- Ensure state changes trigger auto-save

**Files**:
- `src/app/pages/admin/SiteConfiguration.tsx`

**Testing**:
- Test switching between Simple and Advanced auth
- Verify AccessManagement receives correct props
- Verify auto-save triggers on authentication type change

### Task 3: Simplify Simple Auth Configuration

**Goal**: Ensure Simple Auth settings are clear and properly integrated.

**Changes**:
- Keep the validation method dropdown in Simple Auth Settings card
- Keep method-specific settings (email domains, whitelists, etc.)
- Ensure all settings are bound to state variables
- Verify settings are included in save payload

**Files**:
- `src/app/pages/admin/SiteConfiguration.tsx`

**Testing**:
- Test each validation method (email, serialCard, magic_link)
- Verify settings save correctly
- Verify settings load correctly when reopening the page

### Task 4: Verify SSO Configuration

**Goal**: Ensure SSO configuration works correctly and only shows for Advanced Auth.

**Changes**:
- Verify SSO card only renders when `validationMethod === 'sso'`
- Ensure all SSO fields are properly bound to state
- Verify SSO settings are included in save payload

**Files**:
- `src/app/pages/admin/SiteConfiguration.tsx`

**Testing**:
- Test SSO provider selection
- Test OAuth/OpenID configuration
- Test SAML configuration
- Test attribute mapping
- Verify SSO settings save and load correctly

### Task 5: Test Employee Management Integration

**Goal**: Ensure employee management works correctly in both Simple and Advanced modes.

**Changes**:
- No code changes needed, just thorough testing
- Verify employee API integration works

**Files**:
- `src/app/pages/admin/AccessManagement.tsx`
- `src/services/employeeApi.ts`

**Testing**:
- Test employee list display
- Test CSV import
- Test add/edit/delete operations
- Test search and filtering
- Verify data persistence

### Task 6: Documentation and Cleanup

**Goal**: Clean up code and update documentation.

**Changes**:
- Add JSDoc comments to components
- Update README or documentation files
- Remove unused imports
- Remove commented-out code
- Update type definitions

**Files**:
- `src/app/pages/admin/AccessManagement.tsx`
- `src/app/pages/admin/SiteConfiguration.tsx`
- Documentation files

### Task 7: SFTP Configuration Migration

**Goal**: Move SFTP configuration to client-level settings (future work).

**Changes**:
- Create SFTP configuration section in ClientConfiguration
- Move SftpConfigModal to client-level
- Update documentation

**Files**:
- `src/app/pages/admin/ClientConfiguration.tsx`
- `src/app/components/admin/SftpConfigModal.tsx`

**Note**: This task is marked as future work and can be done separately.

### Task 8: Implement Admin Bypass for SSO

**Goal**: Allow site managers to login with username/password when SSO is configured.

**Changes**:
- Add Admin Bypass section to SSO configuration card
- Add toggle for "Allow Site Manager Bypass"
- Display bypass URL with copy button
- Add 2FA requirement toggle
- Add IP whitelist textarea
- Create bypass login page component
- Implement backend API for bypass authentication
- Add audit logging for bypass logins

**Files**:
- `src/app/pages/admin/SiteConfiguration.tsx` (SSO card)
- `src/app/pages/auth/AdminBypassLogin.tsx` (new)
- `src/services/authApi.ts` (new endpoints)
- Backend API routes

**Testing**:
- Test bypass URL generation
- Test bypass login with valid credentials
- Test bypass login with 2FA
- Test IP whitelist enforcement
- Verify audit logs are created

### Task 9: Implement User Management for Advanced Auth

**Goal**: Provide comprehensive user management for sites with Advanced Authentication.

**Changes**:
- Create AdvancedAuthUser interface
- Create user list component with enhanced actions
- Add "Edit" button to open edit user modal
- Add "Set Password" button to open password modal
- Create edit user modal component
- Create set password modal component
- Add random password generator function
- Add force password reset checkbox
- Create API endpoints:
  - `GET /api/sites/:siteId/users` - List users
  - `PUT /api/sites/:siteId/users/:userId` - Update user
  - `POST /api/sites/:siteId/users/:userId/password` - Set password
- Add email notification for password changes

**Files**:
- `src/app/pages/admin/AccessManagement.tsx`
- `src/app/components/admin/EditUserModal.tsx` (new)
- `src/app/components/admin/SetPasswordModal.tsx` (new)
- `src/services/userApi.ts` (new)
- `src/types/advancedAuth.ts` (new)
- Backend API routes

**Testing**:
- Test user list display
- Test edit user functionality
- Test set password with random generation
- Test force password reset flag
- Verify email notifications are sent
- Test password validation rules

### Task 10: Implement Proxy Login Feature

**Goal**: Allow site admins to view the site as an employee for support purposes.

**Changes**:
- Add "Login As" button to user list
- Add permission check for proxy login
- Create proxy session API endpoint
- Generate secure proxy session token
- Create proxy login banner component
- Add session expiry countdown timer
- Implement "End Session" button
- Enforce read-only mode in proxy sessions
- Add audit logging for proxy actions
- Create proxy session cleanup job (expire old sessions)

**Files**:
- `src/app/pages/admin/AccessManagement.tsx`
- `src/app/components/ProxyLoginBanner.tsx` (new)
- `src/services/proxyLoginApi.ts` (new)
- `src/hooks/useProxySession.ts` (new)
- `src/middleware/proxySessionMiddleware.ts` (new)
- Backend API routes

**API Endpoints**:
- `POST /api/sites/:siteId/proxy-sessions` - Create proxy session
- `DELETE /api/sites/:siteId/proxy-sessions/:sessionId` - End session
- `GET /api/sites/:siteId/proxy-sessions/current` - Get current session

**Testing**:
- Test proxy session creation
- Test proxy login opens in new tab
- Test proxy banner displays correctly
- Test session expiry countdown
- Test "End Session" functionality
- Test read-only enforcement (cannot make purchases)
- Verify audit logs capture all proxy actions
- Test session cleanup after expiry

### Task 11: Security and Permissions

**Goal**: Ensure all new features have proper security and permission controls.

**Changes**:
- Create `proxy_login` permission in permission system
- Add permission checks before proxy login
- Add permission checks for user management actions
- Implement comprehensive audit logging:
  - User edits (who, what, when)
  - Password changes (who set, for whom)
  - Proxy logins (admin, employee, duration)
  - Admin bypass logins (who, when, from where)
- Review temporary password handling for security
- Ensure passwords are hashed before storage
- Add rate limiting for sensitive endpoints
- Add CSRF protection for state-changing operations

**Files**:
- `src/services/permissionService.ts`
- `src/services/auditLogService.ts`
- `src/middleware/permissionMiddleware.ts`
- Backend API security middleware

**Testing**:
- Test permission enforcement for proxy login
- Test permission enforcement for user management
- Verify audit logs are created for all actions
- Test rate limiting on sensitive endpoints
- Review security of password handling
- Perform security audit of new features

## Priority

1. **High Priority**: Tasks 1-2 (Core refactoring)
2. **High Priority**: Tasks 8-11 (Advanced auth features)
3. **Medium Priority**: Tasks 3-5 (Testing and verification)
4. **Low Priority**: Task 6 (Documentation)
5. **Future**: Task 7 (SFTP migration)

## Estimated Effort

- Task 1: 2-3 hours
- Task 2: 1-2 hours
- Task 3: 1 hour
- Task 4: 1 hour
- Task 5: 2 hours
- Task 6: 1 hour
- Task 7: 3-4 hours (future)
- Task 8: 4-5 hours (Admin Bypass)
- Task 9: 5-6 hours (User Management)
- Task 10: 6-8 hours (Proxy Login)
- Task 11: 3-4 hours (Security & Permissions)

**Total Core Refactoring**: ~8-10 hours (Tasks 1-6)
**Total Advanced Features**: ~18-23 hours (Tasks 8-11)
**Grand Total**: ~26-33 hours (excluding Task 7)

## Implementation Order

### Phase 1: Core Refactoring (Tasks 1-6)
Complete the basic refactoring to establish a clean foundation.

### Phase 2: Admin Bypass (Task 8)
Implement admin bypass for SSO sites - relatively independent feature.

### Phase 3: User Management (Task 9)
Build user management UI and APIs - foundation for proxy login.

### Phase 4: Proxy Login (Task 10)
Implement proxy login feature - depends on user management.

### Phase 5: Security Hardening (Task 11)
Add permissions, audit logging, and security reviews.

### Phase 6: SFTP Migration (Task 7)
Move SFTP to client settings - can be done anytime.
