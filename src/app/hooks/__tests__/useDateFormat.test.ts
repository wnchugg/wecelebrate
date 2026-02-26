/**
 * useDateFormat Hook Test Suite
 * Tests for src/app/hooks/useDateFormat.ts
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDateFormat } from '../useDateFormat';
import { useLanguage } from '../../context/LanguageContext';

// Mock the useLanguage hook
vi.mock('../../context/LanguageContext', () => ({
  useLanguage: vi.fn()
}));

describe('useDateFormat Hook', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should format date with full month name', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = result.current.formatDate(date);

      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should format short date with abbreviated month', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = result.current.formatShortDate(date);

      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should format time with hours and minutes', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T15:45:00Z');
      const formatted = result.current.formatTime(date);

      // Should contain time components (format varies by timezone)
      expect(formatted).toMatch(/\d+:\d+/);
    });

    it('should format relative time for today', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date();
      const formatted = result.current.formatRelative(date);

      // Should contain "today" or "yesterday" depending on exact timing
      expect(formatted).toMatch(/today|yesterday/i);
    });
  });

  describe('Locale-Specific Formatting', () => {
    it('should format date in English (US)', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-03-15T12:00:00Z');
      const formatted = result.current.formatDate(date);

      expect(formatted).toContain('March');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should format date in French', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'fr', name: 'Français', flag: '🇫🇷' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-03-15T12:00:00Z');
      const formatted = result.current.formatDate(date);

      // French uses "mars" for March
      expect(formatted).toContain('mars');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should format date in Japanese', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'ja', name: '日本語', flag: '🇯🇵' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-03-15T12:00:00Z');
      const formatted = result.current.formatDate(date);

      // Japanese date format includes year, month, day
      expect(formatted).toContain('2024');
      expect(formatted).toContain('15');
    });

    it('should format date in German', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-03-15T12:00:00Z');
      const formatted = result.current.formatDate(date);

      // German uses "März" for March
      expect(formatted).toContain('März');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('Time Format - 12h vs 24h', () => {
    it('should use 12-hour format for English (US)', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T15:45:00Z');
      const formatted = result.current.formatTime(date);

      // 12-hour format should contain AM or PM
      expect(formatted).toMatch(/AM|PM/i);
    });

    it('should use 12-hour format for English (UK)', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T15:45:00Z');
      const formatted = result.current.formatTime(date);

      // 12-hour format should contain AM or PM
      expect(formatted).toMatch(/AM|PM|am|pm/i);
    });

    it('should use 24-hour format for French', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'fr', name: 'Français', flag: '🇫🇷' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T15:45:00Z');
      const formatted = result.current.formatTime(date);

      // 24-hour format should NOT contain AM or PM
      expect(formatted).not.toMatch(/AM|PM/i);
      // Should contain time in 24-hour format
      expect(formatted).toMatch(/\d+:\d+/);
    });

    it('should use 24-hour format for German', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T15:45:00Z');
      const formatted = result.current.formatTime(date);

      // 24-hour format should NOT contain AM or PM
      expect(formatted).not.toMatch(/AM|PM/i);
      expect(formatted).toMatch(/\d+:\d+/);
    });

    it('should use 24-hour format for Japanese', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'ja', name: '日本語', flag: '🇯🇵' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T15:45:00Z');
      const formatted = result.current.formatTime(date);

      // 24-hour format should NOT contain AM or PM
      expect(formatted).not.toMatch(/AM|PM/i);
      expect(formatted).toMatch(/\d+:\d+/);
    });

    it('should use 24-hour format for Spanish', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'es', name: 'Español', flag: '🇪🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T15:45:00Z');
      const formatted = result.current.formatTime(date);

      // 24-hour format should NOT contain AM or PM
      expect(formatted).not.toMatch(/AM|PM/i);
      expect(formatted).toMatch(/\d+:\d+/);
    });
  });

  describe('Relative Time Formatting', () => {
    it('should format today as "today"', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date();
      const formatted = result.current.formatRelative(date);

      expect(formatted).toContain('today');
    });

    it('should format yesterday', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formatted = result.current.formatRelative(yesterday);

      expect(formatted).toMatch(/yesterday|1 day ago/i);
    });

    it('should format tomorrow', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formatted = result.current.formatRelative(tomorrow);

      expect(formatted).toMatch(/tomorrow|in 1 day/i);
    });

    it('should format days ago', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const formatted = result.current.formatRelative(threeDaysAgo);

      expect(formatted).toMatch(/3 days ago/i);
    });

    it('should format weeks ago', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const formatted = result.current.formatRelative(twoWeeksAgo);

      expect(formatted).toMatch(/2 weeks ago/i);
    });

    it('should format months ago', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
      const formatted = result.current.formatRelative(twoMonthsAgo);

      expect(formatted).toMatch(/2 months ago/i);
    });
  });

  describe('String Date Input', () => {
    it('should accept ISO string dates', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatDate('2024-01-15T12:00:00Z');

      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should accept date strings in formatShortDate', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatShortDate('2024-01-15T12:00:00Z');

      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should accept date strings in formatTime', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatTime('2024-01-15T15:45:00Z');

      expect(formatted).toMatch(/\d+:\d+/);
    });

    it('should accept date strings in formatRelative', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const dateStr = new Date().toISOString();
      const formatted = result.current.formatRelative(dateStr);

      // Should contain "today" or "yesterday" depending on exact timing
      expect(formatted).toMatch(/today|yesterday/i);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid date strings', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatDate('invalid-date');

      expect(formatted).toBe('Invalid Date');
    });

    it('should handle invalid date objects', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatDate(new Date('invalid'));

      expect(formatted).toBe('Invalid Date');
    });

    it('should handle null date in formatDate', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatDate(null as any);

      expect(formatted).toBe('Invalid Date');
    });

    it('should handle undefined date in formatShortDate', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatShortDate(undefined as any);

      expect(formatted).toBe('Invalid Date');
    });

    it('should handle very old dates', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const oldDate = new Date('1900-01-01T00:00:00Z');
      const formatted = result.current.formatDate(oldDate);

      // Date might be formatted as Dec 31, 1899 due to timezone conversion
      expect(formatted).toMatch(/1899|1900/);
    });

    it('should handle future dates', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const futureDate = new Date('2099-12-31T23:59:59Z');
      const formatted = result.current.formatDate(futureDate);

      expect(formatted).toContain('2099');
    });

    it('should handle leap year dates', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const leapDate = new Date('2024-02-29T12:00:00Z');
      const formatted = result.current.formatDate(leapDate);

      expect(formatted).toContain('February');
      expect(formatted).toContain('29');
      expect(formatted).toContain('2024');
    });

    it('should handle midnight times', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const midnight = new Date('2024-01-15T00:00:00Z');
      const formatted = result.current.formatTime(midnight);

      expect(formatted).toMatch(/\d+:\d+/);
    });

    it('should handle noon times', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const noon = new Date('2024-01-15T12:00:00Z');
      const formatted = result.current.formatTime(noon);

      expect(formatted).toMatch(/\d+:\d+/);
    });
  });

  describe('Custom Options', () => {
    it('should accept custom DateTimeFormat options', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = result.current.formatDate(date, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Should include weekday
      expect(formatted).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should override default options with custom options', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = result.current.formatDate(date, {
        month: 'numeric',
        day: 'numeric',
      });

      // Should use numeric month instead of long month name
      expect(formatted).not.toContain('January');
      expect(formatted).toMatch(/\d+/);
    });
  });

  describe('Locale-Specific Relative Time', () => {
    it('should format relative time in French', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'fr', name: 'Français', flag: '🇫🇷' }
      });

      const { result } = renderHook(() => useDateFormat());
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formatted = result.current.formatRelative(yesterday);

      // French uses "hier" for yesterday
      expect(formatted).toMatch(/hier|il y a 1 jour/i);
    });

    it('should format relative time in German', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
      });

      const { result } = renderHook(() => useDateFormat());
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formatted = result.current.formatRelative(yesterday);

      // German uses "gestern" for yesterday
      expect(formatted).toMatch(/gestern|vor 1 Tag/i);
    });

    it('should format relative time in Japanese', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'ja', name: '日本語', flag: '🇯🇵' }
      });

      const { result } = renderHook(() => useDateFormat());
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formatted = result.current.formatRelative(yesterday);

      // Japanese relative time formatting
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('Additional Edge Cases for Task 4.9', () => {
    it('should handle empty string date input', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatDate('');

      expect(formatted).toBe('Invalid Date');
    });

    it('should handle NaN date input', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatDate(NaN as any);

      expect(formatted).toBe('Invalid Date');
    });

    it('should handle date at Unix epoch (1970-01-01)', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const epoch = new Date(0);
      const formatted = result.current.formatDate(epoch);

      // Date might be Dec 31, 1969 or Jan 1, 1970 depending on timezone
      expect(formatted).toMatch(/1969|1970/);
      expect(formatted).toMatch(/January|December/);
    });

    it('should handle date with milliseconds precision', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T12:34:56.789Z');
      const formatted = result.current.formatDate(date);

      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should handle 12-hour format with midnight (12:00 AM)', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const midnight = new Date('2024-01-15T00:00:00Z');
      const formatted = result.current.formatTime(midnight);

      // Should contain time and AM/PM indicator
      expect(formatted).toMatch(/\d+:\d+/);
      expect(formatted).toMatch(/AM|PM/i);
    });

    it('should handle 12-hour format with noon (12:00 PM)', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const noon = new Date('2024-01-15T12:00:00Z');
      const formatted = result.current.formatTime(noon);

      // Should contain time and AM/PM indicator
      expect(formatted).toMatch(/\d+:\d+/);
      expect(formatted).toMatch(/AM|PM/i);
    });

    it('should handle 24-hour format with midnight (00:00)', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'fr', name: 'Français', flag: '🇫🇷' }
      });

      const { result } = renderHook(() => useDateFormat());
      const midnight = new Date('2024-01-15T00:00:00Z');
      const formatted = result.current.formatTime(midnight);

      // Should contain time without AM/PM
      expect(formatted).toMatch(/\d+:\d+/);
      expect(formatted).not.toMatch(/AM|PM/i);
    });

    it('should handle 24-hour format with 23:59', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'fr', name: 'Français', flag: '🇫🇷' }
      });

      const { result } = renderHook(() => useDateFormat());
      const endOfDay = new Date('2024-01-15T23:59:00Z');
      const formatted = result.current.formatTime(endOfDay);

      // Should contain time without AM/PM
      expect(formatted).toMatch(/\d+:\d+/);
      expect(formatted).not.toMatch(/AM|PM/i);
    });

    it('should handle invalid date in formatTime', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatTime('invalid-date');

      expect(formatted).toBe('Invalid Date');
    });

    it('should handle invalid date in formatRelative', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatRelative('invalid-date');

      expect(formatted).toBe('Invalid Date');
    });

    it('should handle date far in the future for relative time', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 10);
      const formatted = result.current.formatRelative(farFuture);

      // Should contain "in" and time unit
      expect(formatted).toMatch(/in \d+/i);
    });

    it('should handle date far in the past for relative time', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const farPast = new Date();
      farPast.setFullYear(farPast.getFullYear() - 10);
      const formatted = result.current.formatRelative(farPast);

      // Should contain "ago" and time unit
      expect(formatted).toMatch(/\d+ .* ago/i);
    });

    it('should format date consistently across multiple calls', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const date = new Date('2024-01-15T12:00:00Z');
      
      const formatted1 = result.current.formatDate(date);
      const formatted2 = result.current.formatDate(date);

      expect(formatted1).toBe(formatted2);
    });

    it('should handle timezone offset in ISO string', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatDate('2024-01-15T12:00:00+05:30');

      expect(formatted).toContain('January');
      expect(formatted).toContain('2024');
    });

    it('should handle date-only string (no time component)', () => {
      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en', name: 'English (US)', flag: '🇺🇸' }
      });

      const { result } = renderHook(() => useDateFormat());
      const formatted = result.current.formatDate('2024-01-15');

      expect(formatted).toContain('January');
      // Date might be 14 or 15 depending on timezone interpretation
      expect(formatted).toMatch(/14|15/);
      expect(formatted).toContain('2024');
    });
  });
});
