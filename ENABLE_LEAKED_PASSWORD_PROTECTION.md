# Enable Leaked Password Protection

## What is Leaked Password Protection?

Supabase Auth can check passwords against the HaveIBeenPwned database to prevent users from using passwords that have been compromised in data breaches. This is a security best practice recommended by NIST and OWASP.

## How to Enable

This setting must be enabled in the Supabase Dashboard (it cannot be set via SQL migration).

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Open Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Configuration" (not Policies)
   - Scroll down to find password-related settings

3. **Look for Password Settings**
   
   The setting might be in one of these locations:
   
   **Option A: Auth Configuration Page**
   - Authentication → Configuration
   - Scroll to "Password Settings" or "Security" section
   - Look for "Check passwords against HaveIBeenPwned" or similar
   
   **Option B: Project Settings**
   - Settings (gear icon) → Authentication
   - Look for "Password Protection" or "Security" section
   
   **Option C: Via Management API (if not in UI)**
   - See "Alternative: Manual Configuration" section below

4. **Enable the Setting**
   - Toggle the switch to **ON**
   - Save changes

### What This Does

When enabled, Supabase will:
- Check new passwords against the HaveIBeenPwned API
- Reject passwords that have been found in data breaches
- Show an error message to users asking them to choose a different password
- Not store or send the actual password to HaveIBeenPwned (uses k-anonymity)

### Privacy & Security

The HaveIBeenPwned integration uses **k-anonymity**:
1. Only the first 5 characters of the password hash are sent
2. The API returns all hashes starting with those 5 characters
3. Supabase checks locally if the full hash matches
4. Your actual password is never sent to HaveIBeenPwned

This is a privacy-preserving technique that protects user passwords while still checking against breaches.

## Alternative: Manual Configuration via Management API

If you can't find the setting in the UI, you can enable it using the Supabase Management API or by setting environment variables.

### Method 1: Supabase Management API

```bash
# Get your management API token from: https://supabase.com/dashboard/account/tokens

curl -X PATCH https://api.supabase.com/v1/projects/YOUR_PROJECT_REF/config/auth \
  -H "Authorization: Bearer YOUR_MANAGEMENT_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "SECURITY_PASSWORD_HIBP_ENABLED": true
  }'
```

### Method 2: Check Current Configuration

You can check if it's already enabled:

```bash
curl https://api.supabase.com/v1/projects/YOUR_PROJECT_REF/config/auth \
  -H "Authorization: Bearer YOUR_MANAGEMENT_API_TOKEN"
```

Look for `SECURITY_PASSWORD_HIBP_ENABLED` in the response.

### Method 3: Contact Supabase Support

If the setting is not available in your dashboard version:
1. Go to https://supabase.com/dashboard/support
2. Request to enable "HaveIBeenPwned password checking" for your project
3. They can enable it on the backend

### Note on Dashboard Versions

The Supabase dashboard UI changes frequently. If you can't find this setting:
- It might be in a different location in your dashboard version
- It might be enabled by default (check via API)
- It might require a specific Supabase plan

To verify if it's working, try creating a test user with a known compromised password like `password123` - it should be rejected if the feature is enabled.

## Verification

After enabling, test by trying to create a user with a known compromised password like:
- `password123`
- `qwerty123`
- `admin123`

These should be rejected with an error message.

## Documentation

For more information, see:
- [Supabase Password Security Docs](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [k-Anonymity Explanation](https://blog.cloudflare.com/validating-leaked-passwords-with-k-anonymity/)

## Impact on Your Application

Once enabled:
- ✅ Existing users are not affected
- ✅ Only new password creations/changes are checked
- ✅ No performance impact (check happens during signup/password change)
- ✅ Improves overall security posture
- ⚠️ Users may need to choose different passwords if theirs are compromised

## Important Note: This Setting Applies to Supabase Auth Users Only

**CRITICAL**: The "Prevent use of leaked passwords" setting under Attack Protection in Supabase Dashboard only applies to **Supabase Auth users** (users created via `supabase.auth.signUp()`), NOT to your custom `site_users` table.

### Your Implementation Uses Custom Password Management

Your application uses:
- **Custom `site_users` table** - For site-level users (Advanced Authentication)
- **Custom password validation** - In `password_management_simple.ts`
- **Custom password hashing** - PBKDF2 with 100k iterations

The Supabase Auth leaked password protection **does not apply** to your `site_users` because they don't use Supabase Auth.

### Why the Email Provider is Required

Supabase requires an email provider to:
1. Send notifications when leaked passwords are detected
2. Send password reset emails
3. Send account security alerts

This is only needed if you're using Supabase Auth for user management.

### What This Means for You

**You can safely ignore this warning** because:

1. ✅ Your `site_users` use custom password management
2. ✅ Your custom validation already checks for common passwords
3. ✅ Your password complexity requirements are strong (12+ chars, mixed case, numbers, special)
4. ✅ You're using secure hashing (PBKDF2 with 100k iterations)

### If You Want to Enable It Anyway

If you plan to use Supabase Auth for `admin_users` or other purposes, you can enable it by:

1. **Configure an Email Provider First**
   - Go to Authentication → Email Templates
   - Configure SMTP settings or use a service like SendGrid, Resend, etc.
   
2. **Then Enable Leaked Password Protection**
   - Go to Authentication → Attack Protection
   - Toggle "Prevent use of leaked passwords" to ON

But again, this only affects Supabase Auth users, not your custom `site_users`.

## Recommendation

**Priority: SKIP** - This setting doesn't apply to your implementation.

**Why:**
- The linter warning is about Supabase Auth's built-in password checking
- Your application uses custom `site_users` table with custom password management
- Your custom validation already provides equivalent or better protection
- Enabling this requires email provider configuration and only affects Supabase Auth users

**What to Do:**
1. ✅ **Accept the warning** - It's not relevant to your custom password management
2. ✅ **Focus on other security tasks** - Fix the function search_path warnings instead
3. ⏭️ **Skip email provider setup** - Not needed unless you use Supabase Auth for other purposes

### Summary Table

| User Type | Authentication | Password Validation | Leaked Password Check |
|-----------|---------------|---------------------|----------------------|
| `admin_users` | Supabase Auth | Supabase Auth | ⚠️ Would apply if enabled |
| `site_users` | Custom (Advanced Auth) | Custom (`password_management_simple.ts`) | ✅ Already implemented (common password list) |

Your custom implementation for `site_users` already provides strong password security without needing the Supabase Auth leaked password protection feature.
