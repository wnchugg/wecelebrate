# Environment System Guide
Complete documentation for the JALA 2 multi-environment system

## Overview
The JALA 2 platform supports multiple deployment environments (Development, Test, UAT, Production) with separate Supabase backends, allowing developers and admins to safely test features without affecting production data.

## Architecture

### Environment Configuration
Location: `/src/app/config/environments.ts`

```typescript
export type EnvironmentType = 'development' | 'test' | 'uat' | 'production';

export interface EnvironmentConfig {
  id: EnvironmentType;
  name: string;           // Display name: "Development", "Test", etc.
  label: string;          // Badge label: "DEV", "TEST", etc.
  color: string;          // Hex color for UI
  supabaseUrl: string;    // Supabase project URL
  supabaseAnonKey: string; // Supabase anon key
  description: string;    // User-facing description
}
```

### Storage & Persistence
- **Storage**: `localStorage.deployment_environment`
- **Default**: `'development'` if not set
- **Lifecycle**: Persists across browser sessions until manually changed
- **Scope**: Per-browser, not per-user

### How It Works

#### 1. Environment Selection
Users select an environment via the `DeploymentEnvironmentSelector` component:
- **Location in UI**: Top-right corner of login page
- **Interaction**: Click dropdown → select environment → page reloads
- **Confirmation**: Production switches require explicit confirmation

#### 2. Environment Application
When environment changes:
```typescript
localStorage.setItem('deployment_environment', envId);
window.location.reload(); // Force reload to apply new environment
```

#### 3. API Routing
The API layer reads the current environment and routes requests accordingly:

```typescript
// In /src/app/utils/api.ts
function getApiBaseUrl(): string {
  const env = getCurrentEnvironment();
  // Extract project ID from environment's Supabase URL
  const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const envProjectId = urlMatch ? urlMatch[1] : projectId;
  return `https://${envProjectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
}
```

#### 4. Authentication Headers
```typescript
// Uses environment-specific anon key for unauthenticated requests
const env = getCurrentEnvironment();
const authToken = getAccessToken() || env.supabaseAnonKey;
headers['Authorization'] = `Bearer ${authToken}`;
```

## Components

### 1. EnvironmentBadge
**Location**: `/src/app/components/EnvironmentBadge.tsx`  
**Purpose**: Display current environment as a badge  
**Usage**: 
```tsx
import { EnvironmentBadge } from '@/app/components/EnvironmentBadge';
<EnvironmentBadge />
```

**Appearance**:
- DEV: Green badge
- TEST: Amber badge
- UAT: Purple badge
- PROD: Red badge

### 2. DeploymentEnvironmentSelector
**Location**: `/src/app/components/DeploymentEnvironmentSelector.tsx`  
**Purpose**: Allow users to switch environments  
**Variants**: 
- `login`: Full width with descriptions (used on login page)
- `header`: Compact (used in headers)

**Usage**:
```tsx
import { DeploymentEnvironmentSelector } from '@/app/components/DeploymentEnvironmentSelector';

// Login variant (full)
<DeploymentEnvironmentSelector variant="login" />

// Header variant (compact)
<DeploymentEnvironmentSelector variant="header" />
```

### 3. EnvironmentCredentialChecker
**Location**: `/src/app/components/EnvironmentCredentialChecker.tsx`  
**Purpose**: Help users find which environment has their credentials  
**Usage**: 
```tsx
import { EnvironmentCredentialChecker } from '@/app/components/EnvironmentCredentialChecker';
<EnvironmentCredentialChecker />
```

**Features**:
- Displays all available environments
- Shows current environment
- One-click switching
- Guidance for password managers

## Password Manager Integration

### How It Works
Each environment gets unique form identifiers:

```tsx
// Form ID includes environment
<form id={`admin-login-form-${currentEnv.id}`} name={`admin-login-${currentEnv.id}`}>
  
  // Hidden field for password managers
  <input type="hidden" name="environment" value={currentEnv.id} />
  
  // Email field with environment-specific ID
  <input 
    id={`email-${currentEnv.id}`}
    name={`email-${currentEnv.id}`}
    type="email"
    autoComplete="username"
  />
  
  // Password field with environment-specific ID
  <input 
    id={`password-${currentEnv.id}`}
    name={`password-${currentEnv.id}`}
    type="password"
    autoComplete="current-password"
  />
</form>
```

### Password Manager Benefits
1. **Separate Credentials**: Each environment's credentials are stored separately
2. **Auto-Fill**: Password managers auto-fill based on environment
3. **Easy Identification**: Saved as "Admin Login - Development", "Admin Login - Production", etc.
4. **No Confusion**: Won't accidentally use prod credentials in dev

## Configuration Setup

### Adding a New Environment

1. **Update environment configuration** (`/src/app/config/environments.ts`):
```typescript
export const environments: Record<EnvironmentType, EnvironmentConfig> = {
  // ... existing environments
  
  staging: {
    id: 'staging',
    name: 'Staging',
    label: 'STAGE',
    color: '#3B82F6', // Blue
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL_STAGING || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_STAGING || '',
    description: 'Staging environment for pre-production testing',
  },
};
```

2. **Add TypeScript type**:
```typescript
export type EnvironmentType = 'development' | 'test' | 'uat' | 'staging' | 'production';
```

3. **Set environment variables**:
Create `.env.staging` file:
```bash
VITE_SUPABASE_URL_STAGING=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY_STAGING=your-staging-anon-key
```

4. **No code changes required** - The system automatically picks up the new environment!

## Environment Variables

### Structure
```bash
# Default/Development
VITE_SUPABASE_URL=https://default-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-default-anon-key

# Test Environment
VITE_SUPABASE_URL_TEST=https://test-project.supabase.co
VITE_SUPABASE_ANON_KEY_TEST=your-test-anon-key

# UAT Environment
VITE_SUPABASE_URL_UAT=https://uat-project.supabase.co
VITE_SUPABASE_ANON_KEY_UAT=your-uat-anon-key

# Production Environment
VITE_SUPABASE_URL_PROD=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY_PROD=your-prod-anon-key
```

### Fallback Strategy
```typescript
// Environments fall back to default if specific vars not set
supabaseUrl: import.meta.env.VITE_SUPABASE_URL_TEST || import.meta.env.VITE_SUPABASE_URL || '',
```

## API Integration

### How API Calls Work with Environments

#### 1. Login Request
```typescript
// User logs in to "Test" environment
await adminLogin('admin@example.com', 'password');

// Behind the scenes:
getCurrentEnvironment() → { id: 'test', supabaseUrl: 'test-project...' }
getApiBaseUrl() → 'https://test-project.supabase.co/functions/v1/make-server-6fcaeea3'
fetch('https://test-project.supabase.co/.../auth/login', { ... })
```

#### 2. Data Requests
```typescript
// Fetch clients
await clientApi.getAll();

// Routes to current environment's backend:
getApiBaseUrl() + '/clients'
```

#### 3. Environment Switch Impact
```typescript
// Before: Development environment
API calls → dev-project.supabase.co

// User switches to Production
setCurrentEnvironment('production');
// Page reloads

// After: Production environment  
API calls → prod-project.supabase.co
```

## Security Considerations

### 🔒 Token Isolation
- **Current**: Tokens stored in `sessionStorage` without environment prefix
- **Impact**: Switching environments clears your session
- **Future**: Consider environment-prefixed token storage

### 🔒 Cross-Environment Protection
- **Production Confirmation**: Requires explicit user confirmation
- **Visual Indicators**: Color-coded badges prevent accidents
- **Audit Logging**: All environment switches should be logged (future)

### 🔒 Environment Variables
- All `VITE_*` variables are exposed to the browser
- Never put sensitive secrets in environment variables
- Anon keys are safe to expose (they're public by design)
- Service role keys must NEVER be in frontend env vars

## Testing Strategy

### Testing Environment Switching

```typescript
// Test 1: Environment Persistence
localStorage.setItem('deployment_environment', 'test');
window.location.reload();
expect(getCurrentEnvironment().id).toBe('test');

// Test 2: API URL Generation
setCurrentEnvironment('production');
expect(getApiBaseUrl()).toContain('prod-project');

// Test 3: Fallback Behavior
localStorage.removeItem('deployment_environment');
expect(getCurrentEnvironment().id).toBe('development');
```

### Testing Password Manager Integration

1. Save credentials in "Development" environment
2. Switch to "Production" environment
3. Verify password manager doesn't auto-fill
4. Switch back to "Development"
5. Verify password manager auto-fills correctly

## Troubleshooting

### Issue: "Environment switch doesn't work"
**Symptoms**: Changing environment doesn't change backend
**Cause**: API layer not using `getCurrentEnvironment()`
**Fix**: Ensure all API calls use `getApiBaseUrl()` function

### Issue: "Lost session after switching"
**Symptoms**: Logged out when changing environment
**Cause**: Token stored without environment context
**Expected**: This is current behavior - tokens are environment-specific
**Solution**: Re-login after switching environments

### Issue: "Wrong credentials auto-filled"
**Symptoms**: Password manager suggests wrong credentials
**Cause**: Form IDs not environment-specific
**Fix**: Verify form elements have `id={`field-${currentEnv.id}`}`

### Issue: "CORS errors"
**Symptoms**: Requests blocked by browser
**Cause**: Missing CORS headers in backend
**Fix**: Verify backend allows: `"Authorization"`, `"X-CSRF-Token"`, `"Content-Type"`

## Best Practices

### For Developers
1. ✅ Always test in Development before Production
2. ✅ Use environment-specific test data
3. ✅ Never hard-code environment URLs
4. ✅ Log environment context in errors
5. ✅ Test password manager integration

### For Admins
1. ✅ Create separate admin accounts per environment
2. ✅ Use descriptive usernames (e.g., `admin-dev@example.com`)
3. ✅ Never share production credentials
4. ✅ Document which environment you're testing in
5. ✅ Use the credential finder if you forget

### For QA
1. ✅ Test all features in each environment
2. ✅ Verify data isolation between environments
3. ✅ Test environment switching flow
4. ✅ Verify correct backend is being called
5. ✅ Test with different browsers and password managers

## Future Enhancements

### Planned
- [ ] Environment-specific token storage (avoid logout on switch)
- [ ] Health check indicators per environment
- [ ] Recent environments quick-switch
- [ ] Environment usage analytics
- [ ] Auto-detection based on hostname

### Proposed
- [ ] Environment-specific feature flags
- [ ] Data sync between environments (dev → test)
- [ ] Environment comparison tool
- [ ] Credential import/export per environment
- [ ] Multi-tenant environment isolation

## FAQ

**Q: Can I use the same Supabase project for multiple environments?**  
A: Not recommended. Each environment should have its own Supabase project for proper data isolation.

**Q: What happens to my session when I switch environments?**  
A: Currently, your session is cleared because tokens are not environment-prefixed. You'll need to log in again.

**Q: Can I have different admin accounts in each environment?**  
A: Yes! This is recommended. Each environment's database is separate.

**Q: How do I know which environment I'm in?**  
A: Check the environment badge (next to logo) or the dropdown in the header.

**Q: What if I accidentally use production instead of dev?**  
A: Production requires confirmation before switching. Also, the red badge provides a strong visual indicator.

**Q: Can end-users switch environments?**  
A: No, this is an admin-only feature. End users always use the production environment via the public URL.

---

**Last Updated**: February 6, 2026  
**Version**: 1.0  
**Maintainer**: Development Team
