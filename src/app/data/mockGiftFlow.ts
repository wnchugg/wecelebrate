/**
 * Mock Data Service for 6-Step Gift Flow
 * This provides sample data to test the complete user journey
 */

export interface MockGift {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  category: string;
  value: number;
  features: string[];
  specifications: {
    [key: string]: string;
  };
  inStock: boolean;
  availableQuantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderTracking {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  gift: MockGift;
  quantity: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  orderDate: string;
  timeline: {
    status: OrderStatus;
    label: string;
    timestamp: string;
    location?: string;
    description: string;
  }[];
}

export interface OrderHistoryItem {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  gift: {
    id: string;
    name: string;
    image: string;
    category: string;
  };
  quantity: number;
  estimatedDelivery: string;
}

export const mockGifts: MockGift[] = [
  {
    id: 'gift-1',
    name: 'Premium Noise-Cancelling Headphones',
    description: 'High-quality wireless headphones with active noise cancellation, perfect for music lovers and remote workers.',
    longDescription: 'Experience audio excellence with our premium noise-cancelling headphones. Featuring advanced active noise cancellation technology, these wireless headphones deliver crystal-clear sound quality while blocking out ambient noise. With up to 30 hours of battery life, comfortable over-ear design, and premium materials, they\'re perfect for work, travel, or leisure.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Electronics',
    value: 299.99,
    features: [
      'Active Noise Cancellation (ANC)',
      '30-hour battery life',
      'Bluetooth 5.0 connectivity',
      'Premium memory foam ear cushions',
      'Built-in microphone for calls',
      'Foldable design with carrying case'
    ],
    specifications: {
      'Driver Size': '40mm',
      'Frequency Response': '20Hz - 20kHz',
      'Battery Life': '30 hours (ANC on), 40 hours (ANC off)',
      'Charging Time': '2 hours',
      'Weight': '250g',
      'Connectivity': 'Bluetooth 5.0, 3.5mm cable'
    },
    inStock: true,
    availableQuantity: 50
  },
  {
    id: 'gift-2',
    name: 'Luxury Spa Gift Set',
    description: 'Premium spa collection featuring organic bath products, aromatherapy oils, and plush towels.',
    longDescription: 'Indulge in pure relaxation with our luxury spa gift set. This comprehensive collection includes organic bath bombs, essential oil blends, rejuvenating face masks, and ultra-soft bamboo towels. Each product is carefully curated to provide a spa-quality experience in the comfort of your own home.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    category: 'Wellness',
    value: 149.99,
    features: [
      '6 organic bath bombs',
      '3 essential oil blends (15ml each)',
      '2 premium face masks',
      '2 bamboo towels',
      'Aromatherapy candle',
      'Beautiful gift packaging'
    ],
    specifications: {
      'Bath Bombs': '6 x 100g (Lavender, Eucalyptus, Rose)',
      'Essential Oils': 'Relaxation, Energy, Sleep (15ml each)',
      'Towels': '100% bamboo fiber, 70x140cm',
      'Candle': 'Natural soy wax, 40-hour burn time',
      'Packaging': 'Eco-friendly bamboo gift box',
      'Certification': 'Organic, Cruelty-free, Vegan'
    },
    inStock: true,
    availableQuantity: 35
  },
  {
    id: 'gift-3',
    name: 'Gourmet Food & Wine Basket',
    description: 'Curated selection of artisanal cheeses, premium wines, and gourmet treats from around the world.',
    longDescription: 'Delight your palate with this exquisite gourmet gift basket. Featuring a carefully selected collection of artisanal cheeses, award-winning wines, handcrafted chocolates, and specialty crackers, this basket is perfect for food enthusiasts and makes an impressive gift for any occasion.',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80',
    category: 'Food & Beverage',
    value: 189.99,
    features: [
      '2 premium wines (red and white)',
      '4 artisanal cheese varieties',
      'Handcrafted chocolate selection',
      'Gourmet crackers and breadsticks',
      'Specialty olives and preserves',
      'Elegant wicker basket'
    ],
    specifications: {
      'Red Wine': 'Cabernet Sauvignon 2019, 750ml',
      'White Wine': 'Chardonnay 2020, 750ml',
      'Cheeses': 'Aged Cheddar, Brie, Gouda, Blue Cheese',
      'Chocolates': 'Dark, Milk, Truffle Selection (300g)',
      'Basket Size': '40cm x 30cm x 20cm',
      'Total Weight': '4.5kg'
    },
    inStock: true,
    availableQuantity: 20
  },
  {
    id: 'gift-4',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and comprehensive health insights.',
    longDescription: 'Take your fitness journey to the next level with this advanced smart fitness watch. Equipped with real-time heart rate monitoring, built-in GPS, sleep tracking, and over 100 workout modes, this watch provides comprehensive health insights to help you achieve your wellness goals.',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    category: 'Electronics',
    value: 249.99,
    features: [
      '24/7 heart rate monitoring',
      'Built-in GPS and GLONASS',
      'Sleep quality tracking',
      '100+ workout modes',
      '5ATM water resistance',
      '14-day battery life'
    ],
    specifications: {
      'Display': '1.4" AMOLED touchscreen',
      'Sensors': 'Heart rate, SpO2, accelerometer, gyroscope',
      'GPS': 'Built-in GPS + GLONASS',
      'Battery': '14 days typical use',
      'Water Resistance': '5ATM (50 meters)',
      'Compatibility': 'iOS 10+ and Android 5.0+'
    },
    inStock: true,
    availableQuantity: 45
  },
  {
    id: 'gift-5',
    name: 'Designer Leather Backpack',
    description: 'Handcrafted Italian leather backpack with laptop compartment and sophisticated design.',
    longDescription: 'Combine style and functionality with this exquisite handcrafted leather backpack. Made from premium Italian leather, it features a padded laptop compartment, multiple organizational pockets, and a timeless design that transitions seamlessly from professional to casual settings.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    category: 'Fashion',
    value: 329.99,
    features: [
      '100% Italian leather construction',
      'Padded laptop compartment (fits 15")',
      'Multiple organizational pockets',
      'Adjustable padded straps',
      'YKK zippers throughout',
      'Hand-stitched details'
    ],
    specifications: {
      'Material': 'Full-grain Italian leather',
      'Dimensions': '45cm x 32cm x 15cm',
      'Laptop Size': 'Up to 15 inches',
      'Weight': '1.2kg',
      'Capacity': '25 liters',
      'Color': 'Cognac Brown'
    },
    inStock: true,
    availableQuantity: 25
  },
  {
    id: 'gift-6',
    name: 'Premium Coffee Experience',
    description: 'High-end espresso machine with selection of specialty coffee beans and barista accessories.',
    longDescription: 'Transform your home into a premium coffee shop with this complete coffee experience set. Includes a professional-grade espresso machine, a selection of specialty coffee beans from around the world, and all the barista tools you need to create café-quality beverages.',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    category: 'Food & Beverage',
    value: 499.99,
    features: [
      '15-bar espresso machine',
      '1kg specialty coffee beans (3 varieties)',
      'Milk frother and pitcher',
      'Tamper and portafilter',
      'Coffee grinder',
      'Barista training guide'
    ],
    specifications: {
      'Machine Power': '1350W',
      'Pressure': '15 bar',
      'Water Tank': '1.5L removable',
      'Coffee Beans': 'Ethiopian, Colombian, Italian Roast',
      'Grinder': 'Conical burr, 18 settings',
      'Warranty': '2 years'
    },
    inStock: true,
    availableQuantity: 15
  },
  {
    id: 'gift-7',
    name: 'Outdoor Adventure Kit',
    description: 'Complete camping and hiking gear including tent, sleeping bag, and essential outdoor equipment.',
    longDescription: 'Embark on your next outdoor adventure fully prepared with this comprehensive camping kit. Featuring a 4-season tent, high-performance sleeping bag, portable cooking equipment, and essential survival tools, this kit has everything you need for memorable outdoor experiences.',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    category: 'Outdoor',
    value: 449.99,
    features: [
      '2-person 4-season tent',
      'Temperature-rated sleeping bag (-10°C)',
      'Portable camping stove',
      'LED lantern and headlamp',
      'Multi-tool and first aid kit',
      'Waterproof backpack (60L)'
    ],
    specifications: {
      'Tent': '2-person, 4-season, 2.1kg',
      'Sleeping Bag': 'Down insulation, -10°C rating',
      'Stove': 'Gas burner, 3000W',
      'Backpack': '60L capacity, waterproof',
      'Lantern': 'LED, 500 lumens, 20-hour runtime',
      'Total Weight': '8.5kg (complete kit)'
    },
    inStock: true,
    availableQuantity: 12
  },
  {
    id: 'gift-8',
    name: 'Art & Craft Supplies Set',
    description: 'Professional-grade art supplies including paints, brushes, canvas, and premium sketchbooks.',
    longDescription: 'Unleash your creativity with this comprehensive art supplies set. Perfect for both beginners and experienced artists, this collection includes professional-grade paints, brushes, canvases, and sketchbooks to bring your artistic visions to life.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    category: 'Creative',
    value: 199.99,
    features: [
      '24-color acrylic paint set',
      '12 professional brushes',
      '5 stretched canvases (various sizes)',
      '2 premium sketchbooks',
      'Drawing pencils and charcoal',
      'Wooden easel and palette'
    ],
    specifications: {
      'Acrylic Paints': '24 colors x 75ml tubes',
      'Brushes': '12-piece set, various sizes',
      'Canvases': '2x 16"x20", 2x 12"x16", 1x 8"x10"',
      'Sketchbooks': '2x A4, 120gsm acid-free paper',
      'Easel': 'Adjustable wooden easel, 165cm height',
      'Storage': 'Wooden storage box included'
    },
    inStock: true,
    availableQuantity: 30
  }
];

/**
 * Simulate API delay for realistic user experience
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API functions
 */
export const mockGiftApi = {
  /**
   * Fetch all available gifts
   */
  async getAllGifts(): Promise<MockGift[]> {
    await delay(800);
    return mockGifts.filter(gift => gift.inStock);
  },

  /**
   * Fetch a single gift by ID
   */
  async getGiftById(id: string): Promise<MockGift | null> {
    await delay(500);
    return mockGifts.find(gift => gift.id === id) || null;
  },

  /**
   * Filter gifts by category
   */
  async getGiftsByCategory(category: string): Promise<MockGift[]> {
    await delay(600);
    return mockGifts.filter(gift => gift.category === category && gift.inStock);
  },

  /**
   * Validate user access (mock validation)
   */
  async validateAccess(method: string, value: string): Promise<{
    valid: boolean;
    employeeName?: string;
    employeeEmail?: string;
  }> {
    await delay(1000);
    
    // Simple mock validation - accept any non-empty input
    if (value.trim().length > 0) {
      return {
        valid: true,
        employeeName: 'John Doe',
        employeeEmail: method === 'email' ? value : 'john.doe@company.com'
      };
    }
    
    return { valid: false };
  },

  /**
   * Submit order (mock submission)
   */
  async submitOrder(orderData: any): Promise<{
    orderId: string;
    orderNumber: string;
    estimatedDelivery: string;
  }> {
    await delay(1500);
    
    const orderId = `ORD-${Date.now()}`;
    const orderNumber = `#${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    return {
      orderId,
      orderNumber,
      estimatedDelivery
    };
  },

  /**
   * Get order tracking information
   */
  async getOrderTracking(orderId: string): Promise<OrderTracking | null> {
    await delay(800);
    
    // Find the gift for this order (mock - just use first gift for demo)
    const gift = mockGifts[0];
    
    // Generate tracking data based on order ID
    const orderNumber = `#${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const trackingNumber = `1Z${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
    
    // Mock different statuses based on orderId for demo purposes
    const statusOptions: OrderStatus[] = ['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    const orderDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Build timeline based on current status
    const timeline: OrderTracking['timeline'] = [
      {
        status: 'pending',
        label: 'Order Placed',
        timestamp: orderDate,
        location: 'Online',
        description: 'Your order has been received and is being processed'
      },
      {
        status: 'processing',
        label: 'Processing',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Warehouse',
        description: 'Your order is being prepared for shipment'
      }
    ];
    
    if (['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(status)) {
      timeline.push({
        status: 'shipped',
        label: 'Shipped',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Distribution Center',
        description: 'Package has left our warehouse and is on its way'
      });
    }
    
    if (['in_transit', 'out_for_delivery', 'delivered'].includes(status)) {
      timeline.push({
        status: 'in_transit',
        label: 'In Transit',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        location: 'Regional Hub',
        description: 'Package is on its way to your delivery address'
      });
    }
    
    if (['out_for_delivery', 'delivered'].includes(status)) {
      timeline.push({
        status: 'out_for_delivery',
        label: 'Out for Delivery',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location: 'Local Facility',
        description: 'Package is out for delivery and will arrive soon'
      });
    }
    
    if (status === 'delivered') {
      timeline.push({
        status: 'delivered',
        label: 'Delivered',
        timestamp: new Date().toISOString(),
        location: 'Your Address',
        description: 'Package has been successfully delivered'
      });
    }
    
    return {
      orderId,
      orderNumber,
      status,
      trackingNumber,
      carrier: 'FedEx',
      estimatedDelivery,
      actualDelivery: status === 'delivered' ? new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) : undefined,
      gift,
      quantity: 1,
      shippingAddress: {
        fullName: 'John Doe',
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States',
        phone: '(555) 123-4567'
      },
      orderDate,
      timeline
    };
  },

  /**
   * Get order history for a user
   */
  async getOrderHistory(userEmail?: string): Promise<OrderHistoryItem[]> {
    await delay(1000);
    
    // Generate mock order history
    const history: OrderHistoryItem[] = [];
    
    // Create 5 sample orders with different statuses
    const statuses: OrderStatus[] = ['delivered', 'in_transit', 'processing', 'delivered', 'out_for_delivery'];
    
    for (let i = 0; i < 5; i++) {
      const gift = mockGifts[i % mockGifts.length];
      const daysAgo = (i + 1) * 7; // Orders from 7, 14, 21, etc. days ago
      
      history.push({
        orderId: `ORD-${Date.now() - daysAgo * 24 * 60 * 60 * 1000}`,
        orderNumber: `#${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        orderDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        status: statuses[i],
        gift: {
          id: gift.id,
          name: gift.name,
          image: gift.image,
          category: gift.category
        },
        quantity: 1,
        estimatedDelivery: new Date(Date.now() + (7 - daysAgo) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      });
    }
    
    return history.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  },

  /**
   * Search gifts by query string
   */
  async searchGifts(query: string): Promise<MockGift[]> {
    await delay(500);
    
    const lowerQuery = query.toLowerCase().trim();
    
    if (!lowerQuery) {
      return mockGifts.filter(gift => gift.inStock);
    }
    
    return mockGifts.filter(gift => {
      return gift.inStock && (
        gift.name.toLowerCase().includes(lowerQuery) ||
        gift.description.toLowerCase().includes(lowerQuery) ||
        gift.category.toLowerCase().includes(lowerQuery) ||
        gift.features.some(feature => feature.toLowerCase().includes(lowerQuery))
      );
    });
  }
};