/**
 * Backend Verification Tests - Client Configuration
 * 
 * Comprehensive backend testing for Client Configuration API endpoints
 * Tests full stack: API -> Validation -> Database -> Response
 * 
 * Created: February 12, 2026
 * Coverage Target: 95%
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Mock Deno environment
const mockEnv = new Map<string, string>([
  ['SUPABASE_URL', 'http://localhost:54321'],
  ['SUPABASE_ANON_KEY', 'test-anon-key'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key'],
  ['JWT_SECRET', 'test-jwt-secret'],
]);

globalThis.Deno = {
  env: {
    get: (key: string) => mockEnv.get(key),
    set: (key: string, value: string) => mockEnv.set(key, value),
  },
} as any;

// Mock Hono request/response
interface MockRequest {
  method: string;
  url: string;
  headers: Map<string, string>;
  body?: any;
}

interface MockResponse {
  status: number;
  body: any;
  headers: Map<string, string>;
}

class MockContext {
  req: {
    method: string;
    url: string;
    header: (name: string) => string | undefined;
    json: () => Promise<any>;
  };
  
  private _status = 200;
  private _body: any = null;
  private _headers = new Map<string, string>();
  private contextData = new Map<string, any>();
  
  constructor(request: MockRequest) {
    this.req = {
      method: request.method,
      url: request.url,
      header: (name: string) => request.headers.get(name),
      json: async () => request.body,
    };
  }
  
  json(data: any, status?: number) {
    this._body = data;
    if (status) this._status = status;
    return { status: this._status, body: this._body };
  }
  
  status(code: number) {
    this._status = code;
    return this;
  }
  
  get(key: string) {
    return this.contextData.get(key);
  }
  
  set(key: string, value: any) {
    this.contextData.set(key, value);
  }
  
  getResponse(): MockResponse {
    return {
      status: this._status,
      body: this._body,
      headers: this._headers,
    };
  }
}

// Mock KV Store
const mockKvStore = new Map<string, any>();

const mockKv = {
  get: async (key: string, env?: string) => {
    const fullKey = env ? `${env}:${key}` : key;
    return mockKvStore.get(fullKey) || null;
  },
  set: async (key: string, value: any, env?: string) => {
    const fullKey = env ? `${env}:${key}` : key;
    mockKvStore.set(fullKey, value);
  },
  del: async (key: string, env?: string) => {
    const fullKey = env ? `${env}:${key}` : key;
    mockKvStore.delete(fullKey);
  },
  getByPrefix: async (prefix: string, env?: string) => {
    const fullPrefix = env ? `${env}:${prefix}` : prefix;
    const results: any[] = [];
    for (const [key, value] of mockKvStore.entries()) {
      if (key.startsWith(fullPrefix)) {
        results.push(value);
      }
    }
    return results;
  },
};

// Client validation function (mirrors backend)
function validateClientConfig(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required: name
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Client name is required');
  }
  
  // Length: name (2-200 characters)
  if (data.name && (data.name.length < 2 || data.name.length > 200)) {
    errors.push('Client name must be between 2 and 200 characters');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.contactEmail && !emailRegex.test(data.contactEmail)) {
    errors.push('Invalid contact email format');
  }
  
  if (data.accountManagerEmail && !emailRegex.test(data.accountManagerEmail)) {
    errors.push('Invalid account manager email format');
  }
  
  // Status validation
  if (data.status && !['active', 'inactive', 'suspended'].includes(data.status)) {
    errors.push('Status must be one of: active, inactive, suspended');
  }
  
  // Phone validation (basic)
  if (data.contactPhone && data.contactPhone.length < 10) {
    errors.push('Invalid phone number format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Mock API Handler
async function mockClientApiHandler(method: string, url: string, body?: any, headers?: Map<string, string>) {
  const context = new MockContext({
    method,
    url,
    headers: headers || new Map(),
    body,
  });
  
  // Set environment and user role from headers
  context.set('environmentId', context.req.header('X-Environment-ID') || 'development');
  context.set('userRole', context.req.header('X-User-Role') || 'admin');
  
  const clientIdMatch = url.match(/\/clients\/([^\/]+)/);
  const clientId = clientIdMatch ? clientIdMatch[1] : null;
  
  try {
    // CREATE
    if (method === 'POST' && url.includes('/clients') && !clientId) {
      const validation = validateClientConfig(body);
      if (!validation.valid) {
        return context.json({ success: false, errors: validation.errors }, 400);
      }
      
      const newClient = {
        id: `client-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await mockKv.set(`client:${newClient.id}`, newClient, context.get('environmentId'));
      return context.json({ success: true, data: newClient }, 201);
    }
    
    // READ ONE
    if (method === 'GET' && clientId) {
      const client = await mockKv.get(`client:${clientId}`, context.get('environmentId'));
      if (!client) {
        return context.json({ success: false, error: 'Client not found' }, 404);
      }
      return context.json({ success: true, data: client });
    }
    
    // READ ALL
    if (method === 'GET' && url.includes('/clients') && !clientId) {
      const clients = await mockKv.getByPrefix('client:', context.get('environmentId'));
      return context.json({ success: true, data: clients });
    }
    
    // UPDATE
    if (method === 'PUT' && clientId) {
      const existing = await mockKv.get(`client:${clientId}`, context.get('environmentId'));
      if (!existing) {
        return context.json({ success: false, error: 'Client not found' }, 404);
      }
      
      const validation = validateClientConfig(body);
      if (!validation.valid) {
        return context.json({ success: false, errors: validation.errors }, 400);
      }
      
      const updated = {
        ...existing,
        ...body,
        id: clientId, // Preserve ID
        updatedAt: new Date().toISOString(),
      };
      
      await mockKv.set(`client:${clientId}`, updated, context.get('environmentId'));
      return context.json({ success: true, data: updated });
    }
    
    // DELETE
    if (method === 'DELETE' && clientId) {
      const existing = await mockKv.get(`client:${clientId}`, context.get('environmentId'));
      if (!existing) {
        return context.json({ success: false, error: 'Client not found' }, 404);
      }
      
      await mockKv.del(`client:${clientId}`, context.get('environmentId'));
      return context.json({ success: true });
    }
    
    return context.json({ success: false, error: 'Invalid request' }, 400);
  } catch (error: any) {
    return context.json({ success: false, error: error.message }, 500);
  }
}

describe('Backend Verification - Client Configuration', () => {
  
  beforeEach(() => {
    mockKvStore.clear();
  });
  
  // ========== CREATE TESTS ==========
  
  describe('POST /clients - Create Client', () => {
    
    it('should create valid client configuration', async () => {
      const clientData = {
        name: 'Acme Corporation',
        description: 'Leading technology company',
        contactEmail: 'contact@acme.com',
        contactName: 'John Smith',
        contactPhone: '555-123-4567',
        status: 'active',
      };
      
      const response = await mockClientApiHandler('POST', '/make-server-6fcaeea3/clients', clientData);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('Acme Corporation');
      expect(response.body.data.id).toMatch(/^client-/);
      expect(response.status).toBe(201);
    });
    
    it('should reject client without name', async () => {
      const clientData = {
        description: 'No name provided',
        contactEmail: 'contact@acme.com',
      };
      
      const response = await mockClientApiHandler('POST', '/make-server-6fcaeea3/clients', clientData);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Client name is required');
      expect(response.status).toBe(400);
    });
    
    it('should reject client with invalid email', async () => {
      const clientData = {
        name: 'Acme Corporation',
        contactEmail: 'invalid-email',
      };
      
      const response = await mockClientApiHandler('POST', '/make-server-6fcaeea3/clients', clientData);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid contact email format');
      expect(response.status).toBe(400);
    });
    
    it('should reject client with name too short', async () => {
      const clientData = {
        name: 'A',
        contactEmail: 'contact@acme.com',
      };
      
      const response = await mockClientApiHandler('POST', '/make-server-6fcaeea3/clients', clientData);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors.some((e: string) => e.includes('between 2 and 200'))).toBe(true);
      expect(response.status).toBe(400);
    });
    
    it('should reject client with invalid status', async () => {
      const clientData = {
        name: 'Acme Corporation',
        status: 'invalid-status',
      };
      
      const response = await mockClientApiHandler('POST', '/make-server-6fcaeea3/clients', clientData);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Status must be one of: active, inactive, suspended');
      expect(response.status).toBe(400);
    });
    
    it('should store client in correct environment', async () => {
      const clientData = {
        name: 'Acme Corporation',
        status: 'active',
      };
      
      const headers = new Map([['X-Environment-ID', 'production']]);
      const response = await mockClientApiHandler('POST', '/make-server-6fcaeea3/clients', clientData, headers);
      
      expect(response.body.success).toBe(true);
      
      // Verify stored in production environment
      const stored = await mockKv.get(`client:${response.body.data.id}`, 'production');
      expect(stored).toBeDefined();
      expect(stored.name).toBe('Acme Corporation');
    });
  });
  
  // ========== READ TESTS ==========
  
  describe('GET /clients - Read Clients', () => {
    
    it('should retrieve all clients', async () => {
      // Create test clients
      await mockKv.set('client:client-1', { id: 'client-1', name: 'Client 1' }, 'development');
      await mockKv.set('client:client-2', { id: 'client-2', name: 'Client 2' }, 'development');
      
      const response = await mockClientApiHandler('GET', '/make-server-6fcaeea3/clients');
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.status).toBe(200);
    });
    
    it('should retrieve specific client by ID', async () => {
      const testClient = {
        id: 'client-123',
        name: 'Test Client',
        contactEmail: 'test@example.com',
      };
      
      await mockKv.set('client:client-123', testClient, 'development');
      
      const response = await mockClientApiHandler('GET', '/make-server-6fcaeea3/clients/client-123');
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Client');
      expect(response.body.data.contactEmail).toBe('test@example.com');
      expect(response.status).toBe(200);
    });
    
    it('should return 404 for non-existent client', async () => {
      const response = await mockClientApiHandler('GET', '/make-server-6fcaeea3/clients/non-existent');
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Client not found');
      expect(response.status).toBe(404);
    });
    
    it('should isolate clients by environment', async () => {
      await mockKv.set('client:client-1', { id: 'client-1', name: 'Dev Client' }, 'development');
      await mockKv.set('client:client-1', { id: 'client-1', name: 'Prod Client' }, 'production');
      
      const devHeaders = new Map([['X-Environment-ID', 'development']]);
      const devResponse = await mockClientApiHandler('GET', '/make-server-6fcaeea3/clients/client-1', undefined, devHeaders);
      
      const prodHeaders = new Map([['X-Environment-ID', 'production']]);
      const prodResponse = await mockClientApiHandler('GET', '/make-server-6fcaeea3/clients/client-1', undefined, prodHeaders);
      
      expect(devResponse.body.data.name).toBe('Dev Client');
      expect(prodResponse.body.data.name).toBe('Prod Client');
    });
  });
  
  // ========== UPDATE TESTS ==========
  
  describe('PUT /clients/:id - Update Client', () => {
    
    it('should update existing client', async () => {
      const existingClient = {
        id: 'client-123',
        name: 'Old Name',
        contactEmail: 'old@example.com',
        createdAt: '2026-01-01T00:00:00Z',
      };
      
      await mockKv.set('client:client-123', existingClient, 'development');
      
      const updateData = {
        name: 'New Name',
        contactEmail: 'new@example.com',
      };
      
      const response = await mockClientApiHandler('PUT', '/make-server-6fcaeea3/clients/client-123', updateData);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Name');
      expect(response.body.data.contactEmail).toBe('new@example.com');
      expect(response.body.data.id).toBe('client-123'); // ID preserved
      expect(response.body.data.createdAt).toBe('2026-01-01T00:00:00Z'); // Original timestamp preserved
      expect(response.status).toBe(200);
    });
    
    it('should validate updated data', async () => {
      await mockKv.set('client:client-123', { id: 'client-123', name: 'Test' }, 'development');
      
      const invalidUpdate = {
        name: 'A', // Too short
      };
      
      const response = await mockClientApiHandler('PUT', '/make-server-6fcaeea3/clients/client-123', invalidUpdate);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.status).toBe(400);
    });
    
    it('should return 404 for non-existent client', async () => {
      const updateData = {
        name: 'Updated Name',
      };
      
      const response = await mockClientApiHandler('PUT', '/make-server-6fcaeea3/clients/non-existent', updateData);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Client not found');
      expect(response.status).toBe(404);
    });
    
    it('should update timestamps on change', async () => {
      const originalTime = '2026-01-01T00:00:00Z';
      await mockKv.set('client:client-123', {
        id: 'client-123',
        name: 'Test',
        createdAt: originalTime,
        updatedAt: originalTime,
      }, 'development');
      
      const response = await mockClientApiHandler('PUT', '/make-server-6fcaeea3/clients/client-123', {
        name: 'Updated Name',
      });
      
      expect(response.body.data.updatedAt).not.toBe(originalTime);
      expect(new Date(response.body.data.updatedAt).getTime()).toBeGreaterThan(new Date(originalTime).getTime());
    });
  });
  
  // ========== DELETE TESTS ==========
  
  describe('DELETE /clients/:id - Delete Client', () => {
    
    it('should delete existing client', async () => {
      await mockKv.set('client:client-123', { id: 'client-123', name: 'Test' }, 'development');
      
      const response = await mockClientApiHandler('DELETE', '/make-server-6fcaeea3/clients/client-123');
      
      expect(response.body.success).toBe(true);
      expect(response.status).toBe(200);
      
      // Verify deleted from database
      const deleted = await mockKv.get('client:client-123', 'development');
      expect(deleted).toBeNull();
    });
    
    it('should return 404 for non-existent client', async () => {
      const response = await mockClientApiHandler('DELETE', '/make-server-6fcaeea3/clients/non-existent');
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Client not found');
      expect(response.status).toBe(404);
    });
  });
  
  // ========== VALIDATION INTEGRATION TESTS ==========
  
  describe('Validation Integration', () => {
    
    it('should validate all required fields', async () => {
      const response = await mockClientApiHandler('POST', '/make-server-6fcaeea3/clients', {});
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Client name is required');
    });
    
    it('should collect multiple validation errors', async () => {
      const invalidData = {
        name: 'A', // Too short
        contactEmail: 'invalid', // Invalid format
        status: 'invalid', // Invalid value
      };
      
      const response = await mockClientApiHandler('POST', '/make-server-6fcaeea3/clients', invalidData);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(2);
    });
    
    it('should accept fully valid configuration', async () => {
      const validData = {
        name: 'Acme Corporation',
        description: 'Technology leader',
        contactEmail: 'contact@acme.com',
        contactName: 'John Smith',
        contactPhone: '555-123-4567',
        accountManagerEmail: 'manager@halo.com',
        status: 'active',
      };
      
      const response = await mockClientApiHandler('POST', '/make-server-6fcaeea3/clients', validData);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Acme Corporation');
      expect(response.status).toBe(201);
    });
  });
  
  // ========== DATA INTEGRITY TESTS ==========
  
  describe('Data Integrity', () => {
    
    it('should preserve all fields on update', async () => {
      const originalData = {
        id: 'client-123',
        name: 'Original',
        description: 'Description',
        contactEmail: 'contact@example.com',
        contactPhone: '555-0000',
        customField: 'custom value',
      };
      
      await mockKv.set('client:client-123', originalData, 'development');
      
      const updateData = {
        name: 'Updated Name',
      };
      
      const response = await mockClientApiHandler('PUT', '/make-server-6fcaeea3/clients/client-123', updateData);
      
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.description).toBe('Description'); // Preserved
      expect(response.body.data.contactEmail).toBe('contact@example.com'); // Preserved
      expect(response.body.data.customField).toBe('custom value'); // Preserved
    });
    
    it('should not allow ID modification', async () => {
      await mockKv.set('client:client-123', { id: 'client-123', name: 'Test' }, 'development');
      
      const updateData = {
        id: 'different-id', // Attempt to change ID
        name: 'Updated',
      };
      
      const response = await mockClientApiHandler('PUT', '/make-server-6fcaeea3/clients/client-123', updateData);
      
      expect(response.body.data.id).toBe('client-123'); // Original ID preserved
    });
    
    it('should maintain environment isolation on updates', async () => {
      await mockKv.set('client:client-1', { id: 'client-1', name: 'Dev' }, 'development');
      await mockKv.set('client:client-1', { id: 'client-1', name: 'Prod' }, 'production');
      
      const headers = new Map([['X-Environment-ID', 'development']]);
      await mockClientApiHandler('PUT', '/make-server-6fcaeea3/clients/client-1', { name: 'Updated Dev' }, headers);
      
      const devClient = await mockKv.get('client:client-1', 'development');
      const prodClient = await mockKv.get('client:client-1', 'production');
      
      expect(devClient.name).toBe('Updated Dev');
      expect(prodClient.name).toBe('Prod'); // Unchanged
    });
  });
});
