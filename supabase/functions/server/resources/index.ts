/**
 * Resources Index
 * 
 * Central export for all migrated CRUD resources.
 * 
 * @module resources
 * @created 2026-02-09
 * @migrated Phase 3.2
 */

import type { Hono } from 'npm:hono';
import { setupClientRoutes } from './clients.ts';
import { setupSiteRoutes } from './sites.ts';
import { setupGiftRoutes } from './gifts.ts';
import { setupOrderRoutes } from './orders.ts';
import { logger } from '../logger.ts';

/**
 * Setup all migrated CRUD resources
 * 
 * This function sets up all resources that have been migrated
 * to use the CRUD factory pattern.
 * 
 * @param app - Hono app instance
 * @param verifyAdminMiddleware - Optional admin verification middleware
 */
export function setupMigratedResources(app: Hono, verifyAdminMiddleware?: any): void {
  logger.info('resources', 'setupMigratedResources', {
    message: 'Setting up all migrated CRUD resources',
    hasMiddleware: !!verifyAdminMiddleware,
  });

  const startTime = Date.now();

  // Setup each resource with middleware
  setupClientRoutes(app, verifyAdminMiddleware);
  setupSiteRoutes(app, verifyAdminMiddleware);
  setupGiftRoutes(app, verifyAdminMiddleware);
  setupOrderRoutes(app, verifyAdminMiddleware);

  const duration = Date.now() - startTime;

  logger.info('resources', 'setupMigratedResources', {
    message: 'All migrated CRUD resources setup complete',
    resources: ['clients', 'sites', 'gifts', 'orders'],
    totalResources: 4,
    totalRoutes: 20, // 5 CRUD per resource
    additionalRoutes: 10, // Custom routes
    duration,
  });

  console.log('✅ Migrated CRUD Resources: clients, sites, gifts, orders');
  console.log(`📊 Total Routes: ~30 (20 CRUD + 10 custom)`);
  console.log(`⚡ Setup Time: ${duration}ms`);
}

// Export resource modules for direct use
export * from './clients.ts';
export * from './sites.ts';
export * from './gifts.ts';
export * from './orders.ts';