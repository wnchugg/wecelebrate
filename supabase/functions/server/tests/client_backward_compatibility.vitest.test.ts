/**
 * Unit Tests: Client Backward Compatibility
 * 
 * Tests that verify backward compatibility with existing client records:
 * - Loading old client records (with only basic fields)
 * - Updating old records without populating new fields
 * - Preserving existing fields when adding new ones
 * 
 * Requirements: 10.1, 10.4
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { mapClientFieldsToDatabase, mapClientFieldsFromDatabase } from '../helpers.ts';
import { randomUUID } from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

describe('Client Backward Compatibility', () => {
  let testClientId: string;

  beforeAll(async () => {
    // Create a test client with only basic fields (simulating old record)
    const { data, error } = await supabase
      .from('clients')
      .insert({
        id: randomUUID(),
        name: 'Test Legacy Client',
        contact_email: 'legacy@test.com',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    testClientId = data.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testClientId) {
      await supabase.from('clients').delete().eq('id', testClientId);
    }
  });

  it('should load old client records with null values for new fields', async () => {
    // Load the old client record
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', testClientId)
      .single();

    expect(error).toBeNull();
    expect(client).toBeDefined();
    
    // Verify basic fields are present
    expect(client.name).toBe('Test Legacy Client');
    expect(client.contact_email).toBe('legacy@test.com');
    expect(client.status).toBe('active');
    
    // Verify new fields are null (backward compatibility)
    expect(client.client_code).toBeNull();
    expect(client.client_region).toBeNull();
    expect(client.client_contact_name).toBeNull();
    expect(client.client_contact_phone).toBeNull();
    expect(client.client_city).toBeNull();
    expect(client.client_country).toBeNull();
  });

  it('should transform old records to frontend format with null handling', async () => {
    // Load the old client record
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', testClientId)
      .single();

    expect(error).toBeNull();
    
    // Transform to frontend format
    const frontendClient = mapClientFieldsFromDatabase(client);
    
    // Verify transformation includes all fields
    expect(frontendClient.name).toBe('Test Legacy Client');
    expect(frontendClient.contactEmail).toBe('legacy@test.com');
    expect(frontendClient.status).toBe('active');
    
    // Verify new fields are present but null/undefined
    expect(frontendClient.clientCode).toBeNull();
    expect(frontendClient.clientRegion).toBeNull();
    expect(frontendClient.clientContactName).toBeNull();
  });

  it('should update old records without populating new fields', async () => {
    // Update only the name field
    const updateData = { name: 'Updated Legacy Client' };
    const dbUpdateData = mapClientFieldsToDatabase(updateData);
    
    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update(dbUpdateData)
      .eq('id', testClientId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(updatedClient).toBeDefined();
    
    // Verify the name was updated
    expect(updatedClient.name).toBe('Updated Legacy Client');
    
    // Verify other basic fields are preserved
    expect(updatedClient.contact_email).toBe('legacy@test.com');
    expect(updatedClient.status).toBe('active');
    
    // Verify new fields remain null
    expect(updatedClient.client_code).toBeNull();
    expect(updatedClient.client_region).toBeNull();
    expect(updatedClient.client_contact_name).toBeNull();
  });

  it('should preserve existing fields when adding new fields to old records', async () => {
    // Add new fields to the old record
    const uniqueCode = `LEGACY-${Date.now()}`;
    const newFieldsUpdate = {
      clientCode: uniqueCode,
      clientRegion: 'US/CA',
      clientContactName: 'John Doe',
      clientContactPhone: '555-1234',
    };
    
    const dbUpdateData = mapClientFieldsToDatabase(newFieldsUpdate);
    
    const { data: enrichedClient, error } = await supabase
      .from('clients')
      .update(dbUpdateData)
      .eq('id', testClientId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(enrichedClient).toBeDefined();
    
    // Verify new fields were added
    expect(enrichedClient.client_code).toBe(uniqueCode);
    expect(enrichedClient.client_region).toBe('US/CA');
    expect(enrichedClient.client_contact_name).toBe('John Doe');
    expect(enrichedClient.client_contact_phone).toBe('555-1234');
    
    // Verify original fields are preserved
    expect(enrichedClient.name).toBe('Updated Legacy Client');
    expect(enrichedClient.contact_email).toBe('legacy@test.com');
    expect(enrichedClient.status).toBe('active');
    
    // Verify other new fields remain null
    expect(enrichedClient.client_city).toBeNull();
    expect(enrichedClient.client_country).toBeNull();
    expect(enrichedClient.client_url).toBeNull();
  });

  it('should handle null values correctly in field transformation', async () => {
    // Create a client with mixed null and non-null values
    const mixedData = {
      name: 'Mixed Client',
      contactEmail: 'mixed@test.com',
      status: 'active',
      clientCode: 'MIX-001',
      clientRegion: null, // Explicitly null
      clientContactName: 'Jane Smith',
      clientContactPhone: null, // Explicitly null
    };
    
    // Transform to database format
    const dbData = mapClientFieldsToDatabase(mixedData);
    
    // Verify null values are preserved
    expect(dbData.name).toBe('Mixed Client');
    expect(dbData.contact_email).toBe('mixed@test.com');
    expect(dbData.client_code).toBe('MIX-001');
    expect(dbData.client_region).toBeNull();
    expect(dbData.client_contact_name).toBe('Jane Smith');
    expect(dbData.client_contact_phone).toBeNull();
    
    // Transform back to frontend format
    const frontendData = mapClientFieldsFromDatabase(dbData);
    
    // Verify round-trip preserves null values
    expect(frontendData.name).toBe('Mixed Client');
    expect(frontendData.contactEmail).toBe('mixed@test.com');
    expect(frontendData.clientCode).toBe('MIX-001');
    expect(frontendData.clientRegion).toBeNull();
    expect(frontendData.clientContactName).toBe('Jane Smith');
    expect(frontendData.clientContactPhone).toBeNull();
  });

  it('should accept null for all optional fields in backend', async () => {
    // Create a client with all optional fields as null
    const minimalClient = {
      id: randomUUID(),
      name: 'Minimal Client',
      contact_email: 'minimal@test.com',
      status: 'active',
      // All other fields are implicitly null
    };
    
    const { data, error } = await supabase
      .from('clients')
      .insert(minimalClient)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe('Minimal Client');
    
    // Cleanup
    await supabase.from('clients').delete().eq('id', data.id);
  });

  it('should display empty inputs for null values in frontend format', async () => {
    // Create a fresh client with null values for this specific test
    const { data: freshClient, error: createError } = await supabase
      .from('clients')
      .insert({
        id: randomUUID(),
        name: 'Null Values Test Client',
        contact_email: 'nulltest@test.com',
        status: 'active',
      })
      .select()
      .single();

    expect(createError).toBeNull();
    
    // Transform to frontend format
    const frontendClient = mapClientFieldsFromDatabase(freshClient);
    
    // Verify null values can be handled by form inputs
    // In the UI, these would be displayed as empty strings using || ''
    const displayValue = frontendClient.clientCity || '';
    expect(displayValue).toBe('');
    
    const displayPhone = frontendClient.clientContactPhone || '';
    expect(displayPhone).toBe('');
    
    // Cleanup
    await supabase.from('clients').delete().eq('id', freshClient.id);
  });
});
