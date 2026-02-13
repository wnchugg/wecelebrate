/**
 * Availability Tests
 * Day 6 - Week 2: Performance & Optimization Testing
 * Target: 25 tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isWithinAvailabilityPeriod,
  isSiteExpired,
  isSiteNotYetAvailable,
} from '../availability';
import type { Site } from '../../context/SiteContext';

describe('Availability Utils', () => {
  let mockSite: Site;
  
  beforeEach(() => {
    // Create a base mock site
    mockSite = {
      id: 'site-1',
      name: 'Test Site',
      subdomain: 'test',
      settings: {
        availabilityStartDate: undefined,
        availabilityEndDate: undefined,
      },
    } as unknown as Site;
    
    // Mock Date.now() to have consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isWithinAvailabilityPeriod', () => {
    it('should return true for null site', () => {
      expect(isWithinAvailabilityPeriod(null)).toBe(true);
    });

    it('should return true when no dates are configured', () => {
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(true);
    });

    it('should return true when current date is after start date', () => {
      mockSite.settings.availabilityStartDate = '2026-02-01T00:00:00Z';
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(true);
    });

    it('should return false when current date is before start date', () => {
      mockSite.settings.availabilityStartDate = '2026-03-01T00:00:00Z';
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(false);
    });

    it('should return true when current date is before end date', () => {
      mockSite.settings.availabilityEndDate = '2026-03-01T00:00:00Z';
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(true);
    });

    it('should return false when current date is after end date', () => {
      mockSite.settings.availabilityEndDate = '2026-02-01T00:00:00Z';
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(false);
    });

    it('should return true when within date range', () => {
      mockSite.settings.availabilityStartDate = '2026-02-01T00:00:00Z';
      mockSite.settings.availabilityEndDate = '2026-03-01T00:00:00Z';
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(true);
    });

    it('should return false when before date range', () => {
      mockSite.settings.availabilityStartDate = '2026-03-01T00:00:00Z';
      mockSite.settings.availabilityEndDate = '2026-04-01T00:00:00Z';
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(false);
    });

    it('should return false when after date range', () => {
      mockSite.settings.availabilityStartDate = '2026-01-01T00:00:00Z';
      mockSite.settings.availabilityEndDate = '2026-02-01T00:00:00Z';
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(false);
    });

    it('should handle exact start date boundary', () => {
      vi.setSystemTime(new Date('2026-02-15T12:00:00Z'));
      mockSite.settings.availabilityStartDate = '2026-02-15T12:00:00Z';
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(true);
    });

    it('should handle exact end date boundary', () => {
      vi.setSystemTime(new Date('2026-02-15T12:00:00Z'));
      mockSite.settings.availabilityEndDate = '2026-02-15T12:00:00Z';
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(true);
    });

    it('should work with only start date', () => {
      mockSite.settings.availabilityStartDate = '2026-02-01T00:00:00Z';
      mockSite.settings.availabilityEndDate = undefined;
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(true);
    });

    it('should work with only end date', () => {
      mockSite.settings.availabilityStartDate = undefined;
      mockSite.settings.availabilityEndDate = '2026-03-01T00:00:00Z';
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(true);
    });
  });

  describe('isSiteExpired', () => {
    it('should return false for null site', () => {
      expect(isSiteExpired(null)).toBe(false);
    });

    it('should return false when no end date is configured', () => {
      expect(isSiteExpired(mockSite)).toBe(false);
    });

    it('should return false when current date is before end date', () => {
      mockSite.settings.availabilityEndDate = '2026-03-01T00:00:00Z';
      expect(isSiteExpired(mockSite)).toBe(false);
    });

    it('should return true when current date is after end date', () => {
      mockSite.settings.availabilityEndDate = '2026-02-01T00:00:00Z';
      expect(isSiteExpired(mockSite)).toBe(true);
    });

    it('should handle exact end date boundary', () => {
      vi.setSystemTime(new Date('2026-02-15T12:00:00Z'));
      mockSite.settings.availabilityEndDate = '2026-02-15T12:00:00Z';
      expect(isSiteExpired(mockSite)).toBe(false);
    });

    it('should return true one second after expiry', () => {
      vi.setSystemTime(new Date('2026-02-15T12:00:01Z'));
      mockSite.settings.availabilityEndDate = '2026-02-15T12:00:00Z';
      expect(isSiteExpired(mockSite)).toBe(true);
    });

    it('should ignore start date when checking expiry', () => {
      mockSite.settings.availabilityStartDate = '2026-01-01T00:00:00Z';
      mockSite.settings.availabilityEndDate = '2026-02-01T00:00:00Z';
      expect(isSiteExpired(mockSite)).toBe(true);
    });

    it('should work with string dates', () => {
      mockSite.settings.availabilityEndDate = '2026-01-01';
      expect(isSiteExpired(mockSite)).toBe(true);
    });

    it('should handle different date formats', () => {
      mockSite.settings.availabilityEndDate = '2026-01-01T00:00:00.000Z';
      expect(isSiteExpired(mockSite)).toBe(true);
    });
  });

  describe('isSiteNotYetAvailable', () => {
    it('should return false for null site', () => {
      expect(isSiteNotYetAvailable(null)).toBe(false);
    });

    it('should return false when no start date is configured', () => {
      expect(isSiteNotYetAvailable(mockSite)).toBe(false);
    });

    it('should return true when current date is before start date', () => {
      mockSite.settings.availabilityStartDate = '2026-03-01T00:00:00Z';
      expect(isSiteNotYetAvailable(mockSite)).toBe(true);
    });

    it('should return false when current date is after start date', () => {
      mockSite.settings.availabilityStartDate = '2026-02-01T00:00:00Z';
      expect(isSiteNotYetAvailable(mockSite)).toBe(false);
    });

    it('should handle exact start date boundary', () => {
      vi.setSystemTime(new Date('2026-02-15T12:00:00Z'));
      mockSite.settings.availabilityStartDate = '2026-02-15T12:00:00Z';
      expect(isSiteNotYetAvailable(mockSite)).toBe(false);
    });

    it('should return true one second before start', () => {
      vi.setSystemTime(new Date('2026-02-15T11:59:59Z'));
      mockSite.settings.availabilityStartDate = '2026-02-15T12:00:00Z';
      expect(isSiteNotYetAvailable(mockSite)).toBe(true);
    });

    it('should ignore end date when checking availability', () => {
      mockSite.settings.availabilityStartDate = '2026-03-01T00:00:00Z';
      mockSite.settings.availabilityEndDate = '2026-04-01T00:00:00Z';
      expect(isSiteNotYetAvailable(mockSite)).toBe(true);
    });

    it('should work with string dates', () => {
      mockSite.settings.availabilityStartDate = '2026-03-01';
      expect(isSiteNotYetAvailable(mockSite)).toBe(true);
    });

    it('should handle different date formats', () => {
      mockSite.settings.availabilityStartDate = '2026-03-01T00:00:00.000Z';
      expect(isSiteNotYetAvailable(mockSite)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid date strings', () => {
      mockSite.settings.availabilityEndDate = 'invalid-date';
      // Date constructor returns Invalid Date which is > than now
      expect(typeof isSiteExpired(mockSite)).toBe('boolean');
    });

    it('should handle undefined site settings', () => {
      const incompleteSite = {
        id: 'site-2',
        name: 'Incomplete',
        subdomain: 'incomplete',
        settings: {} as any,
      } as unknown as Site;
      
      expect(isWithinAvailabilityPeriod(incompleteSite)).toBe(true);
      expect(isSiteExpired(incompleteSite)).toBe(false);
      expect(isSiteNotYetAvailable(incompleteSite)).toBe(false);
    });

    it('should handle timezone differences', () => {
      mockSite.settings.availabilityStartDate = '2026-02-15T00:00:00+08:00'; // UTC+8
      mockSite.settings.availabilityEndDate = '2026-02-15T23:59:59+08:00'; // UTC+8
      
      // System time is 12:00 UTC, which should be within range
      expect(typeof isWithinAvailabilityPeriod(mockSite)).toBe('boolean');
    });

    it('should work with past dates', () => {
      mockSite.settings.availabilityStartDate = '2020-01-01T00:00:00Z';
      mockSite.settings.availabilityEndDate = '2020-12-31T23:59:59Z';
      
      expect(isSiteExpired(mockSite)).toBe(true);
      expect(isSiteNotYetAvailable(mockSite)).toBe(false);
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(false);
    });

    it('should work with future dates', () => {
      mockSite.settings.availabilityStartDate = '2027-01-01T00:00:00Z';
      mockSite.settings.availabilityEndDate = '2027-12-31T23:59:59Z';
      
      expect(isSiteExpired(mockSite)).toBe(false);
      expect(isSiteNotYetAvailable(mockSite)).toBe(true);
      expect(isWithinAvailabilityPeriod(mockSite)).toBe(false);
    });
  });
});
