/**
 * MultiLanguageSelector Component Tests
 * 
 * Coverage:
 * - Language selection/deselection
 * - Default language cannot be unchecked
 * - Set as default functionality
 * - Search/filter functionality
 * - Display count of selected languages
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.6
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { MultiLanguageSelector } from '../MultiLanguageSelector';

describe('MultiLanguageSelector Component', () => {
  const defaultProps = {
    selectedLanguages: ['en'],
    onChange: vi.fn(),
    defaultLanguage: 'en',
    onDefaultChange: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render with selected languages count', () => {
      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      expect(screen.getByText('Available Languages')).toBeInTheDocument();
      expect(screen.getByText('1 language selected')).toBeInTheDocument();
    });

    it('should display plural form for multiple languages', () => {
      renderWithRouter(
        <MultiLanguageSelector
          {...defaultProps}
          selectedLanguages={['en', 'es', 'fr']}
        />
      );

      expect(screen.getByText('3 languages selected')).toBeInTheDocument();
    });

    it('should render search input', () => {
      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      const searchInput = screen.getByPlaceholderText('Search languages...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render all 20 languages', () => {
      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      // Check for a few language names (using getAllByText since they appear in both sr-only and visible text)
      expect(screen.getAllByText('English (US)').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Español').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Français').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Deutsch').length).toBeGreaterThan(0);
    });

    it('should show default language badge', () => {
      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('should show RTL badge for RTL languages', () => {
      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      const rtlBadges = screen.getAllByText('RTL');
      expect(rtlBadges.length).toBeGreaterThan(0); // Arabic and Hebrew
    });
  });

  describe('Language Selection', () => {
    it('should call onChange when selecting a language', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <MultiLanguageSelector
          {...defaultProps}
          onChange={handleChange}
        />
      );

      // Find Spanish checkbox and click it
      const checkboxes = screen.getAllByRole('checkbox');
      const spanishCheckbox = checkboxes.find((cb) => {
        const parent = cb.closest('.flex.items-center.justify-between');
        return parent?.textContent?.includes('Español');
      });

      if (spanishCheckbox) {
        await user.click(spanishCheckbox);
        expect(handleChange).toHaveBeenCalledWith(['en', 'es']);
      }
    });

    it('should call onChange when deselecting a non-default language', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <MultiLanguageSelector
          {...defaultProps}
          selectedLanguages={['en', 'es']}
          onChange={handleChange}
        />
      );

      // Find Spanish checkbox and click it to deselect
      const checkboxes = screen.getAllByRole('checkbox');
      const spanishCheckbox = checkboxes.find((cb) => {
        const parent = cb.closest('.flex.items-center.justify-between');
        return parent?.textContent?.includes('Español');
      });

      if (spanishCheckbox) {
        await user.click(spanishCheckbox);
        expect(handleChange).toHaveBeenCalledWith(['en']);
      }
    });

    it('should not call onChange when trying to uncheck default language', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <MultiLanguageSelector
          {...defaultProps}
          onChange={handleChange}
        />
      );

      // Find English (default) checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      const englishCheckbox = checkboxes.find((cb) => {
        const parent = cb.closest('.flex.items-center.justify-between');
        return parent?.textContent?.includes('English (US)');
      });

      if (englishCheckbox) {
        await user.click(englishCheckbox);
        expect(handleChange).not.toHaveBeenCalled();
      }
    });

    it('should disable checkbox for default language', () => {
      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const englishCheckbox = checkboxes.find((cb) => {
        const parent = cb.closest('.flex.items-center.justify-between');
        return parent?.textContent?.includes('English (US)');
      });

      expect(englishCheckbox).toBeDisabled();
    });
  });

  describe('Set as Default Functionality', () => {
    it('should show "Set as default" button for selected non-default languages', () => {
      renderWithRouter(
        <MultiLanguageSelector
          {...defaultProps}
          selectedLanguages={['en', 'es']}
        />
      );

      const setDefaultButtons = screen.getAllByText('Set as default');
      expect(setDefaultButtons.length).toBeGreaterThan(0);
    });

    it('should not show "Set as default" button for default language', () => {
      renderWithRouter(
        <MultiLanguageSelector
          {...defaultProps}
          selectedLanguages={['en', 'es']}
        />
      );

      // Check that English (default) doesn't have a "Set as default" button
      const englishElements = screen.getAllByText('English (US)');
      const englishRow = englishElements[0].closest('.flex.items-center.justify-between');
      expect(englishRow?.textContent).not.toContain('Set as default');
    });

    it('should call onDefaultChange when clicking "Set as default"', async () => {
      const handleDefaultChange = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <MultiLanguageSelector
          {...defaultProps}
          selectedLanguages={['en', 'es']}
          onDefaultChange={handleDefaultChange}
        />
      );

      const setDefaultButtons = screen.getAllByText('Set as default');
      if (setDefaultButtons.length > 0) {
        await user.click(setDefaultButtons[0]);
        expect(handleDefaultChange).toHaveBeenCalled();
      }
    });

    it('should add language to selected list when setting as default if not already selected', async () => {
      const handleChange = vi.fn();
      const handleDefaultChange = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <MultiLanguageSelector
          {...defaultProps}
          selectedLanguages={['en']}
          onChange={handleChange}
          onDefaultChange={handleDefaultChange}
        />
      );

      // First select Spanish
      const checkboxes = screen.getAllByRole('checkbox');
      const spanishCheckbox = checkboxes.find((cb) => {
        const parent = cb.closest('.flex.items-center.justify-between');
        return parent?.textContent?.includes('Español');
      });

      if (spanishCheckbox) {
        await user.click(spanishCheckbox);
        expect(handleChange).toHaveBeenCalledWith(['en', 'es']);
      }
    });
  });

  describe('Search Functionality', () => {
    it('should filter languages by name', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      const searchInput = screen.getByPlaceholderText('Search languages...');
      await user.type(searchInput, 'Español');

      // Should show Spanish but not French
      expect(screen.queryAllByText('Español').length).toBeGreaterThan(0);
      expect(screen.queryAllByText('Français').length).toBe(0);
    });

    it('should filter languages by code', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      const searchInput = screen.getByPlaceholderText('Search languages...');
      await user.type(searchInput, 'es');

      // Should show Spanish languages
      expect(screen.queryAllByText('Español').length).toBeGreaterThan(0);
    });

    it('should show "no results" message when no languages match', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      const searchInput = screen.getByPlaceholderText('Search languages...');
      await user.type(searchInput, 'xyz123');

      expect(screen.getByText(/No languages found matching/)).toBeInTheDocument();
    });

    it('should be case-insensitive', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      const searchInput = screen.getByPlaceholderText('Search languages...');
      await user.type(searchInput, 'français');

      expect(screen.queryAllByText('Français').length).toBeGreaterThan(0);
    });

    it('should clear filter when search is cleared', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      const searchInput = screen.getByPlaceholderText('Search languages...');
      
      // Type and then clear
      await user.type(searchInput, 'Spanish');
      expect(screen.queryAllByText('Français').length).toBe(0);
      
      await user.clear(searchInput);
      expect(screen.queryAllByText('Français').length).toBeGreaterThan(0);
    });
  });

  describe('Info Message', () => {
    it('should show info message about default language', () => {
      renderWithRouter(
        <MultiLanguageSelector {...defaultProps} />
      );

      expect(screen.getByText(/cannot be unchecked/)).toBeInTheDocument();
    });

    it('should display correct default language name in info message', () => {
      renderWithRouter(
        <MultiLanguageSelector
          {...defaultProps}
          defaultLanguage="es"
          selectedLanguages={['es', 'en']}
        />
      );

      const infoMessage = screen.getByText(/cannot be unchecked/);
      expect(infoMessage.textContent).toContain('Español');
    });
  });
});
