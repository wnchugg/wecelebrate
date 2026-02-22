/**
 * PhoneInput Component Usage Examples
 * 
 * This file demonstrates how to use the PhoneInput component in various scenarios
 */

import { useState } from 'react';
import { PhoneInput } from './phone-input';
import { Label } from './label';

export function PhoneInputExamples() {
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('+44 7700 900123');
  const [phone3, setPhone3] = useState('');
  const [hasError, setHasError] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Phone Input Component</h1>
        <p className="text-gray-600">
          International phone number input with country code selection and auto-formatting
        </p>
      </div>

      {/* Basic Usage */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Basic Usage</h2>
        <div>
          <Label htmlFor="phone1">Phone Number</Label>
          <PhoneInput
            id="phone1"
            value={phone1}
            onChange={setPhone1}
            placeholder="Enter phone number"
          />
          {phone1 && (
            <p className="mt-2 text-sm text-gray-600">
              Value: <code className="bg-gray-100 px-2 py-1 rounded">{phone1}</code>
            </p>
          )}
        </div>
      </div>

      {/* With Default Country */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">With Default Country</h2>
        <div>
          <Label htmlFor="phone2">UK Phone Number</Label>
          <PhoneInput
            id="phone2"
            value={phone2}
            onChange={setPhone2}
            defaultCountry="GB"
            placeholder="Enter UK phone number"
          />
          {phone2 && (
            <p className="mt-2 text-sm text-gray-600">
              Value: <code className="bg-gray-100 px-2 py-1 rounded">{phone2}</code>
            </p>
          )}
        </div>
      </div>

      {/* Required Field */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Required Field</h2>
        <div>
          <Label htmlFor="phone3">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <PhoneInput
            id="phone3"
            value={phone3}
            onChange={setPhone3}
            required
            placeholder="Required field"
          />
        </div>
      </div>

      {/* With Error State */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">With Error State</h2>
        <div>
          <Label htmlFor="phone4">Phone Number</Label>
          <PhoneInput
            id="phone4"
            error={hasError}
            placeholder="Enter phone number"
          />
          <button
            onClick={() => setHasError(!hasError)}
            className="mt-2 text-sm text-[#D91C81] hover:underline"
          >
            Toggle Error State
          </button>
          {hasError && (
            <p className="mt-1 text-sm text-red-600">Please enter a valid phone number</p>
          )}
        </div>
      </div>

      {/* Disabled State */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Disabled State</h2>
        <div>
          <Label htmlFor="phone5">Phone Number (Disabled)</Label>
          <PhoneInput
            id="phone5"
            value="+1 (555) 123-4567"
            disabled
          />
        </div>
      </div>

      {/* Different Countries */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Different Countries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>United States</Label>
            <PhoneInput defaultCountry="US" placeholder="(555) 123-4567" />
          </div>
          <div>
            <Label>Canada</Label>
            <PhoneInput defaultCountry="CA" placeholder="(555) 123-4567" />
          </div>
          <div>
            <Label>Australia</Label>
            <PhoneInput defaultCountry="AU" placeholder="0412 345 678" />
          </div>
          <div>
            <Label>Germany</Label>
            <PhoneInput defaultCountry="DE" placeholder="030 12345678" />
          </div>
          <div>
            <Label>Japan</Label>
            <PhoneInput defaultCountry="JP" placeholder="03-1234-5678" />
          </div>
          <div>
            <Label>Singapore</Label>
            <PhoneInput defaultCountry="SG" placeholder="8123 4567" />
          </div>
        </div>
      </div>

      {/* Form Integration Example */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Form Integration</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            alert(`Phone: ${String(formData.get('phone') || '')}`);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="form-phone">Contact Phone</Label>
            <PhoneInput
              id="form-phone"
              name="phone"
              required
              placeholder="Enter your phone number"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B01669] transition-colors"
          >
            Submit Form
          </button>
        </form>
      </div>

      {/* Code Examples */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Code Examples</h2>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
{`// Basic usage
<PhoneInput
  value={phone}
  onChange={setPhone}
  placeholder="Enter phone number"
/>

// With default country
<PhoneInput
  value={phone}
  onChange={setPhone}
  defaultCountry="GB"
/>

// Required field with error
<PhoneInput
  value={phone}
  onChange={setPhone}
  required
  error={hasError}
/>

// In a form
<form onSubmit={handleSubmit}>
  <PhoneInput
    name="phone"
    value={phone}
    onChange={setPhone}
    required
  />
</form>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
