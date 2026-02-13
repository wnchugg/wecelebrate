import * as kv from "./kv_env.ts"; // Use environment-aware KV store
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as giftsApi from "./gifts_api.ts";

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
    // Check if data already exists (check both old and new key patterns)
    const existingClientsOld = await kv.getByPrefix('clients:');
    const existingClientsNew = await kv.getByPrefix(`client:${environmentId}:`);
    if ((existingClientsOld && existingClientsOld.length > 0) || (existingClientsNew && existingClientsNew.length > 0)) {
      console.log('Database already seeded. Skipping...');
      return;
    }

    // Seed clients
    const clients = [
      {
        id: 'client-001',
        name: 'TechCorp Inc.',
        description: 'Leading technology corporation with global presence',
        contactEmail: 'admin@techcorp.com',
        contactPhone: '(555) 100-0000',
        address: '123 Tech Street, San Francisco, CA 94102',
        isActive: true,
        createdAt: '2025-12-01T09:00:00Z',
        updatedAt: '2026-02-01T14:30:00Z',
      },
      {
        id: 'client-002',
        name: 'GlobalRetail Group',
        description: 'International retail corporation with multiple brands',
        contactEmail: 'contact@globalretail.com',
        contactPhone: '(555) 200-0000',
        address: '456 Retail Ave, New York, NY 10001',
        isActive: true,
        createdAt: '2025-11-15T10:00:00Z',
        updatedAt: '2026-01-20T11:15:00Z',
      },
      {
        id: 'client-003',
        name: 'HealthCare Services Ltd.',
        description: 'Healthcare provider network across North America',
        contactEmail: 'info@healthcareservices.com',
        contactPhone: '(555) 300-0000',
        isActive: true,
        createdAt: '2025-10-20T08:30:00Z',
        updatedAt: '2026-01-05T16:45:00Z',
      },
      {
        id: 'client-004',
        name: 'EduTech Solutions',
        description: 'Educational technology and learning management systems',
        contactEmail: 'hello@edutech.com',
        contactPhone: '(555) 400-0000',
        isActive: true,
        createdAt: '2026-01-10T11:00:00Z',
        updatedAt: '2026-02-03T09:20:00Z',
      },
    ];

    for (const client of clients) {
      await kv.set(`client:${environmentId}:${client.id}`, client);
    }
    console.log(`Seeded ${clients.length} clients`);

    // Seed sites
    const sites = [
      {
        id: 'site-001',
        name: 'TechCorp US - Employee Gifts 2026',
        clientId: 'client-001',
        domain: 'techcorp-us-gifts.jala.com',
        status: 'active',
        branding: {
          primaryColor: '#D91C81',
          secondaryColor: '#1B2A5E',
          tertiaryColor: '#00B4CC',
        },
        settings: {
          validationMethod: 'email',
          allowQuantitySelection: false,
          showPricing: false,
          giftsPerUser: 1,
          shippingMode: 'employee',
          defaultLanguage: 'en',
          enableLanguageSelector: true,
          defaultCurrency: 'USD',
          allowedCountries: ['US'],
          defaultCountry: 'US',
        },
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-02-01T14:30:00Z',
      },
      {
        id: 'site-002',
        name: 'TechCorp EU - Employee Recognition',
        clientId: 'client-001',
        domain: 'techcorp-eu-recognition.jala.com',
        status: 'active',
        branding: {
          primaryColor: '#D91C81',
          secondaryColor: '#1B2A5E',
          tertiaryColor: '#00B4CC',
        },
        settings: {
          validationMethod: 'email',
          allowQuantitySelection: false,
          showPricing: false,
          giftsPerUser: 1,
          shippingMode: 'employee',
          defaultLanguage: 'en',
          enableLanguageSelector: true,
          defaultCurrency: 'EUR',
          allowedCountries: ['DE', 'FR', 'IT', 'ES', 'GB'],
          defaultCountry: 'DE',
        },
        createdAt: '2026-01-18T12:00:00Z',
        updatedAt: '2026-02-02T10:15:00Z',
      },
      {
        id: 'site-003',
        name: 'TechCorp Asia Pacific',
        clientId: 'client-001',
        domain: 'techcorp-apac.jala.com',
        status: 'active',
        branding: {
          primaryColor: '#FF6B35',
          secondaryColor: '#004E89',
          tertiaryColor: '#1AE5BE',
        },
        settings: {
          validationMethod: 'employeeId',
          allowQuantitySelection: true,
          showPricing: false,
          giftsPerUser: 2,
          shippingMode: 'company',
          defaultShippingAddress: '789 Pacific Tower, Singapore 018956',
          defaultLanguage: 'en',
          enableLanguageSelector: true,
          defaultCurrency: 'SGD',
          allowedCountries: ['SG', 'JP', 'AU', 'HK'],
          defaultCountry: 'SG',
        },
        createdAt: '2026-01-20T09:00:00Z',
        updatedAt: '2026-02-03T11:30:00Z',
      },
      {
        id: 'site-004',
        name: 'GlobalRetail Premium - US',
        clientId: 'client-002',
        domain: 'globalretail-premium-us.jala.com',
        status: 'active',
        branding: {
          primaryColor: '#0066CC',
          secondaryColor: '#003366',
          tertiaryColor: '#FF6600',
        },
        settings: {
          validationMethod: 'employeeId',
          allowQuantitySelection: true,
          showPricing: false,
          giftsPerUser: 3,
          shippingMode: 'company',
          defaultShippingAddress: '123 Corporate Plaza, New York, NY 10001',
          defaultLanguage: 'en',
          enableLanguageSelector: true,
          defaultCurrency: 'USD',
          allowedCountries: ['US'],
          defaultCountry: 'US',
        },
        createdAt: '2025-12-01T09:00:00Z',
        updatedAt: '2026-01-20T11:15:00Z',
      },
      {
        id: 'site-005',
        name: 'GlobalRetail Essentials - Multi-Country',
        clientId: 'client-002',
        domain: 'globalretail-essentials.jala.com',
        status: 'active',
        branding: {
          primaryColor: '#28A745',
          secondaryColor: '#155724',
          tertiaryColor: '#FFC107',
        },
        settings: {
          validationMethod: 'serialCard',
          allowQuantitySelection: false,
          showPricing: false,
          giftsPerUser: 1,
          shippingMode: 'store',
          defaultLanguage: 'en',
          enableLanguageSelector: true,
          defaultCurrency: 'USD',
          allowedCountries: [],
          defaultCountry: 'US',
        },
        createdAt: '2025-12-05T10:30:00Z',
        updatedAt: '2026-01-22T15:00:00Z',
      },
      {
        id: 'site-006',
        name: 'HealthCare Services Recognition',
        clientId: 'client-003',
        domain: 'healthcare-recognition.jala.com',
        status: 'inactive',
        branding: {
          primaryColor: '#00A651',
          secondaryColor: '#005A2B',
          tertiaryColor: '#7AC142',
        },
        settings: {
          validationMethod: 'serialCard',
          allowQuantitySelection: false,
          showPricing: false,
          giftsPerUser: 1,
          shippingMode: 'employee',
          defaultLanguage: 'en',
          enableLanguageSelector: false,
          defaultCurrency: 'USD',
          allowedCountries: ['US', 'CA'],
          defaultCountry: 'US',
        },
        createdAt: '2025-11-10T08:30:00Z',
        updatedAt: '2025-12-15T16:45:00Z',
      },
      {
        id: 'site-007',
        name: 'EduTech - Campus Rewards',
        clientId: 'client-004',
        domain: 'edutech-campus-rewards.jala.com',
        status: 'active',
        branding: {
          primaryColor: '#8B5CF6',
          secondaryColor: '#5B21B6',
          tertiaryColor: '#F59E0B',
        },
        settings: {
          validationMethod: 'magic_link',
          allowQuantitySelection: true,
          showPricing: false,
          giftsPerUser: 2,
          shippingMode: 'employee',
          defaultLanguage: 'en',
          enableLanguageSelector: true,
          defaultCurrency: 'USD',
          allowedCountries: [],
          defaultCountry: 'US',
        },
        createdAt: '2026-01-25T10:00:00Z',
        updatedAt: '2026-02-05T14:00:00Z',
      },
    ];

    for (const site of sites) {
      await kv.set(`site:${environmentId}:${site.id}`, site);
    }
    console.log(`Seeded ${sites.length} sites`);

    // Seed site gift configurations
    const siteConfigs = [
      {
        siteId: 'site-001',
        assignmentStrategy: 'price_levels',
        priceLevels: [
          { id: 'level-1', name: 'Bronze Level', minPrice: 0, maxPrice: 50 },
          { id: 'level-2', name: 'Silver Level', minPrice: 50, maxPrice: 100 },
          { id: 'level-3', name: 'Gold Level', minPrice: 100, maxPrice: 300 },
        ],
        selectedLevelId: 'level-2',
        assignedGiftIds: ['gift-002', 'gift-005', 'gift-006', 'gift-008', 'gift-009'],
      },
      {
        siteId: 'site-002',
        assignmentStrategy: 'exclusions',
        excludedCategories: ['Office & Stationery'],
        excludedSkus: ['TECH-WH-001'],
        assignedGiftIds: ['gift-002', 'gift-004', 'gift-005', 'gift-006', 'gift-008', 'gift-009'],
      },
      {
        siteId: 'site-003',
        assignmentStrategy: 'explicit',
        includedGiftIds: ['gift-002', 'gift-006', 'gift-008', 'gift-009'],
        assignedGiftIds: ['gift-002', 'gift-006', 'gift-008', 'gift-009'],
      },
      {
        siteId: 'site-004',
        assignmentStrategy: 'all',
        assignedGiftIds: ['gift-001', 'gift-002', 'gift-003', 'gift-004', 'gift-005', 'gift-006', 'gift-008', 'gift-009', 'gift-010'],
      },
      {
        siteId: 'site-005',
        assignmentStrategy: 'price_levels',
        priceLevels: [
          { id: 'level-1', name: 'Basic', minPrice: 0, maxPrice: 50 },
          { id: 'level-2', name: 'Standard', minPrice: 50, maxPrice: 100 },
        ],
        selectedLevelId: 'level-1',
        assignedGiftIds: ['gift-002', 'gift-005', 'gift-008'],
      },
      {
        siteId: 'site-007',
        assignmentStrategy: 'explicit',
        includedGiftIds: ['gift-001', 'gift-004', 'gift-006', 'gift-009'],
        assignedGiftIds: ['gift-001', 'gift-004', 'gift-006', 'gift-009'],
      },
    ];

    for (const config of siteConfigs) {
      await kv.set(`site_configs:${config.siteId}`, config);
    }
    console.log(`Seeded ${siteConfigs.length} site configurations`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}