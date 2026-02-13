# Environment Variables Configuration Guide

## Overview

The JALA 2 application uses Vite's built-in environment variable system to manage configuration across different environments (development, staging, production). All sensitive credentials and environment-specific settings are managed through environment variables.

## 🔐 Security First

**CRITICAL: All environment variables prefixed with `VITE_` are exposed to the browser.**

- ✅ **Safe**: Public API keys, feature flags, public URLs
- ❌ **Never Use**: Private API keys, database passwords, secret tokens, authentication secrets
- ✅ **Best Practice**: Use backend services (like Supabase) to proxy sensitive API calls

## Environment Files

### File Structure

```
.env.example         # Template showing all available variables (commit this)
.env.local          # Local overrides - NEVER COMMIT
.env.development    # Development defaults (can commit without secrets)
.env.staging        # Staging configuration (can commit without secrets)
.env.production     # Production configuration (can commit without secrets)
```

### Loading Priority

Vite loads environment files in this order (later files override earlier ones):

1. `.env` - Shared across all environments
2. `.env.[mode]` - Mode-specific (development/staging/production)
3. `.env.local` - Local overrides (highest priority)
4. `.env.[mode].local` - Mode-specific local overrides

### File Rules

- ✅ **Commit**: `.env.example`, `.env.development`, `.env.staging`, `.env.production` (without real secrets)
- ❌ **Never Commit**: `.env.local`, `.env.*.local` files

## Available Environment Variables

### Environment Type
```bash
VITE_APP_ENV=development|staging|production
```
Sets the application environment. Automatically detected but can be overridden.

### API Configuration
```bash
VITE_API_URL=http://localhost:3001
```
Backend API base URL. Changes per environment:
- Development: `http://localhost:3001`
- Staging: `https://staging-api.jala.com`
- Production: `https://api.jala.com`

### Supabase Integration (Optional)
```bash
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Required for backend features like authentication and data persistence.
- Get these from: Supabase Project Settings > API
- The anon key is safe to expose (it's public by design)

### Analytics (Optional)
```bash
VITE_GA_ID=G-XXXXXXXXXX
VITE_SEGMENT_KEY=your-segment-key
```
Analytics platform integration keys.

### Error Monitoring (Optional)
```bash
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```
Sentry error tracking DSN.

### Feature Flags (Optional)
```bash
VITE_ENABLE_ANALYTICS=true|false
VITE_ENABLE_ERROR_REPORTING=true|false
VITE_ENABLE_DEBUG_LOGGING=true|false
```
Toggle features per environment.

## Setup Instructions

### 1. Initial Setup (First Time)

```bash
# Copy the example file to create your local configuration
cp .env.example .env.local

# Edit .env.local and add your credentials
# Use your favorite editor
nano .env.local
```

### 2. Development Setup

The `.env.development` file provides sensible defaults for local development. You only need to add credentials if you're testing features that require them:

```bash
# .env.local for development
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3001

# Optional: Only add if testing Supabase features
# VITE_SUPABASE_URL=your-dev-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-dev-anon-key
```

### 3. Staging/Production Setup

For deployment environments, use CI/CD environment variables or hosting platform settings:

**Vercel:**
```
Settings > Environment Variables
Add each VITE_* variable for each environment
```

**Netlify:**
```
Site settings > Build & deploy > Environment
Add variables per deploy context (production, staging)
```

**GitHub Actions:**
```yaml
env:
  VITE_APP_ENV: production
  VITE_API_URL: ${{ secrets.API_URL }}
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Usage in Code

### Accessing Environment Variables

```typescript
// TypeScript with full autocomplete support
const apiUrl = import.meta.env.VITE_API_URL;
const environment = import.meta.env.VITE_APP_ENV;

// Check if variable exists
if (import.meta.env.VITE_SUPABASE_URL) {
  // Initialize Supabase
}
```

### Using the Environment Utility

The app provides a convenient wrapper in `/src/app/config/environment.ts`:

```typescript
import env from '@/app/config/environment';

// Get current environment
console.log(env.current); // 'development' | 'staging' | 'production'

// Check environment
if (env.isDevelopment) {
  // Development-only code
}

// Get full config
const config = env.config;
console.log(config.apiBaseUrl);
console.log(config.integrations.supabase?.url);

// Check features
if (env.hasFeature('enableAnalytics')) {
  // Initialize analytics
}

// Build API URLs
const url = env.getApiUrl('/users/profile');

// Logging utilities (respects environment)
env.debug('Debug info'); // Only logs in dev/staging
env.warn('Warning message');
env.error('Error occurred');
```

### Validation

Validate environment variables on app startup:

```typescript
import { validateEnvironment } from '@/app/config/environment';

const validation = validateEnvironment();
if (!validation.isValid) {
  console.error('Environment validation failed:', validation.errors);
}
```

## TypeScript Support

TypeScript definitions are provided in `/src/env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production';
  readonly VITE_API_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  // ... more variables
}
```

This provides:
- ✅ Autocomplete in your IDE
- ✅ Type checking
- ✅ IntelliSense documentation

## Common Patterns

### Conditional Feature Loading

```typescript
// Only load analytics in production
if (env.config.enableAnalytics && import.meta.env.VITE_GA_ID) {
  import('./analytics').then(({ initAnalytics }) => {
    initAnalytics(import.meta.env.VITE_GA_ID);
  });
}
```

### Environment-Specific Behavior

```typescript
// Different timeouts per environment
const timeout = env.isProduction ? 30000 : 60000;

// Different API retry logic
const maxRetries = env.isDevelopment ? 1 : 3;
```

### Safe Secret Access

```typescript
// Check before using
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  // Initialize Supabase
} else {
  console.warn('Supabase not configured - using mock data');
}
```

## Troubleshooting

### Variables Not Loading

1. **Restart the dev server** - Vite only loads env vars on startup
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

2. **Check the prefix** - Must start with `VITE_`
   ```bash
   ✅ VITE_API_URL=...
   ❌ API_URL=...
   ```

3. **Check the file name** - Must match exactly
   ```bash
   ✅ .env.local
   ❌ env.local
   ❌ .env.local.txt
   ```

### Variables Not Updating

- Environment variables are **statically replaced** at build time
- Changes require restarting the dev server
- In production, rebuild the app to pick up new values

### Missing TypeScript Types

If autocomplete isn't working:
1. Check `/src/env.d.ts` exists
2. Restart TypeScript server in your IDE
3. Check `tsconfig.json` includes the file

### Production Build Issues

```bash
# Test production build locally
npm run build
npm run preview
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        env:
          VITE_APP_ENV: production
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          VITE_GA_ID: ${{ secrets.GA_ID }}
          VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
        run: npm run build
```

### Vercel Configuration

```json
{
  "env": {
    "VITE_APP_ENV": "production",
    "VITE_API_URL": "@production-api-url"
  },
  "build": {
    "env": {
      "VITE_SUPABASE_URL": "@supabase-url",
      "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
    }
  }
}
```

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Rotate keys regularly** - Especially if they might be compromised
3. **Use different credentials per environment** - Don't share production keys with staging
4. **Audit exposed variables** - Only prefix with `VITE_` if safe to expose
5. **Use backend proxies** - For sensitive API calls, use your backend as a proxy
6. **Monitor usage** - Set up alerts for suspicious API key usage

## Migration Checklist

If migrating from hardcoded values to environment variables:

- [ ] Identify all API keys and secrets in code
- [ ] Create appropriate `VITE_*` environment variables
- [ ] Update code to use `import.meta.env.*`
- [ ] Add variables to `.env.example`
- [ ] Update CI/CD pipelines with new variables
- [ ] Document which variables are required vs optional
- [ ] Test in all environments (dev, staging, production)
- [ ] Rotate any exposed keys/secrets

## Support

For questions or issues:
1. Check this documentation first
2. Review Vite's [environment variables documentation](https://vitejs.dev/guide/env-and-mode.html)
3. Check the project's issue tracker
4. Contact the development team

---

**Remember**: Security is everyone's responsibility. When in doubt about whether something should be an environment variable, ask the team lead or security team.
