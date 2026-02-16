# Local Development Setup Guide

This guide will help you run the WeCelebrate app locally on your computer, so you can test changes without deploying to Netlify.

## Prerequisites

Make sure you have these installed:
- **Node.js** (v18 or higher) - Check with `node --version`
- **npm** or **pnpm** - Check with `npm --version`

## Step 1: Install Dependencies

If you haven't already, install all the project dependencies:

```bash
npm install
```

Or if you're using pnpm:

```bash
pnpm install
```

## Step 2: Create Environment File

Create a `.env` file in the root of your project with your Supabase credentials:

```bash
# Create the .env file
touch .env
```

Add these variables to `.env`:

```env
# Supabase Configuration (Development)
VITE_SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Set environment
VITE_APP_ENV=development
```

### Where to find your Supabase keys:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `wjfcqqrlhwdvvjmefxky` (Development)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## Step 3: Start the Development Server

Run the development server:

```bash
npm run dev
```

You should see output like:

```
  VITE v6.4.1  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Step 4: Open in Browser

Open your browser and go to:

```
http://localhost:5173
```

The app should now be running locally! 🎉

## How It Works

- **Vite** is the development server that serves your React app
- **Hot Module Replacement (HMR)** - Changes you make to code will instantly appear in the browser
- **Backend** - Still uses your Supabase backend (no local backend needed)
- **No deployment costs** - You can test as much as you want locally

## Common Commands

```bash
# Start development server
npm run dev

# Build for production (to test the build)
npm run build

# Preview production build locally
npm run preview

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test:safe
```

## Testing Your Changes

1. Make changes to any file in `src/`
2. Save the file
3. Browser automatically refreshes with your changes
4. No need to deploy to Netlify!

## Login Credentials (Development)

Use these test credentials to log in locally:

**Admin Login:**
- Email: `test-admin@wecelebrate.test`
- Password: `TestPassword123!`

Or:
- Username: `nchugg`
- Password: `TestPassword123!`

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port (5174, 5175, etc.)

### Environment Variables Not Loading

Make sure your `.env` file is in the root directory (same level as `package.json`) and starts with `VITE_` prefix.

### Backend Connection Issues

If you can't connect to the backend:
1. Check that your `VITE_SUPABASE_URL` is correct
2. Check that your `VITE_SUPABASE_ANON_KEY` is correct
3. Make sure you have internet connection (backend is still on Supabase)

### Clear Cache

If you're seeing old code:

```bash
# Stop the dev server (Ctrl+C)
# Clear Vite cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

## Development Workflow

1. **Make changes** in your code editor
2. **Test locally** at `http://localhost:5173`
3. **Commit changes** when satisfied
4. **Push to GitHub** only when ready to deploy
5. **Netlify auto-deploys** from your branch

## Benefits of Local Development

✅ **Instant feedback** - See changes in < 1 second  
✅ **No deployment costs** - Test unlimited times  
✅ **Faster iteration** - No waiting for builds  
✅ **Debug easily** - Use browser DevTools  
✅ **Work offline** - Frontend works without internet (backend needs connection)

## Next Steps

- Keep the dev server running while you work
- Open DevTools (F12) to see console logs and debug
- Make changes and watch them appear instantly
- Only deploy to Netlify when you're ready to share with others

## Environment-Specific Builds

If you want to test different environments locally:

```bash
# Development build
npm run dev

# Staging build (preview)
npm run build:staging
npm run preview:staging

# Production build (preview)
npm run build:production
npm run preview:production
```

## Questions?

- Check the browser console (F12) for errors
- Check the terminal where `npm run dev` is running for server errors
- Most issues are related to environment variables or missing dependencies
