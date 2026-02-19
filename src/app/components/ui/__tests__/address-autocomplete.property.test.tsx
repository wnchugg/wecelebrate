/**
 * Property-Based Tests for AddressAutocomplete Component
 * Feature: internationalization-improvements
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressAutocomplete, AddressSuggestion } from '../address-autocomplete';

// Mock fetch globally
const originalFetch = global.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterEach(() => {
  global.fetch = originalFetch;
  cleanup();
});

/**
 * Property 25: Country filter limits results
 * Validates: Requirements 11.3
 * 
 * For any country code and search query, when the country filter is specified,
 * all autocomplete results should be from that country only.
 */
describe('Property 25: Country filter limits results', () => {
  it('should only return suggestions from the specified country', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('US', 'GB', 'FR', 'DE', 'CA', 'AU', 'JP', 'CN'),
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s)),
        async (countryCode, query) => {
          cleanup(); // Clean up before each property test iteration
          
          // Mock suggestions with mixed countries
          const mockSuggestions: AddressSuggestion[] = [
            {
              id: '1',
              description: `${query} Street, City, ${countryCode}`,
              line1: `${query} Street`,
              city: 'City',
              state: 'State',
              postalCode: '12345',
              country: countryCode,
            },
            {
              id: '2',
              description: `${query} Avenue, Town, ${countryCode}`,
              line1: `${query} Avenue`,
              city: 'Town',
              state: 'Region',
              postalCode: '67890',
              country: countryCode,
            },
          ];

          // Mock fetch to return filtered suggestions
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockSuggestions,
          } as Response);

          const onSelect = vi.fn();
          const user = userEvent.setup();

          const { container } = render(
            <AddressAutocomplete
              onSelect={onSelect}
              country={countryCode}
              placeholder="Search address"
              debounceMs={0}
            />
          );

          const input = container.querySelector('input[placeholder="Search address"]') as HTMLInputElement;
          expect(input).toBeTruthy();
          
          await user.type(input, query);

          // Wait for debounce and API call
          await waitFor(
            () => {
              expect(global.fetch).toHaveBeenCalled();
            },
            { timeout: 1000 }
          );

          // Verify fetch was called with country parameter
          const fetchCall = (global.fetch as any).mock.calls[0];
          const url = fetchCall[0];
          expect(url).toContain(`country=${countryCode}`);

          // Wait for suggestions to appear
          await waitFor(
            () => {
              const suggestions = container.querySelectorAll('li');
              expect(suggestions.length).toBeGreaterThan(0);
            },
            { timeout: 1000 }
          );

          // Verify all visible suggestions contain the country code
          const suggestionElements = container.querySelectorAll('li p');
          suggestionElements.forEach((element) => {
            expect(element.textContent).toContain(countryCode);
          });
          
          cleanup(); // Clean up after each iteration
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  });

  it('should pass country parameter to API when specified', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('US', 'GB', 'FR', 'DE', 'CA'),
        fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s)),
        async (country, query) => {
          cleanup(); // Clean up before each iteration
          
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
          } as Response);

          const onSelect = vi.fn();
          const user = userEvent.setup();

          const { container } = render(
            <AddressAutocomplete
              onSelect={onSelect}
              country={country}
              debounceMs={0}
            />
          );

          const input = container.querySelector('input') as HTMLInputElement;
          expect(input).toBeTruthy();
          
          await user.type(input, query);

          await waitFor(
            () => {
              expect(global.fetch).toHaveBeenCalled();
            },
            { timeout: 1000 }
          );

          // Verify the API was called with the country parameter
          const fetchCall = (global.fetch as any).mock.calls[0];
          const url = fetchCall[0];
          expect(url).toContain('country=');
          expect(url).toContain(country);
          
          cleanup(); // Clean up after each iteration
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  });

  it('should not include country parameter when not specified', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s)),
        async (query) => {
          cleanup(); // Clean up before each iteration
          
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
          } as Response);

          const onSelect = vi.fn();
          const user = userEvent.setup();

          const { container } = render(
            <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
          );

          const input = container.querySelector('input') as HTMLInputElement;
          expect(input).toBeTruthy();
          
          await user.type(input, query);

          await waitFor(
            () => {
              expect(global.fetch).toHaveBeenCalled();
            },
            { timeout: 1000 }
          );

          // Verify the API was called without country parameter
          const fetchCall = (global.fetch as any).mock.calls[0];
          const url = fetchCall[0];
          expect(url).not.toContain('country=');
          
          cleanup(); // Clean up after each iteration
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  });
});

/**
 * Property 26: Suggestion selection parses address
 * Validates: Requirements 11.4
 * 
 * For any autocomplete suggestion, when selected, the parsed result should contain
 * all required address fields (line1, city, state, postalCode, country).
 */
describe('Property 26: Suggestion selection parses address', () => {
  it('should parse all required address fields from suggestion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          line1: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s)),
          line2: fc.option(fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s)), { nil: undefined }),
          city: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z\s]+$/.test(s)),
          state: fc.string({ minLength: 2, maxLength: 20 }).filter(s => /^[a-zA-Z\s]+$/.test(s)),
          postalCode: fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z0-9\s-]+$/.test(s)),
          country: fc.constantFrom('US', 'GB', 'FR', 'DE', 'CA'),
        }),
        async (addressData) => {
          cleanup();
          
          const mockSuggestion: AddressSuggestion = {
            id: '1',
            description: `${addressData.line1}, ${addressData.city}, ${addressData.state} ${addressData.postalCode}`,
            ...addressData,
          };

          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [mockSuggestion],
          } as Response);

          const onSelect = vi.fn();
          const user = userEvent.setup();

          const { container } = render(
            <AddressAutocomplete
              onSelect={onSelect}
              debounceMs={0}
            />
          );

          const input = container.querySelector('input') as HTMLInputElement;
          await user.type(input, 'test');

          // Wait for suggestions to appear
          await waitFor(
            () => {
              const suggestions = container.querySelectorAll('li');
              expect(suggestions.length).toBeGreaterThan(0);
            },
            { timeout: 1000 }
          );

          // Click the first suggestion
          const firstSuggestion = container.querySelector('li') as HTMLElement;
          await user.click(firstSuggestion);

          // Verify onSelect was called with parsed address
          await waitFor(() => {
            expect(onSelect).toHaveBeenCalled();
          });

          const parsedAddress = onSelect.mock.calls[0][0];
          
          // Verify all required fields are present
          expect(parsedAddress).toHaveProperty('line1');
          expect(parsedAddress).toHaveProperty('city');
          expect(parsedAddress).toHaveProperty('state');
          expect(parsedAddress).toHaveProperty('postalCode');
          expect(parsedAddress).toHaveProperty('country');
          
          // Verify field values match
          expect(parsedAddress.line1).toBe(addressData.line1);
          expect(parsedAddress.city).toBe(addressData.city);
          expect(parsedAddress.state).toBe(addressData.state);
          expect(parsedAddress.postalCode).toBe(addressData.postalCode);
          expect(parsedAddress.country).toBe(addressData.country);
          
          if (addressData.line2) {
            expect(parsedAddress.line2).toBe(addressData.line2);
          }
          
          cleanup();
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  });

  it('should handle suggestions with missing optional fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          line1: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s)),
          city: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z\s]+$/.test(s)),
          state: fc.string({ minLength: 2, maxLength: 20 }).filter(s => /^[a-zA-Z\s]+$/.test(s)),
          postalCode: fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z0-9\s-]+$/.test(s)),
          country: fc.constantFrom('US', 'GB', 'FR'),
        }),
        async (addressData) => {
          cleanup();
          
          const mockSuggestion: AddressSuggestion = {
            id: '1',
            description: `${addressData.line1}, ${addressData.city}`,
            ...addressData,
            line2: undefined, // Explicitly no line2
          };

          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [mockSuggestion],
          } as Response);

          const onSelect = vi.fn();
          const user = userEvent.setup();

          const { container } = render(
            <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
          );

          const input = container.querySelector('input') as HTMLInputElement;
          await user.type(input, 'test');

          await waitFor(
            () => {
              const suggestions = container.querySelectorAll('li');
              expect(suggestions.length).toBeGreaterThan(0);
            },
            { timeout: 1000 }
          );

          const firstSuggestion = container.querySelector('li') as HTMLElement;
          await user.click(firstSuggestion);

          await waitFor(() => {
            expect(onSelect).toHaveBeenCalled();
          });

          const parsedAddress = onSelect.mock.calls[0][0];
          
          // Verify required fields are present
          expect(parsedAddress.line1).toBe(addressData.line1);
          expect(parsedAddress.city).toBe(addressData.city);
          expect(parsedAddress.state).toBe(addressData.state);
          expect(parsedAddress.postalCode).toBe(addressData.postalCode);
          expect(parsedAddress.country).toBe(addressData.country);
          
          // line2 should be undefined or not cause errors
          expect(parsedAddress.line2).toBeUndefined();
          
          cleanup();
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  });
});

/**
 * Property 27: Suggestion selection invokes callback
 * Validates: Requirements 11.5
 * 
 * For any autocomplete suggestion, when selected, the onSelect callback should be
 * invoked with the parsed address data.
 */
describe('Property 27: Suggestion selection invokes callback', () => {
  it('should invoke onSelect callback when suggestion is clicked', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          line1: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s)),
          city: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z\s]+$/.test(s)),
          state: fc.string({ minLength: 2, maxLength: 20 }).filter(s => /^[a-zA-Z\s]+$/.test(s)),
          postalCode: fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z0-9\s-]+$/.test(s)),
          country: fc.constantFrom('US', 'GB', 'FR', 'DE', 'CA'),
        }),
        async (addressData) => {
          cleanup();
          
          const mockSuggestion: AddressSuggestion = {
            id: '1',
            description: `${addressData.line1}, ${addressData.city}`,
            ...addressData,
          };

          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [mockSuggestion],
          } as Response);

          const onSelect = vi.fn();
          const user = userEvent.setup();

          const { container } = render(
            <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
          );

          const input = container.querySelector('input') as HTMLInputElement;
          await user.type(input, 'test');

          await waitFor(
            () => {
              const suggestions = container.querySelectorAll('li');
              expect(suggestions.length).toBeGreaterThan(0);
            },
            { timeout: 1000 }
          );

          // Click the suggestion
          const firstSuggestion = container.querySelector('li') as HTMLElement;
          await user.click(firstSuggestion);

          // Verify callback was invoked exactly once
          await waitFor(() => {
            expect(onSelect).toHaveBeenCalledTimes(1);
          });

          // Verify callback was called with address data
          expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({
              line1: addressData.line1,
              city: addressData.city,
              state: addressData.state,
              postalCode: addressData.postalCode,
              country: addressData.country,
            })
          );
          
          cleanup();
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  });

  it('should invoke onSelect callback when suggestion is selected via keyboard', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          line1: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s)),
          city: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z\s]+$/.test(s)),
          state: fc.string({ minLength: 2, maxLength: 20 }).filter(s => /^[a-zA-Z\s]+$/.test(s)),
          postalCode: fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z0-9\s-]+$/.test(s)),
          country: fc.constantFrom('US', 'GB', 'FR'),
        }),
        async (addressData) => {
          cleanup();
          
          const mockSuggestion: AddressSuggestion = {
            id: '1',
            description: `${addressData.line1}, ${addressData.city}`,
            ...addressData,
          };

          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [mockSuggestion],
          } as Response);

          const onSelect = vi.fn();
          const user = userEvent.setup();

          const { container } = render(
            <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
          );

          const input = container.querySelector('input') as HTMLInputElement;
          await user.type(input, 'test');

          await waitFor(
            () => {
              const suggestions = container.querySelectorAll('li');
              expect(suggestions.length).toBeGreaterThan(0);
            },
            { timeout: 1000 }
          );

          // Navigate with arrow down and select with Enter
          await user.keyboard('{ArrowDown}');
          await user.keyboard('{Enter}');

          // Verify callback was invoked
          await waitFor(() => {
            expect(onSelect).toHaveBeenCalledTimes(1);
          });

          // Verify callback was called with correct data
          expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({
              line1: addressData.line1,
              city: addressData.city,
              state: addressData.state,
              postalCode: addressData.postalCode,
              country: addressData.country,
            })
          );
          
          cleanup();
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  });

  it('should not invoke callback when no suggestion is selected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s)),
        async (query) => {
          cleanup();
          
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
          } as Response);

          const onSelect = vi.fn();
          const user = userEvent.setup();

          const { container } = render(
            <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
          );

          const input = container.querySelector('input') as HTMLInputElement;
          await user.type(input, query);

          await waitFor(
            () => {
              expect(global.fetch).toHaveBeenCalled();
            },
            { timeout: 1000 }
          );

          // Wait a bit to ensure no suggestions appear
          await new Promise(resolve => setTimeout(resolve, 200));

          // Verify callback was never invoked
          expect(onSelect).not.toHaveBeenCalled();
          
          cleanup();
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  });
});
