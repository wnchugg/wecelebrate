/**
 * Timezone Utility Functions Test Suite
 * Tests for timezone-related functions in src/app/utils/dateUtils.ts
 */

import { describe, it, expect } from 'vitest';
import { convertToSiteTimezone, addDaysInTimezone } from '../dateUtils';

describe('Timezone Utilities', () => {
  describe('convertToSiteTimezone', () => {
    it('should convert date to New York timezone', () => {
      const date = new Date('2024-01-15T12:00:00Z'); // UTC noon
      const converted = convertToSiteTimezone(date, 'America/New_York');
      
      // New York is UTC-5 in winter, so noon UTC should be 7am EST
      expect(converted.getHours()).toBe(7);
    });

    it('should convert date to Tokyo timezone', () => {
      const date = new Date('2024-01-15T12:00:00Z'); // UTC noon
      const converted = convertToSiteTimezone(date, 'Asia/Tokyo');
      
      // Tokyo is UTC+9, so noon UTC should be 9pm JST
      expect(converted.getHours()).toBe(21);
    });

    it('should convert date to London timezone', () => {
      const date = new Date('2024-01-15T12:00:00Z'); // UTC noon
      const converted = convertToSiteTimezone(date, 'Europe/London');
      
      // London is UTC+0 in winter, so noon UTC should be noon GMT
      expect(converted.getHours()).toBe(12);
    });

    it('should handle date at midnight', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const converted = convertToSiteTimezone(date, 'America/Los_Angeles');
      
      // LA is UTC-8 in winter, so midnight UTC should be 4pm previous day
      expect(converted.getHours()).toBe(16);
      expect(converted.getDate()).toBe(14);
    });

    it('should preserve the date object type', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const converted = convertToSiteTimezone(date, 'America/New_York');
      
      expect(converted).toBeInstanceOf(Date);
    });

    it('should handle different timezones correctly', () => {
      const date = new Date('2024-06-15T12:00:00Z'); // Summer date
      const nyConverted = convertToSiteTimezone(date, 'America/New_York');
      const laConverted = convertToSiteTimezone(date, 'America/Los_Angeles');
      
      // NY is UTC-4 in summer, LA is UTC-7 in summer
      // So there should be a 3-hour difference
      expect(nyConverted.getHours() - laConverted.getHours()).toBe(3);
    });

    it('should handle invalid timezone gracefully', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      
      // Invalid timezone should throw or return a date
      expect(() => {
        convertToSiteTimezone(date, 'Invalid/Timezone');
      }).toThrow();
    });
  });

  describe('addDaysInTimezone', () => {
    it('should add days in New York timezone', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = addDaysInTimezone(date, 5, 'America/New_York');
      
      // Should be 5 days later
      expect(result.getDate()).toBe(20);
    });

    it('should add days in Tokyo timezone', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = addDaysInTimezone(date, 3, 'Asia/Tokyo');
      
      // Should be 3 days later
      expect(result.getDate()).toBe(18);
    });

    it('should subtract days with negative value', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = addDaysInTimezone(date, -5, 'America/New_York');
      
      // Should be 5 days earlier
      expect(result.getDate()).toBe(10);
    });

    it('should handle month boundary correctly', () => {
      const date = new Date('2024-01-28T12:00:00Z');
      const result = addDaysInTimezone(date, 5, 'America/New_York');
      
      // Should roll over to February
      expect(result.getMonth()).toBe(1); // February is month 1
      expect(result.getDate()).toBe(2);
    });

    it('should handle year boundary correctly', () => {
      const date = new Date('2024-12-28T12:00:00Z');
      const result = addDaysInTimezone(date, 5, 'America/New_York');
      
      // Should roll over to next year
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(2);
    });

    it('should handle leap year correctly', () => {
      const date = new Date('2024-02-28T12:00:00Z'); // 2024 is a leap year
      const result = addDaysInTimezone(date, 1, 'America/New_York');
      
      // Should be Feb 29 in a leap year
      expect(result.getDate()).toBe(29);
      expect(result.getMonth()).toBe(1); // February
    });

    it('should handle adding zero days', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = addDaysInTimezone(date, 0, 'America/New_York');
      
      // Date should remain the same day
      expect(result.getDate()).toBe(15);
    });

    it('should handle large number of days', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const result = addDaysInTimezone(date, 365, 'America/New_York');
      
      // Should be one year later (2024 is leap year, so 366 days)
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(11); // December
      expect(result.getDate()).toBe(31);
    });

    it('should account for timezone when adding days', () => {
      // Test that the day addition happens in the context of the timezone
      const date = new Date('2024-01-15T23:00:00Z'); // 11pm UTC
      const nyResult = addDaysInTimezone(date, 1, 'America/New_York');
      const tokyoResult = addDaysInTimezone(date, 1, 'Asia/Tokyo');
      
      // Both should add 1 day, but in their respective timezones
      expect(nyResult).toBeInstanceOf(Date);
      expect(tokyoResult).toBeInstanceOf(Date);
    });

    it('should handle DST transitions', () => {
      // March 10, 2024 is when DST starts in the US (2am -> 3am)
      const date = new Date('2024-03-09T12:00:00Z');
      const result = addDaysInTimezone(date, 2, 'America/New_York');
      
      // Should handle the DST transition correctly
      expect(result.getDate()).toBe(11);
    });
  });

  describe('Edge Cases', () => {
    it('should handle dates at DST boundary', () => {
      // Test date conversion during DST transition
      const date = new Date('2024-03-10T07:00:00Z'); // DST starts in US
      const converted = convertToSiteTimezone(date, 'America/New_York');
      
      expect(converted).toBeInstanceOf(Date);
    });

    it('should handle dates in different years', () => {
      const date = new Date('2023-12-31T23:00:00Z');
      const result = addDaysInTimezone(date, 1, 'America/New_York');
      
      // Should cross year boundary
      expect(result.getFullYear()).toBe(2024);
    });

    it('should handle very old dates', () => {
      const date = new Date('1900-01-01T12:00:00Z');
      const converted = convertToSiteTimezone(date, 'America/New_York');
      
      expect(converted).toBeInstanceOf(Date);
      expect(converted.getFullYear()).toBe(1900);
    });

    it('should handle far future dates', () => {
      const date = new Date('2100-12-31T12:00:00Z');
      const converted = convertToSiteTimezone(date, 'America/New_York');
      
      expect(converted).toBeInstanceOf(Date);
      expect(converted.getFullYear()).toBe(2100);
    });
  });
});
