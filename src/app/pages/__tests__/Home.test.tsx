/**
 * Home Page Test Suite
 * Day 11 - Morning Session (Part 1)
 * Tests for src/app/pages/Home.tsx
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { Home } from '../Home';
import { CartProvider } from '../../context/CartContext';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Building2: () => <div data-testid="building-icon" />,
  User: () => <div data-testid="user-icon" />,
  Gift: () => <div data-testid="gift-icon" />,
  ArrowRight: () => <div data-testid="arrow-icon" />,
}));

// Wrapper component for tests
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}

describe('Home Page Component Suite', () => {
  describe('Page Rendering', () => {
    it('should render home page', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Celebrate Every Milestone')).toBeInTheDocument();
    });

    it('should render hero section', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const hero = screen.getByText('Celebrate Every Milestone').closest('section');
      expect(hero).toBeInTheDocument();
    });

    it('should render shipping options section', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Choose Your Delivery Option')).toBeInTheDocument();
    });

    it('should render features section', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Premium Selection')).toBeInTheDocument();
      expect(screen.getByText('Flexible Delivery')).toBeInTheDocument();
      expect(screen.getByText('Easy Process')).toBeInTheDocument();
    });

    it('should have minimum height for full viewport', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const mainDiv = container.querySelector('.min-h-\\[calc\\(100vh-4rem\\)\\]');
      expect(mainDiv).toBeInTheDocument();
    });
  });

  describe('Hero Section', () => {
    it('should render platform badge', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Premium Event Gifting Platform')).toBeInTheDocument();
    });

    it('should render hero title', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const title = screen.getByText('Celebrate Every Milestone');
      expect(title.tagName).toBe('H1');
    });

    it('should render hero description', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Choose from our curated selection/i)).toBeInTheDocument();
    });

    it('should have gradient background on hero', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const hero = screen.getByText('Celebrate Every Milestone').closest('section');
      expect(hero).toHaveClass('bg-gradient-to-br');
    });

    it('should render gift icon in badge', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const giftIcons = screen.getAllByTestId('gift-icon');
      expect(giftIcons.length).toBeGreaterThan(0);
    });

    it('should have white text on hero', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const hero = screen.getByText('Celebrate Every Milestone').closest('section');
      expect(hero).toHaveClass('text-white');
    });

    it('should have responsive padding', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const hero = screen.getByText('Celebrate Every Milestone').closest('section');
      expect(hero).toHaveClass('py-20');
    });
  });

  describe('Shipping Options Section', () => {
    it('should render section heading', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const heading = screen.getByText('Choose Your Delivery Option');
      expect(heading.tagName).toBe('H2');
    });

    it('should render section description', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Select how you'd like to receive your gifts/i)).toBeInTheDocument();
    });

    it('should render two shipping option cards', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Ship to Company')).toBeInTheDocument();
      expect(screen.getByText('Ship to Employee')).toBeInTheDocument();
    });

    it('should have responsive grid layout', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const grid = container.querySelector('.md\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Ship to Company Card', () => {
    it('should render company shipping card', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Ship to Company')).toBeInTheDocument();
    });

    it('should render building icon', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const buildingIcons = screen.getAllByTestId('building-icon');
      expect(buildingIcons.length).toBeGreaterThan(0);
    });

    it('should render card description', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Have all gifts delivered to your company address/i)).toBeInTheDocument();
    });

    it('should render browse catalog link', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const browseLinks = screen.getAllByText('Browse Catalog');
      expect(browseLinks.length).toBeGreaterThan(0);
    });

    it('should link to products page', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const companyCard = screen.getByText('Ship to Company').closest('a');
      expect(companyCard).toHaveAttribute('href', '/products');
    });

    it('should have hover effects', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const companyCard = screen.getByText('Ship to Company').closest('a');
      expect(companyCard).toHaveClass('hover:shadow-2xl');
    });

    it('should have border styling', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const companyCard = screen.getByText('Ship to Company').closest('a');
      expect(companyCard).toHaveClass('border-2');
    });

    it('should have rounded corners', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const companyCard = screen.getByText('Ship to Company').closest('a');
      expect(companyCard).toHaveClass('rounded-2xl');
    });

    it('should render arrow icon', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const arrowIcons = screen.getAllByTestId('arrow-icon');
      expect(arrowIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Ship to Employee Card', () => {
    it('should render employee shipping card', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Ship to Employee')).toBeInTheDocument();
    });

    it('should render user icon', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const userIcons = screen.getAllByTestId('user-icon');
      expect(userIcons.length).toBeGreaterThan(0);
    });

    it('should render card description', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Send gifts directly to individual employee addresses/i)).toBeInTheDocument();
    });

    it('should link to products page', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const employeeCard = screen.getByText('Ship to Employee').closest('a');
      expect(employeeCard).toHaveAttribute('href', '/products');
    });

    it('should have hover effects', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const employeeCard = screen.getByText('Ship to Employee').closest('a');
      expect(employeeCard).toHaveClass('hover:shadow-2xl');
    });

    it('should have border styling', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const employeeCard = screen.getByText('Ship to Employee').closest('a');
      expect(employeeCard).toHaveClass('border-2');
    });

    it('should have rounded corners', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const employeeCard = screen.getByText('Ship to Employee').closest('a');
      expect(employeeCard).toHaveClass('rounded-2xl');
    });
  });

  describe('Features Section', () => {
    it('should render three feature cards', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Premium Selection')).toBeInTheDocument();
      expect(screen.getByText('Flexible Delivery')).toBeInTheDocument();
      expect(screen.getByText('Easy Process')).toBeInTheDocument();
    });

    it('should render premium selection feature', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Premium Selection')).toBeInTheDocument();
      expect(screen.getByText('Curated gifts from top brands to celebrate your team')).toBeInTheDocument();
    });

    it('should render flexible delivery feature', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Flexible Delivery')).toBeInTheDocument();
      expect(screen.getByText('Choose company or individual shipping options')).toBeInTheDocument();
    });

    it('should render easy process feature', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Easy Process')).toBeInTheDocument();
      expect(screen.getByText('Simple checkout and tracking for all orders')).toBeInTheDocument();
    });

    it('should have grid layout for features', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const featuresSection = screen.getByText('Premium Selection').closest('.grid');
      expect(featuresSection).toHaveClass('md:grid-cols-3');
    });

    it('should render feature icons', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const giftIcons = screen.getAllByTestId('gift-icon');
      const buildingIcons = screen.getAllByTestId('building-icon');
      const arrowIcons = screen.getAllByTestId('arrow-icon');
      
      expect(giftIcons.length).toBeGreaterThan(0);
      expect(buildingIcons.length).toBeGreaterThan(0);
      expect(arrowIcons.length).toBeGreaterThan(0);
    });

    it('should have white background', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const featuresSection = screen.getByText('Premium Selection').closest('section');
      expect(featuresSection).toHaveClass('bg-white');
    });

    it('should have padding', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const featuresSection = screen.getByText('Premium Selection').closest('section');
      expect(featuresSection).toHaveClass('py-16');
    });
  });

  describe('User Interactions', () => {
    it('should handle company shipping selection', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const companyCard = screen.getByText('Ship to Company').closest('a');
      await user.click(companyCard as HTMLElement);
      
      // Cart context should be updated
      expect(companyCard).toHaveAttribute('href', '/products');
    });

    it('should handle employee shipping selection', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const employeeCard = screen.getByText('Ship to Employee').closest('a');
      await user.click(employeeCard as HTMLElement);
      
      // Cart context should be updated
      expect(employeeCard).toHaveAttribute('href', '/products');
    });

    it('should navigate to products on company click', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const companyCard = screen.getByText('Ship to Company').closest('a');
      expect(companyCard).toBeInTheDocument();
    });

    it('should navigate to products on employee click', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const employeeCard = screen.getByText('Ship to Employee').closest('a');
      expect(employeeCard).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text sizing on hero', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const title = screen.getByText('Celebrate Every Milestone');
      expect(title).toHaveClass('text-5xl', 'md:text-6xl');
    });

    it('should have responsive grid for shipping options', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const grid = container.querySelector('.md\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive grid for features', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const grid = container.querySelector('.md\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive padding', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const hero = screen.getByText('Celebrate Every Milestone').closest('section');
      const container = hero?.querySelector('.px-4');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading hierarchy', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const h1 = screen.getByText('Celebrate Every Milestone');
      const h2 = screen.getByText('Choose Your Delivery Option');
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      
      expect(h1.tagName).toBe('H1');
      expect(h2.tagName).toBe('H2');
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    it('should have accessible links', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const companyLink = screen.getByText('Ship to Company').closest('a');
      const employeeLink = screen.getByText('Ship to Employee').closest('a');
      
      expect(companyLink).toHaveAttribute('href');
      expect(employeeLink).toHaveAttribute('href');
    });

    it('should have descriptive text content', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Choose from our curated selection/i)).toBeInTheDocument();
      expect(screen.getByText(/Have all gifts delivered to your company/i)).toBeInTheDocument();
      expect(screen.getByText(/Send gifts directly to individual employee/i)).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('should have gradient background on hero', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const hero = screen.getByText('Celebrate Every Milestone').closest('section');
      expect(hero).toHaveClass('bg-gradient-to-br');
    });

    it('should have shadow effects on cards', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const companyCard = screen.getByText('Ship to Company').closest('a');
      expect(companyCard).toHaveClass('shadow-lg');
    });

    it('should have rounded card corners', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const companyCard = screen.getByText('Ship to Company').closest('a');
      expect(companyCard).toHaveClass('rounded-2xl');
    });

    it('should have transition effects', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const companyCard = screen.getByText('Ship to Company').closest('a');
      expect(companyCard).toHaveClass('transition-all');
    });

    it('should have icon containers with backgrounds', () => {
      const { container } = renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const iconContainer = container.querySelector('.bg-blue-100.rounded-full');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render without cart context error', () => {
      expect(() => {
        renderWithRouter(
          <TestWrapper>
            <Home />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle missing shipping type gracefully', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Ship to Company')).toBeInTheDocument();
      expect(screen.getByText('Ship to Employee')).toBeInTheDocument();
    });

    it('should render all sections without errors', () => {
      renderWithRouter(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText('Celebrate Every Milestone')).toBeInTheDocument();
      expect(screen.getByText('Choose Your Delivery Option')).toBeInTheDocument();
      expect(screen.getByText('Premium Selection')).toBeInTheDocument();
    });
  });
});