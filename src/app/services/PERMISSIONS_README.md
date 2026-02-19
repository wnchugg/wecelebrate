# Permission System Documentation

## Overview

This application has **TWO SEPARATE** permission systems:

1. **Admin User Permissions** - For platform administrators (`admin_users` table)
2. **Site User Roles** - For site-level users (`site_users` table)

## 1. Admin User Permissions (Platform Admins)

### Purpose
Controls what platform administrators can do within the admin dashboard.

### Database Tables
- `admin_permissions` - Defines available permissions
- `admin_user_permissions` - Assigns permissions to admin users
- `admin_users` - Platform admin accounts

### Permission Categories
- `user_management` - Create, edit, delete site users
- `proxy_login` - Login as site users for support
- `admin_bypass` - Bypass SSO for site manager access
- `site_management` - Manage site settings
- `client_management` - Manage client settings
- `general` - Other permissions

### Default Permissions
- `proxy_login` - Ability to login as another user (proxy login)
- `user_management` - Full user management capabilities
- `user_edit` - Edit user details
- `user_password_set` - Set user passwords
- `user_delete` - Delete/deactivate users
- `admin_bypass_login` - Use admin bypass for SSO sites
- `site_admin` - Full site administrative access
- `client_admin` - Full client administrative access

### Special Roles
- **super_admin**: Has ALL permissions automatically (no need to grant individually)
- **admin**: Requires explicit permission grants
- **viewer**: Read-only access (no permissions by default)

### Usage in Code

```typescript
import { hasPermission } from '../services/permissionService';

// Check if current admin user has permission
const canProxyLogin = await hasPermission('proxy_login');

if (canProxyLogin) {
  // Allow proxy login
}
```

### Database Functions
- `admin_user_has_permission(admin_user_id, permission)` - Check permission
- `grant_admin_permission(admin_user_id, permission, granted_by, expires_at)` - Grant permission
- `revoke_admin_permission(admin_user_id, permission)` - Revoke permission
- `get_admin_user_permissions(admin_user_id)` - List all permissions
- `cleanup_expired_admin_permissions()` - Remove expired permissions

### Migration
Run this migration to create the permission system:
```bash
supabase migration up create_permissions_system
```

## 2. Site User Roles (Site-Level Users)

### Purpose
Controls what site users can do within their specific site (for Advanced Authentication).

### Database Table
- `site_users` - Site-level user accounts with roles

### Roles
Defined in `site_users.role` column:
- `admin` - Site administrator
- `manager` - Site manager
- `employee` - Regular employee
- `viewer` - Read-only access

### Status
Defined in `site_users.status` column:
- `active` - User can login
- `inactive` - User cannot login
- `suspended` - Temporarily disabled
- `pending` - Awaiting activation

### Usage in Code

```typescript
// Site user roles are checked differently
const user = await getUsers(siteId);

if (user.role === 'admin') {
  // Allow admin actions
}

if (user.status === 'active') {
  // User can login
}
```

## Key Differences

| Aspect | Admin Users | Site Users |
|--------|-------------|------------|
| **Table** | `admin_users` | `site_users` |
| **Access Control** | Fine-grained permissions | Role-based |
| **Scope** | Platform-wide | Site-specific |
| **Permission Storage** | `admin_user_permissions` table | `role` column |
| **Service** | `permissionService.ts` | `userApi.ts` |
| **Use Case** | Platform administration | Site access control |

## When to Use Which System

### Use Admin User Permissions When:
- Controlling access to admin dashboard features
- Managing who can proxy login
- Controlling who can manage users
- Platform-level administrative tasks

### Use Site User Roles When:
- Controlling access within a specific site
- Managing employee access levels
- Site-specific permissions
- SSO/Advanced Auth scenarios

## Security Considerations

### Admin User Permissions
1. **Super Admin Bypass**: Super admins automatically have all permissions
2. **Permission Expiration**: Permissions can have expiration dates
3. **Audit Logging**: All permission grants/revokes are logged
4. **RLS Policies**: Row-level security enforces permission checks

### Site User Roles
1. **Site Isolation**: Users can only access their assigned site
2. **Status Checks**: Inactive/suspended users cannot login
3. **Force Password Reset**: Can require password change on next login
4. **Audit Logging**: User management actions are logged

## Examples

### Example 1: Admin Checking Proxy Login Permission

```typescript
// In AccessManagement.tsx
import { hasPermission } from '../../services/permissionService';

const [hasProxyPermission, setHasProxyPermission] = useState(false);

useEffect(() => {
  const checkPermissions = async () => {
    const proxyPermission = await hasPermission('proxy_login');
    setHasProxyPermission(proxyPermission);
  };
  
  void checkPermissions();
}, []);

// Disable button if no permission
<Button 
  disabled={!hasProxyPermission}
  onClick={handleProxyLogin}
>
  Login As
</Button>
```

### Example 2: Checking Site User Role

```typescript
// In site-level component
import { getUsers } from '../../services/userApi';

const users = await getUsers(siteId);
const admins = users.filter(u => u.role === 'admin' && u.status === 'active');
```

### Example 3: Granting Admin Permission

```typescript
import { grantPermission } from '../../services/permissionService';

// Grant proxy_login permission to an admin
const result = await grantPermission(
  adminUserId,
  'proxy_login',
  '2024-12-31T23:59:59Z' // Optional expiration
);

if (result.success) {
  console.log('Permission granted');
}
```

## Migration Status

### ✅ Implemented
- Permission system database schema
- Permission service functions
- Permission checks in user management
- Permission checks in proxy login
- Audit logging for permissions

### ⚠️ Pending
- Running the `create_permissions_system.sql` migration
- Granting initial permissions to existing admins
- UI for managing admin permissions
- Permission management admin panel

## Next Steps

1. **Run Migration**: Execute `create_permissions_system.sql` to create tables
2. **Grant Initial Permissions**: Assign permissions to existing admin users
3. **Test Permission Checks**: Verify permission enforcement works
4. **Build Admin UI**: Create interface for managing permissions (optional)
5. **Document for Team**: Share this guide with the development team

## Troubleshooting

### Permission Check Always Returns False
- Verify migration has been run
- Check if user has been granted the permission
- Verify user is in `admin_users` table (not `site_users`)
- Check if permission exists in `admin_permissions` table

### Super Admin Not Getting Permissions
- Super admins should automatically have all permissions
- Check `admin_users.role` is set to `'super_admin'`
- Verify `admin_user_has_permission` function includes super admin check

### Site User Permissions Not Working
- Site users use roles, not the permission system
- Check `site_users.role` column instead
- Use `userApi.ts` functions, not `permissionService.ts`

## References

- Migration File: `supabase/migrations/create_permissions_system.sql`
- Permission Service: `src/app/services/permissionService.ts`
- User API: `src/app/services/userApi.ts`
- Security Review: `src/app/services/SECURITY_REVIEW.md`
