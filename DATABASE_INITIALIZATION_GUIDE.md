# Database Initialization Guide

## Quick Fix Summary

You're seeing these errors because **your database hasn't been initialized yet**. This is a one-time setup that needs to be done when deploying to a new environment.

### Errors You're Seeing:
1. ❌ `Site not found` (404)
2. ❌ `Invalid login credentials` (AuthApiError) 
3. ❌ `Bad Gateway` (502) on storage bucket listing

### Quick Solution (5 minutes):

1. **Navigate to the initialization page:**
   - Go to: `/initialize-database`
   - Or click "Initialize Database" from the homepage

2. **Click "Initialize Database Now"**
   - This creates the admin account (admin@example.com / Admin123!)
   - Seeds demo sites, gifts, and employees
   - Sets up the platform for first use

3. **Login as admin:**
   - After initialization completes, go to `/admin`
   - Login with: admin@example.com / Admin123!
   - You can now manage sites, gifts, and employees

---

## Understanding the Errors

### 1. Site Not Found (404)

**Error:**
```
[Public API Error] {"error":"Site not found"}
[PublicSiteContext] Failed to load gifts: Error: API error (404): {"error":"Site not found"}
```

**Cause:** The database KV store is empty - no sites have been created yet.

**Solution:** Initialize the database using `/initialize-database`. This will seed 3 demo sites:
- **ACME Corp New Hire Onboarding** (Email validation)
- **GlobalRetail 5 Year Anniversary**  (Serial card validation)
- **TechCorp Holiday Gifting** (Employee ID validation)

---

### 2. Invalid Login Credentials (AuthApiError)

**Error:**
```
[Auth] Error code: invalid_credentials
[Auth] Error message: Invalid login credentials
[Auth] Supabase auth error: AuthApiError: Invalid login credentials
```

**Cause:** No admin user exists in Supabase Auth yet.

**Solution:** The initialization process creates the default admin user:
- **Email:** admin@example.com
- **Password:** Admin123!
- **Role:** super_admin

After initialization, you can login with these credentials and create additional admin accounts if needed.

---

### 3. Bad Gateway (502) - Storage Buckets

**Error:**
```
❌ Failed to list buckets: StorageApiError: Bad Gateway
status: 502, statusCode: "502"
```

**Cause:** This is a **temporary Supabase infrastructure issue**. The storage API is experiencing momentary unavailability.

**Impact:** This error is **non-blocking** - the application continues to work without storage buckets. They will be created on-demand when needed.

**Solution:** 
- This usually resolves itself within minutes
- The application handles this gracefully and will retry
- Storage buckets are only needed for file uploads (logos, gift images)
- If the issue persists, you can manually create buckets in Supabase Dashboard:
  - `make-6fcaeea3-logos` (public)
  - `make-6fcaeea3-gift-images` (public)

---

## Step-by-Step Initialization Process

### Step 1: Navigate to Initialization Page

Open your browser and go to:
```
http://localhost:5173/initialize-database
```

Or in production:
```
https://your-domain.com/initialize-database
```

### Step 2: Click "Initialize Database Now"

The page will show what will be created:
- ✓ Admin account (admin@example.com / Admin123!)
- ✓ Demo stakeholder client with 3 use-case sites
- ✓ 15 sample gifts across multiple categories
- ✓ Demo employees with validation credentials
- ✓ Gift assignments to all demo sites

Click the blue "Initialize Database Now" button.

### Step 3: Wait for Completion

The initialization process takes 5-10 seconds. You'll see a success message with the admin credentials.

### Step 4: Login as Admin

1. Click "Go to Admin Login" button
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `Admin123!`
3. You're now in the admin panel!

### Step 5: Test the Platform

Try accessing a demo site:
1. Go to homepage
2. Click on one of the demo sites (e.g., "ACME Corp New Hire Onboarding")
3. Enter validation credentials (shown on each site card)
4. Browse gifts and test the gifting flow

---

## What Gets Seeded

### Admin Accounts
- 1 super admin: admin@example.com (password: Admin123!)

### Clients
- 4 demo clients representing different industries

### Sites
- **ACME Corp New Hire Onboarding**
  - Validation: Email
  - Test email: john.doe@acmecorp.com
  
- **GlobalRetail 5 Year Anniversary**
  - Validation: Serial Card
  - Test card: GR5Y-ABCD-1234
  
- **TechCorp Holiday Gifting**
  - Validation: Employee ID  
  - Test ID: TC12345

### Gifts
- 15 sample products across categories:
  - Electronics
  - Apparel
  - Home & Living
  - Office Supplies
  - And more...

### Employees
- 10+ demo employees with various validation methods
- Serial cards pre-assigned
- Email addresses configured

---

## Troubleshooting

### "Database already initialized" Error

If you see:
```json
{
  "error": "Database already initialized"
}
```

**Solution:** The database has already been seeded. Simply login as admin:
- Go to `/admin`
- Email: admin@example.com  
- Password: Admin123!

If you forgot the password, you need to reseed the database (this will delete all data):
- Login as admin
- Go to Admin Dashboard > Database Management
- Click "Reseed Database"

### Backend Not Deployed

If you see fetch errors or "Failed to connect":

**Check:**
1. Is the Edge Function deployed to Supabase?
   ```bash
   ./scripts/deploy-to-environment.sh dev
   ```

2. Is the `SUPABASE_SERVICE_ROLE_KEY` secret set?
   - Go to Supabase Dashboard > Settings > Edge Functions
   - Verify the secret exists

3. Is CORS configured?
   - Check `ALLOWED_ORIGINS` secret includes your domain

### Storage Buckets (502 Error)

If storage bucket initialization fails with 502:

**Manual Creation:**
1. Go to Supabase Dashboard
2. Navigate to Storage
3. Create two buckets:
   - Name: `make-6fcaeea3-logos`
   - Public: ✓ Yes
   - File size limit: 10MB
   
   - Name: `make-6fcaeea3-gift-images`
   - Public: ✓ Yes
   - File size limit: 10MB

---

## Resetting the Database

If you need to start fresh:

### Option 1: Through Admin Panel (Recommended)
1. Login as admin
2. Go to Database Management  
3. Click "Reseed Database"
4. Confirm the action
5. All data will be cleared and reseeded

### Option 2: Through API (Development Only)
```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/dev/reseed" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Access-Token: YOUR_ADMIN_TOKEN" \
  -H "X-Environment-ID: development"
```

---

## Production Deployment

For production environments:

1. **Do NOT use `/initialize-database`** in production with real data
2. Instead, manually create admin accounts through Supabase Auth
3. Manually import clients, sites, and gifts through the admin panel
4. Set up proper validation credentials for real employees
5. Configure environment-specific settings

---

## Support

If you continue experiencing issues:

1. Check the Edge Function logs in Supabase Dashboard
2. Verify all environment secrets are set correctly
3. Ensure the database migration has run (creates kv_store table)
4. Check browser console for detailed error messages

For additional help, consult:
- `/docs/FAILED_TO_FETCH_TROUBLESHOOTING.md`
- `/docs/OPTION_B_START_HERE.md`
- `/DEPLOYMENT.md`
