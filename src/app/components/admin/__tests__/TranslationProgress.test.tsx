/**
 * TranslationProgress Component Tests
 * 
 * Coverage:
 * - Completion percentage calculation
 * - Progress bar rendering
 * - Color coding (complete vs incomplete)
 * - Count display (completed/total fields)
 * 
 * Requirements: 4.1-4.8
 */

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/helpers';
import { TranslationProgress } from '../TranslationProgress';

describe('TranslationProgress Component', () => {
  const requiredFields = ['field1', 'field2', 'field3', 'field4'];

  describe('Rendering', () => {
    it('should render component title', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('Translation Progress')).toBeInTheDocument();
    });

    it('should render description', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('Track completion status for each language')).toBeInTheDocument();
    });

    it('should render progress card for each available language', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en', 'es', 'fr']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('English (US)')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
    });

    it('should render language flags', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en', 'es']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
      expect(screen.getByText('🇪🇸')).toBeInTheDocument();
    });
  });

  describe('Completion Percentage Calculation', () => {
    it('should calculate 0% for no translations', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should calculate 100% for all fields translated', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: 'Text 2' },
        field3: { en: 'Text 3' },
        field4: { en: 'Text 4' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should calculate 50% for half fields translated', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: 'Text 2' },
        field3: { en: '' },
        field4: { en: '' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should calculate 25% for one of four fields translated', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: '' },
        field3: { en: '' },
        field4: { en: '' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should calculate 75% for three of four fields translated', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: 'Text 2' },
        field3: { en: 'Text 3' },
        field4: { en: '' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should ignore whitespace-only translations', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: '   ' },
        field3: { en: '\t\n' },
        field4: { en: '' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should calculate percentage independently for each language', () => {
      const translations = {
        field1: { en: 'Text 1', es: 'Texto 1' },
        field2: { en: 'Text 2', es: '' },
        field3: { en: '', es: 'Texto 3' },
        field4: { en: '', es: '' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en', 'es']}
          requiredFields={requiredFields}
        />
      );
      
      const percentages = screen.getAllByText(/\d+%/);
      expect(percentages).toHaveLength(2);
      expect(percentages[0]).toHaveTextContent('50%'); // English: 2/4
      expect(percentages[1]).toHaveTextContent('50%'); // Spanish: 2/4
    });

    it('should return 100% when no required fields', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en']}
          requiredFields={[]}
        />
      );
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Count Display', () => {
    it('should display 0 of N for no translations', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('0 of 4 fields translated')).toBeInTheDocument();
    });

    it('should display N of N for all translations', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: 'Text 2' },
        field3: { en: 'Text 3' },
        field4: { en: 'Text 4' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('4 of 4 fields translated')).toBeInTheDocument();
    });

    it('should display correct count for partial translations', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: 'Text 2' },
        field3: { en: '' },
        field4: { en: '' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('2 of 4 fields translated')).toBeInTheDocument();
    });

    it('should display different counts for different languages', () => {
      const translations = {
        field1: { en: 'Text 1', es: 'Texto 1', fr: 'Texte 1' },
        field2: { en: 'Text 2', es: 'Texto 2', fr: '' },
        field3: { en: 'Text 3', es: '', fr: '' },
        field4: { en: '', es: '', fr: '' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en', 'es', 'fr']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('3 of 4 fields translated')).toBeInTheDocument(); // English
      expect(screen.getByText('2 of 4 fields translated')).toBeInTheDocument(); // Spanish
      expect(screen.getByText('1 of 4 fields translated')).toBeInTheDocument(); // French
    });
  });

  describe('Progress Bar Rendering', () => {
    it('should render progress bar for each language', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en', 'es']}
          requiredFields={requiredFields}
        />
      );
      
      const progressBars = screen.getAllByRole('generic').filter(
        (el) => el.className.includes('bg-gray-200') && el.className.includes('rounded-full')
      );
      
      expect(progressBars.length).toBeGreaterThanOrEqual(2);
    });

    it('should set progress bar width to 0% for no translations', () => {
      const { container } = renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      const progressBar = container.querySelector('[style*="width: 0%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should set progress bar width to 100% for complete translations', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: 'Text 2' },
        field3: { en: 'Text 3' },
        field4: { en: 'Text 4' },
      };
      
      const { container } = renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      const progressBar = container.querySelector('[style*="width: 100%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should set progress bar width to 50% for half translations', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: 'Text 2' },
        field3: { en: '' },
        field4: { en: '' },
      };
      
      const { container } = renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      const progressBar = container.querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Color Coding', () => {
    it('should use green color for 100% completion', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: 'Text 2' },
        field3: { en: 'Text 3' },
        field4: { en: 'Text 4' },
      };
      
      const { container } = renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      // Check for green progress bar
      const progressBar = container.querySelector('.bg-green-500');
      expect(progressBar).toBeInTheDocument();
      
      // Check for green text
      const percentage = screen.getByText('100%');
      expect(percentage).toHaveClass('text-green-700');
      
      // Check for green background on the card
      const card = container.querySelector('.bg-green-50');
      expect(card).toBeInTheDocument();
    });

    it('should use yellow color for 50-99% completion', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: 'Text 2' },
        field3: { en: 'Text 3' },
        field4: { en: '' },
      };
      
      const { container } = renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      // Check for yellow progress bar
      const progressBar = container.querySelector('.bg-yellow-500');
      expect(progressBar).toBeInTheDocument();
      
      // Check for yellow text
      const percentage = screen.getByText('75%');
      expect(percentage).toHaveClass('text-yellow-700');
      
      // Check for yellow background on the card
      const card = container.querySelector('.bg-yellow-50');
      expect(card).toBeInTheDocument();
    });

    it('should use red color for 0-49% completion', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: '' },
        field3: { en: '' },
        field4: { en: '' },
      };
      
      const { container } = renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      // Check for red progress bar
      const progressBar = container.querySelector('.bg-red-500');
      expect(progressBar).toBeInTheDocument();
      
      // Check for red text
      const percentage = screen.getByText('25%');
      expect(percentage).toHaveClass('text-red-700');
      
      // Check for red background on the card
      const card = container.querySelector('.bg-red-50');
      expect(card).toBeInTheDocument();
    });

    it('should use red color for 0% completion', () => {
      const { container } = renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      // Check for red progress bar
      const progressBar = container.querySelector('.bg-red-500');
      expect(progressBar).toBeInTheDocument();
      
      // Check for red text
      const percentage = screen.getByText('0%');
      expect(percentage).toHaveClass('text-red-700');
    });
  });

  describe('Status Badges', () => {
    it('should show "Complete" badge for 100% completion', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: 'Text 2' },
        field3: { en: 'Text 3' },
        field4: { en: 'Text 4' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('should show "Not started" badge for 0% completion', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('Not started')).toBeInTheDocument();
    });

    it('should not show status badge for partial completion', () => {
      const translations = {
        field1: { en: 'Text 1' },
        field2: { en: '' },
        field3: { en: '' },
        field4: { en: '' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.queryByText('Complete')).not.toBeInTheDocument();
      expect(screen.queryByText('Not started')).not.toBeInTheDocument();
    });
  });

  describe('Summary Message', () => {
    it('should show success message when all languages are complete', () => {
      const translations = {
        field1: { en: 'Text 1', es: 'Texto 1' },
        field2: { en: 'Text 2', es: 'Texto 2' },
        field3: { en: 'Text 3', es: 'Texto 3' },
        field4: { en: 'Text 4', es: 'Texto 4' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en', 'es']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText(/All languages are fully translated/)).toBeInTheDocument();
      expect(screen.getByText(/You can publish your changes/)).toBeInTheDocument();
    });

    it('should show warning message when some languages are incomplete', () => {
      const translations = {
        field1: { en: 'Text 1', es: '' },
        field2: { en: 'Text 2', es: '' },
        field3: { en: 'Text 3', es: '' },
        field4: { en: 'Text 4', es: '' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en', 'es']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText(/Complete all required fields in your default language/)).toBeInTheDocument();
    });

    it('should show summary message when languages are available', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      const summarySection = screen.getByText(/Complete all required fields/).closest('div');
      expect(summarySection).toHaveClass('bg-blue-50');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty available languages array', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={[]}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('Translation Progress')).toBeInTheDocument();
      expect(screen.queryByText('English (US)')).not.toBeInTheDocument();
    });

    it('should handle missing field in translations', () => {
      const translations = {
        field1: { en: 'Text 1' },
        // field2 is missing
        field3: { en: 'Text 3' },
        field4: { en: 'Text 4' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en']}
          requiredFields={requiredFields}
        />
      );
      
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('3 of 4 fields translated')).toBeInTheDocument();
    });

    it('should handle missing language in field translations', () => {
      const translations = {
        field1: { en: 'Text 1' }, // Spanish missing
        field2: { en: 'Text 2', es: 'Texto 2' },
        field3: { en: 'Text 3', es: 'Texto 3' },
        field4: { en: 'Text 4', es: 'Texto 4' },
      };
      
      renderWithRouter(
        <TranslationProgress
          translations={translations}
          availableLanguages={['en', 'es']}
          requiredFields={requiredFields}
        />
      );
      
      const percentages = screen.getAllByText(/\d+%/);
      expect(percentages[0]).toHaveTextContent('100%'); // English
      expect(percentages[1]).toHaveTextContent('75%'); // Spanish
    });

    it('should handle unknown language codes gracefully', () => {
      renderWithRouter(
        <TranslationProgress
          translations={{}}
          availableLanguages={['unknown-lang']}
          requiredFields={requiredFields}
        />
      );
      
      // Should still render without crashing
      expect(screen.getByText('Translation Progress')).toBeInTheDocument();
    });
  });
});
