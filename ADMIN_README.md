# JALA 2 Admin Portal

## Accessing the Admin Portal

The admin portal can be accessed at: `/admin/login`

## Demo Credentials

**Super Admin:**
- Username: `admin`
- Password: `admin123`

**Manager:**
- Username: `manager`
- Password: `manager123`

## Multi-Site Management

The admin portal now supports managing multiple client sites from a single interface. Each site can have its own:
- Branding (colors, logo)
- Validation method (email, employee ID, or serial card)
- Gift catalog
- Access control lists
- Configuration settings
- Analytics and reporting

### Site Selector

Use the site selector in the top-right header to quickly switch between different client sites. The currently selected site is displayed with its branding colors and all data shown is specific to that site.

## Admin Features

### 1. Dashboard (`/admin/dashboard`)
- Current site information banner
- Overview of key metrics (total orders, active users, gifts, pending shipments)
- Recent orders list
- Popular gifts chart
- Quick action buttons
- Link to manage all sites

### 2. Site Management (`/admin/sites`) **NEW**
- View all client sites in one place
- Create new sites with 4-step wizard:
  - **Step 1: Template Selection** - Choose from 6 pre-configured site templates:
    - 🎉 **Event Gifting** - Corporate events, conferences, celebrations (serial card validation)
    - 👋 **Employee Onboarding Kit** - New hire welcome kits, equipment provisioning (employee ID validation)
    - 🏆 **Recognition & Awards** - Employee achievements, service awards (email validation)
    - 🧘 **Wellness Program** - Health and wellness product selections (email validation, multiple items)
    - 🤝 **Client Appreciation** - Premium client gifts, partner appreciation (serial card validation)
    - 🛍️ **Company Store** - Full company merchandise store with branded swag (email validation, unlimited items)
  - Step 2: Basic information (name, client, domain)
  - Step 3: Branding (primary, secondary, tertiary colors with live preview - pre-populated from template)
  - Step 4: Settings (validation method, shipping, language options - pre-configured from template)
- Each template includes:
  - Optimized default settings for specific use case
  - Suggested branding colors
  - Pre-configured validation method
  - Appropriate gifts per user limits
  - Feature list and use case description
- Quick statistics (total sites, active, draft, inactive)
- Search and filter sites by status
- Actions per site:

### 3. Gift Management (`/admin/gifts`) **ENHANCED**
- **Overview Dashboard:**
  - Total gifts count
  - Active gifts count
  - Low stock warnings (< 50 units)
  - Out of stock alerts
  
- **View Modes:**
  - Grid view with product cards (images, pricing, stock levels)
  - List view with detailed table
  - Quick toggle between views

- **Search & Filtering:**
  - Search by name, description, or SKU
  - Filter by category (10+ categories: Electronics, Drinkware, Office & Stationery, etc.)
  - Filter by status (Active, Inactive, Out of Stock)
  - Real-time filtering

- **Bulk Operations:**
  - Select multiple gifts with checkboxes
  - Bulk delete selected gifts
  - Select all / clear selection
  - Visual feedback for selected items

- **Add/Edit Gifts:**
  - Comprehensive gift creation form with sections:
    - **Basic Information:** Name, SKU, price, short & long descriptions, category, status
    - **Product Images:** Image URL with live preview
    - **Inventory Management:** Total and available inventory tracking with reserved calculation
    - **Product Attributes:** Brand, color, size, material, weight (all optional)
    - **Tags:** Add/remove custom tags for organization
  - Form validation and required field indicators
  - Auto-generate SKU suggestions
  - Image preview with error handling

- **Gift Details View:**
  - Large product image gallery
  - Complete product information
  - Real-time inventory status with visual progress bar
  - Stock level indicators (green/amber/red)
  - Product attributes display
  - Tags visualization
  - Metadata (creation date, last updated)
  - Quick edit access

- **Inventory Tracking:**
  - Total inventory count
  - Available units
  - Reserved/pending units
  - Visual stock indicators:
    - 🟢 Green: Healthy stock (50+ units)
    - 🟠 Amber: Low stock (< 50 units)
    - 🔴 Red: Out of stock
  - Stock percentage visualization

- **Categories:**
  - Electronics
  - Drinkware
  - Office & Stationery
  - Home & Living
  - Apparel
  - Food & Beverage
  - Wellness & Fitness
  - Bags & Accessories
  - Tech Accessories
  - Books & Media

- **Demo Data Included:**
  - 7 sample gifts with realistic details
  - Multiple product images
  - Various categories represented
  - Different stock levels
  - Complete attributes and descriptions

### 4. Order Management (`/admin/orders`)
- View all customer orders for current site
- Filter by status (pending, processing, shipped, delivered)
- Search orders by ID, user, or gift
- Bulk actions (mark as shipped/delivered)
- Export orders to CSV
- View order details and tracking information

### 5. Access Management (`/admin/access`)
- Switch between validation methods (Email, Employee ID, Serial Card)
- Manage authorized email addresses and domains
- Manage employee ID lists
- Generate and manage serial card numbers
- Import/export user lists via CSV
- Add, edit, and remove authorized users

### 6. Site Configuration (`/admin/configuration`)
- General settings (company name, portal title, welcome message)
- Branding (primary/secondary colors, logo upload)
- Gift selection settings (quantity selection, price display, gifts per user)
- Shipping settings (mode selection, default address)
- Language settings (default language, language selector toggle)

### 7. Analytics (`/admin/analytics`)
- Key performance metrics (users, orders, conversion rate)
- Date range filtering
- Orders over time chart
- Gift category distribution
- Top performing gifts table
- User engagement metrics

### 8. Audit Logs (`/admin/logs`)
- Security event monitoring
- Failed login attempts
- Access validation events
- Order creation/updates
- Gift management events
- Filter by status, action type
- Export logs for compliance
- IP address tracking

## Security Features

- Session-based authentication
- Protected routes (redirects to login if not authenticated)
- Audit logging for all admin actions
- Rate limiting on validation attempts
- Role-based access control (Super Admin, Admin, Manager)
- Secure logout functionality

## Navigation

The admin portal features a responsive sidebar with:
- Collapsible mobile menu
- Active page highlighting
- User profile display with role
- Quick logout button
- "View Site" link to main portal

## Integration with Main Site

The admin portal shares the same security and audit logging infrastructure as the main site, ensuring:
- All user actions are logged
- Consistent security policies
- Unified session management
- Comprehensive compliance coverage