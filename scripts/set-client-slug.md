# Set Client Slug - Quick Guide

## Step-by-Step Instructions

### Step 1: Find the Harbor Freight Client UUID

You have a few options:

#### Option A: Via Admin UI (Easiest)
1. Go to `/admin/clients` in your browser
2. Find "Harbor Freight" in the client list
3. Click on it to view details
4. Look at the URL - it will show the UUID
5. Copy the UUID from the URL

#### Option B: Via Browser Console
1. Go to `/admin/clients`
2. Open browser console (F12)
3. Run this code:
```javascript
// Fetch all clients
fetch('/api/v2/clients', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
  }
})
.then(r => r.json())
.then(data => {
  const client = data.data.find(c => c.name.includes('Harbor'));
  console.log('Harbor Freight Client:', client);
  console.log('UUID:', client?.id);
  console.log('Access URL:', `/admin/clients/${client?.id}/configuration`);
});
```

#### Option C: Via Database Query
If you have access to the Supabase dashboard:
1. Go to SQL Editor
2. Run:
```sql
SELECT id, name, client_code 
FROM clients 
WHERE name ILIKE '%harbor%freight%';
```

### Step 2: Access Client Configuration

Once you have the UUID, navigate to:
```
/admin/clients/[UUID]/configuration
```

For example:
```
/admin/clients/a1b2c3d4-e5f6-7890-abcd-ef1234567890/configuration
```

### Step 3: Set the URL Slug

1. You should now be on the Client Configuration page
2. Make sure you're on the **"General"** tab (should be selected by default)
3. Find the **"URL Slug"** field (it's in the "Basic Information" section)
4. Enter: `harbor-freight`
5. Click **"Save Changes"** button (top right)

### Step 4: Test the Slug

After saving, you can now access the client via:
```
/admin/clients/harbor-freight/configuration
```

## Troubleshooting

### "Client not found" Error
- Make sure the slug is exactly: `harbor-freight` (lowercase, with hyphen)
- Check that you clicked "Save Changes"
- Try refreshing the page after saving

### Can't Find the Client in the List
- Check if the client was actually created
- Look in the database directly
- Try creating it again if needed

### UUID Not Working
- Make sure you copied the full UUID (36 characters with hyphens)
- Check for extra spaces or characters
- Try accessing via the client list instead

## Quick Reference

### Valid Slug Format
- ✅ `harbor-freight` (lowercase with hyphen)
- ❌ `Harbor Freight` (has space)
- ❌ `Harbor-Freight` (has uppercase)
- ❌ `harbor_freight` (has underscore)

### Where to Find Things
- **Client List**: `/admin/clients`
- **Client Config**: `/admin/clients/[UUID]/configuration`
- **Client Config (by slug)**: `/admin/clients/[slug]/configuration`

## Alternative: Create New Client with Slug

If you can't find the Harbor Freight client, you can create a new one with the slug already set:

1. Go to `/admin/clients`
2. Click "Add New Client"
3. Fill in:
   - **Client Name**: Harbor Freight
   - **URL Slug**: harbor-freight
   - **Contact Email**: (required)
   - **Status**: Active
4. Click "Create Client"
5. Access via: `/admin/clients/harbor-freight/configuration`

## Need Help?

If you're still having issues:
1. Check the browser console for errors (F12)
2. Check the network tab to see what API calls are being made
3. Verify the client exists in the database
4. Make sure you have admin permissions
