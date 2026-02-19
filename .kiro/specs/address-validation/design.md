# Address Validation Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Checkout Page / Address Input Component             │  │
│  │  - User enters address                                │  │
│  │  - Triggers validation on blur/submit                 │  │
│  │  - Displays validation results                        │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  useAddressValidation Hook                           │  │
│  │  - Manages validation state                          │  │
│  │  - Debounces requests                                │  │
│  │  - Caches results                                    │  │
│  └────────────────┬─────────────────────────────────────┘  │
└───────────────────┼──────────────────────────────────────────┘
                    │ HTTP POST
                    │
┌───────────────────▼──────────────────────────────────────────┐
│                   Backend API                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/validate-address Endpoint                      │   │
│  │  - Validates request                                 │   │
│  │  - Checks cache                                      │   │
│  │  - Routes to provider                                │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                           │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │  Provider Router                                     │   │
│  │  - Selects provider based on site config            │   │
│  │  - Handles provider-specific logic                  │   │
│  └────┬────┬────┬────┬──────────────────────────────────┘   │
│       │    │    │    │                                       │
│  ┌────▼┐ ┌─▼──┐ ┌▼───┐ ┌▼────────┐                         │
│  │USPS│ │Smart│ │Goog│ │Geoapify│                          │
│  │API │ │yAPI│ │leAPI│ │  API   │                          │
│  └────┘ └────┘ └────┘ └─────────┘                          │
└──────────────────────────────────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────────────┐
│              External Services                                │
│  ┌──────┐  ┌──────────┐  ┌────────┐  ┌──────────┐          │
│  │ USPS │  │SmartyStr │  │ Google │  │Geoapify  │          │
│  │  API │  │eets API  │  │Maps API│  │   API    │          │
│  └──────┘  └──────────┘  └────────┘  └──────────┘          │
└──────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Backend API Structure

#### File: `supabase/functions/server/address_validation.ts`

```typescript
// Main validation endpoint
export async function validateAddress(
  siteId: string,
  address: AddressData
): Promise<ValidationResponse>

// Provider interface
interface ValidationProvider {
  name: string;
  validate(address: AddressData): Promise<ValidationResponse>;
  isAvailable(): Promise<boolean>;
  getSupportedCountries(): string[];
}

// Provider implementations
class USPSProvider implements ValidationProvider
class SmartyStreetsProvider implements ValidationProvider
class GoogleProvider implements ValidationProvider
class GeoapifyProvider implements ValidationProvider

// Provider factory
function getProvider(providerName: string): ValidationProvider

// Cache layer
class ValidationCache {
  get(addressHash: string): Promise<ValidationResponse | null>
  set(addressHash: string, response: ValidationResponse): Promise<void>
  invalidate(addressHash: string): Promise<void>
}
```

### 2. Frontend Hook

#### File: `src/app/hooks/useAddressValidation.ts`

```typescript
interface UseAddressValidationOptions {
  siteId: string;
  enabled?: boolean;
  debounceMs?: number;
}

interface ValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  confidence: 'high' | 'medium' | 'low' | null;
  suggestions: AddressData[];
  error: string | null;
}

export function useAddressValidation(options: UseAddressValidationOptions) {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    isValid: null,
    confidence: null,
    suggestions: [],
    error: null,
  });

  const validateAddress = useCallback(
    async (address: AddressData) => {
      // Implementation
    },
    [options]
  );

  const acceptSuggestion = useCallback(
    (suggestion: AddressData) => {
      // Implementation
    },
    []
  );

  return {
    ...state,
    validateAddress,
    acceptSuggestion,
  };
}
```

### 3. UI Components

#### Validation Status Indicator

```typescript
interface ValidationStatusProps {
  status: 'idle' | 'validating' | 'valid' | 'invalid' | 'error';
  confidence?: 'high' | 'medium' | 'low';
}

export function ValidationStatus({ status, confidence }: ValidationStatusProps) {
  // Visual indicator with icon and color
  // - Idle: No icon
  // - Validating: Spinner
  // - Valid (high): Green checkmark
  // - Valid (medium): Yellow checkmark with warning
  // - Invalid: Red X
  // - Error: Orange warning
}
```

#### Suggestion Modal

```typescript
interface SuggestionModalProps {
  originalAddress: AddressData;
  suggestions: Array<{
    address: AddressData;
    confidence: number;
  }>;
  onAccept: (address: AddressData) => void;
  onKeepOriginal: () => void;
}

export function SuggestionModal({
  originalAddress,
  suggestions,
  onAccept,
  onKeepOriginal,
}: SuggestionModalProps) {
  // Modal showing original vs suggested addresses
  // Side-by-side comparison
  // Confidence indicators
  // Accept/Keep Original buttons
}
```

## Data Models

### Validation Request

```typescript
interface ValidationRequest {
  siteId: string;
  address: {
    line1: string;
    line2?: string;
    line3?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}
```

### Validation Response

```typescript
interface ValidationResponse {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  standardizedAddress?: AddressData;
  suggestions?: Array<{
    address: AddressData;
    confidence: number;
  }>;
  errors?: string[];
  metadata: {
    provider: string;
    timestamp: string;
    responseTime: number;
    cached: boolean;
  };
}
```

### Database Schema

```sql
-- Add to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS validation_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS validation_provider TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS validation_confidence NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS validation_timestamp TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS standardized_address JSONB;

-- Validation logs table
CREATE TABLE IF NOT EXISTS address_validation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id),
  order_id UUID REFERENCES orders(id),
  provider TEXT NOT NULL,
  request_address JSONB NOT NULL,
  response_data JSONB NOT NULL,
  success BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_validation_logs_site ON address_validation_logs(site_id);
CREATE INDEX idx_validation_logs_created ON address_validation_logs(created_at);
```

## API Specifications

### Endpoint: POST /api/validate-address

**Request**:
```json
{
  "siteId": "uuid",
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

**Response (Success)**:
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

**Response (Invalid with Suggestions)**:
```json
{
  "isValid": false,
  "confidence": "low",
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
    }
  ],
  "errors": ["Address line 2 could not be verified"],
  "metadata": {
    "provider": "smarty",
    "timestamp": "2026-02-19T10:30:00Z",
    "responseTime": 520,
    "cached": false
  }
}
```

## Provider Integration Details

### USPS API
- **Coverage**: US only
- **Endpoint**: `https://secure.shippingapis.com/ShippingAPI.dll`
- **Auth**: User ID in XML request
- **Rate Limit**: 5 requests/second
- **Cost**: Free (with registration)
- **Response Time**: ~300-500ms

### SmartyStreets API
- **Coverage**: International
- **Endpoint**: `https://us-street.api.smartystreets.com/street-address`
- **Auth**: Auth-ID and Auth-Token headers
- **Rate Limit**: Varies by plan
- **Cost**: $0.50-2.00 per 1000 lookups
- **Response Time**: ~200-400ms

### Google Address Validation API
- **Coverage**: Global
- **Endpoint**: `https://addressvalidation.googleapis.com/v1:validateAddress`
- **Auth**: API Key
- **Rate Limit**: 600 requests/minute
- **Cost**: $5.00 per 1000 requests
- **Response Time**: ~300-600ms

### Geoapify API
- **Coverage**: Global
- **Endpoint**: `https://api.geoapify.com/v1/geocode/search`
- **Auth**: API Key parameter
- **Rate Limit**: Varies by plan
- **Cost**: $1.00-3.00 per 1000 requests
- **Response Time**: ~200-500ms

## Caching Strategy

### Cache Key Generation
```typescript
function generateCacheKey(address: AddressData): string {
  const normalized = {
    line1: address.line1.toLowerCase().trim(),
    line2: address.line2?.toLowerCase().trim() || '',
    city: address.city.toLowerCase().trim(),
    state: address.state?.toLowerCase().trim() || '',
    postalCode: address.postalCode.replace(/\s/g, '').toLowerCase(),
    country: address.country.toLowerCase().trim(),
  };
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex');
}
```

### Cache Storage
- Use Supabase KV store or Redis
- TTL: 24 hours
- Max size: 10,000 entries
- Eviction: LRU (Least Recently Used)

### Cache Invalidation
- On provider change for site
- On manual admin request
- On cache expiration

## Error Handling

### Error Types

1. **Provider Unavailable**
   - Fallback to client-side validation
   - Log error
   - Show warning to user

2. **Rate Limit Exceeded**
   - Queue request for retry
   - Use cached result if available
   - Allow user to proceed with warning

3. **Invalid API Key**
   - Log critical error
   - Alert admin
   - Fallback to client-side validation

4. **Timeout**
   - Retry once
   - If fails again, allow user to proceed
   - Log timeout event

5. **Invalid Response**
   - Log error with response data
   - Fallback to client-side validation
   - Alert engineering team

### Fallback Chain

```
Primary Provider → Cache → Client-side Validation → Allow Proceed
```

## Performance Optimization

### 1. Debouncing
- Debounce validation requests by 500ms
- Cancel pending requests on new input

### 2. Parallel Validation
- For multi-address forms, validate in parallel
- Limit concurrent requests to 3

### 3. Lazy Loading
- Load validation module only when needed
- Code split validation providers

### 4. Request Batching
- Batch multiple address validations (future)
- Reduce API calls for bulk operations

## Security Considerations

### 1. API Key Management
- Store in environment variables
- Never expose in frontend code
- Rotate keys quarterly
- Use separate keys per environment

### 2. Input Validation
- Sanitize all address inputs
- Validate data types and formats
- Prevent injection attacks
- Limit request size

### 3. Rate Limiting
- Implement per-user rate limits
- Prevent abuse and DoS attacks
- Track suspicious patterns

### 4. Data Privacy
- Don't log complete addresses
- Hash addresses in logs
- Comply with GDPR/CCPA
- Secure transmission (HTTPS only)

## Monitoring and Alerting

### Metrics to Track
- Validation success rate
- Average response time
- Cache hit rate
- API costs per provider
- Error rates by type
- Provider availability

### Alerts
- Error rate > 5%
- Response time > 3 seconds
- Provider unavailable
- API cost exceeds budget
- Cache hit rate < 20%

### Dashboard
- Real-time validation metrics
- Cost tracking by provider
- Error logs and trends
- Performance graphs
- Provider comparison

## Testing Strategy

### Unit Tests
- Provider implementations
- Cache logic
- Error handling
- Response parsing

### Integration Tests
- End-to-end validation flow
- Provider failover
- Cache behavior
- Error scenarios

### Mock Providers
- Create mock implementations for testing
- Simulate various response scenarios
- Test without API costs

### Load Testing
- Simulate 1000+ concurrent validations
- Test cache performance
- Verify rate limiting
- Check memory usage

## Rollout Plan

### Phase 1: Internal Testing
- Deploy to staging environment
- Test with internal team
- Validate all providers
- Fix critical bugs

### Phase 2: Beta Testing
- Enable for 5% of sites
- Monitor metrics closely
- Gather user feedback
- Optimize based on data

### Phase 3: Gradual Rollout
- Increase to 25% of sites
- Continue monitoring
- Address issues quickly
- Prepare for full rollout

### Phase 4: Full Deployment
- Enable for all sites
- Announce feature
- Provide documentation
- Monitor for issues

## Future Enhancements

1. **Batch Validation**: Validate multiple addresses at once
2. **Address Autocomplete**: Real-time suggestions as user types
3. **Geocoding**: Add latitude/longitude to validated addresses
4. **Address History**: Remember and suggest previously used addresses
5. **Smart Provider Selection**: Auto-select best provider per country
6. **Cost Optimization**: ML-based provider selection for cost/accuracy
7. **Offline Support**: Cache common addresses for offline validation
