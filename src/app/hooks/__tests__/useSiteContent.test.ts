/**
 * useSiteContent Hook Test Suite
 * Tests for src/app/hooks/useSiteContent.ts
 * 
 * Requirements: 6.1-6.9, 11.1-11.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSiteContent } from '../useSiteContent';
import { useSite } from '../../context/SiteContext';
import { useLanguage } from '../../context/LanguageContext';

// Mock the context hooks
vi.mock('../../context/SiteContext', () => ({
  useSite: vi.fn()
}));

vi.mock('../../context/LanguageContext', () => ({
  useLanguage: vi.fn()
}));

describe('useSiteContent Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console warnings in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Translation Retrieval with Valid Path', () => {
    it('should retrieve translation for current language', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: 'Welcome',
                es: 'Bienvenido',
                fr: 'Bienvenue'
              }
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'es' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      expect(translation).toBe('Bienvenido');
    });

    it('should retrieve translation for nested paths', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            checkoutPage: {
              shippingTitle: {
                en: 'Shipping Information',
                es: 'Información de Envío'
              }
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('checkoutPage.shippingTitle', 'Fallback');

      expect(translation).toBe('Shipping Information');
    });
  });

  describe('Fallback to Default Language', () => {
    it('should fallback to default language when current language is missing', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: 'Welcome',
                fr: 'Bienvenue'
              }
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'es' } // Spanish not available
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      expect(translation).toBe('Welcome');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should not fallback if current language is same as default', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: 'Welcome'
              }
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      expect(translation).toBe('Welcome');
    });
  });

  describe('Fallback to English', () => {
    it('should fallback to English when current and default languages are missing', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: 'Welcome',
                fr: 'Bienvenue'
              }
            }
          },
          settings: {
            defaultLanguage: 'de' // German is default but not available
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'es' } // Spanish not available
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      expect(translation).toBe('Welcome');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should not fallback to English if default language is English', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: 'Welcome'
              }
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'es' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      expect(translation).toBe('Welcome');
    });
  });

  describe('Fallback to First Available Translation', () => {
    it('should fallback to first available translation when all preferred languages are missing', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                fr: 'Bienvenue',
                de: 'Willkommen'
              }
            }
          },
          settings: {
            defaultLanguage: 'es' // Spanish not available
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'it' } // Italian not available
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      // Should return first available (fr or de)
      expect(['Bienvenue', 'Willkommen']).toContain(translation);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should skip empty string translations when finding first available', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                fr: '',
                de: 'Willkommen',
                it: 'Benvenuto'
              }
            }
          },
          settings: {
            defaultLanguage: 'es'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      // Should skip empty string and return first non-empty
      expect(['Willkommen', 'Benvenuto']).toContain(translation);
    });
  });

  describe('Fallback to Provided Fallback String', () => {
    it('should return fallback string when no translations are available', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {}
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Default Welcome');

      expect(translation).toBe('Default Welcome');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return empty string when no fallback is provided', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {}
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title');

      expect(translation).toBe('');
    });

    it('should return fallback when all translations are empty strings', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: '',
                es: '   ',
                fr: ''
              }
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback Text');

      expect(translation).toBe('Fallback Text');
    });
  });

  describe('Error Handling for Invalid Paths', () => {
    it('should return fallback for non-existent path', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: 'Welcome'
              }
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('nonExistent.path', 'Fallback');

      expect(translation).toBe('Fallback');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return fallback for partially invalid path', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: 'Welcome'
              }
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.nonExistent', 'Fallback');

      expect(translation).toBe('Fallback');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return fallback for empty path', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {},
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('', 'Fallback');

      expect(translation).toBe('Fallback');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return fallback for invalid path type', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {},
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent(null as any, 'Fallback');

      expect(translation).toBe('Fallback');
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Error Handling for Malformed Objects', () => {
    it('should return fallback when translations is null', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: null,
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      expect(translation).toBe('Fallback');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return fallback when translations is undefined', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: undefined,
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      expect(translation).toBe('Fallback');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return fallback when currentSite is null', () => {
      (useSite as any).mockReturnValue({
        currentSite: null
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      expect(translation).toBe('Fallback');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return fallback when path leads to non-object value', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: 'Not an object with language keys'
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      expect(translation).toBe('Fallback');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle exception during path navigation', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            get welcomePage() {
              throw new Error('Access error');
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      expect(translation).toBe('Fallback');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace-only translations', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: '   ',
                es: 'Bienvenido'
              }
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      // Should skip whitespace-only and fallback to Spanish
      expect(translation).toBe('Bienvenido');
    });

    it('should handle non-string translation values', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: 123,
                es: 'Bienvenido'
              }
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      // Should skip non-string and fallback to Spanish
      expect(translation).toBe('Bienvenido');
    });

    it('should handle missing settings object', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: 'Welcome'
              }
            }
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'es' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      // Should default to 'en' when settings is missing
      expect(translation).toBe('Welcome');
    });

    it('should handle missing defaultLanguage in settings', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            welcomePage: {
              title: {
                en: 'Welcome',
                es: 'Bienvenido'
              }
            }
          },
          settings: {}
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'es' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('welcomePage.title', 'Fallback');

      // Should still work with current language
      expect(translation).toBe('Bienvenido');
    });

    it('should handle deeply nested paths', () => {
      (useSite as any).mockReturnValue({
        currentSite: {
          translations: {
            level1: {
              level2: {
                level3: {
                  en: 'Deep Translation'
                }
              }
            }
          },
          settings: {
            defaultLanguage: 'en'
          }
        }
      });

      (useLanguage as any).mockReturnValue({
        currentLanguage: { code: 'en' }
      });

      const { result } = renderHook(() => useSiteContent());
      const translation = result.current.getTranslatedContent('level1.level2.level3', 'Fallback');

      expect(translation).toBe('Deep Translation');
    });
  });
});
