# Public Site Viewing Feature

## Overview
The JALA 2 platform supports viewing different client sites in their public-facing format. This allows administrators to preview how each site appears to end users with site-specific branding, configuration, and gifts.

## How It Works

### URL Structure
- **Default Site**: `https://your-domain.com/` - Shows the default or first active site
- **Site-Specific**: `https://your-domain.com/site/{siteId}` - Shows a specific site by ID

### Admin Features

#### 1. Dashboard - Public Site Preview Card
Location: `/admin/dashboard`

The Site Dashboard includes a "Public Site Preview" card that:
- Displays current site information (name, domain, colors, validation method)
- Shows site status (Live/Draft/Inactive)
- Provides a "View Public Site" button that opens the site in a new tab
- Displays the public URL for easy sharing

#### 2. Site Configuration - View Live Button
Location: `/admin/site-configuration`

The Site Configuration page header includes:
- A "View Live" button (shown when site status is active)
- Opens the site-specific public URL in a new tab
- Located in the top-right toolbar

#### 3. Site Management - Actions Dropdown
Location: `/admin/sites`

Each site in the Site Management table has a "More Actions" dropdown (⋮) that includes:
- Edit Basic Info
- Publish/Activate/Deactivate Site
- Duplicate Site
- Manage Gifts
- **View Public Site** ← Opens site in new tab
- Delete Site

## Technical Implementation

### Routes
```typescript
// Default public routes
/ → Landing page (first active site)
/access → Access validation
/welcome → Welcome page

// Site-specific routes
/site/:siteId → Landing page for specific site
/site/:siteId/access → Access validation for specific site
/site/:siteId/welcome → Welcome page for specific site
```

### Components

#### SiteLoader
- Intercepts site-specific URLs
- Loads the site by ID from the URL parameter
- Sets the site in PublicSiteContext
- Applies site-specific branding
- Shows loading state while fetching
- Shows error page if site not found

#### PublicSiteContext
- Manages current site state
- Provides `setSiteById(siteId)` function
- Applies site branding to CSS variables
- Loads site-specific gifts
- Caches selection in session storage

#### PublicSitePreview Component
- Displays site information in admin dashboard
- Generates site-specific URL
- Provides "View Public Site" button
- Shows helpful tips and URL for sharing

### Site Selection Persistence
When a user views a specific site:
1. Site ID is stored in `sessionStorage` as `selected_site_id`
2. Site data is stored in `sessionStorage` as `selected_site_data`
3. Subsequent visits to public pages use the cached site
4. Cache is cleared when navigating to a different site

### Site Branding
Each site can have custom:
- Primary color
- Secondary color
- Tertiary/Accent color
- Logo
- Domain name
- Validation method (email, employee ID, magic link, SSO, serial card)

These are applied dynamically when viewing the public site.

## User Flow

### Admin Viewing a Client Site

1. **From Dashboard**:
   - Navigate to `/admin/dashboard`
   - Select desired site from site selector (top navigation)
   - Click "View Public Site" in the Public Site Preview card
   - New tab opens with site-specific URL

2. **From Site Management**:
   - Navigate to `/admin/sites`
   - Find the desired site in the table
   - Click the "⋮" (More Actions) button
   - Select "View Public Site"
   - New tab opens with site-specific URL

3. **From Site Configuration**:
   - Navigate to `/admin/site-configuration`
   - Ensure desired site is selected
   - Click "View Live" button in top-right
   - New tab opens with site-specific URL

### End User Experience
When viewing a site-specific URL:
1. Site loads with custom branding
2. Landing page displays site-specific content
3. Access validation uses site's configured method
4. Gift selection shows site-assigned gifts
5. All pages reflect site branding and configuration

## Multi-Client Support

The system supports multiple clients, each with multiple sites:
- **Client A**
  - Site 1 (Event Gifting)
  - Site 2 (Service Awards)
- **Client B**
  - Site 1 (Onboarding Kit)
  - Site 2 (Employee Incentives)

Each site can be viewed independently with its own:
- Branding and colors
- Product catalog
- Access validation rules
- Language preferences
- Shipping configuration

## Testing

To test the public site viewing feature:

1. Create multiple sites with different branding
2. Assign different gifts to each site
3. Use the "View Public Site" button from various admin pages
4. Verify branding applies correctly
5. Verify URL structure is correct
6. Test site-specific pages (landing, access, welcome)
7. Confirm site selector updates current site
8. Check session storage persistence

## Benefits

1. **Multi-Tenant Architecture**: Each client has isolated branding and configuration
2. **Easy Preview**: Admins can quickly view how sites appear to end users
3. **Client Demos**: Share site-specific URLs for client review
4. **Testing**: Validate configuration changes before publishing
5. **Site Isolation**: Changes to one site don't affect others
6. **Brand Consistency**: Each site maintains its unique identity

## Future Enhancements

Potential improvements:
- Custom domain mapping (e.g., gifts.clientname.com)
- Site templates for quick setup
- A/B testing different landing pages
- White-label admin portal per client
- Site cloning for rapid deployment
- Multi-language site variants
