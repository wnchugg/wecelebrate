# Multi-Site Functionality - Implementation Guide

## Overview

The JALA 2 platform now includes comprehensive multi-site functionality that allows organizations to manage multiple gift selection sites under different clients. Each site can have its own branding, product catalog, validation methods, and configuration.

## Architecture

### Hierarchical Structure

```
Clients (Top Level)
  └── Sites (Multiple per client)
      ├── Branding (Colors, Logo)
      ├── Settings (Validation, Shipping, etc.)
      ├── Gift Assignments
      └── Orders
```

### Key Components

#### 1. Backend API Endpoints

**Public Endpoints (No Authentication Required):**
- `GET /public/sites` - List all active sites
- `GET /public/sites/:siteId` - Get site details by ID
- `GET /public/sites/:siteId/gifts` - Get gifts assigned to a site

**Admin Endpoints (Authentication Required):**
- `GET /sites` - List all sites
- `GET /sites/:id` - Get site by ID
- `POST /sites` - Create new site
- `PUT /sites/:id` - Update site
- `DELETE /sites/:id` - Delete site
- `GET /clients/:clientId/sites` - Get all sites for a client

#### 2. Frontend Components

**User-Facing Components:**
- `/src/app/pages/SiteSelection.tsx` - Site selection page for multi-site environments
- `/src/app/components/SiteSwitcher.tsx` - Dropdown to switch between sites
- `/src/app/context/PublicSiteContext.tsx` - Context for managing public site state

**Admin Components:**
- `/src/app/pages/admin/SiteManagement.tsx` - Site management dashboard
- `/src/app/components/admin/SitePreview.tsx` - Preview site configuration and appearance
- `/src/app/components/admin/CreateSiteModal.tsx` - Modal for creating new sites

## User Flow

### Public User Experience

1. **Site Selection** (if multiple sites available):
   - User lands on `/site-selection` or homepage
   - Sees list of available sites with:
     - Site name and domain
     - Branding preview (color swatches)
     - Validation method
     - Supported languages
   - Selects their target site
   - Selection is saved in sessionStorage

2. **Site-Specific Experience**:
   - Site branding is applied dynamically:
     - Primary, secondary, and tertiary colors
     - Logo (if configured)
   - Gift catalog shows only gifts assigned to the selected site
   - Validation method matches site configuration
   - Language options match site settings

3. **Site Switching**:
   - Users can switch sites via the SiteSwitcher component (if multiple sites)
   - Located in header/navigation
   - Preserves current page context where possible

### Admin Experience

1. **Client Management** (`/admin/clients`):
   - Create and manage top-level client organizations
   - View all sites under each client
   - Cannot delete clients with active sites

2. **Site Management** (`/admin/sites`):
   - View all sites across all clients
   - Filter by client, status (active/inactive/draft)
   - Create new sites with templates
   - Edit site configuration
   - Preview public site appearance
   - Assign gifts to sites

3. **Site Configuration** (`/admin/configuration`):
   - Configure site-specific settings:
     - Validation method (email, employee ID, serial card, magic link)
     - Shipping mode (company, employee, store pickup)
     - Branding (colors, logo)
     - Language and internationalization
     - Currency and allowed countries
     - Gifts per user limit

## Implementation Details

### Site Data Model

```typescript
interface Site {
  id: string;
  name: string;
  clientId: string;
  domain: string;
  status: 'active' | 'inactive' | 'draft';
  branding: {
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    logo?: string;
  };
  settings: {
    validationMethod: 'email' | 'employeeId' | 'serialCard' | 'magic_link';
    allowQuantitySelection: boolean;
    showPricing: boolean;
    giftsPerUser: number;
    shippingMode: 'company' | 'employee' | 'store';
    defaultShippingAddress?: string;
    defaultLanguage: string;
    enableLanguageSelector: boolean;
    defaultCurrency: string;
    allowedCountries: string[];
    defaultCountry: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Session Management

**Site Selection Storage:**
```javascript
// Save selected site
sessionStorage.setItem('selected_site_id', siteId);
sessionStorage.setItem('selected_site_data', JSON.stringify(site));

// Retrieve selected site
const siteId = sessionStorage.getItem('selected_site_id');
const siteData = JSON.parse(sessionStorage.getItem('selected_site_data'));
```

**Why sessionStorage?**
- Persists during browser session
- Cleared when browser/tab closes
- Isolated per tab (users can have different sites in different tabs)
- Prevents cross-site confusion

### Dynamic Branding Application

The `PublicSiteContext` applies branding by setting CSS custom properties:

```typescript
const applyBranding = (branding: PublicSite['branding']) => {
  document.documentElement.style.setProperty('--color-primary', branding.primaryColor);
  document.documentElement.style.setProperty('--color-secondary', branding.secondaryColor);
  document.documentElement.style.setProperty('--color-accent', branding.accentColor);
};
```

Components can then use these CSS variables:
```css
.button-primary {
  background-color: var(--color-primary);
}
```

### Gift Assignment

Gifts are assigned to sites via the site gift configuration:

1. **Storage Structure**:
   ```
   KV Store:
   - site_configs:{siteId} → { assignedGiftIds: string[] }
   - gifts:{giftId} → { id, name, description, ... }
   ```

2. **Assignment Flow**:
   - Admin navigates to Site Gift Assignment page
   - Selects a site from dropdown
   - Sees list of all available gifts
   - Toggles checkboxes to assign/unassign gifts
   - Saves configuration

3. **Public API**:
   - Public endpoint filters gifts by site assignment
   - Only returns available gifts
   - Respects site-specific pricing/display settings

## Routes

### Public Routes
- `/` - Landing page (uses default or saved site)
- `/site-selection` - Site selection page
- `/access` - Access validation (site-specific validation method)
- `/gift-selection` - Gift selection (site-specific catalog)

### Admin Routes
- `/admin/clients` - Client management
- `/admin/sites` - Site management
- `/admin/site-gift-assignment` - Assign gifts to sites
- `/admin/configuration` - Site configuration

## Translations

Multi-site related translations are in `/src/app/i18n/translations.ts`:

```typescript
// Site Selection
'siteSelection.title': 'Select Your Site',
'siteSelection.subtitle': 'Please choose the site you would like to access',
'siteSelection.selectSite': 'Select This Site',

// Site Switcher
'siteSwitcher.selectSite': 'Select Site',
'siteSwitcher.viewAllSites': 'View All Sites',
```

## Testing Multi-Site Functionality

### 1. Create Test Clients and Sites

```javascript
// Via Admin UI or API
const client1 = {
  name: "TechCorp Inc.",
  description: "Technology Corporation",
  isActive: true
};

const site1 = {
  name: "TechCorp US - Holiday Gifts 2026",
  clientId: client1.id,
  domain: "us.techcorp.com",
  status: "active",
  branding: {
    primaryColor: "#D91C81",
    secondaryColor: "#1B2A5E",
    tertiaryColor: "#00B4CC"
  },
  settings: {
    validationMethod: "email",
    shippingMode: "employee",
    defaultLanguage: "en",
    defaultCurrency: "USD",
    defaultCountry: "US",
    allowedCountries: ["US"],
    giftsPerUser: 1,
    showPricing: true
  }
};

const site2 = {
  name: "TechCorp EU - Employee Recognition",
  clientId: client1.id,
  domain: "eu.techcorp.com",
  status: "active",
  branding: {
    primaryColor: "#0066CC",
    secondaryColor: "#1B2A5E",
    tertiaryColor: "#00E5A0"
  },
  settings: {
    validationMethod: "employeeId",
    shippingMode: "company",
    defaultLanguage: "en",
    defaultCurrency: "EUR",
    defaultCountry: "DE",
    allowedCountries: ["DE", "FR", "IT", "ES"],
    giftsPerUser: 2,
    showPricing: false
  }
};
```

### 2. Assign Different Gifts to Each Site

1. Go to `/admin/site-gift-assignment`
2. Select "TechCorp US" site
3. Assign electronics and gadgets
4. Select "TechCorp EU" site
5. Assign wellness and lifestyle items

### 3. Test User Experience

1. **Clear Session**:
   ```javascript
   sessionStorage.clear();
   ```

2. **Visit Homepage**:
   - Should show site selection page if multiple active sites
   - Or auto-select first active site

3. **Select Site**:
   - Choose "TechCorp US"
   - Verify branding colors apply
   - Verify gift catalog shows only assigned gifts
   - Verify validation method matches

4. **Switch Sites**:
   - Use site switcher in header
   - Choose "TechCorp EU"
   - Verify branding updates
   - Verify gift catalog changes
   - Verify settings update

## Security Considerations

### 1. Data Isolation

- Sites are isolated at the data layer
- Each site can only access its assigned gifts
- Orders are tagged with siteId
- Admin access controls prevent cross-site data leakage

### 2. Public API Security

- Public endpoints only return active sites
- Sensitive configuration is filtered out
- Rate limiting applies to all public endpoints
- No authentication tokens exposed in public APIs

### 3. Session Security

- Site selection uses sessionStorage (not localStorage)
- Sessions are tab-isolated
- No sensitive data in session storage
- Admin actions require authentication

## Future Enhancements

### Phase 2 - Domain-Based Routing
- Auto-detect site based on domain/subdomain
- Custom domain support
- SSL certificate management

### Phase 3 - Advanced Multi-Tenancy
- Site groups (e.g., "North America", "Europe")
- Client portal for self-service site management
- Cross-site analytics and reporting
- Shared resource pools (gifts, employees)

### Phase 4 - White-Label Support
- Custom branding per site
- Custom email templates
- Custom domain names
- Custom authentication providers (SSO)

## Troubleshooting

### Issue: Site branding not applying
**Solution**: Check that `PublicSiteContext` is wrapping the app and `applyBranding()` is being called.

### Issue: Wrong gifts showing
**Solution**: Verify site gift assignments in `/admin/site-gift-assignment`. Check that `site_configs:{siteId}` exists in KV store.

### Issue: Site switcher not appearing
**Solution**: Ensure there are multiple active sites. Check `availableSites` in `PublicSiteContext`.

### Issue: Session lost on page refresh
**Solution**: sessionStorage should persist. Check browser settings and ensure JavaScript has access to sessionStorage.

## API Reference

### Get All Active Sites (Public)
```
GET /make-server-6fcaeea3/public/sites
Response: { sites: PublicSite[] }
```

### Get Site by ID (Public)
```
GET /make-server-6fcaeea3/public/sites/:siteId
Response: { site: PublicSite }
```

### Get Site Gifts (Public)
```
GET /make-server-6fcaeea3/public/sites/:siteId/gifts
Response: { gifts: PublicGift[] }
```

### Create Site (Admin)
```
POST /make-server-6fcaeea3/sites
Headers: X-Access-Token: {adminToken}
Body: { name, clientId, domain, status, branding, settings }
Response: { site: Site }
```

### Update Site (Admin)
```
PUT /make-server-6fcaeea3/sites/:id
Headers: X-Access-Token: {adminToken}
Body: Partial<Site>
Response: { site: Site }
```

## Summary

The multi-site functionality provides a robust foundation for managing multiple branded gift selection portals under a single platform. It supports:

✅ Multiple clients and sites
✅ Site-specific branding and configuration
✅ Isolated gift catalogs per site
✅ Dynamic branding application
✅ User-friendly site selection and switching
✅ Comprehensive admin management
✅ Public and authenticated APIs
✅ Security and data isolation

This implementation enables JALA 2 to serve multiple corporate clients with unique requirements while maintaining a single codebase and infrastructure.
