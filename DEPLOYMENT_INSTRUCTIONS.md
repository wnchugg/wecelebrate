# Deployment Instructions for Development Environment

## Current Status
- **Frontend**: Connected to Development Supabase (`wjfcqqrlhwdvvjmefxky`)
- **Backend**: NOT YET DEPLOYED to Development Supabase
- **Seed Data**: Updated with comprehensive test data (4 clients, 7 sites, 10 gifts)

## Steps to Deploy Backend and Seed Data

### Option 1: Deploy via Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link to Development Project**:
   ```bash
   supabase link --project-ref wjfcqqrlhwdvvjmefxky
   ```

4. **Prepare Function Files**:
   Create a local directory structure and copy files from Figma Make:
   
   ```
   my-project/
   └── supabase/
       └── functions/
           └── make-server-6fcaeea3/
               ├── index.ts       (copy from /supabase/functions/server/index.tsx)
               ├── kv_store.ts    (copy from /supabase/functions/server/kv_store.tsx)
               ├── seed.ts        (copy from /supabase/functions/server/seed.tsx)
               └── security.ts    (copy from /supabase/functions/server/security.tsx)
   ```

5. **Deploy the Function**:
   ```bash
   supabase functions deploy make-server-6fcaeea3
   ```

6. **Set Environment Secrets**:
   ```bash
   # Required secrets
   supabase secrets set SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-dev-service-role-key>
   supabase secrets set SUPABASE_ANON_KEY=<your-dev-anon-key>
   supabase secrets set SUPABASE_DB_URL=<your-dev-db-connection-string>
   supabase secrets set ALLOWED_ORIGINS=*
   
   # Optional: Enable automatic seeding on deployment
   supabase secrets set SEED_ON_STARTUP=false
   ```

   **To find your keys:**
   - Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api
   - Copy the **service_role** key (secret) and **anon** key (public)
   - For DB URL, go to Settings > Database and copy the Connection String

### Option 2: Deploy via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/functions
2. Click **Create Function**
3. Name it: `make-server-6fcaeea3`
4. Copy the contents of `/supabase/functions/server/index.tsx` and paste into the editor
5. Click **Deploy**
6. Set the environment variables in the dashboard under Functions > Configuration

## Step 2: Seed the Database

After deployment, you have two options to seed data:

### Option A: Manual Reseed via API Call

1. **Login to Admin** first (to get access token):
   ```bash
   curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"Admin123!"}'
   ```

2. **Copy the `access_token`** from the response

3. **Trigger Reseed**:
   ```bash
   curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/dev/reseed \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Option B: Automatic Seed on Startup

Set the `SEED_ON_STARTUP` environment variable to `true`:

```bash
supabase secrets set SEED_ON_STARTUP=true
```

Then redeploy the function. **Note:** This will slow down function startup, so only use for initial setup.

## Step 3: Verify Deployment

1. **Check Health**:
   ```bash
   curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
   ```
   Should return: `{"status":"ok"}`

2. **Check Public Sites**:
   ```bash
   curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/sites
   ```
   Should return a list of active sites

3. **Login to Admin**:
   - Go to: https://top-brick-95471034.figma.site/admin/login
   - Email: `admin@example.com`
   - Password: `Admin123!`
   - You should see 4 clients, 7 sites, and 10 gifts

## Demo Data Included

### 4 Clients:
- TechCorp Inc.
- GlobalRetail Group
- HealthCare Services Ltd.
- EduTech Solutions

### 7 Sites:
- TechCorp US - Employee Gifts 2026 (active)
- TechCorp EU - Employee Recognition (active)
- TechCorp Asia Pacific (active)
- GlobalRetail Premium - US (active)
- GlobalRetail Essentials - Multi-Country (active)
- HealthCare Services Recognition (inactive)
- EduTech - Campus Rewards (active)

### 10 Gifts:
- Wireless Noise-Cancelling Headphones ($249.99)
- Insulated Stainless Steel Water Bottle ($34.99)
- Leather Portfolio with Notepad ($89.99)
- Smart Fitness Tracker Watch ($129.99)
- Gourmet Coffee Gift Set ($54.99)
- Wireless Charging Desk Organizer ($64.99)
- Premium Backpack with Laptop Compartment ($79.99) - OUT OF STOCK
- Ceramic Coffee Mug Set ($42.99)
- Bluetooth Speaker - Portable ($69.99)
- Luxury Pen Set ($124.99)

## Troubleshooting

### Error: "Function not found" (404)
- The function hasn't been deployed yet. Follow deployment steps above.

### Error: "Invalid JWT" (401)
- Check that your environment secrets are set correctly
- Make sure you're using the correct project ID

### Error: "CORS Error"
- Make sure `ALLOWED_ORIGINS` is set to `*` in development
- For production, set it to your actual domain

### No Data in Admin
- Run the reseed endpoint (see Option A above)
- Or enable `SEED_ON_STARTUP=true` and redeploy

## Next Steps

After successful deployment:
1. The admin interface will show all demo clients, sites, and gifts
2. The public site will load with active site data
3. You can test the full workflow from user validation to gift selection
