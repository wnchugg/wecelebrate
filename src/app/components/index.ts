/**
 * Component Exports Index
 * Central export point for all UI components
 */

// Layout Components
export { Header } from './Header';
export { Footer } from './Footer';
export { Navigation } from './Navigation';
export { Layout } from './Layout';
export { ConfigurableHeader } from './layout/ConfigurableHeader';
export { ConfigurableFooter } from './layout/ConfigurableFooter';
export { SiteSwitcherDropdown } from './layout/SiteSwitcherDropdown';

// Auth Components
export { ProtectedRoute } from './ProtectedRoute';
export { AdminProtectedRoute } from './AdminProtectedRoute';
export { AdminLoginRedirect } from './AdminLoginRedirect';
export { TokenErrorHandler } from './TokenErrorHandler';

// UI Components
// EventCard removed - file doesn't exist
export { ProductCard } from './ProductCard';
export { LanguageSelector } from './LanguageSelector';
export { CookieConsent } from './CookieConsent';
export { PrivacySettings } from './PrivacySettings';
export { DatabaseNotInitialized } from './DatabaseNotInitialized';
export { SiteLoader } from './SiteLoader';
export { SiteLoaderWrapper } from './SiteLoaderWrapper';
export { CurrencyDisplay } from './CurrencyDisplay';
export { ErrorBoundary } from './ErrorBoundary';
export { DashboardErrorBoundary } from './DashboardErrorBoundary';
export { Alert } from './Alert';
export { CopyButton } from './CopyButton';
export { ProgressSteps } from './ProgressSteps';
export { OptimizedImage } from './OptimizedImage';
export { PrefetchLink } from './PrefetchLink';
export { VirtualScrollList } from './VirtualScrollList';
export { SessionTimeoutWarning } from './SessionTimeoutWarning';
export { SecurityChecklist } from './SecurityChecklist';
export { MaintenancePage } from './MaintenancePage';
export { Standard404 } from './Standard404';

// Backend Components
export { BackendConnectionStatus } from './BackendConnectionStatus';
export { BackendConnectionDiagnostic } from './BackendConnectionDiagnostic';
export { BackendHealthTest } from './BackendHealthTest';
export { BackendNotDeployedBanner } from './BackendNotDeployedBanner';
export { BackendDeploymentGuide } from './BackendDeploymentGuide';
export { BackendTroubleshootingPanel } from './BackendTroubleshootingPanel';
export { Backend401Notice } from './Backend401Notice';

// Deployment Components
export { DeploymentStatusBanner } from './DeploymentStatusBanner';
export { DeploymentEnvironmentSelector } from './DeploymentEnvironmentSelector';
export { EnvironmentBadge } from './EnvironmentBadge';
export { EnvironmentCredentialChecker } from './EnvironmentCredentialChecker';
export { QuickEnvironmentSwitch } from './QuickEnvironmentSwitch';

// Site Components
export { SiteSwitcher } from './SiteSwitcher';
export { SiteInfoBanner } from './SiteInfoBanner';
export { CatalogInitializer } from './CatalogInitializer';

// Editor Components
export { RichTextEditor } from './RichTextEditor';
export { EmailContentEditor } from './EmailContentEditor';

// Redirect Components
export { RedirectToDashboard } from './RedirectToDashboard';
export { GiftsRedirect } from './GiftsRedirect';
export { ConnectionTestRedirect } from './ConnectionTestRedirect';

// Other Components
export { SetupWizard } from './SetupWizard';
export { ComplianceBadges } from './ComplianceBadges';
export { DevelopmentNote } from './DevelopmentNote';
export { DraggableGiftCard } from './DraggableGiftCard';
export { ECard } from './ECard';
export { SecureForm } from './SecureForm';

// Re-export UI primitives
export * from './ui/button';
export * from './ui/input';
export * from './ui/label';
export * from './ui/card';
export * from './ui/badge';
export * from './ui/dialog';
export * from './ui/tabs';
export * from './ui/select';
export * from './ui/checkbox';
export * from './ui/switch';
export * from './ui/textarea';
export * from './ui/progress';
export * from './ui/separator';
export * from './ui/skeleton';
// toast and toaster are provided by 'sonner' library, not local files
export * from './ui/alert';
export * from './ui/avatar';
export * from './ui/dropdown-menu';
export * from './ui/popover';
export * from './ui/tooltip';
export * from './ui/table';