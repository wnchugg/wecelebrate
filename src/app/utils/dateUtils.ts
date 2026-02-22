/**
 * Date and Time Utility Functions
 * Provides utilities for date/time formatting, parsing, and manipulation
 */

/**
 * Format date to readable string
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return dateObj.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Format date to short string (MM/DD/YYYY)
 */
export function formatDateShort(date: Date | string | number): string {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toISOString().split('T')[0];
}

/**
 * Format time to readable string
 */
export function formatTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  return dateObj.toLocaleTimeString(undefined, defaultOptions);
}

/**
 * Format datetime to readable string
 */
export function formatDateTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid DateTime';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  return dateObj.toLocaleString(undefined, defaultOptions);
}

/**
 * Format date relative to now (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);
  
  const isPast = diffMs < 0;
  const abs = Math.abs;
  
  if (abs(diffSec) < 60) {
    return isPast ? 'just now' : 'in a moment';
  } else if (abs(diffMin) < 60) {
    const unit = abs(diffMin) === 1 ? 'minute' : 'minutes';
    return isPast ? `${abs(diffMin)} ${unit} ago` : `in ${abs(diffMin)} ${unit}`;
  } else if (abs(diffHour) < 24) {
    const unit = abs(diffHour) === 1 ? 'hour' : 'hours';
    return isPast ? `${abs(diffHour)} ${unit} ago` : `in ${abs(diffHour)} ${unit}`;
  } else if (abs(diffDay) < 7) {
    const unit = abs(diffDay) === 1 ? 'day' : 'days';
    return isPast ? `${abs(diffDay)} ${unit} ago` : `in ${abs(diffDay)} ${unit}`;
  } else if (abs(diffWeek) < 4) {
    const unit = abs(diffWeek) === 1 ? 'week' : 'weeks';
    return isPast ? `${abs(diffWeek)} ${unit} ago` : `in ${abs(diffWeek)} ${unit}`;
  } else if (abs(diffMonth) < 12) {
    const unit = abs(diffMonth) === 1 ? 'month' : 'months';
    return isPast ? `${abs(diffMonth)} ${unit} ago` : `in ${abs(diffMonth)} ${unit}`;
  } else {
    const unit = abs(diffYear) === 1 ? 'year' : 'years';
    return isPast ? `${abs(diffYear)} ${unit} ago` : `in ${abs(diffYear)} ${unit}`;
  }
}

/**
 * Parse date from string
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Check if date is valid
 */
export function isValidDate(date: any): boolean {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const dateObj = new Date(date);
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
  const dateObj = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date | string | number): boolean {
  const dateObj = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    dateObj.getDate() === tomorrow.getDate() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string | number): boolean {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj.getTime() < now.getTime();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string | number): boolean {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj.getTime() > now.getTime();
}

/**
 * Check if date is between two dates
 */
export function isBetween(
  date: Date | string | number,
  start: Date | string | number,
  end: Date | string | number
): boolean {
  const dateObj = new Date(date);
  const startObj = new Date(start);
  const endObj = new Date(end);
  
  return dateObj.getTime() >= startObj.getTime() && dateObj.getTime() <= endObj.getTime();
}

/**
 * Add days to date
 */
export function addDays(date: Date | string | number, days: number): Date {
  const dateObj = new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
}

/**
 * Add months to date
 */
export function addMonths(date: Date | string | number, months: number): Date {
  const dateObj = new Date(date);
  dateObj.setMonth(dateObj.getMonth() + months);
  return dateObj;
}

/**
 * Add years to date
 */
export function addYears(date: Date | string | number, years: number): Date {
  const dateObj = new Date(date);
  dateObj.setFullYear(dateObj.getFullYear() + years);
  return dateObj;
}

/**
 * Subtract days from date
 */
export function subtractDays(date: Date | string | number, days: number): Date {
  return addDays(date, -days);
}

/**
 * Subtract months from date
 */
export function subtractMonths(date: Date | string | number, months: number): Date {
  return addMonths(date, -months);
}

/**
 * Subtract years from date
 */
export function subtractYears(date: Date | string | number, years: number): Date {
  return addYears(date, -years);
}

/**
 * Get start of day
 */
export function startOfDay(date: Date | string | number): Date {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date | string | number): Date {
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date | string | number): Date {
  const dateObj = new Date(date);
  dateObj.setDate(1);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date | string | number): Date {
  const dateObj = new Date(date);
  dateObj.setMonth(dateObj.getMonth() + 1);
  dateObj.setDate(0);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
}

/**
 * Get start of year
 */
export function startOfYear(date: Date | string | number): Date {
  const dateObj = new Date(date);
  dateObj.setMonth(0);
  dateObj.setDate(1);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
}

/**
 * Get end of year
 */
export function endOfYear(date: Date | string | number): Date {
  const dateObj = new Date(date);
  dateObj.setMonth(11);
  dateObj.setDate(31);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
}

/**
 * Get difference in days
 */
export function diffInDays(date1: Date | string | number, date2: Date | string | number): number {
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);
  const diffMs = dateObj2.getTime() - dateObj1.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get difference in hours
 */
export function diffInHours(date1: Date | string | number, date2: Date | string | number): number {
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);
  const diffMs = dateObj2.getTime() - dateObj1.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60));
}

/**
 * Get difference in minutes
 */
export function diffInMinutes(date1: Date | string | number, date2: Date | string | number): number {
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);
  const diffMs = dateObj2.getTime() - dateObj1.getTime();
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Get difference in seconds
 */
export function diffInSeconds(date1: Date | string | number, date2: Date | string | number): number {
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);
  const diffMs = dateObj2.getTime() - dateObj1.getTime();
  return Math.floor(diffMs / 1000);
}

/**
 * Get age from birthdate
 */
export function getAge(birthdate: Date | string | number): number {
  const birthdateObj = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthdateObj.getFullYear();
  const monthDiff = today.getMonth() - birthdateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateObj.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get days in month
 */
export function getDaysInMonth(date: Date | string | number): number {
  const dateObj = new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
}

/**
 * Get day of week name
 */
export function getDayName(date: Date | string | number, short: boolean = false): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(undefined, {
    weekday: short ? 'short' : 'long',
  });
}

/**
 * Get month name
 */
export function getMonthName(date: Date | string | number, short: boolean = false): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(undefined, {
    month: short ? 'short' : 'long',
  });
}

/**
 * Get week number of year
 */
export function getWeekNumber(date: Date | string | number): number {
  const dateObj = new Date(date);
  const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
  const pastDaysOfYear = (dateObj.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Check if year is leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get quarter of year
 */
export function getQuarter(date: Date | string | number): number {
  const dateObj = new Date(date);
  return Math.floor(dateObj.getMonth() / 3) + 1;
}

/**
 * Format duration in milliseconds
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Parse duration string to milliseconds
 */
export function parseDuration(duration: string): number {
  const regex = /(\d+)([smhd])/g;
  let match;
  let ms = 0;
  
  while ((match = regex.exec(duration)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's':
        ms += value * 1000;
        break;
      case 'm':
        ms += value * 60 * 1000;
        break;
      case 'h':
        ms += value * 60 * 60 * 1000;
        break;
      case 'd':
        ms += value * 24 * 60 * 60 * 1000;
        break;
    }
  }
  
  return ms;
}

/**
 * Get timestamp
 */
export function getTimestamp(date?: Date | string | number): number {
  return date ? new Date(date).getTime() : Date.now();
}

/**
 * Format timestamp to date
 */
export function fromTimestamp(timestamp: number): Date {
  return new Date(timestamp);
}

/**
 * Get UTC date
 */
export function toUTC(date: Date | string | number): Date {
  const dateObj = new Date(date);
  return new Date(
    Date.UTC(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
      dateObj.getHours(),
      dateObj.getMinutes(),
      dateObj.getSeconds(),
      dateObj.getMilliseconds()
    )
  );
}

/**
 * Get local date from UTC
 */
export function fromUTC(date: Date | string | number): Date {
  const dateObj = new Date(date);
  return new Date(
    dateObj.getUTCFullYear(),
    dateObj.getUTCMonth(),
    dateObj.getUTCDate(),
    dateObj.getUTCHours(),
    dateObj.getUTCMinutes(),
    dateObj.getUTCSeconds(),
    dateObj.getUTCMilliseconds()
  );
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(): number {
  return -new Date().getTimezoneOffset() / 60;
}

/**
 * Get timezone name
 */
export function getTimezoneName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert date to a specific timezone
 * @param date - The date to convert
 * @param timezone - IANA timezone identifier (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo')
 * @returns Date object representing the same moment in time, adjusted for the specified timezone
 */
export function convertToSiteTimezone(date: Date, timezone: string): Date {
  // Convert the date to a string in the target timezone, then parse it back
  // This preserves the visual representation of the date/time in that timezone
  const dateString = date.toLocaleString('en-US', { timeZone: timezone });
  return new Date(dateString);
}

/**
 * Add days to a date in a specific timezone
 * @param date - The starting date
 * @param days - Number of days to add (can be negative to subtract)
 * @param timezone - IANA timezone identifier (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo')
 * @returns Date object with the days added in the context of the specified timezone
 */
export function addDaysInTimezone(date: Date, days: number, timezone: string): Date {
  // First convert to the target timezone
  const localDate = convertToSiteTimezone(date, timezone);
  // Then add the days
  localDate.setDate(localDate.getDate() + days);
  return localDate;
}
