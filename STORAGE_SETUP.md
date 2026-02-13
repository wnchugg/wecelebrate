# Supabase Storage Setup Guide

## Issue: Storage Bucket Creation RLS Error

If you see this error during server startup:
```
❌ Failed to create bucket make-6fcaeea3-gift-images: StorageApiError: new row violates row-level security policy
```

This is due to Supabase's Row-Level Security (RLS) policies preventing programmatic bucket creation. This is a **common and expected limitation** in Supabase projects.

## Solution: Manual Bucket Creation

You need to manually create the storage buckets through the Supabase Dashboard:

### Steps:

1. **Go to your Supabase Dashboard**
   - Development: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky
   - Production: https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Create the first bucket: `make-6fcaeea3-logos`**
   - Name: `make-6fcaeea3-logos`
   - Public: ✅ Yes (check the box)
   - File size limit: 10 MB (10485760 bytes)
   - Allowed MIME types:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/gif`
     - `image/webp`
     - `image/svg+xml`

4. **Create the second bucket: `make-6fcaeea3-gift-images`**
   - Name: `make-6fcaeea3-gift-images`
   - Public: ✅ Yes (check the box)
   - File size limit: 10 MB (10485760 bytes)
   - Allowed MIME types:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/gif`
     - `image/webp`
     - `image/svg+xml`

5. **Verify buckets are created**
   - You should see both buckets listed in the Storage section
   - Restart your Edge Function (it will automatically detect the buckets exist)

## Why This Happens

Supabase uses PostgreSQL Row-Level Security (RLS) to control access to database tables. The `storage.buckets` table has RLS policies that prevent even the service role from creating buckets programmatically by default. This is a security feature.

## Alternative: Disable RLS (Not Recommended for Production)

If you absolutely need programmatic bucket creation, you can disable RLS on the `storage.buckets` table:

1. Go to Database → Tables → storage.buckets
2. Click on "RLS disabled" toggle
3. **⚠️ Warning:** This reduces security and is not recommended for production

## Verification

After creating the buckets manually, the server will log:
```
✅ Bucket already exists: make-6fcaeea3-logos
✅ Bucket already exists: make-6fcaeea3-gift-images
```

The application will then work normally with file uploads.

## Related Features

These storage buckets are used for:
- **make-6fcaeea3-logos**: Client and site logo uploads in admin panel
- **make-6fcaeea3-gift-images**: Gift product images in the catalog

Without these buckets, the admin panel's logo upload and gift image features will not work.
