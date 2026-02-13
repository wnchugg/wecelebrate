/**
 * Mock Data Generators
 * Creates realistic test data for development and testing
 */

import type { Client, Site, Gift, Employee, Order } from '../../types';

/**
 * Generate mock client
 */
export function generateMockClient(overrides?: Partial<Client>): Client {
  const id = overrides?.id ?? `client-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    name: overrides?.name ?? `Client ${id.slice(-4)}`,
    status: overrides?.status ?? 'active',
    logo: overrides?.logo,
    contactEmail: overrides?.contactEmail ?? `contact@${id}.com`,
    contactName: overrides?.contactName ?? 'Mock Contact',
    createdAt: overrides?.createdAt ?? new Date().toISOString(),
    updatedAt: overrides?.updatedAt ?? new Date().toISOString(),
  };
}

/**
 * Generate mock site
 */
export function generateMockSite(overrides?: Partial<Site>): Site {
  const id = overrides?.id ?? `site-${Math.random().toString(36).substr(2, 9)}`;
  const clientId = overrides?.clientId ?? `client-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name: overrides?.name ?? `Site ${id.slice(-4)}`,
    clientId,
    domain: overrides?.domain ?? `${id}.example.com`,
    status: overrides?.status ?? 'active',
    branding: overrides?.branding ?? {
      primaryColor: '#D91C81',
      secondaryColor: '#E94B9E',
      tertiaryColor: '#F39DBD',
    },
    settings: overrides?.settings ?? {
      validationMethod: 'email',
      allowQuantitySelection: true,
      showPricing: true,
      giftsPerUser: 1,
      shippingMode: 'employee',
      defaultLanguage: 'en',
      enableLanguageSelector: true,
      defaultCurrency: 'USD',
      allowedCountries: [],
      defaultCountry: 'US',
    },
    createdAt: overrides?.createdAt ?? new Date().toISOString(),
    updatedAt: overrides?.updatedAt ?? new Date().toISOString(),
  };
}

/**
 * Generate mock gift
 */
export function generateMockGift(overrides?: Partial<Gift>): Gift {
  const id = overrides?.id ?? `gift-${Math.random().toString(36).substr(2, 9)}`;

  const categories = ['electronics', 'home', 'fashion', 'sports', 'books', 'toys'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];

  return {
    id,
    name: overrides?.name ?? `Gift ${id.slice(-4)}`,
    description: overrides?.description ?? 'Mock gift description',
    price: overrides?.price ?? Math.floor(Math.random() * 200) + 10,
    category: overrides?.category ?? randomCategory,
    image: overrides?.image ?? `https://picsum.photos/seed/${id}/400/300`,
    status: overrides?.status ?? 'active',
    sku: overrides?.sku ?? `SKU-${id.slice(-6).toUpperCase()}`,
    stock: overrides?.stock ?? Math.floor(Math.random() * 100) + 10,
    tags: overrides?.tags ?? [randomCategory, 'featured'],
    createdAt: overrides?.createdAt ?? new Date().toISOString(),
    updatedAt: overrides?.updatedAt ?? new Date().toISOString(),
  };
}

/**
 * Generate mock employee
 */
export function generateMockEmployee(overrides?: Partial<Employee>): Employee {
  const id = overrides?.id ?? `emp-${Math.random().toString(36).substr(2, 9)}`;
  const firstName = overrides?.firstName ?? ['John', 'Jane', 'Mike', 'Sarah', 'David'][Math.floor(Math.random() * 5)];
  const lastName = overrides?.lastName ?? ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)];

  return {
    id,
    employeeId: overrides?.employeeId ?? `EMP${Math.floor(Math.random() * 10000)}`,
    firstName,
    lastName,
    email: overrides?.email ?? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    department: overrides?.department ?? ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'][Math.floor(Math.random() * 5)],
    siteId: overrides?.siteId ?? `site-${Math.random().toString(36).substr(2, 9)}`,
    status: overrides?.status ?? 'active',
    createdAt: overrides?.createdAt ?? new Date().toISOString(),
    updatedAt: overrides?.updatedAt ?? new Date().toISOString(),
  };
}

/**
 * Generate mock order
 */
export function generateMockOrder(overrides?: Partial<Order>): Order {
  const id = overrides?.id ?? `order-${Math.random().toString(36).substr(2, 9)}`;
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    id,
    orderNumber: overrides?.orderNumber ?? `ORD-${Math.floor(Math.random() * 100000)}`,
    siteId: overrides?.siteId ?? `site-${Math.random().toString(36).substr(2, 9)}`,
    giftId: overrides?.giftId ?? `gift-${Math.random().toString(36).substr(2, 9)}`,
    employeeId: overrides?.employeeId ?? `emp-${Math.random().toString(36).substr(2, 9)}`,
    quantity: overrides?.quantity ?? 1,
    status: overrides?.status ?? randomStatus,
    total: overrides?.total ?? Math.floor(Math.random() * 500) + 50,
    shippingAddress: overrides?.shippingAddress ?? {
      fullName: 'John Smith',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'US',
    },
    createdAt: overrides?.createdAt ?? new Date().toISOString(),
    updatedAt: overrides?.updatedAt ?? new Date().toISOString(),
  };
}

/**
 * Generate array of mock clients
 */
export function generateMockClients(count: number): Client[] {
  return Array.from({ length: count }, (_, i) =>
    generateMockClient({ name: `Client ${i + 1}` })
  );
}

/**
 * Generate array of mock sites
 */
export function generateMockSites(count: number, clientId?: string): Site[] {
  return Array.from({ length: count }, (_, i) =>
    generateMockSite({
      name: `Site ${i + 1}`,
      clientId: clientId ?? `client-${Math.random().toString(36).substr(2, 9)}`,
    })
  );
}

/**
 * Generate array of mock gifts
 */
export function generateMockGifts(count: number): Gift[] {
  return Array.from({ length: count }, (_, i) =>
    generateMockGift({ name: `Gift ${i + 1}` })
  );
}

/**
 * Generate array of mock employees
 */
export function generateMockEmployees(count: number): Employee[] {
  return Array.from({ length: count }, () => generateMockEmployee());
}

/**
 * Generate array of mock orders
 */
export function generateMockOrders(count: number): Order[] {
  return Array.from({ length: count }, () => generateMockOrder());
}

/**
 * Generate complete mock dataset
 */
export function generateMockDataset(options?: {
  clientCount?: number;
  sitesPerClient?: number;
  giftCount?: number;
  employeeCount?: number;
  orderCount?: number;
}): {
  clients: Client[];
  sites: Site[];
  gifts: Gift[];
  employees: Employee[];
  orders: Order[];
} {
  const clientCount = options?.clientCount ?? 5;
  const sitesPerClient = options?.sitesPerClient ?? 3;
  const giftCount = options?.giftCount ?? 20;
  const employeeCount = options?.employeeCount ?? 50;
  const orderCount = options?.orderCount ?? 100;
  
  const clients = generateMockClients(clientCount);
  const sites = clients.flatMap(client =>
    generateMockSites(sitesPerClient, client.id)
  );
  const gifts = generateMockGifts(giftCount);
  const employees = generateMockEmployees(employeeCount);
  const orders = generateMockOrders(orderCount);
  
  return { clients, sites, gifts, employees, orders };
}

/**
 * Random data generators
 */
export const mockDataGenerators = {
  // Random names
  firstName: () => {
    const names = [
      'James', 'John', 'Robert', 'Michael', 'William',
      'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth',
      'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
      'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy',
    ];
    return names[Math.floor(Math.random() * names.length)];
  },
  
  lastName: () => {
    const names = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
      'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
      'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson',
      'Martin', 'Lee', 'Thompson', 'White', 'Harris',
    ];
    return names[Math.floor(Math.random() * names.length)];
  },
  
  email: (firstName?: string, lastName?: string) => {
    const fn = firstName ?? mockDataGenerators.firstName();
    const ln = lastName ?? mockDataGenerators.lastName();
    const domains = ['example.com', 'test.com', 'demo.com', 'mail.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`;
  },
  
  phone: () => {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const suffix = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${prefix}-${suffix}`;
  },
  
  address: () => {
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const streets = ['Main St', 'Oak Ave', 'Elm St', 'Maple Dr', 'Park Blvd'];
    const street = streets[Math.floor(Math.random() * streets.length)];
    return `${streetNumber} ${street}`;
  },
  
  city: () => {
    const cities = [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
      'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    ];
    return cities[Math.floor(Math.random() * cities.length)];
  },
  
  state: () => {
    const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
    return states[Math.floor(Math.random() * states.length)];
  },
  
  zipCode: () => {
    return String(Math.floor(Math.random() * 90000) + 10000);
  },
  
  companyName: () => {
    const prefixes = ['Tech', 'Global', 'Digital', 'Innovative', 'Creative'];
    const suffixes = ['Solutions', 'Systems', 'Corp', 'Industries', 'Group'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${suffix}`;
  },
  
  department: () => {
    const departments = [
      'Engineering', 'Sales', 'Marketing', 'HR', 'Finance',
      'Operations', 'Customer Service', 'IT', 'Legal', 'R&D',
    ];
    return departments[Math.floor(Math.random() * departments.length)];
  },
  
  jobTitle: () => {
    const titles = [
      'Manager', 'Director', 'Specialist', 'Coordinator', 'Analyst',
      'Engineer', 'Developer', 'Designer', 'Associate', 'Consultant',
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  },
  
  price: (min: number = 10, max: number = 1000) => {
    return Math.floor(Math.random() * (max - min) + min);
  },
  
  date: (daysAgo: number = 365) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString();
  },
  
  futureDate: (daysAhead: number = 365) => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
    return date.toISOString();
  },
  
  imageUrl: (width: number = 400, height: number = 300) => {
    const seed = Math.random().toString(36).substr(2, 9);
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  },
  
  color: () => {
    const colors = [
      '#D91C81', '#E94B9E', '#F39DBD', '#1B2A5E', '#2E4180',
      '#3B5998', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },
  
  status: <T extends string>(statuses: T[]): T => {
    return statuses[Math.floor(Math.random() * statuses.length)];
  },
  
  boolean: () => Math.random() > 0.5,
  
  percentage: () => Math.floor(Math.random() * 100),
  
  rating: (max: number = 5) => {
    return Math.floor(Math.random() * max) + 1;
  },
  
  uuid: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },
};

/**
 * Seed random data for development
 */
export function seedMockData(): void {
  const data = generateMockDataset({
    clientCount: 10,
    sitesPerClient: 5,
    giftCount: 50,
    employeeCount: 100,
    orderCount: 200,
  });
  
  // Store in localStorage for development
  localStorage.setItem('mock_clients', JSON.stringify(data.clients));
  localStorage.setItem('mock_sites', JSON.stringify(data.sites));
  localStorage.setItem('mock_gifts', JSON.stringify(data.gifts));
  localStorage.setItem('mock_employees', JSON.stringify(data.employees));
  localStorage.setItem('mock_orders', JSON.stringify(data.orders));
  
  console.log('✅ Mock data seeded to localStorage:', data);
}

/**
 * Load mock data from localStorage
 */
export function loadMockData(): ReturnType<typeof generateMockDataset> | null {
  try {
    const clients = JSON.parse(localStorage.getItem('mock_clients') || '[]');
    const sites = JSON.parse(localStorage.getItem('mock_sites') || '[]');
    const gifts = JSON.parse(localStorage.getItem('mock_gifts') || '[]');
    const employees = JSON.parse(localStorage.getItem('mock_employees') || '[]');
    const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    
    if (clients.length === 0) return null;
    
    return { clients, sites, gifts, employees, orders };
  } catch {
    return null;
  }
}

/**
 * Clear mock data from localStorage
 */
export function clearMockData(): void {
  localStorage.removeItem('mock_clients');
  localStorage.removeItem('mock_sites');
  localStorage.removeItem('mock_gifts');
  localStorage.removeItem('mock_employees');
  localStorage.removeItem('mock_orders');
  console.log('✅ Mock data cleared from localStorage');
}
