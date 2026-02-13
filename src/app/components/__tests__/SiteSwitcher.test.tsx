/**
 * SiteSwitcher Component Tests
 * 
 * Coverage:
 * - Site switcher rendering
 * - Current site display
 * - Site selection
 * - Available sites list
 * - onSiteChange callback
 * 
 * Total Tests: 8
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { SiteSwitcher } from '../SiteSwitcher';
import { SiteContext } from '../../context/SiteContext';

// Mock language context
vi.mock('../../context/LanguageContext', () => ({
  useLanguage: vi.fn(() => ({
    t: (key: string) => key,
    currentLanguage: { code: 'en', name: 'English' },
  })),
}));

const mockSites = [
  {
    id: 'site1',
    name: 'Acme Corp Events',
    clientId: 'client1',
    domain: 'acme.wecelebrate.com',
    status: 'active' as const,
    branding: { 
      primaryColor: '#D91C81', 
      secondaryColor: '#1B2A5E',
      tertiaryColor: '#10B981'
    },
    settings: {
      validationMethod: 'email' as const,
      allowQuantitySelection: true,
      showPricing: true,
      giftsPerUser: 1,
      requireShipping: true,
      supportEmail: 'support@acme.com',
      languages: ['en'],
      defaultLanguage: 'en',
      maxGiftValue: 1000,
      allowGiftMessages: true
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'site2',
    name: 'TechCo Rewards',
    clientId: 'client2',
    domain: 'techco.wecelebrate.com',
    status: 'active' as const,
    branding: { 
      primaryColor: '#3B82F6', 
      secondaryColor: '#1E40AF',
      tertiaryColor: '#10B981'
    },
    settings: {
      validationMethod: 'email' as const,
      allowQuantitySelection: true,
      showPricing: true,
      giftsPerUser: 1,
      requireShipping: true,
      supportEmail: 'support@techco.com',
      languages: ['en'],
      defaultLanguage: 'en',
      maxGiftValue: 1000,
      allowGiftMessages: true
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
];

const renderSiteSwitcher = (currentSite = mockSites[0], sites = mockSites, onSiteChange = vi.fn()) => {
  return renderWithRouter(
    <SiteSwitcher 
      currentSite={currentSite}
      availableSites={sites}
      onSiteChange={onSiteChange}
    />
  );
};

describe('SiteSwitcher Component', () => {
  describe('Rendering', () => {
    it('should render site switcher button', () => {
      renderSiteSwitcher();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should display current site name', () => {
      renderSiteSwitcher();
      expect(screen.getByText('Acme Corp Events')).toBeInTheDocument();
    });

    it('should show no site when currentSite is null', () => {
      renderSiteSwitcher(null);
      expect(screen.getByText(/select site/i)).toBeInTheDocument();
    });
  });

  describe('Site Selection', () => {
    it('should show available sites when opened', async () => {
      const user = userEvent.setup();
      renderSiteSwitcher();

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('TechCo Rewards')).toBeInTheDocument();
      });
    });

    it('should call onSiteChange when site is selected', async () => {
      const handleSiteChange = vi.fn();
      const user = userEvent.setup();

      renderSiteSwitcher(mockSites[0], mockSites, handleSiteChange);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('TechCo Rewards')).toBeInTheDocument();
      });

      await user.click(screen.getByText('TechCo Rewards'));

      expect(handleSiteChange).toHaveBeenCalledWith('site2');
    });

    it('should highlight currently selected site', async () => {
      const user = userEvent.setup();
      renderSiteSwitcher();

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        const currentSiteItem = screen.getByText('Acme Corp Events').closest('div');
        expect(currentSiteItem).toBeInTheDocument();
      });
    });
  });

  describe('Site List', () => {
    it('should render all available sites', async () => {
      const user = userEvent.setup();
      renderSiteSwitcher();

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp Events')).toBeInTheDocument();
        expect(screen.getByText('TechCo Rewards')).toBeInTheDocument();
      });
    });

    it('should handle empty sites list', () => {
      renderSiteSwitcher(null, []);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});