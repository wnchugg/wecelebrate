# 🚀 Quick Start: Create Your First Admin User

## Step 1: Choose Your Method

### Option A: Supabase Dashboard (Easiest) ⭐ RECOMMENDED

1. **Go to Supabase Auth Users:**
   ```
   https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky/auth/users
   ```

2. **Click the big "+ Add User" button** (top right)

3. **Select "Create new user"**

4. **Fill in the form:**
   ```
   Email: admin@jala2.com
   Password: [Choose a strong password - save it!]
   Auto Confirm User: ✅ CHECK THIS BOX (important!)
   ```

5. **Add User Metadata:**
   - Click "+ Add metadata" at the bottom
   - Paste this JSON:
   ```json
   {
     "role": "admin",
     "name": "Admin User"
   }
   ```

6. **Click "Create User"**

7. **Done!** ✅

---

### Option B: SQL Script (For Power Users)

1. **Open SQL Editor:**
   ```
   https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky/sql/new
   ```

2. **Copy this SQL:**
   ```sql
   INSERT INTO auth.users (
     instance_id,
     id,
     aud,
     role,
     email,
     encrypted_password,
     email_confirmed_at,
     raw_app_meta_data,
     raw_user_meta_data,
     created_at,
     updated_at,
     confirmation_token,
     recovery_token,
     email_change_token_new,
     email_change
   )
   VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'admin@jala2.com',
     crypt('CHANGE_THIS_PASSWORD', gen_salt('bf')),
     NOW(),
     '{"provider":"email","providers":["email"]}',
     '{"role":"admin","name":"Admin User"}',
     NOW(),
     NOW(),
     '',
     '',
     '',
     ''
   );
   ```

3. **IMPORTANT: Change `CHANGE_THIS_PASSWORD` to your actual password**

4. **Click "Run"** (bottom right)

5. **Verify:** You should see "Success. No rows returned"

6. **Done!** ✅

---

## Step 2: Log In

1. **Go to the login page:**
   ```
   https://jala2-dev.netlify.app/admin/login
   ```

2. **Enter your credentials:**
   ```
   Email: admin@jala2.com
   Password: [The password you just created]
   ```

3. **Click "Sign In"**

4. **You should see the Admin Dashboard!** 🎉

---

## ⚠️ Troubleshooting

### "Invalid login credentials"

**Possible causes:**
- ✅ Did you click "Auto Confirm User" when creating the user?
- ✅ Is the email exactly `admin@jala2.com`? (case-sensitive)
- ✅ Is the password correct? (check for typos)
- ✅ Did you add the user metadata with `"role": "admin"`?

**Fix:**
1. Go back to: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky/auth/users
2. Find your user
3. Click on the user
4. Check:
   - "Email Confirmed" = Yes (if No, click "Confirm email")
   - "User Metadata" contains `{"role": "admin", "name": "Admin User"}`

---

### "Network Error" or "Cannot connect"

**Check:**
- ✅ Is https://jala2-dev.netlify.app loading?
- ✅ Check browser console (F12) for errors
- ✅ Is your internet connection working?

---

### "Too many login attempts"

**Fix:**
- Wait 15 minutes (rate limiting protection)
- Or clear browser cache and try again

---

## Next Steps After Login

Once logged in, you'll see the Admin Dashboard. Here's what to do:

### 1. Create a Client
- Click **"Clients"** in the sidebar
- Click **"+ Add Client"**
- Fill in:
  - Company Name
  - Contact Email
  - (Other fields are optional)
- Click **"Save"**

### 2. Create a Site
- Select your client
- Click **"Sites"** tab
- Click **"+ Add Site"**
- Fill in:
  - Site Name (e.g., "Holiday Gifts 2026")
  - Validation Method (Email Address, Employee ID, etc.)
  - Branding (colors, logo)
- Click **"Save"**

### 3. Add Products
- Click **"Products"** in sidebar
- Click **"+ Add Product"**
- Fill in:
  - Product Name
  - Description
  - Upload image
  - Set max quantity
- Click **"Save"**

### 4. Assign Products to Site
- Go back to your Site
- Click **"Products"** tab
- Select which gifts are available
- Click **"Save"**

### 5. Get the User URL
- In Site Settings, find the **"Site URL"**
- This is the link employees will use to select gifts
- Share this URL with your users!

---

## 🎯 Test the Full Flow

1. **Copy your Site URL** (from Site Settings)
2. **Open in incognito/private window** (to test as a user)
3. **Go through the 6-step process:**
   - Step 1: Validation (enter email/employee ID)
   - Step 2: Gift Selection (browse gifts)
   - Step 3: Gift Details (select quantity)
   - Step 4: Shipping Info (enter address)
   - Step 5: Review Order
   - Step 6: Confirmation
4. **Check:** Did you receive a confirmation email?

---

## 📧 Email Configuration

If emails aren't sending:

1. **Check Resend API Key:**
   - Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky/settings/functions
   - Click "Environment Variables"
   - Verify `RESEND_API_KEY` is set

2. **Get Resend API Key:**
   - Go to: https://resend.com
   - Sign up/log in
   - Get your API key
   - Add it to Supabase secrets

---

## 🆘 Still Need Help?

### Check Logs

**Frontend Logs (Browser):**
- Press F12
- Click "Console" tab
- Look for red errors

**Backend Logs (Supabase):**
- Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky/logs/edge-functions
- Select `make-server-6fcaeea3` function
- Look for errors

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Check ALLOWED_ORIGINS in Supabase includes Netlify URL |
| 401 Unauthorized | Check VITE_SUPABASE_ANON_KEY is correct in Netlify |
| Email not sending | Add RESEND_API_KEY to Supabase secrets |
| Can't create client | Make sure you're logged in as admin |
| Site URL not working | Check site is "Active" in Site Settings |

---

## ✅ Checklist

Before testing with real users:

- [ ] Admin user created and can log in
- [ ] At least one Client created
- [ ] At least one Site created
- [ ] At least one Product created  
- [ ] Products assigned to Site
- [ ] Site is marked as "Active"
- [ ] Tested full user flow in incognito mode
- [ ] Confirmation emails are being sent
- [ ] Resend API key is configured

---

**Environment:** Development (wjfcqqrlhwdvjmefxky)  
**Frontend:** https://jala2-dev.netlify.app/  
**Admin Login:** https://jala2-dev.netlify.app/admin/login  
**Last Updated:** February 8, 2026
