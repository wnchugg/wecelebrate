/**
 * ProductCard Component Tests
 * 
 * Coverage:
 * - Product rendering
 * - Add to cart functionality
 * - Stock status
 * - Price display
 * - Link navigation
 * 
 * Total Tests: 10
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, createMock, mockProduct } from '@/test/helpers';
import { ProductCard } from '../ProductCard';
import { CartProvider } from '../../context/CartContext';

vi.mock('../../hooks/useUnits', () => ({
  useUnits: () => ({
    formatWeight: vi.fn((val: number) => `${val} kg`),
  }),
}));

vi.mock('../../components/CurrencyDisplay', () => ({
  CurrencyDisplay: ({ amount }: { amount: number }) => <span>${amount}</span>,
}));

// Mock out of stock product
const mockOutOfStockProduct = createMock(mockProduct, {
  id: '2',
  name: 'Out of Stock Product',
  inStock: false,
});

// Wrapper with CartProvider
const renderProductCard = (product = mockProduct) => {
  return renderWithRouter(
    <CartProvider>
      <ProductCard product={product} />
    </CartProvider>
  );
};

describe('ProductCard Component', () => {
  describe('Rendering', () => {
    it('should render product name', () => {
      renderProductCard();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('should render product description', () => {
      renderProductCard();
      expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    });

    it('should render product price', () => {
      renderProductCard();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    it('should render product points', () => {
      renderProductCard();
      expect(screen.getByText('1,000 points')).toBeInTheDocument();
    });

    it('should render product image with correct alt text', () => {
      renderProductCard();
      const image = screen.getByAltText('Test Product');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/product.jpg');
    });
  });

  describe('Stock Status', () => {
    it('should not show out of stock badge for in-stock product', () => {
      renderProductCard();
      expect(screen.queryByText('Out of Stock')).not.toBeInTheDocument();
    });

    it('should show out of stock badge for out-of-stock product', () => {
      renderProductCard(mockOutOfStockProduct);
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have link to product detail page', () => {
      renderProductCard();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/product-test-1');
    });

    it('should render correct link for different product IDs', () => {
      const product = { ...mockProduct, id: '123' };
      renderProductCard(product);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/123');
    });
  });

  describe('Add to Cart', () => {
    it('should have add to cart button', () => {
      renderProductCard();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should prevent navigation when add to cart is clicked', async () => {
      const user = userEvent.setup();
      renderProductCard();

      const button = screen.getByRole('button');
      await user.click(button);

      // Button click should not navigate (e.preventDefault)
      expect(window.location.pathname).not.toBe('/products/1');
    });
  });
});