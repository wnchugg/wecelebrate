export interface Gift {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
}

// Sample gift catalog (3-10 items)
export const availableGifts: Gift[] = [
  {
    id: 'gift-1',
    name: 'Premium Noise-Cancelling Headphones',
    description: 'High-quality wireless headphones with active noise cancellation, perfect for music lovers and remote workers.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Electronics',
  },
  {
    id: 'gift-2',
    name: 'Luxury Spa Gift Set',
    description: 'Premium spa collection featuring organic bath products, aromatherapy oils, and plush towels.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    category: 'Wellness',
  },
  {
    id: 'gift-3',
    name: 'Gourmet Food & Wine Basket',
    description: 'Curated selection of artisanal cheeses, premium wines, and gourmet treats from around the world.',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80',
    category: 'Food & Beverage',
  },
  {
    id: 'gift-4',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and comprehensive health insights.',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    category: 'Electronics',
  },
  {
    id: 'gift-5',
    name: 'Designer Leather Backpack',
    description: 'Handcrafted Italian leather backpack with laptop compartment and sophisticated design.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    category: 'Fashion',
  },
  {
    id: 'gift-6',
    name: 'Premium Coffee Experience',
    description: 'High-end espresso machine with selection of specialty coffee beans and barista accessories.',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    category: 'Food & Beverage',
  },
  {
    id: 'gift-7',
    name: 'Outdoor Adventure Kit',
    description: 'Complete camping and hiking gear including tent, sleeping bag, and essential outdoor equipment.',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    category: 'Outdoor',
  },
  {
    id: 'gift-8',
    name: 'Art & Craft Supplies Set',
    description: 'Professional-grade art supplies including paints, brushes, canvas, and premium sketchbooks.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    category: 'Creative',
  },
];