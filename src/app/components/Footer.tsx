import { Link } from 'react-router';
import { useSiteContent } from '../hooks/useSiteContent';
import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { getTranslatedContent } = useSiteContent();
  const { t } = useLanguage();

  // Get translated content
  const text = getTranslatedContent('footer.text', t('footer.text') || '© 2026 HALO');
  const privacyLink = getTranslatedContent('footer.privacyLink', t('footer.privacyLink') || 'PRIVACY POLICY');
  const termsLink = getTranslatedContent('footer.termsLink', t('footer.termsLink') || 'COOKIE POLICY');
  const contactLink = getTranslatedContent('footer.contactLink', t('footer.contactLink') || 'CONTACT US');

  return (
    <footer className="bg-[#1B2A5E] text-white py-8" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              <li>
                <a
                  href="#contact"
                  className="text-white hover:text-[#00B4CC] transition-colors font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-[#00B4CC] focus:ring-offset-2 focus:ring-offset-[#1B2A5E] rounded-sm px-2 py-1"
                >
                  {contactLink}
                </a>
              </li>
              <li>
                <a
                  href="#cookie-policy"
                  className="text-white hover:text-[#00B4CC] transition-colors font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-[#00B4CC] focus:ring-offset-2 focus:ring-offset-[#1B2A5E] rounded-sm px-2 py-1"
                >
                  {termsLink}
                </a>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-white hover:text-[#00B4CC] transition-colors font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-[#00B4CC] focus:ring-offset-2 focus:ring-offset-[#1B2A5E] rounded-sm px-2 py-1"
                >
                  {privacyLink}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-settings"
                  className="text-white hover:text-[#00B4CC] transition-colors font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-[#00B4CC] focus:ring-offset-2 focus:ring-offset-[#1B2A5E] rounded-sm px-2 py-1"
                >
                  PRIVACY SETTINGS
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Copyright */}
          <div className="text-white text-sm">
            {text}
          </div>
        </div>
      </div>
    </footer>
  );
}