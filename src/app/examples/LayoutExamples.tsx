import { Standard404 } from '../components/Standard404';
import { MaintenancePage, QuickMaintenance } from '../components/MaintenancePage';

/**
 * USAGE EXAMPLES FOR STANDARD LAYOUTS
 * 
 * This file demonstrates how to use the Standard404 and MaintenancePage components
 * throughout the wecelebrate application.
 */

// ============================================
// EXAMPLE 1: Basic 404 Page
// ============================================
export function Basic404Example() {
  return <Standard404 />;
}

// ============================================
// EXAMPLE 2: Custom 404 with specific suggestions
// ============================================
export function Custom404Example() {
  return (
    <Standard404
      title="Client Not Found"
      message="We couldn't find the client you're looking for. It may have been removed or the ID is incorrect."
      suggestions={[
        {
          label: 'View All Clients',
          path: '/admin/clients',
          description: 'Browse all available clients',
        },
        {
          label: 'Admin Dashboard',
          path: '/admin/dashboard',
          description: 'Return to your dashboard',
        },
      ]}
    />
  );
}

// ============================================
// EXAMPLE 3: 404 without back button
// ============================================
export function No404BackButtonExample() {
  return (
    <Standard404
      title="Access Denied"
      message="You don't have permission to view this page."
      showBackButton={false}
      homePath="/admin/dashboard"
    />
  );
}

// ============================================
// EXAMPLE 4: Basic Maintenance Page
// ============================================
export function BasicMaintenanceExample() {
  return <MaintenancePage />;
}

// ============================================
// EXAMPLE 5: Quick Maintenance (simplified)
// ============================================
export function QuickMaintenanceExample() {
  return <QuickMaintenance estimatedTime="2 hours" />;
}

// ============================================
// EXAMPLE 6: Maintenance with Countdown Timer
// ============================================
export function MaintenanceWithCountdownExample() {
  // Set target time (e.g., 1 hour from now)
  const targetTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  
  return (
    <MaintenancePage
      title="Scheduled Maintenance"
      message="We're upgrading our servers to provide you with better performance and new features."
      reason="System upgrade in progress"
      showCountdown={true}
      countdownTarget={targetTime}
      estimatedTime="1 hour"
    />
  );
}

// ============================================
// EXAMPLE 7: Maintenance with Progress Bar
// ============================================
export function MaintenanceWithProgressExample() {
  // In a real scenario, this would be dynamic state
  const progress = 65;
  
  return (
    <MaintenancePage
      title="Database Migration"
      message="We're migrating our database to improve performance. This process is automated and will complete soon."
      reason="Database optimization"
      showProgress={true}
      progress={progress}
      showCountdown={false}
    />
  );
}

// ============================================
// EXAMPLE 8: Maintenance with Custom Content
// ============================================
export function MaintenanceWithCustomContentExample() {
  return (
    <MaintenancePage
      title="Platform Update"
      message="We're rolling out exciting new features to enhance your gifting experience."
      reason="Feature deployment"
      estimatedTime="30 minutes"
      supportEmail="support@wecelebrate.com"
    >
      {/* Custom content */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">What's New?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✨ Enhanced gift catalog with 500+ new items</li>
          <li>🚀 Faster checkout process</li>
          <li>📊 Improved analytics dashboard</li>
          <li>🎨 Refreshed user interface</li>
        </ul>
      </div>
    </MaintenancePage>
  );
}

// ============================================
// EXAMPLE 9: Maintenance without refresh button
// ============================================
export function MaintenanceNoRefreshExample() {
  return (
    <MaintenancePage
      title="Emergency Maintenance"
      message="We're addressing a critical issue. The system will automatically refresh when ready."
      reason="Emergency fix"
      showRefreshButton={false}
      supportEmail="urgent@wecelebrate.com"
    />
  );
}

// ============================================
// USAGE IN ROUTES
// ============================================
/**
 * To use these in your routes.tsx:
 * 
 * import { Standard404 } from './components/Standard404';
 * import { MaintenancePage } from './components/MaintenancePage';
 * 
 * // For 404 pages:
 * { path: "*", Component: Standard404 }
 * 
 * // For maintenance mode, conditionally wrap your routes:
 * const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
 * 
 * if (isMaintenanceMode) {
 *   return <MaintenancePage />;
 * }
 */

// ============================================
// CONDITIONAL MAINTENANCE MODE
// ============================================
export function ConditionalMaintenanceWrapper({ children }: { children: React.ReactNode }) {
  // Check if maintenance mode is enabled (via env variable or API)
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
  
  if (isMaintenanceMode) {
    return (
      <MaintenancePage
        title="Scheduled Maintenance"
        message="We're making improvements to serve you better."
        estimatedTime="2 hours"
      />
    );
  }
  
  return <>{children}</>;
}
