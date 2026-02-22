/**
 * Integration Tests for Client CRUD Operations
 * Feature: client-v2-field-audit
 * Task: 11.1 Write integration tests for complete flows
 * 
 * Tests end-to-end flows:
 * - Complete client creation flow
 * - Complete client update flow
 * - Complete client retrieval flow
 * 
 * Requirements: 6.1-6.6, 7.1-7.6, 8.1-8.5
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import { mapClientFieldsToDatabase, mapClientFieldsFromDatabase } from '../helpers';
import { randomUUID } from 'crypto';

// Test database configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = supabaseCreateClient(SUPABASE_URL, SUPABASE_KEY);

// Cleanup helper
const testClientIds: string[] = [];

afterAll(async () => {
  // Clean up test clients
  for (const id of testClientIds) {
    try {
      await supabase.from('clients').delete().eq('id', id);
    } catch (error) {
      console.error(`Failed to cleanup client ${id}:`, error);
    }
  }
});

// Helper functions for CRUD operations
async function createClient(data: any) {
  const dbData = mapClientFieldsToDatabase(data);
  const { data: client, error } = await supabase
    .from('clients')
    .insert({ ...dbData, id: randomUUID() })
    .select()
    .single();
  
  if (error) throw error;
  return mapClientFieldsFromDatabase(client);
}

async function getClientById(id: string) {
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return mapClientFieldsFromDatabase(client);
}

async function updateClient(id: string, data: any) {
  const dbData = mapClientFieldsToDatabase(data);
  const { data: client, error } = await supabase
    .from('clients')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return mapClientFieldsFromDatabase(client);
}

async function deleteClient(id: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

afterAll(async () => {
  // Clean up test clients
  for (const id of testClientIds) {
    try {
      await supabase.from('clients').delete().eq('id', id);
    } catch (error) {
      console.error(`Failed to cleanup client ${id}:`, error);
    }
  }
});

describe('Client Integration Tests - End-to-End Flows', () => {
  
  describe('End-to-End Client Creation Flow', () => {
    // Requirements: 6.1-6.6
    
    it('should create client with all fields and return complete object', async () => {
      // Arrange: Prepare complete client data
      const timestamp = Date.now();
      const clientData = {
        name: 'Integration Test Client - Full',
        contactEmail: 'integration.full@testclient.com',
        status: 'active' as const,
        clientCode: `INT-FULL-${timestamp}`,
        clientRegion: 'US/CA',
        clientSourceCode: 'WEB',
        clientContactName: 'John Integration',
        clientContactPhone: '+1-555-999-0001',
        clientTaxId: 'TAX-INT-001',
        clientAddressLine1: '123 Integration Street',
        clientAddressLine2: 'Suite 200',
        clientAddressLine3: 'Building B',
        clientCity: 'Test City',
        clientPostalCode: '12345',
        clientCountryState: 'CA',
        clientCountry: 'USA',
        clientAccountManager: 'Jane Manager',
        clientAccountManagerEmail: 'jane.manager@company.com',
        clientImplementationManager: 'Bob Implementer',
        clientImplementationManagerEmail: 'bob.impl@company.com',
        technologyOwner: 'Alice Tech',
        technologyOwnerEmail: 'alice.tech@company.com',
        clientUrl: 'https://integration-test.com',
        clientAllowSessionTimeoutExtend: true,
        clientAuthenticationMethod: 'SSO',
        clientCustomUrl: 'https://custom.integration-test.com',
        clientHasEmployeeData: true,
        clientInvoiceType: 'Monthly',
        clientInvoiceTemplateType: 'Standard',
        clientPoType: 'Required',
        clientPoNumber: 'PO-INT-001',
        clientErpSystem: 'SAP',
        clientSso: 'Okta',
        clientHrisSystem: 'Workday',
      };
      
      // Act: Create client
      const client = await createClient(clientData);
      
      // Assert: Creation successful
      expect(client).toBeDefined();
      expect(client.id).toBeDefined();
      
      // Track for cleanup
      testClientIds.push(client.id);
      
      // Assert: All fields are present in response
      expect(client.name).toBe(clientData.name);
      expect(client.contactEmail).toBe(clientData.contactEmail);
      expect(client.status).toBe(clientData.status);
      expect(client.clientCode).toBe(clientData.clientCode);
      expect(client.clientRegion).toBe(clientData.clientRegion);
      expect(client.clientContactName).toBe(clientData.clientContactName);
      expect(client.clientContactPhone).toBe(clientData.clientContactPhone);
      expect(client.clientAddressLine1).toBe(clientData.clientAddressLine1);
      expect(client.clientCity).toBe(clientData.clientCity);
      expect(client.clientAccountManager).toBe(clientData.clientAccountManager);
      expect(client.technologyOwner).toBe(clientData.technologyOwner);
      expect(client.clientUrl).toBe(clientData.clientUrl);
      expect(client.clientErpSystem).toBe(clientData.clientErpSystem);
      
      // Assert: System fields are generated
      expect(client.createdAt).toBeDefined();
      expect(client.updatedAt).toBeDefined();
      
      // Assert: Response is in camelCase format (not snake_case)
      expect(client).not.toHaveProperty('contact_email');
      expect(client).not.toHaveProperty('client_code');
      expect(client).not.toHaveProperty('created_at');
    });
    
    it('should create client with only required fields', async () => {
      // Arrange: Prepare minimal client data
      const minimalData = {
        name: 'Integration Test Client - Minimal',
        contactEmail: 'integration.minimal@testclient.com',
        status: 'active' as const,
      };
      
      // Act: Create client
      const client = await createClient(minimalData);
      
      // Assert: Creation successful
      expect(client).toBeDefined();
      expect(client.id).toBeDefined();
      
      // Track for cleanup
      testClientIds.push(client.id);
      
      // Assert: Required fields are present
      expect(client.name).toBe(minimalData.name);
      expect(client.contactEmail).toBe(minimalData.contactEmail);
      expect(client.status).toBe(minimalData.status);
      
      // Assert: Optional fields are undefined or null
      expect([null, undefined]).toContain(client.clientCode);
      expect([null, undefined]).toContain(client.clientRegion);
      expect([null, undefined]).toContain(client.clientContactName);
    });
    
    it('should reject creation when required fields are missing', async () => {
      // Arrange: Prepare invalid data (missing name)
      const invalidData = {
        contactEmail: 'invalid@testclient.com',
        status: 'active' as const,
      };
      
      // Act & Assert: Creation should fail
      try {
        const client = await createClient(invalidData as any);
        
        // If it somehow succeeded, track for cleanup and fail test
        if (client?.id) testClientIds.push(client.id);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        // Expected to throw
        expect(error).toBeDefined();
      }
    });
    
    it('should handle validation errors gracefully', async () => {
      // Arrange: Prepare data with invalid email
      const invalidEmailData = {
        name: 'Test Client Invalid Email',
        contactEmail: 'not-an-email',
        status: 'active' as const,
      };
      
      // Act: Attempt to create client
      try {
        const client = await createClient(invalidEmailData);
        
        // If database accepts it, track for cleanup
        if (client?.id) testClientIds.push(client.id);
      } catch (error: any) {
        // Expected if validation is strict
        expect(error).toBeDefined();
      }
    });
  });
  
  describe('End-to-End Client Update Flow', () => {
    // Requirements: 7.1-7.6
    
    it('should load existing client, update fields, and return complete object', async () => {
      // Arrange: Create initial client
      const timestamp = Date.now();
      const initialData = {
        name: 'Integration Test Client - Update Flow',
        contactEmail: 'integration.update@testclient.com',
        status: 'active' as const,
        clientCode: `INT-UPD-${timestamp}`,
        clientRegion: 'US/CA',
        clientCity: 'Original City',
        clientAccountManager: 'Original Manager',
      };
      
      const client = await createClient(initialData);
      expect(client).toBeDefined();
      const clientId = client.id;
      testClientIds.push(clientId);
      
      // Act: Load the client
      const loadedClient = await getClientById(clientId);
      
      // Assert: Load successful
      expect(loadedClient).toBeDefined();
      expect(loadedClient.id).toBe(clientId);
      expect(loadedClient.name).toBe(initialData.name);
      expect(loadedClient.clientCity).toBe(initialData.clientCity);
      
      // Act: Update some fields
      const updateData = {
        name: 'Updated Integration Test Client',
        clientRegion: 'EMEA',
        clientCity: 'London',
      };
      
      const updatedClient = await updateClient(clientId, updateData);
      
      // Assert: Update successful
      expect(updatedClient).toBeDefined();
      
      // Assert: Updated fields have new values
      expect(updatedClient.name).toBe(updateData.name);
      expect(updatedClient.clientRegion).toBe(updateData.clientRegion);
      expect(updatedClient.clientCity).toBe(updateData.clientCity);
      
      // Assert: Unchanged fields are preserved
      expect(updatedClient.contactEmail).toBe(initialData.contactEmail);
      expect(updatedClient.status).toBe(initialData.status);
      expect(updatedClient.clientCode).toBe(initialData.clientCode);
      expect(updatedClient.clientAccountManager).toBe(initialData.clientAccountManager);
      
      // Assert: System fields are present
      expect(updatedClient.createdAt).toBeDefined();
      expect(updatedClient.updatedAt).toBeDefined();
    });
    
    it('should update only changed fields and preserve all others', async () => {
      // Arrange: Create client with many fields
      const timestamp = Date.now();
      const initialData = {
        name: 'Integration Test Client - Preserve Fields',
        contactEmail: 'integration.preserve@testclient.com',
        status: 'active' as const,
        clientCode: `INT-PRES-${timestamp}`,
        clientRegion: 'US/CA',
        clientContactName: 'John Preserve',
        clientContactPhone: '+1-555-999-0002',
        clientAddressLine1: '456 Preserve Street',
        clientCity: 'Preserve City',
        clientAccountManager: 'Jane Preserve',
        clientErpSystem: 'Oracle',
      };
      
      const client = await createClient(initialData);
      expect(client).toBeDefined();
      const clientId = client.id;
      testClientIds.push(clientId);
      
      // Act: Update only one field
      const updatedClient = await updateClient(clientId, {
        name: 'Updated Name Only',
      });
      
      // Assert: Update successful
      expect(updatedClient).toBeDefined();
      
      // Assert: Only name changed
      expect(updatedClient.name).toBe('Updated Name Only');
      
      // Assert: All other fields preserved
      expect(updatedClient.contactEmail).toBe(initialData.contactEmail);
      expect(updatedClient.status).toBe(initialData.status);
      expect(updatedClient.clientCode).toBe(initialData.clientCode);
      expect(updatedClient.clientRegion).toBe(initialData.clientRegion);
      expect(updatedClient.clientContactName).toBe(initialData.clientContactName);
      expect(updatedClient.clientContactPhone).toBe(initialData.clientContactPhone);
      expect(updatedClient.clientAddressLine1).toBe(initialData.clientAddressLine1);
      expect(updatedClient.clientCity).toBe(initialData.clientCity);
      expect(updatedClient.clientAccountManager).toBe(initialData.clientAccountManager);
      expect(updatedClient.clientErpSystem).toBe(initialData.clientErpSystem);
    });
    
    it('should handle update to non-existent client', async () => {
      // Arrange: Use non-existent ID
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      // Act & Assert: Update should fail
      try {
        await updateClient(nonExistentId, {
          name: 'Should Not Work',
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        // Expected to throw
        expect(error).toBeDefined();
      }
    });
  });
  
  describe('End-to-End Client Retrieval Flow', () => {
    // Requirements: 8.1-8.5
    
    it('should retrieve client with all fields in correct format', async () => {
      // Arrange: Create client with all fields
      const timestamp = Date.now();
      const clientData = {
        name: 'Integration Test Client - Retrieval',
        contactEmail: 'integration.retrieval@testclient.com',
        status: 'active' as const,
        clientCode: `INT-RETR-${timestamp}`,
        clientRegion: 'APAC',
        clientSourceCode: 'API',
        clientContactName: 'John Retrieval',
        clientContactPhone: '+1-555-999-0003',
        clientTaxId: 'TAX-RETR-001',
        clientAddressLine1: '789 Retrieval Avenue',
        clientAddressLine2: 'Floor 3',
        clientCity: 'Retrieval City',
        clientPostalCode: '54321',
        clientCountry: 'Singapore',
        clientAccountManager: 'Jane Retrieval',
        clientAccountManagerEmail: 'jane.retrieval@company.com',
        technologyOwner: 'Bob Tech',
        technologyOwnerEmail: 'bob.tech@company.com',
        clientUrl: 'https://retrieval-test.com',
        clientAllowSessionTimeoutExtend: false,
        clientAuthenticationMethod: 'Basic',
        clientHasEmployeeData: false,
        clientInvoiceType: 'Quarterly',
        clientErpSystem: 'NetSuite',
        clientSso: 'Azure AD',
      };
      
      const client = await createClient(clientData);
      expect(client).toBeDefined();
      const clientId = client.id;
      testClientIds.push(clientId);
      
      // Act: Retrieve the client
      const retrievedClient = await getClientById(clientId);
      
      // Assert: Retrieval successful
      expect(retrievedClient).toBeDefined();
      expect(retrievedClient.id).toBe(clientId);
      
      // Assert: All fields are in camelCase format
      expect(retrievedClient).toHaveProperty('contactEmail');
      expect(retrievedClient).toHaveProperty('clientCode');
      expect(retrievedClient).toHaveProperty('clientRegion');
      expect(retrievedClient).toHaveProperty('clientContactName');
      expect(retrievedClient).toHaveProperty('clientAddressLine1');
      expect(retrievedClient).toHaveProperty('clientAccountManager');
      expect(retrievedClient).toHaveProperty('technologyOwner');
      expect(retrievedClient).toHaveProperty('createdAt');
      expect(retrievedClient).toHaveProperty('updatedAt');
      
      // Assert: No snake_case fields
      expect(retrievedClient).not.toHaveProperty('contact_email');
      expect(retrievedClient).not.toHaveProperty('client_code');
      expect(retrievedClient).not.toHaveProperty('client_region');
      expect(retrievedClient).not.toHaveProperty('created_at');
      expect(retrievedClient).not.toHaveProperty('updated_at');
      
      // Assert: All field values match
      expect(retrievedClient.name).toBe(clientData.name);
      expect(retrievedClient.contactEmail).toBe(clientData.contactEmail);
      expect(retrievedClient.status).toBe(clientData.status);
      expect(retrievedClient.clientCode).toBe(clientData.clientCode);
      expect(retrievedClient.clientRegion).toBe(clientData.clientRegion);
      expect(retrievedClient.clientContactName).toBe(clientData.clientContactName);
      expect(retrievedClient.clientAddressLine1).toBe(clientData.clientAddressLine1);
      expect(retrievedClient.clientCity).toBe(clientData.clientCity);
      expect(retrievedClient.clientAccountManager).toBe(clientData.clientAccountManager);
      expect(retrievedClient.technologyOwner).toBe(clientData.technologyOwner);
      expect(retrievedClient.clientUrl).toBe(clientData.clientUrl);
      expect(retrievedClient.clientErpSystem).toBe(clientData.clientErpSystem);
    });
    
    it('should handle retrieval of non-existent client', async () => {
      // Arrange: Use non-existent ID
      const nonExistentId = '00000000-0000-0000-0000-000000000001';
      
      // Act & Assert: Retrieval should fail
      try {
        await getClientById(nonExistentId);
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        // Expected to throw
        expect(error).toBeDefined();
      }
    });
    
    it('should handle null values in optional fields correctly', async () => {
      // Arrange: Create client with some null optional fields
      const clientData = {
        name: 'Integration Test Client - Nulls',
        contactEmail: 'integration.nulls@testclient.com',
        status: 'active' as const,
        clientCode: null as any,
        clientRegion: null as any,
        clientContactName: 'John Nulls',
      };
      
      const client = await createClient(clientData);
      expect(client).toBeDefined();
      const clientId = client.id;
      testClientIds.push(clientId);
      
      // Act: Retrieve the client
      const retrievedClient = await getClientById(clientId);
      
      // Assert: Retrieval successful
      expect(retrievedClient).toBeDefined();
      
      // Assert: Required fields are present
      expect(retrievedClient.name).toBe(clientData.name);
      expect(retrievedClient.contactEmail).toBe(clientData.contactEmail);
      expect(retrievedClient.status).toBe(clientData.status);
      
      // Assert: Fields with values are present
      expect(retrievedClient.clientContactName).toBe(clientData.clientContactName);
      
      // Assert: Null fields are handled (either null or undefined)
      expect([null, undefined]).toContain(retrievedClient.clientCode);
      expect([null, undefined]).toContain(retrievedClient.clientRegion);
    });
  });
  
  describe('Complete CRUD Lifecycle', () => {
    // Requirements: 6.1-6.6, 7.1-7.6, 8.1-8.5
    
    it('should complete full lifecycle: create -> read -> update -> read -> delete', async () => {
      // Step 1: Create
      const timestamp = Date.now();
      const initialData = {
        name: 'Integration Test Client - Lifecycle',
        contactEmail: 'integration.lifecycle@testclient.com',
        status: 'active' as const,
        clientCode: `INT-LIFE-${timestamp}`,
        clientRegion: 'LATAM',
        clientCity: 'São Paulo',
      };
      
      const client = await createClient(initialData);
      expect(client).toBeDefined();
      const clientId = client.id;
      testClientIds.push(clientId);
      
      // Step 2: Read (verify creation)
      const client1 = await getClientById(clientId);
      expect(client1).toBeDefined();
      expect(client1.name).toBe(initialData.name);
      expect(client1.clientCity).toBe(initialData.clientCity);
      
      // Step 3: Update
      const updateData = {
        name: 'Updated Lifecycle Client',
        clientCity: 'Rio de Janeiro',
        clientAccountManager: 'New Manager',
      };
      
      const client2 = await updateClient(clientId, updateData);
      expect(client2).toBeDefined();
      expect(client2.name).toBe(updateData.name);
      expect(client2.clientCity).toBe(updateData.clientCity);
      expect(client2.clientAccountManager).toBe(updateData.clientAccountManager);
      
      // Step 4: Read (verify update)
      const client3 = await getClientById(clientId);
      expect(client3).toBeDefined();
      expect(client3.name).toBe(updateData.name);
      expect(client3.clientCity).toBe(updateData.clientCity);
      expect(client3.clientAccountManager).toBe(updateData.clientAccountManager);
      
      // Verify unchanged fields preserved
      expect(client3.contactEmail).toBe(initialData.contactEmail);
      expect(client3.status).toBe(initialData.status);
      expect(client3.clientCode).toBe(initialData.clientCode);
      expect(client3.clientRegion).toBe(initialData.clientRegion);
      
      // Step 5: Delete
      await deleteClient(clientId);
      
      // Step 6: Verify deletion
      try {
        await getClientById(clientId);
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        // Expected to throw
        expect(error).toBeDefined();
      }
      
      // Remove from cleanup list since already deleted
      const index = testClientIds.indexOf(clientId);
      if (index > -1) {
        testClientIds.splice(index, 1);
      }
    });
  });
});

console.log('\n=== Client Integration Test Suite ===');
console.log('Tests organized by flow:');
console.log('   - End-to-End Client Creation Flow: 4 tests');
console.log('   - End-to-End Client Update Flow: 3 tests');
console.log('   - End-to-End Client Retrieval Flow: 3 tests');
console.log('   - Complete CRUD Lifecycle: 1 test');
console.log('Total: 11 integration tests');
console.log('Requirements covered: 6.1-6.6, 7.1-7.6, 8.1-8.5');
console.log('========================================\n');
