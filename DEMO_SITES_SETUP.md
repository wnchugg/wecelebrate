# Demo Sites Setup Instructions

## Quick Start - UI Method (Recommended)

The easiest way to create the demo sites is through the UI:

1. **Navigate to the Seed Page**
   - Go to: `/initial-seed` or `/seed` in your browser
   - Or visit: `https://jala2-dev.netlify.app/initial-seed`

2. **Database Seeding (First Section)**
   - **If you DON'T have an admin user yet:**
     - Click "Seed Database Now" to create initial admin user and sample data
     - Admin credentials: `admin@example.com` / `Admin123!`
   - **If you ALREADY have an admin user:**
     - The page will detect this and prompt you to log in
     - Enter your admin email and password
     - Click "Log In to Reseed"
     - Then click "Reseed Database Now" to clear and reseed with fresh data
     - ⚠️ **Warning:** This will DELETE all existing clients, sites, and gifts (but preserves admin users)

3. **Scroll down to "Seed Demo Sites" section** (Second Section)
   - You'll see a purple card with a sparkles icon ✨
   - It lists all 5 demo sites that will be created
   - ✅ This does NOT delete existing data - it only adds new demo sites

4. **Click "Create Demo Sites Now"**
   - The button will show a loading spinner while creating sites
   - Takes about 3-5 seconds to complete

5. **View Results**
   - Success: Shows how many sites were created/skipped
   - Click "View Stakeholder Review" to see your demo sites

6. **Access Demo Sites**
   - Go to: `/stakeholder-review`
   - Click "Use Cases" tab
   - Each use case has a "Preview Demo Site" button
   - Click to open the live demo site in a new tab

---

## Alternative Methods

### Method 1: Browser Console (Developer Tools)

```javascript
// Open browser console (F12 or Cmd+Option+I)
// Paste and run this code:

fetch('https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/seed-demo-sites', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

### Method 2: cURL Command (Terminal/Command Line)

```bash
curl -X POST \
  https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/seed-demo-sites \
  -H "Content-Type: application/json"
```

### Method 3: Postman or API Client

**Endpoint:** 
```
POST https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/seed-demo-sites
```

**Headers:**
```
Content-Type: application/json
```

**Body:** None required (empty POST)

**Expected Response (Success):**
```json
{
  "success": true,
  "created": 5,
  "skipped": 0,
  "total": 5
}
```

---

## Demo Sites Created

Once seeded, these 5 sites will be available:

### 1. Event Gifting (Ship Home)
- **Site ID:** `demo-event-gifting-ship-home`
- **URL:** `/site/demo-event-gifting-ship-home`
- **Validation:** Serial card (enter any code like DEMO-12345)
- **Use Case:** Holiday celebration gifts shipped to employee homes

### 2. Event Gifting (Store Pickup)
- **Site ID:** `demo-event-gifting-store-pickup`
- **URL:** `/site/demo-event-gifting-store-pickup`
- **Validation:** Employee ID (enter any ID like EMP001)
- **Use Case:** Regional office appreciation with pickup

### 3. Service Award (5 Year)
- **Site ID:** `demo-service-award`
- **URL:** `/site/demo-service-award`
- **Validation:** Magic link (bypassed for demo - just click Continue)
- **Use Case:** 5-year milestone recognition

### 4. Service Award with Celebrations (10 Year)
- **Site ID:** `demo-service-award-celebration`
- **URL:** `/site/demo-service-award-celebration`
- **Validation:** Magic link (bypassed for demo - just click Continue)
- **Use Case:** 10-year anniversary with team messages
- **Special:** Celebrations module enabled

### 5. Employee Onboarding
- **Site ID:** `demo-employee-onboarding`
- **URL:** `/site/demo-employee-onboarding`
- **Validation:** Employee ID (enter MGR001 or ADMIN)
- **Use Case:** Manager portal for ordering onboarding kits

---

## Viewing Demo Sites

### From Stakeholder Review Page
1. Navigate to `/stakeholder-review`
2. Click the "Use Cases" tab
3. Scroll through the 5 use cases
4. Click "Preview Demo Site" button on any use case
5. Site opens in new tab with full branding and content

### Direct Access
You can also access sites directly:
- `/site/demo-event-gifting-ship-home`
- `/site/demo-event-gifting-store-pickup`
- `/site/demo-service-award`
- `/site/demo-service-award-celebration`
- `/site/demo-employee-onboarding`

---

## Features of Each Demo Site

Each demo site includes:
- ✅ Custom branded landing page with hero image
- ✅ Site-specific welcome message (letter/video/celebration)
- ✅ Unique branding colors and styling
- ✅ CEO/sender information with professional photos
- ✅ Validation method configured
- ✅ Shipping options tailored to use case
- ✅ Ready for immediate stakeholder demos

---

## Troubleshooting

**Sites already exist?**
- The endpoint is idempotent - it will skip existing sites
- Response will show: `"skipped": 5, "created": 0`
- Your existing sites are preserved

**Network error?**
- Check that you're connected to the internet
- Verify the Supabase project ID is correct
- Make sure Edge Functions are deployed

**Can't see sites?**
- Refresh the browser
- Check browser console for errors
- Verify sites exist at `/admin/sites` in admin portal

---

## Technical Details

**Backend Endpoint:** `/make-server-6fcaeea3/seed-demo-sites`

**Server File:** `/supabase/functions/server/seed-demo-sites.tsx`

**Frontend Component:** `/src/app/pages/InitialSeed.tsx`

**Stakeholder Review:** `/src/app/pages/StakeholderReview.tsx`

**Database:** Sites stored in `kv_store_6fcaeea3` table

**Client:** All sites belong to client: `client-demo-stakeholder`

---

## For Developers

To modify demo sites, edit: `/supabase/functions/server/seed-demo-sites.tsx`

Each site configuration includes:
- `id` - Site identifier
- `slug` - URL-friendly slug
- `name` - Display name
- `settings` - Validation, shipping, welcome message config
- `branding` - Colors and logo
- `landingPage` - Landing page content sections
- `welcomePage` - Welcome message configuration

After making changes, redeploy Edge Functions and re-run the seed endpoint.