/**
 * LanguageContext Tests
 * Day 9 - Week 2: Remaining Contexts Testing
 * Target: 10 tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { LanguageProvider, useLanguage, languages } from '../LanguageContext';

// Mock translations
vi.mock('../../i18n/translations', () => ({
  t: vi.fn((key: string, lang: string) => `${key}_${lang}`),
}));

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  afterEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );

  describe('Constants', () => {
    it('should export languages array', () => {
      expect(languages).toBeDefined();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
    });

    it('should include common languages', () => {
      const languageCodes = languages.map(l => l.code);
      expect(languageCodes).toContain('en');
      expect(languageCodes).toContain('es');
      expect(languageCodes).toContain('fr');
      expect(languageCodes).toContain('de');
    });

    it('should have language properties', () => {
      languages.forEach(lang => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('flag');
      });
    });

    it('should mark RTL languages', () => {
      const arabicLang = languages.find(l => l.code === 'ar');
      const hebrewLang = languages.find(l => l.code === 'he');
      
      expect(arabicLang?.rtl).toBe(true);
      expect(hebrewLang?.rtl).toBe(true);
    });
  });

  describe('Provider Setup', () => {
    it('should provide language context', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('currentLanguage');
      expect(result.current).toHaveProperty('setLanguage');
      expect(result.current).toHaveProperty('t');
    });

    it('should throw error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useLanguage());
      }).toThrow('useLanguage must be used within a LanguageProvider');
      
      consoleSpy.mockRestore();
    });

    it('should default to English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      expect(result.current.currentLanguage.code).toBe('en');
      expect(result.current.currentLanguage.name).toBe('English (US)');
    });

    it('should restore language from localStorage', () => {
      localStorage.setItem('preferred-language', 'es');
      
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      expect(result.current.currentLanguage.code).toBe('es');
    });

    it('should handle invalid saved language', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem('preferred-language', 'invalid-lang');
      
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      expect(result.current.currentLanguage.code).toBe('en');
      expect(warnSpy).toHaveBeenCalled();
      expect(localStorage.getItem('preferred-language')).toBeNull();
      
      warnSpy.mockRestore();
    });
  });

  describe('Language Selection', () => {
    it('should set language by code', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('es');
      });
      
      expect(result.current.currentLanguage.code).toBe('es');
    });

    it('should set language by object', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      const frenchLang = languages.find(l => l.code === 'fr');
      
      act(() => {
        result.current.setLanguage(frenchLang);
      });
      
      expect(result.current.currentLanguage).toEqual(frenchLang);
    });

    it('should save language to localStorage', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('de');
      });
      
      expect(localStorage.getItem('preferred-language')).toBe('de');
    });

    it('should default to English for invalid code', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('invalid');
      });
      
      expect(result.current.currentLanguage.code).toBe('en');
    });

    it('should update multiple times', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('es');
      });
      
      expect(result.current.currentLanguage.code).toBe('es');
      
      act(() => {
        result.current.setLanguage('fr');
      });
      
      expect(result.current.currentLanguage.code).toBe('fr');
    });
  });

  describe('RTL Support', () => {
    it('should set RTL direction for Arabic', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('ar');
      });
      
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should set RTL direction for Hebrew', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('he');
      });
      
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should set LTR direction for English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('en');
      });
      
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('should update direction when switching languages', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('ar');
      });
      
      expect(document.documentElement.dir).toBe('rtl');
      
      act(() => {
        result.current.setLanguage('en');
      });
      
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  describe('Document Language Attribute', () => {
    it('should set lang attribute', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('fr');
      });
      
      expect(document.documentElement.lang).toBe('fr');
    });

    it('should update lang attribute when language changes', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('de');
      });
      
      expect(document.documentElement.lang).toBe('de');
      
      act(() => {
        result.current.setLanguage('it');
      });
      
      expect(document.documentElement.lang).toBe('it');
    });
  });

  describe('Translation Function', () => {
    it('should provide translation function', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      expect(typeof result.current.t).toBe('function');
    });

    it('should translate with current language', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('es');
      });
      
      const translation = result.current.t('welcome' as any);
      expect(translation).toBe('welcome_es');
    });

    it('should use current language code in translation', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      
      act(() => {
        result.current.setLanguage('fr');
      });
      
      const translation = result.current.t('hello' as any);
      expect(translation).toContain('_fr');
    });
  });
});
