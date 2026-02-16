/**
 * Seed Test Data for Dashboard API Tests
 * 
 * This script creates comprehensive test data including:
 * - Test site (test-site-123)
 * - Test orders
 * - Test employees
 * - Test gifts
 * - Test catalogs
 */

const BACKEND_URL = Deno.env.get('SUPABASE_URL') || 'https://wjfcqqrlhwdvvjmefxky.supabase.co';
const FUNCTION_URL = `${BACKEND_URL}/functions/v1/make-server-6fcaeea3`;
const ENV_ID = 'development';

// Get token from environment or .env file
const TOKEN = Deno.env.get('TEST_ADMIN_TOKEN') || '';

if (!TOKEN) {
  console.error('❌ TEST_ADMIN_TOKEN environment variable not set');
  console.error('Run: source .env');
  Deno.exit(1);
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${FUNCTION_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-Access-Token': TOKEN,
      'X-Environment-ID': ENV_ID,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`API Error: ${data.error || response.statusText}`);
  }

  return data;
}

/**
 * Create test client
 */
async function createTestClient() {
  console.log('📦 Creating test client...');
  
  try {
    const client = await apiRequest('/clients', {
      method: 'POST',
      body: JSON.stringify({
        id: 'test-client-001',
        name: 'Test Corporation',
        description: 'Test client for dashboard API tests',
        contactEmail: 'test@testcorp.com',
        contactPhone: '(555) 999-0000',
        address: '123 Test Street, Test City, TC 12345',
        isActive: true,
      }),
    });
    
    console.log('✅ Test client created:', client.client?.id);
    return client.client;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Test client already exists (skipping)');
      return { id: 'test-client-001' };
    }
    throw error;
  }
}

/**
 * Create test site
 */
async function createTestSite() {
  console.log('🏢 Creating test site...');
  
  try {
    const site = await apiRequest('/sites', {
      method: 'POST',
      body: JSON.stringify({
        id: 'test-site-123',
        name: 'Test Site for Dashboard',
        clientId: 'test-client-001',
        domain: 'test-dashboard.jala.com',
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
      }),
    });
    
    console.log('✅ Test site created:', site.site?.id);
    return site.site;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Test site already exists (skipping)');
      return { id: 'test-site-123' };
    }
    throw error;
  }
}

/**
 * Create test employees
 */
async function createTestEmployees() {
  console.log('👥 Creating test employees...');
  
  const employees = [
    {
      id: 'test-emp-001',
      siteId: 'test-site-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@testcorp.com',
      employeeId: 'EMP001',
      department: 'Engineering',
      status: 'active',
    },
    {
      id: 'test-emp-002',
      siteId: 'test-site-123',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@testcorp.com',
      employeeId: 'EMP002',
      department: 'Marketing',
      status: 'active',
    },
    {
      id: 'test-emp-003',
      siteId: 'test-site-123',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@testcorp.com',
      employeeId: 'EMP003',
      department: 'Sales',
      status: 'active',
    },
    {
      id: 'test-emp-004',
      siteId: 'test-site-123',
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice.williams@testcorp.com',
      employeeId: 'EMP004',
      department: 'HR',
      status: 'inactive',
    },
    {
      id: 'test-emp-005',
      siteId: 'test-site-123',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@testcorp.com',
      employeeId: 'EMP005',
      department: 'Engineering',
      status: 'active',
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const employee of employees) {
    try {
      await apiRequest('/employees', {
        method: 'POST',
        body: JSON.stringify(employee),
      });
      created++;
    } catch (error) {
      if (error.message.includes('already exists')) {
        skipped++;
      } else {
        console.error(`Failed to create employee ${employee.id}:`, error.message);
      }
    }
  }

  console.log(`✅ Created ${created} employees, skipped ${skipped}`);
}

/**
 * Create test gifts
 */
async function createTestGifts() {
  console.log('🎁 Creating test gifts...');
  
  const gifts = [
    {
      id: 'test-gift-001',
      name: 'Wireless Headphones',
      description: 'Premium noise-canceling wireless headphones',
      category: 'Electronics',
      price: 149.99,
      currency: 'USD',
      sku: 'TEST-WH-001',
      imageUrl: 'https://via.placeholder.com/400x400?text=Headphones',
      isActive: true,
      stock: 100,
    },
    {
      id: 'test-gift-002',
      name: 'Coffee Maker',
      description: 'Programmable coffee maker with thermal carafe',
      category: 'Home & Kitchen',
      price: 89.99,
      currency: 'USD',
      sku: 'TEST-CM-001',
      imageUrl: 'https://via.placeholder.com/400x400?text=Coffee+Maker',
      isActive: true,
      stock: 50,
    },
    {
      id: 'test-gift-003',
      name: 'Fitness Tracker',
      description: 'Smart fitness tracker with heart rate monitor',
      category: 'Electronics',
      price: 79.99,
      currency: 'USD',
      sku: 'TEST-FT-001',
      imageUrl: 'https://via.placeholder.com/400x400?text=Fitness+Tracker',
      isActive: true,
      stock: 75,
    },
    {
      id: 'test-gift-004',
      name: 'Desk Organizer Set',
      description: 'Premium desk organizer with multiple compartments',
      category: 'Office',
      price: 39.99,
      currency: 'USD',
      sku: 'TEST-DO-001',
      imageUrl: 'https://via.placeholder.com/400x400?text=Desk+Organizer',
      isActive: true,
      stock: 200,
    },
    {
      id: 'test-gift-005',
      name: 'Portable Speaker',
      description: 'Waterproof Bluetooth portable speaker',
      category: 'Electronics',
      price: 59.99,
      currency: 'USD',
      sku: 'TEST-PS-001',
      imageUrl: 'https://via.placeholder.com/400x400?text=Speaker',
      isActive: true,
      stock: 150,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const gift of gifts) {
    try {
      await apiRequest('/gifts', {
        method: 'POST',
        body: JSON.stringify(gift),
      });
      created++;
    } catch (error) {
      if (error.message.includes('already exists')) {
        skipped++;
      } else {
        console.error(`Failed to create gift ${gift.id}:`, error.message);
      }
    }
  }

  console.log(`✅ Created ${created} gifts, skipped ${skipped}`);
}

/**
 * Create test orders
 */
async function createTestOrders() {
  console.log('📦 Creating test orders...');
  
  const now = new Date();
  const orders = [
    {
      id: 'test-order-001',
      siteId: 'test-site-123',
      employeeId: 'test-emp-001',
      giftId: 'test-gift-001',
      status: 'pending',
      quantity: 1,
      totalPrice: 149.99,
      currency: 'USD',
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'Test City',
        state: 'TC',
        zip: '12345',
        country: 'US',
      },
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: 'test-order-002',
      siteId: 'test-site-123',
      employeeId: 'test-emp-002',
      giftId: 'test-gift-002',
      status: 'shipped',
      quantity: 1,
      totalPrice: 89.99,
      currency: 'USD',
      shippingAddress: {
        name: 'Jane Smith',
        street: '456 Oak Ave',
        city: 'Test City',
        state: 'TC',
        zip: '12345',
        country: 'US',
      },
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      id: 'test-order-003',
      siteId: 'test-site-123',
      employeeId: 'test-emp-003',
      giftId: 'test-gift-003',
      status: 'delivered',
      quantity: 1,
      totalPrice: 79.99,
      currency: 'USD',
      shippingAddress: {
        name: 'Bob Johnson',
        street: '789 Pine Rd',
        city: 'Test City',
        state: 'TC',
        zip: '12345',
        country: 'US',
      },
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    },
    {
      id: 'test-order-004',
      siteId: 'test-site-123',
      employeeId: 'test-emp-005',
      giftId: 'test-gift-004',
      status: 'pending',
      quantity: 1,
      totalPrice: 39.99,
      currency: 'USD',
      shippingAddress: {
        name: 'Charlie Brown',
        street: '321 Elm St',
        city: 'Test City',
        state: 'TC',
        zip: '12345',
        country: 'US',
      },
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: 'test-order-005',
      siteId: 'test-site-123',
      employeeId: 'test-emp-001',
      giftId: 'test-gift-005',
      status: 'shipped',
      quantity: 1,
      totalPrice: 59.99,
      currency: 'USD',
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'Test City',
        state: 'TC',
        zip: '12345',
        country: 'US',
      },
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const order of orders) {
    try {
      await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(order),
      });
      created++;
    } catch (error) {
      if (error.message.includes('already exists')) {
        skipped++;
      } else {
        console.error(`Failed to create order ${order.id}:`, error.message);
      }
    }
  }

  console.log(`✅ Created ${created} orders, skipped ${skipped}`);
}

/**
 * Main seed function
 */
async function seedTestData() {
  console.log('🌱 Starting test data seeding...');
  console.log('');

  try {
    await createTestClient();
    await createTestSite();
    await createTestEmployees();
    await createTestGifts();
    await createTestOrders();

    console.log('');
    console.log('✅ Test data seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('  - Client: test-client-001');
    console.log('  - Site: test-site-123');
    console.log('  - Employees: 5');
    console.log('  - Gifts: 5');
    console.log('  - Orders: 5');
    console.log('');
    console.log('🧪 Ready to run dashboard API tests!');
  } catch (error) {
    console.error('');
    console.error('❌ Error seeding test data:', error.message);
    Deno.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  seedTestData();
}

export { seedTestData };
