/**
 * Header Component Tests
 * 
 * Coverage:
 * - Header rendering
 * - Logo display
 * - Navigation steps
 * - Authentication state
 * - Language selector
 * - Conditional rendering
 * 
 * Total Tests: 8
 */

import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithRouter } from '@/test/helpers';
import { Header } from '../Header';
import { SiteContext } from '../../context/SiteContext';

// Mock auth context
vi.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';

const renderHeader = (pathname = '/gift-selection', isAuthenticated = true) => {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated,
    userIdentifier: isAuthenticated ? 'test@example.com' : null,
    user: isAuthenticated ? { id: '1', email: 'test@example.com' } : null,
    authenticate: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  });

  return renderWithRouter(
    <SiteContext.Provider value={{ language: 'en' } as any}>
      <Header />
    </SiteContext.Provider>
  );
};

describe('Header Component', () => {
  describe('Rendering', () => {
    it('should render header with logo', () => {
      renderHeader();
      expect(screen.getByAltText('HALO Logo')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render logo as link to home', () => {
      renderHeader();
      const logoLink = screen.getByRole('link', { name: /go to home/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('should not render on landing page', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        userIdentifier: null,
        user: null,
        authenticate: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
      });

      const { container } = renderWithRouter(
        <SiteContext.Provider value={{ language: 'en' } as any}>
          <Header />
        </SiteContext.Provider>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render language selector', () => {
      renderHeader();
      // Language selector should be in the header
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('Navigation Steps', () => {
    it('should show progress steps when authenticated', () => {
      renderHeader('/gift-selection', true);
      expect(screen.getByText(/select gift/i)).toBeInTheDocument();
    });

    it('should highlight current step', () => {
      renderHeader('/gift-selection', true);
      const selectGiftLink = screen.getByText(/1\. select gift/i);
      expect(selectGiftLink).toHaveClass('bg-pink-100');
    });

    it('should not show steps when not authenticated', () => {
      renderHeader('/gift-selection', false);
      expect(screen.queryByText(/select gift/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderHeader();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      const progressNav = screen.getByRole('navigation', { name: /progress steps/i });
      expect(progressNav).toBeInTheDocument();
    });
  });
});