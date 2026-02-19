import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { companyConfig } from '../data/config';
import { Link } from 'react-router';
import { usePublicSite } from '../context/PublicSiteContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { useLanguage } from '../context/LanguageContext';

export function SelectionPeriodExpired() {
  // For now, we'll use companyConfig instead of site data from API
  // In a production app, you might have a public API endpoint for site config
  const { currentSite } = usePublicSite();
  const { getTranslatedContent } = useSiteContent();
  const { t } = useLanguage();

  const defaultMessage = 'Thank you for your interest. The gift selection period for this program has ended. If you have questions, please contact your program administrator.';
  const expiredMessage = defaultMessage; // In production, this would come from site settings

  // Get translated content
  const title = getTranslatedContent('expiredPage.title', t('expired.title') || 'Selection Period Ended');
  const message = getTranslatedContent('expiredPage.message', t('expired.message') || expiredMessage);
  const contactMessage = getTranslatedContent('expiredPage.contactMessage', t('expired.contactMessage') || 'Contact your program administrator for more information');
  const returnHomeButton = getTranslatedContent('expiredPage.returnHomeButton', t('expired.returnHomeButton') || 'Return to Home');

  // Determine home link based on landing page setting
  const isLandingPageEnabled = !currentSite?.settings?.skipLandingPage;
  const homeLink = isLandingPageEnabled ? '/home' : '/access';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00E5A0] via-[#0066CC] via-[#D91C81] to-[#1B2A5E] flex items-center justify-center px-4 py-4">
      {/* Main Content */}
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#D91C81] to-[#1B2A5E] rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            {title}
          </h1>

          {/* Message */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4 text-center">Need Assistance?</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <Mail className="w-5 h-5 text-[#D91C81]" />
                <span>{contactMessage}</span>
              </div>
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="mt-8 flex justify-center">
            <Link
              to={homeLink}
              className="inline-flex items-center gap-2 bg-[#D91C81] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#B71569] transition-all focus:outline-none focus:ring-4 focus:ring-pink-200"
            >
              <ArrowLeft className="w-5 h-5" />
              {returnHomeButton}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}