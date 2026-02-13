# Multi-Site Functionality - Quick Start Guide

## 5-Minute Setup

### Step 1: Create a Client

1. Login to admin panel: `/admin/login`
2. Navigate to **Client Management**: `/admin/clients`
3. Click **"Create Client"**
4. Fill in details:
   ```
   Name: TechCorp Inc.
   Description: Technology corporation based in California
   Contact Email: admin@techcorp.com
   Status: Active
   ```
5. Click **"Save"**

### Step 2: Create Sites

1. Navigate to **Site Management**: `/admin/sites`
2. Click **"Create Site"**
3. Fill in details for **Site #1**:
   ```
   Name: TechCorp US - Holiday Gifts 2026
   Client: TechCorp Inc.
   Domain: us.techcorp.com
   Status: Active
   
   Branding:
   - Primary Color: #D91C81 (Pink/Magenta)
   - Secondary Color: #1B2A5E (Deep Blue)
   - Tertiary Color: #00B4CC (Cyan)
   
   Settings:
   - Validation Method: Email
   - Shipping Mode: Employee (direct to employee)
   - Default Language: English
   - Default Currency: USD
   - Default Country: US
   - Allowed Countries: [US]
   - Gifts Per User: 1
   - Show Pricing: Yes
   ```
4. Click **"Save"**

5. Create **Site #2** with different branding:
   ```
   Name: TechCorp EU - Employee Recognition
   Client: TechCorp Inc.
   Domain: eu.techcorp.com
   Status: Active
   
   Branding:
   - Primary Color: #0066CC (Blue)
   - Secondary Color: #1B2A5E (Deep Blue)
   - Tertiary Color: #00E5A0 (Green)
   
   Settings:
   - Validation Method: Employee ID
   - Shipping Mode: Company
   - Default Language: English
   - Default Currency: EUR
   - Default Country: DE
   - Allowed Countries: [DE, FR, IT, ES, NL]
   - Gifts Per User: 2
   - Show Pricing: No
   ```

### Step 3: Create Gifts

1. Navigate to **Gift Management**: `/admin/gifts`
2. Create some sample gifts:
   
   **Electronics:**
   ```
   Name: Wireless Noise-Cancelling Headphones
   Category: Electronics
   Price: 199
   Description: Premium headphones with active noise cancellation
   Available: Yes
   ```
   
   **Wellness:**
   ```
   Name: Yoga Mat & Accessories Set
   Category: Wellness
   Price: 89
   Description: Complete yoga set with mat, blocks, and strap
   Available: Yes
   ```
   
   **Home & Living:**
   ```
   Name: Smart Coffee Maker
   Category: Home & Living
   Price: 149
   Description: WiFi-enabled programmable coffee maker
   Available: Yes
   ```

### Step 4: Assign Gifts to Sites

1. Navigate to **Site Gift Assignment**: `/admin/site-gift-assignment`
2. Select **"TechCorp US - Holiday Gifts 2026"** from dropdown
3. Check the boxes for:
   - ✅ Wireless Noise-Cancelling Headphones
   - ✅ Smart Coffee Maker
4. Click **"Save Assignment"**

5. Select **"TechCorp EU - Employee Recognition"** from dropdown
6. Check the boxes for:
   - ✅ Yoga Mat & Accessories Set
   - ✅ Smart Coffee Maker
7. Click **"Save Assignment"**

### Step 5: Test User Experience

1. **Open a new incognito/private window**
2. Navigate to homepage: `/`
3. You should see the **Site Selection Page** with both sites listed
4. Select **"TechCorp US - Holiday Gifts 2026"**
5. Verify:
   - ✅ Pink/magenta branding appears
   - ✅ Click "Get Started" → Access Validation uses **Email** method
   - ✅ After validation, gift selection shows:
     - Wireless Headphones ✅
     - Smart Coffee Maker ✅
     - Yoga Mat ❌ (not assigned to this site)

6. **Switch Sites:**
   - Use the Site Switcher in header (if visible)
   - Or navigate to `/site-selection`
   - Select **"TechCorp EU - Employee Recognition"**
7. Verify:
   - ✅ Blue branding appears
   - ✅ Access Validation uses **Employee ID** method
   - ✅ Gift selection shows:
     - Yoga Mat ✅
     - Smart Coffee Maker ✅
     - Wireless Headphones ❌ (not assigned to this site)

## Component Usage

### Show Site Selection Page

Force users to select a site on first visit:

```typescript
// In your router or App.tsx
import { SiteSelection } from '@/app/pages/SiteSelection';

// Add route
{ path: "site-selection", Component: SiteSelection }

// Redirect on first visit if no site selected
useEffect(() => {
  const siteId = sessionStorage.getItem('selected_site_id');
  if (!siteId && availableSites.length > 1) {
    navigate('/site-selection');
  }
}, []);
```

### Add Site Switcher to Header

```typescript
import { SiteSwitcher } from '@/app/components/SiteSwitcher';
import { usePublicSite } from '@/app/context/PublicSiteContext';

function Header() {
  const { site, availableSites, setSiteById } = usePublicSite();
  
  return (
    <header>
      <div className="flex items-center justify-between">
        <Logo />
        <SiteSwitcher
          currentSite={site}
          availableSites={availableSites}
          onSiteChange={setSiteById}
        />
      </div>
    </header>
  );
}
```

### Show Site Info Banner

```typescript
import { SiteInfoBanner } from '@/app/components/SiteInfoBanner';
import { usePublicSite } from '@/app/context/PublicSiteContext';

function Layout() {
  const { site } = usePublicSite();
  
  return (
    <div>
      {site && (
        <SiteInfoBanner
          siteName={site.name}
          siteId={site.id}
          primaryColor={site.branding.primaryColor}
        />
      )}
      {/* Rest of layout */}
    </div>
  );
}
```

### Admin: Preview Site

```typescript
import { SitePreview } from '@/app/components/admin/SitePreview';

function SiteManagement() {
  const [previewSite, setPreviewSite] = useState<Site | null>(null);
  
  return (
    <Dialog open={!!previewSite} onOpenChange={() => setPreviewSite(null)}>
      <DialogContent className="max-w-4xl">
        {previewSite && (
          <SitePreview 
            site={previewSite}
            onClose={() => setPreviewSite(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## Common Use Cases

### Use Case 1: Single Client, Multiple Regions

**Scenario:** TechCorp has offices in US, EU, and APAC, each needing localized sites.

**Setup:**
```
Client: TechCorp Inc.
  ├── Site: TechCorp US
  │   ├── Currency: USD
  │   ├── Countries: [US, CA]
  │   └── Gifts: US-specific catalog
  ├── Site: TechCorp EU
  │   ├── Currency: EUR
  │   ├── Countries: [DE, FR, IT, ES, NL]
  │   └── Gifts: EU-specific catalog
  └── Site: TechCorp APAC
      ├── Currency: SGD
      ├── Countries: [SG, MY, TH, VN]
      └── Gifts: APAC-specific catalog
```

### Use Case 2: Multiple Clients, Shared Platform

**Scenario:** HALO manages gifting for multiple corporate clients.

**Setup:**
```
Client: TechCorp Inc.
  └── Site: TechCorp Employee Gifts 2026

Client: RetailCo Ltd.
  └── Site: RetailCo Holiday Rewards

Client: HealthCare Services
  └── Site: HealthCare Anniversary Gifts
```

### Use Case 3: Multiple Brands Under One Client

**Scenario:** RetailGroup has multiple retail brands.

**Setup:**
```
Client: RetailGroup International
  ├── Site: Premium Brand - Executive Gifts
  │   ├── Branding: Gold/Black theme
  │   └── Gifts: High-end electronics, luxury items
  ├── Site: Essentials Brand - Team Rewards
  │   ├── Branding: Blue/White theme
  │   └── Gifts: Practical items, wellness products
  └── Site: Outlet Brand - Employee Recognition
      ├── Branding: Red/Orange theme
      └── Gifts: Budget-friendly options
```

## API Usage Examples

### Get All Sites (Public)

```javascript
import { publicSiteApi } from '@/app/utils/api';

const { sites } = await publicSiteApi.getActiveSites();
console.log(sites); // Array of active sites
```

### Get Specific Site (Public)

```javascript
const { site } = await publicSiteApi.getSiteById('site-12345');
console.log(site.name); // "TechCorp US - Holiday Gifts 2026"
```

### Get Site Gifts (Public)

```javascript
const { gifts } = await publicSiteApi.getSiteGifts('site-12345');
console.log(gifts); // Array of gifts assigned to this site
```

### Create Site (Admin)

```javascript
import { siteApi } from '@/app/utils/api';

const newSite = await siteApi.create({
  name: "NewCorp Employee Gifts",
  clientId: "client-67890",
  domain: "newcorp.gifts.com",
  status: "active",
  branding: {
    primaryColor: "#007BFF",
    secondaryColor: "#28A745",
    tertiaryColor: "#FFC107"
  },
  settings: {
    validationMethod: "email",
    shippingMode: "employee",
    defaultLanguage: "en",
    defaultCurrency: "USD",
    defaultCountry: "US",
    allowedCountries: ["US"],
    giftsPerUser: 1,
    showPricing: true,
    allowQuantitySelection: false,
    enableLanguageSelector: true
  }
});
```

## Troubleshooting

### Site Selection Page Not Showing

**Problem:** Homepage loads without showing site selection.

**Solutions:**
1. Check if multiple sites exist:
   ```javascript
   // In browser console
   sessionStorage.clear();
   window.location.reload();
   ```

2. Verify sites are active:
   - Go to `/admin/sites`
   - Check status column
   - Sites must be "active" to appear

### Branding Not Applying

**Problem:** Site colors not changing after site selection.

**Solutions:**
1. Check PublicSiteContext is wrapping your app
2. Verify branding object in site data:
   ```javascript
   const site = JSON.parse(sessionStorage.getItem('selected_site_data'));
   console.log(site.branding);
   ```
3. Check CSS custom properties:
   ```javascript
   // In browser console
   console.log(
     getComputedStyle(document.documentElement)
       .getPropertyValue('--color-primary')
   );
   ```

### Wrong Gifts Showing

**Problem:** User sees gifts not assigned to their site.

**Solutions:**
1. Verify gift assignments:
   - Go to `/admin/site-gift-assignment`
   - Select the site
   - Check which gifts are selected

2. Check site_configs in KV store:
   - Go to `/admin/data-diagnostic`
   - Look for key: `site_configs:{siteId}`
   - Verify `assignedGiftIds` array

### Site Switcher Not Appearing

**Problem:** Site switcher dropdown doesn't show.

**Solutions:**
1. Ensure `availableSites.length > 1`
2. Check that SiteSwitcher receives props:
   ```typescript
   <SiteSwitcher
     currentSite={site}
     availableSites={availableSites}
   />
   ```
3. Verify both sites are "active"

## Best Practices

### 1. Site Naming Convention

```
[Client Name] [Region/Brand] - [Campaign/Purpose] [Year]

Examples:
✅ TechCorp US - Holiday Gifts 2026
✅ RetailCo Premium - Executive Rewards Q1
✅ HealthCare APAC - Service Awards 2026
❌ Site 1
❌ Test Site
```

### 2. Domain Naming

```
[region/brand].[client].[platform].com

Examples:
✅ us.techcorp.gifts.com
✅ premium.retailco.rewards.com
✅ apac.healthcare.recognition.com
❌ site1.com
❌ test.localhost
```

### 3. Gift Assignment Strategy

- **Geography-based**: Different shipping regions = different catalogs
- **Value-based**: Different employee tiers = different gift values
- **Campaign-based**: Different events = different themed gifts
- **Mix and Match**: Some gifts shared, some exclusive

### 4. Color Scheme Selection

```
Primary: Main brand color (buttons, headers)
Secondary: Supporting color (footers, accents)
Tertiary: Highlight color (badges, notifications)

Ensure WCAG 2.0 contrast ratios:
- Primary text on white: ≥4.5:1
- Large text on primary: ≥3:1
```

### 5. Currency and Country Settings

- Set `defaultCurrency` to match `defaultCountry`
- Limit `allowedCountries` to regions you can ship to
- Use ISO currency codes (USD, EUR, GBP, JPY, etc.)
- Use ISO country codes (US, GB, DE, FR, etc.)

## Checklist for Going Live

- [ ] Clients created and active
- [ ] Sites created with correct branding
- [ ] Gifts created and marked available
- [ ] Gifts assigned to appropriate sites
- [ ] Test orders placed on each site
- [ ] Email validation working (if using email method)
- [ ] Shipping addresses configured
- [ ] Branding colors meet accessibility standards
- [ ] Site selection tested in incognito mode
- [ ] Multi-language support verified (if enabled)
- [ ] Admin users have access to all sites
- [ ] Backup of site configurations taken

## Getting Help

1. **Check Documentation**:
   - `/MULTI_SITE_IMPLEMENTATION.md` - Technical details
   - `/MULTI_SITE_SUMMARY.md` - Feature overview
   - `/CLIENT_SITE_ARCHITECTURE.md` - Architecture guide

2. **Debug Tools**:
   - `/admin/data-diagnostic` - View KV store data
   - `/system-status` - Check backend health
   - Browser DevTools → Network tab - Check API calls

3. **Common Issues**:
   - Site not appearing → Check status is "active"
   - Wrong branding → Clear sessionStorage and reselect
   - No gifts → Check site gift assignments
   - Access denied → Verify validation method matches

4. **Contact Support**:
   - Include site ID and client ID
   - Describe expected vs actual behavior
   - Provide browser console errors
   - Note which page/route the issue occurs on

---

**Congratulations!** You now have a fully functional multi-site gifting platform. Each client can have beautifully branded sites with custom configurations and curated gift catalogs. 🎉
