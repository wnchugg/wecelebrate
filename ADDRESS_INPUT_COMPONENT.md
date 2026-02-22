# International Address Input Component

A reusable React component for international address input with country-specific field ordering, labels, and validation.

## Features

- 🌍 **16 Countries Supported** - Major countries with proper address formats
- 📋 **Dynamic Field Ordering** - Fields appear in the order most common for each country
- 🏷️ **Localized Labels** - Field labels in local language where appropriate
- ✅ **Country-Specific Validation** - Postal code validation per country
- 🎨 **Consistent Design** - Matches application design system
- 🔍 **Format Hints** - Shows expected postal code format
- 🎯 **Accessible** - Full keyboard navigation and ARIA labels
- 📱 **Responsive** - Works on all screen sizes

## Installation

The component is already integrated into the project. Files created:

```
src/app/components/ui/address-input.tsx          # Main component
src/app/components/ui/address-input-example.tsx  # Usage examples
src/app/utils/addressValidation.ts               # Validation utilities
```

## Basic Usage

```tsx
import { useState } from 'react';
import { AddressInput, AddressData } from './components/ui/address-input';

function MyForm() {
  const [address, setAddress] = useState<AddressData>({
    line1: '',
    city: '',
    postalCode: '',
    country: 'United States',
  });

  return (
    <AddressInput
      value={address}
      onChange={setAddress}
      defaultCountry="US"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `AddressData` | - | Current address value |
| `onChange` | `(address: AddressData) => void` | - | Callback when address changes |
| `onBlur` | `() => void` | - | Callback when input loses focus |
| `defaultCountry` | `string` | `'US'` | Default country code (ISO 2-letter) |
| `disabled` | `boolean` | `false` | Disable all inputs |
| `required` | `boolean` | `false` | Mark fields as required |
| `className` | `string` | - | Additional CSS classes |
| `error` | `boolean` | `false` | Show error state |
| `showCountrySelector` | `boolean` | `true` | Show/hide country selector |

## AddressData Interface

```tsx
interface AddressData {
  line1: string;        // Street address (required)
  line2?: string;       // Additional address line (optional)
  line3?: string;       // Additional address line (optional)
  city: string;         // City (required)
  state?: string;       // State/Province (required for some countries)
  postalCode: string;   // Postal/ZIP code (required)
  country: string;      // Country name (required)
}
```

## Examples

### With Validation

```tsx
import { validateAddress } from './utils/addressValidation';

const [address, setAddress] = useState<AddressData>({...});
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = () => {
  const validationErrors = validateAddress(address);
  setErrors(validationErrors);
  
  if (Object.keys(validationErrors).length === 0) {
    // Address is valid, proceed
  }
};

<AddressInput
  value={address}
  onChange={setAddress}
  required
  error={Object.keys(errors).length > 0}
/>
{Object.keys(errors).length > 0 && (
  <div className="text-sm text-red-600 mt-2">
    {Object.values(errors).map((error, i) => (
      <p key={i}>{error}</p>
    ))}
  </div>
)}
```

### Fixed Country (No Selector)

```tsx
<AddressInput
  value={address}
  onChange={setAddress}
  defaultCountry="GB"
  showCountrySelector={false}
/>
```

### In a Form

```tsx
<form onSubmit={handleSubmit}>
  <Label>Shipping Address</Label>
  <AddressInput
    value={shippingAddress}
    onChange={setShippingAddress}
    required
  />
  <button type="submit">Submit Order</button>
</form>
```

### Disabled State

```tsx
<AddressInput
  value={savedAddress}
  disabled
/>
```

## Supported Countries (16)

### North America
- 🇺🇸 **United States** - State required, ZIP code format: 12345 or 12345-6789
- 🇨🇦 **Canada** - Province required, Postal code format: A1A 1A1
- 🇲🇽 **Mexico** - State required, Código postal format: 12345

### Europe
- 🇬🇧 **United Kingdom** - Postcode format: SW1A 1AA
- 🇩🇪 **Germany** - Postleitzahl format: 12345 (postal code before city)
- 🇫🇷 **France** - Code postal format: 75001 (postal code before city)
- 🇪🇸 **Spain** - Province required, Código postal format: 28001
- 🇮🇹 **Italy** - Province required, CAP format: 00100
- 🇳🇱 **Netherlands** - Postcode format: 1234 AB

### Asia-Pacific
- 🇯🇵 **Japan** - Prefecture required, postal code first: 123-4567
- 🇨🇳 **China** - Province required, postal code last: 100000
- 🇮🇳 **India** - State required, PIN code format: 110001
- 🇸🇬 **Singapore** - Postal code format: 123456
- 🇰🇷 **South Korea** - Province required, postal code first: 12345
- 🇦🇺 **Australia** - State required, Postcode format: 2000

### South America
- 🇧🇷 **Brazil** - State required, CEP format: 12345-678

## Address Field Ordering by Country

### United States / Canada
1. Street Address
2. Apt/Suite (optional)
3. City
4. State/Province
5. ZIP/Postal Code

### United Kingdom
1. Address Line 1
2. Address Line 2 (optional)
3. Town/City
4. Postcode

### Germany / France / Netherlands
1. Street and Number
2. Additional (optional)
3. **Postal Code** (before city)
4. City

### Japan / China / South Korea
1. **Postal Code** (first)
2. Prefecture/Province
3. City/District
4. Street Address
5. Building/Unit (optional)

### Australia
1. Street Address
2. Address Line 2 (optional)
3. Suburb
4. State
5. Postcode

## Validation Utilities

### `validateAddress(address: AddressData): Record<string, string>`

Validates an address and returns error messages.

```tsx
import { validateAddress } from './utils/addressValidation';

const errors = validateAddress(address);
// Returns: { line1: 'Street address is required', ... }
```

### `isValidAddress(address: AddressData): boolean`

Returns true if the address is complete and valid.

```tsx
import { isValidAddress } from './utils/addressValidation';

if (isValidAddress(address)) {
  // Address is valid
}
```

### `validatePostalCode(postalCode: string, countryCode: string): string | null`

Validates postal code format for a specific country.

```tsx
import { validatePostalCode } from './utils/addressValidation';

const error = validatePostalCode('12345', 'US');
// Returns: null if valid, error message if invalid
```

### `formatAddressForDisplay(address: AddressData): string`

Formats address for multi-line display.

```tsx
import { formatAddressForDisplay } from './utils/addressValidation';

const formatted = formatAddressForDisplay(address);
// Returns:
// 123 Main Street
// Apt 4B
// New York, NY 10001
// United States
```

### `formatAddressOneLine(address: AddressData): string`

Formats address for single-line display.

```tsx
import { formatAddressOneLine } from './utils/addressValidation';

const formatted = formatAddressOneLine(address);
// Returns: "123 Main Street, Apt 4B, New York, NY 10001, United States"
```

### `normalizePostalCode(postalCode: string, countryCode: string): string`

Normalizes postal code format (adds spaces, uppercase, etc.).

```tsx
import { normalizePostalCode } from './utils/addressValidation';

const normalized = normalizePostalCode('sw1a1aa', 'GB');
// Returns: "SW1A 1AA"
```

## Postal Code Formats

| Country | Format | Example |
|---------|--------|---------|
| US | 12345 or 12345-6789 | 10001 |
| CA | A1A 1A1 | M5H 2N2 |
| GB | AA11 1AA | SW1A 1AA |
| AU | 1234 | 2000 |
| DE | 12345 | 10115 |
| FR | 12345 | 75001 |
| JP | 123-4567 | 100-0001 |
| CN | 123456 | 100000 |
| IN | 123456 | 110001 |
| BR | 12345-678 | 01310-100 |
| MX | 12345 | 06000 |
| ES | 12345 | 28001 |
| IT | 12345 | 00100 |
| NL | 1234 AB | 1012 AB |
| SG | 123456 | 238858 |
| KR | 12345 | 06000 |

## Styling

The component uses Tailwind CSS and follows the application's design system:
- Primary color: `#D91C81` (brand pink)
- Focus ring: 2px solid brand color
- Error state: Red border
- Disabled state: Gray background with reduced opacity
- Grid layout: 2-column responsive grid

## Accessibility

- Full keyboard navigation (Tab, Enter, Arrow keys)
- ARIA labels for all fields
- Required field indicators
- Error state announcements
- Screen reader friendly
- Proper form integration
- Focus management

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements for future versions:

1. **More Countries** - Add support for all 195+ countries
2. **Address Autocomplete** - Integration with Google Places API
3. **Address Verification** - Real-time address validation
4. **Geocoding** - Convert address to coordinates
5. **Custom Field Order** - Allow custom field ordering
6. **Multi-language Support** - Full translations for all countries
7. **Address Book** - Save and select from saved addresses
8. **Smart Defaults** - Auto-detect country from IP/browser

## Integration Examples

### Replace Existing Address Forms

#### Before:
```tsx
<input name="address" placeholder="Street Address" />
<input name="city" placeholder="City" />
<input name="state" placeholder="State" />
<input name="zip" placeholder="ZIP Code" />
```

#### After:
```tsx
<AddressInput
  value={address}
  onChange={setAddress}
  defaultCountry="US"
/>
```

### In Checkout Flow

```tsx
// Checkout.tsx
import { AddressInput, AddressData } from './components/ui/address-input';

const [shippingAddress, setShippingAddress] = useState<AddressData>({...});

<form onSubmit={handleCheckout}>
  <Label>Shipping Address</Label>
  <AddressInput
    value={shippingAddress}
    onChange={setShippingAddress}
    required
  />
  <button type="submit">Continue to Payment</button>
</form>
```

### In Client Configuration

```tsx
// ClientConfiguration.tsx
import { AddressInput, AddressData } from './components/ui/address-input';

const [clientAddress, setClientAddress] = useState<AddressData>({...});

<Card>
  <CardHeader>
    <CardTitle>Client Address</CardTitle>
  </CardHeader>
  <CardContent>
    <AddressInput
      value={clientAddress}
      onChange={setClientAddress}
      defaultCountry="US"
    />
  </CardContent>
</Card>
```

## Troubleshooting

### Fields not showing in correct order

Make sure the country is properly selected. The component automatically reorders fields based on the selected country.

### Postal code validation failing

Check that the postal code matches the format for the selected country. Use the format hint displayed below the fields.

### State field not appearing

Some countries don't require a state/province field. The component automatically shows/hides this field based on country requirements.

### Address not saving

Ensure you're using the `onChange` callback to update your state:

```tsx
<AddressInput
  value={address}
  onChange={setAddress}  // Not onChange={(e) => ...}
/>
```

## Questions?

For questions or issues with the component, check:
1. This documentation
2. The example file: `src/app/components/ui/address-input-example.tsx`
3. The validation utilities: `src/app/utils/addressValidation.ts`
