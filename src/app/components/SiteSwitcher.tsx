import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { Building2, Check, ChevronDown } from 'lucide-react';

import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Site {
  id: string;
  name: string;
  domain: string;
  status: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;
  };
}

export interface SiteSwitcherProps {
  currentSite: Site | null;
  availableSites: Site[];
  onSiteChange?: (siteId: string) => void;
  className?: string;
}

export function SiteSwitcher({
  currentSite,
  availableSites,
  onSiteChange,
  className = '',
}: SiteSwitcherProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSiteChange = (siteId: string) => {
    // Save selection to sessionStorage
    sessionStorage.setItem('selected_site_id', siteId);
    
    // Save the full site data for immediate access
    const site = availableSites.find(s => s.id === siteId);
    if (site) {
      sessionStorage.setItem('selected_site_data', JSON.stringify(site));
    }
    
    setIsOpen(false);
    
    // Call callback if provided
    if (onSiteChange) {
      onSiteChange(siteId);
    } else {
      // Otherwise reload the page to apply new site
      window.location.reload();
    }
  };

  const handleViewAllSites = () => {
    setIsOpen(false);
    navigate('/site-selection');
  };

  // Don't show switcher if there's only one site or no sites
  if (!currentSite || availableSites.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 ${className}`}
          aria-label={t('siteSwitcher.selectSite')}
        >
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline truncate max-w-[150px]">
            {currentSite.name}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuLabel>{t('siteSwitcher.selectSiteLabel')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableSites.map((site) => (
          <DropdownMenuItem
            key={site.id}
            onClick={() => handleSiteChange(site.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex gap-1">
                  <div
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: site.branding.primaryColor }}
                    title={`Primary: ${site.branding.primaryColor}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{site.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {site.domain}
                  </div>
                </div>
              </div>
              {currentSite.id === site.id && (
                <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewAllSites} className="cursor-pointer">
          <Building2 className="h-4 w-4 mr-2" />
          {t('siteSwitcher.viewAllSites')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}