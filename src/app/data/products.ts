export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  points?: number;
  image: string;
  category: string;
  inStock: boolean;
  features?: string[];
}

export const products: Product[] = [
  {
    id: "GWAMTR0001",
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with active noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
    price: 299.99,
    points: 3000,
    image: "https://images.unsplash.com/photo-1738920424218-3d28b951740a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwaGVhZHBob25lcyUyMHByb2R1Y3R8ZW58MXx8fHwxNzY5NzE2NDg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Electronics",
    inStock: true,
    features: [
      "Active Noise Cancellation",
      "40-hour battery life",
      "Premium sound quality",
      "Comfortable fit"
    ]
  },
  {
    id: "GWAMTR0002",
    name: "Luxury Smart Watch",
    description: "Elegant smart watch with fitness tracking, heart rate monitoring, and premium design. Stay connected in style.",
    price: 449.99,
    points: 4500,
    image: "https://images.unsplash.com/photo-1704961212944-524f56df23fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd2F0Y2glMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY5ODA3NDIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Electronics",
    inStock: true,
    features: [
      "Fitness tracking",
      "Heart rate monitor",
      "Water resistant",
      "7-day battery life"
    ]
  },
  {
    id: "GWAMTR0003",
    name: "Portable Bluetooth Speaker",
    description: "Powerful portable speaker with 360-degree sound and waterproof design. Perfect for any occasion.",
    price: 149.99,
    points: 1500,
    image: "https://images.unsplash.com/photo-1732618006141-11bd9540dcc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMHNwZWFrZXIlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzY5ODA3NDIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Electronics",
    inStock: true,
    features: [
      "360-degree sound",
      "Waterproof IPX7",
      "20-hour battery",
      "Portable design"
    ]
  },
  {
    id: "GWAMTR0004",
    name: "Premium Coffee Maker",
    description: "Professional-grade coffee maker with multiple brewing options. Start your day right with the perfect cup.",
    price: 199.99,
    points: 2000,
    image: "https://images.unsplash.com/photo-1724331504802-4cf4d933c699?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBtYWtlciUyMHByZW1pdW18ZW58MXx8fHwxNzY5ODA3MjczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Kitchen",
    inStock: true,
    features: [
      "Multiple brewing modes",
      "Programmable timer",
      "Thermal carafe",
      "Easy to clean"
    ]
  },
  {
    id: "GWAMTR0005",
    name: "Designer Backpack",
    description: "Modern, stylish backpack with laptop compartment and premium materials. Perfect for work and travel.",
    price: 129.99,
    points: 1300,
    image: "https://images.unsplash.com/photo-1766384093156-6189a8aa564f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNrcGFjayUyMG1vZGVybiUyMGxpZmVzdHlsZXxlbnwxfHx8fDE3Njk4MDc0MjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Accessories",
    inStock: true,
    features: [
      "Laptop compartment",
      "Water resistant",
      "Ergonomic design",
      "Multiple pockets"
    ]
  },
  {
    id: "GWAMTR0006",
    name: "Premium Tablet",
    description: "Latest generation tablet with stunning display and powerful performance. Entertainment and productivity combined.",
    price: 599.99,
    points: 6000,
    image: "https://images.unsplash.com/photo-1760708369071-e8a50a8979cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWJsZXQlMjBkZXZpY2UlMjBtb2Rlcm58ZW58MXx8fHwxNzY5NzM0NjUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Electronics",
    inStock: true,
    features: [
      "11-inch display",
      "All-day battery",
      "Fast processor",
      "Premium design"
    ]
  },
  {
    id: "GWAMTR0007",
    name: "Executive Gift Set",
    description: "Elegant corporate gift set perfect for celebrating achievements and milestones. Premium quality.",
    price: 249.99,
    points: 2500,
    image: "https://images.unsplash.com/photo-1761394042553-0cf1e534f5b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBnaWZ0JTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzY5ODA3NDI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Gift Sets",
    inStock: true,
    features: [
      "Premium packaging",
      "Multiple items",
      "Corporate quality",
      "Gift ready"
    ]
  },
  {
    id: "GWAMTR0008",
    name: "Wireless Charging Pad",
    description: "Fast wireless charging for all compatible devices. Sleek design fits any desk or nightstand.",
    price: 49.99,
    points: 500,
    image: "https://images.unsplash.com/photo-1591290619762-0f0e8b809966?w=1080",
    category: "Electronics",
    inStock: true,
    features: [
      "Fast charging",
      "Universal compatibility",
      "Sleek design",
      "LED indicators"
    ]
  }
];
