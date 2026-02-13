import { Link, useLocation, useParams } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { LanguageSelector } from './LanguageSelector';
import haloLogo from 'figma:asset/212120daf4ca7893a2036877eb5d3cdd4c0ad83f.png';
import { useMemo } from 'react';

export function Header() {
  const { isAuthenticated } = useAuth();
  const { currentSite } = useSite();
  const location = useLocation();
  const { siteId } = useParams();

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
        '/shipping': { label: 'Shipping', step: 2 },
        '/review': { label: 'Review Order', step: 3 },
        '/confirmation': { label: 'Confirmation', step: 4 },
      };
    } else {
      // Without welcome page: Select Gift (1) → Shipping (2) → Review (3) → Confirmation (4)
      return {
        '/gift-selection': { label: 'Select Gift', step: 1 },
        '/gift-detail': { label: 'Gift Details', step: 1 },
        '/shipping': { label: 'Shipping', step: 2 },
        '/review': { label: 'Review Order', step: 3 },
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
    
    // Default: go to root
    return '/';
  }, [siteId, currentSite?.settings?.skipLandingPage]);

  // Don't show header on landing and access pages
  if (location.pathname === '/' || location.pathname === '/access') {
    return null;
  }

  const currentPath = location.pathname.startsWith('/confirmation')
    ? '/confirmation'
    : location.pathname.startsWith('/gift-detail')
    ? '/gift-detail'
    : location.pathname;
  const currentStep = stepMap[currentPath];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to={homeLink}
            className="flex items-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2 rounded-lg"
            aria-label="Go to home page"
          >
            <img src={haloLogo} alt="HALO Logo" className="h-8" />
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated && currentStep && (
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
                      0. Welcome
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
                  1. Select Gift
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
                  2. Shipping
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
                  3. Review
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
                  4. Confirmation
                </span>
              </nav>
            )}
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
}