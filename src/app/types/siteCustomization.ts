/**
 * Site Customization Types
 * Comprehensive configuration for headers, footers, branding, and page content
 */

// ============================================================================
// HEADER & FOOTER CONFIGURATION
// ============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  external: boolean;
  icon?: string;
  badge?: string;
  requiresAuth?: boolean;
  submenu?: NavigationItem[];
  order: number;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: {
    label: string;
    url: string;
    external: boolean;
  }[];
  order: number;
}

export type SocialPlatform = 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'tiktok';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label?: string;
}

export interface LogoItem {
  url: string;
  alt: string;
  link?: string;
  height?: number;
}

export interface HeaderFooterConfig {
  // Header Configuration
  header: {
    enabled: boolean;
    layout: 'simple' | 'full' | 'minimal';
    logo: {
      url: string;
      alt: string;
      height: number;
      link: string; // Where clicking logo goes
    };
    navigation: {
      enabled: boolean;
      items: NavigationItem[];
    };
    progressBar: {
      enabled: boolean;
      style: 'steps' | 'bar' | 'dots';
      showLabels: boolean;
    };
    languageSelector: {
      enabled: boolean;
      position: 'left' | 'right';
    };
    siteSwitcher: {
      enabled: boolean;
      style: 'dropdown' | 'modal';
      showInHeader: boolean;
    };
    authButtons: {
      enabled: boolean;
      showWhenAuthenticated: boolean;
      showWhenUnauthenticated: boolean;
    };
    search: {
      enabled: boolean;
      placeholder: string;
    };
    customContent?: {
      enabled: boolean;
      html: string;
      position: 'left' | 'center' | 'right';
    };
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  };
  
  // Footer Configuration
  footer: {
    enabled: boolean;
    layout: 'simple' | 'multi-column' | 'minimal';
    backgroundColor: string;
    textColor: string;
    links: {
      enabled: boolean;
      columns: FooterColumn[];
    };
    social: {
      enabled: boolean;
      links: SocialLink[];
      title?: string;
    };
    copyright: {
      enabled: boolean;
      text: string;
      year: 'auto' | number;
      companyName?: string;
    };
    logos: {
      enabled: boolean;
      items: LogoItem[];
      title?: string;
    };
    newsletter: {
      enabled: boolean;
      title: string;
      placeholder: string;
      buttonText: string;
    };
    customContent?: {
      enabled: boolean;
      html: string;
      position: 'top' | 'bottom';
    };
  };
  
  // Global Settings
  sticky: {
    header: boolean;
    footer: boolean;
  };
  
  // Conditional Display Rules
  display: {
    hideOnRoutes: string[]; // e.g., ['/access', '/landing']
    showOnlyOnRoutes?: string[]; // If set, only show on these routes
    authenticatedOnly: boolean;
    unauthenticatedOnly: boolean;
  };
}

// ============================================================================
// BRANDING ASSETS
// ============================================================================

export interface MediaAsset {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  mimeType?: string;
  size?: number;
  uploadedAt?: string;
}

export interface BrandingAssets {
  logos: {
    primary: MediaAsset;
    secondary?: MediaAsset;
    favicon?: MediaAsset;
    emailHeader?: MediaAsset;
    darkMode?: MediaAsset; // For dark backgrounds
  };
  images: {
    hero?: MediaAsset;
    background?: MediaAsset;
    landingPage: MediaAsset[];
    welcomePage: MediaAsset[];
    aboutPage?: MediaAsset[];
  };
  videos: {
    welcomeVideo?: MediaAsset;
    instructionalVideo?: MediaAsset;
    celebrationVideo?: MediaAsset;
    backgroundVideo?: MediaAsset;
  };
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    background: string;
    text: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSizeBase: number;
    fontWeights?: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  customCSS?: string; // Advanced users
}

// ============================================================================
// GIFT SELECTION CONFIGURATION
// ============================================================================

export interface CustomFilter {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options?: string[];
  field: string; // Product field to filter on
}

export interface SortOption {
  id: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

export interface GiftSelectionConfig {
  layout: {
    style: 'grid' | 'list' | 'carousel' | 'masonry';
    itemsPerRow: 2 | 3 | 4 | 5 | 6;
    itemsPerPage: number;
    showPagination: boolean;
    showLoadMore: boolean;
  };
  search: {
    enabled: boolean;
    placeholder: string;
    position: 'top' | 'sidebar';
    showSearchButton: boolean;
    liveSearch: boolean;
  };
  filters: {
    enabled: boolean;
    position: 'top' | 'sidebar' | 'modal';
    collapsible: boolean;
    categories: {
      enabled: boolean;
      label: string;
    };
    priceRange: {
      enabled: boolean;
      label: string;
      min?: number;
      max?: number;
    };
    customFilters: CustomFilter[];
  };
  sorting: {
    enabled: boolean;
    position: 'top' | 'sidebar';
    options: SortOption[];
    default: string;
  };
  display: {
    showPrices: boolean;
    showInventory: boolean;
    showRatings: boolean;
    showQuickView: boolean;
    showCompare: boolean;
    showWishlist: boolean;
    imageAspectRatio: '1:1' | '4:3' | '16:9';
    hoverEffect: 'zoom' | 'lift' | 'none';
  };
  messages: {
    noResults: string;
    loading: string;
    error: string;
    selectGiftPrompt: string;
  };
}

// ============================================================================
// REVIEW SCREEN CONFIGURATION
// ============================================================================

export interface ReviewScreenConfig {
  pageTitle: string;
  pageDescription: string;
  sections: {
    giftSummary: {
      enabled: boolean;
      title: string;
      showImage: boolean;
      showDescription: boolean;
      showFeatures: boolean;
      showSKU: boolean;
    };
    shippingAddress: {
      enabled: boolean;
      title: string;
      showEditButton: boolean;
      showMapPreview: boolean;
    };
    orderSummary: {
      enabled: boolean;
      title: string;
      showPricing: boolean;
      showTax: boolean;
      showShipping: boolean;
      showEstimatedDelivery: boolean;
    };
  };
  confirmationText: {
    checkboxLabel: string;
    checkboxRequired: boolean;
    buttonText: string;
    loadingText: string;
    successText: string;
  };
  disclaimers: {
    enabled: boolean;
    text: string;
    position: 'top' | 'bottom';
    requireAcknowledgment: boolean;
  };
  termsAndConditions: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
  successMessage: {
    title: string;
    description: string;
    showOrderNumber: boolean;
    showNextSteps: boolean;
    redirectAfterSeconds?: number;
    redirectUrl?: string;
  };
}

// ============================================================================
// CLIENT PORTAL CONFIGURATION
// ============================================================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  url: string;
  color?: string;
  requiresPermission?: string;
}

export interface ClientPortalConfig {
  defaultView: 'dashboard' | 'sites' | 'specific-site';
  defaultSiteId?: string; // For 'specific-site' mode
  siteSwitcher: {
    enabled: boolean;
    location: 'header' | 'sidebar' | 'both';
    grouping: 'market' | 'type' | 'status' | 'client' | 'none';
    showSearch: boolean;
    showRecent: boolean;
    recentCount: number;
  };
  dashboard: {
    widgets: {
      ordersOverview: boolean;
      recentOrders: boolean;
      popularGifts: boolean;
      analytics: boolean;
      notifications: boolean;
    };
    layout: 'grid' | 'list';
  };
  quickActions: {
    enabled: boolean;
    actions: QuickAction[];
  };
  branding: {
    showClientLogo: boolean;
    showWelcomeMessage: boolean;
    welcomeMessage?: string;
  };
}

// ============================================================================
// ORDER TRACKING CONFIGURATION
// ============================================================================

export interface OrderTrackingConfig {
  public: {
    enabled: boolean;
    requireEmailVerification: boolean;
    allowOrderNumberOnly: boolean;
    showShippingDetails: boolean;
    showOrderItems: boolean;
    showPricing: boolean;
    allowCancellation: boolean;
    cancellationWindow: number; // hours
  };
  authenticated: {
    enabled: boolean;
    showOrderHistory: boolean;
    enableReorder: boolean;
    downloadInvoice: boolean;
    enableReviews: boolean;
    showLoyaltyPoints: boolean;
  };
  trackingIntegration: {
    provider: 'fedex' | 'ups' | 'usps' | 'dhl' | 'custom' | 'none';
    apiKey?: string;
    trackingUrlTemplate?: string; // {{tracking_number}}
    showMap: boolean;
    autoRefresh: boolean;
    refreshInterval: number; // seconds
  };
  notifications: {
    emailOnShipment: boolean;
    emailOnDelivery: boolean;
    smsOnShipment: boolean;
    smsOnDelivery: boolean;
  };
  statusLabels: {
    pending: string;
    processing: string;
    shipped: string;
    delivered: string;
    cancelled: string;
    returned: string;
  };
}

// ============================================================================
// PAGE CONTENT CONFIGURATION
// ============================================================================

export interface PageContent {
  id: string;
  siteId: string;
  pageName: 'landing' | 'welcome' | 'review' | 'confirmation' | 'about' | 'faq' | 'custom';
  content: {
    hero?: {
      title: string;
      subtitle: string;
      image?: MediaAsset;
      video?: MediaAsset;
      ctaText?: string;
      ctaUrl?: string;
    };
    sections: {
      id: string;
      type: 'text' | 'image' | 'video' | 'html' | 'grid' | 'carousel';
      title?: string;
      content: string | MediaAsset | MediaAsset[];
      layout?: string;
      backgroundColor?: string;
      order: number;
    }[];
  };
  seo?: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const defaultHeaderFooterConfig: HeaderFooterConfig = {
  header: {
    enabled: true,
    layout: 'full',
    logo: {
      url: '',
      alt: 'Logo',
      height: 40,
      link: '/',
    },
    navigation: {
      enabled: false,
      items: [],
    },
    progressBar: {
      enabled: true,
      style: 'steps',
      showLabels: true,
    },
    languageSelector: {
      enabled: true,
      position: 'right',
    },
    siteSwitcher: {
      enabled: false,
      style: 'dropdown',
      showInHeader: true,
    },
    authButtons: {
      enabled: false,
      showWhenAuthenticated: false,
      showWhenUnauthenticated: false,
    },
    search: {
      enabled: false,
      placeholder: 'Search...',
    },
  },
  footer: {
    enabled: true,
    layout: 'simple',
    backgroundColor: '#1B2A5E',
    textColor: '#FFFFFF',
    links: {
      enabled: true,
      columns: [
        {
          id: 'legal',
          title: 'Legal',
          order: 1,
          links: [
            { label: 'Privacy Policy', url: '/privacy', external: false },
            { label: 'Cookie Policy', url: '/cookies', external: false },
          ],
        },
      ],
    },
    social: {
      enabled: false,
      links: [],
    },
    copyright: {
      enabled: true,
      text: 'All rights reserved',
      year: 'auto',
    },
    logos: {
      enabled: false,
      items: [],
    },
    newsletter: {
      enabled: false,
      title: 'Stay Updated',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
    },
  },
  sticky: {
    header: true,
    footer: false,
  },
  display: {
    hideOnRoutes: [],
    authenticatedOnly: false,
    unauthenticatedOnly: false,
  },
};

export const defaultGiftSelectionConfig: GiftSelectionConfig = {
  layout: {
    style: 'grid',
    itemsPerRow: 3,
    itemsPerPage: 12,
    showPagination: true,
    showLoadMore: false,
  },
  search: {
    enabled: true,
    placeholder: 'Search gifts...',
    position: 'top',
    showSearchButton: false,
    liveSearch: true,
  },
  filters: {
    enabled: true,
    position: 'sidebar',
    collapsible: true,
    categories: {
      enabled: true,
      label: 'Categories',
    },
    priceRange: {
      enabled: true,
      label: 'Price Range',
    },
    customFilters: [],
  },
  sorting: {
    enabled: true,
    position: 'top',
    options: [
      { id: 'name-asc', label: 'Name (A-Z)', field: 'name', direction: 'asc' },
      { id: 'name-desc', label: 'Name (Z-A)', field: 'name', direction: 'desc' },
      { id: 'price-asc', label: 'Price (Low to High)', field: 'price', direction: 'asc' },
      { id: 'price-desc', label: 'Price (High to Low)', field: 'price', direction: 'desc' },
    ],
    default: 'name-asc',
  },
  display: {
    showPrices: true,
    showInventory: true,
    showRatings: false,
    showQuickView: true,
    showCompare: false,
    showWishlist: false,
    imageAspectRatio: '1:1',
    hoverEffect: 'lift',
  },
  messages: {
    noResults: 'No gifts found matching your criteria.',
    loading: 'Loading gifts...',
    error: 'Unable to load gifts. Please try again.',
    selectGiftPrompt: 'Select a gift to continue',
  },
};

export const defaultReviewScreenConfig: ReviewScreenConfig = {
  pageTitle: 'Review Your Order',
  pageDescription: 'Please review your selection before confirming your order.',
  sections: {
    giftSummary: {
      enabled: true,
      title: 'Your Selected Gift',
      showImage: true,
      showDescription: true,
      showFeatures: true,
      showSKU: false,
    },
    shippingAddress: {
      enabled: true,
      title: 'Shipping Address',
      showEditButton: true,
      showMapPreview: false,
    },
    orderSummary: {
      enabled: true,
      title: 'Order Summary',
      showPricing: false,
      showTax: false,
      showShipping: false,
      showEstimatedDelivery: true,
    },
  },
  confirmationText: {
    checkboxLabel: 'I confirm this order is correct',
    checkboxRequired: true,
    buttonText: 'Confirm Order',
    loadingText: 'Processing your order...',
    successText: 'Order confirmed!',
  },
  disclaimers: {
    enabled: false,
    text: '',
    position: 'bottom',
    requireAcknowledgment: false,
  },
  termsAndConditions: {
    enabled: false,
    text: '',
  },
  successMessage: {
    title: 'Order Confirmed!',
    description: 'Thank you for your order. You will receive a confirmation email shortly.',
    showOrderNumber: true,
    showNextSteps: true,
    redirectAfterSeconds: 0,
  },
};