/**
 * Unit Tests for AddressAutocomplete Component
 * Feature: internationalization-improvements
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressAutocomplete, AddressSuggestion } from '../address-autocomplete';

// Mock deployment environments so dynamic import doesn't fail
vi.mock('../../config/deploymentEnvironments', () => ({
  getCurrentEnvironment: vi.fn(() =>
    Promise.resolve({
      id: 'test',
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-anon-key',
    })
  ),
}));

const originalFetch = global.fetch;

/**
 * Creates a fetch mock that handles the address API:
 * GET /search?q=... → { suggestions: [{ placeId, description, mainText, address: {...} }] }
 * 
 * The backend now embeds full address data in the search response.
 */
function createFetchMock(suggestions: AddressSuggestion[]) {
  return vi.fn().mockImplementation((url: string) => {
    if (String(url).includes('/search')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          suggestions: suggestions.map(s => ({
            placeId: s.id,
            description: s.description,
            mainText: s.line1,
            address: {
              line1: s.line1,
              line2: s.line2,
              city: s.city,
              state: s.state,
              postalCode: s.postalCode,
              country: s.country,
            },
          })),
        }),
      } as Response);
    }
    // Fallback for any other requests
    return Promise.resolve({ ok: false, status: 404 } as Response);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterEach(() => {
  global.fetch = originalFetch;
  cleanup();
});

describe('AddressAutocomplete Component', () => {
  describe('Suggestion Rendering', () => {
    it('should render suggestions when API returns results', async () => {
      const mockSuggestions: AddressSuggestion[] = [
        {
          id: '1',
          description: '123 Main St, New York, NY 10001',
          line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        {
          id: '2',
          description: '456 Oak Ave, Los Angeles, CA 90001',
          line1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'US',
        },
      ];

      global.fetch = createFetchMock(mockSuggestions);

      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
      );

      const input = container.querySelector('input');
      await user.type(input, 'test');

      await waitFor(() => {
        const suggestions = container.querySelectorAll('li');
        expect(suggestions.length).toBe(2);
      }, { timeout: 3000 });

      expect(screen.getByText('123 Main St, New York, NY 10001')).toBeTruthy();
      expect(screen.getByText('456 Oak Ave, Los Angeles, CA 90001')).toBeTruthy();
    });

    it('should not render suggestions when query is too short', async () => {
      global.fetch = vi.fn();

      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete onSelect={onSelect} minQueryLength={3} debounceMs={0} />
      );

      const input = container.querySelector('input');
      await user.type(input, 'ab');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).not.toHaveBeenCalled();
      const suggestions = container.querySelectorAll('li');
      expect(suggestions.length).toBe(0);
    });

    it('should show loading indicator while fetching', async () => {
      global.fetch = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ suggestions: [] }),
        } as Response), 500))
      );

      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
      );

      const input = container.querySelector('input');
      await user.type(input, 'test');

      // Check for loading spinner
      await waitFor(() => {
        const loader = container.querySelector('.animate-spin');
        expect(loader).toBeTruthy();
      });
    });
  });

  describe('Selection Handling', () => {
    it('should handle suggestion selection via click', async () => {
      const mockSuggestion: AddressSuggestion = {
        id: '1',
        description: '123 Main St, New York, NY 10001',
        line1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };

      global.fetch = createFetchMock([mockSuggestion]);

      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
      );

      const input = container.querySelector('input');
      await user.type(input, 'test');

      await waitFor(() => {
        const suggestions = container.querySelectorAll('li');
        expect(suggestions.length).toBe(1);
      }, { timeout: 3000 });

      const suggestion = container.querySelector('li') as HTMLElement;
      await user.click(suggestion);

      expect(onSelect).toHaveBeenCalledWith({
        line1: '123 Main St',
        line2: undefined,
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      });
    });

    it('should handle keyboard navigation and selection', async () => {
      const mockSuggestions: AddressSuggestion[] = [
        {
          id: '1',
          description: '123 Main St, New York, NY 10001',
          line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        {
          id: '2',
          description: '456 Oak Ave, Los Angeles, CA 90001',
          line1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'US',
        },
      ];

      global.fetch = createFetchMock(mockSuggestions);

      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
      );

      const input = container.querySelector('input');
      await user.type(input, 'test');

      await waitFor(() => {
        const suggestions = container.querySelectorAll('li');
        expect(suggestions.length).toBe(2);
      }, { timeout: 3000 });

      // Navigate down to first item
      await user.keyboard('{ArrowDown}');

      // Navigate down to second item
      await user.keyboard('{ArrowDown}');

      // Select second item
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledWith({
        line1: '456 Oak Ave',
        line2: undefined,
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'US',
      });
    });

    it('should close dropdown on Escape key', async () => {
      const mockSuggestion: AddressSuggestion = {
        id: '1',
        description: '123 Main St, New York, NY 10001',
        line1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };

      global.fetch = createFetchMock([mockSuggestion]);

      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
      );

      const input = container.querySelector('input');
      await user.type(input, 'test');

      await waitFor(() => {
        const suggestions = container.querySelectorAll('li');
        expect(suggestions.length).toBe(1);
      }, { timeout: 3000 });

      // Press Escape
      await user.keyboard('{Escape}');

      // Dropdown should be closed
      await waitFor(() => {
        const suggestions = container.querySelectorAll('li');
        expect(suggestions.length).toBe(0);
      });
    });
  });

  describe('Service Error Handling', () => {
    it('should handle API errors gracefully without crashing', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
      );

      const input = container.querySelector('input');
      await user.type(input, 'test');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Component should not crash - input should still be present
      expect(input).toBeTruthy();
      expect(input.value).toBe('test');

      // Should not show suggestions
      const suggestions = container.querySelectorAll('li');
      expect(suggestions.length).toBe(0);
    });

    it('should handle non-OK response status without crashing', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
      );

      const input = container.querySelector('input');
      await user.type(input, 'test');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Component should not crash
      expect(input).toBeTruthy();
      expect(input.value).toBe('test');
    });

    it('should handle timeout errors without crashing', async () => {
      global.fetch = vi.fn().mockImplementation(
        () => new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AbortError')), 100);
        })
      );

      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete onSelect={onSelect} debounceMs={0} />
      );

      const input = container.querySelector('input');
      await user.type(input, 'test');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Component should not crash
      expect(input).toBeTruthy();
      expect(input.value).toBe('test');
    });
  });

  describe('Component Props', () => {
    it('should use custom placeholder', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <AddressAutocomplete
          onSelect={onSelect}
          placeholder="Enter your address"
        />
      );

      const input = container.querySelector('input[placeholder="Enter your address"]');
      expect(input).toBeTruthy();
    });

    it('should respect disabled prop', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete onSelect={onSelect} disabled={true} />
      );

      const input = container.querySelector('input');
      expect(input.disabled).toBe(true);

      // Should not allow typing
      await user.type(input, 'test');
      expect(input.value).toBe('');
    });

    it('should respect custom minQueryLength', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ suggestions: [] }),
      } as Response);

      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete
          onSelect={onSelect}
          minQueryLength={5}
          debounceMs={0}
        />
      );

      const input = container.querySelector('input');

      // Type 4 characters (below minimum)
      await user.type(input, 'test');
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(global.fetch).not.toHaveBeenCalled();

      // Type 5th character (meets minimum)
      await user.type(input, '5');
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should apply custom className', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <AddressAutocomplete
          onSelect={onSelect}
          className="custom-class"
        />
      );

      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeTruthy();
    });
  });

  describe('Debouncing', () => {
    it('should debounce API calls', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ suggestions: [] }),
      } as Response);

      const onSelect = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <AddressAutocomplete onSelect={onSelect} debounceMs={300} />
      );

      const input = container.querySelector('input');

      // Type multiple characters quickly
      await user.type(input, 'test');

      // Should not call API immediately
      expect(global.fetch).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
    });
  });
});
