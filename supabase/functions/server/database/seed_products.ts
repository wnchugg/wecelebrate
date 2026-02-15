/**
 * Seed Products to Database
 * 
 * Seeds the 6 default products from gifts_api.ts into the database
 * Run with: deno run --allow-net --allow-env --unsafely-ignore-certificate-errors seed_products.ts
 */

import * as db from './db.ts';

console.log('================================================================================');
console.log('Product Seeding Script');
console.log('================================================================================');
console.log('');

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  Deno.exit(1);
}

console.log('📍 Environment:', SUPABASE_URL);
console.log('');

// Step 1: Create default catalog
console.log('📚 Step 1: Creating default catalog...');
let defaultCatalog;
try {
  defaultCatalog = await db.createCatalog({
    name: 'Default Product Catalog',
    type: 'manual',
    status: 'active',
    description: 'Default catalog for platform products',
  });
  console.log('✅ Created catalog:', defaultCatalog.id);
} catch (error: any) {
  console.error('❌ Failed to create catalog:', error.message);
  Deno.exit(1);
}

console.log('');

// Step 2: Seed products
console.log('🎁 Step 2: Seeding products...');
console.log('');

const defaultProducts = [
  {
    sku: 'PH-001',
    name: 'Premium Noise-Cancelling Headphones',
    description: 'Experience audio excellence with our premium noise-cancelling headphones. Featuring advanced active noise cancellation technology, these wireless headphones deliver crystal-clear sound quality while blocking out ambient noise. With up to 30 hours of battery life, comfortable over-ear design, and premium materials, they\'re perfect for work, travel, or leisure.',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Electronics',
    price: 299.99,
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
    status: 'active' as const,
    available_quantity: 50,
  },
  {
    sku: 'SW-001',
    name: 'Smart Fitness Watch',
    description: 'Stay on top of your fitness journey with our Smart Fitness Watch. This comprehensive health companion tracks your heart rate, steps, calories, sleep quality, and workouts. With built-in GPS for outdoor activities, water resistance for swimming, and smart notifications to keep you connected, it\'s the perfect blend of fitness and technology.',
    image_url: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&q=80',
    category: 'Electronics',
    price: 249.99,
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
    status: 'active' as const,
    available_quantity: 75,
  },
  {
    sku: 'CC-001',
    name: 'Gourmet Coffee Collection',
    description: 'Embark on a global coffee journey with our Gourmet Coffee Collection. This carefully curated set features 6 distinct varieties from renowned coffee regions including Ethiopia, Colombia, Brazil, and Indonesia. Each 250g bag is freshly roasted to perfection, bringing unique flavors and aromas to your daily brew. Includes tasting notes and brewing guides.',
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
    category: 'Food & Beverage',
    price: 79.99,
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
    status: 'active' as const,
    available_quantity: 100,
  },
  {
    sku: 'SP-001',
    name: 'Luxury Spa Gift Set',
    description: 'Transform your bathroom into a luxurious spa retreat with this comprehensive wellness collection. Featuring organic bath salts, essential oil blends, premium body lotions, and artisanal soaps, every product is carefully crafted with natural ingredients. The set includes a plush bamboo towel and comes in beautiful eco-friendly packaging.',
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    category: 'Wellness',
    price: 129.99,
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
    status: 'active' as const,
    available_quantity: 60,
  },
  {
    sku: 'CK-001',
    name: 'Professional Chef Knife Set',
    description: 'Elevate your cooking experience with this professional-grade knife set. Crafted from premium high-carbon German stainless steel, each knife is precision-forged for exceptional sharpness and durability. The ergonomic handles provide perfect balance and control. Includes a chef\'s knife, santoku, utility knife, paring knife, bread knife, and a beautiful wooden block.',
    image_url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80',
    category: 'Home & Kitchen',
    price: 189.99,
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
    status: 'active' as const,
    available_quantity: 40,
  },
  {
    sku: 'PS-001',
    name: 'Portable Bluetooth Speaker',
    description: 'Take your music anywhere with this powerful portable speaker. Featuring 360-degree sound dispersion, enhanced bass response, and crystal-clear audio, it delivers an immersive listening experience. The rugged, waterproof design (IPX7 rated) makes it perfect for outdoor adventures, pool parties, or beach trips. Connect two speakers for stereo sound.',
    image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
    category: 'Electronics',
    price: 149.99,
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
    status: 'active' as const,
    available_quantity: 85,
  },
];

let successCount = 0;
let errorCount = 0;

for (const productData of defaultProducts) {
  try {
    const product = await db.createProduct({
      catalog_id: defaultCatalog.id,
      ...productData,
      currency: 'USD',
    });
    console.log(`✅ Created product: ${product.name} (${product.sku})`);
    successCount++;
  } catch (error: any) {
    console.error(`❌ Failed to create product ${productData.sku}:`, error.message);
    errorCount++;
  }
}

console.log('');
console.log('================================================================================');
console.log('Seeding Summary');
console.log('================================================================================');
console.log('✅ Successful:', successCount);
console.log('❌ Errors:', errorCount);
console.log('📊 Total:', defaultProducts.length);
console.log('');

if (errorCount === 0) {
  console.log('🎉 All products seeded successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Verify products: SELECT * FROM products;');
  console.log('2. Test API endpoints');
  console.log('3. Measure performance improvements');
} else {
  console.log('⚠️  Some products failed to seed');
}

console.log('');
