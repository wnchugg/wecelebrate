export interface SiteTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  useCase: string;
  features: string[];
  defaultSettings: {
    validationMethod: 'email' | 'employeeId' | 'serialCard';
    allowQuantitySelection: boolean;
    showPricing: boolean;
    giftsPerUser: number;
    shippingMode: 'company' | 'employee';
    defaultLanguage: string;
    enableLanguageSelector: boolean;
  };
  suggestedBranding: {
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
  };
}

export const siteTemplates: SiteTemplate[] = [
  {
    id: 'event-gifting',
    name: 'Event Gifting',
    description: 'Perfect for corporate events, conferences, and celebrations where attendees can choose their own gifts',
    icon: '🎉',
    useCase: 'Corporate events, conferences, holiday parties, milestone celebrations',
    features: [
      'Single gift selection per attendee',
      'Email or serial card validation',
      'Employee shipping address choice',
      'No pricing displayed to recipients',
      'Multi-language support',
      'Quick redemption process'
    ],
    defaultSettings: {
      validationMethod: 'serialCard',
      allowQuantitySelection: false,
      showPricing: false,
      giftsPerUser: 1,
      shippingMode: 'employee',
      defaultLanguage: 'en',
      enableLanguageSelector: true,
    },
    suggestedBranding: {
      primaryColor: '#D91C81',
      secondaryColor: '#1B2A5E',
      tertiaryColor: '#00B4CC',
    },
  },
  {
    id: 'onboarding-kit',
    name: 'Employee Onboarding Kit',
    description: 'Streamline new hire onboarding with customizable welcome kits and essential equipment',
    icon: '👋',
    useCase: 'New employee welcome kits, first-day essentials, equipment provisioning',
    features: [
      'Multiple item selection (kit bundles)',
      'Employee ID validation',
      'Pre-configured item bundles',
      'Quantity selection per item',
      'Ship to home or office',
      'Onboarding workflow integration'
    ],
    defaultSettings: {
      validationMethod: 'employeeId',
      allowQuantitySelection: true,
      showPricing: false,
      giftsPerUser: 5,
      shippingMode: 'employee',
      defaultLanguage: 'en',
      enableLanguageSelector: false,
    },
    suggestedBranding: {
      primaryColor: '#0066CC',
      secondaryColor: '#003366',
      tertiaryColor: '#7AC142',
    },
  },
  {
    id: 'recognition-awards',
    name: 'Recognition & Awards',
    description: 'Celebrate employee achievements with personalized recognition gifts',
    icon: '🏆',
    useCase: 'Employee recognition, service awards, performance bonuses, achievement rewards',
    features: [
      'Premium gift selection',
      'Email validation with manager approval',
      'Single high-value item selection',
      'Personalization options',
      'Gift wrapping and cards',
      'Milestone tracking'
    ],
    defaultSettings: {
      validationMethod: 'email',
      allowQuantitySelection: false,
      showPricing: false,
      giftsPerUser: 1,
      shippingMode: 'employee',
      defaultLanguage: 'en',
      enableLanguageSelector: true,
    },
    suggestedBranding: {
      primaryColor: '#8B0000',
      secondaryColor: '#2C1810',
      tertiaryColor: '#DAA520',
    },
  },
  {
    id: 'wellness-program',
    name: 'Wellness Program',
    description: 'Support employee wellbeing with health and wellness product selections',
    icon: '🧘',
    useCase: 'Corporate wellness programs, health initiatives, fitness challenges',
    features: [
      'Multiple wellness items',
      'Department-based validation',
      'Flexible quantity selection',
      'Seasonal refresh options',
      'Integration with wellness platforms',
      'Progress tracking'
    ],
    defaultSettings: {
      validationMethod: 'email',
      allowQuantitySelection: true,
      showPricing: false,
      giftsPerUser: 3,
      shippingMode: 'employee',
      defaultLanguage: 'en',
      enableLanguageSelector: true,
    },
    suggestedBranding: {
      primaryColor: '#00A651',
      secondaryColor: '#005A2B',
      tertiaryColor: '#7AC142',
    },
  },
  {
    id: 'client-appreciation',
    name: 'Client Appreciation',
    description: 'Strengthen client relationships with curated gift selections',
    icon: '🤝',
    useCase: 'Client gifts, partner appreciation, customer loyalty programs',
    features: [
      'Premium gift curation',
      'Serial card validation (unique codes)',
      'Single luxury item selection',
      'Company shipping address option',
      'Custom branding and messaging',
      'VIP white-glove service'
    ],
    defaultSettings: {
      validationMethod: 'serialCard',
      allowQuantitySelection: false,
      showPricing: false,
      giftsPerUser: 1,
      shippingMode: 'employee',
      defaultLanguage: 'en',
      enableLanguageSelector: true,
    },
    suggestedBranding: {
      primaryColor: '#1B2A5E',
      secondaryColor: '#0F1729',
      tertiaryColor: '#C9A85C',
    },
  },
  {
    id: 'company-store',
    name: 'Company Store',
    description: 'Full-featured company merchandise store with branded swag and apparel',
    icon: '🛍️',
    useCase: 'Company merchandise, branded swag, team apparel, promotional items',
    features: [
      'Unlimited item selection',
      'Email domain validation',
      'Size and color variations',
      'Shopping cart functionality',
      'Inventory management',
      'Reorder capabilities'
    ],
    defaultSettings: {
      validationMethod: 'email',
      allowQuantitySelection: true,
      showPricing: false,
      giftsPerUser: 10,
      shippingMode: 'employee',
      defaultLanguage: 'en',
      enableLanguageSelector: true,
    },
    suggestedBranding: {
      primaryColor: '#FF6600',
      secondaryColor: '#CC5200',
      tertiaryColor: '#FFB84D',
    },
  },
];

export function getTemplateById(id: string): SiteTemplate | undefined {
  return siteTemplates.find(template => template.id === id);
}
