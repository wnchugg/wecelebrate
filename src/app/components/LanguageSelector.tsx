import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage, languages } from '../context/LanguageContext';

export interface LanguageSelectorProps {
  variant?: 'light' | 'dark';
}

export function LanguageSelector({ variant = 'light' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, setLanguage } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDark = variant === 'dark';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2 min-h-[44px] ${
          isDark 
            ? 'hover:bg-white/20 text-white' 
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        aria-label={`Select language. Current language: ${currentLanguage.name}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className={`w-5 h-5 ${isDark ? 'text-white/80' : 'text-gray-600'}`} aria-hidden="true" />
        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
          <span aria-hidden="true">{currentLanguage.flag}</span> {currentLanguage.code.toUpperCase()}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-white/80' : 'text-gray-600'}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[110]"
          role="listbox"
          aria-label="Language options"
        >
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                setLanguage(language);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={currentLanguage.code === language.code}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-100 min-h-[44px] ${
                currentLanguage.code === language.code ? 'bg-blue-50' : ''
              }`}
            >
              <span className="text-xl" aria-hidden="true">{language.flag}</span>
              <span className="text-sm font-medium text-gray-700">{language.name}</span>
              {currentLanguage.code === language.code && (
                <span className="ml-auto text-[#D91C81]" aria-label="Selected">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;