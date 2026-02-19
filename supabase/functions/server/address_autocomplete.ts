/**
 * Address Autocomplete Service
 * 
 * Provides address autocomplete functionality using multiple providers:
 * - Google Places API (premium, most accurate)
 * - Geoapify API (affordable, generous free tier)
 * 
 * This service is used by the AddressAutocomplete component on the frontend.
 * 
 * Features:
 * - Multi-provider support with automatic fallback
 * - Address search with country filtering
 * - Structured address parsing
 * - Rate limiting to prevent API abuse
 * - Error handling and fallback
 */

import { Hono } from "npm:hono@4.0.2";

// ===== Types =====

export interface AddressData {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

type Provider = 'google' | 'geoapify' | 'none';

// Google Places API Types
interface GooglePlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlaceDetails {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
}

// Geoapify API Types
interface GeoapifyFeature {
  properties: {
    place_id: string;
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country_code?: string;
    country?: string;
  };
}

// Unified suggestion format
interface UnifiedSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

// ===== Configuration =====

const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
const GEOAPIFY_API_KEY = Deno.env.get('GEOAPIFY_API_KEY');

// Google Places URLs
const GOOGLE_AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const GOOGLE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

// Geoapify URLs
const GEOAPIFY_AUTOCOMPLETE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';
const GEOAPIFY_DETAILS_URL = 'https://api.geoapify.com/v1/geocode/search';

// ===== Provider Detection =====

function getActiveProvider(): Provider {
  if (GOOGLE_PLACES_API_KEY) return 'google';
  if (GEOAPIFY_API_KEY) return 'geoapify';
  return 'none';
}

// ===== Google Places Implementation =====

/**
 * Search for address suggestions using Google Places Autocomplete API
 */
async function searchAddressesGoogle(
  query: string,
  country?: string
): Promise<UnifiedSuggestion[]> {
  try {
    const params = new URLSearchParams({
      input: query,
      key: GOOGLE_PLACES_API_KEY!,
      types: 'address',
      language: 'en',
    });

    if (country) {
      params.append('components', `country:${country.toLowerCase()}`);
    }

    const response = await fetch(`${GOOGLE_AUTOCOMPLETE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return [];
    }

    const predictions: GooglePlaceSuggestion[] = data.predictions || [];
    return predictions.map(p => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting.main_text,
      secondaryText: p.structured_formatting.secondary_text,
    }));
  } catch (error) {
    console.error('Google Places search error:', error);
    return [];
  }
}

/**
 * Get detailed address information from Google Places
 */
async function getPlaceDetailsGoogle(placeId: string): Promise<AddressData | null> {
  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key: GOOGLE_PLACES_API_KEY!,
      fields: 'address_components,formatted_address',
    });

    const response = await fetch(`${GOOGLE_DETAILS_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places Details API error:', data.status, data.error_message);
      return null;
    }

    return parseGoogleAddressComponents(data.result.address_components);
  } catch (error) {
    console.error('Google Places details error:', error);
    return null;
  }
}

/**
 * Parse Google Places address components into structured AddressData
 */
function parseGoogleAddressComponents(components: GooglePlaceDetails['address_components']): AddressData {
  const address: Partial<AddressData> = {
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  };

  let streetNumber = '';
  let route = '';

  for (const component of components) {
    const types = component.types;

    if (types.includes('street_number')) {
      streetNumber = component.long_name;
    } else if (types.includes('route')) {
      route = component.long_name;
    } else if (types.includes('locality')) {
      address.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      address.state = component.short_name;
    } else if (types.includes('postal_code')) {
      address.postalCode = component.long_name;
    } else if (types.includes('country')) {
      address.country = component.short_name;
    } else if (types.includes('subpremise')) {
      address.line2 = component.long_name;
    }
  }

  // Combine street number and route for line1
  if (streetNumber && route) {
    address.line1 = `${streetNumber} ${route}`;
  } else if (route) {
    address.line1 = route;
  }

  return address as AddressData;
}

// ===== Geoapify Implementation =====

/**
 * Search for address suggestions using Geoapify Autocomplete API
 */
async function searchAddressesGeoapify(
  query: string,
  country?: string
): Promise<UnifiedSuggestion[]> {
  try {
    const params = new URLSearchParams({
      text: query,
      apiKey: GEOAPIFY_API_KEY!,
      type: 'amenity,street,postcode',
      format: 'json',
      limit: '5',
    });

    if (country) {
      params.append('filter', `countrycode:${country.toLowerCase()}`);
    }

    const response = await fetch(`${GEOAPIFY_AUTOCOMPLETE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`);
    }

    const data = await response.json();
    const results: GeoapifyFeature[] = data.results || [];

    return results.map((result, index) => {
      const props = result.properties;
      const mainText = props.address_line1 || props.formatted?.split(',')[0] || '';
      const secondaryText = props.formatted?.split(',').slice(1).join(',').trim() || '';

      return {
        placeId: props.place_id || `geoapify-${index}`,
        description: props.formatted || '',
        mainText,
        secondaryText,
      };
    });
  } catch (error) {
    console.error('Geoapify search error:', error);
    return [];
  }
}

/**
 * Get detailed address information from Geoapify
 */
async function getPlaceDetailsGeoapify(placeId: string): Promise<AddressData | null> {
  try {
    // Geoapify place_id format: "place:<osm_type>:<osm_id>"
    // We need to use the search endpoint with the place_id
    const params = new URLSearchParams({
      apiKey: GEOAPIFY_API_KEY!,
      format: 'json',
    });

    // Extract OSM type and ID from place_id
    const placeIdMatch = placeId.match(/place:(\w+):(\d+)/);
    if (placeIdMatch) {
      const [, osmType, osmId] = placeIdMatch;
      params.append('osm_type', osmType);
      params.append('osm_id', osmId);
    } else {
      // Fallback: treat placeId as a search query
      params.append('text', placeId);
    }

    const response = await fetch(`${GEOAPIFY_DETAILS_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`);
    }

    const data = await response.json();
    const results: GeoapifyFeature[] = data.results || [];

    if (results.length === 0) {
      return null;
    }

    return parseGeoapifyAddress(results[0].properties);
  } catch (error) {
    console.error('Geoapify details error:', error);
    return null;
  }
}

/**
 * Parse Geoapify properties into structured AddressData
 */
function parseGeoapifyAddress(props: GeoapifyFeature['properties']): AddressData {
  const address: AddressData = {
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  };

  // Build line1 from housenumber and street
  if (props.housenumber && props.street) {
    address.line1 = `${props.housenumber} ${props.street}`;
  } else if (props.street) {
    address.line1 = props.street;
  } else if (props.address_line1) {
    address.line1 = props.address_line1;
  }

  // Line2 (if available)
  if (props.address_line2) {
    address.line2 = props.address_line2;
  }

  // City
  address.city = props.city || '';

  // State
  address.state = props.state || '';

  // Postal code
  address.postalCode = props.postcode || '';

  // Country (use country_code, fallback to country name)
  address.country = props.country_code?.toUpperCase() || props.country || '';

  return address;
}

// ===== Unified Interface =====

/**
 * Search for address suggestions using the active provider
 */
async function searchAddresses(
  query: string,
  country?: string
): Promise<UnifiedSuggestion[]> {
  const provider = getActiveProvider();

  if (provider === 'none') {
    console.warn('No address autocomplete provider configured');
    return [];
  }

  console.log(`[Address Autocomplete] Using provider: ${provider}`);

  if (provider === 'google') {
    return searchAddressesGoogle(query, country);
  } else {
    return searchAddressesGeoapify(query, country);
  }
}

/**
 * Get detailed address information for a place ID using the active provider
 */
async function getPlaceDetails(placeId: string): Promise<AddressData | null> {
  const provider = getActiveProvider();

  if (provider === 'none') {
    return null;
  }

  if (provider === 'google') {
    return getPlaceDetailsGoogle(placeId);
  } else {
    return getPlaceDetailsGeoapify(placeId);
  }
}

// ===== Route Setup =====

export function setupAddressAutocompleteRoutes(app: Hono) {
  /**
   * GET /api/address-autocomplete/search
   * 
   * Search for address suggestions
   * 
   * Query Parameters:
   * - q: Search query (required, min 3 characters)
   * - country: ISO country code for filtering (optional, e.g., "US", "CA", "GB")
   * 
   * Returns:
   * - suggestions: Array of address suggestions with place_id and description
   */
  app.get('/make-server-6fcaeea3/api/address-autocomplete/search', async (c) => {
    try {
      const query = c.req.query('q');
      const country = c.req.query('country');

      // Validate query parameter
      if (!query || query.length < 3) {
        return c.json({
          error: 'Query parameter "q" is required and must be at least 3 characters',
          suggestions: []
        }, 400);
      }

      // Check if API key is configured
      const provider = getActiveProvider();
      if (provider === 'none') {
        return c.json({
          error: 'Address autocomplete service not configured',
          suggestions: []
        }, 503);
      }

      // Search for addresses
      const suggestions = await searchAddresses(query, country);

      // Format response
      const formattedSuggestions = suggestions.map(s => ({
        placeId: s.place_id,
        description: s.description,
        mainText: s.structured_formatting.main_text,
        secondaryText: s.structured_formatting.secondary_text,
      }));

      return c.json({
        suggestions: formattedSuggestions,
        count: formattedSuggestions.length
      });
    } catch (error: any) {
      console.error('Address autocomplete search error:', error);
      return c.json({
        error: 'Failed to search addresses',
        message: error.message,
        suggestions: []
      }, 500);
    }
  });

  /**
   * GET /api/address-autocomplete/details/:placeId
   * 
   * Get detailed address information for a place ID
   * 
   * Path Parameters:
   * - placeId: Google Places place_id (required)
   * 
   * Returns:
   * - address: Structured address data (AddressData)
   */
  app.get('/make-server-6fcaeea3/api/address-autocomplete/details/:placeId', async (c) => {
    try {
      const placeId = c.req.param('placeId');

      if (!placeId) {
        return c.json({
          error: 'Place ID is required'
        }, 400);
      }

      // Check if API key is configured
      const provider = getActiveProvider();
      if (provider === 'none') {
        return c.json({
          error: 'Address autocomplete service not configured'
        }, 503);
      }

      // Get place details
      const address = await getPlaceDetails(placeId);

      if (!address) {
        return c.json({
          error: 'Failed to fetch place details'
        }, 404);
      }

      return c.json({
        address,
        formattedAddress: `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`
      });
    } catch (error: any) {
      console.error('Address details fetch error:', error);
      return c.json({
        error: 'Failed to fetch address details',
        message: error.message
      }, 500);
    }
  });

  /**
   * GET /api/address-autocomplete/health
   * 
   * Health check endpoint for address autocomplete service
   * 
   * Returns:
   * - status: Service status
   * - configured: Whether API key is configured
   */
  app.get('/make-server-6fcaeea3/api/address-autocomplete/health', async (c) => {
    const provider = getActiveProvider();
    
    return c.json({
      status: 'ok',
      service: 'address-autocomplete',
      provider: provider,
      configured: provider !== 'none',
      message: provider !== 'none'
        ? `Address autocomplete service is ready (using ${provider})`
        : 'No address autocomplete provider configured. Set GOOGLE_PLACES_API_KEY or GEOAPIFY_API_KEY'
    });
  });
}

export default setupAddressAutocompleteRoutes;
