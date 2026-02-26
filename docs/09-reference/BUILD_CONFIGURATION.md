# Build Configuration Reference

## Overview

JALA 2 uses **Vite 6.4.1** as the build tool for fast development and optimized production builds.

## Configuration File

**Location**: `vite.config.ts` (project root)

## Vite Plugins

### 1. React Plugin (`@vitejs/plugin-react`)
Provides React Fast Refresh and JSX transformation.

```typescript
import react from '@vitejs/plugin-react'

plugins: [react()]
```

**Features**:
- Fast Refresh for instant component updates
- JSX/TSX transformation
- React DevTools integration

### 2. Tailwind CSS Plugin (`@tailwindcss/vite`)
Integrates Tailwind CSS v4 with Vite.

```typescript
import tailwindcss from '@tailwindcss/vite'

plugins: [tailwindcss()]
```

**Features**:
- CSS-first configuration via `@theme` directive
- Automatic content detection (no `content` config needed)
- 3.5x faster builds compared to Tailwind v3
- Modern CSS features (`@property`, `color-mix()`)

**Browser Requirements**: Safari 16.4+, Chrome 111+, Firefox 128+

### 3. Figma Asset Plugin (Custom)
Resolves Figma asset URLs for design system integration.

```typescript
function figmaAssetPlugin() {
  return {
    name: 'figma-asset-plugin',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        return '\0' + id;
      }
    },
    load(id: string) {
      if (id.startsWith('\0figma:asset/')) {
        const hash = id.slice('\0figma:asset/'.length);
        return `export default "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/${hash}"`;
      }
    },
  };
}
```

**Usage**:
```typescript
import figmaImage from 'figma:asset/abc123def456'
// Resolves to: https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/abc123def456
```

## Path Aliases

Configured path aliases for clean, maintainable imports:

| Alias | Resolves To | Usage |
|-------|-------------|-------|
| `@` | `./src` | General src imports |
| `@/app` | `./src/app` | App-specific code |
| `@/components` | `./src/app/components` | React components |
| `@/utils` | `./src/app/utils` | Utility functions |
| `@/context` | `./src/app/context` | React Context providers |
| `@/pages` | `./src/app/pages` | Page components |
| `@/styles` | `./src/styles` | Global styles |
| `/utils` | `./utils` | Root-level utilities |

### Usage Examples

```typescript
// ✅ Good - Use path aliases
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import { formatDate } from '@/utils/date'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/User'

// ❌ Bad - Relative imports
import { Button } from '../../../components/ui/button'
import { useLanguage } from '../../context/LanguageContext'
```

### TypeScript Configuration

Path aliases are also configured in `tsconfig.json` for TypeScript support:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/components/*": ["./src/app/components/*"],
      "@/utils/*": ["./src/app/utils/*"],
      "@/context/*": ["./src/app/context/*"],
      "@/pages/*": ["./src/app/pages/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  }
}
```

## Environment Variables

### Configuration

```typescript
export default defineConfig({
  envPrefix: 'VITE_',
})
```

### Rules

1. **Client-side variables MUST be prefixed with `VITE_`**
   - Only variables with this prefix are exposed to the browser
   - Prevents accidental exposure of server-side secrets

2. **Access in code**:
   ```typescript
   // ✅ Good - Properly prefixed
   const apiUrl = import.meta.env.VITE_API_URL
   const appEnv = import.meta.env.VITE_APP_ENV
   
   // ❌ Bad - Won't be exposed to client
   const secret = import.meta.env.SECRET_KEY
   ```

3. **Environment files**:
   - `.env` - Local development (gitignored)
   - `.env.example` - Template for required variables
   - `.env.production` - Production overrides (gitignored)

### Common Variables

```bash
# API Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application Environment
VITE_APP_ENV=development  # development | staging | production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

## Test Configuration

### Resource Limits

Vitest is configured with ultra-conservative resource limits to prevent system crashes during local development:

```typescript
// vitest.config.ts
maxConcurrency: 1,        // Max 1 test file at a time
poolOptions: {
  threads: {
    maxThreads: 1,        // Single worker thread
    minThreads: 1,        // Keep at least 1 worker
    singleThread: true,   // Force single-threaded execution
  }
}
```

**Local Development** (`npm run test:safe`):
- Uses default config (1 worker, 1 max concurrency)
- Single-threaded execution prevents CPU overload
- MacBook-friendly resource usage
- Prevents excessive CPU/memory usage

**CI Environment** (`npm run test:full`):
- Overrides via command-line: `--maxConcurrency=4 --poolOptions.threads.maxThreads=4`
- Higher parallelism for faster CI builds (4 concurrent test files, 4 worker threads)
- Disables single-thread mode for better performance
- Allocates 4GB memory (`NODE_OPTIONS='--max-old-space-size=4096'`)
- Suitable for dedicated CI runners with sufficient resources

### Test Execution Modes

Vitest is configured with `watch: false` by default to prevent accidental watch mode activation. This ensures tests run once and exit, which is safer for CI environments and prevents resource exhaustion.

```bash
# Local development (safe defaults, single run)
npm run test:safe

# CI environment (higher concurrency, single run)
npm run test:full

# Watch mode (explicitly enable with --watch flag)
npm run test:watch

# Coverage generation (single run)
npm run test:coverage
```

**Watch Mode Behavior**:
- Default: Tests run once and exit (`watch: false` in config)
- Watch mode: Must be explicitly enabled via `--watch` flag or `npm run test:watch`
- This prevents accidental watch mode when running `vitest` directly
- Ensures consistent behavior across different environments

## Build Commands

### Development

```bash
npm run dev
```

- Starts Vite dev server on `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Fast Refresh for React components
- Source maps enabled

### Production Build

```bash
npm run build
```

- Minifies JavaScript and CSS
- Tree-shaking for unused code
- Code splitting for optimal loading
- Generates source maps (configurable)
- Output directory: `dist/`

### Environment-Specific Builds

```bash
# Staging build
npm run build:staging
# Sets VITE_APP_ENV=staging

# Production build
npm run build:production
# Sets VITE_APP_ENV=production
```

### Preview Production Build

```bash
npm run preview
```

- Serves production build locally
- Tests production optimizations
- Runs on `http://localhost:4173`

## Build Optimization

### Code Splitting

Vite automatically splits code for optimal loading:

1. **Vendor chunks**: Third-party libraries
2. **Route chunks**: Lazy-loaded pages
3. **Component chunks**: Heavy components

### Tree Shaking

Unused code is automatically removed:

```typescript
// Only Button is bundled, not Card
import { Button } from '@/components/ui/button'
```

### Asset Optimization

- **Images**: Optimized and hashed
- **Fonts**: Preloaded for performance
- **CSS**: Minified and extracted
- **JavaScript**: Minified with Terser

## Performance Tips

### 1. Use Dynamic Imports for Large Components

```typescript
// ✅ Good - Lazy load heavy components
const HeavyChart = lazy(() => import('@/components/HeavyChart'))

// ❌ Bad - Bundles everything upfront
import { HeavyChart } from '@/components/HeavyChart'
```

### 2. Optimize Dependencies

```bash
# Analyze bundle size
npm run build -- --mode analyze
```

### 3. Use Path Aliases Consistently

- Improves tree-shaking
- Reduces bundle size
- Faster builds

### 4. Leverage Vite's Fast Refresh

- Save files to see instant updates
- No full page reload needed
- Preserves component state

## Troubleshooting

### Build Errors

#### "Module not found"

**Cause**: Incorrect import path or missing path alias

**Solution**:
```typescript
// Check path alias configuration in vite.config.ts
// Use @ prefix for src imports
import { Component } from '@/components/Component'
```

#### "Cannot resolve module"

**Cause**: Missing dependency or incorrect file extension

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Check file extension (.ts vs .tsx)
```

#### "Out of memory" during build

**Cause**: Large bundle or insufficient memory

**Solution**:
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Development Issues

#### "Port already in use"

**Solution**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

#### "HMR not working"

**Solution**:
1. Check browser console for errors
2. Restart dev server
3. Clear browser cache
4. Check firewall settings

#### "Slow builds"

**Solution**:
1. Clear Vite cache: `rm -rf node_modules/.vite`
2. Update dependencies: `npm update`
3. Check for large dependencies
4. Use `npm run build -- --profile` to identify bottlenecks

## Advanced Configuration

### Custom Vite Plugin

```typescript
function myCustomPlugin() {
  return {
    name: 'my-plugin',
    transform(code, id) {
      // Transform code here
      return code
    }
  }
}

export default defineConfig({
  plugins: [myCustomPlugin()]
})
```

### Build Options

```typescript
export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  }
})
```

### Server Options

```typescript
export default defineConfig({
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

## References

- [Vite Documentation](https://vitejs.dev/)
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React Fast Refresh](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

---

**Last Updated**: February 24, 2026  
**Vite Version**: 6.4.1  
**Configuration File**: `vite.config.ts`
