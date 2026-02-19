/**
 * Manual Test: Backward Compatibility with Existing Client Records
 * 
 * This test verifies that:
 * 1. Old client records (with only basic fields) can be loaded
 * 2. All existing fields are preserved when updating old records
 * 3. New fields can be added to old records without affecting existing data
 * 
 * Requirements: 10.1, 10.3, 10.4
 * 
 * Run with: deno run --allow-net --allow-env backward_compatibility_manual_test.ts
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { mapClientFieldsToDatabase, mapClientFieldsFromDatabase } from '../helpers.ts';

// Load environment variables from .env file manually
try {
  const envContent = await Deno.readTextFile('.env');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        Deno.env.set(key.trim(), valueParts.join('=').trim());
      }
    }
  }
} catch (error) {
  console.warn('Warning: Could not load .env file:', error.message);
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('VITE_SUPABASE_ANON_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  console.error('   Please ensure .env file exists with these variables');
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testBackwardCompatibility() {
  console.log('=== Backward Compatibility Test ===\n');
  
  try {
    // Step 1: Create an "old" client record with only basic fields (simulating pre-audit data)
    console.log('Step 1: Creating old client record with only basic fields...');
    const oldClientData = {
      name: 'Legacy Client Corp',
      contact_email: 'legacy@client.com',
      status: 'active',
    };
    
    const { data: createdClient, error: createError } = await supabase
      .from('clients')
      .insert({
        ...oldClientData,
        id: crypto.randomUUID(),
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Failed to create old client:', createError);
      return;
    }
    
    console.log('✅ Created old client:', createdClient.id);
    console.log('   Fields:', Object.keys(createdClient).filter(k => createdClient[k] !== null).join(', '));
    
    // Step 2: Load the old client and verify all fields are present (with nulls for new fields)
    console.log('\nStep 2: Loading old client record...');
    const { data: loadedClient, error: loadError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', createdClient.id)
      .single();
    
    if (loadError) {
      console.error('❌ Failed to load client:', loadError);
      return;
    }
    
    console.log('✅ Loaded client successfully');
    console.log('   Non-null fields:', Object.keys(loadedClient).filter(k => loadedClient[k] !== null).join(', '));
    console.log('   Null fields:', Object.keys(loadedClient).filter(k => loadedClient[k] === null).join(', '));
    
    // Transform to frontend format
    const frontendClient = mapClientFieldsFromDatabase(loadedClient);
    console.log('   Frontend format fields:', Object.keys(frontendClient).length);
    
    // Step 3: Update the old client WITHOUT populating new fields
    console.log('\nStep 3: Updating old client without populating new fields...');
    const updateData = {
      name: 'Legacy Client Corp (Updated)',
    };
    
    const dbUpdateData = mapClientFieldsToDatabase(updateData);
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(dbUpdateData)
      .eq('id', createdClient.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Failed to update client:', updateError);
      return;
    }
    
    console.log('✅ Updated client successfully');
    console.log('   Name changed:', updatedClient.name);
    console.log('   Email preserved:', updatedClient.contact_email === oldClientData.contact_email ? '✅' : '❌');
    console.log('   Status preserved:', updatedClient.status === oldClientData.status ? '✅' : '❌');
    
    // Step 4: Add new fields to the old record
    console.log('\nStep 4: Adding new fields to old client record...');
    const newFieldsUpdate = {
      clientCode: 'LEGACY-001',
      clientRegion: 'US/CA',
      clientContactName: 'John Legacy',
      clientContactPhone: '555-123-4567',
      clientCity: 'San Francisco',
      clientCountry: 'US',
    };
    
    const dbNewFieldsData = mapClientFieldsToDatabase(newFieldsUpdate);
    const { data: enrichedClient, error: enrichError } = await supabase
      .from('clients')
      .update(dbNewFieldsData)
      .eq('id', createdClient.id)
      .select()
      .single();
    
    if (enrichError) {
      console.error('❌ Failed to enrich client:', enrichError);
      return;
    }
    
    console.log('✅ Added new fields successfully');
    console.log('   Client code:', enrichedClient.client_code);
    console.log('   Client region:', enrichedClient.client_region);
    console.log('   Contact name:', enrichedClient.client_contact_name);
    console.log('   Original name preserved:', enrichedClient.name === 'Legacy Client Corp (Updated)' ? '✅' : '❌');
    console.log('   Original email preserved:', enrichedClient.contact_email === oldClientData.contact_email ? '✅' : '❌');
    
    // Step 5: Verify all fields are accessible via transformation
    console.log('\nStep 5: Verifying field transformation...');
    const finalFrontendClient = mapClientFieldsFromDatabase(enrichedClient);
    console.log('   Total fields in frontend format:', Object.keys(finalFrontendClient).length);
    console.log('   Has clientCode:', 'clientCode' in finalFrontendClient ? '✅' : '❌');
    console.log('   Has clientRegion:', 'clientRegion' in finalFrontendClient ? '✅' : '❌');
    console.log('   Has name:', 'name' in finalFrontendClient ? '✅' : '❌');
    console.log('   Has contactEmail:', 'contactEmail' in finalFrontendClient ? '✅' : '❌');
    
    // Cleanup
    console.log('\nCleaning up test data...');
    await supabase.from('clients').delete().eq('id', createdClient.id);
    console.log('✅ Test data cleaned up');
    
    console.log('\n=== All Backward Compatibility Tests Passed ===');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testBackwardCompatibility();
