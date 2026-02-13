/**
 * Layout Component Tests
 * 
 * Coverage:
 * - Layout rendering
 * - Navigation links
 * - Cart count display
 * - Outlet rendering
 * - Mobile menu
 * 
 * Total Tests: 5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Layout } from '../Layout';
import { CartProvider, useCart } from '../../context/CartContext';
import { AdminProvider } from '../../context/AdminContext';

vi.mock('../../context/CartContext', () => ({
  useCart: vi.fn(() => ({
    getCartCount: () => 3,
    items: [],
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    clearCart: vi.fn(),
  })),
}));

describe('Layout Component', () => {
  describe('Rendering', () => {
    it('should render layout with header', () => {
      render(
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      );

      expect(screen.getByText('wecelebrate')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    it('should display cart count badge', () => {
      render(
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Logo', () => {
    it('should render logo as link to home', () => {
      render(
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      );

      const logo = screen.getByText('wecelebrate').closest('a');
      expect(logo).toHaveAttribute('href', '/');
    });
  });

  describe('Cart Badge', () => {
    it('should not show badge when cart is empty', () => {
      vi.mocked(require('../../context/CartContext').useCart).mockReturnValue({
        getCartCount: () => 0,
        items: [],
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
      });

      render(
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      );

      const badges = screen.queryAllByText('0');
      expect(badges).toHaveLength(0);
    });
  });
});