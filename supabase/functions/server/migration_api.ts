/**
 * Migration API Endpoints
 * 
 * Provides endpoints for migrating to multi-catalog architecture
 */

import { Hono } from 'npm:hono';
import { 
  migrateToMultiCatalog, 
  needsMigration, 
  getMigrationStatus,
  rollbackMigration 
} from './catalog-migration.ts';

const app = new Hono();

// ==================== GET /migration/status - Check migration status ====================

app.get('/status', async (c) => {
  try {
    const status = await getMigrationStatus();
    
    console.log('[Migration API] Retrieved migration status');
    
    return c.json({
      success: true,
      status,
    });
  } catch (error: any) {
    console.error('[Migration API] Error getting migration status:', error);
    return c.json({
      success: false,
      error: `Failed to get migration status: ${error.message}`,
    }, 500);
  }
});

// ==================== GET /migration/check - Check if migration is needed ====================

app.get('/check', async (c) => {
  try {
    const isNeeded = await needsMigration();
    
    console.log(`[Migration API] Migration needed: ${isNeeded}`);
    
    return c.json({
      success: true,
      migrationNeeded: isNeeded,
      message: isNeeded 
        ? 'Migration is required. No catalogs found.'
        : 'Migration already completed or not needed.',
    });
  } catch (error: any) {
    console.error('[Migration API] Error checking migration:', error);
    return c.json({
      success: false,
      error: `Failed to check migration status: ${error.message}`,
    }, 500);
  }
});

// ==================== POST /migration/run - Run migration ====================

app.post('/run', async (c) => {
  try {
    console.log('[Migration API] Starting migration...');
    
    // Check if migration is needed first
    const isNeeded = await needsMigration();
    
    if (!isNeeded) {
      console.log('[Migration API] Migration not needed');
      return c.json({
        success: true,
        message: 'Migration already completed',
        skipped: true,
      });
    }
    
    // Run migration
    const result = await migrateToMultiCatalog();
    
    if (!result.success) {
      console.error('[Migration API] Migration failed:', result.errors);
      return c.json({
        success: false,
        error: 'Migration failed',
        result,
      }, 500);
    }
    
    console.log('[Migration API] Migration completed successfully');
    
    return c.json({
      success: true,
      message: 'Migration completed successfully',
      result,
    });
  } catch (error: any) {
    console.error('[Migration API] Error running migration:', error);
    return c.json({
      success: false,
      error: `Migration failed: ${error.message}`,
    }, 500);
  }
});

// ==================== POST /migration/rollback - Rollback migration (DEV ONLY) ====================

app.post('/rollback', async (c) => {
  try {
    console.warn('[Migration API] ⚠️  Starting migration rollback...');
    
    const result = await rollbackMigration();
    
    if (!result.success) {
      console.error('[Migration API] Rollback failed:', result.errors);
      return c.json({
        success: false,
        error: 'Rollback failed',
        result,
      }, 500);
    }
    
    console.log('[Migration API] Rollback completed');
    
    return c.json({
      success: true,
      message: 'Migration rolled back successfully',
      result,
      warning: 'This action should only be used in development/testing',
    });
  } catch (error: any) {
    console.error('[Migration API] Error during rollback:', error);
    return c.json({
      success: false,
      error: `Rollback failed: ${error.message}`,
    }, 500);
  }
});

export default app;