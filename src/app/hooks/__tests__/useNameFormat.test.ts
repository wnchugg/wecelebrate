/**
 * Unit Tests for useNameFormat Hook
 * 
 * These tests verify specific examples and edge cases for name formatting.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNameFormat } from '../useNameFormat';
import * as LanguageContext from '../../context/LanguageContext';

// Mock the LanguageContext
vi.mock('../../context/LanguageContext', () => ({
  useLanguage: vi.fn()
}));

describe('useNameFormat - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatFullName - Specific Locales', () => {
    it('should format names correctly for en-US (Western)', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en-US' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('John', 'Smith')).toBe('John Smith');
      expect(result.current.formatFullName('Jane', 'Doe', 'Marie')).toBe('Jane Marie Doe');
    });

    it('should format names correctly for ja-JP (Asian)', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'ja' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('太郎', '山田')).toBe('山田 太郎');
      expect(result.current.formatFullName('太郎', '山田', '一')).toBe('山田 一 太郎');
    });

    it('should format names correctly for zh-CN (Asian)', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'zh' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('明', '李')).toBe('李 明');
      expect(result.current.formatFullName('明', '李', '小')).toBe('李 小 明');
    });

    it('should format names correctly for ko-KR (Asian)', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'ko' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('민수', '김')).toBe('김 민수');
      expect(result.current.formatFullName('민수', '김', '철')).toBe('김 철 민수');
    });

    it('should format names correctly for fr-FR (Western)', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'fr' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('Jean', 'Dupont')).toBe('Jean Dupont');
      expect(result.current.formatFullName('Marie', 'Curie', 'Skłodowska')).toBe('Marie Skłodowska Curie');
    });

    it('should format names correctly for de-DE (Western)', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'de' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('Hans', 'Müller')).toBe('Hans Müller');
      expect(result.current.formatFullName('Anna', 'Schmidt', 'Maria')).toBe('Anna Maria Schmidt');
    });

    it('should format names correctly for es-ES (Western)', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'es' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('Carlos', 'García')).toBe('Carlos García');
      expect(result.current.formatFullName('María', 'López', 'Isabel')).toBe('María Isabel López');
    });

    it('should format names correctly for ar (Western order despite RTL)', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'ar' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      // Arabic uses Western name order (given-first) despite being RTL
      expect(result.current.formatFullName('محمد', 'أحمد')).toBe('محمد أحمد');
    });

    it('should format names correctly for he (Western order despite RTL)', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'he' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      // Hebrew uses Western name order (given-first) despite being RTL
      expect(result.current.formatFullName('דוד', 'כהן')).toBe('דוד כהן');
    });
  });

  describe('formatFullName - With and Without Middle Names', () => {
    it('should format Western names without middle name', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('Alice', 'Johnson')).toBe('Alice Johnson');
    });

    it('should format Western names with middle name', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('Alice', 'Johnson', 'Marie')).toBe('Alice Marie Johnson');
    });

    it('should format Asian names without middle name', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'ja' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('花子', '佐藤')).toBe('佐藤 花子');
    });

    it('should format Asian names with middle name', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'ja' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('花子', '佐藤', '美')).toBe('佐藤 美 花子');
    });
  });

  describe('formatFormalName - With and Without Titles', () => {
    it('should format Western formal name with title', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFormalName('John', 'Smith', 'Mr.')).toBe('Mr. John Smith');
      expect(result.current.formatFormalName('Jane', 'Doe', 'Dr.')).toBe('Dr. Jane Doe');
      expect(result.current.formatFormalName('Mary', 'Johnson', 'Ms.')).toBe('Ms. Mary Johnson');
    });

    it('should format Western formal name without title', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFormalName('John', 'Smith')).toBe('John Smith');
    });

    it('should format Asian formal name with title', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'ja' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFormalName('太郎', '山田', '様')).toBe('様 山田 太郎');
      expect(result.current.formatFormalName('花子', '佐藤', '先生')).toBe('先生 佐藤 花子');
    });

    it('should format Asian formal name without title', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'ja' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFormalName('太郎', '山田')).toBe('山田 太郎');
    });

    it('should handle various title formats', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFormalName('John', 'Smith', 'Mr.')).toBe('Mr. John Smith');
      expect(result.current.formatFormalName('John', 'Smith', 'Dr.')).toBe('Dr. John Smith');
      expect(result.current.formatFormalName('John', 'Smith', 'Prof.')).toBe('Prof. John Smith');
      expect(result.current.formatFormalName('John', 'Smith', 'Rev.')).toBe('Rev. John Smith');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single character names', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('A', 'B')).toBe('A B');
      expect(result.current.formatFullName('A', 'B', 'C')).toBe('A C B');
    });

    it('should handle names with special characters', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName("O'Brien", 'Patrick')).toBe("O'Brien Patrick");
      expect(result.current.formatFullName('Jean-Luc', 'Picard')).toBe('Jean-Luc Picard');
    });

    it('should handle names with accents and diacritics', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'fr' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('François', 'Müller')).toBe('François Müller');
      expect(result.current.formatFullName('José', 'García')).toBe('José García');
    });

    it('should handle zh-TW (Traditional Chinese) as Asian locale', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'zh-TW' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      expect(result.current.formatFullName('明', '李')).toBe('李 明');
    });
  });

  describe('Consistency Between Functions', () => {
    it('should use formatFullName result in formatFormalName', () => {
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useNameFormat());
      
      const fullName = result.current.formatFullName('John', 'Smith');
      const formalName = result.current.formatFormalName('John', 'Smith', 'Mr.');
      
      expect(formalName).toBe(`Mr. ${fullName}`);
    });

    it('should maintain consistency across locale changes', () => {
      // Start with English
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      let { result } = renderHook(() => useNameFormat());
      expect(result.current.formatFullName('John', 'Smith')).toBe('John Smith');

      // Switch to Japanese
      (LanguageContext.useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'ja' }
      });

      result = renderHook(() => useNameFormat()).result;
      expect(result.current.formatFullName('John', 'Smith')).toBe('Smith John');
    });
  });
});
