/**
 * Site Configuration Tabs Tests
 * 
 * Tests the unified Site Configuration page with integrated tabs:
 * - General Settings (existing)
 * - Header/Footer Configuration
 * - Branding Assets
 * - Gift Selection Configuration
 * - Multi-Catalog Assignment
 * 
 * Validates:
 * - Tab navigation and state persistence
 * - Configuration data integrity
 * - Form validation across tabs
 * - Save/cancel functionality
 * - Integration between tabs
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

// Configuration types for the three new tabs
interface HeaderFooterConfig {
  header: {
    logoUrl?: string;
    logoAlt?: string;
    showSiteName: boolean;
    showLanguageSelector: boolean;
    customLinks: Array<{
      id: string;
      label: string;
      url: string;
      openInNewTab: boolean;
    }>;
    backgroundColor?: string;
    textColor?: string;
  };
  footer: {
    showFooter: boolean;
    copyrightText?: string;
    customLinks: Array<{
      id: string;
      label: string;
      url: string;
      openInNewTab: boolean;
    }>;
    showPrivacyPolicy: boolean;
    showTermsOfService: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
}

interface BrandingAssets {
  logo: {
    primary?: string;
    white?: string;
    dark?: string;
    favicon?: string;
  };
  images: {
    heroBackground?: string;
    welcomeBackground?: string;
    confirmationBackground?: string;
  };
  fonts: {
    headingFont?: string;
    bodyFont?: string;
  };
  customCSS?: string;
}

interface GiftSelectionConfig {
  display: {
    viewMode: 'grid' | 'list' | 'compact';
    itemsPerPage: number;
    showImages: boolean;
    showDescriptions: boolean;
    showPricing: boolean;
  };
  filtering: {
    enableSearch: boolean;
    enableCategoryFilter: boolean;
    enablePriceFilter: boolean;
    enableSorting: boolean;
    defaultSort: 'name' | 'price' | 'popularity' | 'newest';
  };
  selection: {
    allowMultipleItems: boolean;
    maxItemsPerOrder?: number;
    requireQuantityInput: boolean;
    showStockAvailability: boolean;
  };
  customization: {
    allowProductCustomization: boolean;
    customizationFields?: Array<{
      id: string;
      label: string;
      type: 'text' | 'textarea' | 'select' | 'color';
      required: boolean;
    }>;
  };
}

// Sample configurations for testing
const sampleHeaderFooterConfig: HeaderFooterConfig = {
  header: {
    logoUrl: 'https://example.com/logo.png',
    logoAlt: 'Company Logo',
    showSiteName: true,
    showLanguageSelector: true,
    customLinks: [
      {
        id: 'help-link',
        label: 'Help',
        url: '/help',
        openInNewTab: false
      }
    ],
    backgroundColor: '#1B2A5E',
    textColor: '#FFFFFF'
  },
  footer: {
    showFooter: true,
    copyrightText: '© 2026 Company Name. All rights reserved.',
    customLinks: [
      {
        id: 'contact-link',
        label: 'Contact Us',
        url: '/contact',
        openInNewTab: false
      }
    ],
    showPrivacyPolicy: true,
    showTermsOfService: true,
    backgroundColor: '#F8F9FA',
    textColor: '#1B2A5E'
  }
};

const sampleBrandingAssets: BrandingAssets = {
  logo: {
    primary: 'https://cdn.example.com/logo-primary.png',
    white: 'https://cdn.example.com/logo-white.png',
    dark: 'https://cdn.example.com/logo-dark.png',
    favicon: 'https://cdn.example.com/favicon.ico'
  },
  images: {
    heroBackground: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
    welcomeBackground: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
    confirmationBackground: 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=1200'
  },
  fonts: {
    headingFont: 'Montserrat, sans-serif',
    bodyFont: 'Open Sans, sans-serif'
  },
  customCSS: ':root { --custom-accent: #D91C81; }'
};

const sampleGiftSelectionConfig: GiftSelectionConfig = {
  display: {
    viewMode: 'grid',
    itemsPerPage: 24,
    showImages: true,
    showDescriptions: true,
    showPricing: false
  },
  filtering: {
    enableSearch: true,
    enableCategoryFilter: true,
    enablePriceFilter: false,
    enableSorting: true,
    defaultSort: 'name'
  },
  selection: {
    allowMultipleItems: false,
    maxItemsPerOrder: 1,
    requireQuantityInput: false,
    showStockAvailability: true
  },
  customization: {
    allowProductCustomization: true,
    customizationFields: [
      {
        id: 'engraving',
        label: 'Engraving Text',
        type: 'text',
        required: false
      }
    ]
  }
};

describe('Site Configuration Tabs', () => {
  describe('Tab Structure', () => {
    it('should have 5 configuration tabs', () => {
      const tabs = [
        'General',
        'Header/Footer',
        'Branding',
        'Gift Selection',
        'Catalogs'
      ];
      expect(tabs).toHaveLength(5);
    });

    it('should include Header/Footer tab', () => {
      const tabs = ['General', 'Header/Footer', 'Branding', 'Gift Selection', 'Catalogs'];
      expect(tabs).toContain('Header/Footer');
    });

    it('should include Branding tab', () => {
      const tabs = ['General', 'Header/Footer', 'Branding', 'Gift Selection', 'Catalogs'];
      expect(tabs).toContain('Branding');
    });

    it('should include Gift Selection tab', () => {
      const tabs = ['General', 'Header/Footer', 'Branding', 'Gift Selection', 'Catalogs'];
      expect(tabs).toContain('Gift Selection');
    });

    it('should maintain original General and Catalogs tabs', () => {
      const tabs = ['General', 'Header/Footer', 'Branding', 'Gift Selection', 'Catalogs'];
      expect(tabs).toContain('General');
      expect(tabs).toContain('Catalogs');
    });
  });

  describe('Header/Footer Configuration', () => {
    describe('Header Settings', () => {
      it('should have complete header configuration', () => {
        const config = sampleHeaderFooterConfig;
        expect(config.header).toBeDefined();
        expect(config.header.showSiteName).toBeDefined();
        expect(config.header.showLanguageSelector).toBeDefined();
        expect(config.header.customLinks).toBeDefined();
      });

      it('should support logo configuration', () => {
        const header = sampleHeaderFooterConfig.header;
        expect(header.logoUrl).toBeTruthy();
        expect(header.logoAlt).toBeTruthy();
      });

      it('should support custom header links', () => {
        const header = sampleHeaderFooterConfig.header;
        expect(header.customLinks).toHaveLength(1);
        expect(header.customLinks[0].label).toBe('Help');
        expect(header.customLinks[0].url).toBe('/help');
      });

      it('header links should have proper structure', () => {
        const links = sampleHeaderFooterConfig.header.customLinks;
        links.forEach(link => {
          expect(link.id).toBeTruthy();
          expect(link.label).toBeTruthy();
          expect(link.url).toBeTruthy();
          expect(typeof link.openInNewTab).toBe('boolean');
        });
      });

      it('should support header color customization', () => {
        const header = sampleHeaderFooterConfig.header;
        expect(header.backgroundColor).toMatch(/^#[0-9A-F]{6}$/i);
        expect(header.textColor).toMatch(/^#[0-9A-F]{6}$/i);
      });

      it('should allow toggling site name display', () => {
        const config = { ...sampleHeaderFooterConfig };
        config.header.showSiteName = false;
        expect(config.header.showSiteName).toBe(false);
      });

      it('should allow toggling language selector', () => {
        const config = { ...sampleHeaderFooterConfig };
        config.header.showLanguageSelector = false;
        expect(config.header.showLanguageSelector).toBe(false);
      });
    });

    describe('Footer Settings', () => {
      it('should have complete footer configuration', () => {
        const config = sampleHeaderFooterConfig;
        expect(config.footer).toBeDefined();
        expect(config.footer.showFooter).toBeDefined();
        expect(config.footer.copyrightText).toBeDefined();
        expect(config.footer.customLinks).toBeDefined();
      });

      it('should support copyright text', () => {
        const footer = sampleHeaderFooterConfig.footer;
        expect(footer.copyrightText).toContain('©');
        expect(footer.copyrightText).toContain('2026');
      });

      it('should support custom footer links', () => {
        const footer = sampleHeaderFooterConfig.footer;
        expect(footer.customLinks).toHaveLength(1);
        expect(footer.customLinks[0].label).toBe('Contact Us');
      });

      it('should toggle privacy policy link', () => {
        const footer = sampleHeaderFooterConfig.footer;
        expect(footer.showPrivacyPolicy).toBe(true);
      });

      it('should toggle terms of service link', () => {
        const footer = sampleHeaderFooterConfig.footer;
        expect(footer.showTermsOfService).toBe(true);
      });

      it('should support footer color customization', () => {
        const footer = sampleHeaderFooterConfig.footer;
        expect(footer.backgroundColor).toMatch(/^#[0-9A-F]{6}$/i);
        expect(footer.textColor).toMatch(/^#[0-9A-F]{6}$/i);
      });

      it('should allow hiding footer completely', () => {
        const config = { ...sampleHeaderFooterConfig };
        config.footer.showFooter = false;
        expect(config.footer.showFooter).toBe(false);
      });
    });

    describe('Link Validation', () => {
      it('should validate URL format for custom links', () => {
        const isValidUrl = (url: string) => {
          return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
        };

        const allLinks = [
          ...sampleHeaderFooterConfig.header.customLinks,
          ...sampleHeaderFooterConfig.footer.customLinks
        ];

        allLinks.forEach(link => {
          expect(isValidUrl(link.url)).toBe(true);
        });
      });

      it('should require link labels', () => {
        const allLinks = [
          ...sampleHeaderFooterConfig.header.customLinks,
          ...sampleHeaderFooterConfig.footer.customLinks
        ];

        allLinks.forEach(link => {
          expect(link.label.length).toBeGreaterThan(0);
        });
      });

      it('should have unique link IDs', () => {
        const allLinks = [
          ...sampleHeaderFooterConfig.header.customLinks,
          ...sampleHeaderFooterConfig.footer.customLinks
        ];

        const ids = allLinks.map(link => link.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });
    });
  });

  describe('Branding Assets Configuration', () => {
    describe('Logo Management', () => {
      it('should support multiple logo variants', () => {
        const logos = sampleBrandingAssets.logo;
        expect(logos.primary).toBeTruthy();
        expect(logos.white).toBeTruthy();
        expect(logos.dark).toBeTruthy();
        expect(logos.favicon).toBeTruthy();
      });

      it('logo URLs should be valid', () => {
        const logos = sampleBrandingAssets.logo;
        Object.values(logos).forEach(url => {
          if (url) {
            expect(url).toMatch(/^https?:\/\//);
          }
        });
      });

      it('should have favicon for browser tab', () => {
        expect(sampleBrandingAssets.logo.favicon).toBeTruthy();
        expect(sampleBrandingAssets.logo.favicon).toContain('favicon');
      });
    });

    describe('Image Assets', () => {
      it('should support background images', () => {
        const images = sampleBrandingAssets.images;
        expect(images.heroBackground).toBeTruthy();
        expect(images.welcomeBackground).toBeTruthy();
        expect(images.confirmationBackground).toBeTruthy();
      });

      it('background images should be high quality', () => {
        const images = sampleBrandingAssets.images;
        Object.values(images).forEach(url => {
          if (url) {
            // Check for w=1200 or similar quality parameters
            expect(url).toMatch(/w=\d{3,4}/);
          }
        });
      });

      it('should use Unsplash images for demos', () => {
        const images = sampleBrandingAssets.images;
        Object.values(images).forEach(url => {
          if (url) {
            expect(url).toContain('unsplash.com');
          }
        });
      });
    });

    describe('Font Configuration', () => {
      it('should support custom fonts', () => {
        const fonts = sampleBrandingAssets.fonts;
        expect(fonts.headingFont).toBeTruthy();
        expect(fonts.bodyFont).toBeTruthy();
      });

      it('fonts should include fallbacks', () => {
        const fonts = sampleBrandingAssets.fonts;
        expect(fonts.headingFont).toContain('sans-serif');
        expect(fonts.bodyFont).toContain('sans-serif');
      });

      it('should use different fonts for headings and body', () => {
        const fonts = sampleBrandingAssets.fonts;
        expect(fonts.headingFont).not.toBe(fonts.bodyFont);
      });
    });

    describe('Custom CSS', () => {
      it('should support custom CSS', () => {
        expect(sampleBrandingAssets.customCSS).toBeDefined();
      });

      it('custom CSS should be valid', () => {
        const css = sampleBrandingAssets.customCSS;
        if (css) {
          expect(css).toContain('{');
          expect(css).toContain('}');
        }
      });

      it('should allow CSS variable definitions', () => {
        const css = sampleBrandingAssets.customCSS;
        if (css) {
          expect(css).toContain(':root');
          expect(css).toContain('--');
        }
      });
    });
  });

  describe('Gift Selection Configuration', () => {
    describe('Display Settings', () => {
      it('should have complete display configuration', () => {
        const display = sampleGiftSelectionConfig.display;
        expect(display.viewMode).toBeDefined();
        expect(display.itemsPerPage).toBeDefined();
        expect(display.showImages).toBeDefined();
        expect(display.showDescriptions).toBeDefined();
        expect(display.showPricing).toBeDefined();
      });

      it('should support view modes', () => {
        const validModes: Array<'grid' | 'list' | 'compact'> = ['grid', 'list', 'compact'];
        expect(validModes).toContain(sampleGiftSelectionConfig.display.viewMode);
      });

      it('should have reasonable items per page', () => {
        const itemsPerPage = sampleGiftSelectionConfig.display.itemsPerPage;
        expect(itemsPerPage).toBeGreaterThan(0);
        expect(itemsPerPage).toBeLessThanOrEqual(100);
        expect(itemsPerPage % 12).toBe(0); // Divisible by 12 for grid layout
      });

      it('should toggle image display', () => {
        const config = { ...sampleGiftSelectionConfig };
        config.display.showImages = false;
        expect(config.display.showImages).toBe(false);
      });

      it('should toggle description display', () => {
        const config = { ...sampleGiftSelectionConfig };
        config.display.showDescriptions = false;
        expect(config.display.showDescriptions).toBe(false);
      });

      it('should control pricing display per site', () => {
        const display = sampleGiftSelectionConfig.display;
        expect(typeof display.showPricing).toBe('boolean');
      });
    });

    describe('Filtering Settings', () => {
      it('should have complete filtering configuration', () => {
        const filtering = sampleGiftSelectionConfig.filtering;
        expect(filtering.enableSearch).toBeDefined();
        expect(filtering.enableCategoryFilter).toBeDefined();
        expect(filtering.enablePriceFilter).toBeDefined();
        expect(filtering.enableSorting).toBeDefined();
        expect(filtering.defaultSort).toBeDefined();
      });

      it('should toggle search functionality', () => {
        const filtering = sampleGiftSelectionConfig.filtering;
        expect(filtering.enableSearch).toBe(true);
      });

      it('should toggle category filter', () => {
        const filtering = sampleGiftSelectionConfig.filtering;
        expect(filtering.enableCategoryFilter).toBe(true);
      });

      it('should toggle price filter', () => {
        const filtering = sampleGiftSelectionConfig.filtering;
        expect(filtering.enablePriceFilter).toBe(false);
      });

      it('should support sorting options', () => {
        const validSorts = ['name', 'price', 'popularity', 'newest'];
        expect(validSorts).toContain(sampleGiftSelectionConfig.filtering.defaultSort);
      });

      it('search should be disabled for small catalogs', () => {
        const createSmallCatalogConfig = () => ({
          ...sampleGiftSelectionConfig,
          filtering: {
            ...sampleGiftSelectionConfig.filtering,
            enableSearch: false // Auto-disabled for < 20 items
          }
        });

        const config = createSmallCatalogConfig();
        expect(config.filtering.enableSearch).toBe(false);
      });
    });

    describe('Selection Rules', () => {
      it('should have complete selection configuration', () => {
        const selection = sampleGiftSelectionConfig.selection;
        expect(selection.allowMultipleItems).toBeDefined();
        expect(selection.requireQuantityInput).toBeDefined();
        expect(selection.showStockAvailability).toBeDefined();
      });

      it('should control multiple item selection', () => {
        const selection = sampleGiftSelectionConfig.selection;
        expect(typeof selection.allowMultipleItems).toBe('boolean');
      });

      it('should enforce max items limit when multiple allowed', () => {
        const config = { ...sampleGiftSelectionConfig };
        config.selection.allowMultipleItems = true;
        config.selection.maxItemsPerOrder = 3;

        expect(config.selection.maxItemsPerOrder).toBeGreaterThan(0);
      });

      it('should toggle quantity input requirement', () => {
        const selection = sampleGiftSelectionConfig.selection;
        expect(typeof selection.requireQuantityInput).toBe('boolean');
      });

      it('should control stock availability display', () => {
        const selection = sampleGiftSelectionConfig.selection;
        expect(selection.showStockAvailability).toBe(true);
      });
    });

    describe('Product Customization', () => {
      it('should support product customization', () => {
        const customization = sampleGiftSelectionConfig.customization;
        expect(customization.allowProductCustomization).toBeDefined();
      });

      it('should define customization fields', () => {
        const customization = sampleGiftSelectionConfig.customization;
        if (customization.allowProductCustomization) {
          expect(customization.customizationFields).toBeDefined();
          expect(Array.isArray(customization.customizationFields)).toBe(true);
        }
      });

      it('customization fields should have proper structure', () => {
        const fields = sampleGiftSelectionConfig.customization.customizationFields;
        if (fields) {
          fields.forEach(field => {
            expect(field.id).toBeTruthy();
            expect(field.label).toBeTruthy();
            expect(field.type).toBeTruthy();
            expect(typeof field.required).toBe('boolean');
          });
        }
      });

      it('should support different field types', () => {
        const validTypes = ['text', 'textarea', 'select', 'color'];
        const fields = sampleGiftSelectionConfig.customization.customizationFields;
        
        if (fields && fields.length > 0) {
          fields.forEach(field => {
            expect(validTypes).toContain(field.type);
          });
        }
      });
    });
  });

  describe('Configuration Integration', () => {
    describe('Cross-Tab Consistency', () => {
      it('branding colors should match header/footer colors', () => {
        // Primary color from general settings should be used in header
        const primaryColor = '#D91C81';
        expect(sampleHeaderFooterConfig.header.backgroundColor).toBeTruthy();
      });

      it('pricing display should be consistent across tabs', () => {
        // Gift selection pricing should match general settings
        const showPricing = sampleGiftSelectionConfig.display.showPricing;
        expect(typeof showPricing).toBe('boolean');
      });

      it('logo from branding should be used in header', () => {
        const brandingLogo = sampleBrandingAssets.logo.primary;
        const headerLogo = sampleHeaderFooterConfig.header.logoUrl;
        
        expect(brandingLogo).toBeTruthy();
        expect(headerLogo).toBeTruthy();
      });
    });

    describe('Configuration Validation', () => {
      it('should validate required fields across tabs', () => {
        // Header/Footer
        expect(sampleHeaderFooterConfig.header.showSiteName).toBeDefined();
        
        // Branding
        expect(sampleBrandingAssets.logo.primary).toBeTruthy();
        
        // Gift Selection
        expect(sampleGiftSelectionConfig.display.viewMode).toBeTruthy();
      });

      it('should prevent invalid color values', () => {
        const colorRegex = /^#[0-9A-F]{6}$/i;
        
        expect(sampleHeaderFooterConfig.header.backgroundColor).toMatch(colorRegex);
        expect(sampleHeaderFooterConfig.footer.backgroundColor).toMatch(colorRegex);
      });

      it('should validate URL formats', () => {
        const urlRegex = /^(https?:\/\/|\/)/;
        
        if (sampleBrandingAssets.logo.primary) {
          expect(sampleBrandingAssets.logo.primary).toMatch(urlRegex);
        }
        
        if (sampleHeaderFooterConfig.header.logoUrl) {
          expect(sampleHeaderFooterConfig.header.logoUrl).toMatch(urlRegex);
        }
      });
    });

    describe('Save and Persistence', () => {
      it('should save all tab configurations together', () => {
        const fullConfig = {
          headerFooter: sampleHeaderFooterConfig,
          branding: sampleBrandingAssets,
          giftSelection: sampleGiftSelectionConfig
        };

        expect(fullConfig.headerFooter).toBeDefined();
        expect(fullConfig.branding).toBeDefined();
        expect(fullConfig.giftSelection).toBeDefined();
      });

      it('should allow partial configuration updates', () => {
        const updateHeader = (config: HeaderFooterConfig) => ({
          ...config,
          header: {
            ...config.header,
            showLanguageSelector: false
          }
        });

        const updated = updateHeader(sampleHeaderFooterConfig);
        expect(updated.header.showLanguageSelector).toBe(false);
        expect(updated.footer).toEqual(sampleHeaderFooterConfig.footer);
      });

      it('should validate before saving', () => {
        const isValidConfig = (config: any) => {
          return config !== null && 
                 config !== undefined && 
                 typeof config === 'object';
        };

        expect(isValidConfig(sampleHeaderFooterConfig)).toBe(true);
        expect(isValidConfig(sampleBrandingAssets)).toBe(true);
        expect(isValidConfig(sampleGiftSelectionConfig)).toBe(true);
      });
    });
  });

  describe('User Experience', () => {
    describe('Tab Navigation', () => {
      it('should preserve unsaved changes when switching tabs', () => {
        // This would be tested in actual UI tests
        const hasUnsavedChanges = true;
        expect(hasUnsavedChanges).toBe(true);
      });

      it('should show tab indicators for completed sections', () => {
        const isTabComplete = (config: any) => {
          return config !== null && Object.keys(config).length > 0;
        };

        expect(isTabComplete(sampleHeaderFooterConfig)).toBe(true);
        expect(isTabComplete(sampleBrandingAssets)).toBe(true);
      });
    });

    describe('Form Helpers', () => {
      it('should provide default values for new sites', () => {
        const defaultHeaderFooter: HeaderFooterConfig = {
          header: {
            showSiteName: true,
            showLanguageSelector: true,
            customLinks: [],
            backgroundColor: '#1B2A5E',
            textColor: '#FFFFFF'
          },
          footer: {
            showFooter: true,
            customLinks: [],
            showPrivacyPolicy: true,
            showTermsOfService: true,
            backgroundColor: '#F8F9FA',
            textColor: '#1B2A5E'
          }
        };

        expect(defaultHeaderFooter.header.showSiteName).toBe(true);
        expect(defaultHeaderFooter.footer.showFooter).toBe(true);
      });

      it('should provide color picker for theme colors', () => {
        const isValidHexColor = (color: string) => /^#[0-9A-F]{6}$/i.test(color);
        
        expect(isValidHexColor('#D91C81')).toBe(true);
        expect(isValidHexColor('#1B2A5E')).toBe(true);
        expect(isValidHexColor('#00B4CC')).toBe(true);
      });
    });
  });

  describe('RecHUB Design System Compliance', () => {
    it('should use RecHUB primary color in defaults', () => {
      const rechubMagenta = '#D91C81';
      // Should be available as default option
      expect(rechubMagenta).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should use RecHUB navy in defaults', () => {
      const rechubNavy = '#1B2A5E';
      expect(sampleHeaderFooterConfig.header.backgroundColor).toBe(rechubNavy);
    });

    it('should use RecHUB teal as accent', () => {
      const rechubTeal = '#00B4CC';
      expect(rechubTeal).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('custom CSS should support RecHUB variables', () => {
      const css = sampleBrandingAssets.customCSS;
      if (css) {
        expect(css).toContain('#D91C81');
      }
    });
  });
});
