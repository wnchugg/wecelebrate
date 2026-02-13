# Admin UI Environment Configuration Guide

Complete guide for managing Supabase environment credentials through the Admin UI.

---

## 🎯 What This Does

The **Environment Configuration** page in the Admin UI allows you to:
- ✅ Manage Development and Production Supabase credentials
- ✅ Test backend connectivity for each environment
- ✅ Add/edit/delete environment configurations
- ✅ Switch between environments without code changes
- ✅ Securely store credentials in the backend database

**No need to edit code files** - everything is managed through the UI!

---

## 📍 How to Access

1. Log into Admin Panel at `/admin/login`
2. In the left sidebar, click **"Environment Config"**
3. You'll see the Environment Configuration page

---

## 🚀 Quick Setup

### Step 1: Create Supabase Projects

First, create your Supabase projects:

**Development:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project: `JALA2-Development`
3. Save credentials (URL + Anon Key)

**Production:**
1. Create new project: `JALA2-Production`
2. Save credentials (URL + Anon Key)

### Step 2: Configure in Admin UI

1. **Go to Environment Config page** (`/admin/environment-config`)

2. **Configure Development Environment:**
   - Click "Edit" on the Development card
   - Paste your Development Supabase URL
   - Paste your Development Anon Key
   - Click "Update"

3. **Configure Production Environment:**
   - Click "Edit" on the Production card
   - Paste your Production Supabase URL
   - Paste your Production Anon Key
   - Click "Update"

4. **Test Connections:**
   - Click "Test Connection" on each environment
   - Should see "✅ Environment is online!" messages

### Step 3: Deploy Edge Functions

For each environment, deploy the Edge Function:

```bash
# Development
supabase link --project-ref YOUR_DEV_PROJECT_ID
supabase secrets set SUPABASE_URL=https://YOUR_DEV_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_DEV_SERVICE_ROLE_KEY
supabase secrets set SUPABASE_ANON_KEY=YOUR_DEV_ANON_KEY
supabase functions deploy make-server-6fcaeea3

# Production  
supabase link --project-ref YOUR_PROD_PROJECT_ID
supabase secrets set SUPABASE_URL=https://YOUR_PROD_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_PROD_SERVICE_ROLE_KEY
supabase secrets set SUPABASE_ANON_KEY=YOUR_PROD_ANON_KEY
supabase functions deploy make-server-6fcaeea3
```

### Step 4: Use Environment Selector

1. Go to `/admin/login`
2. See environment dropdown in top-right
3. Switch between Development and Production
4. Data is completely isolated!

---

## 📖 Feature Guide

### Environment Cards

Each environment shows:
- **Name & Badge**: Visual identification (DEV/PROD)
- **Status**: Active, Inactive, or Testing
- **Supabase URL**: Your project URL
- **Anon Key**: Public key (can show/hide)
- **Last Tested**: When connection was last verified
- **Actions**: Edit, Delete, Test Connection

### Adding a New Environment

1. Click **"Add Environment"** button
2. Fill in the form:
   - **Environment Name**: e.g., "Staging"
   - **Label**: e.g., "STAGE" (max 4 chars)
   - **Description**: What this environment is for
   - **Badge Color**: Pick a color for the badge
   - **Supabase URL**: Your project URL
   - **Anon Key**: Your anon (public) key
3. Click **"Create"**

### Editing an Environment

1. Click **Edit** icon on any environment card
2. Update fields as needed
3. Click **"Update"**

**Note**: Development and Production are default environments and cannot be deleted (but can be edited).

### Testing Connection

1. Click **"Test Connection"** button
2. The system will:
   - Call the health endpoint
   - Verify backend is online
   - Update status to "Active" if successful
   - Show last tested timestamp
3. Green toast = Success!
4. Red toast = Failed (check Edge Function deployment)

### Deleting an Environment

1. Click **Delete** (trash icon) on custom environments
2. Confirm deletion
3. Environment removed from database

**Note**: Cannot delete default environments (Development/Production)

---

## 🔐 Security Notes

### What's Safe to Store

✅ **Safe to store in database:**
- Supabase Project URL (public)
- Anon Key (public - designed for frontend)

❌ **Never store in database:**
- Service Role Key (use Supabase secrets instead)
- Admin passwords
- Database connection strings

### Where Keys Are Used

**Anon Key** is used:
- In frontend to connect to Supabase
- Public by design (protected by Row Level Security)
- Safe to include in code or database

**Service Role Key** is used:
- Only in Edge Functions (backend)
- Set via `supabase secrets set`
- Never exposed to frontend

---

## 💡 How It Works

### Architecture

```
┌─────────────────────────────────────────────────┐
│ Admin UI (Frontend)                              │
│ /admin/environment-config                        │
│                                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ Environment Cards                            │ │
│ │ - Development [Edit] [Test]                  │ │
│ │ - Production  [Edit] [Test]                  │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ Backend API                                      │
│ /config/environments                             │
│                                                   │
│ - GET    /config/environments                    │
│ - POST   /config/environments                    │
│ - PUT    /config/environments                    │
│ - PATCH  /config/environments/:id/status         │
│ - DELETE /config/environments/:id                │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│ Supabase KV Store                                │
│                                                   │
│ environments:development → { url, key, ... }     │
│ environments:production  → { url, key, ... }     │
│ environments:staging     → { url, key, ... }     │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **User edits environment** in Admin UI
2. **Frontend sends API request** to `/config/environments`
3. **Backend validates and sanitizes** input
4. **Backend stores** in KV store as `environments:{id}`
5. **Frontend receives** confirmation
6. **Environment config updated** for all users

### How Frontend Uses It

The frontend reads environment config from the Admin UI and stores it in the browser's `localStorage`. When you switch environments using the dropdown, it:
1. Loads config from `localStorage`
2. Updates Supabase client with new URL/Key
3. Reloads the page
4. All API calls now go to selected environment

---

## 🎨 UI Features

### Status Indicators

- 🟢 **Active**: Connection test passed recently
- 🟡 **Testing**: Currently testing connection
- ⚪ **Inactive**: Not tested or no credentials

### Visual Badges

Each environment has a color-coded badge:
- **DEV** - Green (#10B981)
- **PROD** - Red (#EF4444)
- **TEST** - Amber (#F59E0B)
- **UAT** - Purple (#8B5CF6)
- **Custom** - Your chosen color

### Show/Hide Keys

Click the eye icon to show/hide the Anon Key value for security.

### Copy to Clipboard

Click the copy icon next to URL or Key to copy to clipboard.

---

## 🔧 API Reference

### Get All Environments

```
GET /make-server-6fcaeea3/config/environments
Authorization: Bearer {admin_token}

Response:
{
  "environments": [
    {
      "id": "development",
      "name": "Development",
      "label": "DEV",
      "supabaseUrl": "https://abc.supabase.co",
      "supabaseAnonKey": "eyJhbGc...",
      "description": "Dev environment",
      "color": "#10B981",
      "badge": "bg-green-100 text-green-800...",
      "status": "active",
      "lastTested": "2026-02-06T12:00:00Z",
      "isDefault": true,
      "createdAt": "2026-02-01T10:00:00Z",
      "updatedAt": "2026-02-06T12:00:00Z"
    }
  ]
}
```

### Create Environment

```
POST /make-server-6fcaeea3/config/environments
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "id": "staging",
  "name": "Staging",
  "label": "STAGE",
  "supabaseUrl": "https://xyz.supabase.co",
  "supabaseAnonKey": "eyJhbGc...",
  "description": "Staging environment",
  "color": "#F59E0B"
}

Response:
{
  "success": true,
  "environment": { ... }
}
```

### Update Environment

```
PUT /make-server-6fcaeea3/config/environments
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "id": "development",
  "supabaseUrl": "https://new-url.supabase.co",
  "supabaseAnonKey": "eyJhbGc..."
}

Response:
{
  "success": true,
  "environment": { ... }
}
```

### Update Status

```
PATCH /make-server-6fcaeea3/config/environments/:id/status
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "status": "active",
  "lastTested": "2026-02-06T12:00:00Z"
}

Response:
{
  "success": true,
  "environment": { ... }
}
```

### Delete Environment

```
DELETE /make-server-6fcaeea3/config/environments/:id
Authorization: Bearer {admin_token}

Response:
{
  "success": true
}
```

---

## 🐛 Troubleshooting

### "Test Connection" Fails

**Possible causes:**
1. Edge Function not deployed
2. Wrong Supabase URL
3. Wrong Anon Key
4. Network/firewall issue

**Solutions:**
```bash
# Verify Edge Function is deployed
supabase functions list

# Check health endpoint manually
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Redeploy if needed
supabase functions deploy make-server-6fcaeea3
```

### Environment Not Saving

**Check:**
1. URL format: Must be `https://[id].supabase.co`
2. All required fields filled
3. Valid Anon Key (JWT format)
4. Admin is logged in

### Environment Dropdown Not Showing New Environment

**Solution:**
1. Make sure environment has credentials configured
2. Refresh the page
3. Check browser console for errors
4. Verify environment was saved successfully

### Cannot Delete Environment

**Reason**: Default environments (Development/Production) cannot be deleted for safety.

**Solution**: Only custom environments can be deleted.

---

## 📋 Best Practices

### ✅ Do's

- ✅ Test connection after adding/updating credentials
- ✅ Use descriptive names for custom environments
- ✅ Keep badge labels short (max 4 characters)
- ✅ Document which team members have access
- ✅ Test in Development before Production

### ❌ Don'ts

- ❌ Don't share Service Role Keys (backend only!)
- ❌ Don't use production credentials in development
- ❌ Don't delete environments that are in use
- ❌ Don't forget to deploy Edge Functions
- ❌ Don't skip connection tests

---

## 🎯 Typical Workflows

### Initial Setup

1. Create Supabase projects (Dev + Prod)
2. Go to Admin UI → Environment Config
3. Configure both environments
4. Test connections
5. Deploy Edge Functions
6. Start using!

### Adding Staging Environment

1. Create new Supabase project: `JALA2-Staging`
2. Click "Add Environment" in Admin UI
3. Name: "Staging", Label: "STAGE"
4. Add Supabase URL and Anon Key
5. Choose color (e.g., orange)
6. Create
7. Test connection
8. Deploy Edge Function to staging
9. Select from dropdown to use

### Updating Production Credentials

1. Edit Production environment
2. Update URL and/or Key
3. Save
4. Test connection
5. Deploy Edge Function with new secrets
6. Verify everything works

---

## 📊 Comparison: Before vs. After

### Before (Manual Code Editing)

```typescript
// Had to edit code file
production: {
  supabaseUrl: 'https://xyz.supabase.co', // Hardcoded!
  supabaseAnonKey: 'eyJhbGc...',            // Hardcoded!
}
```

❌ Required code changes  
❌ Required redeployment  
❌ Risk of committing secrets  
❌ Not user-friendly  

### After (Admin UI)

```
1. Go to /admin/environment-config
2. Click Edit on Production
3. Update credentials in form
4. Click Save
5. Done! ✅
```

✅ No code changes needed  
✅ No redeployment needed  
✅ Secrets stored in database  
✅ User-friendly interface  

---

## 🎉 Summary

You now have a **production-ready Environment Configuration system** that:

- ✅ Manages all environment credentials in one place
- ✅ Tests backend connectivity with one click
- ✅ Supports unlimited custom environments
- ✅ Stores data securely in Supabase KV store
- ✅ Provides beautiful, intuitive UI
- ✅ Includes full audit logging
- ✅ No code changes required

**Next Steps:**
1. Create your Supabase projects
2. Configure them in Admin UI
3. Deploy Edge Functions
4. Start building! 🚀

---

**Page Location**: `/admin/environment-config`  
**API Endpoint**: `/make-server-6fcaeea3/config/environments`  
**Data Storage**: Supabase KV Store (`environments:*`)

**Last Updated**: February 6, 2026  
**Version**: 1.0
