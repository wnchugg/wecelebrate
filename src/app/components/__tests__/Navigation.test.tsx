/**
 * Navigation Component Tests
 * 
 * Coverage:
 * - Navigation rendering
 * - Desktop vs mobile menu
 * - Active link highlighting
 * - Cart badge
 * - Logo link
 * 
 * Total Tests: 9
 */

import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter } from '@/test/helpers';
import { Navigation } from '../Navigation';

const renderNavigation = (cartItemCount = 0, pathname = '/') => {
  return renderWithRouter(
    <Navigation cartItemCount={cartItemCount} />
  );
};

describe('Navigation Component', () => {
  describe('Rendering', () => {
    it('should render navigation', () => {
      renderNavigation();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render logo with brand name', () => {
      renderNavigation();
      expect(screen.getByText('wecelebrate')).toBeInTheDocument();
    });

    it('should render all navigation links', () => {
      renderNavigation();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Browse Events')).toBeInTheDocument();
      expect(screen.getByText('Create Event')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Cart Badge', () => {
    it('should show cart item count when items exist', () => {
      renderNavigation(3);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should not show badge when cart is empty', () => {
      renderNavigation(0);
      const badges = screen.queryAllByText('0');
      expect(badges).toHaveLength(0);
    });

    it('should display correct count for multiple items', () => {
      renderNavigation(12);
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  describe('Active Links', () => {
    it('should highlight active link', () => {
      renderNavigation(0, '/dashboard');
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('bg-purple-50');
    });

    it('should not highlight inactive links', () => {
      renderNavigation(0, '/dashboard');
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).not.toHaveClass('bg-purple-50');
    });
  });

  describe('Mobile Menu', () => {
    it('should render mobile menu trigger', () => {
      renderNavigation();
      const menuButton = screen.getByRole('button', { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
    });
  });
});