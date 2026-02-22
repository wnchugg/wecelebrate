# Access Tab Refactoring - Design

## Architecture Overview

The Access tab refactoring will establish a clear hierarchy:
1. **SiteConfiguration** owns the authentication type selection (Simple vs Advanced)
2. **AccessManagement** component adapts to the selected authentication type
3. **SFTP configuration** is removed from site settings and moved to client settings

## Component Design

### 1. SiteConfiguration Access Tab

The Access tab will have a simplified structure:

```tsx
<TabsContent value="access">
  {/* Header Banner */}
  <InfoBanner />
  
  {/* Authentication Type Selector */}
  <AuthenticationTypeCard 
    validationMethod={validationMethod}
    onSelect={handleAuthTypeChange}
  />
  
  {/* Simple Auth Configuration */}
  {validationMethod !== 'sso' && (
    <>
      <SimpleAuthSettingsCard 
        validationMethod={validationMethod}
        onMethodChange={handleValidationMethodChange}
        settings={simpleAuthSettings}
        onSettingsChange={handleSimpleAuthSettingsChange}
      />
      
      <AccessManagement 
        mode="simple"
        validationMethod={validationMethod}
      />
    </>
  )}
  
  {/* Advanced Auth Configuration */}
  {validationMethod === 'sso' && (
    <>
      <SSOConfigurationCard 
        config={ssoConfig}
        onChange={handleSSOConfigChange}
      />
      
      <AccessManagement 
        mode="advanced"
        validationMethod="sso"
      />
    </>
  )}
</TabsContent>
```

### 2. AccessManagement Component Refactoring

The AccessManagement component will be refactored to:
- **Remove** the validation method selector (it's now controlled by parent)
- **Remove** the SFTP automation card
- **Accept** props to determine its behavior:
  - `mode`: 'simple' | 'advanced'
  - `validationMethod`: current validation method from parent
- **Adapt** its UI based on the mode and validation method

```tsx
interface AccessManagementProps {
  mode: 'simple' | 'advanced';
  validationMethod: 'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso';
}

export function AccessManagement({ mode, validationMethod }: AccessManagementProps) {
  // Component adapts based on props
  // No internal validation method selector
  // No SFTP configuration
  
  if (mode === 'simple') {
    return <SimpleEmployeeManagement validationMethod={validationMethod} />;
  } else {
    return <AdvancedEmployeeManagement />;
  }
}
```

### 3. Authentication Type Card

A new card component for selecting between Simple and Advanced auth:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Authentication Method</CardTitle>
    <CardDescription>
      Choose between simple validation or advanced authentication
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid md:grid-cols-2 gap-4">
      {/* Simple Auth Button */}
      <button
        onClick={() => handleAuthTypeChange('email')}
        className={validationMethod !== 'sso' ? 'selected' : ''}
      >
        <Mail />
        <h4>Simple Auth</h4>
        <p>For sites without full employee data</p>
        <ul>
          <li>Email validation</li>
          <li>Serial card numbers</li>
          <li>Magic links</li>
        </ul>
      </button>
      
      {/* Advanced Auth Button */}
      <button
        onClick={() => handleAuthTypeChange('sso')}
        className={validationMethod === 'sso' ? 'selected' : ''}
      >
        <Lock />
        <h4>Advanced Auth</h4>
        <p>For sites with employee data</p>
        <ul>
          <li>Single Sign-On (SSO)</li>
          <li>User/Password authentication</li>
          <li>Roles & access groups</li>
        </ul>
      </button>
    </div>
  </CardContent>
</Card>
```

### 4. Simple Auth Settings Card

A card for configuring Simple Authentication methods:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Simple Authentication Settings</CardTitle>
    <CardDescription>
      Choose a validation method for user access
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Validation Method Dropdown */}
    <select 
      value={validationMethod}
      onChange={handleValidationMethodChange}
    >
      <option value="email">Email Address Validation</option>
      <option value="serialCard">Serial Card Number</option>
      <option value="magic_link">Magic Link (Email)</option>
    </select>
    
    {/* Method-Specific Settings */}
    {validationMethod === 'email' && <EmailSettings />}
    {validationMethod === 'serialCard' && <SerialCardSettings />}
    {validationMethod === 'magic_link' && <MagicLinkSettings />}
  </CardContent>
</Card>
```

### 5. SSO Configuration Card

The existing SSO configuration card remains largely the same but is only shown when `validationMethod === 'sso'`.

**Additional SSO Settings:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>SSO Configuration</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Existing SSO fields... */}
    
    {/* Admin Bypass Section */}
    <div className="border-t pt-4 mt-4">
      <h4 className="font-semibold mb-3">Admin Bypass Access</h4>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-semibold">Allow Site Manager Bypass</p>
          <p className="text-sm text-gray-600">
            Enable username/password login for site managers when SSO is required
          </p>
        </div>
        <Toggle 
          checked={allowAdminBypass}
          onChange={setAllowAdminBypass}
        />
      </div>
      
      {allowAdminBypass && (
        <div className="mt-4 space-y-3">
          <div>
            <label>Bypass Login URL</label>
            <Input 
              value={`${siteUrl}/admin-login`}
              readOnly
            />
            <Button onClick={copyBypassUrl}>Copy URL</Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <div>
              <p className="font-semibold">Require 2FA for Bypass</p>
              <p className="text-sm">Additional security for admin access</p>
            </div>
            <Toggle 
              checked={bypassRequires2FA}
              onChange={setBypassRequires2FA}
            />
          </div>
          
          <div>
            <label>Allowed IP Addresses (Optional)</label>
            <textarea 
              placeholder="192.168.1.1&#10;10.0.0.1"
              value={bypassAllowedIPs}
              onChange={setBypassAllowedIPs}
            />
            <p className="text-xs text-gray-500">
              One IP per line. Leave empty to allow all IPs.
            </p>
          </div>
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

### 6. Advanced User Management Component

A new component for managing users in Advanced Authentication mode:

```tsx
<Card>
  <CardHeader>
    <CardTitle>User Management</CardTitle>
    <CardDescription>
      Manage employee accounts, passwords, and permissions
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* User List with Actions */}
    <div className="space-y-2">
      {users.map(user => (
        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar user={user} />
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex gap-2 mt-1">
                <Badge>{user.role}</Badge>
                <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                  {user.status}
                </Badge>
                {user.forcePasswordReset && (
                  <Badge variant="warning">Password Reset Required</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openEditUserModal(user)}
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openSetPasswordModal(user)}
            >
              <Key className="w-4 h-4" />
              Set Password
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleProxyLogin(user)}
              disabled={!hasProxyPermission}
            >
              <UserCheck className="w-4 h-4" />
              Login As
            </Button>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

### 7. Set Password Modal

```tsx
<Modal open={showSetPasswordModal} onClose={closeModal}>
  <ModalHeader>
    <h3>Set Temporary Password</h3>
    <p>Set a temporary password for {selectedUser.name}</p>
  </ModalHeader>
  
  <ModalContent>
    <div className="space-y-4">
      <div>
        <label>Temporary Password</label>
        <Input 
          type="password"
          value={temporaryPassword}
          onChange={setTemporaryPassword}
        />
        <Button 
          variant="outline" 
          onClick={generateRandomPassword}
        >
          Generate Random Password
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Checkbox 
          checked={forcePasswordReset}
          onChange={setForcePasswordReset}
        />
        <label>Force user to reset password on next login</label>
      </div>
      
      <Alert variant="info">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          The temporary password will be sent to the user's email address.
          Make sure to enable "Force password reset" for security.
        </AlertDescription>
      </Alert>
    </div>
  </ModalContent>
  
  <ModalFooter>
    <Button variant="outline" onClick={closeModal}>Cancel</Button>
    <Button onClick={handleSetPassword}>Set Password</Button>
  </ModalFooter>
</Modal>
```

### 8. Proxy Login Banner

When an admin proxies as an employee, show a prominent banner:

```tsx
{isProxySession && (
  <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white p-3">
    <div className="container mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <UserCheck className="w-5 h-5" />
        <div>
          <p className="font-semibold">
            Viewing as {proxyUser.name}
          </p>
          <p className="text-sm text-amber-100">
            Read-only mode • Session expires in {timeRemaining}
          </p>
        </div>
      </div>
      
      <Button 
        variant="secondary"
        onClick={endProxySession}
      >
        End Session
      </Button>
    </div>
  </div>
)}
```

## State Management

### SiteConfiguration State

```tsx
// Authentication type (controls Simple vs Advanced)
const [validationMethod, setValidationMethod] = useState<
  'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso'
>(currentSite?.settings?.validationMethod || 'email');

// Simple Auth settings
const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
const [emailWhitelist, setEmailWhitelist] = useState<string[]>([]);

// SSO settings
const [ssoProvider, setSsoProvider] = useState('');
const [ssoConfig, setSsoConfig] = useState({
  clientId: '',
  clientSecret: '',
  authorizationUrl: '',
  tokenUrl: '',
  // ... other SSO fields
});

// Admin Bypass settings
const [allowAdminBypass, setAllowAdminBypass] = useState(false);
const [bypassRequires2FA, setBypassRequires2FA] = useState(true);
const [bypassAllowedIPs, setBypassAllowedIPs] = useState<string[]>([]);
```

### AccessManagement State

```tsx
// Remove validation method state (now comes from props)
// Keep employee management state
const [employees, setEmployees] = useState<Employee[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [loading, setLoading] = useState(false);

// Advanced Auth specific state
const [users, setUsers] = useState<AdvancedAuthUser[]>([]);
const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
const [selectedUser, setSelectedUser] = useState<AdvancedAuthUser | null>(null);
const [temporaryPassword, setTemporaryPassword] = useState('');
const [forcePasswordReset, setForcePasswordReset] = useState(true);

// Proxy login state
const [isProxySession, setIsProxySession] = useState(false);
const [proxyUser, setProxyUser] = useState<AdvancedAuthUser | null>(null);
const [proxySessionExpiry, setProxySessionExpiry] = useState<Date | null>(null);
```

## Data Flow

### Changing Authentication Type

1. User clicks "Simple Auth" or "Advanced Auth" button
2. `handleAuthTypeChange` is called in SiteConfiguration
3. If switching to Simple Auth:
   - Set `validationMethod` to 'email' (default)
   - Show Simple Auth settings card
   - Show AccessManagement in 'simple' mode
4. If switching to Advanced Auth:
   - Set `validationMethod` to 'sso'
   - Show SSO configuration card
   - Show AccessManagement in 'advanced' mode
5. Changes are auto-saved via the existing auto-save mechanism

### Changing Validation Method (Simple Auth)

1. User selects a validation method from dropdown (email, serialCard, magic_link)
2. `handleValidationMethodChange` is called in SiteConfiguration
3. `validationMethod` state is updated
4. Method-specific settings are shown
5. AccessManagement component receives new `validationMethod` prop
6. AccessManagement adapts its UI (email list, employee ID list, or serial card list)
7. Changes are auto-saved

### Saving Settings

All settings are saved through the existing auto-save mechanism:
- Changes trigger `setHasChanges(true)`
- Auto-save timer saves draft after 10 seconds
- Settings are saved via `saveSiteDraft()`

### Setting Temporary Password

1. Admin clicks "Set Password" button for a user
2. Set Password modal opens
3. Admin enters temporary password or generates random one
4. Admin checks "Force password reset" option
5. Admin clicks "Set Password"
6. API call to `setUserPassword(userId, password, forceReset)`
7. Email sent to user with temporary password
8. User record updated with `forcePasswordReset: true`
9. Success toast shown

### Proxy Login Flow

1. Admin clicks "Login As" button for an employee
2. Permission check: verify admin has `proxy_login` permission
3. API call to `createProxySession(adminId, employeeId, siteId)`
4. Backend creates proxy session with 30-minute expiry
5. Backend generates proxy session token
6. New tab/window opens with proxy session token
7. Employee site view loads with proxy banner at top
8. All actions are read-only (purchases/changes disabled)
9. Session expires after 30 minutes or when admin clicks "End Session"
10. All proxy actions logged with admin ID and employee ID

### Admin Bypass Login Flow

1. Site manager navigates to bypass URL (e.g., `/site/example/admin-login`)
2. Bypass login page shows username/password form
3. If 2FA required, show 2FA input after password
4. If IP whitelist configured, verify IP address
5. Backend validates credentials and permissions
6. Backend checks user has site manager role
7. Session created with bypass flag
8. User redirected to site admin dashboard
9. Bypass login logged for security audit

## UI/UX Improvements

### Visual Hierarchy

1. **Authentication Type** (top level) - Large card with two options
2. **Method Configuration** (second level) - Settings specific to chosen type
3. **Employee Management** (third level) - List management and import tools

### Removed Elements

- ❌ Validation method selector in AccessManagement component
- ❌ SFTP automation card in AccessManagement component
- ❌ Duplicate authentication type descriptions

### Clarified Elements

- ✅ Clear distinction between Simple and Advanced auth
- ✅ Single source of truth for validation method
- ✅ Consistent terminology throughout
- ✅ Better visual grouping of related settings
- ✅ User management actions (edit, set password, proxy login)
- ✅ Admin bypass configuration for SSO sites
- ✅ Proxy login with clear visual indicators
- ✅ Security features (2FA, IP whitelist, audit logging)

## Migration Strategy

### Phase 1: Refactor AccessManagement
1. Add props interface to AccessManagement
2. Remove internal validation method selector
3. Remove SFTP automation card
4. Adapt UI based on props

### Phase 2: Update SiteConfiguration
1. Keep existing authentication type selector
2. Pass props to AccessManagement
3. Ensure proper state management
4. Test all authentication flows

### Phase 3: Move SFTP Configuration
1. Create SFTP configuration section in ClientConfiguration
2. Remove SFTP references from site-level settings
3. Update documentation

## Testing Strategy

### Unit Tests
- Test AccessManagement with different prop combinations
- Test authentication type switching
- Test validation method changes
- Test settings persistence

### Integration Tests
- Test Simple Auth flow (email, serial card, magic link)
- Test Advanced Auth flow (SSO configuration)
- Test employee import/export
- Test auto-save functionality

### Manual Testing
- Verify no duplicate UI elements
- Verify all settings save correctly
- Verify employee management works in both modes
- Verify SFTP configuration is removed from site settings

## Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation works throughout
- Focus management when switching between auth types
- Screen reader announcements for state changes

## Performance

- Lazy load AccessManagement component (already implemented)
- Debounce search input in employee list
- Virtualize long employee lists if needed
- Optimize re-renders when switching auth types

## Security

- SSO credentials stored securely
- Employee data access controlled by permissions
- Validation method changes require appropriate permissions
- Audit log for authentication configuration changes
- Temporary passwords are hashed before storage
- Force password reset enforced on first login
- Proxy login sessions are time-limited (30 minutes)
- Proxy login requires specific permission (`proxy_login`)
- All proxy actions are logged with admin and employee IDs
- Admin bypass requires additional security (2FA, IP whitelist)
- Bypass login activity is logged for security auditing
- Proxy sessions are read-only to prevent unauthorized changes
