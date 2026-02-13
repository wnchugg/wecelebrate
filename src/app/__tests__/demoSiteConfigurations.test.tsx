/**
 * Demo Site Configurations Tests
 * 
 * Tests all demo sites created for stakeholder review:
 * - Event Gifting (Serial Card)
 * - Event Gifting (Ship to Store)
 * - Service Award (5 Year)
 * - Service Award Celebration (10 Year)
 * - Wellness Program
 * 
 * Validates:
 * - Configuration integrity
 * - Validation methods
 * - Shipping options
 * - Branding consistency
 * - Multi-language support
 * - Landing page setup
 * - Welcome page setup
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { SiteProvider } from '../context/SiteContext';
import { LanguageProvider } from '../context/LanguageContext';

// Mock demo site data based on seed-demo-sites.tsx
const demoSites = {
  eventSerialCard: {
    id: 'demo-event-serial-card',
    slug: 'demo-event-serial-card',
    name: 'Conference 2025 Attendee Gift',
    description: 'Event Gifting - Serial Card Access',
    clientId: 'client-demo-stakeholder',
    status: 'active' as const,
    settings: {
      skipLandingPage: false,
      validationMethod: 'serialCard' as const,
      showWelcomeMessage: true,
      welcomeMessageType: 'letter' as const,
      welcomeMessage: 'Thank you for attending our annual conference!',
      ceoName: 'Jennifer Martinez',
      ceoTitle: 'Chief Executive Officer',
      ceoImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop',
      shippingOptions: ['company_ship'] as const,
      showPricing: false,
      enableCelebrations: false,
      catalogTitle: 'Choose Your Conference Gift',
      catalogDescription: 'Select from our curated collection of premium gifts',
      languages: ['en', 'es', 'fr'],
      defaultLanguage: 'en' as const
    },
    branding: {
      primaryColor: '#D91C81',
      secondaryColor: '#1B2A5E',
      accentColor: '#00B4CC',
      logoUrl: ''
    },
    type: 'event-gifting' as const
  },
  eventShipToStore: {
    id: 'demo-event-ship-to-store',
    slug: 'demo-event-ship-to-store',
    name: 'Regional Office Appreciation',
    description: 'Event Gifting - Ship to Store/Office',
    clientId: 'client-demo-stakeholder',
    status: 'active' as const,
    settings: {
      skipLandingPage: false,
      validationMethod: 'email' as const,
      showWelcomeMessage: true,
      welcomeMessageType: 'letter' as const,
      welcomeMessage: 'Thank you for your continued dedication to our team.',
      ceoName: 'Michael Chen',
      ceoTitle: 'Regional Director',
      ceoImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop',
      shippingOptions: ['store_pickup'] as const,
      showPricing: false,
      enableCelebrations: false,
      catalogTitle: 'Select Your Gift',
      catalogDescription: 'Available for pickup at your office location',
      languages: ['en', 'es'],
      defaultLanguage: 'en' as const
    },
    branding: {
      primaryColor: '#1B2A5E',
      secondaryColor: '#D91C81',
      accentColor: '#00B4CC',
      logoUrl: ''
    },
    type: 'event-gifting' as const
  },
  serviceAward5Year: {
    id: 'demo-service-award',
    slug: 'service-award',
    name: '5 Year Service Award',
    description: 'Service Award Recognition',
    clientId: 'client-demo-stakeholder',
    status: 'active' as const,
    settings: {
      skipLandingPage: false,
      validationMethod: 'magicLink' as const,
      showWelcomeMessage: true,
      welcomeMessageType: 'letter' as const,
      welcomeMessage: 'Congratulations on reaching your 5-year milestone!',
      ceoName: 'Sarah Williams',
      ceoTitle: 'Chief People Officer',
      ceoImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=800&fit=crop',
      shippingOptions: ['company_ship', 'store_pickup'] as const,
      showPricing: false,
      enableCelebrations: false,
      catalogTitle: '5 Year Award Selection',
      catalogDescription: 'Choose from our premium collection',
      languages: ['en'],
      defaultLanguage: 'en' as const
    },
    branding: {
      primaryColor: '#00B4CC',
      secondaryColor: '#1B2A5E',
      accentColor: '#D91C81',
      logoUrl: ''
    },
    type: 'service-awards' as const
  },
  serviceAward10Year: {
    id: 'demo-service-award-celebration',
    slug: 'service-award-celebration',
    name: '10 Year Anniversary Celebration',
    description: 'Service Award with Celebrations',
    clientId: 'client-demo-stakeholder',
    status: 'active' as const,
    settings: {
      skipLandingPage: false,
      validationMethod: 'employeeCode' as const,
      showWelcomeMessage: true,
      welcomeMessageType: 'letter' as const,
      welcomeMessage: 'Congratulations on your 10-year anniversary!',
      ceoName: 'David Thompson',
      ceoTitle: 'Chief Executive Officer',
      ceoImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=800&fit=crop',
      shippingOptions: ['company_ship', 'store_pickup'] as const,
      showPricing: false,
      enableCelebrations: true,
      catalogTitle: '10 Year Celebration Selection',
      catalogDescription: 'Choose your milestone gift and celebrate with eCards',
      languages: ['en', 'es'],
      defaultLanguage: 'en' as const
    },
    branding: {
      primaryColor: '#D91C81',
      secondaryColor: '#1B2A5E',
      accentColor: '#00B4CC',
      logoUrl: ''
    },
    type: 'service-awards' as const
  },
  wellnessProgram: {
    id: 'demo-wellness-program',
    slug: 'wellness-program',
    name: 'Employee Wellness Program',
    description: 'Health and Wellness Benefits',
    clientId: 'client-demo-stakeholder',
    status: 'active' as const,
    settings: {
      skipLandingPage: false,
      validationMethod: 'ssoToken' as const,
      showWelcomeMessage: true,
      welcomeMessageType: 'video' as const,
      welcomeMessage: 'Your health and wellbeing matter to us.',
      ceoName: 'Lisa Anderson',
      ceoTitle: 'Chief Wellness Officer',
      ceoImage: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&h=800&fit=crop',
      shippingOptions: ['company_ship', 'self_ship', 'store_pickup'] as const,
      showPricing: true,
      enableCelebrations: false,
      catalogTitle: 'Wellness Product Selection',
      catalogDescription: 'Choose from health, fitness, and wellness products',
      languages: ['en', 'es', 'fr'],
      defaultLanguage: 'en' as const
    },
    branding: {
      primaryColor: '#00B4CC',
      secondaryColor: '#1B2A5E',
      accentColor: '#D91C81',
      logoUrl: ''
    },
    type: 'custom' as const
  }
};

describe('Demo Site Configurations', () => {
  describe('Configuration Integrity', () => {
    it('should have all required demo sites defined', () => {
      expect(demoSites.eventSerialCard).toBeDefined();
      expect(demoSites.eventShipToStore).toBeDefined();
      expect(demoSites.serviceAward5Year).toBeDefined();
      expect(demoSites.serviceAward10Year).toBeDefined();
      expect(demoSites.wellnessProgram).toBeDefined();
    });

    it('should have unique IDs for all sites', () => {
      const ids = Object.values(demoSites).map(site => site.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique slugs for all sites', () => {
      const slugs = Object.values(demoSites).map(site => site.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('should all belong to demo stakeholder client', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.clientId).toBe('client-demo-stakeholder');
      });
    });

    it('should all be in active status', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.status).toBe('active');
      });
    });
  });

  describe('Validation Methods', () => {
    it('Event Serial Card should use serialCard validation', () => {
      expect(demoSites.eventSerialCard.settings.validationMethod).toBe('serialCard');
    });

    it('Event Ship to Store should use email validation', () => {
      expect(demoSites.eventShipToStore.settings.validationMethod).toBe('email');
    });

    it('5 Year Service Award should use magicLink validation', () => {
      expect(demoSites.serviceAward5Year.settings.validationMethod).toBe('magicLink');
    });

    it('10 Year Service Award should use employeeCode validation', () => {
      expect(demoSites.serviceAward10Year.settings.validationMethod).toBe('employeeCode');
    });

    it('Wellness Program should use ssoToken validation', () => {
      expect(demoSites.wellnessProgram.settings.validationMethod).toBe('ssoToken');
    });

    it('should cover all 4 validation methods', () => {
      const validationMethods = Object.values(demoSites).map(
        site => site.settings.validationMethod
      );
      const uniqueMethods = new Set(validationMethods);
      
      expect(uniqueMethods.has('serialCard')).toBe(true);
      expect(uniqueMethods.has('email')).toBe(true);
      expect(uniqueMethods.has('magicLink')).toBe(true);
      expect(uniqueMethods.has('employeeCode')).toBe(true);
      expect(uniqueMethods.has('ssoToken')).toBe(true);
    });
  });

  describe('Shipping Options', () => {
    it('Event Serial Card should only allow company shipping', () => {
      expect(demoSites.eventSerialCard.settings.shippingOptions).toEqual(['company_ship']);
    });

    it('Event Ship to Store should only allow store pickup', () => {
      expect(demoSites.eventShipToStore.settings.shippingOptions).toEqual(['store_pickup']);
    });

    it('5 Year Service Award should allow company ship and store pickup', () => {
      expect(demoSites.serviceAward5Year.settings.shippingOptions).toContain('company_ship');
      expect(demoSites.serviceAward5Year.settings.shippingOptions).toContain('store_pickup');
      expect(demoSites.serviceAward5Year.settings.shippingOptions.length).toBe(2);
    });

    it('10 Year Service Award should allow company ship and store pickup', () => {
      expect(demoSites.serviceAward10Year.settings.shippingOptions).toContain('company_ship');
      expect(demoSites.serviceAward10Year.settings.shippingOptions).toContain('store_pickup');
      expect(demoSites.serviceAward10Year.settings.shippingOptions.length).toBe(2);
    });

    it('Wellness Program should allow all shipping options', () => {
      expect(demoSites.wellnessProgram.settings.shippingOptions).toContain('company_ship');
      expect(demoSites.wellnessProgram.settings.shippingOptions).toContain('self_ship');
      expect(demoSites.wellnessProgram.settings.shippingOptions).toContain('store_pickup');
      expect(demoSites.wellnessProgram.settings.shippingOptions.length).toBe(3);
    });

    it('all sites should have at least one shipping option', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.settings.shippingOptions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('RecHUB Branding Compliance', () => {
    const validColors = ['#D91C81', '#1B2A5E', '#00B4CC'];

    it('all sites should use RecHUB colors', () => {
      Object.values(demoSites).forEach(site => {
        expect(validColors).toContain(site.branding.primaryColor);
        expect(validColors).toContain(site.branding.secondaryColor);
        expect(validColors).toContain(site.branding.accentColor);
      });
    });

    it('Event Serial Card should use magenta primary', () => {
      expect(demoSites.eventSerialCard.branding.primaryColor).toBe('#D91C81');
    });

    it('Event Ship to Store should use navy primary', () => {
      expect(demoSites.eventShipToStore.branding.primaryColor).toBe('#1B2A5E');
    });

    it('5 Year Service Award should use teal primary', () => {
      expect(demoSites.serviceAward5Year.branding.primaryColor).toBe('#00B4CC');
    });

    it('10 Year Service Award should use magenta primary', () => {
      expect(demoSites.serviceAward10Year.branding.primaryColor).toBe('#D91C81');
    });

    it('Wellness Program should use teal primary', () => {
      expect(demoSites.wellnessProgram.branding.primaryColor).toBe('#00B4CC');
    });

    it('all colors should be unique across a site', () => {
      Object.values(demoSites).forEach(site => {
        const colors = [
          site.branding.primaryColor,
          site.branding.secondaryColor,
          site.branding.accentColor
        ];
        const uniqueColors = new Set(colors);
        expect(uniqueColors.size).toBe(3);
      });
    });
  });

  describe('Multi-Language Support', () => {
    it('Event Serial Card should support 3 languages', () => {
      expect(demoSites.eventSerialCard.settings.languages).toHaveLength(3);
      expect(demoSites.eventSerialCard.settings.languages).toContain('en');
      expect(demoSites.eventSerialCard.settings.languages).toContain('es');
      expect(demoSites.eventSerialCard.settings.languages).toContain('fr');
    });

    it('Event Ship to Store should support 2 languages', () => {
      expect(demoSites.eventShipToStore.settings.languages).toHaveLength(2);
      expect(demoSites.eventShipToStore.settings.languages).toContain('en');
      expect(demoSites.eventShipToStore.settings.languages).toContain('es');
    });

    it('5 Year Service Award should support English only', () => {
      expect(demoSites.serviceAward5Year.settings.languages).toHaveLength(1);
      expect(demoSites.serviceAward5Year.settings.languages).toContain('en');
    });

    it('10 Year Service Award should support 2 languages', () => {
      expect(demoSites.serviceAward10Year.settings.languages).toHaveLength(2);
      expect(demoSites.serviceAward10Year.settings.languages).toContain('en');
      expect(demoSites.serviceAward10Year.settings.languages).toContain('es');
    });

    it('Wellness Program should support 3 languages', () => {
      expect(demoSites.wellnessProgram.settings.languages).toHaveLength(3);
      expect(demoSites.wellnessProgram.settings.languages).toContain('en');
      expect(demoSites.wellnessProgram.settings.languages).toContain('es');
      expect(demoSites.wellnessProgram.settings.languages).toContain('fr');
    });

    it('all sites should default to English', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.settings.defaultLanguage).toBe('en');
      });
    });

    it('all sites should include English in supported languages', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.settings.languages).toContain('en');
      });
    });
  });

  describe('Welcome Page Configuration', () => {
    it('all sites should show welcome messages', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.settings.showWelcomeMessage).toBe(true);
      });
    });

    it('Event sites should use letter format', () => {
      expect(demoSites.eventSerialCard.settings.welcomeMessageType).toBe('letter');
      expect(demoSites.eventShipToStore.settings.welcomeMessageType).toBe('letter');
    });

    it('Service award sites should use letter format', () => {
      expect(demoSites.serviceAward5Year.settings.welcomeMessageType).toBe('letter');
      expect(demoSites.serviceAward10Year.settings.welcomeMessageType).toBe('letter');
    });

    it('Wellness Program should use video format', () => {
      expect(demoSites.wellnessProgram.settings.welcomeMessageType).toBe('video');
    });

    it('all sites should have welcome message text', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.settings.welcomeMessage).toBeTruthy();
        expect(site.settings.welcomeMessage.length).toBeGreaterThan(0);
      });
    });

    it('all sites should have CEO/sender information', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.settings.ceoName).toBeTruthy();
        expect(site.settings.ceoTitle).toBeTruthy();
        expect(site.settings.ceoImage).toBeTruthy();
      });
    });

    it('CEO images should be valid URLs', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.settings.ceoImage).toMatch(/^https:\/\//);
      });
    });
  });

  describe('Landing Page Configuration', () => {
    it('no sites should skip landing page', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.settings.skipLandingPage).toBe(false);
      });
    });

    it('all sites should have catalog titles', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.settings.catalogTitle).toBeTruthy();
        expect(site.settings.catalogTitle.length).toBeGreaterThan(0);
      });
    });

    it('all sites should have catalog descriptions', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.settings.catalogDescription).toBeTruthy();
        expect(site.settings.catalogDescription.length).toBeGreaterThan(0);
      });
    });

    it('catalog titles should be descriptive', () => {
      expect(demoSites.eventSerialCard.settings.catalogTitle).toContain('Conference');
      expect(demoSites.serviceAward5Year.settings.catalogTitle).toContain('5 Year');
      expect(demoSites.serviceAward10Year.settings.catalogTitle).toContain('10 Year');
      expect(demoSites.wellnessProgram.settings.catalogTitle).toContain('Wellness');
    });
  });

  describe('Celebrations Feature', () => {
    it('event sites should not enable celebrations', () => {
      expect(demoSites.eventSerialCard.settings.enableCelebrations).toBe(false);
      expect(demoSites.eventShipToStore.settings.enableCelebrations).toBe(false);
    });

    it('5 Year Service Award should not enable celebrations', () => {
      expect(demoSites.serviceAward5Year.settings.enableCelebrations).toBe(false);
    });

    it('10 Year Service Award should enable celebrations', () => {
      expect(demoSites.serviceAward10Year.settings.enableCelebrations).toBe(true);
    });

    it('Wellness Program should not enable celebrations', () => {
      expect(demoSites.wellnessProgram.settings.enableCelebrations).toBe(false);
    });

    it('only one demo site should have celebrations enabled', () => {
      const sitesWithCelebrations = Object.values(demoSites).filter(
        site => site.settings.enableCelebrations
      );
      expect(sitesWithCelebrations).toHaveLength(1);
      expect(sitesWithCelebrations[0].slug).toBe('service-award-celebration');
    });
  });

  describe('Pricing Display', () => {
    it('event sites should not show pricing', () => {
      expect(demoSites.eventSerialCard.settings.showPricing).toBe(false);
      expect(demoSites.eventShipToStore.settings.showPricing).toBe(false);
    });

    it('service award sites should not show pricing', () => {
      expect(demoSites.serviceAward5Year.settings.showPricing).toBe(false);
      expect(demoSites.serviceAward10Year.settings.showPricing).toBe(false);
    });

    it('Wellness Program should show pricing', () => {
      expect(demoSites.wellnessProgram.settings.showPricing).toBe(true);
    });

    it('only one site should show pricing', () => {
      const sitesWithPricing = Object.values(demoSites).filter(
        site => site.settings.showPricing
      );
      expect(sitesWithPricing).toHaveLength(1);
      expect(sitesWithPricing[0].slug).toBe('wellness-program');
    });
  });

  describe('Site Types', () => {
    it('should categorize event sites correctly', () => {
      expect(demoSites.eventSerialCard.type).toBe('event-gifting');
      expect(demoSites.eventShipToStore.type).toBe('event-gifting');
    });

    it('should categorize service award sites correctly', () => {
      expect(demoSites.serviceAward5Year.type).toBe('service-awards');
      expect(demoSites.serviceAward10Year.type).toBe('service-awards');
    });

    it('should categorize wellness program as custom', () => {
      expect(demoSites.wellnessProgram.type).toBe('custom');
    });

    it('should have mix of site types', () => {
      const types = Object.values(demoSites).map(site => site.type);
      expect(types).toContain('event-gifting');
      expect(types).toContain('service-awards');
      expect(types).toContain('custom');
    });
  });

  describe('Slug Format', () => {
    it('all slugs should be lowercase', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.slug).toBe(site.slug.toLowerCase());
      });
    });

    it('all slugs should use hyphens', () => {
      Object.values(demoSites).forEach(site => {
        if (site.slug.length > 5) { // Only check multi-word slugs
          expect(site.slug).toMatch(/-/);
        }
      });
    });

    it('slugs should not contain spaces', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.slug).not.toMatch(/\s/);
      });
    });

    it('service-award slug should match stakeholder review expectation', () => {
      // From stakeholder review update, we renamed demo-service-award to service-award
      expect(demoSites.serviceAward5Year.slug).toBe('service-award');
    });
  });

  describe('Business Rules Consistency', () => {
    it('event sites should not allow self-shipping', () => {
      expect(demoSites.eventSerialCard.settings.shippingOptions).not.toContain('self_ship');
      expect(demoSites.eventShipToStore.settings.shippingOptions).not.toContain('self_ship');
    });

    it('service award sites should support multiple shipping options', () => {
      expect(demoSites.serviceAward5Year.settings.shippingOptions.length).toBeGreaterThan(1);
      expect(demoSites.serviceAward10Year.settings.shippingOptions.length).toBeGreaterThan(1);
    });

    it('sites with celebrations should be service awards', () => {
      const sitesWithCelebrations = Object.values(demoSites).filter(
        site => site.settings.enableCelebrations
      );
      sitesWithCelebrations.forEach(site => {
        expect(site.type).toBe('service-awards');
      });
    });

    it('sites without pricing should be recognition-based', () => {
      const sitesWithoutPricing = Object.values(demoSites).filter(
        site => !site.settings.showPricing
      );
      sitesWithoutPricing.forEach(site => {
        expect(['event-gifting', 'service-awards']).toContain(site.type);
      });
    });
  });

  describe('Data Completeness', () => {
    it('all sites should have complete required fields', () => {
      Object.values(demoSites).forEach(site => {
        // Core fields
        expect(site.id).toBeTruthy();
        expect(site.slug).toBeTruthy();
        expect(site.name).toBeTruthy();
        expect(site.description).toBeTruthy();
        expect(site.clientId).toBeTruthy();
        expect(site.status).toBeTruthy();
        
        // Settings
        expect(site.settings).toBeDefined();
        expect(site.settings.validationMethod).toBeTruthy();
        expect(site.settings.shippingOptions).toBeDefined();
        expect(site.settings.languages).toBeDefined();
        expect(site.settings.defaultLanguage).toBeTruthy();
        
        // Branding
        expect(site.branding).toBeDefined();
        expect(site.branding.primaryColor).toBeTruthy();
        expect(site.branding.secondaryColor).toBeTruthy();
        expect(site.branding.accentColor).toBeTruthy();
      });
    });

    it('all sites should have meaningful descriptions', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.description.length).toBeGreaterThan(10);
      });
    });

    it('all sites should have meaningful names', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.name.length).toBeGreaterThan(5);
      });
    });
  });

  describe('Stakeholder Review Alignment', () => {
    it('should include service-award slug as documented', () => {
      const serviceAwardSite = Object.values(demoSites).find(
        site => site.slug === 'service-award'
      );
      expect(serviceAwardSite).toBeDefined();
      expect(serviceAwardSite?.name).toContain('5 Year');
    });

    it('should include service-award-celebration slug as documented', () => {
      const celebrationSite = Object.values(demoSites).find(
        site => site.slug === 'service-award-celebration'
      );
      expect(celebrationSite).toBeDefined();
      expect(celebrationSite?.name).toContain('10 Year');
    });

    it('should demonstrate all validation methods', () => {
      const methods = new Set(
        Object.values(demoSites).map(site => site.settings.validationMethod)
      );
      // Should showcase multiple validation methods
      expect(methods.size).toBeGreaterThanOrEqual(4);
    });

    it('should demonstrate variety in shipping options', () => {
      const hasCompanyShip = Object.values(demoSites).some(
        site => [...site.settings.shippingOptions].includes('company_ship')
      );
      const hasStorePickup = Object.values(demoSites).some(
        site => [...site.settings.shippingOptions].includes('store_pickup')
      );
      const hasSelfShip = Object.values(demoSites).some(
        site => [...site.settings.shippingOptions].includes('self_ship')
      );
      
      expect(hasCompanyShip).toBe(true);
      expect(hasStorePickup).toBe(true);
      expect(hasSelfShip).toBe(true);
    });

    it('should demonstrate multi-language capabilities', () => {
      const hasMultiLanguage = Object.values(demoSites).some(
        site => site.settings.languages.length > 1
      );
      expect(hasMultiLanguage).toBe(true);
    });
  });
});

describe('Demo Sites - Advanced Scenarios', () => {
  describe('Configuration Combinations', () => {
    it('should have unique validation + shipping combinations', () => {
      const combinations = Object.values(demoSites).map(site => ({
        validation: site.settings.validationMethod,
        shipping: [...site.settings.shippingOptions].sort().join(',')
      }));
      
      // Check for variety in combinations
      const uniqueCombos = new Set(
        combinations.map(c => `${c.validation}:${c.shipping}`)
      );
      expect(uniqueCombos.size).toBeGreaterThan(3);
    });

    it('should showcase different language + validation combinations', () => {
      const combos = Object.values(demoSites).map(site => ({
        validation: site.settings.validationMethod,
        languages: site.settings.languages.length
      }));
      
      // Should have variety
      const langCounts = combos.map(c => c.languages);
      expect(Math.max(...langCounts) - Math.min(...langCounts)).toBeGreaterThan(0);
    });
  });

  describe('User Experience Consistency', () => {
    it('all sites should provide clear catalog context', () => {
      Object.values(demoSites).forEach(site => {
        const hasContextClues = 
          site.settings.catalogTitle.length > 0 &&
          site.settings.catalogDescription.length > 0 &&
          site.name.length > 0;
        expect(hasContextClues).toBe(true);
      });
    });

    it('welcome messages should be personalized', () => {
      Object.values(demoSites).forEach(site => {
        const hasCEOInfo = 
          site.settings.ceoName.length > 0 &&
          site.settings.ceoTitle.length > 0 &&
          site.settings.ceoImage.length > 0;
        expect(hasCEOInfo).toBe(true);
      });
    });
  });

  describe('Integration Readiness', () => {
    it('all sites should be ready for database seeding', () => {
      Object.values(demoSites).forEach(site => {
        // Check that all required fields for KV store are present
        expect(site.id).toMatch(/^demo-/);
        expect(site.clientId).toMatch(/^client-/);
        expect(site.status).toBe('active');
      });
    });

    it('all sites should have proper ID format', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.id).toMatch(/^demo-[a-z0-9-]+$/);
      });
    });

    it('all sites should reference valid client', () => {
      Object.values(demoSites).forEach(site => {
        expect(site.clientId).toBe('client-demo-stakeholder');
      });
    });
  });
});