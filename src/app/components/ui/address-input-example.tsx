/**
 * AddressInput Component Usage Examples
 * 
 * This file demonstrates how to use the AddressInput component in various scenarios
 */

import { useState } from 'react';
import { AddressInput, AddressData } from './address-input';
import { Label } from './label';
import { validateAddress, formatAddressForDisplay } from '../../utils/addressValidation';

export function AddressInputExamples() {
  const [address1, setAddress1] = useState<AddressData>({
    line1: '',
    city: '',
    postalCode: '',
    country: 'United States',
  });

  const [address2, setAddress2] = useState<AddressData>({
    line1: '10 Downing Street',
    city: 'London',
    postalCode: 'SW1A 1AA',
    country: 'United Kingdom',
  });

  const [address3, setAddress3] = useState<AddressData>({
    line1: '',
    city: '',
    postalCode: '',
    country: 'United States',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleValidate = () => {
    const validationErrors = validateAddress(address3);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      alert('Address is valid!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Address Input Component</h1>
        <p className="text-gray-600">
          International address input with country-specific field ordering and validation
        </p>
      </div>

      {/* Basic Usage */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Basic Usage</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <AddressInput
            value={address1}
            onChange={setAddress1}
          />
          {address1.line1 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Address Preview:</p>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {formatAddressForDisplay(address1)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* With Pre-filled Data */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">With Pre-filled Data (UK)</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <AddressInput
            value={address2}
            onChange={setAddress2}
            defaultCountry="GB"
          />
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">Address Preview:</p>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {formatAddressForDisplay(address2)}
            </pre>
          </div>
        </div>
      </div>

      {/* With Validation */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">With Validation</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <AddressInput
            value={address3}
            onChange={setAddress3}
            required
            error={Object.keys(errors).length > 0}
          />
          <button
            onClick={handleValidate}
            className="mt-4 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B01669] transition-colors"
          >
            Validate Address
          </button>
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-800 mb-2">Validation Errors:</p>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Different Countries */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Different Countries</h2>
        <p className="text-gray-600">
          Notice how field order and labels change based on the selected country
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">🇺🇸 United States</h3>
            <AddressInput defaultCountry="US" showCountrySelector={false} />
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">🇬🇧 United Kingdom</h3>
            <AddressInput defaultCountry="GB" showCountrySelector={false} />
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">🇩🇪 Germany</h3>
            <AddressInput defaultCountry="DE" showCountrySelector={false} />
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">🇯🇵 Japan</h3>
            <AddressInput defaultCountry="JP" showCountrySelector={false} />
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">🇨🇳 China</h3>
            <AddressInput defaultCountry="CN" showCountrySelector={false} />
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">🇦🇺 Australia</h3>
            <AddressInput defaultCountry="AU" showCountrySelector={false} />
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Code Examples</h2>
        <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
          <pre className="text-sm">
{`// Basic usage
<AddressInput
  value={address}
  onChange={setAddress}
  defaultCountry="US"
/>

// With validation
import { validateAddress } from './utils/addressValidation';

const errors = validateAddress(address);
<AddressInput
  value={address}
  onChange={setAddress}
  required
  error={Object.keys(errors).length > 0}
/>

// Without country selector (fixed country)
<AddressInput
  value={address}
  onChange={setAddress}
  defaultCountry="GB"
  showCountrySelector={false}
/>

// In a form
<form onSubmit={handleSubmit}>
  <Label>Shipping Address</Label>
  <AddressInput
    value={shippingAddress}
    onChange={setShippingAddress}
    required
  />
  <button type="submit">Submit</button>
</form>`}
          </pre>
        </div>
      </div>

      {/* Supported Countries */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Supported Countries (16)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { flag: '🇺🇸', name: 'United States', code: 'US' },
            { flag: '🇨🇦', name: 'Canada', code: 'CA' },
            { flag: '🇬🇧', name: 'United Kingdom', code: 'GB' },
            { flag: '🇦🇺', name: 'Australia', code: 'AU' },
            { flag: '🇩🇪', name: 'Germany', code: 'DE' },
            { flag: '🇫🇷', name: 'France', code: 'FR' },
            { flag: '🇯🇵', name: 'Japan', code: 'JP' },
            { flag: '🇨🇳', name: 'China', code: 'CN' },
            { flag: '🇮🇳', name: 'India', code: 'IN' },
            { flag: '🇧🇷', name: 'Brazil', code: 'BR' },
            { flag: '🇲🇽', name: 'Mexico', code: 'MX' },
            { flag: '🇪🇸', name: 'Spain', code: 'ES' },
            { flag: '🇮🇹', name: 'Italy', code: 'IT' },
            { flag: '🇳🇱', name: 'Netherlands', code: 'NL' },
            { flag: '🇸🇬', name: 'Singapore', code: 'SG' },
            { flag: '🇰🇷', name: 'South Korea', code: 'KR' },
          ].map((country) => (
            <div key={country.code} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span className="text-2xl">{country.flag}</span>
              <span className="text-sm text-gray-700">{country.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
