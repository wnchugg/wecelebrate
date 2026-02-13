# Performance Optimization Guide

This guide provides best practices and strategies for optimizing the performance of the wecelebrate platform.

---

## 📊 Performance Goals

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Lighthouse Performance** | 90+ | TBD |
| **First Contentful Paint (FCP)** | < 1.8s | TBD |
| **Largest Contentful Paint (LCP)** | < 2.5s | TBD |
| **Time to Interactive (TTI)** | < 3.5s | TBD |
| **Cumulative Layout Shift (CLS)** | < 0.1 | TBD |
| **Total Blocking Time (TBT)** | < 300ms | TBD |
| **Speed Index** | < 3.0s | TBD |
| **Bundle Size** | < 5MB | TBD |

---

## 🚀 Frontend Optimization

### 1. Code Splitting

**Strategy:** Split code by route and component

```typescript
// Lazy load routes
const Catalogs = lazy(() => import('./pages/Catalogs'));
const Products = lazy(() => import('./pages/Products'));

// Lazy load heavy components
const DataTable = lazy(() => import('./components/DataTable'));
```

**Benefits:**
- Reduces initial bundle size
- Faster initial page load
- Progressive loading

### 2. Image Optimization

**Best Practices:**

```typescript
// Use optimized image formats
<img 
  src="image.webp" 
  srcSet="image-1x.webp 1x, image-2x.webp 2x"
  loading="lazy"
  alt="Description"
/>

// Use Cloudflare Image Optimization
const imageUrl = `https://wecelebrate.app/cdn-cgi/image/width=800,quality=85/image.jpg`;
```

**Recommendations:**
- ✅ Use WebP format
- ✅ Implement lazy loading
- ✅ Provide multiple resolutions
- ✅ Use CDN for delivery
- ✅ Compress images before upload

### 3. Bundle Optimization

**Vite Configuration:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['react-router'],
          'ui': ['lucide-react'],
          'charts': ['recharts']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

**Benefits:**
- Smaller bundle sizes
- Better caching
- Faster updates

### 4. CSS Optimization

**Tailwind Configuration:**

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {}
  },
  // Enable JIT mode
  mode: 'jit',
  // Purge unused styles
  purge: {
    enabled: true,
    content: ['./src/**/*.{ts,tsx}']
  }
};
```

### 5. React Performance

**Optimization Techniques:**

```typescript
// Memoize expensive components
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* render */}</div>;
});

// Memoize expensive calculations
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);

// Optimize callbacks
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// Virtualize long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={1000}
  itemSize={50}
  width="100%"
>
  {Row}
</FixedSizeList>
```

---

## ⚡ Backend Optimization

### 1. Supabase Edge Functions

**Best Practices:**

```typescript
// Cache responses
const cache = new Map();

app.get('/api/catalogs', async (c) => {
  const cacheKey = 'catalogs';
  
  if (cache.has(cacheKey)) {
    return c.json(cache.get(cacheKey));
  }
  
  const data = await fetchCatalogs();
  cache.set(cacheKey, data);
  
  return c.json(data);
});

// Implement pagination
app.get('/api/products', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;
  
  const products = await supabase
    .from('products')
    .select('*')
    .range(offset, offset + limit - 1);
    
  return c.json(products);
});
```

### 2. Database Optimization

**Query Optimization:**

```typescript
// Use indexes
// Add indexes in Supabase dashboard for frequently queried columns

// Optimize queries
// ❌ Bad: Select all fields
const data = await supabase.from('products').select('*');

// ✅ Good: Select only needed fields
const data = await supabase
  .from('products')
  .select('id, name, price, image_url');

// Use efficient filtering
const data = await supabase
  .from('products')
  .select('id, name')
  .eq('catalog_id', catalogId)
  .order('name', { ascending: true })
  .limit(20);
```

**Caching Strategy:**

```typescript
// KV Store caching
async function getCatalogWithCache(catalogId: string) {
  const cacheKey = `catalog:${catalogId}`;
  
  // Try cache first
  const cached = await kv.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const catalog = await fetchCatalog(catalogId);
  
  // Cache for 1 hour
  await kv.set(cacheKey, JSON.stringify(catalog), { ex: 3600 });
  
  return catalog;
}
```

---

## 🌐 Network Optimization

### 1. HTTP/2 and HTTP/3

- ✅ Cloudflare Pages automatically uses HTTP/2
- ✅ Multiplexing reduces round trips
- ✅ Server push for critical resources

### 2. CDN Configuration

```typescript
// Cloudflare caching headers
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

// For API responses
res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
```

### 3. Compression

**Automatic Compression:**
- Brotli compression for text assets
- Gzip fallback
- Pre-compressed assets in build

### 4. Resource Hints

```html
<!-- Preconnect to important origins -->
<link rel="preconnect" href="https://supabase.co" />

<!-- Preload critical resources -->
<link rel="preload" as="font" href="/fonts/main.woff2" crossorigin />

<!-- DNS prefetch for external domains -->
<link rel="dns-prefetch" href="https://analytics.example.com" />
```

---

## 📦 Asset Optimization

### 1. Font Loading

```css
/* Use font-display for better performance */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; /* Prevents FOIT */
}
```

### 2. Icon Optimization

```typescript
// Tree-shake icons
import { Calendar, Users } from 'lucide-react';

// Don't import entire icon set
// ❌ import * as Icons from 'lucide-react';
```

### 3. Third-party Scripts

```html
<!-- Load non-critical scripts async -->
<script async src="analytics.js"></script>

<!-- Defer scripts that aren't immediately needed -->
<script defer src="features.js"></script>
```

---

## 🔍 Monitoring & Profiling

### 1. Performance Monitoring

**Real User Monitoring (RUM):**

```typescript
// Measure Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 2. Performance API

```typescript
// Measure custom metrics
performance.mark('catalog-fetch-start');
await fetchCatalogs();
performance.mark('catalog-fetch-end');

performance.measure(
  'catalog-fetch',
  'catalog-fetch-start',
  'catalog-fetch-end'
);

const measure = performance.getEntriesByName('catalog-fetch')[0];
console.log(`Catalog fetch took ${measure.duration}ms`);
```

### 3. React DevTools Profiler

```typescript
import { Profiler } from 'react';

function onRenderCallback(
  id, // component id
  phase, // "mount" | "update"
  actualDuration, // time spent rendering
  baseDuration, // estimated time without memoization
  startTime,
  commitTime,
  interactions
) {
  console.log({ id, phase, actualDuration });
}

<Profiler id="Catalog" onRender={onRenderCallback}>
  <CatalogList />
</Profiler>
```

---

## 🎯 Optimization Checklist

### Initial Load

- [ ] Code splitting by route
- [ ] Lazy load heavy components
- [ ] Optimize images (WebP, lazy loading)
- [ ] Minify and compress assets
- [ ] Use CDN for static assets
- [ ] Implement critical CSS
- [ ] Preload critical resources
- [ ] Remove unused code

### Runtime Performance

- [ ] Memoize expensive components
- [ ] Virtualize long lists
- [ ] Debounce/throttle user inputs
- [ ] Optimize re-renders
- [ ] Use web workers for heavy computation
- [ ] Implement efficient state management
- [ ] Cache API responses
- [ ] Batch API requests

### Network

- [ ] Enable HTTP/2
- [ ] Implement proper caching
- [ ] Use CDN
- [ ] Compress responses
- [ ] Minimize requests
- [ ] Use resource hints
- [ ] Optimize API payload size
- [ ] Implement request deduplication

### Backend

- [ ] Database query optimization
- [ ] Implement caching strategy
- [ ] Use connection pooling
- [ ] Optimize Edge Function cold starts
- [ ] Implement rate limiting
- [ ] Use proper indexes
- [ ] Paginate large datasets
- [ ] Profile slow queries

---

## 📈 Performance Budget

### Bundle Size Budget

```json
{
  "budgets": [
    {
      "path": "/",
      "maxSize": "500kb",
      "type": "initial"
    },
    {
      "path": "/",
      "maxSize": "2mb",
      "type": "total"
    },
    {
      "path": "/js/*.js",
      "maxSize": "300kb"
    }
  ]
}
```

### Lighthouse Budget

```json
{
  "performance": 90,
  "accessibility": 95,
  "best-practices": 90,
  "seo": 90,
  "pwa": 80
}
```

---

## 🛠️ Tools

### Recommended Tools

**Analysis:**
- Chrome DevTools (Performance, Network, Lighthouse)
- React DevTools Profiler
- Bundle Analyzer
- Lighthouse CI

**Monitoring:**
- Cloudflare Analytics
- Web Vitals
- Sentry Performance
- Custom RUM

**Optimization:**
- ImageOptim
- Squoosh
- Webpack Bundle Analyzer
- Source Map Explorer

---

## 📚 Resources

- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Supabase Performance](https://supabase.com/docs/guides/performance)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## 🔄 Regular Reviews

### Weekly
- Monitor Web Vitals
- Check bundle size
- Review Lighthouse scores

### Monthly
- Full performance audit
- Update dependencies
- Optimize critical paths

### Quarterly
- Major performance review
- Update performance budgets
- Refactor bottlenecks

---

**Last Updated:** February 12, 2026  
**Next Review:** May 12, 2026
