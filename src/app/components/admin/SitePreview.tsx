import { useState, useEffect } from 'react';
import { ExternalLink, Globe, Gift as GiftIcon, Palette, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { publicSiteApi } from '../../utils/api';
import { logger } from '../../utils/logger';

interface Gift {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  price?: number;
}

interface Site {
  id: string;
  name: string;
  clientId: string;
  domain: string;
  status: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor?: string;
    logo?: string;
  };
  settings: {
    validationMethod: string;
    allowQuantitySelection: boolean;
    showPricing: boolean;
    giftsPerUser: number;
    shippingMode: string;
    defaultLanguage: string;
    enableLanguageSelector: boolean;
    defaultCurrency?: string;
    allowedCountries?: string[];
    defaultCountry?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SitePreviewProps {
  site: Site;
  onClose?: () => void;
}

export function SitePreview({ site, onClose }: SitePreviewProps) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(false);

  useEffect(() => {
    loadGifts();
  }, [site.id]);

  const loadGifts = async () => {
    setLoadingGifts(true);
    try {
      const { gifts: siteGifts } = await publicSiteApi.getSiteGifts(site.id);
      setGifts(siteGifts || []);
    } catch (error) {
      logger.error('Failed to load gifts:', error);
      setGifts([]);
    } finally {
      setLoadingGifts(false);
    }
  };

  const handleVisitPublicSite = () => {
    // Save this site as selected and open in new tab
    sessionStorage.setItem('selected_site_id', site.id);
    sessionStorage.setItem('selected_site_data', JSON.stringify(site));
    window.open('/', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{site.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            <Globe className="w-4 h-4 inline mr-1" />
            {site.domain}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={site.status === 'active' ? 'default' : 'secondary'}
            className={
              site.status === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-gray-500 text-white'
            }
          >
            {site.status}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleVisitPublicSite}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Public Site
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="branding">
            <Palette className="w-4 h-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="gifts">
            <GiftIcon className="w-4 h-4 mr-2" />
            Gifts ({gifts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>
                Preview the site's color palette
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 block">
                    Primary Color
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: site.branding.primaryColor }}
                    />
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {site.branding.primaryColor}
                    </code>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 block">
                    Secondary Color
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: site.branding.secondaryColor }}
                    />
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {site.branding.secondaryColor}
                    </code>
                  </div>
                </div>
                {site.branding.tertiaryColor && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 block">
                      Tertiary Color
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: site.branding.tertiaryColor }}
                      />
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {site.branding.tertiaryColor}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Preview Example */}
              <div className="mt-6 p-6 rounded-lg border-2" style={{ backgroundColor: site.branding.primaryColor }}>
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <h3 className="text-xl font-bold mb-2" style={{ color: site.branding.primaryColor }}>
                    Sample Button
                  </h3>
                  <button
                    className="px-6 py-2 rounded-lg text-white font-medium shadow"
                    style={{ backgroundColor: site.branding.primaryColor }}
                  >
                    Primary Action
                  </button>
                  <button
                    className="ml-2 px-6 py-2 rounded-lg text-white font-medium shadow"
                    style={{ backgroundColor: site.branding.secondaryColor }}
                  >
                    Secondary Action
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>
                Current site settings and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Validation Method</p>
                  <Badge variant="outline" className="mt-1">
                    {site.settings.validationMethod}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Shipping Mode</p>
                  <Badge variant="outline" className="mt-1">
                    {site.settings.shippingMode}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Default Language</p>
                  <Badge variant="outline" className="mt-1">
                    {site.settings.defaultLanguage.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Gifts Per User</p>
                  <Badge variant="outline" className="mt-1">
                    {site.settings.giftsPerUser}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Show Pricing</p>
                  <Badge variant={site.settings.showPricing ? 'default' : 'secondary'}>
                    {site.settings.showPricing ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Quantity Selection</p>
                  <Badge variant={site.settings.allowQuantitySelection ? 'default' : 'secondary'}>
                    {site.settings.allowQuantitySelection ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Language Selector</p>
                  <Badge variant={site.settings.enableLanguageSelector ? 'default' : 'secondary'}>
                    {site.settings.enableLanguageSelector ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>

              {site.settings.defaultCurrency && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 block mb-2">
                    International Settings
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Default Currency: </span>
                      <Badge variant="outline">{site.settings.defaultCurrency}</Badge>
                    </div>
                    {site.settings.defaultCountry && (
                      <div>
                        <span className="text-sm text-gray-600">Default Country: </span>
                        <Badge variant="outline">{site.settings.defaultCountry}</Badge>
                      </div>
                    )}
                  </div>
                  {site.settings.allowedCountries && site.settings.allowedCountries.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600 block mb-1">
                        Allowed Countries ({site.settings.allowedCountries.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {site.settings.allowedCountries.slice(0, 10).map((country) => (
                          <Badge key={country} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                        {site.settings.allowedCountries.length > 10 && (
                          <Badge variant="outline" className="text-xs">
                            +{site.settings.allowedCountries.length - 10} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gifts" className="space-y-4 mt-4">
          {loadingGifts ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-gray-500">Loading gifts...</div>
              </CardContent>
            </Card>
          ) : gifts.length === 0 ? (
            <Alert>
              <GiftIcon className="h-4 w-4" />
              <AlertDescription>
                No gifts assigned to this site yet. Assign gifts in the Gift Assignment page.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gifts.map((gift) => (
                <Card key={gift.id} className="overflow-hidden">
                  {gift.imageUrl && (
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      <img
                        src={gift.imageUrl}
                        alt={gift.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-base">{gift.name}</CardTitle>
                    {gift.category && (
                      <Badge variant="outline" className="w-fit text-xs">
                        {gift.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {gift.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {gift.description}
                      </p>
                    )}
                    {site.settings.showPricing && gift.price && (
                      <p className="text-sm font-semibold text-gray-900 mt-2">
                        {site.settings.defaultCurrency || '$'} {gift.price}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}