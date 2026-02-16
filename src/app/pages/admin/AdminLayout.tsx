import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { useSite, Site } from '../../context/SiteContext';
import { DeploymentEnvironmentSelector } from '../../components/DeploymentEnvironmentSelector';
import { Suspense } from 'react';
import {
  LayoutDashboard,
  Settings,
  Mail,
  Package,
  Truck,
  Users,
  ShoppingCart,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  LogOut,
  Building2,
  Globe,
  Shield,
  AlertTriangle,
  Sliders,
  BarChart3,
  Tag,
  Layout,
  Database,
  Server,
  Activity,
  Stethoscope,
  Wrench,
  Gift,
  FileText,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  FolderOpen,
  GitBranch,
  TestTube2,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import haloLogo from 'figma:asset/212120daf4ca7893a2036877eb5d3cdd4c0ad83f.png';
import { EnvironmentBadge } from '../../components/EnvironmentBadge';

const clientNavigation = [
  { name: 'Dashboard', href: '/admin/client-dashboard', icon: LayoutDashboard },
  { name: 'Client Settings', href: '/admin/clients', icon: Settings },
  { name: 'Employee Management', href: '/admin/employees', icon: Users },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'All Clients', href: '/admin/clients', icon: Building2 },
];

const globalNavigation = [
  { name: 'Gift Catalog', href: '/admin/gifts', icon: Gift },
  { name: 'Catalog Management', href: '/admin/catalogs', icon: FolderOpen },
  { name: 'Catalog Migration', href: '/admin/catalogs/migrate', icon: GitBranch },
  { name: 'Home Page Editor', href: '/admin/home-editor', icon: Layout },
  { name: 'Global Template Library', href: '/admin/global-template-library', icon: Mail },
  { name: 'Email Service Test', href: '/admin/email-service-test', icon: Mail },
  { name: 'ERP Integrations', href: '/admin/erp', icon: Database },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Admin Users', href: '/admin/user-management', icon: Shield },
  { name: 'RBAC Overview', href: '/admin/rbac-overview', icon: Shield },
  { name: 'Roles', href: '/admin/roles', icon: Shield },
  { name: 'Access Groups', href: '/admin/access-groups', icon: Users },
  { name: 'Import/Export Settings', href: '/admin/import-export-settings', icon: ArrowDownToLine },
  { name: 'Application Documentation', href: '/admin/application-documentation', icon: FileText },
];

const developerToolsNavigation = [
  { name: 'Admin Dashboard', href: '/admin/system-dashboard', icon: LayoutDashboard },
  { name: 'Developer Tools', href: '/admin/developer-tools', icon: Activity },
  { name: 'Testing Dashboard', href: '/admin/testing-dashboard', icon: TestTube2 },
  { name: 'Test Data Reference', href: '/admin/test-data-reference', icon: FileText },
  { name: 'Development Documentation', href: '/admin/development-documentation', icon: FileText },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
];

const siteSpecificNavigation = [
  { name: 'Site Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Site Configuration', href: '/admin/site-configuration', icon: Settings },
  { name: 'Site Catalog', href: '/admin/site-catalog-configuration', icon: FolderOpen },
  { name: 'Notifications', href: '/admin/email-notification-configuration', icon: Bell },
  { name: 'Order Management', href: '/admin/orders', icon: ShoppingCart },
  { name: 'All Sites', href: '/admin/sites', icon: Globe },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, adminLogout } = useAdmin();
  const { currentSite, currentClient, sites, clients, setCurrentSite, setCurrentClient, getClientById, isLoading } = useSite();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSiteSelector, setShowSiteSelector] = useState(false);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showClientFilter, setShowClientFilter] = useState<string>('all');
  const [siteSettingsOpen, setSiteSettingsOpen] = useState(true);
  const [clientSettingsOpen, setClientSettingsOpen] = useState(true);
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(true);
  const [developerToolsOpen, setDeveloperToolsOpen] = useState(false);
  const siteSelectRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleSiteChange = (site: Site) => {
    setCurrentSite(site);
    setShowSiteSelector(false);
  };

  // Close site selector on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSiteSelector) {
          setShowSiteSelector(false);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showSiteSelector, sidebarOpen]);

  // Close site selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (siteSelectRef.current && !siteSelectRef.current.contains(e.target as Node)) {
        setShowSiteSelector(false);
      }
    };

    if (showSiteSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [showSiteSelector]);

  // Get filtered sites
  const filteredSites = showClientFilter === 'all' 
    ? sites 
    : sites.filter(s => s.clientId === showClientFilter);

  const allNavigation = [...clientNavigation, ...globalNavigation, ...developerToolsNavigation, ...siteSpecificNavigation];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1B2A5E] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img
                src={haloLogo}
                alt="HALO Logo"
                className="h-8 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <span className="text-white text-sm font-semibold">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-white/80 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {/* Site-Specific Navigation */}
            {currentSite ? (
              <>
                <button
                  onClick={() => setSiteSettingsOpen(!siteSettingsOpen)}
                  className="w-full flex items-center justify-between px-4 mb-2 hover:bg-white/5 rounded-lg py-2 transition-colors group"
                  aria-expanded={siteSettingsOpen}
                >
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Site Settings
                  </h3>
                  {siteSettingsOpen ? (
                    <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    siteSettingsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <nav className="px-2 space-y-1 mb-4">
                    {siteSpecificNavigation.map((item) => {
                      const isActive = isActivePath(item.href);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          aria-current={isActive ? 'page' : undefined}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1B2A5E] ${
                            isActive
                              ? 'bg-[#D91C81] text-white'
                              : 'text-white hover:bg-white/10'
                          }`}
                        >
                          <item.icon className="w-4 h-4" aria-hidden="true" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="my-3 border-t border-white/10"></div>
              </>
            ) : (
              <>
                {/* No Site Selected Message */}
                <div className="px-4 py-3 mb-4 bg-[#D91C81]/20 rounded-lg border border-[#D91C81]/30">
                  <p className="text-xs font-semibold text-white mb-1">No Site Selected</p>
                  <p className="text-xs text-white/80">Click "Select Site" in the top-right to choose a site and access site-specific settings.</p>
                </div>
                <div className="my-3 border-t border-white/10"></div>
              </>
            )}

            {/* Client Navigation */}
            <button
              onClick={() => setClientSettingsOpen(!clientSettingsOpen)}
              className="w-full flex items-center justify-between px-4 mb-2 hover:bg-white/5 rounded-lg py-2 transition-colors group"
              aria-expanded={clientSettingsOpen}
            >
              <div className="flex flex-col items-start">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Client Settings
                </h3>
                {currentClient && (
                  <span className="text-xs text-white/60 mt-0.5 normal-case">
                    {currentClient.name}
                  </span>
                )}
              </div>
              {clientSettingsOpen ? (
                <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                clientSettingsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <nav className="px-2 space-y-1 mb-4">
                {clientNavigation.map((item) => {
                  // For "Client Settings", link to current client's detail page if available
                  const href = item.name === 'Client Settings' && currentClient 
                    ? `/admin/clients/${currentClient.id}` 
                    : item.href;
                  
                  // Special handling for "All Clients" to only be active on exact /admin/clients path
                  let isActive;
                  if (item.name === 'All Clients') {
                    isActive = location.pathname === '/admin/clients';
                  } else if (item.name === 'Client Settings') {
                    // Active when on a specific client detail page
                    isActive = /^\/admin\/clients\/[^/]+/.test(location.pathname);
                  } else {
                    isActive = isActivePath(href);
                  }
                  
                  return (
                    <Link
                      key={item.name}
                      to={href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1B2A5E] ${
                        isActive
                          ? 'bg-[#D91C81] text-white'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-4 h-4" aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="my-3 border-t border-white/10"></div>

            {/* Global Navigation */}
            <button
              onClick={() => setGlobalSettingsOpen(!globalSettingsOpen)}
              className="w-full flex items-center justify-between px-4 mb-2 hover:bg-white/5 rounded-lg py-2 transition-colors group"
              aria-expanded={globalSettingsOpen}
            >
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Global Settings
              </h3>
              {globalSettingsOpen ? (
                <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                globalSettingsOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <nav className="px-2 space-y-1 mb-4">
                {globalNavigation.map((item) => {
                  const isActive = isActivePath(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1B2A5E] ${
                        isActive
                          ? 'bg-[#D91C81] text-white'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-4 h-4" aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="my-3 border-t border-white/10"></div>

            {/* Developer Tools Navigation - Collapsible */}
            <button
              onClick={() => setDeveloperToolsOpen(!developerToolsOpen)}
              className="w-full flex items-center justify-between px-4 mb-2 hover:bg-white/5 rounded-lg py-2 transition-colors group"
              aria-expanded={developerToolsOpen}
            >
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5" />
                Developer Tools
              </h3>
              {developerToolsOpen ? (
                <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                developerToolsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <nav className="px-2 space-y-1 mb-4">
                {developerToolsNavigation.map((item) => {
                  const isActive = isActivePath(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1B2A5E] ${
                        isActive
                          ? 'bg-[#D91C81] text-white'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-4 h-4" aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </nav>

          {/* Admin Info */}
          <div className="px-6 py-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D91C81] rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{adminUser?.username}</p>
                <p className="text-white/60 text-xs capitalize">{adminUser?.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-8">
          <button
            onClick={toggleSidebar}
            className="lg:hidden mr-4 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {allNavigation.find(item => item.href === location.pathname)?.name || 'Admin Panel'}
              </h1>
              {/* Deployment Environment Selector */}
              <DeploymentEnvironmentSelector variant="header" />
            </div>

            <div className="flex items-center gap-4">
              {/* Client/Site Environment Selector - Always Visible */}
              <div className="relative" ref={siteSelectRef}>
                <button
                  onClick={() => setShowSiteSelector(!showSiteSelector)}
                  aria-label="Select site"
                  aria-expanded={showSiteSelector}
                  aria-haspopup="listbox"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white rounded-lg hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                      <span className="text-sm font-semibold hidden sm:inline">Loading...</span>
                    </>
                  ) : currentSite && currentClient ? (
                    <>
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center bg-white text-xs font-bold"
                        style={{ color: currentSite.branding?.primaryColor || '#D91C81' }}
                        aria-hidden="true"
                      >
                        {currentClient?.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-xs font-medium opacity-90">{currentClient?.name}</span>
                        <span className="text-sm font-bold">{currentSite?.name}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 ml-1" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <Globe className="w-5 h-5" aria-hidden="true" />
                      <span className="text-sm font-semibold hidden sm:inline">Select Site</span>
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>

                {showSiteSelector && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowSiteSelector(false)}
                      aria-hidden="true"
                    />
                    <div 
                      role="listbox"
                      aria-label="Available sites"
                      className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[32rem] overflow-hidden flex flex-col"
                    >
                      {/* Header */}
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#D91C81] to-[#B71569]">
                        <p className="text-sm font-bold text-white">Site Selection</p>
                        <p className="text-xs text-white/80 mt-1">Choose a client and site to manage</p>
                      </div>

                      {/* Client Filter */}
                      {clients.length > 0 && (
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                          <label htmlFor="client-filter" className="block text-xs font-semibold text-gray-700 mb-2">
                            Filter by Client
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                              id="client-filter"
                              value={showClientFilter}
                              onChange={(e) => setShowClientFilter(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 transition-all outline-none"
                            >
                              <option value="all">All Clients ({clients.length})</option>
                              {clients.map((client) => {
                                const clientSiteCount = sites.filter(s => s.clientId === client.id).length;
                                return (
                                  <option key={client.id} value={client.id}>
                                    {client.name} ({clientSiteCount} {clientSiteCount === 1 ? 'site' : 'sites'})
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Sites List */}
                      <div className="flex-1 overflow-y-auto p-2">
                        {filteredSites.length === 0 ? (
                          <div className="text-center py-8">
                            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-600">No sites available</p>
                            <p className="text-xs text-gray-500 mt-1 mb-3">Create a site or seed test data</p>
                            <Link
                              to="/admin/developer-tools"
                              className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-[#D91C81] text-white rounded-lg hover:bg-[#B01669] transition-colors"
                            >
                              <Database className="w-3 h-3" />
                              Seed Test Data
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {filteredSites.map((site) => {
                              const siteClient = getClientById(site.clientId);
                              const isSelected = currentSite?.id === site.id;
                              return (
                                <button
                                  key={site.id}
                                  role="option"
                                  aria-selected={isSelected}
                                  onClick={() => handleSiteChange(site)}
                                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-inset ${
                                    isSelected 
                                      ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-[#D91C81] shadow-sm' 
                                      : 'hover:bg-gray-50 border-2 border-transparent'
                                  }`}
                                >
                                  <div 
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm"
                                    style={{ backgroundColor: site?.branding?.primaryColor }}
                                    aria-hidden="true"
                                  >
                                    {siteClient ? siteClient.name.substring(0, 2).toUpperCase() : 'NA'}
                                  </div>
                                  <div className="flex-1 text-left min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{site.name}</p>
                                    <p className="text-xs text-gray-600 truncate">{siteClient?.name || 'Unknown Client'}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        site.status === 'active' 
                                          ? 'bg-green-100 text-green-700' 
                                          : site.status === 'inactive'
                                          ? 'bg-gray-100 text-gray-700'
                                          : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {site.status}
                                      </span>
                                      <span className="text-xs text-gray-500">{site.domain}</span>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-[#D91C81] rounded-full animate-pulse" aria-label="Currently selected" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <Link
                          to="/admin/sites"
                          onClick={() => setShowSiteSelector(false)}
                          className="flex items-center justify-center gap-2 w-full p-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#D91C81] to-[#B71569] hover:shadow-lg rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2"
                        >
                          <Globe className="w-4 h-4" aria-hidden="true" />
                          Manage All Sites
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;