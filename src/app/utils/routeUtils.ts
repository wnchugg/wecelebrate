/**
 * Route Utility Functions
 * 
 * Centralized utilities for route detection and classification.
 * Used across the application to determine route types and behaviors.
 */

/**
 * Check if a given path is a public route (no admin authentication required)
 * 
 * @param path - The pathname to check (e.g., window.location.pathname)
 * @returns true if the route is public, false if it requires admin authentication
 * 
 * @example
 * ```typescript
 * if (isPublicRoute(window.location.pathname)) {
 *   // Skip admin session check
 * }
 * ```
 */
export function isPublicRoute(path: string): boolean {
  return (
    path.startsWith('/site/') ||
    path === '/' ||
    path === '/welcome' ||
    path === '/client-portal' ||
    path === '/celebration' ||
    path === '/celebration/create' ||
    path === '/feature-preview' ||
    path === '/stakeholder-review' ||
    path === '/technical-review' ||
    path === '/magic-link' ||
    path.startsWith('/magic-link/') ||
    path.startsWith('/sso/') ||
    path === '/privacy' ||
    path === '/home' ||
    path === '/flow-demo' ||
    path === '/gift-selection' ||
    path === '/gift-detail' ||
    path === '/shipping-information' ||
    path === '/select-shipping' ||
    path === '/review-order' ||
    path === '/confirmation' ||
    path === '/order-history' ||
    path === '/order-tracking' ||
    path === '/events' ||
    path === '/event-details' ||
    path === '/create-event' ||
    path === '/products' ||
    path === '/product-detail' ||
    path === '/checkout' ||
    path === '/privacy-settings' ||
    path === '/cart' ||
    path === '/selection-period-expired' ||
    path === '/site-selection' ||
    path === '/access' ||
    path.startsWith('/access/') ||
    path === '/initialize-database'
  );
}

/**
 * Check if a given path is an admin authentication or error page
 * These pages should not trigger session expired redirects
 * 
 * @param path - The pathname to check
 * @returns true if the route is an auth/error page
 */
export function isAuthOrErrorPage(path: string): boolean {
  return (
    path.includes('/admin/login') ||
    path.includes('/admin/session-expired') ||
    path.includes('/admin/token-clear') ||
    path.includes('/admin/signup') ||
    path.includes('/admin/bootstrap')
  );
}

/**
 * Check if a given path requires admin authentication
 * 
 * @param path - The pathname to check
 * @returns true if the route requires admin authentication
 */
export function requiresAdminAuth(path: string): boolean {
  return path.startsWith('/admin/') && !isAuthOrErrorPage(path);
}

/**
 * Check if a route is protected (requires authentication)
 */
export function isProtectedRoute(path: string): boolean {
  return !isPublicRoute(path) && !isAuthOrErrorPage(path);
}

/**
 * Get permissions required for a route
 */
export function getRoutePermissions(path: string): string[] {
  // Admin routes require admin permission
  if (path.startsWith('/admin/')) {
    return ['admin'];
  }
  
  // Client routes require client permission
  if (path.startsWith('/clients/')) {
    return ['client.view'];
  }
  
  // Site routes require site permission
  if (path.startsWith('/sites/')) {
    return ['site.view'];
  }
  
  // Gift routes require gift permission
  if (path.startsWith('/gifts/')) {
    return ['gift.view'];
  }
  
  // Employee routes require employee permission
  if (path.startsWith('/employees/')) {
    return ['employee.view'];
  }
  
  // Order routes require order permission
  if (path.startsWith('/orders/')) {
    return ['order.view'];
  }
  
  // No specific permissions required
  return [];
}