/**
 * Route Preloader Utility
 * Preloads lazy-loaded route components in the background to improve navigation performance
 */

// Track which routes have been preloaded
const preloadedRoutes = new Set<string>();

/**
 * Preload a lazy-loaded route component
 */
export async function preloadRoute(importFn: () => Promise<any>): Promise<void> {
  const routeKey = importFn.toString();
  
  // Skip if already preloaded
  if (preloadedRoutes.has(routeKey)) {
    return;
  }
  
  try {
    await importFn();
    preloadedRoutes.add(routeKey);
  } catch (error) {
    console.warn('[Route Preloader] Failed to preload route:', error);
  }
}

/**
 * Preload multiple routes in sequence with a small delay between each
 */
export async function preloadRoutes(importFns: Array<() => Promise<any>>, delayMs = 50): Promise<void> {
  for (const importFn of importFns) {
    await preloadRoute(importFn);
    // Small delay to avoid blocking the main thread
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
}

/**
 * Preload all common admin routes after successful login
 * Loads critical pages first, then secondary pages
 */
export async function preloadAdminRoutes(): Promise<void> {
  console.warn('[Route Preloader] Starting admin route preload...');
  
  // Critical routes - load immediately
  const criticalRoutes = [
    () => import('../pages/admin/Dashboard'),
    () => import('../pages/admin/ClientManagement'),
    () => import('../pages/admin/SiteManagement'),
    () => import('../pages/admin/ClientDashboard'),
  ];
  
  // Secondary routes - load after a delay
  const secondaryRoutes = [
    () => import('../pages/admin/GiftManagement'),
    () => import('../pages/admin/OrderManagement'),
    () => import('../pages/admin/EmployeeManagement'),
    () => import('../pages/admin/SystemAdminDashboard'),
    () => import('../pages/admin/Analytics'),
    () => import('../pages/admin/Reports'),
    () => import('../pages/admin/BrandManagement'),
    () => import('../pages/admin/SiteConfiguration'),
    () => import('../pages/admin/SiteGiftConfiguration'),
    () => import('../pages/admin/ImportExportSettings'),
  ];
  
  // Load critical routes first
  await preloadRoutes(criticalRoutes, 50);
  
  // Load secondary routes in the background
  setTimeout(() => {
    preloadRoutes(secondaryRoutes, 100);
  }, 500);
  
  console.warn('[Route Preloader] Critical admin routes preloaded');
}

/**
 * Reset preloaded routes cache (useful for testing)
 */
export function resetPreloadCache(): void {
  preloadedRoutes.clear();
}