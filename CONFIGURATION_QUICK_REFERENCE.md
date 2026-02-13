# JALA 2 - Environment & Configuration Quick Reference

## 🚀 Quick Start

### Environment Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Set your environment:**
   ```env
   VITE_APP_ENV=development  # or staging, production
   VITE_API_URL=http://localhost:3001
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

## 🌍 Environment Detection

The app automatically detects the environment based on:
- `VITE_APP_ENV` variable (highest priority)
- Hostname patterns (staging.*, *.jala.com)
- Defaults to `development`

Current environment is displayed in:
- Admin login page (top)
- Admin header (next to page title)

## ⚙️ Configuration Management

### Access Configuration Management

1. Log in to Admin: `/admin/login`
2. Navigate to: **Config Management** (sidebar)
3. Three tabs: **Global Config**, **Export**, **Import**

### Quick Export

**Full backup:**
- Go to Export → Click "Export Full Configuration"
- Saves: `jala-full-config-YYYY-MM-DD.json`

**Individual exports:**
- Client: Exports client + all its sites
- Site: Exports single site configuration
- CSV: Tabular export for reporting

### Quick Import

1. Go to Import tab
2. Upload JSON file or paste content
3. Enable "Generate new IDs" ✓ (recommended)
4. Click **Validate**
5. Review results
6. Click **Import Configuration**

## 📊 Configuration Hierarchy

```
Global Config (Application-wide)
  └─ Clients (Companies)
      └─ Sites (Individual portals)
```

## 🔧 Using Environment Config in Code

```typescript
import env from '@/app/config/environment';

// Check environment
if (env.isDevelopment) {
  // Development-only code
}

// Get API URL
const apiUrl = env.getApiUrl('/api/clients');

// Check feature
if (env.hasFeature('enableImportExport')) {
  // Show feature
}

// Environment-aware logging
env.debug('Debug message');  // Only in dev/staging
env.error('Error', error);    // Always logged
```

## 🔐 Environment Variables

### Required by Environment

| Variable | Dev | Staging | Prod |
|----------|-----|---------|------|
| `VITE_APP_ENV` | Optional | ✓ | ✓ |
| `VITE_API_URL` | Optional | ✓ | ✓ |
| `VITE_SUPABASE_URL` | Optional | ✓ | ✓ |
| `VITE_SUPABASE_ANON_KEY` | Optional | ✓ | ✓ |
| `VITE_SENTRY_DSN` | No | Optional | ✓ |
| `VITE_GA_ID` | No | Optional | ✓ |

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment template |
| `/src/app/config/environment.ts` | Environment detection & config |
| `/src/app/config/globalConfig.ts` | Global configuration management |
| `/src/app/utils/configImportExport.ts` | Import/export utilities |
| `/CONFIGURATION_MANAGEMENT.md` | Full documentation |

## 🎯 Common Tasks

### Task: Backup Configuration
```
Admin → Config Management → Export → Export Full Configuration
```

### Task: Clone Configuration to New Environment
1. Export from source environment
2. Import to target with "Generate new IDs" enabled
3. Update environment-specific settings

### Task: Change Environment
```bash
# .env
VITE_APP_ENV=staging
```
Restart dev server.

### Task: View Current Environment
- Check admin login page badge
- Check admin header badge
- Or in console:
```typescript
import env from '@/app/config/environment';
console.log(env.current); // 'development', 'staging', or 'production'
```

## 🛡️ Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use different secrets per environment
3. ✅ Rotate production secrets regularly
4. ✅ Limit access to Config Management (super_admin only)
5. ✅ Test imports in staging first
6. ✅ Always validate before importing
7. ✅ Backup before major changes

## 🐛 Troubleshooting

**Environment not detected?**
- Check `VITE_APP_ENV` in `.env`
- Restart development server
- Clear browser cache

**Import fails?**
- Validate JSON structure first
- Check for missing required fields
- Ensure version compatibility

**Configuration not saving?**
- Check browser localStorage quota
- Check browser console for errors
- Try resetting to defaults

## 📚 Full Documentation

See `/CONFIGURATION_MANAGEMENT.md` for complete documentation including:
- Detailed environment configuration
- Global configuration structure
- Import/export API reference
- Migration workflows
- Advanced troubleshooting

## 🎨 Environment Badge Colors

- 🔵 **DEV** - Blue (Development)
- 🟡 **STAGING** - Yellow (Staging)
- 🔴 **PRODUCTION** - Red (Production)

## 🔗 Quick Links

- Admin Panel: `/admin`
- Config Management: `/admin/config-management`
- Full Docs: `/CONFIGURATION_MANAGEMENT.md`
- API Reference: See full docs

---

**Need Help?** Contact: support@jala.com

**Version:** 2.0.0 | **Last Updated:** Feb 6, 2026
