# Standard Page Layouts

This document describes the standard page layouts available in the wecelebrate application for 404 errors and maintenance pages.

## 📄 Available Layouts

### 1. Standard404 Component

A flexible, customizable 404 error page with intelligent features.

**Location:** `/src/app/components/Standard404.tsx`

#### Features
- ✨ Large, visually appealing 404 display
- 🎯 Customizable title and message
- 🔍 Optional search suggestions
- ↩️ Optional back button
- 🏠 Configurable home path
- 🎨 Matches wecelebrate branding

#### Props

```typescript
interface Standard404Props {
  title?: string;              // Custom title (default: "Page Not Found")
  message?: string;            // Custom message
  showSuggestions?: boolean;   // Show helpful links (default: true)
  suggestions?: Array<{        // Custom link suggestions
    label: string;
    path: string;
    description?: string;
  }>;
  showBackButton?: boolean;    // Show back button (default: true)
  homePath?: string;           // Custom home path (default: "/")
}
```

#### Basic Usage

```tsx
import { Standard404 } from './components/Standard404';

// Simple usage with defaults
<Standard404 />

// Custom usage
<Standard404
  title="Client Not Found"
  message="We couldn't find the client you're looking for."
  suggestions={[
    { label: 'View All Clients', path: '/admin/clients', description: 'Browse clients' },
    { label: 'Dashboard', path: '/admin/dashboard', description: 'Go to dashboard' }
  ]}
/>
```

#### In Routes

```tsx
// In routes.tsx
import { Standard404 } from './components/Standard404';

{ path: "*", Component: Standard404 }
```

---

### 2. MaintenancePage Component

A comprehensive maintenance page with countdown timers, progress bars, and custom content.

**Location:** `/src/app/components/MaintenancePage.tsx`

#### Features
- ⏰ Countdown timer with real-time updates
- 📊 Progress bar for showing completion percentage
- 🎨 Animated gradient background
- 📧 Contact support option
- 🔄 Refresh button
- 🎯 Fully customizable content
- ✨ Smooth animations and transitions

#### Props

```typescript
interface MaintenancePageProps {
  title?: string;              // Page title (default: "We'll be back soon!")
  message?: string;            // Main message
  estimatedTime?: string;      // Estimated time (e.g., "2 hours")
  showCountdown?: boolean;     // Show live countdown (default: false)
  countdownTarget?: string | number; // Target time (ISO string or timestamp)
  showRefreshButton?: boolean; // Show refresh button (default: true)
  supportEmail?: string;       // Support email (default: "support@wecelebrate.com")
  children?: React.ReactNode;  // Custom content to display
  reason?: string;             // Maintenance reason (default: "Scheduled maintenance")
  showProgress?: boolean;      // Show progress bar (default: false)
  progress?: number;           // Progress percentage 0-100 (default: 0)
}
```

#### Basic Usage

```tsx
import { MaintenancePage, QuickMaintenance } from './components/MaintenancePage';

// Quick maintenance (simplified)
<QuickMaintenance estimatedTime="30 minutes" />

// Full maintenance page
<MaintenancePage
  title="Scheduled Maintenance"
  message="We're upgrading our servers for better performance."
  estimatedTime="2 hours"
  reason="System upgrade"
/>

// With countdown timer
<MaintenancePage
  showCountdown={true}
  countdownTarget={new Date('2026-02-10T18:00:00').toISOString()}
  reason="Database migration"
/>

// With progress bar
<MaintenancePage
  showProgress={true}
  progress={65}
  reason="Feature deployment"
/>

// With custom content
<MaintenancePage
  title="Platform Update"
  message="Rolling out new features!"
>
  <div className="bg-blue-50 p-6 rounded-xl">
    <h3 className="font-bold mb-3">What's New?</h3>
    <ul className="space-y-2">
      <li>✨ New gift catalog</li>
      <li>🚀 Faster checkout</li>
      <li>📊 Better analytics</li>
    </ul>
  </div>
</MaintenancePage>
```

---

## 🎯 Common Use Cases

### Use Case 1: Route Not Found

```tsx
// In routes.tsx - catch all unmatched routes
{
  path: "*",
  Component: () => (
    <Standard404
      suggestions={[
        { label: 'Home', path: '/', description: 'Go to homepage' },
        { label: 'Admin Login', path: '/admin/login', description: 'Access admin' }
      ]}
    />
  )
}
```

### Use Case 2: Resource Not Found (Client, Site, etc.)

```tsx
// In ClientDetail.tsx or similar
if (!client) {
  return (
    <Standard404
      title="Client Not Found"
      message={`No client found with ID: ${clientId}`}
      suggestions={[
        { label: 'View All Clients', path: '/admin/clients' },
        { label: 'Create New Client', path: '/admin/clients/new' }
      ]}
      homePath="/admin/dashboard"
    />
  );
}
```

### Use Case 3: Scheduled Maintenance

```tsx
// In App.tsx or Root.tsx
const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

if (isMaintenanceMode) {
  return (
    <MaintenancePage
      title="Scheduled Maintenance"
      message="We're upgrading wecelebrate with new features."
      estimatedTime="2 hours"
      showCountdown={true}
      countdownTarget="2026-02-10T20:00:00Z"
    />
  );
}
```

### Use Case 4: Database Migration with Progress

```tsx
// In a migration page
const [progress, setProgress] = useState(0);

// Update progress from API
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch('/api/migration-status');
    const data = await response.json();
    setProgress(data.progress);
  }, 5000);
  return () => clearInterval(interval);
}, []);

return (
  <MaintenancePage
    title="Database Migration"
    message="Migrating to improved infrastructure."
    showProgress={true}
    progress={progress}
    showRefreshButton={true}
  />
);
```

### Use Case 5: Emergency Maintenance

```tsx
<MaintenancePage
  title="Emergency Maintenance"
  message="We're addressing a critical issue and will be back shortly."
  reason="Emergency fix in progress"
  showRefreshButton={false}
  supportEmail="urgent@wecelebrate.com"
/>
```

---

## 🎨 Styling & Branding

Both components follow the **wecelebrate RecHUB Design System**:
- Primary color: `#D91C81` (magenta/pink)
- Secondary color: `#B71569` (darker magenta)
- Gradient backgrounds: pink-50 → purple-50
- Consistent spacing and typography
- Smooth animations and transitions
- Fully responsive design

---

## ♿ Accessibility Features

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- High contrast mode support
- Reduced motion support (respects `prefers-reduced-motion`)
- Screen reader friendly

---

## 📱 Responsive Design

Both layouts are fully responsive and work beautifully on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1920px+)

---

## 🔧 Environment Variables

For maintenance mode, you can use environment variables:

```bash
# .env.development
VITE_MAINTENANCE_MODE=false

# .env.production
VITE_MAINTENANCE_MODE=true
```

Then conditionally show maintenance:

```tsx
const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
```

---

## 📚 Examples

Full usage examples are available in:
**`/src/app/examples/LayoutExamples.tsx`**

This file contains 9+ real-world examples showing different configurations and use cases.

---

## 🚀 Quick Start

### Add a 404 page to any route:

```tsx
import { Standard404 } from './components/Standard404';

// In your route configuration
{ path: "*", Component: Standard404 }
```

### Add maintenance mode to your app:

```tsx
import { QuickMaintenance } from './components/MaintenancePage';

// At the top level of your app
if (isMaintenanceMode) {
  return <QuickMaintenance estimatedTime="2 hours" />;
}
```

---

## 💡 Tips

1. **404 Pages**: Use specific, helpful messages and suggestions
2. **Maintenance**: Always show estimated time and reason
3. **Countdown**: Use for scheduled maintenance with known end time
4. **Progress**: Use for migrations or long-running operations
5. **Custom Content**: Add updates, release notes, or important info
6. **Support**: Always provide a way to contact support

---

## 🆘 Need Help?

If you have questions or need custom layouts, contact the development team or check the examples file.

---

**Last Updated:** February 10, 2026  
**Version:** 1.0.0  
**Maintained by:** wecelebrate Development Team
