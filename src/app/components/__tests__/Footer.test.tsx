/**
 * Footer Component Tests
 * 
 * Coverage:
 * - Footer rendering
 * - Navigation links
 * - Copyright text
 * - Accessibility
 * 
 * Total Tests: 7
 */

import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter } from '@/test/helpers';
import { Footer } from '../Footer';

vi.mock('../../hooks/useSiteContent', () => ({
  useSiteContent: () => ({
    getTranslatedContent: vi.fn((_key: string, fallback?: string) => fallback || ''),
  }),
}));

const renderFooter = () => {
  return renderWithRouter(
    <Footer />
  );
};

describe('Footer Component', () => {
  describe('Rendering', () => {
    it('should render footer', () => {
      renderFooter();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should render copyright text', () => {
      renderFooter();
      expect(screen.getByText(/© 2026 HALO/i)).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should render contact link', () => {
      renderFooter();
      expect(screen.getByText(/contact us/i)).toBeInTheDocument();
    });

    it('should render cookie policy link', () => {
      renderFooter();
      expect(screen.getByText(/cookie policy/i)).toBeInTheDocument();
    });

    it('should render privacy policy link', () => {
      renderFooter();
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
    });

    it('should render privacy settings link', () => {
      renderFooter();
      const settingsLink = screen.getByRole('link', { name: /privacy settings/i });
      expect(settingsLink).toHaveAttribute('href', '/privacy-settings');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderFooter();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /footer navigation/i })).toBeInTheDocument();
    });
  });
});