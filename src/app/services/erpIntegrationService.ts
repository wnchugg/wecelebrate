// ERP Integration Service - handles all ERP connections and data synchronization

export type ERPConnectionMethod = 'doi' | 'api' | 'sftp';
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
  syncConfigId: string;
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

export interface ERPOrder {
  id: string;
  erpOrderId?: string;
  orderNumber: string;
  source: 'system' | 'erp';
  status: string;
  createdAt: string;
  syncedAt?: string;
  syncStatus: 'pending' | 'synced' | 'error';
}

export interface ERPProduct {
  id: string;
  erpProductId: string;
  sku: string;
  name: string;
  price: number;
  inventory?: number;
  lastSyncedAt: string;
}

export interface ERPInventoryUpdate {
  productId: string;
  erpProductId: string;
  sku: string;
  quantity: number;
  lastUpdated: string;
}

export interface ERPEmployee {
  id: string;
  erpEmployeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  hireDate?: string;
  lastSyncedAt: string;
}

export interface ERPInvoice {
  id: string;
  erpInvoiceId: string;
  invoiceNumber: string;
  orderId: string;
  amount: number;
  status: string;
  createdAt: string;
  syncedAt: string;
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

class ERPIntegrationService {
  private baseUrl: string;

  constructor() {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'your-project-id';
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
  }

  // ==================== ERP Connection Management ====================

  /**
   * Get all ERP connections
   */
  async getERPConnections(): Promise<ERPConnection[]> {
    try {
      const response = await fetch(`${this.baseUrl}/erp/connections`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ERP connections');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching ERP connections:', error);
      return this.getMockERPConnections();
    }
  }

  /**
   * Get single ERP connection
   */
  async getERPConnection(connectionId: string): Promise<ERPConnection> {
    try {
      const response = await fetch(`${this.baseUrl}/erp/connections/${connectionId}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ERP connection');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching ERP connection:', error);
      throw error;
    }
  }

  /**
   * Create new ERP connection
   */
  async createERPConnection(connection: Omit<ERPConnection, 'id' | 'createdAt' | 'updatedAt'>): Promise<ERPConnection> {
    try {
      const response = await fetch(`${this.baseUrl}/erp/connections/enhanced`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connection),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create ERP connection');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating ERP connection:', error);
      throw error;
    }
  }

  /**
   * Update ERP connection
   */
  async updateERPConnection(
    connectionId: string,
    updates: Partial<ERPConnection>
  ): Promise<ERPConnection> {
    try {
      const response = await fetch(`${this.baseUrl}/erp/connections/${connectionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update ERP connection');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating ERP connection:', error);
      throw error;
    }
  }

  /**
   * Delete ERP connection
   */
  async deleteERPConnection(connectionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/erp/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete ERP connection');
      }
    } catch (error) {
      console.error('Error deleting ERP connection:', error);
      throw error;
    }
  }

  /**
   * Test ERP connection
   */
  async testERPConnection(connectionId: string): Promise<ERPConnectionTestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/erp/connections/${connectionId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to test ERP connection');
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing ERP connection:', error);
      return {
        success: false,
        message: 'Connection test failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== Sync Configuration Management ====================

  /**
   * Get sync configurations for an ERP connection
   */
  async getSyncConfigurations(erpConnectionId: string): Promise<ERPSyncConfiguration[]> {
    try {
      const response = await fetch(`${this.baseUrl}/erp/connections/${erpConnectionId}/sync-configs`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sync configurations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sync configurations:', error);
      return this.getMockSyncConfigurations();
    }
  }

  /**
   * Create sync configuration
   */
  async createSyncConfiguration(config: Omit<ERPSyncConfiguration, 'id'>): Promise<ERPSyncConfiguration> {
    try {
      const response = await fetch(`${this.baseUrl}/erp/sync-configs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to create sync configuration');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating sync configuration:', error);
      throw error;
    }
  }

  /**
   * Update sync configuration
   */
  async updateSyncConfiguration(
    configId: string,
    updates: Partial<ERPSyncConfiguration>
  ): Promise<ERPSyncConfiguration> {
    try {
      const response = await fetch(`${this.baseUrl}/erp/sync-configs/${configId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update sync configuration');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating sync configuration:', error);
      throw error;
    }
  }

  // ==================== Manual Sync Operations ====================

  /**
   * Trigger manual sync
   */
  async triggerSync(
    erpConnectionId: string,
    dataType: ERPDataType,
    direction?: ERPSyncDirection
  ): Promise<ERPSyncLog> {
    try {
      const response = await fetch(`${this.baseUrl}/erp/connections/${erpConnectionId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataType, direction }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger sync');
      }

      return await response.json();
    } catch (error) {
      console.error('Error triggering sync:', error);
      throw error;
    }
  }

  /**
   * Get sync logs
   */
  async getSyncLogs(
    erpConnectionId?: string,
    dataType?: ERPDataType,
    limit: number = 50
  ): Promise<ERPSyncLog[]> {
    try {
      const params = new URLSearchParams();
      if (erpConnectionId) params.append('erpConnectionId', erpConnectionId);
      if (dataType) params.append('dataType', dataType);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/erp/sync-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sync logs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      return this.getMockSyncLogs();
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics(erpConnectionId: string): Promise<ERPSyncStatistics> {
    try {
      const response = await fetch(`${this.baseUrl}/erp/connections/${erpConnectionId}/statistics`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sync statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sync statistics:', error);
      return {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        avgSyncDuration: 0,
        totalRecordsProcessed: 0
      };
    }
  }

  // ==================== Client/Site ERP Assignments ====================

  /**
   * Get client ERP assignments
   */
  async getClientERPAssignments(clientId: string): Promise<ClientERPAssignment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/clients/${clientId}/erp-assignments`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch client ERP assignments');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching client ERP assignments:', error);
      return [];
    }
  }

  /**
   * Assign ERP to client
   */
  async assignERPToClient(assignment: Omit<ClientERPAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientERPAssignment> {
    try {
      const response = await fetch(`${this.baseUrl}/clients/${assignment.clientId}/erp-assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment),
      });

      if (!response.ok) {
        throw new Error('Failed to assign ERP to client');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning ERP to client:', error);
      throw error;
    }
  }

  /**
   * Get site ERP assignments
   */
  async getSiteERPAssignments(siteId: string): Promise<SiteERPAssignment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sites/${siteId}/erp-assignments`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch site ERP assignments');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching site ERP assignments:', error);
      return [];
    }
  }

  /**
   * Assign ERP to site
   */
  async assignERPToSite(assignment: Omit<SiteERPAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<SiteERPAssignment> {
    try {
      const response = await fetch(`${this.baseUrl}/sites/${assignment.siteId}/erp-assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment),
      });

      if (!response.ok) {
        throw new Error('Failed to assign ERP to site');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning ERP to site:', error);
      throw error;
    }
  }

  // ==================== Mock Data Methods ====================

  private getMockERPConnections(): ERPConnection[] {
    return [
      {
        id: 'erp_001',
        name: 'SAP Production',
        provider: 'SAP',
        connectionMethod: 'api',
        status: 'active',
        credentials: {
          apiUrl: 'https://sap.example.com/api',
          apiKey: '***********'
        },
        settings: {
          timeout: 30000,
          retryAttempts: 3,
          retryDelay: 5000,
          batchSize: 100,
          syncSchedule: '0 */6 * * *',
          enabledDataTypes: ['orders', 'products', 'inventory', 'employees']
        },
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-02-12T08:30:00Z',
        lastSyncAt: '2026-02-12T14:00:00Z'
      },
      {
        id: 'erp_002',
        name: 'NetSuite Integration',
        provider: 'NetSuite',
        connectionMethod: 'doi',
        status: 'active',
        credentials: {
          doiEndpoint: 'https://netsuite.example.com/doi',
          doiUsername: 'api_user'
        },
        settings: {
          timeout: 45000,
          retryAttempts: 2,
          retryDelay: 10000,
          batchSize: 50,
          enabledDataTypes: ['orders', 'invoices']
        },
        createdAt: '2026-01-20T09:00:00Z',
        updatedAt: '2026-02-10T11:15:00Z',
        lastSyncAt: '2026-02-12T12:00:00Z'
      },
      {
        id: 'erp_003',
        name: 'Legacy SFTP System',
        provider: 'Custom',
        connectionMethod: 'sftp',
        status: 'active',
        credentials: {
          sftpHost: 'ftp.example.com',
          sftpPort: 22,
          sftpUsername: 'erp_sync',
          sftpPath: '/data/export'
        },
        settings: {
          timeout: 60000,
          retryAttempts: 3,
          retryDelay: 15000,
          syncSchedule: '0 2 * * *',
          enabledDataTypes: ['products', 'inventory']
        },
        createdAt: '2026-01-10T08:00:00Z',
        updatedAt: '2026-02-11T07:00:00Z',
        lastSyncAt: '2026-02-12T02:00:00Z'
      }
    ];
  }

  private getMockSyncConfigurations(): ERPSyncConfiguration[] {
    return [
      {
        id: 'sync_001',
        erpConnectionId: 'erp_001',
        dataType: 'orders',
        direction: 'bidirectional',
        schedule: '0 */2 * * *',
        enabled: true,
        lastSyncAt: '2026-02-12T14:00:00Z',
        nextSyncAt: '2026-02-12T16:00:00Z',
        status: 'idle',
        settings: {
          autoSync: true,
          syncInterval: 120,
          syncOnDemand: true,
          conflictResolution: 'newest_wins'
        }
      },
      {
        id: 'sync_002',
        erpConnectionId: 'erp_001',
        dataType: 'products',
        direction: 'pull',
        schedule: '0 6 * * *',
        enabled: true,
        lastSyncAt: '2026-02-12T06:00:00Z',
        nextSyncAt: '2026-02-13T06:00:00Z',
        status: 'idle',
        settings: {
          autoSync: true,
          syncInterval: 1440,
          syncOnDemand: true,
          conflictResolution: 'erp_wins'
        }
      }
    ];
  }

  private getMockSyncLogs(): ERPSyncLog[] {
    return [
      {
        id: 'log_001',
        erpConnectionId: 'erp_001',
        dataType: 'orders',
        syncConfigId: 'sync_001',
        startedAt: '2026-02-12T14:00:00Z',
        completedAt: '2026-02-12T14:02:30Z',
        status: 'success',
        recordsProcessed: 156,
        recordsSuccess: 156,
        recordsFailed: 0,
        duration: 150
      },
      {
        id: 'log_002',
        erpConnectionId: 'erp_001',
        dataType: 'products',
        syncConfigId: 'sync_002',
        startedAt: '2026-02-12T06:00:00Z',
        completedAt: '2026-02-12T06:05:15Z',
        status: 'success',
        recordsProcessed: 2450,
        recordsSuccess: 2448,
        recordsFailed: 2,
        errorMessage: '2 products failed validation',
        duration: 315
      }
    ];
  }
}

// Export singleton instance
export const erpIntegrationService = new ERPIntegrationService();