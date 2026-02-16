# Quick Start - Local Development

## First Time Setup (5 minutes)

### 1. Get Your Supabase Keys

Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api

Copy these two values:
- **Project URL** (already set: `https://wjfcqqrlhwdvvjmefxky.supabase.co`)
- **anon public** key (long string starting with `eyJ...`)

### 2. Create .env File

```bash
# Copy the example file
cp .env.example .env

# Edit .env and paste your anon key
nano .env
# or
open .env
```

Your `.env` should look like:
```env
VITE_SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_actual_key_here
VITE_APP_ENV=development
```

### 3. Start the Server

**Option A - Easy way:**
```bash
./start-local.sh
```

**Option B - Manual way:**
```bash
npm install  # First time only
npm run dev
```

### 4. Open Browser

Go to: http://localhost:5173

Login with:
- Username: `nchugg`
- Password: `TestPassword123!`

---

## Daily Usage

```bash
# Start server
npm run dev

# Stop server
# Press Ctrl+C in terminal
```

That's it! Changes you make will appear instantly in the browser.

---

## Common Issues

**"Cannot find module"**
```bash
npm install
```

**"Port already in use"**
- Vite will automatically use next available port (5174, 5175, etc.)

**"Can't connect to backend"**
- Check your `.env` file has the correct keys
- Make sure you have internet connection

**"Seeing old code"**
```bash
rm -rf node_modules/.vite
npm run dev
```

---

## Need More Help?

See the full guide: [LOCAL_DEVELOPMENT_GUIDE.md](./LOCAL_DEVELOPMENT_GUIDE.md)
