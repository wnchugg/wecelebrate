import * as kv from "./kv_env.ts"; // Use environment-aware KV store
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as giftsApi from "./gifts_api_v2.ts"; // UPDATED: Using database version

// This script seeds the database with demo data
// It should be called once when the server starts

export async function seedDatabase(environmentId: string = 'development') {
  console.log(`Starting database seeding for environment: ${environmentId}...`);

  try {
    // Create Supabase client for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // ==================== SEED ADMIN USER ====================
    console.log('Checking for admin user...');
    
    try {
      // Check if admin user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const adminExists = existingUsers?.users?.some(u => u.email === 'admin@example.com');
      
      if (!adminExists) {
        console.log('Creating default admin user...');
        const { data, error } = await supabase.auth.admin.createUser({
          email: 'admin@example.com',
          password: 'Admin123!',
          user_metadata: { 
            username: 'Admin User',
            role: 'super_admin' 
          },
          email_confirm: true, // Auto-confirm email since we don't have email server
        });

        if (error) {
          console.error('Failed to create admin user:', error);
        } else {
          console.log('✅ Admin user created successfully in Supabase Auth!');
          console.log('   Email: admin@example.com');
          console.log('   Password: Admin123!');
          console.log('   Role: super_admin');
          console.log('   User ID:', data.user.id);
          
          // CRITICAL: Also store admin user in KV store for login to work
          // The login endpoint checks both Supabase Auth AND KV store
          console.log('   Storing admin user in KV store...');
          await kv.set(`admin_users:${data.user.id}`, {
            id: data.user.id,
            username: 'admin',
            email: 'admin@example.com',
            role: 'super_admin',
            createdAt: new Date().toISOString(),
            isBootstrap: true,
          }, environmentId);
          console.log('✅ Admin user stored in KV store!');
        }
      } else {
        console.log('Admin user already exists in Supabase Auth. Skipping...');
        
        // Check if admin exists in KV store, if not add it
        const adminUser = existingUsers?.users?.find(u => u.email === 'admin@example.com');
        if (adminUser) {
          const kvAdminExists = await kv.get(`admin_users:${adminUser.id}`, environmentId);
          if (!kvAdminExists) {
            console.log('Admin user missing from KV store. Adding...');
            await kv.set(`admin_users:${adminUser.id}`, {
              id: adminUser.id,
              username: 'admin',
              email: 'admin@example.com',
              role: 'super_admin',
              createdAt: adminUser.created_at || new Date().toISOString(),
              isBootstrap: true,
            }, environmentId);
            console.log('✅ Admin user added to KV store!');
          }
        }
      }
    } catch (authError) {
      console.error('Error managing admin user:', authError);
      // Continue with data seeding even if auth fails
    }

    // ==================== SEED GIFT CATALOG ====================
    console.log('Initializing gift catalog...');
    try {
      await giftsApi.initializeGiftCatalog(environmentId); // FIXED: Pass environmentId
      console.log('✅ Gift catalog initialized successfully!');
    } catch (giftError) {
      console.error('Error initializing gift catalog:', giftError);
      // Continue with data seeding even if gift init fails
    }

    // ==================== SEED DATA ====================
    // NOTE: We're now using PostgreSQL database for all data storage.
    // KV store seeding is SKIPPED because the reseed endpoint already seeds the database.
    // The /v2/clients and /v2/sites endpoints query the database directly.
    
    console.log('KV store seeding skipped - using PostgreSQL database instead');
    console.log('Data should already be seeded in database by reseed endpoint');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}