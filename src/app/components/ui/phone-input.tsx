import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from './utils';
import { useLanguage } from '../../context/LanguageContext';

// Country data with dial codes and formatting patterns
export const COUNTRIES = [
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', format: '(###) ###-####' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', format: '(###) ###-####' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧', format: '#### ### ####' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺', format: '#### ### ###' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿', format: '### ### ####' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪', format: '### ########' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', format: '# ## ## ## ##' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸', format: '### ### ###' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹', format: '### ### ####' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱', format: '## ########' },
  { code: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪', format: '### ## ## ##' },
  { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭', format: '## ### ## ##' },
  { code: 'AT', name: 'Austria', dial: '+43', flag: '🇦🇹', format: '### #######' },
  { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪', format: '##-### ## ##' },
  { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴', format: '### ## ###' },
  { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰', format: '## ## ## ##' },
  { code: 'FI', name: 'Finland', dial: '+358', flag: '🇫🇮', format: '## ### ####' },
  { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪', format: '## ### ####' },
  { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱', format: '### ### ###' },
  { code: 'CZ', name: 'Czech Republic', dial: '+420', flag: '🇨🇿', format: '### ### ###' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹', format: '### ### ###' },
  { code: 'GR', name: 'Greece', dial: '+30', flag: '🇬🇷', format: '### ### ####' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵', format: '##-####-####' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳', format: '### #### ####' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳', format: '##### #####' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬', format: '#### ####' },
  { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰', format: '#### ####' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷', format: '##-####-####' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾', format: '##-### ####' },
  { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭', format: '##-###-####' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭', format: '### ### ####' },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩', format: '###-###-####' },
  { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳', format: '### ### ####' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪', format: '## ### ####' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦', format: '## ### ####' },
  { code: 'IL', name: 'Israel', dial: '+972', flag: '🇮🇱', format: '##-###-####' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦', format: '## ### ####' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷', format: '(##) #####-####' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽', format: '### ### ####' },
  { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷', format: '### ###-####' },
  { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱', format: '# #### ####' },
  { code: 'CO', name: 'Colombia', dial: '+57', flag: '🇨🇴', format: '### ### ####' },
].sort((a, b) => a.name.localeCompare(b.name));

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  defaultCountry?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  error?: boolean;
  id?: string;
  name?: string;
}

export function PhoneInput({
  value = '',
  onChange,
  onBlur,
  defaultCountry = 'US',
  disabled = false,
  required = false,
  placeholder = 'Phone number',
  className,
  error = false,
  id,
  name,
}: PhoneInputProps) {
  const { t } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState(() => 
    COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0]
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      // Try to extract country code and number
      const country = COUNTRIES.find(c => value.startsWith(c.dial));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.substring(country.dial.length).trim());
      } else {
        setPhoneNumber(value);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isDropdownOpen]);

  // Format phone number based on country pattern
  const formatPhoneNumber = (input: string, pattern: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    let formatted = '';
    let digitIndex = 0;
    
    for (let i = 0; i < pattern.length && digitIndex < digits.length; i++) {
      if (pattern[i] === '#') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += pattern[i];
      }
    }
    
    // Add remaining digits if any
    if (digitIndex < digits.length) {
      formatted += digits.substring(digitIndex);
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input, selectedCountry.format);
    setPhoneNumber(formatted);
    
    // Call onChange with full international format
    const fullNumber = `${selectedCountry.dial} ${formatted}`.trim();
    onChange?.(fullNumber);
  };

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery('');
    
    // Reformat existing number with new country pattern
    if (phoneNumber) {
      const formatted = formatPhoneNumber(phoneNumber, country.format);
      setPhoneNumber(formatted);
      const fullNumber = `${country.dial} ${formatted}`.trim();
      onChange?.(fullNumber);
    }
    
    // Focus input after selection
    inputRef.current?.focus();
  };

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dial.includes(searchQuery)
  );

  return (
    <div className={cn('relative', className)}>
      <div className="flex gap-2">
        {/* Country Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 px-3 py-2 border rounded-lg bg-white transition-colors',
              'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:border-transparent',
              error ? 'border-red-500' : 'border-gray-300',
              disabled && 'bg-gray-50 cursor-not-allowed opacity-60'
            )}
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selectedCountry.dial}</span>
            <ChevronDown className={cn(
              'w-4 h-4 text-gray-500 transition-transform',
              isDropdownOpen && 'transform rotate-180'
            )} />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute z-50 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('form.searchCountries')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    autoFocus
                  />
                </div>
              </div>

              {/* Country List */}
              <div className="overflow-y-auto max-h-80">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left',
                        selectedCountry.code === country.code && 'bg-pink-50'
                      )}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {country.name}
                        </div>
                        <div className="text-xs text-gray-500">{country.dial}</div>
                      </div>
                      {selectedCountry.code === country.code && (
                        <Check className="w-4 h-4 text-[#D91C81] flex-shrink-0" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          ref={inputRef}
          type="tel"
          id={id}
          name={name}
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={cn(
            'flex-1 px-4 py-2 border rounded-lg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:border-transparent',
            error ? 'border-red-500' : 'border-gray-300',
            disabled && 'bg-gray-50 cursor-not-allowed opacity-60'
          )}
        />
      </div>

      {/* Format hint */}
      <div className="mt-1 text-xs text-gray-500">
        Format: {selectedCountry.dial} {selectedCountry.format.replace(/#/g, '0')}
      </div>
    </div>
  );
}
