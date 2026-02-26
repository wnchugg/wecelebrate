/**
 * Translation validation utilities for multi-language content management
 * 
 * Provides functions to:
 * - Calculate translation completion percentage
 * - Identify missing translations
 * - Validate translations before publishing
 */

export interface TranslationValidationResult {
  isComplete: boolean;
  missingTranslations: Array<{ field: string; language: string }>;
  completionPercentage: number;
}

export interface PublishValidationResult {
  canPublish: boolean;
  reason?: string;
}

/**
 * Validates translations and calculates completion metrics
 * 
 * @param translations - Translation object with structure: field → language → text
 * @param requiredFields - Array of field paths that must be translated
 * @param availableLanguages - Array of language codes enabled for the site
 * @returns Validation result with completion percentage and missing translations
 * 
 * Requirements: 4.1, 4.4, 4.5, 4.6, 4.7
 */
export function validateTranslations(
  translations: Record<string, Record<string, string>>,
  requiredFields: string[],
  availableLanguages: string[]
): TranslationValidationResult {
  const missingTranslations: Array<{ field: string; language: string }> = [];
  
  // Calculate total expected translations
  const totalExpected = requiredFields.length * availableLanguages.length;
  
  if (totalExpected === 0) {
    return {
      isComplete: true,
      missingTranslations: [],
      completionPercentage: 100
    };
  }
  
  let completedCount = 0;
  
  // Check each required field for each available language
  for (const field of requiredFields) {
    for (const language of availableLanguages) {
      const translation = translations[field]?.[language];
      
      if (translation && translation.trim().length > 0) {
        completedCount++;
      } else {
        missingTranslations.push({ field, language });
      }
    }
  }
  
  // Calculate completion percentage (0-100)
  const completionPercentage = Math.round((completedCount / totalExpected) * 100);
  
  return {
    isComplete: missingTranslations.length === 0,
    missingTranslations,
    completionPercentage
  };
}

/**
 * Validates if translations can be published
 * 
 * Publishing requires all required fields to have translations in the default language.
 * Non-default language translations can be incomplete.
 * 
 * @param translations - Translation object with nested structure
 * @param requiredFields - Array of field paths that must be translated (dot-notation)
 * @param defaultLanguage - The default language code for the site
 * @returns Publish eligibility with reason if cannot publish
 * 
 * Requirements: 5.1, 5.2, 5.3
 */
export function canPublishTranslations(
  translations: Record<string, unknown>,
  requiredFields: string[],
  defaultLanguage: string
): PublishValidationResult {
  const missingDefaultTranslations: string[] = [];

  // Check each required field for default language translation
  for (const field of requiredFields) {
    // Handle dot-notation paths (e.g., 'welcomePage.title')
    const parts = field.split('.');
    let current: any = translations;
    
    // Navigate through nested structure
    for (const part of parts) {
      if (!current || typeof current !== 'object') {
        current = undefined;
        break;
      }
      current = current[part];
    }

    // Check if we have a translation object with the default language
    if (!current || typeof current !== 'object') {
      missingDefaultTranslations.push(field);
      continue;
    }

    const translation = current[defaultLanguage];
    
    if (!translation || typeof translation !== 'string' || translation.trim().length === 0) {
      missingDefaultTranslations.push(field);
    }
  }
  
  if (missingDefaultTranslations.length > 0) {
    const fieldList = missingDefaultTranslations.join(', ');
    return {
      canPublish: false,
      reason: `Missing required ${defaultLanguage} translations for: ${fieldList}`
    };
  }
  
  return {
    canPublish: true
  };
}
