# Internationalization Backend Updates Summary

## Overview

This document summarizes the backend and API updates made to support the internationalization improvements feature.

## Changes Made

### 1. Database Schema ✅

**Added `i18n` column to `sites` table:**

```sql
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS i18n JSONB DEFAULT '{
  "currency": "USD",
  "currencyDisplay": "symbol",
  "decimalPlaces": 2,
  "timezone": "America/New_York",
  "dateFormat": "MDY",
  "timeFormat": "12h",
  "nameOrder": "western",
  "nameFormat": "casual"
}'::jsonb;
```

This column stores internationalization preferences for each site, including:
- Currency settings (code, display format, decimal places)
- Date/time settings (timezone, date format, time format)
- Name formatting settings (order, formality)

### 2. Address Autocomplete Service ✅

**Created new backend service:** `supabase/functions/server/address_autocomplete.ts`

Features:
- **Multi-provider support**: Google Places API and Geoapify API
- **Automatic provider selection**: Uses whichever API key is configured
- **Unified API interface**: Same endpoints regardless of provider
- Address search with country filtering
- Structured address parsing
- Rate limiting and error handling
- Graceful degradation when service unavailable

**Supported Providers:**

1. **Geoapify** (Recommended)
   - 3,000 free requests/day
   - $1 per 1,000 requests after free tier
   - Good global coverage
   - Easy setup, no credit card required for free tier

2. **Google Places** (Premium)
   - Most accurate results
   - Best global coverage
   - $2.83 per 1,000 sessions
   - Requires Google Cloud account with billing

**API Endpoints:**

1. **Search Addresses**
   - `GET /api/address-autocomplete/search?q={query}&country={code}`
   - Returns address suggestions based on search query
   - Supports country filtering

2. **Get Address Details**
   - `GET /api/address-autocomplete/details/:placeId`
   - Returns structured address data for a place ID
   - Parses Google Places response into AddressData format

3. **Health Check**
   - `GET /api/address-autocomplete/health`
   - Checks if service is configured and ready
   - Returns which provider is active (google, geoapify, or none)

### 3. Frontend Integration ✅

**Updated:** `src/app/components/ui/address-autocomplete.tsx`

Changes:
- Integrated with backend API endpoints
- Uses environment configuration for API URL
- Fetches detailed address data for each suggestion
- Handles authentication headers
- Implements proper error handling and timeouts

### 4. Backend Router Integration ✅

**Updated:** `supabase/functions/server/index.tsx`

Changes:
- Added import for address autocomplete service
- Registered address autocomplete routes
- Routes are automatically available when backend is deployed

## What Doesn't Need Changes

### ✅ Existing Middleware
No changes required to:
- `middleware/auth.ts` - Authentication middleware
- `middleware/errorHandler.ts` - Error handling
- `middleware/rateLimit.ts` - Rate limiting
- `middleware/tenant.ts` - Tenant isolation

### ✅ Existing API Endpoints
No changes required to existing endpoints because:
- All formatting (currency, dates, numbers) happens on frontend using browser's `Intl` API
- Backend continues to return raw values (numbers, ISO date strings)
- Frontend hooks handle locale-specific formatting

### ✅ Data Validation
No changes required because:
- Address validation happens on frontend using `addressValidation.ts`
- Postal code patterns are defined client-side
- Backend receives already-validated data

## Configuration Required

### Environment Variables

Add at least one of these to Supabase Edge Function secrets:

```bash
# Option 1: Geoapify (Recommended - Free tier available)
GEOAPIFY_API_KEY=your_geoapify_key_here

# Option 2: Google Places (Premium option)
GOOGLE_PLACES_API_KEY=your_google_key_here

# You can configure both - Google Places will take priority
```

**How to set:**

```bash
# Using Supabase CLI
supabase secrets set GEOAPIFY_API_KEY=your_key_here
# or
supabase secrets set GOOGLE_PLACES_API_KEY=your_key_here

# Or via Supabase Dashboard
# Project Settings → Edge Functions → Secrets
```

### Geoapify Setup (Recommended)

1. Sign up at [Geoapify](https://www.geoapify.com/)
2. Create a new project
3. Copy the API key
4. Free tier: 3,000 requests/day (no credit card required)

### Google Cloud Setup (Optional)

1. Enable APIs:
   - Places API
   - Geocoding API (optional)

2. Create API Key:
   - Go to Google Cloud Console
   - Create credentials → API Key
   - Copy the key

3. Restrict API Key (recommended):
   - Set application restrictions
   - Set API restrictions to Places API only

See [ADDRESS_AUTOCOMPLETE_SETUP.md](ADDRESS_AUTOCOMPLETE_SETUP.md) for detailed setup instructions.

## Deployment

### Deploy Backend

```bash
# Development environment
npm run deploy:backend:dev

# Production environment
npm run deploy:backend:prod
```

### Verify Deployment

Test the health endpoint:

```bash
curl https://your-project.supabase.co/functions/v1/make-server-6fcaeea3/api/address-autocomplete/health \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Environment-ID: development"
```

Expected response (Geoapify):
```json
{
  "status": "ok",
  "service": "address-autocomplete",
  "provider": "geoapify",
  "configured": true,
  "message": "Address autocomplete service is ready (using geoapify)"
}
```

Expected response (Google Places):
```json
{
  "status": "ok",
  "service": "address-autocomplete",
  "provider": "google",
  "configured": true,
  "message": "Address autocomplete service is ready (using google)"
}
```

## Architecture Benefits

### Frontend-Heavy Approach

The internationalization design leverages the browser's native `Intl` API, which provides several benefits:

1. **Minimal Backend Changes**: Most formatting logic lives on the frontend
2. **Better Performance**: No server round-trips for formatting
3. **Offline Support**: Formatting works even without backend connection
4. **Standards Compliant**: Uses browser's built-in internationalization
5. **Automatic Updates**: Browser updates improve formatting automatically

### Backend Responsibilities

The backend only handles:
1. **Configuration Storage**: Stores i18n preferences in `sites.i18n` column
2. **Address Autocomplete**: Proxies requests to Google Places API
3. **Data Delivery**: Returns raw values (numbers, ISO dates) for frontend formatting

## Cost Considerations

### Geoapify Pricing

- **Free Tier**: 3,000 requests/day (no credit card required)
- **Paid Plans**: Starting at $49/month for 100,000 requests
- **Pay-as-you-go**: $1 per 1,000 requests

### Google Places API Pricing

- **Autocomplete - Per Session**: $2.83 per 1,000 sessions
- **Place Details**: $17 per 1,000 requests

### Cost Comparison

For 10,000 address lookups per month:

| Provider | Monthly Cost |
|----------|--------------|
| Geoapify (free tier) | $0 (if under 3k/day) |
| Geoapify (paid) | $10 |
| Google Places | $28.30 |

**Recommendation**: Start with Geoapify's free tier for development and low-volume production. Upgrade to paid Geoapify or switch to Google Places if you need higher accuracy or volume.

### Optimization Tips

1. Start with Geoapify's free tier
2. Implement session tokens for Google Places (reduces cost)
3. Increase debounce delay (reduces API calls)
4. Set usage quotas in provider console
5. Monitor usage with billing alerts

## Testing

### Backend Tests

```bash
# Test address autocomplete search
curl "https://your-project.supabase.co/functions/v1/make-server-6fcaeea3/api/address-autocomplete/search?q=1600%20Amphitheatre&country=US" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Environment-ID: development"
```

### Frontend Tests

```bash
# Run address autocomplete component tests
npm test address-autocomplete
```

## Files Modified

### Backend Files
- ✅ `supabase/functions/server/address_autocomplete.ts` (new)
- ✅ `supabase/functions/server/index.tsx` (updated)

### Frontend Files
- ✅ `src/app/components/ui/address-autocomplete.tsx` (updated)
- ✅ `src/app/hooks/useSite.ts` (already had i18n types)

### Documentation
- ✅ `ADDRESS_AUTOCOMPLETE_SETUP.md` (new)
- ✅ `INTERNATIONALIZATION_BACKEND_SUMMARY.md` (this file)

## Next Steps

1. **Choose Your Provider**
   - **Geoapify** (recommended): Free tier, easy setup
   - **Google Places**: Premium accuracy, higher cost
   - Or configure both for redundancy

2. **Set up API Key**
   - Follow [ADDRESS_AUTOCOMPLETE_SETUP.md](ADDRESS_AUTOCOMPLETE_SETUP.md)
   - Add key to Supabase secrets

3. **Deploy Backend**
   - Run deployment script
   - Verify health endpoint

4. **Test Integration**
   - Test address autocomplete in UI
   - Verify structured address data

5. **Monitor Usage**
   - Set up billing alerts in provider console
   - Monitor API usage and costs

## Support

For issues or questions:
- See [ADDRESS_AUTOCOMPLETE_SETUP.md](ADDRESS_AUTOCOMPLETE_SETUP.md) for troubleshooting
- Check [Internationalization Spec](.kiro/specs/internationalization-improvements/requirements.md)
- Review [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service/overview)
