# wecelebrate Route Architecture

## Overview
The wecelebrate platform uses React Router v6 with a clear separation between public and admin routes.

## Route Structure

```
/                           → GlobalHome (public landing page)
├── /welcome                → Welcome page
├── /client-portal          → Client portal (authenticated clients view their sites)
├── /celebration            → Public celebration pages
├── /access                 → Employee access validation
├── /site/:siteId           → Site-specific routes
│   ├── /site/:siteId/landing
│   ├── /site/:siteId/gift-selection
│   └── ...
└── /admin                  → Admin routes (separate hierarchy)
    ├── /admin/login        → Admin login
    ├── /admin/signup       → Admin signup
    ├── /admin/dashboard    → Admin dashboard (requires auth)
    ├── /admin/clients      → Client management
    └── ...
```

## Root Components

### Public Routes → `Root` Component
- **File**: `/src/app/pages/Root.tsx`
- **Providers**:
  - `PublicSiteProvider` - Loads public site configuration
  - `LanguageContext` (via App.tsx)
  - `PrivacyContext` (via App.tsx)
  - `SiteContext` (via App.tsx)
  - `AuthContext` (via App.tsx)
- **Features**:
  - Cookie consent
  - Database initialization check
  - Skip-to-content accessibility link
  - Suspense boundaries

### Admin Routes → `AdminRoot` Component
- **File**: `/src/app/pages/admin/AdminRoot.tsx`
- **Providers**:
  - `GiftProvider` - Gift management context
  - `EmailTemplateProvider` - Email template management
  - `ShippingConfigProvider` - Shipping configuration
  - `LanguageContext` (via App.tsx)
  - `AdminContext` (via App.tsx)
- **Features**:
  - Cookie consent
  - Skip-to-admin-content accessibility link
  - Suspense boundaries
  - Development logging

## Context Provider Hierarchy

```
App.tsx (Root level)
├── LanguageProvider
├── PrivacyProvider
├── SiteProvider
├── AuthProvider
└── AdminProvider
    └── RouterProvider
        ├── Public Routes (Root component)
        │   └── PublicSiteProvider
        │       └── Page Components
        └── Admin Routes (AdminRoot component)
            └── GiftProvider
                └── EmailTemplateProvider
                    └── ShippingConfigProvider
                        └── Page Components
```

## Route Detection Utilities

### `isPublicRoute(path: string): boolean`
**File**: `/src/app/utils/routeUtils.ts`

Determines if a route is public (no admin authentication required).

**Public Routes Include**:
- `/` - Global home
- `/welcome` - Welcome page
- `/client-portal` - Client portal
- `/celebration` - Celebration pages
- `/site/:siteId/*` - All site-specific routes
- `/access` - Employee access
- `/initialize-database` - Database setup
- And more...

**Admin Routes** (NOT public):
- `/admin/*` - All admin routes

### `isAuthOrErrorPage(path: string): boolean`
Pages that should not trigger session expiration redirects:
- `/admin/login`
- `/admin/signup`
- `/admin/session-expired`
- `/admin/bootstrap`
- `/admin/token-clear`

### `requiresAdminAuth(path: string): boolean`
Returns `true` if the route requires admin authentication.
- Formula: `path.startsWith('/admin/') && !isAuthOrErrorPage(path)`

## API Call Patterns

### Public Routes
- Use `X-Session-Token` header (if available)
- Do NOT use admin access tokens
- Call public endpoints: `/public/sites`, `/public/gifts`, etc.

### Admin Routes
- Use `Authorization: Bearer ${publicAnonKey}` (Supabase platform auth)
- Use `X-Access-Token: ${token}` (Custom JWT for admin verification)
- Call admin endpoints: `/admin/clients`, `/admin/sites`, etc.

## Performance Optimization

### Lazy Loading
All routes use React `lazy()` for code splitting:
```tsx
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
```

### Development-Only Routes
Debug routes are tree-shaken in production:
```tsx
const AdminDebug = import.meta.env.DEV 
  ? lazy(() => import('./pages/admin/AdminDebug'))
  : null;
```

### Route Preloading
Admin routes are preloaded after successful login:
```tsx
// In AdminContext after login
preloadAdminRoutes();
```

## Session Management

### Admin Sessions
- Managed by `AdminContext`
- Access token stored in localStorage: `wecelebrate_admin_token`
- Session timer triggers logout after 30 minutes of inactivity
- Session check runs on mount (skipped for public routes)

### Public Access
- No persistent session required
- Optional session token for authenticated employees
- Validation method-based access (serial code, magic link, SSO)

## Error Handling

### 404 Pages
- **Public 404**: Uses `Standard404` component
- **Admin 404**: Also uses `Standard404` component
- Automatic typo detection and suggestion

### Maintenance Mode
- Uses `MaintenancePage` component
- Configurable countdown timer
- Customizable messaging and branding

## Loading States

### Router-Level Loading
```tsx
<RouterProvider 
  router={router} 
  fallback={<RouterLoadingFallback />}
/>
```

### Route-Level Loading
```tsx
{
  path: "login",
  Component: AdminLogin,
  HydrateFallback: LoadingFallback
}
```

### Component-Level Loading
```tsx
<Suspense fallback={<AdminRouteFallback />}>
  <Outlet />
</Suspense>
```

## Security Considerations

### Token Management
- Public routes: Clear any admin tokens on mount
- Admin routes: Verify token validity on mount
- Auth pages: Skip session checks

### Route Guards
- Implemented in `AdminLayoutWrapper` component
- Redirects unauthenticated users to `/admin/login`
- Preserves intended destination for post-login redirect

## Accessibility

### Skip Links
- **Public**: `#main-content`
- **Admin**: `#admin-main-content`
- Keyboard accessible (Tab to focus)
- Visually hidden until focused

### Language Support
- Document language attribute updated on route change
- Screen reader friendly
- Multi-language support via `LanguageContext`

## Debugging

### Development Logging
Enable route debugging in development:
```javascript
// AdminRoot.tsx
console.log('[AdminRoot] Route changed:', location.pathname);

// AdminContext.tsx
console.log('[Session Check] Current path:', path);
```

### Diagnostic Routes
Available in development only:
- `/admin/login-diagnostic` - Login system diagnostics
- `/admin/debug` - General admin debugging
- `/admin/quick-auth-check` - Quick authentication check
- `/diagnostic` - Public diagnostic page

## Best Practices

1. **Route Separation**: Keep admin and public routes completely separate
2. **Context Isolation**: Don't load unnecessary contexts on routes
3. **Lazy Loading**: Always use lazy loading for route components
4. **Type Safety**: Use TypeScript for route parameters and props
5. **Error Boundaries**: Wrap routes in error boundaries
6. **Loading States**: Provide meaningful loading states at all levels
7. **Accessibility**: Include skip links and proper ARIA labels
8. **Security**: Validate tokens and permissions on protected routes

## Migration Notes

### From JALA 2 to wecelebrate
- ✅ Updated all route references to use wecelebrate branding
- ✅ Separated admin and public route hierarchies
- ✅ Enhanced error pages with Standard404 and MaintenancePage
- ✅ Improved route utilities for better detection
- ✅ Added comprehensive documentation

### Breaking Changes
None - all existing routes continue to work with backward compatibility.
