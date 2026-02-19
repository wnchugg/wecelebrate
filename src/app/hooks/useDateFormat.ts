import { useLanguage } from '../context/LanguageContext';

interface DateFormatResult {
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatShortDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  formatRelative: (date: Date | string) => string;
}

/**
 * Hook for date and time formatting utilities
 * 
 * Provides locale-aware date and time formatting functions using Intl.DateTimeFormat
 * and Intl.RelativeTimeFormat. Automatically uses the current language from LanguageContext.
 * 
 * Time format behavior:
 * - English locales (en, en-GB): 12-hour format with AM/PM
 * - All other locales: 24-hour format
 * 
 * @returns Date formatting utilities
 * 
 * @example
 * const { formatDate, formatShortDate, formatTime, formatRelative } = useDateFormat();
 * console.log(formatDate(new Date())); // "January 15, 2024"
 * console.log(formatShortDate(new Date())); // "Jan 15, 2024"
 * console.log(formatTime(new Date())); // "3:45 PM" (en) or "15:45" (other locales)
 * console.log(formatRelative(new Date())); // "today"
 */
export function useDateFormat(): DateFormatResult {
  const { currentLanguage } = useLanguage();
  const locale = currentLanguage.code;
  
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date value: ${date}`);
        return 'Invalid Date';
      }
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
      }).format(dateObj);
    } catch (error) {
      console.warn(`Error formatting date: ${error}`);
      return 'Invalid Date';
    }
  };
  
  const formatShortDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date value: ${date}`);
        return 'Invalid Date';
      }
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(dateObj);
    } catch (error) {
      console.warn(`Error formatting short date: ${error}`);
      return 'Invalid Date';
    }
  };
  
  const formatTime = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date value: ${date}`);
        return 'Invalid Date';
      }
      // Use 12-hour format for English locales, 24-hour for others
      const hour12 = locale.startsWith('en');
      return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: 'numeric',
        hour12,
      }).format(dateObj);
    } catch (error) {
      console.warn(`Error formatting time: ${error}`);
      return 'Invalid Date';
    }
  };
  
  const formatRelative = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date value: ${date}`);
        return 'Invalid Date';
      }
      
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      const diffInMs = dateObj.getTime() - Date.now();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      // Handle today
      if (Math.abs(diffInDays) < 1) {
        return rtf.format(0, 'day'); // Will return "today" with numeric: 'auto'
      }
      
      // Handle days (within a week)
      if (Math.abs(diffInDays) < 7) {
        return rtf.format(diffInDays, 'day');
      }
      
      // Handle weeks (within a month)
      if (Math.abs(diffInDays) < 30) {
        const diffInWeeks = Math.floor(diffInDays / 7);
        return rtf.format(diffInWeeks, 'week');
      }
      
      // Handle months
      const diffInMonths = Math.floor(diffInDays / 30);
      return rtf.format(diffInMonths, 'month');
    } catch (error) {
      console.warn(`Error formatting relative time: ${error}`);
      return 'Invalid Date';
    }
  };
  
  return {
    formatDate,
    formatShortDate,
    formatTime,
    formatRelative,
  };
}
