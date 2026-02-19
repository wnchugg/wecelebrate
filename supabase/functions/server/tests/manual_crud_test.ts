/**
 * Manual CRUD Operations Test Script
 * 
 * This script tests the following scenarios:
 * 1. Create a client with all fields
 * 2. Create a client with only required fields
 * 3. Update a client with partial data
 * 4. Load an existing client
 * 
 * Run with: deno run --allow-net --allow-env --no-check manual_crud_test.ts
 */

import { createClient as supabaseCreateClient } from "jsr:@supabase/supabase-js@2";

// Test configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  Deno.exit(1);
}

const supabase = supabaseCreateClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Import helper functions
const { mapClientFieldsToDatabase, mapClientFieldsFromDatabase } = await import('../helpers.ts');

// Test data
const fullClientData = {
  name: 'Test Client Full Fields',
  contactEmail: 'full@testclient.com',
  status: 'active' as const,
  clientCode: 'TEST-FULL-001',
  clientRegion: 'US/CA',
  clientSourceCode: 'WEB',
  clientContactName: 'John Doe',
  clientContactPhone: '+1-555-123-4567',
  clientTaxId: 'TAX123456',
  clientAddressLine1: '123 Main Street',
  clientAddressLine2: 'Suite 100',
  clientAddressLine3: 'Building A',
  clientCity: 'San Francisco',
  clientPostalCode: '94102',
  clientCountryState: 'CA',
  clientCountry: 'USA',
  clientAccountManager: 'Jane Smith',
  clientAccountManagerEmail: 'jane.smith@company.com',
  clientImplementationManager: 'Bob Johnson',
  clientImplementationManagerEmail: 'bob.johnson@company.com',
  technologyOwner: 'Alice Williams',
  technologyOwnerEmail: 'alice.williams@company.com',
  clientUrl: 'https://testclient.com',
  clientAllowSessionTimeoutExtend: true,
  clientAuthenticationMethod: 'SSO',
  clientCustomUrl: 'https://custom.testclient.com',
  clientHasEmployeeData: true,
  clientInvoiceType: 'Monthly',
  clientInvoiceTemplateType: 'Standard',
  clientPoType: 'Required',
  clientPoNumber: 'PO-2024-001',
  clientErpSystem: 'SAP',
  clientSso: 'Okta',
  clientHrisSystem: 'Workday',
};

const minimalClientData = {
  name: 'Test Client Minimal',
  contactEmail: 'minimal@testclient.com',
  status: 'active' as const,
};

// Helper function to create client
async function createClient(data: any) {
  const dbData = mapClientFieldsToDatabase(data);
  
  const { data: client, error } = await supabase
    .from('clients')
    .insert(dbData)
    .select()
    .single();
  
  if (error) throw error;
  
  return mapClientFieldsFromDatabase(client);
}

// Helper function to get client
async function getClient(id: string) {
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return mapClientFieldsFromDatabase(client);
}

// Helper function to update client
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

// Helper function to delete client
async function deleteClient(id: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Test execution
console.log('🧪 Starting Manual CRUD Operations Test\n');

const testClientIds: string[] = [];

try {
  // Test 1: Create client with all fields
  console.log('📝 Test 1: Creating client with all fields...');
  const fullClient = await createClient(fullClientData);
  testClientIds.push(fullClient.id);
  
  console.log('✅ Client created with ID:', fullClient.id);
  console.log('   Name:', fullClient.name);
  console.log('   Email:', fullClient.contactEmail);
  console.log('   Client Code:', fullClient.clientCode);
  console.log('   Region:', fullClient.clientRegion);
  console.log('   Address:', fullClient.clientAddressLine1);
  console.log('   City:', fullClient.clientCity);
  console.log('   Account Manager:', fullClient.clientAccountManager);
  console.log('   Technology Owner:', fullClient.technologyOwner);
  console.log('   ERP System:', fullClient.clientErpSystem);
  console.log('');
  
  // Verify all fields are present
  const missingFields = [];
  for (const [key, value] of Object.entries(fullClientData)) {
    if (fullClient[key] !== value) {
      missingFields.push(key);
    }
  }
  
  if (missingFields.length > 0) {
    console.log('⚠️  Warning: Some fields do not match:', missingFields);
  } else {
    console.log('✅ All fields match the input data');
  }
  console.log('');
  
  // Test 2: Create client with only required fields
  console.log('📝 Test 2: Creating client with only required fields...');
  const minimalClient = await createClient(minimalClientData);
  testClientIds.push(minimalClient.id);
  
  console.log('✅ Client created with ID:', minimalClient.id);
  console.log('   Name:', minimalClient.name);
  console.log('   Email:', minimalClient.contactEmail);
  console.log('   Status:', minimalClient.status);
  console.log('');
  
  // Test 3: Update client with partial data
  console.log('📝 Test 3: Updating client with partial data...');
  const updateData = {
    name: 'Updated Test Client',
    clientRegion: 'EMEA',
    clientCity: 'London',
  };
  
  const updatedClient = await updateClient(fullClient.id, updateData);
  
  console.log('✅ Client updated');
  console.log('   New Name:', updatedClient.name);
  console.log('   New Region:', updatedClient.clientRegion);
  console.log('   New City:', updatedClient.clientCity);
  console.log('');
  
  // Verify unchanged fields are preserved
  if (updatedClient.contactEmail === fullClientData.contactEmail) {
    console.log('✅ Unchanged field preserved: contactEmail');
  } else {
    console.log('❌ Unchanged field NOT preserved: contactEmail');
  }
  
  if (updatedClient.clientCode === fullClientData.clientCode) {
    console.log('✅ Unchanged field preserved: clientCode');
  } else {
    console.log('❌ Unchanged field NOT preserved: clientCode');
  }
  
  if (updatedClient.clientErpSystem === fullClientData.clientErpSystem) {
    console.log('✅ Unchanged field preserved: clientErpSystem');
  } else {
    console.log('❌ Unchanged field NOT preserved: clientErpSystem');
  }
  console.log('');
  
  // Test 4: Load an existing client
  console.log('📝 Test 4: Loading existing client...');
  const loadedClient = await getClient(minimalClient.id);
  
  console.log('✅ Client loaded');
  console.log('   ID:', loadedClient.id);
  console.log('   Name:', loadedClient.name);
  console.log('   Email:', loadedClient.contactEmail);
  console.log('   Status:', loadedClient.status);
  console.log('   Created At:', loadedClient.createdAt);
  console.log('   Updated At:', loadedClient.updatedAt);
  console.log('');
  
  // Verify field transformation
  if (loadedClient.contactEmail && !loadedClient.contact_email) {
    console.log('✅ Field transformation correct: camelCase format');
  } else {
    console.log('❌ Field transformation incorrect: snake_case detected');
  }
  console.log('');
  
  console.log('🎉 All manual tests completed successfully!\n');
  
} catch (error) {
  console.error('❌ Test failed:', error);
} finally {
  // Cleanup
  console.log('🧹 Cleaning up test data...');
  for (const id of testClientIds) {
    try {
      await deleteClient(id);
      console.log('   Deleted client:', id);
    } catch (error) {
      console.error('   Failed to delete client:', id, error);
    }
  }
  console.log('✅ Cleanup complete\n');
}
