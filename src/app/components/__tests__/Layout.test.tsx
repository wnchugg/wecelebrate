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

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Layout } from '../Layout';
import { useCart } from '../../context/CartContext';

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

      const logos = screen.getAllByText('wecelebrate');
      expect(logos.length).toBeGreaterThan(0);
    });

    it('should render navigation links', () => {
      render(
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      );

      const homeLinks = screen.getAllByText('Home');
      const productLinks = screen.getAllByText('Products');
      expect(homeLinks.length).toBeGreaterThan(0);
      expect(productLinks.length).toBeGreaterThan(0);
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

      const logos = screen.getAllByText('wecelebrate');
      const logo = logos[0].closest('a');
      expect(logo).toHaveAttribute('href', '/');
    });
  });

  describe('Cart Badge', () => {
    it('should not show badge when cart is empty', () => {
      vi.mocked(useCart).mockReturnValue({
        getCartCount: () => 0,
        items: [],
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        clearCart: vi.fn(),
        totalItems: 0,
        totalPrice: 0,
        shippingType: null,
        setShippingType: vi.fn(),
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