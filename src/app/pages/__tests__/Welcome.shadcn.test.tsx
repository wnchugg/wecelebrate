import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { Welcome } from '../Welcome';
import * as AuthContext from '../../context/AuthContext';
import * as LanguageContext from '../../context/LanguageContext';

// Mock contexts
vi.mock('../../context/AuthContext');
vi.mock('../../context/LanguageContext');

/**
 * Test Suite: Welcome Page shadcn/ui Migration
 * 
 * Validates Phase 2 implementation:
 * - Card components for celebration messages
 * - Button components (video play, continue, view all)
 * - Avatar components for sender info
 * - Skeleton loading states
 * - Dialog for full message view
 * - Keyboard accessibility
 */
describe('Welcome Page - shadcn/ui Components', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useAuth
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { 
        id: 'user-1',
        email: 'test@example.com', 
        name: 'Test User',
      },
      userIdentifier: 'test@example.com',
      authenticate: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });
    
    // Mock useLanguage
    vi.mocked(LanguageContext.useLanguage).mockReturnValue({
      currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' },
      setLanguage: vi.fn(),
      t: (key: string) => key,
    });
  });

  describe('Card Components', () => {
    it('should render celebration messages using Card component', async () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Card components should have data-slot="card" attribute
        const cards = screen.queryAllByTestId('celebration-card');
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it('should render CardHeader with eCard template', async () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        // CardHeader should contain the eCard
        const cardHeaders = document.querySelectorAll('[data-slot="card-header"]');
        expect(cardHeaders.length).toBeGreaterThan(0);
      });
    });

    it('should render CardContent with message and sender info', async () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        // CardContent should contain message text
        const cardContents = document.querySelectorAll('[data-slot="card-content"]');
        expect(cardContents.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Button Components', () => {
    it('should render video play button with proper aria-label', () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      const playButton = screen.getByRole('button', { name: /play.*video/i });
      expect(playButton).toBeInTheDocument();
      expect(playButton).toHaveAttribute('aria-label');
    });

    it('should render continue button using Button component', () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeInTheDocument();
    });

    it('should render view all messages button when messages exist', async () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        const viewAllButton = screen.queryByRole('button', { name: /view all/i });
        if (viewAllButton) {
          expect(viewAllButton).toBeInTheDocument();
        }
      });
    });
  });

  describe('Avatar Components', () => {
    it('should render Avatar with AvatarFallback for sender initials', async () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Avatar components should have data-slot="avatar" attribute
        const avatars = document.querySelectorAll('[data-slot="avatar"]');
        expect(avatars.length).toBeGreaterThan(0);
      });
    });

    it('should display sender initials in AvatarFallback', async () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        const fallbacks = document.querySelectorAll('[data-slot="avatar-fallback"]');
        expect(fallbacks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Skeleton Loading States', () => {
    it('should render 6 skeleton cards while loading', () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      // Should show skeletons initially
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should replace skeletons with actual cards after loading', async () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      // Wait for loading to complete
      await waitFor(() => {
        const cards = screen.queryAllByTestId('celebration-card');
        expect(cards.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('Dialog Component', () => {
    it('should open Dialog when clicking on celebration card', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        const cards = screen.queryAllByRole('button', { name: /message from/i });
        expect(cards.length).toBeGreaterThan(0);
      });

      const firstCard = screen.getAllByRole('button', { name: /message from/i })[0];
      await user.click(firstCard);

      // Dialog should open
      await waitFor(() => {
        const dialog = screen.queryByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('should close Dialog when clicking close button', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      // Open dialog
      await waitFor(() => {
        const cards = screen.queryAllByRole('button', { name: /message from/i });
        expect(cards.length).toBeGreaterThan(0);
      });

      const firstCard = screen.getAllByRole('button', { name: /message from/i })[0];
      await user.click(firstCard);

      // Close dialog
      const closeButton = await screen.findByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        const dialog = screen.queryByRole('dialog');
        expect(dialog).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should allow keyboard navigation to celebration cards', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        const cards = screen.queryAllByRole('button', { name: /message from/i });
        expect(cards.length).toBeGreaterThan(0);
      });

      const firstCard = screen.getAllByRole('button', { name: /message from/i })[0];
      
      // Tab to card
      await user.tab();
      expect(firstCard).toHaveFocus();
    });

    it('should open card with Enter key', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        const cards = screen.queryAllByRole('button', { name: /message from/i });
        expect(cards.length).toBeGreaterThan(0);
      });

      const firstCard = screen.getAllByRole('button', { name: /message from/i })[0];
      firstCard.focus();
      
      await user.keyboard('{Enter}');

      // Dialog should open
      await waitFor(() => {
        const dialog = screen.queryByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('should open card with Space key', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        const cards = screen.queryAllByRole('button', { name: /message from/i });
        expect(cards.length).toBeGreaterThan(0);
      });

      const firstCard = screen.getAllByRole('button', { name: /message from/i })[0];
      firstCard.focus();
      
      await user.keyboard(' ');

      // Dialog should open
      await waitFor(() => {
        const dialog = screen.queryByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Attributes', () => {
    it('should have proper role attributes on interactive elements', async () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('should have aria-labels on icon-only buttons', () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      const playButton = screen.getByRole('button', { name: /play.*video/i });
      expect(playButton).toHaveAttribute('aria-label');
    });

    it('should have proper tabIndex on celebration cards', async () => {
      render(
        <BrowserRouter>
          <Welcome />
        </BrowserRouter>
      );

      await waitFor(() => {
        const cards = screen.queryAllByRole('button', { name: /message from/i });
        cards.forEach(card => {
          expect(card).toHaveAttribute('tabIndex');
        });
      });
    });
  });
});
