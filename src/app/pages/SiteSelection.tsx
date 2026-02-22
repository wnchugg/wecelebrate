import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Globe, Building2, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import Logo from '../../imports/Logo';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { logger } from '../utils/logger';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { publicSiteApi, PublicSite } from '../utils/api';

export function SiteSelection() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { siteId } = useParams();
  const [sites, setSites] = useState<PublicSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  // Get return path from query params (for redirection after selection)
  const returnPath = siteId ? `/access/${siteId}` : '/access';

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { sites: loadedSites } = await publicSiteApi.getActiveSites();
      setSites(loadedSites.filter((site: PublicSite) => site.status === 'active'));
      
      // Auto-select if there's a saved site preference
      const savedSiteId = sessionStorage.getItem('selected_site_id');
      if (savedSiteId && loadedSites.find((s: PublicSite) => s.id === savedSiteId)) {
        setSelectedSite(savedSiteId);
      }
    } catch (err: any) {
      logger.error('Failed to load sites:', err);
      setError(err.message || 'Failed to load available sites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSiteSelection = (siteId: string) => {
    // Save selection to sessionStorage
    sessionStorage.setItem('selected_site_id', siteId);
    
    // Save the full site data for immediate access
    const site = sites.find(s => s.id === siteId);
    if (site) {
      sessionStorage.setItem('selected_site_data', JSON.stringify(site));
    }
    
    // Navigate to the return path or access validation
    void navigate(returnPath);
  };

  const clearSelection = () => {
    sessionStorage.removeItem('selected_site_id');
    sessionStorage.removeItem('selected_site_data');
    setSelectedSite(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E]">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-6" role="banner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-[110px]" style={{ filter: 'brightness(0) invert(1)' }} role="img" aria-label="HALO Logo">
              <Logo />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {t('siteSelection.title')}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              {t('siteSelection.subtitle')}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8 bg-red-500/20 border-red-500/50 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-white">Error</AlertTitle>
              <AlertDescription className="text-white/90">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {sites.length === 0 && !error && (
            <Alert className="mb-8 bg-white/10 border-white/30 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-white" />
              <AlertTitle className="text-white">{t('siteSelection.noSitesTitle')}</AlertTitle>
              <AlertDescription className="text-white/90">
                {t('siteSelection.noSitesDescription')}
              </AlertDescription>
            </Alert>
          )}

          {selectedSite && (
            <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-green-500/20 text-white border-green-500/50">
                  {t('siteSelection.currentSelection')}
                </Badge>
                <span className="text-white font-medium">
                  {sites.find(s => s.id === selectedSite)?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-white hover:bg-white/20"
              >
                {t('common.change')}
              </Button>
            </div>
          )}

          {/* Sites Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {sites.map((site) => (
              <Card
                key={site.id}
                className={`bg-white/10 backdrop-blur-sm border-white/20 transition-all hover:bg-white/20 hover:scale-105 cursor-pointer ${
                  selectedSite === site.id ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                }`}
                onClick={() => handleSiteSelection(site.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-xl mb-2">
                        {site.name}
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        <span className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          {site.domain}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge
                      variant={site.status === 'active' ? 'default' : 'secondary'}
                      className={
                        site.status === 'active'
                          ? 'bg-green-500/20 text-white border-green-500/50'
                          : 'bg-gray-500/20 text-white border-gray-500/50'
                      }
                    >
                      {site.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Branding Preview */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm">{t('siteSelection.branding')}:</span>
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white/30"
                          style={{ backgroundColor: site?.branding?.primaryColor }}
                          title={`Primary: ${site?.branding?.primaryColor}`}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white/30"
                          style={{ backgroundColor: site?.branding?.secondaryColor }}
                          title={`Secondary: ${site?.branding?.secondaryColor}`}
                        />
                        {site?.branding?.accentColor && (
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white/30"
                            style={{ backgroundColor: site.branding.accentColor }}
                            title={`Accent: ${site.branding.accentColor}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Validation Method */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm">{t('siteSelection.validationMethod')}:</span>
                      <Badge variant="outline" className="text-white border-white/30">
                        {site?.settings?.validationMethod}
                      </Badge>
                    </div>

                    {/* Languages */}
                    {site?.settings?.languages && site.settings.languages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 text-sm">{t('siteSelection.languages')}:</span>
                        <div className="flex gap-1">
                          {site.settings.languages.map((lang) => (
                            <Badge
                              key={lang}
                              variant="outline"
                              className="text-xs text-white border-white/30"
                            >
                              {lang.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <Button
                      className="w-full mt-4 bg-white text-[#D91C81] hover:bg-white/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSiteSelection(site.id);
                      }}
                    >
                      {t('siteSelection.selectSite')}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <p className="text-white/60 text-sm">
              {t('siteSelection.footerNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}