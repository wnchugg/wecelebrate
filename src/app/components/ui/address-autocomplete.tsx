import React, { useState, useCallback, useEffect, useRef, useId } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from './input';
import { cn } from './utils';

export interface AddressData {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface AddressSuggestion {
  id: string;
  description: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressAutocompleteProps {
  onSelect: (address: AddressData) => void;
  onChange?: (value: string) => void;
  country?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  minQueryLength?: number;
  debounceMs?: number;
  id?: string;
}

export function AddressAutocomplete({
  onSelect,
  onChange,
  country,
  placeholder = 'Start typing address...',
  className,
  inputClassName,
  disabled = false,
  minQueryLength = 3,
  debounceMs = 300,
  id,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoId = useId();
  const inputId = id ?? `address-input-${autoId}`;
  const listboxId = `address-suggestions-${autoId}`;

  // Handle search with debouncing
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await fetchAddressSuggestions(searchQuery, country);
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Address autocomplete failed:', err);
        setError('Unable to fetch address suggestions');
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [country, minQueryLength]
  );

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // In most countries, don't search on digit-only queries (e.g. "1532") because
    // Geoapify matches zip codes instead of street addresses. Wait for a street name.
    // Exception: postcode-primary countries (JP, KR) where users search by zip code first.
    const POSTCODE_PRIMARY_COUNTRIES = new Set(['JP', 'KR']);
    const isPostcodePrimary = country ? POSTCODE_PRIMARY_COUNTRIES.has(country.toUpperCase()) : false;
    const isOnlyDigits = /^\d+$/.test(query);

    if (query.length >= minQueryLength && (!isOnlyDigits || isPostcodePrimary)) {
      debounceTimerRef.current = setTimeout(() => {
        handleSearch(query);
      }, debounceMs);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, minQueryLength, debounceMs, handleSearch]);

  // Handle suggestion selection
  const handleSelect = useCallback(
    (suggestion: AddressSuggestion) => {
      const parsedAddress = parseAddressSuggestion(suggestion);
      onSelect(parsedAddress);
      setQuery(suggestion.line1 || suggestion.description);
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    [onSelect]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, handleSelect]
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={selectedIndex >= 0 && isOpen ? `${listboxId}-option-${selectedIndex}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn('pl-10 pr-10', error && 'border-red-500', inputClassName)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1" role="alert">{error}</p>
      )}

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <ul id={listboxId} role="listbox" aria-label="Address suggestions" className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={selectedIndex === index}
                onClick={() => handleSelect(suggestion)}
                className={cn(
                  'px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors',
                  selectedIndex === index && 'bg-gray-100'
                )}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Fetches address suggestions from the backend autocomplete service
 * 
 * Integrates with Google Places API via the backend endpoint.
 * 
 * @param query - The search query string
 * @param country - Optional country code to filter results (e.g., 'US', 'GB', 'FR')
 * @returns Promise resolving to an array of address suggestions
 */
async function fetchAddressSuggestions(
  query: string,
  country?: string
): Promise<AddressSuggestion[]> {
  try {
    // Get environment configuration
    const env = await import('../../config/deploymentEnvironments').then(m => m.getCurrentEnvironment());
    const apiUrl = `https://${env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}.supabase.co/functions/v1/make-server-6fcaeea3`;
    
    // Build query parameters
    const params = new URLSearchParams({
      q: query,
    });
    
    if (country) {
      params.append('country', country);
    }

    // Call backend autocomplete endpoint
    const response = await fetch(`${apiUrl}/api/address-autocomplete/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Environment-ID': env.id,
        'Authorization': `Bearer ${env.supabaseAnonKey}`,
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      // If service is not configured (503), fail silently
      if (response.status === 503) {
        console.warn('Address autocomplete service not configured');
        return [];
      }
      throw new Error(`Service returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      console.warn('Invalid response format from address service');
      return [];
    }

    // Map suggestions directly — the backend now embeds address data in the search response
    // so we never need a separate details API call.
    const suggestions: AddressSuggestion[] = data.suggestions.map((item: any) => ({
      id: item.placeId,
      description: item.description,
      line1: item.address?.line1 || item.mainText || '',
      line2: item.address?.line2 || undefined,
      city: item.address?.city || '',
      state: item.address?.state || '',
      postalCode: item.address?.postalCode || '',
      country: item.address?.country || country || '',
    }));

    return suggestions;
  } catch (error) {
    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Address autocomplete request timed out');
      } else if (error.message.includes('Failed to fetch')) {
        console.error('Network error: Unable to reach address service');
      } else {
        console.error('Address autocomplete error:', error.message);
      }
    } else {
      console.error('Unknown error in address autocomplete:', error);
    }
    
    // Return empty array to allow graceful degradation to manual entry
    return [];
  }
}

/**
 * Parses an address suggestion into structured AddressData format
 * 
 * This function extracts and normalizes address components from a suggestion.
 * It handles various formats and ensures all required fields are present.
 * 
 * @param suggestion - The address suggestion to parse
 * @returns Structured AddressData object
 */
function parseAddressSuggestion(suggestion: AddressSuggestion): AddressData {
  return {
    line1: suggestion.line1 || '',
    line2: suggestion.line2 || undefined,
    city: suggestion.city || '',
    state: suggestion.state || '',
    postalCode: suggestion.postalCode || '',
    country: suggestion.country || '',
  };
}
