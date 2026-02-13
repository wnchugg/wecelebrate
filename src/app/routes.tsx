import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { AdminRoot } from './pages/admin/AdminRoot';
import { SiteLoaderWrapper } from './components/SiteLoaderWrapper';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load public pages
const Welcome = lazy(() => import('./pages/Welcome'));
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const AccessValidation = lazy(() => import('./pages/AccessValidation').then(m => ({ default: m.AccessValidation })));
const InitializeDatabase = lazy(() => import('./pages/InitializeDatabase').then(m => ({ default: m.InitializeDatabase })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const Celebration = lazy(() => import('./pages/Celebration'));
const CelebrationCreate = lazy(() => import('./pages/CelebrationCreate'));
const FeaturePreview = lazy(() => import('./pages/FeaturePreview'));
const StakeholderReview = lazy(() => import('./pages/StakeholderReview'));
const TechnicalReview = lazy(() => import('./pages/TechnicalReview'));
const MagicLinkRequest = lazy(() => import('./pages/MagicLinkRequest').then(m => ({ default: m.MagicLinkRequest })));
const MagicLinkValidation = lazy(() => import('./pages/MagicLinkValidation').then(m => ({ default: m.MagicLinkValidation })));
const SSOValidation = lazy(() => import('./pages/SSOValidation').then(m => ({ default: m.SSOValidation })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const SiteSelection = lazy(() => import('./pages/SiteSelection').then(m => ({ default: m.SiteSelection })));
const SelectionPeriodExpired = lazy(() => import('./pages/SelectionPeriodExpired').then(m => ({ default: m.SelectionPeriodExpired })));
const GiftSelection = lazy(() => import('./pages/GiftSelection').then(m => ({ default: m.GiftSelection })));
const GiftsRedirect = lazy(() => import('./components/GiftsRedirect'));
const ConnectionTestRedirect = lazy(() => import('./components/ConnectionTestRedirect'));
const AdminLoginRedirect = lazy(() => import('./components/AdminLoginRedirect'));
const GiftDetail = lazy(() => import('./pages/GiftDetail').then(m => ({ default: m.GiftDetail })));
const ShippingInformation = lazy(() => import('./pages/ShippingInformation').then(m => ({ default: m.ShippingInformation })));
const SelectShipping = lazy(() => import('./pages/SelectShipping').then(m => ({ default: m.SelectShipping })));
const ReviewOrder = lazy(() => import('./pages/ReviewOrder').then(m => ({ default: m.ReviewOrder })));
const Confirmation = lazy(() => import('./pages/Confirmation').then(m => ({ default: m.Confirmation })));
const OrderHistory = lazy(() => import('./pages/OrderHistory').then(m => ({ default: m.OrderHistory })));
const OrderTracking = lazy(() => import('./pages/OrderTracking').then(m => ({ default: m.OrderTracking })));
const Events = lazy(() => import('./pages/Events').then(m => ({ default: m.Events })));
const EventDetails = lazy(() => import('./pages/EventDetails').then(m => ({ default: m.EventDetails })));
const CreateEvent = lazy(() => import('./pages/CreateEvent').then(m => ({ default: m.CreateEvent })));
const Products = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const FlowDemo = lazy(() => import('./pages/FlowDemo').then(m => ({ default: m.FlowDemo })));
const PrivacySettings = lazy(() => import('./pages/PrivacySettings').then(m => ({ default: m.PrivacySettings })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const GlobalHome = lazy(() => import('./pages/GlobalHome'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));

// Test/Debug Pages (lazy load - DEVELOPMENT ONLY for tree-shaking)
const DiagnosticPage = import.meta.env.DEV ? lazy(() => import('./pages/DiagnosticPage').then(m => ({ default: m.DiagnosticPage }))) : null;
const InitialSeed = import.meta.env.DEV ? lazy(() => import('./pages/InitialSeed').then(m => ({ default: m.InitialSeed }))) : null;
const SystemStatus = import.meta.env.DEV ? lazy(() => import('./pages/SystemStatus').then(m => ({ default: m.SystemStatus }))) : null;
const ValidationTest = import.meta.env.DEV ? lazy(() => import('./pages/ValidationTest').then(m => ({ default: m.ValidationTest }))) : null;
const PerformanceTest = import.meta.env.DEV ? lazy(() => import('./pages/PerformanceTest').then(m => ({ default: m.PerformanceTest }))) : null;
const JWTDebug = import.meta.env.DEV ? lazy(() => import('./pages/JWTDebug').then(m => ({ default: m.JWTDebug }))) : null;
const QuickDiagnostic = import.meta.env.DEV ? lazy(() => import('./pages/QuickDiagnostic').then(m => ({ default: m.QuickDiagnostic }))) : null;
const BackendTest = import.meta.env.DEV ? lazy(() => import('./pages/BackendTest').then(m => ({ default: m.BackendTest }))) : null;
const LanguageTest = import.meta.env.DEV ? lazy(() => import('./pages/LanguageTest').then(m => ({ default: m.LanguageTest }))) : null;
const CelebrationTest = import.meta.env.DEV ? lazy(() => import('./pages/CelebrationTest').then(m => ({ default: m.CelebrationTest }))) : null;
const AuthDiagnostic = import.meta.env.DEV ? lazy(() => import('./pages/AuthDiagnostic')) : null;
const TokenClear = import.meta.env.DEV ? lazy(() => import('./pages/TokenClear')) : null;
const TokenDebug = import.meta.env.DEV ? lazy(() => import('./pages/TokenDebug')) : null;

// Admin Pages (lazy load)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminSignup = lazy(() => import('./pages/admin/AdminSignup').then(m => ({ default: m.AdminSignup })));
const ForgotPassword = lazy(() => import('./pages/admin/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/admin/ResetPassword'));
const AdminAccountsList = lazy(() => import('./pages/AdminAccountsList'));
const AdminLayoutWrapper = lazy(() => import('./pages/admin/AdminLayoutWrapper').then(m => ({ default: m.AdminLayoutWrapper })));
const RedirectToDashboard = lazy(() => import('./pages/admin/RedirectToDashboard').then(m => ({ default: m.RedirectToDashboard })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const SystemAdminDashboard = lazy(() => import('./pages/admin/SystemAdminDashboard').then(m => ({ default: m.SystemAdminDashboard })));
const ClientDashboard = lazy(() => import('./pages/admin/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const AdminLogout = lazy(() => import('./pages/admin/AdminLogout').then(m => ({ default: m.AdminLogout })));
const BootstrapAdmin = lazy(() => import('./pages/admin/BootstrapAdmin').then(m => ({ default: m.BootstrapAdmin })));
const DiagnosticTools = lazy(() => import('./pages/admin/DiagnosticTools').then(m => ({ default: m.DiagnosticTools })));
const ClientManagement = lazy(() => import('./pages/admin/ClientManagement').then(m => ({ default: m.ClientManagement })));
const ClientDetail = lazy(() => import('./pages/admin/ClientDetail').then(m => ({ default: m.ClientDetail })));
const ClientConfiguration = lazy(() => import('./pages/admin/ClientConfiguration').then(m => ({ default: m.ClientConfiguration })));
const SiteManagement = lazy(() => import('./pages/admin/SiteManagement').then(m => ({ default: m.SiteManagement })));
const GiftManagement = lazy(() => import('./pages/admin/GiftManagement').then(m => ({ default: m.GiftManagement })));
const ProductBulkImport = lazy(() => import('./pages/admin/ProductBulkImport').then(m => ({ default: m.ProductBulkImport })));
const OrderManagement = lazy(() => import('./pages/admin/OrderManagement').then(m => ({ default: m.OrderManagement })));
const EmployeeManagement = lazy(() => import('./pages/admin/EmployeeManagement').then(m => ({ default: m.EmployeeManagement })));
const ERPManagement = lazy(() => import('./pages/admin/ERPManagement').then(m => ({ default: m.ERPManagement })));
const ERPConnectionManagement = lazy(() => import('./pages/admin/ERPConnectionManagement').then(m => ({ default: m.ERPConnectionManagement })));
const ClientSiteERPAssignment = lazy(() => import('./pages/admin/ClientSiteERPAssignment').then(m => ({ default: m.ClientSiteERPAssignment })));
const CatalogManagement = lazy(() => import('./pages/admin/CatalogManagement').then(m => ({ default: m.default })));
const CatalogEdit = lazy(() => import('./pages/admin/CatalogEdit').then(m => ({ default: m.default })));
const CatalogMigration = lazy(() => import('./pages/admin/CatalogMigration').then(m => ({ default: m.default })));
const SiteCatalogConfiguration = lazy(() => import('./pages/admin/SiteCatalogConfiguration').then(m => ({ default: m.default })));
const ImportExportSettings = lazy(() => import('./pages/admin/ImportExportSettings').then(m => ({ default: m.ImportExportSettings })));
const Analytics = lazy(() => import('./pages/admin/Analytics').then(m => ({ default: m.Analytics })));
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard').then(m => ({ default: m.default })));
const CatalogPerformanceAnalytics = lazy(() => import('./pages/admin/CatalogPerformanceAnalytics').then(m => ({ default: m.default })));
const OrderGiftingAnalytics = lazy(() => import('./pages/admin/OrderGiftingAnalytics').then(m => ({ default: m.default })));
const EmployeeRecognitionAnalytics = lazy(() => import('./pages/admin/EmployeeRecognitionAnalytics').then(m => ({ default: m.default })));
const ExportReportingSystem = lazy(() => import('./pages/admin/ExportReportingSystem').then(m => ({ default: m.default })));
const Reports = lazy(() => import('./pages/admin/Reports').then(m => ({ default: m.Reports })));
const ReportsAnalytics = lazy(() => import('./pages/admin/ReportsAnalytics').then(m => ({ default: m.ReportsAnalytics })));
const ClientPerformanceAnalytics = lazy(() => import('./pages/admin/ClientPerformanceAnalytics').then(m => ({ default: m.ClientPerformanceAnalytics })));
const CelebrationAnalytics = lazy(() => import('./pages/admin/CelebrationAnalytics').then(m => ({ default: m.CelebrationAnalytics })));
const ExecutiveDashboard = lazy(() => import('./pages/admin/ExecutiveDashboard').then(m => ({ default: m.ExecutiveDashboard })));
const BrandManagement = lazy(() => import('./pages/admin/BrandManagement').then(m => ({ default: m.BrandManagement })));
const SiteConfiguration = lazy(() => import('./pages/admin/SiteConfiguration').then(m => ({ default: m.SiteConfiguration })));
const SiteGiftConfiguration = lazy(() => import('./pages/admin/SiteGiftConfiguration').then(m => ({ default: m.SiteGiftConfiguration })));
const EmailTemplates = lazy(() => import('./pages/admin/EmailTemplates').then(m => ({ default: m.EmailTemplates })));
const EmailNotificationConfiguration = lazy(() => import('./pages/admin/EmailNotificationConfiguration').then(m => ({ default: m.EmailNotificationConfiguration })));
const EmailHistory = lazy(() => import('./pages/admin/EmailHistory').then(m => ({ default: m.EmailHistoryPage })));
const GlobalTemplateLibrary = lazy(() => import('./pages/admin/GlobalTemplateLibrary').then(m => ({ default: m.default })));
const EmailServiceTest = lazy(() => import('./pages/admin/EmailServiceTest').then(m => ({ default: m.EmailServiceTest })));
const ShippingConfiguration = lazy(() => import('./pages/admin/ShippingConfiguration').then(m => ({ default: m.ShippingConfiguration })));
const AccessManagement = lazy(() => import('./pages/admin/AccessManagement').then(m => ({ default: m.AccessManagement })));
const HomePageEditor = lazy(() => import('./pages/admin/HomePageEditor'));
const AuthSync = lazy(() => import('./pages/admin/AuthSync'));

// New UX Enhancement Pages
const HeaderFooterConfiguration = lazy(() => import('./pages/admin/HeaderFooterConfiguration').then(m => ({ default: m.HeaderFooterConfiguration })));
const BrandingConfiguration = lazy(() => import('./pages/admin/BrandingConfiguration').then(m => ({ default: m.BrandingConfiguration })));
const GiftSelectionConfiguration = lazy(() => import('./pages/admin/GiftSelectionConfiguration').then(m => ({ default: m.GiftSelectionConfiguration })));

const AuditLogs = lazy(() => import('./pages/admin/AuditLogs').then(m => ({ default: m.AuditLogs })));
const SecurityDashboard = lazy(() => import('./pages/admin/SecurityDashboard').then(m => ({ default: m.SecurityDashboard })));
const AdminUserManagement = lazy(() => import('./pages/admin/AdminUserManagement').then(m => ({ default: m.AdminUserManagement })));
const RoleManagement = lazy(() => import('./pages/admin/RoleManagement').then(m => ({ default: m.RoleManagement })));
const AccessGroupManagement = lazy(() => import('./pages/admin/AccessGroupManagement').then(m => ({ default: m.AccessGroupManagement })));
const RBACOverview = lazy(() => import('./pages/admin/RBACOverview').then(m => ({ default: m.RBACOverview })));
const SessionExpired = lazy(() => import('./pages/admin/SessionExpired').then(m => ({ default: m.SessionExpired })));
const DeveloperTools = lazy(() => import('./pages/admin/DeveloperTools').then(m => ({ default: m.DeveloperTools })));
const TestingDashboard = lazy(() => import('./pages/admin/TestingDashboard').then(m => ({ default: m.TestingDashboard })));
const SitesDiagnostic = lazy(() => import('./pages/admin/SitesDiagnostic').then(m => ({ default: m.SitesDiagnostic })));
const AdminAuthDebug = lazy(() => import('./pages/admin/AdminAuthDebug').then(m => ({ default: m.AdminAuthDebug })));

// Admin Debug/Test Pages (lazy load - DEVELOPMENT ONLY for tree-shaking)
const AdminDebug = import.meta.env.DEV ? lazy(() => import('./pages/admin/AdminDebug').then(m => ({ default: m.AdminDebug }))) : null;
const AdminHelper = import.meta.env.DEV ? lazy(() => import('./pages/admin/AdminHelper').then(m => ({ default: m.AdminHelper }))) : null;
const AdminEnvironments = import.meta.env.DEV ? lazy(() => import('./pages/admin/AdminEnvironments').then(m => ({ default: m.AdminEnvironments }))) : null;
const ForceTokenClear = import.meta.env.DEV ? lazy(() => import('./pages/admin/ForceTokenClear').then(m => ({ default: m.ForceTokenClear }))) : null;
const LoginDiagnostic = import.meta.env.DEV ? lazy(() => import('./pages/admin/LoginDiagnostic').then(m => ({ default: m.LoginDiagnostic }))) : null;
const QuickAuthCheck = import.meta.env.DEV ? lazy(() => import('./pages/admin/QuickAuthCheck').then(m => ({ default: m.QuickAuthCheck }))) : null;

// Admin Utility Pages (production-safe)
const TestDataReference = lazy(() => import('./pages/admin/TestDataReference').then(m => ({ default: m.TestDataReference })));
const ConnectionTest = lazy(() => import('./pages/admin/ConnectionTest').then(m => ({ default: m.ConnectionTest })));
const DataDiagnostic = lazy(() => import('./pages/admin/DataDiagnostic').then(m => ({ default: m.DataDiagnostic })));
const ApplicationDocumentation = lazy(() => import('./pages/admin/ApplicationDocumentation').then(m => ({ default: m.ApplicationDocumentation })));
const DevelopmentDocumentation = lazy(() => import('./pages/admin/DevelopmentDocumentation').then(m => ({ default: m.DevelopmentDocumentation })));
const LandingPageEditor = lazy(() => import('./pages/admin/LandingPageEditor').then(m => ({ default: m.LandingPageEditor })));
const WelcomePageEditor = lazy(() => import('./pages/admin/WelcomePageEditor').then(m => ({ default: m.WelcomePageEditor })));
const PerformanceDashboard = lazy(() => import('./pages/admin/PerformanceDashboard').then(m => ({ default: m.PerformanceDashboard })));

// Loading fallback component
function SuspenseFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  // Public routes
  {
    Component: Root,
    errorElement: <ErrorBoundary />,
    HydrateFallback: LoadingFallback,
    children: [
      { index: true, Component: GlobalHome, HydrateFallback: LoadingFallback }, // Changed from Welcome to GlobalHome - platform landing page
      { path: "welcome", Component: Welcome, HydrateFallback: LoadingFallback }, // Old Welcome page now accessible at /welcome
      { path: "celebration", Component: Celebration, HydrateFallback: LoadingFallback },
      { path: "celebration/create", Component: CelebrationCreate, HydrateFallback: LoadingFallback },
      { path: "feature-preview", Component: FeaturePreview, HydrateFallback: LoadingFallback },
      { path: "stakeholder-review", Component: StakeholderReview, HydrateFallback: LoadingFallback },
      { path: "technical-review", Component: TechnicalReview, HydrateFallback: LoadingFallback },
      { path: "magic-link", Component: MagicLinkRequest, HydrateFallback: LoadingFallback },
      { path: "magic-link/validate", Component: MagicLinkValidation, HydrateFallback: LoadingFallback },
      { path: "sso/validate", Component: SSOValidation, HydrateFallback: LoadingFallback },
      { path: "privacy", Component: PrivacyPolicy, HydrateFallback: LoadingFallback },
      { path: "site-selection", Component: SiteSelection, HydrateFallback: LoadingFallback },
      { path: "selection-period-expired", Component: SelectionPeriodExpired, HydrateFallback: LoadingFallback },
      { path: "gift-selection", Component: GiftSelection, HydrateFallback: LoadingFallback },
      { path: "gifts", Component: GiftsRedirect, HydrateFallback: LoadingFallback }, // Backward compatibility redirect
      { path: "initialize-database", Component: InitializeDatabase, HydrateFallback: LoadingFallback }, // First-time database setup
      { path: "access", Component: AccessValidation, HydrateFallback: LoadingFallback }, // Public access validation (employee serial code entry)
      { path: "access/magic-link-request", Component: MagicLinkRequest, HydrateFallback: LoadingFallback },
      { path: "access/magic-link", Component: MagicLinkValidation, HydrateFallback: LoadingFallback },
      { path: "access/sso", Component: SSOValidation, HydrateFallback: LoadingFallback },
      { path: "connection-test", Component: ConnectionTestRedirect, HydrateFallback: LoadingFallback }, // Redirect /connection-test to /admin/connection-test
      { path: "admin-login", Component: AdminLoginRedirect, HydrateFallback: LoadingFallback }, // Redirect /admin-login to /admin/login
      { path: "gift-detail/:giftId", Component: GiftDetail, HydrateFallback: LoadingFallback },
      { path: "shipping-information", Component: ShippingInformation, HydrateFallback: LoadingFallback },
      { path: "select-shipping", Component: SelectShipping, HydrateFallback: LoadingFallback },
      { path: "review-order", Component: ReviewOrder, HydrateFallback: LoadingFallback },
      { path: "confirmation", Component: Confirmation, HydrateFallback: LoadingFallback },
      { path: "order-history", Component: OrderHistory, HydrateFallback: LoadingFallback },
      { path: "order-tracking", Component: OrderTracking, HydrateFallback: LoadingFallback },
      { path: "events", Component: Events, HydrateFallback: LoadingFallback },
      { path: "event-details", Component: EventDetails, HydrateFallback: LoadingFallback },
      { path: "create-event", Component: CreateEvent, HydrateFallback: LoadingFallback },
      { path: "products", Component: Products, HydrateFallback: LoadingFallback },
      { path: "product-detail", Component: ProductDetail, HydrateFallback: LoadingFallback },
      { path: "checkout", Component: Checkout, HydrateFallback: LoadingFallback },
      { path: "home", Component: Home, HydrateFallback: LoadingFallback },
      { path: "flow-demo", Component: FlowDemo, HydrateFallback: LoadingFallback },
      { path: "privacy-settings", Component: PrivacySettings, HydrateFallback: LoadingFallback },
      { path: "cart", Component: Cart, HydrateFallback: LoadingFallback },
      { path: "client-portal", Component: ClientPortal, HydrateFallback: LoadingFallback },
      
      // Site-specific routes - allows viewing different sites
      {
        path: "site/:siteId",
        Component: SiteLoaderWrapper,
        errorElement: <ErrorBoundary />,
        HydrateFallback: LoadingFallback,
        children: [
          { index: true, Component: Welcome, HydrateFallback: LoadingFallback },
          { path: "home", Component: Landing, HydrateFallback: LoadingFallback }, // Site home/landing page - route renamed from "landing" to "home" for clarity
          { path: "access", Component: AccessValidation, HydrateFallback: LoadingFallback },
          { path: "celebration", Component: Celebration, HydrateFallback: LoadingFallback },
          { path: "magic-link", Component: MagicLinkRequest, HydrateFallback: LoadingFallback },
          { path: "magic-link/validate", Component: MagicLinkValidation, HydrateFallback: LoadingFallback },
          { path: "sso/validate", Component: SSOValidation, HydrateFallback: LoadingFallback },
          { path: "privacy", Component: PrivacyPolicy, HydrateFallback: LoadingFallback },
          { path: "gift-selection", Component: GiftSelection, HydrateFallback: LoadingFallback },
          { path: "gift-detail", Component: GiftDetail, HydrateFallback: LoadingFallback },
          { path: "shipping-information", Component: ShippingInformation, HydrateFallback: LoadingFallback },
          { path: "select-shipping", Component: SelectShipping, HydrateFallback: LoadingFallback },
          { path: "review-order", Component: ReviewOrder, HydrateFallback: LoadingFallback },
          { path: "confirmation", Component: Confirmation, HydrateFallback: LoadingFallback },
          { path: "*", Component: NotFound, HydrateFallback: LoadingFallback },
        ],
      },
      
      // Test/Debug Routes (DEVELOPMENT ONLY - tree-shaken in production)
      ...(import.meta.env.DEV && CelebrationTest && DiagnosticPage && InitialSeed && SystemStatus && ValidationTest && PerformanceTest && JWTDebug && QuickDiagnostic && BackendTest && LanguageTest && AuthDiagnostic && TokenClear && TokenDebug ? [
        { path: "celebration/test", Component: CelebrationTest, HydrateFallback: LoadingFallback },
        { path: "diagnostic", Component: DiagnosticPage, HydrateFallback: LoadingFallback },
        { path: "seed", Component: InitialSeed, HydrateFallback: LoadingFallback },
        { path: "initial-seed", Component: InitialSeed, HydrateFallback: LoadingFallback },
        { path: "status", Component: SystemStatus, HydrateFallback: LoadingFallback },
        { path: "validation-test", Component: ValidationTest, HydrateFallback: LoadingFallback },
        { path: "performance-test", Component: PerformanceTest, HydrateFallback: LoadingFallback },
        { path: "jwt-debug", Component: JWTDebug, HydrateFallback: LoadingFallback },
        { path: "quick-diagnostic", Component: QuickDiagnostic, HydrateFallback: LoadingFallback },
        { path: "backend-test", Component: BackendTest, HydrateFallback: LoadingFallback },
        { path: "language-test", Component: LanguageTest, HydrateFallback: LoadingFallback },
        { path: "auth-diagnostic", Component: AuthDiagnostic, HydrateFallback: LoadingFallback },
        { path: "token-clear", Component: TokenClear, HydrateFallback: LoadingFallback },
        { path: "token-debug", Component: TokenDebug, HydrateFallback: LoadingFallback },
      ] : []),
      
      // Catch-all for public 404s - must be last
      { path: "*", Component: NotFound, HydrateFallback: LoadingFallback },
    ],
  },
  
  // Admin routes (separate from public routes)
  {
    path: "/admin",
    Component: AdminRoot,
    errorElement: <ErrorBoundary />,
    HydrateFallback: LoadingFallback,
    children: [
      { path: "login", Component: AdminLogin, HydrateFallback: LoadingFallback },
      { path: "forgot-password", Component: ForgotPassword, HydrateFallback: LoadingFallback },
      { path: "reset-password", Component: ResetPassword, HydrateFallback: LoadingFallback },
      { path: "accounts-list", Component: AdminAccountsList, HydrateFallback: LoadingFallback }, // Public debug page to list admin accounts
      { path: "signup", Component: AdminSignup, HydrateFallback: LoadingFallback },
      { path: "logout", Component: AdminLogout, HydrateFallback: LoadingFallback },
      { path: "bootstrap", Component: BootstrapAdmin, HydrateFallback: LoadingFallback },
      { path: "diagnostic-tools", Component: DiagnosticTools, HydrateFallback: LoadingFallback },
      { path: "session-expired", Component: SessionExpired, HydrateFallback: LoadingFallback },
      
      // Debug/Helper Routes (DEVELOPMENT ONLY - tree-shaken in production)
      ...(import.meta.env.DEV && AdminDebug && AdminHelper && AdminEnvironments && ForceTokenClear && LoginDiagnostic && QuickAuthCheck ? [
        { path: "debug", Component: AdminDebug, HydrateFallback: LoadingFallback },
        { path: "helper", Component: AdminHelper, HydrateFallback: LoadingFallback },
        { path: "environments", Component: AdminEnvironments, HydrateFallback: LoadingFallback },
        { path: "force-token-clear", Component: ForceTokenClear, HydrateFallback: LoadingFallback },
        { path: "login-diagnostic", Component: LoginDiagnostic, HydrateFallback: LoadingFallback },
        { path: "quick-auth-check", Component: QuickAuthCheck, HydrateFallback: LoadingFallback },
      ] : []),
      
      {
        Component: AdminLayoutWrapper,
        children: [
          { index: true, Component: RedirectToDashboard, HydrateFallback: LoadingFallback },
          { path: "dashboard", Component: Dashboard, HydrateFallback: LoadingFallback },
          { path: "system-dashboard", Component: SystemAdminDashboard, HydrateFallback: LoadingFallback },
          { path: "client-dashboard", Component: ClientDashboard, HydrateFallback: LoadingFallback },
          { path: "clients", Component: ClientManagement, HydrateFallback: LoadingFallback },
          { path: "clients/:clientId", Component: ClientDetail, HydrateFallback: LoadingFallback },
          { path: "clients/:clientId/configuration", Component: ClientConfiguration, HydrateFallback: LoadingFallback },
          { path: "sites", Component: SiteManagement, HydrateFallback: LoadingFallback },
          { path: "gifts", Component: GiftManagement, HydrateFallback: LoadingFallback },
          { path: "product-bulk-import", Component: ProductBulkImport, HydrateFallback: LoadingFallback },
          { path: "erp", Component: ERPManagement, HydrateFallback: LoadingFallback },
          { path: "erp-connections", Component: ERPConnectionManagement, HydrateFallback: LoadingFallback },
          { path: "client-site-erp-assignment", Component: ClientSiteERPAssignment, HydrateFallback: LoadingFallback },
          { path: "catalogs", Component: CatalogManagement, HydrateFallback: LoadingFallback },
          { path: "catalogs/create", Component: CatalogEdit, HydrateFallback: LoadingFallback },
          { path: "catalogs/:catalogId", Component: CatalogEdit, HydrateFallback: LoadingFallback },
          { path: "catalogs/migrate", Component: CatalogMigration, HydrateFallback: LoadingFallback },
          { path: "site-catalog-configuration", Component: SiteCatalogConfiguration, HydrateFallback: LoadingFallback },
          { path: "import-export-settings", Component: ImportExportSettings, HydrateFallback: LoadingFallback },
          { path: "orders", Component: OrderManagement, HydrateFallback: LoadingFallback },
          { path: "employees", Component: EmployeeManagement, HydrateFallback: LoadingFallback },
          { path: "analytics", Component: Analytics, HydrateFallback: LoadingFallback },
          { path: "analytics-dashboard", Component: AnalyticsDashboard, HydrateFallback: LoadingFallback },
          { path: "catalog-performance-analytics", Component: CatalogPerformanceAnalytics, HydrateFallback: LoadingFallback },
          { path: "order-gifting-analytics", Component: OrderGiftingAnalytics, HydrateFallback: LoadingFallback },
          { path: "employee-recognition-analytics", Component: EmployeeRecognitionAnalytics, HydrateFallback: LoadingFallback },
          { path: "export-reporting-system", Component: ExportReportingSystem, HydrateFallback: LoadingFallback },
          { path: "reports", Component: Reports, HydrateFallback: LoadingFallback },
          { path: "reports-analytics", Component: ReportsAnalytics, HydrateFallback: LoadingFallback },
          { path: "client-performance-analytics", Component: ClientPerformanceAnalytics, HydrateFallback: LoadingFallback },
          { path: "celebration-analytics", Component: CelebrationAnalytics, HydrateFallback: LoadingFallback },
          { path: "executive-dashboard", Component: ExecutiveDashboard, HydrateFallback: LoadingFallback },
          { path: "brands", Component: BrandManagement, HydrateFallback: LoadingFallback },
          { path: "site-configuration", Component: SiteConfiguration, HydrateFallback: LoadingFallback },
          { path: "site-gifts", Component: SiteGiftConfiguration, HydrateFallback: LoadingFallback },
          { path: "email-templates", Component: EmailTemplates, HydrateFallback: LoadingFallback },
          { path: "email-notification-configuration", Component: EmailNotificationConfiguration, HydrateFallback: LoadingFallback },
          { path: "email-history", Component: EmailHistory, HydrateFallback: LoadingFallback },
          { path: "global-template-library", Component: GlobalTemplateLibrary, HydrateFallback: LoadingFallback },
          { path: "email-service-test", Component: EmailServiceTest, HydrateFallback: LoadingFallback },
          { path: "shipping", Component: ShippingConfiguration, HydrateFallback: LoadingFallback },
          { path: "access", Component: AccessManagement, HydrateFallback: LoadingFallback },
          { path: "home-editor", Component: HomePageEditor, HydrateFallback: LoadingFallback },
          { path: "auth-sync", Component: AuthSync, HydrateFallback: LoadingFallback },
          { path: "audit-logs", Component: AuditLogs, HydrateFallback: LoadingFallback },
          { path: "security", Component: SecurityDashboard, HydrateFallback: LoadingFallback },
          { path: "user-management", Component: AdminUserManagement, HydrateFallback: LoadingFallback },
          { path: "roles", Component: RoleManagement, HydrateFallback: LoadingFallback },
          { path: "access-groups", Component: AccessGroupManagement, HydrateFallback: LoadingFallback },
          { path: "developer-tools", Component: DeveloperTools, HydrateFallback: LoadingFallback },
          { path: "testing-dashboard", Component: TestingDashboard, HydrateFallback: LoadingFallback },
          { path: "test-data-reference", Component: TestDataReference, HydrateFallback: LoadingFallback },
          { path: "connection-test", Component: ConnectionTest, HydrateFallback: LoadingFallback },
          { path: "data-diagnostic", Component: DataDiagnostic, HydrateFallback: LoadingFallback },
          { path: "application-documentation", Component: ApplicationDocumentation, HydrateFallback: LoadingFallback },
          { path: "development-documentation", Component: DevelopmentDocumentation, HydrateFallback: LoadingFallback },
          { path: "landing-page-editor", Component: LandingPageEditor, HydrateFallback: LoadingFallback },
          { path: "welcome-page-editor", Component: WelcomePageEditor, HydrateFallback: LoadingFallback },
          { path: "performance-dashboard", Component: PerformanceDashboard, HydrateFallback: LoadingFallback },
          { path: "sites-diagnostic", Component: SitesDiagnostic, HydrateFallback: LoadingFallback },
          { path: "header-footer-configuration", Component: HeaderFooterConfiguration, HydrateFallback: LoadingFallback },
          { path: "branding-configuration", Component: BrandingConfiguration, HydrateFallback: LoadingFallback },
          { path: "gift-selection-configuration", Component: GiftSelectionConfiguration, HydrateFallback: LoadingFallback },
          { path: "admin-auth-debug", Component: AdminAuthDebug, HydrateFallback: LoadingFallback },
        ],
      },
      
      // Catch-all for admin 404s
      { path: "*", Component: NotFound, HydrateFallback: LoadingFallback },
    ],
  },
]);