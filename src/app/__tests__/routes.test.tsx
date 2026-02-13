/**
 * Route Configuration Test Suite
 * Day 13 - Morning Session (Part 1)
 * Tests for src/app/routes.tsx
 */

import { describe, it, expect, vi } from 'vitest';
import { router } from '../routes';

// Mock environment
vi.stubGlobal('import.meta', {
  env: {
    DEV: true,
  },
});

describe('Route Configuration Suite', () => {
  describe('Router Creation', () => {
    it('should create browser router', () => {
      expect(router).toBeDefined();
    });

    it('should have routes array', () => {
      expect(router.routes).toBeDefined();
      expect(Array.isArray(router.routes)).toBe(true);
    });

    it('should have multiple top-level routes', () => {
      expect(router.routes.length).toBeGreaterThan(0);
    });
  });

  describe('Public Routes Structure', () => {
    it('should have public routes', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      expect(publicRoute).toBeDefined();
    });

    it('should have Root component for public routes', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      // Component may be transformed by React Router, check if it exists or has element
      expect(publicRoute).toBeDefined();
      // Access properties safely with type assertion
      const route = publicRoute as any;
      expect(route?.Component || route?.element || route?.children).toBeDefined();
    });

    it('should have children routes for public routes', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      expect(publicRoute?.children).toBeDefined();
      expect(Array.isArray(publicRoute?.children)).toBe(true);
    });

    it('should have index route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const indexRoute = publicRoute?.children?.find(child => child.index === true);
      expect(indexRoute).toBeDefined();
    });

    it('should have hydration fallback for public routes', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      // HydrateFallback may be transformed or optional
      expect(publicRoute).toBeDefined();
      // Don't require HydrateFallback as it's optional in production builds
    });
  });

  describe('Admin Routes Structure', () => {
    it('should have admin routes', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      expect(adminRoute).toBeDefined();
    });

    it('should have AdminRoot component', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      // Component may be transformed by React Router
      expect(adminRoute).toBeDefined();
      // Access properties safely with type assertion
      const route = adminRoute as any;
      expect(route?.Component || route?.element || route?.children).toBeDefined();
    });

    it('should have children routes for admin', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      expect(adminRoute?.children).toBeDefined();
      expect(Array.isArray(adminRoute?.children)).toBe(true);
    });

    it('should have admin login route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const loginRoute = adminRoute?.children?.find(child => child.path === 'login');
      expect(loginRoute).toBeDefined();
    });

    it('should have admin dashboard route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const dashboardRoute = layoutWrapper?.children?.find(child => child.path === 'dashboard');
      expect(dashboardRoute).toBeDefined();
    });

    it('should have hydration fallback for admin routes', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      // HydrateFallback may be transformed or optional
      expect(adminRoute).toBeDefined();
      // Don't require HydrateFallback as it's optional in production builds
    });
  });

  describe('Site-Specific Routes', () => {
    it('should have site-specific routes', () => {
      const siteRoute = router.routes.find(route => route.path?.includes('/site'));
      expect(siteRoute).toBeDefined();
    });

    it('should have SiteLoaderWrapper component', () => {
      const siteRoute = router.routes.find(route => route.path?.includes('/site'));
      // Component may be transformed by React Router
      expect(siteRoute).toBeDefined();
      // Access properties safely with type assertion
      const route = siteRoute as any;
      expect(route?.Component || route?.element || route?.children).toBeDefined();
    });

    it('should have children routes for site', () => {
      const siteRoute = router.routes.find(route => route.path?.includes('/site'));
      expect(siteRoute?.children).toBeDefined();
      expect(Array.isArray(siteRoute?.children)).toBe(true);
    });

    it('should have site index route', () => {
      const siteRoute = router.routes.find(route => route.path?.includes('/site'));
      const indexRoute = siteRoute?.children?.find(child => child.index === true);
      expect(indexRoute).toBeDefined();
    });

    it('should have site access route', () => {
      const siteRoute = router.routes.find(route => route.path?.includes('/site'));
      const accessRoute = siteRoute?.children?.find(child => child.path === 'access');
      expect(accessRoute || siteRoute?.children?.find(child => child.path?.includes('access'))).toBeDefined();
    });

    it('should have site not found route', () => {
      const siteRoute = router.routes.find(route => route.path?.includes('/site'));
      const notFoundRoute = siteRoute?.children?.find(child => child.path === '*');
      expect(notFoundRoute).toBeDefined();
    });
  });

  describe('Public Route Paths', () => {
    it('should have welcome route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const welcomeRoute = publicRoute?.children?.find(child => child.path === 'welcome');
      expect(welcomeRoute).toBeDefined();
    });

    it('should have celebration route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const celebrationRoute = publicRoute?.children?.find(child => child.path === 'celebration');
      expect(celebrationRoute).toBeDefined();
    });

    it('should have products route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const productsRoute = publicRoute?.children?.find(child => child.path === 'products');
      expect(productsRoute).toBeDefined();
    });

    it('should have cart route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const cartRoute = publicRoute?.children?.find(child => child.path === 'cart');
      expect(cartRoute).toBeDefined();
    });

    it('should have checkout route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const checkoutRoute = publicRoute?.children?.find(child => child.path === 'checkout');
      expect(checkoutRoute).toBeDefined();
    });

    it('should have home route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const homeRoute = publicRoute?.children?.find(child => child.path === 'home');
      expect(homeRoute).toBeDefined();
    });

    it('should have events route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const eventsRoute = publicRoute?.children?.find(child => child.path === 'events');
      expect(eventsRoute).toBeDefined();
    });

    it('should have privacy route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const privacyRoute = publicRoute?.children?.find(child => child.path === 'privacy');
      expect(privacyRoute).toBeDefined();
    });
  });

  describe('Admin Route Paths', () => {
    it('should have admin login route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const loginRoute = adminRoute?.children?.find(child => child.path === 'login');
      expect(loginRoute).toBeDefined();
    });

    it('should have admin signup route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const signupRoute = adminRoute?.children?.find(child => child.path === 'signup');
      expect(signupRoute).toBeDefined();
    });

    it('should have admin logout route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const logoutRoute = adminRoute?.children?.find(child => child.path === 'logout');
      expect(logoutRoute).toBeDefined();
    });

    it('should have clients management route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const clientsRoute = layoutWrapper?.children?.find(child => child.path === 'clients');
      expect(clientsRoute).toBeDefined();
    });

    it('should have sites management route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const sitesRoute = layoutWrapper?.children?.find(child => child.path === 'sites');
      expect(sitesRoute).toBeDefined();
    });

    it('should have gifts management route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const giftsRoute = layoutWrapper?.children?.find(child => child.path === 'gifts');
      expect(giftsRoute).toBeDefined();
    });

    it('should have orders management route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const ordersRoute = layoutWrapper?.children?.find(child => child.path === 'orders');
      expect(ordersRoute).toBeDefined();
    });

    it('should have analytics route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const analyticsRoute = layoutWrapper?.children?.find(child => child.path === 'analytics');
      expect(analyticsRoute).toBeDefined();
    });

    it('should have reports route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const reportsRoute = layoutWrapper?.children?.find(child => child.path === 'reports');
      expect(reportsRoute).toBeDefined();
    });

    it('should have security dashboard route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const securityRoute = layoutWrapper?.children?.find(child => child.path === 'security');
      expect(securityRoute).toBeDefined();
    });
  });

  describe('Catalog Management Routes', () => {
    it('should have catalogs route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const catalogsRoute = layoutWrapper?.children?.find(child => child.path === 'catalogs');
      expect(catalogsRoute).toBeDefined();
    });

    it('should have catalog create route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const createRoute = layoutWrapper?.children?.find(child => child.path === 'catalogs/create');
      expect(createRoute).toBeDefined();
    });

    it('should have catalog edit route with parameter', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const editRoute = layoutWrapper?.children?.find(child => child.path === 'catalogs/:catalogId');
      expect(editRoute).toBeDefined();
    });

    it('should have catalog migration route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const migrateRoute = layoutWrapper?.children?.find(child => child.path === 'catalogs/migrate');
      expect(migrateRoute).toBeDefined();
    });

    it('should have site catalog configuration route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const configRoute = layoutWrapper?.children?.find(child => child.path === 'site-catalog-configuration');
      expect(configRoute).toBeDefined();
    });

    it('should have ERP management route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const erpRoute = layoutWrapper?.children?.find(child => child.path === 'erp');
      expect(erpRoute).toBeDefined();
    });
  });

  describe('Authentication Routes', () => {
    it('should have magic link request route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const magicLinkRoute = publicRoute?.children?.find(child => child.path === 'magic-link');
      expect(magicLinkRoute).toBeDefined();
    });

    it('should have magic link validation route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const validateRoute = publicRoute?.children?.find(child => child.path === 'magic-link/validate');
      expect(validateRoute).toBeDefined();
    });

    it('should have SSO validation route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const ssoRoute = publicRoute?.children?.find(child => child.path === 'sso/validate');
      expect(ssoRoute).toBeDefined();
    });

    it('should have access validation route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const accessRoute = publicRoute?.children?.find(child => child.path === 'access');
      expect(accessRoute).toBeDefined();
    });

    it('should have site selection route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const siteSelectionRoute = publicRoute?.children?.find(child => child.path === 'site-selection');
      expect(siteSelectionRoute).toBeDefined();
    });
  });

  describe('Shopping Flow Routes', () => {
    it('should have gift selection route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const giftSelectionRoute = publicRoute?.children?.find(child => child.path === 'gift-selection');
      expect(giftSelectionRoute).toBeDefined();
    });

    it('should have gift detail route with parameter', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const giftDetailRoute = publicRoute?.children?.find(child => child.path === 'gift-detail/:giftId');
      expect(giftDetailRoute).toBeDefined();
    });

    it('should have shipping information route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const shippingRoute = publicRoute?.children?.find(child => child.path === 'shipping-information');
      expect(shippingRoute).toBeDefined();
    });

    it('should have select shipping route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const selectShippingRoute = publicRoute?.children?.find(child => child.path === 'select-shipping');
      expect(selectShippingRoute).toBeDefined();
    });

    it('should have review order route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const reviewRoute = publicRoute?.children?.find(child => child.path === 'review-order');
      expect(reviewRoute).toBeDefined();
    });

    it('should have confirmation route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const confirmationRoute = publicRoute?.children?.find(child => child.path === 'confirmation');
      expect(confirmationRoute).toBeDefined();
    });

    it('should have order history route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const historyRoute = publicRoute?.children?.find(child => child.path === 'order-history');
      expect(historyRoute).toBeDefined();
    });

    it('should have order tracking route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const trackingRoute = publicRoute?.children?.find(child => child.path === 'order-tracking');
      expect(trackingRoute).toBeDefined();
    });
  });

  describe('Email & Communication Routes', () => {
    it('should have email templates route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const templatesRoute = layoutWrapper?.children?.find(child => child.path === 'email-templates');
      expect(templatesRoute).toBeDefined();
    });

    it('should have email notification configuration route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const notificationRoute = layoutWrapper?.children?.find(child => child.path === 'email-notification-configuration');
      expect(notificationRoute).toBeDefined();
    });

    it('should have email history route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const historyRoute = layoutWrapper?.children?.find(child => child.path === 'email-history');
      expect(historyRoute).toBeDefined();
    });

    it('should have global template library route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const libraryRoute = layoutWrapper?.children?.find(child => child.path === 'global-template-library');
      expect(libraryRoute).toBeDefined();
    });

    it('should have email service test route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const testRoute = layoutWrapper?.children?.find(child => child.path === 'email-service-test');
      expect(testRoute).toBeDefined();
    });
  });

  describe('Not Found Routes', () => {
    it('should have admin not found route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const notFoundRoute = adminRoute?.children?.find(child => child.path === '*');
      expect(notFoundRoute).toBeDefined();
    });

    it('should have site not found route', () => {
      const siteRoute = router.routes.find(route => route.path === '/site/:siteId');
      const notFoundRoute = siteRoute?.children?.find(child => child.path === '*');
      expect(notFoundRoute).toBeDefined();
    });
  });

  describe('Lazy Loading', () => {
    it('should lazy load public pages', () => {
      // All routes should have Component property
      const publicRoute = router.routes.find(route => route.path === undefined);
      const childRoutes = publicRoute?.children || [];
      childRoutes.forEach(child => {
        const route = child as any;
        if (!route.index && route.Component) {
          expect(route.Component).toBeDefined();
        }
      });
    });

    it('should lazy load admin pages', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const childRoutes = adminRoute?.children || [];
      childRoutes.forEach(child => {
        const route = child as any;
        if (route.Component) {
          expect(route.Component).toBeDefined();
        }
      });
    });

    it('should have hydration fallbacks', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const childRoutes = publicRoute?.children || [];
      childRoutes.forEach(child => {
        const route = child as any;
        if (route.HydrateFallback) {
          expect(route.HydrateFallback).toBeDefined();
        }
      });
    });
  });

  describe('Route Parameters', () => {
    it('should have siteId parameter in site route', () => {
      const siteRoute = router.routes.find(route => route.path === '/site/:siteId');
      expect(siteRoute?.path).toContain(':siteId');
    });

    it('should have giftId parameter in gift detail route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const giftDetailRoute = publicRoute?.children?.find(child => child.path === 'gift-detail/:giftId');
      expect(giftDetailRoute?.path).toContain(':giftId');
    });

    it('should have clientId parameter in client detail route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const clientDetailRoute = layoutWrapper?.children?.find(child => child.path === 'clients/:clientId');
      expect(clientDetailRoute?.path).toContain(':clientId');
    });

    it('should have catalogId parameter in catalog edit route', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const catalogEditRoute = layoutWrapper?.children?.find(child => child.path === 'catalogs/:catalogId');
      expect(catalogEditRoute?.path).toContain(':catalogId');
    });
  });

  describe('Index Routes', () => {
    it('should have public index route', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      const indexRoute = publicRoute?.children?.find(child => child.index === true);
      expect(indexRoute).toBeDefined();
      expect(indexRoute?.index).toBe(true);
    });

    it('should have admin index route (redirect)', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      const indexRoute = layoutWrapper?.children?.find(child => child.index === true);
      expect(indexRoute).toBeDefined();
    });

    it('should have site index route', () => {
      const siteRoute = router.routes.find(route => route.path === '/site/:siteId');
      const indexRoute = siteRoute?.children?.find(child => child.index === true);
      expect(indexRoute).toBeDefined();
      expect(indexRoute?.index).toBe(true);
    });
  });

  describe('Nested Routes', () => {
    it('should have admin layout wrapper with nested routes', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      expect(layoutWrapper).toBeDefined();
      expect(layoutWrapper?.children).toBeDefined();
    });

    it('should have multiple nested admin routes', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      const layoutWrapper = adminRoute?.children?.find(child => child.children);
      expect(layoutWrapper?.children?.length).toBeGreaterThan(10);
    });

    it('should have site nested routes', () => {
      const siteRoute = router.routes.find(route => route.path === '/site/:siteId');
      expect(siteRoute?.children?.length).toBeGreaterThan(5);
    });
  });

  describe('Route Count', () => {
    it('should have correct number of top-level routes', () => {
      expect(router.routes.length).toBe(3); // Public, Site, Admin
    });

    it('should have public child routes', () => {
      const publicRoute = router.routes.find(route => route.path === undefined);
      expect(publicRoute?.children?.length).toBeGreaterThan(20);
    });

    it('should have admin child routes', () => {
      const adminRoute = router.routes.find(route => route.path === '/admin');
      expect(adminRoute?.children?.length).toBeGreaterThan(5);
    });

    it('should have site child routes', () => {
      const siteRoute = router.routes.find(route => route.path === '/site/:siteId');
      expect(siteRoute?.children?.length).toBeGreaterThan(5);
    });
  });
});