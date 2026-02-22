/**
 * ERP Integration Module
 * Handles connections to multiple ERP systems for order fulfillment,
 * product sync, and inventory management
 */

import * as kv from './kv_store.tsx';

export interface ERPConnection {
  id: string;
  name: string;
  type: 'sap' | 'oracle' | 'netsuite' | 'shopify' | 'magento' | 'woocommerce' | 'custom_api';
  status: 'active' | 'inactive' | 'error';
  config: {
    apiUrl: string;
    apiKey?: string;
    username?: string;
    clientId?: string;
    authType: 'api_key' | 'oauth' | 'basic' | 'bearer';
    customHeaders?: Record<string, string>;
  };
  syncSettings: {
    autoSyncOrders: boolean;
    autoSyncProducts: boolean;
    autoSyncInventory: boolean;
    syncInterval: number; // in minutes
    lastSync?: string; // ISO timestamp
  };
  mapping: {
    orderFields: Record<string, string>; // our field -> ERP field
    productFields: Record<string, string>;
    inventoryFields: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedSites?: string[]; // Site IDs that use this ERP
}

export interface SyncLog {
  id: string;
  erpConnectionId: string;
  type: 'order' | 'product' | 'inventory';
  status: 'success' | 'failed' | 'partial';
  recordsProcessed: number;
  recordsFailed: number;
  startedAt: string;
  completedAt: string;
  errors?: Array<{ record: string; error: string }>;
}

export interface OrderSyncPayload {
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderDate: string;
  specialInstructions?: string;
}

export interface ProductSyncPayload {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  attributes?: Record<string, any>;
}

export interface InventoryUpdate {
  sku: string;
  quantity: number;
  location?: string;
  lastUpdated: string;
}

// KV Store Keys
const ERP_CONNECTION_PREFIX = 'erp_connection:';
const SYNC_LOG_PREFIX = 'sync_log:';
const INVENTORY_CACHE_PREFIX = 'inventory_cache:';

/**
 * Create a new ERP connection
 */
export async function createERPConnection(connection: Omit<ERPConnection, 'id' | 'createdAt' | 'updatedAt'>): Promise<ERPConnection> {
  const id = `erp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();
  
  const newConnection: ERPConnection = {
    ...connection,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await kv.set(`${ERP_CONNECTION_PREFIX}${id}`, newConnection);
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
export async function updateERPConnection(id: string, updates: Partial<ERPConnection>): Promise<ERPConnection | null> {
  const existing = await getERPConnection(id);
  if (!existing) return null;

  const updated: ERPConnection = {
    ...existing,
    ...updates,
    id: existing.id, // Ensure ID doesn't change
    createdAt: existing.createdAt, // Preserve creation date
    updatedAt: new Date().toISOString(),
  };

  await kv.set(`${ERP_CONNECTION_PREFIX}${id}`, updated);
  return updated;
}

/**
 * Delete ERP connection
 */
export async function deleteERPConnection(id: string): Promise<boolean> {
  await kv.del(`${ERP_CONNECTION_PREFIX}${id}`);
  return true;
}

/**
 * Test ERP connection
 */
export async function testERPConnection(connection: ERPConnection): Promise<{ success: boolean; message: string; responseTime?: number }> {
  const startTime = Date.now();
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(connection.config.customHeaders || {}),
    };

    // Add authentication based on type
    switch (connection.config.authType) {
      case 'api_key':
        headers['X-API-Key'] = connection.config.apiKey || '';
        break;
      case 'bearer':
        headers['Authorization'] = `Bearer ${connection.config.apiKey || ''}`;
        break;
      case 'basic':
        const credentials = btoa(`${connection.config.username}:${connection.config.apiKey}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
    }

    // Try to make a simple GET request to test connectivity
    const response = await fetch(connection.config.apiUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        message: `Connection successful (${response.status} ${response.statusText})`,
        responseTime,
      };
    } else {
      return {
        success: false,
        message: `Connection failed: ${response.status} ${response.statusText}`,
        responseTime,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Connection error: ${error.message}`,
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Sync order to ERP system
 */
export async function syncOrderToERP(erpConnectionId: string, order: OrderSyncPayload): Promise<{ success: boolean; erpOrderId?: string; error?: string }> {
  const connection = await getERPConnection(erpConnectionId);
  if (!connection) {
    return { success: false, error: 'ERP connection not found' };
  }

  if (connection.status !== 'active') {
    return { success: false, error: 'ERP connection is not active' };
  }

  try {
    // Map order fields according to ERP mapping
    const mappedOrder = mapFields(order, connection.mapping.orderFields);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(connection.config.customHeaders || {}),
    };

    // Add authentication
    switch (connection.config.authType) {
      case 'api_key':
        headers['X-API-Key'] = connection.config.apiKey || '';
        break;
      case 'bearer':
        headers['Authorization'] = `Bearer ${connection.config.apiKey || ''}`;
        break;
      case 'basic':
        const credentials = btoa(`${connection.config.username}:${connection.config.apiKey}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
    }

    // Send order to ERP
    const response = await fetch(`${connection.config.apiUrl}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(mappedOrder),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (response.ok) {
      const result = await response.json();
      
      // Update last sync time
      await updateERPConnection(erpConnectionId, {
        syncSettings: {
          ...connection.syncSettings,
          lastSync: new Date().toISOString(),
        },
      });

      return {
        success: true,
        erpOrderId: result.orderId || result.id || 'unknown',
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        error: `ERP API error: ${response.status} - ${errorText}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to sync order: ${error.message}`,
    };
  }
}

/**
 * Sync products from ERP system
 */
export async function syncProductsFromERP(erpConnectionId: string): Promise<{ success: boolean; products?: ProductSyncPayload[]; error?: string }> {
  const connection = await getERPConnection(erpConnectionId);
  if (!connection) {
    return { success: false, error: 'ERP connection not found' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(connection.config.customHeaders || {}),
    };

    // Add authentication
    switch (connection.config.authType) {
      case 'api_key':
        headers['X-API-Key'] = connection.config.apiKey || '';
        break;
      case 'bearer':
        headers['Authorization'] = `Bearer ${connection.config.apiKey || ''}`;
        break;
      case 'basic':
        const credentials = btoa(`${connection.config.username}:${connection.config.apiKey}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
    }

    const response = await fetch(`${connection.config.apiUrl}/products`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (response.ok) {
      const erpProducts = await response.json();
      
      // Map products from ERP format to our format
      const products: ProductSyncPayload[] = Array.isArray(erpProducts) 
        ? erpProducts.map(p => reverseMapFields(p, connection.mapping.productFields))
        : [];

      // Update last sync time
      await updateERPConnection(erpConnectionId, {
        syncSettings: {
          ...connection.syncSettings,
          lastSync: new Date().toISOString(),
        },
      });

      // Log sync
      await createSyncLog({
        erpConnectionId,
        type: 'product',
        status: 'success',
        recordsProcessed: products.length,
        recordsFailed: 0,
      });

      return { success: true, products };
    } else {
      return {
        success: false,
        error: `Failed to fetch products: ${response.status} ${response.statusText}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to sync products: ${error.message}`,
    };
  }
}

/**
 * Sync inventory from ERP system
 */
export async function syncInventoryFromERP(erpConnectionId: string): Promise<{ success: boolean; inventory?: InventoryUpdate[]; error?: string }> {
  const connection = await getERPConnection(erpConnectionId);
  if (!connection) {
    return { success: false, error: 'ERP connection not found' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(connection.config.customHeaders || {}),
    };

    // Add authentication
    switch (connection.config.authType) {
      case 'api_key':
        headers['X-API-Key'] = connection.config.apiKey || '';
        break;
      case 'bearer':
        headers['Authorization'] = `Bearer ${connection.config.apiKey || ''}`; break;
      case 'basic':
        const credentials = btoa(`${connection.config.username}:${connection.config.apiKey}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
    }

    const response = await fetch(`${connection.config.apiUrl}/inventory`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (response.ok) {
      const erpInventory = await response.json();
      
      // Map inventory from ERP format to our format
      const inventory: InventoryUpdate[] = Array.isArray(erpInventory)
        ? erpInventory.map(i => reverseMapFields(i, connection.mapping.inventoryFields))
        : [];

      // Cache inventory data
      for (const item of inventory) {
        await kv.set(`${INVENTORY_CACHE_PREFIX}${item.sku}`, item);
      }

      // Update last sync time
      await updateERPConnection(erpConnectionId, {
        syncSettings: {
          ...connection.syncSettings,
          lastSync: new Date().toISOString(),
        },
      });

      // Log sync
      await createSyncLog({
        erpConnectionId,
        type: 'inventory',
        status: 'success',
        recordsProcessed: inventory.length,
        recordsFailed: 0,
      });

      return { success: true, inventory };
    } else {
      return {
        success: false,
        error: `Failed to fetch inventory: ${response.status} ${response.statusText}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to sync inventory: ${error.message}`,
    };
  }
}

/**
 * Get cached inventory for a SKU
 */
export async function getCachedInventory(sku: string): Promise<InventoryUpdate | null> {
  const inventory = await kv.get(`${INVENTORY_CACHE_PREFIX}${sku}`);
  return inventory as InventoryUpdate | null;
}

/**
 * Create sync log entry
 */
async function createSyncLog(log: Omit<SyncLog, 'id' | 'startedAt' | 'completedAt'>): Promise<SyncLog> {
  const id = `sync_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();
  
  const syncLog: SyncLog = {
    ...log,
    id,
    startedAt: now,
    completedAt: now,
  };

  await kv.set(`${SYNC_LOG_PREFIX}${id}`, syncLog);
  return syncLog;
}

/**
 * Get sync logs for an ERP connection
 */
export async function getSyncLogs(erpConnectionId: string, limit: number = 50): Promise<SyncLog[]> {
  const allLogs = await kv.getByPrefix(SYNC_LOG_PREFIX);
  return allLogs
    .map(item => item.value as SyncLog)
    .filter(log => log.erpConnectionId === erpConnectionId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
}

/**
 * Helper: Map fields from our format to ERP format
 */
function mapFields(source: Record<string, unknown>, mapping: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [ourField, erpField] of Object.entries(mapping)) {
    const value = getNestedValue(source, ourField);
    if (value !== undefined) {
      setNestedValue(result, erpField, value);
    }
  }
  
  return result;
}

/**
 * Helper: Map fields from ERP format to our format (reverse mapping)
 */
function reverseMapFields(source: Record<string, unknown>, mapping: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [ourField, erpField] of Object.entries(mapping)) {
    const value = getNestedValue(source, erpField);
    if (value !== undefined) {
      setNestedValue(result, ourField, value);
    }
  }
  
  return result;
}

/**
 * Helper: Get nested object value by path
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Helper: Set nested object value by path
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  
  let current = obj;
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}