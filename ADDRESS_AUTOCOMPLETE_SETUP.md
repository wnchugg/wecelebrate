# Address Autocomplete Setup Guide

This guide explains how to set up and use the address autocomplete feature for the internationalization improvements.

## Overview

The address autocomplete feature provides real-time address suggestions as users type. It supports multiple providers:

1. **Google Places API** (premium, most accurate)
   - Best global coverage
   - Most accurate results
   - Higher cost ($2.83 per 1,000 sessions)

2. **Geoapify API** (affordable, generous free tier)
   - 3,000 free requests/day
   - Good global coverage
   - Lower cost ($1 per 1,000 requests after free tier)

The service automatically uses whichever provider is configured. If both are configured, Google Places takes priority.

## Architecture

1. **Backend Service** (`supabase/functions/server/address_autocomplete.ts`)
   - Multi-provider support (Google Places, Geoapify)
   - Automatic provider selection
   - Unified API interface
   - Rate limiting and error handling

2. **Frontend Component** (`src/app/components/ui/address-autocomplete.tsx`)
   - User-friendly autocomplete input
   - Keyboard navigation support
   - Graceful fallback to manual entry

## Backend Setup

You can choose either Google Places API or Geoapify API (or configure both for redundancy).

### Option 1: Geoapify API (Recommended for Most Use Cases)

Geoapify offers a generous free tier and is more affordable for high-volume usage.

#### 1. Get Geoapify API Key

1. Go to [Geoapify](https://www.geoapify.com/)
2. Sign up for a free account
3. Go to "My Projects" → Create a new project
4. Copy the API key
5. Free tier includes:
   - 3,000 requests/day
   - No credit card required
   - Automatic upgrade available

#### 2. Configure Environment Variable

```bash
# Using Supabase CLI
supabase secrets set GEOAPIFY_API_KEY=your_api_key_here

# Or via Supabase Dashboard
# Go to: Project Settings → Edge Functions → Secrets
# Add: GEOAPIFY_API_KEY = your_api_key_here
```

### Option 2: Google Places API (Premium Option)

Google Places provides the most accurate results but at a higher cost.

#### 1. Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API (optional, for enhanced features)
4. Create credentials:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the API key
5. Restrict the API key (recommended):
   - Set application restrictions (HTTP referrers or IP addresses)
   - Set API restrictions to only allow Places API and Geocoding API

#### 2. Configure Environment Variable

Add the Google Places API key to your Supabase Edge Function environment:

```bash
# Using Supabase CLI
supabase secrets set GOOGLE_PLACES_API_KEY=your_api_key_here

# Or via Supabase Dashboard
# Go to: Project Settings → Edge Functions → Secrets
# Add: GOOGLE_PLACES_API_KEY = your_api_key_here
```

### Provider Priority

If both API keys are configured:
- Google Places API will be used (higher accuracy)
- Geoapify serves as a fallback option

If only one is configured:
- That provider will be used automatically

### 3. Deploy Backend

The address autocomplete routes are automatically included when you deploy the backend:

```bash
# Deploy to development environment
npm run deploy:backend:dev

# Deploy to production environment
npm run deploy:backend:prod
```

### 4. Verify Setup

Test the health endpoint to confirm the service is configured:

```bash
curl https://your-project.supabase.co/functions/v1/make-server-6fcaeea3/api/address-autocomplete/health \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Environment-ID: development"
```

Expected response:
```json
{
  "status": "ok",
  "service": "address-autocomplete",
  "provider": "geoapify",
  "configured": true,
  "message": "Address autocomplete service is ready (using geoapify)"
}
```

Or if using Google Places:
```json
{
  "status": "ok",
  "service": "address-autocomplete",
  "provider": "google",
  "configured": true,
  "message": "Address autocomplete service is ready (using google)"
}
```

## API Endpoints

### 1. Search Addresses

**Endpoint:** `GET /api/address-autocomplete/search`

**Query Parameters:**
- `q` (required): Search query (minimum 3 characters)
- `country` (optional): ISO country code (e.g., "US", "CA", "GB")

**Example:**
```bash
curl "https://your-project.supabase.co/functions/v1/make-server-6fcaeea3/api/address-autocomplete/search?q=123%20Main%20St&country=US" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Environment-ID: development"
```

**Response:**
```json
{
  "suggestions": [
    {
      "placeId": "ChIJ...",
      "description": "123 Main Street, New York, NY, USA",
      "mainText": "123 Main Street",
      "secondaryText": "New York, NY, USA"
    }
  ],
  "count": 1
}
```

### 2. Get Address Details

**Endpoint:** `GET /api/address-autocomplete/details/:placeId`

**Path Parameters:**
- `placeId` (required): Google Places place_id from search results

**Example:**
```bash
curl "https://your-project.supabase.co/functions/v1/make-server-6fcaeea3/api/address-autocomplete/details/ChIJ..." \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Environment-ID: development"
```

**Response:**
```json
{
  "address": {
    "line1": "123 Main Street",
    "line2": "",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "formattedAddress": "123 Main St, New York, NY 10001, USA"
}
```

## Frontend Usage

### Basic Usage

```tsx
import { AddressAutocomplete } from '@/app/components/ui/address-autocomplete';

function MyForm() {
  const handleAddressSelect = (address: AddressData) => {
    console.log('Selected address:', address);
    // Update form fields with address data
    setFormData({
      ...formData,
      addressLine1: address.line1,
      addressLine2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
  };

  return (
    <AddressAutocomplete
      onSelect={handleAddressSelect}
      country="US"
      placeholder="Start typing your address..."
    />
  );
}
```

### With Country Filter

```tsx
<AddressAutocomplete
  onSelect={handleAddressSelect}
  country={selectedCountry} // Filter results by country
  placeholder="Enter your address"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelect` | `(address: AddressData) => void` | Required | Callback when address is selected |
| `country` | `string` | `undefined` | ISO country code to filter results |
| `placeholder` | `string` | `"Start typing address..."` | Input placeholder text |
| `className` | `string` | `undefined` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable the input |
| `minQueryLength` | `number` | `3` | Minimum characters before search |
| `debounceMs` | `number` | `300` | Debounce delay in milliseconds |

## Graceful Degradation

The component is designed to fail gracefully if the service is unavailable:

1. **Service Not Configured**: If `GOOGLE_PLACES_API_KEY` is not set, the component returns empty suggestions and allows manual address entry
2. **Network Errors**: Timeouts and network failures are caught and logged, allowing users to continue with manual entry
3. **API Errors**: Invalid responses are handled gracefully without breaking the UI

## Cost Considerations

### Geoapify Pricing

- **Free Tier**: 3,000 requests/day (no credit card required)
- **Paid Plans**: Starting at $49/month for 100,000 requests
- **Pay-as-you-go**: $1 per 1,000 requests

### Google Places API Pricing

- **Autocomplete - Per Session**: $2.83 per 1,000 sessions
- **Place Details**: $17 per 1,000 requests

A "session" is a series of autocomplete requests followed by a Place Details request.

### Cost Comparison

For 10,000 address lookups per month:

| Provider | Cost |
|----------|------|
| Geoapify (free tier) | $0 (if under 3k/day) |
| Geoapify (paid) | $10 |
| Google Places | $28.30 |

**Recommendation**: Start with Geoapify's free tier. Upgrade to paid Geoapify or switch to Google Places if you need higher accuracy or volume.

### Cost Optimization Tips

1. **Start with Geoapify**: Use the free tier for development and low-volume production
2. **Implement Session Tokens**: For Google Places, use session tokens to group requests
3. **Increase Debounce**: Set higher `debounceMs` to reduce API calls
4. **Set Usage Quotas**: Configure daily quotas in your provider's console
5. **Monitor Usage**: Set up billing alerts
6. **Cache Results**: Consider caching common addresses (future enhancement)

## Testing

### Test the Backend Endpoint

```bash
# Test search
curl "https://your-project.supabase.co/functions/v1/make-server-6fcaeea3/api/address-autocomplete/search?q=1600%20Amphitheatre&country=US" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Environment-ID: development"

# Test health check
curl "https://your-project.supabase.co/functions/v1/make-server-6fcaeea3/api/address-autocomplete/health" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Environment-ID: development"
```

### Test the Frontend Component

The component includes comprehensive tests:
- Unit tests: `src/app/components/ui/__tests__/address-autocomplete.test.tsx`
- Property-based tests: `src/app/components/ui/__tests__/address-autocomplete.property.test.tsx`

Run tests:
```bash
npm test address-autocomplete
```

## Troubleshooting

### Issue: "Address autocomplete service not configured"

**Solution:** Ensure at least one API key is set in Supabase secrets:
```bash
supabase secrets list

# Set Geoapify (recommended)
supabase secrets set GEOAPIFY_API_KEY=your_key_here

# Or set Google Places
supabase secrets set GOOGLE_PLACES_API_KEY=your_key_here
```

### Issue: "Request failed with status 403" (Google Places)

**Solution:** Check API key restrictions in Google Cloud Console:
1. Verify the API key is not restricted to specific IPs/domains that exclude Supabase
2. Ensure Places API is enabled for your project
3. Check billing is enabled on your Google Cloud project

### Issue: "Request failed with status 403" (Geoapify)

**Solution:**
1. Verify your API key is correct
2. Check you haven't exceeded your daily quota
3. Ensure your account is active

### Issue: No suggestions appearing

**Solution:**
1. Check browser console for errors
2. Verify the backend endpoint is accessible
3. Test the health endpoint to confirm service status and which provider is active
4. Check network tab to see if requests are being made

### Issue: Poor quality results

**Solution:**
1. If using Geoapify, consider switching to Google Places for better accuracy
2. Ensure country filtering is enabled for more relevant results
3. Check that the query is at least 3 characters long

### Issue: "CORS error"

**Solution:** The backend already includes CORS headers. If you still see CORS errors:
1. Verify you're using the correct API URL
2. Check that the `Authorization` header is included
3. Ensure the request is coming from an allowed origin

## Alternative Services

The backend is designed to support multiple providers. Currently implemented:

### ✅ Geoapify (Implemented)
- Endpoint: `https://api.geoapify.com/v1/geocode/autocomplete`
- Pricing: 3,000 free requests/day, then $1 per 1,000
- [Documentation](https://www.geoapify.com/address-autocomplete-api)

### ✅ Google Places API (Implemented)
- Endpoint: `https://maps.googleapis.com/maps/api/place/autocomplete/json`
- Pricing: $2.83 per 1,000 sessions
- [Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)

### Future Options

You can extend the backend to support additional providers:

#### Mapbox Geocoding API
- Endpoint: `https://api.mapbox.com/geocoding/v5/mapbox.places/`
- Pricing: $0.50 per 1,000 requests
- [Documentation](https://docs.mapbox.com/api/search/geocoding/)

#### HERE Geocoding & Search API
- Endpoint: `https://geocode.search.hereapi.com/v1/geocode`
- Pricing: Free tier available (250,000 requests/month)
- [Documentation](https://developer.here.com/documentation/geocoding-search-api/dev_guide/index.html)

#### OpenStreetMap Nominatim
- Endpoint: `https://nominatim.openstreetmap.org/search`
- Pricing: Free (with usage policy)
- [Documentation](https://nominatim.org/release-docs/latest/api/Search/)

To add a new provider, modify `supabase/functions/server/address_autocomplete.ts` to add the provider's implementation.

## Security Best Practices

1. **API Key Restrictions**:
   - **Geoapify**: Restrict by domain or IP in your project settings
   - **Google Places**: Always restrict your API key to specific domains or IP addresses
2. **Rate Limiting**: The backend includes rate limiting to prevent abuse
3. **Input Validation**: All inputs are validated before making API calls
4. **Error Handling**: Errors are logged but don't expose sensitive information to users
5. **HTTPS Only**: All API calls use HTTPS for secure communication
6. **Environment Variables**: Never commit API keys to version control

## Related Documentation

- [Internationalization Improvements Spec](.kiro/specs/internationalization-improvements/requirements.md)
- [Address Validation Integration](ADDRESS_VALIDATION_INTEGRATION_SUMMARY.md)
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
