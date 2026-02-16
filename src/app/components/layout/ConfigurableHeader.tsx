import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { ChevronRight, Menu, X, Search, User, LogOut, Settings } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { LanguageSelector } from '../LanguageSelector';
import { SiteSwitcherDropdown } from './SiteSwitcherDropdown';
import { HeaderFooterConfig } from '../../types/siteCustomization';

interface ConfigurableHeaderProps {
  config?: Partial<HeaderFooterConfig['header']>;
  siteName?: string;
  clientName?: string;
}

const stepMap: Record<string, { label: string; step: number }> = {
  '/gift-selection': { label: 'Select Gift', step: 1 },
  '/gift-detail': { label: 'Gift Details', step: 1 },
  '/select-shipping': { label: 'Shipping', step: 2 },
  '/shipping-information': { label: 'Shipping', step: 2 },
  '/review-order': { label: 'Review Order', step: 3 },
  '/confirmation': { label: 'Confirmation', step: 4 },
};

export function ConfigurableHeader({ config, siteName, clientName }: ConfigurableHeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const { currentSite, sites } = useSite();
  const location = useLocation();
  const navigate = useNavigate();
  const { siteId } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if welcome page is enabled
  const isWelcomePageEnabled = currentSite?.settings?.enableWelcomePage !== false;

  // Dynamic step map based on welcome page setting
  const stepMap: Record<string, { label: string; step: number }> = useMemo(() => {
    if (isWelcomePageEnabled) {
      // With welcome page: Welcome (0) → Select Gift (1) → Shipping (2) → Review (3) → Confirmation (4)
      return {
        '/welcome': { label: 'Welcome', step: 0 },
        '/gift-selection': { label: 'Select Gift', step: 1 },
        '/gift-detail': { label: 'Gift Details', step: 1 },
        '/select-shipping': { label: 'Shipping', step: 2 },
        '/shipping-information': { label: 'Shipping', step: 2 },
        '/review-order': { label: 'Review Order', step: 3 },
        '/confirmation': { label: 'Confirmation', step: 4 },
      };
    } else {
      // Without welcome page: Select Gift (1) → Shipping (2) → Review (3) → Confirmation (4)
      return {
        '/gift-selection': { label: 'Select Gift', step: 1 },
        '/gift-detail': { label: 'Gift Details', step: 1 },
        '/select-shipping': { label: 'Shipping', step: 2 },
        '/shipping-information': { label: 'Shipping', step: 2 },
        '/review-order': { label: 'Review Order', step: 3 },
        '/confirmation': { label: 'Confirmation', step: 4 },
      };
    }
  }, [isWelcomePageEnabled]);

  // Determine home link based on landing page setting and current route
  const homeLink = useMemo(() => {
    // If we're in a site-specific route (/site/:siteId/...)
    if (siteId) {
      // Check if landing page is enabled for this site
      const isLandingPageEnabled = !currentSite?.settings?.skipLandingPage;
      
      if (isLandingPageEnabled) {
        // Landing page enabled: go to /site/:siteId (landing page)
        return `/site/${siteId}`;
      } else {
        // Landing page disabled: go to /site/:siteId/access
        return `/site/${siteId}/access`;
      }
    }
    
    // Default: use configured link or root
    return config?.logo?.link || '/';
  }, [siteId, currentSite?.settings?.skipLandingPage, config?.logo?.link]);

  // Merge with default configuration
  const headerConfig = {
    enabled: config?.enabled ?? true,
    layout: config?.layout ?? 'full',
    logo: config?.logo ?? {
      url: '',
      alt: 'Logo',
      height: 40,
      link: homeLink, // Use dynamic home link
    },
    navigation: config?.navigation ?? { enabled: false, items: [] },
    progressBar: config?.progressBar ?? { enabled: true, style: 'steps' as const, showLabels: true },
    languageSelector: config?.languageSelector ?? { enabled: true, position: 'right' as const },
    siteSwitcher: config?.siteSwitcher ?? { enabled: false, style: 'dropdown' as const, showInHeader: true },
    authButtons: config?.authButtons ?? { enabled: false, showWhenAuthenticated: false, showWhenUnauthenticated: false },
    search: config?.search ?? { enabled: false, placeholder: 'Search...' },
    backgroundColor: config?.backgroundColor ?? '#FFFFFF',
    textColor: config?.textColor ?? '#000000',
    borderColor: config?.borderColor ?? '#E5E7EB',
  };

  // Don't show header if disabled or on hidden routes
  if (!headerConfig.enabled) {
    return null;
  }

  const currentPath = location.pathname.startsWith('/confirmation')
    ? '/confirmation'
    : location.pathname.startsWith('/gift-detail')
    ? '/gift-detail'
    : location.pathname;
  const currentStep = stepMap[currentPath];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gift-selection?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header 
      className={`bg-white border-b ${(headerConfig as Record<string, unknown>).sticky ? 'sticky top-0 z-50' : ''}`}
      style={{
        backgroundColor: headerConfig.backgroundColor,
        color: headerConfig.textColor,
        borderColor: headerConfig.borderColor,
      }}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to={headerConfig.logo.link} 
            className="flex items-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2 rounded-lg"
            aria-label="Go to home page"
          >
            {headerConfig.logo.url ? (
              <img 
                src={headerConfig.logo.url} 
                alt={headerConfig.logo.alt} 
                style={{ height: `${headerConfig.logo.height}px` }}
                className="object-contain"
              />
            ) : (
              <div className="text-xl font-bold text-[#D91C81]">
                {siteName || clientName || 'wecelebrate'}
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Items */}
            {headerConfig.navigation.enabled && headerConfig.navigation.items.length > 0 && (
              <nav className="flex items-center gap-4">
                {headerConfig.navigation.items
                  .filter(item => {
                    if (item.requiresAuth && !isAuthenticated) return false;
                    return true;
                  })
                  .map(item => (
                    <Link
                      key={item.id}
                      to={item.url}
                      className="text-gray-700 hover:text-[#D91C81] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                    >
                      {item.label}
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-[#D91C81] text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
              </nav>
            )}

            {/* Progress Bar */}
            {isAuthenticated && headerConfig.progressBar.enabled && currentStep && (
              <nav aria-label="Progress steps" className="flex items-center gap-2 text-sm">
                {/* Welcome Step (only if enabled) */}
                {isWelcomePageEnabled && (
                  <>
                    <Link
                      to={siteId ? `/site/${siteId}/welcome` : '/welcome'}
                      className={`px-3 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#D91C81] ${
                        currentStep.step === 0
                          ? 'bg-pink-100 text-[#D91C81] font-semibold'
                          : currentStep.step > 0
                          ? 'text-gray-600 hover:text-[#D91C81]'
                          : 'text-gray-400'
                      }`}
                      aria-current={currentStep.step === 0 ? 'step' : undefined}
                    >
                      {headerConfig.progressBar.showLabels ? '0. Welcome' : '0'}
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  </>
                )}
                
                {/* Select Gift Step */}
                <Link
                  to={siteId ? `/site/${siteId}/gift-selection` : '/gift-selection'}
                  className={`px-3 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#D91C81] ${
                    currentStep.step === 1
                      ? 'bg-pink-100 text-[#D91C81] font-semibold'
                      : currentStep.step > 1
                      ? 'text-gray-600 hover:text-[#D91C81]'
                      : 'text-gray-400'
                  }`}
                  aria-current={currentStep.step === 1 ? 'step' : undefined}
                >
                  {headerConfig.progressBar.showLabels ? '1. Select Gift' : '1'}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                
                {/* Shipping Step */}
                <span
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    currentStep.step === 2
                      ? 'bg-pink-100 text-[#D91C81] font-semibold'
                      : currentStep.step > 2
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }`}
                  aria-current={currentStep.step === 2 ? 'step' : undefined}
                >
                  {headerConfig.progressBar.showLabels ? '2. Shipping' : '2'}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                
                {/* Review Step */}
                <span
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    currentStep.step === 3
                      ? 'bg-pink-100 text-[#D91C81] font-semibold'
                      : currentStep.step > 3
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }`}
                  aria-current={currentStep.step === 3 ? 'step' : undefined}
                >
                  {headerConfig.progressBar.showLabels ? '3. Review' : '3'}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                
                {/* Confirmation Step */}
                <span
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    currentStep.step === 4
                      ? 'bg-pink-100 text-[#D91C81] font-semibold'
                      : 'text-gray-400'
                  }`}
                  aria-current={currentStep.step === 4 ? 'step' : undefined}
                >
                  {headerConfig.progressBar.showLabels ? '4. Confirmation' : '4'}
                </span>
              </nav>
            )}

            {/* Site Switcher */}
            {headerConfig.siteSwitcher.enabled && headerConfig.siteSwitcher.showInHeader && sites.length > 1 && (
              <SiteSwitcherDropdown />
            )}

            {/* Search */}
            {headerConfig.search.enabled && (
              <div className="relative">
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={headerConfig.search.placeholder}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81] w-64"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 text-gray-600 hover:text-[#D91C81] rounded-md transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Language Selector */}
            {headerConfig.languageSelector.enabled && <LanguageSelector />}

            {/* Auth Buttons */}
            {headerConfig.authButtons.enabled && (
              <div className="flex items-center gap-2">
                {isAuthenticated && headerConfig.authButtons.showWhenAuthenticated && (
                  <>
                    {user && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">{user.name || user.email}</span>
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 hover:text-[#D91C81] rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                )}
                {!isAuthenticated && headerConfig.authButtons.showWhenUnauthenticated && (
                  <Link
                    to="/access"
                    className="px-4 py-2 bg-[#D91C81] text-white rounded-md hover:bg-[#B71569] transition-colors text-sm font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-[#D91C81] rounded-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {/* Navigation Items */}
            {headerConfig.navigation.enabled && headerConfig.navigation.items.length > 0 && (
              <nav className="flex flex-col gap-2 mb-4">
                {headerConfig.navigation.items
                  .filter(item => {
                    if (item.requiresAuth && !isAuthenticated) return false;
                    return true;
                  })
                  .map(item => (
                    <Link
                      key={item.id}
                      to={item.url}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
              </nav>
            )}

            {/* Language Selector */}
            {headerConfig.languageSelector.enabled && (
              <div className="mb-4">
                <LanguageSelector />
              </div>
            )}

            {/* Auth Buttons */}
            {headerConfig.authButtons.enabled && (
              <div className="flex flex-col gap-2">
                {isAuthenticated && headerConfig.authButtons.showWhenAuthenticated && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Logout
                  </button>
                )}
                {!isAuthenticated && headerConfig.authButtons.showWhenUnauthenticated && (
                  <Link
                    to="/access"
                    className="px-4 py-2 bg-[#D91C81] text-white text-center rounded-md hover:bg-[#B71569] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
