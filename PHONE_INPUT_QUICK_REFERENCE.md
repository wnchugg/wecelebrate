# PhoneInput Component - Quick Reference

## Basic Usage

```tsx
import { PhoneInput } from './components/ui/phone-input';

<PhoneInput
  value={phone}
  onChange={setPhone}
  defaultCountry="US"
/>
```

## All Props

```tsx
<PhoneInput
  value={phone}                    // Current value (with country code)
  onChange={setPhone}              // Callback when value changes
  onBlur={handleBlur}             // Optional: callback on blur
  defaultCountry="US"             // ISO 2-letter country code
  disabled={false}                // Disable input
  required={false}                // Mark as required
  placeholder="Enter phone"       // Placeholder text
  className="custom-class"        // Additional CSS classes
  error={false}                   // Show error state
  id="phone-input"               // Input ID for labels
  name="phone"                   // Input name for forms
/>
```

## Common Patterns

### With Label
```tsx
<div>
  <Label htmlFor="phone">Phone Number</Label>
  <PhoneInput
    id="phone"
    value={phone}
    onChange={setPhone}
  />
</div>
```

### Required Field
```tsx
<PhoneInput
  value={phone}
  onChange={setPhone}
  required
/>
```

### With Validation
```tsx
import { validatePhoneNumber } from './utils/phoneValidation';

const [phone, setPhone] = useState('');
const [error, setError] = useState('');

const handlePhoneChange = (value: string) => {
  setPhone(value);
  const validationError = validatePhoneNumber(value);
  setError(validationError || '');
};

<PhoneInput
  value={phone}
  onChange={handlePhoneChange}
  error={!!error}
/>
{error && <p className="text-sm text-red-600">{error}</p>}
```

### In Forms
```tsx
<form onSubmit={handleSubmit}>
  <PhoneInput
    name="phone"
    value={phone}
    onChange={setPhone}
    required
  />
  <button type="submit">Submit</button>
</form>
```

### Different Countries
```tsx
// United States
<PhoneInput defaultCountry="US" />

// United Kingdom
<PhoneInput defaultCountry="GB" />

// Australia
<PhoneInput defaultCountry="AU" />

// Germany
<PhoneInput defaultCountry="DE" />

// Japan
<PhoneInput defaultCountry="JP" />
```

## Validation Utilities

```tsx
import {
  validatePhoneNumber,
  isValidPhoneNumber,
  parsePhoneNumber,
  formatPhoneForStorage,
  formatPhoneForDisplay,
} from './utils/phoneValidation';

// Validate and get error message
const error = validatePhoneNumber('+1 555-123-4567');
// Returns: null if valid, error message if invalid

// Check if valid (boolean)
const isValid = isValidPhoneNumber('+1 555-123-4567');
// Returns: true or false

// Parse phone number
const parsed = parsePhoneNumber('+1 (555) 123-4567');
// Returns: { countryCode, countryName, number, fullNumber }

// Format for database (E.164)
const stored = formatPhoneForStorage('+1 (555) 123-4567');
// Returns: '+15551234567'

// Format for display
const display = formatPhoneForDisplay('+15551234567');
// Returns: '+1 (555) 123-4567'
```

## Supported Countries (43)

🇺🇸 US (+1) • 🇨🇦 CA (+1) • 🇬🇧 GB (+44) • 🇦🇺 AU (+61) • 🇳🇿 NZ (+64)
🇩🇪 DE (+49) • 🇫🇷 FR (+33) • 🇪🇸 ES (+34) • 🇮🇹 IT (+39) • 🇳🇱 NL (+31)
🇧🇪 BE (+32) • 🇨🇭 CH (+41) • 🇦🇹 AT (+43) • 🇸🇪 SE (+46) • 🇳🇴 NO (+47)
🇩🇰 DK (+45) • 🇫🇮 FI (+358) • 🇮🇪 IE (+353) • 🇵🇱 PL (+48) • 🇨🇿 CZ (+420)
🇵🇹 PT (+351) • 🇬🇷 GR (+30) • 🇯🇵 JP (+81) • 🇨🇳 CN (+86) • 🇮🇳 IN (+91)
🇸🇬 SG (+65) • 🇭🇰 HK (+852) • 🇰🇷 KR (+82) • 🇲🇾 MY (+60) • 🇹🇭 TH (+66)
🇵🇭 PH (+63) • 🇮🇩 ID (+62) • 🇻🇳 VN (+84) • 🇦🇪 AE (+971) • 🇸🇦 SA (+966)
🇮🇱 IL (+972) • 🇿🇦 ZA (+27) • 🇧🇷 BR (+55) • 🇲🇽 MX (+52) • 🇦🇷 AR (+54)
🇨🇱 CL (+56) • 🇨🇴 CO (+57)

## Format Examples

```
US/CA:    +1 (555) 123-4567
UK:       +44 7700 900123
AU:       +61 0412 345 678
DE:       +49 030 12345678
FR:       +33 1 23 45 67 89
JP:       +81 03-1234-5678
CN:       +86 138 0000 0000
IN:       +91 98765 43210
SG:       +65 8123 4567
```

## Styling

The component uses Tailwind CSS and follows the app's design system:
- Primary color: `#D91C81` (brand pink)
- Focus ring: 2px solid brand color
- Error state: Red border
- Disabled state: Gray background with reduced opacity

## Accessibility

- Full keyboard navigation (Tab, Enter, Escape, Arrow keys)
- ARIA labels and roles
- Focus management
- Screen reader friendly
- Proper form integration

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Files

- Component: `src/app/components/ui/phone-input.tsx`
- Validation: `src/app/utils/phoneValidation.ts`
- Examples: `src/app/components/ui/phone-input-example.tsx`
- Docs: `PHONE_INPUT_COMPONENT.md`
