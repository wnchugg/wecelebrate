/**
 * LanguageSelector Component Tests
 * 
 * Coverage:
 * - Selector rendering
 * - Language selection
 * - Dropdown open/close
 * - Variant styles
 * - Escape key handling
 * 
 * Total Tests: 7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from '../LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';

vi.mock('../../context/LanguageContext', () => ({
  useLanguage: vi.fn(),
  languages: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
  ],
}));

describe('LanguageSelector Component', () => {
  const mockSetLanguage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Provide default mock return value for all tests
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: { code: 'en', name: 'English', flag: '🇺🇸' },
      setLanguage: mockSetLanguage,
      t: (key: string) => key,
    });
  });

  describe('Rendering', () => {
    it('should render language selector button', () => {
      render(<LanguageSelector />);
      expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
    });

    it('should show current language', () => {
      render(<LanguageSelector />);
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('should render with dark variant', () => {
      render(<LanguageSelector variant="dark" />);
      const button = screen.getByRole('button', { name: /select language/i });
      expect(button).toHaveClass('text-white');
    });

    it('should render with light variant by default', () => {
      render(<LanguageSelector />);
      const button = screen.getByRole('button', { name: /select language/i });
      expect(button).toHaveClass('text-gray-700');
    });
  });

  describe('Dropdown Behavior', () => {
    it('should open dropdown on click', async () => {
      const user = userEvent.setup();
      render(<LanguageSelector />);

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Spanish')).toBeInTheDocument();
        expect(screen.getByText('French')).toBeInTheDocument();
      });
    });

    it('should close dropdown on Escape key', async () => {
      const user = userEvent.setup();
      render(<LanguageSelector />);

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Language Selection', () => {
    it('should call setLanguage when option is clicked', async () => {
      const user = userEvent.setup();
      render(<LanguageSelector />);

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Spanish')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Spanish'));

      expect(mockSetLanguage).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'es', name: 'Spanish' })
      );
    });
  });
});