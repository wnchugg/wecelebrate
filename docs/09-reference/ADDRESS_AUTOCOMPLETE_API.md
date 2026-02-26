# Address Autocomplete API Reference

## Overview

The Address Autocomplete API provides address search and validation functionality for the shipping information form. The API returns address suggestions with embedded full address data in a single request.

## Endpoint

### Search Addresses

**Endpoint**: `GET /search`

**Query Parameters**:
- `q` (required): Search query string (minimum 3 characters recommended)

**Response Format**:
```json
{
  "suggestions": [
    {
      "placeId": "string",
      "description": "string",
      "mainText": "string",
      "address": {
        "line1": "string",
        "line2": "string | undefined",
        "city": "string",
        "state": "string",
        "postalCode": "string",
        "country": "string"
      }
    }
  ]
}
```

## API Behavior

### Single-Step Process

The API now embeds full address data directly in the search response, eliminating the need for a separate details endpoint. This improves performance and reduces API calls.

**Previous Behavior (Deprecated)**:
1. `GET /search?q=...` → Returns suggestions with `placeId` only
2. `GET /details/:placeId` → Returns full address data

**Current Behavior**:
1. `GET /search?q=...` → Returns suggestions with embedded full address data

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `placeId` | string | Unique identifier for the address suggestion |
| `description` | string | Full formatted address string for display |
| `mainText` | string | Primary address line (street address) |
| `address.line1` | string | Street address line 1 |
| `address.line2` | string \| undefined | Street address line 2 (optional) |
| `address.city` | string | City name |
| `address.state` | string | State/province code |
| `address.postalCode` | string | Postal/ZIP code |
| `address.country` | string | Country code (ISO 3166-1 alpha-2) |

## Frontend Integration

### Component Usage

The `AddressAutocomplete` component handles the API integration automatically:

```tsx
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';

function ShippingForm() {
  const handleAddressSelect = (address) => {
    // address contains: line1, line2, city, state, postalCode, country
    console.log('Selected address:', address);
  };

  return (
    <AddressAutocomplete
      onSelect={handleAddressSelect}
      placeholder="Enter your address"
      minQueryLength={3}
      debounceMs={300}
    />
  );
}
```

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelect` | `(address: Address) => void` | required | Callback when address is selected |
| `placeholder` | string | "Enter address" | Input placeholder text |
| `minQueryLength` | number | 3 | Minimum characters before search |
| `debounceMs` | number | 300 | Debounce delay in milliseconds |
| `disabled` | boolean | false | Disable the input |
| `className` | string | undefined | Custom CSS classes |

### Address Type

```typescript
interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
```

## Error Handling

The component handles errors gracefully:

- **Network errors**: Component continues to function, no suggestions shown
- **API errors (500, 404)**: Component continues to function, no suggestions shown
- **Timeout errors**: Component continues to function, no suggestions shown
- **Invalid responses**: Component continues to function, no suggestions shown

No error messages are displayed to the user to maintain a clean UX. The input remains functional and users can type addresses manually.

## Performance Considerations

### Debouncing

The component debounces API calls to reduce server load:
- Default: 300ms delay after user stops typing
- Configurable via `debounceMs` prop
- Prevents excessive API calls during rapid typing

### Minimum Query Length

The component enforces a minimum query length before searching:
- Default: 3 characters
- Configurable via `minQueryLength` prop
- Prevents unnecessary API calls for short queries

### Loading States

The component shows a loading spinner while fetching suggestions:
- Displayed immediately after debounce period
- Hidden when results arrive or error occurs
- Provides visual feedback to users

## Testing

### Unit Tests

The component has comprehensive unit tests covering:
- Suggestion rendering
- Selection handling (click and keyboard)
- Error handling (network, API, timeout)
- Component props (placeholder, disabled, className)
- Debouncing behavior
- Keyboard navigation (Arrow keys, Enter, Escape)

**Test File**: `src/app/components/ui/__tests__/address-autocomplete.test.tsx`

### Test Coverage

- ✅ Renders suggestions from API
- ✅ Handles minimum query length
- ✅ Shows loading indicator
- ✅ Handles click selection
- ✅ Handles keyboard navigation
- ✅ Closes on Escape key
- ✅ Handles API errors gracefully
- ✅ Handles network errors gracefully
- ✅ Handles timeout errors gracefully
- ✅ Respects custom props
- ✅ Debounces API calls

## Migration Notes

### Breaking Change (February 2026)

The API was updated to embed full address data in the search response. This eliminates the need for a separate details endpoint.

**Impact**: 
- Frontend components automatically benefit from reduced API calls
- No frontend code changes required (component handles both formats)
- Backend must return embedded address data in search response

**Migration**:
1. Update backend to include `address` object in search response
2. Remove details endpoint (no longer needed)
3. Update tests to reflect new API behavior

## Related Documentation

- [Forms Guide](../07-features/forms.md) - Form validation patterns
- [Shipping Information](../07-features/forms.md#shipping-information) - Shipping form implementation
- [Component Testing](../05-testing/property-based-tests.md) - Testing patterns

## API Provider

The address autocomplete API is provided by the backend Edge Function. The specific provider (Google Places, Mapbox, etc.) is abstracted away from the frontend.

**Backend Configuration**: See backend documentation for provider setup and API key configuration.

---

**Last Updated**: February 25, 2026  
**API Version**: 2.0 (embedded address data)  
**Component Version**: Compatible with API v2.0
