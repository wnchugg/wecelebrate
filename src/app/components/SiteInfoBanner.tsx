import { useState } from 'react';
import { Building2, X, Info } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

export interface SiteInfoBannerProps {
  siteName: string;
  siteId: string;
  primaryColor?: string;
  className?: string;
}

export function SiteInfoBanner({
  siteName,
  siteId,
  primaryColor = '#D91C81',
  className = '',
}: SiteInfoBannerProps) {
  const { t } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(() => {
    // Check if banner was dismissed for this site
    return sessionStorage.getItem(`site_banner_dismissed_${siteId}`) === 'true';
  });
  const navigate = useNavigate();

  const handleDismiss = () => {
    sessionStorage.setItem(`site_banner_dismissed_${siteId}`, 'true');
    setIsDismissed(true);
  };

  const handleChangeSite = () => {
    navigate('/site-selection');
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: `${primaryColor}15`,
        borderLeft: `4px solid ${primaryColor}`,
      }}
    >
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-900">
                  {t('siteInfo.accessing')} <span className="font-bold">{siteName}</span>
                </p>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {t('siteInfo.notRightSite')}{' '}
                <button
                  onClick={handleChangeSite}
                  className="font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  {t('siteInfo.switchSite')}
                </button>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700"
            aria-label={t('siteInfo.dismiss')}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}