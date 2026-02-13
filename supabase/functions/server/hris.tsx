import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_env.ts';

const app = new Hono();

// Enable CORS for HRIS routes
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Access-Token', 'X-Environment-ID'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get all HRIS connections
 */
app.get('/connections', async (c) => {
  try {
    const siteId = c.req.query('siteId');
    const clientId = c.req.query('clientId');
    const environmentId = c.req.header('X-Environment-ID') || 'development';

    console.log('[HRIS] GET /connections - environmentId:', environmentId, 'siteId:', siteId, 'clientId:', clientId);

    let connections = await kv.getByPrefix('hris_connection_', environmentId);
    console.log('[HRIS] Found', connections?.length || 0, 'connections');

    // Filter by site or client if provided
    if (siteId) {
      connections = connections.filter((conn: any) => conn.siteId === siteId);
    } else if (clientId) {
      connections = connections.filter((conn: any) => conn.clientId === clientId);
    }

    console.log('[HRIS] Returning', connections?.length || 0, 'connections after filtering');
    return c.json({ success: true, connections });
  } catch (error) {
    console.error('[HRIS] Error fetching connections:', error);
    return c.json({ success: false, error: 'Failed to fetch HRIS connections' }, 500);
  }
});

/**
 * Get a specific HRIS connection
 */
app.get('/connections/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const connection = await kv.get(`hris_connection_${id}`);

    if (!connection) {
      return c.json({ success: false, error: 'Connection not found' }, 404);
    }

    return c.json({ success: true, connection });
  } catch (error) {
    console.error('[HRIS] Error fetching connection:', error);
    return c.json({ success: false, error: 'Failed to fetch connection' }, 500);
  }
});

/**
 * Create a new HRIS connection
 */
app.post('/connections', async (c) => {
  try {
    const data = await c.req.json();
    
    const connectionId = generateId('hris_conn');
    const now = new Date().toISOString();

    const connection = {
      id: connectionId,
      clientId: data.clientId,
      siteId: data.siteId || null,
      siteIds: data.siteIds || [], // Support multi-site connections
      providerId: data.providerId,
      providerName: data.providerName,
      displayName: data.displayName,
      status: 'inactive', // Start as inactive until tested
      authType: data.authType,
      credentials: data.credentials,
      fieldMapping: data.fieldMapping,
      syncSchedule: {
        enabled: data.syncSchedule.enabled,
        frequency: data.syncSchedule.frequency,
        time: data.syncSchedule.time,
        lastSync: null,
        nextSync: calculateNextSync(data.syncSchedule)
      },
      syncConfig: data.syncConfig,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy || 'system'
    };

    await kv.set(`hris_connection_${connectionId}`, connection);

    console.log(`[HRIS] Connection created: ${connectionId}`);
    return c.json({ success: true, connection });
  } catch (error) {
    console.error('[HRIS] Error creating connection:', error);
    return c.json({ success: false, error: 'Failed to create connection' }, 500);
  }
});

/**
 * Update an existing HRIS connection
 */
app.put('/connections/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const data = await c.req.json();

    const existingConnection = await kv.get(`hris_connection_${id}`);
    if (!existingConnection) {
      return c.json({ success: false, error: 'Connection not found' }, 404);
    }

    const updatedConnection = {
      ...existingConnection,
      displayName: data.displayName,
      credentials: data.credentials,
      fieldMapping: data.fieldMapping,
      syncSchedule: {
        ...existingConnection.syncSchedule,
        enabled: data.syncSchedule.enabled,
        frequency: data.syncSchedule.frequency,
        time: data.syncSchedule.time,
        nextSync: calculateNextSync(data.syncSchedule)
      },
      syncConfig: data.syncConfig,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`hris_connection_${id}`, updatedConnection);

    console.log(`[HRIS] Connection updated: ${id}`);
    return c.json({ success: true, connection: updatedConnection });
  } catch (error) {
    console.error('[HRIS] Error updating connection:', error);
    return c.json({ success: false, error: 'Failed to update connection' }, 500);
  }
});

/**
 * Delete an HRIS connection
 */
app.delete('/connections/:id', async (c) => {
  try {
    const { id } = c.req.param();

    const existingConnection = await kv.get(`hris_connection_${id}`);
    if (!existingConnection) {
      return c.json({ success: false, error: 'Connection not found' }, 404);
    }

    await kv.del(`hris_connection_${id}`);

    console.log(`[HRIS] Connection deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('[HRIS] Error deleting connection:', error);
    return c.json({ success: false, error: 'Failed to delete connection' }, 500);
  }
});

/**
 * Test an HRIS connection
 */
app.post('/connections/:id/test', async (c) => {
  try {
    const { id } = c.req.param();

    const connection = await kv.get(`hris_connection_${id}`);
    if (!connection) {
      return c.json({ success: false, error: 'Connection not found' }, 404);
    }

    // Perform connection test based on auth type
    const testResult = await testHRISConnection(connection);

    // Update connection status
    connection.status = testResult.success ? 'active' : 'error';
    connection.updatedAt = new Date().toISOString();
    await kv.set(`hris_connection_${id}`, connection);

    console.log(`[HRIS] Connection test for ${id}: ${testResult.success ? 'SUCCESS' : 'FAILED'}`);
    return c.json(testResult);
  } catch (error) {
    console.error('[HRIS] Error testing connection:', error);
    return c.json({ success: false, error: 'Failed to test connection' }, 500);
  }
});

/**
 * Manually trigger a sync
 */
app.post('/connections/:id/sync', async (c) => {
  try {
    const { id } = c.req.param();

    const connection = await kv.get(`hris_connection_${id}`);
    if (!connection) {
      return c.json({ success: false, error: 'Connection not found' }, 404);
    }

    // Create sync history record
    const syncId = generateId('hris_sync');
    const syncHistory = {
      id: syncId,
      connectionId: id,
      startTime: new Date().toISOString(),
      status: 'running',
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      recordsFailed: 0,
      errors: [],
      summary: 'Sync started'
    };

    await kv.set(`hris_sync_${syncId}`, syncHistory);

    // Perform sync in background (in production, this would be a job queue)
    performSync(connection, syncId).catch(error => {
      console.error(`[HRIS] Sync error for ${id}:`, error);
    });

    console.log(`[HRIS] Sync started for connection ${id}: ${syncId}`);
    return c.json({ success: true, syncId });
  } catch (error) {
    console.error('[HRIS] Error starting sync:', error);
    return c.json({ success: false, error: 'Failed to start sync' }, 500);
  }
});

/**
 * Get sync history
 */
app.get('/sync-history', async (c) => {
  try {
    const siteId = c.req.query('siteId');
    const clientId = c.req.query('clientId');
    const connectionId = c.req.query('connectionId');
    const environmentId = c.req.header('X-Environment-ID') || 'development';

    console.log('[HRIS] GET /sync-history - environmentId:', environmentId, 'siteId:', siteId, 'clientId:', clientId, 'connectionId:', connectionId);

    let history = await kv.getByPrefix('hris_sync_', environmentId);
    console.log('[HRIS] Found', history?.length || 0, 'sync history records');

    // Filter by connection if provided
    if (connectionId) {
      history = history.filter((h: any) => h.connectionId === connectionId);
    }

    // If filtering by site, get connections for that site first
    if (siteId) {
      const connections = await kv.getByPrefix('hris_connection_', environmentId);
      const siteConnections = connections.filter((conn: any) => conn.siteId === siteId);
      const connectionIds = siteConnections.map((conn: any) => conn.id);
      history = history.filter((h: any) => connectionIds.includes(h.connectionId));
    }

    // If filtering by client, get connections for that client
    if (clientId) {
      const connections = await kv.getByPrefix('hris_connection_', environmentId);
      const clientConnections = connections.filter((conn: any) => conn.clientId === clientId);
      const connectionIds = clientConnections.map((conn: any) => conn.id);
      history = history.filter((h: any) => connectionIds.includes(h.connectionId));
    }

    // Sort by start time descending
    history.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    console.log('[HRIS] Returning', history?.length || 0, 'sync history records after filtering');
    return c.json({ success: true, history });
  } catch (error) {
    console.error('[HRIS] Error fetching sync history:', error);
    return c.json({ success: false, error: 'Failed to fetch sync history' }, 500);
  }
});

/**
 * Get a specific sync history record
 */
app.get('/sync-history/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const syncHistory = await kv.get(`hris_sync_${id}`);

    if (!syncHistory) {
      return c.json({ success: false, error: 'Sync history not found' }, 404);
    }

    return c.json({ success: true, syncHistory });
  } catch (error) {
    console.error('[HRIS] Error fetching sync history:', error);
    return c.json({ success: false, error: 'Failed to fetch sync history' }, 500);
  }
});

/**
 * Helper: Calculate next sync time
 */
function calculateNextSync(schedule: any): string | null {
  if (!schedule.enabled || schedule.frequency === 'manual') {
    return null;
  }

  const now = new Date();
  const [hours, minutes] = (schedule.time || '02:00').split(':').map(Number);

  let nextSync = new Date();
  nextSync.setHours(hours, minutes, 0, 0);

  switch (schedule.frequency) {
    case 'hourly':
      nextSync = new Date(now.getTime() + 60 * 60 * 1000);
      break;
    case 'daily':
      if (nextSync <= now) {
        nextSync.setDate(nextSync.getDate() + 1);
      }
      break;
    case 'weekly':
      const targetDay = schedule.dayOfWeek || 1; // Default to Monday
      while (nextSync.getDay() !== targetDay || nextSync <= now) {
        nextSync.setDate(nextSync.getDate() + 1);
      }
      break;
    case 'monthly':
      const targetDate = schedule.dayOfMonth || 1;
      nextSync.setDate(targetDate);
      if (nextSync <= now) {
        nextSync.setMonth(nextSync.getMonth() + 1);
      }
      break;
  }

  return nextSync.toISOString();
}

/**
 * Helper: Test HRIS connection
 */
async function testHRISConnection(connection: any): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, this would make actual API calls to the HRIS
    // For now, we'll just validate that credentials exist
    
    if (connection.authType === 'api_key') {
      if (!connection.credentials.apiUrl || !connection.credentials.apiKey) {
        return { success: false, error: 'Missing API URL or API Key' };
      }
    } else if (connection.authType === 'oauth') {
      if (!connection.credentials.apiUrl || !connection.credentials.clientId || !connection.credentials.clientSecret) {
        return { success: false, error: 'Missing OAuth credentials' };
      }
    } else if (connection.authType === 'basic') {
      if (!connection.credentials.apiUrl || !connection.credentials.username || !connection.credentials.password) {
        return { success: false, error: 'Missing basic auth credentials' };
      }
    } else if (connection.authType === 'sftp') {
      if (!connection.credentials.sftpHost || !connection.credentials.sftpUsername || !connection.credentials.sftpPassword) {
        return { success: false, error: 'Missing SFTP credentials' };
      }
    }

    // Simulate successful connection test
    console.log(`[HRIS] Testing connection to ${connection.providerName} (${connection.authType})`);
    
    return { success: true };
  } catch (error) {
    console.error('[HRIS] Connection test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Helper: Perform employee data sync
 */
async function performSync(connection: any, syncId: string): Promise<void> {
  try {
    console.log(`[HRIS] Starting sync ${syncId} for connection ${connection.id}`);
    
    // Get sync history
    const syncHistory = await kv.get(`hris_sync_${syncId}`);
    if (!syncHistory) {
      throw new Error('Sync history not found');
    }

    // In a real implementation, this would:
    // 1. Fetch employee data from the HRIS API/SFTP
    // 2. Map fields according to fieldMapping
    // 3. Validate data
    // 4. Create/update employee records
    // 5. Handle errors and conflicts
    
    // For now, simulate a successful sync
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

    // Mock sync results
    const mockResults = {
      recordsProcessed: 150,
      recordsCreated: 10,
      recordsUpdated: 135,
      recordsSkipped: 3,
      recordsFailed: 2,
      errors: [
        {
          field: 'email',
          message: 'Invalid email format',
          recordId: 'emp_12345'
        },
        {
          field: 'department',
          message: 'Department not found',
          recordId: 'emp_67890'
        }
      ]
    };

    // Update sync history
    const updatedHistory = {
      ...syncHistory,
      endTime: new Date().toISOString(),
      status: mockResults.recordsFailed > 0 ? 'partial' : 'completed',
      recordsProcessed: mockResults.recordsProcessed,
      recordsCreated: mockResults.recordsCreated,
      recordsUpdated: mockResults.recordsUpdated,
      recordsSkipped: mockResults.recordsSkipped,
      recordsFailed: mockResults.recordsFailed,
      errors: mockResults.errors,
      summary: `Synced ${mockResults.recordsProcessed} employees: ${mockResults.recordsCreated} created, ${mockResults.recordsUpdated} updated, ${mockResults.recordsSkipped} skipped, ${mockResults.recordsFailed} failed`
    };

    await kv.set(`hris_sync_${syncId}`, updatedHistory);

    // Update connection last sync time
    connection.syncSchedule.lastSync = new Date().toISOString();
    connection.syncSchedule.nextSync = calculateNextSync(connection.syncSchedule);
    await kv.set(`hris_connection_${connection.id}`, connection);

    console.log(`[HRIS] Sync completed: ${syncId}`);
  } catch (error) {
    console.error(`[HRIS] Sync error for ${syncId}:`, error);
    
    // Update sync history with error
    const syncHistory = await kv.get(`hris_sync_${syncId}`);
    if (syncHistory) {
      syncHistory.endTime = new Date().toISOString();
      syncHistory.status = 'failed';
      syncHistory.errors = [{
        field: 'system',
        message: error instanceof Error ? error.message : 'Unknown error'
      }];
      syncHistory.summary = 'Sync failed';
      await kv.set(`hris_sync_${syncId}`, syncHistory);
    }
  }
}

export default app;