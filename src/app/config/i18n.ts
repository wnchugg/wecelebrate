/**
 * Internationalization Configuration
 * 
 * Default i18n configuration constants for the application.
 * These defaults are used when Site_Config does not specify i18n settings.
 * 
 * Requirements: 13.1-13.9
 */

import type { I18nConfig } from '../hooks/useSite';

/**
 * Default internationalization configuration
 * 
 * Provides sensible defaults for:
 * - Currency: USD with symbol display and 2 decimal places
 * - Timezone: America/New_York (US Eastern Time)
 * - Date format: MDY (Month/Day/Year - US convention)
 * - Time format: 12h (12-hour with AM/PM)
 * - Name order: western (Given name first)
 * - Name format: casual (No titles)
 * 
 * These defaults can be overridden by Site_Config.i18n settings.
 */
export const DEFAULT_I18N_CONFIG: I18nConfig = {
  // Currency settings (Requirements 13.1, 13.2, 13.3)
  currency: 'USD',
  currencyDisplay: 'symbol', // Display as $100 instead of USD 100 or 100 US Dollars
  decimalPlaces: 2, // Standard for most currencies except JPY, KRW
  
  // Date and time settings (Requirements 13.4, 13.5, 13.6)
  timezone: 'America/New_York', // US Eastern Time as default
  dateFormat: 'MDY', // US convention: Month/Day/Year
  timeFormat: '12h', // 12-hour format with AM/PM
  
  // Name formatting settings (Requirements 13.7, 13.8)
  nameOrder: 'western', // Given name first (e.g., John Smith)
  nameFormat: 'casual', // No titles by default
};

/**
 * Get i18n configuration with fallback to defaults
 * 
 * @param siteI18n - Optional i18n configuration from Site_Config
 * @returns Complete i18n configuration with defaults applied for missing fields
 * 
 * Requirements: 13.9
 */
export function getI18nConfig(siteI18n?: Partial<I18nConfig>): I18nConfig {
  if (!siteI18n) {
    return DEFAULT_I18N_CONFIG;
  }
  
  return {
    currency: siteI18n.currency ?? DEFAULT_I18N_CONFIG.currency,
    currencyDisplay: siteI18n.currencyDisplay ?? DEFAULT_I18N_CONFIG.currencyDisplay,
    decimalPlaces: siteI18n.decimalPlaces ?? DEFAULT_I18N_CONFIG.decimalPlaces,
    timezone: siteI18n.timezone ?? DEFAULT_I18N_CONFIG.timezone,
    dateFormat: siteI18n.dateFormat ?? DEFAULT_I18N_CONFIG.dateFormat,
    timeFormat: siteI18n.timeFormat ?? DEFAULT_I18N_CONFIG.timeFormat,
    nameOrder: siteI18n.nameOrder ?? DEFAULT_I18N_CONFIG.nameOrder,
    nameFormat: siteI18n.nameFormat ?? DEFAULT_I18N_CONFIG.nameFormat,
  };
}
