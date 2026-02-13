# JALA 2 - Environment Configuration

## Overview

This project uses environment variables for all configuration including API endpoints, integration keys, and feature flags. All sensitive credentials are managed through environment variables and **never hardcoded**.

## Quick Start

```bash
# 1. Copy the example environment file
cp .env.example .env.local

# 2. Edit with your credentials (if needed)
nano .env.local

# 3. Start development server
npm run dev
```

## Environment Files

| File | Purpose | Commit? |
|------|---------|---------|
| `.env.example` | Template with all available variables | ✅ Yes |
| `.env.local` | Your local overrides (with secrets) | ❌ Never |
| `.env.development` | Development defaults | ✅ Yes |
| `.env.staging` | Staging configuration | ✅ Yes |
| `.env.production` | Production configuration | ✅ Yes |

## Required Variables

For basic development, no environment variables are required. The app will use defaults.

For production/staging:

```bash
VITE_APP_ENV=production
VITE_API_URL=https://api.jala.com
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Security

⚠️ **Important**: All `VITE_*` variables are exposed to the browser. Never put sensitive secrets here.

✅ **Safe to expose**:
- Public API endpoints
- Supabase anon keys (designed to be public)
- Google Analytics IDs
- Feature flags

❌ **Never expose**:
- Database passwords
- Private API keys
- Admin credentials
- Encryption secrets

## Documentation

- **[Complete Guide](./ENVIRONMENT_VARIABLES.md)** - Full documentation with examples
- **[Quick Reference](./ENVIRONMENT_QUICK_REFERENCE.md)** - Common variables and tasks
- **[TypeScript Types](./src/env.d.ts)** - Type definitions for all variables

## Common Tasks

### Add a New Variable

1. Add to `.env.example` with description
2. Add TypeScript definition in `src/env.d.ts`
3. Add to your `.env.local`
4. Use: `import.meta.env.VITE_YOUR_VAR`

### Switch Environments

```bash
# Development (default)
npm run dev

# Test staging build
VITE_APP_ENV=staging npm run build
npm run preview

# Test production build  
VITE_APP_ENV=production npm run build
npm run preview
```

### Debug Environment Issues

```typescript
import { validateEnvironment } from '@/app/config/environment';

// Check validation
const { isValid, errors } = validateEnvironment();

// Or use the utility
import { logEnvVars } from '@/app/utils/env';
logEnvVars(); // Development only
```

## Troubleshooting

**Variables not loading?**
1. Check prefix: Must start with `VITE_`
2. Restart dev server (environment variables are loaded on startup)
3. Check file name is exactly `.env.local`

**Build fails?**
- Add required variables to your CI/CD platform
- Check Vercel/Netlify environment settings
- Verify all `VITE_*` variables are set

## CI/CD Setup

### GitHub Actions

```yaml
env:
  VITE_APP_ENV: production
  VITE_API_URL: ${{ secrets.API_URL }}
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### Vercel

Add in **Settings → Environment Variables** for each environment.

### Netlify

Add in **Site settings → Build & deploy → Environment**.

## Support

See the documentation files for detailed information:
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Complete guide
- [ENVIRONMENT_QUICK_REFERENCE.md](./ENVIRONMENT_QUICK_REFERENCE.md) - Quick reference

---

**Remember**: When in doubt, check the `.env.example` file for the latest list of supported variables.
