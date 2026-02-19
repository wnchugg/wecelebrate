import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUnits, getUnitSystem } from '../useUnits';
import * as SiteContext from '../../context/SiteContext';

vi.mock('../../context/SiteContext');

/**
 * Feature: internationalization-improvements
 * Unit tests for measurement unit conversion
 * Requirements: 12.1-12.8
 */
describe('useUnits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUnitSystem', () => {
    it('should return imperial for US', () => {
      expect(getUnitSystem('US')).toBe('imperial');
    });

    it('should return imperial for Liberia (LR)', () => {
      expect(getUnitSystem('LR')).toBe('imperial');
    });

    it('should return imperial for Myanmar (MM)', () => {
      expect(getUnitSystem('MM')).toBe('imperial');
    });

    it('should return metric for Canada', () => {
      expect(getUnitSystem('CA')).toBe('metric');
    });

    it('should return metric for United Kingdom', () => {
      expect(getUnitSystem('GB')).toBe('metric');
    });

    it('should return metric for France', () => {
      expect(getUnitSystem('FR')).toBe('metric');
    });

    it('should return metric for Japan', () => {
      expect(getUnitSystem('JP')).toBe('metric');
    });
  });

  describe('formatWeight', () => {
    it('should format weight in pounds for imperial system (US)', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: {
          settings: { defaultCountry: 'US' },
        },
      } as any);

      const { result } = renderHook(() => useUnits());
      
      // 453.592 grams = 1 pound
      expect(result.current.formatWeight(453.592)).toBe('1.00 lbs');
      expect(result.current.formatWeight(907.184)).toBe('2.00 lbs');
    });

    it('should format weight in kilograms for metric system when >= 1000g', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: {
          settings: { defaultCountry: 'CA' },
        },
      } as any);

      const { result } = renderHook(() => useUnits());
      
      expect(result.current.formatWeight(1000)).toBe('1.00 kg');
      expect(result.current.formatWeight(2500)).toBe('2.50 kg');
      expect(result.current.formatWeight(1500)).toBe('1.50 kg');
    });

    it('should format weight in grams for metric system when < 1000g', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: {
          settings: { defaultCountry: 'FR' },
        },
      } as any);

      const { result } = renderHook(() => useUnits());
      
      expect(result.current.formatWeight(999)).toBe('999 g');
      expect(result.current.formatWeight(500)).toBe('500 g');
      expect(result.current.formatWeight(100)).toBe('100 g');
    });

    it('should handle threshold behavior at 999g vs 1000g', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: {
          settings: { defaultCountry: 'DE' },
        },
      } as any);

      const { result } = renderHook(() => useUnits());
      
      // Just below threshold - should be in grams
      expect(result.current.formatWeight(999)).toBe('999 g');
      
      // At threshold - should be in kilograms
      expect(result.current.formatWeight(1000)).toBe('1.00 kg');
    });
  });

  describe('formatLength', () => {
    it('should format length in inches for imperial system (US)', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: {
          settings: { defaultCountry: 'US' },
        },
      } as any);

      const { result } = renderHook(() => useUnits());
      
      // 2.54 cm = 1 inch
      expect(result.current.formatLength(2.54)).toBe('1.0 in');
      expect(result.current.formatLength(25.4)).toBe('10.0 in');
    });

    it('should format length in centimeters for metric system', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: {
          settings: { defaultCountry: 'JP' },
        },
      } as any);

      const { result } = renderHook(() => useUnits());
      
      expect(result.current.formatLength(10)).toBe('10 cm');
      expect(result.current.formatLength(100)).toBe('100 cm');
      expect(result.current.formatLength(50.5)).toBe('50.5 cm');
    });
  });

  describe('system property', () => {
    it('should return imperial for US', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: {
          settings: { defaultCountry: 'US' },
        },
      } as any);

      const { result } = renderHook(() => useUnits());
      expect(result.current.system).toBe('imperial');
    });

    it('should return metric for non-imperial countries', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: {
          settings: { defaultCountry: 'GB' },
        },
      } as any);

      const { result } = renderHook(() => useUnits());
      expect(result.current.system).toBe('metric');
    });
  });

  describe('edge cases', () => {
    it('should default to US when no site is available', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: null,
      } as any);

      const { result } = renderHook(() => useUnits());
      expect(result.current.system).toBe('imperial');
    });

    it('should default to US when no defaultCountry is set', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: {
          settings: {},
        },
      } as any);

      const { result } = renderHook(() => useUnits());
      expect(result.current.system).toBe('imperial');
    });
  });

  describe('specific conversions', () => {
    it('should convert 1000 grams to 2.20 pounds', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: {
          settings: { defaultCountry: 'US' },
        },
      } as any);

      const { result } = renderHook(() => useUnits());
      expect(result.current.formatWeight(1000)).toBe('2.20 lbs');
    });

    it('should convert 100 cm to 39.4 inches', () => {
      vi.mocked(SiteContext.useSite).mockReturnValue({
        currentSite: {
          settings: { defaultCountry: 'LR' },
        },
      } as any);

      const { result } = renderHook(() => useUnits());
      expect(result.current.formatLength(100)).toBe('39.4 in');
    });
  });
});
