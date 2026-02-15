/**
 * Check Current Data Script
 * 
 * This script checks what data currently exists in the KV store
 * without making any changes. Use this before running migration.
 * 
 * Usage:
 *   deno run --allow-net --allow-env check_current_data.ts
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

// Simple KV wrapper for this script
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const kv = {
  async get(key: string): Promise<any> {
    const { data, error } = await supabase
      .from('kv_store_6fcaeea3')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.value;
  }
};

async function checkCurrentData() {
  console.log('='.repeat(80));
  console.log('Current KV Store Data Check');
  console.log('='.repeat(80));
  console.log('');
  
  try {
    // Check clients
    const clientIds: string[] = await kv.get('clients:all') || [];
    console.log(`📊 Clients: ${clientIds.length}`);
    if (clientIds.length > 0) {
      console.log(`   Sample IDs: ${clientIds.slice(0, 3).join(', ')}${clientIds.length > 3 ? '...' : ''}`);
    }
    
    // Check catalogs
    const catalogIds: string[] = await kv.get('catalogs:all') || [];
    console.log(`📊 Catalogs: ${catalogIds.length}`);
    if (catalogIds.length > 0) {
      console.log(`   Sample IDs: ${catalogIds.slice(0, 3).join(', ')}${catalogIds.length > 3 ? '...' : ''}`);
    }
    
    // Check sites
    const siteIds: string[] = await kv.get('sites:all') || [];
    console.log(`📊 Sites: ${siteIds.length}`);
    if (siteIds.length > 0) {
      console.log(`   Sample IDs: ${siteIds.slice(0, 3).join(', ')}${siteIds.length > 3 ? '...' : ''}`);
    }
    
    // Check products/gifts
    const giftIds: string[] = await kv.get('gifts:all') || [];
    console.log(`📊 Products/Gifts: ${giftIds.length}`);
    if (giftIds.length > 0) {
      console.log(`   Sample IDs: ${giftIds.slice(0, 3).join(', ')}${giftIds.length > 3 ? '...' : ''}`);
    }
    
    // Check employees
    const employeeIds: string[] = await kv.get('employees:all') || [];
    console.log(`📊 Employees: ${employeeIds.length}`);
    if (employeeIds.length > 0) {
      console.log(`   Sample IDs: ${employeeIds.slice(0, 3).join(', ')}${employeeIds.length > 3 ? '...' : ''}`);
    }
    
    // Check orders
    const orderIds: string[] = await kv.get('orders:all') || [];
    console.log(`📊 Orders: ${orderIds.length}`);
    if (orderIds.length > 0) {
      console.log(`   Sample IDs: ${orderIds.slice(0, 3).join(', ')}${orderIds.length > 3 ? '...' : ''}`);
    }
    
    console.log('');
    console.log('='.repeat(80));
    console.log(`Total Records: ${clientIds.length + catalogIds.length + siteIds.length + giftIds.length + employeeIds.length + orderIds.length}`);
    console.log('='.repeat(80));
    
    // Sample a client if available
    if (clientIds.length > 0) {
      console.log('\n📋 Sample Client Data:');
      const sampleClient = await kv.get(`client:${clientIds[0]}`);
      console.log(JSON.stringify(sampleClient, null, 2));
    }
    
    // Sample a site if available
    if (siteIds.length > 0) {
      console.log('\n📋 Sample Site Data:');
      const sampleSite = await kv.get(`site:${siteIds[0]}`);
      console.log(JSON.stringify(sampleSite, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await checkCurrentData();
}
