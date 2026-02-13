# Environment Variables - Quick Reference

## 🚀 Quick Start

```bash
# 1. Copy example to local config
cp .env.example .env.local

# 2. Edit with your values
nano .env.local

# 3. Restart dev server
npm run dev
```

## 📋 Common Variables

```bash
# Required
VITE_APP_ENV=development              # development|staging|production
VITE_API_URL=http://localhost:3001    # API base URL

# Optional - Supabase
VITE_SUPABASE_URL=                    # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=               # Supabase public/anon key

# Optional - Analytics
VITE_GA_ID=                           # Google Analytics ID (G-XXXXXXXXXX)
VITE_SEGMENT_KEY=                     # Segment write key

# Optional - Monitoring
VITE_SENTRY_DSN=                      # Sentry error tracking DSN
```

## 💻 Usage in Code

```typescript
// Direct access
const apiUrl = import.meta.env.VITE_API_URL;

// Using utility
import env from '@/app/config/environment';

env.current                   // Current environment
env.isDevelopment            // Boolean check
env.config.apiBaseUrl        // Get config value
env.getApiUrl('/users')      // Build API URL
env.debug('message')         // Environment-aware logging
```

## 🔐 Security Rules

✅ **Safe to Expose** (VITE_ prefix OK):
- Public API endpoints
- Public Supabase anon keys
- Google Analytics IDs
- Feature flags
- Public CDN URLs

❌ **NEVER Expose** (Do NOT use VITE_ prefix):
- Database passwords
- Private API keys
- Authentication secrets
- Encryption keys
- Admin credentials

## 📁 Files Reference

| File | Purpose | Commit? |
|------|---------|---------|
| `.env.example` | Template | ✅ Yes |
| `.env.local` | Your local config | ❌ Never |
| `.env.development` | Dev defaults | ✅ Yes (no secrets) |
| `.env.staging` | Staging defaults | ✅ Yes (no secrets) |
| `.env.production` | Prod defaults | ✅ Yes (no secrets) |

## 🐛 Troubleshooting

**Variables not loading?**
1. Check prefix: Must start with `VITE_`
2. Restart dev server (Ctrl+C, then npm run dev)
3. Check file name is exactly `.env.local` (not `.env.local.txt`)

**TypeScript errors?**
- Check `/src/env.d.ts` exists
- Restart TypeScript server in IDE

**Build fails?**
- Required vars missing in CI/CD
- Check hosting platform environment settings

## 📚 More Info

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for complete documentation.

## 🎯 Environment-Specific URLs

| Environment | API URL | Purpose |
|-------------|---------|---------|
| Development | `http://localhost:3001` | Local dev server |
| Staging | `https://staging-api.jala.com` | Testing environment |
| Production | `https://api.jala.com` | Live application |

## ⚡ Common Tasks

### Add New Variable

1. Add to `.env.example` with description
2. Add to `/src/env.d.ts` for TypeScript
3. Add to your `.env.local` 
4. Use in code: `import.meta.env.VITE_YOUR_VAR`
5. Update CI/CD with new variable

### Deploy to Production

1. Set variables in hosting platform (Vercel/Netlify/etc.)
2. Set `VITE_APP_ENV=production`
3. Add all required `VITE_*` variables
4. Deploy and verify

### Switch Environments

```bash
# Development
VITE_APP_ENV=development npm run dev

# Staging (test build)
VITE_APP_ENV=staging npm run build
npm run preview

# Production (test build)
VITE_APP_ENV=production npm run build
npm run preview
```

## 🔄 Validation

```typescript
import { validateEnvironment } from '@/app/config/environment';

const { isValid, errors } = validateEnvironment();
if (!isValid) {
  console.error('Missing required variables:', errors);
}
```

---

💡 **Pro Tip**: Use `.env.local` for personal dev settings. It's gitignored and won't conflict with teammates.
