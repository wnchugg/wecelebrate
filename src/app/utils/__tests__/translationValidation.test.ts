/**
 * Unit tests for translation validation utilities
 * 
 * Tests:
 * - Completion percentage calculation
 * - Missing translations identification
 * - Publish validation with complete translations
 * - Publish validation with missing translations
 * - Publish validation with partial translations
 * 
 * Requirements: 4.1-4.7, 5.1-5.3
 */

import { describe, it, expect } from 'vitest';
import {
  validateTranslations,
  canPublishTranslations
} from '../translationValidation';

describe('validateTranslations', () => {
  it('should return 100% completion when all translations are present', () => {
    const translations = {
      'welcomePage.title': { en: 'Welcome', es: 'Bienvenido', fr: 'Bienvenue' },
      'welcomePage.message': { en: 'Hello', es: 'Hola', fr: 'Bonjour' }
    };
    const requiredFields = ['welcomePage.title', 'welcomePage.message'];
    const availableLanguages = ['en', 'es', 'fr'];

    const result = validateTranslations(translations, requiredFields, availableLanguages);

    expect(result.isComplete).toBe(true);
    expect(result.completionPercentage).toBe(100);
    expect(result.missingTranslations).toHaveLength(0);
  });

  it('should return 0% completion when no translations are present', () => {
    const translations = {};
    const requiredFields = ['welcomePage.title', 'welcomePage.message'];
    const availableLanguages = ['en', 'es'];

    const result = validateTranslations(translations, requiredFields, availableLanguages);

    expect(result.isComplete).toBe(false);
    expect(result.completionPercentage).toBe(0);
    expect(result.missingTranslations).toHaveLength(4); // 2 fields × 2 languages
  });

  it('should calculate correct completion percentage for partial translations', () => {
    const translations = {
      'welcomePage.title': { en: 'Welcome', es: 'Bienvenido' },
      'welcomePage.message': { en: 'Hello' } // Missing Spanish
    };
    const requiredFields = ['welcomePage.title', 'welcomePage.message'];
    const availableLanguages = ['en', 'es'];

    const result = validateTranslations(translations, requiredFields, availableLanguages);

    expect(result.isComplete).toBe(false);
    expect(result.completionPercentage).toBe(75); // 3 out of 4 = 75%
    expect(result.missingTranslations).toHaveLength(1);
    expect(result.missingTranslations[0]).toEqual({
      field: 'welcomePage.message',
      language: 'es'
    });
  });

  it('should identify all missing translations', () => {
    const translations = {
      'welcomePage.title': { en: 'Welcome' }
      // Missing Spanish for title, missing both languages for message
    };
    const requiredFields = ['welcomePage.title', 'welcomePage.message'];
    const availableLanguages = ['en', 'es'];

    const result = validateTranslations(translations, requiredFields, availableLanguages);

    expect(result.missingTranslations).toHaveLength(3);
    expect(result.missingTranslations).toContainEqual({
      field: 'welcomePage.title',
      language: 'es'
    });
    expect(result.missingTranslations).toContainEqual({
      field: 'welcomePage.message',
      language: 'en'
    });
    expect(result.missingTranslations).toContainEqual({
      field: 'welcomePage.message',
      language: 'es'
    });
  });

  it('should treat empty strings as missing translations', () => {
    const translations = {
      'welcomePage.title': { en: 'Welcome', es: '' },
      'welcomePage.message': { en: '   ', es: 'Hola' } // Whitespace only
    };
    const requiredFields = ['welcomePage.title', 'welcomePage.message'];
    const availableLanguages = ['en', 'es'];

    const result = validateTranslations(translations, requiredFields, availableLanguages);

    expect(result.isComplete).toBe(false);
    expect(result.completionPercentage).toBe(50); // 2 out of 4
    expect(result.missingTranslations).toHaveLength(2);
  });

  it('should handle empty required fields array', () => {
    const translations = {
      'welcomePage.title': { en: 'Welcome' }
    };
    const requiredFields: string[] = [];
    const availableLanguages = ['en', 'es'];

    const result = validateTranslations(translations, requiredFields, availableLanguages);

    expect(result.isComplete).toBe(true);
    expect(result.completionPercentage).toBe(100);
    expect(result.missingTranslations).toHaveLength(0);
  });

  it('should handle empty available languages array', () => {
    const translations = {
      'welcomePage.title': { en: 'Welcome' }
    };
    const requiredFields = ['welcomePage.title'];
    const availableLanguages: string[] = [];

    const result = validateTranslations(translations, requiredFields, availableLanguages);

    expect(result.isComplete).toBe(true);
    expect(result.completionPercentage).toBe(100);
    expect(result.missingTranslations).toHaveLength(0);
  });

  it('should round completion percentage to nearest integer', () => {
    const translations = {
      'field1': { en: 'Text' },
      'field2': { en: 'Text' }
      // 2 out of 3 fields = 66.666...%
    };
    const requiredFields = ['field1', 'field2', 'field3'];
    const availableLanguages = ['en'];

    const result = validateTranslations(translations, requiredFields, availableLanguages);

    expect(result.completionPercentage).toBe(67); // Rounded
  });
});

describe('canPublishTranslations', () => {
  it('should allow publishing when all required default language translations are present', () => {
    const translations = {
      'welcomePage.title': { en: 'Welcome', es: 'Bienvenido' },
      'welcomePage.message': { en: 'Hello', es: 'Hola' }
    };
    const requiredFields = ['welcomePage.title', 'welcomePage.message'];
    const defaultLanguage = 'en';

    const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

    expect(result.canPublish).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('should prevent publishing when default language translations are missing', () => {
    const translations = {
      'welcomePage.title': { en: 'Welcome' },
      'welcomePage.message': { es: 'Hola' } // Missing English (default)
    };
    const requiredFields = ['welcomePage.title', 'welcomePage.message'];
    const defaultLanguage = 'en';

    const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

    expect(result.canPublish).toBe(false);
    expect(result.reason).toContain('welcomePage.message');
    expect(result.reason).toContain('en');
  });

  it('should allow publishing with incomplete non-default language translations', () => {
    const translations = {
      'welcomePage.title': { en: 'Welcome' }, // Spanish missing
      'welcomePage.message': { en: 'Hello' }  // Spanish missing
    };
    const requiredFields = ['welcomePage.title', 'welcomePage.message'];
    const defaultLanguage = 'en';

    const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

    expect(result.canPublish).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('should prevent publishing when multiple default language translations are missing', () => {
    const translations = {
      'welcomePage.title': { es: 'Bienvenido' },
      'welcomePage.message': { es: 'Hola' },
      'welcomePage.button': { es: 'Botón' }
    };
    const requiredFields = ['welcomePage.title', 'welcomePage.message', 'welcomePage.button'];
    const defaultLanguage = 'en';

    const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

    expect(result.canPublish).toBe(false);
    expect(result.reason).toContain('welcomePage.title');
    expect(result.reason).toContain('welcomePage.message');
    expect(result.reason).toContain('welcomePage.button');
  });

  it('should treat empty strings as missing translations', () => {
    const translations = {
      'welcomePage.title': { en: '' },
      'welcomePage.message': { en: '   ' } // Whitespace only
    };
    const requiredFields = ['welcomePage.title', 'welcomePage.message'];
    const defaultLanguage = 'en';

    const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

    expect(result.canPublish).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('should handle empty required fields array', () => {
    const translations = {
      'welcomePage.title': { en: 'Welcome' }
    };
    const requiredFields: string[] = [];
    const defaultLanguage = 'en';

    const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

    expect(result.canPublish).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('should work with non-English default language', () => {
    const translations = {
      'welcomePage.title': { es: 'Bienvenido', en: 'Welcome' },
      'welcomePage.message': { es: 'Hola' } // English missing, but Spanish is default
    };
    const requiredFields = ['welcomePage.title', 'welcomePage.message'];
    const defaultLanguage = 'es';

    const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

    expect(result.canPublish).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('should provide clear error message listing all missing fields', () => {
    const translations = {
      'field1': { es: 'Texto' },
      'field2': { es: 'Texto' }
    };
    const requiredFields = ['field1', 'field2', 'field3'];
    const defaultLanguage = 'en';

    const result = canPublishTranslations(translations, requiredFields, defaultLanguage);

    expect(result.canPublish).toBe(false);
    expect(result.reason).toContain('field1');
    expect(result.reason).toContain('field2');
    expect(result.reason).toContain('field3');
    expect(result.reason).toContain('en');
  });
});
