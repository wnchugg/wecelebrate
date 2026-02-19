/**
 * Property-Based Tests for Client CRUD Operations
 * Feature: client-v2-field-audit
 * 
 * Tests Properties 9, 10, 13, 14, 15 from the design document
 */

import { describe, it, expect, afterAll } from 'vitest';
import fc from 'fast-check';
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

// Import CRUD functions
import { createClient, getClientById, updateClient } from '../crud_db.ts';

// Test database configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = supabaseCreateClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

// Type for client data
interface ClientData {
  name: string;
  contactEmail: string;
  status: 'active' | 'inactive';
  clientCode?: string;
  clientRegion?: string;
  clientSourceCode?: string;
  clientContactName?: string;
  clientContactPhone?: string;
  clientTaxId?: string;
  clientAddressLine1?: string;
  clientAddressLine2?: string;
  clientAddressLine3?: string;
  clientCity?: string;
  clientPostalCode?: string;
  clientCountryState?: string;
  clientCountry?: string;
  clientAccountManager?: string;
  clientAccountManagerEmail?: string;
  clientImplementationManager?: string;
  clientImplementationManagerEmail?: string;
  technologyOwner?: string;
  technologyOwnerEmail?: string;
  clientUrl?: string;
  clientAllowSessionTimeoutExtend?: boolean;
  clientAuthenticationMethod?: string;
  clientCustomUrl?: string;
  clientHasEmployeeData?: boolean;
  clientInvoiceType?: string;
  clientInvoiceTemplateType?: string;
  clientPoType?: string;
  clientPoNumber?: string;
  clientErpSystem?: string;
  clientSso?: string;
  clientHrisSystem?: string;
}

// Arbitraries for generating test data
const emailArbitrary = fc.emailAddress();
const statusArbitrary = fc.constantFrom('active' as const, 'inactive' as const);
const optionalStringArbitrary = fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined });
const optionalBooleanArbitrary = fc.option(fc.boolean(), { nil: undefined });

const clientDataArbitrary = fc.record({
  name: fc.string({ minLength: 2, maxLength: 100 }),
  contactEmail: emailArbitrary,
  status: statusArbitrary,
  clientCode: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
  clientRegion: fc.option(fc.constantFrom('US/CA', 'EMEA', 'APAC', 'LATAM', 'Global'), { nil: undefined }),
  clientSourceCode: optionalStringArbitrary,
  clientContactName: optionalStringArbitrary,
  clientContactPhone: fc.option(fc.string({ minLength: 10, maxLength: 20 }), { nil: undefined }),
  clientTaxId: optionalStringArbitrary,
  clientAddressLine1: optionalStringArbitrary,
  clientAddressLine2: optionalStringArbitrary,
  clientAddressLine3: optionalStringArbitrary,
  clientCity: optionalStringArbitrary,
  clientPostalCode: optionalStringArbitrary,
  clientCountryState: optionalStringArbitrary,
  clientCountry: optionalStringArbitrary,
  clientAccountManager: optionalStringArbitrary,
  clientAccountManagerEmail: fc.option(emailArbitrary, { nil: undefined }),
  clientImplementationManager: optionalStringArbitrary,
  clientImplementationManagerEmail: fc.option(emailArbitrary, { nil: undefined }),
  technologyOwner: optionalStringArbitrary,
  technologyOwnerEmail: fc.option(emailArbitrary, { nil: undefined }),
  clientUrl: fc.option(fc.webUrl(), { nil: undefined }),
  clientAllowSessionTimeoutExtend: optionalBooleanArbitrary,
  clientAuthenticationMethod: fc.option(fc.constantFrom('SSO', 'Basic', 'OAuth'), { nil: undefined }),
  clientCustomUrl: fc.option(fc.webUrl(), { nil: undefined }),
  clientHasEmployeeData: optionalBooleanArbitrary,
  clientInvoiceType: optionalStringArbitrary,
  clientInvoiceTemplateType: optionalStringArbitrary,
  clientPoType: optionalStringArbitrary,
  clientPoNumber: optionalStringArbitrary,
  clientErpSystem: optionalStringArbitrary,
  clientSso: optionalStringArbitrary,
  clientHrisSystem: optionalStringArbitrary,
});

describe('Client CRUD Operations - Property-Based Tests', () => {
  
  // Feature: client-v2-field-audit, Property 9: Create Operation Returns Complete Object
  // Validates: Requirements 6.2, 6.4
  it('Property 9: should return complete client object after creation', async () => {
    await fc.assert(
      fc.asyncProperty(clientDataArbitrary, async (clientData: ClientData) => {
        // Create client
        const result = await createClient(clientData);
        
        // Track for cleanup
        if (result.success && result.data?.id) {
          testClientIds.push(result.data.id);
        }
        
        // Should succeed
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Should include all sent fields
        for (const [key, value] of Object.entries(clientData)) {
          if (value !== undefined) {
            expect(result.data).toHaveProperty(key);
            expect(result.data[key]).toEqual(value);
          }
        }
        
        // Should include system-generated fields
        expect(result.data).toHaveProperty('id');
        expect(result.data).toHaveProperty('createdAt');
        expect(result.data).toHaveProperty('updatedAt');
        expect(typeof result.data.id).toBe('string');
        expect(result.data.id.length).toBeGreaterThan(0);
      }),
      { numRuns: 10 } // Reduced runs for database operations
    );
  });

  // Feature: client-v2-field-audit, Property 10: Required Field Error Handling
  // Validates: Requirements 6.3
  it('Property 10: should return error when required fields are missing', async () => {
    const requiredFields = ['name', 'contactEmail', 'status'];
    
    for (const missingField of requiredFields) {
      await fc.assert(
        fc.asyncProperty(clientDataArbitrary, async (clientData: ClientData) => {
          // Remove the required field
          const incompleteData = { ...clientData };
          delete incompleteData[missingField as keyof ClientData];
          
          // Attempt to create client
          try {
            const result = await createClient(incompleteData as any);
            
            // Should fail or throw error
            if (result.success) {
              // If it somehow succeeded, track for cleanup
              if (result.data?.id) {
                testClientIds.push(result.data.id);
              }
              // This should not happen
              expect(result.success).toBe(false);
            }
          } catch (error: any) {
            // Expected to throw error for missing required field
            expect(error).toBeDefined();
          }
        }),
        { numRuns: 5 } // Reduced runs for error cases
      );
    }
  });

  // Feature: client-v2-field-audit, Property 13: Update Returns Complete Object
  // Validates: Requirements 7.3, 7.4
  it('Property 13: should return complete client object after update', async () => {
    await fc.assert(
      fc.asyncProperty(
        clientDataArbitrary,
        clientDataArbitrary,
        async (initialData: ClientData, updateData: ClientData) => {
          // Create initial client
          const createResult = await createClient(initialData);
          expect(createResult.success).toBe(true);
          const clientId = createResult.data.id;
          testClientIds.push(clientId);
          
          // Update client with partial data (only name and status)
          const partialUpdate = {
            name: updateData.name,
            status: updateData.status,
          };
          
          const updateResult = await updateClient(clientId, partialUpdate);
          
          // Should succeed
          expect(updateResult.success).toBe(true);
          expect(updateResult.data).toBeDefined();
          
          // Should include updated fields
          expect(updateResult.data.name).toBe(updateData.name);
          expect(updateResult.data.status).toBe(updateData.status);
          
          // Should include all other fields from initial data
          expect(updateResult.data.contactEmail).toBe(initialData.contactEmail);
          expect(updateResult.data.id).toBe(clientId);
          
          // Should include system fields
          expect(updateResult.data).toHaveProperty('createdAt');
          expect(updateResult.data).toHaveProperty('updatedAt');
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: client-v2-field-audit, Property 14: Preserve Unchanged Fields
  // Validates: Requirements 7.5, 10.3
  it('Property 14: should preserve unchanged fields during update', async () => {
    await fc.assert(
      fc.asyncProperty(clientDataArbitrary, async (initialData: ClientData) => {
        // Create initial client with all fields
        const createResult = await createClient(initialData);
        expect(createResult.success).toBe(true);
        const clientId = createResult.data.id;
        testClientIds.push(clientId);
        
        // Update only one field
        const updateResult = await updateClient(clientId, {
          name: 'Updated Name',
        });
        
        expect(updateResult.success).toBe(true);
        
        // Name should be updated
        expect(updateResult.data.name).toBe('Updated Name');
        
        // All other fields should remain unchanged
        expect(updateResult.data.contactEmail).toBe(initialData.contactEmail);
        expect(updateResult.data.status).toBe(initialData.status);
        
        // Check optional fields that were set
        if (initialData.clientCode !== undefined) {
          expect(updateResult.data.clientCode).toBe(initialData.clientCode);
        }
        if (initialData.clientRegion !== undefined) {
          expect(updateResult.data.clientRegion).toBe(initialData.clientRegion);
        }
        if (initialData.clientContactName !== undefined) {
          expect(updateResult.data.clientContactName).toBe(initialData.clientContactName);
        }
      }),
      { numRuns: 10 }
    );
  });

  // Feature: client-v2-field-audit, Property 15: Retrieve and Transform All Fields
  // Validates: Requirements 8.1, 8.2
  it('Property 15: should retrieve and transform all fields correctly', async () => {
    await fc.assert(
      fc.asyncProperty(clientDataArbitrary, async (clientData: ClientData) => {
        // Create client
        const createResult = await createClient(clientData);
        expect(createResult.success).toBe(true);
        const clientId = createResult.data.id;
        testClientIds.push(clientId);
        
        // Retrieve client
        const getResult = await getClientById(clientId);
        
        expect(getResult.success).toBe(true);
        expect(getResult.data).toBeDefined();
        
        if (!getResult.data) return;
        
        // All fields should be in camelCase format
        expect(getResult.data).toHaveProperty('id');
        expect(getResult.data).toHaveProperty('name');
        expect(getResult.data).toHaveProperty('contactEmail');
        expect(getResult.data).toHaveProperty('status');
        expect(getResult.data).toHaveProperty('createdAt');
        expect(getResult.data).toHaveProperty('updatedAt');
        
        // Should not have snake_case fields
        expect(getResult.data).not.toHaveProperty('contact_email');
        expect(getResult.data).not.toHaveProperty('created_at');
        expect(getResult.data).not.toHaveProperty('updated_at');
        
        // All original field values should match
        expect(getResult.data.name).toBe(clientData.name);
        expect(getResult.data.contactEmail).toBe(clientData.contactEmail);
        expect(getResult.data.status).toBe(clientData.status);
        
        // Check optional fields
        if (clientData.clientCode !== undefined) {
          expect(getResult.data.clientCode).toBe(clientData.clientCode);
        }
        if (clientData.clientRegion !== undefined) {
          expect(getResult.data.clientRegion).toBe(clientData.clientRegion);
        }
      }),
      { numRuns: 10 }
    );
  });
});
