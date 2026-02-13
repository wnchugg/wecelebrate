# Client-Site Architecture

## Overview

The JALA 2 platform now uses a hierarchical **Client → Sites** structure where:
- **Clients** are the top-level entities (e.g., "TechCorp Inc.", "GlobalRetail Group")
- Each **Client** can have multiple **Sites** (e.g., "US Site", "EU Site", "Brand A", "Country B")
- Each **Site** has its own branding, product assignments, and configuration

## Architecture

### Client Entity
```typescript
interface Client {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Example Use Cases:**
- "TechCorp Inc." (Client) → Multiple sites for different countries
- "GlobalRetail Group" (Client) → Multiple sites for different brands

### Site Entity
```typescript
interface Site {
  id: string;
  name: string;
  clientId: string;  // References the Client
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

**Example Use Cases:**
- "TechCorp US - Employee Gifts 2026" (Site) → USD, US shipping
- "TechCorp EU - Employee Recognition" (Site) → EUR, EU shipping
- "TechCorp Asia Pacific" (Site) → SGD, APAC shipping

## Key Features

### 1. Client Management (`/admin/clients`)
- Create, edit, and delete clients
- View all sites associated with each client
- Client-level contact information and configuration
- Cannot delete clients with active sites

### 2. Site Management (`/admin/sites`)
- Create, edit, and delete sites
- Filter sites by client
- Each site can represent:
  - Different geographic regions (US, EU, APAC)
  - Different brands (Premium, Essentials)
  - Different campaigns (Holiday 2026, Employee Recognition)
  - Different business units

### 3. Context Management
The `SiteContext` provides:
- `clients: Client[]` - All clients
- `sites: Site[]` - All sites
- `currentClient: Client | null` - Currently selected client
- `currentSite: Site | null` - Currently selected site
- `getClientById(id: string)` - Retrieve client by ID
- `getSitesByClient(clientId: string)` - Get all sites for a client

### 4. Admin Navigation
**Global Navigation:**
- Client Management - Manage all clients
- All Sites - View and manage all sites across clients
- Admin Users - Manage HALO employee access

**Site-Specific Navigation** (when a site is selected):
- Dashboard
- Reports
- Site Configuration
- Email Templates
- Product Assignment
- Shipping Configuration
- Access Management
- Order Management

## Demo Data

### Clients
1. **TechCorp Inc.** - Technology corporation with 3 sites (US, EU, APAC)
2. **GlobalRetail Group** - Retail company with 2 sites (Premium, Essentials)
3. **HealthCare Services Ltd.** - Healthcare provider with 1 site
4. **EduTech Solutions** - Educational technology with 1 site

### Example Sites
- **TechCorp US - Employee Gifts 2026**
  - USD currency, US-only
  - Email validation
  - Employee shipping mode

- **TechCorp EU - Employee Recognition**
  - EUR currency, Multiple EU countries
  - Email validation
  - Employee shipping mode

- **TechCorp Asia Pacific**
  - SGD currency, APAC countries
  - Employee ID validation
  - Company shipping mode

## Benefits of This Architecture

1. **Multi-Country Support** - Clients can have different sites for different countries with their own currencies and shipping configurations

2. **Multi-Brand Support** - Clients can have different sites for different brands with unique branding and product catalogs

3. **Campaign Flexibility** - Each site can represent a specific campaign or event

4. **Scalability** - Easy to add new sites under existing clients without creating entirely new client records

5. **Clear Hierarchy** - Client → Sites relationship makes it clear who owns what

6. **Centralized Client Data** - Contact information and client-level settings stored once at the client level

## Migration from Previous Structure

**Before:** Brand entities with embedded client information
```typescript
interface Brand {
  clientId: string;
  clientName: string;  // String field
  // ... other brand fields
}
```

**After:** Proper Client entities with Sites
```typescript
interface Client {
  id: string;
  name: string;
  // ... client-specific fields
}

interface Site {
  clientId: string;  // Foreign key to Client
  // ... site-specific fields
}
```

## Future Enhancements

1. **Client-Level Settings** - Add global settings at the client level that cascade to sites
2. **Site Groups** - Group sites within a client (e.g., "North America", "Europe")
3. **Client Portal** - Allow clients to manage their own sites
4. **Client-Level Reporting** - Aggregate reporting across all sites for a client
5. **Shared Resources** - Product catalogs, user lists, and other resources shared across sites within a client
