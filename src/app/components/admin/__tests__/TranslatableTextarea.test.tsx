/**
 * TranslatableTextarea Component Tests
 * 
 * Coverage:
 * - Textarea rendering
 * - Rows prop
 * - MaxLength prop
 * - Tab rendering for all languages
 * - Default language tab shown first
 * - Status indicators (translated, empty, required)
 * - Copy from default functionality
 * - Character count display
 * 
 * Requirements: 2.1-2.9
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { TranslatableTextarea } from '../TranslatableTextarea';

describe('TranslatableTextarea Component', () => {
  const defaultProps = {
    label: 'Test Field',
    value: { en: 'Hello World', es: 'Hola Mundo' },
    onChange: vi.fn(),
    availableLanguages: ['en', 'es', 'fr'],
    defaultLanguage: 'en',
  };

  describe('Rendering', () => {
    it('should render label', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      expect(screen.getByText('Test Field')).toBeInTheDocument();
    });

    it('should render textarea element', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should render tabs for all available languages', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      expect(screen.getByText('English (US)')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
    });
  });

  describe('Rows Prop', () => {
    it('should use default rows value of 4', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(4);
    });

    it('should apply custom rows value', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} rows={8} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(8);
    });

    it('should apply rows value of 2', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} rows={2} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(2);
    });
  });

  describe('MaxLength Prop', () => {
    it('should apply maxLength attribute when specified', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} maxLength={500} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.maxLength).toBe(500);
    });

    it('should not apply maxLength attribute when not specified', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.maxLength).toBe(-1); // -1 is the default when maxLength is not set
    });

    it('should display character count when maxLength is set', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} maxLength={500} />);
      
      expect(screen.getByText('11 / 500')).toBeInTheDocument();
    });

    it('should not display character count when maxLength is not set', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      expect(screen.queryByText(/\/ /)).not.toBeInTheDocument();
    });

    it('should prevent input beyond maxLength', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(
        <TranslatableTextarea
          {...defaultProps}
          value={{ en: 'Hello', es: '', fr: '' }}
          onChange={handleChange}
          maxLength={5}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'X');
      
      // Should not call onChange because we're at maxLength
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Default Language Tab', () => {
    it('should show default language tab first', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const tabs = screen.getAllByRole('button');
      const firstTab = tabs[0];
      
      expect(within(firstTab).getByText('English (US)')).toBeInTheDocument();
    });

    it('should display default badge on default language tab', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const tabs = screen.getAllByRole('button');
      const defaultTab = tabs.find((tab) => tab.textContent?.includes('English (US)'));
      
      expect(within(defaultTab!).getByText('Default')).toBeInTheDocument();
    });

    it('should activate default language tab by default', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const tabs = screen.getAllByRole('button');
      const defaultTab = tabs.find((tab) => tab.textContent?.includes('English (US)'));
      
      expect(defaultTab).toHaveClass('border-blue-500');
    });

    it('should show default language value in textarea', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Hello World');
    });
  });

  describe('Status Indicators', () => {
    it('should show "Done" status for translated fields', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const tabs = screen.getAllByRole('button');
      const englishTab = tabs.find((tab) => tab.textContent?.includes('English (US)'));
      
      expect(within(englishTab!).getByText('Done')).toBeInTheDocument();
    });

    it('should show "Empty" status for untranslated fields', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const tabs = screen.getAllByRole('button');
      const frenchTab = tabs.find((tab) => tab.textContent?.includes('Français'));
      
      expect(within(frenchTab!).getByText('Empty')).toBeInTheDocument();
    });

    it('should show "Required" status for empty default language field', () => {
      renderWithRouter(
        <TranslatableTextarea
          {...defaultProps}
          value={{ es: 'Hola', fr: 'Bonjour' }}
        />
      );
      
      const tabs = screen.getAllByRole('button');
      const englishTab = tabs.find((tab) => tab.textContent?.includes('English (US)'));
      
      expect(within(englishTab!).getByText('Required')).toBeInTheDocument();
    });

    it('should show green color for translated status', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const doneBadges = screen.getAllByText('Done');
      const doneBadge = doneBadges[0].closest('span');
      
      expect(doneBadge).toHaveClass('text-green-600');
    });

    it('should show red color for required status', () => {
      renderWithRouter(
        <TranslatableTextarea
          {...defaultProps}
          value={{ es: 'Hola' }}
        />
      );
      
      const requiredBadge = screen.getByText('Required').closest('span');
      
      expect(requiredBadge).toHaveClass('text-red-600');
    });

    it('should show gray color for empty status', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const emptyBadges = screen.getAllByText('Empty');
      const emptyBadge = emptyBadges[0].closest('span');
      
      expect(emptyBadge).toHaveClass('text-gray-400');
    });
  });

  describe('Tab Switching', () => {
    it('should switch to clicked tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const tabs = screen.getAllByRole('button');
      const spanishTab = tabs.find((tab) => tab.textContent?.includes('Español'));
      
      await user.click(spanishTab!);
      
      expect(spanishTab).toHaveClass('border-blue-500');
    });

    it('should show correct value when switching tabs', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Hello World');
      
      const tabs = screen.getAllByRole('button');
      const spanishTab = tabs.find((tab) => tab.textContent?.includes('Español'));
      
      await user.click(spanishTab!);
      
      expect(textarea.value).toBe('Hola Mundo');
    });

    it('should show empty string for untranslated language', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const tabs = screen.getAllByRole('button');
      const frenchTab = tabs.find((tab) => tab.textContent?.includes('Français'));
      
      await user.click(frenchTab!);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });
  });

  describe('Textarea Changes', () => {
    it('should call onChange when typing', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(
        <TranslatableTextarea {...defaultProps} onChange={handleChange} />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'New text');
      
      // Check that onChange was called
      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onChange with correct language code', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(
        <TranslatableTextarea {...defaultProps} onChange={handleChange} />
      );
      
      // Switch to Spanish tab
      const tabs = screen.getAllByRole('button');
      const spanishTab = tabs.find((tab) => tab.textContent?.includes('Español'));
      await user.click(spanishTab!);
      
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'Nuevo texto');
      
      // Check that onChange was called with correct language code
      const calls = handleChange.mock.calls;
      expect(calls.some(call => call[0] === 'es')).toBe(true);
    });
  });

  describe('Copy from Default Functionality', () => {
    it('should show copy button on non-default language tabs', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      const tabs = screen.getAllByRole('button');
      const spanishTab = tabs.find((tab) => tab.textContent?.includes('Español'));
      await user.click(spanishTab!);
      
      expect(screen.getByText('Copy from default')).toBeInTheDocument();
    });

    it('should not show copy button on default language tab', () => {
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      expect(screen.queryByText('Copy from default')).not.toBeInTheDocument();
    });

    it('should call onChange with default language value when clicking copy', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(
        <TranslatableTextarea {...defaultProps} onChange={handleChange} />
      );
      
      // Switch to French tab
      const tabs = screen.getAllByRole('button');
      const frenchTab = tabs.find((tab) => tab.textContent?.includes('Français'));
      await user.click(frenchTab!);
      
      const copyButton = screen.getByText('Copy from default');
      await user.click(copyButton);
      
      expect(handleChange).toHaveBeenCalledWith('fr', 'Hello World');
    });

    it('should show "Copied!" message after copying', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<TranslatableTextarea {...defaultProps} />);
      
      // Switch to French tab
      const tabs = screen.getAllByRole('button');
      const frenchTab = tabs.find((tab) => tab.textContent?.includes('Français'));
      await user.click(frenchTab!);
      
      const copyButton = screen.getByText('Copy from default');
      await user.click(copyButton);
      
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    it('should disable copy button when default language is empty', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TranslatableTextarea
          {...defaultProps}
          value={{ en: '', es: 'Hola', fr: '' }}
        />
      );
      
      // Switch to French tab
      const tabs = screen.getAllByRole('button');
      const frenchTab = tabs.find((tab) => tab.textContent?.includes('Français'));
      await user.click(frenchTab!);
      
      const copyButton = screen.getByText('Copy from default');
      expect(copyButton).toBeDisabled();
    });
  });

  describe('Placeholder', () => {
    it('should display placeholder text', () => {
      renderWithRouter(
        <TranslatableTextarea
          {...defaultProps}
          value={{ en: '', es: '', fr: '' }}
          placeholder="Enter text here"
        />
      );
      
      const textarea = screen.getByPlaceholderText('Enter text here');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Language Sorting', () => {
    it('should always show default language first regardless of order', () => {
      renderWithRouter(
        <TranslatableTextarea
          {...defaultProps}
          availableLanguages={['fr', 'es', 'en']}
          defaultLanguage="en"
        />
      );
      
      const tabs = screen.getAllByRole('button');
      const firstTab = tabs[0];
      
      expect(within(firstTab).getByText('English (US)')).toBeInTheDocument();
    });

    it('should maintain order of non-default languages', () => {
      renderWithRouter(
        <TranslatableTextarea
          {...defaultProps}
          availableLanguages={['en', 'fr', 'es', 'de']}
          defaultLanguage="en"
        />
      );
      
      const tabs = screen.getAllByRole('button');
      
      // First should be English (default)
      expect(within(tabs[0]).getByText('English (US)')).toBeInTheDocument();
      // Others should maintain order
      expect(within(tabs[1]).getByText('Français')).toBeInTheDocument();
      expect(within(tabs[2]).getByText('Español')).toBeInTheDocument();
      expect(within(tabs[3]).getByText('Deutsch')).toBeInTheDocument();
    });
  });

  describe('Required Field Validation', () => {
    it('should show validation message for empty default language field', async () => {
      renderWithRouter(
        <TranslatableTextarea
          {...defaultProps}
          value={{ en: '', es: 'Hola', fr: '' }}
        />
      );
      
      expect(screen.getByText(/This field is required in the default language/)).toBeInTheDocument();
    });

    it('should not show validation message when default language has value', () => {
      renderWithRouter(
        <TranslatableTextarea {...defaultProps} />
      );
      
      expect(screen.queryByText(/This field is required/)).not.toBeInTheDocument();
    });

    it('should not show validation message for non-default empty fields', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TranslatableTextarea
          {...defaultProps}
          value={{ en: 'Hello', es: '', fr: '' }}
        />
      );
      
      // Switch to French tab
      const tabs = screen.getAllByRole('button');
      const frenchTab = tabs.find((tab) => tab.textContent?.includes('Français'));
      await user.click(frenchTab!);
      
      expect(screen.queryByText(/This field is required/)).not.toBeInTheDocument();
    });

    it('should apply red border to textarea when required field is empty', () => {
      renderWithRouter(
        <TranslatableTextarea
          {...defaultProps}
          value={{ en: '', es: 'Hola', fr: '' }}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-red-300');
    });
  });
});
