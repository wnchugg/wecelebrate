# International Phone Input Component

A reusable React component for international phone number input with country code selection and automatic formatting.

## Features

- 🌍 **43 Countries Supported** - Major countries from all continents
- 🎨 **Auto-formatting** - Formats phone numbers based on country-specific patterns
- 🔍 **Searchable Country Selector** - Quick search by country name, code, or dial code
- 🎯 **Accessible** - Full keyboard navigation and ARIA labels
- ✅ **Validation Utilities** - Built-in validation helpers
- 🎭 **Error States** - Visual error indication
- 🔒 **Disabled State** - Support for read-only fields
- 📱 **Responsive** - Works on all screen sizes

## Installation

The component is already integrated into the project. Files created:

```
src/app/components/ui/phone-input.tsx          # Main component
src/app/components/ui/phone-input-example.tsx  # Usage examples
src/app/utils/phoneValidation.ts               # Validation utilities
```

## Basic Usage

```tsx
import { useState } from 'react';
import { PhoneInput } from './components/ui/phone-input';

function MyForm() {
  const [phone, setPhone] = useState('');

  return (
    <PhoneInput
      value={phone}
      onChange={setPhone}
      placeholder="Enter phone number"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Current phone number value (with country code) |
| `onChange` | `(value: string) => void` | - | Callback when value changes |
| `onBlur` | `() => void` | - | Callback when input loses focus |
| `defaultCountry` | `string` | `'US'` | Default country code (ISO 2-letter) |
| `disabled` | `boolean` | `false` | Disable the input |
| `required` | `boolean` | `false` | Mark as required field |
| `placeholder` | `string` | `'Phone number'` | Placeholder text |
| `className` | `string` | - | Additional CSS classes |
| `error` | `boolean` | `false` | Show error state |
| `id` | `string` | - | Input ID for labels |
| `name` | `string` | - | Input name for forms |

## Examples

### With Default Country

```tsx
<PhoneInput
  value={phone}
  onChange={setPhone}
  defaultCountry="GB"
  placeholder="Enter UK phone number"
/>
```

### Required Field with Validation

```tsx
const [phone, setPhone] = useState('');
const [error, setError] = useState('');

const handleSubmit = () => {
  const validationError = validatePhoneNumber(phone);
  if (validationError) {
    setError(validationError);
    return;
  }
  // Submit form
};

<div>
  <Label>Phone Number *</Label>
  <PhoneInput
    value={phone}
    onChange={(value) => {
      setPhone(value);
      setError('');
    }}
    required
    error={!!error}
  />
  {error && <p className="text-sm text-red-600">{error}</p>}
</div>
```

### In a Form

```tsx
<form onSubmit={handleSubmit}>
  <Label htmlFor="contact-phone">Contact Phone</Label>
  <PhoneInput
    id="contact-phone"
    name="phone"
    value={phone}
    onChange={setPhone}
    required
  />
  <button type="submit">Submit</button>
</form>
```

### Disabled State

```tsx
<PhoneInput
  value="+1 (555) 123-4567"
  disabled
/>
```

## Validation Utilities

The component comes with validation utilities in `src/app/utils/phoneValidation.ts`:

### `validatePhoneNumber(phoneNumber: string): string | null`

Validates a phone number and returns an error message if invalid.

```tsx
import { validatePhoneNumber } from './utils/phoneValidation';

const error = validatePhoneNumber('+1 555-123-4567');
if (error) {
  console.log(error); // null if valid, error message if invalid
}
```

### `isValidPhoneNumber(phoneNumber: string): boolean`

Returns true if the phone number is valid.

```tsx
import { isValidPhoneNumber } from './utils/phoneValidation';

if (isValidPhoneNumber(phone)) {
  // Phone is valid
}
```

### `parsePhoneNumber(phoneNumber: string)`

Parses a phone number into its components.

```tsx
import { parsePhoneNumber } from './utils/phoneValidation';

const parsed = parsePhoneNumber('+1 (555) 123-4567');
// {
//   countryCode: '+1',
//   countryName: 'United States',
//   number: '(555) 123-4567',
//   fullNumber: '+1 (555) 123-4567'
// }
```

### `formatPhoneForStorage(phoneNumber: string): string`

Formats phone number for database storage (E.164 format).

```tsx
import { formatPhoneForStorage } from './utils/phoneValidation';

const stored = formatPhoneForStorage('+1 (555) 123-4567');
// '+15551234567'
```

### `formatPhoneForDisplay(phoneNumber: string): string`

Formats phone number for display.

```tsx
import { formatPhoneForDisplay } from './utils/phoneValidation';

const display = formatPhoneForDisplay('+15551234567');
// '+1 (555) 123-4567'
```

## Supported Countries

The component supports 43 countries with proper formatting:

- 🇺🇸 United States (+1)
- 🇨🇦 Canada (+1)
- 🇬🇧 United Kingdom (+44)
- 🇦🇺 Australia (+61)
- 🇩🇪 Germany (+49)
- 🇫🇷 France (+33)
- 🇯🇵 Japan (+81)
- 🇨🇳 China (+86)
- 🇮🇳 India (+91)
- And 34 more...

Each country has:
- Flag emoji
- Dial code
- Country-specific formatting pattern

## Integration Examples

### Replace Existing Phone Inputs

#### Before:
```tsx
<input
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="Phone number"
/>
```

#### After:
```tsx
<PhoneInput
  value={phone}
  onChange={setPhone}
  placeholder="Phone number"
/>
```

### In ClientConfiguration

```tsx
// In ClientConfiguration.tsx
import { PhoneInput } from '../../components/ui/phone-input';

<div>
  <Label htmlFor="primaryContactPhone">Primary Contact Phone</Label>
  <PhoneInput
    id="primaryContactPhone"
    value={primaryContactPhone}
    onChange={setPrimaryContactPhone}
    defaultCountry="US"
    required
  />
</div>
```

### In EmployeeManagement

```tsx
// In EmployeeManagement.tsx
import { PhoneInput } from '../../components/ui/phone-input';

<div>
  <Label htmlFor="employeePhone">Employee Phone</Label>
  <PhoneInput
    id="employeePhone"
    value={employeePhone}
    onChange={setEmployeePhone}
    defaultCountry={clientCountry}
  />
</div>
```

## Styling

The component uses Tailwind CSS and follows the application's design system:

- Primary color: `#D91C81` (brand pink)
- Focus ring: 2px solid brand color
- Error state: Red border
- Disabled state: Gray background with reduced opacity

## Accessibility

- Full keyboard navigation
- ARIA labels and roles
- Focus management
- Screen reader friendly
- Proper form integration

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements for future versions:

1. **More Countries** - Add support for all countries
2. **Custom Formatting** - Allow custom format patterns
3. **Validation Rules** - Country-specific validation rules
4. **Phone Type Detection** - Mobile vs. landline
5. **International Dialing** - Show international dialing instructions
6. **Recent Countries** - Remember recently used countries
7. **Favorite Countries** - Pin frequently used countries to top

## Troubleshooting

### Value not updating

Make sure you're using controlled component pattern:

```tsx
const [phone, setPhone] = useState('');

<PhoneInput
  value={phone}
  onChange={setPhone}  // Not onChange={(e) => setPhone(e.target.value)}
/>
```

### Country not detected from initial value

The component auto-detects country from the dial code. Make sure the initial value includes the country code:

```tsx
// ✅ Good
<PhoneInput value="+44 7700 900123" />

// ❌ Bad
<PhoneInput value="7700 900123" />
```

### Formatting not working

The component formats as you type. If formatting isn't working, check:
1. The country is selected
2. You're entering digits (not letters)
3. The format pattern exists for that country

## Questions?

For questions or issues with the component, check:
1. This documentation
2. The example file: `src/app/components/ui/phone-input-example.tsx`
3. The validation utilities: `src/app/utils/phoneValidation.ts`
