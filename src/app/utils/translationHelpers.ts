/**
 * Translation helper utilities for parameter interpolation
 * 
 * This module provides utilities for inserting dynamic values into translated strings.
 * It supports placeholder replacement in the format {paramName} with actual values.
 */

import { TranslationKey } from '../i18n/translations';

/**
 * Translates a key and replaces placeholder tokens with parameter values
 * 
 * @param t - Translation function that takes a TranslationKey and returns a string
 * @param key - The translation key to translate
 * @param params - Object containing parameter values to interpolate into the translation
 * @returns The translated string with all placeholders replaced by their corresponding parameter values
 * 
 * @example
 * ```typescript
 * const t = (key: TranslationKey) => translations.en[key];
 * 
 * // Single placeholder
 * translateWithParams(t, 'shipping.freeShippingThreshold', { amount: '$50' })
 * // Returns: "Free shipping on orders over $50"
 * 
 * // Multiple placeholders
 * translateWithParams(t, 'shipping.estimatedDelivery', { date: 'Dec 25, 2024' })
 * // Returns: "Estimated delivery: Dec 25, 2024"
 * 
 * // Missing parameter - placeholder remains unchanged
 * translateWithParams(t, 'shipping.trackingNumber', {})
 * // Returns: "Tracking number: {number}"
 * ```
 * 
 * Requirements:
 * - 7.1: Provides translateWithParams utility function
 * - 7.2: Replaces placeholder tokens with parameter values
 * - 7.3: Handles multiple placeholders in a single translation
 * - 7.4: Leaves placeholders unchanged when parameter is not found
 */
export function translateWithParams(
  t: (key: TranslationKey) => string,
  key: TranslationKey,
  params: Record<string, string | number>
): string {
  let text = t(key);
  
  // Replace each parameter placeholder with its value
  Object.entries(params).forEach(([paramKey, value]) => {
    // Use split/join to avoid special character issues with $ in String.replace
    // String.replace treats $ specially (e.g., $&, $`, $$), so we use split/join instead
    const placeholder = `{${paramKey}}`;
    const replacement = String(value);
    text = text.split(placeholder).join(replacement);
  });
  
  return text;
}
