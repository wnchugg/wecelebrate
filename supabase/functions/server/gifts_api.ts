/**
 * Gifts and Orders API
 * Handles gift catalog, order management, and order tracking
 * UPDATED: Now environment-aware for multi-environment support
 */

import * as kv from "./kv_env.ts"; // FIXED: Use environment-aware KV store
import * as emailEventHelper from "./email_event_helper.tsx";

// Types
export interface Gift {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  category: string;
  price: number;  // Changed from 'value' to 'price'
  sku: string;    // Added sku field
  features: string[];
  specifications: { [key: string]: string };
  status: string;  // Changed from 'inStock: boolean' to 'status: string' ('active' | 'inactive')
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  siteId?: string; // Site ID for email automation
  gift: Gift;
  quantity: number;
  status: OrderStatus;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  trackingNumber?: string;
  carrier?: string;
  orderDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  timeline: {
    status: OrderStatus;
    label: string;
    timestamp: string;
    location?: string;
    description: string;
  }[];
}

// KV Store Keys - UPDATED: Now environment-aware
// Note: GIFTS_KEY is kept as global for backward compatibility
const GIFTS_KEY = 'gifts:all';
const GIFT_PREFIX = 'gift:'; // Will be used as: gift:${environmentId}:${giftId}
const ORDERS_PREFIX = 'order:';
const USER_ORDERS_PREFIX = 'user_orders:';
const ORDER_COUNTER_KEY = 'order_counter';

/**
 * Initialize gift catalog with default data
 * UPDATED: Now accepts environmentId parameter
 */
export async function initializeGiftCatalog(environmentId: string = 'development'): Promise<void> {
  const existingGifts = await kv.get(GIFTS_KEY, environmentId);
  if (existingGifts && existingGifts.length > 0) {
    console.log('Gift catalog already initialized');
    return;
  }

  const defaultGifts: Gift[] = [
    {
      id: 'gift-1',
      name: 'Premium Noise-Cancelling Headphones',
      description: 'High-quality wireless headphones with active noise cancellation, perfect for music lovers and remote workers.',
      longDescription: 'Experience audio excellence with our premium noise-cancelling headphones. Featuring advanced active noise cancellation technology, these wireless headphones deliver crystal-clear sound quality while blocking out ambient noise. With up to 30 hours of battery life, comfortable over-ear design, and premium materials, they\'re perfect for work, travel, or leisure.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      category: 'Electronics',
      price: 299.99,
      sku: 'PH-001',
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
      status: 'active',
      availableQuantity: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'gift-2',
      name: 'Smart Fitness Watch',
      description: 'Track your health and fitness goals with this advanced smartwatch featuring heart rate monitoring and GPS.',
      longDescription: 'Stay on top of your fitness journey with our Smart Fitness Watch. This comprehensive health companion tracks your heart rate, steps, calories, sleep quality, and workouts. With built-in GPS for outdoor activities, water resistance for swimming, and smart notifications to keep you connected, it\'s the perfect blend of fitness and technology.',
      image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&q=80',
      category: 'Electronics',
      price: 249.99,
      sku: 'SW-001',
      features: [
        'Heart rate & sleep monitoring',
        'Built-in GPS tracking',
        '5 ATM water resistance',
        '7-day battery life',
        'Multi-sport tracking modes',
        'Smart notifications'
      ],
      specifications: {
        'Display': '1.4" AMOLED touchscreen',
        'Battery Life': '7 days typical use',
        'Water Resistance': '5 ATM (50 meters)',
        'Sensors': 'Heart rate, GPS, Accelerometer, Gyroscope',
        'Compatibility': 'iOS 12+, Android 6.0+',
        'Weight': '45g'
      },
      status: 'active',
      availableQuantity: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'gift-3',
      name: 'Gourmet Coffee Collection',
      description: 'A curated selection of premium coffee beans from around the world, perfect for coffee enthusiasts.',
      longDescription: 'Embark on a global coffee journey with our Gourmet Coffee Collection. This carefully curated set features 6 distinct varieties from renowned coffee regions including Ethiopia, Colombia, Brazil, and Indonesia. Each 250g bag is freshly roasted to perfection, bringing unique flavors and aromas to your daily brew. Includes tasting notes and brewing guides.',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
      category: 'Food & Beverage',
      price: 79.99,
      sku: 'CC-001',
      features: [
        '6 premium coffee varieties',
        'Freshly roasted beans',
        'Single-origin selections',
        'Tasting notes included',
        'Brewing guide',
        'Elegant gift packaging'
      ],
      specifications: {
        'Total Weight': '1.5kg (6 × 250g)',
        'Origin': 'Ethiopia, Colombia, Brazil, Indonesia, Guatemala, Kenya',
        'Roast Level': 'Light to Dark variety',
        'Bean Type': '100% Arabica',
        'Best Before': '6 months from roast date',
        'Storage': 'Cool, dry place'
      },
      status: 'active',
      availableQuantity: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'gift-4',
      name: 'Luxury Spa Gift Set',
      description: 'Pamper yourself with this premium spa collection featuring organic bath products and aromatherapy essentials.',
      longDescription: 'Transform your bathroom into a luxurious spa retreat with this comprehensive wellness collection. Featuring organic bath salts, essential oil blends, premium body lotions, and artisanal soaps, every product is carefully crafted with natural ingredients. The set includes a plush bamboo towel and comes in beautiful eco-friendly packaging.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      category: 'Wellness',
      price: 129.99,
      sku: 'SP-001',
      features: [
        'Organic bath products',
        'Essential oil aromatherapy',
        'Premium body care items',
        'Bamboo towel included',
        'Eco-friendly packaging',
        'Cruelty-free & vegan'
      ],
      specifications: {
        'Contents': 'Bath salts, 3 essential oils, body lotion, 4 artisanal soaps, bamboo towel',
        'Ingredients': '100% organic and natural',
        'Scents': 'Lavender, Eucalyptus, Rose',
        'Size': 'Full-size products',
        'Certifications': 'Organic, Cruelty-free, Vegan',
        'Packaging': 'Recyclable materials'
      },
      status: 'active',
      availableQuantity: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'gift-5',
      name: 'Professional Chef Knife Set',
      description: 'High-carbon stainless steel knife set with ergonomic handles, perfect for culinary enthusiasts.',
      longDescription: 'Elevate your cooking experience with this professional-grade knife set. Crafted from premium high-carbon German stainless steel, each knife is precision-forged for exceptional sharpness and durability. The ergonomic handles provide perfect balance and control. Includes a chef\'s knife, santoku, utility knife, paring knife, bread knife, and a beautiful wooden block.',
      image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80',
      category: 'Home & Kitchen',
      price: 189.99,
      sku: 'CK-001',
      features: [
        'High-carbon stainless steel',
        'Precision-forged blades',
        'Ergonomic handles',
        'Full tang construction',
        'Wooden storage block',
        'Lifetime warranty'
      ],
      specifications: {
        'Material': 'German high-carbon stainless steel',
        'Set Includes': '8" Chef, 7" Santoku, 5" Utility, 3.5" Paring, 8" Bread knife',
        'Handle': 'Triple-riveted polymer',
        'Hardness': '56-58 HRC',
        'Care': 'Hand wash recommended',
        'Warranty': 'Lifetime'
      },
      status: 'active',
      availableQuantity: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'gift-6',
      name: 'Portable Bluetooth Speaker',
      description: '360-degree sound with deep bass, waterproof design, and 20-hour battery life.',
      longDescription: 'Take your music anywhere with this powerful portable speaker. Featuring 360-degree sound dispersion, enhanced bass response, and crystal-clear audio, it delivers an immersive listening experience. The rugged, waterproof design (IPX7 rated) makes it perfect for outdoor adventures, pool parties, or beach trips. Connect two speakers for stereo sound.',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
      category: 'Electronics',
      price: 149.99,
      sku: 'PS-001',
      features: [
        '360-degree sound',
        'IPX7 waterproof rating',
        '20-hour battery life',
        'Bluetooth 5.0',
        'Dual speaker pairing',
        'Built-in microphone'
      ],
      specifications: {
        'Output Power': '30W',
        'Battery': '20 hours playtime',
        'Bluetooth': '5.0, 100ft range',
        'Water Resistance': 'IPX7',
        'Dimensions': '7.5" × 3" diameter',
        'Weight': '1.5 lbs'
      },
      status: 'active',
      availableQuantity: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  await kv.set(GIFTS_KEY, defaultGifts, environmentId);
  
  // Store individual gifts for quick lookup
  for (const gift of defaultGifts) {
    await kv.set(`${GIFT_PREFIX}${environmentId}:${gift.id}`, gift, environmentId);
  }
  
  console.log(`Initialized gift catalog with ${defaultGifts.length} gifts`);
}

/**
 * Force reseed gift catalog (clears existing and reinitializes)
 * UPDATED: Now accepts environmentId parameter
 */
export async function forceReseedGiftCatalog(environmentId: string = 'development'): Promise<{ cleared: number; created: number }> {
  console.log('Force reseeding gift catalog...');
  
  // Get existing gifts and clear them
  const existingGifts = (await kv.get(GIFTS_KEY, environmentId)) || [];
  const clearedCount = existingGifts.length;
  
  // Clear the main gifts list
  await kv.del(GIFTS_KEY, environmentId);
  
  // Clear individual gift entries
  for (const gift of existingGifts) {
    await kv.del(`${GIFT_PREFIX}${environmentId}:${gift.id}`);
  }
  
  console.log(`Cleared ${clearedCount} existing gifts`);
  
  // Reinitialize with default gifts (copy the logic from initializeGiftCatalog)
  const defaultGifts: Gift[] = [
    {
      id: 'gift-1',
      name: 'Premium Noise-Cancelling Headphones',
      description: 'High-quality wireless headphones with active noise cancellation, perfect for music lovers and remote workers.',
      longDescription: 'Experience audio excellence with our premium noise-cancelling headphones. Featuring advanced active noise cancellation technology, these wireless headphones deliver crystal-clear sound quality while blocking out ambient noise. With up to 30 hours of battery life, comfortable over-ear design, and premium materials, they\'re perfect for work, travel, or leisure.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      category: 'Electronics',
      price: 299.99,
      sku: 'PH-001',
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
      status: 'active',
      availableQuantity: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'gift-2',
      name: 'Smart Fitness Watch',
      description: 'Track your health and fitness goals with this advanced smartwatch featuring heart rate monitoring and GPS.',
      longDescription: 'Stay on top of your fitness journey with our Smart Fitness Watch. This comprehensive health companion tracks your heart rate, steps, calories, sleep quality, and workouts. With built-in GPS for outdoor activities, water resistance for swimming, and smart notifications to keep you connected, it\'s the perfect blend of fitness and technology.',
      image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&q=80',
      category: 'Electronics',
      price: 249.99,
      sku: 'SW-001',
      features: [
        'Heart rate & sleep monitoring',
        'Built-in GPS tracking',
        '5 ATM water resistance',
        '7-day battery life',
        'Multi-sport tracking modes',
        'Smart notifications'
      ],
      specifications: {
        'Display': '1.4" AMOLED touchscreen',
        'Battery Life': '7 days typical use',
        'Water Resistance': '5 ATM (50 meters)',
        'Sensors': 'Heart rate, GPS, Accelerometer, Gyroscope',
        'Compatibility': 'iOS 12+, Android 6.0+',
        'Weight': '45g'
      },
      status: 'active',
      availableQuantity: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'gift-3',
      name: 'Gourmet Coffee Collection',
      description: 'A curated selection of premium coffee beans from around the world, perfect for coffee enthusiasts.',
      longDescription: 'Embark on a global coffee journey with our Gourmet Coffee Collection. This carefully curated set features 6 distinct varieties from renowned coffee regions including Ethiopia, Colombia, Brazil, and Indonesia. Each 250g bag is freshly roasted to perfection, bringing unique flavors and aromas to your daily brew. Includes tasting notes and brewing guides.',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
      category: 'Food & Beverage',
      price: 79.99,
      sku: 'CC-001',
      features: [
        '6 premium coffee varieties',
        'Freshly roasted beans',
        'Single-origin selections',
        'Tasting notes included',
        'Brewing guide',
        'Elegant gift packaging'
      ],
      specifications: {
        'Total Weight': '1.5kg (6 × 250g)',
        'Origin': 'Ethiopia, Colombia, Brazil, Indonesia, Guatemala, Kenya',
        'Roast Level': 'Light to Dark variety',
        'Bean Type': '100% Arabica',
        'Best Before': '6 months from roast date',
        'Storage': 'Cool, dry place'
      },
      status: 'active',
      availableQuantity: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'gift-4',
      name: 'Luxury Spa Gift Set',
      description: 'Pamper yourself with this premium spa collection featuring organic bath products and aromatherapy essentials.',
      longDescription: 'Transform your bathroom into a luxurious spa retreat with this comprehensive wellness collection. Featuring organic bath salts, essential oil blends, premium body lotions, and artisanal soaps, every product is carefully crafted with natural ingredients. The set includes a plush bamboo towel and comes in beautiful eco-friendly packaging.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      category: 'Wellness',
      price: 129.99,
      sku: 'SP-001',
      features: [
        'Organic bath products',
        'Essential oil aromatherapy',
        'Premium body care items',
        'Bamboo towel included',
        'Eco-friendly packaging',
        'Cruelty-free & vegan'
      ],
      specifications: {
        'Contents': 'Bath salts, 3 essential oils, body lotion, 4 artisanal soaps, bamboo towel',
        'Ingredients': '100% organic and natural',
        'Scents': 'Lavender, Eucalyptus, Rose',
        'Size': 'Full-size products',
        'Certifications': 'Organic, Cruelty-free, Vegan',
        'Packaging': 'Recyclable materials'
      },
      status: 'active',
      availableQuantity: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'gift-5',
      name: 'Professional Chef Knife Set',
      description: 'High-carbon stainless steel knife set with ergonomic handles, perfect for culinary enthusiasts.',
      longDescription: 'Elevate your cooking experience with this professional-grade knife set. Crafted from premium high-carbon German stainless steel, each knife is precision-forged for exceptional sharpness and durability. The ergonomic handles provide perfect balance and control. Includes a chef\'s knife, santoku, utility knife, paring knife, bread knife, and a beautiful wooden block.',
      image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80',
      category: 'Home & Kitchen',
      price: 189.99,
      sku: 'CK-001',
      features: [
        'High-carbon stainless steel',
        'Precision-forged blades',
        'Ergonomic handles',
        'Full tang construction',
        'Wooden storage block',
        'Lifetime warranty'
      ],
      specifications: {
        'Material': 'German high-carbon stainless steel',
        'Set Includes': '8" Chef, 7" Santoku, 5" Utility, 3.5" Paring, 8" Bread knife',
        'Handle': 'Triple-riveted polymer',
        'Hardness': '56-58 HRC',
        'Care': 'Hand wash recommended',
        'Warranty': 'Lifetime'
      },
      status: 'active',
      availableQuantity: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'gift-6',
      name: 'Portable Bluetooth Speaker',
      description: '360-degree sound with deep bass, waterproof design, and 20-hour battery life.',
      longDescription: 'Take your music anywhere with this powerful portable speaker. Featuring 360-degree sound dispersion, enhanced bass response, and crystal-clear audio, it delivers an immersive listening experience. The rugged, waterproof design (IPX7 rated) makes it perfect for outdoor adventures, pool parties, or beach trips. Connect two speakers for stereo sound.',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
      category: 'Electronics',
      price: 149.99,
      sku: 'PS-001',
      features: [
        '360-degree sound',
        'IPX7 waterproof rating',
        '20-hour battery life',
        'Bluetooth 5.0',
        'Dual speaker pairing',
        'Built-in microphone'
      ],
      specifications: {
        'Output Power': '30W',
        'Battery': '20 hours playtime',
        'Bluetooth': '5.0, 100ft range',
        'Water Resistance': 'IPX7',
        'Dimensions': '7.5" × 3" diameter',
        'Weight': '1.5 lbs'
      },
      status: 'active',
      availableQuantity: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  await kv.set(GIFTS_KEY, defaultGifts, environmentId);
  
  // Store individual gifts for quick lookup
  for (const gift of defaultGifts) {
    await kv.set(`${GIFT_PREFIX}${environmentId}:${gift.id}`, gift, environmentId);
  }
  
  console.log(`Reseeded gift catalog with ${defaultGifts.length} gifts`);
  
  return {
    cleared: clearedCount,
    created: defaultGifts.length
  };
}

/**
 * Get all gifts (with optional filtering)
 * UPDATED: Now accepts environmentId parameter
 */
export async function getAllGifts(environmentId: string = 'development', filters?: {
  category?: string;
  search?: string;
  inStockOnly?: boolean;
}): Promise<Gift[]> {
  let gifts = await kv.get(GIFTS_KEY, environmentId) || [];
  
  if (filters?.category && filters.category !== 'all') {
    gifts = gifts.filter((g: Gift) => g.category === filters.category);
  }
  
  if (filters?.search) {
    const query = filters.search.toLowerCase();
    gifts = gifts.filter((g: Gift) =>
      g.name.toLowerCase().includes(query) ||
      g.description.toLowerCase().includes(query) ||
      g.category.toLowerCase().includes(query) ||
      g.features.some((f: string) => f.toLowerCase().includes(query))
    );
  }
  
  if (filters?.inStockOnly) {
    gifts = gifts.filter((g: Gift) => g.status === 'active');
  }
  
  return gifts;
}

/**
 * Get a single gift by ID
 * UPDATED: Now accepts environmentId parameter
 */
export async function getGiftById(environmentId: string = 'development', id: string): Promise<Gift | null> {
  const gift = await kv.get(`${GIFT_PREFIX}${environmentId}:${id}`);
  return gift || null;
}

/**
 * Get unique categories from all gifts
 * UPDATED: Now accepts environmentId parameter
 */
export async function getCategories(environmentId: string = 'development'): Promise<string[]> {
  const gifts = await kv.get(GIFTS_KEY, environmentId) || [];
  const categories = new Set(gifts.map((g: Gift) => g.category));
  return Array.from(categories);
}

/**
 * Create a new order
 * UPDATED: Now accepts environmentId parameter
 */
export async function createOrder(environmentId: string = 'development', orderData: {
  userId: string;
  userEmail: string;
  giftId: string;
  quantity: number;
  shippingAddress: Order['shippingAddress'];
}): Promise<Order> {
  const gift = await getGiftById(environmentId, orderData.giftId);
  if (!gift) {
    throw new Error('Gift not found');
  }
  
  if (gift.status !== 'active' || gift.availableQuantity < orderData.quantity) {
    throw new Error('Gift out of stock');
  }
  
  // Generate order number
  const counter = (await kv.get(ORDER_COUNTER_KEY)) || 0;
  const newCounter = counter + 1;
  await kv.set(ORDER_COUNTER_KEY, newCounter);
  
  const orderId = `ORD-${Date.now()}-${newCounter}`;
  const orderNumber = `#${newCounter.toString().padStart(6, '0')}`;
  
  const orderDate = new Date().toISOString();
  const estimatedDeliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const estimatedDelivery = estimatedDeliveryDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  const order: Order = {
    id: orderId,
    orderNumber,
    userId: orderData.userId,
    userEmail: orderData.userEmail,
    gift,
    quantity: orderData.quantity,
    status: 'pending',
    shippingAddress: orderData.shippingAddress,
    orderDate,
    estimatedDelivery,
    timeline: [
      {
        status: 'pending',
        label: 'Order Placed',
        timestamp: orderDate,
        location: 'Online',
        description: 'Your order has been received and is being processed'
      }
    ]
  };
  
  // Store order
  await kv.set(`${ORDERS_PREFIX}${orderId}`, order);
  
  // Add to user's orders
  const userOrders = (await kv.get(`${USER_ORDERS_PREFIX}${orderData.userId}`)) || [];
  userOrders.push(orderId);
  await kv.set(`${USER_ORDERS_PREFIX}${orderData.userId}`, userOrders);
  
  // Update gift inventory
  gift.availableQuantity -= orderData.quantity;
  if (gift.availableQuantity === 0) {
    gift.status = 'inactive';
  }
  await kv.set(`${GIFT_PREFIX}${environmentId}:${gift.id}`, gift, environmentId);
  
  // Update gifts catalog
  const allGifts = await kv.get(GIFTS_KEY, environmentId) || [];
  const updatedGifts = allGifts.map((g: Gift) => g.id === gift.id ? gift : g);
  await kv.set(GIFTS_KEY, updatedGifts, environmentId);
  
  console.log(`Created order ${orderNumber} for user ${orderData.userEmail}`);
  
  return order;
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const order = await kv.get(`${ORDERS_PREFIX}${orderId}`);
  return order || null;
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const orderIds = (await kv.get(`${USER_ORDERS_PREFIX}${userId}`)) || [];
  const orders: Order[] = [];
  
  for (const orderId of orderIds) {
    const order = await kv.get(`${ORDERS_PREFIX}${orderId}`);
    if (order) {
      orders.push(order);
    }
  }
  
  // Sort by order date (newest first)
  return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
  carrier?: string,
  environmentId: string = 'development'
): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  
  const previousStatus = order.status;
  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (carrier) order.carrier = carrier;
  
  const timestamp = new Date().toISOString();
  
  // Add timeline event
  const timelineEvents: { [key in OrderStatus]?: { label: string; location: string; description: string } } = {
    processing: {
      label: 'Processing',
      location: 'Warehouse',
      description: 'Your order is being prepared for shipment'
    },
    shipped: {
      label: 'Shipped',
      location: 'Distribution Center',
      description: 'Package has left our warehouse and is on its way'
    },
    in_transit: {
      label: 'In Transit',
      location: 'Regional Hub',
      description: 'Package is on its way to your delivery address'
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      location: 'Local Facility',
      description: 'Package is out for delivery and will arrive soon'
    },
    delivered: {
      label: 'Delivered',
      location: 'Your Address',
      description: 'Package has been successfully delivered'
    }
  };
  
  const eventData = timelineEvents[status];
  if (eventData) {
    order.timeline.push({
      status,
      label: eventData.label,
      timestamp,
      location: eventData.location,
      description: eventData.description
    });
  }
  
  if (status === 'delivered') {
    order.actualDelivery = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  await kv.set(`${ORDERS_PREFIX}${orderId}`, order);
  
  console.log(`Updated order ${order.orderNumber} to status: ${status}`);
  
  // Trigger email automation based on status change
  try {
    // Use siteId from order if available
    const siteId = order.siteId || order.userId; // Fallback to userId if siteId not set
    
    if (!siteId) {
      console.warn('[Order Status Update] No siteId found for order, skipping email automation');
      return order;
    }
    
    // Only trigger for specific status changes
    if (status === 'shipped' && previousStatus !== 'shipped') {
      await emailEventHelper.notifyOrderShipped(
        siteId,
        {
          id: order.orderNumber,
          recipientEmail: order.userEmail,
          recipientName: order.shippingAddress.fullName,
          trackingNumber: order.trackingNumber,
          carrier: order.carrier,
          estimatedDelivery: order.estimatedDelivery,
        },
        environmentId
      );
      console.log(`[Order Status Update] Triggered order_shipped automation for ${order.userEmail}`);
    } else if (status === 'delivered' && previousStatus !== 'delivered') {
      await emailEventHelper.notifyOrderDelivered(
        siteId,
        {
          id: order.orderNumber,
          recipientEmail: order.userEmail,
          recipientName: order.shippingAddress.fullName,
          deliveryDate: order.actualDelivery,
        },
        environmentId
      );
      console.log(`[Order Status Update] Triggered order_delivered automation for ${order.userEmail}`);
    }
  } catch (automationError: any) {
    console.error('[Order Status Update] Failed to trigger email automation:', automationError);
    // Don't fail the order update if automation fails
  }
  
  return order;
}