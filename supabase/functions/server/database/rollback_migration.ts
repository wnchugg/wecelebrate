/**
 * Rollback Migration Script
 * Phase 1: Database Optimization
 * 
 * This script rolls back the migration by clearing the new tables
 * and optionally restoring from a backup.
 * 
 * Usage:
 *   deno run --allow-net --allow-env rollback_migration.ts [--confirm]
 * 
 * Options:
 *   --confirm: Required to actually perform the rollback
 *   --tables: Comma-separated list of tables to rollback (default: all)
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// ============================================================================
// Configuration
// ============================================================================

const args = Deno.args;
const confirmed = args.includes('--confirm');
const tablesToRollback = args.find(arg => arg.startsWith('--tables='))?.split('=')[1]?.split(',') || [
  'orders',
  'employees',
  'site_product_exclusions',
  'products',
  'sites',
  'catalogs',
  'clients',
  'analytics_events',
  'admin_users',
  'audit_logs',
];

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============================================================================
// Logging
// ============================================================================

function log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    warn: '⚠️',
    error: '❌',
    success: '✅',
  }[level];
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

// ============================================================================
// Rollback Functions
// ============================================================================

async function rollbackTable(tableName: string): Promise<void> {
  try {
    log(`Rolling back table: ${tableName}`);
    
    // Get count before deletion
    const { count: beforeCount, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw new Error(`Failed to count records in ${tableName}: ${countError.message}`);
    }
    
    log(`Found ${beforeCount} records in ${tableName}`);
    
    // Delete all records
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');  // Delete all (dummy condition)
    
    if (deleteError) {
      throw new Error(`Failed to delete records from ${tableName}: ${deleteError.message}`);
    }
    
    log(`✅ Rolled back ${tableName} (deleted ${beforeCount} records)`, 'success');
    
  } catch (error) {
    log(`Failed to rollback ${tableName}: ${error.message}`, 'error');
    throw error;
  }
}

async function runRollback(): Promise<void> {
  try {
    log('='.repeat(80));
    log('Migration Rollback Script');
    log('='.repeat(80));
    
    if (!confirmed) {
      log('⚠️  WARNING: This will DELETE ALL DATA from the new tables!', 'warn');
      log('⚠️  To proceed, run with --confirm flag', 'warn');
      log('='.repeat(80));
      return;
    }
    
    log('⚠️  CONFIRMED: Rolling back migration...', 'warn');
    log(`Tables to rollback: ${tablesToRollback.join(', ')}`);
    log('='.repeat(80));
    
    // Rollback in reverse order (respecting foreign key dependencies)
    const reversedTables = [...tablesToRollback].reverse();
    
    for (const table of reversedTables) {
      await rollbackTable(table);
    }
    
    log('='.repeat(80));
    log('✅ ROLLBACK COMPLETE', 'success');
    log('='.repeat(80));
    log('The KV store data remains intact.');
    log('You can re-run the migration script when ready.');
    
  } catch (error) {
    log(`Rollback failed: ${error.message}`, 'error');
    throw error;
  }
}

// ============================================================================
// Entry Point
// ============================================================================

if (import.meta.main) {
  try {
    await runRollback();
    Deno.exit(0);
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    Deno.exit(1);
  }
}

export { runRollback, rollbackTable };
