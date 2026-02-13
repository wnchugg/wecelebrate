# Creating Your First Admin User

Since the application now uses server-side authentication, you need to create an admin account before you can login.

## Quick Start - Browser Console Method (Recommended)

1. Open the application in your browser
2. Navigate to `/admin` or `/admin/login`
3. Open the browser console (F12 or right-click → Inspect → Console)
4. Run this code:

```javascript
// Create admin account
fetch('https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZmZlcXdocm5ic2JoZHp0d3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDg1MDgsImV4cCI6MjA4NTkyNDUwOH0.QxEhaoN_sgHLxwLpgqqdhkEAHyNyi4ivFIgPhsWQ83s'
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'Admin123!',
    username: 'admin',
    role: 'super_admin'
  })
})
.then(res => res.json())
.then(data => console.log('Admin created:', data))
.catch(err => console.error('Error:', err));
```

5. You should see a success message in the console with the created user data
6. Now login with:
   - Email: `admin@example.com`
   - Password: `Admin123!`

## Method 2: Using cURL (Command Line)

```bash
curl -X POST https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZmZlcXdocm5ic2JoZHp0d3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDg1MDgsImV4cCI6MjA4NTkyNDUwOH0.QxEhaoN_sgHLxwLpgqqdhkEAHyNyi4ivFIgPhsWQ83s" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "username": "admin",
    "role": "super_admin"
  }'
```

## Method 3: Using Postman or Similar API Tool

1. Create a new POST request
2. URL: `https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/auth/signup`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZmZlcXdocm5ic2JoZHp0d3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDg1MDgsImV4cCI6MjA4NTkyNDUwOH0.QxEhaoN_sgHLxwLpgqqdhkEAHyNyi4ivFIgPhsWQ83s`
4. Body (raw JSON):
```json
{
  "email": "admin@example.com",
  "password": "Admin123!",
  "username": "admin",
  "role": "super_admin"
}
```
5. Send the request

## Available Roles

- `super_admin` - Full access to all features
- `admin` - Administrative access
- `manager` - Limited administrative access

## Security Notes

⚠️ **Important**: 
- Change the default password immediately after first login
- Use strong, unique passwords for production
- The public anon key in the Authorization header is safe to use for signup only
- Never share admin credentials

## Troubleshooting

### "Email already exists" error
The email is already registered. Try:
- Using a different email
- Or use the existing credentials to login

### "Authorization error"
Make sure you're using the correct Authorization header with the anon key.

### Cannot access admin pages
- Make sure you created the account successfully
- Check that you're using the correct email and password
- Look for error messages in the browser console

## Next Steps

After creating your admin account:
1. Login at `/admin/login`
2. Navigate to the dashboard
3. Create clients, sites, and configure gift catalogs
4. Test the employee flow by accessing the main site