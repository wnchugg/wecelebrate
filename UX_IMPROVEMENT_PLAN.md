# UX Improvement Implementation Plan

## Overview
Comprehensive enhancement of the wecelebrate platform's user experience, admin features, and configuration capabilities.

---

## 1. Header & Footer System Enhancement

### 1.1 New Configuration Structure
**Location:** `/src/app/types/siteCustomization.ts`

```typescript
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
    };
    languageSelector: {
      enabled: boolean;
      position: 'left' | 'right';
    };
    siteSwitcher: {
      enabled: boolean;
      style: 'dropdown' | 'modal';
    };
    authButtons: {
      enabled: boolean;
      showWhenAuthenticated: boolean;
    };
    customContent?: {
      enabled: boolean;
      html: string;
      position: 'left' | 'center' | 'right';
    };
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
    };
    copyright: {
      enabled: boolean;
      text: string;
      year: 'auto' | number;
    };
    logos: {
      enabled: boolean;
      items: LogoItem[];
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
    authenticatedOnly: boolean;
    unauthenticatedOnly: boolean;
  };
}

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  external: boolean;
  icon?: string;
  badge?: string;
  submenu?: NavigationItem[];
}

interface FooterColumn {
  id: string;
  title: string;
  links: {
    label: string;
    url: string;
    external: boolean;
  }[];
}

interface SocialLink {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube';
  url: string;
}

interface LogoItem {
  url: string;
  alt: string;
  link?: string;
}
```

### 1.2 Client-Level Configuration
**Inheritance model:** Client → Site
- Client sets default header/footer
- Sites can override specific properties
- Fallback chain: Site → Client → Platform Default

### 1.3 New Component Structure
**Components to create/update:**
- `/src/app/components/layout/ConfigurableHeader.tsx`
- `/src/app/components/layout/ConfigurableFooter.tsx`
- `/src/app/components/layout/SiteSwitcherDropdown.tsx`
- `/src/app/components/layout/NavigationMenu.tsx`

---

## 2. Gift Selection Screen Enhancements

### 2.1 Configuration Options
**Add to Site Settings:**

```typescript
interface GiftSelectionConfig {
  layout: {
    style: 'grid' | 'list' | 'carousel';
    itemsPerRow: 3 | 4 | 5 | 6;
  };
  search: {
    enabled: boolean;
    placeholder: string;
    position: 'top' | 'sidebar';
  };
  filters: {
    enabled: boolean;
    position: 'top' | 'sidebar' | 'modal';
    categories: {
      enabled: boolean;
      label: string;
    };
    priceRange: {
      enabled: boolean;
      label: string;
    };
    customFilters: CustomFilter[];
  };
  sorting: {
    enabled: boolean;
    options: SortOption[];
    default: string;
  };
  display: {
    showPrices: boolean;
    showInventory: boolean;
    showRatings: boolean;
    showQuickView: boolean;
  };
}
```

### 2.2 Admin Interface
**Location:** `/src/app/pages/admin/GiftSelectionConfiguration.tsx`
- Toggle search visibility
- Toggle filter visibility  
- Configure sort options
- Preview changes

---

## 3. Client Portal Improvements

### 3.1 Default Site Selection
**Implementation:**
```typescript
interface ClientPortalConfig {
  defaultView: 'dashboard' | 'sites' | 'specific-site';
  defaultSiteId?: string; // For 'specific-site' mode
  siteSwitcher: {
    enabled: boolean;
    location: 'header' | 'sidebar' | 'both';
    grouping: 'market' | 'type' | 'status' | 'none';
  };
  quickActions: {
    enabled: boolean;
    actions: QuickAction[];
  };
}
```

### 3.2 Site Switcher in Header
- Dropdown showing all accessible sites
- Group by: Market, Site Type, Client
- Search functionality
- Recently accessed sites

### 3.3 Update ClientPortal.tsx
- Default to selected site immediately
- Show site switcher in header
- Persist user's last selected site

---

## 4. Enhanced Branding Management

### 4.1 Comprehensive Branding Config
**Add to Client/Site types:**

```typescript
interface BrandingAssets {
  logos: {
    primary: MediaAsset;
    secondary?: MediaAsset;
    favicon: MediaAsset;
    emailHeader?: MediaAsset;
  };
  images: {
    hero: MediaAsset;
    background?: MediaAsset;
    landingPage: MediaAsset[];
    welcomePage: MediaAsset[];
  };
  videos: {
    welcomeVideo?: MediaAsset;
    instructionalVideo?: MediaAsset;
    celebrationVideo?: MediaAsset;
  };
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSizeBase: number;
  };
  customCSS?: string; // Advanced users
}

interface MediaAsset {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  mimeType?: string;
  size?: number;
}
```

### 4.2 Admin Page
**Location:** `/src/app/pages/admin/BrandingConfiguration.tsx`
- Upload logos (multiple variants)
- Upload images for different pages
- Upload/embed videos
- Manage text content for all pages
- Color picker with preview
- Font selector
- Live preview panel

---

## 5. Review Screen Text Configuration

### 5.1 Configuration Structure
**Add to Site Settings:**

```typescript
interface ReviewScreenConfig {
  pageTitle: string;
  pageDescription: string;
  sections: {
    giftSummary: {
      title: string;
      showImage: boolean;
      showDescription: boolean;
    };
    shippingAddress: {
      title: string;
      showEditButton: boolean;
    };
    orderSummary: {
      title: string;
      showPricing: boolean;
      showEstimatedDelivery: boolean;
    };
  };
  confirmationText: {
    checkboxLabel: string;
    buttonText: string;
    loadingText: string;
  };
  disclaimers: {
    enabled: boolean;
    text: string;
    position: 'top' | 'bottom';
  };
  successMessage: {
    title: string;
    description: string;
  };
}
```

### 5.2 Admin Interface
**Add section to SiteConfiguration.tsx:**
- Configure all review screen text
- Preview panel
- Template library

---

## 6. Order Tracking Improvements

### 6.1 Public Order Tracking
**New route:** `/order-tracking/:orderId` or `/order-tracking?email=xxx&orderNumber=xxx`

**Features:**
- Enter order number + email
- View order status
- Track shipment
- Download invoice
- Contact support

### 6.2 Authenticated Order Tracking
**Route:** `/order-history`

**Features:**
- View all orders
- Filter by status, date
- Track each order
- Reorder functionality
- Download receipts

### 6.3 Configuration
```typescript
interface OrderTrackingConfig {
  public: {
    enabled: boolean;
    requireEmailVerification: boolean;
    showShippingDetails: boolean;
    allowCancellation: boolean;
  };
  authenticated: {
    enabled: boolean;
    showOrderHistory: boolean;
    enableReorder: boolean;
    downloadInvoice: boolean;
  };
  trackingIntegration: {
    provider: 'fedex' | 'ups' | 'usps' | 'custom';
    apiKey?: string;
    trackingUrlTemplate?: string;
  };
}
```

---

## Implementation Priority

### Phase 1 (High Priority)
1. ✅ Enhanced Header/Footer system with configuration
2. ✅ Site switcher in header for Client Portal
3. ✅ Gift selection screen toggle controls

### Phase 2 (Medium Priority)
4. ✅ Enhanced branding management
5. ✅ Review screen text configuration
6. ✅ Default site selection for Client Portal

### Phase 3 (Nice to Have)
7. ✅ Order tracking improvements
8. ✅ Advanced customization options

---

## Database Schema Updates

### New Tables/Fields Required:

```sql
-- Add to clients table
ALTER TABLE clients ADD COLUMN header_footer_config JSONB;
ALTER TABLE clients ADD COLUMN branding_assets JSONB;

-- Add to sites table
ALTER TABLE sites ADD COLUMN header_footer_config JSONB;
ALTER TABLE sites ADD COLUMN gift_selection_config JSONB;
ALTER TABLE sites ADD COLUMN review_screen_config JSONB;
ALTER TABLE sites ADD COLUMN order_tracking_config JSONB;
ALTER TABLE sites ADD COLUMN branding_assets JSONB;
ALTER TABLE sites ADD COLUMN custom_css TEXT;

-- Add to site_settings or create new site_configuration table
CREATE TABLE IF NOT EXISTS site_page_content (
  id TEXT PRIMARY KEY,
  site_id TEXT REFERENCES sites(id),
  page_name TEXT, -- 'landing', 'welcome', 'review', etc.
  content JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## UI/UX Consistency Guidelines

### Design System
- Use RecHUB magenta/pink as primary (#D91C81)
- Consistent spacing: 4, 8, 16, 24, 32, 48px
- Typography scale: 12, 14, 16, 18, 24, 32, 48px
- Border radius: 4px (small), 8px (medium), 16px (large)

### Component Patterns
- Loading states: Consistent spinners
- Error states: Consistent messaging
- Empty states: Helpful illustrations + CTAs
- Success feedback: Toast notifications

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch-friendly targets (min 44x44px)
- Readable text (min 16px on mobile)

---

## Testing Strategy

### Unit Tests
- Configuration merge logic
- Component rendering with different configs
- Permission checks

### Integration Tests
- Header/Footer display rules
- Site switcher functionality
- Configuration inheritance

### E2E Tests
- Complete user flow with custom branding
- Order tracking (authenticated & public)
- Gift selection with filters hidden

---

## Documentation Needs

1. **Admin Guide:**
   - How to configure header/footer
   - How to set up branding
   - How to customize each page

2. **Development Guide:**
   - Configuration schema reference
   - Adding new customization options
   - Theme system overview

3. **User Guide:**
   - How to use site switcher
   - How to track orders
   - How to navigate the platform

---

## Next Steps

1. Review and approve this plan
2. Create type definitions
3. Update database schema
4. Implement Phase 1 features
5. Create admin interfaces
6. Test and refine
7. Deploy incrementally

Would you like me to start implementing any specific part of this plan?
