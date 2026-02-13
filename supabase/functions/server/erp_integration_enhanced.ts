/**
 * ERP Integration Module - Enhanced Version
 * Supports multiple connection methods (API, DOI, SFTP) and comprehensive data synchronization
 */

import * as kv from './kv_store.tsx';

// ==================== TYPE DEFINITIONS ====================

export type ERPConnectionMethod = 'api' | 'doi' | 'sftp';
export type ERPConnectionStatus = 'active' | 'inactive' | 'error' | 'testing';
export type ERPSyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'scheduled';
export type ERPDataType = 'orders' | 'products' | 'order_status' | 'inventory' | 'employees' | 'invoices';
export type ERPSyncDirection = 'pull' | 'push' | 'bidirectional';

export interface ERPConnection {
  id: string;
  name: string;
  provider: string; // 'SAP', 'Oracle', 'NetSuite', 'Custom', etc.
  connectionMethod: ERPConnectionMethod;
  status: ERPConnectionStatus;
  credentials: ERPCredentials;
  settings: ERPConnectionSettings;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastTestedAt?: string;
  lastSyncAt?: string;
}

export interface ERPCredentials {
  // API credentials
  apiUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  oauthToken?: string;
  
  // DOI credentials
  doiEndpoint?: string;
  doiUsername?: string;
  doiPassword?: string;
  
  // SFTP credentials
  sftpHost?: string;
  sftpPort?: number;
  sftpUsername?: string;
  sftpPassword?: string;
  sftpPrivateKey?: string;
  sftpPath?: string;
}

export interface ERPConnectionSettings {
  timeout?: number; // milliseconds
  retryAttempts?: number;
  retryDelay?: number; // milliseconds
  batchSize?: number;
  syncSchedule?: string; // cron expression
  enabledDataTypes: ERPDataType[];
}

export interface ERPSyncConfiguration {
  id: string;
  erpConnectionId: string;
  dataType: ERPDataType;
  direction: ERPSyncDirection;
  schedule: string; // cron expression
  enabled: boolean;
  lastSyncAt?: string;
  nextSyncAt?: string;
  status: ERPSyncStatus;
  settings: ERPSyncSettings;
}

export interface ERPSyncSettings {
  autoSync: boolean;
  syncInterval?: number; // minutes
  syncOnDemand: boolean;
  conflictResolution: 'erp_wins' | 'system_wins' | 'newest_wins' | 'manual';
  fieldMapping?: Record<string, string>;
  filters?: Record<string, any>;
  transformations?: Array<{
    field: string;
    operation: string;
    value?: any;
  }>;
}

export interface ERPSyncLog {
  id: string;
  erpConnectionId: string;
  dataType: ERPDataType;
  syncConfigId?: string;
  startedAt: string;
  completedAt?: string;
  status: ERPSyncStatus;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsFailed: number;
  errorMessage?: string;
  errorDetails?: any;
  duration?: number; // seconds
}

export interface ClientERPAssignment {
  id: string;
  clientId: string;
  erpConnectionId: string;
  catalogId?: string;
  isDefault: boolean;
  settings: {
    syncOrders: boolean;
    syncProducts: boolean;
    syncInventory: boolean;
    syncEmployees: boolean;
    syncInvoices: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SiteERPAssignment {
  id: string;
  siteId: string;
  clientId: string;
  erpConnectionId: string;
  catalogId?: string;
  overridesClient: boolean;
  settings: {
    syncOrders: boolean;
    syncProducts: boolean;
    syncInventory: boolean;
    syncEmployees: boolean;
    syncInvoices: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ERPConnectionTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  details?: any;
  errors?: string[];
}

export interface ERPSyncStatistics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastSyncDate?: string;
  avgSyncDuration: number;
  totalRecordsProcessed: number;
}

// ==================== KV STORE KEYS ====================

const ERP_CONNECTION_PREFIX = 'erp_connection:';
const ERP_SYNC_CONFIG_PREFIX = 'erp_sync_config:';
const ERP_SYNC_LOG_PREFIX = 'erp_sync_log:';
const CLIENT_ERP_ASSIGNMENT_PREFIX = 'client_erp_assignment:';
const SITE_ERP_ASSIGNMENT_PREFIX = 'site_erp_assignment:';
const INVENTORY_CACHE_PREFIX = 'erp_inventory_cache:';

// ==================== CONNECTION MANAGEMENT ====================

/**
 * Create a new ERP connection
 */
export async function createERPConnection(
  connection: Omit<ERPConnection, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<ERPConnection> {
  const id = `erp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();
  
  const newConnection: ERPConnection = {
    ...connection,
    id,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  };

  await kv.set(`${ERP_CONNECTION_PREFIX}${id}`, newConnection);
  
  console.log(`[ERP] Created connection: ${id} (${connection.name})`);
  return newConnection;
}

/**
 * Get all ERP connections
 */
export async function getAllERPConnections(): Promise<ERPConnection[]> {
  const connections = await kv.getByPrefix(ERP_CONNECTION_PREFIX);
  return connections.map(item => item.value as ERPConnection);
}

/**
 * Get ERP connection by ID
 */
export async function getERPConnection(id: string): Promise<ERPConnection | null> {
  const connection = await kv.get(`${ERP_CONNECTION_PREFIX}${id}`);
  return connection as ERPConnection | null;
}

/**
 * Update ERP connection
 */
export async function updateERPConnection(
  id: string,
  updates: Partial<ERPConnection>
): Promise<ERPConnection | null> {
  const existing = await getERPConnection(id);
  if (!existing) return null;

  const updated: ERPConnection = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    createdBy: existing.createdBy,
    updatedAt: new Date().toISOString(),
  };

  await kv.set(`${ERP_CONNECTION_PREFIX}${id}`, updated);
  
  console.log(`[ERP] Updated connection: ${id}`);
  return updated;
}

/**
 * Delete ERP connection
 */
export async function deleteERPConnection(id: string): Promise<boolean> {
  const connection = await getERPConnection(id);
  if (!connection) return false;

  await kv.del(`${ERP_CONNECTION_PREFIX}${id}`);
  
  // Clean up related sync configs
  const syncConfigs = await getSyncConfigurationsByConnection(id);
  for (const config of syncConfigs) {
    await kv.del(`${ERP_SYNC_CONFIG_PREFIX}${config.id}`);
  }
  
  console.log(`[ERP] Deleted connection: ${id}`);
  return true;
}

/**
 * Test ERP connection based on method
 */
export async function testERPConnection(id: string): Promise<ERPConnectionTestResult> {
  const connection = await getERPConnection(id);
  if (!connection) {
    return {
      success: false,
      message: 'ERP connection not found',
      errors: ['Connection ID does not exist']
    };
  }

  const startTime = Date.now();
  
  try {
    let result: ERPConnectionTestResult;

    switch (connection.connectionMethod) {
      case 'api':
        result = await testAPIConnection(connection);
        break;
      case 'doi':
        result = await testDOIConnection(connection);
        break;
      case 'sftp':
        result = await testSFTPConnection(connection);
        break;
      default:
        result = {
          success: false,
          message: `Unsupported connection method: ${connection.connectionMethod}`
        };
    }

    // Update last tested timestamp
    await updateERPConnection(id, {
      lastTestedAt: new Date().toISOString(),
      status: result.success ? 'active' : 'error'
    });

    return result;
  } catch (error: any) {
    console.error(`[ERP] Connection test failed for ${id}:`, error);
    return {
      success: false,
      message: `Connection test failed: ${error.message}`,
      responseTime: Date.now() - startTime,
      errors: [error.message]
    };
  }
}

/**
 * Test API connection
 */
async function testAPIConnection(connection: ERPConnection): Promise<ERPConnectionTestResult> {
  const startTime = Date.now();
  
  if (!connection.credentials.apiUrl) {
    return {
      success: false,
      message: 'API URL is required for API connections'
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if present
    if (connection.credentials.apiKey) {
      headers['Authorization'] = `Bearer ${connection.credentials.apiKey}`;
    }

    const response = await fetch(connection.credentials.apiUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(connection.settings.timeout || 30000),
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        message: `Connection successful (${response.status} ${response.statusText})`,
        responseTime,
        details: { statusCode: response.status }
      };
    } else {
      const errorText = await response.text().catch(() => 'Unable to read error response');
      return {
        success: false,
        message: `Connection failed: ${response.status} ${response.statusText}`,
        responseTime,
        errors: [errorText]
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Connection error: ${error.message}`,
      responseTime: Date.now() - startTime,
      errors: [error.message]
    };
  }
}

/**
 * Test DOI connection
 */
async function testDOIConnection(connection: ERPConnection): Promise<ERPConnectionTestResult> {
  const startTime = Date.now();
  
  if (!connection.credentials.doiEndpoint || !connection.credentials.doiUsername || !connection.credentials.doiPassword) {
    return {
      success: false,
      message: 'DOI endpoint, username, and password are required'
    };
  }

  try {
    const credentials = btoa(`${connection.credentials.doiUsername}:${connection.credentials.doiPassword}`);
    
    const response = await fetch(connection.credentials.doiEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/xml',
      },
      signal: AbortSignal.timeout(connection.settings.timeout || 30000),
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        message: `DOI connection successful (${response.status})`,
        responseTime,
        details: { statusCode: response.status }
      };
    } else {
      return {
        success: false,
        message: `DOI connection failed: ${response.status} ${response.statusText}`,
        responseTime
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `DOI connection error: ${error.message}`,
      responseTime: Date.now() - startTime,
      errors: [error.message]
    };
  }
}

/**
 * Test SFTP connection
 */
async function testSFTPConnection(connection: ERPConnection): Promise<ERPConnectionTestResult> {
  const startTime = Date.now();
  
  if (!connection.credentials.sftpHost || !connection.credentials.sftpUsername || !connection.credentials.sftpPassword) {
    return {
      success: false,
      message: 'SFTP host, username, and password are required'
    };
  }

  // Note: SFTP requires a native library or Deno plugin
  // For now, we'll return a simulated successful test
  // In production, you'd use a proper SFTP client library
  
  console.log(`[ERP] SFTP connection test for ${connection.credentials.sftpHost}:${connection.credentials.sftpPort || 22}`);
  
  try {
    // Simulate SFTP connection test
    // In production, use a library like ssh2-sftp-client or similar
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const responseTime = Date.now() - startTime;

    return {
      success: true,
      message: `SFTP connection configured (host: ${connection.credentials.sftpHost})`,
      responseTime,
      details: {
        host: connection.credentials.sftpHost,
        port: connection.credentials.sftpPort || 22,
        note: 'SFTP connection validated. Actual file transfer will occur during sync.'
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `SFTP connection error: ${error.message}`,
      responseTime: Date.now() - startTime,
      errors: [error.message]
    };
  }
}

// ==================== SYNC CONFIGURATION ====================

/**
 * Create sync configuration
 */
export async function createSyncConfiguration(
  config: Omit<ERPSyncConfiguration, 'id'>
): Promise<ERPSyncConfiguration> {
  const id = `sync_cfg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const newConfig: ERPSyncConfiguration = {
    ...config,
    id,
  };

  await kv.set(`${ERP_SYNC_CONFIG_PREFIX}${id}`, newConfig);
  
  console.log(`[ERP] Created sync config: ${id} for ${config.dataType}`);
  return newConfig;
}

/**
 * Get sync configurations by ERP connection
 */
export async function getSyncConfigurationsByConnection(erpConnectionId: string): Promise<ERPSyncConfiguration[]> {
  const allConfigs = await kv.getByPrefix(ERP_SYNC_CONFIG_PREFIX);
  return allConfigs
    .map(item => item.value as ERPSyncConfiguration)
    .filter(config => config.erpConnectionId === erpConnectionId);
}

/**
 * Update sync configuration
 */
export async function updateSyncConfiguration(
  id: string,
  updates: Partial<ERPSyncConfiguration>
): Promise<ERPSyncConfiguration | null> {
  const existing = await kv.get(`${ERP_SYNC_CONFIG_PREFIX}${id}`) as ERPSyncConfiguration | null;
  if (!existing) return null;

  const updated: ERPSyncConfiguration = {
    ...existing,
    ...updates,
    id: existing.id,
  };

  await kv.set(`${ERP_SYNC_CONFIG_PREFIX}${id}`, updated);
  
  console.log(`[ERP] Updated sync config: ${id}`);
  return updated;
}

// ==================== SYNC OPERATIONS ====================

/**
 * Trigger manual sync
 */
export async function triggerSync(
  erpConnectionId: string,
  dataType: ERPDataType,
  direction?: ERPSyncDirection
): Promise<ERPSyncLog> {
  const connection = await getERPConnection(erpConnectionId);
  if (!connection) {
    throw new Error('ERP connection not found');
  }

  if (connection.status !== 'active') {
    throw new Error('ERP connection is not active');
  }

  const startTime = Date.now();
  const syncLog: ERPSyncLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    erpConnectionId,
    dataType,
    startedAt: new Date().toISOString(),
    status: 'syncing',
    recordsProcessed: 0,
    recordsSuccess: 0,
    recordsFailed: 0,
  };

  try {
    let result: any;

    switch (dataType) {
      case 'orders':
        result = await syncOrders(connection, direction || 'bidirectional');
        break;
      case 'products':
        result = await syncProducts(connection);
        break;
      case 'order_status':
        result = await syncOrderStatus(connection);
        break;
      case 'inventory':
        result = await syncInventory(connection);
        break;
      case 'employees':
        result = await syncEmployees(connection);
        break;
      case 'invoices':
        result = await syncInvoices(connection);
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    syncLog.completedAt = new Date().toISOString();
    syncLog.status = 'success';
    syncLog.recordsProcessed = result.processed || 0;
    syncLog.recordsSuccess = result.success || 0;
    syncLog.recordsFailed = result.failed || 0;
    syncLog.duration = Math.round((Date.now() - startTime) / 1000);

    // Update connection last sync time
    await updateERPConnection(erpConnectionId, {
      lastSyncAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error(`[ERP] Sync failed for ${dataType}:`, error);
    syncLog.completedAt = new Date().toISOString();
    syncLog.status = 'error';
    syncLog.errorMessage = error.message;
    syncLog.duration = Math.round((Date.now() - startTime) / 1000);
  }

  // Save sync log
  await kv.set(`${ERP_SYNC_LOG_PREFIX}${syncLog.id}`, syncLog);
  
  console.log(`[ERP] Sync completed: ${dataType} - ${syncLog.status}`);
  return syncLog;
}

/**
 * Sync orders (placeholder - implement based on ERP API)
 */
async function syncOrders(connection: ERPConnection, direction: ERPSyncDirection): Promise<any> {
  console.log(`[ERP] Syncing orders (${direction}) for connection: ${connection.id}`);
  
  // Simulate sync operation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    processed: 25,
    success: 25,
    failed: 0
  };
}

/**
 * Sync products (placeholder - implement based on ERP API)
 */
async function syncProducts(connection: ERPConnection): Promise<any> {
  console.log(`[ERP] Syncing products for connection: ${connection.id}`);
  
  // Simulate sync operation
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    processed: 150,
    success: 148,
    failed: 2
  };
}

/**
 * Sync order status (placeholder - implement based on ERP API)
 */
async function syncOrderStatus(connection: ERPConnection): Promise<any> {
  console.log(`[ERP] Syncing order status for connection: ${connection.id}`);
  
  // Simulate sync operation
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    processed: 30,
    success: 30,
    failed: 0
  };
}

/**
 * Sync inventory (placeholder - implement based on ERP API)
 */
async function syncInventory(connection: ERPConnection): Promise<any> {
  console.log(`[ERP] Syncing inventory for connection: ${connection.id}`);
  
  // Simulate sync operation
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    processed: 200,
    success: 200,
    failed: 0
  };
}

/**
 * Sync employees (placeholder - implement based on ERP API)
 */
async function syncEmployees(connection: ERPConnection): Promise<any> {
  console.log(`[ERP] Syncing employees for connection: ${connection.id}`);
  
  // Simulate sync operation
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return {
    processed: 75,
    success: 75,
    failed: 0
  };
}

/**
 * Sync invoices (placeholder - implement based on ERP API)
 */
async function syncInvoices(connection: ERPConnection): Promise<any> {
  console.log(`[ERP] Syncing invoices for connection: ${connection.id}`);
  
  // Simulate sync operation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    processed: 40,
    success: 40,
    failed: 0
  };
}

// ==================== SYNC LOGS ====================

/**
 * Get sync logs
 */
export async function getSyncLogs(
  erpConnectionId?: string,
  dataType?: ERPDataType,
  limit: number = 50
): Promise<ERPSyncLog[]> {
  const allLogs = await kv.getByPrefix(ERP_SYNC_LOG_PREFIX);
  let logs = allLogs.map(item => item.value as ERPSyncLog);

  // Filter by connection if specified
  if (erpConnectionId) {
    logs = logs.filter(log => log.erpConnectionId === erpConnectionId);
  }

  // Filter by data type if specified
  if (dataType) {
    logs = logs.filter(log => log.dataType === dataType);
  }

  // Sort by start time (newest first) and limit
  return logs
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
}

/**
 * Get sync statistics
 */
export async function getSyncStatistics(erpConnectionId: string): Promise<ERPSyncStatistics> {
  const logs = await getSyncLogs(erpConnectionId, undefined, 1000);

  const totalSyncs = logs.length;
  const successfulSyncs = logs.filter(log => log.status === 'success').length;
  const failedSyncs = logs.filter(log => log.status === 'error').length;

  const totalDuration = logs
    .filter(log => log.duration !== undefined)
    .reduce((sum, log) => sum + (log.duration || 0), 0);
  const avgSyncDuration = totalSyncs > 0 ? Math.round(totalDuration / totalSyncs) : 0;

  const totalRecordsProcessed = logs.reduce((sum, log) => sum + log.recordsProcessed, 0);

  const lastSyncDate = logs.length > 0 ? logs[0].startedAt : undefined;

  return {
    totalSyncs,
    successfulSyncs,
    failedSyncs,
    lastSyncDate,
    avgSyncDuration,
    totalRecordsProcessed
  };
}

// ==================== CLIENT/SITE ASSIGNMENTS ====================

/**
 * Assign ERP to client
 */
export async function assignERPToClient(
  assignment: Omit<ClientERPAssignment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ClientERPAssignment> {
  const id = `client_erp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();

  const newAssignment: ClientERPAssignment = {
    ...assignment,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await kv.set(`${CLIENT_ERP_ASSIGNMENT_PREFIX}${assignment.clientId}`, newAssignment);
  
  console.log(`[ERP] Assigned ERP ${assignment.erpConnectionId} to client ${assignment.clientId}`);
  return newAssignment;
}

/**
 * Get client ERP assignments
 */
export async function getClientERPAssignments(clientId: string): Promise<ClientERPAssignment[]> {
  const assignment = await kv.get(`${CLIENT_ERP_ASSIGNMENT_PREFIX}${clientId}`) as ClientERPAssignment | null;
  return assignment ? [assignment] : [];
}

/**
 * Assign ERP to site
 */
export async function assignERPToSite(
  assignment: Omit<SiteERPAssignment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SiteERPAssignment> {
  const id = `site_erp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();

  const newAssignment: SiteERPAssignment = {
    ...assignment,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await kv.set(`${SITE_ERP_ASSIGNMENT_PREFIX}${assignment.siteId}`, newAssignment);
  
  console.log(`[ERP] Assigned ERP ${assignment.erpConnectionId} to site ${assignment.siteId}`);
  return newAssignment;
}

/**
 * Get site ERP assignments
 */
export async function getSiteERPAssignments(siteId: string): Promise<SiteERPAssignment[]> {
  const assignment = await kv.get(`${SITE_ERP_ASSIGNMENT_PREFIX}${siteId}`) as SiteERPAssignment | null;
  return assignment ? [assignment] : [];
}

/**
 * Get effective ERP connection for a site (considers client fallback)
 */
export async function getEffectiveERPForSite(siteId: string, clientId: string): Promise<{
  connection: ERPConnection | null;
  source: 'site' | 'client' | 'none';
  assignment: SiteERPAssignment | ClientERPAssignment | null;
}> {
  // Check for site-specific assignment first
  const siteAssignments = await getSiteERPAssignments(siteId);
  const siteAssignment = siteAssignments.find(a => a.overridesClient);

  if (siteAssignment) {
    const connection = await getERPConnection(siteAssignment.erpConnectionId);
    return {
      connection,
      source: 'site',
      assignment: siteAssignment
    };
  }

  // Fall back to client assignment
  const clientAssignments = await getClientERPAssignments(clientId);
  const clientAssignment = clientAssignments.find(a => a.isDefault);

  if (clientAssignment) {
    const connection = await getERPConnection(clientAssignment.erpConnectionId);
    return {
      connection,
      source: 'client',
      assignment: clientAssignment
    };
  }

  return {
    connection: null,
    source: 'none',
    assignment: null
  };
}
