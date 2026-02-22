# Address Validation API Documentation

## Overview

The Address Validation API provides real-time validation of shipping addresses using multiple third-party providers (USPS, SmartyStreets, Google, Geoapify).

**Base URL**: `https://your-project.supabase.co/functions/v1`

**Authentication**: Bearer token (Supabase JWT)

---

## Endpoints

### POST /validate-address

Validates a shipping address and returns standardized format with suggestions if needed.

#### Request

**Headers**:
```
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

**Body**:
```json
{
  "siteId": "uuid",
  "address": {
    "line1": "string (required)",
    "line2": "string (optional)",
    "line3": "string (optional)",
    "city": "string (required)",
    "state": "string (optional, required for US/CA)",
    "postalCode": "string (required)",
    "country": "string (required)"
  }
}
```

**Example Request**:
```json
{
  "siteId": "123e4567-e89b-12d3-a456-426614174000",
  "address": {
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "United States"
  }
}
```

#### Response

**Success (200 OK)**:

```json
{
  "isValid": true,
  "confidence": "high",
  "standardizedAddress": {
    "line1": "123 Main Street",
    "line2": "Apartment 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001-1234",
    "country": "United States"
  },
  "suggestions": [],
  "errors": [],
  "metadata": {
    "provider": "usps",
    "timestamp": "2026-02-19T10:30:00Z",
    "responseTime": 450,
    "cached": false
  }
}
```

**Invalid Address with Suggestions (200 OK)**:

```json
{
  "isValid": false,
  "confidence": "medium",
  "standardizedAddress": null,
  "suggestions": [
    {
      "address": {
        "line1": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "United States"
      },
      "confidence": 0.85
    },
    {
      "address": {
        "line1": "123 Main Avenue",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "United States"
      },
      "confidence": 0.72
    }
  ],
  "errors": [
    "Address line 2 could not be verified"
  ],
  "metadata": {
    "provider": "smarty",
    "timestamp": "2026-02-19T10:30:00Z",
    "responseTime": 520,
    "cached": false
  }
}
```

**Error Responses**:

**400 Bad Request** - Invalid request format:
```json
{
  "error": "Invalid request",
  "message": "Missing required field: address.line1",
  "code": "INVALID_REQUEST"
}
```

**401 Unauthorized** - Missing or invalid authentication:
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token",
  "code": "UNAUTHORIZED"
}
```

**404 Not Found** - Site not found:
```json
{
  "error": "Site not found",
  "message": "No site found with ID: 123e4567-e89b-12d3-a456-426614174000",
  "code": "SITE_NOT_FOUND"
}
```

**429 Too Many Requests** - Rate limit exceeded:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many validation requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

**500 Internal Server Error** - Server error:
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred during validation",
  "code": "INTERNAL_ERROR"
}
```

**503 Service Unavailable** - Provider unavailable:
```json
{
  "error": "Service unavailable",
  "message": "Address validation provider is temporarily unavailable",
  "code": "PROVIDER_UNAVAILABLE",
  "fallbackUsed": true
}
```

---

## Response Fields

### ValidationResponse

| Field | Type | Description |
|-------|------|-------------|
| `isValid` | boolean | Whether the address is valid and deliverable |
| `confidence` | string | Confidence level: "high", "medium", or "low" |
| `standardizedAddress` | AddressData \| null | Standardized version of the address (if valid) |
| `suggestions` | AddressSuggestion[] | Alternative address suggestions (if invalid) |
| `errors` | string[] | List of validation errors or warnings |
| `metadata` | ValidationMetadata | Information about the validation process |

### AddressData

| Field | Type | Description |
|-------|------|-------------|
| `line1` | string | Primary address line (street address) |
| `line2` | string \| undefined | Secondary address line (apt, suite, etc.) |
| `line3` | string \| undefined | Tertiary address line (rarely used) |
| `city` | string | City name |
| `state` | string \| undefined | State/province code (required for US/CA) |
| `postalCode` | string | Postal/ZIP code |
| `country` | string | Country name |

### AddressSuggestion

| Field | Type | Description |
|-------|------|-------------|
| `address` | AddressData | Suggested address |
| `confidence` | number | Confidence score (0.0 - 1.0) |

### ValidationMetadata

| Field | Type | Description |
|-------|------|-------------|
| `provider` | string | Provider used: "usps", "smarty", "google", "geoapify" |
| `timestamp` | string | ISO 8601 timestamp of validation |
| `responseTime` | number | Response time in milliseconds |
| `cached` | boolean | Whether result was from cache |

---

## Confidence Levels

### High Confidence
- Address is verified and deliverable
- All components match provider database
- No ambiguity in address
- **Action**: Accept address as-is

### Medium Confidence
- Address is likely valid but has minor issues
- Some components couldn't be fully verified
- Minor formatting differences
- **Action**: Show standardized version, allow user to confirm

### Low Confidence
- Address has significant issues
- Multiple possible matches
- Missing or incorrect components
- **Action**: Show suggestions, require user selection

---

## Error Codes

| Code | HTTP Status | Description | Resolution |
|------|-------------|-------------|------------|
| `INVALID_REQUEST` | 400 | Request format is invalid | Check request body format |
| `UNAUTHORIZED` | 401 | Missing or invalid auth token | Provide valid JWT token |
| `SITE_NOT_FOUND` | 404 | Site ID doesn't exist | Verify site ID |
| `VALIDATION_DISABLED` | 403 | Validation disabled for site | Enable in site settings |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait and retry |
| `PROVIDER_UNAVAILABLE` | 503 | Provider API is down | Retry or use fallback |
| `PROVIDER_ERROR` | 500 | Provider returned error | Check provider status |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Contact support |

---

## Rate Limits

### Per User
- **Limit**: 60 requests per minute
- **Burst**: 10 requests per second
- **Headers**: 
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

### Per Site
- **Limit**: 1000 requests per hour
- **Overage**: Requests queued or rejected based on plan

---

## Caching

### Cache Behavior
- Validated addresses are cached for 24 hours
- Cache key is based on normalized address hash
- Cache is provider-agnostic (same result regardless of provider)
- Cache is invalidated when site changes provider

### Cache Headers
Response includes cache information:
```json
{
  "metadata": {
    "cached": true,
    "cacheAge": 3600,
    "cacheExpires": "2026-02-20T10:30:00Z"
  }
}
```

---

## Provider-Specific Behavior

### USPS
- **Coverage**: United States only
- **Strengths**: Most accurate for US addresses, free
- **Limitations**: US only, slower response times
- **Best For**: US-only sites

### SmartyStreets
- **Coverage**: International (200+ countries)
- **Strengths**: Fast, accurate, good international support
- **Limitations**: Paid service
- **Best For**: International sites with budget

### Google
- **Coverage**: Global
- **Strengths**: Excellent global coverage, high accuracy
- **Limitations**: Most expensive option
- **Best For**: High-value transactions, global coverage

### Geoapify
- **Coverage**: Global
- **Strengths**: Good balance of cost and accuracy
- **Limitations**: Newer service, less proven
- **Best For**: Cost-conscious international sites

---

## Usage Examples

### JavaScript/TypeScript

```typescript
async function validateAddress(address: AddressData): Promise<ValidationResponse> {
  const response = await fetch(
    'https://your-project.supabase.co/functions/v1/validate-address',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteId: currentSiteId,
        address: address,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Validation failed: ${response.statusText}`);
  }

  return await response.json();
}

// Usage
try {
  const result = await validateAddress({
    line1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
  });

  if (result.isValid) {
    console.log('Address is valid:', result.standardizedAddress);
  } else {
    console.log('Address invalid, suggestions:', result.suggestions);
  }
} catch (error) {
  console.error('Validation error:', error);
}
```

### React Hook

```typescript
import { useAddressValidation } from '@/hooks/useAddressValidation';

function CheckoutForm() {
  const { validateAddress, isValidating, isValid, suggestions } = 
    useAddressValidation({ siteId: currentSiteId });

  const handleAddressBlur = async (address: AddressData) => {
    await validateAddress(address);
  };

  return (
    <div>
      <AddressInput 
        onBlur={handleAddressBlur}
      />
      {isValidating && <Spinner />}
      {isValid === false && suggestions.length > 0 && (
        <SuggestionModal suggestions={suggestions} />
      )}
    </div>
  );
}
```

### cURL

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/validate-address \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "123e4567-e89b-12d3-a456-426614174000",
    "address": {
      "line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "United States"
    }
  }'
```

---

## Best Practices

### 1. Debounce Validation Requests
Don't validate on every keystroke. Wait until user completes input:
```typescript
const debouncedValidate = useMemo(
  () => debounce(validateAddress, 500),
  [validateAddress]
);
```

### 2. Cache Results Client-Side
Cache validation results to avoid duplicate API calls:
```typescript
const cacheKey = JSON.stringify(address);
if (validationCache.has(cacheKey)) {
  return validationCache.get(cacheKey);
}
```

### 3. Handle Errors Gracefully
Always provide fallback behavior:
```typescript
try {
  const result = await validateAddress(address);
} catch (error) {
  // Fall back to client-side validation
  const clientResult = validateAddressClientSide(address);
  // Allow user to proceed with warning
}
```

### 4. Show Progress Indicators
Validation can take 1-2 seconds, show loading state:
```typescript
{isValidating && <Spinner />}
```

### 5. Respect User Choice
Allow users to override validation if configured:
```typescript
if (allowOverride) {
  <Button onClick={proceedWithOriginal}>
    Use My Address Anyway
  </Button>
}
```

---

## Testing

### Test Addresses

**Valid US Address**:
```json
{
  "line1": "1600 Amphitheatre Parkway",
  "city": "Mountain View",
  "state": "CA",
  "postalCode": "94043",
  "country": "United States"
}
```

**Invalid US Address** (triggers suggestions):
```json
{
  "line1": "123 Fake Street",
  "city": "Springfield",
  "state": "XX",
  "postalCode": "00000",
  "country": "United States"
}
```

**Valid UK Address**:
```json
{
  "line1": "10 Downing Street",
  "city": "London",
  "postalCode": "SW1A 2AA",
  "country": "United Kingdom"
}
```

### Mock Responses

For testing without API calls, use mock responses:
```typescript
const mockValidResponse: ValidationResponse = {
  isValid: true,
  confidence: 'high',
  standardizedAddress: { /* ... */ },
  suggestions: [],
  errors: [],
  metadata: {
    provider: 'mock',
    timestamp: new Date().toISOString(),
    responseTime: 100,
    cached: false,
  },
};
```

---

## Troubleshooting

### Issue: Validation Always Returns Invalid

**Possible Causes**:
- Provider API key is invalid
- Provider service is down
- Address format doesn't match provider expectations

**Resolution**:
1. Check provider API key in environment variables
2. Test provider API directly
3. Check provider status page
4. Review address format requirements

### Issue: Slow Response Times

**Possible Causes**:
- Provider API is slow
- No caching configured
- Network latency

**Resolution**:
1. Check provider response times in logs
2. Verify cache is working (check `cached` field)
3. Consider switching providers
4. Implement timeout handling

### Issue: High API Costs

**Possible Causes**:
- Cache not working
- Too many validation requests
- Using expensive provider

**Resolution**:
1. Verify cache hit rate (should be >30%)
2. Implement request debouncing
3. Consider cheaper provider for non-critical validations
4. Set up cost alerts

---

## Support

For issues or questions:
- Check logs in Supabase dashboard
- Review provider status pages
- Contact support with request ID from error response
- See [Admin Guide](./admin-guide.md) for configuration help
