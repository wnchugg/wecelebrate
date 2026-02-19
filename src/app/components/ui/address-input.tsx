import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from './utils';
import { validatePostalCodeWithMessage, validateAddressLine } from '../../utils/addressValidation';
import { AddressAutocomplete } from './address-autocomplete';

// Address format configurations by country
export interface AddressFormat {
  country: string;
  countryCode: string;
  flag: string;
  fields: AddressField[];
  postalCodeLabel: string;
  postalCodeFormat?: string;
  stateLabel?: string;
  states?: string[];
  cityLabel: string;
  requiresState: boolean;
}

export interface AddressField {
  name: 'line1' | 'line2' | 'line3' | 'city' | 'state' | 'postalCode' | 'country';
  label: string;
  placeholder: string;
  required: boolean;
  type?: 'text' | 'select';
  options?: string[];
  gridSpan?: 1 | 2; // For grid layout
}

export interface AddressData {
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

// Country-specific address formats
export const ADDRESS_FORMATS: AddressFormat[] = [
  {
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    postalCodeLabel: 'ZIP Code',
    postalCodeFormat: '12345 or 12345-6789',
    stateLabel: 'State',
    cityLabel: 'City',
    requiresState: true,
    states: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
    fields: [
      { name: 'line1', label: 'Street Address', placeholder: '123 Main Street', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Apt, Suite, Unit (Optional)', placeholder: 'Apt 4B', required: false, gridSpan: 2 },
      { name: 'city', label: 'City', placeholder: 'New York', required: true, gridSpan: 1 },
      { name: 'state', label: 'State', placeholder: 'Select state', required: true, type: 'select', gridSpan: 1 },
      { name: 'postalCode', label: 'ZIP Code', placeholder: '10001', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    postalCodeLabel: 'Postal Code',
    postalCodeFormat: 'A1A 1A1',
    stateLabel: 'Province',
    cityLabel: 'City',
    requiresState: true,
    states: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'],
    fields: [
      { name: 'line1', label: 'Street Address', placeholder: '123 Main Street', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Apt, Suite, Unit (Optional)', placeholder: 'Unit 4B', required: false, gridSpan: 2 },
      { name: 'city', label: 'City', placeholder: 'Toronto', required: true, gridSpan: 1 },
      { name: 'state', label: 'Province', placeholder: 'Select province', required: true, type: 'select', gridSpan: 1 },
      { name: 'postalCode', label: 'Postal Code', placeholder: 'M5H 2N2', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    postalCodeLabel: 'Postcode',
    postalCodeFormat: 'SW1A 1AA',
    cityLabel: 'Town/City',
    requiresState: false,
    fields: [
      { name: 'line1', label: 'Address Line 1', placeholder: '10 Downing Street', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Address Line 2 (Optional)', placeholder: 'Westminster', required: false, gridSpan: 2 },
      { name: 'city', label: 'Town/City', placeholder: 'London', required: true, gridSpan: 1 },
      { name: 'postalCode', label: 'Postcode', placeholder: 'SW1A 1AA', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    postalCodeLabel: 'Postcode',
    postalCodeFormat: '2000',
    stateLabel: 'State/Territory',
    cityLabel: 'Suburb',
    requiresState: true,
    states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
    fields: [
      { name: 'line1', label: 'Street Address', placeholder: '123 George Street', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Address Line 2 (Optional)', placeholder: 'Unit 5', required: false, gridSpan: 2 },
      { name: 'city', label: 'Suburb', placeholder: 'Sydney', required: true, gridSpan: 1 },
      { name: 'state', label: 'State', placeholder: 'Select state', required: true, type: 'select', gridSpan: 1 },
      { name: 'postalCode', label: 'Postcode', placeholder: '2000', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    postalCodeLabel: 'Postleitzahl',
    postalCodeFormat: '12345',
    cityLabel: 'Stadt',
    requiresState: false,
    fields: [
      { name: 'line1', label: 'Straße und Hausnummer', placeholder: 'Hauptstraße 123', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Adresszusatz (Optional)', placeholder: 'Wohnung 4B', required: false, gridSpan: 2 },
      { name: 'postalCode', label: 'Postleitzahl', placeholder: '10115', required: true, gridSpan: 1 },
      { name: 'city', label: 'Stadt', placeholder: 'Berlin', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'France',
    countryCode: 'FR',
    flag: '🇫🇷',
    postalCodeLabel: 'Code Postal',
    postalCodeFormat: '75001',
    cityLabel: 'Ville',
    requiresState: false,
    fields: [
      { name: 'line1', label: 'Adresse', placeholder: '123 Rue de Rivoli', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Complément d\'adresse (Optionnel)', placeholder: 'Appartement 4B', required: false, gridSpan: 2 },
      { name: 'postalCode', label: 'Code Postal', placeholder: '75001', required: true, gridSpan: 1 },
      { name: 'city', label: 'Ville', placeholder: 'Paris', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    postalCodeLabel: '郵便番号',
    postalCodeFormat: '123-4567',
    cityLabel: '市区町村',
    requiresState: true,
    stateLabel: '都道府県',
    fields: [
      { name: 'postalCode', label: '郵便番号', placeholder: '100-0001', required: true, gridSpan: 1 },
      { name: 'state', label: '都道府県', placeholder: '東京都', required: true, gridSpan: 1 },
      { name: 'city', label: '市区町村', placeholder: '千代田区', required: true, gridSpan: 1 },
      { name: 'line1', label: '町名・番地', placeholder: '千代田1-1', required: true, gridSpan: 1 },
      { name: 'line2', label: '建物名・部屋番号 (任意)', placeholder: 'マンション101号室', required: false, gridSpan: 2 },
    ],
  },
  {
    country: 'China',
    countryCode: 'CN',
    flag: '🇨🇳',
    postalCodeLabel: '邮政编码',
    postalCodeFormat: '100000',
    cityLabel: '城市',
    requiresState: true,
    stateLabel: '省/直辖市',
    fields: [
      { name: 'state', label: '省/直辖市', placeholder: '北京市', required: true, gridSpan: 1 },
      { name: 'city', label: '城市/区', placeholder: '朝阳区', required: true, gridSpan: 1 },
      { name: 'line1', label: '街道地址', placeholder: '建国路123号', required: true, gridSpan: 2 },
      { name: 'line2', label: '详细地址 (可选)', placeholder: '5号楼101室', required: false, gridSpan: 2 },
      { name: 'postalCode', label: '邮政编码', placeholder: '100000', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    postalCodeLabel: 'PIN Code',
    postalCodeFormat: '110001',
    cityLabel: 'City',
    requiresState: true,
    stateLabel: 'State',
    fields: [
      { name: 'line1', label: 'Address Line 1', placeholder: 'House No. 123, Street Name', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Address Line 2 (Optional)', placeholder: 'Locality/Area', required: false, gridSpan: 2 },
      { name: 'city', label: 'City', placeholder: 'New Delhi', required: true, gridSpan: 1 },
      { name: 'state', label: 'State', placeholder: 'Delhi', required: true, gridSpan: 1 },
      { name: 'postalCode', label: 'PIN Code', placeholder: '110001', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'Brazil',
    countryCode: 'BR',
    flag: '🇧🇷',
    postalCodeLabel: 'CEP',
    postalCodeFormat: '12345-678',
    cityLabel: 'Cidade',
    requiresState: true,
    stateLabel: 'Estado',
    fields: [
      { name: 'line1', label: 'Endereço', placeholder: 'Rua Principal, 123', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Complemento (Opcional)', placeholder: 'Apto 4B', required: false, gridSpan: 2 },
      { name: 'city', label: 'Cidade', placeholder: 'São Paulo', required: true, gridSpan: 1 },
      { name: 'state', label: 'Estado', placeholder: 'SP', required: true, gridSpan: 1 },
      { name: 'postalCode', label: 'CEP', placeholder: '01310-100', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'Mexico',
    countryCode: 'MX',
    flag: '🇲🇽',
    postalCodeLabel: 'Código Postal',
    postalCodeFormat: '12345',
    cityLabel: 'Ciudad',
    requiresState: true,
    stateLabel: 'Estado',
    fields: [
      { name: 'line1', label: 'Calle y Número', placeholder: 'Calle Principal 123', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Colonia (Opcional)', placeholder: 'Colonia Centro', required: false, gridSpan: 2 },
      { name: 'city', label: 'Ciudad', placeholder: 'Ciudad de México', required: true, gridSpan: 1 },
      { name: 'state', label: 'Estado', placeholder: 'CDMX', required: true, gridSpan: 1 },
      { name: 'postalCode', label: 'Código Postal', placeholder: '06000', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'Spain',
    countryCode: 'ES',
    flag: '🇪🇸',
    postalCodeLabel: 'Código Postal',
    postalCodeFormat: '28001',
    cityLabel: 'Ciudad',
    requiresState: true,
    stateLabel: 'Provincia',
    fields: [
      { name: 'line1', label: 'Dirección', placeholder: 'Calle Mayor, 123', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Piso, Puerta (Opcional)', placeholder: 'Piso 4, Puerta B', required: false, gridSpan: 2 },
      { name: 'postalCode', label: 'Código Postal', placeholder: '28001', required: true, gridSpan: 1 },
      { name: 'city', label: 'Ciudad', placeholder: 'Madrid', required: true, gridSpan: 1 },
      { name: 'state', label: 'Provincia', placeholder: 'Madrid', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'Italy',
    countryCode: 'IT',
    flag: '🇮🇹',
    postalCodeLabel: 'CAP',
    postalCodeFormat: '00100',
    cityLabel: 'Città',
    requiresState: true,
    stateLabel: 'Provincia',
    fields: [
      { name: 'line1', label: 'Indirizzo', placeholder: 'Via Roma, 123', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Interno (Opzionale)', placeholder: 'Interno 4B', required: false, gridSpan: 2 },
      { name: 'postalCode', label: 'CAP', placeholder: '00100', required: true, gridSpan: 1 },
      { name: 'city', label: 'Città', placeholder: 'Roma', required: true, gridSpan: 1 },
      { name: 'state', label: 'Provincia', placeholder: 'RM', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'Netherlands',
    countryCode: 'NL',
    flag: '🇳🇱',
    postalCodeLabel: 'Postcode',
    postalCodeFormat: '1234 AB',
    cityLabel: 'Plaats',
    requiresState: false,
    fields: [
      { name: 'line1', label: 'Straat en Huisnummer', placeholder: 'Hoofdstraat 123', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Toevoeging (Optioneel)', placeholder: 'Appartement 4B', required: false, gridSpan: 2 },
      { name: 'postalCode', label: 'Postcode', placeholder: '1012 AB', required: true, gridSpan: 1 },
      { name: 'city', label: 'Plaats', placeholder: 'Amsterdam', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    postalCodeLabel: 'Postal Code',
    postalCodeFormat: '123456',
    cityLabel: 'City',
    requiresState: false,
    fields: [
      { name: 'line1', label: 'Block/House No. and Street Name', placeholder: '123 Orchard Road', required: true, gridSpan: 2 },
      { name: 'line2', label: 'Unit No. (Optional)', placeholder: '#12-34', required: false, gridSpan: 2 },
      { name: 'postalCode', label: 'Postal Code', placeholder: '238858', required: true, gridSpan: 1 },
    ],
  },
  {
    country: 'South Korea',
    countryCode: 'KR',
    flag: '🇰🇷',
    postalCodeLabel: '우편번호',
    postalCodeFormat: '12345',
    cityLabel: '시/군/구',
    requiresState: true,
    stateLabel: '시/도',
    fields: [
      { name: 'postalCode', label: '우편번호', placeholder: '06000', required: true, gridSpan: 1 },
      { name: 'state', label: '시/도', placeholder: '서울특별시', required: true, gridSpan: 1 },
      { name: 'city', label: '시/군/구', placeholder: '강남구', required: true, gridSpan: 1 },
      { name: 'line1', label: '도로명 주소', placeholder: '테헤란로 123', required: true, gridSpan: 1 },
      { name: 'line2', label: '상세 주소 (선택)', placeholder: '101호', required: false, gridSpan: 2 },
    ],
  },
];

interface AddressInputProps {
  value?: AddressData;
  onChange?: (address: AddressData) => void;
  onBlur?: () => void;
  defaultCountry?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: boolean;
  showCountrySelector?: boolean;
  enableAutocomplete?: boolean; // Enable address autocomplete suggestions
}

export function AddressInput({
  value,
  onChange,
  onBlur,
  defaultCountry = 'US',
  disabled = false,
  required = false,
  className,
  error = false,
  showCountrySelector = true,
  enableAutocomplete = true, // Default to enabled
}: AddressInputProps) {
  const [selectedFormat, setSelectedFormat] = useState<AddressFormat>(() =>
    ADDRESS_FORMATS.find(f => f.countryCode === defaultCountry) || ADDRESS_FORMATS[0]
  );

  const [addressData, setAddressData] = useState<AddressData>({
    line1: value?.line1 || '',
    line2: value?.line2 || '',
    line3: value?.line3 || '',
    city: value?.city || '',
    state: value?.state || '',
    postalCode: value?.postalCode || '',
    country: value?.country || selectedFormat.country,
  });

  // Track validation errors for each field
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (value) {
      setAddressData({
        line1: value.line1 || '',
        line2: value.line2 || '',
        line3: value.line3 || '',
        city: value.city || '',
        state: value.state || '',
        postalCode: value.postalCode || '',
        country: value.country || selectedFormat.country,
      });
    }
  }, [value]);

  const handleCountryChange = (countryCode: string) => {
    const format = ADDRESS_FORMATS.find(f => f.countryCode === countryCode);
    if (format) {
      setSelectedFormat(format);
      const newAddress = {
        ...addressData,
        country: format.country,
      };
      setAddressData(newAddress);
      onChange?.(newAddress);
    }
  };

  const handleFieldChange = (fieldName: keyof AddressData, value: string) => {
    const newAddress = {
      ...addressData,
      [fieldName]: value,
    };
    setAddressData(newAddress);
    onChange?.(newAddress);

    // Clear validation error for this field when user starts typing
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  const handleFieldBlur = (fieldName: keyof AddressData) => {
    const value = addressData[fieldName] || '';
    let error: string | null = null;

    // Validate postal code
    if (fieldName === 'postalCode' && value) {
      error = validatePostalCodeWithMessage(value, selectedFormat.countryCode);
    }

    // Validate address lines (line1, line2, line3)
    if ((fieldName === 'line1' || fieldName === 'line2' || fieldName === 'line3') && value) {
      error = validateAddressLine(value, selectedFormat.countryCode);
    }

    // Update validation errors
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: error,
      }));
    } else {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }

    onBlur?.();
  };

  const handleAutocompleteSelect = (selectedAddress: AddressData) => {
    const newAddress = {
      ...addressData,
      line1: selectedAddress.line1,
      line2: selectedAddress.line2 || '',
      city: selectedAddress.city,
      state: selectedAddress.state || '',
      postalCode: selectedAddress.postalCode,
      country: selectedAddress.country,
    };
    setAddressData(newAddress);
    onChange?.(newAddress);
  };

  const renderField = (field: AddressField) => {
    const fieldValue = addressData[field.name] || '';
    const fieldError = validationErrors[field.name];

    if (field.type === 'select' && field.name === 'state' && selectedFormat.states) {
      return (
        <div key={field.name} className={cn('space-y-2', field.gridSpan === 2 && 'col-span-2')}>
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(field.name, value)}
            disabled={disabled}
          >
            <SelectTrigger
              id={field.name}
              className={cn((error || fieldError) && 'border-red-500')}
            >
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {selectedFormat.states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError && (
            <p className="text-xs text-red-500 mt-1">{fieldError}</p>
          )}
        </div>
      );
    }

    // Use AddressAutocomplete for line1 field when enabled
    if (field.name === 'line1' && enableAutocomplete) {
      return (
        <div key={field.name} className={cn('space-y-2', field.gridSpan === 2 && 'col-span-2')}>
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <AddressAutocomplete
            onSelect={handleAutocompleteSelect}
            country={selectedFormat.countryCode}
            placeholder={field.placeholder}
            disabled={disabled}
          />
          {fieldError && (
            <p className="text-xs text-red-500 mt-1">{fieldError}</p>
          )}
        </div>
      );
    }

    return (
      <div key={field.name} className={cn('space-y-2', field.gridSpan === 2 && 'col-span-2')}>
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={field.name}
          type="text"
          value={fieldValue}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          onBlur={() => handleFieldBlur(field.name)}
          disabled={disabled}
          required={field.required && required}
          placeholder={field.placeholder}
          className={cn((error || fieldError) && 'border-red-500')}
        />
        {fieldError && (
          <p className="text-xs text-red-500 mt-1">{fieldError}</p>
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Country Selector */}
      {showCountrySelector && (
        <div className="space-y-2">
          <Label htmlFor="country">
            Country
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={selectedFormat.countryCode}
            onValueChange={handleCountryChange}
            disabled={disabled}
          >
            <SelectTrigger id="country" className={cn(error && 'border-red-500')}>
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedFormat.flag}</span>
                  <span>{selectedFormat.country}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ADDRESS_FORMATS.map((format) => (
                <SelectItem key={format.countryCode} value={format.countryCode}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{format.flag}</span>
                    <span>{format.country}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Address Fields - Dynamic based on country */}
      <div className="grid grid-cols-2 gap-4">
        {selectedFormat.fields.map(renderField)}
      </div>

      {/* Format Hint */}
      {selectedFormat.postalCodeFormat && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {selectedFormat.postalCodeLabel} format: {selectedFormat.postalCodeFormat}
        </p>
      )}
    </div>
  );
}
