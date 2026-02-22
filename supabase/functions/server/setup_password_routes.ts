/**
 * Setup Password Management Routes
 * Integrates password management endpoints with rate limiting
 */

import type { Hono } from "npm:hono@4.0.2";
import passwordManagementApp from './password_management.ts';
import { rateLimit, rateLimitPresets } from './middleware/rateLimit.ts';
import { authMiddleware } from './middleware/auth.ts';

export function setupPasswordRoutes(app: Hono): void {
  // Apply authentication and rate limiting to password management routes
  app.use('/make-server-6fcaeea3/password-management/*', authMiddleware);
  
  // Apply strict rate limiting for password operations
  app.use('/make-server-6fcaeea3/password-management/set', 
    rateLimit(rateLimitPresets.password)
  );
  
  app.use('/make-server-6fcaeea3/password-management/change', 
    rateLimit(rateLimitPresets.password)
  );
  
  // Very strict rate limiting for password generation (prevent abuse)
  app.use('/make-server-6fcaeea3/password-management/generate', 
    rateLimit(rateLimitPresets.sensitive)
  );
  
  // Mount password management routes
  app.route('/make-server-6fcaeea3/password-management', passwordManagementApp);
  
  console.log('✅ Password management routes registered with rate limiting');
}
