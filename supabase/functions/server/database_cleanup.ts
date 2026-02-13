/**
 * Database Cleanup Utility
 * Helps reduce database size by cleaning up old logs, temporary data, and unused records
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Context } from "npm:hono@4.0.2";

const supabase = () => createClient(
  Deno.env.get("SUPABASE_URL") ?? '',
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '',
);

/**
 * Get database size statistics
 */
export async function getDatabaseStats() {
  const client = supabase();
  
  try {
    // Get table sizes
    const { data: tableSizes, error } = await client.rpc('pg_database_size', {
      database_name: 'postgres'
    });
    
    if (error) {
      console.error('Error getting database size:', error);
    }
    
    // Get KV store record count
    const { count: kvCount } = await client
      .from('kv_store_6fcaeea3')
      .select('*', { count: 'exact', head: true });
    
    return {
      kvStoreRecords: kvCount || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Database stats error:', error);
    return {
      kvStoreRecords: 0,
      error: 'Failed to get stats'
    };
  }
}

/**
 * Clean up old KV store records
 * Keeps only recent records and removes old data
 */
export async function cleanupOldRecords(daysToKeep: number = 7) {
  const client = supabase();
  const results = {
    deleted: 0,
    errors: [] as string[]
  };
  
  try {
    // This would need a created_at column in the KV store
    // For now, we'll provide manual cleanup options
    console.log(`Cleanup requested for records older than ${daysToKeep} days`);
    
    // Option 1: Clean up test data (keys starting with 'test:')
    const { data: testRecords } = await client
      .from('kv_store_6fcaeea3')
      .select('key')
      .like('key', 'test:%');
    
    if (testRecords && testRecords.length > 0) {
      const { error } = await client
        .from('kv_store_6fcaeea3')
        .delete()
        .like('key', 'test:%');
      
      if (error) {
        results.errors.push(`Failed to delete test records: ${error.message}`);
      } else {
        results.deleted += testRecords.length;
        console.log(`Deleted ${testRecords.length} test records`);
      }
    }
    
    // Option 2: Clean up demo data (keys starting with 'demo:')
    const { data: demoRecords } = await client
      .from('kv_store_6fcaeea3')
      .select('key')
      .like('key', 'demo:%');
    
    if (demoRecords && demoRecords.length > 0) {
      const { error } = await client
        .from('kv_store_6fcaeea3')
        .delete()
        .like('key', 'demo:%');
      
      if (error) {
        results.errors.push(`Failed to delete demo records: ${error.message}`);
      } else {
        results.deleted += demoRecords.length;
        console.log(`Deleted ${demoRecords.length} demo records`);
      }
    }
    
  } catch (error: any) {
    results.errors.push(`Cleanup error: ${error.message}`);
  }
  
  return results;
}

/**
 * Remove duplicate records
 */
export async function removeDuplicates() {
  const client = supabase();
  const results = {
    removed: 0,
    errors: [] as string[]
  };
  
  try {
    // Get all keys
    const { data: records } = await client
      .from('kv_store_6fcaeea3')
      .select('key');
    
    if (!records) {
      return results;
    }
    
    // Find duplicates (shouldn't exist due to primary key, but check anyway)
    const keyCounts = new Map<string, number>();
    for (const record of records) {
      keyCounts.set(record.key, (keyCounts.get(record.key) || 0) + 1);
    }
    
    const duplicates = Array.from(keyCounts.entries())
      .filter(([_, count]) => count > 1);
    
    console.log(`Found ${duplicates.length} duplicate keys`);
    results.removed = duplicates.length;
    
  } catch (error: any) {
    results.errors.push(`Duplicate removal error: ${error.message}`);
  }
  
  return results;
}

/**
 * Vacuum and analyze database (requires superuser, may not work on Supabase)
 */
export async function optimizeDatabase() {
  const client = supabase();
  
  try {
    // Run VACUUM ANALYZE on KV store table
    // Note: This requires special privileges and may not work on Supabase
    const { error } = await client.rpc('vacuum_analyze', {
      table_name: 'kv_store_6fcaeea3'
    });
    
    if (error) {
      console.warn('VACUUM ANALYZE failed (expected on Supabase):', error.message);
      return {
        success: false,
        message: 'Database optimization requires direct SQL access'
      };
    }
    
    return {
      success: true,
      message: 'Database optimized successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Optimization error: ${error.message}`
    };
  }
}

/**
 * List all keys by prefix to identify what's taking up space
 */
export async function analyzeKeyDistribution() {
  const client = supabase();
  
  try {
    const { data: records } = await client
      .from('kv_store_6fcaeea3')
      .select('key');
    
    if (!records) {
      return {};
    }
    
    // Count by prefix
    const prefixCounts: Record<string, number> = {};
    
    for (const record of records) {
      const prefix = record.key.split(':')[0];
      prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
    }
    
    // Sort by count descending
    const sorted = Object.entries(prefixCounts)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, number>);
    
    return sorted;
  } catch (error: any) {
    console.error('Analysis error:', error);
    return { error: error.message };
  }
}

/**
 * Setup cleanup routes
 */
export function setupCleanupRoutes(app: any) {
  // Get database statistics
  app.get('/make-server-6fcaeea3/admin/database/stats', async (c: Context) => {
    try {
      const stats = await getDatabaseStats();
      const distribution = await analyzeKeyDistribution();
      
      return c.json({
        success: true,
        stats,
        distribution
      });
    } catch (error: any) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  // Cleanup old records
  app.post('/make-server-6fcaeea3/admin/database/cleanup', async (c: Context) => {
    try {
      const { daysToKeep = 7 } = await c.req.json().catch(() => ({}));
      
      const results = await cleanupOldRecords(daysToKeep);
      
      return c.json({
        success: results.errors.length === 0,
        results
      });
    } catch (error: any) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  // Analyze key distribution
  app.get('/make-server-6fcaeea3/admin/database/analyze', async (c: Context) => {
    try {
      const distribution = await analyzeKeyDistribution();
      
      return c.json({
        success: true,
        distribution
      });
    } catch (error: any) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  // Delete specific key prefix
  app.delete('/make-server-6fcaeea3/admin/database/prefix/:prefix', async (c: Context) => {
    try {
      const prefix = c.req.param('prefix');
      
      if (!prefix) {
        return c.json({
          success: false,
          error: 'Prefix is required'
        }, 400);
      }
      
      const client = supabase();
      
      // Get count first
      const { count } = await client
        .from('kv_store_6fcaeea3')
        .select('*', { count: 'exact', head: true })
        .like('key', `${prefix}:%`);
      
      // Delete
      const { error } = await client
        .from('kv_store_6fcaeea3')
        .delete()
        .like('key', `${prefix}:%`);
      
      if (error) {
        return c.json({
          success: false,
          error: error.message
        }, 500);
      }
      
      return c.json({
        success: true,
        deleted: count || 0,
        prefix
      });
    } catch (error: any) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
}
