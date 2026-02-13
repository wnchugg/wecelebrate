import { Link } from 'react-router';
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import { HeaderFooterConfig, SocialPlatform } from '../../types/siteCustomization';

interface ConfigurableFooterProps {
  config?: Partial<HeaderFooterConfig['footer']>;
  siteName?: string;
  clientName?: string;
}

const socialIcons: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: () => <span className="text-lg">🎵</span>, // TikTok fallback
};

export function ConfigurableFooter({ config, siteName, clientName }: ConfigurableFooterProps) {
  const footerConfig = {
    enabled: config?.enabled ?? true,
    layout: config?.layout ?? 'simple',
    backgroundColor: config?.backgroundColor ?? '#1B2A5E',
    textColor: config?.textColor ?? '#FFFFFF',
    links: config?.links ?? {
      enabled: true,
      columns: [
        {
          id: 'legal',
          title: 'Legal',
          order: 1,
          links: [
            { label: 'Privacy Policy', url: '/privacy', external: false },
            { label: 'Cookie Policy', url: '/cookies', external: false },
            { label: 'Privacy Settings', url: '/privacy-settings', external: false },
          ],
        },
      ],
    },
    social: config?.social ?? { enabled: false, links: [] },
    copyright: config?.copyright ?? {
      enabled: true,
      text: 'All rights reserved',
      year: 'auto' as const,
      companyName: clientName || siteName || 'wecelebrate',
    },
    logos: config?.logos ?? { enabled: false, items: [] },
    newsletter: config?.newsletter ?? { enabled: false, title: '', placeholder: '', buttonText: '' },
  };

  if (!footerConfig.enabled) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const displayYear = footerConfig.copyright.year === 'auto' ? currentYear : footerConfig.copyright.year;

  const sortedColumns = [...footerConfig.links.columns].sort((a, b) => a.order - b.order);

  return (
    <footer 
      className="py-8"
      style={{
        backgroundColor: footerConfig.backgroundColor,
        color: footerConfig.textColor,
      }}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {footerConfig.layout === 'simple' ? (
          /* Simple Layout */
          <div className="flex flex-col items-center space-y-4">
            {/* Links */}
            {footerConfig.links.enabled && sortedColumns.length > 0 && (
              <nav aria-label="Footer navigation">
                <ul className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                  {sortedColumns.flatMap(column =>
                    column.links.map((link, idx) => (
                      <li key={`${column.id}-${idx}`}>
                        {link.external ? (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#00B4CC] transition-colors font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-[#00B4CC] focus:ring-offset-2 rounded-sm px-2 py-1"
                            style={{ color: footerConfig.textColor }}
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            to={link.url}
                            className="hover:text-[#00B4CC] transition-colors font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-[#00B4CC] focus:ring-offset-2 rounded-sm px-2 py-1"
                            style={{ color: footerConfig.textColor }}
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </nav>
            )}

            {/* Social Links */}
            {footerConfig.social.enabled && footerConfig.social.links.length > 0 && (
              <div className="flex items-center gap-4">
                {footerConfig.social.links.map((social, idx) => {
                  const Icon = socialIcons[social.platform];
                  return (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#00B4CC] transition-colors p-2"
                      aria-label={social.label || social.platform}
                      style={{ color: footerConfig.textColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}

            {/* Copyright */}
            {footerConfig.copyright.enabled && (
              <div className="text-sm" style={{ color: footerConfig.textColor }}>
                © {displayYear} {footerConfig.copyright.companyName}. {footerConfig.copyright.text}.
              </div>
            )}

            {/* Logos */}
            {footerConfig.logos.enabled && footerConfig.logos.items.length > 0 && (
              <div className="flex items-center gap-6 mt-4">
                {footerConfig.logos.items.map((logo, idx) => (
                  logo.link ? (
                    <a
                      key={idx}
                      href={logo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={logo.url}
                        alt={logo.alt}
                        style={{ height: logo.height ? `${logo.height}px` : 'auto' }}
                        className="max-h-12"
                      />
                    </a>
                  ) : (
                    <img
                      key={idx}
                      src={logo.url}
                      alt={logo.alt}
                      style={{ height: logo.height ? `${logo.height}px` : 'auto' }}
                      className="max-h-12"
                    />
                  )
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Multi-Column Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Link Columns */}
            {footerConfig.links.enabled && sortedColumns.map(column => (
              <div key={column.id}>
                <h3 className="font-semibold text-lg mb-4" style={{ color: footerConfig.textColor }}>
                  {column.title}
                </h3>
                <ul className="space-y-2">
                  {column.links.map((link, idx) => (
                    <li key={idx}>
                      {link.external ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#00B4CC] transition-colors text-sm"
                          style={{ color: footerConfig.textColor }}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.url}
                          className="hover:text-[#00B4CC] transition-colors text-sm"
                          style={{ color: footerConfig.textColor }}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter */}
            {footerConfig.newsletter.enabled && (
              <div>
                <h3 className="font-semibold text-lg mb-4" style={{ color: footerConfig.textColor }}>
                  {footerConfig.newsletter.title}
                </h3>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder={footerConfig.newsletter.placeholder}
                    className="flex-1 px-3 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B4CC]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00B4CC] text-white rounded-md hover:bg-[#009BB5] transition-colors font-medium"
                  >
                    {footerConfig.newsletter.buttonText}
                  </button>
                </form>
              </div>
            )}

            {/* Social Links Column */}
            {footerConfig.social.enabled && footerConfig.social.links.length > 0 && (
              <div>
                {footerConfig.social.title && (
                  <h3 className="font-semibold text-lg mb-4" style={{ color: footerConfig.textColor }}>
                    {footerConfig.social.title}
                  </h3>
                )}
                <div className="flex items-center gap-4">
                  {footerConfig.social.links.map((social, idx) => {
                    const Icon = socialIcons[social.platform];
                    return (
                      <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#00B4CC] transition-colors p-2"
                        aria-label={social.label || social.platform}
                        style={{ color: footerConfig.textColor }}
                      >
                        <Icon className="w-6 h-6" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Section for Multi-Column */}
        {footerConfig.layout === 'multi-column' && (
          <div className="mt-8 pt-8 border-t" style={{ borderColor: footerConfig.textColor + '33' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              {footerConfig.copyright.enabled && (
                <div className="text-sm" style={{ color: footerConfig.textColor }}>
                  © {displayYear} {footerConfig.copyright.companyName}. {footerConfig.copyright.text}.
                </div>
              )}

              {/* Logos */}
              {footerConfig.logos.enabled && footerConfig.logos.items.length > 0 && (
                <div className="flex items-center gap-6">
                  {footerConfig.logos.items.map((logo, idx) => (
                    logo.link ? (
                      <a
                        key={idx}
                        href={logo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={logo.url}
                          alt={logo.alt}
                          style={{ height: logo.height ? `${logo.height}px` : 'auto' }}
                          className="max-h-10"
                        />
                      </a>
                    ) : (
                      <img
                        key={idx}
                        src={logo.url}
                        alt={logo.alt}
                        style={{ height: logo.height ? `${logo.height}px` : 'auto' }}
                        className="max-h-10"
                      />
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
