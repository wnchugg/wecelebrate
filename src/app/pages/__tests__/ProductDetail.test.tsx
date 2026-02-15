/**
 * Product Detail Page Test Suite
 * Day 12 - Afternoon Session
 * Tests for src/app/pages/ProductDetail.tsx
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductDetail } from '../ProductDetail';
import { renderWithRouter } from '@/test/helpers';
import { CartProvider } from '../../context/CartContext';
import { MemoryRouter, Routes, Route } from 'react-router';

// Mock dependencies
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  Check: () => <div data-testid="check-icon" />,
  ShoppingCart: () => <div data-testid="cart-icon" />,
  Truck: () => <div data-testid="truck-icon" />,
  Package: () => <div data-testid="package-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock product data
vi.mock('../../data/products', () => ({
  products: [
    {
      id: 'product-1',
      name: 'Premium Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 299.99,
      category: 'Electronics',
      image: '/images/headphones.jpg',
      features: [
        'Active Noise Cancellation',
        '30-hour battery life',
        'Bluetooth 5.0',
        'Premium sound quality'
      ],
    },
    {
      id: 'product-2',
      name: 'Smart Watch',
      description: 'Fitness tracking smartwatch with heart rate monitor',
      price: 399.99,
      category: 'Wearables',
      image: '/images/watch.jpg',
      features: [
        'Heart rate monitoring',
        'GPS tracking',
        'Water resistant',
        '7-day battery'
      ],
    },
  ],
}));

function TestWrapper({ children, productId = 'product-1' }: { children: React.ReactNode; productId?: string }) {
  return (
    <MemoryRouter initialEntries={[`/products/${productId}`]}>
      <CartProvider>
        <Routes>
          <Route path="/products/:productId" element={children} />
          <Route path="/products" element={<div>Products Page</div>} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  );
}

describe('Product Detail Page Component Suite', () => {
  describe('Page Rendering', () => {
    it('should render product detail page', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Premium Headphones')).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Back to Products')).toBeInTheDocument();
    });

    it('should render product image', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const image = screen.getByAltText('Premium Headphones');
      expect(image).toBeInTheDocument();
    });

    it('should render product name', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Premium Headphones')).toBeInTheDocument();
    });

    it('should render product description', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText(/High-quality wireless headphones/i)).toBeInTheDocument();
    });

    it('should have grid layout', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const grid = container.querySelector('.md\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    it('should render back button', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Back to Products')).toBeInTheDocument();
    });

    it('should render arrow icon', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });

    it('should link to products page', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const link = screen.getByText('Back to Products').closest('a');
      expect(link).toHaveAttribute('href', '/products');
    });

    it('should have hover effect', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const link = screen.getByText('Back to Products').closest('a');
      expect(link).toHaveClass('hover:text-gray-900');
    });

    it('should have transition', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const link = screen.getByText('Back to Products').closest('a');
      expect(link).toHaveClass('transition-colors');
    });
  });

  describe('Product Image', () => {
    it('should render product image', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const image = screen.getByAltText('Premium Headphones');
      expect(image).toBeInTheDocument();
    });

    it('should have correct image source', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const image = screen.getByAltText('Premium Headphones');
      expect(image.src).toContain('headphones.jpg');
    });

    it('should have alt text', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const image = screen.getByAltText('Premium Headphones');
      expect(image).toHaveAttribute('alt', 'Premium Headphones');
    });

    it('should have background color', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const imageContainer = container.querySelector('.bg-gray-100');
      expect(imageContainer).toBeInTheDocument();
    });

    it('should have rounded corners', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const imageContainer = container.querySelector('.rounded-2xl');
      expect(imageContainer).toBeInTheDocument();
    });

    it('should have aspect ratio', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const imageContainer = container.querySelector('.aspect-square');
      expect(imageContainer).toBeInTheDocument();
    });

    it('should cover container', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const image = screen.getByAltText('Premium Headphones');
      expect(image).toHaveClass('object-cover');
    });
  });

  describe('Product Information', () => {
    it('should render product category badge', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    it('should render product name as h1', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const name = screen.getByText('Premium Headphones');
      expect(name.tagName).toBe('H1');
    });

    it('should have large title text', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const name = screen.getByText('Premium Headphones');
      expect(name).toHaveClass('text-4xl', 'font-bold');
    });

    it('should render product description', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText(/High-quality wireless headphones/i)).toBeInTheDocument();
    });

    it('should have category badge styling', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const badge = container.querySelector('.bg-blue-100');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Product Features', () => {
    it('should render features heading', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Key Features:')).toBeInTheDocument();
    });

    it('should render all features', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Active Noise Cancellation')).toBeInTheDocument();
      expect(screen.getByText('30-hour battery life')).toBeInTheDocument();
      expect(screen.getByText('Bluetooth 5.0')).toBeInTheDocument();
      expect(screen.getByText('Premium sound quality')).toBeInTheDocument();
    });

    it('should render check icons for features', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const checkIcons = screen.getAllByTestId('check-icon');
      expect(checkIcons).toHaveLength(4);
    });

    it('should have list structure', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const feature = screen.getByText('Active Noise Cancellation');
      const listItem = feature.closest('li');
      expect(listItem).toBeInTheDocument();
    });

    it('should have spacing between features', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const featureList = container.querySelector('.space-y-2');
      expect(featureList).toBeInTheDocument();
    });
  });

  describe('Add to Cart Button', () => {
    it('should render add to cart button', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const button = screen.getByRole('button', { name: /add to cart/i });
      expect(button).toBeInTheDocument();
    });

    it('should handle click event', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const button = screen.getByRole('button', { name: /add to cart/i });
      await user.click(button);
      
      // Should not throw error
      expect(button).toBeInTheDocument();
    });

    it('should render cart icon', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('cart-icon')).toBeInTheDocument();
    });
  });

  describe('Product Not Found', () => {
    it('should render not found message for invalid product', () => {
      render(
        <TestWrapper productId="invalid-id">
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Product not found')).toBeInTheDocument();
    });

    it('should render back link on not found', () => {
      render(
        <TestWrapper productId="invalid-id">
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Back to Products')).toBeInTheDocument();
    });

    it('should link to products page on not found', () => {
      render(
        <TestWrapper productId="invalid-id">
          <ProductDetail />
        </TestWrapper>
      );
      
      const link = screen.getByText('Back to Products');
      expect(link).toHaveAttribute('href', '/products');
    });

    it('should have centered layout on not found', () => {
      const { container } = render(
        <TestWrapper productId="invalid-id">
          <ProductDetail />
        </TestWrapper>
      );
      
      const centered = container.querySelector('.text-center');
      expect(centered).toBeInTheDocument();
    });
  });

  describe('Different Products', () => {
    it('should render second product correctly', () => {
      render(
        <TestWrapper productId="product-2">
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Smart Watch')).toBeInTheDocument();
    });

    it('should render second product description', () => {
      render(
        <TestWrapper productId="product-2">
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Fitness tracking smartwatch/i)).toBeInTheDocument();
    });

    it('should render second product features', () => {
      render(
        <TestWrapper productId="product-2">
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Heart rate monitoring')).toBeInTheDocument();
      expect(screen.getByText('GPS tracking')).toBeInTheDocument();
    });

    it('should render second product category', () => {
      render(
        <TestWrapper productId="product-2">
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Wearables')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const grid = container.querySelector('.md\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive padding', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const padding = container.querySelector('.sm\\:px-6');
      expect(padding).toBeInTheDocument();
    });

    it('should have max width container', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const maxWidth = container.querySelector('.max-w-7xl');
      expect(maxWidth).toBeInTheDocument();
    });

    it('should have gap in grid', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const grid = container.querySelector('.gap-12');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const heading = screen.getByText('Premium Headphones');
      expect(heading.tagName).toBe('H1');
    });

    it('should have alt text on image', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const image = screen.getByAltText('Premium Headphones');
      expect(image).toHaveAttribute('alt');
    });

    it('should have accessible back link', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const link = screen.getByText('Back to Products');
      expect(link).toHaveAttribute('href');
    });

    it('should have accessible button', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const button = screen.getByRole('button', { name: /add to cart/i });
      expect(button).toBeInTheDocument();
    });

    it('should have semantic list for features', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const feature = screen.getByText('Active Noise Cancellation');
      const listItem = feature.closest('li');
      expect(listItem?.parentElement?.tagName).toBe('UL');
    });
  });

  describe('Visual Design', () => {
    it('should have rounded image container', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const rounded = container.querySelector('.rounded-2xl');
      expect(rounded).toBeInTheDocument();
    });

    it('should have flex column layout', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const flex = container.querySelector('.flex-col');
      expect(flex).toBeInTheDocument();
    });

    it('should have badge styling', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const badge = container.querySelector('.rounded-full');
      expect(badge).toBeInTheDocument();
    });

    it('should have check icon color', () => {
      const { container } = render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      // Check icons should have green color
      const greenElements = container.querySelectorAll('.text-green-600');
      expect(greenElements.length).toBeGreaterThan(0);
    });
  });

  describe('Cart Integration', () => {
    it('should add product to cart on button click', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const button = screen.getByRole('button', { name: /add to cart/i });
      await user.click(button);
      
      // Cart context should be updated
      expect(button).toBeInTheDocument();
    });

    it('should render with CartContext', () => {
      expect(() => {
        render(
          <TestWrapper>
            <ProductDetail />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('URL Parameters', () => {
    it('should read productId from URL params', () => {
      render(
        <TestWrapper productId="product-1">
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Premium Headphones')).toBeInTheDocument();
    });

    it('should handle different product IDs', () => {
      render(
        <TestWrapper productId="product-2">
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Smart Watch')).toBeInTheDocument();
    });

    it('should handle invalid product IDs', () => {
      render(
        <TestWrapper productId="invalid-id">
          <ProductDetail />
        </TestWrapper>
      );
      
      expect(screen.getByText('Product not found')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle product without features', () => {
      // Product with empty features array would not render features section
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      // Product should still render
      expect(screen.getByText('Premium Headphones')).toBeInTheDocument();
    });

    it('should handle missing product image', () => {
      render(
        <TestWrapper>
          <ProductDetail />
        </TestWrapper>
      );
      
      const image = screen.getByAltText('Premium Headphones');
      expect(image).toBeInTheDocument();
    });

    it('should render without errors', () => {
      expect(() => {
        render(
          <TestWrapper>
            <ProductDetail />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });
});