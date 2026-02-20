import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, Building2, Globe } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { useNavigate } from 'react-router';

export function SiteSwitcherDropdown() {
  const { sites, currentSite, setCurrentSite } = useSite();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.clientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sites by client or type
  const groupedSites = filteredSites.reduce((acc, site) => {
    const groupKey = site.clientId;
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(site);
    return acc;
  }, {} as Record<string, typeof sites>);

  const handleSiteChange = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (site) {
      setCurrentSite(site);
      setIsOpen(false);
      
      // Navigate to site-specific route if needed
      if (window.location.pathname.startsWith('/site/')) {
        void navigate(`/site/${siteId}`);
      }
    }
  };

  if (sites.length <= 1) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Building2 className="w-4 h-4 text-gray-500" />
        <span className="max-w-[150px] truncate">{currentSite?.name || 'Select Site'}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sites..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
              />
            </div>
          </div>

          {/* Sites List */}
          <div className="max-h-96 overflow-y-auto">
            {Object.keys(groupedSites).length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No sites found
              </div>
            ) : (
              <div className="py-2">
                {Object.entries(groupedSites).map(([clientId, clientSites]) => (
                  <div key={clientId} className="mb-2">
                    {/* Client Name Header */}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {clientSites[0].clientId}
                    </div>
                    
                    {/* Sites in this client */}
                    {clientSites.map(site => (
                      <button
                        key={site.id}
                        onClick={() => handleSiteChange(site.id)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                          currentSite?.id === site.id ? 'bg-pink-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Globe className={`w-4 h-4 flex-shrink-0 ${
                            currentSite?.id === site.id ? 'text-[#D91C81]' : 'text-gray-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium truncate ${
                              currentSite?.id === site.id ? 'text-[#D91C81]' : 'text-gray-900'
                            }`}>
                              {site.name}
                            </div>
                            {site.domain && (
                              <div className="text-xs text-gray-500 truncate">
                                {site.domain}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                site.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : site.status === 'draft'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {site.status}
                              </span>
                              {site.type && (
                                <span className="text-xs text-gray-500 capitalize">
                                  {site.type.replace('-', ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {currentSite?.id === site.id && (
                          <Check className="w-5 h-5 text-[#D91C81] flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                void navigate('/admin/sites');
              }}
              className="w-full px-3 py-2 text-sm text-[#D91C81] hover:bg-white rounded-md transition-colors font-medium"
            >
              Manage Sites
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
