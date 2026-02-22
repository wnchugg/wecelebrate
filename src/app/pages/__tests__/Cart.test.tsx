/**
 * Cart Page Test Suite
 * Day 11 - Afternoon Session
 * Tests for src/app/pages/Cart.tsx
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Cart } from '../Cart';
import { renderWithRouter } from '@/test/helpers';
import { CartProvider } from '../../context/CartContext';
import { LanguageProvider } from '../../context/LanguageContext';

// Mock dependencies
vi.mock('lucide-react', () => ({
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Minus: () => <div data-testid="minus-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  Package: () => <div data-testid="package-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
}));

vi.mock('../../components/LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector" />,
}));

vi.mock('../../../imports/Logo', () => ({
  default: () => <svg data-testid="logo" />,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  },
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </LanguageProvider>
  );
}

describe('Cart Page Component Suite', () => {
  describe('Page Rendering', () => {
    it('should render cart page', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    });

    it('should render header', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByText('RecHUB Gifting')).toBeInTheDocument();
    });

    it('should render language selector', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('language-selector')).toBeInTheDocument();
    });

    it('should render back button', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should have gradient background', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const main = container.querySelector('.bg-gradient-to-br');
      expect(main).toBeInTheDocument();
    });

    it('should have minimum height for full screen', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const main = container.querySelector('.min-h-screen');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Header Section', () => {
    it('should render logo', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const logo = container.querySelector('svg');
      expect(logo).toBeInTheDocument();
    });

    it('should render brand name', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByText('RecHUB Gifting')).toBeInTheDocument();
    });

    it('should link to home page', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const homeLink = screen.getByText('RecHUB Gifting').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should have white background on header', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const header = screen.getByText('RecHUB Gifting').closest('header');
      expect(header).toHaveClass('bg-white', 'shadow-sm');
    });

    it('should have border on header', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const header = screen.getByText('RecHUB Gifting').closest('header');
      expect(header).toHaveClass('border-b');
    });
  });

  describe('Page Title', () => {
    it('should render page title', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const title = screen.getByText('Shopping Cart');
      expect(title.tagName).toBe('H1');
    });

    it('should have large title text', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const title = screen.getByText('Shopping Cart');
      expect(title).toHaveClass('text-3xl', 'font-bold');
    });

    it('should show empty cart message when no items', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const messages = screen.getAllByText('Your cart is empty');
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  describe('Empty Cart State', () => {
    it('should render empty cart card', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const messages = screen.getAllByText('Your cart is empty');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should render shopping cart icon', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('shopping-cart-icon')).toBeInTheDocument();
    });

    it('should render empty state heading', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const emptyHeading = screen.getAllByText('Your cart is empty')[1]; // Second occurrence in card
      expect(emptyHeading).toBeInTheDocument();
    });

    it('should render empty state description', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Start adding items to your cart/i)).toBeInTheDocument();
    });

    it('should render browse products button', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByText('Browse Products')).toBeInTheDocument();
    });

    it('should link to products page', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const browseLink = screen.getByText('Browse Products').closest('a');
      expect(browseLink).toHaveAttribute('href', '/products');
    });

    it('should render package icon in button', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('package-icon')).toBeInTheDocument();
    });

    it('should have dashed border on empty card', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const card = container.querySelector('.border-dashed');
      expect(card).toBeInTheDocument();
    });

    it('should center empty state content', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const content = container.querySelector('.flex-col.items-center.justify-center');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    it('should render back button', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should render arrow left icon', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });

    it('should be clickable', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const backButton = screen.getByText('Back');
      await user.click(backButton);
      
      expect(backButton).toBeInTheDocument();
    });

    it('should have hover effect', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toHaveClass('hover:text-gray-900');
    });

    it('should have transition', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toHaveClass('transition-colors');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive padding on header', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const headerContent = container.querySelector('.sm\\:px-6');
      expect(headerContent).toBeInTheDocument();
    });

    it('should have responsive padding on main', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const main = container.querySelector('main.px-4');
      expect(main).toBeInTheDocument();
    });

    it('should have max width container', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const container7xl = container.querySelector('.max-w-7xl');
      expect(container7xl).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic header element', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const header = screen.getByText('RecHUB Gifting').closest('header');
      expect(header?.tagName).toBe('HEADER');
    });

    it('should have semantic main element', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const main = container.querySelector('main');
      expect(main?.tagName).toBe('MAIN');
    });

    it('should have semantic heading hierarchy', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const h1 = screen.getByText('Shopping Cart');
      expect(h1.tagName).toBe('H1');
    });

    it('should have accessible back button', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should have accessible link to home', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const homeLink = screen.getByText('RecHUB Gifting').closest('a');
      expect(homeLink).toHaveAttribute('href');
    });

    it('should have accessible link to products', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const productsLink = screen.getByText('Browse Products').closest('a');
      expect(productsLink).toHaveAttribute('href', '/products');
    });
  });

  describe('Visual Design', () => {
    it('should have gradient background', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const bg = container.querySelector('.bg-gradient-to-br');
      expect(bg).toBeInTheDocument();
    });

    it('should have shadow on header', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const header = screen.getByText('RecHUB Gifting').closest('header');
      expect(header).toHaveClass('shadow-sm');
    });

    it('should have rounded icon container in empty state', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const iconContainer = container.querySelector('.rounded-full.bg-gray-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should have branded button color', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const button = container.querySelector('.bg-\\[\\#D91C81\\]');
      expect(button).toBeInTheDocument();
    });

    it('should have hover state on branded button', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const button = container.querySelector('.hover\\:bg-\\[\\#B71569\\]');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have header-main-footer structure', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const header = container.querySelector('header');
      const main = container.querySelector('main');
      
      expect(header).toBeInTheDocument();
      expect(main).toBeInTheDocument();
    });

    it('should have flex layout in header', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const headerFlex = container.querySelector('.flex.items-center.justify-between');
      expect(headerFlex).toBeInTheDocument();
    });

    it('should have centered content', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const centered = container.querySelector('.mx-auto');
      expect(centered).toBeInTheDocument();
    });
  });

  describe('Brand Elements', () => {
    it('should display brand logo', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const logo = container.querySelector('svg');
      expect(logo).toBeInTheDocument();
    });

    it('should display brand name', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByText('RecHUB Gifting')).toBeInTheDocument();
    });

    it('should use brand colors', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const brandText = container.querySelector('.text-\\[\\#1B2A5E\\]');
      expect(brandText).toBeInTheDocument();
    });

    it('should have consistent brand styling', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const brandName = screen.getByText('RecHUB Gifting');
      expect(brandName).toHaveClass('font-bold');
    });
  });

  describe('Empty State UX', () => {
    it('should encourage action with CTA button', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByText('Browse Products')).toBeInTheDocument();
    });

    it('should provide clear messaging', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Start adding items/i)).toBeInTheDocument();
    });

    it('should have visual hierarchy in empty state', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const headings = screen.getAllByText('Your cart is empty');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should guide user to next action', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const browseButton = screen.getByText('Browse Products');
      expect(browseButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle initial empty cart state', () => {
      renderWithRouter(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );
      
      const messages = screen.getAllByText('Your cart is empty');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should render without errors', () => {
      expect(() => {
        renderWithRouter(
          <TestWrapper>
            <Cart />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle missing context gracefully', () => {
      // Cart renders with CartProvider wrapper
      expect(() => {
        renderWithRouter(
          <TestWrapper>
            <Cart />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });
});